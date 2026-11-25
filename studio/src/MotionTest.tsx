import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {Act, Motion, Person, PersonProps} from './characters/Person';
import {INK, prog} from './lib/util';

/** اختبار البند ١: المشي والجري والوقوف وحالات التمثيل */

const MAN: Omit<PersonProps, 'x' | 'y' | 'frame'> = {
  robe: '#3a4a6a',
  outfit: 'suit',
  tie: '#a8323a',
  hat: 'none',
  hair: '#2a1a12',
  mustache: '#2a1a12',
  face: 'square',
  skin: '#d9a27a',
  shading: 'cel',
};

const WOMAN: Omit<PersonProps, 'x' | 'y' | 'frame'> = {
  build: 'female',
  outfit: 'dress',
  robe: '#2f6f4a',
  trim: '#e0b43a',
  hat: 'none',
  hair: '#3a2416',
  hairStyle: 'ponytail',
  lips: '#b5524a',
  skin: '#efc29b',
  shading: 'cel',
  expr: 'happy',
};

const Street: React.FC = () => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    <defs>
      <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#8fc4e8" />
        <stop offset="100%" stopColor="#f3e3c3" />
      </linearGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#sky)" />
    {[0, 260, 520, 780, 1040, 1300, 1560, 1820].map((x, i) => (
      <g key={x}>
        <rect x={x} y={420 - (i % 3) * 60} width={230} height={420 + (i % 3) * 60} fill={['#d8b48c', '#c99a78', '#e0c4a0'][i % 3]} stroke={INK} strokeWidth={4} />
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={x + 30 + c * 66} y={460 - (i % 3) * 60 + r * 100} width={36} height={56} rx={14} fill="#5a7a9a" stroke={INK} strokeWidth={3} />),
        )}
      </g>
    ))}
    <rect y={820} width={1920} height={260} fill="#d6c29a" stroke={INK} strokeWidth={5} />
    {Array.from({length: 13}, (_, i) => (
      <line key={i} x1={i * 160} y1={900} x2={i * 160 + 80} y2={900} stroke="#bfa97e" strokeWidth={6} strokeLinecap="round" />
    ))}
  </svg>
);

const Caption: React.FC<{text: string}> = ({text}) => (
  <div
    style={{
      position: 'absolute',
      top: 40,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontFamily: 'Amiri',
      fontWeight: 700,
      fontSize: 58,
      color: '#2a2030',
      direction: 'rtl',
      textShadow: '0 2px 0 #fff8',
    }}
  >
    {text}
  </div>
);

