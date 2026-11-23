import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {extra, look} from '../../cast';
import {Person} from '../../characters/Person';
import {SwearBubble} from '../../lib/comicFx';
import {TorchFX} from '../../lib/epic';
import {ColorGrade, Embers, Halo, MistBand, Smoke} from '../../lib/fx';
import {Art, Cam, Layer, Sky, camAt} from '../../lib/stage';
import {INK, clamp, easeOut, easeOutBack, prog, scatter} from '../../lib/util';
import {MapAttackArrow, MapLegend, makeProjection} from '../../world/maps/MapEngine';
import {
  BURGUNDY_1429,
  CITIES_1429,
  ENGLISH_GUYENNE_1429,
  ENGLISH_NORTH_1429,
  HENRY5_INVASION_ROUTE,
} from '../../world/maps/france1429';
import type {LonLat} from '../../world/maps/europeData';
import {GamePiece} from './MapPieces';
import {CityStandee, MapFlat, MapTable, Standee, mapToScreen} from './MapTable';
import {Fleur, Hud, LIGHTS, LitStage, SoftFilm, WAR_TABLE} from './stage3d';
import {FPS, SceneTrackAudio, SceneTrackSubtitles, buildTrack} from './audioHelper';

const MAP_CENTER: LonLat = [1.5, 48.3];
const MAP_ZOOM = 0.9;
const MAP_COLORS = {FRA: '#2b5eb8', GBR: '#c8242e'};

/* =====================================================================
 * المشهد ١ — المقدمة الخاطفة: فرنسا تشتعل عام ١٤٢٩
 * ===================================================================== */

export const SCENE01_TRACK = buildTrack(
  [
    {kind: 'pause', sec: 1.65}, // شاشة سوداء + طبول حرب + Record Scratch
    {kind: 'clip', id: 's01_nar_1', padAfter: 0.25},
    {kind: 'clip', id: 's01_nar_2', padAfter: 0.25},
    {kind: 'clip', id: 's01_nar_3', padAfter: 0.2},
  ],
  0.55,
);

const ARROW_NORMANDY: LonLat[] = [
  [-0.5, 49.4],
  [0.8, 48.9],
  [1.8, 48.2],
];
const ARROW_GUYENNE: LonLat[] = [
  [-1.2, 44.8],
  [0.2, 45.2],
  [1.0, 46.1],
];

/** أيقونة التاج الفرنسي المرتجف في الزاوية السفلية */
const TremblingCrownIcon: React.FC<{x: number; y: number; frame: number; panic: number}> = ({x, y, frame, panic}) => {
  const sx = Math.sin(frame * 2.7) * 5 * panic;
  const sy = Math.cos(frame * 3.3) * 3 * panic;
  const rot = Math.sin(frame * 2.1) * 9 * panic;
  return (
    <g transform={`translate(${x + sx} ${y + sy}) rotate(${rot})`}>
      {/* شارة زرقاء خلف التاج */}
      <circle cx={0} cy={0} r={70} fill="#1e3c82" stroke={INK} strokeWidth={5} />
      <circle cx={0} cy={0} r={58} fill="none" stroke="#f2c43a" strokeWidth={3} strokeDasharray="8 6" opacity={0.85} />
      {/* التاج الذهبي */}
      <g transform="translate(0 18)" stroke={INK} strokeWidth={4.5} strokeLinejoin="round">
        <path d="M -42 0 L -48 -48 L -22 -24 L 0 -58 L 22 -24 L 48 -48 L 42 0 Z" fill="#f2c43a" />
        <rect x={-44} y={-8} width={88} height={15} rx={4} fill="#dba61e" />
        <circle cx={-24} cy={0} r={4.5} fill="#2452a4" strokeWidth={2} />
        <circle cx={0} cy={0} r={5} fill="#c8242e" strokeWidth={2} />
        <circle cx={24} cy={0} r={4.5} fill="#2452a4" strokeWidth={2} />
      </g>
      {/* خطوط ارتجاف كرتونية */}
      {panic > 0.3 && (
        <g stroke="#fff8e0" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.9}>
          <path d="M -86 -28 Q -98 0 -86 28" />
          <path d="M 86 -28 Q 98 0 86 28" />
        </g>
      )}
      {/* قطرة عرق كرتونية */}
      <path d={`M 56 ${-46 + (frame % 16) * 0.7} q 8 14 0 21 q -8 -7 0 -21 Z`} fill="#7fc8ff" stroke={INK} strokeWidth={3} />
    </g>
  );
};

