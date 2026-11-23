import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {extra, look} from '../../cast';
import {Person} from '../../characters/Person';
import {FlipCalendar, TitleBanner} from '../../lib/comicFx';
import {SpeechBubble} from '../../lib/dialogue';
import {ColorGrade, Halo} from '../../lib/fx';
import {Art, Layer, camAt} from '../../lib/stage';
import {INK, clamp, easeOut, easeOutBack, lerp, prog, scatter} from '../../lib/util';
import type {LonLat} from '../../world/maps/europeData';
import {BURGUNDY_1429, ENGLISH_GUYENNE_1429, ENGLISH_NORTH_1429} from '../../world/maps/france1429';
import {GamePiece} from './MapPieces';
import {MapFlat, MapTable, Standee} from './MapTable';
import {CurtainStage, NamePlate, Podium} from './sets';
import {Hud, LIGHTS, PALACE_DAY, SoftFilm, WAR_TABLE, gy, mix, toScreen} from './stage3d';
import {FPS, SceneTrackAudio, SceneTrackSubtitles, bubbleOf, buildTrack, talkOf} from './audioHelper';

/* =====================================================================
 * المشهد ٨ — مفاجأة ١٤٢٢ وتتويج الملك الرضيع هنري السادس (٩ أشهر!)
 * ===================================================================== */

export const SCENE08_TRACK = buildTrack(
  [
    {kind: 'pause', sec: 0.35},
    {kind: 'clip', id: 's08_nar_1', padAfter: 0.25},
    {kind: 'clip', id: 's08_nar_2', padAfter: 0.18},
    {kind: 'clip', id: 's08_baby_1', padAfter: 0.2},
    {kind: 'clip', id: 's08_noble_1', padAfter: 0.2},
  ],
  0.65,
);

/** شبح كرتوني لطيف صغير يرتفع للأعلى مع تاج صغير */
const MiniGhost: React.FC<{x: number; y: number; frame: number; tilted?: boolean; opacity: number}> = ({x, y, frame, tilted, opacity}) => {
  if (opacity <= 0.01) return null;
  const sway = Math.sin(frame * 0.25) * 8;
  return (
    <g transform={`translate(${x + sway} ${y})`} opacity={opacity}>
      <path
        d="M -38 18 L -38 -24 Q -38 -62 0 -62 Q 38 -62 38 -24 L 38 18 Q 28 6 18 18 Q 9 6 0 18 Q -9 6 -18 18 Q -28 6 -38 18 Z"
        fill="#f4f8ff"
        fillOpacity={0.9}
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <circle cx={-12} cy={-26} r={5} fill={INK} />
      <circle cx={12} cy={-26} r={5} fill={INK} />
      <ellipse cx={0} cy={-8} rx={7} ry={9} fill={INK} />
      {/* تاج صغير فوق الشبح */}
      <g transform={`translate(0 -66) rotate(${tilted ? 16 : 0}) scale(0.55)`} stroke={INK} strokeWidth={5}>
        <path d="M -36 8 L -40 -26 L -16 -8 L 0 -32 L 16 -8 L 40 -26 L 36 8 Z" fill="#f2c43a" />
      </g>
    </g>
  );
};

const MAP_CENTER: LonLat = [1.1, 49.4];
const MAP_ZOOM = 0.86;
const MAP_COLORS = {FRA: '#2b5eb8', GBR: '#c8242e'};

