import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';

// Initialize Google Auth only on native platforms (silently fail on web/iOS simulator)
try {
    if (Capacitor.isNativePlatform()) {
        GoogleAuth.initialize({
            clientId: '85489326202-4mpe49njcl286o6c75h1vmqigv5eud5h.apps.googleusercontent.com',
            scopes: ['profile', 'email'],
        });
    }
} catch (e) {
    console.warn('GoogleAuth initialization skipped:', e);
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
