import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Person} from '../../characters/Person';
import {Ridge} from '../../lib/epic';
import {Cloud, ColorGrade, Halo, MistBand, Motes} from '../../lib/fx';
import {atmos} from '../../lib/palette';
import {Stars, Water} from '../../lib/props';
import {Art, Layer, Sky, Stage, camAt} from '../../lib/stage';
import {INK, easeInOut, lerp, prog, scatter} from '../../lib/util';
import {NASSER} from './ShotsA';
import {CANAL_NIGHT, CELEBRATE} from './palettes';
import {AlexSkyline, Bourse, CanalHQ, Car, Confetti, Crowd, EgyptFlag, Mics, Palm, Qaitbay, Radio, Searchlights, Steamer} from './props';

/* ======================= اللقطة ٣ — الإسماعيلية: تسلّم مكاتب الشركة ======================= */
export const SuezShot3: React.FC = () => {
  const f = useCurrentFrame();
  const P = CANAL_NIGHT;
  const arrive = easeInOut(prog(f, 0, 90)); // السيارات تصل وتتوقف
  const walk = prog(f, 80, 200); // الفريق يمشي نحو المبنى
  const cam = camAt(f, [
    {f: 0, x: -380, y: 40, z: 0, ry: -4, rx: 1, fov: 48},
    {f: 90, x: 0, y: 0, z: 120, ry: 0, fov: 45},
    {f: 200, x: 220, y: -90, z: 260, ry: 3, rx: -2, fov: 42},
  ]);

  const team = [
    {robe: '#2e3440', outfit: 'suit' as const, hat: 'none' as const, hair: '#1a1512', tie: '#7a1e28', skin: '#d9a27a'},
    {robe: '#6b6a5a', outfit: 'uniform' as const, hat: 'officerCap' as const, hair: '#1a1512', skin: '#c98f68', trim: '#d9b13a'},
    {robe: '#3a3e4a', outfit: 'suit' as const, hat: 'none' as const, hair: '#2a2018', tie: '#1e3a5a', skin: '#e2b48c', mustache: '#2a2018'},
    {robe: '#6b6a5a', outfit: 'uniform' as const, hat: 'officerCap' as const, hair: '#1a1512', skin: '#b87d58', trim: '#d9b13a'},
  ];

  return (
    <>
      <Sky background={`linear-gradient(${P.skyTop} 0%, ${P.skyMid} 60%, ${P.horizon} 100%)`} />
      <Stage cam={cam}>
        {/* ١: سماء وقمر */}
        <Layer d={3000}>
          <Art>
            <Stars frame={f} seed="s3s" />
            <Halo id="moon3s" cx={1550} cy={170} r={480} color={P.light} opacity={0.35} core={8} />
            <circle cx={1550} cy={170} r={50} fill={P.light} />
            <Cloud id="sc3" x={700 + f * 0.3} y={280} w={1200} h={80} lit={P.rim} shade={P.skyMid} opacity={0.5} />
          </Art>
        </Layer>
        {/* ٢: كثبان سيناء البعيدة وباخرة تعبر القناة */}
        <Layer d={2300}>
          <Art>
            <Ridge id="dunes3" fn={(x) => 690 - 30 * Math.sin(x / 400) - 14 * Math.sin(x / 130)} top={atmos(P.far, P.haze, 0.35)} bottom={P.far} rim={P.rim} rimOpacity={0.35} />
            <Water id="sw3" top={715} frame={f} c1={P.water1} c2={P.water2} shine={P.rim} reflectX={1550} />
            <Steamer id="st3a" x={lerp(-300, 500, f / 200)} y={735} s={0.34} hull={atmos('#2a2a30', P.haze, 0.35)} deck={atmos('#d9d4c4', P.haze, 0.35)} win={P.warm} frame={f} smoke={P.smoke} />
          </Art>
        </Layer>
        {/* ٣: الضفة القريبة للقناة + باخرة أكبر */}
        <Layer d={1500}>
          <Art>
            <Water id="sw3b" top={780} frame={f} c1={P.water1} c2={P.water2} shine={P.rim} x0={-1400} x1={3300} />
            <Steamer id="st3b" x={lerp(2500, 1700, f / 200)} y={805} s={0.55} hull="#26262c" deck="#cfc9b8" win={P.warm} frame={f} smoke={P.smoke} />
            {scatter('palm3', 10, -1200, 3000, 0, 1).map((p, i) => (
              <Palm key={i} x={p.x} y={790} h={200 + p.r * 120} fill={atmos(P.mid, P.haze, 0.2)} frame={f} seed={i} />
            ))}
          </Art>
        </Layer>
        {/* ٤: مبنى شركة القناة */}
        <Layer d={760}>
          <Art>
            <rect x={-1400} y={870} width={4700} height={600} fill={P.mid} />
            <Halo id="hqflood" cx={1150} cy={700} r={700} color={P.warm} opacity={0.3} />
            <CanalHQ id="hq3" x={1150} y={880} s={0.62} wall={atmos('#e8e0cc', P.haze, 0.15)} shade={atmos('#b8ac90', P.haze, 0.15)} dome="#3f8f6a" win={P.warm} frame={f} />
            {[300, 2000].map((px, i) => (
              <Palm key={px} x={px} y={880} h={380} fill={P.near} frame={f} seed={i + 4} />
            ))}
            {[620, 1680].map((lx, i) => (
              <g key={lx}>
                <rect x={lx - 5} y={700} width={10} height={180} fill="#1a1a1e" stroke={INK} strokeWidth={3} />
                <Halo id={`lamp3-${i}`} cx={lx} cy={694} r={140} color={P.warm} opacity={0.6} />
                <circle cx={lx} cy={694} r={12} fill="#fff1c0" />
              </g>
            ))}
          </Art>
        </Layer>
        {/* ٥: الشارع — السيارات تصل والفريق يتقدم */}
        <Layer d={260}>
          <Art>
            <rect x={-1400} y={880} width={4700} height={700} fill={atmos(P.near, P.mid, 0.4)} />
            <path d="M -1400 880 L 3300 880" stroke={P.rim} strokeWidth={3} opacity={0.4} />
            <Car id="car3a" x={lerp(-900, 380, arrive)} y={905} s={0.95} body="#3f5a4c" frame={f * (1 - arrive)} />
            <Car id="car3b" x={lerp(-1500, -180, arrive)} y={912} s={0.9} body="#5a4a62" frame={f * (1 - arrive)} />
            <Radio id="r3" x={lerp(-900, 380, arrive) + 40} y={826} s={0.42} frame={f} glow="#ffe39a" />
            {team.map((m, i) => {
              const start = 440 + i * 150;
              const x = lerp(start, start + 700, walk);
              return (
                <Person
                  key={i}
                  x={f < 80 ? -2000 : x}
                  y={915}
                  s={0.7}
                  frame={f}
                  seed={i + 11}
                  robe={m.robe}
                  trim={m.trim ?? m.robe}
                  outfit={m.outfit}
                  hat={m.hat}
                  hair={m.hair}
                  tie={m.tie}
                  mustache={m.mustache}
                  skin={m.skin}
                  expr={i === 0 && walk > 0.5 ? 'smug' : 'neutral'}
                  pose={i === 0 ? 'point' : 'stand'}
                  look={[1, -0.2]}
                />
              );
            })}
          </Art>
        </Layer>
        {/* ٦: سعف نخيل قريب خارج التركيز */}
        <Layer d={-300} blur={9}>
          <Art>
            <Palm x={-350} y={1400} h={900} fill="#03090c" frame={f} seed={9} />
            <Motes id="m3" frame={f} x0={-600} x1={2600} y0={200} y1={1000} color={P.rim} n={26} size={3} />
          </Art>
        </Layer>
        {/* ٧: ضباب ليلي فوق القناة */}
        <Layer d={-120} opacity={0.5} blur={6}>
          <Art>
            <MistBand id="sm3" frame={f} y={1040} color={P.haze} speed={0.6} />
          </Art>
        </Layer>
      </Stage>
      <ColorGrade p={P} lightAt={[60, 55]} lightStrength={0.18} />
      <PlaceTag frame={f} text="الإسماعيلية — مقر شركة القناة" />
    </>
  );
};