export const Scene08: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;

  const c1 = SCENE08_TRACK.byId.s08_nar_1;
  const c2 = SCENE08_TRACK.byId.s08_nar_2;
  const cBaby = SCENE08_TRACK.byId.s08_baby_1;

  const HENRY_GONE_T = c1.t0 + 3.4;
  const CHARLES_GONE_T = c1.t0 + 7.2;
  const MAP_Q_T = c2.t0 - 0.1;
  const SPOTLIGHT_T = c2.t0 + 3.0;

  const sfx = [
    {at: 0.2, name: 'pop', vol: 0.5, dur: 0.25},
    {at: HENRY_GONE_T, name: 'whoosh', vol: 0.55, dur: 0.45},
    {at: CHARLES_GONE_T, name: 'glass', vol: 0.72, dur: 0.75},
    {at: MAP_Q_T + 0.15, name: 'pop', vol: 0.65, dur: 0.3},
    {at: SPOTLIGHT_T, name: 'trumpet', vol: 0.62, dur: 1.3},
    {at: cBaby.t0 + 0.15, name: 'pop', vol: 0.6, dur: 0.3},
  ];

  let view: React.ReactNode;
  if (t < MAP_Q_T) view = <TwoKings f={f} t={t} henryT={HENRY_GONE_T} charlesT={CHARLES_GONE_T} endT={MAP_Q_T} />;
  else if (t < SPOTLIGHT_T) view = <QuestionMap f={f} t={t} at={MAP_Q_T} endT={SPOTLIGHT_T} />;
  else view = <BabyThrone f={f} t={t} at={SPOTLIGHT_T} />;

  return (
    <AbsoluteFill style={{background: '#0d0b12'}}>
      {view}
      <SceneTrackAudio track={SCENE08_TRACK} sfx={sfx} />
      <SceneTrackSubtitles track={SCENE08_TRACK} hideDialogue />
    </AbsoluteFill>
  );
};

