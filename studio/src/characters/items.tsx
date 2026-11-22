import React from 'react';
import {INK} from '../lib/util';

/* =====================================================================
 * أشياء تُمسك باليد — كل شيء مرسوم في إحداثيات محلية:
 *   الأصل (0,0) = نقطة المسك (تحت قبضة اليد)، والمحور −y = "بعيداً عن اليد".
 * طريقة التثبيت (mode):
 *   along  : يتبع اتجاه الساعد (سيف، ميكروفون، سماعة)
 *   upright: يبقى رأسياً أياً كان اتجاه الذراع (علم، مشعل، رمح، لافتة، عصا)
 *   hang   : يتدلى للأسفل من اليد (فانوس، حقيبة)
 *   front  : يواجه الكاميرا أمام اليد (ورقة، كتاب، جريدة، ترس، كوب)
 * ===================================================================== */

export type ItemId =
  | 'kilij'
  | 'spatha'
  | 'spear'
  | 'shield'
  | 'bow'
  | 'rifle'
  | 'scroll'
  | 'paper'
  | 'book'
  | 'newspaper'
  | 'flagEgypt'
  | 'flagOttoman'
  | 'flagByz'
  | 'placard'
  | 'mic'
  | 'torch'
  | 'lantern'
  | 'phone'
  | 'tea'
  | 'briefcase';

/** شيء ممسوك: id أو كائن بنص (للجريدة واللافتة) */
export type Held = ItemId | {id: ItemId; text?: string};
export const heldId = (h: Held) => (typeof h === 'string' ? h : h.id);
const heldText = (h: Held) => (typeof h === 'string' ? undefined : h.text);

export type HoldMode = 'along' | 'upright' | 'hang' | 'front';

export const ITEM_LABEL: Record<ItemId, string> = {
  kilij: 'سيف عثماني — قليج',
  spatha: 'سيف بيزنطي',
  spear: 'رمح',
  shield: 'ترس',
  bow: 'قوس',
  rifle: 'بندقية',
  scroll: 'مخطوطة',
  paper: 'ورقة',
  book: 'كتاب',
  newspaper: 'جريدة',
  flagEgypt: 'علم مصر ١٩٥٣',
  flagOttoman: 'علم عثماني',
  flagByz: 'علم بيزنطي',
  placard: 'لافتة احتجاج',
  mic: 'ميكروفون',
  torch: 'مشعل',
  lantern: 'فانوس',
  phone: 'سماعة هاتف',
  tea: 'كوب شاي',
  briefcase: 'حقيبة',
};

export const ITEM_MODE: Record<ItemId, HoldMode> = {
  kilij: 'along',
  spatha: 'along',
  spear: 'upright',
  shield: 'front',
  bow: 'upright',
  rifle: 'along',
  scroll: 'front',
  paper: 'front',
  book: 'front',
  newspaper: 'front',
  flagEgypt: 'upright',
  flagOttoman: 'upright',
  flagByz: 'upright',
  placard: 'upright',
  mic: 'along',
  torch: 'upright',
  lantern: 'hang',
  phone: 'along',
  tea: 'front',
  briefcase: 'hang',
};

const st = {stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
const steel = '#c9ced8';

const star = (cx: number, cy: number, r: number) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.42 : r;
    d += `${i ? 'L' : 'M'} ${cx + Math.cos(a) * rr} ${cy + Math.sin(a) * rr} `;
  }
  return d + 'Z';
};