const PlaceTag: React.FC<{frame: number; text: string}> = ({frame, text}) => {
  const a = prog(frame, 10, 30) * (1 - prog(frame, 120, 150));
  if (a <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        right: 80,
        top: 70,
        padding: '8px 28px 14px',
        borderRight: '6px solid #ffd27a',
        background: 'rgba(5,12,16,0.55)',
        fontFamily: 'Amiri',
        fontSize: 46,
        fontWeight: 700,
        color: '#f5ead0',
        direction: 'rtl',
        opacity: a,
        transform: `translateX(${(1 - a) * 40}px)`,
      }}
    >
      {text}
    </div>
  );
};

/* ======================= اللقطة ٤ — الإعلان والاحتفال ======================= */
export const SuezShot4: React.FC = () => {
  const f = useCurrentFrame();
  const P = CELEBRATE;
  const cam = camAt(f, [
    {f: 0, x: 0, y: -60, z: 460, rx: 0, ry: 2, fov: 40},
    {f: 70, x: 0, y: -40, z: 380, fov: 40},
    {f: 230, x: 30, y: 10, z: -260, rx: 4, ry: -2, fov: 50},
  ]);
  const cheer = 0.45 + 0.55 * prog(f, 20, 50);

  return (
    <>
      <Sky background={`linear-gradient(${P.skyTop} 0%, ${P.skyMid} 50%, ${P.horizon} 100%)`} />
      <Stage cam={cam}>
        <Layer d={3000}>
          <Art>
            <Stars frame={f} seed="s4s" alpha={0.8} />
            <Cloud id="sc4" x={1000 + f * 0.25} y={330} w={1500} h={90} lit={P.rim} shade={P.skyMid} opacity={0.6} />
            <Halo id="glow4" cx={960} cy={760} r={1100} color={P.warm} opacity={0.35} />
          </Art>
        </Layer>
        <Layer d={2400}>
          <Art>
            <Water id="sw4" top={640} frame={f} c1={P.water1} c2={P.water2} shine={P.rim} />
            <Qaitbay x={2350} y={650} s={0.55} fill={atmos(P.far, P.haze, 0.3)} rim={P.rim} />
          </Art>
        </Layer>
        <Layer d={1700}>
          <Art>
            <Searchlights id="sl4" frame={f * 1.6} bases={[-500, 100, 700, 1300, 1900, 2500]} y={700} color={P.light} opacity={0.38} />
            <AlexSkyline id="ax4" x0={-1400} x1={3300} base={700} fill={atmos(P.city, P.haze, 0.35)} win={P.warm} frame={f} />
          </Art>
        </Layer>
        {/* مبنى البورصة والخطيب يرفع قبضته */}
        <Layer d={1000}>
          <Art>
            <rect x={-1400} y={700} width={4700} height={800} fill={P.mid} />
            <Halo id="bourseFlood4" cx={960} cy={450} r={760} color={P.warm} opacity={0.5} />
            <Bourse id="b4" x={960} y={720} s={0.5} stone="#dccca8" shade="#a8977a" win={P.warm} frame={f}>
              <Person x={0} y={-262} s={0.9} frame={f} {...NASSER} expr={f < 40 ? 'speak' : 'shout'} pose={f < 40 ? 'podium' : 'fist'} />
              <Mics x={0} y={-322} s={0.75} frame={f} />
            </Bourse>
            {[300, 1620].map((px, i) => (
              <Palm key={px} x={px} y={720} h={330} fill={atmos(P.near, P.haze, 0.1)} frame={f} seed={i} />
            ))}
          </Art>
        </Layer>
        <Layer d={640}>
          <Art>
            <Crowd id="cf4" x0={-700} x1={2700} y0={735} rows={8} gap={16} s0={0.2} s1={0.3} sp={1.5} mass={atmos("#3a3448", P.haze, 0.35)} frame={f} cheer={cheer} haze={P.haze} fade={0.5} flags={0.08} />
          </Art>
        </Layer>
        <Layer d={340}>
          <Art>
            <Crowd id="cm4" x0={-600} x1={2600} y0={870} rows={5} gap={30} s0={0.36} s1={0.5} sp={1.15} mass={atmos("#2a2436", P.haze, 0.15)} frame={f} cheer={cheer} haze={P.haze} fade={0.25} flags={0.14} hats />
          </Art>
        </Layer>
        <Layer d={110}>
          <Art>
            <Crowd id="cn4" x0={-500} x1={2500} y0={1010} rows={2} gap={70} s0={0.66} s1={0.85} frame={f} cheer={cheer} haze={P.haze} fade={0.05} flags={0.18} outline hats />
          </Art>
        </Layer>
        <Layer d={-240} blur={4}>
          <Art>
            <Confetti id="cf4a" frame={f} x0={-600} x1={2500} y0={-300} n={80} fall={1400} />
          </Art>
        </Layer>
        <Layer d={-380} blur={10}>
          <Art>
            {[-300, 900, 2100].map((fx, i) => (
              <EgyptFlag key={fx} x={fx} y={1350} w={300} pole={520} frame={f} seed={i * 3} />
            ))}
          </Art>
        </Layer>
      </Stage>
      <ColorGrade p={P} lightAt={[50, 55]} lightStrength={0.24} />
      <EndTitle frame={f} />
    </>
  );
};

const EndTitle: React.FC<{frame: number}> = ({frame}) => {
  const a = prog(frame, 168, 190);
  if (a <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `rgba(8,6,18,${0.55 * a})`,
        opacity: a,
        fontFamily: 'Amiri',
        direction: 'rtl',
        color: '#fbefd2',
        textShadow: '0 0 40px rgba(255,200,120,0.55), 0 6px 30px #000',
      }}
    >
      <div style={{fontSize: 130, fontWeight: 700}}>قناة السويس</div>
      <div style={{fontSize: 64, color: '#e7cf9a'}}>شركة مساهمة مصرية — ١٩٥٦</div>
    </div>
  );
};
