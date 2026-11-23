import React from 'react';
import {random} from 'remotion';
import {INK, mixColor} from '../../lib/util';

/* =====================================================================
 * أصول شورت «لماذا بُني سور الصين العظيم؟» — كلها أصلية بأسلوب القناة.
 * ===================================================================== */

const SW = 5;

/** ساق بمفصلين (فخذ + ساق) تتأرجح بطور ph — للحصان والجمل */
const Leg: React.FC<{x: number; y: number; len: number; ph: number; amp: number; fill: string; w?: number; hoof?: string; bend?: number}> = ({x, y, len, ph, amp, fill, w = 14, hoof = '#2a2420', bend: bendIn}) => {
  // الرجل الأمامية تنثني ركبتها للخلف، والخلفية للأمام
  const bend = bendIn ?? (x > 0 ? 1 : -0.7);
  const a1 = Math.sin(ph) * amp;
  const lift = Math.max(0, Math.sin(ph + Math.PI / 2));
  const a2 = a1 - (20 + 55 * lift) * bend;
  const r = Math.PI / 180;
  const kx = x + Math.sin(a1 * r) * len * 0.5;
  const ky = y + Math.cos(a1 * r) * len * 0.5;
  const fx = kx - Math.sin(a2 * r) * len * 0.5 * -1;
  const fy = ky + Math.cos(a2 * r) * len * 0.5;
  return (
    <g>
      <path d={`M ${x} ${y} L ${kx} ${ky} L ${fx} ${fy}`} stroke={INK} strokeWidth={w + SW * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`M ${x} ${y} L ${kx} ${ky} L ${fx} ${fy}`} stroke={fill} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <ellipse cx={fx + 3} cy={fy + 3} rx={w * 0.65} ry={w * 0.45} fill={hoof} stroke={INK} strokeWidth={3} />
    </g>
  );
};

/**
 * حصان كرتوني جانبي. gait: 0 وقوف، 1 خبب سريع. phase = دورة الخطوة (يتقدم مع المسافة).
 * الأصل = نقطة الأرض تحت منتصف الجسم. ينظر لليمين؛ flip لليسار.
 * rider: يُرسم بين الأرجل البعيدة والجسم فيغطي الجسمُ ساقي الفارس.
 */
export const Horse: React.FC<{x: number; y: number; s?: number; flip?: boolean; frame: number; gait?: number; color?: string; mane?: string; seed?: number; rider?: React.ReactNode}> = ({
  x,
  y,
  s = 1,
  flip,
  frame,
  gait = 1,
  color = '#8a5a34',
  mane = '#3a2618',
  seed = 0,
  rider,
}) => {
  const ph = frame * 0.55 * (0.6 + 0.4 * gait) + seed;
  const bob = -Math.abs(Math.sin(ph)) * 14 * gait;
  const pitch = Math.sin(ph) * 4 * gait;
  const far = mixColor(color, '#000000', 0.25);
  const amp = 8 + 34 * gait;
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <ellipse cx={0} cy={4} rx={110} ry={14} fill="#000" opacity={0.18} />
      <g transform={`translate(0 ${bob}) rotate(${pitch})`}>
        {/* الأرجل البعيدة */}
        <Leg x={62} y={-120} len={118} ph={ph + 0.6} amp={amp} fill={far} />
        <Leg x={-62} y={-118} len={118} ph={ph + Math.PI + 0.6} amp={amp} fill={far} />
        {/* الذيل */}
        <path d={`M -92 -150 Q ${-150 - 10 * gait} ${-150 + Math.sin(ph * 1.3) * 18} ${-158} ${-92 + Math.sin(ph) * 10}`} stroke={INK} strokeWidth={30} strokeLinecap="round" fill="none" />
        <path d={`M -92 -150 Q ${-150 - 10 * gait} ${-150 + Math.sin(ph * 1.3) * 18} ${-158} ${-92 + Math.sin(ph) * 10}`} stroke={mane} strokeWidth={20} strokeLinecap="round" fill="none" />
        {rider}
        {/* الجسم */}
        <ellipse cx={0} cy={-150} rx={104} ry={52} fill={color} stroke={INK} strokeWidth={SW} />
        <path d="M -60 -126 Q 0 -104 70 -130" stroke={far} strokeWidth={6} fill="none" opacity={0.5} />
        {/* السرج */}
        <path d="M -40 -198 Q 0 -214 40 -198 L 34 -168 Q 0 -160 -34 -168 Z" fill="#7a2a22" stroke={INK} strokeWidth={4} />
        {/* الرقبة والرأس */}
        <g transform={`rotate(${-pitch * 1.5 + Math.sin(ph + 1) * 5 * gait} 80 -170)`}>
          {/* رقبة عريضة */}
          <path d="M 40 -186 C 70 -236 104 -276 132 -290 L 172 -258 C 140 -230 118 -190 104 -134 Z" fill={color} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          {/* الرأس: جمجمة + خطم */}
          <g transform="rotate(38 160 -262)">
            <rect x={118} y={-292} width={112} height={56} rx={26} fill={color} stroke={INK} strokeWidth={SW} />
            <ellipse cx={214} cy={-262} rx={22} ry={26} fill={mixColor(color, '#000000', 0.12)} stroke={INK} strokeWidth={4} />
            <circle cx={222} cy={-270} r={3.5} fill={INK} />
            <circle cx={150} cy={-276} r={6} fill={INK} />
            <circle cx={152} cy={-278} r={2} fill="#fff" />
          </g>
          <path d="M 132 -300 L 124 -330 L 148 -306 Z" fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          {/* العرف */}
          {Array.from({length: 6}, (_, i) => (
            <path key={i} d={`M ${54 + i * 14} ${-196 - i * 17} q ${-22 - 8 * gait} ${4 + Math.sin(ph + i) * 6} ${-30 - 10 * gait} ${16}`} stroke={mane} strokeWidth={13} strokeLinecap="round" fill="none" />
          ))}
        </g>
        {/* الأرجل القريبة */}
        <Leg x={70} y={-118} len={120} ph={ph} amp={amp} fill={color} />
        <Leg x={-56} y={-116} len={120} ph={ph + Math.PI} amp={amp} fill={color} />
      </g>
      {/* غبار خلف الحوافر */}
      {gait > 0.5 &&
        [0, 1, 2, 3].map((i) => {
          const k = ((frame * 0.05 + i / 4 + seed) % 1);
          return <circle key={i} cx={-90 - k * 160} cy={-10 - k * 40} r={14 + k * 34} fill="#d8c39a" opacity={(1 - k) * 0.45} />;
        })}
    </g>
  );
};