/** الجزء الأول: رجل يمشي ← يقف ← يغضب ← يجري، وامرأة بفستان تمشي في الخلف */
const PartA: React.FC = () => {
  const f = useCurrentFrame();
  const ease = Easing.inOut(Easing.quad);
  const walkX = interpolate(f, [0, 90], [150, 760], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
  const runX = interpolate(f, [210, 275], [760, 2200], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  const x = f < 210 ? walkX : runX;
  const travel = x - 150;
  let motion: Motion = 'walk';
  let act: Act | undefined;
  let label = 'مشي';
  if (f >= 90 && f < 115) [motion, label] = ['idle', 'وقوف (نقل الوزن)'];
  if (f >= 115 && f < 190) [motion, act, label] = ['idle', 'angry', 'غضب — شدة ٠٫٩'];
  if (f >= 190 && f < 210) [motion, label] = ['idle', 'يهدأ'];
  if (f >= 210) [motion, label] = ['run', 'جري'];

  const womanX = interpolate(f, [0, 280], [1850, 300], {extrapolateRight: 'clamp', easing: ease});
  return (
    <AbsoluteFill>
      <Street />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Person x={womanX} y={850} s={0.85} frame={f} seed={3} {...WOMAN} flip motion="walk" travel={1850 - womanX} energy={0.35} />
        <Person x={x} y={960} s={1.15} frame={f} seed={1} {...MAN} motion={motion} travel={travel} energy={motion === 'run' ? 0.8 : 0.45} act={act} expr={motion === 'run' ? 'shock' : 'neutral'} />
      </svg>
      <Caption text={label} />
    </AbsoluteFill>
  );
};

/** الجزء الثاني: كل حالات التمثيل بشدة هادئة (أعلى) ومبالغة (أسفل) */
const ACTS: {act: Act; label: string}[] = [
  {act: 'angry', label: 'غضب'},
  {act: 'laugh', label: 'ضحك'},
  {act: 'sad', label: 'حزن'},
  {act: 'scared', label: 'خوف'},
  {act: 'orate', label: 'خطابة'},
  {act: 'cheer', label: 'انتصار'},
];
const LOOKS: Omit<PersonProps, 'x' | 'y' | 'frame'>[] = [
  {robe: '#6b6a5a', outfit: 'uniform', hat: 'officerCap', hair: '#1a1512', trim: '#d9b13a', build: 'broad', face: 'jaw', skin: '#c98f68'},
  {robe: '#b85a2e', trim: '#e0b43a', hat: 'vizier', beard: '#5a4636', build: 'belly', face: 'wide', skin: '#e2b48c'},
  {build: 'female', outfit: 'dress', robe: '#5a6a9a', trim: '#e8d8b8', hat: 'none', hair: '#3a2416', hairStyle: 'long', skin: '#efc29b'},
  {robe: '#3a3e4a', outfit: 'suit', tie: '#1e5a3a', hat: 'none', hair: '#3a2a1e', build: 'slim', face: 'long', skin: '#f2c6a0'},
  {robe: '#3a3e4a', outfit: 'suit', tie: '#5a1e28', hat: 'none', hair: '#1a1512', mustache: '#1a1512', skin: '#c98f68'},
  {build: 'female', outfit: 'skirt', robe: '#f2ece0', skirt: '#c0504a', trim: '#2f5f8f', hat: 'none', hair: '#5a3a1e', hairStyle: 'ponytail', skin: '#f2c6a0'},
];

const PartB: React.FC = () => {
  const f = useCurrentFrame();
  const col = 1920 / ACTS.length;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#f6efe2, #e6d9c4)'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <text x={1880} y={140} fontFamily="Amiri" fontSize={34} fill="#6a5a6a" textAnchor="end">
          شدة هادئة (energy 0.25)
        </text>
        <text x={1880} y={600} fontFamily="Amiri" fontSize={34} fill="#6a5a6a" textAnchor="end">
          شدة مبالغة (energy 1.0)
        </text>
        {ACTS.map((a, i) => {
          const x = col * (i + 0.5);
          return (
            <g key={a.act}>
              <Person x={x} y={470} s={0.82} frame={f} seed={i} {...LOOKS[i]} shading="cel" act={a.act} energy={0.25} />
              <Person x={x} y={940} s={0.82} frame={f} seed={i + 7} {...LOOKS[i]} shading="cel" act={a.act} energy={1} />
              <text x={x} y={530} fontFamily="Amiri" fontSize={40} fontWeight={700} textAnchor="middle" fill="#2a2030">
                {a.label}
              </text>
              <text x={x} y={1000} fontFamily="Amiri" fontSize={26} textAnchor="middle" fill="#6a5a6a">
                act='{a.act}'
              </text>
            </g>
          );
        })}
      </svg>
      <Caption text="حالات التمثيل" />
    </AbsoluteFill>
  );
};

export const MOTION_TEST_FRAMES = 420;

export const MotionTest: React.FC = () => {
  const f = useCurrentFrame();
  const fade = Math.max(1 - prog(f, 0, 10), prog(f, 268, 280) * (1 - prog(f, 280, 292)), prog(f, 405, 418));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence durationInFrames={280}>
        <PartA />
      </Sequence>
      <Sequence from={280}>
        <PartB />
      </Sequence>
      <AbsoluteFill style={{background: '#000', opacity: fade}} />
    </AbsoluteFill>
  );
};
