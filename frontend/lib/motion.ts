import type { MotionProps } from "framer-motion";

/**
 * Shared Framer Motion configs for the Traveease design system.
 *
 * "Puffy" interactions use a springy scale-tap effect that feels soft,
 * in line with the 2026 "gummy" skeuomorphism aesthetic.
 */

export const puffyTap: MotionProps = {
  whileTap: { scale: 0.95 },
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 32,
    mass: 0.6,
  },
};

export const fadeInUp: MotionProps = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.3,
    ease: "easeOut",
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};
