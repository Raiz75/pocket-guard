import { useState } from 'react'
import {
  StyleSheet, Text, View, FlatList, Pressable, Modal, TextInput,
  Alert, useColorScheme, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/Colors'
import { useApp } from '../store/AppContext'
import { Transaction, TransactionType, RecurringInterval, Category } from '../types'

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
  const [editType, setEditType] = useState<TransactionType>('outflow')
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editNote, setEditNote] = useState('')
  const [editRecurring, setEditRecurring] = useState<RecurringInterval | null>(null)
  const [showCatDropdown, setShowCatDropdown] = useState(false)

  const openEdit = (tx: Transaction) => {
    setEditTx(tx)
    setEditType(tx.type)
    setEditAmount(tx.amount.toString())
    setEditCategory(tx.category)
    setEditNote(tx.note)
    setEditRecurring(tx.recurring)
  }

  const filteredCategories = categories.filter((c) => c.type === editType)

  const handleUpdate = () => {
    if (!editTx) return
    const parsed = parseFloat(editAmount)
    if (!parsed || parsed <= 0 || !editCategory) return
    updateTransaction({
      ...editTx,
      type: editType,
      amount: parsed,
      category: editCategory,
      note: editNote,
      recurring: editRecurring,
    })
    setEditTx(null)
  }

  const handleDelete = (id: string) => {
    Alert.alert('Delete Recurring', 'Remove this recurring transaction?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(id) },
    ])
  }

  const canSave = parseFloat(editAmount) > 0 && editCategory.length > 0

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Pressable
        style={styles.cardBody}
        onPress={() => openEdit(item)}
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
        onPress={() => handleDelete(item.id)}
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

      <Modal visible={editTx !== null} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <Pressable style={styles.backdrop} onPress={() => setEditTx(null)} />
          <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <View style={styles.editBtnRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.editOverlapBtn,
                  { backgroundColor: canSave ? colors.tint : colors.border, opacity: canSave ? 1 : 0.6 },
                  { transform: [{ scale: pressed && canSave ? 0.93 : 1 }] },
                ]}
                onPress={handleUpdate}
                disabled={!canSave}
              >
                <Ionicons name="checkmark" size={22} color="#FFF" />
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.editOverlapBtn,
                  { backgroundColor: colors.expense, transform: [{ scale: pressed ? 0.93 : 1 }] },
                ]}
                onPress={() => editTx && handleDelete(editTx.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FFF" />
              </Pressable>
            </View>

            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Recurring</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.segment, { backgroundColor: colors.background }]}>
                <Pressable
                  style={({ pressed }) => [
                    styles.segmentBtn,
                    editType === 'inflow' && { backgroundColor: colors.income },
                    { transform: [{ scale: pressed ? 0.95 : 1 }] },
                  ]}
                  onPress={() => { setEditType('inflow'); setEditCategory('') }}
                >
                  <Text style={[styles.segmentText, { color: editType === 'inflow' ? '#FFF' : colors.textSecondary }]}>Inflow</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.segmentBtn,
                    editType === 'outflow' && { backgroundColor: colors.expense },
                    { transform: [{ scale: pressed ? 0.95 : 1 }] },
                  ]}
                  onPress={() => { setEditType('outflow'); setEditCategory('') }}
                >
                  <Text style={[styles.segmentText, { color: editType === 'outflow' ? '#FFF' : colors.textSecondary }]}>Outflow</Text>
                </Pressable>
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Amount</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                keyboardType="decimal-pad"
                value={editAmount}
                onChangeText={setEditAmount}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
              <Pressable
                style={[styles.input, styles.picker, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setShowCatDropdown(true)}
              >
                <Text style={{ color: editCategory ? colors.text : colors.tabInactive, fontSize: 16 }}>
                  {editCategory || 'Select category'}
                </Text>
                <Text style={{ color: colors.tabInactive, fontSize: 12 }}>▼</Text>
              </Pressable>

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
                <Pressable
                  style={({ pressed }) => [
                    styles.intervalBtn,
                    editRecurring === null && { backgroundColor: colors.tint },
                    { transform: [{ scale: pressed ? 0.95 : 1 }] },
                  ]}
                  onPress={() => setEditRecurring(null)}
                >
                  <Text style={[styles.intervalBtnText, { color: editRecurring === null ? '#FFF' : colors.textSecondary }]}>None</Text>
                </Pressable>
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
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showCatDropdown} transparent animationType="fade">
        <Pressable style={styles.dropOverlay} onPress={() => setShowCatDropdown(false)}>
          <View style={[styles.dropList, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dropTitle, { color: colors.text }]}>Select Category</Text>
            {filteredCategories.map((item: Category) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.dropItem,
                  { backgroundColor: pressed ? colors.background : 'transparent' },
                ]}
                onPress={() => { setEditCategory(item.name); setShowCatDropdown(false) }}
              >
                <Text style={[styles.dropItemText, { color: colors.text, fontWeight: editCategory === item.name ? '700' : '500' }]}>
                  {item.name}
                </Text>
                {editCategory === item.name && <Ionicons name="checkmark" size={18} color={colors.tint} />}
              </Pressable>
            ))}
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    maxHeight: '80%',
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
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
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  editBtnRow: {
    position: 'absolute',
    top: -24,
    right: 24,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  editOverlapBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  dropOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dropList: {
    width: '80%',
    maxHeight: 360,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dropTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  dropItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  dropItemText: {
    fontSize: 16,
  },
})
