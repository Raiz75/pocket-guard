import Drawer from 'expo-router/drawer'
import { useColorScheme } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AppProvider } from '../store/AppContext'
import { Colors } from '../constants/Colors'

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const theme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = Colors[theme]

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <Drawer
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerShadowVisible: false,
            drawerStyle: { backgroundColor: colors.surface, width: 260 },
            drawerActiveTintColor: colors.tint,
            drawerInactiveTintColor: colors.tabInactive,
            drawerActiveBackgroundColor: colors.tint + '15',
            drawerLabelStyle: { fontSize: 15, fontWeight: '600' },
            drawerItemStyle: { borderRadius: 10, marginHorizontal: 12 },
          }}
        >
          <Drawer.Screen
            name="index"
            options={{ drawerItemStyle: { display: 'none' }, headerShown: false }}
          />
          <Drawer.Screen
            name="home"
            options={{
              title: 'Home',
              drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
            }}
          />
          <Drawer.Screen
            name="recurring"
            options={{
              title: 'Recurring',
              drawerIcon: ({ color, size }) => <Ionicons name="repeat-outline" size={size} color={color} />,
            }}
          />
          <Drawer.Screen
            name="category"
            options={{
              title: 'Category',
              drawerIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
            }}
          />
          <Drawer.Screen
            name="profile"
            options={{
              title: 'Profile',
              drawerIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
            }}
          />
        </Drawer>
      </AppProvider>
    </GestureHandlerRootView>
  )
}
