import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Person} from '../characters/Person';
import {Moon, SeaWall, Skyline, Stars, Water} from '../lib/props';
import {Art, Layer, Sky, Stage, camAt} from '../lib/stage';
import {INK, prog, ridgePath} from '../lib/util';
import {Fog} from './common';

/** اللقطة ١ — ليل القسطنطينية والسلسلة الحديدية (٨ طبقات) */
export const Shot1Night: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f, [
    {f: 0, x: -260, y: -60, z: -260, ry: -4, rx: 2, fov: 52},
    {f: 150, x: 0, y: -20, z: 60, ry: 0, rx: 0, fov: 46},
    {f: 310, x: 330, y: 40, z: 420, ry: 5, rx: -2, fov: 40},
  ]);
  // يتحول الجندي إلى الابتسامة المتعالية عند ذكر السلسلة
  const smug = f > 170;

  return (
    <>
      {/* ١: السماء */}
      <Sky background="linear-gradient(#050914 0%, #101d3d 55%, #2a3a68 100%)" />
      <Stage cam={cam}>
        {/* ٢: النجوم والقمر */}
        <Layer d={2600}>
          <Art>
            <Stars frame={f} />
            <Moon cx={1480} cy={170} />
          </Art>
        </Layer>
        {/* ٣: تلال بعيدة */}
        <Layer d={1700}>
          <Art>
            <path d={ridgePath((x) => 690 - 50 * Math.sin(x / 260) - 26 * Math.sin(x / 90), -1400, 3300, 1600)} fill="#1b2650" />
          </Art>
        </Layer>
        {/* ٤: أفق المدينة */}
        <Layer d={950}>
          <Art>
            <Skyline x={180} base={770} s={1.05} fill="#0f1733" windows="#ffc96b" frame={f} />
          </Art>
        </Layer>
        {/* ٥: الماء */}
        <Layer d={520}>
          <Art>
            <Water id="s1" top={760} frame={f} c1="#16244a" c2="#050912" shine="#b8c8ff" reflectX={1480} />
          </Art>
        </Layer>
        {/* ٦: السور القريب والجندي البيزنطي */}
        <Layer d={160}>
          <Art>
            <SeaWall x={1280} top={640} w={1500} stone="#4f5068" dark="#3d3d55" />
            <rect x={1250} y={520} width={170} height={600} fill="#4f5068" stroke={INK} strokeWidth={5} />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={1250 + i * 46} y={490} width={30} height={34} fill="#4f5068" stroke={INK} strokeWidth={5} />
            ))}
            <Person
              x={1610}
              y={606}
              s={0.95}
              frame={f}
              seed={1}
              robe="#7a2430"
              trim="#d9b13a"
              hat="byzHelmet"
              expr={smug ? 'smug' : 'neutral'}
              pose={smug ? 'cross' : 'stand'}
              flip
              look={[-1, 0]}
              skin="#e8b994"
            />
          </Art>
        </Layer>
        {/* ٧: السلسلة على عوامات خشبية في المقدمة */}
        <Layer d={-60}>
          <Art>
            <Chain frame={f} />
          </Art>
        </Layer>
        {/* ٨: ضباب أمامي */}
        <Layer d={-260} blur={10} opacity={0.5}>
          <Fog frame={f} y={880} color="#9fb2e6" />
        </Layer>
      </Stage>
      <Title frame={f} />
    </>
  );
};

const Chain: React.FC<{frame: number}> = ({frame}) => {
  const n = 30;
  const pts = Array.from({length: n}, (_, i) => {
    const t = i / (n - 1);
    const x = -900 + t * 2200;
    const y = 815 + Math.sin(t * Math.PI) * 45 + Math.sin(frame / 14 + i * 0.7) * 7;
    return {x, y};
  });
  return (
    <g stroke={INK} strokeWidth={5}>
      {pts.map((p, i) => (
        <g key={i}>
          <ellipse cx={p.x} cy={p.y + 16} rx={34} ry={13} fill="#6b4524" />
          <ellipse cx={p.x} cy={p.y + 12} rx={34} ry={7} fill="#86592f" strokeWidth={3} />
        </g>
      ))}
      {pts.slice(0, -1).map((p, i) => {
        const q = pts[i + 1];
        return Array.from({length: 4}, (_, k) => {
          const t = (k + 0.5) / 4;
          const cx = p.x + (q.x - p.x) * t;
          const cy = p.y + (q.y - p.y) * t - 4;
          return (
            <ellipse
              key={`${i}-${k}`}
              cx={cx}
              cy={cy}
              rx={k % 2 ? 16 : 10}
              ry={k % 2 ? 7 : 10}
              fill="none"
              stroke="#9aa4b4"
              strokeWidth={7}
            />
          );
        });
      })}
    </g>
  );
};

const Title: React.FC<{frame: number}> = ({frame}) => {
  const a = prog(frame, 12, 45) * (1 - prog(frame, 150, 185));
  if (a <= 0) return null;
  const y = (1 - prog(frame, 12, 60)) * 30;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 230,
        opacity: a,
        transform: `translateY(${y}px)`,
        fontFamily: 'Amiri',
        direction: 'rtl',
        color: '#f4e7c6',
        textShadow: '0 6px 30px rgba(0,0,0,0.8)',
      }}
    >
      <div style={{fontSize: 160, fontWeight: 700, lineHeight: 1.2}}>القسطنطينية</div>
      <div style={{fontSize: 62, color: '#cdb98c'}}>ربيع ١٤٥٣م</div>
    </div>
  );
};
