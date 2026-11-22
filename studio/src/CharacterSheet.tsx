import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Person, PersonProps} from './characters/Person';
import {NASSER} from './episodes/suez1956/ShotsA';

type Card = {label: string; sub?: string; p: Omit<PersonProps, 'x' | 'y' | 'frame'>};

const Label: React.FC<{x: number; y: number; t: string; sub?: string}> = ({x, y, t, sub}) => (
  <g fontFamily="Amiri" textAnchor="middle">
    <text x={x} y={y} fontSize={40} fontWeight={700} fill="#2a2030">
      {t}
    </text>
    {sub && (
      <text x={x} y={y + 40} fontSize={26} fill="#6a5a6a">
        {sub}
      </text>
    )}
  </g>
);

const Row: React.FC<{cards: Card[]; y: number; s: number; frame: number}> = ({cards, y, s, frame}) => {
  const gap = 1920 / cards.length;
  return (
    <g>
      {cards.map((c, i) => {
        const x = gap * (i + 0.5);
        return (
          <g key={i}>
            <ellipse cx={x} cy={y + 6} rx={110 * s} ry={18 * s} fill="rgba(60,40,70,0.12)" />
            <Person x={x} y={y} s={s} frame={frame} seed={i} {...c.p} />
            <Label x={x} y={y + 70} t={c.label} sub={c.sub} />
          </g>
        );
      })}
    </g>
  );
};

const Sheet: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#f6efe2, #e6d9c4)'}}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <text x={960} y={92} fontFamily="Amiri" fontSize={64} fontWeight={700} textAnchor="middle" fill="#2a2030">
        {title}
      </text>
      {children}
    </svg>
  </AbsoluteFill>
);

/** لوحة ١: البنية الجسدية + مقارنة أنواع التظليل */
export const SheetBuild: React.FC = () => {
  const f = useCurrentFrame() + 20;
  const builds: Card[] = [
    {label: 'عادي', sub: "build='normal'", p: {robe: '#3f7fa8', trim: '#d9b13a', hat: 'cap', expr: 'neutral', pose: 'stand', shading: 'cel', skin: '#efc29b'}},
    {label: 'كتفان عريضان', sub: "build='broad' · face='jaw'", p: {robe: '#6b6a5a', trim: '#d9b13a', outfit: 'uniform', hat: 'officerCap', hair: '#1a1512', build: 'broad', face: 'jaw', expr: 'smug', pose: 'cross', shading: 'cel', skin: '#c98f68'}},
    {label: 'بكرش', sub: "build='belly' · face='wide'", p: {robe: '#b85a2e', trim: '#e0b43a', hat: 'vizier', beard: '#5a4636', build: 'belly', face: 'wide', expr: 'happy', pose: 'stand', shading: 'cel', skin: '#e2b48c'}},
    {label: 'نحيف', sub: "build='slim' · face='long'", p: {robe: '#3a3e4a', outfit: 'suit', tie: '#1e5a3a', hat: 'none', hair: '#3a2a1e', build: 'slim', face: 'long', expr: 'think', pose: 'chin', shading: 'cel', skin: '#f2c6a0'}},
  ];
  const shading: Card[] = [
    {label: 'مسطّح', sub: "shading='none'", p: {...NASSER, expr: 'speak', pose: 'podium', shading: 'none'}},
    {label: 'ظل كرتوني حاد', sub: "shading='cel'", p: {...NASSER, expr: 'speak', pose: 'podium', shading: 'cel'}},
    {label: 'تدرج ناعم', sub: "shading='soft'", p: {...NASSER, expr: 'speak', pose: 'podium', shading: 'soft'}},
  ];
  return (
    <Sheet title="البنية الجسدية والتظليل">
      <Row cards={builds} y={470} s={1.05} frame={f} />
      <line x1={120} x2={1800} y1={585} y2={585} stroke="#cbb89a" strokeWidth={3} />
      <Row cards={shading} y={930} s={1.05} frame={f} />
    </Sheet>
  );
};

