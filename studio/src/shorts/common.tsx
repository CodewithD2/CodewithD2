import React from 'react';
import {random} from 'remotion';
import {INK, clamp, easeOutBack, prog} from '../lib/util';

/** ظهور بقفزة: 0→1 مع تجاوز بسيط */
export const pop = (t: number, t0: number, d = 0.35) => (t < t0 ? 0 : easeOutBack(prog(t, t0, t0 + d)));
export const fade = (t: number, a: number, b: number, c = Infinity, d = Infinity) => clamp(Math.min(prog(t, a, b), Number.isFinite(c) ? 1 - prog(t, c, d) : 1));

/** نص عربي بحد خارجي (يُرسم داخل svg) */
export const Txt: React.FC<{x: number; y: number; size: number; fill?: string; stroke?: string; sw?: number; children: React.ReactNode; weight?: number; opacity?: number; anchor?: 'middle' | 'start' | 'end'}> = ({
  x,
  y,
  size,
  fill = '#fff',
  stroke = INK,
  sw,
  children,
  weight = 700,
  opacity = 1,
  anchor = 'middle',
}) => (
  <text
    x={x}
    y={y}
    fontFamily="Amiri"
    fontWeight={weight}
    fontSize={size}
    textAnchor={anchor}
    direction="rtl"
    fill={fill}
    stroke={stroke}
    strokeWidth={sw ?? size * 0.14}
    strokeLinejoin="round"
    style={{paintOrder: 'stroke'}}
    opacity={opacity}
  >
    {children}
  </text>
);

/** شارة القناة «ليه ولماذا؟» */
export const ChannelBadge: React.FC<{x: number; y: number; s?: number; opacity?: number}> = ({x, y, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <rect x={-190} y={-54} width={380} height={96} rx={48} fill="#ffcf3a" stroke={INK} strokeWidth={6} />
    <circle cx={150} cy={-6} r={32} fill="#fff" stroke={INK} strokeWidth={5} />
    <Txt x={150} y={10} size={46} fill={INK} stroke="none" sw={0}>
      ؟
    </Txt>
    <Txt x={-20} y={12} size={50} fill={INK} stroke="none" sw={0}>
      ليه ولماذا
    </Txt>
  </g>
);

/** بطاقة معلومة صغيرة بأيقونة + نص */
export const InfoCard: React.FC<{x: number; y: number; k: number; label: string; icon: React.ReactNode; color?: string; w?: number}> = ({x, y, k, label, icon, color = '#fff8e6', w = 560}) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <rect x={-w / 2} y={-62} width={w} height={124} rx={30} fill={color} stroke={INK} strokeWidth={6} />
      <g transform={`translate(${w / 2 - 70} 0)`}>{icon}</g>
      <Txt x={-40} y={18} size={56} fill={INK} stroke="none" sw={0}>
        {label}
      </Txt>
    </g>
  );

/** علامة ✗ حمراء فوق أيقونة */
export const Cross: React.FC<{k: number; r?: number}> = ({k, r = 44}) =>
  k <= 0 ? null : (
    <g transform={`scale(${k})`} stroke="#d8322e" strokeWidth={13} strokeLinecap="round">
      <path d={`M ${-r} ${-r} L ${r} ${r} M ${r} ${-r} L ${-r} ${r}`} />
    </g>
  );

/** حشرة كرتونية صغيرة تطير */
export const Bug: React.FC<{x: number; y: number; s?: number; frame: number; seed?: number}> = ({x, y, s = 1, frame, seed = 0}) => {
  const w = Math.abs(Math.sin(frame * 1.3 + seed)) * 10;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={-6} cy={-12} rx={10} ry={6 + w * 0.6} fill="#e8f4ff" stroke={INK} strokeWidth={3} opacity={0.9} />
      <ellipse cx={6} cy={-12} rx={10} ry={6 + w * 0.6} fill="#e8f4ff" stroke={INK} strokeWidth={3} opacity={0.9} />
      <ellipse cx={0} cy={0} rx={13} ry={10} fill="#3a7d3a" stroke={INK} strokeWidth={3.5} />
      <circle cx={10} cy={-3} r={3} fill={INK} />
    </g>
  );
};

/** بذرة */
export const Seed: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 -26 Q 22 0 0 26 Q -22 0 0 -26 Z" fill="#d9a35a" stroke={INK} strokeWidth={4} />
    <path d="M 0 -16 Q 6 0 0 16" stroke="#9a6a2e" strokeWidth={3} fill="none" />
  </g>
);

/** ميزان حرارة */
export const Thermo: React.FC<{x: number; y: number; level: number; s?: number}> = ({x, y, level, s = 1}) => {
  const col = level < 0.4 ? '#3a8ee8' : level < 0.7 ? '#f0a020' : '#e8402a';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-18} y={-120} width={36} height={130} rx={18} fill="#fff" stroke={INK} strokeWidth={5} />
      <rect x={-8} y={-110 + (1 - level) * 100} width={16} height={10 + level * 100} rx={8} fill={col} />
      <circle cx={0} cy={22} r={28} fill={col} stroke={INK} strokeWidth={5} />
    </g>
  );
};

/** ندف ثلج حتمية تتساقط */
export const Snow: React.FC<{frame: number; n: number; seed: string; x0?: number; x1?: number; y0?: number; y1?: number; size?: number; speed?: number; opacity?: number}> = ({
  frame,
  n,
  seed,
  x0 = -200,
  x1 = 1280,
  y0 = -200,
  y1 = 2100,
  size = 7,
  speed = 3,
  opacity = 0.9,
}) => (
  <g fill="#fff" opacity={opacity}>
    {Array.from({length: n}, (_, i) => {
      const r = random(`${seed}-${i}`);
      const r2 = random(`${seed}-b${i}`);
      const H = y1 - y0;
      const y = y0 + ((r2 * H + frame * speed * (0.6 + r)) % H);
      const x = x0 + r * (x1 - x0) + Math.sin(frame * 0.05 + i) * 18;
      return <circle key={i} cx={x} cy={y} r={size * (0.5 + r2)} />;
    })}
  </g>
);
