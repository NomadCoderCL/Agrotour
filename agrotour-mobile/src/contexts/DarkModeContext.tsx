/**
 * Dark Mode Context - Theme management para mobile
 * Detecta preferencia del sistema y permite toggle manual
 */

import React, { createContext, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { STORAGE_KEYS } from '../shared/config';

type ThemeMode = 'light' | 'dark' | 'auto';

interface DarkModeContextType {
  isDarkMode: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    error: string;
  };
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = React.useState<ThemeMode>('auto');
  const [isManuallySet, setIsManuallySet] = React.useState(false);

  // Load theme preference on mount
  React.useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE);
        if (saved) {
          setThemeModeState(saved as ThemeMode);
          setIsManuallySet(true);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };

    loadTheme();
  }, []);

  const isDarkMode =
    themeMode === 'dark' || (themeMode === 'auto' && systemColorScheme === 'dark');

  const colors = isDarkMode
    ? {
        background: '#1a1a1a',
        surface: '#2a2a2a',
        text: '#ffffff',
        textSecondary: '#b0b0b0',
        border: '#404040',
        primary: '#10b981',
        error: '#ef4444',
      }
    : {
        background: '#ffffff',
        surface: '#f9fafb',
        text: '#1f2937',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        primary: '#059669',
        error: '#dc2626',
      };

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    setIsManuallySet(mode !== 'auto');
    await AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, mode);
  }, []);

  const toggleDarkMode = useCallback(async () => {
    const newMode: ThemeMode = isManuallySet && themeMode !== 'auto' ? 'auto' : isDarkMode ? 'light' : 'dark';
    await setThemeMode(newMode);
  }, [isManuallySet, themeMode, isDarkMode, setThemeMode]);

  return (
    <DarkModeContext.Provider
      value={{
        isDarkMode,
        themeMode,
        setThemeMode,
        toggleDarkMode,
        colors,
      }}
    >
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode(): DarkModeContextType {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within DarkModeProvider');
  }
  return context;
}
