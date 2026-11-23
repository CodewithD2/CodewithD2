import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {extra, look} from '../../cast';
import {Person} from '../../characters/Person';
import {BigStamp, DizzyBirds} from '../../lib/comicFx';
import {SpeechBubble} from '../../lib/dialogue';
import {ColorGrade, Halo, Motes, Smoke} from '../../lib/fx';
import {Art, Cam, Layer, Sky, camAt} from '../../lib/stage';
import {INK, clamp, easeOut, easeOutBack, lerp, prog, scatter} from '../../lib/util';
import {ACT_D, ACT_Y, Fleur, Floor3D, FloorTiles, G0, Hud, LIGHTS, LitStage, Masonry, PALACE_DAY, Rays, SoftFilm, Wall3D, gy, kOf, mix, toScreen} from './stage3d';
import {FPS, SceneTrackAudio, SceneTrackSubtitles, bubbleOf, buildTrack, talkOf} from './audioHelper';

/* =====================================================================
 * المشهد ٤ — الملك شارل السادس «المجنون» ووهم الزجاج والقضبان الحديدية
 * ===================================================================== */

export const SCENE04_TRACK = buildTrack(
  [
    {kind: 'pause', sec: 0.3},
    {kind: 'clip', id: 's04_nar_1', padAfter: 0.25},
    {kind: 'clip', id: 's04_nar_2', padAfter: 0.22},
    {kind: 'clip', id: 's04_nar_3', padAfter: 0.14},
    {kind: 'clip', id: 's04_charles6_1', padAfter: 0.28},
    {kind: 'clip', id: 's04_nar_4', padAfter: 0.24},
    {kind: 'clip', id: 's04_nar_5', padAfter: 0.2},
  ],
  0.55,
);

/* ================= قاعة القصر الملكي: صندوق بمنظور حقيقي ================= */
const D1 = 900; // عمق الجدار الخلفي
const WX = 1170; // نصف عرض القاعة في العالم
const CEIL = -600; // ارتفاع السقف في العالم
const WALL_TOP = 540 + CEIL;
const WALL_H = G0 - CEIL;
const BK = kOf(D1);
const BX0 = 960 - WX / BK;
const BX1 = 960 + WX / BK;
const BY0 = 540 + CEIL / BK;
const BY1 = gy(D1);

const WALL_C = '#e4d3b2';
const WALL_D = '#c0a67e';
const WOOD = '#6a4428';

