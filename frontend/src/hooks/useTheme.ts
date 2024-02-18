// src/hooks/useTheme.ts
import { useState, useEffect } from 'react';
import { getInitialTheme, setTheme } from '@/utils/userDarkMode';

const useTheme = () => {
  const [theme, setThemeState] = useState(getInitialTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    setTheme(newTheme);
  };

  return { theme, toggleTheme };
};

export default useTheme;
