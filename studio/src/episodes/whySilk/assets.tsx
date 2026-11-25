import React from 'react';
import {random} from 'remotion';
import {INK} from '../../lib/util';
import {WORLD_LAND} from '../../world/maps/worldLand';
import type {LonLat} from '../../world/maps/europeData';
import {Txt} from '../../shorts/common';

/* =====================================================================
 * أصول شورت «لماذا سُمّي بطريق الحرير؟» — أصلية بأسلوب القناة.
 * ===================================================================== */

/** علامة X حمراء ضخمة (k = حجم/ظهور) */
export const BigX: React.FC<{x: number; y: number; k: number; r?: number}> = ({x, y, k, r = 330}) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${k}) rotate(${(1 - Math.min(1, k)) * -20})`}>
      <path d={`M ${-r} ${-r} L ${r} ${r} M ${r} ${-r} L ${-r} ${r}`} stroke={INK} strokeWidth={110} strokeLinecap="round" />
      <path d={`M ${-r} ${-r} L ${r} ${r} M ${r} ${-r} L ${-r} ${r}`} stroke="#e0302a" strokeWidth={78} strokeLinecap="round" />
      <path d={`M ${-r + 30} ${-r + 10} L ${-r * 0.2} ${-r * 0.55}`} stroke="#ff8a7a" strokeWidth={18} strokeLinecap="round" opacity={0.7} />
    </g>
  );

/* ---------- الخريطة: من أوروبا إلى الصين ---------- */
export const SMAP = {lon0: -12, lon1: 126, lat0: 12, lat1: 60, x: 40, y: 360, w: 1000};
const SK = SMAP.w / (SMAP.lon1 - SMAP.lon0);
export const SMAP_H = (SMAP.lat1 - SMAP.lat0) * SK * 1.35;
export const sm = ([lon, lat]: LonLat): [number, number] => [SMAP.x + (lon - SMAP.lon0) * SK, SMAP.y + (SMAP.lat1 - lat) * SK * 1.35];
const sline = (pts: LonLat[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${sm(p)[0].toFixed(1)} ${sm(p)[1].toFixed(1)}`).join(' ');

/** مدن رئيسية (إحداثيات حقيقية) */
export const CITIES: Record<string, LonLat> = {
  changan: [108.9, 34.3],
  dunhuang: [94.7, 40.1],
  kashgar: [76.0, 39.5],
  samarkand: [67.0, 39.6],
  merv: [61.8, 37.6],
  baghdad: [44.4, 33.3],
  antioch: [36.2, 36.2],
  constantinople: [28.97, 41.0],
  venice: [12.3, 45.4],
  alexandria: [29.9, 31.2],
  tyre: [35.2, 33.3],
  bukhara: [64.4, 39.8],
  herat: [62.2, 34.3],
  turfan: [89.2, 42.9],
  kabul: [69.2, 34.5],
};

/** شبكة طرق متشابكة «فوضوية» (فروع حقيقية مبسّطة + انحناءات) */
export const ROUTES: LonLat[][] = [
  [CITIES.changan, [103, 36.5], CITIES.dunhuang, CITIES.turfan, [82, 43], CITIES.kashgar],
  [CITIES.dunhuang, [88, 39], [81, 38], CITIES.kashgar],
  [CITIES.kashgar, [72, 40.5], CITIES.samarkand, CITIES.bukhara, CITIES.merv],
  [CITIES.kashgar, [73, 37], CITIES.kabul, CITIES.herat, CITIES.merv],
  [CITIES.merv, [55, 36.5], [50, 35], CITIES.baghdad],
  [CITIES.baghdad, [40, 35], CITIES.antioch, CITIES.constantinople],
  [CITIES.baghdad, [38, 33], CITIES.tyre, [32, 32], CITIES.alexandria],
  [CITIES.constantinople, [22, 40], [16, 41], CITIES.venice],
  [CITIES.alexandria, [22, 35], [16, 39], CITIES.venice],
  [CITIES.samarkand, [60, 42], [52, 44], [42, 43], CITIES.constantinople],
];

