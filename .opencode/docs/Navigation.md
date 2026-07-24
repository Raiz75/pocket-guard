# Navigation

Uses **Expo Router** with file-based routing and a **Drawer** (hamburger menu) navigator.

## Route Structure

```
app/
├── _layout.tsx      ← Drawer layout (wraps all routes)
├── index.tsx        ← Entry point (session check → /auth or /home)
├── auth.tsx         ← Sign up / Sign in screen
├── home.tsx         ← Dashboard (balance + transactions)
├── category.tsx     ← Manage income/expense categories
├── recurring.tsx    ← View/edit recurring transactions
└── profile.tsx      ← User profile (guest prompt or account info)
```

## Drawer Items

| Screen | Icon | Description |
|--------|------|-------------|
| Home | home-outline | Dashboard with balance, filter, transactions |
| Recurring | repeat-outline | Recurring transaction list |
| Category | grid-outline | Category management |
| Profile | person-outline | Auth & profile info |
| auth (hidden) | — | Sign up/sign in (hidden from drawer) |
| index (hidden) | — | Session redirect (hidden from drawer) |

## Auth Flow

```
App Launch → index.tsx
  ├─ No session → Redirect to /auth
  │   ├─ Sign Up → creates Supabase auth + user row
  │   ├─ Sign In → validates credentials
  │   └─ Continue as Guest → goes to /home with local-only data
  └─ Has session → Redirect to /home
```

## Adding a New Screen

1. Create a file in `app/` (e.g., `app/reports.tsx`)
2. Add a `Drawer.Screen` entry in `app/_layout.tsx` with title and icon
3. Optionally hide it from drawer with `drawerItemStyle: { display: 'none' }`
