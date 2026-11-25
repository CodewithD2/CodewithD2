import React from 'react';
import {random} from 'remotion';
import {Bloom, Halo, Smoke} from '../../lib/fx';
import {atmos} from '../../lib/palette';
import {INK, lerp} from '../../lib/util';

/* =================== علم مصر (١٩٥٣–١٩٥٨): أخضر بهلال أبيض وثلاث نجوم =================== */
const star = (cx: number, cy: number, r: number) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.42 : r;
    d += `${i ? 'L' : 'M'} ${cx + Math.cos(a) * rr} ${cy + Math.sin(a) * rr} `;
  }
  return d + 'Z';
};

export const EgyptFlag: React.FC<{x: number; y: number; w?: number; pole?: number; frame: number; seed?: number; s?: number; outline?: boolean}> = ({
  x,
  y,
  w = 120,
  pole = 220,
  frame,
  seed = 0,
  s = 1,
  outline = true,
}) => {
  const h = w * 0.66;
  const N = 10;
  const wave = (t: number) => Math.sin(frame / 4.5 - t * 5 + seed) * 9 * t;
  const top = Array.from({length: N + 1}, (_, i) => `${(i / N) * w} ${-pole + wave(i / N)}`);
  const bot = Array.from({length: N + 1}, (_, i) => `${((N - i) / N) * w} ${-pole + h + wave((N - i) / N)}`);
  const mid = wave(0.5);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={outline ? INK : 'none'} strokeWidth={4} strokeLinejoin="round">
      <rect x={-4} y={-pole - 6} width={8} height={pole + 6} fill="#5a3c22" />
      <path d={`M ${top.join(' L ')} L ${bot.join(' L ')} Z`} fill="#1f7a3a" />
      <g stroke="none" fill="#f7f4ea">
        <circle cx={w * 0.42} cy={-pole + h / 2 + mid} r={h * 0.26} />
        <circle cx={w * 0.47} cy={-pole + h / 2 + mid - h * 0.03} r={h * 0.22} fill="#1f7a3a" />
        {[-0.18, 0, 0.18].map((o, i) => (
          <path key={i} d={star(w * 0.5 + h * 0.06, -pole + h / 2 + mid + o * h, h * 0.065)} />
        ))}
      </g>
    </g>
  );
};

/* =================== الحشود (خفيفة على التصيير) =================== */
const SHIRTS = ['#f2efe6', '#e8e2d2', '#d9cfb8', '#c9c2b0', '#8fa3b8', '#b89a78', '#6b7a8f', '#e6d8c0', '#a8b8a0', '#d4c4a8'];
const SKINS = ['#d9a27a', '#c98f68', '#e2b48c', '#b87d58', '#efc29b'];

