import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CharLight, CharLightCtx} from '../../characters/light';
import {Palette, toHex} from '../../lib/palette';
import {Cam, REF_FOV, Stage, perspectiveFor} from '../../lib/stage';
import {INK, mixColor, scatter} from '../../lib/util';
import {World, worldFor} from '../../world/lighting';

/* =====================================================================
 * أدوات 2.5D مشتركة لمشاهد جان دارك (فوق lib/stage بلا تعديله):
 *   - أرضية/سقف/جدران جانبية بمنظور حقيقي (Floor3D / Wall3D)
 *   - gy(d): خط الأرض على الشاشة لأي عمق، فتقف كل العناصر على أرضية واحدة
 *   - toScreen(): موقع نقطة من المسرح على الشاشة (للفقاعات والبطاقات المسطّحة)
 *   - لوحات ألوان وإضاءة شخصيات لكل مكان
 * ===================================================================== */

export const P_REF = perspectiveFor(REF_FOV);
export const kOf = (d: number) => (P_REF + d) / P_REF;

/** ارتفاع الأرضية في العالم (تحت مركز الكادر) */
export const G0 = 372;
/** خط الأرض على الشاشة عند عمق d */
export const gy = (d: number, G = G0) => 540 + G / kOf(d);

/** عمق طبقة الممثلين في مشاهد جان دارك */
export const ACT_D = 150;
export const ACT_Y = gy(ACT_D);

export const mix = (a: string, b: string, t: number) => toHex(mixColor(toHex(a), toHex(b), Math.max(0, Math.min(1, t))));

export const mixPalette = (a: Palette, b: Palette, t: number): Palette => {
  const out = {} as Record<string, unknown>;
  (Object.keys(a) as (keyof Palette)[]).forEach((k) => {
    const x = a[k];
    const y = b[k];
    out[k] = typeof x === 'number' ? x + ((y as number) - x) * t : mix(x as string, y as string, t);
  });
  return out as unknown as Palette;
};

const rad = (d: number) => (d * Math.PI) / 180;

/** إسقاط نقطة في إحداثيات العالم (مركزها وسط الكادر) عبر كاميرا المسرح */
export const projectWorld = (X: number, Y: number, Z: number, cam: Cam): {x: number; y: number; s: number} => {
  const P = perspectiveFor(cam.fov);
  let x = X - cam.x;
  let y = Y - cam.y;
  let z = Z + cam.z - P;
  const cy = Math.cos(rad(cam.ry));
  const sy = Math.sin(rad(cam.ry));
  [x, z] = [x * cy + z * sy, -x * sy + z * cy];
  const cx = Math.cos(rad(cam.rx));
  const sx = Math.sin(rad(cam.rx));
  [y, z] = [y * cx - z * sx, y * sx + z * cx];
  const cz = Math.cos(rad(cam.rz));
  const sz = Math.sin(rad(cam.rz));
  [x, y] = [x * cz - y * sz, x * sz + y * cz];
  const s = -P / z;
  return {x: 960 + x * s, y: 540 + y * s, s};
};

/** موقع نقطة (بإحداثيات طبقة عمقها d) على الشاشة + معامل التكبير الظاهري */
export const toScreen = (x: number, y: number, d: number, cam: Cam) => {
  const k = kOf(d);
  const r = projectWorld((x - 960) * k, (y - 540) * k, -d, cam);
  return {x: r.x, y: r.y, s: r.s * k};
};

/** مستوى أفقي بمنظور حقيقي (أرضية أو سقف) من العمق d0 القريب إلى d1 البعيد */
export const Floor3D: React.FC<{
  d0?: number;
  d1: number;
  /** الارتفاع في العالم: موجب = أرضية، سالب = سقف */
  G?: number;
  x0?: number;
  w?: number;
  children: (len: number) => React.ReactNode;
}> = ({d0 = -420, d1, G = G0, x0 = -2200, w = 6320, children}) => {
  const len = d1 - d0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x0,
        top: 540 + G,
        width: w,
        height: len,
        transformOrigin: '50% 0%',
        transform: `translateZ(${-d1}px) rotateX(90deg)`,
      }}
    >
      <svg width={w} height={len} viewBox={`${x0} 0 ${w} ${len}`} style={{display: 'block'}}>
        {children(len)}
      </svg>
    </div>
  );
};

