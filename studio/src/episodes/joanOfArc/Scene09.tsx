import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {extra, look} from '../../cast';
import {Person} from '../../characters/Person';
import {TitleBanner} from '../../lib/comicFx';
import {Cloud, ColorGrade, Embers, Halo, Smoke} from '../../lib/fx';
import {Art, Cam, Layer, Sky, camAt} from '../../lib/stage';
import {INK, clamp, easeOut, easeOutBack, prog, scatter} from '../../lib/util';
import {RoundTree} from '../../world/buildings';
import {MapLegend} from '../../world/maps/MapEngine';
import type {LonLat} from '../../world/maps/europeData';
import {BURGUNDY_1429, CITIES_1429, ENGLISH_GUYENNE_1429, ENGLISH_NORTH_1429} from '../../world/maps/france1429';
import {GamePiece} from './MapPieces';
import {CityStandee, MapFlat, MapTable, Standee} from './MapTable';
import {NamePlate} from './sets';
import {CLEAR_DAY, Hud, LIGHTS, LitStage, SoftFilm, WAR_TABLE, mix, projectWorld} from './stage3d';
import {FPS, SceneTrackAudio, SceneTrackSubtitles, buildTrack} from './audioHelper';

/* =====================================================================
 * المشهد ٩ — فرنسا المقسّمة ١٤٢٨ + حصار أورليان + الأمل في قرية دومريمي
 * (ختام الدفعة الأولى / الفصل الأول)
 * ===================================================================== */

export const SCENE09_TRACK = buildTrack(
  [
    {kind: 'pause', sec: 0.25},
    {kind: 'clip', id: 's09_nar_1', padAfter: 0.22},
    {kind: 'clip', id: 's09_nar_2', padAfter: 0.24},
    {kind: 'clip', id: 's09_nar_3', padAfter: 0.35},
    {kind: 'clip', id: 's09_nar_4', padAfter: 0.3},
  ],
  0.75,
);

/** خيمة إنجليزية حمراء صغيرة لحصار أورليان */
const SiegeTent: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
    <path d="M -26 0 L 0 -38 L 26 0 Z" fill="#c8242e" />
    <path d="M -8 0 L 0 -18 L 8 0 Z" fill="#3a161a" />
    <line x1={0} y1={-38} x2={0} y2={-54} strokeWidth={3} />
    <polygon points="0,-54 16,-48 0,-42" fill="#f8f5ec" strokeWidth={2.5} />
  </g>
);

