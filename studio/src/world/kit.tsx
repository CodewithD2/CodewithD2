import React from 'react';
import {random} from 'remotion';
import {INK} from '../lib/util';
import {lightOf, shadeOf, tinted, useWorld} from './lighting';

/* =====================================================================
 * أدوات رسم المباني — كل أداة بمستويين:
 *   D=false (simple):   شكل مسطّح بخط خارجي رفيع، للبعيد والخلفيات
 *   D=true  (detailed): ظل وضوء حسب جهة الإضاءة، ملمس المادة، عمق (وجه جانبي)،
 *                       ظل تحت البروزات، نوافذ غائرة مضيئة، حافة ضوء
 * الإحداثيات محلية للمبنى؛ الألوان تُصبغ تلقائياً بإضاءة الوقت (WorldCtx).
 * ===================================================================== */

export type Tex = 'stone' | 'brick' | 'plaster' | 'wood' | 'mud' | 'ablaq' | 'none';

const useGid = (p: string) => p + React.useId().replace(/[^a-zA-Z0-9]/g, '');

/** جدار/كتلة: وجه أمامي + وجه جانبي (عمق) + ملمس + ظل أرضي */
export const Wall: React.FC<{x: number; y: number; w: number; h: number; c: string; D?: boolean; tex?: Tex; depth?: number; seed?: string}> = ({
  x,
  y,
  w,
  h,
  c,
  D,
  tex = 'plaster',
  depth = 0,
  seed = 'w',
}) => {
  const W = useWorld();
  const id = useGid('wall');
  const base = tinted(W, c);
  if (!D) return <rect x={x} y={y} width={w} height={h} fill={base} stroke={INK} strokeWidth={3} />;
  const lit = lightOf(W, c);
  const sh = shadeOf(W, c);
  const dark = shadeOf(W, c, 0.5);
  const sideX = W.lightDir < 0 ? x + w : x; // الوجه الجانبي في جهة الظل
  const dx = W.lightDir < 0 ? depth : -depth;
  const lines: React.ReactNode[] = [];
  const line = sh;
  if (tex === 'stone' || tex === 'brick') {
    const rh = tex === 'stone' ? 26 : 13;
    const bw = tex === 'stone' ? 52 : 30;
    for (let r = 0, yy = y + rh; yy < y + h; r++, yy += rh) {
      lines.push(<line key={`h${r}`} x1={x} y1={yy} x2={x + w} y2={yy} />);
      for (let xx = x + ((r % 2) * bw) / 2; xx < x + w; xx += bw) lines.push(<line key={`v${r}-${xx}`} x1={xx} y1={yy - rh} x2={xx} y2={yy} />);
    }
  } else if (tex === 'wood') {
    for (let xx = x + 14; xx < x + w; xx += 14) lines.push(<line key={xx} x1={xx} y1={y} x2={xx} y2={y + h} />);
  } else if (tex === 'mud') {
    for (let i = 0; i < Math.max(3, (w * h) / 9000); i++) {
      const cx = x + random(`${seed}-cx${i}`) * w;
      const cy = y + random(`${seed}-cy${i}`) * h;
      lines.push(<path key={i} d={`M ${cx} ${cy} l ${8 + random(`${seed}-a${i}`) * 10} ${6} l ${-4} ${10}`} fill="none" />);
    }
  } else if (tex === 'plaster') {
    for (let i = 0; i < Math.max(2, (w * h) / 14000); i++) {
      const cx = x + random(`${seed}-px${i}`) * w;
      const cy = y + random(`${seed}-py${i}`) * h;
      lines.push(<ellipse key={i} cx={cx} cy={cy} rx={10 + random(`${seed}-pr${i}`) * 18} ry={6 + random(`${seed}-pq${i}`) * 8} fill={sh} stroke="none" opacity={0.25} />);
    }
  }
  return (
    <g>
      <defs>
        <linearGradient id={`g${id}`} x1={W.lightDir < 0 ? 0 : 1} x2={W.lightDir < 0 ? 1 : 0} y1="0" y2="0">
          <stop offset="0%" stopColor={lit} />
          <stop offset="55%" stopColor={base} />
          <stop offset="100%" stopColor={sh} />
        </linearGradient>
        <linearGradient id={`ao${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={dark} stopOpacity={0} />
          <stop offset="100%" stopColor={dark} stopOpacity={0.55} />
        </linearGradient>
      </defs>
      {depth > 0 && <path d={`M ${sideX} ${y} l ${dx} ${-depth * 0.45} l 0 ${h} l ${-dx} ${depth * 0.45} Z`} fill={dark} stroke={INK} strokeWidth={4} strokeLinejoin="round" />}
      <rect x={x} y={y} width={w} height={h} fill={`url(#g${id})`} />
      {tex === 'ablaq' &&
        Array.from({length: Math.floor(h / 18)}, (_, i) => (i % 2 ? <rect key={i} x={x} y={y + i * 18} width={w} height={18} fill={shadeOf(W, c, 0.28)} opacity={0.7} /> : null))}
      <g stroke={line} strokeWidth={2} opacity={0.55}>
        {lines}
      </g>
      <rect x={x} y={y + h - Math.min(40, h * 0.3)} width={w} height={Math.min(40, h * 0.3)} fill={`url(#ao${id})`} />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={INK} strokeWidth={4} />
      <line x1={x} y1={y + 2} x2={x + w} y2={y + 2} stroke={lit} strokeWidth={3} opacity={0.7} />
    </g>
  );
};

/** كورنيش/إفريز بارز يلقي ظلاً تحته */
export const Cornice: React.FC<{x: number; y: number; w: number; c: string; D?: boolean; h?: number}> = ({x, y, w, c, D, h = 12}) => {
  const W = useWorld();
  return (
    <g>
      {D && <rect x={x} y={y + h} width={w} height={8} fill={shadeOf(W, c, 0.55)} opacity={0.5} />}
      <rect x={x - 6} y={y} width={w + 12} height={h} fill={D ? lightOf(W, c, 0.12) : tinted(W, c)} stroke={INK} strokeWidth={D ? 4 : 3} />
    </g>
  );
};

/** نافذة: غائرة بإطار وزجاج، تضيء ليلاً */
export const Win: React.FC<{x: number; y: number; w: number; h: number; D?: boolean; arch?: boolean; frameC?: string; seed?: string; shutters?: string}> = ({
  x,
  y,
  w,
  h,
  D,
  arch,
  frameC = '#e8dcc4',
  seed = 'win',
  shutters,
}) => {
  const W = useWorld();
  const on = W.lit > 0 && random(`${seed}-on`) < 0.35 + W.lit * 0.55;
  const glass = on ? W.P.warm : W.time === 'day' ? '#5a7a98' : shadeOf(W, '#3a4a5a', 0.4);
  const shape = arch ? `M ${x} ${y + h} L ${x} ${y + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} L ${x + w} ${y + h} Z` : `M ${x} ${y} h ${w} v ${h} h ${-w} Z`;
  if (!D) return <path d={shape} fill={glass} stroke={INK} strokeWidth={2.5} />;
  return (
    <g>
      {on && <ellipse cx={x + w / 2} cy={y + h / 2} rx={w * 1.4} ry={h * 0.9} fill={W.P.warm} opacity={0.18 * W.lit} />}
      <path d={shape} fill={tinted(W, frameC)} stroke={INK} strokeWidth={3.5} transform={`translate(${x + w / 2} ${y + h / 2}) scale(1.18) translate(${-x - w / 2} ${-y - h / 2})`} />
      <path d={shape} fill={glass} stroke={INK} strokeWidth={3} />
      {/* ظل داخلي أعلى الفتحة (غائرة) */}
      <path d={shape} fill="none" stroke={shadeOf(W, '#2a2030', 0.2)} strokeWidth={7} opacity={0.35} transform={`translate(${W.lightDir < 0 ? 2 : -2} 3)`} />
      {!on && W.time === 'day' && <line x1={x + w * 0.25} y1={y + h * 0.75} x2={x + w * 0.7} y2={y + h * 0.25} stroke="#fff" strokeWidth={3} opacity={0.35} />}
      {!arch && <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={INK} strokeWidth={2} />}
      <rect x={x - 6} y={y + h} width={w + 12} height={6} fill={lightOf(W, frameC, 0.1)} stroke={INK} strokeWidth={2.5} />
      {shutters && (
        <g fill={tinted(W, shutters)} stroke={INK} strokeWidth={2.5}>
          <rect x={x - w * 0.45 - 4} y={y} width={w * 0.45} height={h} />
          <rect x={x + w + 4} y={y} width={w * 0.45} height={h} />
        </g>
      )}
    </g>
  );
};

/** باب خشبي بعقد */
export const Door: React.FC<{x: number; y: number; w: number; h: number; c?: string; D?: boolean; arch?: 'round' | 'pointed' | 'flat'}> = ({x, y, w, h, c = '#5a3418', D, arch = 'round'}) => {
  const W = useWorld();
  const top = arch === 'flat' ? `L ${x} ${y} L ${x + w} ${y}` : arch === 'round' ? `L ${x} ${y + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2}` : `L ${x} ${y + w * 0.6} Q ${x} ${y} ${x + w / 2} ${y - w * 0.1} Q ${x + w} ${y} ${x + w} ${y + w * 0.6}`;
  const d = `M ${x} ${y + h} ${top} L ${x + w} ${y + h} Z`;
  return (
    <g>
      <path d={d} fill={D ? shadeOf(W, c, 0.15) : tinted(W, c)} stroke={INK} strokeWidth={D ? 4 : 3} />
      {D && (
        <g stroke={shadeOf(W, c, 0.5)} strokeWidth={2.5}>
          <line x1={x + w / 2} y1={y + w * 0.3} x2={x + w / 2} y2={y + h} />
          {[0.35, 0.6, 0.85].map((k) => (
            <line key={k} x1={x + 4} y1={y + h * k} x2={x + w - 4} y2={y + h * k} />
          ))}
          <circle cx={x + w / 2 + 8} cy={y + h * 0.62} r={3.5} fill="#d9b13a" stroke={INK} strokeWidth={1.5} />
        </g>
      )}
    </g>
  );
};

/** قبة بتدرج ضوء وأضلاع وحافة ضوء */
export const Dome: React.FC<{cx: number; by: number; rw: number; rh: number; c: string; D?: boolean; ribs?: number; finial?: 'crescent' | 'cross' | 'ball' | 'none'}> = ({
  cx,
  by,
  rw,
  rh,
  c,
  D,
  ribs = 0,
  finial = 'none',
}) => {
  const W = useWorld();
  const id = useGid('dome');
  const d = `M ${cx - rw} ${by} A ${rw} ${rh} 0 0 1 ${cx + rw} ${by} Z`;
  const fin =
    finial === 'none' ? null : (
      <g stroke={INK} strokeWidth={2.5} fill={tinted(W, '#d9b13a')}>
        <line x1={cx} y1={by - rh} x2={cx} y2={by - rh - 22} />
        {finial === 'crescent' && <path d={`M ${cx - 7} ${by - rh - 34} a 9 9 0 1 0 14 0 a 6 6 0 1 1 -14 0 Z`} />}
        {finial === 'cross' && <path d={`M ${cx - 2} ${by - rh - 40} h 4 v 6 h 6 v 4 h -6 v 10 h -4 v -10 h -6 v -4 h 6 Z`} />}
        {finial === 'ball' && <circle cx={cx} cy={by - rh - 26} r={6} />}
      </g>
    );
  if (!D)
    return (
      <g>
        <path d={d} fill={tinted(W, c)} stroke={INK} strokeWidth={3} />
        {fin}
      </g>
    );
  return (
    <g>
      <defs>
        <radialGradient id={`g${id}`} cx={W.lightDir < 0 ? '0.3' : '0.7'} cy="0.25" r="0.9">
          <stop offset="0%" stopColor={lightOf(W, c, 0.4)} />
          <stop offset="50%" stopColor={tinted(W, c)} />
          <stop offset="100%" stopColor={shadeOf(W, c, 0.45)} />
        </radialGradient>
      </defs>
      <path d={d} fill={`url(#g${id})`} stroke={INK} strokeWidth={4} />
      {Array.from({length: ribs}, (_, i) => {
        const t = (i + 1) / (ribs + 1);
        const xx = cx - rw + 2 * rw * t;
        return <path key={i} d={`M ${xx} ${by} Q ${cx + (xx - cx) * 0.55} ${by - rh * 0.9} ${cx} ${by - rh}`} fill="none" stroke={shadeOf(W, c, 0.35)} strokeWidth={2.5} opacity={0.7} />;
      })}
      <path
        d={`M ${cx + (W.lightDir < 0 ? -rw * 0.85 : rw * 0.85)} ${by - rh * 0.45} A ${rw} ${rh} 0 0 ${W.lightDir < 0 ? 1 : 0} ${cx + (W.lightDir < 0 ? -rw * 0.15 : rw * 0.15)} ${by - rh * 0.98}`}
        fill="none"
        stroke={W.P.rim}
        strokeWidth={4}
        opacity={0.75}
        strokeLinecap="round"
      />
      {fin}
    </g>
  );
};

/** مئذنة: عثمانية (قلم رصاص) أو مملوكية (طبقات + قمة بصلية) */
export const Minaret: React.FC<{x: number; by: number; h: number; w?: number; c: string; D?: boolean; style?: 'ottoman' | 'mamluk'}> = ({x, by, h, w = 26, c, D, style = 'ottoman'}) => {
  const W = useWorld();
  const st = {stroke: INK, strokeWidth: D ? 3.5 : 2.5};
  const body = tinted(W, c);
  const side = shadeOf(W, c, 0.3);
  const shaftSide = D ? <rect x={W.lightDir < 0 ? x + w * 0.62 : x - w / 2} y={by - h} width={w * 0.38} height={h} fill={side} opacity={0.8} /> : null;
  if (style === 'mamluk') {
    const t1 = h * 0.45;
    const t2 = h * 0.3;
    return (
      <g {...st}>
        <rect x={x - w / 2 - 4} y={by - t1} width={w + 8} height={t1} fill={body} />
        <rect x={x - w / 2 - 10} y={by - t1 - 8} width={w + 20} height={8} fill={lightOf(W, c, 0.1)} />
        <rect x={x - w / 2} y={by - t1 - t2 - 8} width={w} height={t2} fill={body} />
        <rect x={x - w / 2 - 8} y={by - t1 - t2 - 16} width={w + 16} height={8} fill={lightOf(W, c, 0.1)} />
        {Array.from({length: 4}, (_, i) => (
          <rect key={i} x={x - w / 2 + 4 + i * ((w - 8) / 4)} y={by - t1 - t2 - 46} width={(w - 8) / 4 - 3} height={30} fill={body} />
        ))}
        <path d={`M ${x - w / 2 - 2} ${by - t1 - t2 - 46} Q ${x - w / 2} ${by - h - 10} ${x} ${by - h - 24} Q ${x + w / 2} ${by - h - 10} ${x + w / 2 + 2} ${by - t1 - t2 - 46} Z`} fill={D ? lightOf(W, c, 0.15) : body} />
        <line x1={x} y1={by - h - 24} x2={x} y2={by - h - 40} />
        {D && <rect x={W.lightDir < 0 ? x + w * 0.2 : x - w / 2 - 4} y={by - t1} width={w * 0.35} height={t1} fill={side} opacity={0.6} stroke="none" />}
        {D && Array.from({length: 3}, (_, i) => <rect key={`w${i}`} x={x - 4} y={by - t1 + 20 + i * 40} width={8} height={18} rx={4} fill={W.lit > 0.4 ? W.P.warm : shadeOf(W, '#2a2030', 0.3)} />)}
      </g>
    );
  }
  return (
    <g {...st}>
      <rect x={x - w / 2} y={by - h} width={w} height={h} fill={body} />
      {shaftSide}
      {[0.55, 0.8].map((k) => (
        <g key={k}>
          <rect x={x - w / 2 - 8} y={by - h * k} width={w + 16} height={9} fill={lightOf(W, c, 0.1)} />
          {D && <rect x={x - w / 2} y={by - h * k + 9} width={w} height={6} fill={side} opacity={0.6} stroke="none" />}
        </g>
      ))}
      <path d={`M ${x - w / 2 - 2} ${by - h} L ${x} ${by - h - w * 2.6} L ${x + w / 2 + 2} ${by - h} Z`} fill={D ? tinted(W, '#6a8aa8') : tinted(W, '#6a8aa8')} />
      {D && <path d={`M ${x} ${by - h - w * 2.6} L ${x + (W.lightDir < 0 ? w / 2 + 2 : -w / 2 - 2)} ${by - h} L ${x} ${by - h} Z`} fill={shadeOf(W, '#6a8aa8', 0.35)} stroke="none" />}
      <line x1={x} y1={by - h - w * 2.6} x2={x} y2={by - h - w * 2.6 - 16} />
    </g>
  );
};

/** مشربية خشبية بارزة */
export const Mashrabiya: React.FC<{x: number; y: number; w: number; h: number; c?: string; D?: boolean}> = ({x, y, w, h, c = '#6a3e1e', D}) => {
  const W = useWorld();
  const body = tinted(W, c);
  return (
    <g>
      {D && <rect x={x} y={y + h} width={w} height={14} fill={shadeOf(W, '#3a2a20', 0.5)} opacity={0.45} />}
      <rect x={x - 6} y={y - 10} width={w + 12} height={12} fill={D ? lightOf(W, c, 0.15) : body} stroke={INK} strokeWidth={3} />
      <rect x={x} y={y} width={w} height={h} fill={body} stroke={INK} strokeWidth={D ? 4 : 3} />
      <g stroke={D ? shadeOf(W, c, 0.45) : INK} strokeWidth={D ? 2 : 1.5} opacity={D ? 0.9 : 0.6}>
        {Array.from({length: Math.floor(w / (D ? 9 : 14))}, (_, i) => (
          <line key={`v${i}`} x1={x + (i + 1) * (D ? 9 : 14)} y1={y + 4} x2={x + (i + 1) * (D ? 9 : 14)} y2={y + h - 4} />
        ))}
        {Array.from({length: Math.floor(h / (D ? 9 : 14))}, (_, i) => (
          <line key={`h${i}`} x1={x + 4} y1={y + (i + 1) * (D ? 9 : 14)} x2={x + w - 4} y2={y + (i + 1) * (D ? 9 : 14)} />
        ))}
      </g>
      {D && W.lit > 0.3 && <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} fill={W.P.warm} opacity={0.28 * W.lit} />}
      <rect x={x - 4} y={y + h} width={w + 8} height={10} fill={D ? lightOf(W, c, 0.1) : body} stroke={INK} strokeWidth={3} />
    </g>
  );
};

/** مظلة قماشية مخططة */
export const Awning: React.FC<{x: number; y: number; w: number; c: string; c2?: string; D?: boolean; drop?: number}> = ({x, y, w, c, c2 = '#f2ece0', D, drop = 46}) => {
  const W = useWorld();
  const n = Math.max(3, Math.round(w / 34));
  const sw = w / n;
  return (
    <g stroke={INK} strokeWidth={D ? 3.5 : 2.5} strokeLinejoin="round">
      {D && <rect x={x} y={y + drop} width={w} height={22} fill={shadeOf(W, '#2a2030', 0.4)} opacity={0.3} stroke="none" />}
      {Array.from({length: n}, (_, i) => (
        <path key={i} d={`M ${x + i * sw} ${y} L ${x + (i + 1) * sw} ${y} L ${x + (i + 1) * sw + 6} ${y + drop} Q ${x + (i + 0.5) * sw + 3} ${y + drop + 12} ${x + i * sw + 6} ${y + drop} Z`} fill={tinted(W, i % 2 ? c2 : c)} />
      ))}
      {D && <path d={`M ${x} ${y} L ${x + w} ${y} L ${x + w + 6} ${y + drop * 0.4} L ${x + 3} ${y + drop * 0.4} Z`} fill={W.P.rim} opacity={0.18} stroke="none" />}
    </g>
  );
};

/** شرفة بدرابزين */
export const Balcony: React.FC<{x: number; y: number; w: number; c: string; D?: boolean}> = ({x, y, w, c, D}) => {
  const W = useWorld();
  return (
    <g stroke={INK} strokeWidth={D ? 3 : 2.5}>
      {D && <rect x={x} y={y + 8} width={w} height={12} fill={shadeOf(W, c, 0.55)} opacity={0.45} stroke="none" />}
      <rect x={x - 6} y={y} width={w + 12} height={8} fill={D ? lightOf(W, c, 0.1) : tinted(W, c)} />
      <rect x={x - 4} y={y - 32} width={w + 8} height={5} fill={tinted(W, '#2a2a30')} />
      {Array.from({length: Math.floor(w / 9)}, (_, i) => (
        <line key={i} x1={x + 2 + i * 9} y1={y - 30} x2={x + 2 + i * 9} y2={y} stroke={tinted(W, '#2a2a30')} strokeWidth={2} />
      ))}
    </g>
  );
};

/** سقف قرميد مائل */
export const TileRoof: React.FC<{x: number; y: number; w: number; h: number; c?: string; D?: boolean}> = ({x, y, w, h, c = '#a8482e', D}) => {
  const W = useWorld();
  const d = `M ${x - 14} ${y} L ${x + w * 0.2} ${y - h} L ${x + w * 0.8} ${y - h} L ${x + w + 14} ${y} Z`;
  return (
    <g>
      <path d={d} fill={tinted(W, c)} stroke={INK} strokeWidth={D ? 4 : 3} strokeLinejoin="round" />
      {D && (
        <g stroke={shadeOf(W, c, 0.4)} strokeWidth={2}>
          {Array.from({length: Math.floor(h / 10)}, (_, i) => (
            <line key={i} x1={x - 14 + (i * 10 * (w * 0.2 + 14)) / h} y1={y - i * 10} x2={x + w + 14 - (i * 10 * (w * 0.2 + 14)) / h} y2={y - i * 10} />
          ))}
          <path d={`M ${x + w * 0.8} ${y - h} L ${x + w + 14} ${y} L ${x + w * 0.62} ${y} Z`} fill={shadeOf(W, c, 0.3)} opacity={0.6} stroke="none" />
        </g>
      )}
    </g>
  );
};