/* ================= المرحلة 1: ١٤٢٢ — منصتان، وملكان ينطفئ ضوء كل منهما ================= */
const TwoKings: React.FC<{f: number; t: number; henryT: number; charlesT: number; endT: number}> = ({f, t, henryT, charlesT, endT}) => {
  const calYear = t < 0.55 ? '١٤٢٠' : t < 1.0 ? '١٤٢١' : '١٤٢٢';
  const flip = t < 1.1 ? Math.abs(Math.sin(t * 7)) * 0.12 : 0;
  const henryP = easeOut(prog(t, henryT, henryT + 0.9));
  const charlesP = easeOut(prog(t, charlesT, charlesT + 0.7));
  const coughing = t >= henryT - 0.8 && t < henryT;
  const coughShake = coughing ? Math.sin(f * 3.8) * 9 : 0;
  const F = (s: number) => Math.round(s * FPS);
  const cam = camAt(f, [
    {f: 0, x: 0, y: -90, z: 120, ry: 0, rx: 2, fov: 46},
    {f: F(1.3), x: 0, y: -60, z: 90, rx: 1},
    {f: F(2.2), x: -80, y: 0, z: 0, ry: -4, rx: 0},
    {f: F(henryT), x: -190, y: -6, z: 170, ry: -5},
    {f: F(henryT + 1.4), x: -150, y: -20, z: 130, ry: -3},
    {f: F(charlesT) - 12, x: 180, y: -6, z: 150, ry: 5},
    {f: F(charlesT) + 10, x: 200, y: 0, z: 200, ry: 4},
    {f: F(endT), x: 0, y: -20, z: 10, ry: 0},
  ]);
  cam.y += 128;
  if (t >= charlesT && t < charlesT + 0.3) cam.x += Math.sin(f * 4.2) * 9;
  const A = 230;
  const py = gy(A) - 30;
  const light = {
    ...LIGHTS.palace,
    rim: 0.7,
    points: [
      {x: 520, y: 260, color: henryP < 0.9 ? '#ffe0a0' : '#8090d0', r: 560},
      {x: 1400, y: 260, color: charlesP < 0.9 ? '#ffe0a0' : '#8090d0', r: 560},
    ],
  };
  const gone = (henryP + charlesP) / 2;

  return (
    <>
      <CurtainStage
        id="s08a"
        f={f}
        cam={cam}
        c={mix('#7c1c30', '#26305e', gone)}
        dark={mix('#4a0e1c', '#10162e', gone)}
        glow={mix('#ffd48a', '#8aa4ff', gone)}
        light={light}
        palette={{...PALACE_DAY, gradeTop: mix('#ffe2ac', '#8a9aff', gone), gradeBottom: mix('#4a1a24', '#0c0e2c', gone)}}
      >
        {/* التقويم معلّق بحبلين */}
        <Layer d={420}>
          <Art>
            <g transform={`rotate(${Math.sin(f / 24) * 1.6} 960 -300)`}>
              <line x1={880} x2={880} y1={-600} y2={215} stroke={INK} strokeWidth={10} />
              <line x1={880} x2={880} y1={-600} y2={215} stroke="#d9b060" strokeWidth={5} />
              <line x1={1040} x2={1040} y1={-600} y2={215} stroke={INK} strokeWidth={10} />
              <line x1={1040} x2={1040} y1={-600} y2={215} stroke="#d9b060" strokeWidth={5} />
              <rect x={842} y={188} width={270} height={244} rx={18} fill="#000" opacity={0.35} />
              <g transform={`translate(960 300) scale(1.2 ${1.2 - flip})`}>
                <FlipCalendar x={0} y={0} year={calYear} sub="عام المفاجآت" scale={1} />
              </g>
            </g>
          </Art>
        </Layer>
        <Layer d={A}>
          <Art>
            <Podium x={520} y={py} w={215} on={1 - henryP * 0.85} c="#a8202a" />
            <Podium x={1400} y={py} w={215} on={1 - charlesP * 0.85} c="#244b96" />
            {/* هنري الخامس يسعل ثم يرتفع شبحه */}
            <g transform={`translate(${520 + coughShake} ${py})`}>
              <g opacity={1 - henryP}>
                <Person x={0} y={0} s={1.36} frame={f} {...look('henry5')} expr={t >= henryT - 0.8 ? 'strain' : 'happy'} pose={t >= henryT - 0.8 ? 'cower' : 'raise'} holdR="longsword" shading="cel" />
              </g>
              {henryP > 0.05 && <Halo id="s08gh" cx={0} cy={lerp(-260, -520, henryP)} r={190} color="#c8d8ff" opacity={0.6 * Math.sin(henryP * Math.PI)} />}
              <g transform="scale(1.5)">
                <MiniGhost x={0} y={lerp(-150, -330, henryP)} frame={f} opacity={henryP > 0.05 ? clamp(Math.sin(henryP * Math.PI) * 1.6, 0, 0.95) : 0} />
              </g>
              {/* تاج يسقط ويبقى على المنصة */}
              {henryP > 0.3 && (
                <g transform={`translate(0 ${lerp(-260, -14, easeOutBounce(prog(t, henryT + 0.3, henryT + 0.95)))}) rotate(${lerp(0, 14, henryP)})`}>
                  <FallenCrown />
                </g>
              )}
            </g>
            {/* شارل السادس يسقط كالزجاج */}
            <g transform={`translate(1400 ${py})`}>
              <g transform={`rotate(${charlesP * 86} 0 -15)`} opacity={1 - charlesP}>
                <Person x={0} y={0} s={1.34} flip frame={f + 5} {...look('charles6')} expr={t >= charlesT - 0.4 ? 'shock' : 'dizzy'} pose="stand" shading="cel" />
              </g>
              {charlesP > 0.2 && (
                <g stroke={INK} strokeWidth={3} fill="#dff6ff">
                  {scatter('s08sh', 26, -1, 1, 0, 1).map((p, i) => {
                    const u = prog(t, charlesT + 0.15, charlesT + 1.2);
                    const gx = p.x * 260 * easeOut(u);
                    const gyy = -120 - p.y * 220 * Math.sin(Math.min(1, u * 1.1) * Math.PI) + u * u * 110;
                    return <polygon key={i} points="0,-20 14,8 -12,12" transform={`translate(${gx} ${Math.min(0, gyy)}) rotate(${i * 47 + f * 7 * (1 - u)}) scale(${0.6 + p.r})`} opacity={1 - prog(t, charlesT + 1.2, charlesT + 2.2) * 0.4} />;
                  })}
                </g>
              )}
              {charlesP > 0.05 && <Halo id="s08gc" cx={0} cy={lerp(-250, -500, charlesP)} r={190} color="#c8f0ff" opacity={0.6 * Math.sin(charlesP * Math.PI)} />}
              <g transform="scale(1.5)">
                <MiniGhost x={0} y={lerp(-145, -320, charlesP)} frame={f + 7} tilted opacity={charlesP > 0.05 ? clamp(Math.sin(charlesP * Math.PI) * 1.6, 0, 0.95) : 0} />
              </g>
            </g>
          </Art>
        </Layer>
        <Layer d={A - 30}>
          <Art>
            <NamePlate x={520} y={py + 70} text="هنري الخامس — ١٤٢٢" color="#b8242e" fs={38} />
            <NamePlate x={1400} y={py + 70} text="شارل السادس — بعد شهرين" color="#244b96" fs={38} />
          </Art>
        </Layer>
      </CurtainStage>
      <Hud>
        {coughing &&
          (() => {
            const at = toScreen(660, py - 330, A, cam);
            return (
              <g transform={`translate(${at.x} ${at.y}) rotate(${Math.sin(f * 1.4) * 6})`}>
                <text x={0} y={0} textAnchor="middle" direction="rtl" fontFamily="Amiri" fontWeight={700} fontSize={72} fill="#ffd447" stroke={INK} strokeWidth={12} style={{paintOrder: 'stroke'}} strokeLinejoin="round">
                  كح! كح!
                </text>
              </g>
            );
          })()}
      </Hud>
    </>
  );
};

