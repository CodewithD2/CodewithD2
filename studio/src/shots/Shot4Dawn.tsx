import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Person} from '../characters/Person';
import {Glow, SeaWall, Ship, Water} from '../lib/props';
import {Art, Layer, REF_FOV, Sky, Stage, camAt, perspectiveFor} from '../lib/stage';
import {INK, easeOutBack, mixColor, prog, ridgePath, scatter} from '../lib/util';
import {Fog} from './common';

const NOTICE = 78; // يرى الأسطول
const VERTIGO = [92, 170]; // مدة الـ dolly zoom
const SOLDIER_D = 160; // عمق طبقة الجندي

/** اللقطة ٤ — الفجر: الأسطول داخل الخليج وصدمة الحارس (٨ طبقات + dolly zoom) */
export const Shot4Dawn: React.FC = () => {
  const f = useCurrentFrame();
  const dawn = prog(f, 0, 150);

  const cam = camAt(f, [
    {f: 0, x: -240, y: 30, z: -80, ry: -6, rz: 0, fov: 46},
    {f: NOTICE, x: 470, y: -150, z: 330, ry: 2, rz: 0, fov: 45},
    {f: 210, x: 520, y: -170, ry: 0, rz: -2},
  ]);
  // Dolly zoom: نوسّع زاوية الرؤية ونقترب بحيث يبقى الحارس بنفس الحجم
  if (f >= VERTIGO[0]) {
    const fov = interpolate(f, VERTIGO, [45, 78], {
      easing: Easing.bezier(0.6, 0, 0.3, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const Pr = perspectiveFor(REF_FOV);
    const k = (Pr + SOLDIER_D) / Pr;
    const P0 = perspectiveFor(45);
    const S = (k * P0) / (P0 + SOLDIER_D - 330); // الحجم الظاهري عند بداية الحركة
    const P = perspectiveFor(fov);
    cam.fov = fov;
    cam.z = P + SOLDIER_D - (k * P) / S;
  }

  const shocked = f >= NOTICE;
  const symbols = easeOutBack(prog(f, NOTICE + 4, NOTICE + 16));

  return (
    <>
      <Sky
        background={`linear-gradient(${mixColor('#141634', '#3d2c5c', dawn)} 0%, ${mixColor('#3a2347', '#d0684a', dawn)} 55%, ${mixColor(
          '#6b3a4a',
          '#ffc477',
          dawn,
        )} 100%)`}
      />
      <Stage cam={cam}>
        {/* ٢: الشمس والسحب */}
        <Layer d={2600}>
          <Art>
            <Glow id="sun" cx={560} cy={700 - 90 * dawn} r={620} color="#ffcf8a" opacity={0.75 * dawn} />
            <circle cx={560} cy={760 - 110 * dawn} r={86} fill="#ffe7a8" />
            {scatter('clouds', 7, -800, 2600, 140, 430).map((c, i) => (
              <ellipse
                key={i}
                cx={c.x + f * 0.4}
                cy={c.y}
                rx={260 + c.r * 200}
                ry={26 + c.r * 16}
                fill={mixColor('#3b2b55', '#f08c6a', dawn)}
                opacity={0.7}
              />
            ))}
          </Art>
        </Layer>
        {/* ٣: تلال غلطة البعيدة */}
        <Layer d={1800}>
          <Art>
            <path d={ridgePath((x) => 690 - 70 * Math.sin(x / 300 + 1) - 20 * Math.sin(x / 80), -1400, 3300, 1600)} fill={mixColor('#22193a', '#7a4a6a', dawn)} />
          </Art>
        </Layer>
        {/* ٤: الخليج والأسطول البعيد */}
        <Layer d={900}>
          <Art>
            <Water id="s4a" top={720} frame={f} c1={mixColor('#2a2346', '#c0745e', dawn)} c2="#1c1426" shine="#ffd6a0" reflectX={560} reflectW={200} />
            {scatter('fleet', 14, -700, 1500, 735, 830)
              .sort((a, b) => a.y - b.y)
              .map((s, i) => (
                <Ship
                  key={i}
                  x={s.x + Math.sin(f / 30 + s.p) * 6}
                  y={s.y + Math.sin(f / 18 + s.p) * 3}
                  s={0.22 + ((s.y - 735) / 95) * 0.16}
                  rot={Math.sin(f / 20 + s.p) * 2}
                  frame={f + i * 7}
                  hull="#5a3420"
                  sail="#e8d9bb"
                />
              ))}
          </Art>
        </Layer>
        {/* ٥: سفن أقرب */}
        <Layer d={480}>
          <Art>
            {[
              [-420, 900, 0.5],
              [120, 930, 0.6],
              [-80, 870, 0.42],
            ].map(([x, y, s], i) => (
              <Ship key={i} x={x + Math.sin(f / 25 + i) * 8} y={y + Math.sin(f / 16 + i) * 4} s={s} rot={Math.sin(f / 22 + i) * 2} frame={f} />
            ))}
          </Art>
        </Layer>
        {/* ٦: سور المدينة والحارس */}
        <Layer d={SOLDIER_D}>
          <Art>
            <SeaWall x={1180} top={660} w={1700} stone={mixColor('#4f4a63', '#9b8a8f', dawn)} dark={mixColor('#3d3a50', '#7a6a72', dawn)} />
            <Person
              x={1500}
              y={626}
              s={0.95}
              frame={f}
              seed={1}
              robe="#7a2430"
              trim="#d9b13a"
              hat="byzHelmet"
              skin="#e8b994"
              flip={shocked}
              expr={shocked ? 'shock' : 'sleepy'}
              pose={shocked ? (f > NOTICE + 30 ? 'armsUp' : 'stand') : 'stretch'}
              look={[1, 0]}
              jolt={Math.sin(prog(f, NOTICE, NOTICE + 10) * Math.PI)}
            />
            {symbols > 0 && (
              <g transform={`translate(1500 300) scale(${symbols})`} fontFamily="Amiri" fontWeight={700} textAnchor="middle">
                <text x={0} y={0} fontSize={120} fill="#ffe37a" stroke={INK} strokeWidth={6} paintOrder="stroke">
                  ؟!
                </text>
              </g>
            )}
          </Art>
        </Layer>
        {/* ٧: طيور النورس قريبة */}
        <Layer d={-180}>
          <Art>
            {scatter('gulls', 5, -400, 1600, 180, 420).map((g, i) => {
              const x = g.x + f * (2.2 + g.r);
              const wing = Math.sin(f / 4 + g.p) * 14;
              return (
                <path
                  key={i}
                  d={`M ${x - 34} ${g.y - wing} Q ${x - 14} ${g.y - 14} ${x} ${g.y} Q ${x + 14} ${g.y - 14} ${x + 34} ${g.y - wing}`}
                  stroke={INK}
                  strokeWidth={6}
                  fill="none"
                  strokeLinecap="round"
                />
              );
            })}
          </Art>
        </Layer>
        {/* ٨: ضباب الصباح */}
        <Layer d={-300} blur={12} opacity={0.45}>
          <Fog frame={f} y={860} color="#ffd9b8" seed="fog4" />
        </Layer>
      </Stage>
    </>
  );
};
