'use client';

import { motion, type HTMLMotionProps } from 'motion/react';
import { type ReactNode } from 'react';

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'whileInView' | 'viewport'> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
}

export function Reveal({
  children,
  delay = 0,
  duration = 0.6,
  distance = 24,
  once = true,
  ...rest
}: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
