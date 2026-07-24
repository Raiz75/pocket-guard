import { StyleSheet, Text, View, TextInput, useColorScheme } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/Colors'

export default function Profile() {
  const colorScheme = useColorScheme()
  const theme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = Colors[theme]

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
            <Ionicons name="person" size={32} color="#FFF" />
          </View>
          <View style={styles.avatarInfo}>
            <Text style={[styles.name, { color: colors.text }]}>Your Name</Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>your@email.com</Text>
          </View>
        </View>
      </View>

      <View style={[styles.fieldCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Name</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="Your name"
          placeholderTextColor={colors.tabInactive}
        />
      </View>

      <View style={[styles.fieldCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Email</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          placeholder="your@email.com"
          placeholderTextColor={colors.tabInactive}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 60,
    marginBottom: 24,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInfo: {
    gap: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  email: {
    fontSize: 14,
  },
  fieldCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
})
