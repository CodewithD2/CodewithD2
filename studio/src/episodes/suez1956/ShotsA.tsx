import React from 'react';
import {look} from '../../cast';
import {useCurrentFrame} from 'remotion';
import {Person} from '../../characters/Person';
import {Cloud, ColorGrade, Halo, Motes, MistBand} from '../../lib/fx';
import {atmos} from '../../lib/palette';
import {Stars, Water} from '../../lib/props';
import {Art, Layer, Sky, Stage, camAt} from '../../lib/stage';
import {INK, easeOutBack, prog, scatter} from '../../lib/util';
import {ALEX_DUSK, SPEECH} from './palettes';
import {AlexSkyline, Bourse, Crowd, EgyptFlag, Mics, Palm, Qaitbay, RadioWaves, Searchlights} from './props';

/** مظهر عبد الناصر الثابت في كل اللقطات */
/** مظهر عبد الناصر من مكتبة الشخصيات (src/cast) */
export const NASSER = look('nasser');

/* ======================= اللقطة ١ — الحشود في المنشية ======================= */
export const SuezShot1: React.FC = () => {
  const f = useCurrentFrame();
  const P = ALEX_DUSK;
  const cam = camAt(f, [
    {f: 0, x: -80, y: -220, z: -260, rx: 7, ry: -3, fov: 52},
    {f: 200, x: 0, y: 0, z: 120, rx: 3, ry: 0, fov: 46},
    {f: 370, x: 40, y: -40, z: 420, rx: 0, ry: 2, fov: 40},
  ]);
  const cheer = 0.3 + 0.15 * Math.sin(f / 20);

  return (
    <>
      <Sky background={`linear-gradient(${P.skyTop} 0%, ${P.skyMid} 45%, ${P.horizon} 100%)`} />
      <Stage cam={cam}>
        {/* ١: سماء الغروب */}
        <Layer d={3000}>
          <Art>
            <Stars frame={f} alpha={0.5} y1={300} />
            <Halo id="sunset1" cx={300} cy={620} r={900} color={P.horizon} opacity={0.6} core={4} />
            <Cloud id="sc1a" x={600 + f * 0.25} y={420} w={1400} h={90} lit={P.rim} shade={P.skyMid} opacity={0.8} />
            <Cloud id="sc1b" x={1900 + f * 0.2} y={300} w={1100} h={80} lit={P.rim} shade={P.skyMid} opacity={0.65} />
          </Art>
        </Layer>
        {/* ٢: البحر وقلعة قايتباي */}
        <Layer d={2400}>
          <Art>
            <Water id="sw1" top={640} frame={f} c1={P.water1} c2={P.water2} shine={P.rim} reflectX={300} reflectW={260} />
            <Qaitbay x={2350} y={650} s={0.55} fill={atmos(P.far, P.haze, 0.3)} rim={P.rim} />
          </Art>
        </Layer>
        {/* ٣: كورنيش الإسكندرية والكشافات */}
        <Layer d={1700}>
          <Art>
            <Searchlights id="sl1" frame={f} bases={[-500, 200, 900, 1600, 2400]} y={700} color={P.light} opacity={0.3} />
            <AlexSkyline id="ax1" x0={-1400} x1={3300} base={700} fill={atmos(P.city, P.haze, 0.35)} win={P.warm} frame={f} />
            <MistBand id="sm1" frame={f} y={700} color={P.haze} h={60} />
          </Art>
        </Layer>
        {/* ٤: ميدان المنشية ومبنى البورصة والخطيب على الشرفة */}
        <Layer d={1000}>
          <Art>
            <rect x={-1400} y={700} width={4700} height={800} fill={P.mid} />
            {[-900, -350, 2250, 2800].map((bx, i) => (
              <g key={i}>
                <rect x={bx} y={400 + (i % 2) * 40} width={480} height={320} fill={atmos(P.city, P.haze, 0.12)} stroke={INK} strokeWidth={4} />
                {Array.from({length: 18}, (_, k) => (
                  <rect key={k} x={bx + 30 + (k % 6) * 74} y={440 + (i % 2) * 40 + Math.floor(k / 6) * 80} width={30} height={44} fill={P.warm} opacity={0.35 + 0.4 * ((k * 7 + i) % 3 === 0 ? 1 : 0)} />
                ))}
              </g>
            ))}
            <Halo id="bourseFlood" cx={960} cy={470} r={700} color={P.warm} opacity={0.4} />
            <Bourse id="b1" x={960} y={720} s={0.5} stone={atmos('#d9c9a8', P.haze, 0.1)} shade="#a8977a" win={P.warm} frame={f}>
              <Person x={0} y={-262} s={0.9} frame={f} {...NASSER} expr="speak" pose="podium" />
              <Mics x={0} y={-322} s={0.75} frame={f} />
            </Bourse>
            {[300, 1620].map((px, i) => (
              <Palm key={px} x={px} y={720} h={330} fill={atmos(P.near, P.haze, 0.1)} frame={f} seed={i} />
            ))}
          </Art>
        </Layer>
        {/* ٥: الحشد البعيد */}
        <Layer d={640}>
          <Art>
            <Crowd id="cf1" x0={-700} x1={2700} y0={735} rows={8} gap={16} s0={0.2} s1={0.3} sp={1.5} mass={atmos("#3a3448", P.haze, 0.35)} frame={f} cheer={cheer} haze={P.haze} fade={0.5} flags={0.04} />
          </Art>
        </Layer>
        {/* ٦: الحشد المتوسط بالأعلام */}
        <Layer d={340}>
          <Art>
            <Crowd id="cm1" x0={-600} x1={2600} y0={870} rows={5} gap={30} s0={0.36} s1={0.5} sp={1.15} mass={atmos("#2a2436", P.haze, 0.15)} frame={f} cheer={cheer} haze={P.haze} fade={0.25} flags={0.08} />
          </Art>
        </Layer>
        {/* ٧: الصف الأقرب */}
        <Layer d={110}>
          <Art>
            <Crowd id="cn1" x0={-500} x1={2500} y0={1010} rows={2} gap={70} s0={0.66} s1={0.85} frame={f} cheer={cheer} haze={P.haze} fade={0.05} flags={0.12} outline />
          </Art>
        </Layer>
        {/* ٨: أعلام قريبة خارج التركيز وذرات */}
        <Layer d={-260} blur={8}>
          <Art>
            {[-200, 700, 1900].map((fx, i) => (
              <EgyptFlag key={fx} x={fx} y={1250} w={260} pole={420} frame={f} seed={i * 2} />
            ))}
            <Motes id="m1" frame={f} x0={-600} x1={2400} y0={200} y1={1000} color={P.warm} n={30} size={3} />
          </Art>
        </Layer>
      </Stage>
      <ColorGrade p={P} lightAt={[18, 62]} lightStrength={0.2} />
      <Title frame={f} />
    </>
  );
};

