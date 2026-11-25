import React from 'react';
import {INK, scatter} from './util';

/** نجوم تتلألأ */
export const Stars: React.FC<{frame: number; seed?: string; n?: number; x0?: number; x1?: number; y0?: number; y1?: number; alpha?: number}> = ({
  frame,
  seed = 'st',
  n = 220,
  x0 = -1400,
  x1 = 3300,
  y0 = -700,
  y1 = 650,
  alpha = 1,
}) => (
  <g>
    {scatter(seed, n, x0, x1, y0, y1).map((s, i) => (
      <circle
        key={i}
        cx={s.x}
        cy={s.y}
        r={0.8 + s.r * 2.2}
        fill="#fff"
        opacity={alpha * (0.35 + 0.65 * Math.sin(frame / (8 + s.r * 20) + s.p) ** 2)}
      />
    ))}
  </g>
);

export const Glow: React.FC<{id: string; cx: number; cy: number; r: number; color: string; opacity?: number}> = ({
  id,
  cx,
  cy,
  r,
  color,
  opacity = 1,
}) => (
  <g opacity={opacity}>
    <defs>
      <radialGradient id={id}>
        <stop offset="0%" stopColor={color} stopOpacity={1} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
  </g>
);

export const Moon: React.FC<{cx: number; cy: number; r?: number}> = ({cx, cy, r = 62}) => (
  <g>
    <Glow id="moonglow" cx={cx} cy={cy} r={r * 5} color="#c9d6ff" opacity={0.35} />
    <circle cx={cx} cy={cy} r={r} fill="#f3f1e6" />
    <circle cx={cx - r * 0.3} cy={cy - r * 0.2} r={r * 0.18} fill="#ddd9c6" />
    <circle cx={cx + r * 0.25} cy={cy + r * 0.3} r={r * 0.12} fill="#ddd9c6" />
  </g>
);

/** سفينة شراعية بمجاديف وراية حمراء (أسلوب كرتوني بخط خارجي) */
export const Ship: React.FC<{x: number; y: number; s?: number; rot?: number; flip?: boolean; hull?: string; sail?: string; frame?: number}> = ({
  x,
  y,
  s = 1,
  rot = 0,
  flip,
  hull = '#7a4a26',
  sail = '#efe6cf',
  frame = 0,
}) => {
  const flap = Math.sin(frame / 6) * 4;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
      {/* مجاديف */}
      {[-110, -70, -30, 10, 50, 90].map((ox) => (
        <line key={ox} x1={ox} y1={-6} x2={ox - 22} y2={40} strokeWidth={6} />
      ))}
      {/* الهيكل */}
      <path d="M -190 -40 Q -205 -70 -230 -82 L -160 -30 L 150 -30 L 215 -78 Q 205 -20 150 14 L -150 14 Q -180 0 -190 -40 Z" fill={hull} />
      <path d="M -165 -12 L 160 -12" strokeWidth={3} />
      {[-120, -60, 0, 60, 120].map((ox) => (
        <circle key={ox} cx={ox} cy={-1} r={5} fill="#3b2412" strokeWidth={2} />
      ))}
      {/* السارية والشراع */}
      <rect x={-6} y={-300} width={12} height={272} fill="#5a3418" />
      <path d={`M -150 -70 L 4 -300 Q ${95 + flap} -180 110 -70 Z`} fill={sail} />
      <path d="M -150 -70 L 4 -300" strokeWidth={6} />
      {/* الراية */}
      <path d={`M 4 -298 L ${66 + flap} ${-286 + flap / 2} L 4 -270 Z`} fill="#c0262d" />
    </g>
  );
};

/** أفق المدينة: أسوار وأبراج وقباب */
export const Skyline: React.FC<{x: number; base: number; s?: number; fill: string; windows?: string; frame?: number}> = ({
  x,
  base,
  s = 1,
  fill,
  windows,
  frame = 0,
}) => {
  const dome = (cx: number, by: number, rw: number, rh: number) => `M ${cx - rw} ${by} A ${rw} ${rh} 0 0 1 ${cx + rw} ${by} Z`;
  const blds = scatter('bld', 34, 0, 1400, 0, 1);
  return (
    <g transform={`translate(${x} ${base}) scale(${s})`} fill={fill}>
      {blds.map((b, i) => (
        <rect key={i} x={b.x} y={-70 - (50 + b.y * 110)} width={36} height={50 + b.y * 110} />
      ))}
      <rect x={520} y={-300} width={300} height={170} />
      <path d={dome(670, -300, 150, 120)} />
      <path d={dome(548, -240, 62, 48)} />
      <path d={dome(792, -240, 62, 48)} />
      <rect x={664} y={-440} width={12} height={30} />
      <rect x={1000} y={-230} width={140} height={90} />
      <path d={dome(1070, -230, 70, 56)} />
      <rect x={180} y={-210} width={130} height={70} />
      <path d={dome(245, -210, 65, 50)} />
      <rect x={0} y={-70} width={1400} height={70} />
      {Array.from({length: 64}, (_, i) => (
        <rect key={`c${i}`} x={i * 22} y={-84} width={12} height={14} />
      ))}
      {[40, 300, 560, 860, 1120, 1330].map((tx) => (
        <g key={tx}>
          <rect x={tx} y={-140} width={60} height={140} />
          {[0, 16, 32, 48].map((o) => (
            <rect key={o} x={tx + o} y={-154} width={10} height={14} />
          ))}
        </g>
      ))}
      {windows &&
        blds.map((b, i) =>
          b.r > 0.45 ? (
            <rect
              key={`w${i}`}
              x={b.x + 12}
              y={-70 - (50 + b.y * 110) + 18}
              width={9}
              height={13}
              fill={windows}
              opacity={0.55 + 0.45 * Math.sin(frame / 20 + b.p)}
            />
          ) : null,
        )}
    </g>
  );
};

