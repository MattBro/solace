"use client";

import { useTheme } from '@/contexts/ThemeContext';

export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-3 text-2xl bg-white dark:bg-gray-800 border-2 border-gray-300 
        dark:border-gray-600 rounded-xl cursor-pointer transition-all duration-200 
        shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 
        hover:border-blue-500 dark:hover:border-blue-400 hover:-translate-y-0.5"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
}