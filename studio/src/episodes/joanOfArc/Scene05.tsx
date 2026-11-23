import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {extra, look} from '../../cast';
import {Person} from '../../characters/Person';
import {SwearBubble, TitleBanner} from '../../lib/comicFx';
import {ColorGrade, Smoke} from '../../lib/fx';
import {Cam, camAt} from '../../lib/stage';
import {INK, clamp, easeInOut, easeOut, easeOutBack, lerp, prog} from '../../lib/util';
import {MapBattleIcon, makeProjection} from '../../world/maps/MapEngine';
import {CIVIL_WAR_BURGUNDY} from '../../world/maps/france1429';
import type {LonLat} from '../../world/maps/europeData';
import {GamePiece} from './MapPieces';
import {MapFlat, MapTable, Standee, mapToScreen} from './MapTable';
import {Hud, SoftFilm, WAR_TABLE} from './stage3d';
import {FPS, SceneTrackAudio, SceneTrackSubtitles, bubbleOf, buildTrack, talkOf} from './audioHelper';

/* =====================================================================
 * المشهد ٥ — الحرب الأهلية (الأرمانياك vs بورغوندي) + هنري الخامس بالمنظار
 * ===================================================================== */

export const SCENE05_TRACK = buildTrack(
  [
    {kind: 'pause', sec: 0.35},
    {kind: 'clip', id: 's05_nar_1', padAfter: 0.2},
    {kind: 'clip', id: 's05_nar_2', padAfter: 0.25},
    {kind: 'pause', sec: 1.1}, // انسحاب الكاميرا شمالاً فوق القناة + هنري الخامس ينظر بالمنظار
    {kind: 'clip', id: 's05_henry5_1', padAfter: 0.25},
  ],
  0.65,
);

/** الخط المتعرج لانقسام فرنسا (إحداثيات جغرافية حقيقية) */
const JAGGED_SPLIT: LonLat[] = [
  [2.2, 50.8],
  [2.85, 49.9],
  [2.15, 49.2],
  [3.1, 48.5],
  [2.55, 47.8],
  [3.6, 47.1],
  [3.2, 46.3],
  [4.3, 45.6],
  [4.7, 44.6],
];

const MAP_CENTER: LonLat = [1.4, 49.3];
const MAP_ZOOM = 0.92;
const MAP_COLORS = {FRA: '#2b5eb8', GBR: '#c8242e'};
const HENRY_AT: LonLat = [-1.3, 51.75];

/** سفينة حربية إنجليزية صغيرة من العصور الوسطى على القناة */
const WarCogShip: React.FC<{x: number; y: number; frame: number; seed: number; scale?: number}> = ({x, y, frame, seed, scale = 1}) => {
  const bob = Math.sin(frame * 0.2 + seed * 1.9) * 5;
  const tilt = Math.sin(frame * 0.16 + seed) * 4;
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${tilt}) scale(${scale})`} stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
      {/* السارية والشراع الأبيض بصليب إنجلترا الأحمر */}
      <line x1={0} y1={-4} x2={0} y2={-64} stroke="#5a3818" strokeWidth={5} />
      <path d="M -28 -54 Q 6 -44 26 -54 Q 32 -32 22 -14 Q 0 -22 -26 -14 Q -20 -34 -28 -54 Z" fill="#fbf8ef" />
      <path d="M 0 -52 L 0 -16 M -22 -34 L 22 -34" stroke="#c8242e" strokeWidth={6} />
      {/* بدن السفينة الخشبي */}
      <path d="M -38 -4 L 38 -4 L 28 16 Q 0 22 -28 16 Z" fill="#7c4e26" />
      <path d="M -42 14 Q -20 22 0 16 Q 20 22 42 14" fill="none" stroke="#e4f5ff" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

/** لمعة طمع كرتونية ذهبية بجانب العين */
const GreedSparkle: React.FC<{x: number; y: number; frame: number; scale?: number}> = ({x, y, frame, scale = 1}) => {
  const p = 0.75 + 0.3 * Math.sin(frame * 0.65);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * p}) rotate(${frame * 2.5})`}>
      <path
        d="M 0 -26 L 6 -6 L 26 0 L 6 6 L 0 26 L -6 6 L -26 0 L -6 -6 Z"
        fill="#ffe054"
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
    </g>
  );
};