/** جدار جانبي عمودي بمنظور حقيقي عند x (بإحداثيات العالم) من d0 إلى d1 */
export const Wall3D: React.FC<{x: number; d0?: number; d1: number; top?: number; h?: number; children: (len: number) => React.ReactNode}> = ({
  x,
  d0 = -420,
  d1,
  top = -700,
  h = 540 + G0 + 700,
  children,
}) => {
  const len = d1 - d0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top,
        width: len,
        height: h,
        transformOrigin: '0% 50%',
        transform: `translateZ(${-d0}px) rotateY(90deg)`,
      }}
    >
      <svg width={len} height={h} viewBox={`0 ${top} ${len} ${h}`} style={{display: 'block'}}>
        {children(len)}
      </svg>
    </div>
  );
};

/** بلاط/حجر على مستوى Floor3D */
export const FloorTiles: React.FC<{len: number; x0?: number; x1?: number; a: string; b: string; line: string; size?: number; far: string; near: string; id: string}> = ({
  len,
  x0 = -2200,
  x1 = 4120,
  a,
  b,
  line,
  size = 190,
  far,
  near,
  id,
}) => (
  <g>
    <defs>
      <linearGradient id={`ft-${id}`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={far} stopOpacity={0.75} />
        <stop offset="55%" stopColor={far} stopOpacity={0.05} />
        <stop offset="100%" stopColor={near} stopOpacity={0.6} />
      </linearGradient>
    </defs>
    <rect x={x0} y={0} width={x1 - x0} height={len} fill={a} />
    {Array.from({length: Math.ceil(len / size)}, (_, r) =>
      Array.from({length: Math.ceil((x1 - x0) / size)}, (_, c) =>
        (r * 7 + c * 5 + ((r * c) % 3)) % 4 === 0 ? <rect key={`${r}-${c}`} x={x0 + c * size + (r % 2) * size * 0.5} y={r * size} width={size} height={size} fill={b} /> : null,
      ),
    )}
    <g stroke={line} strokeWidth={5} opacity={0.6}>
      {Array.from({length: Math.ceil(len / size)}, (_, r) => (
        <line key={`h${r}`} x1={x0} x2={x1} y1={r * size} y2={r * size} />
      ))}
      {Array.from({length: Math.ceil(len / size)}, (_, r) =>
        Array.from({length: Math.ceil((x1 - x0) / size)}, (_, c) => {
          const xx = x0 + c * size + (r % 2) * size * 0.5;
          return <line key={`v${r}-${c}`} x1={xx} x2={xx} y1={r * size} y2={(r + 1) * size} />;
        }),
      )}
    </g>
    <rect x={x0} y={0} width={x1 - x0} height={len} fill={`url(#ft-${id})`} />
  </g>
);

/** صفوف أحجار غير منتظمة على واجهة (ثابتة) */
export const Masonry: React.FC<{seed: string; x: number; y: number; w: number; h: number; bw?: number; rh?: number; base: string; alt: string; line: string; lit?: string}> = ({
  seed,
  x,
  y,
  w,
  h,
  bw = 150,
  rh = 74,
  base,
  alt,
  line,
  lit,
}) => {
  const blocks = scatter(seed, Math.ceil(h / rh) * (Math.ceil(w / bw) + 2), 0, 1, 0, 1);
  const cols = Math.ceil(w / bw) + 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={base} />
      {Array.from({length: Math.ceil(h / rh)}, (_, r) =>
        Array.from({length: cols}, (_, c) => {
          const q = blocks[r * cols + c];
          const xx = x + (c - 1) * bw + (r % 2) * bw * 0.5 + (q.x - 0.5) * 22;
          const yy = y + r * rh;
          return (
            <g key={`${r}-${c}`}>
              <rect x={xx + 3} y={yy + 3} width={bw - 8} height={rh - 6} rx={9} fill={mix(base, alt, q.r)} stroke={line} strokeWidth={2.5} />
              {lit && q.y > 0.35 && <line x1={xx + 14} x2={xx + bw - 24} y1={yy + 8} y2={yy + 8} stroke={lit} strokeWidth={3} strokeLinecap="round" opacity={0.35 * q.y} />}
            </g>
          );
        }),
      )}
    </g>
  );
};

