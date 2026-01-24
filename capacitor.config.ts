import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myreceipt.app',
  appName: 'Duitrack',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '85489326202-4mpe49njcl286o6c75h1vmqigv5eud5h.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
