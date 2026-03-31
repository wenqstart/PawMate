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
  Pressable,
  WebView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZE } from '../theme';
import { Pet } from '../types';
import { getPets, deletePet, updatePet } from '../utils/storage';

// Web 上使用的 HTML 日期选择器组件
function WebDatePicker({ value, onChange, minimumDate, maximumDate }: {
  value: string;
  onChange: (date: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}) {
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  const handleChange = (event: any) => {
    const dateStr = event.target.value;
    if (dateStr) {
      onChange(dateStr);
    }
  };

  return (
    <View style={webDatePickerStyles.container}>
      <input
        type="date"
        value={formatDateForInput(value)}
        min={minimumDate ? formatDateForInput(minimumDate.toISOString()) : undefined}
        max={maximumDate ? formatDateForInput(maximumDate.toISOString()) : undefined}
        onChange={handleChange}
        style={webDatePickerStyles.input}
      />
    </View>
  );
}

const webDatePickerStyles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  input: {
    width: '100%',
    padding: SPACING.md,
    fontSize: FONT_SIZE.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
  },
});

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

  // 编辑表单状态
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
      '确认删除',
      `确定要删除 ${pet?.name} 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
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
      Alert.alert('提示', '请填写必填信息');
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
    Alert.alert('成功', '宠物信息已更新！');
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
        <Text>加载中...</Text>
      </View>
    );
  }

  // 渲染编辑模式表单
  const renderEditForm = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.editSection}>
        {/* Avatar */}
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
        </View>

        {/* Basic Info */}
        <View style={styles.formSection}>
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
                <Text style={styles.typeTextButton}>狗狗</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.type === 'cat' && styles.typeButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, type: 'cat' })}
              >
                <Text style={styles.typeEmoji}>🐱</Text>
                <Text style={styles.typeTextButton}>猫咪</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.type === 'other' && styles.typeButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, type: 'other' })}
              >
                <Text style={styles.typeEmoji}>🐾</Text>
                <Text style={styles.typeTextButton}>其他</Text>
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

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSave}
            >
              <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>保存</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );

  // 渲染查看模式
  const renderViewMode = () => (
    <ScrollView style={styles.container}>
      {/* Pet Avatar */}
      <View style={styles.avatarSection}>
        <Image source={{ uri: pet.avatar }} style={styles.avatar} />
        <View style={styles.genderBadge}>
          <Text style={styles.genderText}>
            {pet.gender === 'male' ? '🦁' : '🌸'}
          </Text>
        </View>
      </View>

      {/* Pet Info */}
      <View style={styles.infoSection}>
        <View style={styles.nameRow}>
          <Text style={styles.petName}>{pet.name}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {pet.type === 'dog' ? '🐶' : pet.type === 'cat' ? '🐱' : '🐾'} {pet.breed}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pet.age}岁</Text>
            <Text style={styles.statLabel}>年龄</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pet.birthday}</Text>
            <Text style={styles.statLabel}>生日</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{pet.owner}</Text>
            <Text style={styles.statLabel}>主人</Text>
          </View>
        </View>

        {/* Personality */}
        {pet.personality && pet.personality.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>性格标签</Text>
            <View style={styles.tagsContainer}>
              {pet.personality.map((trait, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bio */}
        {pet.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>自我介绍</Text>
            <Text style={styles.bioText}>{pet.bio}</Text>
          </View>
        )}

        {/* Looking For */}
        {pet.lookingFor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>期望对象</Text>
            <View style={styles.lookingForCard}>
              <Ionicons name="heart" size={20} color={COLORS.primary} />
              <Text style={styles.lookingForText}>{pet.lookingFor}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Ionicons name="create" size={20} color={COLORS.white} />
          <Text style={styles.editButtonText}>编辑资料</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {isEditing ? renderEditForm() : renderViewMode()}

      {/* Date Picker - 使用绝对定位而非 Modal */}
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
              display="spinner"
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(2000, 0, 1)}
              style={styles.datePicker}
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: '#FFF4E0',
    position: 'relative',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  genderBadge: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: '35%',
    backgroundColor: COLORS.white,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  genderText: {
    fontSize: 18,
  },
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
    fontWeight: 'bold',
    color: COLORS.text,
  },
  typeBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  typeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
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
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    backgroundColor: '#FFE9DC',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  tagText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  bioText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    lineHeight: 22,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  lookingForCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  lookingForText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  editButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  editButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  deleteButton: {
    width: 50,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  // 编辑模式样式
  editSection: {
    flex: 1,
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
  avatarLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  formSection: {
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
  typeTextButton: {
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
  datePickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  datePickerWrapper: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
  },
  modalBackground: {
    flex: 1,
  },
  datePickerContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
  },
  datePicker: {
    backgroundColor: COLORS.white,
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