export const Scene01: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;

  const c2 = SCENE01_TRACK.byId.s01_nar_2;
  const c3 = SCENE01_TRACK.byId.s01_nar_3;

  const REVEAL_T = 1.52;
  const sfx = [
    {at: 0.05, name: 'drumroll', vol: 0.65, dur: 1.5},
    {at: 1.45, name: 'scratch', vol: 0.78, dur: 0.5},
    {at: c2.t0 + 0.4, name: 'pop', vol: 0.65, dur: 0.3},
    {at: c2.t0 + 1.2, name: 'clang', vol: 0.45, dur: 1.2},
    {at: c2.t0 + 2.8, name: 'pop', vol: 0.65, dur: 0.3},
    {at: c3.t0 + 0.3, name: 'pop', vol: 0.6, dur: 0.3},
  ];

  const flashOp = interpolate(t, [REVEAL_T, REVEAL_T + 0.22], [0.85, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: '#0d0b12'}}>
      {t < REVEAL_T ? <Intro f={f} p={t / REVEAL_T} /> : <WarMap f={f} t={t} revealT={REVEAL_T} c2t={c2.t0} c3t={c3.t0} />}
      {t >= REVEAL_T && flashOp > 0.01 && <AbsoluteFill style={{background: '#fff', opacity: flashOp, pointerEvents: 'none'}} />}
      <SceneTrackAudio track={SCENE01_TRACK} sfx={sfx} />
      <SceneTrackSubtitles track={SCENE01_TRACK} />
    </AbsoluteFill>
  );
};

