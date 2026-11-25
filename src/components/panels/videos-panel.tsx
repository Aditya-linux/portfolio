'use client';

import { EditingCarousel } from '../editing-showcase';
import { PanelLabel } from './rows';

export function VideosPanel({ label = 'Videos' }: { label?: string }) {
  return (
    <>
      {label && <PanelLabel>{label}</PanelLabel>}
      <p className="panel-copy">Work Smart Tutorials · 100+ reels and 1M+ cumulative views.</p>
      <div className="panel-videos">
        <EditingCarousel />
      </div>
    </>
  );
}
