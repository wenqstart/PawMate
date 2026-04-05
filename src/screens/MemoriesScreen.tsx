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
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { Pet, Anniversary } from '../types';
import { getPets, getAnniversaries, addAnniversary, saveAnniversaries } from '../utils/storage';
import { mockAnniversaries } from '../data/mockData';
import { t, addLanguageListener } from '../i18n';

const TYPE_LABELS: Record<string, string> = {
  birthday: 'Birthday',
  adoption: 'Adoption Day',
  custom: 'Custom',
};

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  birthday: 'gift',
  adoption: 'heart',
  custom: 'star',
};

export default function MemoriesScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [, forceUpdate] = useState(0);
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

  // Re-render when language changes
  useEffect(() => {
    const unsubscribe = addLanguageListener(() => forceUpdate(n => n + 1));
    return unsubscribe;
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
      Alert.alert('Info', 'Please fill in all fields');
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
    Alert.alert('Success', 'Anniversary added');
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
    return pet?.name || 'Unknown';
  };

  const calculateDaysUntil = (dateString: string) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
    return `${diffDays}d`;
  };

  const getIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    return TYPE_ICONS[type as keyof typeof TYPE_ICONS] || 'star';
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
            <Text style={styles.headerTitle}>{t('memoriesAction')}</Text>
            <Text style={styles.headerSubtitle}>{t('importantDates')}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={22} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Upcoming */}
        {upcomingAnniversaries.length > 0 && (
          <View style={styles.upcomingSection}>
            <View style={styles.upcomingHeader}>
              <Ionicons name="calendar" size={18} color={COLORS.textInverse} />
              <Text style={styles.upcomingTitle}>{t('comingUp')}</Text>
            </View>
            {upcomingAnniversaries.slice(0, 3).map((ann) => (
              <View key={ann.id} style={styles.upcomingItem}>
                <View style={styles.upcomingLeft}>
                  <View style={styles.upcomingIcon}>
                    <Ionicons name={getIcon(ann.type)} size={18} color={COLORS.primary} />
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
          </View>
        )}

        {/* By Type */}
        <View style={styles.section}>
          {Object.entries({
            birthday: t('birthday'),
            adoption: t('adoptionDay'),
            custom: t('custom'),
          }).map(([type, label]) => {
            const typedAnniversaries = anniversaries.filter(ann => ann.type === type);
            if (typedAnniversaries.length === 0) return null;

            return (
              <View key={type} style={styles.typeSection}>
                <View style={styles.typeSectionHeader}>
                  <Ionicons name={TYPE_ICONS[type as keyof typeof TYPE_ICONS]} size={18} color={COLORS.accent} />
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
            <View style={styles.emptyIconContainer}>
              <Ionicons name="calendar-outline" size={40} color={COLORS.textTertiary} />
            </View>
            <Text style={styles.emptyText}>{t('noAnniversaries')}</Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addFirstButtonText}>{t('addAnniversary')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('addAnniversary')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('pet')}</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.petId}
                    onValueChange={(value) => setFormData({ ...formData, petId: value })}
                  >
                    <Picker.Item label={t('selectPet')} value="" />
                    {pets.map((pet) => (
                      <Picker.Item key={pet.id} label={pet.name} value={pet.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('type')}</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.type}
                    onValueChange={(value: Anniversary['type']) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <Picker.Item key="birthday" label={t('birthday')} value="birthday" />
                    <Picker.Item key="adoption" label={t('adoptionDay')} value="adoption" />
                    <Picker.Item key="custom" label={t('custom')} value="custom" />
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('title')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('title')}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('date')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('notes')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder={t('notes')}
                  multiline
                  numberOfLines={3}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>{t('save')}</Text>
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
    padding: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingSection: {
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  upcomingTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textInverse,
  },
  upcomingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  upcomingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  upcomingIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingItemTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textInverse,
  },
  upcomingItemSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  daysBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  daysBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textInverse,
  },
  section: {
    padding: SPACING.lg,
  },
  typeSection: {
    marginBottom: SPACING.xl,
  },
  typeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  typeSectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  anniversaryCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  anniversaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  anniversaryTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
    flex: 1,
  },
  daysTag: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
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
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  petTagText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  anniversaryDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
  },
  anniversaryNotes: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  addFirstButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  addFirstButtonText: {
    color: COLORS.textInverse,
    fontWeight: FONT_WEIGHT.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
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
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
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
  },
  submitButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textInverse,
  },
});