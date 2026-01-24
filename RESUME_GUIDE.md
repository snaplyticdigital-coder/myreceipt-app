# MyReceipt - Project Resume Guide 🚀

## Overview
This is the **MyReceipt** project, a localized Malaysian financial tracking app featuring the "financial Co-Pilot" with Manglish insights.

## How to Resume Work

### 1. Prerequisites
Ensure you have **Node.js** installed on your system.

### 2. Setup
Open your terminal and navigate to this folder.
Run the following command to install dependencies (since `node_modules` was excluded from backup):

```bash
npm install
```

### 3. Running the App
To start the local development server:

```bash
npm run dev
```
The app will normally run at `http://localhost:5173`.

## Key Features Implemented
- **Financial Co-Pilot**:
  - **Sikit Lagi**: Achievement progress tracker (Gold).
  - **Syoknya**: Spending habit mirror (Green).
  - **Boleh Tahan**: Daily limit budget advisor (Blue).
- **Manglish Localization**: Authentic "Mix Mix" copy.
- **Achievements**: Gamified badge system.
- **Receipt Parsing**: Simulated OCR and categorization.

## Important Files
- `src/components/insights-card.tsx`: Core Co-Pilot logic.
- `src/lib/achievements.ts`: Gamification logic.
- `src/lib/store.ts`: State management (Zustand).

## Troubleshooting
- If you see `sh: vite: command not found`, run `npm install` again.
- If the port 5173 is busy, Vite will automatically switch to 5174. Check the terminal output.

Happy Coding! 👨‍💻🇲🇾
