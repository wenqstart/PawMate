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
import { useI18n } from '../i18n';
import { Pet, Expense } from '../types';
import { getPets, getExpenses, addExpense, saveExpenses } from '../utils/storage';
import { mockExpenses } from '../data/mockData';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  food: 'restaurant',
  medical: 'medical',
  toys: 'game-controller',
  grooming: 'cut',
  other: 'cube',
};

// Category labels from i18n
const getCategoryLabel = (key: string): string => {
  const labels: Record<string, keyof typeof import('../i18n').en> = {
    food: 'food',
    medical: 'medical',
    toys: 'toys',
    grooming: 'grooming',
    other: 'other',
  };
  return t(labels[key] || 'other');
};

export default function ExpensesScreen() {
  const { t } = useI18n();
  const [pets, setPets] = useState<Pet[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    petId: '',
    category: 'food' as Expense['category'],
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedPets = await getPets();
    setPets(loadedPets);

    let loadedExpenses = await getExpenses();
    if (loadedExpenses.length === 0) {
      loadedExpenses = mockExpenses;
      await saveExpenses(loadedExpenses);
    }
    setExpenses(loadedExpenses);
  };

  const handleSubmit = async () => {
    if (!formData.petId || !formData.amount || !formData.description) {
      Alert.alert('Info', 'Please fill in all fields');
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      petId: formData.petId,
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
    };

    await addExpense(newExpense);
    setExpenses([...expenses, newExpense]);
    Alert.alert('Success', 'Expense added');
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      petId: '',
      category: 'food',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const getPetName = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    return pet?.name || 'Unknown';
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const thisMonthExpenses = expenses
    .filter(exp => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() &&
             expDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{t('expensesAction')}</Text>
            <Text style={styles.headerSubtitle}>{t('trackSpending')}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={22} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.statIconPrimary]}>
              <Ionicons name="wallet" size={20} color={COLORS.textInverse} />
            </View>
            <Text style={styles.statLabel}>{t('total')}</Text>
            <Text style={styles.statValue}>${totalExpenses.toFixed(2)}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.statIconSecondary]}>
              <Ionicons name="calendar" size={20} color={COLORS.textInverse} />
            </View>
            <Text style={styles.statLabel}>{t('thisMonth')}</Text>
            <Text style={styles.statValue}>${thisMonthExpenses.toFixed(2)}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.statIconTertiary]}>
              <Ionicons name="list" size={20} color={COLORS.textInverse} />
            </View>
            <Text style={styles.statLabel}>{t('records')}</Text>
            <Text style={styles.statValue}>{expenses.length}</Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('byCategory')}</Text>
          <View style={styles.categoryGrid}>
            {Object.entries(categoryTotals).map(([category, total]) => (
              <View key={category} style={styles.categoryCard}>
                <View style={styles.categoryIconContainer}>
                  <Ionicons
                    name={CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || 'cube'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </View>
                <Text style={styles.categoryLabel}>
                  {getCategoryLabel(category)}
                </Text>
                <Text style={styles.categoryTotal}>${total.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Expense List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('recent')}</Text>
          {expenses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet-outline" size={40} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>{t('noExpenses')}</Text>
            </View>
          ) : (
            expenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((expense) => (
                <View key={expense.id} style={styles.expenseCard}>
                  <View style={styles.expenseIconContainer}>
                    <Ionicons
                      name={CATEGORY_ICONS[expense.category] || 'cube'}
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  </View>
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseDescription}>{expense.description}</Text>
                    <View style={styles.expenseDetails}>
                      <View style={styles.petBadge}>
                        <Text style={styles.petBadgeText}>{getPetName(expense.petId)}</Text>
                      </View>
                      <Text style={styles.expenseCategory}>
                        {getCategoryLabel(expense.category)}
                      </Text>
                      <Text style={styles.expenseDate}>· {expense.date}</Text>
                    </View>
                  </View>
                  <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
                </View>
              ))
          )}
        </View>

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
              <Text style={styles.modalTitle}>{t('addExpense')}</Text>
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
                <Text style={styles.label}>{t('category')}</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.category}
                    onValueChange={(value: Expense['category']) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    {['food', 'medical', 'toys', 'grooming', 'other'].map((key) => (
                      <Picker.Item
                        key={key}
                        label={`${CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS]} ${getCategoryLabel(key)}`}
                        value={key}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('amount')} ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={formData.amount}
                  onChangeText={(text) => setFormData({ ...formData, amount: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('description')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder={t('description')}
                  multiline
                  numberOfLines={3}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('date')}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statIconPrimary: {
    backgroundColor: COLORS.accent,
  },
  statIconSecondary: {
    backgroundColor: COLORS.info,
  },
  statIconTertiary: {
    backgroundColor: COLORS.success,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryCard: {
    width: '31%',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  categoryLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  categoryTotal: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  expenseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  expenseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  petBadge: {
    backgroundColor: COLORS.divider,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  petBadgeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  expenseCategory: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
  },
  expenseDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
  },
  expenseAmount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  emptyContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
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