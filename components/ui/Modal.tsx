
import React, { Fragment } from 'react';
import { XMarkIcon } from './icons/XMarkIcon'; // Assuming you have this icon

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-scrazino-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 m-4 w-full ${sizeClasses[size]} transform transition-all duration-300 scale-95 group-hover:scale-100 animate-fadeIn`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          {title && <h2 className="text-xl sm:text-2xl font-bold text-scrazino-gray-800 dark:text-scrazino-gray-100">{title}</h2>}
          <button
            onClick={onClose}
            className="text-scrazino-gray-400 hover:text-scrazino-gray-600 dark:text-scrazino-gray-500 dark:hover:text-scrazino-gray-300 transition-colors"
            aria-label="Закрыть модальное окно"
          >
            <XMarkIcon className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;

// Add this to tailwind.config.js (or script tag) if you need custom animation:
// keyframes: {
//   fadeIn: {
//     '0%': { opacity: '0', transform: 'scale(0.95)' },
//     '100%': { opacity: '1', transform: 'scale(1)' },
//   }
// },
// animation: {
//   fadeIn: 'fadeIn 0.3s ease-out forwards',
// }
// For this setup, I'll rely on CSS transitions on the div.