/** مدفع حصار إنجليزي صغير يطلق دخاناً */
const SiegeCannon: React.FC<{x: number; y: number; flip?: boolean; frame: number; seed: number}> = ({x, y, flip, frame, seed}) => {
  const puff = ((frame + seed * 19) % 45) / 45;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`} stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
      <rect x={-26} y={-20} width={44} height={14} rx={5} fill="#3c404a" transform="rotate(-14)" />
      <circle cx={-8} cy={-2} r={12} fill="#7a4c24" />
      <circle cx={-8} cy={-2} r={4} fill="#3c404a" />
      {puff < 0.45 && (
        <circle
          cx={28 + puff * 35}
          cy={-24 - puff * 18}
          r={8 + puff * 20}
          fill="#e8e4da"
          stroke="none"
          opacity={1 - puff / 0.45}
        />
      )}
    </g>
  );
};

/** جندي إنجليزي مصغّر جداً لحصار أورليان */
const TinyRedSoldier: React.FC<{x: number; y: number; frame: number; seed: number}> = ({x, y, frame, seed}) => {
  const bob = Math.sin(frame * 0.25 + seed * 1.7) * 2.5;
  return (
    <g transform={`translate(${x} ${y + bob})`} stroke={INK} strokeWidth={2.5}>
      <rect x={-7} y={-18} width={14} height={18} rx={4} fill="#c8242e" />
      <circle cx={0} cy={-27} r={9} fill="#f2c6a0" />
      <path d="M -10 -29 Q 0 -41 10 -29 Z" fill="#9ca6b4" />
      <line x1={10} y1={-36} x2={10} y2={2} stroke="#5a3818" strokeWidth={2.5} />
    </g>
  );
};

const MAP_CENTER: LonLat = [2.6, 48.0];
const MAP_ZOOM = 1.0;
const MAP_COLORS = {FRA: '#2b5eb8', GBR: '#c8242e'};

export const Scene09: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;

  const c1 = SCENE09_TRACK.byId.s09_nar_1;
  const c2 = SCENE09_TRACK.byId.s09_nar_2;
  const c3 = SCENE09_TRACK.byId.s09_nar_3;
  const c4 = SCENE09_TRACK.byId.s09_nar_4;

  const STICKER_T = c1.t0 + 11.4;
  const REIMS_T = c2.t0;
  const ORLEANS_T = c3.t0 - 0.15;
  const DOMREMY_T = c4.t0;
  const JOAN_HOPE_T = c4.t0 + 9.2;

  const sfx = [
    {at: STICKER_T, name: 'stamp', vol: 0.72, dur: 0.4},
    {at: REIMS_T + 3.2, name: 'pop', vol: 0.68, dur: 0.3},
    {at: ORLEANS_T + 0.1, name: 'whoosh', vol: 0.65, dur: 0.5},
    {at: c3.t0 + 4.8, name: 'boom', vol: 0.55, dur: 1.8},
    {at: c3.t0 + 8.5, name: 'boom', vol: 0.48, dur: 1.5},
    {at: JOAN_HOPE_T, name: 'pop', vol: 0.5, dur: 0.3},
  ];

  const siegeT0 = ORLEANS_T + 1.15;
  const inSiege = t >= siegeT0 && t < DOMREMY_T;

  return (
    <AbsoluteFill style={{background: '#1a100a'}}>
      {inSiege ? (
        <OrleansSiege f={f} t={t} t0={siegeT0} endT={DOMREMY_T} booms={[c3.t0 + 4.8, c3.t0 + 8.5]} />
      ) : (
        <DividedMap f={f} t={t} stickerT={STICKER_T} reimsT={REIMS_T} orleansT={ORLEANS_T} domT={DOMREMY_T} hopeT={JOAN_HOPE_T} />
      )}
      <SceneTrackAudio track={SCENE09_TRACK} sfx={sfx} />
      <SceneTrackSubtitles track={SCENE09_TRACK} hideDialogue />
    </AbsoluteFill>
  );
};

/* ================= المراحل 1 و 2 و 4: طاولة الحرب (فرنسا المقسمة ← ريمس ← دومريمي) ================= */
const DividedMap: React.FC<{f: number; t: number; stickerT: number; reimsT: number; orleansT: number; domT: number; hopeT: number}> = ({f, t, stickerT, reimsT, orleansT, domT, hopeT}) => {
  const reimsPop = easeOutBack(prog(t, reimsT + 2.6, reimsT + 3.2));
  const reimsArrowP = easeOut(prog(t, reimsT + 2.6, reimsT + 3.8));
  const domremy = t >= domT;
  const dark = domremy ? easeOut(prog(t, domT, domT + 2.6)) : 0;
  const villageP = domremy ? easeOutBack(prog(t, domT + 2.4, domT + 3.1)) : 0;
  const hopePop = easeOutBack(prog(t, hopeT, hopeT + 0.65));
  const hope = clamp(hopePop);
  const F = (s: number) => Math.round(s * FPS);
  const cam = domremy
    ? camAt(f, [
        {f: F(domT), x: -60, y: -20, z: -120, rx: 5, ry: -4, fov: 48},
        {f: F(domT + 3.2), x: 250, y: -110, z: 290, rx: 0, ry: 2, fov: 45},
        {f: F(hopeT), x: 270, y: -130, z: 390, ry: -2},
        {f: F(hopeT + 1.6), x: 280, y: -135, z: 540, ry: 2},
        {f: SCENE09_TRACK.durationFrames, x: 285, y: -145, z: 660, ry: 5, fov: 43},
      ])
    : camAt(f, [
        {f: 0, x: -80, y: -10, z: -330, rx: 7, ry: -5, fov: 48},
        {f: F(2.4), x: 0, y: 30, z: -60, rx: 2, ry: -1, fov: 45},
        {f: F(7.4), x: 0, y: -40, z: 60, ry: 2},
        {f: F(12.2), x: -60, y: 130, z: 190, ry: -3},
        {f: F(reimsT - 0.2), x: -50, y: 140, z: 240, ry: -1},
        {f: F(reimsT + 1.4), x: 90, y: -150, z: 110, ry: 2},
        {f: F(orleansT), x: 110, y: -150, z: 190, ry: 4},
        {f: F(orleansT + 1.15), x: -60, y: -20, z: 820, rx: -3, ry: 0, fov: 42},
      ]);

  return (
    <>
      <MapTable
        id="s09"
        cam={cam}
        frame={f}
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        colors={MAP_COLORS}
        river="Loire"
        territories={[
          {id: 'e-n', clipTo: 'FRA', polygon: ENGLISH_NORTH_1429, fill: '#c8242e', opacity: 0.92},
          {id: 'e-s', clipTo: 'FRA', polygon: ENGLISH_GUYENNE_1429, fill: '#c8242e', opacity: 0.92},
          {id: 'b-e', clipTo: 'FRA', polygon: BURGUNDY_1429, fill: '#7b2242', opacity: 0.92},
        ]}
        pieces={({xy}) => {
          const [rx, ry] = xy(CITIES_1429.reims.pos);
          const [dx, dy] = xy(CITIES_1429.domremy.pos);
          return (
            <>
              {!domremy && (
                <>
                  <CityStandee at={xy(CITIES_1429.paris.pos)} label="باريس" color="#c8242e" frame={f} big h={56} dx={-20} />
                  <CityStandee at={xy(CITIES_1429.orleans.pos)} label="أورليان" color="#2452a4" frame={f} big h={46} dx={-46} pulse={t >= orleansT - 2} />
                  {reimsPop < 0.05 && <CityStandee at={[rx, ry]} label="ريمس" color="#7b2242" frame={f} h={60} pulse={t >= reimsT} />}
                  {/* حاميات إنجليزية واقفة في الشمال */}
                  {[
                    [0.2, 49.0],
                    [1.3, 49.75],
                    [3.2, 50.2],
                  ].map(([lo, la], i) => (
                    <Standee key={i} at={xy([lo, la])} up={easeOutBack(prog(t, 7.0 + i * 0.35, 7.5 + i * 0.35))}>
                      <GamePiece color="#8a1620" w={120}>
                        <Person x={0} y={0} s={0.46} frame={f + i * 9} {...extra('englishSoldier', i + 1)} expr="smug" pose="stand" holdR="spear" shading="cel" />
                      </GamePiece>
                    </Standee>
                  ))}
                  {/* الدوفين التعيس في الجنوب */}
                  <Standee at={xy([3.8, 46.0])} up={easeOutBack(prog(t, 0.6, 1.1))} scale={1.05}>
                    <GamePiece label="شارل السابع" color="#1d3e8a" w={250} fs={36}>
                      <Person x={0} y={0} s={0.9} frame={f} {...look('charles7')} act="sad" energy={0.8} shading="cel" />
                    </GamePiece>
                  </Standee>
                  {/* كاتدرائية ريمس تنبثق في قلب أراضي العدو */}
                  {reimsPop > 0.03 && (
                    <Standee at={[rx, ry]} up={reimsPop}>
                      <Halo id="s09rh" cx={0} cy={-120} r={240} color="#ffd87a" opacity={0.55} />
                      <ReimsCathedral />
                      <g transform="translate(0 24)">
                        <NamePlate x={0} y={0} text="ريمس" color="#7b2242" fs={34} />
                      </g>
                    </Standee>
                  )}
                </>
              )}

              {/* دومريمي: قرية مجسّمة تنبثق من الخريطة + جان */}
              {domremy && (
                <>
                  {villageP < 0.05 && <CityStandee at={[dx, dy]} label="دومريمي" color="#22a050" frame={f} big pulse h={60} />}
                  <Standee at={[dx, dy - 62]} up={villageP}>
                    {hope > 0.01 && (
                      <g opacity={hope}>
                        <path d="M -60 -780 L 60 -780 L 210 40 L -210 40 Z" fill="url(#s09shaft)" />
                        <Halo id="s09hh" cx={0} cy={-190} r={380} color="#ffe08a" opacity={0.7} />
                      </g>
                    )}
                    <defs>
                      <linearGradient id="s09shaft" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#fff4c0" stopOpacity={0.85} />
                        <stop offset="100%" stopColor="#fff4c0" stopOpacity={0.12} />
                      </linearGradient>
                    </defs>
                    <VillageBack f={f} lit={hope} />
                  </Standee>
                  <Standee at={[dx, dy - 20]} up={villageP}>
                    <ellipse cx={0} cy={-4} rx={330} ry={40} fill="#2e5a30" stroke={INK} strokeWidth={5} />
                    <ellipse cx={0} cy={-14} rx={318} ry={34} fill={mix('#4a7a44', '#7cb45a', hope)} />
                    {scatter('s09gr', 40, -290, 290, -30, 4).map((p, i) => (
                      <path key={i} d={`M ${p.x} ${p.y} q ${Math.sin(f / 9 + p.p) * 3} -9 ${Math.sin(f / 9 + p.p) * 5} -16`} fill="none" stroke={mix('#3a6238', '#a8d470', hope)} strokeWidth={3.5} strokeLinecap="round" />
                    ))}
                    <g transform="translate(-210 -14)">
                      <RoundTree x={0} y={0} h={150} c="#5a8a44" />
                    </g>
                    {[-120, 170, 220].map((x, i) => (
                      <Sheep key={x} x={x} y={-8 + (i % 2) * 8} f={f + i * 13} flip={i === 0} />
                    ))}
                  </Standee>
                  <Standee at={[dx, dy + 6]} up={villageP}>
                    <NamePlate x={0} y={-6} text="دومريمي" color="#146c3a" fs={34} />
                  </Standee>
                  {hopePop > 0.02 && (
                    <Standee at={[dx, dy - 10]}>
                      <g transform={`translate(24 -14) scale(${hopePop})`}>
                        <Person x={0} y={0} s={0.92} frame={f} {...look('joanOfArc', {variant: 'village'})} expr="determined" pose="stand" shading="cel" light={{...LIGHTS.golden, dir: 1}} />
                      </g>
                      <Embers id="s09e" x={0} y={-20} frame={f} n={26} spread={420} rise={420} size={3.6} life={90} wind={20} color="#ffe08a" />
                    </Standee>
                  )}
                </>
              )}
            </>
          );
        }}
      >
        {({xy}) => {
          const [rx, ry] = xy(CITIES_1429.reims.pos);
          const [dx, dy] = xy(CITIES_1429.domremy.pos);
          const [bx, by] = xy([3.5, 46.4]);
          const pulse = (f % 42) / 42;
          return (
            <MapFlat>
              {/* طريق محاصر من الجنوب إلى ريمس */}
              {reimsArrowP > 0.05 && !domremy && (
                <g fill="none" strokeLinecap="round" opacity={reimsArrowP}>
                  <path d={`M ${bx} ${by} Q ${bx - 150} ${(by + ry) / 2} ${rx - 6} ${ry + 14}`} stroke={INK} strokeWidth={16} strokeDasharray="26 20" strokeDashoffset={-f} />
                  <path d={`M ${bx} ${by} Q ${bx - 150} ${(by + ry) / 2} ${rx - 6} ${ry + 14}`} stroke="#ffd447" strokeWidth={9} strokeDasharray="26 20" strokeDashoffset={-f} />
                </g>
              )}
              {domremy && (
                <g fill="none">
                  <circle cx={dx} cy={dy} r={16 + pulse * 130} stroke="#4be07a" strokeWidth={6} opacity={1 - pulse} />
                  <circle cx={dx} cy={dy} r={14 + ((pulse + 0.5) % 1) * 130} stroke="#ffd95a" strokeWidth={5} opacity={1 - ((pulse + 0.5) % 1)} />
                </g>
              )}
            </MapFlat>
          );
        }}
      </MapTable>
      <ColorGrade p={{...WAR_TABLE, gradeTop: mix('#ffd8a0', '#6a7ad0', dark * (1 - hope * 0.8)), gradeBottom: mix('#3a2418', '#0c1030', dark * (1 - hope * 0.5))}} lightAt={domremy ? [50, 44] : [12, 78]} lightStrength={0.22 + 0.02 * Math.sin(f * 0.6)} />
      {domremy && (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            background: `radial-gradient(ellipse at 50% 46%, rgba(255, 224, 130, ${0.16 * hope}) 0%, rgba(12, 14, 36, ${0.1 * dark}) 34%, rgba(8, 10, 30, ${0.74 * dark}) 100%)`,
          }}
        />
      )}
      <SoftFilm frame={f} />
      <Hud>
        {!domremy && (
          <>
            <TitleBanner y={82} title="فرنسا — ١٤٢٨" accent="#c8242e" />
            <MapLegend x={1490} y={36} />
          </>
        )}
        {hopePop > 0.02 && domremy && (
          <g transform={`translate(960 118) scale(${hopePop})`}>
            <rect x={-290} y={-44} width={592} height={100} rx={22} fill="#000" opacity={0.35} />
            <rect x={-296} y={-50} width={592} height={100} rx={22} fill="#8a6414" stroke={INK} strokeWidth={6} />
            <rect x={-296} y={-60} width={592} height={100} rx={22} fill="#1f4896" stroke={INK} strokeWidth={6} />
            <rect x={-282} y={-46} width={564} height={72} rx={14} fill="none" stroke="#f2c43a" strokeWidth={4} />
            <text x={0} y={10} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={54} fill="#fff6dc" direction="rtl">
              جان دارك
            </text>
          </g>
        )}
      </Hud>
    </>
  );
};

/** كاتدرائية ريمس مجسّمة */
const ReimsCathedral: React.FC = () => (
  <g stroke={INK} strokeWidth={5} strokeLinejoin="round">
    <ellipse cx={14} cy={-2} rx={150} ry={22} fill="#000" opacity={0.4} stroke="none" />
    <rect x={-86} y={-170} width={172} height={170} fill="#e6dcc6" />
    <path d="M -86 -170 L 0 -236 L 86 -170 Z" fill="#6a7e9c" />
    {[-1, 1].map((sd) => (
      <g key={sd} transform={`translate(${sd * 92} 0)`}>
        <rect x={-38} y={-260} width={76} height={260} fill="#efe6d2" />
        <rect x={10} y={-260} width={28} height={260} fill="#b8a888" opacity={0.65} stroke="none" />
        <path d="M -46 -260 L 0 -344 L 46 -260 Z" fill="#5e7290" />
        <path d="M 10 -260 L 0 -344 L 46 -260 Z" fill="#33425c" opacity={0.6} stroke="none" />
        <path d="M 0 -344 L 0 -376 M -10 -364 L 10 -364" stroke="#e8b830" strokeWidth={6} />
        {[-230, -150].map((y) => (
          <path key={y} d={`M -12 ${y + 52} L -12 ${y + 14} Q 0 ${y - 8} 12 ${y + 14} L 12 ${y + 52} Z`} fill="#4a5a78" strokeWidth={4} />
        ))}
      </g>
    ))}
    <circle cx={0} cy={-128} r={36} fill="#f2c43a" />
    {Array.from({length: 8}, (_, i) => (
      <line key={i} x1={0} y1={-128} x2={Math.cos((i * Math.PI) / 4) * 36} y2={-128 + Math.sin((i * Math.PI) / 4) * 36} strokeWidth={3.5} />
    ))}
    <circle cx={0} cy={-128} r={11} fill="#c8242e" strokeWidth={3.5} />
    <path d="M -26 0 L -26 -50 Q 0 -86 26 -50 L 26 0 Z" fill="#3a2e28" />
  </g>
);

/** خلفية قرية: كنيسة صغيرة وأكواخ بنوافذ تضيء مع الأمل */
const VillageBack: React.FC<{f: number; lit: number}> = ({f, lit}) => {
  const win = mix('#4a5468', '#ffd067', lit);
  const wall = mix('#b8ac9c', '#f0e2c4', lit);
  const roof = mix('#6a4a40', '#a8603c', lit);
  const cottage = (x: number, s: number, k: number) => (
    <g key={k} transform={`translate(${x} 0) scale(${s})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
      <rect x={-64} y={-84} width={128} height={84} fill={wall} />
      <rect x={26} y={-84} width={38} height={84} fill="#000" opacity={0.2} stroke="none" />
      <path d="M -82 -82 L -46 -154 L 46 -154 L 82 -82 Z" fill={roof} />
      <path d="M 20 -154 L 46 -154 L 82 -82 L 34 -82 Z" fill="#000" opacity={0.22} stroke="none" />
      <rect x={-44} y={-62} width={30} height={30} fill={win} strokeWidth={4} />
      <rect x={8} y={-54} width={30} height={54} rx={4} fill="#5a3a22" strokeWidth={4} />
      <rect x={30} y={-186} width={22} height={44} fill={mix('#7a6a62', '#a89080', lit)} strokeWidth={4} />
      {[0, 1, 2].map((i) => {
        const p = ((f * 0.012 + i * 0.33 + k * 0.2) % 1 + 1) % 1;
        return <circle key={i} cx={41 + p * 26} cy={-190 - p * 90} r={8 + p * 14} fill="#d8d4cc" stroke="none" opacity={0.4 * (1 - p)} />;
      })}
    </g>
  );
  return (
    <g>
      <path d="M -360 6 Q -200 -70 0 -50 Q 200 -76 360 6 Z" fill={mix('#2e4a34', '#5c9648', lit)} stroke={INK} strokeWidth={5} />
      <g transform="translate(130 -34) scale(0.95)" stroke={INK} strokeWidth={5} strokeLinejoin="round">
        <rect x={-34} y={-220} width={68} height={220} fill={wall} />
        <rect x={8} y={-220} width={26} height={220} fill="#000" opacity={0.2} stroke="none" />
        <path d="M -44 -218 L 0 -306 L 44 -218 Z" fill={mix('#4a5468', '#6a84a8', lit)} />
        <path d="M 0 -306 L 0 -336 M -10 -324 L 10 -324" stroke="#e8b830" strokeWidth={6} />
        <rect x={-10} y={-190} width={20} height={38} rx={10} fill={win} strokeWidth={4} />
        <rect x={34} y={-110} width={96} height={110} fill={wall} />
        <path d="M 28 -108 L 56 -156 L 136 -156 L 140 -108 Z" fill={roof} />
        <rect x={66} y={-80} width={22} height={36} rx={11} fill={win} strokeWidth={4} />
      </g>
      {cottage(-250, 0.9, 1)}
      {cottage(-110, 1.05, 2)}
      {cottage(300, 0.8, 3)}
    </g>
  );
};

