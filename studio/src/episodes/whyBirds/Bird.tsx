import React from 'react';
import {random} from 'remotion';
import {INK} from '../../lib/util';
import type {BirdLight} from '../../shorts/polish';

/* =====================================================================
 * طائر كرتوني أصلي بأسلوب القناة: جسم مستدير، عين نقطية، خط أسود سميك، جناحان يرفرفان.
 * الأصل (0,0) = مركز الجسم. ينظر لليمين؛ flip لليسار. rot لميل الجسم (مثلاً 90 = يطير لأسفل).
 * ===================================================================== */

export type BirdKind = 'sparrow' | 'swallow' | 'goose' | 'tern';
export type BirdExpr = 'neutral' | 'happy' | 'sad' | 'shock' | 'think';

const KINDS: Record<BirdKind, {body: string; belly: string; wing: string; beak: string; cap?: string; tail: 'round' | 'fork'; neck?: number}> = {
  sparrow: {body: '#b9824f', belly: '#f3dfbd', wing: '#8a5a35', beak: '#f2b33a', tail: 'round'},
  swallow: {body: '#2c3f6e', belly: '#f6ead8', wing: '#1f2d52', beak: '#3a2a20', tail: 'fork'},
  goose: {body: '#8f8a80', belly: '#e9e3d6', wing: '#6c675e', beak: '#2a2622', cap: '#2a2622', tail: 'round', neck: 1},
  tern: {body: '#fbfbfb', belly: '#ffffff', wing: '#c7ced8', beak: '#e0392b', cap: '#1d1d24', tail: 'fork'},
};

