// Checkbox Component - Accessible checkbox input
import React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-2 focus:ring-sky-500 cursor-pointer',
              'transition-colors duration-200',
              className
            )}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3">
            <label className="text-sm font-medium text-gray-700 cursor-pointer">
              {label}
            </label>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
