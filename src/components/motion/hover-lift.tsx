'use client';

import { motion, type HTMLMotionProps } from 'motion/react';
import { type ReactNode } from 'react';

interface HoverLiftProps extends Omit<HTMLMotionProps<'div'>, 'whileHover' | 'whileTap'> {
  children: ReactNode;
  lift?: number;
  scale?: number;
}

export function HoverLift({
  children,
  lift = 2,
  scale = 1.01,
  ...rest
}: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ y: -lift, scale }}
      whileTap={{ scale: scale - 0.02 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
