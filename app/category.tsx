import { useState } from 'react'
import {
  StyleSheet, Text, View, Pressable,
  useColorScheme, ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/Colors'
import { useApp } from '../store/AppContext'
import AddCategoryModal from '../components/AddCategoryModal'
import { Category } from '../types'

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

  const incomeCategories = categories.filter((c) => c.type === 'inflow')
  const expenseCategories = categories.filter((c) => c.type === 'outflow')
  const allNames = categories.map((c) => c.name)

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

      <AddCategoryModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={(name, type) => addCategory({ id: Date.now().toString(), name, type })}
        existingNames={allNames}
      />

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
})
