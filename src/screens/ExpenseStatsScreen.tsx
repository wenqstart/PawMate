import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../theme';
import { useI18n } from '../i18n';
import { Expense } from '../types';
import { getExpenses } from '../utils/storage';
import { mockExpenses } from '../data/mockData';

type TimeRange = 'week' | 'month' | 'year';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  food: 'restaurant',
  medical: 'medical',
  toys: 'game-controller',
  grooming: 'cut',
  other: 'cube',
};

const CATEGORIES = ['food', 'medical', 'toys', 'grooming', 'other'] as const;
const CATEGORY_COLORS = {
  food: COLORS.primary,
  medical: COLORS.error,
  toys: COLORS.accent,
  grooming: '#C9898A',
  other: COLORS.textTertiary,
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ExpenseStatsScreen() {
  const { t } = useI18n();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    let loadedExpenses = await getExpenses();
    if (loadedExpenses.length === 0) loadedExpenses = mockExpenses;
    setExpenses(loadedExpenses);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const delta = direction === 'next' ? 1 : -1;
    switch (timeRange) {
      case 'week': newDate.setDate(newDate.getDate() + delta * 7); break;
      case 'month': newDate.setMonth(newDate.getMonth() + delta); break;
      case 'year': newDate.setFullYear(newDate.getFullYear() + delta); break;
    }
    setCurrentDate(newDate);
  };

  const getPeriodDisplay = () => {
    switch (timeRange) {
      case 'week':
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} - ${endOfWeek.getMonth() + 1}/${endOfWeek.getDate()}`;
      case 'month': return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      case 'year': return `${currentDate.getFullYear()}`;
    }
  };

  const getPrevPeriodDisplay = () => {
    switch (timeRange) {
      case 'week':
        const prevStart = new Date(currentDate);
        prevStart.setDate(currentDate.getDate() - currentDate.getDay() - 7);
        const prevEnd = new Date(prevStart);
        prevEnd.setDate(prevStart.getDate() + 6);
        return `${prevStart.getMonth() + 1}/${prevStart.getDate()} - ${prevEnd.getMonth() + 1}/${prevEnd.getDate()}`;
      case 'month':
        const prevMonth = new Date(currentDate);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        return `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
      case 'year': return `${currentDate.getFullYear() - 1}`;
    }
  };

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    switch (timeRange) {
      case 'week':
        start.setDate(currentDate.getDate() - currentDate.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case 'month':
        start.setDate(1);
        end.setMonth(start.getMonth() + 1, 0);
        break;
      case 'year':
        start.setMonth(0, 1);
        end.setMonth(11, 31);
        break;
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const getPrevDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    switch (timeRange) {
      case 'week':
        start.setDate(currentDate.getDate() - currentDate.getDay() - 7);
        end.setDate(start.getDate() + 6);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        end.setMonth(start.getMonth() + 1, 0);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        start.setMonth(0, 1);
        end.setMonth(11, 31);
        break;
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const { start, end } = getDateRange();
  const { start: prevStart, end: prevEnd } = getPrevDateRange();

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= start && expDate <= end;
    });
  }, [expenses, currentDate, start, end]);

  const prevFilteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= prevStart && expDate <= prevEnd;
    });
  }, [expenses, currentDate, prevStart, prevEnd]);

  const categoryTotals = useMemo(() => {
    return filteredExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredExpenses]);

  const totalFiltered = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const prevTotal = prevFilteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const difference = totalFiltered - prevTotal;
  const differencePercent = prevTotal > 0 ? (difference / prevTotal) * 100 : 0;

  const maxAmount = Math.max(...Object.values(categoryTotals), 1);

  const pieData = useMemo(() => {
    let cumulative = 0;
    const data = CATEGORIES
      .map(category => {
        const amount = categoryTotals[category] || 0;
        if (amount > 0) {
          const percentage = (amount / totalFiltered) * 100;
          const startAngle = (cumulative / totalFiltered) * 360 - 90;
          cumulative += amount;
          const endAngle = (cumulative / totalFiltered) * 360 - 90;
          const midAngle = (startAngle + endAngle) / 2;
          return {
            value: amount,
            color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
            text: `${t(category)} ${percentage.toFixed(0)}%`,
            label: t(category),
            amount: amount,
            percentage: percentage,
            startAngle,
            endAngle,
            midAngle,
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
    return data;
  }, [categoryTotals, totalFiltered, t]);

  const isIncrease = difference >= 0;
  const trendColor = isIncrease ? COLORS.error : COLORS.success;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('expensesStatistics')}</Text>
          <Text style={styles.headerSubtitle}>{t('trackSpending')}</Text>
        </View>

        {/* Time Range Selector */}
        <View style={styles.filterContainer}>
          <View style={styles.timeRangeContainer}>
            {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
              <TouchableOpacity
                key={range}
                style={[styles.timeRangeButton, timeRange === range && styles.timeRangeButtonActive]}
                onPress={() => setTimeRange(range)}
              >
                <Text style={[styles.timeRangeText, timeRange === range && styles.timeRangeTextActive]}>
                  {t(range)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Period Navigator */}
        <View style={styles.periodNavigator}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigatePeriod('prev')}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.accent} />
          </TouchableOpacity>
          <View style={styles.periodDisplay}>
            <Text style={styles.periodText}>{getPeriodDisplay()}</Text>
          </View>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigatePeriod('next')}
          >
            <Ionicons name="chevron-forward" size={20} color={COLORS.accent} />
          </TouchableOpacity>
        </View>

        {/* Total Amount Card with Gradient */}
        <View style={styles.totalCardContainer}>
          <LinearGradient
            colors={[COLORS.accent, COLORS.accentDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.totalCard}
          >
            <Text style={styles.totalLabel}>{t('total')}</Text>
            <Text style={styles.totalAmount}>${totalFiltered.toFixed(2)}</Text>
            <View style={styles.totalTrendBadge}>
              <Ionicons
                name={isIncrease ? 'trending-up' : 'trending-down'}
                size={14}
                color={isIncrease ? '#FFF0ED' : '#EDF5E8'}
              />
              <Text style={styles.totalTrendText}>
                {Math.abs(differencePercent).toFixed(1)}% {isIncrease ? t('increase') : t('decrease')}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Comparison Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {timeRange === 'week' ? t('compareWithWeek') : timeRange === 'month' ? t('compareWithMonth') : t('compareWithYear')}
          </Text>
          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonLabelRow}>
                <View style={[styles.periodDot, { backgroundColor: COLORS.textTertiary }]} />
                <Text style={styles.comparisonLabel}>{getPrevPeriodDisplay()}</Text>
              </View>
              <Text style={styles.comparisonValue}>${prevTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonLabelRow}>
                <View style={[styles.periodDot, { backgroundColor: COLORS.accent }]} />
                <Text style={styles.comparisonLabel}>{getPeriodDisplay()}</Text>
              </View>
              <Text style={[styles.comparisonValue, { color: COLORS.accent }]}>${totalFiltered.toFixed(2)}</Text>
            </View>
            <View style={styles.comparisonDivider} />
            <View style={styles.comparisonResult}>
              <View style={styles.comparisonResultLeft}>
                <View style={[styles.trendIconContainer, { backgroundColor: trendColor + '20' }]}>
                  <Ionicons
                    name={isIncrease ? 'arrow-up' : 'arrow-down'}
                    size={16}
                    color={trendColor}
                  />
                </View>
                <Text style={[styles.comparisonDifference, { color: trendColor }]}>
                  ${Math.abs(difference).toFixed(2)}
                </Text>
                <Text style={[styles.comparisonPercent, { color: trendColor }]}>
                  ({Math.abs(differencePercent).toFixed(1)}%)
                </Text>
              </View>
              <Text style={[styles.comparisonStatus, { color: trendColor }]}>
                {isIncrease ? t('increase') : t('decrease')}
              </Text>
            </View>
          </View>
        </View>

        {/* Pie Chart Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('byCategory')}</Text>
          <View style={styles.pieContainer}>
            {totalFiltered === 0 ? (
              <View style={styles.pieEmptyContainer}>
                <Ionicons name="pie-chart-outline" size={48} color={COLORS.textTertiary} />
                <Text style={styles.pieEmptyText}>{t('noExpenses')}</Text>
              </View>
            ) : (
              <View style={styles.pieChartWrapper}>
                <PieChart
                  data={pieData.map(item => ({
                    name: item.label,
                    population: item.amount,
                    color: item.color,
                    legendFontColor: COLORS.text,
                    legendFontSize: 12,
                  }))}
                  width={SCREEN_WIDTH - SPACING.lg * 4}
                  height={200}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="0"
                  absolute
                  hasLegend={false}
                />
                {/* Center Total */}
                <View style={styles.pieCenterOverlay}>
                  <Text style={styles.pieCenterLabel}>{t('total')}</Text>
                  <Text style={styles.pieCenterAmount}>${totalFiltered.toFixed(0)}</Text>
                </View>
                {/* Category Legend */}
                <View style={styles.pieLegendContainer}>
                  {pieData.map((item) => (
                    <View key={item.label} style={styles.pieLegendItem}>
                      <View style={[styles.pieLegendDot, { backgroundColor: item.color }]} />
                      <Text style={styles.pieLegendLabel}>{item.label}</Text>
                      <Text style={styles.pieLegendPercent}>{item.percentage.toFixed(0)}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Bar Chart Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('categoryBreakdown')}</Text>
          <View style={styles.chartContainer}>
            {CATEGORIES.map((category) => {
              const amount = categoryTotals[category] || 0;
              const percentage = totalFiltered > 0 ? (amount / totalFiltered) * 100 : 0;
              const barWidth = totalFiltered > 0 ? (amount / maxAmount) * (SCREEN_WIDTH - SPACING.lg * 4 - 100) : 0;
              return (
                <View key={category} style={styles.chartRow}>
                  <View style={styles.chartLabelContainer}>
                    <View style={[styles.iconContainer, { backgroundColor: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] + '20' }]}>
                      <Ionicons
                        name={CATEGORY_ICONS[category]}
                        size={14}
                        color={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}
                      />
                    </View>
                    <Text style={styles.chartLabel}>{t(category)}</Text>
                  </View>
                  <View style={styles.chartBarContainer}>
                    <View style={[styles.chartBar, { width: barWidth, backgroundColor: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] }]} />
                  </View>
                  <View style={styles.chartValueContainer}>
                    <Text style={styles.chartValue}>${amount.toFixed(0)}</Text>
                    <Text style={styles.chartPercentage}>{percentage.toFixed(0)}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.lg, paddingTop: SPACING.xl },
  headerTitle: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  headerSubtitle: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },
  filterContainer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  timeRangeButtonActive: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  timeRangeText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: FONT_WEIGHT.medium },
  timeRangeTextActive: { color: COLORS.textInverse, fontWeight: FONT_WEIGHT.semibold },
  periodNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  navButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  periodDisplay: { minWidth: 140, alignItems: 'center' },
  periodText: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.semibold, color: COLORS.text },
  totalCardContainer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg },
  totalCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: COLORS.accentDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  totalLabel: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.xs },
  totalAmount: {
    fontSize: 42,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textInverse,
    letterSpacing: -1,
  },
  totalTrendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  totalTrendText: { fontSize: FONT_SIZE.xs, color: COLORS.textInverse, fontWeight: FONT_WEIGHT.medium },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  comparisonContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  comparisonLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  periodDot: { width: 8, height: 8, borderRadius: 4 },
  comparisonLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  comparisonValue: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: COLORS.text },
  comparisonDivider: { height: 1, backgroundColor: COLORS.divider, marginVertical: SPACING.md },
  comparisonResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xs,
  },
  comparisonResultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  trendIconContainer: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonDifference: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold },
  comparisonPercent: { fontSize: FONT_SIZE.sm },
  comparisonStatus: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold },
  pieContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  pieChartWrapper: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  pieCenterOverlay: {
    position: 'absolute',
    top: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieCenterLabel: { fontSize: 12, color: COLORS.textSecondary },
  pieCenterAmount: { fontSize: 20, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  pieLegendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  pieLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  pieLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  pieLegendLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
    marginRight: SPACING.sm,
  },
  pieLegendPercent: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  pieEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  pieEmptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  chartContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  chartLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 85,
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  chartBarContainer: {
    flex: 1,
    height: 24,
    backgroundColor: COLORS.divider,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    borderRadius: BORDER_RADIUS.md,
    minWidth: 4,
  },
  chartValueContainer: { width: 65, alignItems: 'flex-end' },
  chartValue: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.text },
  chartPercentage: { fontSize: FONT_SIZE.xs, color: COLORS.textTertiary },
});