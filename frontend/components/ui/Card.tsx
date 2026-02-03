// Card Component - Flexible container for content
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'compact' | 'elevated' | 'outlined';
  interactive?: boolean;
}

const variantStyles = {
  default: 'bg-white rounded-lg border border-gray-200 shadow-sm p-6',
  compact: 'bg-white rounded-lg border border-gray-200 shadow-sm p-4',
  elevated: 'bg-white rounded-lg shadow-lg p-6',
  outlined: 'bg-transparent rounded-lg border-2 border-gray-200 p-6',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', interactive = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          variantStyles[variant],
          interactive && 'hover:shadow-md cursor-pointer transition-shadow duration-200',
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

// Card Header
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4 pb-4 border-b border-gray-200', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

// Card Title
export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold text-gray-900', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

// Card Description
export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-gray-600 mt-2', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

// Card Content
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

// Card Footer
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-6 pt-6 border-t border-gray-200 flex gap-3', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';