/* ---------------- الافتتاحية: دخان وجمر وأسوار محترقة حول «١٤٢٩» ---------------- */
const Intro: React.FC<{f: number; p: number}> = ({f, p}) => {
  const cam = camAt(f, [
    {f: 0, z: -160, y: 20, ry: -3, fov: 50},
    {f: 46, z: 260, y: -10, ry: 1, fov: 42},
  ]);
  cam.x += Math.sin(f * 3.1) * p * 5;
  cam.y += Math.cos(f * 2.7) * p * 5;
  return (
    <>
      <Sky background="radial-gradient(circle at 50% 62%, #5a1418 0%, #24080e 42%, #0a070c 100%)" />
      <LitStage cam={cam} light={LIGHTS.night}>
        <Layer d={2400}>
          <Art>
            <Halo id="s01glow" cx={960} cy={700} r={1100} color="#ff4a1c" opacity={0.3 + 0.35 * p} />
          </Art>
        </Layer>
        {/* مدينة تحترق في الأفق */}
        <Layer d={1700}>
          <Art>
            <g fill="#17090e">
              {scatter('s01sk', 46, -1200, 3100, 0, 1).map((b, i) => (
                <g key={i}>
                  <rect x={b.x} y={780 - 60 - b.r * 150} width={70 + b.r * 60} height={500} />
                  {b.r > 0.6 && <path d={`M ${b.x - 10} ${720 - b.r * 150} l ${45 + b.r * 30} -90 l ${45 + b.r * 30} 90 Z`} />}
                </g>
              ))}
            </g>
            {[200, 760, 1250, 1800].map((x, i) => (
              <Smoke key={x} id={`s01s${i}`} x={x} y={720} frame={f + i * 40} color="#3a1a1c" n={9} size={70} rise={620} opacity={0.5} />
            ))}
          </Art>
        </Layer>
        <Layer d={700}>
          <Art>
            <MistBand id="s01mist" frame={f} y={900} color="#8a2a1c" h={170} speed={2.4} />
          </Art>
        </Layer>
        <Layer d={60}>
          <Art>
            <g opacity={clamp((p * 1.52) / 0.35, 0, 1)}>
              <text x={960} y={652} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={250} fill="#3a0a0e" transform="translate(0 14)">
                ١٤٢٩
              </text>
              <text x={960} y={652} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={250} fill="#fdf3dc" stroke="#c8242e" strokeWidth={6} style={{paintOrder: 'stroke'}}>
                ١٤٢٩
              </text>
            </g>
          </Art>
        </Layer>
        <Layer d={-120}>
          <Art>
            <text x={960} y={392} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={82} fill="#f2c43a" direction="rtl" opacity={clamp((p * 1.52) / 0.45, 0, 1)} stroke="#1a0a0c" strokeWidth={10} style={{paintOrder: 'stroke'}}>
              مَمْلَكَةُ فَرَنْسَا
            </text>
            <Embers id="s01e1" x={500} y={1120} frame={f} n={34} spread={1300} rise={1000} size={5} wind={120} life={60} />
            <Embers id="s01e2" x={1500} y={1120} frame={f + 22} n={34} spread={1300} rise={1000} size={5} wind={-90} life={64} />
          </Art>
        </Layer>
        <Layer d={-380} blur={8}>
          <Art>
            <Embers id="s01e3" x={960} y={1150} frame={f + 9} n={16} spread={1700} rise={1100} size={11} wind={60} life={50} />
          </Art>
        </Layer>
      </LitStage>
      <SoftFilm frame={f} strength={0.6} />
    </>
  );
};

