import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import type {Palette} from './palette';
import {lerp, scatter} from './util';

/**
 * Bloom حقيقي: نسخة مموّهة ومضخّمة من العناصر المضيئة تُدمج فوق الأصل.
 * المنطقة (x,y,w,h) تحدد حدود الحساب لتبقى خفيفة.
 */
export const Bloom: React.FC<{id: string; x: number; y: number; w: number; h: number; strength?: number; radius?: number; children: React.ReactNode}> = ({
  id,
  x,
  y,
  w,
  h,
  strength = 1.4,
  radius = 18,
  children,
}) => (
  <g>
    <defs>
      <filter id={`bloom-${id}`} filterUnits="userSpaceOnUse" x={x} y={y} width={w} height={h} colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation={radius * 0.35} result="b1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation={radius} result="b2" />
        <feColorMatrix in="b2" type="matrix" values={`${strength} 0 0 0 0  0 ${strength} 0 0 0  0 0 ${strength} 0 0  0 0 0 ${strength} 0`} result="b2s" />
        <feMerge>
          <feMergeNode in="b2s" />
          <feMergeNode in="b1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter={`url(#bloom-${id})`}>{children}</g>
  </g>
);

/** هالة ضوء ناعمة (bloom رخيص للعناصر الكبيرة كالقمر والشمس) */
export const Halo: React.FC<{id: string; cx: number; cy: number; r: number; color: string; opacity?: number; core?: number}> = ({
  id,
  cx,
  cy,
  r,
  color,
  opacity = 1,
  core = 0,
}) => (
  <g opacity={opacity}>
    <defs>
      <radialGradient id={`halo-${id}`}>
        <stop offset="0%" stopColor={color} stopOpacity={1} />
        <stop offset={`${Math.max(core, 1)}%`} stopColor={color} stopOpacity={0.85} />
        <stop offset="35%" stopColor={color} stopOpacity={0.28} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={cx} cy={cy} r={r} fill={`url(#halo-${id})`} />
  </g>
);

type Emitter = {id: string; x: number; y: number; frame: number};

/** شرر يتطاير من النار */
export const Embers: React.FC<
  Emitter & {n?: number; spread?: number; rise?: number; life?: number; size?: number; color?: string; wind?: number}
> = ({id, x, y, frame, n = 26, spread = 50, rise = 300, life = 70, size = 3.2, color = '#ffb347', wind = 30}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const L = life * (0.6 + 0.8 * random(`${id}-l${i}`));
      const a = ((frame + random(`${id}-o${i}`) * L) % L) / L;
      const sx = (random(`${id}-x${i}`) - 0.5) * spread;
      const px = x + sx + wind * a + Math.sin(a * 9 + i) * 14 * a;
      const py = y - rise * a * (0.6 + 0.6 * random(`${id}-r${i}`));
      const op = Math.sin(Math.PI * a) * (0.6 + 0.4 * Math.sin(frame / 2 + i));
      return <circle key={i} cx={px} cy={py} r={size * (1 - 0.6 * a)} fill={i % 4 === 0 ? '#fff2b0' : color} opacity={op} />;
    })}
  </g>
);

/** دخان يتصاعد ويتمدد ويتلاشى */
export const Smoke: React.FC<
  Emitter & {n?: number; rise?: number; life?: number; size?: number; color: string; drift?: number; opacity?: number}
> = ({id, x, y, frame, n = 10, rise = 520, life = 170, size = 46, color, drift = 90, opacity = 0.32}) => (
  <g>
    <defs>
      <radialGradient id={`smk-${id}`}>
        <stop offset="0%" stopColor={color} stopOpacity={1} />
        <stop offset="60%" stopColor={color} stopOpacity={0.45} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    {Array.from({length: n}, (_, i) => {
      const a = ((frame + (i / n) * life) % life) / life;
      const px = x + drift * a ** 1.4 + Math.sin(a * 5 + i * 1.7) * 22 * a;
      const py = y - rise * a;
      const r = size * (0.5 + 2.4 * a);
      const op = opacity * Math.sin(Math.PI * Math.min(1, a * 1.3)) * (1 - a);
      return <circle key={i} cx={px} cy={py} r={r} fill={`url(#smk-${id})`} opacity={op} />;
    })}
  </g>
);

/** غبار/ذرات طافية تلمع في الضوء */
export const Motes: React.FC<{id: string; frame: number; n?: number; x0: number; x1: number; y0: number; y1: number; color: string; size?: number}> = ({
  id,
  frame,
  n = 40,
  x0,
  x1,
  y0,
  y1,
  color,
  size = 2.4,
}) => (
  <g>
    {scatter(`mote-${id}`, n, x0, x1, y0, y1).map((m, i) => {
      const x = m.x + Math.sin(frame / (40 + m.r * 30) + m.p) * 30 + frame * 0.3;
      const y = m.y + Math.cos(frame / (50 + m.r * 30) + m.p) * 20 - frame * 0.15;
      return <circle key={i} cx={x} cy={y} r={size * (0.5 + m.r)} fill={color} opacity={0.25 + 0.6 * Math.sin(frame / 15 + m.p) ** 2} />;
    })}
  </g>
);

