### Task 2: Set Up Supabase Client & Auth

**Files:**
- Create: `lib/supabase.ts`
- Create: `store/AuthContext.tsx`
- Create: `app/auth.tsx`
- Modify: `app/_layout.tsx` (add AuthProvider)
- Modify: `app/(tabs)/profile.tsx` (wire auth UI)

**Interfaces:**
- Consumes: Database layer from Task 1
- Produces: `lib/supabase.ts` → `supabase` client instance, `store/AuthContext.tsx` → `useAuth()` hook, sign up/sign in/sign out functions

- [ ] **Step 1: Create `lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true },
})
```

- [ ] **Step 2: Create `.env` file with placeholder values**

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 3: Create `store/AuthContext.tsx`**

```tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { Session, User } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  user: User | null
  isGuest: boolean
  isLoading: boolean
  signUp: (email: string, password: string, name: string) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return error.message
    if (data.user) {
      await supabase.from('users').insert({ id: data.user.id, email, name })
    }
    return null
  }

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? error.message : null
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user, isGuest: !user, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

- [ ] **Step 4: Wrap root layout with AuthProvider in `app/_layout.tsx`**

```tsx
import { AuthProvider } from '../store/AuthContext'

// Inside GestureHandlerRootView, before AppProvider:
<AuthProvider>
  <AppProvider>
    <Drawer ... />
  </AppProvider>
</AuthProvider>
```

- [ ] **Step 5: Create `app/auth.tsx` - sign up / sign in screen**

```tsx
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
```

- [ ] **Step 6: Update Profile screen with auth UI**

In `app/(tabs)/profile.tsx`, import `useAuth` and show sign-in prompt when guest, user info + sign out when signed in.

- [ ] **Step 7: Update `app/index.tsx` to redirect to auth on first launch**

Check if no session → `/auth`, else `/home`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add Supabase auth with guest mode and sign up/sign in screen"
```

---

