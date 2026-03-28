# BountyTrack

BountyTrack is a React Native app for tracking:

- bug bounty reports
- Gmail conversations per company
- payouts and earnings
- freelance security work and client replies

It is built with Expo, TypeScript, Supabase, React Navigation, React Query, Zustand, NativeWind, and Gmail OAuth.

## Current status

Implemented now:

- Google auth screen and onboarding flow
- auth-aware navigation shell
- Supabase client setup
- Supabase SQL schema + RLS migrations
- dashboard stats scaffold
- bounty list, add, and detail flows
- freelance module scaffold
- Gmail service scaffold
- earnings hook scaffold
- Tailwind CSS v4 setup

Still in progress:

- full Gmail thread sync and reply UI
- earnings charts and CSV export screen
- push notifications
- cron-driven edge sync automation

## Main features

### Bug bounty tracking

- create and track bug bounty reports
- store company name, email, severity, platform, vuln type, report title, notes, status, expected amount, awarded amount
- mark a bounty as paid
- detect stale threads

### Gmail thread tracking

- link a Gmail `threadId` to a bounty or freelance engagement
- isolate email history by company thread
- incremental sync structure prepared through Gmail history API
- reply support scaffolded in service layer

### Freelance journey tracking

- separate freelance module for clients
- proposal and negotiation tracking
- project/payment state tracking
- future milestone and invoice support already included in schema

### Earnings

- payout table included
- earnings aggregation hook included
- full reporting UI planned next

### Security and multi-user separation

- Supabase Auth with Google
- Row Level Security on all user data
- each user sees only their own records

## Tech stack

- Expo / React Native
- TypeScript
- Supabase
- React Navigation
- TanStack Query
- Zustand
- NativeWind + Tailwind CSS v4
- Gmail API via Google OAuth

## Project structure

```text
bountytrack/
├── app/
├── src/
│   ├── app/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── navigation/
│   ├── screens/
│   ├── services/
│   ├── stores/
│   └── types/
├── supabase/
│   ├── functions/
│   └── migrations/
├── app.json
├── babel.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Requirements

Install these first:

- Node.js 20+
- npm 10+
- Xcode if you want iOS builds
- Android Studio if you want Android builds
- Java 17 recommended for Android tooling
- Supabase account
- Google Cloud project for OAuth and Gmail API

## 1. Install dependencies

```bash
npm install
```

## 2. Environment variables

Create a `.env` file in the project root using [.env.example](.env.example).

Example:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
```

## 3. Supabase setup

### Create a Supabase project

Create a new project in Supabase and copy:

- project URL
- anon key

### Enable Google provider

In Supabase dashboard:

1. go to Authentication
2. open Providers
3. enable Google
4. add Google client ID and secret
5. configure redirect URLs

### Run database migrations

Use the SQL from these files in order:

- [supabase/migrations/001_init.sql](supabase/migrations/001_init.sql)
- [supabase/migrations/002_rls.sql](supabase/migrations/002_rls.sql)
- [supabase/migrations/003_triggers.sql](supabase/migrations/003_triggers.sql)

You can run them with Supabase CLI or paste them into the Supabase SQL editor.

