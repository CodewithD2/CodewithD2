import React from 'react';
import {INK} from './util';

/* =====================================================================
 * مؤثرات ورموز كوميدية (أسلوب الفيديوهات التاريخية المبسّطة — البند ٧)
 * قابلة لإعادة الاستخدام في أي حلقة: عصافير دوار، شتائم، بطاقة معلومات،
 * تقويم يقلب، ختم موافقة، سهم تحذير، وعلامات صدمة.
 * ===================================================================== */

/** عصافير صغيرة تدور فوق الرأس عند الاصطدام/الدوار */
export const DizzyBirds: React.FC<{x: number; y: number; frame: number; r?: number}> = ({x, y, frame, r = 56}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={0} rx={r} ry={r * 0.32} fill="none" stroke="#f2c43a" strokeWidth={3} strokeDasharray="8 8" opacity={0.75} />
    {[0, 1, 2].map((i) => {
      const a = frame * 0.16 + (i * Math.PI * 2) / 3;
      const bx = Math.cos(a) * r;
      const by = Math.sin(a) * r * 0.32;
      const flap = Math.sin(frame * 0.8 + i * 2) * 5;
      return (
        <g key={i} transform={`translate(${bx} ${by})`}>
          <circle cx={0} cy={0} r={8} fill="#ffd447" stroke={INK} strokeWidth={2.5} />
          <path d={`M -8 -2 Q -16 ${-10 + flap} -6 -8 M 8 -2 Q 16 ${-10 - flap} 6 -8`} fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
          <polygon points="6,-1 13,2 6,4" fill="#e86a24" stroke={INK} strokeWidth={1.5} />
        </g>
      );
    })}
  </g>
);

/** فقاعة شتائم كرتونية #@$%! */
export const SwearBubble: React.FC<{x: number; y: number; frame: number; scale?: number}> = ({x, y, frame, scale = 1}) => {
  const jx = Math.sin(frame * 1.9) * 2.5;
  const jy = Math.cos(frame * 2.3) * 2.5;
  return (
    <g transform={`translate(${x + jx} ${y + jy}) scale(${scale})`}>
      <path
        d="M -78 -34 L -56 -44 L -40 -34 L -12 -48 L 8 -34 L 42 -46 L 60 -32 L 82 -26 L 74 4 L 84 26 L 56 32 L 26 42 L 4 30 L -24 44 L -48 30 L -80 28 L -72 2 Z"
        fill="#fff8e8"
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <text x={0} y={10} textAnchor="middle" fontFamily="DejaVu Sans Mono, monospace" fontWeight={900} fontSize={28} fill="#c8242e">
        #@$%!
      </text>
    </g>
  );
};

/** سهم وبطاقة توضيحية كوميدية (مثل: العمر ١٧ عاماً — الخبرة العسكرية: صفر) */
export const CalloutTag: React.FC<{
  x: number;
  y: number;
  lines: string[];
  arrowTo?: [number, number];
  bg?: string;
  accent?: string;
  scale?: number;
}> = ({x, y, lines, arrowTo, bg = '#fffaf0', accent = '#c8242e', scale = 1}) => {
  const maxLen = Math.max(...lines.map((l) => l.length));
  const w = Math.max(240, maxLen * 13.5 + 48);
  const h = lines.length * 36 + 26;
  return (
    <g>
      {arrowTo && (
        <g>
          <path
            d={`M ${x} ${y + h / 2} Q ${(x + arrowTo[0]) / 2} ${arrowTo[1]} ${arrowTo[0]} ${arrowTo[1]}`}
            fill="none"
            stroke={INK}
            strokeWidth={9}
            strokeLinecap="round"
          />
          <path
            d={`M ${x} ${y + h / 2} Q ${(x + arrowTo[0]) / 2} ${arrowTo[1]} ${arrowTo[0]} ${arrowTo[1]}`}
            fill="none"
            stroke={accent}
            strokeWidth={5}
            strokeLinecap="round"
          />
        </g>
      )}
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill={bg} stroke={INK} strokeWidth={4} />
        <rect x={-w / 2 + 6} y={-h / 2 + 6} width={w - 12} height={8} rx={4} fill={accent} />
        {lines.map((ln, i) => (
          <text
            key={i}
            x={0}
            y={-h / 2 + 44 + i * 36}
            textAnchor="middle"
            fontFamily="Amiri"
            fontWeight={700}
            fontSize={27}
            fill={INK}
            direction="rtl"
          >
            {ln}
          </text>
        ))}
      </g>
    </g>
  );
};

/** تقويم حائط يقلب أوراقه بسرعة لعرض سنة/شهر */
export const FlipCalendar: React.FC<{x: number; y: number; year: string; sub?: string; scale?: number}> = ({x, y, year, sub, scale = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-120} y={-95} width={240} height={190} rx={16} fill="#fdfaf2" stroke={INK} strokeWidth={5} />
    <path d="M -120 -40 L 120 -40 L 120 -79 Q 120 -95 104 -95 L -104 -95 Q -120 -95 -120 -79 Z" fill="#c8242e" stroke={INK} strokeWidth={5} />
    {[-64, 0, 64].map((rx) => (
      <rect key={rx} x={rx - 7} y={-112} width={14} height={32} rx={6} fill="#8a929e" stroke={INK} strokeWidth={3.5} />
    ))}
    {sub && (
      <text x={0} y={-55} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={26} fill="#fff" direction="rtl">
        {sub}
      </text>
    )}
    <text x={0} y={42} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={78} fill={INK}>
      {year}
    </text>
  </g>
);

/** ختم موافقة/رفض ضخم ينزل على الشاشة بضربة */
export const BigStamp: React.FC<{
  x: number;
  y: number;
  text: string;
  color?: string;
  progress: number; // 0..1
  rot?: number;
}> = ({x, y, text, color = '#1f8a4c', progress, rot = -9}) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0.01) return null;
  const sc = 2.2 - 1.2 * Math.min(1, p * 2.5);
  const w = Math.max(380, text.length * 16 + 70);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={Math.min(1, p * 3)}>
      <rect x={-w / 2} y={-54} width={w} height={108} rx={14} fill="#fffdf6" fillOpacity={0.92} stroke={color} strokeWidth={8} />
      <rect x={-w / 2 + 10} y={-44} width={w - 20} height={88} rx={8} fill="none" stroke={color} strokeWidth={3} strokeDasharray="10 6" />
      <text x={0} y={14} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={36} fill={color} direction="rtl">
        {text}
      </text>
    </g>
  );
};

/** لافتة عنوان بارزة في أعلى/وسط الشاشة */
export const TitleBanner: React.FC<{
  y?: number;
  title: string;
  sub?: string;
  accent?: string;
  scale?: number;
}> = ({y = 110, title, sub, accent = '#c8242e', scale = 1}) => {
  const w = Math.max(540, title.length * 22 + 110);
  const h = sub ? 124 : 88;
  return (
    <g transform={`translate(960 ${y}) scale(${scale})`}>
      <rect x={-w / 2 + 6} y={-h / 2 + 8} width={w} height={h} rx={18} fill="#1b1a22" opacity={0.28} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} fill="#fdfaf2" stroke={INK} strokeWidth={5} />
      <rect x={-w / 2 + 10} y={-h / 2 + 10} width={w - 20} height={10} rx={5} fill={accent} />
      <text x={0} y={sub ? 2 : 16} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={46} fill={INK} direction="rtl">
        {title}
      </text>
      {sub && (
        <text x={0} y={44} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={28} fill={accent} direction="rtl">
          {sub}
        </text>
      )}
    </g>
  );
};
