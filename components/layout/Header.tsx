
import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedLogo from '../ui/AnimatedLogo';
import ThemeToggle from '../ui/ThemeToggle';
import BalanceDisplay from '../profile/BalanceDisplay';
import { UserCircleIcon } from '../ui/icons/UserCircleIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-scrazino-gray-800 shadow-lg sticky top-0 z-40 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <AnimatedLogo />
          <nav className="flex items-center space-x-3 sm:space-x-6">
            <BalanceDisplay />
            <Link
              to="/profile"
              className="p-2 rounded-full text-scrazino-gray-600 dark:text-scrazino-gray-300 hover:bg-scrazino-gray-200 dark:hover:bg-scrazino-gray-700 transition-colors"
              title="Профиль"
            >
              <UserCircleIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