export const Crowd: React.FC<{
  id: string;
  x0: number;
  x1: number;
  y0: number;
  rows: number;
  gap: number;
  s0: number;
  s1: number;
  frame: number;
  cheer: number; // 0..1 حماس الحشد (رفع الأيدي والقفز)
  haze: string;
  fade?: number; // ذوبان الصف الخلفي في الجو
  flags?: number; // نسبة حاملي الأعلام
  outline?: boolean;
  hats?: boolean; // قبعات تُرمى في الهواء
  sp?: number; // مضاعف التباعد (أكبر = أخف على التصيير)
  mass?: string; // لون كتلة خلف الحشد لتبدو كثيفة
}> = ({id, x0, x1, y0, rows, gap, s0, s1, frame, cheer, haze, fade = 0.4, flags = 0.05, outline = false, hats = false, sp = 1, mass}) => {
  const out: React.ReactNode[] = [];
  if (mass) out.push(<rect key="mass" x={x0 - 200} y={y0 - 50 * s0} width={x1 - x0 + 400} height={rows * gap + 900} fill={mass} />);
  for (let r = 0; r < rows; r++) {
    const t = rows > 1 ? r / (rows - 1) : 1;
    const s = lerp(s0, s1, t);
    const y = y0 + r * gap;
    const f = fade * (1 - t);
    const step = 44 * s * sp;
    for (let x = x0 + (r % 2) * step * 0.5; x < x1; x += step) {
      const k = `${id}-${r}-${Math.round(x)}`;
      const rnd = random(k);
      const px = x + (random(`${k}x`) - 0.5) * step * 0.6;
      const shirt = atmos(SHIRTS[Math.floor(random(`${k}c`) * SHIRTS.length)], haze, f);
      const skin = atmos(SKINS[Math.floor(random(`${k}s`) * SKINS.length)], haze, f);
      const hair = atmos('#1e1612', haze, f);
      const jump = cheer > 0 ? Math.max(0, Math.sin(frame / (4 + rnd * 3) + rnd * 20)) * 10 * s * cheer : 0;
      const py = y - jump;
      const raised = random(`${k}r`) < 0.15 + cheer * 0.6;
      const hasFlag = random(`${k}f`) < flags;
      const st = outline ? {stroke: INK, strokeWidth: 3} : {};
      const wave = Math.sin(frame / 3.5 + rnd * 30) * 14 * s;
      out.push(
        <g key={k}>
          {raised && (
            <g>
              <line x1={px + 14 * s} y1={py - 52 * s} x2={px + 22 * s + wave * 0.4} y2={py - 112 * s} stroke={shirt} strokeWidth={11 * s} strokeLinecap="round" />
              <circle cx={px + 22 * s + wave * 0.4} cy={py - 114 * s} r={7 * s} fill={skin} />
            </g>
          )}
          {hasFlag && <EgyptFlag x={px - 16 * s} y={py - 40 * s} w={70} pole={150} s={s} frame={frame} seed={rnd * 10} outline={outline} />}
          <ellipse cx={px} cy={py - 26 * s} rx={23 * s} ry={30 * s} fill={shirt} {...st} />
          <circle cx={px} cy={py - 70 * s} r={17 * s} fill={skin} {...st} />
          <path d={`M ${px - 17 * s} ${py - 72 * s} A ${17 * s} ${17 * s} 0 0 1 ${px + 17 * s} ${py - 72 * s} Z`} fill={hair} />
          {hats && random(`${k}h`) < 0.06 && (
            <g transform={`translate(${px} ${py - 120 * s - ((frame * 3 + rnd * 200) % 160) * s}) rotate(${frame * 6 + rnd * 360})`}>
              <ellipse cx={0} cy={0} rx={16 * s} ry={6 * s} fill="#3a3028" />
              <rect x={-9 * s} y={-12 * s} width={18 * s} height={12 * s} rx={3 * s} fill="#3a3028" />
            </g>
          )}
        </g>,
      );
    }
  }
  return <g>{out}</g>;
};

/* =================== مبنى البورصة بميدان المنشية مع الشرفة =================== */
export const Bourse: React.FC<{x: number; y: number; s?: number; stone: string; shade: string; win: string; frame: number; id: string; children?: React.ReactNode}> = ({
  x,
  y,
  s = 1,
  stone,
  shade,
  win,
  frame,
  id,
  children,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* الواجهة */}
    <rect x={-560} y={-560} width={1120} height={560} fill={stone} stroke={INK} strokeWidth={6} />
    <path d="M -600 -560 L 0 -700 L 600 -560 Z" fill={stone} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -480 -575 L 0 -680 L 480 -575 Z" fill={shade} />
    <rect x={-600} y={-575} width={1200} height={24} fill={stone} stroke={INK} strokeWidth={5} />
    {/* أعمدة */}
    {Array.from({length: 10}, (_, i) => {
      const cx = -495 + i * 110;
      return (
        <g key={i}>
          <rect x={cx - 18} y={-540} width={36} height={520} fill={stone} stroke={INK} strokeWidth={4} />
          <rect x={cx - 26} y={-552} width={52} height={14} fill={stone} stroke={INK} strokeWidth={4} />
          <line x1={cx - 6} y1={-536} x2={cx - 6} y2={-24} stroke={shade} strokeWidth={4} />
        </g>
      );
    })}
    {/* نوافذ مضيئة بين الأعمدة */}
    <Bloom id={`bourse-${id}`} x={-560} y={-560} w={1120} h={560} radius={12} strength={1.4}>
      {Array.from({length: 9}, (_, i) =>
        [0, 1].map((row) => (
          <path
            key={`${i}-${row}`}
            d={`M ${-462 + i * 110} ${-200 - row * 230} L ${-462 + i * 110} ${-280 - row * 230} A 22 22 0 0 1 ${-418 + i * 110} ${-280 - row * 230} L ${-418 + i * 110} ${-200 - row * 230} Z`}
            fill={win}
            opacity={0.75 + 0.25 * Math.sin(frame / 20 + i + row)}
          />
        )),
      )}
    </Bloom>
    <rect x={-560} y={-28} width={1120} height={28} fill={shade} stroke={INK} strokeWidth={5} />
    {/* الشرفة: ما بداخلها (الخطيب) يُرسم بين الجدار والدرابزين */}
    <rect x={-170} y={-330} width={340} height={20} fill={stone} stroke={INK} strokeWidth={5} />
    {children}
    <g stroke={INK} strokeWidth={4}>
      <rect x={-180} y={-318} width={360} height={14} fill={stone} />
      {Array.from({length: 13}, (_, i) => (
        <rect key={i} x={-170 + i * 27} y={-304} width={12} height={48} rx={5} fill={stone} />
      ))}
      <rect x={-190} y={-258} width={380} height={18} fill={stone} />
    </g>
    {/* أعلام مسدلة على الواجهة */}
    {[-330, 330].map((dx, i) => (
      <g key={i} stroke={INK} strokeWidth={4}>
        <path d={`M ${dx - 50} -520 L ${dx + 50} -520 L ${dx + 46 + Math.sin(frame / 12 + i) * 4} -330 L ${dx - 46 + Math.sin(frame / 12 + i) * 4} -330 Z`} fill="#1f7a3a" />
        <circle cx={dx - 6} cy={-430} r={18} fill="#f7f4ea" stroke="none" />
        <circle cx={dx} cy={-433} r={15} fill="#1f7a3a" stroke="none" />
      </g>
    ))}
  </g>
);

