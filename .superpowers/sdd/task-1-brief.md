### Task 1: Initialize Expo Project & Scaffold Structure

**Files:**
- Create: `app/index.tsx`
- Create: `constants/Colors.ts`
- Create: `components/` (empty folder)
- Modify: `app.json` (update name/scheme)
- Scaffolded by CLI: `tsconfig.json`, `package.json`, `babel.config.js`, `expo-env.d.ts`, `.gitignore`, `App.tsx` (unused, we use Expo Router)

**Interfaces:**
- Consumes: Nothing
- Produces: App entry point via `app/index.tsx`, theme tokens in `constants/Colors.ts`

- [ ] **Step 1: Initialize Expo project in current directory**

```bash
# From pocket-guard/ directory
npx create-expo-app@latest . --template blank-typescript
```

Expected: Expo project scaffolded with TypeScript template. Confirm `package.json`, `tsconfig.json`, `app.json` exist.

- [ ] **Step 2: Remove unused App.tsx entry point**

Expo Router uses `app/` directory instead.

```bash
Remove-Item -LiteralPath "App.tsx" -ErrorAction SilentlyContinue
```

- [ ] **Step 3: Create constants/Colors.ts with theme tokens**

```ts
export const Colors = {
  light: {
    background: '#FFFFFF',
    text: '#1A1A1A',
  },
  dark: {
    background: '#121212',
    text: '#F0F0F0',
  },
}
```

- [ ] **Step 4: Create app/index.tsx**

```tsx
import { StyleSheet, Text, View, useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors'

export default function Index() {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>hello am an app</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
  },
})
```

- [ ] **Step 5: Update app.json with correct app name and scheme**

In `app.json`, ensure:
- `"name"` is `"pocket-guard"`
- `"displayName"` is `"Pocket Guard"`
- `"scheme"` is `"pocket-guard"`

- [ ] **Step 6: Verify the app builds successfully**

```bash
npx expo export --platform web --output-dir dist-test
if ($?) { Remove-Item -Recurse -Force "dist-test" }
```

Expected: Build succeeds with no errors.

- [ ] **Step 7: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Expo app with home screen"
```