/** سحابة مرسومة: كتل متراكبة بتدرج من الحافة المضيئة إلى الظل */
export const Cloud: React.FC<{id: string; x: number; y: number; w: number; h: number; lit: string; shade: string; opacity?: number; seed?: string}> = ({
  id,
  x,
  y,
  w,
  h,
  lit,
  shade,
  opacity = 1,
  seed = id,
}) => {
  const blobs = Array.from({length: 9}, (_, i) => {
    const t = i / 8;
    const r = h * (0.45 + 0.55 * Math.sin(Math.PI * t)) * (0.75 + 0.5 * random(`${seed}-c${i}`));
    return {cx: x - w / 2 + w * t, cy: y - r * 0.35, r};
  });
  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id={`cl-${id}`} gradientUnits="userSpaceOnUse" x1={0} x2={0} y1={y - h * 1.1} y2={y + h * 0.15}>
          <stop offset="0%" stopColor={lit} />
          <stop offset="70%" stopColor={shade} />
        </linearGradient>
      </defs>
      <g fill={`url(#cl-${id})`}>
        {blobs.map((b, i) => (
          <circle key={i} cx={b.cx} cy={b.cy} r={b.r} />
        ))}
        <rect x={x - w * 0.4} y={y - h * 0.3} width={w * 0.8} height={h * 0.42} rx={h * 0.21} />
      </g>
    </g>
  );
};

/** أشعة ضوء (God rays) تنطلق من مصدر */
export const GodRays: React.FC<{id: string; cx: number; cy: number; frame: number; color: string; n?: number; len?: number; opacity?: number}> = ({
  id,
  cx,
  cy,
  frame,
  color,
  n = 11,
  len = 2600,
  opacity = 0.35,
}) => (
  <g opacity={opacity} style={{mixBlendMode: 'screen'}}>
    <defs>
      <radialGradient id={`gr-${id}`} cx={cx} cy={cy} r={len} gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    {Array.from({length: n}, (_, i) => {
      const base = -170 + (i / (n - 1)) * 160 + Math.sin(frame / 60 + i) * 2;
      const wdt = 2 + 4 * random(`${id}-w${i}`);
      const a1 = ((base - wdt / 2) * Math.PI) / 180;
      const a2 = ((base + wdt / 2) * Math.PI) / 180;
      return (
        <path
          key={i}
          d={`M ${cx} ${cy} L ${cx + Math.cos(a1) * len} ${cy + Math.sin(a1) * len} L ${cx + Math.cos(a2) * len} ${cy + Math.sin(a2) * len} Z`}
          fill={`url(#gr-${id})`}
          opacity={0.4 + 0.6 * Math.sin(frame / 25 + i * 2.1) ** 2}
        />
      );
    })}
  </g>
);

/**
 * تلوين نهائي يوحّد ألوان اللقطة (يشمل الشخصيات):
 * soft-light بتدرج اللوحة + غسلة ضوء من جهة المصدر + ظلال ملوّنة في الأطراف.
 */
export const ColorGrade: React.FC<{p: Palette; lightAt: [number, number]; lightStrength?: number}> = ({p, lightAt, lightStrength = 0.2}) => (
  <>
    <AbsoluteFill
      style={{background: `linear-gradient(${p.gradeTop}, ${p.gradeBottom})`, mixBlendMode: 'soft-light', opacity: p.gradeOpacity}}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${lightAt[0]}% ${lightAt[1]}%, ${p.light} 0%, transparent 55%)`,
        mixBlendMode: 'screen',
        opacity: lightStrength,
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 45%, transparent 50%, ${p.gradeBottom} 120%)`,
        mixBlendMode: 'multiply',
        opacity: 0.9,
      }}
    />
  </>
);

/** شريط ضباب/دخان أرضي واسع */
export const MistBand: React.FC<{id: string; frame: number; y: number; color: string; x0?: number; x1?: number; n?: number; h?: number; speed?: number}> = ({
  id,
  frame,
  y,
  color,
  x0 = -1400,
  x1 = 3300,
  n = 12,
  h = 140,
  speed = 0.5,
}) => (
  <g>
    <defs>
      <radialGradient id={`mist-${id}`}>
        <stop offset="0%" stopColor={color} stopOpacity={0.7} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    {scatter(`mist-${id}`, n, x0, x1, y - h * 0.4, y + h * 0.4).map((m, i) => {
      const w = 500 + m.r * 700;
      const x = ((m.x - x0 + frame * speed * (0.5 + m.r)) % (x1 - x0)) + x0;
      return <ellipse key={i} cx={x} cy={m.y} rx={w / 2} ry={h * (0.6 + m.r * 0.6)} fill={`url(#mist-${id})`} />;
    })}
  </g>
);

export const jitter = (seed: string, i: number, a: number, b: number) => lerp(a, b, random(`${seed}-${i}`));
