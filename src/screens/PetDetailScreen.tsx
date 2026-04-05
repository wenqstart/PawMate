import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../theme';
import { Pet } from '../types';
import { getPets, deletePet, updatePet } from '../utils/storage';
import { t, addLanguageListener } from '../i18n';

interface PetDetailScreenProps {
  route: any;
  navigation: any;
}

export default function PetDetailScreen({ route, navigation }: PetDetailScreenProps) {
  const { petId } = route.params;
  const [pet, setPet] = useState<Pet | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [, forceUpdate] = useState(0);

  // Re-render when language changes
  useEffect(() => {
    const unsubscribe = addLanguageListener(() => forceUpdate(n => n + 1));
    return unsubscribe;
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    type: 'dog' as Pet['type'],
    breed: '',
    gender: 'male' as Pet['gender'],
    birthday: '',
    avatar: '',
    personality: [] as string[],
    owner: '',
    bio: '',
    lookingFor: '',
  });
  const [personalityInput, setPersonalityInput] = useState('');

  useEffect(() => {
    loadPet();
  }, [petId]);

  const loadPet = async () => {
    const pets = await getPets();
    const foundPet = pets.find(p => p.id === petId);
    if (foundPet) {
      setPet(foundPet);
      setFormData({
        name: foundPet.name,
        type: foundPet.type,
        breed: foundPet.breed,
        gender: foundPet.gender,
        birthday: foundPet.birthday,
        avatar: foundPet.avatar,
        personality: foundPet.personality || [],
        owner: foundPet.owner,
        bio: foundPet.bio || '',
        lookingFor: foundPet.lookingFor || '',
      });
      if (foundPet.birthday) {
        setTempDate(new Date(foundPet.birthday));
      }
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete',
      `Are you sure you want to delete ${pet?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePet(petId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (pet) {
      setFormData({
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        gender: pet.gender,
        birthday: pet.birthday,
        avatar: pet.avatar,
        personality: pet.personality || [],
        owner: pet.owner,
        bio: pet.bio || '',
        lookingFor: pet.lookingFor || '',
      });
      if (pet.birthday) {
        setTempDate(new Date(pet.birthday));
      }
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.breed || !formData.birthday || !formData.owner) {
      Alert.alert('Info', 'Please fill required fields');
      return;
    }

    const calculateAge = (birthday: string) => {
      const birth = new Date(birthday);
      const today = new Date();
      return today.getFullYear() - birth.getFullYear();
    };

    const updatedPet: Pet = {
      id: petId,
      ...formData,
      age: calculateAge(formData.birthday),
    };

    await updatePet(updatedPet);
    await loadPet();
    setIsEditing(false);
    Alert.alert('Success', 'Pet updated');
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setTempDate(selectedDate);
      setFormData({ ...formData, birthday: formatDate(selectedDate) });
    }
  };

  const handleAddPersonality = () => {
    if (personalityInput && !formData.personality.includes(personalityInput)) {
      setFormData({
        ...formData,
        personality: [...formData.personality, personalityInput],
      });
      setPersonalityInput('');
    }
  };

  const removePersonality = (trait: string) => {
    setFormData({
      ...formData,
      personality: formData.personality.filter(p => p !== trait),
    });
  };

  if (!pet) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderEditForm = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.editSection}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {formData.avatar ? (
              <Image source={{ uri: formData.avatar }} style={styles.avatar} />
            ) : (
              <Ionicons name="image-outline" size={40} color={COLORS.textTertiary} />
            )}
          </View>
          <Text style={styles.avatarLabel}>{t('avatarUrl')} ({t('leaveForDefault')})</Text>
          <TextInput
            style={styles.input}
            placeholder="https://..."
            value={formData.avatar}
            onChangeText={(text) => setFormData({ ...formData, avatar: text })}
          />
        </View>

        <View style={styles.formSection}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>{t('petName')}<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>{t('ownerName')}<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Owner name"
                value={formData.owner}
                onChangeText={(text) => setFormData({ ...formData, owner: text })}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('petType')}</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[styles.typeButton, formData.type === 'dog' && styles.typeButtonActive]}
                onPress={() => setFormData({ ...formData, type: 'dog' })}
              >
                <Ionicons name="paw" size={22} color={formData.type === 'dog' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.typeText, formData.type === 'dog' && styles.typeTextActive]}>{t('dog')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeButton, formData.type === 'cat' && styles.typeButtonActive]}
                onPress={() => setFormData({ ...formData, type: 'cat' })}
              >
                <Ionicons name="leaf" size={22} color={formData.type === 'cat' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.typeText, formData.type === 'cat' && styles.typeTextActive]}>{t('cat')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeButton, formData.type === 'other' && styles.typeButtonActive]}
                onPress={() => setFormData({ ...formData, type: 'other' })}
              >
                <Ionicons name="ellipsis-horizontal" size={22} color={formData.type === 'other' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.typeText, formData.type === 'other' && styles.typeTextActive]}>{t('other')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>{t('breed')}<Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Breed"
                value={formData.breed}
                onChangeText={(text) => setFormData({ ...formData, breed: text })}
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>{t('gender')}</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[styles.genderButton, formData.gender === 'male' && styles.genderButtonActive]}
                  onPress={() => setFormData({ ...formData, gender: 'male' })}
                >
                  <Ionicons name="male" size={16} color={formData.gender === 'male' ? '#5C7A99' : COLORS.textSecondary} />
                  <Text style={[styles.genderText, formData.gender === 'male' && styles.genderTextActive]}>{t('male')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, formData.gender === 'female' && styles.genderButtonActive]}
                  onPress={() => setFormData({ ...formData, gender: 'female' })}
                >
                  <Ionicons name="female" size={16} color={formData.gender === 'female' ? '#8B3A3A' : COLORS.textSecondary} />
                  <Text style={[styles.genderText, formData.gender === 'female' && styles.genderTextActive]}>{t('female')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('birthdayLabel')}<Text style={styles.required}>*</Text></Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
              <Text style={formData.birthday ? styles.dateText : styles.datePlaceholder}>
                {formData.birthday || 'Tap to select'}
              </Text>
              <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('personalityTags')}</Text>
            <View style={styles.personalityInputRow}>
              <TextInput
                style={[styles.input, styles.personalityInput]}
                placeholder="Trait"
                value={personalityInput}
                onChangeText={setPersonalityInput}
              />
              <TouchableOpacity style={styles.addPersonalityButton} onPress={handleAddPersonality}>
                <Text style={styles.addPersonalityButtonText}>{t('add')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.personalityTags}>
              {formData.personality.map((trait, index) => (
                <View key={index} style={styles.personalityTag}>
                  <Text style={styles.personalityTagText}>{trait}</Text>
                  <TouchableOpacity onPress={() => removePersonality(trait)}>
                    <Ionicons name="close" size={14} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('aboutPet')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about your pet..."
              multiline
              numberOfLines={3}
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('lookingForCompanion')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ideal companion..."
              multiline
              numberOfLines={2}
              value={formData.lookingFor}
              onChangeText={(text) => setFormData({ ...formData, lookingFor: text })}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
              <View style={styles.submitButtonInner}>
                <Text style={styles.submitButtonText}>{t('save')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );

  const renderViewMode = () => (
    <ScrollView style={styles.container}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: pet.avatar }} style={styles.avatarLarge} />
        </View>
        <View style={[styles.genderBadge, pet.gender === 'male' ? styles.genderMale : styles.genderFemale]}>
          <Ionicons name={pet.gender === 'male' ? 'male' : 'female'} size={16} color={pet.gender === 'male' ? '#5C7A99' : '#8B3A3A'} />
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.nameRow}>
          <Text style={styles.petName}>{pet.name}</Text>
          <View style={styles.typeBadge}>
            <Ionicons name={pet.type === 'dog' ? 'paw' : pet.type === 'cat' ? 'leaf' : 'ellipsis-horizontal'} size={14} color={COLORS.primary} />
            <Text style={styles.typeTextBadge}>{pet.breed}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pet.age}y</Text>
            <Text style={styles.statLabel}>{t('age')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pet.birthday}</Text>
            <Text style={styles.statLabel}>{t('birthdayLabel')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pet.owner}</Text>
            <Text style={styles.statLabel}>{t('owner')}</Text>
          </View>
        </View>

        {pet.personality && pet.personality.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('personalityTags')}</Text>
            <View style={styles.tagsContainer}>
              {pet.personality.map((trait, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {pet.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('aboutPet')}</Text>
            <Text style={styles.bioText}>{pet.bio}</Text>
          </View>
        )}

        {pet.lookingFor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('lookingForCompanion')}</Text>
            <View style={styles.lookingForCard}>
              <Ionicons name="heart" size={18} color={COLORS.accent} />
              <Text style={styles.lookingForText}>{pet.lookingFor}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Ionicons name="create-outline" size={18} color={COLORS.textInverse} />
          <Text style={styles.editButtonText}>{t('edit')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {isEditing ? renderEditForm() : renderViewMode()}

      {showDatePicker && (
        <View style={styles.datePickerOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          />
          <View style={styles.datePickerWrapper}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.cancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <Text style={styles.datePickerTitle}>{t('birthdayLabel')}</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.confirmText}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(2000, 0, 1)}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
  },
  avatarLarge: {
    width: '100%',
    height: '100%',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  genderBadge: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: '35%',
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  genderMale: {
    backgroundColor: 'rgba(92, 122, 153, 0.15)',
  },
  genderFemale: {
    backgroundColor: 'rgba(139, 58, 58, 0.15)',
  },
  // Info
  infoSection: {
    padding: SPACING.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  petName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    gap: SPACING.xs,
  },
  typeTextBadge: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  tagText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
  bioText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 22,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lookingForCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lookingForText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  editButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textInverse,
  },
  deleteButton: {
    width: 48,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  // Edit form
  editSection: {
    flex: 1,
  },
  avatarLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  formSection: {
    padding: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  datePlaceholder: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textTertiary,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.divider,
  },
  typeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  typeTextActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  genderButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.divider,
  },
  genderText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  genderTextActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
  personalityInputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  personalityInput: {
    flex: 1,
  },
  addPersonalityButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  addPersonalityButtonText: {
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  personalityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  personalityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    gap: SPACING.xs,
  },
  personalityTagText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
  submitButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  submitButtonInner: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textInverse,
  },
  // Date picker
  datePickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
  },
  datePickerWrapper: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  datePickerTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  cancelText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  confirmText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
});