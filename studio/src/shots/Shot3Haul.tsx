import React from 'react';
import {extra, roleBase} from '../cast';
import {useCurrentFrame} from 'remotion';
import {Person} from '../characters/Person';
import {Cypress, Ridge, TorchFX} from '../lib/epic';
import {Bloom, Cloud, ColorGrade, Embers, Halo, MistBand, Motes} from '../lib/fx';
import {HAUL as P, atmos} from '../lib/palette';
import {Ship, Stars, Water} from '../lib/props';
import {Art, Layer, Sky, Stage, camAt} from '../lib/stage';
import {INK, lerp, prog, scatter} from '../lib/util';

const hill = (x: number) => 900 - 330 * Math.exp(-(((x - 1300) / 680) ** 2));
const slopeDeg = (x: number) => (Math.atan((hill(x + 2) - hill(x - 2)) / 4) * 180) / Math.PI;
const midHill = (x: number) => 790 - 150 * Math.exp(-(((x - 300) / 520) ** 2)) - 40 * Math.sin(x / 170);

/** اللقطة ٣ — جرّ السفن فوق تلال غلطة ليلاً */
export const Shot3Haul: React.FC = () => {
  const f = useCurrentFrame();
  const shipX = lerp(150, 1080, prog(f, 0, 240));
  const cam = camAt(f, [
    {f: 0, y: 40, z: 0, ry: 3, rz: 0, fov: 50},
    {f: 120, y: -40, z: 120, ry: 0, rz: -1, fov: 46},
    {f: 240, y: -10, z: 60, ry: -3, rz: 0, fov: 48},
  ]);
  cam.x = shipX - 820 + Math.sin(f / 30) * 10;

  const workers = [0, 1, 2, 3, 4, 5].map((i) => shipX + 330 + i * 92);
  const ship2X = shipX - 760;

  return (
    <>
      <Sky background={`linear-gradient(${P.skyTop} 0%, ${P.skyMid} 60%, ${P.horizon} 100%)`} />
      <Stage cam={cam}>
        {/* ١: سماء */}
        <Layer d={3000}>
          <Art>
            <Stars frame={f} seed="s3" />
            <Halo id="moon3" cx={300} cy={150} r={420} color={P.light} opacity={0.4} core={8} />
            <circle cx={300} cy={150} r={50} fill={P.light} />
            <Cloud id="c3a" x={900 + f * 0.3} y={300} w={1100} h={90} lit={P.rim} shade={P.skyMid} opacity={0.5} />
          </Art>
        </Layer>
        {/* ٢: البوسفور البعيد وسفن تنتظر */}
        <Layer d={2100}>
          <Art>
            <Ridge id="s3far" fn={(x) => 650 - 80 * Math.sin(x / 340) - 26 * Math.sin(x / 110)} top={atmos(P.far, P.haze, 0.35)} bottom={P.far} rim={P.rim} rimOpacity={0.35} />
            <Water id="s3" top={735} frame={f} c1={P.water1} c2={P.water2} shine={P.rim} x0={-1400} x1={3300} />
            {[-600, -300, 0, 2000, 2300].map((sx, i) => (
              <Ship key={i} x={sx} y={760 + (i % 2) * 14} s={0.22} frame={f + i * 9} hull={atmos('#5a3420', P.haze, 0.4)} sail={atmos('#e8dcc0', P.haze, 0.45)} />
            ))}
          </Art>
        </Layer>
        {/* ٣: تلال متوسطة بأشجار سرو وموكب مشاعل */}
        <Layer d={1100}>
          <Art>
            <Ridge id="s3mid" fn={midHill} top={atmos(P.mid, P.haze, 0.2)} bottom={P.mid} rim={P.rim} rimOpacity={0.45} />
            {scatter('cyp3', 18, -1200, 3000, 0, 1).map((c, i) => (
              <Cypress key={i} x={c.x} y={midHill(c.x) + 14} h={90 + c.r * 80} fill={atmos(P.mid, P.near, 0.4)} rim={P.rim} sway={Math.sin(f / 30 + c.p) * 3} />
            ))}
            <Bloom id="proc3" x={-1300} y={500} w={4600} h={500} radius={8} strength={1.8}>
              {Array.from({length: 26}, (_, i) => {
                const x = -1100 + i * 140 + ((f * 1.2) % 140);
                return <circle key={i} cx={x} cy={midHill(x) - 16} r={5} fill={P.warm} opacity={0.6 + 0.4 * Math.sin(f / 3 + i)} />;
              })}
            </Bloom>
            <MistBand id="s3valley" frame={f} y={830} color={P.haze} speed={0.6} />
          </Art>
        </Layer>
        {/* ٤: التل الرئيسي: مشاعل خلفية ← سفن ← حبل ← عمّال ← ضابط */}
        <Layer d={0}>
          <Art>
            <Ridge id="s3main" fn={hill} top={atmos(P.near, P.rim, 0.12)} bottom={P.near} rim={P.rim} rimOpacity={0.5} outline />
            {Array.from({length: 120}, (_, i) => {
              const x = -1300 + i * 40;
              return (
                <g key={i} transform={`translate(${x} ${hill(x)}) rotate(${slopeDeg(x)})`}>
                  <rect x={-16} y={-7} width={32} height={12} rx={3} fill="#7a4e26" stroke={INK} strokeWidth={3} />
                  <rect x={-12} y={-6} width={16} height={3} fill="#ffd58a" opacity={0.4 + 0.5 * Math.sin(f / 6 + i)} />
                </g>
              );
            })}
            {/* المشاعل خلف مسار السفن (مغروسة على الجانب البعيد من الطريق) */}
            {[-650, -150, 450, 1050, 1650, 2250].map((x, i) => (
              <TorchFX key={x} id={`t3-${i}`} x={x} y={hill(x) - 14} frame={f} warm={P.warm} smoke={P.smoke} s={0.9} />
            ))}
            <Ship x={ship2X} y={hill(ship2X) - 26} rot={slopeDeg(ship2X)} s={0.9} frame={f} hull="#6d3f20" />
            <Ship x={shipX} y={hill(shipX) - 26} rot={slopeDeg(shipX)} frame={f} />
            <path
              d={`M ${shipX + 200} ${hill(shipX) - 90} Q ${(shipX + workers[5]) / 2} ${hill((shipX + workers[5]) / 2) - 70} ${workers[5] - 60} ${hill(workers[5]) - 72}`}
              stroke="#c9a46a"
              strokeWidth={6}
              fill="none"
            />
            {workers.map((x, i) => (
              <Person
                key={i}
                x={x}
                y={hill(x)}
                s={0.62}
                rot={slopeDeg(x)}
                frame={f}
                seed={i + 3}
                {...extra('ottomanWorker', i + 3)}
                expr="strain"
                pose="pull"
              />
            ))}
            <Person
              x={workers[5] + 180}
              y={hill(workers[5] + 180)}
              s={0.7}
              rot={slopeDeg(workers[5] + 180) * 0.5}
              frame={f}
              seed={9}
              flip
              {...roleBase('janissary')}
              expr={Math.floor(f / 24) % 2 ? 'idea' : 'happy'}
              pose="point"
              look={[1, 0]}
            />
            {/* غبار يتطاير من تحت السفينة */}
            <Embers id="dust3" x={shipX - 120} y={hill(shipX - 120) - 6} frame={f} n={18} spread={200} rise={60} life={40} size={4} color={atmos(P.smoke, P.rim, 0.3)} wind={-80} />
          </Art>
        </Layer>
        {/* ٥: صخور أمامية */}
        <Layer d={-220}>
          <Art>
            {scatter('rocks3', 14, -1200, 3000, 1080, 1120).map((r, i) => (
              <ellipse key={i} cx={r.x} cy={r.y} rx={90 + r.r * 120} ry={40 + r.r * 50} fill="#06070d" stroke={INK} strokeWidth={5} />
            ))}
          </Art>
        </Layer>
        {/* ٦: مشاعل قريبة جداً خارج التركيز + شرر */}
        <Layer d={-480} blur={12}>
          <Art>
            <TorchFX id="t3fg" x={1600} y={1300} frame={f} s={2.2} warm={P.warm} embers={false} />
            <TorchFX id="t3fg2" x={-300} y={1340} frame={f} s={2.4} warm={P.warm} embers={false} />
          </Art>
        </Layer>
        {/* ٧: ذرات طافية */}
        <Layer d={-300} blur={3}>
          <Art>
            <Motes id="s3" frame={f} x0={-1000} x1={2600} y0={100} y1={1000} color={P.warm} n={30} size={3} />
          </Art>
        </Layer>
      </Stage>
      <ColorGrade p={P} lightAt={[20, 14]} lightStrength={0.14} />
    </>
  );
};