/* ---------------- طاولة الحرب ---------------- */
const WarMap: React.FC<{f: number; t: number; revealT: number; c2t: number; c3t: number}> = ({f, t, revealT, c2t, c3t}) => {
  const ignite = easeOut(prog(t, revealT + 0.15, revealT + 2.4)); // اشتعال اللون الأحمر من كل الجهات
  const engArrows = easeOut(prog(t, c2t, c2t + 2.3)); // الجيش الإنجليزي يلتهم أراضيها
  const noblesFight = easeOut(prog(t, c2t + 2.55, c2t + 3.0)); // نبلاؤها يتقاتلون فيما بينهم
  const dauphinZoom = easeOut(prog(t, c3t - 0.15, c3t + 1.45)); // زوم على قلعة ولي العهد
  const castle = easeOutBack(prog(t, c3t + 0.25, c3t + 0.75));
  const fade = 1 - clamp(castle, 0, 1);

  const F = (sec: number) => Math.round(sec * FPS);
  const cam = camAt(f, [
    {f: F(revealT), x: -60, y: -60, z: -330, rx: 7, ry: -4, fov: 48},
    {f: F(revealT + 2.2), x: 0, y: 40, z: -30, rx: 2, ry: -1, fov: 45},
    {f: F(c2t), x: 10, y: 20, z: 20, ry: 1},
    {f: F(c2t + 2.4), x: 20, y: 60, z: 70, ry: 2},
    {f: F(c2t + 3.2), x: 110, y: 135, z: 190, ry: 0},
    {f: F(c3t - 0.1), x: 110, y: 140, z: 205, rx: 1, ry: 0},
    {f: F(c3t + 1.5), x: -90, y: -40, z: 250, rx: 0, ry: -4},
    {f: SCENE01_TRACK.durationFrames, x: -85, y: -60, z: 360, rx: -1, ry: 2},
  ]);

  const redPulse = 0.12 + 0.08 * Math.sin(f * 0.25);
  const flames: LonLat[] = [
    [0.3, 48.9],
    [1.5, 49.9],
    [2.9, 48.75],
    [3.9, 49.35],
    [4.9, 47.9],
    [-0.4, 44.9],
    [-0.1, 48.2],
  ];

  return (
    <>
      <MapTable
        id="s01"
        cam={cam}
        frame={f}
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        colors={MAP_COLORS}
        river="Loire"
        territories={[
          {id: 'eng-n', clipTo: 'FRA', polygon: ENGLISH_NORTH_1429, fill: '#c8242e', opacity: 0.94 * ignite},
          {id: 'eng-sw', clipTo: 'FRA', polygon: ENGLISH_GUYENNE_1429, fill: '#c8242e', opacity: 0.94 * ignite},
          {id: 'burg', clipTo: 'FRA', polygon: BURGUNDY_1429, fill: '#7b2242', opacity: 0.92 * ignite},
        ]}
        pieces={({xy}) => (
          <>
            {/* نيران حقيقية بتوهج وشرر ودخان على الحدود المشتعلة */}
            {ignite > 0.25 &&
              flames.map((pt, i) => {
                const sc = clamp((ignite - 0.2 - i * 0.08) * 2.2, 0, 1);
                return sc > 0.05 ? (
                  <Standee key={i} at={xy(pt)} scale={sc * (1 - dauphinZoom * 0.35)}>
                    <MapFire id={`s01f${i}`} frame={f + i * 11} />
                  </Standee>
                ) : null;
              })}

            {/* علامات سقوط المدن: رايات إنجليزية مغروسة */}
            {engArrows > 0.45 && <PlantedFlag at={xy(CITIES_1429.agincourt.pos)} up={easeOutBack(clamp((engArrows - 0.45) * 5))} frame={f} />}
            {engArrows > 0.65 && <PlantedFlag at={xy(CITIES_1429.rouen.pos)} up={easeOutBack(clamp((engArrows - 0.65) * 5))} frame={f + 8} />}
            {engArrows > 0.8 && <PlantedFlag at={xy([3.1, 48.55])} up={easeOutBack(clamp((engArrows - 0.8) * 6))} frame={f + 15} />}

            <CityStandee at={xy(CITIES_1429.paris.pos)} label="باريس" color="#c8242e" frame={f} big h={60} dx={-26} />
            <CityStandee at={xy(CITIES_1429.orleans.pos)} label="أورليان" color="#2452a4" frame={f} big pulse h={50} dx={-20} />
            <CityStandee at={xy(CITIES_1429.reims.pos)} label="ريمس" color="#7b2242" frame={f} h={70} dx={26} />
            {castle < 0.05 && <CityStandee at={xy(CITIES_1429.chinon.pos)} label="شينون" color="#2452a4" frame={f} pulse={dauphinZoom > 0.3} h={56} dx={-30} />}

            {/* النبلاء يتقاتلون فيما بينهم */}
            {noblesFight > 0.02 && fade > 0.02 && (
              <Standee at={xy([5.0, 45.75])} up={easeOutBack(noblesFight)} scale={0.35 + 0.65 * fade}>
                <GamePiece label="نبلاء فرنسا" color="#4a2a52" w={360} fs={36}>
                  <Person x={-84} y={0} s={0.72} frame={f} {...extra('medievalNoble', 1)} act="angry" energy={0.95} shading="cel" />
                  <Person x={84} y={0} s={0.72} flip frame={f + 5} {...look('philipGood')} act="angry" energy={0.95} shading="cel" />
                  <SwearBubble x={0} y={-236} frame={f} scale={1.05} />
                </GamePiece>
              </Standee>
            )}

            {/* قلعة شينون تنبثق من الخريطة وفيها ولي العهد يبكي */}
            {castle > 0.02 && (
              <>
                <Standee at={[xy(CITIES_1429.chinon.pos)[0], xy(CITIES_1429.chinon.pos)[1] - 46]} up={castle} scale={0.84}>
                  <CastleBack frame={f} />
                </Standee>
                <Standee at={[xy(CITIES_1429.chinon.pos)[0], xy(CITIES_1429.chinon.pos)[1] - 16]} up={castle} scale={0.84}>
                  <Person x={0} y={-30} s={0.82} frame={f} {...look('charles7')} act="sad" energy={0.95} shading="cel" light={{...LIGHTS.table, key: "#ffc070"}} />
                </Standee>
                <Standee at={xy(CITIES_1429.chinon.pos)} up={castle} scale={0.84}>
                  <CastleFront frame={f} />
                </Standee>
              </>
            )}
          </>
        )}
      >
        {({proj}) => (
          <MapFlat>
            {engArrows > 0.02 && (
              <g opacity={1 - dauphinZoom * 0.45}>
                <g transform="translate(7 12)" opacity={0.3} style={{filter: 'brightness(0)'}}>
                  <MapAttackArrow proj={proj} points={HENRY5_INVASION_ROUTE} progress={engArrows} color="#000000" width={18} />
                  <MapAttackArrow proj={proj} points={ARROW_NORMANDY} progress={clamp((engArrows - 0.2) * 1.3, 0, 1)} color="#000000" width={16} />
                  <MapAttackArrow proj={proj} points={ARROW_GUYENNE} progress={clamp((engArrows - 0.35) * 1.5, 0, 1)} color="#000000" width={15} />
                </g>
                <MapAttackArrow proj={proj} points={HENRY5_INVASION_ROUTE} progress={engArrows} color="#ff3b2e" width={18} />
                <MapAttackArrow proj={proj} points={ARROW_NORMANDY} progress={clamp((engArrows - 0.2) * 1.3, 0, 1)} color="#ff3b2e" width={16} />
                <MapAttackArrow proj={proj} points={ARROW_GUYENNE} progress={clamp((engArrows - 0.35) * 1.5, 0, 1)} color="#ff3b2e" width={15} />
              </g>
            )}
          </MapFlat>
        )}
      </MapTable>
      <ColorGrade p={WAR_TABLE} lightAt={[12, 78]} lightStrength={0.22 + 0.02 * Math.sin(f * 0.6)} />
      {/* توهج أحمر خفيف على الحواف لدلالة الخطر والاشتعال */}
      <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(circle at 50% 45%, transparent 54%, rgba(196, 26, 36, ${redPulse * ignite * 1.3}) 100%)`}} />
      <SoftFilm frame={f} />
      <Hud>
        {/* شارة السنة والعنوان */}
        <g transform="translate(42 36)">
          <rect x={5} y={7} width={450} height={82} rx={14} fill="#000" opacity={0.3} />
          <rect x={0} y={0} width={450} height={82} rx={14} fill="#fdfaf2" fillOpacity={0.96} stroke={INK} strokeWidth={4} />
          <rect x={8} y={8} width={116} height={66} rx={10} fill="#c8242e" stroke={INK} strokeWidth={3} />
          <text x={66} y={56} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={40} fill="#fff">
            ١٤٢٩
          </text>
          <text x={286} y={54} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={34} fill={INK} direction="rtl">
            كابوس مملكة فرنسا
          </text>
        </g>
        <MapLegend x={1490} y={36} />
        <TremblingCrownIcon x={1775} y={830} frame={f} panic={0.55 + 0.45 * ignite} />
        {castle > 0.3 && <CastleLabel cam={cam} p={clamp((castle - 0.3) * 1.6)} />}
      </Hud>
    </>
  );
};

/** لافتة القلعة تتبعها على الشاشة */
const CastleLabel: React.FC<{cam: Cam; p: number}> = ({cam, p}) => {
  const at = mapToScreen(makeProjection(MAP_CENTER, MAP_ZOOM).toXY(CITIES_1429.chinon.pos), cam, -34);
  return (
    <g transform={`translate(${at.x} ${Math.min(at.y, 850)}) scale(${p})`}>
      <rect x={-256} y={-30} width={520} height={68} rx={14} fill="#000" opacity={0.3} />
      <rect x={-260} y={-36} width={520} height={68} rx={14} fill="#fdfaf2" stroke={INK} strokeWidth={4} />
      <text x={0} y={12} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={36} fill={INK} direction="rtl">
        ولي العهد شارل السابع — قلعة شينون
      </text>
    </g>
  );
};

/** نار على الخريطة: هالة + لهب متوهج + شرر + دخان */
const MapFire: React.FC<{id: string; frame: number}> = ({id, frame}) => {
  const a = 0.86 + 0.16 * Math.sin(frame * 0.55);
  const b = Math.sin(frame * 0.35) * 5;
  return (
    <g>
      <Smoke id={`${id}s`} x={0} y={-40} frame={frame} color="#2a1c1c" n={7} size={16} rise={210} drift={50} opacity={0.5} life={110} />
      <Halo id={`${id}h`} cx={0} cy={-24} r={105 * a} color="#ff8a2c" opacity={0.6} />
      <path d={`M -22 0 Q ${-28 + b} -30 0 ${-66 * a} Q ${28 + b} -30 22 0 Q 0 12 -22 0 Z`} fill="#ff5a22" stroke={INK} strokeWidth={3} />
      <path d={`M -12 0 Q ${-14 + b * 0.5} -20 0 ${-42 * a} Q ${14 + b * 0.5} -20 12 0 Z`} fill="#ffb23c" />
      <path d={`M -6 0 Q -7 -10 0 ${-22 * a} Q 7 -10 6 0 Z`} fill="#fff2b4" />
      <Embers id={`${id}e`} x={0} y={-30} frame={frame} n={8} spread={40} rise={150} size={3} life={48} wind={18} />
    </g>
  );
};

/** راية إنجليزية مغروسة (صليب أحمر على أبيض) */
const PlantedFlag: React.FC<{at: [number, number]; up: number; frame: number}> = ({at, up, frame}) => {
  const pts = (y: number) => Array.from({length: 7}, (_, i) => `${4 + i * 11} ${y + Math.sin(frame / 5 - i * 0.8) * 4 * (i / 6)}`);
  return (
    <Standee at={at} up={up}>
      <ellipse cx={6} cy={0} rx={22} ry={7} fill="#000" opacity={0.4} />
      <line x1={0} y1={0} x2={0} y2={-112} stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <line x1={0} y1={0} x2={0} y2={-112} stroke="#8a5a2c" strokeWidth={4} strokeLinecap="round" />
      <path d={`M ${pts(-110).join(' L ')} L ${pts(-66).reverse().join(' L ')} Z`} fill="#fbf8ef" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${pts(-88).join(' L ')}`} fill="none" stroke="#c8242e" strokeWidth={9} />
      <path d={`M 30 ${-108 + Math.sin(frame / 5 - 1.9) * 2} L 30 ${-68 + Math.sin(frame / 5 - 1.9) * 2}`} stroke="#c8242e" strokeWidth={9} />
    </Standee>
  );
};

