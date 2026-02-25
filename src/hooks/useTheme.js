import { useState, useEffect } from 'react';

const STORAGE_KEY = 'catering-theme';
const LIGHT = 'emerald';
const DARK = 'forest';

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === LIGHT || stored === DARK) return stored;
  return LIGHT;
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === LIGHT ? DARK : LIGHT));
  const isDark = theme === DARK;

  return { theme, isDark, toggleTheme };
}
