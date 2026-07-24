import { StyleSheet, Text, View, TextInput, Pressable, useColorScheme, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors } from '../constants/Colors'
import { useAuth } from '../store/AuthContext'

export default function Profile() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const theme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = Colors[theme]
  const { user, isGuest, signOut } = useAuth()

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ])
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isGuest ? (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: colors.tabInactive }]}>
              <Ionicons name="person-outline" size={32} color="#FFF" />
            </View>
            <View style={styles.avatarInfo}>
              <Text style={[styles.name, { color: colors.text }]}>Guest</Text>
              <Text style={[styles.email, { color: colors.textSecondary }]}>Sign in to sync your data</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.signInBtn,
              { backgroundColor: colors.tint, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
            onPress={() => router.push('/auth')}
          >
            <Ionicons name="log-in-outline" size={18} color="#FFF" />
            <Text style={styles.signInBtnText}>Sign In</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
              <Ionicons name="person" size={32} color="#FFF" />
            </View>
            <View style={styles.avatarInfo}>
              <Text style={[styles.name, { color: colors.text }]}>{user?.user_metadata?.name || 'User'}</Text>
              <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.signOutBtn,
              { borderColor: colors.border, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.expense} />
            <Text style={[styles.signOutBtnText, { color: colors.expense }]}>Sign Out</Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.fieldCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Name</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="Your name"
          placeholderTextColor={colors.tabInactive}
        />
      </View>

      <View style={[styles.fieldCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Email</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
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
    padding: 16,
    paddingTop: 16,
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
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 16,
  },
  signInBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 16,
    borderWidth: 1,
  },
  signOutBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
})