/** ظهر القلعة: برج خلفي وجدار داخلي مضاء بمشعل */
const CastleBack: React.FC<{frame: number}> = ({frame}) => (
  <g>
    <ellipse cx={20} cy={0} rx={300} ry={40} fill="#000" opacity={0.4} />
    <g stroke={INK} strokeWidth={5} strokeLinejoin="round">
      <rect x={-70} y={-520} width={140} height={520} fill="#6a6478" />
      <path d="M -92 -520 L 0 -650 L 92 -520 Z" fill="#274a98" />
      <path d="M 14 -520 L 0 -650 L 92 -520 Z" fill="#142c66" />
      <rect x={-13} y={-480} width={26} height={56} rx={13} fill="#ffc861" />
      <path d={`M 0 -650 L 0 -708 L ${52 + Math.sin(frame / 6) * 6} -692 L 0 -676`} fill="#2f5fc0" />
      <rect x={-196} y={-372} width={392} height={372} fill="#37324a" />
    </g>
    <Halo id="s01cb" cx={-110} cy={-230} r={170} color="#ffb45a" opacity={0.75} />
    <TorchFX id="s01ct" x={-110} y={-130} frame={frame} s={0.8} warm="#ffb45a" embers={false} />
    <g>
      <path d="M 70 -330 L 150 -330 L 150 -170 L 110 -196 L 70 -170 Z" fill="#264b96" stroke={INK} strokeWidth={4} />
      <Fleur x={110} y={-268} s={0.42} />
    </g>
    {/* عرش فارغ كبير خلفه */}
    <path d="M -64 0 L -64 -250 Q 0 -310 64 -250 L 64 0 Z" fill="#5a2a3c" stroke={INK} strokeWidth={5} />
    <path d="M -64 -250 Q 0 -310 64 -250" fill="none" stroke="#e8b830" strokeWidth={8} />
  </g>
);