const Sheep: React.FC<{x: number; y: number; f: number; flip?: boolean}> = ({x, y, f, flip}) => (
  <g transform={`translate(${x} ${y - Math.abs(Math.sin(f / 18)) * 3}) scale(${flip ? -0.62 : 0.62} 0.62)`} stroke={INK} strokeWidth={5}>
    {[-16, 14].map((lx) => (
      <line key={lx} x1={lx} x2={lx} y1={-16} y2={0} strokeWidth={8} strokeLinecap="round" />
    ))}
    <path d="M -34 -22 Q -46 -44 -26 -50 Q -18 -68 4 -60 Q 26 -68 32 -48 Q 46 -38 32 -20 Q 10 -8 -34 -22 Z" fill="#f6f0e4" />
    <ellipse cx={40} cy={-44} rx={15} ry={18} fill="#4a3c34" />
    <circle cx={44} cy={-48} r={3} fill="#fff" stroke="none" />
  </g>
);

/* ================= المرحلة 3: مجسّم حصار أورليان بمنظور حقيقي ================= */
const TH = 50; // ميل أرض المجسّم
const GW = 4200;
const GH = 3000;
const gx0 = 960 - GW / 2;
const gy0 = 540 - GH / 2;
const dioPlane: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: 1920,
  height: 1080,
  transformStyle: 'preserve-3d',
  transformOrigin: '50% 50%',
  transform: `translateZ(-60px) rotateX(${TH}deg)`,
};
/** من إحداثيات المشهد المسطّح إلى أرض المجسّم */
const GY = (y: number) => 470 + (y - 540) * 1.35;

