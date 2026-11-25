import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Person, PersonProps, View, yawAt} from './characters/Person';
import {INK, prog} from './lib/util';

/** اختبار البند ٢: الاتجاهات والالتفات */

type Look = Omit<PersonProps, 'x' | 'y' | 'frame'>;

export const LOOKS: Record<string, {label: string; p: Look}> = {
  man: {label: 'رجل ببدلة', p: {robe: '#3a4a6a', outfit: 'suit', tie: '#a8323a', hat: 'none', hair: '#2a1a12', mustache: '#2a1a12', face: 'square', skin: '#d9a27a', shading: 'cel'}},
  woman: {label: 'شعر طويل', p: {build: 'female', outfit: 'dress', robe: '#2f6f4a', trim: '#e0b43a', hat: 'none', hair: '#3a2416', hairStyle: 'long', lips: '#b5524a', earrings: '#e8b830', skin: '#efc29b', shading: 'cel'}},
  sultan: {label: 'السلطان', p: {robe: '#b3262c', trim: '#e0b43a', hat: 'sultan', beard: '#3a2416', skin: '#efc29b', shading: 'cel'}},
  soldier: {label: 'جندي بيزنطي', p: {robe: '#7a2430', trim: '#d9b13a', hat: 'byzHelmet', skin: '#e8b994', build: 'broad', face: 'jaw', shading: 'cel'}},
  janissary: {label: 'إنكشاري', p: {robe: '#2c5f8a', trim: '#c0262d', hat: 'bork', beard: '#2a1a10', skin: '#d9a27a', shading: 'cel'}},
  hijab: {label: 'بالحجاب', p: {build: 'female', outfit: 'dress', robe: '#5a3a6a', trim: '#e0b43a', hat: 'hijab', scarf: '#e8dcc4', lips: '#b5524a', skin: '#d9a27a', shading: 'cel'}},
  girl: {label: 'ذيل حصان', p: {build: 'female', outfit: 'skirt', robe: '#f6d8a8', skirt: '#c0504a', trim: '#2f5f8f', hat: 'none', hair: '#5a3a1e', hairStyle: 'ponytail', skin: '#f2c6a0', shading: 'cel'}},
  officer: {label: 'ضابط بكاب', p: {robe: '#6b6a5a', outfit: 'uniform', hat: 'officerCap', hair: '#1a1512', trim: '#d9b13a', skin: '#c98f68', build: 'belly', face: 'wide', mustache: '#1a1512', shading: 'cel'}},
};

const VIEWS: {v: View; label: string}[] = [
  {v: 'front', label: 'أمامي'},
  {v: 'threeQuarter', label: 'ثلاثة أرباع'},
  {v: 'side', label: 'جانبي'},
  {v: 'threeQuarterBack', label: 'ثلاثة أرباع خلفي'},
  {v: 'back', label: 'خلفي'},
];

const Sheet: React.FC<{keys: string[]; title: string}> = ({keys, title}) => {
  const f = useCurrentFrame() + 30;
  const colW = 1640 / VIEWS.length;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#f6efe2, #e6d9c4)'}}>
      <svg width={1920} height={1080}>
        <text x={960} y={70} fontFamily="Amiri" fontSize={54} fontWeight={700} textAnchor="middle" fill="#2a2030">
          {title}
        </text>
        {VIEWS.map((v, c) => (
          <text key={v.v} x={280 + colW * (c + 0.5)} y={124} fontFamily="Amiri" fontSize={32} fontWeight={700} textAnchor="middle" fill="#5a4a5a">
            {v.label}
          </text>
        ))}
        {keys.map((k, r) => {
          const y = 410 + r * 320;
          return (
            <g key={k}>
              <text x={150} y={y - 90} fontFamily="Amiri" fontSize={36} fontWeight={700} textAnchor="middle" fill="#2a2030">
                {LOOKS[k].label}
              </text>
              <line x1={260} x2={1900} y1={y + 12} y2={y + 12} stroke="#d3c2a4" strokeWidth={3} />
              {VIEWS.map((v, c) => (
                <Person key={v.v} x={280 + colW * (c + 0.5)} y={y} s={0.78} frame={f} seed={r} {...LOOKS[k].p} view={v.v} />
              ))}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const TurnSheetA: React.FC = () => <Sheet keys={['man', 'woman', 'sultan']} title="الاتجاهات (١)" />;
export const TurnSheetB: React.FC = () => <Sheet keys={['soldier', 'janissary', 'hijab']} title="الاتجاهات (٢)" />;
export const TurnSheetC: React.FC = () => <Sheet keys={['girl', 'officer', 'man']} title="الاتجاهات (٣)" />;

/** فيديو: يمشي من الجانب ← يلتفت للكاميرا ← يغضب ← يدير ظهره ويمشي مبتعداً، وفتاة تجري */
export const TURN_TEST_FRAMES = 300;

export const TurnTest: React.FC = () => {
  const f = useCurrentFrame();
  const walkIn = interpolate(f, [0, 80], [120, 820], {extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
  const away = prog(f, 185, 280);
  const x = f < 185 ? walkIn : 820 + away * 160;
  const yy = f < 185 ? 960 : 960 - away * 170;
  const sc = f < 185 ? 1.15 : 1.15 - away * 0.5;
  const travel = f < 185 ? walkIn - 120 : away * 900;
  const view = yawAt(f, [
    {f: 0, view: 'side'},
    {f: 80, view: 'side'},
    {f: 96, view: 'front'},
    {f: 165, view: 'front'},
    {f: 185, view: 'back'},
  ]);
  const motion = f < 80 || f >= 185 ? 'walk' : 'idle';
  const act = f >= 100 && f < 165 ? 'angry' : undefined;
  const label = f < 80 ? 'مشي من الجانب (تلقائي)' : f < 100 ? 'التفات ناعم للكاميرا' : f < 165 ? 'غضب' : f < 185 ? 'يدير ظهره' : 'يمشي مبتعداً';

  const girlX = interpolate(f, [20, 140], [2100, -200], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="tsky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8fc4e8" />
            <stop offset="100%" stopColor="#f3e3c3" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#tsky)" />
        {[0, 260, 520, 780, 1040, 1300, 1560, 1820].map((bx, i) => (
          <rect key={bx} x={bx} y={420 - (i % 3) * 60} width={230} height={420 + (i % 3) * 60} fill={['#d8b48c', '#c99a78', '#e0c4a0'][i % 3]} stroke={INK} strokeWidth={4} />
        ))}
        <rect y={780} width={1920} height={300} fill="#d6c29a" stroke={INK} strokeWidth={5} />
        <Person x={girlX} y={830} s={0.8} frame={f} seed={4} {...LOOKS.girl.p} flip motion="run" travel={2100 - girlX} energy={0.7} expr="happy" />
        <Person x={x} y={yy} s={sc} frame={f} seed={1} {...LOOKS.man.p} motion={motion} travel={travel} energy={act ? 0.9 : 0.45} act={act} view={view} />
      </svg>
      <div style={{position: 'absolute', top: 36, width: '100%', textAlign: 'center', fontFamily: 'Amiri', fontSize: 56, fontWeight: 700, color: '#2a2030', direction: 'rtl'}}>
        {label}
      </div>
    </AbsoluteFill>
  );
};