/* =================== ميكروفونات الخمسينيات =================== */
export const Mics: React.FC<{x: number; y: number; s?: number; frame: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={4} strokeLinejoin="round">
    {[
      [-46, -20, -14],
      [-14, -36, -4],
      [18, -30, 6],
      [48, -16, 16],
    ].map(([dx, dy, rot], i) => (
      <g key={i} transform={`translate(${dx} ${dy}) rotate(${rot})`}>
        <rect x={-3} y={0} width={6} height={90} fill="#3a3a44" />
        <rect x={-14} y={-38} width={28} height={40} rx={12} fill={['#b9bec8', '#8c929e', '#c9ccd4', '#9aa0ab'][i]} />
        {[-26, -18, -10].map((yy) => (
          <line key={yy} x1={-10} y1={yy} x2={10} y2={yy} strokeWidth={2} />
        ))}
      </g>
    ))}
    <rect x={-70} y={60} width={140} height={22} rx={6} fill="#2a2a34" />
  </g>
);

/* =================== كشافات ضوئية تمسح السماء =================== */
export const Searchlights: React.FC<{id: string; frame: number; bases: number[]; y: number; color: string; len?: number; opacity?: number}> = ({
  id,
  frame,
  bases,
  y,
  color,
  len = 1500,
  opacity = 0.35,
}) => (
  <g style={{mixBlendMode: 'screen'}} opacity={opacity}>
    <defs>
      <linearGradient id={`sl-${id}`} x1="0" x2="0" y1="1" y2="0">
        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
    {bases.map((bx, i) => {
      const ang = (-90 + Math.sin(frame / (40 + i * 7) + i * 1.7) * 28) * (Math.PI / 180);
      const spread = 0.06;
      const p1 = [bx + Math.cos(ang - spread) * len, y + Math.sin(ang - spread) * len];
      const p2 = [bx + Math.cos(ang + spread) * len, y + Math.sin(ang + spread) * len];
      return (
        <path key={i} d={`M ${bx - 8} ${y} L ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${bx + 8} ${y} Z`} fill={`url(#sl-${id})`} />
      );
    })}
  </g>
);

