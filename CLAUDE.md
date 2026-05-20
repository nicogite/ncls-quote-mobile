# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server (browser preview only)
npm run build        # vue-tsc + vite build → dist/
npm run lint         # ESLint
npm run test:unit    # Vitest (jsdom)
npm run test:e2e     # Cypress

# After build — sync and run on native
npx cap sync
npx cap run android
npx cap run ios
```

`VITE_API_URL` must be set in `.env.development` (local) and `.env.production` (release build).

## Architecture

**Bootstrapping** (`App.vue` `onMounted`):
1. Runs in parallel: `initializeUser()`, `ensureContentLoaded()`, texture preload, 5 s minimum splash
2. Checks `first_launch` in Preferences → `/intro`
3. Checks `last_quote_view` against today → preloads quote into store → `/tabs/quote`
4. Otherwise → `/tabs/welcome`

**Routing**: standalone `/intro`, then everything under `/tabs/` with `TabsPage.vue` providing the tab bar. Default tab redirects to `welcome`.

**State**: Pinia store (`src/store/quote.ts`) holds the current quote. `src/composables/useQuote.ts` is a legacy module-level ref that duplicates the store — it is unused and should be deleted rather than used in new code.

**Static content**: `contentService.ts` fetches all rows from `GET /api/content` once and caches them in a module-level map. Views call `ensureContentLoaded()` then `getContentValue('key')`.

**Anonymous identity**: UUID stored in Capacitor Preferences under `user_uuid`. `deviceService.ts` reads it on every call; it is re-entrant and safe to call from multiple views. After bootstrap the UUID is available in the Pinia store — prefer reading it from there in new code rather than calling `initializeUser()` per view.

## Ionic lifecycle rules

**Always use `onIonViewWillEnter` to load data** — not `onMounted`. Ionic caches views in the DOM; `onMounted` only fires on the first render, so returning to a cached view won't refresh data.

The one intentional exception is `QuoteView.vue`: it uses `onMounted` deliberately so the daily quote is not re-fetched on every tab switch (the store acts as the cache for the day).

Use `onIonViewWillLeave` for cleanup — `beforeUnmount` may not fire when navigating away from a cached view.

## Patterns to follow

**`v-html`**: Used in `IntroView` and `WelcomeView` for content from `static_content` (admin-only). This is acceptable — the content is server-controlled, not user input. Never add `v-html` for content that users can write.

**Local storage**: Use Capacitor `Preferences` for all persistence. `document.cookie` is currently used in `WelcomeView.handleClick` for `quote_of_the_day` — this is a known inconsistency that should be migrated to Preferences.

**Notifications**: `useNotifications.ts` deliberately avoids `repeats: true` to prevent progressive time drift. Instead it listens to `localNotificationReceived` and `localNotificationActionPerformed` to reschedule the next occurrence after each delivery. Do not replace this with `repeats: true` without testing the drift behavior on device.

## iOS App Store requirement

Since May 2024, iOS apps using Capacitor Preferences must include a `PrivacyInfo.xcprivacy` file declaring:
- API category: `NSPrivacyAccessedAPICategoryUserDefaults`
- Reason code: `CA92.1`

Without this, App Store submissions will be rejected.
