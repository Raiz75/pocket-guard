import { useState } from 'react'
import {
  Modal, View, Text, TextInput, Pressable,
  StyleSheet, useColorScheme, KeyboardAvoidingView, Platform,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/Colors'
import { TransactionType } from '../types'

const SNAP_THRESHOLD = 120
const VELOCITY_THRESHOLD = 300

interface Props {
  visible: boolean
  onClose: () => void
  onSave: (name: string, type: TransactionType) => void
  existingNames: string[]
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

export default function AddCategoryModal({ visible, onClose, onSave, existingNames }: Props) {
  const colorScheme = useColorScheme()
  const theme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = Colors[theme]

  const [type, setType] = useState<TransactionType>('outflow')
  const [name, setName] = useState('')

  const trimmed = name.trim()
  const exists = existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase() && type === type)
  const canSave = trimmed.length > 0 && !exists

  const handleSave = () => {
    if (!canSave) return
    onSave(trimmed, type)
    setName('')
    setType('outflow')
    onClose()
  }

  return (
    <Modal visible={visible} animationType="none" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <AnimatedSheet colors={colors} onClose={onClose}>
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

          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.title, { color: colors.text }]}>Add Category</Text>

          <View style={[styles.segment, { backgroundColor: colors.background }]}>
            <Pressable
              style={({ pressed }) => [
                styles.segmentBtn,
                type === 'inflow' && { backgroundColor: colors.income },
                { transform: [{ scale: pressed ? 0.95 : 1 }] },
              ]}
              onPress={() => setType('inflow')}
            >
              <Text style={[styles.segmentText, { color: type === 'inflow' ? '#FFF' : colors.textSecondary }]}>Income</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.segmentBtn,
                type === 'outflow' && { backgroundColor: colors.expense },
                { transform: [{ scale: pressed ? 0.95 : 1 }] },
              ]}
              onPress={() => setType('outflow')}
            >
              <Text style={[styles.segmentText, { color: type === 'outflow' ? '#FFF' : colors.textSecondary }]}>Expense</Text>
            </Pressable>
          </View>

          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
            placeholder="Category name"
            placeholderTextColor={colors.tabInactive}
            value={name}
            onChangeText={setName}
            autoFocus
          />
          {exists && (
            <Text style={[styles.error, { color: colors.expense }]}>This category already exists</Text>
          )}
        </AnimatedSheet>
      </KeyboardAvoidingView>
    </Modal>
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
  overlapBtn: {
    position: 'absolute',
    top: -24,
    right: 24,
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
    zIndex: 10,
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
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  error: {
    fontSize: 13,
    fontWeight: '500',
  },
})
