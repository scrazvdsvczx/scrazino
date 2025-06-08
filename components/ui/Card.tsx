
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`bg-white dark:bg-scrazino-gray-800 shadow-xl hover:shadow-2xl rounded-xl p-4 md:p-6 transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;