/** راية ترفرف مثبتة على سارية — design يحدد النقش */
const FlagCloth: React.FC<{frame: number; design: 'egypt' | 'ottoman' | 'byz'; top: number}> = ({frame, design, top}) => {
  const w = 96;
  const h = 64;
  const N = 8;
  const wave = (t: number) => Math.sin(frame / 4.5 - t * 5) * 8 * t;
  const pts = Array.from({length: N + 1}, (_, i) => `${(i / N) * w} ${top + wave(i / N)}`);
  const bot = Array.from({length: N + 1}, (_, i) => `${((N - i) / N) * w} ${top + h + wave((N - i) / N)}`);
  const mid = wave(0.5);
  const bg = design === 'egypt' ? '#1f7a3a' : design === 'ottoman' ? '#c0262d' : '#7a1f5a';
  return (
    <g>
      <path d={`M ${pts.join(' L ')} L ${bot.join(' L ')} Z`} fill={bg} {...st} />
      {design === 'egypt' && (
        <g fill="#f7f4ea">
          <circle cx={w * 0.42} cy={top + h / 2 + mid} r={h * 0.26} />
          <circle cx={w * 0.47} cy={top + h / 2 + mid - 2} r={h * 0.22} fill={bg} />
          {[-0.18, 0, 0.18].map((o, i) => (
            <path key={i} d={star(w * 0.56, top + h / 2 + mid + o * h, h * 0.065)} />
          ))}
        </g>
      )}
      {design === 'ottoman' && (
        <g fill="#f7f4ea">
          <circle cx={w * 0.45} cy={top + h / 2 + mid} r={h * 0.24} />
          <circle cx={w * 0.5} cy={top + h / 2 + mid} r={h * 0.2} fill={bg} />
          <path d={star(w * 0.62, top + h / 2 + mid, h * 0.1)} />
        </g>
      )}
      {design === 'byz' && <path d={`M ${w * 0.5} ${top + 10 + mid} v ${h - 20} M ${w * 0.3} ${top + h / 2 + mid} h ${w * 0.4}`} stroke="#e8b830" strokeWidth={6} />}
    </g>
  );
};

