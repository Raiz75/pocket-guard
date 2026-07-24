import { useState } from 'react'
import {
  StyleSheet, Text, View, FlatList, Pressable, useColorScheme,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/Colors'
import { useApp } from '../../store/AppContext'
import AddTransactionModal from '../../components/AddTransactionModal'
import { Transaction } from '../../types'

function formatDate(d: Date) {
  const date = new Date(d)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function Home() {
  const colorScheme = useColorScheme()
  const theme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = Colors[theme]
  const { transactions, balance, monthlyIncome, monthlyExpenses, addTransaction, categories } = useApp()
  const [modalVisible, setModalVisible] = useState(false)

  const now = new Date()
  const monthLabel = monthNames[now.getMonth()]

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={transactions}
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
                  <Ionicons name="arrow-down" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.summaryValue}>
                    ₱{monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.summaryLabel}>Income</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Ionicons name="arrow-up" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.summaryValue}>
                    ₱{monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.summaryLabel}>Expenses</Text>
                </View>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {monthLabel} Transactions
            </Text>
          </>
        )}
        renderItem={({ item }: { item: Transaction }) => (
          <View style={[styles.txItem, { backgroundColor: colors.surface }]}>
            <View style={styles.txLeft}>
              <View style={[styles.txIcon, { backgroundColor: item.type === 'inflow' ? colors.income + '20' : colors.expense + '20' }]}>
                <Ionicons
                  name={item.type === 'inflow' ? 'trending-down' : 'trending-up'}
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
    marginTop: 60,
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: 16,
    marginTop: 28,
    marginBottom: 12,
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
})