/** جمل بسنام واحد يمشي ببطء مع جرس */
export const Camel: React.FC<{x: number; y: number; s?: number; flip?: boolean; frame: number; walk?: number; color?: string; load?: string; seed?: number}> = ({
  x,
  y,
  s = 1,
  flip,
  frame,
  walk = 1,
  color = '#c99a5e',
  load = '#9a3a2e',
  seed = 0,
}) => {
  const ph = frame * 0.16 * walk + seed;
  const bob = -Math.abs(Math.sin(ph)) * 6 * walk;
  const far = mixColor(color, '#000000', 0.22);
  const amp = 22 * walk;
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <ellipse cx={0} cy={4} rx={120} ry={14} fill="#000" opacity={0.18} />
      <g transform={`translate(0 ${bob})`}>
        <Leg x={60} y={-150} len={150} ph={ph + 0.5} amp={amp} fill={far} w={13} hoof={far} bend={0.6} />
        <Leg x={-60} y={-150} len={150} ph={ph + Math.PI + 0.5} amp={amp} fill={far} w={13} hoof={far} bend={0.6} />
        <path d="M -100 -180 q -30 20 -26 60" stroke={INK} strokeWidth={12} fill="none" strokeLinecap="round" />
        <ellipse cx={0} cy={-182} rx={108} ry={48} fill={color} stroke={INK} strokeWidth={SW} />
        <path d="M -60 -214 Q -10 -320 50 -214 Z" fill={color} stroke={INK} strokeWidth={SW} />
        {/* حمولة */}
        <path d="M -50 -236 Q -10 -270 36 -236 L 44 -170 L -58 -170 Z" fill={load} stroke={INK} strokeWidth={4} />
        <path d="M -54 -200 L 40 -200" stroke="#e8c45a" strokeWidth={6} />
        {/* الرقبة والرأس */}
        <path d={`M 84 -196 Q 150 -190 150 -260 Q 150 -300 180 -306 Q 210 -306 214 -288 Q 200 -276 182 -276 Q 176 -236 168 -200 Q 150 -170 100 -164 Z`} fill={color} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <circle cx={188} cy={-294} r={5} fill={INK} />
        <path d="M 170 -306 l -6 -12" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        {/* الجرس */}
        <g transform={`rotate(${Math.sin(ph * 2) * 14} 156 -214)`}>
          <line x1={156} y1={-214} x2={156} y2={-190} stroke={INK} strokeWidth={3} />
          <path d="M 146 -192 Q 156 -206 166 -192 L 170 -176 L 142 -176 Z" fill="#d9a520" stroke={INK} strokeWidth={3} />
        </g>
        <Leg x={70} y={-150} len={152} ph={ph} amp={amp} fill={color} w={14} hoof={far} bend={0.6} />
        <Leg x={-54} y={-150} len={152} ph={ph + Math.PI} amp={amp} fill={color} w={14} hoof={far} bend={0.6} />
      </g>
    </g>
  );
};

