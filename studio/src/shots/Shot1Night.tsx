import React from 'react';
import {roleBase} from '../cast';
import {useCurrentFrame} from 'remotion';
import {Person} from '../characters/Person';
import {Battlement, Banner, CityEpic, Ridge, TorchFX, Walkway} from '../lib/epic';
import {Bloom, Cloud, ColorGrade, Halo, MistBand, Motes} from '../lib/fx';
import {NIGHT_CITY as P, atmos} from '../lib/palette';
import {Stars, Water} from '../lib/props';
import {Art, Layer, Sky, Stage, camAt} from '../lib/stage';
import {INK, prog} from '../lib/util';

/** اللقطة ١ — ليل القسطنطينية والسلسلة الحديدية */
export const Shot1Night: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f, [
    {f: 0, x: -300, y: -80, z: -300, ry: -4, rx: 2, fov: 52},
    {f: 150, x: -20, y: -30, z: 40, ry: 0, rx: 0, fov: 46},
    {f: 310, x: 380, y: 30, z: 420, ry: 5, rx: -2, fov: 40},
  ]);
  const smug = f > 170;

  return (
    <>
      <Sky background={`linear-gradient(${P.skyTop} 0%, ${P.skyMid} 50%, ${P.horizon} 100%)`} />
      <Stage cam={cam}>
        {/* ١: القمر والنجوم والسحب البعيدة */}
        <Layer d={3000}>
          <Art>
            <Stars frame={f} n={260} />
            <Halo id="moon1" cx={1480} cy={170} r={520} color="#c8d4ff" opacity={0.55} core={8} />
            <circle cx={1480} cy={170} r={64} fill={P.light} />
            <circle cx={1460} cy={158} r={12} fill="#d8dcec" />
            <circle cx={1500} cy={190} r={8} fill="#d8dcec" />
            <Cloud id="c1a" x={900 + f * 0.25} y={260} w={900} h={90} lit={atmos(P.rim, P.light, 0.3)} shade={P.skyMid} opacity={0.75} />
            <Cloud id="c1b" x={2100 + f * 0.2} y={330} w={1100} h={110} lit={P.rim} shade={P.skyMid} opacity={0.6} />
            <Cloud id="c1c" x={-200 + f * 0.3} y={200} w={800} h={70} lit={P.rim} shade={P.skyMid} opacity={0.5} />
          </Art>
        </Layer>
        {/* ٢: تلال الضفة الآسيوية البعيدة */}
        <Layer d={2200}>
          <Art>
            <Ridge id="s1far" fn={(x) => 690 - 60 * Math.sin(x / 300) - 24 * Math.sin(x / 95)} top={atmos(P.far, P.haze, 0.35)} bottom={P.far} rim={P.rim} rimOpacity={0.35} />
          </Art>
        </Layer>
        {/* ٣: المدينة الملحمية */}
        <Layer d={1450}>
          <Art>
            <CityEpic
              id="c1"
              x={-260}
              base={772}
              s={0.95}
              fill={atmos(P.city, P.haze, 0.06)}
              back={atmos(P.city, P.haze, 0.3)}
              rim={P.rim}
              win={P.warm}
              frame={f}
              smoke={P.smoke}
            />
            <MistBand id="s1city" frame={f} y={760} color={P.haze} speed={0.4} h={90} />
          </Art>
        </Layer>
        {/* ٤: الماء وانعكاس القمر */}
        <Layer d={1000}>
          <Art>
            <Water id="s1" top={768} frame={f} c1={P.water1} c2={P.water2} shine={P.rim} reflectX={1480} reflectW={150} />
          </Art>
        </Layer>
        {/* ٥: السلسلة على عوامات وقوارب حراسة بفوانيس */}
        <Layer d={620}>
          <Art>
            <Chain frame={f} />
            <Bloom id="lanterns" x={-1000} y={600} w={3200} h={400} radius={14}>
              {[-500, 380, 1180].map((lx, i) => (
                <g key={i}>
                  <path d={`M ${lx - 70} ${862 + Math.sin(f / 15 + i) * 5} q 70 30 140 0 l -20 22 h -100 Z`} fill="#3a2a1e" stroke={INK} strokeWidth={4} />
                  <circle cx={lx} cy={840 + Math.sin(f / 15 + i) * 5} r={8} fill={P.warm} />
                </g>
              ))}
            </Bloom>
          </Art>
        </Layer>
        {/* ٦: السور القريب — الجندي خلف الشرفات */}
        <Layer d={200}>
          <Art>
            <rect x={1230} y={480} width={180} height={700} fill="#4a4b66" stroke={INK} strokeWidth={5} />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={1230 + i * 48} y={446} width={32} height={38} fill="#4a4b66" stroke={INK} strokeWidth={5} />
            ))}
            <Walkway x={1410} top={660} w={1500} fill="#2b2c40" />
            <Banner x={1470} y={660} h={300} color="#7d1f3a" frame={f} seed={1} />
            <Person
              x={1660}
              y={712}
              s={0.95}
              frame={f}
              seed={1}
              {...roleBase('byzGuard')}
              expr={smug ? 'smug' : 'neutral'}
              pose={smug ? 'cross' : 'stand'}
              flip
              look={[-1, 0]}
              skin="#e8b994"
            />
            <Battlement x={1410} top={668} w={1500} stone="#56576f" mortar="#44455c" rim={P.rim} />
            <TorchFX id="t1" x={1320} y={446} frame={f} warm={P.warm} smoke={P.smoke} />
          </Art>
        </Layer>
        {/* ٧: ذرات وضباب أمامي */}
        <Layer d={-260} blur={5} opacity={0.8}>
          <Art>
            <Motes id="s1" frame={f} x0={-600} x1={2400} y0={100} y1={1000} color={P.rim} n={36} size={3} />
            <MistBand id="s1fg" frame={f} y={1000} color={P.haze} speed={0.8} />
          </Art>
        </Layer>
      </Stage>
      <ColorGrade p={P} lightAt={[77, 16]} lightStrength={0.16} />
      <Title frame={f} />
    </>
  );
};

