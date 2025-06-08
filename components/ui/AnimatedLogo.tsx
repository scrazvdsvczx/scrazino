import React from 'react';
import { APP_NAME } from '../../constants';

const AnimatedLogo: React.FC = () => {
  const letters = APP_NAME.split('');

  return (
    <div className="flex items-center cursor-pointer group" onClick={() => window.location.hash = '/'}>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-scrazino-gray-800 dark:text-scrazino-gray-100 transition-colors duration-300">
        {letters.map((letter, index) => (
          <span
            key={index}
            className={`inline-block group-hover:animate-logo-pulse ${
              letter.toLowerCase() === 's' || letter.toLowerCase() === 'a' || letter.toLowerCase() === 'i'
              ? 'text-scrazino-yellow' 
              : 'text-scrazino-gray-700 dark:text-scrazino-gray-200'
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {letter}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default AnimatedLogo;