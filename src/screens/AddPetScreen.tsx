import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZE } from '../theme';
import { Pet } from '../types';
import { addPet, updatePet } from '../utils/storage';

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
      Alert.alert('提示', '请填写必填信息');
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
      Alert.alert('成功', `${petData.name} 更新成功！`);
    } else {
      await addPet(petData);
      Alert.alert('成功', `${petData.name} 添加成功！`);
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
            <Ionicons name="image-outline" size={48} color={COLORS.textLight} />
          )}
        </View>
        <Text style={styles.avatarLabel}>头像链接（可选）</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          value={formData.avatar}
          onChangeText={(text) => setFormData({ ...formData, avatar: text })}
        />
        <Text style={styles.hint}>留空将使用默认头像</Text>
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>
              宠物名字 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="例如：可乐"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={styles.halfInput}>
            <Text style={styles.label}>
              主人姓名 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="例如：张小明"
              value={formData.owner}
              onChangeText={(text) => setFormData({ ...formData, owner: text })}
            />
          </View>
        </View>

        {/* Type Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>宠物类型</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === 'dog' && styles.typeButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, type: 'dog' })}
            >
              <Text style={styles.typeEmoji}>🐶</Text>
              <Text style={styles.typeText}>狗狗</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === 'cat' && styles.typeButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, type: 'cat' })}
            >
              <Text style={styles.typeEmoji}>🐱</Text>
              <Text style={styles.typeText}>猫咪</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                formData.type === 'other' && styles.typeButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, type: 'other' })}
            >
              <Text style={styles.typeEmoji}>🐾</Text>
              <Text style={styles.typeText}>其他</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Breed and Gender */}
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>
              品种 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="例如：金毛"
              value={formData.breed}
              onChangeText={(text) => setFormData({ ...formData, breed: text })}
            />
          </View>

          <View style={styles.halfInput}>
            <Text style={styles.label}>性别</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'male' && styles.genderButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, gender: 'male' })}
              >
                <Text>🦁 男生</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'female' && styles.genderButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, gender: 'female' })}
              >
                <Text>🌸 女生</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Birthday with Date Picker */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            生日 <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={formData.birthday ? styles.dateText : styles.datePlaceholder}>
              {formData.birthday || '点击选择日期'}
            </Text>
            <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Personality */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>性格标签</Text>
          <View style={styles.personalityInputRow}>
            <TextInput
              style={[styles.input, styles.personalityInput]}
              placeholder="例如：活泼、友善"
              value={personalityInput}
              onChangeText={setPersonalityInput}
            />
            <TouchableOpacity
              style={styles.addPersonalityButton}
              onPress={handleAddPersonality}
            >
              <Text style={styles.addPersonalityButtonText}>添加</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.personalityTags}>
            {formData.personality.map((trait, index) => (
              <View key={index} style={styles.personalityTag}>
                <Text style={styles.personalityTagText}>{trait}</Text>
                <TouchableOpacity onPress={() => removePersonality(trait)}>
                  <Ionicons name="close" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>自我介绍</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="介绍一下你的宠物..."
            multiline
            numberOfLines={3}
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
          />
        </View>

        {/* Looking For */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>期望对象</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="描述一下理想的伴侣..."
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
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <LinearGradient
              colors={[COLORS.gradientStart, COLORS.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>{isEdit ? '更新' : '保存'}</Text>
            </LinearGradient>
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
                  <Text style={styles.cancelText}>取消</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>选择生日</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.confirmText}>确定</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
    padding: SPACING.lg,
    backgroundColor: '#FFF4E0',
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.border,
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
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  section: {
    padding: SPACING.md,
  },
  formGroup: {
    marginBottom: SPACING.md,
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
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.white,
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
    color: COLORS.textLight,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFE9DC',
  },
  typeEmoji: {
    fontSize: FONT_SIZE.xxl,
    marginBottom: SPACING.xs,
  },
  typeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  genderButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFE9DC',
  },
  personalityInputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  personalityInput: {
    flex: 1,
  },
  addPersonalityButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  addPersonalityButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
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
    backgroundColor: '#FFE9DC',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    gap: SPACING.xs,
  },
  personalityTagText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  submitButtonGradient: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: COLORS.white,
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
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  cancelText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  confirmText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
});