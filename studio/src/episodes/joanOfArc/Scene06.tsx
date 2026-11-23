import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {extra, look} from '../../cast';
import type {CharLight} from '../../characters/light';
import {Person} from '../../characters/Person';
import {TitleBanner} from '../../lib/comicFx';
import {Banner, Ridge} from '../../lib/epic';
import {Cloud, ColorGrade, Halo, MistBand, Motes, Smoke} from '../../lib/fx';
import {Palette, atmos} from '../../lib/palette';
import {Ship, Tent} from '../../lib/props';
import {Art, Layer, Sky, camAt} from '../../lib/stage';
import {INK, clamp, easeOut, easeOutBack, lerp, prog, scatter} from '../../lib/util';
import {RoundTree} from '../../world/buildings';
import {MapAttackArrow} from '../../world/maps/MapEngine';
import type {LonLat} from '../../world/maps/europeData';
import {CITIES_1429, ENGLISH_NORTH_1429, HENRY5_INVASION_ROUTE} from '../../world/maps/france1429';
import {GamePiece} from './MapPieces';
import {CityStandee, MapFlat, MapTable, Standee} from './MapTable';
import {GoldFrame, Rain, StoneChamber} from './sets';
import {CLEAR_DAY, FarArmy, Floor3D, Hud, LIGHTS, LitStage, Masonry, SoftFilm, WAR_TABLE, gy} from './stage3d';
import {FPS, SceneTrackAudio, SceneTrackSubtitles, buildTrack} from './audioHelper';

/* =====================================================================
 * المشهد ٦ — غزو هنري الخامس + معركة أجينكورت ١٤١٥ + خيانة دوق بورغوندي
 * ===================================================================== */

export const SCENE06_TRACK = buildTrack(
  [
    {kind: 'pause', sec: 0.25},
    {kind: 'clip', id: 's06_nar_1', padAfter: 0.25},
    {kind: 'clip', id: 's06_nar_2', padAfter: 0.25},
    {kind: 'clip', id: 's06_nar_3', padAfter: 0.2},
  ],
  0.55,
);

