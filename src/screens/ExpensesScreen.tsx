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
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZE } from '../theme';
import { Pet, Expense } from '../types';
import { getPets, getExpenses, addExpense, saveExpenses } from '../utils/storage';
import { mockExpenses } from '../data/mockData';

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍖',
  medical: '💊',
  toys: '🎾',
  grooming: '✂️',
  other: '📦',
};

const CATEGORY_LABELS: Record<string, string> = {
  food: '食品',
  medical: '医疗',
  toys: '玩具',
  grooming: '美容',
  other: '其他',
};

export default function ExpensesScreen() {
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
      Alert.alert('提示', '请填写完整信息');
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
    Alert.alert('成功', '记账成功！');
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
    return pet?.name || '未知宠物';
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
            <Text style={styles.headerTitle}>宠物记账</Text>
            <Text style={styles.headerSubtitle}>记录每一笔宠物开支</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#FFE9DC' }]}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.primary }]}>
              <Ionicons name="wallet" size={24} color={COLORS.white} />
            </View>
            <Text style={styles.statLabel}>总开支</Text>
            <Text style={styles.statValue}>¥{totalExpenses.toFixed(2)}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FFF4E0' }]}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.secondary }]}>
              <Ionicons name="calendar" size={24} color={COLORS.white} />
            </View>
            <Text style={styles.statLabel}>本月开支</Text>
            <Text style={styles.statValue}>¥{thisMonthExpenses.toFixed(2)}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.success }]}>
              <Ionicons name="trending-up" size={24} color={COLORS.white} />
            </View>
            <Text style={styles.statLabel}>记录数</Text>
            <Text style={styles.statValue}>{expenses.length}</Text>
          </View>
        </View>

        {/* Category Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>分类统计</Text>
          <View style={styles.categoryGrid}>
            {Object.entries(categoryTotals).map(([category, total]) => (
              <View key={category} style={styles.categoryCard}>
                <Text style={styles.categoryEmoji}>
                  {CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}
                </Text>
                <Text style={styles.categoryLabel}>
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                </Text>
                <Text style={styles.categoryTotal}>¥{total.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Expense List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>开支记录</Text>
          {expenses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet-outline" size={64} color={COLORS.gray} />
              <Text style={styles.emptyText}>还没有记账记录</Text>
            </View>
          ) : (
            expenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((expense) => (
                <View key={expense.id} style={styles.expenseCard}>
                  <Text style={styles.expenseEmoji}>
                    {CATEGORY_ICONS[expense.category]}
                  </Text>
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseDescription}>{expense.description}</Text>
                    <View style={styles.expenseDetails}>
                      <View style={styles.petBadge}>
                        <Text style={styles.petBadgeText}>{getPetName(expense.petId)}</Text>
                      </View>
                      <Text style={styles.expenseCategory}>
                        {CATEGORY_LABELS[expense.category]}
                      </Text>
                      <Text style={styles.expenseDate}>· {expense.date}</Text>
                    </View>
                  </View>
                  <Text style={styles.expenseAmount}>¥{expense.amount.toFixed(2)}</Text>
                </View>
              ))
          )}
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>添加开支记录</Text>
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
                <Text style={styles.label}>分类</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.category}
                    onValueChange={(value: Expense['category']) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <Picker.Item
                        key={key}
                        label={`${CATEGORY_ICONS[key]} ${label}`}
                        value={key}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>金额 (元)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={formData.amount}
                  onChangeText={(text) => setFormData({ ...formData, amount: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>描述</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="记录一下这笔开支..."
                  multiline
                  numberOfLines={3}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>日期</Text>
                <TextInput
                  style={styles.input}
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
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
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  categoryEmoji: {
    fontSize: FONT_SIZE.xxxl,
    marginBottom: SPACING.xs,
  },
  categoryLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  categoryTotal: {
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  expenseEmoji: {
    fontSize: FONT_SIZE.xxxl,
    marginRight: SPACING.md,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  expenseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  petBadge: {
    backgroundColor: '#FFE9DC',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  petBadgeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  expenseCategory: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  expenseDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  expenseAmount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptyContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
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