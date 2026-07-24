import { useState, useEffect } from 'react'
import {
  Modal, View, Text, TextInput, Pressable, FlatList,
  StyleSheet, useColorScheme, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolateColor, interpolate, runOnJS,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/Colors'
import { TransactionType, Category, RecurringInterval } from '../types'

const SNAP_THRESHOLD = 120
const VELOCITY_THRESHOLD = 300

const INTERVALS: { label: string; value: RecurringInterval }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
]

interface Props {
  visible: boolean
  onClose: () => void
  onSave: (data: { type: TransactionType; amount: number; category: string; note: string; recurring: RecurringInterval | null }) => void
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
  const [recurring, setRecurring] = useState<RecurringInterval | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showRecurringDropdown, setShowRecurringDropdown] = useState(false)

  const filteredCategories = categories.filter((c) => c.type === type)

  const handleSave = () => {
    const parsed = parseFloat(amount)
    if (!parsed || parsed <= 0 || !category) return
    onSave({ type, amount: parsed, category, note, recurring })
    setAmount('')
    setCategory('')
    setNote('')
    setType('outflow')
    setRecurring(null)
    onClose()
  }

  const canSave = parseFloat(amount) > 0 && category.length > 0

  const saveProgress = useSharedValue(0)

  useEffect(() => {
    if (canSave) {
      saveProgress.value = withSpring(1, { damping: 14, stiffness: 150 })
    } else {
      saveProgress.value = withTiming(0, { duration: 250 })
    }
  }, [canSave])

  const saveAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      saveProgress.value,
      [0, 1],
      [colors.border, colors.tint]
    ),
    opacity: interpolate(saveProgress.value, [0, 1], [0.6, 1]),
    transform: [{ scale: interpolate(saveProgress.value, [0, 1], [1, 1.06]) }],
  }))

  const formFields = (
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

      <Text style={[styles.label, { color: colors.textSecondary }]}>Recurring</Text>
      <View style={[styles.segmentSm, { backgroundColor: colors.background }]}>
        <Pressable
          style={({ pressed }) => [
            styles.segmentBtnSm,
            !recurring && { backgroundColor: colors.tint },
            { transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}
          onPress={() => setRecurring(null)}
        >
          <Text style={[styles.segmentTextSm, { color: !recurring ? '#FFF' : colors.textSecondary }]}>None</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.segmentBtnSm,
            { transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}
          onPress={() => setShowRecurringDropdown(true)}
        >
          <Text style={[styles.segmentTextSm, { color: recurring ? colors.tint : colors.textSecondary }]}>
            {recurring ? recurring.charAt(0).toUpperCase() + recurring.slice(1) : 'Set interval'}
          </Text>
        </Pressable>
      </View>
    </>
  )

  return (
    <>
      <Modal visible={visible} animationType="none" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
          <AnimatedSheet colors={colors} onClose={onClose}>
            <View style={styles.sheetContent}>
              <Animated.View style={[styles.overlapBtn, saveAnimatedStyle]}>
                <Pressable
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                  onPress={handleSave}
                  disabled={!canSave}
                >
                  <Ionicons name="checkmark" size={28} color="#FFF" />
                </Pressable>
              </Animated.View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {formFields}
              </ScrollView>
            </View>
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

      <Modal visible={showRecurringDropdown} transparent animationType="fade">
        <Pressable style={styles.dropOverlay} onPress={() => setShowRecurringDropdown(false)}>
          <View style={[styles.dropList, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dropTitle, { color: colors.text }]}>Recurring Interval</Text>
            {INTERVALS.map((item) => (
              <Pressable
                key={item.value}
                style={({ pressed }) => [
                  styles.dropItem,
                  { backgroundColor: pressed ? colors.background : 'transparent' },
                ]}
                onPress={() => { setRecurring(item.value); setShowRecurringDropdown(false) }}
              >
                <Text style={[styles.dropItemText, { color: colors.text, fontWeight: recurring === item.value ? '700' : '500' }]}>
                  {item.label}
                </Text>
                {recurring === item.value && (
                  <Text style={{ color: colors.tint, fontSize: 14 }}>✓</Text>
                )}
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
  backdropAnimated: {
    ...StyleSheet.absoluteFill,
  },
  backdropPress: {
    flex: 1,
  },
  sheet: {
    maxHeight: '85%',
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
  segmentSm: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  segmentBtnSm: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentTextSm: {
    fontSize: 14,
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
  sheetContent: {
    position: 'relative',
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
  overlapBtn: {
    position: 'absolute',
    top: -45,
    right: 24,
    width: 75,
    height: 75,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 10,
  },
  dropItemText: {
    fontSize: 16,
  },
})
