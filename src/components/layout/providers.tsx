'use client';
import { useAuthStore } from '@/stores/auth';
import React, { useEffect } from 'react';
import { ActiveThemeProvider } from '../active-theme';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const initializeAuth = async () => {
      await useAuthStore.getState().initialize();
    };
    initializeAuth();
  }, []);

  return (
    <>
      <LanguageProvider>
        <ActiveThemeProvider initialTheme={activeThemeValue}>
          {children}
        </ActiveThemeProvider>
      </LanguageProvider>
    </>
  );
}
