# Contributing to BrewFocus

Thanks for your interest in contributing! BrewFocus is an open-source ADHD-friendly productivity app, and every contribution helps make focus a little easier for someone.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Setup

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/<your-username>/brewfocus.git
cd brewfocus
npm install
npm run dev
```

The app runs at `http://localhost:3000` and works immediately in **demo mode** (no API key needed).

## Development Workflow

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes.

3. Verify everything passes:
   ```bash
   npm run lint    # No lint errors
   npm run test    # All tests pass
   npm run build   # Production build succeeds
   ```

4. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add German translation
   fix: modal focus trap on Safari
   docs: update API key setup instructions
   refactor: extract timer logic into hook
   test: add stats computation edge cases
   chore: bump next-intl to 4.9
   ```

5. Push and open a Pull Request against `main`.

## Project Structure

```
src/
  app/           # Next.js App Router (pages, API routes, layouts)
  components/    # React components grouped by feature
  stores/        # Zustand state management (13 stores)
  hooks/         # Custom React hooks
  lib/           # Utilities, AI prompts, stats engine
  types/         # TypeScript interfaces
  i18n/          # Locale routing config
messages/        # i18n translation files (en.json, fr.json)
public/          # Static assets, PWA manifest, service worker
```

For a deeper dive, see [`docs/TECHNICAL_GUIDE.md`](docs/TECHNICAL_GUIDE.md).

## Areas Where Help is Appreciated

### Translations
Adding new languages is straightforward: duplicate `messages/en.json`, translate the 417 keys, and register the locale in `src/i18n/routing.ts`. Priority languages: German, Spanish, Portuguese, Japanese.

### Accessibility
Screen reader improvements, keyboard navigation, ARIA patterns. We recently did a full UX/UI audit — there's always more to improve.

### Themes
New pixel art cafe themes (the roadmap includes Parisian, Japanese, Nordic, Urban). Each theme is a color palette defined in `src/lib/themes.ts`.

### AI Prompts
Better system prompts for specific ADHD patterns. Prompts live in `src/lib/ai/prompts/` — each file is a self-contained mode.

### Testing
Unit and integration test coverage. Tests use Vitest and live in `__tests__/` folders next to the code they test.

## Code Style

- **TypeScript strict mode** — no `any` unless absolutely unavoidable
- **Functional components** with hooks
- **Zustand** for state (no Redux, no Context for global state)
- **Tailwind CSS** for styling — use existing design tokens (`brew-orange`, `brew-cream`, `brew-panel`, etc.)
- **Short functions** — single responsibility, descriptive names
- **Comments** only for non-obvious logic
- **Conventional commits** in English

## Adding a New Feature

1. Define the feature flag in `src/lib/featureRegistry.ts`
2. Create components in `src/components/<feature>/`
3. Create a store in `src/stores/` if state is needed
4. Add translation keys in both `messages/en.json` and `messages/fr.json`
5. Wrap with `<FeatureErrorBoundary>` in `page.tsx`
6. Add tests for core logic

## Reporting Bugs

Use the [Bug Report](https://github.com/Tenshyy/brewfocus/issues/new?template=bug_report.yml) issue template. Include:
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS
- Screenshots if relevant

## Requesting Features

Use the [Feature Request](https://github.com/Tenshyy/brewfocus/issues/new?template=feature_request.yml) issue template. Explain the ADHD challenge the feature addresses — that's how we evaluate priorities.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