const Chain: React.FC<{frame: number}> = ({frame}) => {
  const n = 34;
  const pts = Array.from({length: n}, (_, i) => {
    const t = i / (n - 1);
    return {x: -1000 + t * 3100, y: 815 + Math.sin(t * Math.PI) * 30 + Math.sin(frame / 14 + i * 0.7) * 5};
  });
  return (
    <g stroke={INK} strokeWidth={4}>
      {pts.map((p, i) => (
        <g key={i}>
          <ellipse cx={p.x} cy={p.y + 12} rx={30} ry={11} fill="#5a3a22" />
          <ellipse cx={p.x} cy={p.y + 8} rx={30} ry={6} fill="#7a5230" strokeWidth={2.5} />
        </g>
      ))}
      {pts.slice(0, -1).map((p, i) => {
        const q = pts[i + 1];
        return Array.from({length: 5}, (_, k) => {
          const t = (k + 0.5) / 5;
          return (
            <ellipse
              key={`${i}-${k}`}
              cx={p.x + (q.x - p.x) * t}
              cy={p.y + (q.y - p.y) * t - 3}
              rx={k % 2 ? 12 : 8}
              ry={k % 2 ? 5 : 8}
              fill="none"
              stroke="#8f9ab0"
              strokeWidth={5}
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
        paddingTop: 200,
        opacity: a,
        transform: `translateY(${y}px)`,
        fontFamily: 'Amiri',
        direction: 'rtl',
        color: '#f4e7c6',
        textShadow: '0 0 40px rgba(255,210,140,0.45), 0 6px 30px rgba(0,0,0,0.85)',
      }}
    >
      <div style={{fontSize: 160, fontWeight: 700, lineHeight: 1.2}}>القسطنطينية</div>
      <div style={{fontSize: 62, color: '#cdb98c'}}>ربيع ١٤٥٣م</div>
    </div>
  );
};
