'use client';

import { motion, type HTMLMotionProps } from 'motion/react';
import { type ReactNode } from 'react';

interface StaggerProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'variants'> {
  children: ReactNode;
  delay?: number;
  staggerChildren?: number;
  once?: boolean;
}

export function Stagger({
  children,
  delay = 0,
  staggerChildren = 0.08,
  once = true,
  ...rest
}: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: '-80px' }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren, delayChildren: delay },
        },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode;
  distance?: number;
}

export function StaggerItem({ children, distance = 16, ...rest }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: distance },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
        },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