/** نافذة قوطية بزجاج ملون وسماء خلفها */
const GothicWin: React.FC<{id: string; x: number; y: number; w: number; h: number}> = ({id, x, y, w, h}) => {
  const d = `M ${x - w / 2} ${y} L ${x - w / 2} ${y - h * 0.62} Q ${x - w / 2} ${y - h * 0.88} ${x} ${y - h} Q ${x + w / 2} ${y - h * 0.88} ${x + w / 2} ${y - h * 0.62} L ${x + w / 2} ${y} Z`;
  return (
    <g>
      <defs>
        <clipPath id={`gw-${id}`}>
          <path d={d} />
        </clipPath>
        <linearGradient id={`gwg-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8cc8f2" />
          <stop offset="60%" stopColor="#d8eefa" />
          <stop offset="100%" stopColor="#fff2cc" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke={WALL_D} strokeWidth={34} />
      <path d={d} fill={`url(#gwg-${id})`} stroke={INK} strokeWidth={6} />
      <g clipPath={`url(#gw-${id})`}>
        {Array.from({length: 4}, (_, r) =>
          [0, 1].map((c) => (
            <rect key={`${r}${c}`} x={x - w / 2 + c * (w / 2)} y={y - h * 0.62 + r * h * 0.155} width={w / 2} height={h * 0.155} fill={['#e86a5a', '#5a8ae0', '#f2c43a', '#6ab87a'][(r + c * 2) % 4]} opacity={0.3} />
          )),
        )}
        <circle cx={x} cy={y - h * 0.72} r={w * 0.2} fill="#c8384a" opacity={0.6} />
        <circle cx={x} cy={y - h * 0.72} r={w * 0.1} fill="#f2c43a" opacity={0.85} />
        <path d={`M ${x - w} ${y - h * 0.2} L ${x + w * 0.2} ${y - h * 1.1} L ${x + w * 0.5} ${y - h * 1.1} L ${x - w * 0.6} ${y} Z`} fill="#fff" opacity={0.26} />
      </g>
      <g stroke={INK} strokeWidth={4} fill="none">
        <line x1={x} x2={x} y1={y - h} y2={y} />
        {[0.155, 0.31, 0.465, 0.62].map((k) => (
          <line key={k} x1={x - w / 2} x2={x + w / 2} y1={y - h * k} y2={y - h * k} />
        ))}
        <circle cx={x} cy={y - h * 0.72} r={w * 0.2} />
      </g>
      <rect x={x - w / 2 - 22} y={y} width={w + 44} height={18} fill="#d8c49c" stroke={INK} strokeWidth={5} />
    </g>
  );
};

/** عمود رخامي بتاج وقاعدة وتدرّج استدارة */
const Column: React.FC<{id: string; x: number; top: number; by: number; w: number}> = ({id, x, top, by, w}) => (
  <g>
    <defs>
      <linearGradient id={`col-${id}`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stopColor="#f6ead0" />
        <stop offset="30%" stopColor="#fff8e6" />
        <stop offset="70%" stopColor="#c8b08a" />
        <stop offset="100%" stopColor="#8c7258" />
      </linearGradient>
    </defs>
    <ellipse cx={x + w * 0.3} cy={by} rx={w * 1.1} ry={w * 0.2} fill="#000" opacity={0.28} />
    <g stroke={INK} strokeWidth={5}>
      <rect x={x - w / 2} y={top} width={w} height={by - top} fill={`url(#col-${id})`} />
      <g stroke="#a88e68" strokeWidth={3} opacity={0.7}>
        {[-0.28, -0.06, 0.16, 0.34].map((k) => (
          <line key={k} x1={x + w * k} x2={x + w * k} y1={top + 60} y2={by - 40} />
        ))}
      </g>
      <path d={`M ${x - w * 0.5} ${top + 70} L ${x - w * 0.74} ${top + 14} L ${x + w * 0.74} ${top + 14} L ${x + w * 0.5} ${top + 70} Z`} fill="#e8b830" />
      <rect x={x - w * 0.82} y={top - 10} width={w * 1.64} height={28} fill="#d8c49c" />
      <rect x={x - w * 0.66} y={by - 46} width={w * 1.32} height={24} fill="#d8c49c" />
      <rect x={x - w * 0.8} y={by - 24} width={w * 1.6} height={28} fill="#bca27a" />
    </g>
  </g>
);

const HallShell: React.FC = React.memo(() => (
  <>
    {/* الجدار الخلفي */}
    <Layer d={D1}>
      <Art>
        <defs>
          <linearGradient id="s04bw" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8c7452" stopOpacity={0.75} />
            <stop offset="30%" stopColor="#8c7452" stopOpacity={0} />
            <stop offset="75%" stopColor="#6a4a34" stopOpacity={0} />
            <stop offset="100%" stopColor="#6a4a34" stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <Masonry seed="s04b" x={BX0 - 60} y={BY0 - 60} w={BX1 - BX0 + 120} h={BY1 - BY0 + 80} bw={112} rh={54} base={WALL_C} alt="#efe0c2" line="#c8b088" lit="#fff8e4" />
        <rect x={BX0 - 60} y={BY0 - 60} width={BX1 - BX0 + 120} height={BY1 - BY0 + 60} fill="url(#s04bw)" />
        {[450, 700, 1220, 1470].map((x, i) => (
          <GothicWin key={x} id={`s04w${i}`} x={x} y={590} w={120} h={330} />
        ))}
        {/* لوح خشبي سفلي وإفريز ذهبي */}
        <rect x={BX0 - 60} y={BY1 - 122} width={BX1 - BX0 + 120} height={124} fill={WOOD} stroke={INK} strokeWidth={4} />
        {Array.from({length: 18}, (_, i) => (
          <rect key={i} x={BX0 + 6 + i * 78} y={BY1 - 106} width={62} height={88} fill="#7c5232" stroke="#4a2c18" strokeWidth={4} />
        ))}
        <rect x={BX0 - 60} y={BY1 - 134} width={BX1 - BX0 + 120} height={15} fill="#e8b830" stroke={INK} strokeWidth={3.5} />
        <rect x={BX0 - 60} y={BY0 + 2} width={BX1 - BX0 + 120} height={26} fill="#e8b830" stroke={INK} strokeWidth={4} />
        {/* العرش تحت مظلة مخملية */}
        <g stroke={INK} strokeWidth={5} strokeLinejoin="round">
          <path d="M 820 750 L 820 330 Q 960 250 1100 330 L 1100 750 Z" fill="#7e1e2e" />
          {[850, 890, 930, 990, 1030, 1070].map((x) => (
            <line key={x} x1={x} x2={x} y1={318} y2={748} stroke="#54101e" strokeWidth={7} opacity={0.7} />
          ))}
          <path d="M 800 340 Q 960 236 1120 340 L 1120 376 Q 1080 400 1040 376 Q 1000 402 960 376 Q 920 402 880 376 Q 840 400 800 376 Z" fill="#244b96" />
          <path d="M 800 376 Q 840 400 880 376 Q 920 402 960 376 Q 1000 402 1040 376 Q 1080 400 1120 376" fill="none" stroke="#f2c43a" strokeWidth={7} />
        </g>
        <Fleur x={960} y={336} s={0.62} />
        <g stroke={INK} strokeWidth={5} strokeLinejoin="round">
          <path d="M 896 740 L 896 500 Q 960 440 1024 500 L 1024 740 Z" fill="#e8b830" />
          <path d="M 912 700 L 912 516 Q 960 470 1008 516 L 1008 700 Z" fill="#2a55a8" />
          <rect x={880} y={650} width={160} height={34} rx={8} fill="#c8384a" />
          <rect x={872} y={620} width={22} height={120} fill="#e8b830" />
          <rect x={1026} y={620} width={22} height={120} fill="#e8b830" />
        </g>
        <Fleur x={960} y={566} s={0.5} />
        {/* درجات العرش */}
        <rect x={810} y={732} width={300} height={22} fill="#d8c49c" stroke={INK} strokeWidth={4} />
        <rect x={780} y={748} width={360} height={20} fill="#c8b088" stroke={INK} strokeWidth={4} />
      </Art>
    </Layer>
  </>
));

const HallBox: React.FC = React.memo(() => (
  <>
    <Floor3D d0={-470} d1={D1}>
      {(len) => (
        <g>
          <FloorTiles id="s04fl" len={len} a="#d8c4a0" b="#b89a74" line="#8c6e4c" size={165} far="#fff0cc" near="#3a2018" />
          {/* سجادة حمراء نحو العرش */}
          <rect x={730} y={0} width={460} height={len} fill="#8c2030" />
          <rect x={752} y={0} width={416} height={len} fill="#a82a3a" />
          <rect x={730} y={0} width={14} height={len} fill="#e8b830" />
          <rect x={1176} y={0} width={14} height={len} fill="#e8b830" />
          {Array.from({length: Math.ceil(len / 190)}, (_, i) => (
            <path key={i} d={`M 960 ${i * 190 + 20} l 70 70 l -70 70 l -70 -70 Z`} fill="none" stroke="#e8b830" strokeWidth={8} opacity={0.7} />
          ))}
          {/* بقع ضوء النوافذ على الأرض */}
          {[180, 520, 860].map((y) => (
            <path key={y} d={`M 60 ${y} L 620 ${y + 60} L 620 ${y + 190} L 60 ${y + 130} Z`} fill="#fff4cc" opacity={0.28} />
          ))}
        </g>
      )}
    </Floor3D>
    <Floor3D d0={-470} d1={D1} G={CEIL}>
      {(len) => (
        <g>
          <rect x={-2200} y={0} width={6320} height={len} fill="#5a3a24" />
          {Array.from({length: Math.ceil(len / 210)}, (_, i) => (
            <rect key={i} x={-2200} y={i * 210 + 30} width={6320} height={64} fill="#7a5232" stroke="#3a2214" strokeWidth={6} />
          ))}
          {[300, 960, 1620].map((x) => (
            <rect key={x} x={x - 40} y={0} width={80} height={len} fill="#6a4428" stroke="#3a2214" strokeWidth={6} />
          ))}
        </g>
      )}
    </Floor3D>
    {([-1, 1] as const).map((sd) => (
      <Wall3D key={sd} x={960 + sd * WX} d0={-470} d1={D1} top={WALL_TOP} h={WALL_H}>
        {(len) => {
          const fy = WALL_TOP + WALL_H;
          return (
            <g>
              <Masonry seed={`s04s${sd}`} x={0} y={WALL_TOP} w={len} h={WALL_H} bw={170} rh={84} base={sd < 0 ? '#cdb88f' : '#e2cfa8'} alt={sd < 0 ? '#d8c49c' : '#f0e0bc'} line="#b0966c" />
              {[260, 640, 1020].map((x, i) => (
                <g key={x}>
                  {sd < 0 ? <GothicWin id={`s04sw${i}`} x={x} y={fy - 340} w={190} h={460} /> : (
                    <g>
                      <rect x={x - 120} y={fy - 760} width={240} height={420} fill="#274a8c" stroke={INK} strokeWidth={6} />
                      <rect x={x - 102} y={fy - 742} width={204} height={384} fill="none" stroke="#e8b830" strokeWidth={8} />
                      <Fleur x={x} y={fy - 560} s={1.9} />
                      <rect x={x - 140} y={fy - 776} width={280} height={20} rx={8} fill="#d9a82e" stroke={INK} strokeWidth={5} />
                    </g>
                  )}
                </g>
              ))}
              <rect x={0} y={fy - 190} width={len} height={190} fill={WOOD} stroke={INK} strokeWidth={5} />
              {Array.from({length: Math.ceil(len / 130)}, (_, i) => (
                <rect key={i} x={14 + i * 130} y={fy - 164} width={102} height={140} fill="#7c5232" stroke="#4a2c18" strokeWidth={5} />
              ))}
              <rect x={0} y={fy - 208} width={len} height={22} fill="#e8b830" stroke={INK} strokeWidth={4} />
              <rect x={0} y={WALL_TOP} width={len} height={34} fill="#e8b830" stroke={INK} strokeWidth={4} />
              {sd > 0 ? <rect x={0} y={WALL_TOP} width={len} height={WALL_H} fill="#3a1c2c" opacity={0.14} /> : <rect x={0} y={WALL_TOP} width={len} height={WALL_H} fill="#3a1c2c" opacity={0.2} />}
            </g>
          );
        }}
      </Wall3D>
    ))}
  </>
));

/** القاعة كاملة: الممثلون أبناء على عمق ACT_D */
export const Hall: React.FC<{id: string; f: number; cam: Cam; pillarX?: number; back?: React.ReactNode; front?: React.ReactNode; children: React.ReactNode}> = ({id, f, cam, pillarX, back, front, children}) => {
  const P = PALACE_DAY;
  return (
    <>
      <AbsoluteFill style={{background: '#3a2416'}} />
      <LitStage cam={cam} light={LIGHTS.palace}>
        <HallShell />
      </LitStage>
      <LitStage cam={cam} light={LIGHTS.palace}>
        <HallBox />
      </LitStage>
      <LitStage cam={cam} light={LIGHTS.palace}>
        <Layer d={640}>
          <Art>
            <Column id={`${id}a`} x={430} top={150} by={gy(640)} w={78} />
            <Column id={`${id}b`} x={1490} top={150} by={gy(640)} w={78} />
          </Art>
        </Layer>
        {/* ثريا ذهبية */}
        <Layer d={520}>
          <Art>
            <g transform={`translate(960 188) rotate(${Math.sin(f / 46) * 1.1} 0 -500)`}>
              <line x1={0} x2={0} y1={-600} y2={0} stroke={INK} strokeWidth={8} />
              <line x1={0} x2={0} y1={-600} y2={0} stroke="#d9a82e" strokeWidth={4} />
              <path d="M -190 0 Q 0 70 190 0 Q 0 34 -190 0 Z" fill="#d9a82e" stroke={INK} strokeWidth={5} />
              <circle cx={0} cy={30} r={22} fill="#f2c43a" stroke={INK} strokeWidth={5} />
              {[-180, -108, -36, 36, 108, 180].map((x, i) => (
                <g key={x} transform={`translate(${x} ${12 - Math.abs(x) * 0.07})`}>
                  <rect x={-8} y={-40} width={16} height={36} fill="#f6ead0" stroke={INK} strokeWidth={3} />
                  <path d={`M 0 -42 q -10 -14 0 ${-30 - Math.sin(f * 0.55 + i) * 4} q 10 16 0 30 Z`} fill="#ffc24a" />
                </g>
              ))}
            </g>
            <Halo id={`${id}ch`} cx={960} cy={165} r={380} color="#ffe2a0" opacity={0.5} />
          </Art>
        </Layer>
        {back}
        {/* أشعة ضوء مائلة من نوافذ اليسار */}
        <Layer d={330}>
          <Art>
            <defs>
              <linearGradient id={`${id}sh`} x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#fff6d0" stopOpacity={0.42} />
                <stop offset="100%" stopColor="#fff6d0" stopOpacity={0} />
              </linearGradient>
            </defs>
            {[-260, 60, 380].map((x, i) => (
              <path key={x} d={`M ${x} -60 L ${x + 150} -60 L ${x + 900} 900 L ${x + 560} 900 Z`} fill={`url(#${id}sh)`} opacity={0.6 + 0.2 * Math.sin(f / 30 + i * 2)} />
            ))}
          </Art>
        </Layer>
        <Layer d={ACT_D}>
          <Art>
            {pillarX !== undefined && <Column id={`${id}p`} x={pillarX} top={-400} by={ACT_Y + 8} w={132} />}
            {children}
          </Art>
        </Layer>
        <Layer d={-60}>
          <Art>
            <Motes id={`${id}m`} frame={f} x0={-200} x1={2100} y0={60} y1={900} color="#fff4cc" n={36} size={2.6} />
          </Art>
        </Layer>
        {front}
        {/* ستارة مخملية قريبة خارج التركيز */}
        <Layer d={-330} blur={9}>
          <Art>
            <path d={`M -700 -300 L 40 -300 Q 60 300 ${-70 + Math.sin(f / 30) * 8} 700 Q -150 900 -130 1500 L -700 1500 Z`} fill="#5a1422" />
            <path d="M -60 -300 Q -40 300 -150 720 M -190 -300 Q -190 300 -250 760" fill="none" stroke="#3a0a16" strokeWidth={40} opacity={0.6} />
            <path d="M 1890 -300 L 2600 -300 L 2600 1500 L 2040 1500 Q 2060 900 1980 700 Q 1870 300 1890 -300 Z" fill="#5a1422" />
          </Art>
        </Layer>
      </LitStage>
      <ColorGrade p={P} lightAt={[16, 20]} lightStrength={0.24} />
      <SoftFilm frame={f} strength={0.26} />
    </>
  );
};

export const Scene04: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;

  const c1 = SCENE04_TRACK.byId.s04_nar_1;
  const c2 = SCENE04_TRACK.byId.s04_nar_2;
  const c3 = SCENE04_TRACK.byId.s04_nar_3;
  const cChar6 = SCENE04_TRACK.byId.s04_charles6_1;
  const c4 = SCENE04_TRACK.byId.s04_nar_4;
  const c5 = SCENE04_TRACK.byId.s04_nar_5;

  const MAD_STAMP_T = c1.t0 + 6.45;
  const BONK_T = c2.t0 + 1.85;
  const CLANK1_T = c5.t0 + 0.45;
  const CLANK2_T = c5.t0 + 1.65;
  const CLANK3_T = c5.t0 + 2.85;
  const RELATIVES_T = c5.t0 + 4.4;

  const sfx = [
    {at: 0.25, name: 'pop', vol: 0.55, dur: 0.3},
    {at: MAD_STAMP_T, name: 'stamp', vol: 0.8, dur: 0.4},
    {at: MAD_STAMP_T + 0.08, name: 'buzzer', vol: 0.45, dur: 0.6},
    {at: BONK_T, name: 'doorSlam', vol: 0.78, dur: 0.5},
    {at: c3.t0 + 4.4, name: 'glass', vol: 0.55, dur: 0.75},
    {at: cChar6.t0, name: 'pop', vol: 0.65, dur: 0.3},
    {at: c4.t0 + 1.1, name: 'clang', vol: 0.5, dur: 1.0},
    {at: CLANK1_T, name: 'clang', vol: 0.68, dur: 1.0},
    {at: CLANK2_T, name: 'clang', vol: 0.68, dur: 1.0},
    {at: CLANK3_T, name: 'clang', vol: 0.68, dur: 1.0},
    {at: RELATIVES_T, name: 'pop', vol: 0.7, dur: 0.3},
  ];

  let view: React.ReactNode;
  if (t < c2.t0 - 0.1) view = <RoyalPortrait f={f} t={t} madT={MAD_STAMP_T} endT={c2.t0 - 0.1} />;
  else if (t < c3.t0 - 0.1) view = <RunAndBonk f={f} t={t} t0={c2.t0} bonkT={BONK_T} endT={c3.t0 - 0.1} />;
  else if (t < c4.t0 - 0.1) view = <GlassKing f={f} t={t} c3t={c3.t0} c3e={c3.t1} screamT={cChar6.t0} endT={c4.t0 - 0.1} />;
  else if (t < RELATIVES_T) view = <IronRods f={f} t={t} c4t={c4.t0} c5t={c5.t0} clanks={[CLANK1_T, CLANK2_T, CLANK3_T]} endT={RELATIVES_T} />;
  else view = <Relatives f={f} t={t} at={RELATIVES_T} />;

  return (
    <AbsoluteFill style={{background: '#1a0f0c'}}>
      {view}
      <SceneTrackAudio track={SCENE04_TRACK} sfx={sfx} />
      <SceneTrackSubtitles track={SCENE04_TRACK} hideDialogue />
    </AbsoluteFill>
  );
};

/* ================= المرحلة 1: لوحة ملكية "الملك شارل السادس" ================= */
const RoyalPortrait: React.FC<{f: number; t: number; madT: number; endT: number}> = ({f, t, madT, endT}) => {
  const enterP = easeOutBack(prog(t, 0.1, 0.6));
  const stampP = prog(t, madT, madT + 0.25);
  const isMad = t >= madT;
  const mad = easeOut(prog(t, madT, madT + 0.5));
  const shake = isMad && t < madT + 0.3 ? Math.sin(f * 3.8) * 9 : 0;
  const F = (s: number) => Math.round(s * FPS);
  const cam = camAt(f, [
    {f: 0, x: -60, z: -200, ry: -7, rx: 2, fov: 48},
    {f: F(1.2), x: 0, z: 20, ry: -2, rx: 0, fov: 45},
    {f: F(madT) - 2, x: 10, z: 90, ry: 4},
    {f: F(madT) + 6, x: 60, z: 210, ry: 1},
    {f: F(endT), x: -40, z: 150, ry: -5},
  ]);
  cam.y += 34;
  cam.x += shake;
  cam.rz = isMad ? Math.sin(f * 0.09) * 1.6 * mad : 0;
  const velvet = mix('#8c1c30', '#4a1c62', mad);
  const velvetD = mix('#5a0e1e', '#2a0e40', mad);

  return (
    <>
      <Sky background={velvetD} />
      <LitStage cam={cam} light={{...LIGHTS.palace, rim: 0.8, points: [{x: 560, y: 260, color: mix('#ffe0a0', '#c8a0ff', mad), r: 640}]}}>
        {/* ١: ستائر مخملية بطيّات */}
        <Layer d={1300}>
          <Art>
            <defs>
              <linearGradient id="s04vf" x1="0" x2="1" y1="0" y2="0" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor={velvetD} />
                <stop offset="40%" stopColor={velvet} />
                <stop offset="60%" stopColor={mix(velvet, '#ff9a9a', 0.18)} />
                <stop offset="100%" stopColor={velvetD} />
              </linearGradient>
            </defs>
            {Array.from({length: 30}, (_, i) => (
              <path key={i} d={`M ${-1400 + i * 158} -800 q ${Math.sin(f / 30 + i) * 12} 900 0 2500 L ${-1400 + (i + 1) * 158} 1700 q ${Math.sin(f / 30 + i + 1) * 12} -900 0 -2500 Z`} fill="url(#s04vf)" />
            ))}
            {isMad && <Rays cx={960} cy={500} rot={f * 1.6} color="#c88aff" opacity={0.16 * mad} n={14} />}
            <Halo id="s04ph" cx={960} cy={420} r={1000} color={mix('#ffd48a', '#b070ff', mad)} opacity={0.4} />
          </Art>
        </Layer>
        {/* ٢: أقواس ستارة علوية بشراريب ذهبية */}
        <Layer d={720}>
          <Art>
            {Array.from({length: 7}, (_, i) => (
              <g key={i} transform={`translate(${-640 + i * 530} -40)`}>
                <path d="M -290 -300 L 290 -300 L 265 40 Q 0 250 -265 40 Z" fill={velvet} stroke={INK} strokeWidth={6} />
                <path d="M -200 -60 Q 0 120 200 -60 M -220 10 Q 0 190 220 10" fill="none" stroke={velvetD} strokeWidth={16} opacity={0.6} />
                <path d="M 265 40 Q 0 250 -265 40" fill="none" stroke="#e8b830" strokeWidth={16} />
                {Array.from({length: 15}, (_, k) => {
                  const u = -1 + (k / 14) * 2;
                  return <line key={k} x1={u * 255} x2={u * 255 + Math.sin(f / 14 + k) * 3} y1={146 - u * u * 100} y2={186 - u * u * 100} stroke="#f2c43a" strokeWidth={9} strokeLinecap="round" />;
                })}
              </g>
            ))}
          </Art>
        </Layer>
      </LitStage>
      <LitStage cam={cam} light={LIGHTS.palace}>
        <Floor3D d0={-470} d1={1300}>
          {(len) => <FloorTiles id="s04pf" len={len} a="#4a2a2a" b="#56322e" line="#2a1414" size={200} far="#ffcf8a" near="#14060a" />}
        </Floor3D>
      </LitStage>
      <LitStage cam={cam} light={{...LIGHTS.palace, rim: 0.8, points: [{x: 560, y: 260, color: mix('#ffe0a0', '#c8a0ff', mad), r: 640}]}}>
        {/* ٣: الملك على منصة دائرية */}
        <Layer d={260}>
          <Art>
            <g transform="translate(560 0)">
              <path d="M -90 -700 L 90 -700 L 300 800 L -300 800 Z" fill={mix('#fff0c0', '#d8b0ff', mad)} opacity={0.13} />
              <ellipse cx={0} cy={gy(260) + 18} rx={250} ry={50} fill="#000" opacity={0.4} />
              <path d={`M -220 ${gy(260) - 34} L -220 ${gy(260) + 8} Q 0 ${gy(260) + 74} 220 ${gy(260) + 8} L 220 ${gy(260) - 34} Z`} fill="#b8862a" stroke={INK} strokeWidth={6} />
              <ellipse cx={0} cy={gy(260) - 34} rx={220} ry={44} fill="#f0c860" stroke={INK} strokeWidth={6} />
              <ellipse cx={0} cy={gy(260) - 34} rx={184} ry={34} fill="#a82a3a" stroke={INK} strokeWidth={4} />
              <g transform={`translate(0 ${gy(260) - 34}) scale(${Math.max(0, enterP)})`}>
                <Person x={0} y={0} s={1.72} frame={f} {...look('charles6')} expr={isMad ? 'dizzy' : 'happy'} pose={isMad ? 'armsUp' : 'stand'} shading="cel" />
              </g>
            </g>
          </Art>
        </Layer>
        {/* ٤: البطاقة كلوحة بإطار ذهبي سميك */}
        <Layer d={130}>
          <Art>
            <g transform={`translate(1290 420) scale(${Math.max(0, enterP)}) rotate(${isMad ? Math.sin(f * 0.12) * 1.5 : 0})`}>
              <rect x={-430} y={-232} width={900} height={520} rx={30} fill="#000" opacity={0.42} />
              <rect x={-452} y={-246} width={904} height={510} rx={32} fill="#7a5414" stroke={INK} strokeWidth={8} />
              <rect x={-452} y={-264} width={904} height={510} rx={32} fill="#d9a82e" stroke={INK} strokeWidth={8} />
              <rect x={-436} y={-250} width={872} height={40} rx={18} fill="#fff0b8" opacity={0.45} />
              <rect x={-410} y={-224} width={820} height={430} rx={18} fill="#fffaec" stroke={INK} strokeWidth={6} />
              <rect x={-392} y={-206} width={784} height={18} rx={9} fill="#244b96" />
              {[-420, 420].map((cx) => [-232, 214].map((cy) => <Fleur key={`${cx}${cy}`} x={cx} y={cy} s={0.42} fill="#fff0b8" />))}
              <text x={0} y={-112} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={44} fill="#6b5e4c" direction="rtl">
                ١٣٨٠ — ١٤٢٢
              </text>
              <text x={0} y={-6} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={94} fill="#1c2a54" direction="rtl">
                شارل السادس
              </text>
              <rect x={-240} y={62} width={480} height={94} rx={18} fill="#2b8a58" stroke={INK} strokeWidth={5} opacity={isMad ? 0.45 : 1} />
              <text x={0} y={126} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={52} fill="#fff" direction="rtl">
                «شارل المحبوب»
              </text>
              {isMad && <line x1={-250} y1={110} x2={250} y2={110} stroke="#c8242e" strokeWidth={11} strokeLinecap="round" />}
            </g>
          </Art>
        </Layer>
        {/* ٥: ورود تتساقط على المحبوب، ثم ينزل الختم أمام الجميع */}
        <Layer d={-70}>
          <Art>
            {!isMad &&
              scatter('s04pet', 34, -100, 2000, 0, 1400).map((p, i) => (
                <ellipse key={i} cx={p.x + Math.sin(f / 18 + p.p) * 40} cy={((p.y + f * (3 + p.r * 2)) % 1400) - 200} rx={14} ry={8} fill={i % 3 ? '#e85a78' : '#ffd0d8'} stroke={INK} strokeWidth={2.5} transform={`rotate(${f * 3 + p.p * 60} ${p.x + Math.sin(f / 18 + p.p) * 40} ${((p.y + f * (3 + p.r * 2)) % 1400) - 200})`} />
              ))}
            {stampP > 0 && (
              <g transform="translate(1270 500) scale(1.3)">
                <BigStamp x={0} y={0} text="شارل المجنون" color="#c8242e" progress={stampP} rot={-8} />
              </g>
            )}
          </Art>
        </Layer>
        <Layer d={-200}>
          <Art>
            <Motes id="s04pm" frame={f} x0={-100} x1={2000} y0={40} y1={1000} color="#ffe6b0" n={26} size={3} />
          </Art>
        </Layer>
      </LitStage>
      <ColorGrade p={{...PALACE_DAY, gradeTop: mix('#ffe2ac', '#b88aff', mad), gradeBottom: mix('#4a1a24', '#1e0a38', mad)}} lightAt={[34, 34]} lightStrength={0.22} />
      <SoftFilm frame={f} strength={0.42} />
    </>
  );
};

/* ================= المرحلة 2: يركض في القاعة ويصطدم بالعمود ================= */
const RunAndBonk: React.FC<{f: number; t: number; t0: number; bonkT: number; endT: number}> = ({f, t, t0, bonkT, endT}) => {
  const runP = prog(t, t0 + 0.15, bonkT);
  const bonked = t >= bonkT;
  const bounceP = easeOut(prog(t, bonkT, bonkT + 0.45));
  const kingX = !bonked ? lerp(210, 1140, runP) : lerp(1140, 1010, bounceP);
  const shakeX = bonked && t < bonkT + 0.35 ? Math.sin(f * 4.5) * 14 : 0;

  const F = (s: number) => Math.round(s * FPS);
  const cam = camAt(f, [
    {f: F(t0 - 0.1), x: -190, y: 0, z: -40, ry: 8, fov: 47},
    {f: F(bonkT) - 1, x: 120, y: 0, z: 90, ry: -4, fov: 45},
    {f: F(bonkT) + 5, x: 130, z: 210, ry: -2},
    {f: F(bonkT + 1.3), x: 10, y: -10, z: 130, ry: 3},
    {f: F(endT), x: -20, y: -24, z: 240, ry: 7},
  ]);
  cam.y += 58; // يرفع الأقدام فوق شريط الترجمة
  cam.x += shakeX;
  cam.y += shakeX * 0.4;

  return (
    <>
      <Hall id="s04h2" f={f} cam={cam} pillarX={1275}>
        {!bonked &&
          [0, 1, 2, 3].map((i) => (
            <line key={i} x1={kingX - 120 - i * 36} x2={kingX - 260 - i * 60} y1={ACT_Y - 250 + i * 62} y2={ACT_Y - 250 + i * 62} stroke="#fffaf0" strokeWidth={8} strokeLinecap="round" opacity={0.7 * runP} />
          ))}
        <Person
          x={kingX}
          y={ACT_Y}
          s={1.3}
          frame={f}
          {...look('charles6')}
          motion={!bonked ? 'run' : 'idle'}
          travel={!bonked ? kingX - 210 : 0}
          energy={0.95}
          expr={bonked ? 'dizzy' : 'happy'}
          pose={!bonked ? 'armsUp' : 'droop'}
          shading="cel"
        />
        {bonked && <DizzyBirds x={kingX} y={ACT_Y - 408} frame={f} r={84} />}
        {bonked && t < bonkT + 1.6 && <Smoke id="s04dust" x={1230} y={ACT_Y - 10} frame={f - F(bonkT)} color="#e8d8b8" n={8} rise={140} size={34} drift={60} opacity={0.5 * (1 - prog(t, bonkT + 0.8, bonkT + 1.6))} life={50} />}
      </Hall>
    </>
  );
};

/* ================= المرحلة 3: وهم الزجاج + صرخة الذعر أمام الخادم ================= */
const GlassKing: React.FC<{f: number; t: number; c3t: number; c3e: number; screamT: number; endT: number}> = ({f, t, c3t, c3e, screamT, endT}) => {
  const screaming = t >= screamT - 0.06;
  const servWalk = easeOut(prog(t, c3t + 0.4, c3e - 0.3));
  const servJumpBack = easeOut(prog(t, screamT, screamT + 0.45));
  const servX = !screaming ? lerp(280, 915, servWalk) : lerp(915, 610, servJumpBack);
  const glassReveal = easeOutBack(prog(t, c3t + 3.8, c3t + 4.35));
  const glassOp = clamp(glassReveal);

  const c6Talk = talkOf(SCENE04_TRACK, 's04_charles6_1', t);
  const c6Bub = bubbleOf(SCENE04_TRACK, 's04_charles6_1', t);

  const F = (s: number) => Math.round(s * FPS);
  const cam = camAt(f, [
    {f: F(c3t - 0.1), x: -120, y: 0, z: -20, ry: -6, fov: 46},
    {f: F(c3t + 3.6), x: 20, y: -4, z: 70, ry: -1},
    {f: F(c3t + 4.6), x: 130, y: -20, z: 210, ry: 3},
    {f: F(screamT) - 2, x: 110, y: -16, z: 200, ry: 3},
    {f: F(screamT) + 5, x: 60, y: -20, z: 120, ry: -2},
    {f: F(endT), x: 90, y: -34, z: 230, ry: -5},
  ]);
  const sh = screaming && t < screamT + 0.6 ? Math.sin(f * 3.9) * 9 : 0;
  cam.y += 26;
  cam.x += sh;
  const kx = 1255 + (screaming ? Math.sin(f * 3.8) * 6 : 0);
  const head = toScreen(kx, ACT_Y - 428, ACT_D, cam);
  const cardAt = toScreen(1590, ACT_Y - 320, ACT_D, cam);

  return (
    <>
      <Hall id="s04h3" f={f} cam={cam}>
        <Person
          x={servX}
          y={ACT_Y}
          s={1.2}
          frame={f}
          {...extra('ottomanWorker', 2, {robe: '#485a6e', trim: '#e6dcc4', hat: 'cap'})}
          motion={!screaming && servWalk < 0.98 ? 'walk' : 'idle'}
          travel={!screaming ? servX - 280 : 0}
          act={screaming ? 'scared' : undefined}
          expr={screaming ? 'shock' : 'neutral'}
          pose={!screaming && servWalk > 0.7 ? 'point' : 'stand'}
          shading="cel"
        />
        {glassReveal > 0.05 && <Halo id="s04gh" cx={kx} cy={ACT_Y - 190} r={250} color="#c8f0ff" opacity={0.5 * glassOp} />}
        <Person x={kx} y={ACT_Y} s={1.32} flip frame={f} {...look('charles6')} expr={screaming ? 'shock' : 'dizzy'} pose={screaming ? 'armsUp' : 'stand'} talk={c6Talk} shading="cel" />
        {/* غلاف زجاجي وبريق حول الملك */}
        {glassReveal > 0.05 && (
          <g opacity={glassOp} transform={`translate(${kx} ${ACT_Y})`}>
            <path d="M -100 0 Q -128 -200 -86 -330 Q 0 -420 86 -330 Q 128 -200 100 0 Z" fill="#c8f0ff" fillOpacity={0.16} stroke="#e8faff" strokeWidth={4} opacity={0.75} />
            <g stroke="#ffffff" strokeLinecap="round" fill="none">
              <path d="M -84 -120 Q -96 -220 -66 -300" strokeWidth={11} opacity={0.85} />
              <path d="M -60 -110 Q -70 -190 -50 -250" strokeWidth={5} opacity={0.6} />
              <path d="M 88 -60 Q 96 -110 92 -150" strokeWidth={6} opacity={0.6} />
            </g>
            {[
              [96, -330, 1.1],
              [-104, -60, 0.8],
              [70, -210, 0.7],
            ].map(([x, y, s], i) => (
              <path
                key={i}
                transform={`translate(${x} ${y}) scale(${s * (0.7 + 0.45 * Math.sin(f / 5 + i * 2) ** 2)})`}
                d="M 0 -30 L 7 -7 L 30 0 L 7 7 L 0 30 L -7 7 L -30 0 L -7 -7 Z"
                fill="#f4fcff"
                stroke={INK}
                strokeWidth={3}
              />
            ))}
          </g>
        )}
      </Hall>
      <Hud>
        {glassReveal > 0.05 && !screaming && (
          <g transform={`translate(${Math.min(1700, cardAt.x + 30)} ${cardAt.y}) scale(${Math.max(0, glassReveal) * 1.2}) rotate(${Math.sin(f / 14) * 2})`}>
            <rect x={-133} y={-111} width={290} height={248} rx={22} fill="#000" opacity={0.3} />
            <rect x={-145} y={-125} width={290} height={248} rx={22} fill="#f2fbff" stroke={INK} strokeWidth={5} />
            <path d="M -42 -72 L 42 -72 L 32 34 L -32 34 Z" fill="#bde8ff" fillOpacity={0.75} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
            <line x1={-22} y1={-56} x2={-16} y2={18} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
          </g>
        )}
        {c6Bub && <SpeechBubble text={c6Bub.text} style="shout" headX={head.x} headTop={Math.max(250, head.y)} s={1.1} age={c6Bub.age} left={c6Bub.left} side={-1} />}
      </Hud>
    </>
  );
};

/* ================= المرحلة 4أ: الخياط اليائس والقضبان الحديدية ================= */
const IronRods: React.FC<{f: number; t: number; c4t: number; c5t: number; clanks: number[]; endT: number}> = ({f, t, c4t, c5t, clanks, endT}) => {
  const walking = t >= c5t;
  const walkP = easeOut(prog(t, c5t, endT - 0.3));
  const kingX = walking ? lerp(860, 1280, walkP) : 1090;
  const clankPop = (ct: number) => {
    const dt = t - ct;
    return dt >= 0 && dt < 0.65 ? 1 - dt / 0.65 : 0;
  };
  const F = (s: number) => Math.round(s * FPS);
  const cam = walking
    ? camAt(f, [
        {f: F(c5t), x: -120, y: 0, z: 60, ry: -5, fov: 45},
        {f: F(endT), x: 150, y: -10, z: 170, ry: 4},
      ])
    : camAt(f, [
        {f: F(c4t - 0.1), x: 60, y: -4, z: -20, ry: 6, fov: 46},
        {f: F(c4t + 3), x: -20, y: -10, z: 150, ry: 1},
        {f: F(c5t), x: -50, y: -14, z: 220, ry: -4},
      ]);
  cam.y += 50;
  cam.y += Math.max(0, ...clanks.map(clankPop)) * Math.sin(f * 4) * 5;

  return (
    <>
      <Hall id="s04h4" f={f} cam={cam}>
        {!walking && (
          <g>
            {/* كومة قضبان وسندان */}
            <g transform={`translate(520 ${ACT_Y + 6})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
              <ellipse cx={0} cy={0} rx={120} ry={18} fill="#000" opacity={0.3} stroke="none" />
              {[0, 1, 2, 3].map((i) => (
                <g key={i}>
                  <rect x={-100 + i * 12} y={-28 - i * 22} width={200} height={22} rx={8} fill={i % 2 ? '#8c96a6' : '#a4aebc'} transform={`rotate(${(i - 1.5) * 3})`} />
                  <line x1={-84 + i * 12} x2={80 + i * 12} y1={-22 - i * 22} y2={-22 - i * 22} stroke="#eef4fc" strokeWidth={4} transform={`rotate(${(i - 1.5) * 3})`} />
                </g>
              ))}
            </g>
            <Person x={765} y={ACT_Y} s={1.26} frame={f} {...extra('egyptCivilian', 4, {outfit: 'robe', robe: '#6b4f3a', trim: '#d9c49a', hat: 'cap'})} expr="strain" pose="point" sweat shading="cel" />
          </g>
        )}
        <Person
          x={kingX}
          y={ACT_Y}
          s={1.34}
          frame={f}
          {...look('charles6')}
          motion={walking ? 'walk' : 'idle'}
          travel={walking ? kingX - 860 : 0}
          energy={0.45}
          expr="happy"
          pose="stand"
          shading="cel"
        />
        {!walking && (
          <g transform={`translate(${928 + Math.sin(f * 0.45) * 14} ${ACT_Y - 146}) rotate(-14)`}>
            <rect x={-105} y={-13} width={210} height={26} rx={8} fill="#9ea8b6" stroke={INK} strokeWidth={5} />
            <line x1={-88} y1={-4} x2={88} y2={-4} stroke="#eef4fc" strokeWidth={5} />
          </g>
        )}
        {!walking &&
          Math.sin(f * 0.45) > 0.8 &&
          [0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={1035} y1={ACT_Y - 170} x2={1035 + Math.cos(-2.2 + i * 0.7) * 54} y2={ACT_Y - 170 + Math.sin(-2.2 + i * 0.7) * 54} stroke="#ffd447" strokeWidth={6} strokeLinecap="round" />
          ))}
      </Hall>
    </>
  );
};

/* ================= المرحلة 4ب: فمن سيدير المملكة؟ أقاربه الطموحون! ================= */
const Relatives: React.FC<{f: number; t: number; at: number}> = ({f, t, at}) => {
  const slideIn = easeOutBack(prog(t, at, at + 0.55));
  const lf = f - at * FPS;
  const dur = SCENE04_TRACK.durationFrames - at * FPS;
  const cam = camAt(lf, [
    {f: 0, x: 0, y: -40, z: 330, ry: 0, fov: 42},
    {f: 26, x: 0, y: 0, z: 0, ry: 0, fov: 46},
    {f: dur * 0.5, x: -70, y: -6, z: 70, ry: -5},
    {f: dur, x: 70, y: -10, z: 130, ry: 5},
  ]);
  cam.y += 66;
  return (
    <>
      <Hall
        id="s04h5"
        f={f}
        cam={cam}
        back={
          <Layer d={480}>
            <Art>
              <g transform={`translate(960 ${gy(480)})`}>
                <ellipse cx={0} cy={4} rx={190} ry={26} fill="#000" opacity={0.35} />
                <path d="M -160 -24 L -160 4 Q 0 40 160 4 L 160 -24 Z" fill="#b8862a" stroke={INK} strokeWidth={5} />
                <ellipse cx={0} cy={-24} rx={160} ry={24} fill="#f0c860" stroke={INK} strokeWidth={5} />
                <Person x={0} y={-24} s={1.12} frame={f} {...look('charles6')} expr="dizzy" pose="cower" shading="cel" />
                <path d="M -140 -20 L -140 -260 Q -140 -410 0 -410 Q 140 -410 140 -260 L 140 -20 Q 0 18 -140 -20 Z" fill="#c9eeff" fillOpacity={0.26} stroke="#7cc0de" strokeWidth={6} />
                <path d="M -106 -270 Q -96 -350 -34 -376" fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round" opacity={0.85} />
                <path d="M -108 -230 L -108 -150" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.6} />
                <circle cx={0} cy={-418} r={15} fill="#e8b830" stroke={INK} strokeWidth={5} />
              </g>
            </Art>
          </Layer>
        }
        front={
          <Layer d={20}>
            <Art>
              <Person x={lerp(-260, 470, slideIn)} y={gy(20) - 22} s={1.62} frame={f} {...look('philipGood')} expr="smug" pose="stand" holdL={{id: 'moneyBag', text: ''}} shading="cel" />
              <Person x={lerp(2180, 1430, slideIn)} y={gy(20) - 22} s={1.62} flip frame={f + 7} {...extra('medievalNoble', 1, {robe: '#244b96', trim: '#1d3c7a'})} expr="smug" pose="chin" shading="cel" />
            </Art>
          </Layer>
        }
      >
        <g />
      </Hall>
    </>
  );
};
