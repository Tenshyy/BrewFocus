# BrewFocus — Technical Guide

A step-by-step guide for developers who want to extend BrewFocus: add features, create AI modes, support new languages, or build new components.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Architecture](#project-architecture)
- [1. Add a New Toggleable Feature](#1-add-a-new-toggleable-feature)
- [2. Add a New AI Mode](#2-add-a-new-ai-mode)
- [3. Add a New Language](#3-add-a-new-language)
- [4. Create a Zustand Store](#4-create-a-zustand-store)
- [5. Create a Custom Hook](#5-create-a-custom-hook)
- [6. Use Shared UI Components](#6-use-shared-ui-components)
- [7. Add a Command Palette Action](#7-add-a-command-palette-action)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** 20+
- **npm** 10+
- Basic knowledge of React 19, TypeScript, Next.js App Router, and Tailwind CSS 4

```bash
git clone https://github.com/Tenshyy/brewfocus.git
cd brewfocus
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). The app works immediately in demo mode (no API key needed).

---

## Project Architecture

```
src/
├── app/
│   ├── [locale]/              # i18n routing (fr, en)
│   │   ├── layout.tsx         # NextIntlClientProvider wrapper
│   │   └── page.tsx           # Main page — wires all features together
│   └── api/
│       ├── ai/route.ts        # Unified AI endpoint (all modes except braindump)
│       ├── llm/route.ts       # Brain dump endpoint (legacy)
│       └── data/route.ts      # Data persistence endpoint
├── components/
│   ├── ai/                    # AI sidebar, mode selector, chat, action views
│   ├── barista/               # Pixel art animation engine
│   ├── braindump/             # Brain dump card + voice input
│   ├── command/               # Command palette (Ctrl+P)
│   ├── gamification/          # Daily progress + celebrations
│   ├── layout/                # AppShell, Header, Footer
│   ├── onboarding/            # First-visit tutorial overlay
│   ├── pomodoro/              # Timer, controls, coffee cup
│   ├── pwa/                   # Install banner
│   ├── ritual/                # Morning ritual overlay
│   ├── settings/              # Settings modal + feature toggles
│   ├── stats/                 # Dashboard, charts, heatmap, export
│   ├── tasks/                 # Task list, items, matrix, focus view
│   └── ui/                    # Button, Card, Modal, Toast, FeatureGate
├── stores/                    # Zustand stores (all persisted to localStorage)
├── hooks/                     # Custom hooks (timer, AI, sync, reminders…)
├── lib/
│   ├── ai/prompts/            # 13 specialized AI system prompts
│   ├── constants.ts           # Storage keys, timer presets, colors
│   ├── featureRegistry.ts     # Feature definitions + defaults
│   ├── commands.ts            # Command palette definitions
│   └── stats.ts               # Statistics computation engine
├── types/                     # TypeScript definitions
└── i18n/                      # Locale routing config

messages/
├── fr.json                    # French translations (~400 keys)
└── en.json                    # English translations (~400 keys)
```

### Key Patterns

| Pattern | How it works |
|---------|-------------|
| **State** | Zustand stores with `persist` middleware → localStorage |
| **Feature flags** | `FeatureGate` component + `useFeatureEnabled` hook |
| **Error isolation** | `FeatureErrorBoundary` wraps each feature |
| **i18n** | next-intl with `[locale]` route segment |
| **SSR guard** | `useHydration()` hook prevents hydration mismatches |
| **Styling** | Tailwind CSS 4 with `brew-*` theme tokens |

### Theme Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `brew-orange` | `#E07A3A` | Primary accent, CTAs |
| `brew-cream` | `#E8D5C4` | Text, headings |
| `brew-panel` | `#1A1714` | Card backgrounds |
| `brew-border` | `#2A2420` | Borders, dividers |
| `brew-gray` | `#8B7E75` | Secondary text |

---

## 1. Add a New Toggleable Feature

Every feature in BrewFocus can be toggled on/off from Settings. Here's how to add yours.

### Step 1 — Define the feature ID

**`src/types/features.ts`**

```typescript
export type FeatureId =
  | "timer"
  | "brainDump"
  // ... existing features
  | "myFeature";  // ← add here
```

### Step 2 — Register the feature

**`src/lib/featureRegistry.ts`**

```typescript
export const FEATURE_REGISTRY: FeatureDefinition[] = [
  // ... existing features
  {
    id: "myFeature",
    labelKey: "features.myFeatureLabel",
    descKey: "features.myFeatureDesc",
    icon: "sparkles",           // Lucide icon name
    group: "experience",        // core | experience | organization | input | motivation
  },
];

export const DEFAULT_FEATURES: Record<FeatureId, boolean> = {
  // ... existing
  myFeature: true,              // true = on by default, false = opt-in
};
```

### Step 3 — Add translations

**`messages/en.json`**

```json
{
  "features": {
    "myFeatureLabel": "My Feature",
    "myFeatureDesc": "A short description of what this does"
  }
}
```

**`messages/fr.json`**

```json
{
  "features": {
    "myFeatureLabel": "Ma Fonctionnalité",
    "myFeatureDesc": "Une courte description de ce que ça fait"
  }
}
```

> At this point, your feature already appears in Settings → Feature Toggles.

### Step 4 — Create your component

**`src/components/myFeature/MyFeatureCard.tsx`**

```typescript
"use client";

import { useTranslations } from "next-intl";
import Card from "@/components/ui/Card";

export default function MyFeatureCard() {
  const t = useTranslations("myFeature");

  return (
    <Card animated>
      <h2 className="text-[11px] font-bold uppercase tracking-[3px] text-brew-orange">
        ▪ {t("title")} ▪
      </h2>
      {/* Your feature UI */}
    </Card>
  );
}
```

### Step 5 — Wire it into the main page

**`src/app/[locale]/page.tsx`**

```typescript
import { useFeatureEnabled } from "@/components/ui/FeatureGate";
import FeatureErrorBoundary from "@/components/ui/FeatureErrorBoundary";
import MyFeatureCard from "@/components/myFeature/MyFeatureCard";

// Inside the component:
const myFeatureEnabled = useFeatureEnabled("myFeature");

// In the JSX:
{myFeatureEnabled && (
  <FeatureErrorBoundary featureName="My Feature">
    <MyFeatureCard />
  </FeatureErrorBoundary>
)}
```

### Step 6 — Verify

```bash
npm run build && npm run lint && npm run test
```

Open Settings → Feature Toggles. Your feature should appear with its toggle. When disabled, the component is completely unmounted.

### Alternative: Use `<FeatureGate>` wrapper

Instead of `useFeatureEnabled`, you can use the component wrapper:

```tsx
<FeatureGate feature="myFeature" fallback={<p>Feature disabled</p>}>
  <MyFeatureCard />
</FeatureGate>
```

---

## 2. Add a New AI Mode

The AI system supports 14 modes. Each mode has a prompt, a UI configuration, and result rendering.

### Step 1 — Add the mode to the type

**`src/types/ai.ts`**

```typescript
export type AiMode =
  | "chat"
  | "decompose"
  // ... existing modes
  | "myMode";  // ← add here
```

### Step 2 — Create the prompt

**`src/lib/ai/prompts/myMode.ts`**

```typescript
const prompts: Record<string, string> = {
  fr: `Tu es un assistant spécialisé dans [description].

ENTRÉE : [what the user provides]

MISSION : [what the AI should do]

FORMAT DE SORTIE (JSON strict) :
{
  "result": "...",
  "tips": ["...", "..."]
}

RÈGLES :
- Règle 1
- Règle 2
- Toujours répondre en français`,

  en: `You are an assistant specialized in [description].

INPUT: [what the user provides]

MISSION: [what the AI should do]

OUTPUT FORMAT (strict JSON):
{
  "result": "...",
  "tips": ["...", "..."]
}

RULES:
- Rule 1
- Rule 2
- Always respond in English`,
};

export function getMyModePrompt(locale: string): string {
  return prompts[locale] || prompts.en;
}
```

### Step 3 — Register the prompt

**`src/lib/ai/prompts/index.ts`**

```typescript
export { getMyModePrompt } from "./myMode";

export const AI_PROMPTS: Record<AiMode, (locale: string) => string> = {
  // ... existing
  myMode: getMyModePrompt,
};
```

### Step 4 — Configure the API route

**`src/app/api/ai/route.ts`**

If your mode returns JSON, add it to the `JSON_MODES` array:

```typescript
const JSON_MODES: AiMode[] = [
  "decompose", "planner", "bilan",
  // ... existing
  "myMode",  // ← add here
];
```

You can also set a custom `maxTokens` value if needed (default varies by mode, typically 1500).

### Step 5 — Add the UI mode config

**`src/components/ai/AiActionView.tsx`**

```typescript
const MODE_CONFIGS: Partial<Record<AiMode, ModeConfig>> = {
  // ... existing
  myMode: {
    icon: "wand",                          // Lucide icon
    titleKey: "ai.myModeTitle",            // i18n key
    placeholderKey: "ai.myModePlaceholder",
    buttonKey: "ai.myModeButton",
    needsInput: true,                      // true = user types something
    needsContext: false,                   // true = auto-inject task/stats context
  },
};
```

**`needsInput` vs `needsContext` cheat sheet:**

| | `needsInput: true` | `needsInput: false` |
|---|---|---|
| **`needsContext: true`** | — | planner, bilan, coach, overload, weeklyReview |
| **`needsContext: false`** | decompose, draft, inbox, focusBrief | — |

### Step 6 — Add to the mode selector

**`src/components/ai/AiModeSelector.tsx`**

```typescript
// Add to FAVORITE_MODES (always visible) or EXTRA_MODES (behind "More Tools" toggle)
const EXTRA_MODES: AiModeConfig[] = [
  // ... existing
  { mode: "myMode", icon: "wand", labelKey: "ai.myMode", descKey: "ai.myModeDesc" },
];
```

### Step 7 — Add result rendering (if JSON)

**`src/components/ai/AiActionView.tsx`** — inside the `ResultDisplay` component:

```typescript
// Add a new block for your mode's result shape:
if (mode === "myMode" && data.result) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-brew-cream">{data.result}</p>
      {data.tips?.map((tip: string, i: number) => (
        <div key={i} className="text-[11px] text-brew-gray flex gap-2">
          <span className="text-brew-orange">→</span>
          <span>{tip}</span>
        </div>
      ))}
    </div>
  );
}
```

### Step 8 — Add translations

**`messages/en.json`**

```json
{
  "ai": {
    "myMode": "My Mode",
    "myModeDesc": "Short description for the selector",
    "myModeTitle": "My Mode",
    "myModePlaceholder": "Type something here...",
    "myModeButton": "Generate"
  }
}
```

Add the French equivalent in `messages/fr.json`.

### Step 9 — Cache results (optional)

If you want results to persist across sidebar opens, add to **`src/stores/aiStore.ts`**:

```typescript
interface AiState {
  // ... existing
  lastMyMode: Record<string, unknown> | null;
  setMyMode: (result: Record<string, unknown>) => void;
}

// In the store:
lastMyMode: null,
setMyMode: (result) => set({ lastMyMode: result }),
```

Then in `AiActionView.handleAction()`:

```typescript
else if (activeMode === "myMode") {
  useAiStore.getState().setMyMode(data);
}
```

### Step 10 — Verify

```bash
npm run build && npm run lint && npm run test
```

Open the AI sidebar → your mode should appear. Test with demo mode first, then with a real provider.

---

## 3. Add a New Language

BrewFocus uses [next-intl](https://next-intl-docs.vercel.app/) with URL-based locale routing (`/fr`, `/en`).

### Step 1 — Update the routing config

**`src/i18n/routing.ts`**

```typescript
export const routing = defineRouting({
  locales: ["fr", "en", "es"],   // ← add your locale code
  defaultLocale: "fr",
});
```

### Step 2 — Create the translation file

Copy `messages/en.json` to `messages/es.json` (or your locale) and translate all values:

```bash
cp messages/en.json messages/es.json
```

**`messages/es.json`** (example excerpt):

```json
{
  "common": {
    "close": "Cerrar",
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "tagline": "Vierte · Enfoca · Prepara Resultados"
  },
  "header": {
    "openAi": "Abrir asistente de IA",
    "openSettings": "Abrir configuración"
  }
}
```

### Translation syntax reference

| Pattern | Example | Description |
|---------|---------|-------------|
| Simple string | `"close": "Close"` | Direct translation |
| Variable | `"cafeAmbiance": "Cafe ambiance — {opacity}%"` | Interpolated value |
| Plural | `"streak": "{count} day{count, plural, =1 {} other {s}}"` | ICU plural syntax |
| Nested keys | `"days": { "mon": "Mo" }` | Accessed via `t("days.mon")` |

### Step 3 — Translate all namespaces

The file has ~400 keys across these namespaces:

| Namespace | Content |
|-----------|---------|
| `common` | Global UI (close, save, cancel…) |
| `header` | Header labels |
| `timer` | Pomodoro timer |
| `tasks` | Task management |
| `braindump` | Brain dump feature |
| `features` | Feature toggle labels/descriptions |
| `settings` | Settings panel |
| `ritual` | Morning ritual |
| `ai` | AI assistant modes |
| `stats` | Statistics dashboard |
| `pwa` | PWA installation |
| `onboarding` | Tutorial |
| `barista` | Barista character |
| `command` | Command palette |
| `gamification` | Gamification |
| `notifications` | System notifications |
| `reminders` | Reminder notifications |
| `errors` | Error messages |

### Step 4 — Update the language switcher

The current switcher in `src/app/[locale]/page.tsx` toggles between `fr` and `en`. For 3+ languages, update it:

```typescript
// In commandCallbacks:
switchLanguage: () => {
  const segments = window.location.pathname.split("/");
  const currentLocale = segments[1];
  const locales = ["fr", "en", "es"];
  const currentIndex = locales.indexOf(currentLocale);
  const nextLocale = locales[(currentIndex + 1) % locales.length];
  segments[1] = nextLocale;
  document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000`;
  window.location.pathname = segments.join("/") || `/${nextLocale}`;
},
```

> For a better UX with many languages, consider creating a language selector dropdown in Settings.

### Step 5 — Verify

```bash
npm run build && npm run lint
```

Navigate to `/es` (or your locale). All UI text should appear in the new language. Check:

- [ ] All labels and buttons render correctly
- [ ] Plurals work (e.g., "1 task" vs "2 tasks")
- [ ] AI prompts generate responses in the new language
- [ ] Notifications and reminders use the correct language

> **Tip:** next-intl falls back to the default locale (French) for any missing keys, so partial translations won't crash the app.

---

## 4. Create a Zustand Store

All BrewFocus stores follow the same pattern: Zustand + `persist` middleware + `localStorage`.

### Template

**`src/stores/myFeatureStore.ts`**

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";

interface MyFeatureState {
  // State
  items: string[];
  isActive: boolean;

  // Actions
  addItem: (item: string) => void;
  removeItem: (id: string) => void;
  setActive: (active: boolean) => void;
  reset: () => void;
}

export const useMyFeatureStore = create<MyFeatureState>()(
  persist(
    (set) => ({
      items: [],
      isActive: false,

      addItem: (item) =>
        set((state) => ({ items: [...state.items, item] })),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i !== id) })),

      setActive: (active) => set({ isActive: active }),

      reset: () => set({ items: [], isActive: false }),
    }),
    {
      name: STORAGE_KEYS.myFeature,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

**Don't forget** to add the storage key in **`src/lib/constants.ts`**:

```typescript
export const STORAGE_KEYS = {
  // ... existing
  myFeature: "brewfocus-myfeature",
};
```

### Usage in Components

```typescript
// Selective subscription (only re-renders when `items` changes)
const items = useMyFeatureStore((s) => s.items);
const addItem = useMyFeatureStore((s) => s.addItem);

// Access outside React (in callbacks, event handlers)
const { items } = useMyFeatureStore.getState();
```

### Conventions

- **Always spread state** when updating: `{ items: [...state.items, item] }`
- **Never mutate** state directly
- **Use selectors** to subscribe to specific fields: `(s) => s.items`
- **Use `.getState()`** for one-off reads in callbacks (no re-render)
- **Keep stores small** and focused on one feature

---

## 5. Create a Custom Hook

Hooks in BrewFocus are fire-and-forget side effects, activated at the root component level.

### Template

**`src/hooks/useMyFeature.ts`**

```typescript
"use client";

import { useEffect, useRef } from "react";
import { useMyFeatureStore } from "@/stores/myFeatureStore";
import { useSettingsStore } from "@/stores/settingsStore";

export function useMyFeature() {
  const isActive = useMyFeatureStore((s) => s.isActive);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      // Periodic logic here
    }, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);
}
```

### Activate in the main page

**`src/app/[locale]/page.tsx`**

```typescript
import { useMyFeature } from "@/hooks/useMyFeature";

export default function Home() {
  useMyFeature();  // ← fire-and-forget at root level
  // ...
}
```

### Conventions

- Use `useRef` for non-reactive values (timers, flags, previous values)
- Always return cleanup functions from `useEffect`
- Use store selectors for reactive data, `.getState()` for immediate reads
- Hooks don't return JSX — they're pure side effects
- Mark with `"use client"` directive

---

## 6. Use Shared UI Components

BrewFocus provides reusable UI primitives in `src/components/ui/`.

### Card

```tsx
import Card from "@/components/ui/Card";

<Card animated>         {/* animated = fade-in on mount */}
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

### Button

```tsx
import Button from "@/components/ui/Button";

<Button variant="primary" size="md" onClick={handleClick}>
  Save
</Button>

// Variants: "primary" | "secondary" | "ghost"
// Sizes: "sm" | "md"
```

### Modal

```tsx
import Modal from "@/components/ui/Modal";

<Modal isOpen={open} onClose={() => setOpen(false)} title="Settings">
  <p>Modal content</p>
</Modal>
```

### Toast

```tsx
import { useToastStore } from "@/stores/toastStore";

useToastStore.getState().addToast("Task saved!", "success");
// Types: "success" | "error" | "info"
```

### FeatureGate

```tsx
import FeatureGate, { useFeatureEnabled } from "@/components/ui/FeatureGate";

// Component wrapper
<FeatureGate feature="myFeature">
  <MyComponent />
</FeatureGate>

// Or hook
const enabled = useFeatureEnabled("myFeature");
```

### FeatureErrorBoundary

```tsx
import FeatureErrorBoundary from "@/components/ui/FeatureErrorBoundary";

<FeatureErrorBoundary featureName="My Feature">
  <MyComponent />    {/* If this crashes, fallback UI is shown */}
</FeatureErrorBoundary>
```

### LucideIcon

```tsx
import LucideIcon from "@/components/ui/LucideIcon";

<LucideIcon name="coffee" size={16} className="text-brew-orange" />
```

Browse all available icons at [lucide.dev/icons](https://lucide.dev/icons).

---

## 7. Add a Command Palette Action

The command palette (`Ctrl+P`) provides quick actions. Here's how to add one.

### Step 1 — Define the command

**`src/lib/commands.ts`**

```typescript
export function buildCommands(callbacks: CommandCallbacks): Command[] {
  return [
    // ... existing commands
    {
      id: "my-feature-action",
      label: "My Feature Action",
      icon: "sparkles",
      category: "navigation",            // timer | tasks | ai | navigation | settings
      requiredFeature: "myFeature",       // only shown when feature is enabled
      keywords: ["my", "feature", "action"],
      action: callbacks.myFeatureAction,
    },
  ];
}
```

### Step 2 — Add the callback

**`src/app/[locale]/page.tsx`**

```typescript
const commandCallbacks: CommandCallbacks = useMemo(() => ({
  // ... existing callbacks
  myFeatureAction: () => {
    // Your action logic
  },
}), []);
```

### Step 3 — Add translations

```json
{
  "command": {
    "myFeatureAction": "My Feature Action"
  }
}
```

Commands with a `requiredFeature` are automatically hidden when that feature is toggled off.

---

## Troubleshooting

### Hydration mismatch errors

Wrap any code that reads from localStorage (Zustand stores) with the hydration guard:

```typescript
const hydrated = useHydration();
if (!hydrated) return null;
```

### Feature toggle doesn't appear in Settings

Check that:
1. The `FeatureId` type includes your feature
2. `FEATURE_REGISTRY` has an entry with the correct `id`
3. `DEFAULT_FEATURES` has a default value for it
4. Translation keys `features.{id}Label` and `features.{id}Desc` exist in both language files

### AI mode returns raw text instead of JSON

Make sure your mode is listed in the `JSON_MODES` array in `src/app/api/ai/route.ts`. Modes not in this array are treated as plain text responses.

### Store data doesn't persist

1. Check that `STORAGE_KEYS` has an entry for your store
2. Verify the `persist` middleware is configured with `createJSONStorage(() => localStorage)`
3. Open DevTools → Application → Local Storage and look for your `brewfocus-*` key

### Translation key shows as-is (not translated)

1. Verify the key exists in both `messages/en.json` and `messages/fr.json`
2. Check you're using the correct namespace: `useTranslations("myNamespace")`
3. Keys are hierarchical — `t("myKey")` looks for `{ "myNamespace": { "myKey": "..." } }`

---

*Made with coffee and code.*
