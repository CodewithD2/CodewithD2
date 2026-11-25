import React from 'react';
import {INK} from '../../lib/util';
import {mix} from './stage3d';

/** ارتفاع قاعدة قطعة اللعب */
export const PIECE_H = 66;

/** قطعة لعب على طاولة الحرب: قاعدة باسم + شخصية فوقها (الأصل عند أسفل القاعدة) */
export const GamePiece: React.FC<{label?: string; color: string; w?: number; fs?: number; children: React.ReactNode}> = ({label, color, w = 250, fs = 30, children}) => (
  <g>
    <ellipse cx={14} cy={-4} rx={w * 0.56} ry={24} fill="#000" opacity={0.38} />
    <path d={`M ${-w / 2} ${-PIECE_H} L ${-w / 2} -14 Q 0 12 ${w / 2} -14 L ${w / 2} ${-PIECE_H} Z`} fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d={`M ${w * 0.22} ${-PIECE_H} L ${w * 0.22} -3 Q ${w * 0.4} -6 ${w / 2} -14 L ${w / 2} ${-PIECE_H} Z`} fill="#000" opacity={0.25} />
    <ellipse cx={0} cy={-PIECE_H} rx={w / 2} ry={17} fill={mix(color, '#fff0d0', 0.28)} stroke={INK} strokeWidth={5} />
    <path d={`M ${-w / 2 + 8} ${-PIECE_H + 17} Q 0 ${-PIECE_H + 36} ${w / 2 - 8} ${-PIECE_H + 17}`} fill="none" stroke="#f2c43a" strokeWidth={4} opacity={0.8} />
    <g transform={`translate(0 ${-PIECE_H + 2})`}>{children}</g>
    {label && (
      <text x={0} y={-10} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={fs} fill="#fff6e0" direction="rtl" style={{paintOrder: 'stroke'}} stroke="rgba(0,0,0,0.55)" strokeWidth={5}>
        {label}
      </text>
    )}
  </g>
);