/** طبقة عناصر مسطّحة فوق المشهد (فقاعات، لافتات) لا تتأثر بالتلوين */
export const Hud: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <svg width={1920} height={1080} style={{overflow: 'hidden'}}>
      {children}
    </svg>
  </AbsoluteFill>
);

/** مسرح + إضاءة شخصيات */
export const LitStage: React.FC<{cam: Cam; light: CharLight; children: React.ReactNode}> = ({cam, light, children}) => (
  <CharLightCtx.Provider value={light}>
    <Stage cam={cam}>{children}</Stage>
  </CharLightCtx.Provider>
);

/** إطار معتم خفيف + حبيبات فيلم (أهدأ من FilmLook لأن المشهد كوميدي) */
export const SoftFilm: React.FC<{frame: number; strength?: number}> = ({frame, strength = 0.28}) => (
  <>
    <AbsoluteFill style={{background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 58%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: 'none'}} />
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.05, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <filter id="joanGrain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={frame % 24} />
      </filter>
      <rect width="100%" height="100%" filter="url(#joanGrain)" />
    </svg>
  </>
);

/* ---------------- لوحات الأماكن ---------------- */

const DAY = worldFor('day').P;
const DUSK = worldFor('dusk').P;
const NIGHT = worldFor('night').P;

/** طاولة الحرب: خريطة على خشب بضوء شموع */
export const WAR_TABLE: Palette = {
  ...DAY,
  haze: '#c9a878',
  near: '#2a1a12',
  rim: '#ffe6b8',
  light: '#ffdca0',
  warm: '#ffb860',
  smoke: '#c8b090',
  gradeTop: '#ffd8a0',
  gradeBottom: '#3a2418',
  gradeOpacity: 0.3,
};

/** واجهة قلعة شينون عند الغروب */
export const CHINON: Palette = {
  ...DUSK,
  skyTop: '#232552',
  skyMid: '#7a4668',
  horizon: '#f2a066',
  haze: '#a8788c',
  far: '#5c4a72',
  city: '#4a3f5c',
  mid: '#5a5468',
  near: '#241d30',
  rim: '#ffc090',
  light: '#ffd8a4',
  warm: '#ffb45a',
  gradeTop: '#ff9e72',
  gradeBottom: '#1c1638',
  gradeOpacity: 0.34,
};

/** تلة الشروق الذهبي (جان بالدرع) */
export const GOLDEN: Palette = {
  ...DUSK,
  skyTop: '#7c5a86',
  skyMid: '#f0985e',
  horizon: '#ffe0a0',
  haze: '#f2b888',
  far: '#b07a84',
  city: '#8a5a66',
  mid: '#6a4a52',
  near: '#2c2230',
  rim: '#fff0c4',
  light: '#fff0c8',
  warm: '#ffcf7a',
  gradeTop: '#ffc078',
  gradeBottom: '#3c1a3a',
  gradeOpacity: 0.3,
};

/** نهار المعركة والقناة */
export const CLEAR_DAY: Palette = {...DAY, gradeOpacity: 0.22, gradeBottom: '#34465e'};

/** ليل القناة (تعاقب السنوات) */
export const SEA_NIGHT: Palette = {...NIGHT, skyTop: '#0b1230', skyMid: '#1c2c5a', horizon: '#4a5e96', gradeOpacity: 0.36};

/** الليلة العاصفة حول القصر */
export const STORM: Palette = {
  ...NIGHT,
  skyTop: '#0a0f22',
  skyMid: '#1e2645',
  horizon: '#4a5280',
  haze: '#525c8c',
  far: '#2c3560',
  city: '#222a4c',
  mid: '#1a2040',
  near: '#0c1020',
  rim: '#a8bcf4',
  warm: '#ffc566',
  gradeTop: '#4a5cb0',
  gradeBottom: '#120e2c',
  gradeOpacity: 0.42,
};

