import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// Initialize Google Auth (required for web, good practice for hybrid)
GoogleAuth.initialize();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
