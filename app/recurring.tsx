import { useState } from 'react'
import {
  StyleSheet, Text, View, FlatList, Pressable,
  Alert, useColorScheme,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/Colors'
import { useApp } from '../store/AppContext'
import EditTransactionModal from '../components/EditTransactionModal'
import { Transaction, RecurringInterval } from '../types'

const INTERVAL_LABELS: Record<RecurringInterval, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

export default function RecurringScreen() {
  const colorScheme = useColorScheme()
  const theme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = Colors[theme]
  const { transactions, categories, updateTransaction, deleteTransaction } = useApp()

  const recurring = transactions.filter((t) => t.recurring !== null)

  const [editTx, setEditTx] = useState<Transaction | null>(null)

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Pressable
        style={styles.cardBody}
        onPress={() => setEditTx(item)}
      >
        <View style={[styles.icon, { backgroundColor: item.type === 'inflow' ? colors.income + '20' : colors.expense + '20' }]}>
          <Ionicons
            name="repeat"
            size={18}
            color={item.type === 'inflow' ? colors.income : colors.expense}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.category, { color: colors.text }]}>{item.category}</Text>
          <Text style={[styles.interval, { color: colors.textSecondary }]}>
            Every {INTERVAL_LABELS[item.recurring!].toLowerCase()}
          </Text>
          {item.note ? <Text style={[styles.note, { color: colors.textSecondary }]}>{item.note}</Text> : null}
        </View>
        <Text style={[styles.amount, { color: item.type === 'inflow' ? colors.income : colors.expense }]}>
          {item.type === 'inflow' ? '+' : '-'}₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </Pressable>
      <Pressable
        style={styles.deleteBtn}
        onPress={() => {
          Alert.alert('Delete Recurring', 'Remove this recurring transaction?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(item.id) },
          ])
        }}
      >
        <Ionicons name="trash-outline" size={18} color={colors.expense} />
      </Pressable>
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={recurring}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.border }]}>
              <Ionicons name="repeat" size={36} color={colors.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No recurring transactions</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Mark a transaction as recurring when adding one
            </Text>
          </View>
        )}
      />

      <EditTransactionModal
        visible={editTx !== null}
        transaction={editTx}
        categories={categories}
        onClose={() => setEditTx(null)}
        onSave={(updated) => { updateTransaction(updated); setEditTx(null) }}
        onDelete={(id) => {
          Alert.alert('Delete Recurring', 'Remove this recurring transaction?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => { deleteTransaction(id); setEditTx(null) } },
          ])
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingLeft: 16,
  },
  deleteBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
  },
  interval: {
    fontSize: 12,
    marginTop: 1,
  },
  note: {
    fontSize: 12,
    marginTop: 1,
  },
  amount: {
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
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

})
