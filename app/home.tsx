import { useMemo, useState } from 'react'
import {
  StyleSheet, Text, View, FlatList, Pressable, Modal, useColorScheme,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/Colors'
import { useApp } from '../store/AppContext'
import AddTransactionModal from '../components/AddTransactionModal'
import { Transaction } from '../types'

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function formatDate(d: Date) {
  const date = new Date(d)
  return `${monthNames[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`
}

function getMonthOptions() {
  const now = new Date()
  const options: { month: number | null; year: number; label: string }[] = [
    { month: null, year: now.getFullYear(), label: 'All Months' },
  ]
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const m = d.getMonth()
    const y = d.getFullYear()
    if (!options.some((o) => o.month === m && o.year === y)) {
      options.push({ month: m, year: y, label: `${monthNames[m]} ${y}` })
    }
  }
  return options
}

export default function Home() {
  const colorScheme = useColorScheme()
  const theme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = Colors[theme]
  const { transactions, balance, addTransaction, categories } = useApp()
  const [modalVisible, setModalVisible] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [filterMonth, setFilterMonth] = useState<number | null>(new Date().getMonth())
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())

  const monthOptions = useMemo(getMonthOptions, [])

  const filteredTransactions = useMemo(() => {
    if (filterMonth === null) return transactions
    return transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === filterMonth && d.getFullYear() === filterYear
    })
  }, [transactions, filterMonth, filterYear])

  const filteredIncome = filteredTransactions
    .filter((t) => t.type === 'inflow')
    .reduce((s, t) => s + t.amount, 0)

  const filteredExpenses = filteredTransactions
    .filter((t) => t.type === 'outflow')
    .reduce((s, t) => s + t.amount, 0)

  const filterLabel = filterMonth === null
    ? 'All Months'
    : `${monthNames[filterMonth].slice(0, 3)} ${filterYear}`

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const isCurrentMonth = filterMonth === currentMonth && filterYear === currentYear

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => (
          <>
            <View style={[styles.balanceCard, { backgroundColor: colors.tint }]}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceAmount}>
                ₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Ionicons name="arrow-up" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.summaryValue}>
                    ₱{filteredIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.summaryLabel}>Income</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Ionicons name="arrow-down" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.summaryValue}>
                    ₱{filteredExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.summaryLabel}>Expenses</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Transactions
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.filterBtn,
                  { backgroundColor: colors.surface, borderColor: colors.border, transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
                onPress={() => setShowFilter(true)}
              >
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.filterText, { color: colors.text }]}>{filterLabel}</Text>
                {!isCurrentMonth && filterMonth !== null && (
                  <View style={[styles.filterBadge, { backgroundColor: colors.tint }]}>
                    <Text style={styles.filterBadgeText}>1</Text>
                  </View>
                )}
                <Ionicons name="chevron-down" size={12} color={colors.tabInactive} />
              </Pressable>
            </View>
          </>
        )}
        renderItem={({ item }: { item: Transaction }) => (
          <View style={[styles.txItem, { backgroundColor: colors.surface }]}>
            <View style={styles.txLeft}>
              <View style={[styles.txIcon, { backgroundColor: item.type === 'inflow' ? colors.income + '20' : colors.expense + '20' }]}>
                <Ionicons
                  name={item.type === 'inflow' ? 'trending-up' : 'trending-down'}
                  size={18}
                  color={item.type === 'inflow' ? colors.income : colors.expense}
                />
              </View>
              <View style={styles.txInfo}>
                <Text style={[styles.txCategory, { color: colors.text }]}>{item.category}</Text>
                {item.note ? <Text style={[styles.txNote, { color: colors.textSecondary }]}>{item.note}</Text> : null}
                <Text style={[styles.txDate, { color: colors.textSecondary }]}>{formatDate(item.date)}</Text>
              </View>
            </View>
            <Text style={[styles.txAmount, { color: item.type === 'inflow' ? colors.income : colors.expense }]}>
              {item.type === 'inflow' ? '+' : '-'}₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.border }]}>
              <Ionicons name="wallet-outline" size={36} color={colors.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No transactions yet</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>Tap + to add your first one</Text>
          </View>
        )}
      />

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.tint, transform: [{ scale: pressed ? 0.93 : 1 }] },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </Pressable>

      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={(data) => addTransaction(data)}
        categories={categories}
      />

      <Modal visible={showFilter} transparent animationType="fade">
        <Pressable style={styles.filterOverlay} onPress={() => setShowFilter(false)}>
          <View style={[styles.filterSheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.filterSheetTitle, { color: colors.text }]}>Select Month</Text>
            {monthOptions.map((opt) => {
              const active = opt.month === filterMonth && opt.year === filterYear
              return (
                <Pressable
                  key={opt.label}
                  style={({ pressed }) => [
                    styles.filterOption,
                    { backgroundColor: pressed ? colors.background : 'transparent' },
                  ]}
                  onPress={() => {
                    setFilterMonth(opt.month)
                    setFilterYear(opt.year)
                    setShowFilter(false)
                  }}
                >
                  <Text style={[styles.filterOptionText, { color: active ? colors.tint : colors.text, fontWeight: active ? '700' : '500' }]}>
                    {opt.label}
                  </Text>
                  {active && <Ionicons name="checkmark" size={20} color={colors.tint} />}
                </Pressable>
              )
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingBottom: 100,
  },
  balanceCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 24,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balanceAmount: {
    color: '#FFF',
    fontSize: 38,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    gap: 4,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 2,
    borderRadius: 14,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txInfo: {
    gap: 1,
  },
  txCategory: {
    fontSize: 15,
    fontWeight: '600',
  },
  txNote: {
    fontSize: 12,
  },
  txDate: {
    fontSize: 11,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  emptySub: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  filterOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  filterSheet: {
    width: '75%',
    maxHeight: 400,
    borderRadius: 18,
    overflow: 'hidden',
    paddingVertical: 8,
  },
  filterSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  filterOptionText: {
    fontSize: 15,
  },
})
