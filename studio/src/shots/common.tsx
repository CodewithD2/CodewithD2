import React from 'react';
import {scatter} from '../lib/util';

/** شريط ضباب متحرك (يوضع في طبقة أمامية مع blur) */
export const Fog: React.FC<{frame: number; y: number; color: string; seed?: string}> = ({frame, y, color, seed = 'fog'}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    {scatter(seed, 9, -900, 2600, y - 60, y + 80).map((p, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: p.x + frame * (0.6 + p.r),
          top: p.y,
          width: 700 + p.r * 600,
          height: 160 + p.r * 120,
          borderRadius: '50%',
          background: `radial-gradient(closest-side, ${color}, transparent)`,
          opacity: 0.55,
        }}
      />
    ))}
  </div>
);

/** حبيبات فيلم وإطار معتم — لمسة سينمائية فوق كل اللقطات */
export const FilmLook: React.FC<{frame: number}> = ({frame}) => (
  <>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
        pointerEvents: 'none',
      }}
    />
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'overlay'}}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 30} />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  </>
);