/** سهم إنجليزي يطير في قوس عالٍ فوق ساحة أجينكورت */
const FlyingArrow: React.FC<{u: number; yOff: number; scale?: number}> = ({u, yOff, scale = 1}) => {
  const p = ((u % 1) + 1) % 1;
  const x = lerp(420, 1520, p);
  const y = 620 + yOff - Math.sin(p * Math.PI) * 340;
  const dy = -Math.cos(p * Math.PI) * 340 * Math.PI;
  const dx = 1100;
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${scale})`} stroke={INK} strokeWidth={3}>
      <line x1={-34} y1={0} x2={24} y2={0} stroke="#3c2a1a" strokeWidth={4.5} />
      <polygon points="24,-5 38,0 24,5" fill="#dce4f0" />
      <path d="M -34 0 L -44 -7 M -34 0 L -44 7" stroke="#f6f2e8" strokeWidth={3} />
    </g>
  );
};

const MAP_CENTER: LonLat = [1.0, 49.9];
const MAP_ZOOM = 1.0;
const MAP_COLORS = {FRA: '#2b5eb8', GBR: '#c8242e'};

export const Scene06: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;

  const c1 = SCENE06_TRACK.byId.s06_nar_1;
  const c2 = SCENE06_TRACK.byId.s06_nar_2;
  const c3 = SCENE06_TRACK.byId.s06_nar_3;

  const AGINCOURT_T = c1.t0 + 4.8;
  const BETRAYAL_T = c2.t0 - 0.12;
  const SWITCH_T = c2.t0 + 2.4;
  const DAUPHIN_T = c3.t0 - 0.12;
  const DEFLATE_T = c3.t0 + 4.05;

  const sfx = [
    {at: 0.35, name: 'trumpet', vol: 0.58, dur: 1.3},
    {at: AGINCOURT_T, name: 'whoosh', vol: 0.7, dur: 0.5},
    {at: AGINCOURT_T + 1.2, name: 'whoosh', vol: 0.55, dur: 0.45},
    {at: AGINCOURT_T + 2.4, name: 'clang', vol: 0.55, dur: 1.0},
    {at: AGINCOURT_T + 4.2, name: 'whoosh', vol: 0.55, dur: 0.45},
    {at: SWITCH_T, name: 'whoosh', vol: 0.72, dur: 0.45},
    {at: SWITCH_T + 0.35, name: 'pop', vol: 0.75, dur: 0.3},
    {at: DAUPHIN_T + 0.1, name: 'boom', vol: 0.65, dur: 1.4},
    {at: DEFLATE_T, name: 'scratch', vol: 0.75, dur: 0.45},
  ];

  let view: React.ReactNode;
  if (t < AGINCOURT_T) view = <InvasionMap f={f} t={t} endT={AGINCOURT_T} />;
  else if (t < BETRAYAL_T) view = <Agincourt f={f} lt={t - AGINCOURT_T} dur={BETRAYAL_T - AGINCOURT_T} />;
  else if (t < DAUPHIN_T) view = <Betrayal f={f} t={t} t0={BETRAYAL_T} switchT={SWITCH_T} endT={DAUPHIN_T} />;
  else view = <DauphinRage f={f} t={t} t0={DAUPHIN_T} deflateT={DEFLATE_T} />;

  return (
    <AbsoluteFill style={{background: '#0d0b12'}}>
      {view}
      <SceneTrackAudio track={SCENE06_TRACK} sfx={sfx} />
      <SceneTrackSubtitles track={SCENE06_TRACK} hideDialogue />
    </AbsoluteFill>
  );
};

/* ================= المرحلة 1: سهم أحمر ضخم يعبر من إنجلترا إلى شمال فرنسا ================= */
const InvasionMap: React.FC<{f: number; t: number; endT: number}> = ({f, t, endT}) => {
  const arrP = easeOut(prog(t, 0.4, 3.0));
  const batPop = easeOutBack(prog(t, 2.5, 3.1));
  const F = (s: number) => Math.round(s * FPS);
  const cam = camAt(f, [
    {f: 0, x: -90, y: -190, z: -120, rx: 6, ry: -5, fov: 47},
    {f: F(1.2), x: -30, y: -120, z: 60, rx: 2, ry: -2, fov: 45},
    {f: F(2.9), x: 30, y: -40, z: 130, ry: 2},
    {f: F(endT), x: 50, y: -90, z: 210, rx: 0, ry: 5},
  ]);
  return (
    <>
      <MapTable
        id="s06"
        cam={cam}
        frame={f}
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        colors={MAP_COLORS}
        territories={[{id: 'eng-1415', clipTo: 'FRA', polygon: ENGLISH_NORTH_1429, fill: '#c8242e', opacity: 0.62 * arrP}]}
        pieces={({xy}) => (
          <>
            <CityStandee at={xy(CITIES_1429.london.pos)} label="لندن" color="#c8242e" frame={f} big h={56} />
            <CityStandee at={xy(CITIES_1429.paris.pos)} label="باريس" color="#2452a4" frame={f} big h={60} />
            {/* أسطول هنري يعبر القناة مع السهم */}
            {[0, 1, 2].map((i) => {
              const u = clamp(arrP * 1.5 - i * 0.16);
              const [ax, ay] = xy([-1.1, 50.45]);
              const [bx, by] = xy([0.1, 49.75]);
              return u > 0.02 ? (
                <Standee key={i} at={[lerp(ax, bx, u) - i * 60, lerp(ay, by, u) - i * 18]} z={8} scale={1 - 0.25 * u}>
                  <Ship x={0} y={-6 + Math.sin(f * 0.2 + i * 2) * 4} s={0.5} frame={f + i * 11} hull="#7c4e26" sail="#fbf8ef" />
                </Standee>
              ) : null;
            })}
            {/* هنري قائد الغزو على قطعة لعب */}
            <Standee at={xy([-2.7, 51.9])} up={easeOutBack(prog(t, 0.15, 0.6))}>
              <GamePiece label="هنري الخامس" color="#8a1620" w={250} fs={35}>
                <Person x={0} y={0} s={0.9} frame={f} {...look('henry5')} expr="shout" pose="raise" holdR="longsword" shading="cel" />
              </GamePiece>
            </Standee>
            {batPop > 0.02 && (
              <>
                <Standee at={xy(CITIES_1429.agincourt.pos)} z={40}>
                  <g transform={`translate(0 -20) scale(${batPop})`}>
                    <Halo id="s06bh" cx={0} cy={-10} r={150} color="#ffb060" opacity={0.6} />
                    <ClashIcon f={f} />
                  </g>
                </Standee>
                <CityStandee at={xy(CITIES_1429.agincourt.pos)} label="أجينكورت — ١٤١٥" color="#c8242e" frame={f} big h={120} />
              </>
            )}
          </>
        )}
      >
        {({proj}) => (
          <MapFlat>
            <g transform="translate(8 13)" opacity={0.3}>
              <MapAttackArrow proj={proj} points={HENRY5_INVASION_ROUTE} progress={arrP} color="#000000" width={24} />
            </g>
            <MapAttackArrow proj={proj} points={HENRY5_INVASION_ROUTE} progress={arrP} color="#ff3b2e" width={24} />
          </MapFlat>
        )}
      </MapTable>
      <ColorGrade p={WAR_TABLE} lightAt={[12, 78]} lightStrength={0.22 + 0.02 * Math.sin(f * 0.6)} />
      <SoftFilm frame={f} />
      <Hud>
        <TitleBanner y={88} title="هنري الخامس — ١٤١٥" accent="#c8242e" scale={easeOutBack(prog(t, 0.1, 0.5))} />
      </Hud>
    </>
  );
};

/** سيفان متقاطعان وسط سحابة غبار */
const ClashIcon: React.FC<{f: number}> = ({f}) => {
  const p = Math.sin(f / 4) * 6;
  return (
    <g stroke={INK} strokeWidth={5} strokeLinejoin="round">
      <g fill="#f2ead8">
        <circle cx={-40 - p * 0.4} cy={14} r={32} />
        <circle cx={40 + p * 0.4} cy={16} r={30} />
        <circle cx={0} cy={-22 - p * 0.4} r={36} />
        <circle cx={0} cy={22} r={32} stroke="none" />
      </g>
      {[42, -42].map((a) => (
        <g key={a} transform={`rotate(${a + Math.sin(f / 3) * 5})`}>
          <path d="M -7 -66 L 0 -86 L 7 -66 L 7 38 L -7 38 Z" fill="#dce3ee" />
          <rect x={-24} y={24} width={48} height={10} rx={3} fill="#e8b830" />
        </g>
      ))}
    </g>
  );
};

/* ================= المرحلة 2: أجينكورت — الفرسان يغرقون في الوحل ================= */
const Agincourt: React.FC<{f: number; lt: number; dur: number}> = ({f, lt, dur}) => {
  const P = MUD;
  const sinkP = easeOut(prog(lt, 0.3, 4.2));
  const lf = lt * FPS;
  const D = dur * FPS;
  const cam = camAt(lf, [
    {f: 0, x: -190, y: -30, z: -120, ry: -8, fov: 50},
    {f: 40, x: -110, y: 0, z: 40, ry: -5, fov: 46},
    {f: D * 0.5, x: 130, y: 10, z: 110, ry: 3},
    {f: D, x: 190, y: 20, z: 230, ry: 6},
  ]);
  cam.y += 60;
  cam.x += Math.sin(f * 0.6) * 2;
  const KD = 170;
  const yK = gy(KD);

  return (
    <>
      <Sky background={`linear-gradient(${P.skyTop} 0%, ${P.skyMid} 46%, ${P.horizon} 78%)`} />
      <LitStage cam={cam} light={MUD_LIGHT}>
        <Layer d={2800}>
          <Art>
            <Halo id="s06gl" cx={1300} cy={560} r={800} color="#d8d4c4" opacity={0.5} />
            {[0, 1, 2, 3].map((i) => (
              <Cloud key={i} id={`s06c${i}`} x={-300 + i * 780 + lf * (0.6 + i * 0.15)} y={170 + (i % 2) * 110} w={1250} h={125} lit="#8c96a4" shade="#3e4854" opacity={0.92} />
            ))}
          </Art>
        </Layer>
        {/* غابتان على جانبي الميدان (أجينكورت وترامكورت) */}
        <Layer d={1900}>
          <Art>
            <Ridge id="s06r" fn={(x) => 690 - 18 * Math.sin(x / 300)} top={atmos(P.far, P.haze, 0.4)} bottom={P.mid} rim={P.rim} rimOpacity={0.3} />
            {scatter('s06w', 90, -1300, 3200, 640, 700)
              .filter((p) => p.x < 620 || p.x > 1300)
              .map((p, i) => (
                <g key={i} fill={atmos('#3a4a40', P.haze, 0.35 - p.r * 0.2)}>
                  <ellipse cx={p.x} cy={p.y - 40} rx={34 + p.r * 26} ry={52 + p.r * 40} />
                </g>
              ))}
            <MistBand id="s06m1" frame={f} y={700} color={P.haze} h={70} speed={0.8} />
          </Art>
        </Layer>
        {/* الجيشان البعيدان */}
        <Layer d={1250}>
          <Art>
            <path d="M -1400 770 Q 400 742 960 764 Q 1600 748 3300 766 L 3300 1900 L -1400 1900 Z" fill={atmos('#6a5a42', P.haze, 0.2)} />
            <FarArmy id="s06ae" y={() => 752} n={48} x0={-900} x1={520} frame={f} c={atmos('#7a2a2e', P.haze, 0.25)} rim={P.rim} h={78} flag="#e8e0d4" />
            <FarArmy id="s06af" y={() => 752} n={76} x0={1080} x1={2800} frame={f + 9} c={atmos('#34507c', P.haze, 0.25)} rim={P.rim} h={78} march={-lt * 26} flag="#2c58b4" />
            <MistBand id="s06m2" frame={f + 50} y={790} color={P.haze} h={60} speed={1.2} />
          </Art>
        </Layer>
      </LitStage>
      <LitStage cam={cam} light={MUD_LIGHT}>
        <Floor3D d0={-470} d1={1250}>
          {(len) => (
            <g>
              <defs>
                <linearGradient id="s06mud" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#7c6a4e" />
                  <stop offset="100%" stopColor="#3c2a18" />
                </linearGradient>
              </defs>
              <rect x={-2200} y={0} width={6320} height={len} fill="url(#s06mud)" />
              {scatter('s06pu', 60, -2200, 4100, 60, len).map((p, i) => (
                <g key={i}>
                  <ellipse cx={p.x} cy={p.y} rx={90 + p.r * 170} ry={26 + p.r * 44} fill={i % 3 ? '#4a3520' : '#5e482e'} opacity={0.7} />
                  {i % 2 === 0 && <ellipse cx={p.x} cy={p.y} rx={60 + p.r * 110} ry={16 + p.r * 26} fill="#8c98a4" opacity={0.5} />}
                </g>
              ))}
              {/* حُفر حوافر وآثار */}
              {scatter('s06ho', 80, -400, 2400, len * 0.2, len).map((p, i) => (
                <ellipse key={i} cx={p.x} cy={p.y} rx={16} ry={9} fill="#2a1c0e" opacity={0.6} />
              ))}
              <path d={`M -2200 ${len * 0.2} L 560 ${len * 0.3} L 420 ${len} L -2200 ${len} Z`} fill="#4c6a3a" />
              <path d={`M 560 ${len * 0.3} L 420 ${len}`} stroke="#2e4424" strokeWidth={26} opacity={0.6} />
            </g>
          )}
        </Floor3D>
      </LitStage>
      <LitStage cam={cam} light={MUD_LIGHT}>
        {/* صف الرماة الخلفي + أوتاد مدببة */}
        <Layer d={620}>
          <Art>
            {[0, 1, 2, 3].map((i) => (
              <Person key={i} x={-120 + i * 170} y={gy(620) + (i % 2) * 8} s={0.8} frame={f + i * 6 + 3} {...extra('englishSoldier', i + 4)} expr="smug" pose="present" holdR="bow" view={40} shading="cel" />
            ))}
          </Art>
        </Layer>
        <Layer d={330}>
          <Art>
            {[0, 1, 2].map((i) => (
              <Person key={i} x={60 + i * 200} y={gy(330) + i * 8} s={1.08} frame={f + i * 4} {...extra('englishSoldier', i + 1)} expr="smug" pose="present" holdR="bow" view={40} shading="cel" />
            ))}
            {scatter('s06st', 14, -300, 700, 0, 1)
              .sort((a, b) => a.y - b.y)
              .map((p, i) => (
                <g key={i} transform={`translate(${p.x} ${gy(330) + 26 + p.y * 22}) rotate(${28 + p.r * 10})`}>
                  <path d="M -11 20 L -9 -120 L 0 -156 L 9 -120 L 11 20 Z" fill="#7a5430" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
                  <path d="M -9 -120 L 0 -156 L 9 -120 Z" fill="#e8d0a0" stroke={INK} strokeWidth={4} />
                </g>
              ))}
          </Art>
        </Layer>
        {/* فرسان خلفيون غارقون للمنتصف */}
        <Layer d={480}>
          <Art>
            {[0, 1, 2, 3].map((i) => (
              <MudKnight key={i} id={`b${i}`} x={960 + i * 250} y={gy(480)} s={0.88} sink={60 + sinkP * 46 + i * 5} f={f + i * 9} seed={i + 5} expr={i % 2 ? 'shock' : 'strain'} />
            ))}
          </Art>
        </Layer>
        <Layer d={KD}>
          <Art>
            {[0, 1, 2].map((i) => (
              <MudKnight key={i} id={`a${i}`} x={1040 + i * 285} y={yK + (i % 2) * 18} s={1.24} sink={lerp(16, 118 + i * 10, sinkP)} f={f + i * 7} seed={i + 1} expr={i === 1 ? 'shock' : 'strain'} />
            ))}
          </Art>
        </Layer>
        {/* وابل السهام بعمقين */}
        <Layer d={380}>
          <Art>
            {Array.from({length: 12}, (_, i) => (
              <FlyingArrow key={i} u={f / 30 + i * 0.083} yOff={((i % 4) - 1.5) * 40 - 30} />
            ))}
          </Art>
        </Layer>
        <Layer d={40}>
          <Art>
            {Array.from({length: 7}, (_, i) => (
              <FlyingArrow key={i} u={f / 24 + i * 0.145} yOff={((i % 3) - 1) * 60 - 60} scale={1.5} />
            ))}
          </Art>
        </Layer>
        <Layer d={0}>
          <Art>
            <Rain id="s06a" f={f} n={90} len={44} w={2.4} speed={34} op={0.34} />
          </Art>
        </Layer>
        <Layer d={-260} blur={3}>
          <Art>
            <Rain id="s06b" f={f} n={34} len={100} w={5} speed={60} op={0.3} />
          </Art>
        </Layer>
        {/* رمح مكسور وترس في الوحل خارج التركيز */}
        <Layer d={-320} blur={9}>
          <Art>
            <path d="M -700 1400 L -700 1010 Q 200 940 620 1080 Q 900 1150 1500 1120 Q 2100 1060 2700 1000 L 2700 1400 Z" fill="#24180c" />
            <rect x={1640} y={560} width={26} height={700} fill="#4a3018" transform="rotate(24 1650 900)" />
            <path d="M 140 930 Q 250 890 330 960 Q 320 1060 220 1110 Q 130 1040 140 930 Z" fill="#274a8c" />
          </Art>
        </Layer>
      </LitStage>
      <ColorGrade p={P} lightAt={[68, 40]} lightStrength={0.14} />
      <SoftFilm frame={f} strength={0.44} />
      <Hud>
        <TitleBanner y={88} title="أجينكورت — ١٤١٥" accent="#c8242e" />
      </Hud>
    </>
  );
};

/** فارس يغرق: الجسم مقصوص عند سطح الوحل + حلقة وحل أمامه وفقاعات */
const MudKnight: React.FC<{id: string; x: number; y: number; s: number; sink: number; f: number; seed: number; expr: 'shock' | 'strain'}> = ({id, x, y, s, sink, f, seed, expr}) => {
  const struggle = Math.sin(f * 0.9 + seed * 2) * 6;
  return (
    <g>
      <defs>
        <clipPath id={`s06k${id}`}>
          <rect x={x - 300} y={y - 900} width={600} height={900} />
        </clipPath>
      </defs>
      <ellipse cx={x} cy={y + 4} rx={128 * s} ry={30 * s} fill="#2e2010" opacity={0.85} />
      <g clipPath={`url(#s06k${id})`}>
        <g transform={`rotate(${struggle * 0.7} ${x} ${y})`}>
          <Person x={x + struggle} y={y + sink * s} s={s} flip frame={f} {...extra('frenchSoldier', seed)} expr={expr} pose="armsUp" shading="cel" />
        </g>
      </g>
      <path d={`M ${x - 120 * s} ${y} Q ${x - 60 * s} ${y - 15 * s} ${x} ${y - 4 * s} Q ${x + 60 * s} ${y - 15 * s} ${x + 120 * s} ${y} Q ${x + 60 * s} ${y + 36 * s} ${x} ${y + 34 * s} Q ${x - 60 * s} ${y + 36 * s} ${x - 120 * s} ${y} Z`} fill="#4e3820" stroke={INK} strokeWidth={4} />
      <path d={`M ${x - 80 * s} ${y + 6 * s} Q ${x} ${y + 20 * s} ${x + 70 * s} ${y + 4 * s}`} fill="none" stroke="#8a6c46" strokeWidth={5 * s} strokeLinecap="round" opacity={0.7} />
      {[0, 1, 2].map((i) => {
        const a = ((f + i * 13 + seed * 7) % 40) / 40;
        return <circle key={i} cx={x + (i - 1) * 56 * s + Math.sin(f * 0.3 + i) * 8} cy={y - a * 26 * s} r={(4 + i * 2) * s * (1 - a * 0.4)} fill="#6a4e2e" stroke={INK} strokeWidth={2.5} opacity={1 - a} />;
      })}
    </g>
  );
};