/** سقف صيني منحني الأطراف */
export const PagodaRoof: React.FC<{x: number; y: number; w: number; h?: number; color?: string; under?: string}> = ({x, y, w, h = 46, color = '#2f5a4a', under = '#c9302c'}) => (
  <g>
    <path
      d={`M ${x - w / 2 - 26} ${y - 8} Q ${x - w / 2} ${y + 6} ${x - w / 2 + 20} ${y} L ${x + w / 2 - 20} ${y} Q ${x + w / 2} ${y + 6} ${x + w / 2 + 26} ${y - 8} Q ${x + w / 2 - 10} ${y - h * 0.4} ${x + w * 0.28} ${y - h} L ${x - w * 0.28} ${y - h} Q ${x - w / 2 + 10} ${y - h * 0.4} ${x - w / 2 - 26} ${y - 8} Z`}
      fill={color}
      stroke={INK}
      strokeWidth={SW}
      strokeLinejoin="round"
    />
    <path d={`M ${x - w / 2 + 14} ${y + 2} L ${x + w / 2 - 14} ${y + 2}`} stroke={under} strokeWidth={8} />
    {(() => {
      const n = Math.max(3, Math.round(w / 34));
      return Array.from({length: n}, (_, i) => (
        <path key={i} d={`M ${x - w * 0.26 + (i * w * 0.52) / (n - 1)} ${y - h + 4} L ${x - w * 0.42 + (i * w * 0.84) / (n - 1)} ${y - 4}`} stroke={INK} strokeWidth={2.5} opacity={0.35} />
      ));
    })()}
  </g>
);

/**
 * سور فوق خط تلال: fn(x) = خط القمة. يرسم وجهاً أمامياً بحجارة + ممشى علوي + شرفات.
 * towersAt: مواضع أبراج المراقبة على الطريق.
 */
