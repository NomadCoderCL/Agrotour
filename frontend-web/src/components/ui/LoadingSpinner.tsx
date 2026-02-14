/**
 * LoadingSpinner - Componente reutilizable de carga
 */

import React from 'react';

export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  label?: string;
}> = ({ size = 'md', fullScreen = false, label }) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  const spinner = (
    <div className={`${sizeClass} border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          {label && <p className="text-gray-600 dark:text-gray-400">{label}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {spinner}
      {label && <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