Example with CLI:

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push
```

If you are not using the CLI yet, open SQL Editor and run each migration manually.

## 4. Google Cloud / Gmail API setup

In Google Cloud Console:

1. create a project
2. enable Gmail API
3. configure OAuth consent screen
4. add scopes:
   - `gmail.readonly`
   - `gmail.send`
5. create OAuth clients for:
   - Android
   - iOS
   - Web

### Important

Gmail scopes can require Google verification depending on how the app is distributed. For local testing, you can use test users on the OAuth consent screen.

## 5. App config

Current Expo app settings are in [app.json](app.json).

Important values:

- app scheme: `bountytrack`
- Android package: `com.bountytrack.app`
- iOS bundle ID: `com.bountytrack.app`

If you change these, update your Google OAuth config too.

## 6. How to install and run on Android

Because this app uses native modules such as:

- Google Sign-In
- Secure Store
- Notifications

You should use a development build, not Expo Go.

### Android prerequisites

Install:

- Android Studio
- Android SDK
- at least one emulator image

Then make sure:

- `adb` works
- emulator runs successfully
- Android SDK path is configured

### Option A: Run on Android emulator

Start an emulator from Android Studio, then run:

```bash
npx expo prebuild
npm run android
```

This will build and launch the app on the emulator.

### Option B: Run on a real Android device

1. enable developer options on your phone
2. enable USB debugging
3. connect phone with USB
4. verify device is detected:

```bash
adb devices
```

5. then run:

```bash
npx expo prebuild
npm run android
```

### Option C: Use Expo dev client

If you already have a dev build installed:

```bash
npx expo start --dev-client
```

Then open the dev build on the device.

### Android troubleshooting

#### Build does not start

Try:

```bash
npx expo prebuild --clean
npm run android
```

#### No device found

Check:

```bash
adb devices
```

#### Gradle issues

Delete native build folders and regenerate:

```bash
rm -rf android ios
npx expo prebuild
npm run android
```

If you see this error:

```text
Class org.gradle.jvm.toolchain.JvmVendorSpec does not have member field 'IBM_SEMERU'
```

Pin the wrapper back to Gradle 8.x (for this project use `8.13`) by editing
[android/gradle/wrapper/gradle-wrapper.properties](android/gradle/wrapper/gradle-wrapper.properties):

```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.13-bin.zip
```

Also make sure Gradle uses Java 17 (not Java 25):

```properties
org.gradle.java.home=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
```

And point Android SDK correctly in [android/local.properties](android/local.properties):

```properties
sdk.dir=/opt/homebrew/share/android-commandlinetools
```

Then run:

```bash
cd android && ./gradlew --version
cd .. && npm run android
```

#### OAuth not returning to app

Check:

- app scheme in [app.json](app.json)
- redirect URL allowlist in Supabase
- Android package name in Google Cloud OAuth client

## 7. How to run on iOS

```bash
npx expo prebuild
npm run ios
```

## 8. How to run on web

```bash
npm run web
```

Note: Gmail auth and native-only integrations may behave differently on web.

## 9. Verify the app locally

Run:

```bash
npm run typecheck
```

You can also start Metro:

```bash
npm start
```

## 10. Feature walkthrough

### Auth

Files:

- [src/screens/auth/AuthScreen.tsx](src/screens/auth/AuthScreen.tsx)
- [src/screens/auth/OnboardingScreen.tsx](src/screens/auth/OnboardingScreen.tsx)
- [src/services/auth.ts](src/services/auth.ts)

What it does:

- signs in with Google through Supabase OAuth
- requests Gmail scopes
- stores session using Supabase auth persistence
- shows onboarding after first login

### Navigation

Files:

- [src/navigation/AppNavigator.tsx](src/navigation/AppNavigator.tsx)
- [src/navigation/types.ts](src/navigation/types.ts)

What it does:

- auth stack for sign-in and onboarding
- main tabs for dashboard, bounties, emails, freelance, earnings
- nested stacks for detail screens

### Dashboard

Files:

- [src/screens/dashboard/DashboardScreen.tsx](src/screens/dashboard/DashboardScreen.tsx)
- [src/hooks/useDashboard.ts](src/hooks/useDashboard.ts)
- [src/hooks/useRealtimeBounties.ts](src/hooks/useRealtimeBounties.ts)

What it does:

- total earned
- reports sent
- pending payout
- accepted count
- severity breakdown
- realtime bounty refresh scaffold

### Bounties

Files:

- [src/screens/bounties/BountyListScreen.tsx](src/screens/bounties/BountyListScreen.tsx)
- [src/screens/bounties/AddBountyScreen.tsx](src/screens/bounties/AddBountyScreen.tsx)
- [src/screens/bounties/BountyDetailScreen.tsx](src/screens/bounties/BountyDetailScreen.tsx)
- [src/hooks/useBounties.ts](src/hooks/useBounties.ts)

What it does:

- create bug bounty entries
- filter and search bounties
- view detail
- update status
- mark as paid

### Freelance tracking

Files:

- [src/screens/freelance/FreelanceListScreen.tsx](src/screens/freelance/FreelanceListScreen.tsx)
- [src/screens/freelance/FreelanceDetailScreen.tsx](src/screens/freelance/FreelanceDetailScreen.tsx)
- [src/screens/freelance/AddFreelanceScreen.tsx](src/screens/freelance/AddFreelanceScreen.tsx)
- [src/hooks/useFreelance.ts](src/hooks/useFreelance.ts)

What it does:

- reserve structure for freelance client journey
- separate freelance data from bug bounty data
- prepare for milestones, invoices, and client thread linking

### Gmail integration

Files:

- [src/services/gmail.ts](src/services/gmail.ts)
- [src/hooks/useEmails.ts](src/hooks/useEmails.ts)
- [src/hooks/useGmailSync.ts](src/hooks/useGmailSync.ts)
- [supabase/functions/gmail-sync/index.ts](supabase/functions/gmail-sync/index.ts)

What it does now:

- fetch Gmail thread
- send reply scaffold
- incremental history sync scaffold
- edge function placeholder for background sync

What is next:

- match messages to bounty/freelance records by `gmail_thread_id`
- persist synced emails into `emails`
- power unified inbox and thread screen

### Earnings

Files:

- [src/hooks/useEarnings.ts](src/hooks/useEarnings.ts)
- [src/screens/earnings/EarningsScreen.tsx](src/screens/earnings/EarningsScreen.tsx)

What it does now:

- basic payout aggregation hook
- UI scaffold for future chart/export screen

## 11. Database tables

Core tables included:

- `profiles`
- `bounties`
- `freelance_engagements`
- `emails`
- `payouts`
- `milestones`
- `invoices`
- `gmail_sync`

All are protected with RLS.

## 12. Authentication flow summary

1. user taps Google sign-in
2. Supabase starts Google OAuth
3. Gmail scopes are requested
4. session is persisted locally
5. profile is auto-created by DB trigger
6. onboarding is shown once
7. user enters app tabs

## 13. Notes about Expo Go

Do not rely on Expo Go for the final app workflow because native modules are included.

Use:

- `npm run android`
- `npm run ios`
- `npx expo start --dev-client`

## 14. Recommended next commands

Install dependencies if needed:

```bash
npm install
```

Run typecheck:

```bash
npm run typecheck
```

Run Android build:

```bash
npx expo prebuild
npm run android
```

Start Metro only:

```bash
npm start
```

## 15. Planned next implementation work

- complete Gmail sync and inbox UI
- add thread reply composer persistence
- finish freelance CRUD
- build earnings charts and CSV export
- push notifications for company replies
- cron-based edge sync scheduling

## 16. Security notes

- never commit `.env`
- keep Supabase service role key out of the mobile app
- use RLS on all tables
- store refresh tokens securely and prefer backend handling for long-term Gmail sync

## 17. License / internal note

This README documents current project setup and implementation state for local development.
