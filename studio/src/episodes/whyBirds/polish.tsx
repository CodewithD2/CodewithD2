import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import type {Cam} from '../../lib/stage';
import {INK} from '../../lib/util';

/* =====================================================================
 * اللمسات النهائية للشورت: كاميرا محمولة، تلوين لكل مشهد، إضاءة الطيور، جسيمات.
 * كل شيء حتمي (random(seed) + الزمن) — آمن للتصيير المتوازي.
 * ===================================================================== */

/** اهتزاز يد خفيف (مجموع موجات بترددات غير متناغمة) + اهتزاز صدمة اختياري */
export const hand = (cam: Cam, t: number, amp = 1, shake?: {at: number; dur?: number; amp?: number}): Cam => {
  let x = cam.x + amp * (7 * Math.sin(t * 0.61) + 4 * Math.sin(t * 1.37 + 1.2));
  let y = cam.y + amp * (6 * Math.sin(t * 0.53 + 2.1) + 3 * Math.sin(t * 1.71));
  let rz = cam.rz + amp * (0.35 * Math.sin(t * 0.47 + 0.4) + 0.15 * Math.sin(t * 1.13));
  if (shake && t > shake.at && t < shake.at + (shake.dur ?? 0.45)) {
    const u = (t - shake.at) / (shake.dur ?? 0.45);
    const e = (1 - u) * (1 - u) * (shake.amp ?? 14);
    x += e * Math.sin(t * 61);
    y += e * Math.sin(t * 47 + 1);
    rz += e * 0.04 * Math.sin(t * 53);
  }
  return {...cam, x, y, rz};
};

/** تلوين المشهد (soft-light للتوحيد + screen لمصدر الضوء + multiply للأطراف) */
export type GradeDef = {top: string; bottom: string; opacity: number; light: string; at: [number, number]; strength?: number};
export const Grade: React.FC<{g: GradeDef}> = ({g}) => (
  <>
    <AbsoluteFill style={{background: `linear-gradient(${g.top}, ${g.bottom})`, mixBlendMode: 'soft-light', opacity: g.opacity}} />
    <AbsoluteFill style={{background: `radial-gradient(circle at ${g.at[0]}% ${g.at[1]}%, ${g.light} 0%, transparent 50%)`, mixBlendMode: 'screen', opacity: g.strength ?? 0.22}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 42%, transparent 55%, ${g.bottom} 125%)`, mixBlendMode: 'multiply', opacity: 0.85}} />
  </>
);

/** إضاءة الطائر: جهة الضوء (−1 يسار، +1 يمين) + لون الظل + لون الحافة المضيئة */
export type BirdLight = {lx: number; shadow: string; rim: string; ambient?: string; ambientOp?: number};

/** ريش يسقط ويتمايل */
export const Feathers: React.FC<{t: number; n: number; seed: string; x0?: number; x1?: number; y0?: number; y1?: number; color?: string; s?: number}> = ({t, n, seed, x0 = -100, x1 = 1180, y0 = -300, y1 = 2000, color = '#f4ede0', s = 1}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const r = random(`${seed}${i}`);
      const r2 = random(`${seed}b${i}`);
      const H = y1 - y0;
      const y = y0 + ((r2 * H + t * 60 * (0.6 + r)) % H);
      const x = x0 + r * (x1 - x0) + Math.sin(t * 1.6 + i) * 50;
      const rot = Math.sin(t * 2 + i * 1.7) * 40 + r * 180;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * (0.7 + r2 * 0.6)})`}>
          <path d="M 0 -26 Q 12 -6 2 24 Q -12 -4 0 -26 Z" fill={color} stroke={INK} strokeWidth={2.5} />
          <path d="M 0 -22 L 1 26" stroke={INK} strokeWidth={2} />
        </g>
      );
    })}
  </g>
);

/** بتلات وردية تتطاير مع الريح */
export const Petals: React.FC<{t: number; n: number; seed: string; color?: string}> = ({t, n, seed, color = '#ffc2d6'}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const r = random(`${seed}${i}`);
      const r2 = random(`${seed}b${i}`);
      const x = ((r * 1500 + t * 90 * (0.5 + r2)) % 1500) - 200;
      const y = ((r2 * 2200 + t * 70 * (0.6 + r)) % 2200) - 200 + Math.sin(t * 2 + i) * 30;
      return <ellipse key={i} cx={x} cy={y} rx={11} ry={6} fill={color} stroke={INK} strokeWidth={2} transform={`rotate(${t * 120 * (r - 0.5) + i * 40} ${x} ${y})`} opacity={0.95} />;
    })}
  </g>
);