/* ================= المرحلة 3: خيانة دوق بورغوندي ================= */
const Betrayal: React.FC<{f: number; t: number; t0: number; switchT: number; endT: number}> = ({f, t, t0, switchT, endT}) => {
  const P = CLEAR_DAY;
  const switched = t >= switchT;
  const swP = easeOut(prog(t, switchT, switchT + 0.65));
  const dukeX = switched ? lerp(760, 1180, swP) : 760;
  const tossP = prog(t, switchT, switchT + 0.75);
  const hatDrop = easeOutBack(prog(t, switchT + 0.35, switchT + 0.75));
  const whistling = t >= switchT + 0.65;
  const F = (s: number) => Math.round(s * FPS);
  const cam = camAt(f, [
    {f: F(t0), x: -160, y: -10, z: -30, ry: -8, fov: 47},
    {f: F(switchT) - 3, x: -90, y: 6, z: 120, ry: -4, fov: 45},
    {f: F(switchT) + 18, x: 120, y: 6, z: 60, ry: 4},
    {f: F(switchT) + 60, x: 120, y: 0, z: 190, ry: 2},
    {f: F(endT), x: 160, y: 0, z: 240, ry: -2},
  ]);
  cam.y += 48;
  const A = 170;
  const y = gy(A);

  return (
    <>
      <Sky background="linear-gradient(#4f94d6 0%, #a8d2f0 54%, #f6ecd0 86%)" />
      <LitStage cam={cam} light={LIGHTS.day}>
        <Layer d={2900}>
          <Art>
            <Halo id="s06sun" cx={420} cy={190} r={600} color="#fff6d0" opacity={0.8} core={6} />
            <Cloud id="s06k1" x={300 + f * 0.5} y={250} w={1100} h={95} lit="#ffffff" shade="#c8dcec" opacity={0.95} />
            <Cloud id="s06k2" x={1600 + f * 0.4} y={180} w={1200} h={105} lit="#ffffff" shade="#c8dcec" opacity={0.95} />
          </Art>
        </Layer>
        <Layer d={2100}>
          <Art>
            <Ridge id="s06h1" fn={(x) => 660 - 56 * Math.sin(x / 430 + 2) - 18 * Math.sin(x / 140)} top="#9fb8ae" bottom="#8aa894" rim="#fff6dc" rimOpacity={0.5} />
            <Ridge id="s06h2" fn={(x) => 705 - 36 * Math.sin(x / 300)} top="#88a878" bottom="#6f9460" rim="#fff6dc" rimOpacity={0.35} />
            {scatter('s06tr', 40, -1300, 3200, 700, 735).map((b, i) => (
              <RoundTree key={i} x={b.x} y={b.y} h={44 + b.r * 34} D={false} c="#5f8a52" />
            ))}
          </Art>
        </Layer>
        <Layer d={1250}>
          <Art>
            <rect x={-1400} y={748} width={4800} height={900} fill="#7fa458" />
            <FarArmy id="s06bf" y={() => 752} n={34} x0={-700} x1={620} frame={f} c="#54688c" rim="#f4f8ff" h={70} />
            <FarArmy id="s06be" y={() => 752} n={48} x0={1180} x1={2700} frame={f} c="#8a3a3c" rim="#fff0e0" h={74} flag="#f8f2e6" />
          </Art>
        </Layer>
      </LitStage>
      <LitStage cam={cam} light={LIGHTS.day}>
        <Floor3D d0={-470} d1={1250}>
          {(len) => (
            <g>
              <defs>
                <linearGradient id="s06gr" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#8cb060" />
                  <stop offset="100%" stopColor="#4c7636" />
                </linearGradient>
              </defs>
              <rect x={-2200} y={0} width={6320} height={len} fill="url(#s06gr)" />
              {scatter('s06gp', 90, -2200, 4100, 0, len).map((b, i) => (
                <ellipse key={i} cx={b.x} cy={b.y} rx={60 + b.r * 130} ry={20 + b.r * 46} fill={i % 2 ? '#6e9848' : '#9ab86a'} opacity={0.45} />
              ))}
              {/* خط فاصل بين المعسكرين */}
              <path d={`M 940 0 Q 1010 ${len * 0.5} 930 ${len}`} fill="none" stroke="#c8a878" strokeWidth={110} opacity={0.75} />
            </g>
          )}
        </Floor3D>
      </LitStage>
      <LitStage cam={cam} light={LIGHTS.day}>
        {/* خيام المعسكرين */}
        <Layer d={700}>
          <Art>
            {[-160, 210, 560].map((x, i) => (
              <Tent key={x} x={x} y={gy(700) + 4} s={1.15 - i * 0.14} a="#2452a4" b="#e8ecf6" />
            ))}
            {[1370, 1710, 2080].map((x, i) => (
              <Tent key={x} x={x} y={gy(700) + 4} s={0.95 + i * 0.12} a="#c0262d" b="#f6ece0" />
            ))}
          </Art>
        </Layer>
        <Layer d={430}>
          <Art>
            {[90, 480].map((x, i) => (
              <Banner key={x} x={x} y={gy(430)} h={360} color="#2452a4" frame={f} s={1.1} seed={i} />
            ))}
            {[1430, 1840].map((x, i) => (
              <Banner key={x} x={x} y={gy(430)} h={360} color="#c8242e" frame={f} s={1.1} seed={i + 3} />
            ))}
            <Person x={1560} y={gy(430)} s={0.94} flip frame={f + 14} {...extra('englishSoldier', 5)} act="cheer" energy={0.6} shading="cel" />
            <Person x={320} y={gy(430)} s={0.94} frame={f + 4} {...extra('frenchSoldier', 5)} act="sad" energy={0.6} shading="cel" />
          </Art>
        </Layer>
        <Layer d={A}>
          <Art>
            <Person x={215} y={y} s={1.18} frame={f} {...extra('frenchSoldier', 1)} act="sad" energy={0.7} shading="cel" />
            <Person x={425} y={y + 8} s={1.18} frame={f + 5} {...extra('frenchSoldier', 2)} view={24} expr={switched ? 'shock' : 'sad'} pose="stand" shading="cel" />
            <Person x={1480} y={y} s={1.34} flip frame={f} {...look('henry5')} expr="smug" pose="raise" holdR="longsword" shading="cel" />
            <Person x={1715} y={y + 8} s={1.18} flip frame={f + 8} {...extra('englishSoldier', 1)} act="cheer" energy={0.65} shading="cel" />

            {switched && tossP < 1 && (
              <g transform={`translate(${lerp(720, 290, tossP)} ${lerp(y - 190, y - 540, Math.sin(tossP * Math.PI))}) rotate(${-tossP * 540}) scale(1.3)`} opacity={1 - tossP * 0.6}>
                <rect x={-4} y={-85} width={8} height={135} fill="#5a3c22" stroke={INK} strokeWidth={3} />
                <rect x={4} y={-82} width={76} height={52} fill="#2452a4" stroke={INK} strokeWidth={3.5} />
                <circle cx={42} cy={-56} r={9} fill="#f2c43a" />
              </g>
            )}
            {switched && swP < 0.98 && [0, 1, 2].map((i) => <line key={i} x1={dukeX - 110 - i * 30} x2={dukeX - 270 - i * 50} y1={y - 230 + i * 70} y2={y - 230 + i * 70} stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.8 * (1 - swP)} />)}

            {/* دوق بورغوندي يبدل ولاءه فوراً ويصفّر ببراءة */}
            <g transform={`translate(${dukeX} ${y + 14})`}>
              <Person
                x={0}
                y={0}
                s={1.38}
                flip={!switched}
                frame={f}
                {...look('philipGood')}
                expr={whistling ? 'happy' : 'smug'}
                pose={switched ? 'stand' : 'carry'}
                holdL={switched ? 'flagEngland' : 'flagFrance'}
                look={whistling ? [0, -1] : [0, 0]}
                shading="cel"
              />
              {hatDrop > 0.02 && (
                <g transform={`translate(0 ${lerp(-560, -360, hatDrop)}) scale(${hatDrop * 1.16})`} stroke={INK} strokeWidth={4.5} strokeLinejoin="round">
                  <path d="M -68 20 Q -72 -44 0 -46 Q 72 -44 68 20 Z" fill="#fbf8ef" />
                  <path d="M 0 -44 L 0 18 M -66 -10 L 66 -10" stroke="#c8242e" strokeWidth={15} />
                  <path d="M 18 -44 Q 72 -40 68 20 L 40 18 Q 44 -20 18 -44 Z" fill="#000" opacity={0.18} stroke="none" />
                  <rect x={-76} y={14} width={152} height={16} rx={6} fill="#9c1a22" />
                </g>
              )}
              {whistling &&
                [0, 1, 2].map((i) => {
                  const p = ((f * 0.03 + i * 0.33) % 1 + 1) % 1;
                  return (
                    <text key={i} x={-100 - p * 100} y={-270 - p * 110 + Math.sin(p * 6) * 14} fontFamily="DejaVu Sans, sans-serif" fontWeight={700} fontSize={58} fill="#1f3b7a" stroke="#fff" strokeWidth={6} style={{paintOrder: 'stroke'}} opacity={1 - p}>
                      {i % 2 === 0 ? '♪' : '♫'}
                    </text>
                  );
                })}
            </g>
          </Art>
        </Layer>
        <Layer d={-120}>
          <Art>
            <Motes id="s06mo" frame={f} x0={-200} x1={2100} y0={120} y1={900} color="#fff8d8" n={26} size={2.6} />
          </Art>
        </Layer>
        <Layer d={-330} blur={10}>
          <Art>
            {scatter('s06fg', 34, -300, 2300, 1090, 1240).map((b, i) => (
              <path key={i} d={`M ${b.x} 1400 Q ${b.x + Math.sin(f / 10 + b.p) * 18} ${b.y} ${b.x + 24 + Math.sin(f / 10 + b.p) * 34} ${b.y - 110}`} fill="none" stroke="#3a5a28" strokeWidth={17} strokeLinecap="round" />
            ))}
          </Art>
        </Layer>
      </LitStage>
      <ColorGrade p={P} lightAt={[22, 16]} lightStrength={0.22} />
      <SoftFilm frame={f} strength={0.24} />
      <Hud>
        <TitleBanner y={92} title="دوق بورغوندي" accent={switched ? '#c8242e' : '#7b2242'} />
      </Hud>
    </>
  );
};

