'use client';

import type { RefObject } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { DitherShader } from '@/lib/dither';

// Echoes the old SVG spectrum: 13 bars behind the (opaque) footer panel,
// heights from spectrumHeights [90..510] normalised by the tallest. Each bar
// fades from dense ink at the bottom to paper at its rounded top. colourField
// runs deep violet into electric purple by bar height, with a faint pink glow at the
// base of the tallest bars.
const FIELD = `
float specHeight(float k) {
  if (k < 0.5) return 0.176;
  if (k < 1.5) return 0.284;
  if (k < 2.5) return 0.441;
  if (k < 3.5) return 0.618;
  if (k < 4.5) return 0.794;
  if (k < 5.5) return 0.922;
  if (k < 6.5) return 1.0;
  if (k < 7.5) return 0.961;
  if (k < 8.5) return 0.853;
  if (k < 9.5) return 0.696;
  if (k < 10.5) return 0.52;
  if (k < 11.5) return 0.343;
  return 0.206;
}

float specBarTop(float k, float t) {
  return specHeight(k) * specMaxH * (1.0 + 0.04 * sin(t * 0.45 + k * 0.65));
}

float field(vec2 uv, vec2 res, float t) {
  float k = floor(uv.x * specBars);
  float h = specBarTop(k, t);
  float fx = fract(uv.x * specBars);
  float inside = smoothstep(0.04, 0.12, fx) * (1.0 - smoothstep(0.88, 0.96, fx));
  float fade = 1.0 - smoothstep(h * 0.1, h, uv.y);
  return pow(fade, 1.15) * inside * specIntensity;
}
`;

const COLOR_FIELD = `
vec3 colorField(vec2 uv, vec2 res, float t) {
  float k = floor(uv.x * specBars);
  float h = specHeight(k);
  float top = specBarTop(k, t);
  vec3 base = paletteColor(0.45 + 0.55 * h).rgb;
  float tall = smoothstep(0.85, 0.98, h);
  float nearBase = 1.0 - smoothstep(0.0, top * 0.2, uv.y);
  return mix(base, vec3(0.988, 0.451, 0.302), tall * nearBase * 0.8);
}
`;

export function FooterSpectrum({ footer }: { footer: RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll({ target: footer, offset: ['start end', 'end end'] });
  const clipPath = useTransform(scrollYProgress, [0, 1], ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)']);

  return (
    <motion.div className="footer-dither" style={{ clipPath }} aria-hidden="true">
      <DitherShader
        className="dither-fill"
        field={FIELD}
        colorField={COLOR_FIELD}
        palette={['#F7F4FC', '#C4B5FD', '#7C3AED']}
        stillTime={4}
        uniforms={{
          specBars: 13,
          specMaxH: 0.82,
          specIntensity: 0.9,
        }}
      />
    </motion.div>
  );
}
