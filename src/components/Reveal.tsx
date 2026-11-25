'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';

// The .reveal class lets CSS force full opacity under prefers-reduced-motion;
// branching on useReducedMotion here would fork SSR and hydration output and
// leave the hidden initial style stuck.
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className ? `reveal ${className}` : 'reveal'}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