const dioToScreen = (x: number, y: number, h: number, cam: Cam) => {
  const a = (TH * Math.PI) / 180;
  return projectWorld(x - 960, (y - 540) * Math.cos(a) - h, (y - 540) * Math.sin(a) - 60, cam);
};

const ROW_W = 3400;
const ROW_UP = 520;
/** صف واقف: كل العناصر ذات نفس القاعدة في لوحة واحدة (أخف من لوحة لكل عنصر) */
const Row: React.FC<{y: number; children: React.ReactNode}> = ({y, children}) => (
  <div
    style={{
      position: 'absolute',
      left: 960 - ROW_W / 2,
      top: y - ROW_UP,
      width: ROW_W,
      height: ROW_UP + 60,
      transformOrigin: `50% ${ROW_UP}px`,
      transform: `translateZ(4px) rotateX(${-TH}deg)`,
    }}
  >
    <svg width={ROW_W} height={ROW_UP + 60} viewBox={`${960 - ROW_W / 2} ${-ROW_UP} ${ROW_W} ${ROW_UP + 60}`} style={{overflow: 'visible'}}>
      {children}
    </svg>
  </div>
);

type DioItem = {x: number; y: number; el: React.ReactNode};

const CITY = {x: 960, y: GY(400), rx: 360, ry: 250};