/** طريق «رئيسي» واحد للأيقونات المتطايرة (الصين ← أوروبا) */
export const MAIN_ROUTE: LonLat[] = [CITIES.changan, CITIES.dunhuang, CITIES.kashgar, CITIES.samarkand, CITIES.merv, CITIES.baghdad, CITIES.antioch, CITIES.constantinople, CITIES.venice];

/** مسار مع اهتزاز «فوضوي» حتمي */
const wobbly = (pts: LonLat[], seed: string) => {
  const out: string[] = [];
  pts.forEach((p, i) => {
    const [x, y] = sm(p);
    if (i === 0) return out.push(`M ${x} ${y}`);
    const [px, py] = sm(pts[i - 1]);
    const mx = (x + px) / 2 + (random(`${seed}${i}`) - 0.5) * 50;
    const my = (y + py) / 2 + (random(`${seed}y${i}`) - 0.5) * 50;
    out.push(`Q ${mx} ${my} ${x} ${y}`);
  });
  return out.join(' ');
};

export const SilkMap: React.FC<{id: string; draw: number; children?: React.ReactNode; tint?: number}> = ({id, draw, children, tint = 0}) => (
  <g>
    <defs>
      <clipPath id={`${id}-c`}>
        <rect x={SMAP.x} y={SMAP.y} width={SMAP.w} height={SMAP_H} rx={20} />
      </clipPath>
    </defs>
    <rect x={SMAP.x - 20} y={SMAP.y - 20} width={SMAP.w + 40} height={SMAP_H + 40} rx={28} fill="#7a5532" stroke={INK} strokeWidth={6} />
    <rect x={SMAP.x} y={SMAP.y} width={SMAP.w} height={SMAP_H} rx={20} fill="#8fc0d8" />
    <g clipPath={`url(#${id}-c)`}>
      {WORLD_LAND.map((poly, i) => {
        if (!poly.some(([lo, la]) => lo > SMAP.lon0 - 15 && lo < SMAP.lon1 + 15 && la > SMAP.lat0 - 15 && la < SMAP.lat1 + 15)) return null;
        return <path key={i} d={sline(poly) + 'Z'} fill="#efdcb0" stroke="#5a4028" strokeWidth={3} strokeLinejoin="round" />;
      })}
      {/* صحاري ملوّنة بدرجة أدفأ */}
      <ellipse cx={sm([88, 40])[0]} cy={sm([88, 40])[1]} rx={150} ry={50} fill="#e6c27a" opacity={0.6} />
      <ellipse cx={sm([45, 30])[0]} cy={sm([45, 30])[1]} rx={120} ry={60} fill="#e6c27a" opacity={0.5} />
      {tint > 0 && <rect x={SMAP.x} y={SMAP.y} width={SMAP.w} height={SMAP_H} fill="#2a1a10" opacity={tint} />}
      {/* الطرق المتشابكة تُرسم تدريجياً */}
      {ROUTES.map((r, i) => {
        const k = Math.max(0, Math.min(1, draw * ROUTES.length * 0.55 - i * 0.45));
        if (k <= 0) return null;
        const d = wobbly(r, `rt${i}`);
        return (
          <g key={i}>
            <path d={d} stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} />
            <path d={d} stroke={['#c9302c', '#d9822a', '#a8322c', '#c94a2a'][i % 4]} strokeWidth={6} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} />
          </g>
        );
      })}
      {Object.entries(CITIES).map(([k, c]) => {
        const [x, y] = sm(c);
        return <circle key={k} cx={x} cy={y} r={draw > 0.15 ? 8 : 0} fill="#fff" stroke={INK} strokeWidth={4} />;
      })}
      {children}
    </g>
    <rect x={SMAP.x} y={SMAP.y} width={SMAP.w} height={SMAP_H} rx={20} fill="none" stroke={INK} strokeWidth={6} />
  </g>
);

/** صندوق شحن كرتوني بشريط لاصق */
export const Crate: React.FC<{x: number; y: number; s?: number; rot?: number; label?: string}> = ({x, y, s = 1, rot = 0, label}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -70 -60 L 70 -60 L 70 60 L -70 60 Z" fill="#c8945a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -70 -60 L -50 -82 L 90 -82 L 70 -60 Z" fill="#dcae74" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 70 -60 L 90 -82 L 90 38 L 70 60 Z" fill="#a8764a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-14} y={-60} width={28} height={120} fill="#e8d2a0" opacity={0.8} />
    <path d="M -36 18 Q 0 40 36 18" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
    <path d="M 28 10 L 38 20 L 26 26" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {label && (
      <Txt x={0} y={-10} size={30} fill={INK} stroke="none" sw={0}>
        {label}
      </Txt>
    )}
  </g>
);

