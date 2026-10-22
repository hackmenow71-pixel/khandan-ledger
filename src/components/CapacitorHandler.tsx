"use client";

import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { useRouter, usePathname } from 'next/navigation';

export function CapacitorHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only run this if we are running natively inside Capacitor
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      const listener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        // If we are on the dashboard or login screen, let the app exit
        if (pathname === '/' || pathname === '/en' || pathname === '/ur' || pathname?.includes('/login')) {
          CapacitorApp.exitApp();
        } else {
          // Otherwise, just go back in the Next.js router history
          router.back();
        }
      });

      return () => {
        listener.then(l => l.remove());
      };
    }
  }, [router, pathname]);

  return null;
}
