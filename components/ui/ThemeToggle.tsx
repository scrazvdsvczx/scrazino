
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { Theme } from '../../types';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-scrazino-yellow hover:bg-scrazino-gray-200 dark:hover:bg-scrazino-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-scrazino-yellow focus:ring-offset-2 dark:focus:ring-offset-scrazino-gray-800"
      aria-label={theme === Theme.LIGHT ? "Переключить на темную тему" : "Переключить на светлую тему"}
    >
      {theme === Theme.LIGHT ? (
        <MoonIcon className="w-6 h-6" />
      ) : (
        <SunIcon className="w-6 h-6" />
      )}
    </button>
  );
};

export default ThemeToggle;