/** دودة قز لطيفة على ورقة توت + شرنقة */
export const Silkworm: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -220 60 Q -60 -160 220 -40 Q 80 160 -220 60 Z" fill="#6fbf5a" stroke={INK} strokeWidth={7} />
    <path d="M -200 50 Q 0 -10 200 -36" stroke="#3e8030" strokeWidth={6} fill="none" />
    {Array.from({length: 7}, (_, i) => {
      const bob = Math.sin(t * 6 - i * 0.7) * 8;
      return <circle key={i} cx={-110 + i * 34} cy={-6 + bob - (i > 5 ? 6 : 0)} r={i === 6 ? 30 : 26} fill="#f6f2e4" stroke={INK} strokeWidth={5} />;
    })}
    <circle cx={102} cy={-20 + Math.sin(t * 6 - 4.2) * 8} r={5} fill={INK} />
    <path d={`M 112 ${-6 + Math.sin(t * 6 - 4.2) * 8} q 6 6 12 0`} stroke={INK} strokeWidth={4} fill="none" />
    {/* شرنقة */}
    <ellipse cx={150} cy={80} rx={46} ry={30} fill="#fff8e6" stroke={INK} strokeWidth={5} transform="rotate(-20 150 80)" />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M ${118 + i * 20} 70 q 10 18 22 4`} stroke="#e2d4b0" strokeWidth={3} fill="none" />
    ))}
  </g>
);

/** قفل «سر» */
export const Lock: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -40 -20 L -40 -60 Q -40 -100 0 -100 Q 40 -100 40 -60 L 40 -20" stroke={INK} strokeWidth={26} fill="none" />
    <path d="M -40 -20 L -40 -60 Q -40 -100 0 -100 Q 40 -100 40 -60 L 40 -20" stroke="#9aa4b2" strokeWidth={14} fill="none" />
    <rect x={-70} y={-24} width={140} height={110} rx={16} fill="#e2b23a" stroke={INK} strokeWidth={7} />
    <circle cx={0} cy={22} r={14} fill={INK} />
    <rect x={-5} y={24} width={10} height={30} fill={INK} />
  </g>
);

/* ---------- أيقونات البضائع ---------- */
export const SpiceSack: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -50 50 Q -64 -20 -30 -40 L 30 -40 Q 64 -20 50 50 Z" fill="#c9a27a" stroke={INK} strokeWidth={6} />
    <ellipse cx={0} cy={-40} rx={34} ry={12} fill="#d9532a" stroke={INK} strokeWidth={5} />
    <path d="M -20 -48 Q 0 -70 20 -48" fill="#e8762a" stroke={INK} strokeWidth={4} />
    <path d="M -36 -24 L 36 -24" stroke="#8a6a4a" strokeWidth={6} />
  </g>
);
export const PaperScroll: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-46} y={-56} width={92} height={112} rx={6} fill="#fbf5e4" stroke={INK} strokeWidth={6} />
    <rect x={-58} y={-66} width={116} height={20} rx={10} fill="#c9a27a" stroke={INK} strokeWidth={5} />
    <rect x={-58} y={46} width={116} height={20} rx={10} fill="#c9a27a" stroke={INK} strokeWidth={5} />
    {[-24, -6, 12, 30].map((yy) => (
      <line key={yy} x1={-30} y1={yy} x2={30} y2={yy} stroke="#8a7a6a" strokeWidth={4} />
    ))}
  </g>
);
export const Bomb: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={6} r={52} fill="#2a2a34" stroke={INK} strokeWidth={6} />
    <circle cx={-18} cy={-12} r={12} fill="#5a5a6a" />
    <rect x={-14} y={-60} width={28} height={18} rx={4} fill="#5a5a6a" stroke={INK} strokeWidth={5} />
    <path d="M 0 -60 Q 10 -90 30 -96" stroke="#c9a27a" strokeWidth={6} fill="none" />
    {[0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2 + t * 12;
      return <path key={i} d={`M 30 -96 l ${Math.cos(a) * 22} ${Math.sin(a) * 22}`} stroke={i % 2 ? '#ffd24a' : '#ff7a2a'} strokeWidth={5} strokeLinecap="round" />;
    })}
  </g>
);
/** جمجمة خضراء صغيرة كرتونية (الأوبئة) */
export const GermSkull: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(t * 8) * 8})`}>
    <path d="M -52 -10 Q -52 -64 0 -64 Q 52 -64 52 -10 Q 52 20 30 28 L 30 48 L -30 48 L -30 28 Q -52 20 -52 -10 Z" fill="#8fd65a" stroke={INK} strokeWidth={6} />
    <ellipse cx={-20} cy={-12} rx={14} ry={16} fill={INK} />
    <ellipse cx={20} cy={-12} rx={14} ry={16} fill={INK} />
    <path d="M -6 16 L 0 6 L 6 16 Z" fill={INK} />
    {[-16, 0, 16].map((xx) => (
      <line key={xx} x1={xx} y1={32} x2={xx} y2={48} stroke={INK} strokeWidth={4} />
    ))}
    {[0, 1, 2, 3].map((i) => {
      const a = (i / 4) * Math.PI * 2 + t * 2;
      return <circle key={i} cx={Math.cos(a) * 80} cy={Math.sin(a) * 70} r={8} fill="#8fd65a" stroke={INK} strokeWidth={3} />;
    })}
  </g>
);

