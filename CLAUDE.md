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
├── lib/           # Core business logic
├── components/    # React components (forms/, layout/, modals/, ui/)
├── pages/         # Route pages (14 total)
├── services/      # Firebase service layer
├── contexts/      # React Context (auth)
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
- `src/contexts/auth-context.tsx` - Firebase authentication flow

### State Management Pattern
Zustand store in `store.ts` is the single source of truth. Key patterns:
- User data persisted to localStorage keyed by userId
- Computed selectors for derived financial state
- Freemium tier logic (FREE: 10 scans/month, PRO: unlimited)
- Gamification state (XP, badges, tier celebrations)

### Authentication Flow
Firebase Auth with Google OAuth. Fast login pattern: Firebase user loads first, then Firestore profile data syncs. Guest login supported.

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

## Environment Variables
Required in `.env`:
- `VITE_FIREBASE_*` - Firebase config
- `GCP_PROJECT_ID`, `GCP_LOCATION`, `GCP_PROCESSOR_ID` - Document AI config
