import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { Pet } from '../firebase/auth';
import { addPet, updatePet } from '../firebase/auth';
import { useI18n } from '../i18n';
import { useAuth } from '../contexts/AuthContext';

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
  const { user, userProfile } = useAuth();
  const { t } = useI18n();
  const editPet = route?.params?.pet;
  const isEdit = route?.params?.isEdit || false;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: editPet?.name || '',
    type: editPet?.type || 'dog' as 'dog' | 'cat' | 'other',
    breed: editPet?.breed || '',
    gender: editPet?.gender || 'male' as 'male' | 'female',
    birthday: editPet?.birthday || '',
    photos: editPet?.photos || [] as string[],
    personality: editPet?.personality || [] as string[],
    bio: editPet?.bio || '',
    lookingFor: editPet?.lookingFor || '',
    isLooking: editPet?.isLooking ?? true,
  });

  const [personalityInput, setPersonalityInput] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(editPet?.birthday ? new Date(editPet.birthday) : new Date());

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTempDate(selectedDate);
      setFormData({ ...formData, birthday: formatDate(selectedDate) });
    }
  };

  const addPersonalityTag = () => {
    if (personalityInput.trim() && formData.personality.length < 5) {
      setFormData({
        ...formData,
        personality: [...formData.personality, personalityInput.trim()],
      });
      setPersonalityInput('');
    }
  };

  const removePersonalityTag = (index: number) => {
    const newTags = [...formData.personality];
    newTags.splice(index, 1);
    setFormData({ ...formData, personality: newTags });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert(t('error') || 'Error', t('petName') + ' ' + (t('required') || 'required'));
      return;
    }
    if (!formData.breed.trim()) {
      Alert.alert(t('error') || 'Error', t('breed') + ' ' + (t('required') || 'required'));
      return;
    }
    if (!formData.birthday) {
      Alert.alert(t('error') || 'Error', t('birthdayLabel') + ' ' + (t('required') || 'required'));
      return;
    }
    if (!user) {
      Alert.alert(t('error') || 'Error', t('login') + ' ' + (t('required') || 'required'));
      return;
    }

    setLoading(true);
    try {
      const petData = {
        name: formData.name.trim(),
        type: formData.type,
        breed: formData.breed.trim(),
        gender: formData.gender,
        birthday: formData.birthday,
        photos: formData.photos.length > 0 ? formData.photos : ['https://images.unsplash.com/photo-1637852422069-81efc85e0a79?w=400'],
        personality: formData.personality,
        bio: formData.bio.trim(),
        lookingFor: formData.lookingFor.trim(),
        isLooking: formData.isLooking,
        ownerId: user.uid,
        ownerName: userProfile?.nickname || user.phoneNumber || 'Unknown',
      };

      if (isEdit && editPet?.id) {
        await updatePet(user.uid, editPet.id, petData);
      } else {
        await addPet(petData);
      }

      Alert.alert(t('success') || 'Success', isEdit ? 'Pet updated!' : 'Pet added!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving pet:', error);
      Alert.alert(t('error') || 'Error', 'Failed to save pet');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>{isEdit ? t('editPet') : t('addPet')}</Text>
        <Text style={styles.headerSubtitle}>{t('addPetSubtitle')}</Text>
      </View>

      {/* Name */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('petName')}<Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder={t('petName')}
          placeholderTextColor={COLORS.textTertiary}
        />
      </View>

      {/* Type */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('petType')}</Text>
        <View style={styles.typeSelector}>
          {(['dog', 'cat', 'other'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeButton, formData.type === type && styles.typeButtonActive]}
              onPress={() => setFormData({ ...formData, type })}
            >
              <View style={[styles.typeIcon, formData.type === type && styles.typeIconActive]}>
                <Ionicons
                  name={type === 'dog' ? 'paw' : type === 'cat' ? 'paw' : 'help-circle'}
                  size={24}
                  color={formData.type === type ? COLORS.textInverse : COLORS.textSecondary}
                />
              </View>
              <Text style={[styles.typeText, formData.type === type && styles.typeTextActive]}>
                {t(type)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Breed */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('breed')}<Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          value={formData.breed}
          onChangeText={(text) => setFormData({ ...formData, breed: text })}
          placeholder={t('breed')}
          placeholderTextColor={COLORS.textTertiary}
        />
      </View>

      {/* Gender */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('gender')}</Text>
        <View style={styles.genderSelector}>
          <TouchableOpacity
            style={[styles.genderButton, formData.gender === 'male' && styles.genderButtonActive]}
            onPress={() => setFormData({ ...formData, gender: 'male' })}
          >
            <Ionicons name="male" size={20} color={formData.gender === 'male' ? COLORS.textInverse : COLORS.info} />
            <Text style={[styles.genderText, formData.gender === 'male' && styles.genderTextActive]}>{t('male')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderButton, formData.gender === 'female' && styles.genderButtonActive]}
            onPress={() => setFormData({ ...formData, gender: 'female' })}
          >
            <Ionicons name="female" size={20} color={formData.gender === 'female' ? COLORS.textInverse : COLORS.error} />
            <Text style={[styles.genderText, formData.gender === 'female' && styles.genderTextActive]}>{t('female')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Birthday */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('birthdayLabel')}<Text style={styles.required}>*</Text></Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={[styles.dateText, !formData.birthday && styles.dateTextPlaceholder]}>
            {formData.birthday || t('selectDate')}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Personality */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('personalityTags')}</Text>
        <View style={styles.personalityInput}>
          <TextInput
            style={styles.personalityTextInput}
            value={personalityInput}
            onChangeText={setPersonalityInput}
            placeholder={t('personality')}
            placeholderTextColor={COLORS.textTertiary}
            onSubmitEditing={addPersonalityTag}
          />
          <TouchableOpacity style={styles.addTagButton} onPress={addPersonalityTag}>
            <Ionicons name="add" size={24} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
        <View style={styles.tagsContainer}>
          {formData.personality.map((tag, index) => (
            <TouchableOpacity key={index} style={styles.tag} onPress={() => removePersonalityTag(index)}>
              <Text style={styles.tagText}>{tag}</Text>
              <Ionicons name="close-circle" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bio */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('aboutPet')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.bio}
          onChangeText={(text) => setFormData({ ...formData, bio: text })}
          placeholder={t('aboutPet')}
          placeholderTextColor={COLORS.textTertiary}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Looking For */}
      <View style={styles.field}>
        <Text style={styles.label}>{t('lookingForCompanion')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.lookingFor}
          onChangeText={(text) => setFormData({ ...formData, lookingFor: text })}
          placeholder={t('lookingForCompanion')}
          placeholderTextColor={COLORS.textTertiary}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Is Looking Toggle */}
      <View style={styles.field}>
        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <View style={[styles.switchIcon, formData.isLooking && styles.switchIconActive]}>
              <Ionicons name="heart" size={18} color={formData.isLooking ? COLORS.textInverse : COLORS.accent} />
            </View>
            <Text style={styles.switchLabel}>{t('lookingToggle')}</Text>
          </View>
          <Switch
            value={formData.isLooking}
            onValueChange={(value) => setFormData({ ...formData, isLooking: value })}
            trackColor={{ false: COLORS.border, true: COLORS.accent }}
            thumbColor={COLORS.textInverse}
          />
        </View>
        <Text style={[styles.switchHint, formData.isLooking && styles.switchHintActive]}>
          {formData.isLooking ? t('lookingOn') : t('lookingOff')}
        </Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.textInverse} />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.textInverse} />
            <Text style={styles.saveButtonText}>{t('save')}</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  headerSection: {
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  field: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  required: {
    color: COLORS.primary,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  typeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  typeTextActive: {
    color: COLORS.textInverse,
  },
  genderSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  genderButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  genderTextActive: {
    color: COLORS.textInverse,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  dateText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  dateTextPlaceholder: {
    color: COLORS.textTertiary,
  },
  personalityInput: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  personalityTextInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addTagButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.primaryLight + '40',
  },
  tagText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  switchIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchIconActive: {
    backgroundColor: COLORS.accent,
  },
  switchLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
  },
  switchHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  switchHintActive: {
    color: COLORS.accent,
    fontWeight: FONT_WEIGHT.medium,
  },
});
