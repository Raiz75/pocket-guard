import { Redirect } from 'expo-router'
import { useAuth } from '../store/AuthContext'
import { Text, View, ActivityIndicator, useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors'

export default function Index() {
  const { session, isLoading } = useAuth()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light']

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    )
  }

  if (!session) return <Redirect href="/auth" />
  return <Redirect href="/home" />
}
