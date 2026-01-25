# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyReceipt (production name: Duitrack) is a Malaysian financial tracking mobile app featuring a "Financial Co-Pilot" with Manglish insights. Built with React + Capacitor for cross-platform deployment (Web + Android).

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # TypeScript compile + Vite production build
npm run preview      # Preview production build locally
npx tsc --noEmit     # Type-check without emitting
```

### Android Development
```bash
npx cap sync android   # Sync web build to Android project
npx cap open android   # Open in Android Studio
```

### Firebase Functions (in functions/ directory)
```bash
npm run deploy         # Deploy Cloud Functions
npm run deploy-gen2    # Deploy Gen 2 functions
```

## Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite 7
- **State**: Zustand with localStorage persistence (user-scoped by userId)
- **Styling**: Tailwind CSS with custom theme variables
- **Mobile**: Capacitor 8 (appId: `com.myreceipt.app`)
- **Backend**: Firebase (Auth, Firestore, Storage) + Google Cloud Document AI

### Key Directories
```
src/
├── lib/           # Core business logic & utilities
├── components/    # React components (forms/, layout/, modals/, ui/)
├── pages/         # Route pages
├── services/      # Firebase service layer
├── contexts/      # React Context (auth with welcome sheet trigger)
└── hooks/         # Custom hooks

functions/         # Firebase Cloud Functions
android/           # Capacitor Android project
```

### Critical Files
- `src/lib/store.ts` - Zustand store (state, receipts, budgets, gamification, freemium logic)
- `src/lib/lhdn-logic.ts` - Malaysian LHDN 2025 tax relief calculations
- `src/lib/insights-engine.ts` - AI spending insights generation
- `src/lib/document-ai.ts` - Google Cloud Document AI receipt OCR
- `src/lib/calculations.ts` - Financial calculations (week/month/day spending)
- `src/lib/profile-completion.ts` - Profile completion percentage engine (weighted fields)
- `src/lib/locations.ts` - Malaysian postcode validation (uses postcodes.json)
- `src/contexts/auth-context.tsx` - Firebase authentication flow + welcome sheet trigger
- `src/types.ts` - Core TypeScript interfaces (User, Receipt, LineItem, Budget)

### State Management Pattern
Zustand store in `store.ts` is the single source of truth. Key patterns:
- User data persisted to localStorage keyed by userId
- Computed selectors for derived financial state
- Freemium tier logic (FREE: 10 scans/month, PRO: unlimited)
- Gamification state (XP, badges, tier celebrations)
- Profile fields update via `updateUser()` action

### Authentication Flow
Firebase Auth with Google OAuth. Fast login pattern: Firebase user loads first, then Firestore profile data syncs. Guest login supported. Welcome bottom sheet triggers for new users with <50% profile completion.

## Domain-Specific Logic

### LHDN Tax Relief (src/lib/lhdn-logic.ts)
Malaysian tax relief with 2025 limits. Categories: Lifestyle (RM 2,500 cap), Medical, Education, etc. Auto-tags line items and routes spouse overflow.

### Financial Co-Pilot Insights
Three insight types with Manglish copy:
- **Sikit Lagi** (Gold) - Achievement progress
- **Syoknya** (Green) - Spending habits
- **Boleh Tahan** (Blue) - Budget advice

### Freemium Model
- FREE: 10 scans/month, +3 per ad watch (48hr cooldown)
- PRO: Unlimited scans, yearly billing
- Anniversary-based monthly reset

### Profile Completion (src/lib/profile-completion.ts)
Weighted field completion: Name/Email 20%, DOB 15%, Gender 10%, Phone 15%, Salary 15%, Occupation 15%, Postcode 10%. Used for progress bars and welcome flow triggers.

### Malaysian Postcode Validation (src/lib/locations.ts)
Validates 5-digit Malaysian postcodes against `postcodes.json`. Returns state/city info for valid postcodes. Auto-populates `postcodeState` field on User.

## Environment Variables
Required in `.env`:
- `VITE_FIREBASE_*` - Firebase config
- `GCP_PROJECT_ID`, `GCP_LOCATION`, `GCP_PROCESSOR_ID` - Document AI config
