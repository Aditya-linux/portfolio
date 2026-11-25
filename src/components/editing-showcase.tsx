'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';

function HoverClip({ src, poster, title, volume, active = true, onSelect }: { src: string; poster: string; title: string; volume: number; active?: boolean; onSelect?: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const audio = useRef<{ context: AudioContext; gain: GainNode } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    const player = video.current;
    if (!player) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio < 0.5) player.pause();
    }, { threshold: 0.5 });
    observer.observe(player);
    return () => {
      observer.disconnect();
      player.pause();
      if (audio.current) void audio.current.context.close();
    };
  }, []);

  useEffect(() => {
    if (audio.current) audio.current.gain.gain.value = volume / 100;
    else if (video.current) video.current.volume = volume / 100;
    if (video.current) video.current.muted = !soundEnabled || volume === 0;
  }, [volume, soundEnabled]);

  useEffect(() => {
    if (!active) video.current?.pause();
  }, [active]);

  const togglePlayback = () => {
    if (!active) {
      onSelect?.();
      return;
    }
    const player = video.current;
    if (!player) return;
    if (!player.paused && (!player.muted || (audio.current && volume === 0))) {
      player.pause();
      return;
    }
    // A gain node makes the volume slider work on iOS, which ignores media.volume.
    if (!audio.current) {
      const context = new AudioContext();
      const gain = context.createGain();
      context.createMediaElementSource(player).connect(gain).connect(context.destination);
      audio.current = { context, gain };
      player.volume = 1;
    }
    audio.current.gain.gain.value = volume / 100;
    player.muted = volume === 0;
    setSoundEnabled(true);
    void audio.current.context.resume().catch(() => {});
    void player.play().catch(() => {});
  };

  return (
    <div className={`hover-clip${playing ? ' is-playing' : ''}`}>
      <video
        ref={video}
        src={src}
        poster={poster}
        aria-label={title}
        playsInline
        loop
        muted={!soundEnabled || volume === 0}
        preload="metadata"
        onPlay={(event) => {
          setPlaying(true);
          event.currentTarget.closest('.editing-track')?.querySelectorAll('video').forEach((other) => {
            if (other !== event.currentTarget) other.pause();
          });
        }}
        onPause={() => setPlaying(false)}
      />
      <Image src={poster} alt="" fill sizes="(max-width: 800px) 220px, 340px" aria-hidden="true" />
      <div
        className="editing-play"
        role="button"
        tabIndex={active ? 0 : -1}
        aria-label={`${!active ? 'Show' : playing && !soundEnabled ? 'Enable audio for' : playing ? 'Pause' : 'Play'} ${title}`}
        onClick={togglePlayback}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            togglePlayback();
          }
        }}
        onPointerEnter={(event) => {
          if (active && event.pointerType !== 'touch') {
            const player = video.current;
            if (!player) return;
            player.muted = volume === 0;
            setSoundEnabled(true);
            if (audio.current) void audio.current.context.resume().catch(() => {});
            void player.play().catch(() => {
              player.muted = true;
              setSoundEnabled(false);
              void player.play().catch(() => {});
            });
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== 'touch') video.current?.pause();
        }}
      >
        {active && !playing && <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>}
      </div>
    </div>
  );
}

// Static poster for a clip with no video file; the caption links to where it can be watched.
function ClipPoster({ poster }: { poster: string }) {
  return (
    <div className="hover-clip">
      <Image src={poster} alt="" fill sizes="(max-width: 800px) 220px, 340px" aria-hidden="true" />
    </div>
  );
}

// The client edits aren't redistributed with the source, so clips have no `src` and show their poster.
// Add a `src` (e.g. /videos/clip.mp4) to make a clip playable; the volume control appears with it.
const editingClips: { title: string; src?: string; poster: string; instagramUrl?: string }[] = [
  { title: 'Moment of Inertia', poster: '/videos/moment-of-inertia.jpg' },
  { title: 'Fatty liver', poster: '/videos/fatty-liver.jpg', instagramUrl: 'https://www.instagram.com/reel/DNrzNoj0Gc1/' },
  { title: 'Dal Lake', poster: '/videos/dal-lake.jpg', instagramUrl: 'https://www.instagram.com/reel/DZMt-44Io3-/' },
  { title: 'Commerce & government', poster: '/videos/commerce-and-government.jpg', instagramUrl: 'https://www.instagram.com/reel/DOWMP2BCPa0/' },
  { title: 'Microwave Edit', poster: '/videos/microwave-edit.jpg', instagramUrl: 'https://www.instagram.com/reel/DCQwCEdNJYh/' },
];

export function VolumeSlider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <label className="editing-volume">
      <VolumeIcon />
      <input type="range" min={0} max={100} step={1} value={value} aria-label="Volume" onChange={(event) => onChange(Number(event.currentTarget.value))} />
      <VolumeIcon loud />
    </label>
  );
}

export function EditingCarousel() {
  const [volume, setVolume] = useState(50);
  const [carouselRef, carousel] = useEmblaCarousel({
    loop: false,
    align: 'start',
    startIndex: 0,
    breakpoints: { '(prefers-reduced-motion: reduce)': { duration: 0 } },
  });

  return (
    <div className="editing-showcase">
      {editingClips.some((clip) => clip.src) && <VolumeSlider value={volume} onChange={setVolume} />}
      <div
        className="editing-carousel"
        ref={carouselRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Edited videos. Swipe or drag to browse."
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            if (event.key === 'ArrowLeft') carousel?.scrollPrev();
            else carousel?.scrollNext();
          }
        }}
      >
        <div className="editing-track">
          {editingClips.map((clip, index) => (
            <div className="editing-slide" key={clip.poster} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${editingClips.length}`}>
              <div className="editing-slide-content">
                <div className="editing-phone">
                  <div className="editing-stage">{clip.src ? <HoverClip {...clip} src={clip.src} volume={volume} /> : <ClipPoster poster={clip.poster} />}</div>
                </div>
                <strong className="editing-caption">
                  {clip.instagramUrl ? (
                    <a href={clip.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${clip.title} on Instagram (opens in a new tab)`}>
                      {clip.title} <span aria-hidden="true">↗</span>
                    </a>
                  ) : clip.title}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="editing-controls" role="group" aria-label="Video navigation">
        <button type="button" aria-label="Previous video" disabled={!carousel} onClick={() => carousel?.scrollPrev()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m10 6-6 6 6 6M4 12h16" /></svg>
        </button>
        <button type="button" aria-label="Next video" disabled={!carousel} onClick={() => carousel?.scrollNext()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6 6 6-6 6M20 12H4" /></svg>
        </button>
      </div>
    </div>
  );
}

function VolumeIcon({ loud = false }: { loud?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4z" />
    <path d="M15 8a6 6 0 0 1 0 8" />
    {loud && <path d="M18 5a10 10 0 0 1 0 14" />}
  </svg>;
}