/* =================== كورنيش الإسكندرية البعيد + قلعة قايتباي =================== */
export const AlexSkyline: React.FC<{id: string; x0: number; x1: number; base: number; fill: string; win: string; frame: number; bloom?: boolean}> = ({
  id,
  x0,
  x1,
  base,
  fill,
  win,
  frame,
  bloom = true,
}) => {
  const blocks: React.ReactNode[] = [];
  const lights: React.ReactNode[] = [];
  for (let x = x0, i = 0; x < x1; i++) {
    const w = 70 + random(`${id}-w${i}`) * 90;
    const h = 90 + random(`${id}-h${i}`) * 170;
    blocks.push(<rect key={i} x={x} y={base - h} width={w} height={h + 60} fill={fill} />);
    if (random(`${id}-d${i}`) > 0.7) blocks.push(<path key={`d${i}`} d={`M ${x + w * 0.25} ${base - h} A ${w * 0.25} ${w * 0.22} 0 0 1 ${x + w * 0.75} ${base - h} Z`} fill={fill} />);
    for (let fy = base - h + 16; fy < base - 14; fy += 24)
      for (let fx = x + 10; fx < x + w - 14; fx += 20)
        if (random(`${id}-l${i}-${fx}-${fy}`) > 0.62)
          lights.push(<rect key={`${i}-${fx}-${fy}`} x={fx} y={fy} width={8} height={11} fill={win} opacity={0.55 + 0.45 * Math.sin(frame / 25 + fx + fy)} />);
    x += w + 6;
  }
  return (
    <g>
      {blocks}
      {bloom ? (
        <Bloom id={`alex-${id}`} x={x0} y={base - 300} w={x1 - x0} h={320} radius={7} strength={1.5}>
          {lights}
        </Bloom>
      ) : (
        lights
      )}
    </g>
  );
};

export const Qaitbay: React.FC<{x: number; y: number; s?: number; fill: string; rim?: string}> = ({x, y, s = 1, fill, rim}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
    <rect x={-260} y={-90} width={520} height={100} />
    {[-260, 220].map((tx) => (
      <g key={tx}>
        <rect x={tx} y={-150} width={40} height={160} />
        <path d={`M ${tx} -150 A 20 16 0 0 1 ${tx + 40} -150 Z`} />
      </g>
    ))}
    <rect x={-110} y={-230} width={220} height={150} />
    {Array.from({length: 10}, (_, i) => (
      <rect key={i} x={-110 + i * 23} y={-246} width={12} height={18} />
    ))}
    {Array.from({length: 4}, (_, i) => (
      <rect key={`c${i}`} x={-110 + i * 70} y={-260} width={30} height={30} />
    ))}
    <rect x={60} y={-330} width={22} height={110} />
    <path d="M 56 -330 L 71 -360 L 86 -330 Z" />
    {rim && <path d="M -110 -230 L 110 -230" stroke={rim} strokeWidth={3} opacity={0.6} />}
  </g>
);

/* =================== نخلة =================== */
export const Palm: React.FC<{x: number; y: number; h: number; fill: string; frame: number; seed?: number}> = ({x, y, h, fill, frame, seed = 0}) => {
  const lean = Math.sin(seed) * 0.15;
  const tx = x + h * lean;
  const ty = y - h;
  const sway = Math.sin(frame / 25 + seed) * 4;
  return (
    <g fill={fill} stroke={fill}>
      <path d={`M ${x - 9} ${y} Q ${x + h * lean * 0.3} ${y - h * 0.5} ${tx - 4} ${ty} L ${tx + 4} ${ty} Q ${x + h * lean * 0.3 + 10} ${y - h * 0.5} ${x + 9} ${y} Z`} strokeWidth={1} />
      {Array.from({length: 9}, (_, i) => {
        const a = (-170 + i * 20) * (Math.PI / 180);
        const L = h * (0.34 + 0.06 * Math.sin(i * 2));
        const ex = tx + Math.cos(a) * L + sway;
        const ey = ty + Math.sin(a) * L * 0.55 + L * 0.35;
        return <path key={i} d={`M ${tx} ${ty} Q ${(tx + ex) / 2 + sway} ${Math.min(ty, ey) - L * 0.25} ${ex} ${ey}`} fill="none" strokeWidth={h * 0.035} strokeLinecap="round" />;
      })}
    </g>
  );
};

