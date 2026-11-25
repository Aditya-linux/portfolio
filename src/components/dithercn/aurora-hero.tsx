'use client';

import { Aurora } from './aurora';
import type { AuroraProps } from './aurora';
import { useTheme } from '../theme-provider';

const LIGHT_PALETTE = ['#F7F4FC', '#EDE4FF', '#C4B5FD', '#A855F7', '#FFFFFF'] as const;
const DARK_PALETTE = ['#02070A', '#1E0A3C', '#5B21B6', '#A855F7', '#FFFFFF'] as const;

export function AuroraHero(props: AuroraProps) {
  const { dark } = useTheme();
  return (
    <Aurora
      palette={dark ? DARK_PALETTE : LIGHT_PALETTE}
      cell={2}
      curtains={4}
      height={0.36}
      spread={0.06}
      sway={1.4}
      turbulence={0.8}
      rays={10}
      length={0.8}
      glow={1.1}
      intensity={0.95}
      drift={0.25}
      stillTime={8}
      {...props}
    />
  );
}
