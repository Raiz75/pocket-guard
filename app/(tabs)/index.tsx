import { useState } from 'react'
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  useColorScheme,
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
        ListHeaderComponent={() => (
          <>
            <View style={[styles.balanceCard, { backgroundColor: colors.tint }]}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceAmount}>
                ₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Income</Text>
                  <Text style={styles.summaryValue}>
                    ₱{monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Expenses</Text>
                  <Text style={styles.summaryValue}>
                    ₱{monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {monthLabel} Transactions
            </Text>
          </>
        )}
        renderItem={({ item }: { item: Transaction }) => (
          <View style={[styles.txItem, { borderBottomColor: colors.tabInactive + '40' }]}>
            <View style={styles.txLeft}>
              <View style={[styles.txDot, { backgroundColor: item.type === 'inflow' ? '#16A34A' : '#DC2626' }]} />
              <View>
                <Text style={[styles.txCategory, { color: colors.text }]}>{item.category}</Text>
                {item.note ? <Text style={[styles.txNote, { color: colors.tabInactive }]}>{item.note}</Text> : null}
                <Text style={[styles.txDate, { color: colors.tabInactive }]}>{formatDate(item.date)}</Text>
              </View>
            </View>
            <Text style={[styles.txAmount, { color: item.type === 'inflow' ? '#16A34A' : '#DC2626' }]}>
              {item.type === 'inflow' ? '+' : '-'}₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="wallet-outline" size={48} color={colors.tabInactive} />
            <Text style={[styles.emptyText, { color: colors.tabInactive }]}>No transactions yet</Text>
            <Text style={[styles.emptySub, { color: colors.tabInactive }]}>Tap + to add your first one</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

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
    margin: 16,
    borderRadius: 20,
    padding: 24,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '800',
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 24,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  txDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  txCategory: {
    fontSize: 15,
    fontWeight: '600',
  },
  txNote: {
    fontSize: 12,
    marginTop: 1,
  },
  txDate: {
    fontSize: 11,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySub: {
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0891B2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
})
