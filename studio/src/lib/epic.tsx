import React from 'react';
import {random} from 'remotion';
import {Bloom, Embers, Halo, Smoke} from './fx';
import {INK, lerp} from './util';

/* ============ تلال بتدرج وحافة مضيئة ============ */
export const Ridge: React.FC<{
  id: string;
  fn: (x: number) => number;
  top: string;
  bottom: string;
  rim?: string;
  rimOpacity?: number;
  x0?: number;
  x1?: number;
  y1?: number;
  outline?: boolean;
}> = ({id, fn, top, bottom, rim, rimOpacity = 0.6, x0 = -1400, x1 = 3300, y1 = 2000, outline}) => {
  let line = '';
  for (let x = x0; x <= x1; x += 12) line += `${x === x0 ? 'M' : 'L'} ${x} ${fn(x).toFixed(1)} `;
  const minY = Math.min(...Array.from({length: 60}, (_, i) => fn(lerp(x0, x1, i / 59))));
  return (
    <g>
      <defs>
        <linearGradient id={`rg-${id}`} gradientUnits="userSpaceOnUse" x1={0} x2={0} y1={minY} y2={minY + 500}>
          <stop offset="0%" stopColor={top} />
          <stop offset="100%" stopColor={bottom} />
        </linearGradient>
      </defs>
      <path d={`${line} L ${x1} ${y1} L ${x0} ${y1} Z`} fill={`url(#rg-${id})`} stroke={outline ? INK : 'none'} strokeWidth={5} />
      {rim && <path d={line} fill="none" stroke={rim} strokeWidth={3} opacity={rimOpacity} />}
    </g>
  );
};

/* ============ شجرة سرو ============ */
export const Cypress: React.FC<{x: number; y: number; h: number; fill: string; rim?: string; sway?: number}> = ({x, y, h, fill, rim, sway = 0}) => {
  const w = h * 0.2;
  const tip = x + sway;
  const d = `M ${x - w * 0.35} ${y} C ${x - w * 1.1} ${y - h * 0.25} ${x - w * 0.9} ${y - h * 0.7} ${tip} ${y - h} C ${x + w * 0.9} ${y - h * 0.7} ${x + w * 1.1} ${y - h * 0.25} ${x + w * 0.35} ${y} Z`;
  return (
    <g>
      <rect x={x - w * 0.12} y={y - h * 0.08} width={w * 0.24} height={h * 0.12} fill={fill} />
      <path d={d} fill={fill} />
      {rim && <path d={`M ${x - w * 0.95} ${y - h * 0.3} C ${x - w * 0.95} ${y - h * 0.6} ${x - w * 0.6} ${y - h * 0.85} ${tip} ${y - h}`} stroke={rim} strokeWidth={2.5} fill="none" opacity={0.55} />}
    </g>
  );
};

/* ============ المدينة الملحمية ============ */
const cityHill = (x: number) =>
  -130 * Math.exp(-(((x - 420) / 300) ** 2)) - 210 * Math.exp(-(((x - 1250) / 400) ** 2)) - 120 * Math.exp(-(((x - 2050) / 320) ** 2));

/** قوس على محيط قبة بين زاويتين (بالدرجات، 0 = يمين، 90 = القمة) */
const rimArc = (cx: number, by: number, rw: number, rh: number, a0: number, a1: number) => {
  const pt = (a: number) => `${cx + rw * Math.cos((a * Math.PI) / 180)} ${by - rh * Math.sin((a * Math.PI) / 180)}`;
  return `M ${pt(a0)} A ${rw} ${rh} 0 0 0 ${pt(a1)}`;
};

const dome = (cx: number, by: number, rw: number, rh: number) => `M ${cx - rw} ${by} A ${rw} ${rh} 0 0 1 ${cx + rw} ${by} Z`;