const Title: React.FC<{frame: number}> = ({frame}) => {
  const a = prog(frame, 14, 46) * (1 - prog(frame, 175, 210));
  if (a <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 170,
        opacity: a,
        transform: `translateY(${(1 - prog(frame, 14, 60)) * 30}px)`,
        fontFamily: 'Amiri',
        direction: 'rtl',
        color: '#fbefd2',
        textShadow: '0 0 40px rgba(255,200,120,0.5), 0 6px 30px rgba(0,0,0,0.85)',
      }}
    >
      <div style={{fontSize: 140, fontWeight: 700, lineHeight: 1.2}}>تأميم قناة السويس</div>
      <div style={{fontSize: 60, color: '#e7cf9a'}}>الإسكندرية — ٢٦ يوليو ١٩٥٦</div>
    </div>
  );
};

/* ======================= اللقطة ٢ — كلمة السر ======================= */
const CODE = 100; // لحظة نطق «فرديناند دي ليسبس»

export const SuezShot2: React.FC = () => {
  const f = useCurrentFrame();
  const P = SPEECH;
  const hit = prog(f, CODE, CODE + 10);
  const shake = f >= CODE && f < CODE + 14 ? Math.sin(f * 3.1) * 6 * (1 - prog(f, CODE, CODE + 14)) : 0;
  const cam = camAt(f, [
    {f: 0, x: 60, y: -40, z: 0, ry: 4, fov: 46},
    {f: CODE, x: 0, y: -70, z: 170, ry: 0, fov: 44},
    {f: CODE + 12, z: 300, fov: 36},
    {f: 200, x: -20, y: -80, z: 330, ry: -2, fov: 35},
  ]);
  cam.x += shake;
  cam.y += shake * 0.6;
  const spoke = f >= CODE;

  return (
    <>
      <Sky background={`linear-gradient(${P.skyTop} 0%, ${P.skyMid} 60%, ${P.horizon} 100%)`} />
      <Stage cam={cam}>
        {/* ١: أضواء المدينة كبقع ضوئية (bokeh) */}
        <Layer d={2600} blur={14}>
          <Art>
            {scatter('bokeh2', 40, -1200, 3200, 200, 900).map((b, i) => (
              <circle key={i} cx={b.x} cy={b.y} r={20 + b.r * 50} fill={i % 3 ? P.warm : '#8fb0ff'} opacity={0.18 + 0.2 * b.r} />
            ))}
          </Art>
        </Layer>
        {/* ٢: كشافات */}
        <Layer d={1600}>
          <Art>
            <Searchlights id="sl2" frame={f} bases={[-300, 500, 1400, 2200]} y={1100} color={P.light} opacity={0.22} len={1800} />
          </Art>
        </Layer>
        {/* ٣: واجهة المبنى خلف الخطيب */}
        <Layer d={800} blur={3}>
          <Art>
            <rect x={-1400} y={-800} width={4700} height={2400} fill={atmos('#8a7a62', P.haze, 0.35)} />
            {Array.from({length: 14}, (_, i) => (
              <g key={i}>
                <rect x={-1200 + i * 330} y={-800} width={90} height={2400} fill={atmos('#a8977a', P.haze, 0.3)} />
                <rect x={-1200 + i * 330 + 20} y={-800} width={16} height={2400} fill={atmos('#6a5a48', P.haze, 0.3)} />
              </g>
            ))}
            {[300, 1620].map((dx, i) => (
              <path key={i} d={`M ${dx - 110} -100 L ${dx + 110} -100 L ${dx + 104 + Math.sin(f / 12 + i) * 6} 640 L ${dx - 104 + Math.sin(f / 12 + i) * 6} 640 Z`} fill="#1f7a3a" stroke={INK} strokeWidth={5} />
            ))}
          </Art>
        </Layer>
        {/* ٤: الخطيب على المنصة */}
        <Layer d={240}>
          <Art>
            <Halo id="spot2" cx={960} cy={420} r={620} color={P.warm} opacity={0.55 + 0.25 * hit} />
            <Person
              x={960}
              y={850}
              s={1.45}
              frame={f}
              {...NASSER}
              expr={spoke && f < CODE + 50 ? 'shout' : 'speak'}
              pose={spoke && f < CODE + 50 ? 'fist' : 'podium'}
              look={[0, 0]}
              jolt={Math.sin(prog(f, CODE, CODE + 10) * Math.PI) * 0.5}
            />
            <Mics x={960} y={725} s={1.3} frame={f} />
            {spoke && <RadioWaves id="rw2" x={960} y={620} frame={f - CODE} color="#fff0c0" s={1.6} n={5} max={520} />}
            {/* درابزين الشرفة أمام الخطيب */}
            <g stroke={INK} strokeWidth={5}>
              <rect x={300} y={700} width={1320} height={26} fill="#d9c9a8" />
              {Array.from({length: 22}, (_, i) => (
                <rect key={i} x={318 + i * 60} y={726} width={26} height={110} rx={10} fill="#cbbb98" />
              ))}
              <rect x={280} y={832} width={1360} height={30} fill="#d9c9a8" />
              <rect x={280} y={860} width={1360} height={400} fill="#bfae8c" />
            </g>
          </Art>
        </Layer>
        {/* ٥: رؤوس وأيادي الحشد في المقدمة */}
        <Layer d={-220} blur={7}>
          <Art>
            <Crowd id="cfg2" x0={-300} x1={2300} y0={1230} rows={1} gap={0} s0={1.4} s1={1.4} frame={f} cheer={spoke ? 0.9 : 0.3} haze={P.haze} fade={0} flags={0.1} />
          </Art>
        </Layer>
      </Stage>
      <ColorGrade p={P} lightAt={[50, 40]} lightStrength={0.2 + 0.2 * hit} />
      <CodeWord frame={f} />
    </>
  );
};

/** كلمة السر تظهر على الشاشة لحظة نطقها */
const CodeWord: React.FC<{frame: number}> = ({frame}) => {
  if (frame < CODE + 2) return null;
  const a = easeOutBack(prog(frame, CODE + 2, CODE + 16));
  const fadeOut = 1 - prog(frame, CODE + 80, CODE + 96);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 120,
        textAlign: 'center',
        fontFamily: 'Amiri',
        fontWeight: 700,
        direction: 'rtl',
        opacity: Math.min(1, a) * fadeOut,
        transform: `scale(${0.6 + 0.4 * a})`,
      }}
    >
      <div style={{fontSize: 44, color: '#ffe2a8', letterSpacing: 2, textShadow: '0 4px 18px #000'}}>كلمة السرّ</div>
      <div
        style={{
          fontSize: 120,
          color: '#fff6dc',
          textShadow: '0 0 30px rgba(255,190,90,0.9), 0 0 80px rgba(255,150,60,0.6), 0 8px 30px #000',
        }}
      >
        «فرديناند دي ليسبس»
      </div>
    </div>
  );
};