/** رسم الشيء في إحداثياته المحلية */
export const ItemShape: React.FC<{item: Held; frame: number}> = ({item, frame}) => {
  const id = heldId(item);
  const text = heldText(item);
  switch (id) {
    case 'kilij':
      return (
        <g {...st}>
          <path d="M -5 -14 Q -10 -80 10 -132 Q 26 -84 6 -14 Z" fill={steel} />
          <path d="M 2 -20 Q 0 -80 12 -122" stroke="#fff" strokeWidth={2} opacity={0.7} fill="none" />
          <rect x={-18} y={-18} width={36} height={8} rx={3} fill="#d9b13a" />
          <rect x={-5} y={-12} width={10} height={26} rx={4} fill="#5a3418" />
          <circle cx={0} cy={18} r={6} fill="#d9b13a" />
        </g>
      );
    case 'spatha':
      return (
        <g {...st}>
          <path d="M -6 -14 L -6 -118 L 0 -134 L 6 -118 L 6 -14 Z" fill={steel} />
          <line x1={0} y1={-20} x2={0} y2={-120} stroke="#8a90a0" strokeWidth={2} />
          <rect x={-22} y={-18} width={44} height={8} rx={3} fill="#9a7a3a" />
          <rect x={-5} y={-12} width={10} height={26} rx={4} fill="#4a2a18" />
          <circle cx={0} cy={18} r={7} fill="#9a7a3a" />
        </g>
      );
    case 'spear':
      return (
        <g {...st}>
          <rect x={-4} y={-190} width={8} height={290} rx={3} fill="#7a5230" />
          <path d="M 0 -232 L 10 -194 L 0 -186 L -10 -194 Z" fill={steel} />
        </g>
      );
    case 'shield':
      return (
        <g {...st}>
          <circle cx={0} cy={0} r={48} fill="#b3262c" />
          <circle cx={0} cy={0} r={38} fill="none" stroke="#e8b830" strokeWidth={5} />
          <circle cx={0} cy={0} r={11} fill="#d9b13a" />
          <path d="M -30 -26 A 40 40 0 0 1 10 -38" stroke="#fff" strokeWidth={4} opacity={0.4} fill="none" />
        </g>
      );
    case 'bow':
      return (
        <g {...st} fill="none">
          <path d="M 6 -100 Q 46 0 6 100" stroke="#6a3e1e" strokeWidth={8} />
          <path d="M 6 -100 Q 46 0 6 100" />
          <line x1={6} y1={-100} x2={6} y2={100} strokeWidth={2} stroke="#e8e0d0" />
        </g>
      );
    case 'rifle':
      return (
        <g {...st}>
          <path d="M -8 40 L 8 40 L 10 0 L 4 -8 L -6 -8 Z" fill="#6a3e1e" />
          <rect x={-4} y={-120} width={8} height={116} fill="#3a3a42" />
          <rect x={-7} y={-40} width={14} height={30} fill="#6a3e1e" />
          <path d="M 4 -4 q 10 8 2 16" fill="none" />
        </g>
      );
    case 'scroll':
      return (
        <g {...st}>
          <rect x={-34} y={-40} width={68} height={30} rx={6} fill="#efe2c2" />
          <ellipse cx={-34} cy={-25} rx={7} ry={15} fill="#d9c49a" />
          <ellipse cx={34} cy={-25} rx={7} ry={15} fill="#d9c49a" />
          <rect x={-6} y={-42} width={12} height={34} fill="#c0262d" stroke="none" />
        </g>
      );
    case 'paper':
      return (
        <g {...st}>
          <path d="M -32 -78 L 30 -78 L 34 -6 L -30 -2 Z" fill="#f7f2e6" />
          {[-62, -50, -38, -26].map((y) => (
            <line key={y} x1={-22} y1={y} x2={22} y2={y + 1} stroke="#8a8478" strokeWidth={2.5} />
          ))}
        </g>
      );
    case 'book':
      return (
        <g {...st}>
          <rect x={-30} y={-72} width={60} height={70} rx={4} fill="#7a2a24" />
          <rect x={-24} y={-66} width={48} height={58} fill="none" stroke="#d9b13a" strokeWidth={2.5} />
          <rect x={22} y={-70} width={8} height={66} fill="#efe2c2" strokeWidth={2} />
        </g>
      );
    case 'newspaper':
      return (
        <g {...st}>
          <rect x={-52} y={-92} width={104} height={88} fill="#efebe0" />
          <text x={0} y={-62} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={22} fill={INK} stroke="none" direction="rtl">
            {text ?? 'الأهرام'}
          </text>
          <line x1={-44} y1={-52} x2={44} y2={-52} strokeWidth={2} />
          {[-40, -30, -20].map((y) => (
            <line key={y} x1={-42} y1={y} x2={-4} y2={y} stroke="#8a8478" strokeWidth={2.5} />
          ))}
          <rect x={6} y={-44} width={36} height={30} fill="#b8b2a4" strokeWidth={2} />
        </g>
      );
    case 'flagEgypt':
    case 'flagOttoman':
    case 'flagByz':
      return (
        <g>
          <rect x={-4} y={-170} width={8} height={230} rx={3} fill="#5a3c22" {...st} />
          <circle cx={0} cy={-176} r={8} fill="#d9b13a" {...st} strokeWidth={3} />
          <g transform="translate(2 0)">
            <FlagCloth frame={frame} design={id === 'flagEgypt' ? 'egypt' : id === 'flagOttoman' ? 'ottoman' : 'byz'} top={-166} />
          </g>
        </g>
      );
    case 'placard':
      return (
        <g {...st}>
          <rect x={-4} y={-140} width={8} height={190} fill="#7a5230" />
          <rect x={-80} y={-200} width={160} height={84} rx={4} fill="#f2ecd8" />
          <text x={0} y={-148} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={text && text.length > 10 ? 22 : 28} fill="#a8201a" stroke="none" direction="rtl">
            {text ?? 'تحيا مصر'}
          </text>
        </g>
      );
    case 'mic':
      return (
        <g {...st}>
          <rect x={-5} y={-30} width={10} height={44} rx={4} fill="#3a3a44" />
          <rect x={-13} y={-62} width={26} height={34} rx={12} fill="#b9bec8" />
          {[-54, -46, -38].map((y) => (
            <line key={y} x1={-9} y1={y} x2={9} y2={y} strokeWidth={2} />
          ))}
        </g>
      );
    case 'torch': {
      const fl = 0.85 + 0.15 * Math.sin(frame * 0.9) + 0.06 * Math.sin(frame * 2.3);
      return (
        <g>
          <ellipse cx={0} cy={-120} rx={70 * fl} ry={70 * fl} fill="#ffa043" opacity={0.25} />
          <rect x={-6} y={-104} width={12} height={150} rx={4} fill="#5a3418" {...st} />
          <rect x={-10} y={-112} width={20} height={14} rx={3} fill="#3a2414" {...st} strokeWidth={3} />
          <path d={`M 0 ${-112 - 52 * fl} Q ${20 * fl} -124 0 -104 Q ${-20 * fl} -124 0 ${-112 - 52 * fl} Z`} fill="#ffb347" stroke="#e2631c" strokeWidth={4} />
          <path d={`M 0 ${-112 - 26 * fl} Q 9 -114 0 -106 Q -9 -114 0 ${-112 - 26 * fl} Z`} fill="#fff3b0" />
        </g>
      );
    }
    case 'lantern':
      return (
        <g {...st}>
          <line x1={0} y1={0} x2={0} y2={22} strokeWidth={3} />
          <ellipse cx={0} cy={64} rx={46} ry={46} fill="#ffcf7a" opacity={0.22} stroke="none" />
          <path d="M -16 22 L 16 22 L 22 36 L 22 82 L 16 94 L -16 94 L -22 82 L -22 36 Z" fill="#c9a43a" />
          <rect x={-14} y={38} width={28} height={44} fill="#fff1b8" strokeWidth={3} />
        </g>
      );
    case 'phone':
      return (
        <g {...st}>
          <path d="M -8 10 Q -14 -30 -6 -70 L 8 -70 Q 2 -30 8 10 Z" fill="#1e1e24" />
          <ellipse cx={-2} cy={-74} rx={14} ry={10} fill="#1e1e24" />
          <ellipse cx={0} cy={12} rx={14} ry={10} fill="#1e1e24" />
        </g>
      );
    case 'tea':
      return (
        <g {...st}>
          <path d="M -14 -44 L 14 -44 L 10 -4 L -10 -4 Z" fill="#f2d8a8" opacity={0.9} />
          <path d="M -12 -34 L 12 -34 L 10 -6 L -10 -6 Z" fill="#a8401a" stroke="none" />
          <ellipse cx={0} cy={-2} rx={20} ry={5} fill="#d9d4c4" />
          <path d="M -4 -54 q -6 -10 2 -18 M 6 -54 q -6 -10 2 -18" stroke="#fff" strokeWidth={2.5} opacity={0.6} fill="none" />
        </g>
      );
    case 'briefcase':
      return (
        <g {...st}>
          <path d="M -12 4 Q -12 -6 0 -6 Q 12 -6 12 4" fill="none" strokeWidth={5} />
          <rect x={-40} y={4} width={80} height={56} rx={6} fill="#5a3a22" />
          <line x1={-40} y1={22} x2={40} y2={22} strokeWidth={3} />
          <rect x={-6} y={16} width={12} height={10} fill="#d9b13a" strokeWidth={2.5} />
        </g>
      );
    default:
      return null;
  }
};

/**
 * يضع الشيء عند اليد: at = موضع اليد، dir = زاوية الساعد (راديان، 0 = لليمين)
 * angleOverride لزوايا ثابتة في وضعيات معينة (مثل aim: البندقية أفقية)
 */
export const HeldItem: React.FC<{item: Held; at: [number, number]; dir: number; frame: number; angleOverride?: number; frontDy?: number}> = ({item, at, dir, frame, angleOverride, frontDy = 0}) => {
  const mode = ITEM_MODE[heldId(item)];
  let rot = 0;
  let dx = 0;
  let dy = 0;
  if (angleOverride !== undefined) rot = angleOverride;
  else if (mode === 'along') rot = (dir * 180) / Math.PI + 90; // −y المحلي يتبع اتجاه الساعد
  else if (mode === 'front') {
    dy = -6 + frontDy;
    dx = 0;
  }
  return (
    <g transform={`translate(${at[0] + dx} ${at[1] + dy}) rotate(${rot})`}>
      <ItemShape item={item} frame={frame} />
    </g>
  );
};
