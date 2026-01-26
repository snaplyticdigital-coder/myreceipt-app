# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyReceipt (production name: **Duitrack**) is a Malaysian financial tracking mobile app featuring a "Financial Co-Pilot" with Manglish insights. Built with React 19 + Capacitor 8 for cross-platform deployment (Web + Android).

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
cd functions && npm run deploy         # Deploy Cloud Functions
cd functions && npm run deploy-gen2    # Deploy Gen 2 functions
```

## Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript 5.9 (strict mode) + Vite 7
- **State**: Zustand 5 with localStorage persistence (keyed by userId)
- **Styling**: Tailwind CSS 3.4 with custom design tokens
- **Mobile**: Capacitor 8 (appId: `com.myreceipt.app`, appName: "Duitrack")
- **Backend**: Firebase 12 (Auth, Firestore, Storage) + Google Cloud Document AI
- **Charts**: Recharts for analytics visualizations

### Key Directories
```
src/
├── lib/           # Core business logic & utilities
├── components/    # React components (forms/, layout/, modals/, ui/, monetization/)
├── pages/         # Route pages (15 pages)
├── services/      # Firebase service layer (receipts, users, storage)
├── contexts/      # React Context (auth with welcome sheet trigger)
└── hooks/         # Custom hooks (back button handling)

functions/         # Firebase Cloud Functions (Node.js 20, Gen 2)
android/           # Capacitor Android project
```

### Critical Files
- `src/lib/store.ts` - Zustand store: state, receipts, budgets, gamification, freemium logic, computed selectors
- `src/lib/lhdn-logic.ts` - Malaysian LHDN 2025 tax relief calculations with auto-tagging
- `src/lib/insights-engine.ts` - Financial Co-Pilot insights generation (Manglish copy)
- `src/lib/document-ai.ts` - Google Cloud Document AI receipt OCR integration
- `src/lib/calculations.ts` - Single source of truth for financial calculations
- `src/lib/profile-completion.ts` - Weighted profile completion engine
- `src/lib/locations.ts` - Malaysian postcode validation (uses postcodes.json)
- `src/lib/category-mapping.ts` - Merchant to spending category inference
- `src/lib/duplicate-detection.ts` - Receipt deduplication logic
- `src/types.ts` - Core TypeScript interfaces (User, Receipt, LineItem, Budget)
- `src/contexts/auth-context.tsx` - Firebase auth flow + welcome sheet trigger

### State Management Pattern
Zustand store in `store.ts` is the **single source of truth**:
- User data persisted to localStorage keyed by userId
- Computed selectors for derived financial state (week/month/day totals, category breakdown, budget %)
- Freemium tier logic (FREE: 10 scans/month, PRO: unlimited)
- Gamification state (XP, badges, tier celebrations)
- Actions: `updateUser()`, `addReceipt()`, `updateReceipt()`, `deleteReceipt()`, `redeemReferral()`, `awardXP()`

### Service Layer Pattern
Components never call Firestore directly. All database operations go through:
- `src/services/receipts-service.ts` - Receipt CRUD operations
- `src/services/users-service.ts` - User profile CRUD
- `src/services/storage-service.ts` - Cloud Storage file operations

### Authentication Flow
Firebase Auth with Google OAuth. Fast login: Firebase user loads first, then Firestore profile syncs. Guest login supported. Welcome bottom sheet triggers for new users with <50% profile completion.

## Domain-Specific Logic

### LHDN Tax Relief (src/lib/lhdn-logic.ts)
Malaysian tax relief with 2025 limits:
- Lifestyle: RM 2,500 cap
- Medical: RM 10,000
- Education: RM 7,000
- Sports, Childcare, Books, etc.

Auto-tags line items based on product categories. Routes spouse overflow when primary user exceeds limits.

### Financial Co-Pilot Insights
Three insight types with Manglish copy:
- **Sikit Lagi** (Gold) - Achievement progress toward goals
- **Syoknya** (Green) - Spending habit mirror & trends
- **Boleh Tahan** (Blue) - Daily budget advice & forecasting

Severity levels: critical, positive, informational.

### Freemium Model
- **FREE**: 10 scans/month (resets monthly), +3 per ad watch (48hr cooldown)
- **PRO**: Unlimited scans, yearly billing, anniversary-based reset
- Paywall overlays on analytics and advanced features

### Profile Completion (src/lib/profile-completion.ts)
Weighted field completion:
- Name/Email: 20%
- DOB: 15%
- Phone: 15%
- Salary: 15%
- Occupation: 15%
- Gender: 10%
- Postcode: 10%

Used for welcome flow triggers and progress visualization.

### Malaysian Postcode Validation (src/lib/locations.ts)
Validates 5-digit Malaysian postcodes against `postcodes.json`. Returns state/city for valid postcodes. Auto-populates `postcodeState` on User.

### Gamification System
- XP awards: +10 for upload, +5 for verify, +5 for categorize
- Anti-farming: `pointsAwarded` tracking on receipts prevents duplicate XP
- Achievement badges and tier celebrations

## Key Data Models

**Receipt**: merchant, items[], tags[] (LHDN), spendingCategory, verificationStatus, rawOcrText (immutable), pointsAwarded

**User**: tier (FREE/PRO), scanCount, scansRemaining, nextResetDate, referralCode, profile fields

**LineItem**: name, qty, unit, claimable, tag (LhdnTag), autoAssigned

## Environment Variables
Required in `.env`:
- `VITE_FIREBASE_*` - Firebase config (API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID)
- `GCP_PROJECT_ID`, `GCP_LOCATION`, `GCP_PROCESSOR_ID` - Document AI config
