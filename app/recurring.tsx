import { useState } from 'react'
import {
  StyleSheet, Text, View, FlatList, Pressable, Modal, TextInput,
  Alert, useColorScheme, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/Colors'
import { useApp } from '../store/AppContext'
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
  const [editAmount, setEditAmount] = useState('')
  const [editNote, setEditNote] = useState('')
  const [editRecurring, setEditRecurring] = useState<RecurringInterval | null>(null)

  const openEdit = (tx: Transaction) => {
    setEditTx(tx)
    setEditAmount(tx.amount.toString())
    setEditNote(tx.note)
    setEditRecurring(tx.recurring)
  }

  const handleUpdate = () => {
    if (!editTx) return
    const parsed = parseFloat(editAmount)
    if (!parsed || parsed <= 0 || !editRecurring) return
    updateTransaction({
      ...editTx,
      amount: parsed,
      note: editNote,
      recurring: editRecurring,
    })
    setEditTx(null)
  }

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Remove this recurring transaction?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(id) },
    ])
  }

  const renderItem = ({ item }: { item: Transaction }) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
      onPress={() => openEdit(item)}
    >
      <View style={styles.cardLeft}>
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
      </View>
      <View style={styles.cardRight}>
        <Text style={[styles.amount, { color: item.type === 'inflow' ? colors.income : colors.expense }]}>
          {item.type === 'inflow' ? '+' : '-'}₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <Pressable onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={18} color={colors.expense} />
        </Pressable>
      </View>
    </Pressable>
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

      <Modal visible={editTx !== null} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <Pressable style={styles.backdrop} onPress={() => setEditTx(null)} />
          <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Recurring</Text>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Amount</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
              keyboardType="decimal-pad"
              value={editAmount}
              onChangeText={setEditAmount}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Note</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
              value={editNote}
              onChangeText={setEditNote}
              placeholder="Optional note"
              placeholderTextColor={colors.tabInactive}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Interval</Text>
            <View style={[styles.intervalRow, { backgroundColor: colors.background }]}>
              {(['daily', 'weekly', 'monthly', 'yearly'] as RecurringInterval[]).map((iv) => (
                <Pressable
                  key={iv}
                  style={({ pressed }) => [
                    styles.intervalBtn,
                    editRecurring === iv && { backgroundColor: colors.tint },
                    { transform: [{ scale: pressed ? 0.95 : 1 }] },
                  ]}
                  onPress={() => setEditRecurring(iv)}
                >
                  <Text style={[styles.intervalBtnText, { color: editRecurring === iv ? '#FFF' : colors.textSecondary }]}>
                    {INTERVAL_LABELS[iv]}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  { backgroundColor: colors.border, transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
                onPress={() => setEditTx(null)}
              >
                <Text style={[styles.actionText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  { backgroundColor: colors.tint, transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
                onPress={handleUpdate}
              >
                <Text style={[styles.actionText, { color: '#FFF' }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  intervalRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  intervalBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  intervalBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
  },
})