/** ملصق مائل يُلصق بضربة */
export const Sticker: React.FC<{x: number; y: number; k: number; text: string; sub?: string; rot?: number}> = ({x, y, k, text, sub, rot = -6}) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${1 + (1 - Math.min(1, k)) * 0.8})`} opacity={Math.min(1, k * 3)}>
      <rect x={-300} y={-90} width={600} height={sub ? 200 : 150} rx={20} fill="#fff8e0" stroke={INK} strokeWidth={8} />
      <rect x={-300} y={-90} width={600} height={28} fill="#e2b23a" />
      <Txt x={0} y={sub ? 30 : 40} size={92} fill="#a8322c" stroke="none" sw={0}>
        {text}
      </Txt>
      {sub && (
        <Txt x={0} y={92} size={46} fill={INK} stroke="none" sw={0}>
          {sub}
        </Txt>
      )}
      <rect x={-60} y={-110} width={120} height={36} fill="#f0e6c0" opacity={0.85} transform="rotate(-4)" />
    </g>
  );

/** صخرة كبيرة (مخبأ قاطع الطريق) */
export const Rock: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -160 0 Q -170 -120 -60 -150 Q 40 -190 120 -110 Q 180 -40 160 0 Z" fill="#a88a6a" stroke={INK} strokeWidth={7} />
    <path d="M -100 -90 Q -40 -120 20 -100" stroke="#c8aa88" strokeWidth={10} fill="none" strokeLinecap="round" />
  </g>
);

/** بيت بسيط (خيار «البقاء في البيت») */
export const House: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-80} y={-110} width={160} height={110} fill="#f0dcb0" stroke={INK} strokeWidth={6} />
    <path d="M -110 -100 L 0 -190 L 110 -100 Z" fill="#c9502f" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-24} y={-64} width={48} height={64} fill="#7a4a2a" stroke={INK} strokeWidth={5} />
    <rect x={34} y={-90} width={34} height={30} fill="#9cd0f0" stroke={INK} strokeWidth={4} />
  </g>
);

/** كيس ذهب (خيار الثراء) */
export const GoldBag: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -70 0 Q -90 -90 -30 -110 L 30 -110 Q 90 -90 70 0 Z" fill="#c9952a" stroke={INK} strokeWidth={6} />
    <path d="M -30 -110 Q 0 -140 30 -110" fill="none" stroke={INK} strokeWidth={6} />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={-40 + i * 40} cy={-150 - Math.abs(Math.sin(t * 3 + i)) * 20} r={18} fill="#f2c23a" stroke={INK} strokeWidth={4} />
    ))}
    <Txt x={0} y={-36} size={50} fill="#5a3a10" stroke="none" sw={0}>
      ذهب
    </Txt>
  </g>
);
