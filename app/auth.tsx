import { useState } from 'react'
import { StyleSheet, Text, View, TextInput, Pressable, Alert, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../constants/Colors'
import { useAuth } from '../store/AuthContext'

export default function AuthScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = Colors[theme]
  const { signUp, signIn } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    const error = isSignUp ? await signUp(email, password, name) : await signIn(email, password)
    setLoading(false)
    if (error) { Alert.alert('Error', error); return }
    router.replace('/home')
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sync your data across devices</Text>
      {isSignUp && (
        <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} placeholder="Name" placeholderTextColor={colors.tabInactive} value={name} onChangeText={setName} />
      )}
      <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} placeholder="Email" placeholderTextColor={colors.tabInactive} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} placeholder="Password" placeholderTextColor={colors.tabInactive} value={password} onChangeText={setPassword} secureTextEntry />
      <Pressable style={[styles.btn, { backgroundColor: colors.tint, opacity: loading ? 0.6 : 1 }]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}</Text>
      </Pressable>
      <Pressable onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={[styles.switch, { color: colors.tint }]}>{isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}</Text>
      </Pressable>
      <Pressable onPress={() => router.replace('/home')}>
        <Text style={[styles.skip, { color: colors.textSecondary }]}>Continue as Guest</Text>
      </Pressable>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 32 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16 },
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  switch: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  skip: { fontSize: 14, textAlign: 'center' },
})
