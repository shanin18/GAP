'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';

type Theme = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

export function ThemeProvider({ initialTheme, children }: { initialTheme: Theme; children: ReactNode }) {
  const [theme, setTheme] = useState(initialTheme);
  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    document.cookie = `gap-theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    setTheme(next);
  }
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle() {
  const context = useContext(ThemeContext);
  if (!context) return null;
  const { theme, toggle } = context;
  return <Button variant="ghost" size="icon" onClick={toggle} aria-label="Dark mode" aria-pressed={theme === 'dark'} title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
    {theme === 'light' ? <Moon aria-hidden="true" size={19} /> : <Sun aria-hidden="true" size={19} />}
  </Button>;
}
