
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseStyles = "font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-scrazino-gray-800 transition-all duration-150 ease-in-out shadow-md hover:shadow-lg active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";

  const variantStyles = {
    primary: 'bg-scrazino-yellow hover:bg-scrazino-yellow-dark text-scrazino-gray-900 focus:ring-scrazino-yellow-dark',
    secondary: 'bg-scrazino-gray-600 hover:bg-scrazino-gray-700 text-white focus:ring-scrazino-gray-500 dark:bg-scrazino-gray-700 dark:hover:bg-scrazino-gray-600',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-600',
    ghost: 'bg-transparent hover:bg-scrazino-gray-200 dark:hover:bg-scrazino-gray-700 text-scrazino-gray-700 dark:text-scrazino-gray-200 focus:ring-scrazino-yellow',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
    