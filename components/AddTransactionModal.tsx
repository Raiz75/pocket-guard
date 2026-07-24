import { useState } from 'react'
import {
  Modal, View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, useColorScheme, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Colors } from '../constants/Colors'
import { TransactionType, Category } from '../types'

interface Props {
  visible: boolean
  onClose: () => void
  onSave: (data: { type: TransactionType; amount: number; category: string; note: string }) => void
  categories: Category[]
}

export default function AddTransactionModal({ visible, onClose, onSave, categories }: Props) {
  const colorScheme = useColorScheme()
  const theme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = Colors[theme]

  const [type, setType] = useState<TransactionType>('outflow')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const filteredCategories = categories.filter((c) => c.type === type)

  const handleSave = () => {
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0 || !category) return
    onSave({ type, amount: parsed, category, note })
    setAmount('')
    setCategory('')
    setNote('')
    setType('outflow')
    onClose()
  }

  const canSave = parseFloat(amount) > 0 && category.length > 0

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={[styles.handle, { backgroundColor: colors.tabInactive }]} />
          <Text style={[styles.title, { color: colors.text }]}>New Transaction</Text>

          <View style={styles.segment}>
            <TouchableOpacity
              style={[styles.segmentBtn, type === 'inflow' && { backgroundColor: '#16A34A' }]}
              onPress={() => { setType('inflow'); setCategory('') }}
            >
              <Text style={[styles.segmentText, { color: type === 'inflow' ? '#FFF' : colors.text }]}>Inflow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, type === 'outflow' && { backgroundColor: '#DC2626' }]}
              onPress={() => { setType('outflow'); setCategory('') }}
            >
              <Text style={[styles.segmentText, { color: type === 'outflow' ? '#FFF' : colors.text }]}>Outflow</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.tabInactive }]}
            placeholder="0.00"
            placeholderTextColor={colors.tabInactive}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={[styles.label, { color: colors.text }]}>Category</Text>
          <TouchableOpacity
            style={[styles.input, styles.picker, { borderColor: colors.tabInactive }]}
            onPress={() => setShowDropdown(true)}
          >
            <Text style={[{ color: category ? colors.text : colors.tabInactive }]}>
              {category || 'Select category'}
            </Text>
            <Text style={{ color: colors.tabInactive }}>▼</Text>
          </TouchableOpacity>

          <Text style={[styles.label, { color: colors.text }]}>Note</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.tabInactive }]}
            placeholder="Optional note"
            placeholderTextColor={colors.tabInactive}
            value={note}
            onChangeText={setNote}
          />

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: canSave ? colors.tint : colors.tabInactive }]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showDropdown} transparent animationType="fade">
        <TouchableOpacity style={styles.dropOverlay} onPress={() => setShowDropdown(false)} activeOpacity={1}>
          <View style={[styles.dropList, { backgroundColor: colors.background }]}>
            <FlatList
              data={filteredCategories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropItem}
                  onPress={() => { setCategory(item.name); setShowDropdown(false) }}
                >
                  <Text style={[styles.dropItemText, { color: colors.text }]}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  saveText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  dropOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dropList: {
    width: '75%',
    maxHeight: 300,
    borderRadius: 14,
    overflow: 'hidden',
  },
  dropItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  dropItemText: {
    fontSize: 16,
  },
})
