import React from 'react';
import {extra, look} from '../cast';
import {useCurrentFrame} from 'remotion';
import {Person} from '../characters/Person';
import {Banner, Bombard, Campfire, CityEpic, Ridge} from '../lib/epic';
import {Bloom, Cloud, ColorGrade, Embers, Halo, MistBand, Motes, Smoke} from '../lib/fx';
import {CAMP as P, atmos} from '../lib/palette';
import {Ship, Stars, Tent, Water} from '../lib/props';
import {Art, Layer, Sky, Stage, camAt} from '../lib/stage';
import {INK, easeOutBack, prog, scatter} from '../lib/util';

const IDEA = 100; // لحظة الإلهام
const POINT = 150; // يشير: «فوق اليابسة!»
const VIZ_SHOCK = 168;

const campRidge = (x: number) => 735 - 40 * Math.sin(x / 280) - 15 * Math.sin(x / 90);

/** اللقطة ٢ — معسكر السلطان محمد الثاني وتأتيه الفكرة */
export const Shot2Sultan: React.FC = () => {
  const f = useCurrentFrame();
  const punch = Math.sin(prog(f, IDEA, IDEA + 14) * Math.PI) * 4;
  const cam = camAt(f, [
    {f: 0, x: 140, y: -40, z: -160, ry: 6, fov: 48},
    {f: IDEA, x: -40, y: 0, z: 230, ry: 1, fov: 42},
    {f: 250, x: 70, y: -30, z: 320, ry: -5, fov: 44},
  ]);
  cam.fov -= punch;

  const idea = f >= IDEA;
  const sultanExpr = f < IDEA ? 'think' : f < POINT ? 'idea' : 'happy';
  const sultanPose = f < IDEA ? 'chin' : f < POINT ? 'armsUp' : 'point';
  const bubble = easeOutBack(prog(f, IDEA + 8, IDEA + 26));

  // صفوف الخيام مرتبة من الخلف للأمام حتى لا تتداخل بشكل خاطئ
  const tents = scatter('tents2', 16, -900, 2900, 0, 1)
    .map((t, i) => ({...t, i, y: 790 + t.y * 90}))
    .sort((a, b) => a.y - b.y);

  return (
    <>
      <Sky background={`linear-gradient(${P.skyTop} 0%, ${P.skyMid} 55%, ${P.horizon} 100%)`} />
      <Stage cam={cam}>
        {/* ١: نجوم وقمر وسحب تضيئها النيران من أسفل */}
        <Layer d={3000}>
          <Art>
            <Stars frame={f} seed="s2" />
            <Halo id="moon2" cx={330} cy={150} r={420} color={P.light} opacity={0.35} core={8} />
            <circle cx={330} cy={150} r={52} fill={P.light} />
            <Cloud id="c2a" x={1300 + f * 0.2} y={420} w={1300} h={100} lit={P.rim} shade={P.skyMid} opacity={0.55} />
            <Cloud id="c2b" x={2500 + f * 0.25} y={340} w={900} h={80} lit={P.rim} shade={P.skyMid} opacity={0.45} />
          </Art>
        </Layer>
        {/* ٢: القسطنطينية عبر الماء */}
        <Layer d={2200}>
          <Art>
            <Water id="s2" top={690} frame={f} c1={P.water1} c2={P.water2} shine={P.rim} />
            <CityEpic id="c2" x={900} base={700} s={0.5} fill={atmos(P.city, P.haze, 0.25)} back={atmos(P.city, P.haze, 0.45)} rim={P.rim} win={P.warm} frame={f} bloom={false} />
          </Art>
        </Layer>
        {/* ٣: الجيش على التلال البعيدة — مئات النيران وأعمدة دخان */}
        <Layer d={1450}>
          <Art>
            <Ridge id="s2far" fn={campRidge} top={atmos(P.far, P.haze, 0.3)} bottom={P.far} rim={P.rim} rimOpacity={0.4} />
            {[-500, 300, 1100, 1900, 2500].map((sx, i) => (
              <Smoke key={i} id={`s2col${i}`} x={sx} y={campRidge(sx)} frame={f + i * 40} color={P.smoke} size={60} rise={700} drift={160} n={8} opacity={0.22} life={220} />
            ))}
            {scatter('tentsfar', 60, -1200, 3200, 0, 1).map((t, i) => {
              const y = campRidge(t.x) + 6 + t.y * 40;
              return <path key={i} d={`M ${t.x - 18} ${y} L ${t.x} ${y - 26} L ${t.x + 18} ${y} Z`} fill={atmos(P.mid, P.haze, 0.2)} />;
            })}
            <Bloom id="farfires" x={-1300} y={600} w={4600} h={300} radius={8} strength={1.8}>
              {scatter('firesfar', 90, -1200, 3200, 0, 1).map((t, i) => (
                <circle key={i} cx={t.x} cy={campRidge(t.x) + 12 + t.y * 46} r={2.5 + t.r * 2.5} fill={P.warm} opacity={0.6 + 0.4 * Math.sin(f / 3 + t.p)} />
              ))}
            </Bloom>
            <MistBand id="s2far" frame={f} y={790} color={P.haze} />
          </Art>
        </Layer>
        {/* ٤: المعسكر القريب — خيام ورايات والمدفع العملاق */}
        <Layer d={820}>
          <Art>
            <path d="M -1400 800 Q 900 760 3300 800 L 3300 2000 L -1400 2000 Z" fill={P.mid} />
            {tents.map((t) => (
              <Tent key={t.i} x={t.x} y={t.y} s={0.42 + (t.y - 790) / 90 * 0.18} a={t.i % 3 === 0 ? '#2f6f4a' : '#b3262c'} b={atmos('#e9dcc0', P.haze, 0.3)} />
            ))}
            <Bombard x={-260} y={890} s={0.8} rim={P.rim} />
            {[200, 1500, 2300].map((bx, i) => (
              <Banner key={i} x={bx} y={830} h={240} color={i % 2 ? '#2f6f4a' : '#b3262c'} frame={f} seed={i} s={0.8} />
            ))}
            <Campfire id="cf2a" x={650} y={860} frame={f} s={0.7} smoke={P.smoke} warm={P.warm} />
            <Campfire id="cf2b" x={1900} y={880} frame={f + 20} s={0.8} smoke={P.smoke} warm={P.warm} />
          </Art>
        </Layer>
        {/* ٥: قمة التل — السلطان والوزير */}
        <Layer d={280}>
          <Art>
            <path d="M -1400 910 Q 300 862 960 880 Q 1700 900 3300 868 L 3300 2000 L -1400 2000 Z" fill={P.near} stroke={INK} strokeWidth={5} />
            <path d="M -1400 910 Q 300 862 960 880 Q 1700 900 3300 868" fill="none" stroke={P.rim} strokeWidth={4} opacity={0.5} />
            <Banner x={980} y={890} h={330} color="#b3262c" frame={f} seed={3} />
            <Campfire id="cf2c" x={460} y={905} frame={f} s={1.1} smoke={P.smoke} warm={P.warm} />
            <Person
              x={800}
              y={902}
              frame={f}
              seed={2}
              {...look('mehmed2')}
              expr={sultanExpr}
              pose={sultanPose}
              look={f < IDEA ? [-0.6, -1] : [1, 0]}
              jolt={Math.sin(prog(f, IDEA, IDEA + 10) * Math.PI)}
            />
            <Person
              x={1200}
              y={900}
              s={0.9}
              frame={f}
              seed={5}
              {...look('halilPasha')}
              flip
              expr={f < VIZ_SHOCK ? 'neutral' : 'shock'}
              pose={f < VIZ_SHOCK ? 'stand' : 'armsUp'}
              look={[-1, 0]}
              jolt={Math.sin(prog(f, VIZ_SHOCK, VIZ_SHOCK + 10) * Math.PI)}
            />
            {idea && (
              <Bloom id="bulb" x={500} y={200} w={640} h={600} radius={26} strength={1.8}>
                <g opacity={1 - prog(f, POINT - 10, POINT + 10)} transform={`translate(800 ${470 - 20 * easeOutBack(prog(f, IDEA, IDEA + 12))})`}>
                  <circle cx={0} cy={0} r={36} fill="#fff6b8" stroke={INK} strokeWidth={5} />
                  <path d="M -10 6 L -4 -10 L 4 6 L 10 -10" stroke="#e0a020" strokeWidth={4} fill="none" />
                  <rect x={-15} y={32} width={30} height={20} fill="#9aa3ad" stroke={INK} strokeWidth={4} />
                  {Array.from({length: 8}, (_, i) => {
                    const a = (i / 8) * Math.PI * 2;
                    const r1 = 52 + Math.sin(f / 2 + i) * 4;
                    return <line key={i} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * (r1 + 22)} y2={Math.sin(a) * (r1 + 22)} stroke="#fff3a0" strokeWidth={6} strokeLinecap="round" />;
                  })}
                </g>
              </Bloom>
            )}
          </Art>
        </Layer>
        {/* ٦: فقاعة التفكير */}
        <Layer d={140}>
          <Art>
            {bubble > 0 && (
              <g transform={`translate(1360 330) scale(${bubble})`}>
                <circle cx={-360} cy={250} r={14} fill="#fdf8ea" stroke={INK} strokeWidth={5} />
                <circle cx={-300} cy={200} r={22} fill="#fdf8ea" stroke={INK} strokeWidth={5} />
                <ellipse cx={0} cy={0} rx={300} ry={190} fill="#fdf8ea" stroke={INK} strokeWidth={6} />
                <clipPath id="bub">
                  <ellipse cx={0} cy={0} rx={292} ry={182} />
                </clipPath>
                <g clipPath="url(#bub)">
                  <rect x={-320} y={-200} width={640} height={400} fill="#cfe6f5" />
                  <path d="M -320 140 Q 0 -60 320 140 L 320 300 L -320 300 Z" fill="#8bbf6a" stroke={INK} strokeWidth={5} />
                  <Ship x={-40 + Math.sin(f / 10) * 6} y={40} s={0.48} rot={-8} frame={f} />
                  {[110, 160, 210].map((px, i) => (
                    <Person key={px} x={px} y={92 + i * 10} s={0.22} frame={f} {...extra('ottomanWorker', i, {robe: '#d98b2b'})} expr="strain" pose="pull" />
                  ))}
                </g>
              </g>
            )}
          </Art>
        </Layer>
        {/* ٧: شرر طائر وأعشاب أمامية خارج التركيز */}
        <Layer d={-320} blur={6}>
          <Art>
            {scatter('grass2', 26, -900, 2800, 1040, 1100).map((g, i) => (
              <path
                key={i}
                d={`M ${g.x} 1200 Q ${g.x + 10 + Math.sin(f / 15 + g.p) * 10} ${g.y - 90 * g.r} ${g.x + 30} ${g.y - 150 - 80 * g.r} Q ${g.x + 30} ${g.y - 40} ${g.x + 50} 1200 Z`}
                fill="#0c070e"
              />
            ))}
            <Embers id="fg2" x={300} y={1100} frame={f} n={30} spread={900} rise={900} life={140} size={5} wind={200} />
            <Motes id="s2" frame={f} x0={-400} x1={2300} y0={200} y1={1000} color={P.warm} n={24} size={3} />
          </Art>
        </Layer>
      </Stage>
      <ColorGrade p={P} lightAt={[30, 80]} lightStrength={0.18} />
    </>
  );
};