/* =================== مبنى شركة القناة (واجهة بأقواس وثلاث قباب خضراء) =================== */
export const CanalHQ: React.FC<{x: number; y: number; s?: number; wall: string; shade: string; dome: string; win: string; frame: number; id: string; lit?: number}> = ({
  x,
  y,
  s = 1,
  wall,
  shade,
  dome,
  win,
  frame,
  id,
  lit = 1,
}) => {
  const d = (cx: number, by: number, rw: number, rh: number) => `M ${cx - rw} ${by} A ${rw} ${rh} 0 0 1 ${cx + rw} ${by} Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
      <rect x={-640} y={-360} width={1280} height={360} fill={wall} />
      <rect x={-660} y={-376} width={1320} height={22} fill={shade} />
      {[-430, 0, 430].map((cx, i) => (
        <g key={i}>
          <rect x={cx - (i === 1 ? 120 : 80)} y={-470} width={i === 1 ? 240 : 160} height={100} fill={wall} />
          <path d={d(cx, -470, i === 1 ? 130 : 88, i === 1 ? 120 : 80)} fill={dome} />
          <rect x={cx - 5} y={i === 1 ? -620 : -578} width={10} height={i === 1 ? 34 : 28} fill={shade} />
        </g>
      ))}
      <Bloom id={`hq-${id}`} x={-660} y={-380} w={1320} h={380} radius={12} strength={1.5}>
        <g stroke="none">
          {Array.from({length: 12}, (_, i) => (
            <rect key={i} x={-600 + i * 104} y={-320} width={44} height={70} rx={20} fill={win} opacity={lit * (0.55 + 0.45 * Math.sin(frame / 18 + i))} />
          ))}
        </g>
      </Bloom>
      {/* الرواق الأرضي */}
      {Array.from({length: 12}, (_, i) => (
        <path key={i} d={`M ${-600 + i * 104} 0 L ${-600 + i * 104} -150 A 34 34 0 0 1 ${-532 + i * 104} -150 L ${-532 + i * 104} 0 Z`} fill={shade} />
      ))}
    </g>
  );
};

/* =================== باخرة (سفينة بضائع خمسينية) =================== */
export const Steamer: React.FC<{x: number; y: number; s?: number; hull: string; deck: string; win: string; frame: number; id: string; smoke: string}> = ({
  x,
  y,
  s = 1,
  hull,
  deck,
  win,
  frame,
  id,
  smoke,
}) => (
  <g>
    <Smoke id={`st-${id}`} x={x + 40 * s} y={y - 230 * s} frame={frame} color={smoke} size={34 * s} rise={360 * s} drift={-260 * s} n={8} opacity={0.3} />
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
      <path d="M -420 -70 L 400 -70 L 360 10 L -380 10 Z" fill={hull} />
      <rect x={-420} y={-80} width={820} height={12} fill="#7a2a24" />
      <rect x={-120} y={-150} width={260} height={80} fill={deck} />
      <rect x={-80} y={-200} width={170} height={52} fill={deck} />
      <rect x={20} y={-250} width={44} height={60} fill="#1a1a22" />
      <rect x={20} y={-236} width={44} height={14} fill="#c9a43a" />
      <line x1={-300} y1={-70} x2={-300} y2={-200} strokeWidth={6} />
      <line x1={280} y1={-70} x2={280} y2={-180} strokeWidth={6} />
      <Bloom id={`stw-${id}`} x={-140} y={-210} w={300} h={160} radius={8}>
        <g stroke="none">
          {Array.from({length: 8}, (_, i) => (
            <circle key={i} cx={-100 + i * 30} cy={-112} r={7} fill={win} />
          ))}
          {Array.from({length: 5}, (_, i) => (
            <rect key={`b${i}`} x={-66 + i * 30} y={-188} width={18} height={16} fill={win} />
          ))}
        </g>
      </Bloom>
    </g>
  </g>
);

/* =================== سيارة خمسينية بأضواء أمامية =================== */
export const Car: React.FC<{x: number; y: number; s?: number; body: string; frame: number; id: string; beam?: string; flip?: boolean}> = ({
  x,
  y,
  s = 1,
  body,
  frame,
  id,
  beam = '#fff3c4',
  flip,
}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <defs>
      <linearGradient id={`beam-${id}`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stopColor={beam} stopOpacity={0.55} />
        <stop offset="100%" stopColor={beam} stopOpacity={0} />
      </linearGradient>
    </defs>
    <path d="M 150 -46 L 720 -120 L 720 40 L 150 -20 Z" fill={`url(#beam-${id})`} style={{mixBlendMode: 'screen'}} />
    <g stroke={INK} strokeWidth={5} strokeLinejoin="round">
      <path d="M -160 -20 Q -170 -60 -120 -66 L -70 -70 Q -40 -118 20 -120 L 70 -120 Q 110 -116 130 -72 Q 168 -66 168 -30 L 168 -10 L -160 -10 Z" fill={body} />
      <path d="M -50 -72 Q -30 -106 14 -108 L 14 -72 Z M 28 -108 L 64 -108 Q 92 -104 108 -72 L 28 -72 Z" fill="#9fc6d6" strokeWidth={4} />
      <rect x={-168} y={-22} width={340} height={12} rx={5} fill="#c9ccd4" />
      {[-100, 100].map((wx) => (
        <g key={wx} transform={`translate(${wx} -6) rotate(${frame * 12})`}>
          <circle r={30} fill="#1a1a1e" />
          <circle r={13} fill="#c9ccd4" strokeWidth={3} />
          <line x1={-13} y1={0} x2={13} y2={0} strokeWidth={3} />
        </g>
      ))}
    </g>
    <Bloom id={`hl-${id}`} x={120} y={-80} w={80} h={80} radius={10} strength={1.8}>
      <circle cx={158} cy={-42} r={10} fill={beam} />
    </Bloom>
  </g>
);

/* =================== راديو قديم يبث الخطاب =================== */
export const Radio: React.FC<{x: number; y: number; s?: number; frame: number; id: string; glow: string}> = ({x, y, s = 1, frame, id, glow}) => (
  <g>
    <RadioWaves id={`rw-${id}`} x={x} y={y - 90 * s} frame={frame} color={glow} s={s} />
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
      <path d="M -110 0 L -110 -120 Q -110 -180 0 -184 Q 110 -180 110 -120 L 110 0 Z" fill="#7a4a26" />
      <path d="M -84 -40 L -84 -120 Q -84 -156 0 -158 Q 84 -156 84 -120 L 84 -40 Z" fill="#d9c49a" />
      {Array.from({length: 6}, (_, i) => (
        <line key={i} x1={-70} y1={-136 + i * 16} x2={70} y2={-136 + i * 16} strokeWidth={2} stroke="#8a6a40" />
      ))}
      {[-50, 50].map((kx) => (
        <circle key={kx} cx={kx} cy={-18} r={11} fill="#3a2414" />
      ))}
    </g>
    <Bloom id={`rd-${id}`} x={x - 40 * s} y={y - 40 * s} w={80 * s} h={40 * s} radius={8}>
      <rect x={x - 26 * s} y={y - 26 * s} width={52 * s} height={14 * s} rx={4} fill={glow} opacity={0.8 + 0.2 * Math.sin(frame / 3)} />
    </Bloom>
  </g>
);

/** موجات صوت/بث تتسع من مصدر */
export const RadioWaves: React.FC<{id: string; x: number; y: number; frame: number; color: string; s?: number; n?: number; max?: number}> = ({
  x,
  y,
  frame,
  color,
  s = 1,
  n = 4,
  max = 320,
}) => (
  <g fill="none" stroke={color} strokeLinecap="round">
    {Array.from({length: n}, (_, i) => {
      const a = ((frame / 40 + i / n) % 1 + 1) % 1;
      const r = 30 * s + a * max * s;
      return (
        <g key={i} opacity={(1 - a) * 0.8}>
          <path d={`M ${x - r * 0.7} ${y - r * 0.7} A ${r} ${r} 0 0 1 ${x + r * 0.7} ${y - r * 0.7}`} strokeWidth={6 * s} />
          <path d={`M ${x - r * 0.95} ${y - r * 0.3} A ${r} ${r} 0 0 0 ${x - r * 0.95} ${y + r * 0.3}`} strokeWidth={6 * s} />
          <path d={`M ${x + r * 0.95} ${y - r * 0.3} A ${r} ${r} 0 0 1 ${x + r * 0.95} ${y + r * 0.3}`} strokeWidth={6 * s} />
        </g>
      );
    })}
  </g>
);

/** قصاصات ورق احتفالية تتساقط */
export const Confetti: React.FC<{id: string; frame: number; x0: number; x1: number; y0: number; n?: number; fall?: number}> = ({id, frame, x0, x1, y0, n = 70, fall = 900}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const L = 90 + random(`${id}-l${i}`) * 80;
      const a = ((frame + random(`${id}-o${i}`) * L) % L) / L;
      const x = lerp(x0, x1, random(`${id}-x${i}`)) + Math.sin(a * 8 + i) * 40;
      const y = y0 + a * fall;
      const c = ['#1f7a3a', '#f7f4ea', '#ffd27a', '#1f7a3a', '#f7f4ea'][i % 5];
      return <rect key={i} x={x} y={y} width={14} height={8} fill={c} transform={`rotate(${frame * 9 + i * 40} ${x + 7} ${y + 4})`} opacity={Math.sin(Math.PI * a)} />;
    })}
  </g>
);

export {Halo};