/* ================= المرحلة 4: غضب ولي العهد ثم العجز التام وتمهيد معاهدة تروا ================= */
const DauphinRage: React.FC<{f: number; t: number; t0: number; deflateT: number}> = ({f, t, t0, deflateT}) => {
  const deflated = t >= deflateT;
  const defP = easeOut(prog(t, deflateT, deflateT + 0.5));
  const treatyPop = easeOutBack(prog(t, deflateT + 2.3, deflateT + 2.85));
  const rage = 1 - easeOut(prog(t, deflateT, deflateT + 0.3));
  const F = (s: number) => Math.round(s * FPS);
  const cam = camAt(f, [
    {f: F(t0), x: 0, y: 0, z: -220, ry: -6, fov: 52},
    {f: F(t0) + 10, z: 90, ry: 2, fov: 45},
    {f: F(deflateT) - 2, x: 0, y: -10, z: 260, ry: -3, fov: 42},
    {f: F(deflateT) + 16, x: 0, y: 0, z: -10, ry: 0, fov: 46},
    {f: F(deflateT + 2.3), x: -110, y: 0, z: 110, ry: -4},
    {f: F(deflateT + 3), x: 30, y: -4, z: 30, ry: 1},
    {f: SCENE06_TRACK.durationFrames, x: 60, y: -10, z: 110, ry: 4},
  ]);
  cam.y += 24;
  if (!deflated) {
    cam.x += Math.sin(f * 3.3) * 6;
    cam.y += Math.cos(f * 2.9) * 5;
  }
  const A = 170;

  return (
    <>
      <StoneChamber id="s06ch" f={f} cam={cam} rage={rage}>
        <Layer d={A}>
          <Art>
            <Person
              x={deflated ? lerp(960, 520, defP) : 960}
              y={gy(A)}
              s={deflated ? lerp(1.7, 1.3, defP) : 1.7}
              frame={f}
              {...look('charles7')}
              act={deflated ? 'sad' : 'angry'}
              energy={deflated ? 0.55 : 0.95}
              shading="cel"
            />
            {deflated && defP < 1 && <Smoke id="s06df" x={lerp(960, 520, defP)} y={gy(A) - 300} frame={f} color="#e8e0d8" n={8} rise={180} size={30} drift={60} opacity={0.6 * (1 - defP)} life={40} />}
          </Art>
        </Layer>
        {/* لوحة معاهدة تروا بإطار ذهبي */}
        <Layer d={60}>
          <Art>
            {treatyPop > 0.02 && (
              <g transform={`translate(1330 450) scale(${Math.max(0, treatyPop) * 0.98})`}>
                <GoldFrame w={800} h={640}>
                  <rect x={-346} y={-168} width={692} height={424} rx={12} fill="#d8c4a0" />
                  <defs>
                    <clipPath id="s06tc">
                      <rect x={-346} y={-168} width={692} height={424} rx={12} />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#s06tc)">
                    <Masonry seed="s06tw" x={-346} y={-168} w={692} h={330} bw={96} rh={48} base="#c8b48e" alt="#d8c6a2" line="#a8926a" />
                  </g>
                  <rect x={-346} y={150} width={692} height={108} fill="#7a5234" stroke={INK} strokeWidth={4} />
                  <Person x={-150} y={238} s={1.14} frame={f} {...look('charles6')} expr="dizzy" pose="raise" holdR="quill" shading="cel" />
                  <g transform="translate(170 30)" stroke={INK} strokeWidth={5}>
                    <rect x={-138} y={-128} width={290} height={268} rx={8} fill="#000" opacity={0.25} stroke="none" />
                    <rect x={-145} y={-136} width={290} height={268} rx={8} fill="#f6e8c6" />
                    <rect x={-160} y={-152} width={320} height={30} rx={15} fill="#b88a4a" />
                    <rect x={-160} y={120} width={320} height={30} rx={15} fill="#b88a4a" />
                    <text x={0} y={-62} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={46} fill="#8a1822" stroke="none" direction="rtl">
                      تروا
                    </text>
                    <text x={0} y={-8} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={46} fill={INK} stroke="none">
                      ١٤٢٠
                    </text>
                    {[28, 54, 80].map((ly) => (
                      <line key={ly} x1={-100} y1={ly} x2={100} y2={ly} stroke="#8c7b60" strokeWidth={4} />
                    ))}
                    <circle cx={92} cy={100} r={24} fill="#b8242e" />
                  </g>
                </GoldFrame>
              </g>
            )}
          </Art>
        </Layer>
      </StoneChamber>
    </>
  );
};

const MUD: Palette = {
  ...CLEAR_DAY,
  skyTop: '#4c5864',
  skyMid: '#76828c',
  horizon: '#b4b4a8',
  haze: '#98a09c',
  far: '#6e7a72',
  city: '#5a5a50',
  mid: '#5c5a48',
  near: '#2a2014',
  rim: '#e0e4e0',
  light: '#e8e8dc',
  smoke: '#a8a8a0',
  gradeTop: '#b8c4cc',
  gradeBottom: '#241a10',
  gradeOpacity: 0.36,
};
const MUD_LIGHT: CharLight = {dir: 1, key: '#e4ecec', shadow: '#2e3038', ambient: 0.12, rim: 0.5};
