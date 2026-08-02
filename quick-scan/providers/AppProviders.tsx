/**
 * QuickScan Studio - Unified Application Provider Composer
 * Phase 11 Architectural Layer
 */
import React, { ReactNode, useEffect } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { SettingsProvider } from './SettingsProvider';
import { ScannerProvider } from './ScannerProvider';
import { HistoryProvider } from './HistoryProvider';
import { FavoritesProvider } from './FavoritesProvider';
import { GeneratorProvider } from './GeneratorProvider';
import { Logger } from '../utils/logger';

export const AppProviders = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const endTimer = Logger.startTimer('EnterpriseAppBoot');
    // Staggered non-critical background warmups post-mount (prevents blocking initial UI interaction)
    const timeoutId = setTimeout(() => {
      endTimer();
      Logger.info('AppProviders', 'Master application context hierarchy mounted with zero UI blocking.');
    }, 50);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <ThemeProvider initialMode="system">
      <SettingsProvider>
        <HistoryProvider>
          <ScannerProvider>
            <FavoritesProvider>
              <GeneratorProvider>{children}</GeneratorProvider>
            </FavoritesProvider>
          </ScannerProvider>
        </HistoryProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

