import React from 'react';
import {Halo} from '../../lib/fx';
import {INK, scatter} from '../../lib/util';

/** سطح طاولة خشب بألواح وعروق */
export const TableWood: React.FC<{w: number; h: number}> = React.memo(({w, h}) => (
  <svg width={w} height={h}>
    <rect width={w} height={h} fill="#4a2e1a" />
    {Array.from({length: Math.ceil(h / 230)}, (_, i) => (
      <g key={i}>
        <rect x={0} y={i * 230} width={w} height={226} fill={i % 3 === 0 ? '#543620' : i % 3 === 1 ? '#4a2e1a' : '#432814'} />
        <line x1={0} x2={w} y1={i * 230} y2={i * 230} stroke="#1e1008" strokeWidth={9} />
      </g>
    ))}
    {scatter('jtw', 150, 0, w, 0, h).map((p, i) => (
      <path key={i} d={`M ${p.x} ${p.y} q ${120 + p.r * 160} ${(p.r - 0.5) * 22} ${300 + p.r * 380} 0`} fill="none" stroke="#2e1a0c" strokeWidth={3} opacity={0.5} />
    ))}
  </svg>
));

/** شمعة سميكة ذائبة بلهب وهالة */
export const Candle: React.FC<{id: string; x: number; y: number; s?: number; frame: number; warm: string}> = ({id, x, y, s = 1, frame, warm}) => {
  const fl = 0.86 + 0.12 * Math.sin(frame * 0.7) + 0.05 * Math.sin(frame * 1.9);
  const sway = Math.sin(frame * 0.23) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Halo id={`${id}h`} cx={0} cy={-265} r={330 * fl} color={warm} opacity={0.6} />
      <path d="M -46 0 L -46 -200 Q -40 -226 -20 -216 Q 0 -232 22 -216 Q 44 -224 46 -196 L 46 0 Z" fill="#f2e4c4" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -46 -150 q -14 40 2 64 M 46 -170 q 16 50 -4 90" fill="none" stroke="#d8c49a" strokeWidth={14} strokeLinecap="round" />
      <path d="M 20 -214 L 44 -200 L 44 -4 L 20 -4 Z" fill="#b89a6a" opacity={0.45} />
      <line x1={0} y1={-218} x2={0} y2={-240} stroke={INK} strokeWidth={6} />
      <path d={`M 0 -234 Q ${-24 + sway} -264 ${sway} ${-234 - 92 * fl} Q ${24 + sway} -264 0 -234 Z`} fill="#ffab3c" />
      <path d={`M 0 -236 Q -11 -256 ${sway * 0.6} ${-236 - 52 * fl} Q 11 -256 0 -236 Z`} fill="#fff4c0" />
    </g>
  );
};
