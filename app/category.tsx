import { useState } from 'react'
import {
  StyleSheet, Text, View, Pressable,
  Modal, TextInput, Alert, useColorScheme,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/Colors'
import { useApp } from '../store/AppContext'
import { TransactionType, Category } from '../types'

function CategoryCard({ item, colors }: { item: Category; colors: any }) {
  return (
    <View style={[styles.catCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.catDot, { backgroundColor: item.type === 'inflow' ? colors.income + '20' : colors.expense + '20' }]}>
        <Ionicons
          name={item.type === 'inflow' ? 'arrow-down' : 'arrow-up'}
          size={16}
          color={item.type === 'inflow' ? colors.income : colors.expense}
        />
      </View>
      <Text style={[styles.catName, { color: colors.text }]}>{item.name}</Text>
    </View>
  )
}

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
      Alert.alert('Duplicate', 'A category with this name already exists.')
      return
    }
    addCategory({ id: Date.now().toString(), name: trimmed, type: newType })
    setNewName('')
    setShowModal(false)
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
        <Ionicons name="arrow-up" size={12} color={colors.income} /> Income
      </Text>
      <View style={styles.grid}>
        {incomeCategories.map((item) => (
          <CategoryCard key={item.id} item={item} colors={colors} />
        ))}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 24 }]}>
        <Ionicons name="arrow-down" size={12} color={colors.expense} /> Expenses
      </Text>
      <View style={styles.grid}>
        {expenseCategories.map((item) => (
          <CategoryCard key={item.id} item={item} colors={colors} />
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.tint, transform: [{ scale: pressed ? 0.93 : 1 }] },
        ]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </Pressable>

      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <Pressable style={styles.backdrop} onPress={() => setShowModal(false)} />
          <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Category</Text>

            <View style={[styles.segment, { backgroundColor: colors.background }]}>
              <Pressable
                style={({ pressed }) => [
                  styles.segmentBtn,
                  newType === 'inflow' && { backgroundColor: colors.income },
                  { transform: [{ scale: pressed ? 0.95 : 1 }] },
                ]}
                onPress={() => setNewType('inflow')}
              >
                <Text style={[styles.segmentText, { color: newType === 'inflow' ? '#FFF' : colors.textSecondary }]}>Income</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.segmentBtn,
                  newType === 'outflow' && { backgroundColor: colors.expense },
                  { transform: [{ scale: pressed ? 0.95 : 1 }] },
                ]}
                onPress={() => setNewType('outflow')}
              >
                <Text style={[styles.segmentText, { color: newType === 'outflow' ? '#FFF' : colors.textSecondary }]}>Expense</Text>
              </Pressable>
            </View>

            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
              placeholder="Category name"
              placeholderTextColor={colors.tabInactive}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  { backgroundColor: colors.border, transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
                onPress={() => setShowModal(false)}
              >
                <Text style={[styles.actionText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  { backgroundColor: newName.trim() ? colors.tint : colors.border, opacity: newName.trim() ? 1 : 0.6 },
                  { transform: [{ scale: pressed && newName.trim() ? 0.97 : 1 }] },
                ]}
                onPress={handleAdd}
                disabled={!newName.trim()}
              >
                <Text style={[styles.actionText, { color: '#FFF' }]}>Add</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <View style={{ height: 100 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    minWidth: 120,
  },
  catDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catName: {
    fontSize: 15,
    fontWeight: '600',
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
  segment: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
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
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 24,
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