/** سور حجري قريب بأبراج وشرفات */
export const SeaWall: React.FC<{x: number; top: number; w: number; h?: number; stone?: string; dark?: string}> = ({
  x,
  top,
  w,
  h = 900,
  stone = '#8b8394',
  dark = '#6c6577',
}) => (
  <g stroke={INK} strokeWidth={5} strokeLinejoin="round">
    <rect x={x} y={top} width={w} height={h} fill={stone} />
    {Array.from({length: Math.ceil(w / 70)}, (_, i) => (
      <rect key={i} x={x + i * 70} y={top - 36} width={42} height={40} fill={stone} />
    ))}
    {Array.from({length: Math.ceil(h / 46)}, (_, r) =>
      Array.from({length: Math.ceil(w / 110) + 1}, (_, c) => (
        <rect
          key={`${r}-${c}`}
          x={x + c * 110 - (r % 2) * 55}
          y={top + 20 + r * 46}
          width={110}
          height={46}
          fill="none"
          stroke={dark}
          strokeWidth={3}
        />
      )),
    )}
    <rect x={x} y={top} width={w} height={h} fill="none" />
  </g>
);

/** مشعل على عمود مع لهب متراقص */
export const Torch: React.FC<{x: number; y: number; frame: number; s?: number; id: string}> = ({x, y, frame, s = 1, id}) => {
  const f = 0.8 + 0.2 * Math.sin(frame * 0.9 + x) + 0.08 * Math.sin(frame * 2.3 + y);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Glow id={`tg-${id}`} cx={0} cy={-120} r={190 * f} color="#ffa043" opacity={0.5} />
      <rect x={-6} y={-110} width={12} height={110} fill="#3a2414" stroke={INK} strokeWidth={4} />
      <path
        d={`M 0 ${-120 - 46 * f} Q ${18 * f} -130 0 -108 Q ${-18 * f} -130 0 ${-120 - 46 * f} Z`}
        fill="#ffb347"
        stroke="#e2631c"
        strokeWidth={4}
      />
      <path d={`M 0 ${-118 - 22 * f} Q 8 -122 0 -110 Q -8 -122 0 ${-118 - 22 * f} Z`} fill="#fff3b0" />
    </g>
  );
};

/** خيمة عثمانية مخروطية مخططة */
export const Tent: React.FC<{x: number; y: number; s?: number; a?: string; b?: string}> = ({x, y, s = 1, a = '#c0262d', b = '#f3ead6'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
    <path d="M -120 0 L -100 -120 L 0 -190 L 100 -120 L 120 0 Z" fill={b} />
    <path d="M -100 -120 L 0 -190 L 100 -120 Q 0 -100 -100 -120 Z" fill={a} />
    <path d="M -60 0 L -50 -120 M 60 0 L 50 -120" stroke={a} strokeWidth={14} />
    <path d="M -24 0 L 0 -70 L 24 0 Z" fill="#2a1a12" />
    <line x1={0} y1={-190} x2={0} y2={-240} />
    <path d="M 0 -240 L 42 -228 L 0 -214 Z" fill={a} />
  </g>
);

/** سطح ماء مع خطوط موج وانعكاس ضوء */
export const Water: React.FC<{
  top: number;
  frame: number;
  c1: string;
  c2: string;
  shine: string;
  reflectX?: number;
  reflectW?: number;
  x0?: number;
  x1?: number;
  id: string;
}> = ({top, frame, c1, c2, shine, reflectX, reflectW = 120, x0 = -1400, x1 = 3300, id}) => (
  <g>
    <defs>
      <linearGradient id={`wg-${id}`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={c1} />
        <stop offset="100%" stopColor={c2} />
      </linearGradient>
    </defs>
    <rect x={x0} y={top} width={x1 - x0} height={1400} fill={`url(#wg-${id})`} />
    {scatter(`wv-${id}`, 120, x0, x1, top + 10, top + 600).map((w, i) => {
      const len = 30 + w.r * 110;
      const xx = ((w.x + frame * (0.6 + w.r) - x0) % (x1 - x0)) + x0;
      return (
        <line
          key={i}
          x1={xx}
          y1={w.y}
          x2={xx + len}
          y2={w.y}
          stroke={shine}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.15 + 0.3 * Math.sin(frame / 12 + w.p) ** 2}
        />
      );
    })}
    {reflectX !== undefined &&
      Array.from({length: 16}, (_, i) => {
        const w = reflectW - i * 4 + Math.sin(frame / 8 + i) * 18;
        return <rect key={`r${i}`} x={reflectX - w / 2} y={top + 10 + i * 22} width={w} height={5} rx={2} fill={shine} opacity={0.5 - i * 0.028} />;
      })}
  </g>
);
