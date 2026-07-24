import { useState } from 'react'
import {
  Modal, View, Text, TextInput, Pressable, FlatList,
  StyleSheet, useColorScheme, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS,
} from 'react-native-reanimated'
import { Colors } from '../constants/Colors'
import { TransactionType, Category } from '../types'

const SNAP_THRESHOLD = 120
const VELOCITY_THRESHOLD = 300

interface Props {
  visible: boolean
  onClose: () => void
  onSave: (data: { type: TransactionType; amount: number; category: string; note: string }) => void
  categories: Category[]
}

function AnimatedSheet({
  children, colors, onClose,
}: {
  children: React.ReactNode
  colors: any
  onClose: () => void
}) {
  const translateY = useSharedValue(0)

  const panGesture = Gesture.Pan()
    .activeOffsetY(10)
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY)
    })
    .onEnd((e) => {
      if (e.translationY > SNAP_THRESHOLD || e.velocityY > VELOCITY_THRESHOLD) {
        runOnJS(onClose)()
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 })
      }
    })

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(1 - translateY.value / 600, { duration: 0 }),
  }))

  return (
    <>
      <Animated.View style={[styles.backdropAnimated, overlayStyle]}>
        <Pressable style={styles.backdropPress} onPress={onClose} />
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, { backgroundColor: colors.surface }, sheetStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </>
  )
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

  const content = (
    <>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <Text style={[styles.title, { color: colors.text }]}>New Transaction</Text>

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
        placeholder="0.00"
        placeholderTextColor={colors.tabInactive}
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
      <Pressable
        style={[styles.input, styles.picker, { backgroundColor: colors.background, borderColor: colors.border }]}
        onPress={() => setShowDropdown(true)}
      >
        <Text style={{ color: category ? colors.text : colors.tabInactive, fontSize: 16 }}>
          {category || 'Select category'}
        </Text>
        <Text style={{ color: colors.tabInactive, fontSize: 12 }}>▼</Text>
      </Pressable>

      <Text style={[styles.label, { color: colors.textSecondary }]}>Note</Text>
      <TextInput
        style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
        placeholder="Optional note"
        placeholderTextColor={colors.tabInactive}
        value={note}
        onChangeText={setNote}
      />

      <Pressable
        style={({ pressed }) => [
          styles.saveBtn,
          { backgroundColor: canSave ? colors.tint : colors.border, opacity: canSave ? 1 : 0.7 },
          { transform: [{ scale: pressed && canSave ? 0.97 : 1 }] },
        ]}
        onPress={handleSave}
        disabled={!canSave}
      >
        <Text style={[styles.saveText, { color: canSave ? '#FFF' : colors.textSecondary }]}>Add Transaction</Text>
      </Pressable>
    </>
  )

  return (
    <>
      <Modal visible={visible} animationType="none" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
          <AnimatedSheet colors={colors} onClose={onClose}>
            {content}
          </AnimatedSheet>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showDropdown} transparent animationType="fade">
        <Pressable style={styles.dropOverlay} onPress={() => setShowDropdown(false)}>
          <View style={[styles.dropList, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dropTitle, { color: colors.text }]}>Select {type === 'inflow' ? 'Income' : 'Expense'} Category</Text>
            <FlatList
              data={filteredCategories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.dropItem,
                    { backgroundColor: pressed ? colors.background : 'transparent' },
                  ]}
                  onPress={() => { setCategory(item.name); setShowDropdown(false) }}
                >
                  <Text style={[styles.dropItemText, { color: colors.text }]}>{item.name}</Text>
                </Pressable>
              )}
            />
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
  backdropAnimated: {
    ...StyleSheet.absoluteFill,
  },
  backdropPress: {
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
  title: {
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
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveText: {
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
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  dropItemText: {
    fontSize: 16,
  },
})
