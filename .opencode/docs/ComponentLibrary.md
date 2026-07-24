# Component Library

## Modal Components

All modals use the same pattern:
- **AnimatedSheet** — wraps content in a swipe-to-dismiss bottom sheet (GestureDetector + Reanimated)
- **Overlapping save button** — positioned at top-right, half inside/half outside the sheet edge
- **Backdrop** — tappable to dismiss, fades with drag

| Component | Purpose | Active State |
|-----------|---------|-------------|
| `AddTransactionModal` | Add a new transaction (inflow/outflow, amount, category, note, recurring) | Amount > 0 + category selected |
| `AddCategoryModal` | Add a new category (income/expense toggle, name input) | Name not empty + not duplicate |
| `EditTransactionModal` | Edit or delete an existing transaction | Amount > 0 + category selected |

## Screen Components

### Dashboard (`app/home.tsx`)
- Balance card with total balance + monthly income/expenses
- Month filter (All Months or specific month)
- Transaction list with pull-to-refresh
- FAB (+) to add transaction
- EditTransactionModal opens on transaction tap

### Category (`app/category.tsx`)
- Two grids: Income categories (arrow-up icon) and Expense categories (arrow-down icon)
- FAB (+) to add category
- Each category shown as a rounded card with type-colored icon

### Recurring (`app/recurring.tsx`)
- Lists transactions where `recurring !== null`
- Each item shows: repeat icon, category, interval, amount
- Tap to edit in EditTransactionModal
- Trash icon to delete (with confirmation)

### Profile (`app/profile.tsx`)
- Guest: shows "Sign In" button linking to /auth
- Signed in: shows user email/name + "Sign Out" button
- Name and email fields (static placeholders for now)

## Shared Patterns

- **Colors:** accessed via `Colors[theme]` where theme is 'light' | 'dark'
- **Theme:** detected with `useColorScheme()`, derived at component top
- **Pressable feedback:** all buttons use `({ pressed }) => [styles.btn, { transform: [{ scale: pressed ? 0.97 : 1 }] }]`
- **FAB:** absolute positioned at `bottom: 24, right: 24`, 56x56 circle with elevation shadow