export const Scene05: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;

  const c1 = SCENE05_TRACK.byId.s05_nar_1;
  const c2 = SCENE05_TRACK.byId.s05_nar_2;
  const cHenry = SCENE05_TRACK.byId.s05_henry5_1;

  const SPLIT_T = c1.t0 + 2.3;
  const PULLBACK_T = c2.t1 + 0.12;
  const SHIPS_T = cHenry.t0 + 3.0;

  const sfx = [
    {at: SPLIT_T, name: 'doorSlam', vol: 0.78, dur: 0.55},
    {at: SPLIT_T + 0.15, name: 'clang', vol: 0.5, dur: 1.0},
    {at: c2.t0 + 0.3, name: 'pop', vol: 0.55, dur: 0.3},
    {at: c2.t0 + 1.4, name: 'pop', vol: 0.55, dur: 0.3},
    {at: PULLBACK_T + 0.5, name: 'pop', vol: 0.6, dur: 0.3},
    {at: SHIPS_T, name: 'trumpet', vol: 0.62, dur: 1.3},
  ];

  // تقدم الانقسام وانسحاب الكاميرا
  const splitP = easeOut(prog(t, SPLIT_T, SPLIT_T + 0.55));
  const splitShake = t >= SPLIT_T && t < SPLIT_T + 0.35 ? Math.sin(f * 4.4) * 11 : 0;
  const chaosP = easeOutBack(prog(t, c2.t0 + 0.25, c2.t0 + 0.75));
  const pullP = easeInOut(prog(t, PULLBACK_T, PULLBACK_T + 1.0));
  const henryPop = easeOutBack(prog(t, PULLBACK_T + 0.35, PULLBACK_T + 0.85));
  const shipsPop = easeOutBack(prog(t, SHIPS_T, SHIPS_T + 0.45));

  const henryTalk = talkOf(SCENE05_TRACK, 's05_henry5_1', t);
  const henryBub = bubbleOf(SCENE05_TRACK, 's05_henry5_1', t);
  const henrySpeaking = t >= cHenry.t0 - 0.05;

  // ---------- كاميرا طاولة الحرب: فوق فرنسا ← ضربة الانقسام ← انسحاب شمالاً فوق القناة ----------
  const F = (sec: number) => Math.round(sec * FPS);
  const cam = camAt(f, [
    {f: 0, x: 40, y: 120, z: 40, rx: 5, ry: -3, fov: 45},
    {f: F(SPLIT_T), x: 80, y: 175, z: 150, rx: 2, ry: 0},
    {f: F(SPLIT_T) + 10, z: 215},
    {f: F(c2.t0), x: 95, y: 190, z: 190, ry: 2},
    {f: F(PULLBACK_T), x: 70, y: 200, z: 235, rx: 0, ry: 2},
    {f: F(PULLBACK_T + 1.15), x: -20, y: -250, z: 60, rx: -2, ry: -2},
    {f: F(SHIPS_T), x: -10, y: -245, z: 95, ry: 0},
    {f: SCENE05_TRACK.durationFrames, x: 20, y: -240, z: 140, rx: -1, ry: 2},
  ]);
  cam.x += splitShake;
  cam.y += splitShake * 0.5;

  return (
    <AbsoluteFill style={{background: '#1a100a'}}>
      <MapTable
        id="s05"
        cam={cam}
        frame={f}
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        colors={MAP_COLORS}
        territories={[{id: 'civil-burg', clipTo: 'FRA', polygon: CIVIL_WAR_BURGUNDY, fill: '#7b2242', opacity: 0.96 * splitP}]}
        pieces={({xy}) => {
          const shrink = lerp(1, 0.74, pullP);
          const ships: LonLat[] = [
            [-2.5, 50.0],
            [-0.6, 50.15],
            [0.95, 50.4],
          ];
          return (
            <>
              {/* دخان الحرائق يتصاعد من باريس أثناء الفوضى */}
              {chaosP > 0.05 && pullP < 0.9 && (
                <Standee at={xy([2.35, 48.86])}>
                  <g opacity={clamp(chaosP * (1 - pullP), 0, 1)}>
                    <Smoke id="s05sm" x={0} y={-10} frame={f} color="#2c2026" n={9} rise={360} size={30} drift={70} opacity={0.55} />
                  </g>
                </Standee>
              )}

              {/* المعسكران قطعتا لعب على جانبي الانقسام */}
              {splitP > 0.08 && (
                <>
                  <Standee at={xy([0.1, 46.45])} up={easeOutBack(splitP)} scale={shrink}>
                    <GamePiece label="الأرمانياك — أنصار ابن الملك" color="#1d3e8a" w={372} fs={31}>
                      <Person x={0} y={0} s={0.98} frame={f} {...extra('medievalNoble', 1, {robe: '#244b96', trim: '#1a3875'})} act="angry" energy={0.95} shading="cel" />
                    </GamePiece>
                  </Standee>
                  <Standee at={xy([5.35, 46.75])} up={easeOutBack(splitP)} scale={shrink}>
                    <GamePiece label="دوق بورغوندي" color="#6b1a36" w={270} fs={33}>
                      <Person x={0} y={0} s={0.98} flip frame={f + 7} {...look('philipGood')} act="angry" energy={0.95} shading="cel" />
                    </GamePiece>
                  </Standee>
                  <Standee at={xy([2.7, 47.55])} z={70}>
                    <SwearBubble x={0} y={-190} frame={f} scale={lerp(1.2, 0.8, pullP)} />
                  </Standee>
                </>
              )}

              {/* السفن الإنجليزية في القناة */}
              {shipsPop > 0.02 &&
                ships.map((pt, i) => (
                  <Standee key={i} at={xy(pt)} z={8}>
                    <WarCogShip x={Math.min(60, Math.max(0, t - SHIPS_T) * (9 + i * 3))} y={-18} frame={f} seed={i + 1} scale={Math.max(0, shipsPop) * 1.25} />
                  </Standee>
                ))}

              {/* هنري الخامس يطل من إنجلترا بالمنظار */}
              {henryPop > 0.02 && (
                <Standee at={xy(HENRY_AT)} up={henryPop} scale={1.12}>
                  <GamePiece label="الملك هنري الخامس — إنجلترا" color="#8a1620" w={380} fs={31}>
                    <Person
                      x={0}
                      y={0}
                      s={1.16}
                      frame={f}
                      {...look('henry5')}
                      expr={henrySpeaking ? 'happy' : 'idea'}
                      pose={henrySpeaking ? 'armsUp' : 'present'}
                      holdR={!henrySpeaking ? 'spyglass' : undefined}
                      talk={henryTalk}
                      shading="cel"
                    />
                    <GreedSparkle x={-64} y={-262} frame={f} scale={0.85} />
                    <GreedSparkle x={66} y={-256} frame={f + 6} scale={0.74} />
                  </GamePiece>
                </Standee>
              )}
            </>
          );
        }}
      >
        {({proj}) => (
            <>
              {/* خط الانقسام المتوهّج المحفور في الأرض */}
              {splitP > 0.02 && (
                <MapFlat>
                  <g fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={splitP}>
                    <path d={proj.pathOf(JAGGED_SPLIT, false)} stroke="#ff9a2c" strokeWidth={46} opacity={0.2 + 0.1 * Math.sin(f * 0.3)} />
                    <path d={proj.pathOf(JAGGED_SPLIT, false)} stroke="#ffd447" strokeWidth={20} opacity={0.85} />
                    <path d={proj.pathOf(JAGGED_SPLIT, false)} stroke="#2a0c08" strokeWidth={9} />
                  </g>
                </MapFlat>
              )}
              {chaosP > 0.05 && pullP < 0.8 && (
                <MapFlat z={30}>
                  <g opacity={clamp(chaosP * (1 - pullP * 1.2), 0, 1)}>
                    <MapBattleIcon proj={proj} pos={[0.9, 49.6]} frame={f} scale={1.0} />
                    <MapBattleIcon proj={proj} pos={[6.9, 48.6]} frame={f + 9} scale={0.92} />
                    <MapBattleIcon proj={proj} pos={[2.2, 45.6]} frame={f + 4} scale={0.86} />
                  </g>
                </MapFlat>
              )}
            </>
        )}
      </MapTable>
      <ColorGrade p={WAR_TABLE} lightAt={[12, 78]} lightStrength={0.22 + 0.02 * Math.sin(f * 0.6)} />
      <SoftFilm frame={f} />
      <Hud>
        {pullP < 0.75 && (
          <g opacity={1 - pullP * 1.35}>
            <TitleBanner y={88} title="حرب أهلية فرنسية — الأرمانياك ضد بورغوندي" accent="#7b2242" />
          </g>
        )}
        {henryBub && <HenryBubble cam={cam} age={henryBub.age} left={henryBub.left} />}
      </Hud>
      <SceneTrackAudio track={SCENE05_TRACK} sfx={sfx} />
      <SceneTrackSubtitles track={SCENE05_TRACK} hideDialogue />
    </AbsoluteFill>
  );
};