/** قاعة القصر الملكي نهاراً */
export const PALACE_DAY: Palette = {
  ...DAY,
  horizon: '#fff2d4',
  haze: '#f0dfc0',
  mid: '#b89a74',
  near: '#4a3226',
  rim: '#fff4d8',
  light: '#fff0cc',
  warm: '#ffd48a',
  gradeTop: '#ffe2ac',
  gradeBottom: '#4a2a30',
  gradeOpacity: 0.28,
};

/** خلفية العناوين الزرقاء الملكية */
export const ROYAL: Palette = {
  ...NIGHT,
  skyTop: '#0e1f52',
  skyMid: '#1f4396',
  horizon: '#4a7ad0',
  haze: '#4468b4',
  near: '#0c1738',
  rim: '#ffe6a4',
  light: '#ffe8b0',
  warm: '#ffd067',
  gradeTop: '#5a80e0',
  gradeBottom: '#0e1440',
  gradeOpacity: 0.26,
};

/* ---------------- إضاءة الشخصيات ---------------- */

export const LIGHTS = {
  table: {dir: -1, key: '#ffe0a8', shadow: '#4a2c3a', ambient: 0.05, rim: 0.6} as CharLight,
  chinon: {dir: 1, key: '#ffbe84', shadow: '#3a2850', ambient: 0.12, rim: 0.85} as CharLight,
  golden: {dir: 1, key: '#fff0c0', shadow: '#6a3a56', ambient: 0.1, rim: 1} as CharLight,
  day: {dir: -1, key: '#fff6dc', shadow: '#3a3a5a', ambient: 0.02, rim: 0.5} as CharLight,
  night: {dir: 1, key: '#a8bcf0', shadow: '#16204a', ambient: 0.28, rim: 0.7} as CharLight,
  palace: {dir: -1, key: '#fff0cc', shadow: '#5a3440', ambient: 0.04, rim: 0.55} as CharLight,
  royal: {dir: -1, key: '#ffe6a0', shadow: '#1c2a66', ambient: 0.08, rim: 0.8} as CharLight,
};

export const mixLight = (a: CharLight, b: CharLight, t: number): CharLight => ({
  dir: a.dir + (b.dir - a.dir) * t > 0 ? 1 : -1,
  key: mix(a.key, b.key, t),
  shadow: mix(a.shadow, b.shadow, t),
  ambient: a.ambient + (b.ambient - a.ambient) * t,
  rim: a.rim + (b.rim - a.rim) * t,
});

export const worldWith = (time: 'dawn' | 'day' | 'dusk' | 'night', P: Palette, over: Partial<World> = {}): World => ({...worldFor(time), P, ...over});

/* ---------------- قطع صغيرة مشتركة ---------------- */

/** زهرة زنبق ذهبية */
export const Fleur: React.FC<{x: number; y: number; s?: number; fill?: string; stroke?: string}> = ({x, y, s = 1, fill = '#f2c43a', stroke = INK}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill} stroke={stroke} strokeWidth={3.5} strokeLinejoin="round">
    <path d="M 0 -46 Q 18 -14 8 10 L -8 10 Q -18 -14 0 -46 Z" />
    <path d="M -7 8 Q -46 -18 -36 16 Q -22 26 -7 12 Z" />
    <path d="M 7 8 Q 46 -18 36 16 Q 22 26 7 12 Z" />
    <rect x={-22} y={8} width={44} height={10} rx={4} />
    <path d="M -11 18 L 0 40 L 11 18 Z" />
  </g>
);

