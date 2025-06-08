
import React from 'react';
import { APP_NAME } from '../../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-scrazino-gray-800 border-t border-scrazino-gray-200 dark:border-scrazino-gray-700 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
        <p className="text-sm text-scrazino-gray-500 dark:text-scrazino-gray-400">
          &copy; {new Date().getFullYear()} {APP_NAME}. Все права защищены.
        </p>
        <p className="text-xs text-scrazino-gray-400 dark:text-scrazino-gray-500 mt-1">
          Только для развлекательных целей. Играйте ответственно.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
