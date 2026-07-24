import { useState, useEffect } from 'react'
import {
  Modal, View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, useColorScheme, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/Colors'
import { Transaction, TransactionType, RecurringInterval, Category } from '../types'

interface Props {
  visible: boolean
  transaction: Transaction | null
  categories: Category[]
  onClose: () => void
  onSave: (updated: Transaction) => void
  onDelete: (id: string) => void
}

const INTERVAL_OPTIONS: { label: string; value: RecurringInterval | null }[] = [
  { label: 'None', value: null },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
]

export default function EditTransactionModal({ visible, transaction, categories, onClose, onSave, onDelete }: Props) {
  const colorScheme = useColorScheme()
  const theme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = Colors[theme]

  const [type, setType] = useState<TransactionType>('outflow')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [recurring, setRecurring] = useState<RecurringInterval | null>(null)
  const [showCatDropdown, setShowCatDropdown] = useState(false)

  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setAmount(transaction.amount.toString())
      setCategory(transaction.category)
      setNote(transaction.note)
      setRecurring(transaction.recurring)
    }
  }, [transaction])

  const filteredCategories = categories.filter((c) => c.type === type)
  const canSave = parseFloat(amount) > 0 && category.length > 0

  const handleSave = () => {
    if (!transaction) return
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0 || !category) return
    onSave({
      ...transaction,
      type,
      amount: parsed,
      category,
      note,
      recurring,
    })
  }

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={onClose} />
          <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <View style={styles.btnRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.overlapBtn,
                  { backgroundColor: canSave ? colors.tint : colors.border, opacity: canSave ? 1 : 0.6 },
                  { transform: [{ scale: pressed && canSave ? 0.93 : 1 }] },
                ]}
                onPress={handleSave}
                disabled={!canSave}
              >
                <Ionicons name="checkmark" size={22} color="#FFF" />
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.overlapBtn,
                  { backgroundColor: colors.expense, transform: [{ scale: pressed ? 0.93 : 1 }] },
                ]}
                onPress={() => transaction && onDelete(transaction.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FFF" />
              </Pressable>
            </View>

            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.title, { color: colors.text }]}>Edit Transaction</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.segment, { backgroundColor: colors.background }]}>
                <Pressable
                  style={({ pressed }) => [
                    styles.segmentBtn,
                    type === 'inflow' && { backgroundColor: colors.income },
                    { transform: [{ scale: pressed ? 0.95 : 1 }] },
                  ]}
                  onPress={() => { setType('inflow'); setCategory('') }}
                >
                  <Text style={[styles.segmentText, { color: type === 'inflow' ? '#FFF' : colors.textSecondary }]}>Inflow</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.segmentBtn,
                    type === 'outflow' && { backgroundColor: colors.expense },
                    { transform: [{ scale: pressed ? 0.95 : 1 }] },
                  ]}
                  onPress={() => { setType('outflow'); setCategory('') }}
                >
                  <Text style={[styles.segmentText, { color: type === 'outflow' ? '#FFF' : colors.textSecondary }]}>Outflow</Text>
                </Pressable>
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Amount</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
              <Pressable
                style={[styles.input, styles.picker, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setShowCatDropdown(true)}
              >
                <Text style={{ color: category ? colors.text : colors.tabInactive, fontSize: 16 }}>
                  {category || 'Select category'}
                </Text>
                <Text style={{ color: colors.tabInactive, fontSize: 12 }}>▼</Text>
              </Pressable>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Note</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                value={note}
                onChangeText={setNote}
                placeholder="Optional note"
                placeholderTextColor={colors.tabInactive}
              />

              <Text style={[styles.label, { color: colors.textSecondary }]}>Recurring</Text>
              <View style={[styles.intervalRow, { backgroundColor: colors.background }]}>
                {INTERVAL_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.label}
                    style={({ pressed }) => [
                      styles.intervalBtn,
                      recurring === opt.value && { backgroundColor: colors.tint },
                      { transform: [{ scale: pressed ? 0.95 : 1 }] },
                    ]}
                    onPress={() => setRecurring(opt.value)}
                  >
                    <Text style={[styles.intervalBtnText, { color: recurring === opt.value ? '#FFF' : colors.textSecondary }]}>
                      {opt.label}
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
            {filteredCategories.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.dropItem,
                  { backgroundColor: pressed ? colors.background : 'transparent' },
                ]}
                onPress={() => { setCategory(item.name); setShowCatDropdown(false) }}
              >
                <Text style={[styles.dropItemText, { color: colors.text, fontWeight: category === item.name ? '700' : '500' }]}>
                  {item.name}
                </Text>
                {category === item.name && <Ionicons name="checkmark" size={18} color={colors.tint} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  overlay: {
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
  btnRow: {
    position: 'absolute',
    top: -24,
    right: 24,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  overlapBtn: {
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
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
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
    fontSize: 12,
    fontWeight: '600',
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
