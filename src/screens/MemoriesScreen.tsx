import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZE } from '../theme';
import { Pet, Anniversary } from '../types';
import { getPets, getAnniversaries, addAnniversary, saveAnniversaries } from '../utils/storage';
import { mockAnniversaries } from '../data/mockData';

const TYPE_LABELS: Record<string, string> = {
  birthday: '生日',
  adoption: '领养日',
  custom: '自定义',
};

export default function MemoriesScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    petId: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'custom' as Anniversary['type'],
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedPets = await getPets();
    setPets(loadedPets);

    let loadedAnniversaries = await getAnniversaries();
    if (loadedAnniversaries.length === 0) {
      loadedAnniversaries = mockAnniversaries;
      await saveAnniversaries(loadedAnniversaries);
    }
    setAnniversaries(loadedAnniversaries);
  };

  const handleSubmit = async () => {
    if (!formData.petId || !formData.title || !formData.date) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    const newAnniversary: Anniversary = {
      id: Date.now().toString(),
      petId: formData.petId,
      title: formData.title,
      date: formData.date,
      type: formData.type,
      notes: formData.notes,
    };

    await addAnniversary(newAnniversary);
    setAnniversaries([...anniversaries, newAnniversary]);
    Alert.alert('成功', '纪念日添加成功！');
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      petId: '',
      title: '',
      date: new Date().toISOString().split('T')[0],
      type: 'custom',
      notes: '',
    });
  };

  const getPetName = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    return pet?.name || '未知宠物';
  };

  const calculateDaysUntil = (dateString: string) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '明天';
    if (diffDays < 0) return `${Math.abs(diffDays)}天前`;
    return `还有${diffDays}天`;
  };

  const getIcon = (type: string) => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      birthday: 'gift',
      adoption: 'heart',
      custom: 'star',
    };
    return icons[type] || 'star';
  };

  const upcomingAnniversaries = anniversaries
    .filter(ann => {
      const targetDate = new Date(ann.date);
      const today = new Date();
      const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>宠物纪念日</Text>
            <Text style={styles.headerSubtitle}>记录重要的日子</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Upcoming Anniversaries */}
        {upcomingAnniversaries.length > 0 && (
          <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.upcomingCard}
          >
            <View style={styles.upcomingHeader}>
              <Ionicons name="calendar" size={20} color={COLORS.white} />
              <Text style={styles.upcomingTitle}>即将到来的纪念日</Text>
            </View>
            {upcomingAnniversaries.slice(0, 3).map((ann) => (
              <View key={ann.id} style={styles.upcomingItem}>
                <View style={styles.upcomingItemLeft}>
                  <View style={styles.upcomingIcon}>
                    <Ionicons name={getIcon(ann.type)} size={20} color={COLORS.white} />
                  </View>
                  <View>
                    <Text style={styles.upcomingItemTitle}>{ann.title}</Text>
                    <Text style={styles.upcomingItemSubtitle}>
                      {getPetName(ann.petId)} · {ann.date}
                    </Text>
                  </View>
                </View>
                <View style={styles.daysBadge}>
                  <Text style={styles.daysBadgeText}>{calculateDaysUntil(ann.date)}</Text>
                </View>
              </View>
            ))}
          </LinearGradient>
        )}

        {/* All Anniversaries by Type */}
        <View style={styles.section}>
          {Object.entries(TYPE_LABELS).map(([type, label]) => {
            const typedAnniversaries = anniversaries.filter(ann => ann.type === type);
            if (typedAnniversaries.length === 0) return null;

            return (
              <View key={type} style={styles.typeSection}>
                <View style={styles.typeSectionHeader}>
                  <Ionicons name={getIcon(type)} size={20} color={COLORS.primary} />
                  <Text style={styles.typeSectionTitle}>{label}</Text>
                </View>
                {typedAnniversaries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(ann => (
                    <View key={ann.id} style={styles.anniversaryCard}>
                      <View style={styles.anniversaryHeader}>
                        <Text style={styles.anniversaryTitle}>{ann.title}</Text>
                        <View style={styles.daysTag}>
                          <Text style={styles.daysTagText}>{calculateDaysUntil(ann.date)}</Text>
                        </View>
                      </View>
                      <View style={styles.anniversaryDetails}>
                        <View style={styles.petTag}>
                          <Text style={styles.petTagText}>{getPetName(ann.petId)}</Text>
                        </View>
                        <Text style={styles.anniversaryDate}>{ann.date}</Text>
                      </View>
                      {ann.notes && (
                        <Text style={styles.anniversaryNotes}>{ann.notes}</Text>
                      )}
                    </View>
                  ))}
              </View>
            );
          })}
        </View>

        {anniversaries.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>还没有添加纪念日</Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addFirstButtonText}>添加第一个纪念日</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Add Anniversary Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>添加纪念日</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>选择宠物</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.petId}
                    onValueChange={(value) => setFormData({ ...formData, petId: value })}
                  >
                    <Picker.Item label="选择宠物" value="" />
                    {pets.map((pet) => (
                      <Picker.Item key={pet.id} label={pet.name} value={pet.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>类型</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.type}
                    onValueChange={(value: Anniversary['type']) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    {Object.entries(TYPE_LABELS).map(([key, label]) => (
                      <Picker.Item key={key} label={label} value={key} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>标题</Text>
                <TextInput
                  style={styles.input}
                  placeholder="例如：可乐的生日"
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>日期</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>备注</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="添加一些备注..."
                  multiline
                  numberOfLines={3}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>保存</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  upcomingCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  upcomingTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  upcomingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  upcomingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  upcomingIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingItemTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  upcomingItemSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  daysBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  daysBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  section: {
    padding: SPACING.md,
  },
  typeSection: {
    marginBottom: SPACING.lg,
  },
  typeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  typeSectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  anniversaryCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  anniversaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  anniversaryTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  daysTag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  daysTagText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  anniversaryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  petTag: {
    backgroundColor: '#FFE9DC',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  petTagText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  anniversaryDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  anniversaryNotes: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    padding: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginVertical: SPACING.md,
  },
  addFirstButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  addFirstButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background,
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
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  submitButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});