'use client';

import { DitherShader } from '@/lib/dither';
import type { DitherShaderProps } from '@/lib/dither';

// A faint haze rising from below the hero. The smoothstep vignette pulls the
// tone to 0 before the bottom and side edges, and the distance mask keeps the
// ground under the centred text near-black (tone <= 0.15).
const FIELD = `
float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  vec2 c = (uv - 0.5) * vec2(aspect, 1.0);
  vec2 g = c - vec2(0.0, -0.58);
  float glow = exp(-dot(g, g) * 3.0);
  float drift = 0.85 + 0.15 * fbm(c * 1.8 + vec2(t * 0.02, t * 0.008));
  float away = smoothstep(0.04, 0.6, length(c));
  float vignette = smoothstep(0.0, 0.26, uv.y)
                 * smoothstep(0.0, 0.12, uv.x)
                 * smoothstep(1.0, 0.88, uv.x);
  return glow * drift * mix(0.18, 1.0, away) * vignette * heroIntensity;
}
`;

export function HeroGlow(props: Omit<DitherShaderProps, 'field' | 'uniforms'>) {
  return (
    <DitherShader
      {...props}
      field={FIELD}
      matrix="bayer8"
      palette={['--dither-paper', '--dither-ink']}
      stillTime={6}
      uniforms={{ heroIntensity: 0.8 }}
    />
  );
}
