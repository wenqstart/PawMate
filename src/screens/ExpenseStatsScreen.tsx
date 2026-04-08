import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, G, Rect, Text as SvgText } from 'react-native-svg';
import { COLORS, SPACING } from '../theme';
import { useI18n } from '../i18n';
import { Expense } from '../types';
import { getExpenses } from '../utils/storage';
import { mockExpenses } from '../data/mockData';

type TimeRange = 'week' | 'month' | 'year';

const CATEGORIES = ['food', 'medical', 'toys', 'grooming', 'other'] as const;
const CATEGORY_COLORS: Record<string, string> = {
  food: '#F4A261',
  medical: '#E76F51',
  toys: '#2A9D8F',
  grooming: '#9B5DE5',
  other: '#8D99AE',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Custom Pie Chart using SVG
function PieChart({ data, size = 200, innerRadius = 60 }: {
  data: Array<{ value: number; color: string; label: string; percentage: number }>;
  size?: number;
  innerRadius?: number;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;

  const radius = size / 2;
  const cx = size / 2;
  const cy = size / 2;

  let startAngle = -90;
  const segments = data.map(item => {
    const angle = (item.value / total) * 360;
    const seg = {
      ...item,
      startAngle,
      endAngle: startAngle + angle,
      percentage: (item.value / total) * 100,
    };
    startAngle += angle;
    return seg;
  });

  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const describeArc = (startAngle: number, endAngle: number, r: number, ir: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const innerStart = polarToCartesian(cx, cy, ir, endAngle);
    const innerEnd = polarToCartesian(cx, cy, ir, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return [
      'M', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
      'L', innerEnd.x, innerEnd.y,
      'A', ir, ir, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      'Z',
    ].join(' ');
  };

  return (
    <Svg width={size} height={size}>
      <G>
        {segments.map((segment, index) => {
          if (segment.value === 0) return null;
          // Position label at middle of arc
          const midAngle = (segment.startAngle + segment.endAngle) / 2;
          const labelRadius = radius - (radius - innerRadius) / 2;
          const labelPos = polarToCartesian(cx, cy, labelRadius, midAngle);
          return (
            <React.Fragment key={index}>
              <Path
                d={describeArc(segment.startAngle, segment.endAngle, radius, innerRadius)}
                fill={segment.color}
              />
              {segment.percentage >= 8 && (
                <SvgText
                  x={labelPos.x}
                  y={labelPos.y + 4}
                  fontSize={11}
                  fill="#FFFFFF"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {segment.percentage.toFixed(0)}%
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </G>
    </Svg>
  );
}

// Custom Horizontal Bar Chart using SVG
function BarChart({ data, width = SCREEN_WIDTH - SPACING.lg * 4 }: {
  data: Array<{ label: string; value: number; color: string; percentage: number }>;
  width?: number;
}) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barHeight = 18;
  const labelWidth = 50;
  const chartWidth = width - labelWidth - 90;
  const rowHeight = 36;

  return (
    <Svg width={width} height={data.length * rowHeight + 10}>
      {data.map((item, index) => {
        const barWidth = (item.value / maxValue) * chartWidth;
        const y = index * rowHeight + 9;

        return (
          <React.Fragment key={index}>
            {/* Label */}
            <SvgText
              x={labelWidth - 8}
              y={y + barHeight / 2 + 4}
              fontSize={11}
              fill="#64748B"
              textAnchor="end"
            >
              {item.label}
            </SvgText>
            {/* Bar */}
            <Rect
              x={labelWidth}
              y={y}
              width={Math.max(barWidth, 2)}
              height={barHeight}
              fill={item.color}
              rx={5}
              ry={5}
            />
            {/* Value & Percentage */}
            <SvgText
              x={labelWidth + chartWidth + 8}
              y={y + barHeight / 2 + 4}
              fontSize={11}
              fill="#1A1A2E"
              fontWeight="600"
            >
              ${item.value.toFixed(0)}
            </SvgText>
            <SvgText
              x={labelWidth + chartWidth + 55}
              y={y + barHeight / 2 + 4}
              fontSize={10}
              fill="#94A3B8"
            >
              {item.percentage.toFixed(0)}%
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

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
      case 'week': {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} - ${endOfWeek.getMonth() + 1}/${endOfWeek.getDate()}`;
      }
      case 'month': return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      case 'year': return `${currentDate.getFullYear()}`;
    }
  };

  const getPrevPeriodDisplay = () => {
    switch (timeRange) {
      case 'week': {
        const prevStart = new Date(currentDate);
        prevStart.setDate(currentDate.getDate() - currentDate.getDay() - 7);
        const prevEnd = new Date(prevStart);
        prevEnd.setDate(prevStart.getDate() + 6);
        return `${prevStart.getMonth() + 1}/${prevStart.getDate()} - ${prevEnd.getMonth() + 1}/${prevEnd.getDate()}`;
      }
      case 'month': {
        const prevMonth = new Date(currentDate);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        return `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
      }
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

  const pieData = useMemo(() => {
    return CATEGORIES
      .map(category => {
        const amount = categoryTotals[category] || 0;
        const percentage = totalFiltered > 0 ? (amount / totalFiltered) * 100 : 0;
        return {
          label: t(category),
          value: amount,
          color: CATEGORY_COLORS[category],
          percentage,
        };
      })
      .filter(item => item.value > 0);
  }, [categoryTotals, t]);

  const barData = useMemo(() => {
    return CATEGORIES.map(category => {
      const value = categoryTotals[category] || 0;
      const percentage = totalFiltered > 0 ? (value / totalFiltered) * 100 : 0;
      return {
        label: t(category),
        value,
        color: CATEGORY_COLORS[category],
        percentage,
      };
    });
  }, [categoryTotals, totalFiltered, t]);

  const isIncrease = difference >= 0;
  const trendColor = isIncrease ? COLORS.error : COLORS.success;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('expensesStatistics')}</Text>
          <Text style={styles.headerSubtitle}>{t('trackSpending')}</Text>
        </View>

        {/* Time Range Selector */}
        <View style={styles.filterContainer}>
          <View style={styles.segmentedControl}>
            {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
              <TouchableOpacity
                key={range}
                style={[styles.segment, timeRange === range && styles.segmentActive]}
                onPress={() => setTimeRange(range)}
              >
                <Text style={[styles.segmentText, timeRange === range && styles.segmentTextActive]}>
                  {t(range)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Period Navigator */}
        <View style={styles.periodNavigator}>
          <TouchableOpacity style={styles.navButton} onPress={() => navigatePeriod('prev')}>
            <Ionicons name="chevron-back" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.periodText}>{getPeriodDisplay()}</Text>
          <TouchableOpacity style={styles.navButton} onPress={() => navigatePeriod('next')}>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Total Amount Card */}
        <View style={styles.totalCardContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.totalCard}
          >
            <Text style={styles.totalLabel}>{t('total')}</Text>
            <Text style={styles.totalAmount}>${totalFiltered.toFixed(2)}</Text>
            <View style={styles.trendBadge}>
              <Ionicons name={isIncrease ? 'arrow-up' : 'arrow-down'} size={12} color="#FFFFFF" />
              <Text style={styles.trendText}>
                {Math.abs(differencePercent).toFixed(1)}% {isIncrease ? t('increase') : t('decrease')}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Pie Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('byCategory')}</Text>
          <View style={styles.chartCard}>
            {pieData.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="pie-chart-outline" size={40} color={COLORS.textTertiary} />
                <Text style={styles.emptyText}>{t('noExpenses')}</Text>
              </View>
            ) : (
              <>
                <View style={styles.pieChartWrapper}>
                  <PieChart
                    data={pieData}
                    size={200}
                    innerRadius={60}
                  />
                  <View style={styles.pieCenter}>
                    <Text style={styles.pieCenterLabel}>{t('total')}</Text>
                    <Text style={styles.pieCenterAmount}>${totalFiltered.toFixed(0)}</Text>
                  </View>
                </View>
                <View style={styles.legend}>
                  {pieData.map((item) => (
                    <View key={item.label} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <Text style={styles.legendLabel}>{item.label}</Text>
                      <Text style={styles.legendValue}>${item.value.toFixed(0)}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>

        {/* Bar Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('categoryBreakdown')}</Text>
          <View style={styles.chartCard}>
            {totalFiltered === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="bar-chart-outline" size={40} color={COLORS.textTertiary} />
                <Text style={styles.emptyText}>{t('noExpenses')}</Text>
              </View>
            ) : (
              <BarChart data={barData} />
            )}
          </View>
        </View>

        {/* Comparison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {timeRange === 'week' ? t('compareWithWeek') : timeRange === 'month' ? t('compareWithMonth') : t('compareWithYear')}
          </Text>
          <View style={styles.card}>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonLeft}>
                <View style={[styles.dot, { backgroundColor: '#CBD5E1' }]} />
                <Text style={styles.comparisonLabel}>{getPrevPeriodDisplay()}</Text>
              </View>
              <Text style={styles.comparisonValue}>${prevTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonLeft}>
                <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.comparisonLabel}>{getPeriodDisplay()}</Text>
              </View>
              <Text style={[styles.comparisonValue, { color: COLORS.primary }]}>${totalFiltered.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.resultRow}>
              <View style={styles.resultLeft}>
                <View style={[styles.trendIcon, { backgroundColor: trendColor + '15' }]}>
                  <Ionicons name={isIncrease ? 'arrow-up' : 'arrow-down'} size={16} color={trendColor} />
                </View>
                <Text style={[styles.resultDiff, { color: trendColor }]}>${Math.abs(difference).toFixed(2)}</Text>
              </View>
              <Text style={[styles.resultStatus, { color: trendColor }]}>
                {isIncrease ? t('increase') : t('decrease')}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: SPACING.lg, paddingTop: SPACING.xl },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1A1A2E', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  filterContainer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  segmentActive: { backgroundColor: COLORS.primary },
  segmentText: { fontSize: 13, fontWeight: '500', color: '#64748B' },
  segmentTextActive: { color: '#FFFFFF', fontWeight: '600' },
  periodNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.lg,
  },
  navButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  periodText: { fontSize: 16, fontWeight: '600', color: '#1A1A2E', minWidth: 120, textAlign: 'center' },
  totalCardContainer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg },
  totalCard: {
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  totalLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, textTransform: 'uppercase' },
  totalAmount: { fontSize: 44, fontWeight: '700', color: '#FFFFFF', letterSpacing: -1.5, marginTop: 4 },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    gap: 4,
  },
  trendText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A2E', marginBottom: SPACING.md },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  comparisonLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  comparisonLabel: { fontSize: 13, color: '#64748B' },
  comparisonValue: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trendIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  resultDiff: { fontSize: 16, fontWeight: '700' },
  resultStatus: { fontSize: 14, fontWeight: '500' },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, color: '#94A3B8' },
  pieChartWrapper: { alignItems: 'center', justifyContent: 'center', height: 200 },
  pieCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -10 }],
    alignItems: 'center',
    width: 80,
  },
  pieCenterLabel: { fontSize: 11, color: '#64748B', letterSpacing: 1, textTransform: 'uppercase' },
  pieCenterAmount: { fontSize: 22, fontWeight: '700', color: '#1A1A2E', marginTop: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 16 },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, color: '#334155', fontWeight: '500' },
  legendValue: { fontSize: 11, color: '#64748B', marginLeft: 4 },
});