/** كنيسة ضخمة بقبة مركزية وأنصاف قباب ودعامات */
const GreatChurch: React.FC<{x: number; y: number; fill: string; rim: string; win: string; s?: number}> = ({x, y, fill, rim, win, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g fill={fill}>
      <rect x={-300} y={-150} width={600} height={160} />
      <rect x={-260} y={-250} width={70} height={250} />
      <rect x={190} y={-250} width={70} height={250} />
      <path d={dome(-150, -150, 105, 80)} />
      <path d={dome(150, -150, 105, 80)} />
      <rect x={-170} y={-215} width={340} height={70} />
      <rect x={-135} y={-250} width={270} height={40} />
      <path d={dome(0, -248, 150, 110)} />
      <rect x={-4} y={-385} width={8} height={30} />
      <rect x={-14} y={-375} width={28} height={6} />
    </g>
    {/* حافة ضوء القمر على القباب (أقواس على محيط القبة من جهة الضوء) */}
    <g fill="none" stroke={rim} strokeWidth={4} opacity={0.8} strokeLinecap="round">
      <path d={rimArc(0, -248, 150, 110, 30, 110)} />
      <path d={rimArc(-150, -150, 105, 80, 50, 120)} />
      <path d={rimArc(150, -150, 105, 80, 30, 100)} />
    </g>
    {/* نوافذ الرقبة المضيئة */}
    {Array.from({length: 13}, (_, i) => (
      <rect key={i} x={-122 + i * 19} y={-244} width={8} height={18} rx={4} fill={win} />
    ))}
  </g>
);

/** قناة مياه بطابقين من العقود */
const Aqueduct: React.FC<{x0: number; x1: number; base: number; top: number; fill: string}> = ({x0, x1, base, top, fill}) => {
  const span = 46;
  const mid = (base + top) / 2;
  let d = `M ${x0} ${top} L ${x1} ${top} L ${x1} ${base} L ${x0} ${base} Z`;
  for (let x = x0 + 10; x + span - 10 <= x1; x += span) {
    const a = x;
    const b = x + span - 14;
    const r = (b - a) / 2;
    d += ` M ${a} ${base} L ${a} ${mid + 18 + r} A ${r} ${r} 0 0 1 ${b} ${mid + 18 + r} L ${b} ${base} Z`;
    d += ` M ${a + 4} ${mid - 6} L ${a + 4} ${top + 16 + r} A ${r - 4} ${r - 4} 0 0 1 ${b - 4} ${top + 16 + r} L ${b - 4} ${mid - 6} Z`;
  }
  return <path d={d} fill={fill} fillRule="evenodd" />;
};

export const CityEpic: React.FC<{
  id: string;
  x: number;
  base: number;
  s?: number;
  fill: string;
  back: string; // صفوف البيوت الخلفية (أفتح بفعل الجو)
  rim: string;
  win: string;
  frame: number;
  smoke?: string;
  bloom?: boolean;
}> = ({id, x, base, s = 1, fill, back, rim, win, frame, smoke, bloom = true}) => {
  const houses: React.ReactNode[] = [];
  const windows: {x: number; y: number; p: number}[] = [];
  for (let row = 0; row < 4; row++) {
    for (let hx = -60 + row * 13; hx < 2460; hx += 34 + (row % 2) * 6) {
      const i = row * 1000 + hx;
      if (random(`${id}-skip-${i}`) < 0.12) continue;
      const g = cityHill(hx) + row * 34 - 10;
      const w = 26 + random(`${id}-w-${i}`) * 18;
      const h = 24 + random(`${id}-h-${i}`) * 36;
      const c = row < 2 ? back : fill;
      const roof = random(`${id}-rf-${i}`);
      houses.push(
        <g key={i} fill={c}>
          <rect x={hx} y={g - h} width={w} height={h + 40} />
          {roof > 0.5 ? <path d={`M ${hx - 3} ${g - h} L ${hx + w / 2} ${g - h - 14} L ${hx + w + 3} ${g - h} Z`} /> : <rect x={hx - 2} y={g - h - 4} width={w + 4} height={5} />}
        </g>,
      );
      if (row >= 1 && random(`${id}-win-${i}`) > 0.55) windows.push({x: hx + w * 0.3, y: g - h * 0.6, p: random(`${id}-wp-${i}`) * 6.28});
    }
  }
  const chimneys = [180, 900, 1600, 2200];
  return (
    <g transform={`translate(${x} ${base}) scale(${s})`}>
      {/* التلال السبعة */}
      <path d={`M -100 60 ${Array.from({length: 66}, (_, i) => `L ${-100 + i * 40} ${cityHill(-100 + i * 40)}`).join(' ')} L 2560 60 Z`} fill={back} />
      <Aqueduct x0={640} x1={1040} base={cityHill(840) + 10} top={cityHill(840) - 120} fill={back} />
      {houses}
      {/* المعالم على قمم التلال */}
      <GreatChurch x={1250} y={cityHill(1250) + 30} fill={fill} rim={rim} win={win} s={1.05} />
      <g transform={`translate(420 ${cityHill(420) + 20})`} fill={fill}>
        <rect x={-90} y={-90} width={180} height={100} />
        <path d={dome(0, -90, 70, 58)} />
        <path d={dome(-70, -60, 30, 24)} />
        <path d={dome(70, -60, 30, 24)} />
      </g>
      <g transform={`translate(2050 ${cityHill(2050) + 10})`} fill={fill}>
        <rect x={-14} y={-230} width={28} height={240} />
        <rect x={-24} y={-240} width={48} height={14} />
        <rect x={-30} y={0} width={60} height={14} />
      </g>
      {[300, 560, 1500, 1720, 1900, 2250].map((cx, i) => (
        <Cypress key={i} x={cx} y={cityHill(cx) + 40} h={120 + (i % 3) * 30} fill={fill} rim={rim} />
      ))}
      {/* سور البحر وأبراجه */}
      <g fill={fill}>
        <rect x={-120} y={-80} width={2700} height={140} />
        {Array.from({length: 120}, (_, i) => (
          <rect key={i} x={-120 + i * 22} y={-94} width={12} height={16} />
        ))}
        {Array.from({length: 17}, (_, i) => {
          const tx = -80 + i * 160;
          return (
            <g key={i}>
              <rect x={tx} y={-150} width={58} height={200} />
              {[0, 16, 32, 46].map((o) => (
                <rect key={o} x={tx + o} y={-166} width={12} height={16} />
              ))}
            </g>
          );
        })}
      </g>
      <path d="M -120 -80 L 2580 -80" stroke={rim} strokeWidth={2} opacity={0.35} />
      {/* دخان مداخن خفيف */}
      {smoke &&
        chimneys.map((cx, i) => (
          <Smoke key={i} id={`${id}-ch${i}`} x={cx} y={cityHill(cx) + 20} frame={frame} color={smoke} size={18} rise={260} drift={70} n={7} opacity={0.22} />
        ))}
      {/* النوافذ ومشاعل الأبراج مع bloom */}
      {(() => {
        const lights = (
          <g>
            {windows.map((w, i) => (
              <rect key={i} x={w.x} y={w.y} width={7} height={10} rx={2} fill={win} opacity={0.6 + 0.4 * Math.sin(frame / 18 + w.p)} />
            ))}
            {Array.from({length: 17}, (_, i) =>
              i % 2 === 0 ? <circle key={`t${i}`} cx={-51 + i * 160} cy={-176} r={5 + Math.sin(frame / 3 + i)} fill={win} /> : null,
            )}
          </g>
        );
        return bloom ? (
          <Bloom id={`city-${id}`} x={-200} y={-500} w={2800} h={600} radius={10} strength={1.6}>
            {lights}
          </Bloom>
        ) : (
          lights
        );
      })()}
    </g>
  );
};

/* ============ السور: الوجه الأمامي يُرسم بعد الشخصيات ليغطي أرجلها ============ */
export const Battlement: React.FC<{x: number; top: number; w: number; h?: number; stone: string; mortar: string; rim?: string}> = ({
  x,
  top,
  w,
  h = 900,
  stone,
  mortar,
  rim,
}) => (
  <g stroke={INK} strokeWidth={5} strokeLinejoin="round">
    {Array.from({length: Math.ceil(w / 76)}, (_, i) => (
      <rect key={i} x={x + i * 76} y={top - 44} width={46} height={48} fill={stone} />
    ))}
    <rect x={x} y={top} width={w} height={h} fill={stone} />
    <g stroke={mortar} strokeWidth={3} fill="none">
      {Array.from({length: Math.ceil(h / 46)}, (_, r) => (
        <g key={r}>
          <line x1={x} y1={top + 26 + r * 46} x2={x + w} y2={top + 26 + r * 46} />
          {Array.from({length: Math.ceil(w / 110) + 1}, (_, c) => (
            <line key={c} x1={x + c * 110 + (r % 2) * 55} y1={top + 26 + r * 46} x2={x + c * 110 + (r % 2) * 55} y2={top + 72 + r * 46} />
          ))}
        </g>
      ))}
    </g>
    {rim && <path d={`M ${x} ${top} L ${x + w} ${top}`} stroke={rim} strokeWidth={4} opacity={0.6} />}
  </g>
);

/** الممشى خلف الشرفات (أغمق، تقف عليه الشخصيات) */
export const Walkway: React.FC<{x: number; top: number; w: number; fill: string}> = ({x, top, w, fill}) => (
  <rect x={x} y={top - 10} width={w} height={90} fill={fill} stroke={INK} strokeWidth={5} />
);

/* ============ راية ترفرف ============ */
export const Banner: React.FC<{x: number; y: number; h?: number; color: string; frame: number; s?: number; seed?: number}> = ({
  x,
  y,
  h = 260,
  color,
  frame,
  s = 1,
  seed = 0,
}) => {
  const L = 130;
  const oy = -h + 6;
  const topPts: string[] = [];
  const botPts: string[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const wave = Math.sin(frame / 5 - t * 5 + seed) * 12 * t;
    topPts.push(`${t * L} ${oy + wave}`);
    botPts.unshift(`${t * L} ${oy + 70 - t * 18 + wave}`);
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
      <rect x={-5} y={-h} width={10} height={h} fill="#4a2e18" />
      <circle cx={0} cy={-h - 8} r={10} fill="#d9b13a" />
      <path d={`M ${topPts.join(' L ')} L ${botPts.join(' L ')} Z`} fill={color} />
    </g>
  );
};

/* ============ مدفع أوربان العملاق ============ */
export const Bombard: React.FC<{x: number; y: number; s?: number; bronze?: string; wood?: string; rim?: string}> = ({
  x,
  y,
  s = 1,
  bronze = '#a9783a',
  wood = '#5a3418',
  rim = '#ffd08a',
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={6} strokeLinejoin="round">
    <rect x={-280} y={-60} width={540} height={60} rx={8} fill={wood} />
    {[-220, -60, 100, 220].map((wx) => (
      <circle key={wx} cx={wx} cy={4} r={34} fill={wood} />
    ))}
    <path d="M -300 -70 L -300 -190 Q -300 -215 -270 -215 L 230 -175 L 300 -185 L 300 -95 L 230 -105 L -270 -60 Q -300 -60 -300 -70 Z" fill={bronze} />
    {[-200, -80, 40, 160].map((bx) => (
      <rect key={bx} x={bx} y={-206 + (bx + 300) * 0.06} width={22} height={126 - (bx + 300) * 0.1} fill={bronze} />
    ))}
    <ellipse cx={300} cy={-140} rx={16} ry={46} fill="#2a1a10" />
    <path d="M -280 -205 L 220 -172" stroke={rim} strokeWidth={4} opacity={0.7} />
  </g>
);

/* ============ نار مخيم كاملة: لهب + هالة + شرر + دخان ============ */
export const Campfire: React.FC<{id: string; x: number; y: number; frame: number; s?: number; smoke: string; warm: string}> = ({
  id,
  x,
  y,
  frame,
  s = 1,
  smoke,
  warm,
}) => {
  const f = 0.85 + 0.15 * Math.sin(frame * 0.8 + x) + 0.06 * Math.sin(frame * 2.1);
  return (
    <g>
      <Smoke id={`${id}-sm`} x={x} y={y - 70 * s} frame={frame} color={smoke} size={30 * s} rise={480 * s} drift={80 * s} n={9} opacity={0.3} />
      <Halo id={`${id}-h`} cx={x} cy={y - 40 * s} r={260 * s} color={warm} opacity={0.55} />
      <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={4}>
        <rect x={-46} y={-14} width={92} height={18} rx={8} fill="#4a2a14" transform="rotate(12)" />
        <rect x={-46} y={-14} width={92} height={18} rx={8} fill="#5a3418" transform="rotate(-12)" />
      </g>
      <Bloom id={`${id}-b`} x={x - 200 * s} y={y - 500 * s} w={400 * s} h={540 * s} radius={14 * s}>
        <g transform={`translate(${x} ${y}) scale(${s})`}>
          <path d={`M -34 -8 Q -40 ${-60 * f} 0 ${-120 * f} Q 40 ${-60 * f} 34 -8 Z`} fill="#ff8a2a" />
          <path d={`M -20 -8 Q -22 ${-44 * f} 0 ${-84 * f} Q 22 ${-44 * f} 20 -8 Z`} fill="#ffc04a" />
          <path d={`M -9 -8 Q -10 ${-26 * f} 0 ${-50 * f} Q 10 ${-26 * f} 9 -8 Z`} fill="#fff3b8" />
        </g>
        <Embers id={`${id}-e`} x={x} y={y - 60 * s} frame={frame} spread={60 * s} rise={380 * s} size={3.4 * s} />
      </Bloom>
    </g>
  );
};

/** مشعل بلهب وbloom وشرر ودخان خفيف */
export const TorchFX: React.FC<{id: string; x: number; y: number; frame: number; s?: number; smoke?: string; warm: string; embers?: boolean}> = ({
  id,
  x,
  y,
  frame,
  s = 1,
  smoke,
  warm,
  embers = true,
}) => {
  const f = 0.8 + 0.2 * Math.sin(frame * 0.9 + x) + 0.08 * Math.sin(frame * 2.3 + y);
  const fy = y - 120 * s;
  return (
    <g>
      {smoke && <Smoke id={`${id}-sm`} x={x} y={fy - 40 * s} frame={frame} color={smoke} size={14 * s} rise={260 * s} drift={50 * s} n={6} opacity={0.25} life={120} />}
      <Halo id={`${id}-h`} cx={x} cy={fy} r={200 * s * f} color={warm} opacity={0.5} />
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <rect x={-6} y={-110} width={12} height={110} fill="#3a2414" stroke={INK} strokeWidth={4} />
        <rect x={-11} y={-118} width={22} height={14} rx={3} fill="#5a3418" stroke={INK} strokeWidth={3} />
      </g>
      <Bloom id={`${id}-b`} x={x - 120 * s} y={fy - 260 * s} w={240 * s} h={300 * s} radius={9 * s}>
        <g transform={`translate(${x} ${fy}) scale(${s})`}>
          <path d={`M 0 ${-46 * f} Q ${18 * f} -10 0 8 Q ${-18 * f} -10 0 ${-46 * f} Z`} fill="#ffa53a" />
          <path d={`M 0 ${-24 * f} Q 8 -4 0 6 Q -8 -4 0 ${-24 * f} Z`} fill="#fff1a8" />
        </g>
        {embers && <Embers id={`${id}-e`} x={x} y={fy - 20 * s} frame={frame} n={10} spread={16 * s} rise={160 * s} size={2.4 * s} life={50} />}
      </Bloom>
    </g>
  );
};
