import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('Main.tsx executing...');
const root = document.getElementById('root');
console.log('Root element:', root);

if (!root) {
    console.error('FATAL: Root element not found!');
} else {
    try {
        createRoot(root).render(
            <StrictMode>
                <App />
            </StrictMode>,
        );
        console.log('App mounted successfully');
    } catch (e) {
        console.error('Error mounting app:', e);
    }
}
