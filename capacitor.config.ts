import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.infex.accountmanagement',
  appName: 'Account Management',
  webDir: 'public',
  server: {
    // Live Vercel Production URL
    url: 'https://account-management-sigma-one.vercel.app',
    cleartext: true
  }
};

export default config;
