// Badge Component - Small label/badge for status, tags, etc.
import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gray';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-sky-100 text-sky-800',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  error: 'bg-rose-100 text-rose-800',
  info: 'bg-cyan-100 text-cyan-800',
  gray: 'bg-gray-100 text-gray-800',
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs font-medium',
  md: 'px-3 py-1 text-sm font-medium',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'sm',
  icon,
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
