import { useState } from 'react'
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, useColorScheme,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/Colors'
import { useApp } from '../../store/AppContext'
import { TransactionType, Category } from '../../types'

const typeLabel: Record<TransactionType, string> = { inflow: 'Income', outflow: 'Expenses' }

export default function CategoryScreen() {
  const colorScheme = useColorScheme()
  const theme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = Colors[theme]
  const { categories, addCategory } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<TransactionType>('outflow')

  const incomeCategories = categories.filter((c) => c.type === 'inflow')
  const expenseCategories = categories.filter((c) => c.type === 'outflow')

  const handleAdd = () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    const exists = categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.type === newType)
    if (exists) {
      Alert.alert('Duplicate', 'A category with this name already exists in the selected type.')
      return
    }
    addCategory({ id: Date.now().toString(), name: trimmed, type: newType })
    setNewName('')
    setShowModal(false)
  }

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={[styles.catItem, { borderBottomColor: colors.tabInactive + '30' }]}>
      <View style={[styles.catDot, { backgroundColor: item.type === 'inflow' ? '#16A34A' : '#DC2626' }]} />
      <Text style={[styles.catName, { color: colors.text }]}>{item.name}</Text>
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ListHeaderComponent={() => (
          <>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>
              <Ionicons name="arrow-down" size={14} color="#16A34A" /> Income
            </Text>
          </>
        )}
        data={incomeCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        ListFooterComponent={() => (
          <>
            <Text style={[styles.sectionHeader, { color: colors.text, marginTop: 24 }]}>
              <Ionicons name="arrow-up" size={14} color="#DC2626" /> Expenses
            </Text>
          </>
        )}
      />
      <FlatList
        data={expenseCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        scrollEnabled={false}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={[styles.handle, { backgroundColor: colors.tabInactive }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Category</Text>

            <View style={styles.segment}>
              <TouchableOpacity
                style={[styles.segmentBtn, newType === 'inflow' && { backgroundColor: '#16A34A' }]}
                onPress={() => setNewType('inflow')}
              >
                <Text style={[styles.segmentText, { color: newType === 'inflow' ? '#FFF' : colors.text }]}>Income</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, newType === 'outflow' && { backgroundColor: '#DC2626' }]}
                onPress={() => setNewType('outflow')}
              >
                <Text style={[styles.segmentText, { color: newType === 'outflow' ? '#FFF' : colors.text }]}>Expense</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.tabInactive }]}
              placeholder="Category name"
              placeholderTextColor={colors.tabInactive}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.tabInactive + '40' }]} onPress={() => setShowModal(false)}>
                <Text style={[styles.actionText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: newName.trim() ? colors.tint : colors.tabInactive }]}
                onPress={handleAdd}
                disabled={!newName.trim()}
              >
                <Text style={styles.actionText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    fontSize: 15,
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
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
  modalTitle: {
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
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
})
