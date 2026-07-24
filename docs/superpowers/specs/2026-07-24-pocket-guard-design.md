# Pocket Guard — Mobile App Design

## Overview
A cross-platform mobile app (Android + iOS) built with React Native (Expo) that displays "hello am an app". Designed for extensibility — additional features will be added in future iterations.

## Tech Stack
- **Framework:** React Native with Expo SDK (managed workflow)
- **Language:** TypeScript
- **Routing:** Expo Router (file-based routing) — scales to tabs, stacks, modals
- **Theme:** System-based (auto light/dark via `useColorScheme`)

## Folder Structure
```
pocket-guard/
├── app/                  # Expo Router pages
│   └── index.tsx         # Home screen — renders "hello am an app"
├── components/           # Reusable UI components (future)
├── constants/            # Colors, spacing, typography tokens
│   └── Colors.ts
├── app.json              # Expo configuration
└── tsconfig.json
```

## Screens & Navigation

### Home Screen (`app/index.tsx`)
- Centered text: "hello am an app"
- Clean, minimal layout
- No navigation yet — single screen placeholder for future routes

## Design Decisions
- **Structured over minimal** — separate `components/` and `constants/` folders anticipate future screens and shared UI without over-engineering today.
- **Expo Router** — file-based routing reduces boilerplate and makes adding new screens trivial.
- **System theme** — avoids forcing a preference; adapts to the user's OS setting.

## Future Considerations
- Additional screens added as new files under `app/`
- Shared components in `components/`
- Theme tokens in `constants/` for consistent styling across screens
