'use client';

import { DitherShader } from '@/lib/dither';

// A quiet fill for the text-only NEXUS Leads panel: a dim, slowly drifting
// field that keeps the panel's shape without competing with the screenshots.
const FIELD = `
float field(vec2 uv, vec2 res, float t) {
  float aspect = res.x / res.y;
  vec2 c = (uv - 0.5) * vec2(aspect, 1.0);
  float bands = 0.5 + 0.5 * sin((c.x * 2.6 + c.y * 1.4) * 3.14159 + t * 0.05);
  float drift = fbm(c * 1.6 + vec2(t * 0.015, -t * 0.01));
  float glow = exp(-dot(c, c) * 2.6);
  return glow * mix(0.35, 0.75, drift * bands);
}
`;

export function ProjectPlaceholder({ label }: { label: string }) {
  return (
    <div className="project-placeholder" aria-hidden="true">
      <DitherShader
        className="dither-fill"
        field={FIELD}
        matrix="bayer8"
        palette={['#F7F4FC', '#C4B5FD', '#7C3AED']}
        stillTime={5}
      />
      <span className="project-placeholder-name">{label}</span>
    </div>
  );
}
