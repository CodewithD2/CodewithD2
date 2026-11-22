import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Person} from '../characters/Person';
import {Moon, Ship, Stars, Torch} from '../lib/props';
import {Art, Layer, Sky, Stage, camAt} from '../lib/stage';
import {INK, lerp, prog, ridgePath, scatter} from '../lib/util';

const hill = (x: number) => 900 - 330 * Math.exp(-(((x - 1300) / 680) ** 2));
const slopeDeg = (x: number) => (Math.atan((hill(x + 2) - hill(x - 2)) / 4) * 180) / Math.PI;

/** اللقطة ٣ — جرّ السفن فوق التل ليلاً (٧ طبقات، تتبّع جانبي) */
export const Shot3Haul: React.FC = () => {
  const f = useCurrentFrame();
  const shipX = lerp(150, 1080, prog(f, 0, 240));
  const cam = camAt(f, [
    {f: 0, x: shipX - 820, y: 40, z: 0, ry: 3, rz: 0, fov: 50},
    {f: 120, y: -40, z: 120, ry: 0, rz: -1, fov: 46},
    {f: 240, y: -10, z: 60, ry: -3, rz: 0, fov: 48},
  ]);
  cam.x = shipX - 820 + Math.sin(f / 30) * 10; // الكاميرا تلحق بالسفينة

  const workers = [0, 1, 2, 3, 4, 5].map((i) => shipX + 330 + i * 92);
  const ship2X = shipX - 720;

  return (
    <>
      <Sky background="linear-gradient(#04060f 0%, #0f1834 65%, #2b2a4a 100%)" />
      <Stage cam={cam}>
        {/* ٢: نجوم وقمر */}
        <Layer d={2600}>
          <Art>
            <Stars frame={f} seed="s3" />
            <Moon cx={300} cy={150} r={50} />
          </Art>
        </Layer>
        {/* ٣: تلال بعيدة */}
        <Layer d={1600}>
          <Art>
            <path d={ridgePath((x) => 700 - 90 * Math.sin(x / 340) - 30 * Math.sin(x / 110), -1400, 3300, 1600)} fill="#1a2245" />
          </Art>
        </Layer>
        {/* ٤: تلال متوسطة وموكب مشاعل بعيد */}
        <Layer d={780}>
          <Art>
            <path d={ridgePath((x) => 800 - 120 * Math.exp(-(((x - 300) / 500) ** 2)) - 40 * Math.sin(x / 170), -1400, 3300, 1600)} fill="#121832" />
            {Array.from({length: 22}, (_, i) => {
              const x = -900 + i * 110 + ((f * 1.2) % 110);
              const y = 800 - 120 * Math.exp(-(((x - 300) / 500) ** 2)) - 40 * Math.sin(x / 170) - 18;
              return <circle key={i} cx={x} cy={y} r={5} fill="#ffb24d" opacity={0.6 + 0.4 * Math.sin(f / 3 + i)} />;
            })}
          </Art>
        </Layer>
        {/* ٥: التل الرئيسي — الألواح والسفن والعمّال */}
        <Layer d={0}>
          <Art>
            <path d={ridgePath(hill, -1400, 3300, 2000, 10)} fill="#191a2b" stroke={INK} strokeWidth={6} />
            {/* ألواح خشبية مدهونة بالزيت */}
            {Array.from({length: 120}, (_, i) => {
              const x = -1300 + i * 40;
              return (
                <g key={i} transform={`translate(${x} ${hill(x)}) rotate(${slopeDeg(x)})`}>
                  <rect x={-16} y={-7} width={32} height={12} rx={3} fill="#8a5a2b" stroke={INK} strokeWidth={3} />
                  <rect x={-12} y={-6} width={16} height={3} fill="#ffd58a" opacity={0.5 + 0.5 * Math.sin(f / 6 + i)} />
                </g>
              );
            })}
            {[-700, -380, 120, 620, 1300, 1900, 2450].map((x, i) => (
              <Torch key={x} x={x} y={hill(x) + 4} frame={f} id={`t3-${i}`} />
            ))}
            <Ship x={ship2X} y={hill(ship2X) - 26} rot={slopeDeg(ship2X)} s={0.9} frame={f} hull="#6d3f20" />
            <Ship x={shipX} y={hill(shipX) - 26} rot={slopeDeg(shipX)} frame={f} />
            {/* الحبل من مقدمة السفينة إلى العمّال */}
            <path
              d={`M ${shipX + 200} ${hill(shipX) - 90} Q ${(shipX + workers[5]) / 2} ${hill((shipX + workers[5]) / 2) - 70} ${workers[5] - 90} ${hill(workers[5]) - 116}`}
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
                robe={['#d98b2b', '#6b8f3a', '#b85a2e', '#3f7fa8', '#9a6b3c', '#c9502f'][i]}
                trim="#4a2e18"
                hat="cap"
                skin={i % 2 ? '#d9a27a' : '#efc29b'}
                expr="strain"
                pose="pull"
              />
            ))}
            {/* ضابط إنكشاري يحفّز العمّال */}
            <Person
              x={workers[5] + 170}
              y={hill(workers[5] + 170)}
              s={0.7}
              frame={f}
              seed={9}
              flip
              robe="#2c5f8a"
              trim="#c0262d"
              hat="bork"
              beard="#2a1a10"
              expr={Math.floor(f / 24) % 2 ? 'idea' : 'happy'}
              pose="point"
              look={[1, 0]}
            />
          </Art>
        </Layer>
        {/* ٦: صخور وأعشاب أمامية */}
        <Layer d={-220}>
          <Art>
            {scatter('rocks3', 14, -1200, 3000, 1060, 1110).map((r, i) => (
              <ellipse key={i} cx={r.x} cy={r.y} rx={90 + r.r * 120} ry={40 + r.r * 50} fill="#07070d" stroke={INK} strokeWidth={5} />
            ))}
          </Art>
        </Layer>
        {/* ٧: مشعل قريب جداً خارج التركيز */}
        <Layer d={-480} blur={12}>
          <Art>
            <Torch x={1500} y={1250} frame={f} s={2.2} id="t3-fg" />
            <Torch x={-300} y={1300} frame={f} s={2.4} id="t3-fg2" />
          </Art>
        </Layer>
      </Stage>
    </>
  );
};