/** فقاعة هنري الخامس على يمينه (تتبع موقعه على الشاشة مع حركة الكاميرا) */
const HenryBubble: React.FC<{cam: Cam; age: number; left: number}> = ({cam, age, left}) => {
  const head = mapToScreen(makeProjection(MAP_CENTER, MAP_ZOOM).toXY(HENRY_AT), cam, 290);
  const pop = Math.min(1, age / 0.22);
  const sc = pop < 1 ? 0.5 + 0.5 * easeOutBack(pop) : 1;
  const op = Math.min(1, age / 0.12, left / 0.2);
  const tipX = head.x + 105 * head.s;
  const bx = tipX + 360;
  const by = Math.max(110, head.y - 30);
  return (
    <g opacity={op} transform={`translate(${tipX} ${by}) scale(${sc}) translate(${-tipX} ${-by})`}>
      <rect x={bx - 310} y={by - 88} width={620} height={164} rx={26} fill="#fffdf6" stroke={INK} strokeWidth={5} />
      <path d={`M ${bx - 308} ${by - 10} L ${tipX} ${by + 14} L ${bx - 308} ${by + 32} Z`} fill="#fffdf6" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={bx - 311} y={by - 7} width={10} height={36} fill="#fffdf6" />
      <text x={bx} y={by - 20} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={40} fill="#1c1622" direction="rtl">
        يا إلهي.. إنهم يدمّرون أنفسهم مجاناً!
      </text>
      <text x={bx} y={by + 38} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={42} fill="#b8242e" direction="rtl">
        يا رفاق، جهّزوا السفن!
      </text>
    </g>
  );
};