const easeOutBounce = (x: number) => {
  const n = 7.5625;
  const d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x - 1.5 / d) ** 2 + 0.75;
  if (x < 2.5 / d) return n * (x - 2.25 / d) ** 2 + 0.9375;
  return n * (x - 2.625 / d) ** 2 + 0.984375;
};

const FallenCrown: React.FC = () => (
  <g stroke={INK} strokeWidth={5} strokeLinejoin="round">
    <path d="M -52 8 L -60 -56 L -26 -24 L 0 -68 L 26 -24 L 60 -56 L 52 8 Z" fill="#f2c43a" />
    <path d="M 16 8 L 24 -26 L 60 -56 L 52 8 Z" fill="#b8821a" opacity={0.6} stroke="none" />
    <rect x={-56} y={0} width={112} height={18} rx={5} fill="#dba61e" />
    <circle cx={0} cy={9} r={6} fill="#c8242e" strokeWidth={2} />
  </g>
);

/* ================= المرحلة 2: علامة استفهام مجسّمة فوق خريطة المملكتين ================= */
const QuestionMap: React.FC<{f: number; t: number; at: number; endT: number}> = ({f, t, at, endT}) => {
  const qPop = easeOutBack(prog(t, at, at + 0.45));
  const qB = Math.sin(f * 0.2) * 14;
  const F = (s: number) => Math.round(s * FPS);
  const cam = camAt(f, [
    {f: F(at), x: -60, y: -60, z: -260, rx: 6, ry: -7, fov: 48},
    {f: F(at + 0.9), x: 0, y: -30, z: 60, rx: 1, ry: 0, fov: 45},
    {f: F(endT), x: 30, y: -40, z: 200, rx: 0, ry: 6},
  ]);
  return (
    <>
      <MapTable
        id="s08"
        cam={cam}
        frame={f}
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        colors={MAP_COLORS}
        territories={[
          {id: 'e-n', clipTo: 'FRA', polygon: ENGLISH_NORTH_1429, fill: '#c8242e', opacity: 0.9},
          {id: 'e-s', clipTo: 'FRA', polygon: ENGLISH_GUYENNE_1429, fill: '#c8242e', opacity: 0.9},
          {id: 'b-e', clipTo: 'FRA', polygon: BURGUNDY_1429, fill: '#7b2242', opacity: 0.9},
        ]}
        pieces={({xy}) => (
          <>
            {/* تاجا المملكتين بلا صاحب */}
            {[
              [-1.5, 52.0, '#c8242e'],
              [2.4, 46.6, '#2452a4'],
            ].map(([lo, la, c], i) => (
              <Standee key={i} at={xy([lo as number, la as number])}>
                <GamePiece color={c as string} w={190} label={i ? 'عرش فرنسا' : 'عرش إنجلترا'} fs={31}>
                  <g transform={`translate(0 ${-40 + Math.sin(f * 0.15 + i * 2) * 8}) scale(1.15)`}>
                    <FallenCrown />
                  </g>
                </GamePiece>
              </Standee>
            ))}
            <Standee at={xy([1.0, 48.9])} z={60}>
              <g transform={`translate(0 ${-210 + qB}) scale(${qPop})`}>
                <Halo id="s08q" cx={0} cy={0} r={330} color="#ffd447" opacity={0.6} />
                {[16, 12, 8, 4].map((k) => (
                  <text key={k} x={k} y={130 + k} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={420} fill="#8a5a08" stroke={INK} strokeWidth={10} style={{paintOrder: 'stroke'}}>
                    ؟
                  </text>
                ))}
                <text x={0} y={130} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={420} fill="#ffd447" stroke={INK} strokeWidth={14} style={{paintOrder: 'stroke'}}>
                  ؟
                </text>
              </g>
            </Standee>
          </>
        )}
      >
        {({xy}) => {
          const [x, y] = xy([1.0, 48.9]);
          return (
            <MapFlat>
              <ellipse cx={x + 20} cy={y} rx={120 + qB} ry={46} fill="#000" opacity={0.35 * clamp(qPop)} />
            </MapFlat>
          );
        }}
      </MapTable>
      <ColorGrade p={WAR_TABLE} lightAt={[12, 78]} lightStrength={0.22 + 0.02 * Math.sin(f * 0.6)} />
      <SoftFilm frame={f} strength={0.4} />
      <Hud>
        <TitleBanner y={96} title="من سيصبح ملك إنجلترا وفرنسا معاً؟" accent="#c8242e" scale={easeOutBack(prog(t, at + 0.2, at + 0.55))} />
      </Hud>
    </>
  );
};