/** يراعات تتوهج وتتجول */
export const Fireflies: React.FC<{t: number; n: number; seed: string; y0?: number; y1?: number}> = ({t, n, seed, y0 = 1100, y1 = 1900}) => (
  <g style={{mixBlendMode: 'screen'}}>
    {Array.from({length: n}, (_, i) => {
      const r = random(`${seed}${i}`);
      const r2 = random(`${seed}b${i}`);
      const x = -50 + r * 1180 + Math.sin(t * 0.7 + i) * 60;
      const y = y0 + r2 * (y1 - y0) + Math.cos(t * 0.9 + i * 1.3) * 40;
      const glow = 0.3 + 0.7 * Math.max(0, Math.sin(t * 2.2 + i * 2.7)) ** 2;
      return (
        <g key={i} opacity={glow}>
          <circle cx={x} cy={y} r={18} fill="#d8ff7a" opacity={0.25} />
          <circle cx={x} cy={y} r={5} fill="#f6ffb0" />
        </g>
      );
    })}
  </g>
);

/** خطوط ريح أفقية (للعاصفة الثلجية والطيران السريع) */
export const WindStreaks: React.FC<{t: number; n: number; seed: string; color?: string; speed?: number; vertical?: boolean; opacity?: number}> = ({t, n, seed, color = '#ffffff', speed = 900, vertical, opacity = 0.5}) => (
  <g stroke={color} strokeLinecap="round" opacity={opacity}>
    {Array.from({length: n}, (_, i) => {
      const r = random(`${seed}${i}`);
      const r2 = random(`${seed}b${i}`);
      const len = 80 + r * 160;
      const p = ((r2 * 2400 + t * speed * (0.6 + r)) % 2400) - 300;
      const q = -100 + r * (vertical ? 1280 : 2100);
      return vertical ? <path key={i} d={`M ${q} ${2000 - p} l 0 ${len}`} strokeWidth={3 + r * 3} /> : <path key={i} d={`M ${p} ${q} l ${len} ${-len * 0.12}`} strokeWidth={3 + r * 3} />;
    })}
  </g>
);

/** نفَس بارد يخرج من المنقار */
export const Breath: React.FC<{t: number; x: number; y: number; dir?: number}> = ({t, x, y, dir = 1}) => (
  <g>
    {[0, 1, 2].map((i) => {
      const ph = (t * 0.8 + i / 3) % 1;
      return <circle key={i} cx={x + dir * ph * 90} cy={y - ph * 30} r={10 + ph * 26} fill="#ffffff" opacity={(1 - ph) * 0.55} />;
    })}
  </g>
);

/** شهاب يعبر السماء مرة */
export const ShootingStar: React.FC<{t: number; at: number; x: number; y: number; dur?: number}> = ({t, at, x, y, dur = 0.8}) => {
  if (t < at || t > at + dur) return null;
  const u = (t - at) / dur;
  const hx = x + u * 520;
  const hy = y + u * 260;
  return (
    <g opacity={Math.sin(u * Math.PI)}>
      <path d={`M ${hx} ${hy} L ${hx - 220} ${hy - 110}`} stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      <circle cx={hx} cy={hy} r={7} fill="#fff" />
    </g>
  );
};

/** فراشة صغيرة */
export const Butterfly: React.FC<{x: number; y: number; t: number; color?: string; s?: number}> = ({x, y, t, color = '#ffb84a', s = 1}) => {
  const w = 0.35 + 0.65 * Math.abs(Math.sin(t * 14));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={-14 * w} cy={-6} rx={16 * w} ry={14} fill={color} stroke={INK} strokeWidth={3} />
      <ellipse cx={14 * w} cy={-6} rx={16 * w} ry={14} fill={color} stroke={INK} strokeWidth={3} />
      <ellipse cx={0} cy={0} rx={3.5} ry={12} fill={INK} />
    </g>
  );
};
