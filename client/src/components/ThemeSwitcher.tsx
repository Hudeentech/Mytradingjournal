import React, { useEffect, useState } from 'react';

const THEME_KEY = 'theme-preference';

type Theme = 'light' | 'dark' | 'system';

const getSystemTheme = (): Theme => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
};

const applyTheme = (theme: Theme) => {
  // Remove both classes first
  document.documentElement.classList.remove('dark');
  document.documentElement.classList.remove('light');
  if (theme === 'system') {
    if (getSystemTheme() === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('light');
    }
  } else {
    document.documentElement.classList.add(theme);
  }
};

const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem(THEME_KEY) as Theme) || 'system';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (theme === 'system') {
      const listener = () => applyTheme('system');
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
      return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
    }
  }, [theme]);

  return (
    <div className="p-4 flex flex-col gap-2 mb-4">
      <div className="grid grid-cols-3 gap-2">
        <button
          className={`px-4 py-2 rounded-lg font-medium border-2 transition-all duration-150 ${theme === 'light' ? 'bg-gradient-to-r from-gray-500 to-gray-500 text-white border-gray-400 scale-105' : 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100'}`}
          onClick={() => setTheme('light')}
        >
          Light
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium border-2 transition-all duration-150 ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-600 text-white border-gray-700 scale-105' : 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100'}`}
          onClick={() => setTheme('dark')}
        >
          Dark
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium border-2 transition-all duration-150 ${theme === 'system' ? 'bg-gradient-to-r from-green-400 to-gray-500 text-white border-green-400 scale-105' : 'bg-transparent border-gray-300 text-gray-700 hover:bg-green-50'}`}
          onClick={() => setTheme('system')}
        >
          System
        </button>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