/* ================= المرحلة 3: العرش الضخم والملك الرضيع هنري السادس ================= */
const BabyThrone: React.FC<{f: number; t: number; at: number}> = ({f, t, at}) => {
  const cBaby = SCENE08_TRACK.byId.s08_baby_1;
  const cNoble = SCENE08_TRACK.byId.s08_noble_1;
  const spotP = easeOut(prog(t, at, at + 0.55));
  const babyTalk = talkOf(SCENE08_TRACK, 's08_baby_1', t);
  const nobleTalk = talkOf(SCENE08_TRACK, 's08_noble_1', t);
  const babyBub = bubbleOf(SCENE08_TRACK, 's08_baby_1', t);
  const nobleBub = bubbleOf(SCENE08_TRACK, 's08_noble_1', t);
  const babyBanging = t >= cBaby.t0 && t <= cBaby.t1 + 0.25;
  const noblePop = easeOutBack(prog(t, cNoble.t0 - 0.35, cNoble.t0 + 0.1));
  const F = (s: number) => Math.round(s * FPS);
  const cam = camAt(f, [
    {f: F(at), x: 0, y: 60, z: -380, rx: -3, ry: 0, fov: 54},
    {f: F(at + 1.1), x: 0, y: -10, z: 20, rx: 0, fov: 46},
    {f: F(cBaby.t0) - 6, x: 0, y: -20, z: 120},
    {f: F(cBaby.t0) + 8, x: 0, y: -40, z: 420, ry: 0, fov: 42},
    {f: F(cBaby.t1), x: 20, y: -36, z: 440, ry: 2},
    {f: F(cNoble.t0), x: 170, y: -10, z: 110, ry: 4, fov: 45},
    {f: SCENE08_TRACK.durationFrames, x: 200, y: -20, z: 200, ry: 6},
  ]);
  cam.y += 36;
  if (babyBanging) cam.y += Math.sin(f * 1.4) * 3;
  const TD = 330;
  const ty = gy(TD) - 30;
  const ND = 130;
  const seatY = ty - 168;
  const headB = toScreen(960, seatY - 190, TD - 20, cam);
  const headN = toScreen(1500, gy(ND) - 385, ND, cam);
  const light = {...LIGHTS.royal, points: [{x: 960, y: 200, color: '#ffe8a0', r: 900}]};

  return (
    <>
      <CurtainStage
        id="s08b"
        f={f}
        cam={cam}
        c="#3a1a5a"
        dark="#180a2c"
        glow={mix('#3a2a5a', '#ffd87a', spotP)}
        light={light}
        palette={{...PALACE_DAY, gradeTop: '#c8a0ff', gradeBottom: '#120624', light: '#ffe8b0'}}
        rays={0.1 * spotP}
        floorA="#2c2044"
        floorB="#362850"
        vignette={0.5}
      >
        {/* مخاريط الضوء */}
        <Layer d={560}>
          <Art>
            <defs>
              <linearGradient id="s08sp" x1="0.5" x2="0.5" y1="0" y2="1">
                <stop offset="0%" stopColor="#fff3b0" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#fff3b0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <g opacity={spotP}>
              {[300, 960, 1620].map((x, i) => (
                <polygon key={x} points={`${x - 50},-320 ${x + 50},-320 ${1240 + Math.sin(f / 30 + i) * 16},900 ${680 + Math.sin(f / 30 + i) * 16},900`} fill="url(#s08sp)" opacity={i === 1 ? 0.75 : 0.55} />
              ))}
            </g>
          </Art>
        </Layer>
        {/* حراس شرف */}
        <Layer d={480}>
          <Art>
            {[360, 560, 1360, 1560].map((x, i) => (
              <Person key={x} x={x} y={gy(480)} s={1.0} flip={x > 960} frame={f + i * 9} {...extra('englishSoldier', i + 1)} expr={babyBanging ? 'shock' : 'neutral'} pose="stand" holdR="spear" view={22} shading="cel" />
            ))}
          </Art>
        </Layer>
        {/* العرش الضخم على درجات */}
        <Layer d={TD}>
          <Art>
            <ellipse cx={960} cy={ty + 60} rx={470} ry={44} fill="#000" opacity={0.45} />
            <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
              <path d={`M 560 ${ty + 62} L 600 ${ty + 24} L 1320 ${ty + 24} L 1360 ${ty + 62} Z`} fill="#7a1628" />
              <path d={`M 620 ${ty + 24} L 654 ${ty - 10} L 1266 ${ty - 10} L 1300 ${ty + 24} Z`} fill="#941c30" />
              <path d={`M 690 ${ty - 10} L 716 ${ty - 40} L 1204 ${ty - 40} L 1230 ${ty - 10} Z`} fill="#ac243a" />
            </g>
            <g transform={`translate(960 ${ty - 36})`} stroke={INK} strokeWidth={6} strokeLinejoin="round">
              <path d="M -214 -60 L -214 -500 Q -214 -590 0 -614 Q 214 -590 214 -500 L 214 -60 Z" fill="#b8862a" />
              <path d="M -202 -70 L -202 -502 Q -202 -578 0 -600 Q 202 -578 202 -502 L 202 -70 Z" fill="#ecbe4a" />
              <path d="M 120 -70 L 120 -586 Q 202 -566 202 -502 L 202 -70 Z" fill="#9a6c18" opacity={0.5} stroke="none" />
              <path d="M -160 -90 L -160 -486 Q -160 -544 0 -560 Q 160 -544 160 -486 L 160 -90 Z" fill="#a01e34" />
              {[-100, -34, 34, 100].map((x) => [-450, -370, -290, -210].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={7} fill="#f2c43a" strokeWidth={3} />))}
              <path d="M -160 -486 Q -160 -544 0 -560 Q 160 -544 160 -486 L 160 -420 Q 0 -470 -160 -420 Z" fill="#fff" opacity={0.12} stroke="none" />
              <g transform="translate(0 -640)">
                <FallenCrown />
              </g>
              {[-206, 206].map((x) => (
                <circle key={x} cx={x} cy={-520} r={24} fill="#f2c43a" />
              ))}
              <rect x={-182} y={-132} width={364} height={110} rx={16} fill="#c8384a" />
              <path d="M -182 -120 Q 0 -150 182 -120 L 182 -96 Q 0 -124 -182 -96 Z" fill="#e8586a" stroke="none" />
              <rect x={-262} y={-206} width={70} height={196} rx={16} fill="#ecbe4a" />
              <rect x={192} y={-206} width={70} height={196} rx={16} fill="#c8922a" />
              <rect x={-222} y={-52} width={444} height={46} rx={10} fill="#ecbe4a" />
            </g>
            <Halo id="s08th" cx={960} cy={seatY - 60} r={420} color="#ffe9a0" opacity={0.4 * spotP} />
          </Art>
        </Layer>
        {/* الملك الرضيع (صغير جداً وسط العرش) */}
        <Layer d={TD - 20}>
          <Art>
            <Person x={960} y={seatY + 16 + (babyBanging ? Math.sin(f * 1.4) * 8 : 0)} s={0.74} frame={f} {...look('henry6Baby')} expr="happy" pose={babyBanging ? 'swing' : 'raise'} holdR="rattle" talk={babyTalk} shading="cel" />
            {babyBanging &&
              [0, 1, 2].map((i) => {
                const p = ((f * 0.06 + i * 0.33) % 1 + 1) % 1;
                return <path key={i} d="M 0 -18 L 5 -5 L 18 0 L 5 5 L 0 18 L -5 5 L -18 0 L -5 -5 Z" transform={`translate(${880 - p * 70 + i * 60} ${seatY - 130 - p * 80}) scale(${1.2 - p * 0.6})`} fill="#ffe054" stroke={INK} strokeWidth={3} opacity={1 - p} />;
              })}
          </Art>
        </Layer>
        <Layer d={TD - 70}>
          <Art>
            <NamePlate x={960} y={ty + 44} text="الملك هنري السادس — العمر: ٩ أشهر فقط!" color="#9c1e2e" fs={38} />
          </Art>
        </Layer>
        {/* نبيل يدوّن بجدية تامة */}
        <Layer d={ND}>
          <Art>
            {noblePop > 0.02 && (
              <Person
                x={lerp(2220, 1500, clamp(noblePop))}
                y={gy(ND)}
                s={1.38}
                flip
                frame={f + 3}
                {...extra('medievalNoble', 3, {robe: '#9e1e2b', trim: '#c8242e'})}
                expr="idea"
                pose="read"
                holdR="quill"
                holdL="book"
                talk={nobleTalk}
                shading="cel"
              />
            )}
          </Art>
        </Layer>
        {/* ظهور النبلاء في المقدمة */}
        <Layer d={-280} blur={8}>
          <Art>
            {[120, 520, 1320, 1780].map((x, i) => (
              <g key={x} transform={`translate(${x} ${1330 + (i % 2) * 30 + Math.sin(f / 18 + i) * 5})`} fill="#0e0818">
                <circle cx={0} cy={-190} r={78} />
                <path d="M -70 -220 L -78 -268 L -38 -240 L 0 -280 L 38 -240 L 78 -268 L 70 -220 Z" opacity={i % 2 ? 1 : 0} />
                <path d="M -130 60 Q -130 -110 0 -118 Q 130 -110 130 60 Z" />
              </g>
            ))}
          </Art>
        </Layer>
      </CurtainStage>
      <Hud>
        {babyBub && <SpeechBubble text={babyBub.text} style="say" headX={headB.x} headTop={Math.max(190, headB.y)} s={1} age={babyBub.age} left={babyBub.left} side={-1} />}
        {nobleBub && <SpeechBubble text={nobleBub.text} style="say" headX={headN.x} headTop={Math.max(230, headN.y)} s={1.1} age={nobleBub.age} left={nobleBub.left} side={-1} />}
      </Hud>
    </>
  );
};