export const WallRidge: React.FC<{id: string; fn: (x: number) => number; x0: number; x1: number; h?: number; stone?: string; top?: string; step?: number; towersAt?: number[]; towerS?: number; children?: React.ReactNode; outline?: number}> = ({
  id,
  fn,
  x0,
  x1,
  h = 70,
  stone = '#b9a27e',
  top = '#d8c49e',
  step = 12,
  towersAt = [],
  towerS = 1,
  outline = SW,
}) => {
  const pts: [number, number][] = [];
  for (let x = x0; x <= x1; x += step) pts.push([x, fn(x)]);
  const topPath = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1] - h}`).join(' ');
  const face = topPath + ' ' + pts.slice().reverse().map((p) => `L${p[0]} ${p[1]}`).join(' ') + ' Z';
  const walk = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1] - h - 10}`).join(' ') + ' ' + pts.slice().reverse().map((p) => `L${p[0]} ${p[1] - h}`).join(' ') + ' Z';
  const merl = Math.max(14, 26 * (h / 70));
  return (
    <g>
      <path d={face} fill={stone} stroke={INK} strokeWidth={outline} strokeLinejoin="round" />
      {/* خطوط الحجارة */}
      {h > 30 &&
        [0.33, 0.66].map((k) => (
          <path key={k} d={pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1] - h * k}`).join(' ')} stroke={INK} strokeWidth={2} fill="none" opacity={0.25} />
        ))}
      <path d={walk} fill={top} stroke={INK} strokeWidth={outline * 0.8} strokeLinejoin="round" />
      {/* الشرفات */}
      {pts
        .filter((_, i) => i % 2 === 0)
        .map((p, i) => (
          <rect key={i} x={p[0] - step * 0.45} y={p[1] - h - 10 - merl * 0.5} width={step * 0.9} height={merl * 0.5} fill={stone} stroke={INK} strokeWidth={outline * 0.6} />
        ))}
      {towersAt.map((tx, i) => (
        <Watchtower key={`${id}-t${i}`} x={tx} y={fn(tx) - h * 0.2} s={towerS * (h / 70)} />
      ))}
    </g>
  );
};

/** برج مراقبة مربع بشرفات ونافذة (الأصل = منتصف القاعدة) */
export const Watchtower: React.FC<{x: number; y: number; s?: number; stone?: string; dark?: string}> = ({x, y, s = 1, stone = '#c2ab86', dark = '#3a2a22'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -50 0 L -44 -150 L 44 -150 L 50 0 Z" fill={stone} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M -44 -150 L 44 -150 L 44 -162 L -44 -162 Z" fill={mixColor(stone, '#ffffff', 0.2)} stroke={INK} strokeWidth={4} />
    {[-40, -16, 8, 32].map((mx) => (
      <rect key={mx} x={mx} y={-184} width={14} height={22} fill={stone} stroke={INK} strokeWidth={4} />
    ))}
    <path d="M -14 -96 Q 0 -116 14 -96 L 14 -70 L -14 -70 Z" fill={dark} stroke={INK} strokeWidth={4} />
    <path d="M -30 -40 L 30 -40" stroke={INK} strokeWidth={2} opacity={0.3} />
    <path d="M -36 -120 L 36 -120" stroke={INK} strokeWidth={2} opacity={0.3} />
  </g>
);

/** بوابة حصن على طريق الحرير: سور ببوابة مقوّسة + برج بسقفين صينيين */
export const FortGate: React.FC<{x: number; y: number; s?: number; open?: number}> = ({x, y, s = 1, open = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -420 0 L -410 -260 L 410 -260 L 420 0 Z" fill="#c9a77a" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    {Array.from({length: 18}, (_, i) => (
      <rect key={i} x={-410 + i * 46} y={-290} width={26} height={30} fill="#c9a77a" stroke={INK} strokeWidth={4} />
    ))}
    {[-200, -130, -60, 60, 130, 200].map((y2, i) => (
      <path key={i} d={`M -410 ${-40 * (i + 1)} L 410 ${-40 * (i + 1)}`} stroke={INK} strokeWidth={2} opacity={0.18} />
    ))}
    {/* فتحة البوابة */}
    <path d="M -90 0 L -90 -150 Q 0 -230 90 -150 L 90 0 Z" fill="#2a1e1a" stroke={INK} strokeWidth={SW} />
    <g opacity={1 - open * 0.85}>
      <path d="M -86 0 L -86 -148 Q -40 -190 0 -196 L 0 0 Z" fill="#7a3a24" stroke={INK} strokeWidth={4} />
      <path d="M 86 0 L 86 -148 Q 40 -190 0 -196 L 0 0 Z" fill="#7a3a24" stroke={INK} strokeWidth={4} />
    </g>
    {/* البرج */}
    <rect x={-170} y={-420} width={340} height={160} fill="#b8322c" stroke={INK} strokeWidth={SW} />
    {[-140, -70, 0, 70, 140].map((px) => (
      <rect key={px} x={px - 8} y={-420} width={16} height={160} fill="#8a2420" stroke={INK} strokeWidth={3} />
    ))}
    <PagodaRoof x={0} y={-420} w={420} h={70} />
    <rect x={-130} y={-520} width={260} height={90} fill="#b8322c" stroke={INK} strokeWidth={SW} />
    <PagodaRoof x={0} y={-520} w={330} h={64} />
    <rect x={-60} y={-330} width={120} height={46} rx={6} fill="#1f2a4a" stroke="#d9a520" strokeWidth={5} />
  </g>
);

/** جبال بعيدة متدرجة بضباب (طبقة واحدة) */
export const MountainBand: React.FC<{fn: (x: number) => number; fill: string; x0?: number; x1?: number; bottom?: number; snow?: string}> = ({fn, fill, x0 = -1000, x1 = 2100, bottom = 3600, snow}) => {
  let d = `M ${x0} ${bottom} L ${x0} ${fn(x0)}`;
  for (let x = x0; x <= x1; x += 14) d += ` L ${x} ${fn(x).toFixed(1)}`;
  d += ` L ${x1} ${bottom} Z`;
  return (
    <g>
      <path d={d} fill={fill} />
      {snow && <path d={d} fill={snow} opacity={0.25} />}
    </g>
  );
};

/** عشب سهوب يتمايل */
export const SteppeGrass: React.FC<{y0: number; y1: number; n: number; t: number; seed: string; color?: string}> = ({y0, y1, n, t, seed, color = '#6a8a3a'}) => (
  <g stroke={color} strokeLinecap="round" fill="none">
    {Array.from({length: n}, (_, i) => {
      const x = -400 + random(`${seed}x${i}`) * 1900;
      const y = y0 + random(`${seed}y${i}`) * (y1 - y0);
      const k = (y - y0) / (y1 - y0);
      const hh = 20 + 50 * k;
      const sway = Math.sin(t * 1.6 + x * 0.01) * 10 * k;
      return <path key={i} d={`M ${x} ${y} q ${sway * 0.5} ${-hh * 0.5} ${sway} ${-hh}`} strokeWidth={2 + 4 * k} />;
    })}
  </g>
);