const SiegeGround: React.FC = React.memo(() => {
  const r0 = GY(655);
  const r1 = GY(845);
  return (
    <div style={{position: 'absolute', left: gx0, top: gy0, width: GW, height: GH}}>
      <svg width={GW} height={GH} viewBox={`${gx0} ${gy0} ${GW} ${GH}`}>
        <defs>
          <linearGradient id="s09g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#b8c89a" />
            <stop offset="40%" stopColor="#86ae62" />
            <stop offset="100%" stopColor="#567e3c" />
          </linearGradient>
          <linearGradient id="s09rv" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7cc0e8" />
            <stop offset="100%" stopColor="#2f78b4" />
          </linearGradient>
        </defs>
        <rect x={gx0} y={gy0} width={GW} height={GH} fill="url(#s09g)" />
        {/* حقول مرقّعة */}
        {scatter('s09fld', 70, gx0, gx0 + GW, gy0, r0 - 60).map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${(p.r - 0.5) * 24})`} opacity={0.55}>
            <rect x={-110} y={-60} width={180 + p.r * 120} height={90 + p.p * 14} rx={10} fill={['#a8bc6a', '#7aa050', '#c8b46a', '#8cb05c'][i % 4]} />
            {i % 2 === 0 && [0, 1, 2, 3].map((k) => <line key={k} x1={-100} x2={80 + p.r * 90} y1={-40 + k * 26} y2={-40 + k * 26} stroke="#5c7a38" strokeWidth={4} opacity={0.5} />)}
          </g>
        ))}
        {/* أرض الحصار المداسة حول المدينة */}
        <ellipse cx={CITY.x} cy={CITY.y} rx={CITY.rx + 330} ry={CITY.ry + 240} fill="#9c8a5e" opacity={0.6} />
        <ellipse cx={CITY.x} cy={CITY.y} rx={CITY.rx + 70} ry={CITY.ry + 60} fill="#6a5a3c" opacity={0.7} />
        {/* خندق ثم أرض المدينة */}
        <ellipse cx={CITY.x} cy={CITY.y} rx={CITY.rx + 34} ry={CITY.ry + 30} fill="#4a86b0" stroke={INK} strokeWidth={5} />
        <ellipse cx={CITY.x} cy={CITY.y} rx={CITY.rx} ry={CITY.ry} fill="#d8c8a6" stroke={INK} strokeWidth={5} />
        {[0, 36, 72, 108, 144].map((a) => (
          <line key={a} x1={CITY.x - Math.cos((a * Math.PI) / 180) * CITY.rx} y1={CITY.y - Math.sin((a * Math.PI) / 180) * CITY.ry} x2={CITY.x + Math.cos((a * Math.PI) / 180) * CITY.rx} y2={CITY.y + Math.sin((a * Math.PI) / 180) * CITY.ry} stroke="#b8a47c" strokeWidth={16} />
        ))}
        {/* نهر اللوار */}
        <path d={`M ${gx0} ${r0 - 10} Q 300 ${r0 - 60} 960 ${r0} Q 1600 ${r0 + 60} ${gx0 + GW} ${r0 - 30} L ${gx0 + GW} ${r1 - 20} Q 1600 ${r1 + 60} 960 ${r1} Q 300 ${r1 - 50} ${gx0} ${r1 + 10} Z`} fill="#c8b480" transform="translate(0 -14)" />
        <path d={`M ${gx0} ${r0 - 10} Q 300 ${r0 - 60} 960 ${r0} Q 1600 ${r0 + 60} ${gx0 + GW} ${r0 - 30} L ${gx0 + GW} ${r1 - 20} Q 1600 ${r1 + 60} 960 ${r1} Q 300 ${r1 - 50} ${gx0} ${r1 + 10} Z`} fill="url(#s09rv)" stroke={INK} strokeWidth={6} />
        <text x={1470} y={(r0 + r1) / 2 - 6} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={72} fill="#eaf8ff" opacity={0.95} direction="rtl" stroke="#2a6ca4" strokeWidth={10} style={{paintOrder: 'stroke'}}>
          نهر اللوار
        </text>
        {/* طريق الجسر جنوباً */}
        <path d={`M 924 ${r1 - 6} L 996 ${r1 - 6} L 1080 ${gy0 + GH} L 840 ${gy0 + GH} Z`} fill="#c8ac78" />
        {/* الجسر */}
        <rect x={922} y={r0 - 50} width={76} height={r1 - r0 + 70} fill="#c8bca4" stroke={INK} strokeWidth={6} />
        {Array.from({length: 7}, (_, i) => (
          <line key={i} x1={922} x2={998} y1={r0 - 26 + i * 44} y2={r0 - 26 + i * 44} stroke="#8f836e" strokeWidth={5} />
        ))}
        <rect x={912} y={r0 - 50} width={14} height={r1 - r0 + 70} fill="#a89a80" stroke={INK} strokeWidth={4} />
        <rect x={994} y={r0 - 50} width={14} height={r1 - r0 + 70} fill="#a89a80" stroke={INK} strokeWidth={4} />
      </svg>
    </div>
  );
});

/** قطعة سور بشرفات، وكل رابعة برج */
const WallPiece: React.FC<{x: number; tower: boolean; w: number; front: boolean}> = ({x, tower, w, front}) => {
  const c = front ? '#cfc2a8' : '#b4a68c';
  return (
    <g transform={`translate(${x} 0)`} stroke={INK} strokeWidth={4} strokeLinejoin="round">
      {tower ? (
        <>
          <rect x={-38} y={-142} width={76} height={148} fill={mix(c, '#ffffff', 0.1)} />
          <rect x={8} y={-142} width={30} height={148} fill="#000" opacity={0.18} stroke="none" />
          <path d="M -50 -140 L 0 -218 L 50 -140 Z" fill="#3a64b4" />
          <path d="M 8 -140 L 0 -218 L 50 -140 Z" fill="#000" opacity={0.24} stroke="none" />
          <rect x={-7} y={-110} width={14} height={34} rx={7} fill="#3a322c" />
        </>
      ) : (
        <>
          {[0, 1, 2].map((k) => (
            <rect key={k} x={-w / 2 + 4 + (k * w) / 3} y={-98} width={w / 5} height={22} fill={c} />
          ))}
          <rect x={-w / 2} y={-80} width={w} height={86} fill={c} />
          <path d={`M ${-w / 2} -50 H ${w / 2} M ${-w / 2} -22 H ${w / 2} M ${-w / 6} -80 V -50 M ${w / 5} -50 V -22 M ${-w / 4} -22 V 6`} stroke="#8f836e" strokeWidth={2.5} fill="none" />
        </>
      )}
    </g>
  );
};

const House: React.FC<{x: number; s: number; roof: string}> = ({x, s, roof}) => (
  <g transform={`translate(${x} 0) scale(${s})`} stroke={INK} strokeWidth={4} strokeLinejoin="round">
    <rect x={-30} y={-46} width={60} height={50} fill="#f0e6d2" />
    <rect x={10} y={-46} width={20} height={50} fill="#000" opacity={0.15} stroke="none" />
    <path d="M -40 -44 L 0 -92 L 40 -44 Z" fill={roof} />
    <rect x={-18} y={-32} width={14} height={16} fill="#5a6a88" strokeWidth={3} />
  </g>
);

const OrleansSiege: React.FC<{f: number; t: number; t0: number; endT: number; booms: number[]}> = ({f, t, t0, endT, booms}) => {
  const F = (s: number) => Math.round(s * FPS);
  const D = endT - t0;
  const cam = camAt(f, [
    {f: F(t0), x: 0, y: -60, z: 420, rx: -6, ry: 0, fov: 44},
    {f: F(t0 + 1.4), x: 0, y: 10, z: 40, rx: 0, ry: -3, fov: 46},
    {f: F(t0 + D * 0.4), x: -150, y: 10, z: 130, ry: -8},
    {f: F(t0 + D * 0.72), x: 150, y: 16, z: 110, ry: 7},
    {f: F(endT), x: 0, y: -20, z: 280, ry: 0, rx: -2},
  ]);
  const boomNow = Math.max(0, ...booms.map((b) => (t >= b && t < b + 0.6 ? 1 - (t - b) / 0.6 : 0)));
  cam.x += Math.sin(f * 4.1) * 10 * boomNow;
  cam.y += Math.cos(f * 3.7) * 8 * boomNow + 24;
  const ringPulse = (f % 36) / 36;

  // ---------- كل العناصر الواقفة ----------
  const items: DioItem[] = [];
  const N = 36;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const x = CITY.x + Math.cos(a) * CITY.rx;
    const y = CITY.y + Math.sin(a) * CITY.ry;
    const tower = i % 4 === 0;
    const w = Math.max(26, Math.abs(Math.sin(a)) * ((2 * Math.PI * CITY.rx) / N) + 12);
    items.push({x, y: y + (tower ? 2 : 0), el: <WallPiece key={`w${i}`} x={x} tower={tower} w={w} front={Math.sin(a) > 0} />});
  }
  scatter('s09hs', 46, -1, 1, -1, 1).forEach((p, i) => {
    if (p.x * p.x + p.y * p.y > 0.72 || (Math.abs(p.x) < 0.24 && Math.abs(p.y) < 0.3)) return;
    items.push({x: CITY.x + p.x * CITY.rx, y: CITY.y + p.y * CITY.ry, el: <House key={`h${i}`} x={CITY.x + p.x * CITY.rx} s={0.72 + p.r * 0.3} roof={['#a8503c', '#8c4434', '#b8684a'][i % 3]} />});
  });
  // كاتدرائية الصليب المقدس وسط المدينة وراية فرنسا
  items.push({
    x: CITY.x,
    y: CITY.y + 20,
    el: (
      <g key="cath" transform={`translate(${CITY.x} 0) scale(0.62)`}>
        <ReimsCathedral />
        <g stroke={INK} strokeWidth={6}>
          <line x1={0} x2={0} y1={-236} y2={-430} stroke="#5a3818" strokeWidth={9} />
          <path d={`M 4 -426 Q 60 ${-440 + Math.sin(f / 6) * 10} 124 ${-420 + Math.sin(f / 6 - 1) * 12} L 124 ${-346 + Math.sin(f / 6 - 1) * 12} Q 60 ${-362 + Math.sin(f / 6) * 10} 4 -350 Z`} fill="#2452a4" />
          <circle cx={62} cy={-390} r={13} fill="#f2c43a" strokeWidth={4} />
        </g>
      </g>
    ),
  });
  // قلعة ليه توريل جنوب الجسر
  const toury = GY(862);
  items.push({
    x: 960,
    y: toury,
    el: (
      <g key="tour" transform="translate(960 0)" stroke={INK} strokeWidth={5} strokeLinejoin="round">
        <rect x={-100} y={-74} width={200} height={84} fill="#9e9484" />
        <path d="M -30 10 L -30 -30 Q 0 -60 30 -30 L 30 10 Z" fill="#3a2e28" />
        {[-92, 92].map((x) => (
          <g key={x} transform={`translate(${x} 0)`}>
            <rect x={-40} y={-140} width={80} height={152} fill="#b4a894" />
            <rect x={8} y={-140} width={32} height={152} fill="#000" opacity={0.2} stroke="none" />
            <path d="M -52 -138 L 0 -212 L 52 -138 Z" fill="#b8242e" />
            <path d={`M 0 -212 L 0 -262 L ${46 + Math.sin(f / 6 + x) * 5} -248 L 0 -234`} fill="#fbf8ef" strokeWidth={4} />
          </g>
        ))}
      </g>
    ),
  });
  // خيام ومدافع وجنود الحصار
  const tents: [number, number][] = [
    [330, 250], [420, 400], [300, 540], [470, 590], [560, 190], [1600, 250], [1500, 400], [1620, 540], [1450, 590], [1360, 190],
    [760, 130], [960, 100], [1160, 130], [180, 400], [1740, 400],
  ];
  tents.forEach(([x, y], i) => items.push({x, y: GY(y), el: <g key={`t${i}`} transform={`translate(${x} 0) scale(${1.55 + (i % 3) * 0.18})`}><SiegeTent x={0} y={0} s={1} /></g>}));
  const cannons: [number, number, boolean][] = [[520, 330, false], [535, 480, false], [1400, 330, true], [1385, 480, true], [760, 205, false], [1160, 205, true]];
  cannons.forEach(([x, y, fl], i) =>
    items.push({
      x,
      y: GY(y),
      el: (
        <g key={`c${i}`} transform={`translate(${x} 0) scale(1.7)`}>
          <SiegeCannon x={0} y={0} flip={fl} frame={f} seed={i + 1} />
          {(f + (i + 1) * 19) % 45 < 4 && <path d="M 0 -16 L 5 -5 L 16 0 L 5 5 L 0 16 L -5 5 L -16 0 L -5 -5 Z" transform={`translate(${fl ? -28 : 28} -24)`} fill="#ffe054" stroke={INK} strokeWidth={2} />}
        </g>
      ),
    }),
  );
  scatter('s09sol', 78, 0, Math.PI * 2, 0, 1).forEach((p, i) => {
    const rr = 1.28 + p.y * 0.62;
    const x = CITY.x + Math.cos(p.x) * (CITY.rx + 40) * rr;
    const y = CITY.y + Math.sin(p.x) * (CITY.ry + 30) * rr;
    if (y > GY(640)) return;
    items.push({x, y, el: <g key={`s${i}`} transform={`translate(${x + Math.sin(f / 40 + p.p) * 8} 0) scale(1.35)`}><TinyRedSoldier x={0} y={0} frame={f} seed={i + 1} /></g>});
  });
  // أشجار ودخان
  scatter('s09tree', 60, -500, 2400, -700, 1000).forEach((p, i) => {
    const gyv = p.y;
    const inCity = ((p.x - CITY.x) / (CITY.rx + 360)) ** 2 + ((gyv - CITY.y) / (CITY.ry + 250)) ** 2 < 1;
    if (inCity || (gyv > GY(600) && gyv < GY(880))) return;
    items.push({x: p.x, y: gyv, el: <g key={`tr${i}`} transform={`translate(${p.x} 0)`}><RoundTree x={0} y={0} h={110 + p.r * 70} c={i % 3 ? '#5f8f48' : '#4a7a3c'} /></g>});
  });
  [[CITY.x - 190, CITY.y - 30], [CITY.x + 210, CITY.y + 60]].forEach(([x, y], i) => items.push({x, y, el: <Smoke key={`sm${i}`} id={`s09sm${i}`} x={x} y={-40} frame={f + i * 50} color="#3a3230" n={9} size={26} rise={360} drift={110} opacity={0.5} />}));

  const rows = new Map<number, DioItem[]>();
  items.forEach((it) => {
    const k = Math.round(it.y / 26) * 26;
    rows.set(k, [...(rows.get(k) ?? []), it]);
  });
  const rowList = [...rows.entries()].sort((a, b) => a[0] - b[0]);

  const lblO = dioToScreen(CITY.x, CITY.y + CITY.ry, -10, cam);
  const lblT = dioToScreen(960, toury, 190, cam);

  return (
    <>
      <Sky background="linear-gradient(#8ab4d8 0%, #d8dcc0 30%, #b8c89a 60%)" />
      <LitStage cam={cam} light={LIGHTS.day}>
        <div style={dioPlane}>
          <SiegeGround />
          <div style={{position: 'absolute', left: gx0, top: gy0, width: GW, height: GH, transform: 'translateZ(1px)'}}>
            <svg width={GW} height={GH} viewBox={`${gx0} ${gy0} ${GW} ${GH}`}>
              <ellipse cx={CITY.x} cy={CITY.y} rx={CITY.rx + 60 + ringPulse * 130} ry={CITY.ry + 55 + ringPulse * 105} fill="none" stroke="#ff2e24" strokeWidth={13} opacity={0.9 * (1 - ringPulse)} />
              {scatter('s09wv', 46, gx0 + 600, gx0 + GW - 600, GY(668), GY(836)).map((p, i) => (
                <path key={i} d={`M ${p.x + ((f * 1.6) % 200)} ${p.y} q 26 -9 52 0`} fill="none" stroke="#e8f8ff" strokeWidth={5} strokeLinecap="round" opacity={0.3 + 0.4 * Math.sin(f / 14 + p.p) ** 2} />
              ))}
              {/* ظلال سحب عابرة */}
              {[0, 1, 2].map((i) => (
                <ellipse key={i} cx={-200 + i * 1100 + ((f * 2.2) % 1500)} cy={120 + i * 260} rx={420} ry={170} fill="#12203a" opacity={0.13} />
              ))}
            </svg>
          </div>
        </div>
      </LitStage>
      <LitStage cam={cam} light={LIGHTS.day}>
        <div style={dioPlane}>
          {rowList.map(([y, its]) => (
            <Row key={y} y={y}>
              {its.map((it, i) => (
                <g key={i}>
                  <ellipse cx={it.x + 10} cy={0} rx={30} ry={8} fill="#000" opacity={0.22} />
                  {it.el}
                </g>
              ))}
            </Row>
          ))}
        </div>
      </LitStage>
      <LitStage cam={cam} light={LIGHTS.day}>
        {/* سحب رقيقة قريبة ورايات إنجليزية خارج التركيز */}
        <Layer d={-120} opacity={0.5}>
          <Art>
            <Cloud id="s09c1" x={-100 + f * 0.9} y={90} w={900} h={70} lit="#ffffff" shade="#d8e4ec" opacity={0.6} />
            <Cloud id="s09c2" x={1700 + f * 0.7} y={60} w={1000} h={80} lit="#ffffff" shade="#d8e4ec" opacity={0.6} />
          </Art>
        </Layer>
        <Layer d={-330} blur={9}>
          <Art>
            {[70, 1850].map((x, i) => (
              <g key={x} transform={`translate(${x} 1300)`}>
                <rect x={-13} y={-640} width={26} height={900} fill="#4a3018" />
                <path d={`M 12 -630 Q ${110 * (i ? -1 : 1)} ${-650 + Math.sin(f / 7 + i) * 22} ${230 * (i ? -1 : 1)} ${-610 + Math.sin(f / 7 + i) * 22} L ${230 * (i ? -1 : 1)} -450 Q ${110 * (i ? -1 : 1)} ${-480 + Math.sin(f / 7 + i) * 22} 12 -460 Z`} fill="#f2ece0" />
                <path d={`M 12 -545 Q ${110 * (i ? -1 : 1)} ${-566 + Math.sin(f / 7 + i) * 22} ${230 * (i ? -1 : 1)} ${-530 + Math.sin(f / 7 + i) * 22}`} fill="none" stroke="#c8242e" strokeWidth={36} />
              </g>
            ))}
            <Smoke id="s09fg" x={300} y={1150} frame={f} color="#d8d0c0" n={9} size={80} rise={420} drift={260} opacity={0.34} />
          </Art>
        </Layer>
      </LitStage>
      <ColorGrade p={{...CLEAR_DAY, gradeTop: '#ffd8a0', gradeBottom: '#3a1c1c', gradeOpacity: 0.3}} lightAt={[24, 10]} lightStrength={0.22} />
      <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(circle at 50% 45%, transparent 52%, rgba(190, 24, 24, ${0.16 + 0.1 * Math.sin(f * 0.18) + boomNow * 0.25}) 100%)`}} />
      <SoftFilm frame={f} />
      {boomNow > 0.7 && <AbsoluteFill style={{background: '#fff0c8', opacity: (boomNow - 0.7) * 1.1, pointerEvents: 'none'}} />}
      <Hud>
        <NamePlate x={lblO.x} y={lblO.y + 6} text="أورليان" color="#2452a4" fs={48} />
        <NamePlate x={lblT.x + 320} y={lblT.y} text="قلعة ليه توريل" color="#a8202a" fs={36} />
        <TitleBanner y={82} title="أورليان — أكتوبر ١٤٢٨" accent="#c8242e" />
      </Hud>
      <AbsoluteFill style={{background: '#1a100a', opacity: 1 - easeOut(prog(t, t0, t0 + 0.45)), pointerEvents: 'none'}} />
    </>
  );
};
