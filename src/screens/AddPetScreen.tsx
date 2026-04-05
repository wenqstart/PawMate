import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { Pet } from '../types';
import { addPet, updatePet } from '../utils/storage';
import { t, addLanguageListener } from '../i18n';

interface AddPetScreenProps {
  navigation: any;
  route?: {
    params?: {
      pet?: Pet;
      isEdit?: boolean;
    };
  };
}

export default function AddPetScreen({ navigation, route }: AddPetScreenProps) {
  const editPet = route?.params?.pet;
  const isEdit = route?.params?.isEdit || false;

  const [, forceUpdate] = useState(0);

  // Re-render when language changes
  useEffect(() => {
    const unsubscribe = addLanguageListener(() => forceUpdate(n => n + 1));
    return unsubscribe;
  }, []);

  const [formData, setFormData] = useState({
    name: editPet?.name || '',
    type: editPet?.type || 'dog' as Pet['type'],
    breed: editPet?.breed || '',
    gender: editPet?.gender || 'male' as Pet['gender'],
    birthday: editPet?.birthday || '',
    avatar: editPet?.avatar || '',
    personality: editPet?.personality || [] as string[],
    owner: editPet?.owner || '',
    bio: editPet?.bio || '',
    lookingFor: editPet?.lookingFor || '',
  });

  const [personalityInput, setPersonalityInput] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(editPet?.birthday ? new Date(editPet.birthday) : new Date());

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setTempDate(selectedDate);
      setFormData({ ...formData, birthday: formatDate(selectedDate) });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.breed || !formData.birthday || !formData.owner) {
      Alert.alert('Info', 'Please fill required fields');
      return;
    }

    const defaultAvatars = {
      dog: 'https://images.unsplash.com/photo-1747045170511-9f0f4f3859e8?w=400',
      cat: 'https://images.unsplash.com/photo-1702914954859-f037fc75b760?w=400',
      other: 'https://images.unsplash.com/photo-1747045170511-9f0f4f3859e8?w=400',
    };

    const petData: Pet = {
      id: editPet?.id || Date.now().toString(),
      ...formData,
      age: calculateAge(formData.birthday),
      avatar: formData.avatar || defaultAvatars[formData.type],
    };

    if (isEdit && editPet) {
      await updatePet(petData);
      Alert.alert('Success', `${petData.name} updated`);
    } else {
      await addPet(petData);
      Alert.alert('Success', `${petData.name} added`);
    }
    navigation.goBack();
  };

  const calculateAge = (birthday: string) => {
    const birth = new Date(birthday);
    const today = new Date();
    return today.getFullYear() - birth.getFullYear();
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Avatar Section */}
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
        <Text style={styles.hint}>{t('leaveForDefault')}</Text>
      </View>

      {/* Form */}
      <View style={styles.section}>
        {/* Name & Owner */}
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>
              {t('petName')} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Max"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={styles.halfInput}>
            <Text style={styles.label}>
              {t('ownerName')} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              value={formData.owner}
              onChangeText={(text) => setFormData({ ...formData, owner: text })}
            />
          </View>
        </View>

        {/* Type Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('petType')}</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === 'dog' && styles.typeButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, type: 'dog' })}
            >
              <Ionicons name="paw" size={24} color={formData.type === 'dog' ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[styles.typeText, formData.type === 'dog' && styles.typeTextActive]}>{t('dog')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === 'cat' && styles.typeButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, type: 'cat' })}
            >
              <Ionicons name="leaf" size={24} color={formData.type === 'cat' ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[styles.typeText, formData.type === 'cat' && styles.typeTextActive]}>Cat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === 'other' && styles.typeButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, type: 'other' })}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color={formData.type === 'other' ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[styles.typeText, formData.type === 'other' && styles.typeTextActive]}>{t('other')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Breed & Gender */}
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>
              {t('breed')} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Golden Retriever"
              value={formData.breed}
              onChangeText={(text) => setFormData({ ...formData, breed: text })}
            />
          </View>

          <View style={styles.halfInput}>
            <Text style={styles.label}>{t('gender')}</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'male' && styles.genderButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, gender: 'male' })}
              >
                <Ionicons name="male" size={16} color={formData.gender === 'male' ? '#5C7A99' : COLORS.textSecondary} />
                <Text style={[styles.genderText, formData.gender === 'male' && styles.genderTextActive]}>{t('male')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'female' && styles.genderButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, gender: 'female' })}
              >
                <Ionicons name="female" size={16} color={formData.gender === 'female' ? '#8B3A3A' : COLORS.textSecondary} />
                <Text style={[styles.genderText, formData.gender === 'female' && styles.genderTextActive]}>{t('female')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Birthday */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {t('birthdayLabel')} <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={formData.birthday ? styles.dateText : styles.datePlaceholder}>
              {formData.birthday || 'Tap to select'}
            </Text>
            <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Personality */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('personalityTags')}</Text>
          <View style={styles.personalityInputRow}>
            <TextInput
              style={[styles.input, styles.personalityInput]}
              placeholder="e.g., Friendly"
              value={personalityInput}
              onChangeText={setPersonalityInput}
            />
            <TouchableOpacity
              style={styles.addPersonalityButton}
              onPress={handleAddPersonality}
            >
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

        {/* Bio */}
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

        {/* Looking For */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('lookingForCompanion')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe ideal companion..."
            multiline
            numberOfLines={2}
            value={formData.lookingFor}
            onChangeText={(text) => setFormData({ ...formData, lookingFor: text })}
          />
        </View>

        {/* Submit Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <View style={styles.submitButtonInner}>
              <Text style={styles.submitButtonText}>{isEdit ? t('edit') : t('save')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: SPACING.xxl }} />

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          transparent
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.cancelText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>{t('selectDate')}</Text>
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
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  avatarSection: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.round,
  },
  avatarLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  hint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  section: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
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