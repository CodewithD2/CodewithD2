import React from 'react';
import {extra, roleBase} from '../cast';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Person} from '../characters/Person';
import {Battlement, Cypress, Ridge, Walkway} from '../lib/epic';
import {Bloom, Cloud, ColorGrade, GodRays, Halo, MistBand, Motes, Smoke} from '../lib/fx';
import {atmos, dawnAt, toHex} from '../lib/palette';
import {Ship, Water} from '../lib/props';
import {Art, Layer, REF_FOV, Sky, Stage, camAt, perspectiveFor} from '../lib/stage';
import {INK, easeOutBack, prog, scatter} from '../lib/util';

const NOTICE = 78;
const VERTIGO = [92, 170];
const SOLDIER_D = 160;
const WALL_TOP = 690;

/** اللقطة ٤ — الفجر: الأسطول داخل الخليج وصدمة الحارس (dolly zoom) */
export const Shot4Dawn: React.FC = () => {
  const f = useCurrentFrame();
  const t = prog(f, 0, 150);
  const P = dawnAt(t);
  const H = (c: string) => toHex(c);

  const cam = camAt(f, [
    {f: 0, x: -260, y: 20, z: -100, ry: -6, rz: 0, fov: 46},
    {f: NOTICE, x: 480, y: -130, z: 330, ry: 2, rz: 0, fov: 45},
    {f: 210, x: 530, y: -150, ry: 0, rz: -2},
  ]);
  if (f >= VERTIGO[0]) {
    const fov = interpolate(f, VERTIGO, [45, 78], {easing: Easing.bezier(0.6, 0, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const Pr = perspectiveFor(REF_FOV);
    const k = (Pr + SOLDIER_D) / Pr;
    const P0 = perspectiveFor(45);
    const S = (k * P0) / (P0 + SOLDIER_D - 330);
    const Pp = perspectiveFor(fov);
    cam.fov = fov;
    cam.z = Pp + SOLDIER_D - (k * Pp) / S;
  }

  const shocked = f >= NOTICE;
  const symbols = easeOutBack(prog(f, NOTICE + 4, NOTICE + 16));
  const sunY = 740 - 120 * t;
  const fleet = scatter('fleet4', 18, -900, 1500, 0, 1)
    .map((s, i) => ({...s, i, y: 745 + s.y * 95}))
    .sort((a, b) => a.y - b.y);

  return (
    <>
      <Sky background={`linear-gradient(${P.skyTop} 0%, ${P.skyMid} 55%, ${P.horizon} 100%)`} />
      <Stage cam={cam}>
        {/* ١: الشمس والأشعة والسحب المضاءة من أسفل */}
        <Layer d={3000}>
          <Art>
            <GodRays id="g4" cx={560} cy={sunY} frame={f} color={H(P.light)} opacity={0.3 + 0.35 * t} />
            <Halo id="sun4" cx={560} cy={sunY} r={760} color={H(P.horizon)} opacity={0.8} core={6} />
            <Bloom id="sunb" x={300} y={sunY - 260} w={520} h={520} radius={30} strength={1.5}>
              <circle cx={560} cy={sunY} r={88} fill={H(P.light)} />
            </Bloom>
            <Cloud id="c4a" x={1500 + f * 0.3} y={300} w={1400} h={110} lit={H(P.rim)} shade={H(P.skyMid)} opacity={0.85} />
            <Cloud id="c4b" x={200 + f * 0.4} y={200} w={1000} h={80} lit={H(P.rim)} shade={H(P.skyTop)} opacity={0.7} />
            <Cloud id="c4c" x={2600 + f * 0.2} y={430} w={900} h={70} lit={H(P.rim)} shade={H(P.skyMid)} opacity={0.7} />
          </Art>
        </Layer>
        {/* ٢: تلال غلطة بأشجار السرو */}
        <Layer d={2200}>
          <Art>
            <Ridge id="s4far" fn={(x) => 680 - 70 * Math.sin(x / 300 + 1) - 20 * Math.sin(x / 80)} top={atmos(H(P.far), H(P.haze), 0.3)} bottom={H(P.far)} rim={H(P.rim)} rimOpacity={0.55} />
            {scatter('cyp4', 14, -1200, 3000, 0, 1).map((c, i) => (
              <Cypress key={i} x={c.x} y={692 - 70 * Math.sin(c.x / 300 + 1) - 20 * Math.sin(c.x / 80)} h={70 + c.r * 60} fill={atmos(H(P.far), H(P.mid), 0.5)} />
            ))}
          </Art>
        </Layer>
        {/* ٣: الخليج والأسطول (مرتب من الخلف للأمام) */}
        <Layer d={1300}>
          <Art>
            <Water id="s4" top={735} frame={f} c1={H(P.water1)} c2={H(P.water2)} shine={H(P.light)} reflectX={560} reflectW={240} />
            {fleet.map((s) => {
              const sc = 0.2 + ((s.y - 745) / 95) * 0.17;
              const far = 1 - (s.y - 745) / 95;
              return (
                <Ship
                  key={s.i}
                  x={s.x + Math.sin(f / 30 + s.p) * 6}
                  y={s.y + Math.sin(f / 18 + s.p) * 3}
                  s={sc}
                  rot={Math.sin(f / 20 + s.p) * 2}
                  frame={f + s.i * 7}
                  hull={atmos('#4a2a1a', H(P.haze), 0.25 * far)}
                  sail={atmos('#f2e2c0', H(P.haze), 0.3 * far)}
                />
              );
            })}
            {[-500, 300, 1100].map((sx, i) => (
              <Smoke key={i} id={`s4sm${i}`} x={sx} y={760} frame={f + i * 50} color={H(P.smoke)} size={40} rise={400} drift={120} n={7} opacity={0.2} life={200} />
            ))}
            <MistBand id="s4water" frame={f} y={760} color={H(P.haze)} h={70} />
          </Art>
        </Layer>
        {/* ٤: سفن أقرب (من الخلف للأمام) */}
        <Layer d={620}>
          <Art>
            {[
              [-80, 880, 0.42],
              [-460, 905, 0.5],
              [180, 935, 0.6],
            ].map(([x, y, s], i) => (
              <Ship key={i} x={x + Math.sin(f / 25 + i) * 8} y={y + Math.sin(f / 16 + i) * 4} s={s} rot={Math.sin(f / 22 + i) * 2} frame={f} />
            ))}
          </Art>
        </Layer>
        {/* ٥: امتداد السور البعيد وجنود صغار يشيرون */}
        <Layer d={420}>
          <Art>
            <rect x={900} y={700} width={1800} height={500} fill={atmos('#6e5a66', H(P.haze), 0.3)} stroke={INK} strokeWidth={4} />
            {Array.from({length: 26}, (_, i) => (
              <rect key={i} x={900 + i * 70} y={672} width={40} height={30} fill={atmos('#6e5a66', H(P.haze), 0.3)} stroke={INK} strokeWidth={4} />
            ))}
            {[1050, 1300, 1700, 2100].map((x, i) => (
              <Person key={x} x={x} y={712} s={0.4} frame={f} {...extra('byzGuard', 20 + i)} expr={f > NOTICE + 20 + i * 6 ? 'shock' : 'sleepy'} pose={f > NOTICE + 20 + i * 6 ? 'armsUp' : 'stand'} flip />
            ))}
            {Array.from({length: 26}, (_, i) => (
              <rect key={`f${i}`} x={900 + i * 70} y={690} width={40} height={30} fill={atmos('#6e5a66', H(P.haze), 0.3)} />
            ))}
          </Art>
        </Layer>
        {/* ٦: السور القريب — الحارس خلف الشرفات */}
        <Layer d={SOLDIER_D}>
          <Art>
            <Walkway x={1180} top={WALL_TOP} w={1800} fill={atmos('#3a2e3e', H(P.near), 0.3)} />
            <Person
              x={1500}
              y={WALL_TOP + 50}
              s={0.95}
              frame={f}
              seed={1}
              {...roleBase('byzGuard')}
              flip={shocked}
              expr={shocked ? 'shock' : 'sleepy'}
              pose={shocked ? (f > NOTICE + 30 ? 'armsUp' : 'stand') : 'stretch'}
              look={[1, 0]}
              jolt={Math.sin(prog(f, NOTICE, NOTICE + 10) * Math.PI)}
            />
            <Battlement x={1180} top={WALL_TOP + 8} w={1800} stone={atmos('#8d7c86', H(P.rim), 0.15 * t)} mortar="#6a5a66" rim={H(P.rim)} />
            {symbols > 0 && (
              <g transform={`translate(1500 330) scale(${symbols})`} fontFamily="Amiri" fontWeight={700} textAnchor="middle">
                <text x={0} y={0} fontSize={120} fill="#ffe37a" stroke={INK} strokeWidth={6} paintOrder="stroke">
                  ؟!
                </text>
              </g>
            )}
          </Art>
        </Layer>
        {/* ٧: طيور النورس */}
        <Layer d={-180}>
          <Art>
            {scatter('gulls', 6, -400, 1600, 180, 420).map((g, i) => {
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
        {/* ٨: ضباب الصباح وذرات ذهبية في الضوء */}
        <Layer d={-300} blur={8} opacity={0.6}>
          <Art>
            <MistBand id="s4fg" frame={f} y={960} color={H(P.haze)} speed={0.7} />
            <Motes id="s4" frame={f} x0={-800} x1={2400} y0={100} y1={1000} color={H(P.light)} n={40} size={3.5} />
          </Art>
        </Layer>
      </Stage>
      <ColorGrade p={P} lightAt={[29, 60]} lightStrength={0.2 + 0.15 * t} />
    </>
  );
};
