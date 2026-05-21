'use client';

import { motion, type HTMLMotionProps } from 'motion/react';
import { type ReactNode } from 'react';

type FadeDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'transition'> {
  children: ReactNode;
  direction?: FadeDirection;
  delay?: number;
  duration?: number;
  distance?: number;
}

const OFFSET: Record<FadeDirection, { x: number; y: number }> = {
  up: { x: 0, y: 16 },
  down: { x: 0, y: -16 },
  left: { x: 16, y: 0 },
  right: { x: -16, y: 0 },
  none: { x: 0, y: 0 },
};

export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  distance,
  ...rest
}: FadeInProps) {
  const base = OFFSET[direction];
  const offset = distance !== undefined
    ? { x: Math.sign(base.x) * distance, y: Math.sign(base.y) * distance }
    : base;

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