/** واجهة القلعة: برجان وقوس مفتوح وشرفات */
const CastleFront: React.FC<{frame: number}> = ({frame}) => {
  const stone = '#8c8698';
  const dark = '#5c566c';
  const merlons = (x0: number, n: number, y: number, w = 26) =>
    Array.from({length: n}, (_, i) => <rect key={`${x0}-${i}`} x={x0 + i * (w * 1.6)} y={y - 30} width={w} height={32} fill={stone} />);
  return (
    <g stroke={INK} strokeWidth={5} strokeLinejoin="round">
      {/* واجهة بقوس مفتوح */}
      <path
        fillRule="evenodd"
        d="M -206 0 L -206 -400 L 206 -400 L 206 0 Z M -118 0 L -118 -230 Q -118 -344 0 -344 Q 118 -344 118 -230 L 118 0 Z"
        fill={stone}
      />
      <path d="M -118 0 L -118 -230 Q -118 -344 0 -344 Q 118 -344 118 -230 L 118 0" fill="none" stroke={dark} strokeWidth={14} />
      <path d="M -118 0 L -118 -230 Q -118 -344 0 -344 Q 118 -344 118 -230 L 118 0" fill="none" stroke={INK} strokeWidth={4} />
      <g stroke={dark} strokeWidth={3} fill="none" opacity={0.8}>
        {[-370, -320, -270, -220, -170, -120, -70].map((y, i) => (
          <path key={y} d={`M -200 ${y} H ${y > -340 ? -132 : 200} M ${y > -340 ? 132 : 200} ${y} H 200 M ${-170 + (i % 2) * 18} ${y} v 48 M ${164 - (i % 2) * 18} ${y} v 48`} />
        ))}
      </g>
      {merlons(-204, 10, -400)}
      {/* البرجان */}
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${sd * 250} 0)`}>
          <rect x={-62} y={-470} width={124} height={470} fill={stone} />
          <rect x={sd > 0 ? 10 : 18} y={-470} width={44} height={470} fill={dark} opacity={0.65} stroke="none" />
          <path d="M -84 -470 L 0 -604 L 84 -470 Z" fill="#2c55ac" />
          <path d="M 16 -470 L 0 -604 L 84 -470 Z" fill="#162f6c" />
          <rect x={-11} y={-400} width={22} height={62} rx={11} fill="#ffc861" />
          <rect x={-11} y={-230} width={22} height={62} rx={11} fill="#2b2836" />
          <path d={`M 0 -604 L 0 -664 L ${sd * (58 + Math.sin(frame / 6 + sd) * 6)} -646 L 0 -628`} fill="#f2c43a" />
        </g>
      ))}
      {/* عتبة أمامية */}
      <rect x={-340} y={-34} width={680} height={38} rx={8} fill={dark} />
    </g>
  );
};
