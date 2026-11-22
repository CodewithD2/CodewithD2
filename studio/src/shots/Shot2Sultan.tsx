import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Person} from '../characters/Person';
import {Glow, Moon, Ship, Skyline, Stars, Tent, Torch, Water} from '../lib/props';
import {Art, Layer, Sky, Stage, camAt} from '../lib/stage';
import {INK, easeOutBack, prog, ridgePath, scatter} from '../lib/util';

// توقيتات داخل اللقطة (بالإطارات)
const IDEA = 100; // لحظة الإلهام
const POINT = 150; // يشير: «فوق اليابسة!»
const VIZ_SHOCK = 168;

/** اللقطة ٢ — السلطان محمد الثاني في معسكره تأتيه الفكرة (٧ طبقات) */
export const Shot2Sultan: React.FC = () => {
  const f = useCurrentFrame();
  const punch = Math.sin(prog(f, IDEA, IDEA + 14) * Math.PI) * 4; // ضربة زوم لحظة الفكرة
  const cam = camAt(f, [
    {f: 0, x: 120, y: -20, z: -120, ry: 6, fov: 48},
    {f: IDEA, x: -40, y: 0, z: 240, ry: 1, fov: 42},
    {f: 250, x: 60, y: -30, z: 330, ry: -5, fov: 44},
  ]);
  cam.fov -= punch;

  const idea = f >= IDEA;
  const sultanExpr = f < IDEA ? 'think' : f < POINT ? 'idea' : 'happy';
  const sultanPose = f < IDEA ? 'chin' : f < POINT ? 'armsUp' : 'point';
  const bubble = easeOutBack(prog(f, IDEA + 8, IDEA + 26));

  return (
    <>
      <Sky background="linear-gradient(#0a0b1f 0%, #22183f 60%, #5a2f45 100%)" />
      <Stage cam={cam}>
        {/* ٢: نجوم وقمر */}
        <Layer d={2600}>
          <Art>
            <Stars frame={f} seed="s2" />
            <Moon cx={360} cy={160} r={54} />
          </Art>
        </Layer>
        {/* ٣: المدينة البعيدة عبر الماء */}
        <Layer d={1750}>
          <Art>
            <Water id="s2" top={700} frame={f} c1="#2a2650" c2="#120f26" shine="#d7b3ff" />
            <Skyline x={1150} base={712} s={0.5} fill="#151231" windows="#ffcf7a" frame={f} />
          </Art>
        </Layer>
        {/* ٤: خيام المعسكر العثماني ونيرانه */}
        <Layer d={850}>
          <Art>
            <path d={ridgePath((x) => 760 - 30 * Math.sin(x / 300), -1400, 3300, 1600)} fill="#1d1430" />
            {scatter('tents', 14, -900, 2800, 700, 760).map((t, i) => (
              <g key={i}>
                <Glow id={`cf${i}`} cx={t.x + 120} cy={t.y} r={120} color="#ff8a3d" opacity={0.35 + 0.15 * Math.sin(f / 4 + i)} />
                <Tent x={t.x} y={t.y + 10} s={0.45 + t.r * 0.25} a={i % 3 === 0 ? '#2f6f4a' : '#b3262c'} b="#e9dcc0" />
              </g>
            ))}
          </Art>
        </Layer>
        {/* ٥: قمة التل — السلطان والوزير */}
        <Layer d={260}>
          <Art>
            <path d="M -1400 905 Q 300 860 960 880 Q 1700 900 3300 870 L 3300 2000 L -1400 2000 Z" fill="#2b1f2c" stroke={INK} strokeWidth={5} />
            <Torch x={520} y={900} frame={f} id="t2a" s={1.2} />
            <Person
              x={820}
              y={900}
              frame={f}
              seed={2}
              robe="#b3262c"
              trim="#e0b43a"
              hat="sultan"
              beard="#3a2416"
              skin="#efc29b"
              expr={sultanExpr}
              pose={sultanPose}
              look={f < IDEA ? [-0.6, -1] : [1, 0]}
              jolt={Math.sin(prog(f, IDEA, IDEA + 10) * Math.PI)}
            />
            <Person
              x={1170}
              y={905}
              s={0.9}
              frame={f}
              seed={5}
              robe="#2f5f8f"
              trim="#c9c2a8"
              hat="vizier"
              beard="#9c968c"
              skin="#e6b48d"
              flip
              expr={f < VIZ_SHOCK ? 'neutral' : 'shock'}
              pose={f < VIZ_SHOCK ? 'stand' : 'armsUp'}
              look={[-1, 0]}
              jolt={Math.sin(prog(f, VIZ_SHOCK, VIZ_SHOCK + 10) * Math.PI)}
            />
            {/* مصباح الفكرة */}
            {idea && (
              <g opacity={1 - prog(f, POINT - 10, POINT + 10)} transform={`translate(820 ${520 - 20 * easeOutBack(prog(f, IDEA, IDEA + 12))})`}>
                <Glow id="bulb" cx={0} cy={0} r={150} color="#fff2a8" opacity={0.8} />
                <circle cx={0} cy={0} r={34} fill="#fff6b8" stroke={INK} strokeWidth={5} />
                <rect x={-14} y={30} width={28} height={20} fill="#9aa3ad" stroke={INK} strokeWidth={4} />
              </g>
            )}
          </Art>
        </Layer>
        {/* ٦: فقاعة التفكير — سفينة فوق تل */}
        <Layer d={120}>
          <Art>
            {bubble > 0 && (
              <g transform={`translate(1340 330) scale(${bubble})`}>
                <circle cx={-330} cy={250} r={14} fill="#fff" stroke={INK} strokeWidth={5} />
                <circle cx={-280} cy={200} r={22} fill="#fff" stroke={INK} strokeWidth={5} />
                <ellipse cx={0} cy={0} rx={300} ry={190} fill="#fdf8ea" stroke={INK} strokeWidth={6} />
                <clipPath id="bub">
                  <ellipse cx={0} cy={0} rx={292} ry={182} />
                </clipPath>
                <g clipPath="url(#bub)">
                  <path d="M -320 140 Q 0 -60 320 140 L 320 300 L -320 300 Z" fill="#8bbf6a" stroke={INK} strokeWidth={5} />
                  <Ship x={-40 + Math.sin(f / 10) * 6} y={40} s={0.48} rot={-8} frame={f} />
                  {[110, 160, 210].map((px, i) => (
                    <Person key={px} x={px} y={92 + i * 10} s={0.22} frame={f} seed={i} robe="#d98b2b" trim="#7a4a26" hat="cap" expr="strain" pose="pull" />
                  ))}
                </g>
              </g>
            )}
          </Art>
        </Layer>
        {/* ٧: أعشاب أمامية ضبابية */}
        <Layer d={-320} blur={7}>
          <Art>
            {scatter('grass2', 26, -900, 2800, 1040, 1100).map((g, i) => (
              <path
                key={i}
                d={`M ${g.x} 1200 Q ${g.x + 10 + Math.sin(f / 15 + g.p) * 10} ${g.y - 90 * g.r} ${g.x + 30} ${g.y - 150 - 80 * g.r} Q ${g.x + 30} ${g.y - 40} ${g.x + 50} 1200 Z`}
                fill="#0e0a12"
              />
            ))}
          </Art>
        </Layer>
      </Stage>
    </>
  );
};
