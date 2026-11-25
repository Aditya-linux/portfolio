'use client';

import { motion, useInView } from 'motion/react';
import { Fragment, useRef } from 'react';
import type { ComponentProps, Ref } from 'react';

type TagName = 'h1' | 'h2' | 'h3' | 'p';

// Masked word reveal: each word slides up from inside an overflow-hidden
// span. The clip would hide the animated word from IntersectionObserver, so
// the outer heading is observed once and drives every word with a stagger.
export function SplitReveal({
  as: Tag = 'h2',
  text,
  className,
  delay = 0,
  ...props
}: { as?: TagName; text: string; className?: string; delay?: number } & Omit<
  ComponentProps<'h2'>,
  'children'
>) {
  const words = text.split(' ');
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <Tag
      ref={ref as Ref<HTMLHeadingElement>}
      className={className ? `split-reveal ${className}` : 'split-reveal'}
      aria-label={text}
      {...props}
    >
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          {index > 0 ? ' ' : null}
          <span className="split-word" aria-hidden="true">
            <motion.span
              className="split-inner"
              initial={{ y: '110%' }}
              animate={inView ? { y: '0%' } : { y: '110%' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: delay + index * 0.05 }}
            >
              {word}
            </motion.span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}
