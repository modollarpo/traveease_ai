// TextArea Component - Multi-line text input
import React from 'react';
import { cn } from '@/lib/utils';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rows?: number;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      rows = 4,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          rows={rows}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200',
            'text-gray-900 placeholder-gray-400 resize-none',
            error
              ? 'border-rose-500 focus:ring-rose-500 bg-rose-50'
              : 'border-gray-300 focus:ring-sky-500 focus:border-transparent bg-white',
            disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed',
            className
          )}
          {...props}
        />
        
        {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        {helperText && !error && <p className="mt-2 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
