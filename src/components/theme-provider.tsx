'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatedThemeToggler } from '../AnimatedThemeToggler';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  dark: boolean;
  setDark: (dark: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'aditya-portfolio-theme';

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const preferred =
      stored === 'dark' || stored === 'light'
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    setTheme(preferred);
    applyTheme(preferred);
    setReady(true);
  }, []);

  const setDark = useCallback((dark: boolean) => {
    const next: Theme = dark ? 'dark' : 'light';
    setTheme(next);
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ theme, dark: theme === 'dark', setDark }),
    [theme, setDark],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
      {ready && (
        <div className="theme-toggle-wrap">
          <AnimatedThemeToggler dark={theme === 'dark'} onThemeChange={setDark} />
        </div>
      )}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