export const Bird: React.FC<{
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  rot?: number;
  frame: number;
  kind?: BirdKind;
  mode?: 'fly' | 'perch' | 'glide';
  expr?: BirdExpr;
  seed?: number;
  flapRate?: number;
  peck?: number; // 0..1 الرأس ينخفض للنقر
  shiver?: number; // 0..1 ارتجاف من البرد
  mouth?: number; // 0..1 منقار مفتوح (زقزقة/صراخ)
  carry?: 'worm' | null;
  light?: BirdLight;
  /** نوبات رفرفة يتخللها انزلاق (طيران طبيعي للمسافات الطويلة) */
  bursts?: boolean;
  /** 0..1 فرملة الهبوط: الجناحان يرتفعان ويتقدمان والجسم يميل للأعلى */
  flare?: number;
  /** 0..1 الرجلان ممدودتان للأمام استعداداً للهبوط */
  legs?: number;
}> = ({x, y, s = 1, flip, rot = 0, frame, kind = 'sparrow', mode = 'fly', expr = 'neutral', seed = 0, flapRate = 1, peck = 0, shiver = 0, mouth = 0, carry, light, bursts = false, flare = 0, legs = 0}) => {
  const uid = React.useId().replace(/:/g, '');
  const lxL = light ? light.lx * (flip ? -1 : 1) : 0;
  const K = KINDS[kind];
  const ph = frame * 0.42 * flapRate * (1 + flare * 0.8) + seed * 2.1;
  // ضربة لأسفل سريعة (٤٠٪ من الدورة) ورجوع لأعلى أبطأ
  const cyc = (((ph / (Math.PI * 2)) % 1) + 1) % 1;
  const ez = (v: number) => v * v * (3 - 2 * v);
  const stroke = cyc < 0.4 ? 1 - 2 * ez(cyc / 0.4) : -1 + 2 * ez((cyc - 0.4) / 0.6);
  // نوبات: رفرفة ~1.8ث ثم انزلاق ~1.2ث (طور مختلف لكل طائر)
  const burstW = bursts ? Math.min(1, Math.max(0, (Math.sin(frame * 0.07 + seed * 1.9) + 0.35) * 2.2)) : 1;
  const flyFlap = stroke * burstW + (1 - burstW) * 0.18;
  const flap = mode === 'fly' ? flyFlap * (1 - flare) + flare * (0.75 + 0.25 * stroke) : mode === 'glide' ? 0.15 + 0.08 * Math.sin(ph * 0.3) : 0;
  const upstroke = mode === 'fly' && cyc >= 0.4 ? Math.sin(((cyc - 0.4) / 0.6) * Math.PI) * burstW : 0;
  // الجسم يرتفع مع الضربة لأسفل؛ الرأس يثبت نسبياً
  const bob = mode === 'fly' ? flap * 7 : mode === 'perch' ? Math.sin(frame * 0.12 + seed) * 1.5 : mode === 'glide' ? Math.sin(frame * 0.06 + seed) * 4 : 0;
  const tailRot = mode === 'perch' ? Math.sin(frame * 0.09 + seed) * 3 : Math.sin(ph - 1.3) * 7 * burstW - flare * 14;
  const bodyTilt = -flare * 24;
  const sx = shiver ? Math.sin(frame * 2.7 + seed) * 3 * shiver : 0;
  const blink = (frame + seed * 37 + 50) % 97 < 4;
  const headDy = peck * 26 - (mode === 'fly' ? bob * 0.7 : 0) + flare * 6;
  const headDx = peck * 10;
  const sw = 5;
  const L0 = kind === 'tern' || kind === 'swallow' ? 112 : kind === 'goose' ? 104 : 86;
  /** جناح بريش: مرسوم على المحور +x بطول L ثم يُدار حول الكتف. flap=1 لأعلى، −1 لأسفل */
  const Wing: React.FC<{a: number; fill: string; dx?: number; dy?: number; op?: number}> = ({a, fill, dx = 0, dy = 0, op = 1}) => {
    const A = (mode === 'glide' ? -158 + a * 14 : 150 + (-100 - 150) * ((a + 1) / 2)) + flare * 28;
    const L = L0 * (1 - 0.24 * upstroke);
    const d =
      `M 0 -15 C ${L * 0.35} -32 ${L * 0.78} -26 ${L} -2 ` +
      `L ${L * 0.88} 8 L ${L * 0.8} 2 L ${L * 0.7} 13 L ${L * 0.6} 5 L ${L * 0.48} 15 L ${L * 0.36} 7 Q ${L * 0.16} 20 0 15 Z`;
    return (
      <g transform={`translate(${dx - 6} ${dy - 12}) rotate(${A})`} opacity={op}>
        <path d={d} fill={fill} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        <path d={`M ${L * 0.18} -4 Q ${L * 0.5} -12 ${L * 0.78} -6`} stroke={INK} strokeWidth={2.5} fill="none" opacity={0.35} />
      </g>
    );
  };
  const neckFwd = !!K.neck && mode !== 'perch';
  /** ظل هلالي + حافة ضوء لشكل (قطع ناقص) — داخل نفس إحداثيات الطائر */
  const Shade: React.FC<{k: string; cx: number; cy: number; rx: number; ry: number}> = ({k, cx, cy, rx, ry}) =>
    !light ? null : (
      <g>
        <defs>
          <mask id={`${uid}-${k}-s`} maskUnits="userSpaceOnUse" x={-400} y={-400} width={800} height={800}>
            <rect x={-400} y={-400} width={800} height={800} fill="#fff" />
            <ellipse cx={cx + lxL * rx * 0.34} cy={cy - ry * 0.34} rx={rx} ry={ry} fill="#000" />
          </mask>
          <mask id={`${uid}-${k}-r`} maskUnits="userSpaceOnUse" x={-400} y={-400} width={800} height={800}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" />
            <ellipse cx={cx - lxL * rx * 0.09} cy={cy + ry * 0.07} rx={rx} ry={ry} fill="#000" />
          </mask>
        </defs>
        {light.ambient && <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={light.ambient} opacity={light.ambientOp ?? 0.15} />}
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={light.shadow} opacity={0.5} mask={`url(#${uid}-${k}-s)`} />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={light.rim} opacity={0.6} mask={`url(#${uid}-${k}-r)`} />
      </g>
    );
  return (
    <g transform={`translate(${x + sx} ${y + bob * s}) rotate(${rot + (flip ? -bodyTilt : bodyTilt)}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      {/* الظل الأرضي للطائر الواقف */}
      {mode === 'perch' && <ellipse cx={0} cy={56} rx={40} ry={8} fill="#000" opacity={0.16} />}
      {/* الجناح البعيد */}
      {mode !== 'perch' && <Wing a={Math.max(-1, Math.min(1, flap * 0.9 + 0.1))} fill={K.wing} dx={10} dy={-4} op={0.85} />}
      {/* الذيل */}
      <g transform={`rotate(${tailRot} -38 0)`}>
        {K.tail === 'fork' ? (
          <path d={`M -40 -6 L -92 ${-26 - flare * 12} L -70 -2 L -96 ${16 + flare * 12} L -40 8 Z`} fill={K.wing} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        ) : (
          <path d={`M -38 -10 Q -76 ${-18 - flare * 10} -78 2 Q -70 ${16 + flare * 10} -38 10 Z`} fill={K.wing} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
        )}
      </g>
      {/* الرجلان ممدودتان للهبوط */}
      {mode !== 'perch' && legs > 0 && (
        <g stroke="#e3953a" strokeWidth={5} strokeLinecap="round" fill="none" opacity={Math.min(1, legs * 2)}>
          <path d={`M -4 32 L ${-4 + 22 * legs} ${32 + 24 * legs} m -8 2 l 16 -2`} />
          <path d={`M 12 32 L ${12 + 24 * legs} ${32 + 20 * legs} m -8 2 l 16 -2`} />
        </g>
      )}
      {/* الأرجل */}
      {mode === 'perch' && (
        <g stroke="#e3953a" strokeWidth={5} strokeLinecap="round" fill="none">
          <path d="M -8 34 L -10 54 M -16 56 L -2 56" />
          <path d="M 10 34 L 12 54 M 6 56 L 20 56" />
        </g>
      )}
      {/* الجسم */}
      <ellipse cx={0} cy={0} rx={50} ry={kind === 'goose' ? 36 : 40} fill={K.body} stroke={INK} strokeWidth={sw} />
      <path d="M -26 14 Q 6 44 44 10 Q 20 26 -26 14 Z" fill={K.belly} opacity={0.95} />
      <Shade k="b" cx={0} cy={0} rx={47} ry={kind === 'goose' ? 33 : 37} />
      {/* الرأس */}
      <g transform={`translate(${headDx} ${headDy})`}>
        {K.neck ? <path d={neckFwd ? 'M 26 -6 Q 52 -12 76 -16' : 'M 26 -10 Q 44 -40 50 -58'} stroke={INK} strokeWidth={26} strokeLinecap="round" fill="none" /> : null}
        {K.neck ? <path d={neckFwd ? 'M 26 -6 Q 52 -12 76 -16' : 'M 26 -10 Q 44 -40 50 -58'} stroke={K.cap} strokeWidth={17} strokeLinecap="round" fill="none" /> : null}
        <g transform={K.neck ? (neckFwd ? 'translate(46 6)' : 'translate(18 -44)') : ''}>
          <circle cx={34} cy={-24} r={30} fill={K.neck ? K.cap : K.body} stroke={INK} strokeWidth={sw} />
          <Shade k="h" cx={34} cy={-24} rx={27} ry={27} />
          {K.cap && !K.neck && <path d={kind === 'tern' ? 'M 6 -28 Q 30 -62 62 -34 Q 40 -36 30 -26 Q 18 -20 6 -28 Z' : 'M 50 -14 Q 58 -4 52 4 Q 40 0 44 -12 Z'} fill={K.cap} />}
          {K.neck && <path d="M 22 -16 Q 34 -6 46 -14 Q 40 -2 28 -4 Z" fill="#f4f1ea" />}
          {/* المنقار */}
          <path d={`M 58 ${-30 - mouth * 6} L ${86} ${-23 - mouth * 4} L 60 -20 Z`} fill={K.beak} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d={`M 60 -20 L ${84} ${-16 + mouth * 12} L 57 ${-12 + mouth * 4} Z`} fill={K.beak} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          {mouth > 0.3 && <path d={`M 62 -20 L 76 ${-19 + mouth * 6}`} stroke="#b02a2a" strokeWidth={4} />}
          {carry === 'worm' && <path d="M 84 -18 q 8 14 -2 24 q -10 10 2 22" stroke="#d2697a" strokeWidth={7} strokeLinecap="round" fill="none" />}
          {/* العين */}
          {blink ? (
            <path d="M 36 -30 L 50 -30" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          ) : expr === 'happy' ? (
            <path d="M 36 -28 Q 43 -38 50 -28" stroke={INK} strokeWidth={4.5} strokeLinecap="round" fill="none" />
          ) : (
            <>
              {expr === 'shock' && <circle cx={43} cy={-30} r={11} fill="#fff" stroke={INK} strokeWidth={3} />}
              <circle cx={44} cy={-30} r={expr === 'shock' ? 5 : 6.5} fill={INK} />
              <circle cx={46} cy={-32} r={2} fill="#fff" />
            </>
          )}
          {expr === 'sad' && <path d="M 32 -44 L 52 -38" stroke={INK} strokeWidth={4} strokeLinecap="round" />}
          {expr === 'think' && <path d="M 34 -42 L 54 -46" stroke={INK} strokeWidth={4} strokeLinecap="round" />}
          <circle cx={30} cy={-14} r={6} fill="#ff8f8f" opacity={0.35} />
        </g>
      </g>
      {/* الجناح القريب */}
      {mode === 'perch' ? (
        <path d={`M -30 -14 Q 6 ${-30 + shiver * 4} 30 -6 Q 4 18 -30 8 Z`} fill={K.wing} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      ) : (
        <Wing a={flap} fill={K.wing} />
      )}
    </g>
  );
};

/** فرخ صغير في العش: كرة زغب بمنقار مفتوح */
export const Chick: React.FC<{x: number; y: number; s?: number; frame: number; seed?: number; chirp?: number}> = ({x, y, s = 1, frame, seed = 0, chirp = 1}) => {
  const open = chirp * Math.max(0, Math.sin(frame * 0.55 + seed * 1.7));
  const bounce = -Math.abs(Math.sin(frame * 0.28 + seed)) * 8 * chirp;
  return (
    <g transform={`translate(${x} ${y + bounce}) scale(${s})`}>
      <circle cx={0} cy={0} r={30} fill="#f5d36a" stroke={INK} strokeWidth={4.5} />
      {[-18, -6, 8].map((dx, i) => (
        <path key={i} d={`M ${dx} -28 q 4 -12 8 -2`} stroke={INK} strokeWidth={3} fill="none" />
      ))}
      <circle cx={-9} cy={-6} r={4.5} fill={INK} />
      <circle cx={11} cy={-6} r={4.5} fill={INK} />
      <path d={`M -12 6 L 0 ${-2 - open * 10} L 12 6 Z`} fill="#f29a2e" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      <path d={`M -12 8 L 0 ${16 + open * 16} L 12 8 Z`} fill="#f29a2e" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      {open > 0.3 && <path d={`M -7 9 L 0 ${12 + open * 10} L 7 9 Z`} fill="#c2322f" />}
    </g>
  );
};

/** طيور بعيدة جداً: شكل «m» بسيط يرفرف (رخيص لأسراب كبيرة) */
export const FarBirds: React.FC<{frame: number; pts: {x: number; y: number; s?: number}[]; color?: string; seed?: string}> = ({frame, pts, color = '#2a2a35', seed = 'fb'}) => (
  <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    {pts.map((p, i) => {
      const a = Math.sin(frame * 0.45 + random(`${seed}-${i}`) * 6) * 9 * (p.s ?? 1);
      const w = 16 * (p.s ?? 1);
      return <path key={i} d={`M ${p.x - w} ${p.y - a} Q ${p.x - w / 2} ${p.y - 6 * (p.s ?? 1)} ${p.x} ${p.y} Q ${p.x + w / 2} ${p.y - 6 * (p.s ?? 1)} ${p.x + w} ${p.y - a}`} strokeWidth={3.4 * (p.s ?? 1)} />;
    })}
  </g>
);

/** تشكيل V: مواضع الطيور حول القائد (القائد في المقدمة يميناً) */
export const vFormation = (n: number, gap = 90): {dx: number; dy: number; i: number}[] => {
  const out = [{dx: 0, dy: 0, i: 0}];
  for (let i = 1; i < n; i++) {
    const k = Math.ceil(i / 2);
    out.push({dx: -k * gap, dy: (i % 2 ? -1 : 1) * k * gap * 0.55, i});
  }
  return out;
};

/** نقطة على منحنى بيزيه تكعيبي + زاوية المماس بالدرجات */
export type Pt = [number, number];
export const bezier = (p: [Pt, Pt, Pt, Pt], u: number) => {
  const v = 1 - u;
  const x = v * v * v * p[0][0] + 3 * v * v * u * p[1][0] + 3 * v * u * u * p[2][0] + u * u * u * p[3][0];
  const y = v * v * v * p[0][1] + 3 * v * v * u * p[1][1] + 3 * v * u * u * p[2][1] + u * u * u * p[3][1];
  const dx = 3 * v * v * (p[1][0] - p[0][0]) + 6 * v * u * (p[2][0] - p[1][0]) + 3 * u * u * (p[3][0] - p[2][0]);
  const dy = 3 * v * v * (p[1][1] - p[0][1]) + 6 * v * u * (p[2][1] - p[1][1]) + 3 * u * u * (p[3][1] - p[2][1]);
  return {x, y, ang: (Math.atan2(dy, dx) * 180) / Math.PI};
};

/**
 * سرب حي على مسار منحنٍ: تشكيل V يتبع مماس المسار، كل طائر يتمايل حول مكانه
 * بإيقاع رفرفة مختلف، والطيور الخلفية تتأخر قليلاً على المسار (فينثني التشكيل مع المنعطفات).
 */
export const Flock: React.FC<{
  path: [Pt, Pt, Pt, Pt];
  u: number;
  frame: number;
  n?: number;
  gap?: number;
  kind?: BirdKind;
  s?: number | ((u: number) => number);
  light?: BirdLight;
  bursts?: boolean;
  maxTilt?: number;
  tilt?: number;
  seed?: number;
}> = ({path, u, frame, n = 7, gap = 110, kind = 'goose', s = 1, light, bursts = true, maxTilt = 30, tilt, seed = 0}) => {
  const birds = vFormation(n, gap);
  const lead = bezier(path, Math.min(1, Math.max(0, u)));
  const flip = Math.abs(lead.ang) > 90;
  return (
    <g>
      {birds
        .slice()
        .reverse()
        .map((b) => {
          // الطيور الخلفية متأخرة على المسار بقدر بُعدها
          const uu = Math.max(0, Math.min(1, u - Math.abs(b.dx) * 0.00018));
          const P = bezier(path, uu);
          const ang = P.ang;
          const sc = typeof s === 'function' ? s(uu) : s;
          // تدوير إزاحة التشكيل مع اتجاه المسار
          const a = (ang * Math.PI) / 180;
          const ox = b.dx * Math.cos(a) - b.dy * 0.9 * Math.sin(a);
          const oy = b.dx * Math.sin(a) + b.dy * 0.9 * Math.cos(a);
          const r = random(`flock-${seed}-${b.i}`);
          const wx = Math.sin(frame * 0.05 + r * 9) * 14 + Math.sin(frame * 0.017 + r * 4) * 10;
          const wy = Math.cos(frame * 0.043 + r * 7) * 12;
          const rotRaw = flip ? ang - 180 * Math.sign(ang) : ang;
          const rot = tilt ?? Math.max(-maxTilt, Math.min(maxTilt, flip ? -rotRaw : rotRaw));
          return (
            <Bird
              key={b.i}
              kind={kind}
              x={P.x + (ox + wx) * sc}
              y={P.y + (oy + wy) * sc}
              s={sc * (1 - b.i * 0.02)}
              flip={flip}
              rot={flip ? -rot : rot}
              frame={frame}
              seed={b.i + seed * 7}
              flapRate={0.88 + r * 0.26}
              bursts={bursts}
              light={light}
            />
          );
        })}
    </g>
  );
};
