// Traveease Design System - Theme Configuration v3.0
// Enterprise-grade design tokens for global travel platform

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',  // Main brand blue
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c3d66',
  },
  
  // Secondary Colors (Emerald for success/bookings)
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Confirmation/success
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231',
  },
  
  // Accent Colors
  accent: {
    amber: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',  // Warnings
      600: '#d97706',
      900: '#78350f',
    },
    rose: {
      50: '#fff1f2',
      100: '#ffe4e6',
      500: '#f43f5e',  // Alert/Error
      600: '#e11d48',
      900: '#831843',
    },
    cyan: {
      50: '#ecf9ff',
      500: '#06b6d4',  // Info/Active
      600: '#0891b2',
    },
  },
  
  // Neutral Colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  
  // Status Colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#f43f5e',
  info: '#06b6d4',
};

export const typography = {
  fontFamily: {
    sans: [
      'system-ui',
      '-apple-system',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ],
    serif: ['Georgia', 'serif'],
    mono: ['Menlo', 'Monaco', 'monospace'],
  },
  
  sizes: {
    xs: { size: '12px', lineHeight: '16px' },
    sm: { size: '14px', lineHeight: '20px' },
    base: { size: '16px', lineHeight: '24px' },
    lg: { size: '18px', lineHeight: '28px' },
    xl: { size: '20px', lineHeight: '28px' },
    '2xl': { size: '24px', lineHeight: '32px' },
    '3xl': { size: '30px', lineHeight: '36px' },
    '4xl': { size: '36px', lineHeight: '40px' },
  },
  
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
};

export const borderRadius = {
  none: '0',
  sm: '4px',
  base: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  elevation: {
    1: '0 2px 8px rgba(0, 0, 0, 0.08)',
    2: '0 4px 16px rgba(0, 0, 0, 0.12)',
    3: '0 8px 24px rgba(0, 0, 0, 0.16)',
  },
};

export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
  verySlow: '500ms ease-in-out',
};

export const breakpoints = {
  sm: '640px',   // Phone
  md: '768px',   // Tablet
  lg: '1024px',  // Laptop
  xl: '1280px',  // Desktop
  '2xl': '1536px', // Wide desktop
};

// Component-specific tokens
export const componentTokens = {
  button: {
    base: {
      paddingX: spacing[4],
      paddingY: spacing[2],
      borderRadius: borderRadius.base,
      fontSize: typography.sizes.base.size,
      fontWeight: typography.weights.medium,
      transition: transitions.fast,
    },
    sizes: {
      sm: {
        paddingX: spacing[3],
        paddingY: spacing[1],
        fontSize: typography.sizes.sm.size,
      },
      md: {
        paddingX: spacing[4],
        paddingY: spacing[2],
        fontSize: typography.sizes.base.size,
      },
      lg: {
        paddingX: spacing[6],
        paddingY: spacing[3],
        fontSize: typography.sizes.lg.size,
      },
    },
  },
  
  input: {
    base: {
      paddingX: spacing[3],
      paddingY: spacing[2],
      borderRadius: borderRadius.base,
      fontSize: typography.sizes.base.size,
      borderWidth: '1px',
      transition: transitions.fast,
    },
    states: {
      default: {
        borderColor: colors.neutral[300],
        backgroundColor: colors.neutral[50],
      },
      focus: {
        borderColor: colors.primary[500],
        backgroundColor: colors.neutral[50],
        outlineColor: colors.primary[500],
      },
      error: {
        borderColor: colors.error,
        backgroundColor: '#fff1f2',
      },
      disabled: {
        backgroundColor: colors.neutral[100],
        color: colors.neutral[400],
        cursor: 'not-allowed',
      },
    },
  },
  
  card: {
    base: {
      borderRadius: borderRadius.lg,
      backgroundColor: colors.neutral[50],
      borderColor: colors.neutral[200],
      borderWidth: '1px',
      padding: spacing[6],
      boxShadow: shadows.sm,
      transition: transitions.base,
    },
    hover: {
      boxShadow: shadows.md,
      borderColor: colors.neutral[300],
    },
  },
  
  modal: {
    backdrop: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(2px)',
    },
    content: {
      borderRadius: borderRadius['2xl'],
      boxShadow: shadows['2xl'],
      backgroundColor: colors.neutral[50],
    },
  },
};

export const gradients = {
  primaryGradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
  successGradient: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
  warningGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  errorGradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
  surfaceGradient: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
};

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  notification: 1070,
};
