import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { useI18n } from '../i18n';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Expense } from '../types';
import { getExpenses, addExpense, saveExpenses, updateExpense } from '../utils/storage';
import { mockExpenses } from '../data/mockData';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  food: 'restaurant',
  medical: 'medical',
  toys: 'game-controller',
  grooming: 'cut',
  other: 'cube',
};

const CATEGORY_COLORS: Record<string, string> = {
  food: '#E07B5A',
  medical: '#D4736B',
  toys: '#F5B041',
  grooming: '#C9898A',
  other: '#9E9689',
};

const getCategoryLabel = (key: string, t: (key: any) => string): string => {
  const labels: Record<string, string> = {
    food: 'food',
    medical: 'medical',
    toys: 'toys',
    grooming: 'grooming',
    other: 'other',
  };
  return t(labels[key] || 'other');
};

const PAGE_SIZE = 20;

export default function ExpensesScreen() {
  const { t } = useI18n();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [displayedExpenses, setDisplayedExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [formData, setFormData] = useState({
    category: 'food' as Expense['category'],
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    let loadedExpenses = await getExpenses();
    if (loadedExpenses.length === 0) {
      loadedExpenses = mockExpenses;
      await saveExpenses(loadedExpenses);
    }

    const sorted = [...loadedExpenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setAllExpenses(sorted);
    setDisplayedExpenses(sorted.slice(0, PAGE_SIZE));
    setHasMore(sorted.length > PAGE_SIZE);
  };

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    const currentLength = displayedExpenses.length;
    const nextExpenses = allExpenses.slice(currentLength, currentLength + PAGE_SIZE);

    if (nextExpenses.length > 0) {
      setDisplayedExpenses(prev => [...prev, ...nextExpenses]);
    }

    setHasMore(currentLength + nextExpenses.length < allExpenses.length);
    setLoading(false);
  }, [loading, hasMore, displayedExpenses.length, allExpenses]);

  const handleSubmit = async () => {
    if (!formData.amount || !formData.description) {
      Alert.alert('Info', 'Please fill in all fields');
      return;
    }

    if (editingExpense) {
      const updatedExpense: Expense = {
        ...editingExpense,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
      };
      await updateExpense(updatedExpense);
      setAllExpenses(prev => prev.map(e => e.id === editingExpense.id ? updatedExpense : e));
      setDisplayedExpenses(prev => prev.map(e => e.id === editingExpense.id ? updatedExpense : e));
      Alert.alert('Success', 'Expense updated');
    } else {
      const newExpense: Expense = {
        id: Date.now().toString(),
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
      };
      await addExpense(newExpense);
      const updatedAll = [newExpense, ...allExpenses].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setAllExpenses(updatedAll);
      setDisplayedExpenses(updatedAll.slice(0, displayedExpenses.length));
      Alert.alert('Success', 'Expense added');
    }
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      category: 'food',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingExpense(null);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description,
      date: expense.date,
    });
    setModalVisible(true);
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      style={styles.expenseCard}
      onPress={() => handleEditExpense(item)}
      onLongPress={() => {
        Alert.alert(
          t('edit'),
          t('edit') + '?',
          [
            { text: t('cancel'), style: 'cancel' },
            { text: t('edit'), onPress: () => handleEditExpense(item) },
          ]
        );
      }}
    >
      <View style={[styles.expenseIconContainer, { backgroundColor: CATEGORY_COLORS[item.category] + '20' }]}>
        <Ionicons
          name={CATEGORY_ICONS[item.category] || 'cube'}
          size={20}
          color={CATEGORY_COLORS[item.category]}
        />
      </View>
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseDescription}>{item.description}</Text>
        <View style={styles.expenseDetails}>
          <Text style={[styles.expenseCategory, { color: CATEGORY_COLORS[item.category] }]}>
            {getCategoryLabel(item.category, t)}
          </Text>
          <Text style={styles.expenseDate}>· {item.date}</Text>
        </View>
      </View>
      <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('expensesAction')}</Text>
          <Text style={styles.headerSubtitle}>{t('trackSpending')}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.statsButton}
            onPress={() => navigation.navigate('ExpenseStats')}
          >
            <Ionicons name="stats-chart" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={22} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expense List */}
      {displayedExpenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="wallet-outline" size={60} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>{t('noExpenses')}</Text>
          <Text style={styles.emptySubtitle}>{t('trackSpending')}</Text>
          <TouchableOpacity
            style={styles.emptyAddButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={18} color={COLORS.textInverse} />
            <Text style={styles.emptyAddButtonText}>{t('addExpense')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayedExpenses}
          renderItem={renderExpenseItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      )}

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
              <Text style={styles.modalTitle}>{editingExpense ? t('editExpense') : t('addExpense')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View>
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
                        label={`${getCategoryLabel(key, t)}`}
                        value={key}
                        color={COLORS.text}
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
                  placeholderTextColor={COLORS.textTertiary}
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
                  placeholderTextColor={COLORS.textTertiary}
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
                  placeholderTextColor={COLORS.textTertiary}
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
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
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statsButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
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
  expenseCategory: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  expenseDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
  },
  expenseAmount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyAddButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textInverse,
  },
  footer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
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
    fontWeight: FONT_WEIGHT.bold,
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
    color: COLORS.text,
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textInverse,
  },
});
