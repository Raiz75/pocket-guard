import { StyleSheet, Text, View, TextInput, useColorScheme } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/Colors'

export default function Profile() {
  const colorScheme = useColorScheme()
  const theme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = Colors[theme]

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={48} color="#FFF" />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.tabInactive }]}>Name</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.tabInactive + '50' }]}
          placeholder="Your name"
          placeholderTextColor={colors.tabInactive}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.tabInactive }]}>Email</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.tabInactive + '50' }]}
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
    padding: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0891B2',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
})