/** لوحة ٢: أشكال الوجوه */
export const SheetFaces: React.FC = () => {
  const f = useCurrentFrame() + 20;
  const faces: Card[] = [
    {label: 'دائري', sub: "face='round'", p: {robe: '#c9502f', trim: '#4a2e18', hat: 'cap', expr: 'happy', pose: 'wave', shading: 'cel', skin: '#efc29b'}},
    {label: 'مربع', sub: "face='square'", p: {robe: '#2c5f8a', trim: '#c0262d', hat: 'none', hair: '#2a1a10', mustache: '#2a1a10', face: 'square', build: 'broad', expr: 'neutral', pose: 'cross', shading: 'cel', skin: '#d9a27a'}},
    {label: 'فك قوي', sub: "face='jaw'", p: {robe: '#6b6a5a', trim: '#d9b13a', outfit: 'uniform', hat: 'none', hair: '#1a1512', face: 'jaw', build: 'broad', expr: 'smug', pose: 'stand', shading: 'cel', skin: '#c98f68'}},
    {label: 'ذقن حاد', sub: "face='pointy'", p: {robe: '#5a2a6a', trim: '#e0b43a', hat: 'none', hair: '#111', face: 'pointy', build: 'slim', expr: 'smug', pose: 'chin', shading: 'cel', skin: '#e6c0a0', look: [0.6, 0]}},
    {label: 'طويل', sub: "face='long'", p: {robe: '#3a3e4a', outfit: 'suit', tie: '#7a1e28', hat: 'none', hair: '#6a6a6a', mustache: '#6a6a6a', face: 'long', build: 'slim', expr: 'think', pose: 'stand', shading: 'cel', skin: '#f2c6a0'}},
    {label: 'عريض ممتلئ', sub: "face='wide'", p: {robe: '#2f6f4a', trim: '#e0b43a', hat: 'sultan', beard: '#3a2416', face: 'wide', build: 'belly', expr: 'happy', pose: 'stand', shading: 'cel', skin: '#efc29b'}},
  ];
  return (
    <Sheet title="أشكال الوجوه">
      <Row cards={faces.slice(0, 3)} y={450} s={1.05} frame={f} />
      <Row cards={faces.slice(3)} y={960} s={1.0} frame={f} />
    </Sheet>
  );
};

/** لوحة ٣: شخصيات نسائية */
export const SheetWomen: React.FC = () => {
  const f = useCurrentFrame() + 20;
  const women: Card[] = [
    {
      label: 'سيدة الخمسينيات',
      sub: "outfit='skirt' · hairStyle='bob'",
      p: {build: 'female', outfit: 'skirt', robe: '#f2ece0', skirt: '#2f5f8f', trim: '#c0262d', hat: 'none', hair: '#2a1a12', hairStyle: 'bob', lips: '#c0392b', earrings: '#e8b830', expr: 'happy', pose: 'wave', shading: 'cel', skin: '#e2b48c'},
    },
    {
      label: 'بالحجاب',
      sub: "hat='hijab' · outfit='dress'",
      p: {build: 'female', outfit: 'dress', robe: '#2f6f4a', trim: '#e0b43a', hat: 'hijab', scarf: '#f0e6d2', expr: 'neutral', pose: 'stand', shading: 'cel', skin: '#d9a27a', lips: '#b5524a'},
    },
    {
      label: 'ملكة',
      sub: "hat='crown' · hairStyle='long'",
      p: {build: 'female', outfit: 'dress', robe: '#6a2a7a', trim: '#e0b43a', hat: 'crown', hair: '#1a1210', hairStyle: 'long', face: 'long', earrings: '#e8b830', lips: '#a8324a', expr: 'smug', pose: 'stand', shading: 'cel', skin: '#efc29b'},
    },
    {
      label: 'سيدة كبيرة',
      sub: "build='femaleFull' · hairStyle='bun'",
      p: {build: 'femaleFull', outfit: 'dress', robe: '#8a4a3a', trim: '#e8d8b8', hat: 'none', hair: '#9a9590', hairStyle: 'bun', face: 'wide', expr: 'happy', pose: 'cross', shading: 'cel', skin: '#e6b48d'},
    },
    {
      label: 'فتاة',
      sub: "hairStyle='ponytail'",
      p: {build: 'female', outfit: 'skirt', robe: '#f6d8a8', skirt: '#c0504a', trim: '#2f5f8f', hat: 'none', hair: '#5a3a1e', hairStyle: 'ponytail', expr: 'idea', pose: 'point', shading: 'cel', skin: '#f2c6a0', look: [1, 0]},
    },
    {
      label: 'بعباءة',
      sub: "outfit='abaya' · hairStyle='braid'",
      p: {build: 'female', outfit: 'abaya', robe: '#26222e', trim: '#b88a3a', hat: 'none', hair: '#1a1210', hairStyle: 'braid', face: 'pointy', earrings: '#e8b830', lips: '#9a3040', expr: 'think', pose: 'chin', shading: 'cel', skin: '#c98f68'},
    },
  ];
  return (
    <Sheet title="شخصيات نسائية">
      <Row cards={women.slice(0, 3)} y={450} s={1.05} frame={f} />
      <Row cards={women.slice(3)} y={960} s={1.05} frame={f} />
    </Sheet>
  );
};
