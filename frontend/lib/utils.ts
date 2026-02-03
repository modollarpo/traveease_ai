// Common utilities for component styling and patterns
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind CSS classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get variant styles based on props
export function getVariantStyles(
  base: string,
  variants?: Record<string, Record<string, string>>,
  {
    variant,
    size,
    state,
  }: {
    variant?: string;
    size?: string;
    state?: string;
  } = {}
): string {
  let classes = base;
  
  if (variant && variants?.[variant]) {
    classes = cn(classes, variants[variant][variant]);
  }
  
  if (size && variants?.sizes?.[size]) {
    classes = cn(classes, variants.sizes[size]);
  }
  
  if (state && variants?.states?.[state]) {
    classes = cn(classes, variants.states[state]);
  }
  
  return classes;
}

// Common button styles
export const buttonVariants = {
  primary: 'bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
  outline: 'border border-gray-300 text-gray-900 hover:bg-gray-50 active:bg-gray-100',
  ghost: 'text-gray-900 hover:bg-gray-100 active:bg-gray-200',
  danger: 'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700',
};

export const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm font-medium',
  md: 'px-4 py-2 text-base font-medium',
  lg: 'px-6 py-3 text-lg font-medium',
  xl: 'px-8 py-4 text-xl font-medium',
};

// Common input styles
export const inputStyles = {
  base: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200',
};

// Common card styles
export const cardStyles = {
  base: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6',
  compact: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4',
};

// Responsive utilities
export const responsive = {
  mobileOnly: 'block md:hidden',
  tabletUp: 'hidden md:block',
  desktopUp: 'hidden lg:block',
};

// Animation utilities
export const animations = {
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-300',
  slideIn: 'animate-in slide-in-from-bottom duration-300',
  slideOut: 'animate-out slide-out-to-bottom duration-300',
};
