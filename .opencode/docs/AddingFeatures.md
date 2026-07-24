# Adding New Features

## Adding a New Screen

1. Create file `app/your-screen.tsx`
2. Export a default component
3. Add drawer entry in `app/_layout.tsx`:
   ```tsx
   <Drawer.Screen
     name="your-screen"
     options={{
       title: 'Your Screen',
       drawerIcon: ({ color, size }) => <Ionicons name="icon-name" size={size} color={color} />,
     }}
   />
   ```

## Adding a New Data Entity

1. Define type in `types/index.ts`
2. Create CRUD functions in `db/your-entity.ts`
3. Add table creation SQL to `db/database.ts` initDatabase()
4. Add matching table to `db.sql` for Supabase
5. Expose CRUD from `store/AppContext.tsx`
6. If cloud-sync needed, add push/pull logic to `lib/sync.ts` and realtime handling to `lib/realtime.ts`

## Adding a New Recurring Interval

Append to the list in:
- `types/index.ts` — `RecurringInterval` type
- `components/AddTransactionModal.tsx` — `INTERVALS` constant
- `components/EditTransactionModal.tsx` — `INTERVAL_OPTIONS` constant
- `db/database.ts` — SQL CHECK constraint on `recurring` column

## Styling

- Colors are defined in `constants/Colors.ts` (light + dark themes)
- Always use `useColorScheme()` and derive `colors = Colors[theme]`
- Press feedback: wrap interactive elements in `Pressable` with scale transform
- Use the `surface` color for cards, `background` for page backgrounds

## Environment Variables

Create a `.env` file in the project root:
```
EXPO_PUBLIC_YOUR_KEY=value
```

Expo automatically loads `EXPO_PUBLIC_*` vars. Access via `process.env.EXPO_PUBLIC_YOUR_KEY`.

## Migration: Adding a SQLite Column

SQLite does not support `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`. Use:
```ts
await db.execAsync("ALTER TABLE transactions ADD COLUMN new_column TEXT DEFAULT ''")
```
Wrap in a try-catch — it will throw if column already exists on re-runs.

For Supabase, add the column in the SQL Editor and the sync will handle it.