/** راية معلّقة تتمايل، بطيّات وظل */
export const HangingBanner: React.FC<{id: string; x: number; y: number; w?: number; h?: number; frame: number; c?: string; dark?: string; seed?: number}> = ({
  id,
  x,
  y,
  w = 120,
  h = 300,
  frame,
  c = '#2a55a8',
  dark = '#152c66',
  seed = 0,
}) => {
  const sw = Math.sin(frame / 26 + seed) * 7;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <linearGradient id={`hb-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={dark} />
          <stop offset="28%" stopColor={c} />
          <stop offset="52%" stopColor={dark} stopOpacity={0.85} />
          <stop offset="74%" stopColor={c} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <path d={`M ${-w / 2} 6 L ${w / 2} 6 L ${w / 2 + sw} ${h} L ${sw} ${h - w * 0.36} L ${-w / 2 + sw} ${h} Z`} fill={c} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      <path d={`M ${-w / 2} 6 L ${w / 2} 6 L ${w / 2 + sw} ${h} L ${sw} ${h - w * 0.36} L ${-w / 2 + sw} ${h} Z`} fill={`url(#hb-${id})`} opacity={0.75} />
      <Fleur x={sw * 0.45} y={h * 0.42} s={w / 150} />
      <rect x={-w / 2 - 12} y={-4} width={w + 24} height={13} rx={6} fill="#d9a82e" stroke={INK} strokeWidth={4} />
      <circle cx={-w / 2 - 14} cy={2} r={9} fill="#f2c43a" stroke={INK} strokeWidth={3.5} />
      <circle cx={w / 2 + 14} cy={2} r={9} fill="#f2c43a" stroke={INK} strokeWidth={3.5} />
    </g>
  );
};

/** أشعة دوّارة خلف العناوين (ثلاث طبقات تُحرَّك بسرعات مختلفة من الخارج) */
export const Rays: React.FC<{cx: number; cy: number; rot: number; color: string; opacity?: number; n?: number; R?: number; alt?: string}> = ({
  cx,
  cy,
  rot,
  color,
  opacity = 0.16,
  n = 16,
  R = 3200,
  alt,
}) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rot})`} opacity={opacity}>
    {Array.from({length: n}, (_, i) => {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = a0 + (Math.PI / n) * 0.98;
      return <path key={i} d={`M 0 0 L ${Math.cos(a0) * R} ${Math.sin(a0) * R} L ${Math.cos(a1) * R} ${Math.sin(a1) * R} Z`} fill={alt && i % 2 ? alt : color} />;
    })}
  </g>
);

/** صف جنود بعيد: أجسام بخوذات ورماح ورايات */
export const FarArmy: React.FC<{id: string; y: (x: number) => number; n: number; x0: number; x1: number; frame: number; c: string; rim: string; h: number; march?: number; flag?: string}> = ({id, y, n, x0, x1, frame, c, rim, h, march = 0, flag = '#2c58b4'}) => (
  <g>
    {scatter(id, n, x0, x1, 0, 1)
      .map((b) => ({...b, yy: y(b.x) + b.r * h * 0.5}))
      .sort((a, b) => a.yy - b.yy)
      .map((b, i) => {
        const x = b.x + march;
        const bob = Math.abs(Math.sin(frame * 0.28 + b.p)) * h * (march ? 0.1 : 0.03);
        const w = h * 0.36;
        return (
          <g key={i} transform={`translate(${x} ${b.yy - bob})`}>
            {i % 3 === 0 && <line x1={w * 0.6} y1={-h * 0.2} x2={w * 0.7} y2={-h * 2} stroke={c} strokeWidth={h * 0.07} />}
            {i % 9 === 0 && <path d={`M ${w * 0.7} ${-h * 2} l ${h * 0.8 + Math.sin(frame / 6 + b.p) * 4} ${h * 0.16} l ${-h * 0.8} ${h * 0.3} Z`} fill={flag} stroke={INK} strokeWidth={1.5} />}
            <path d={`M ${-w} 0 Q ${-w} ${-h * 0.62} 0 ${-h * 0.66} Q ${w} ${-h * 0.62} ${w} 0 Z`} fill={c} />
            <circle cx={0} cy={-h * 0.84} r={h * 0.25} fill={c} />
            <path d={`M ${-h * 0.25} ${-h * 0.86} A ${h * 0.25} ${h * 0.25} 0 0 1 ${h * 0.25} ${-h * 0.86}`} fill="none" stroke={rim} strokeWidth={h * 0.05} opacity={0.75} />
          </g>
        );
      })}
  </g>
);
