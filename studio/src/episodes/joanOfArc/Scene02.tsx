import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {extra, look} from '../../cast';
import {Person} from '../../characters/Person';
import {CharLightCtx} from '../../characters/light';
import {CalloutTag} from '../../lib/comicFx';
import {SpeechBubble} from '../../lib/dialogue';
import {Campfire, Ridge, TorchFX} from '../../lib/epic';
import {Cloud, ColorGrade, Embers, GodRays, Halo, MistBand, Motes, Smoke} from '../../lib/fx';
import {atmos} from '../../lib/palette';
import {Art, CAM0, Cam, Layer, Sky, camAt} from '../../lib/stage';
import {INK, clamp, easeInOut, easeOut, easeOutBack, lerp, prog, scatter} from '../../lib/util';
import {RoundTree} from '../../world/buildings';
import {ACT_D, CHINON, CLEAR_DAY, FarArmy, Fleur, Floor3D, FloorTiles, GOLDEN, HangingBanner, Hud, LIGHTS, LitStage, Masonry, ROYAL, Rays, SoftFilm, gy, toScreen} from './stage3d';
import {FPS, SceneTrackAudio, SceneTrackSubtitles, bubbleOf, buildTrack, talkOf} from './audioHelper';

/* =====================================================================
 * المشهد ٢ — طرق باب القلعة + حوار جان وشارل السابع + مونتاج العنوان
 * ===================================================================== */

export const SCENE02_TRACK = buildTrack(
  [
    {kind: 'pause', sec: 2.05}, // طرق الباب (طق.. طق.. طق) + فتح الباب وظهور شارل وجان
    {kind: 'clip', id: 's02_joan_1', padAfter: 0.05},
    {kind: 'pause', sec: 1.05}, // صمت تام لثانية + رمشة بطيئة من شارل السابع
    {kind: 'clip', id: 's02_charles7_1', padAfter: 0.2},
    {kind: 'pause', sec: 1.85}, // قفزة النص: "الجنون التام.. أم المعجزة التاريخية؟"
    {kind: 'clip', id: 's02_nar_1', padAfter: 0.22},
    {kind: 'clip', id: 's02_nar_2', padAfter: 0.2},
  ],
  0.7,
);

const J2D = ACT_D; // عمق جان
const IN_D = 430; // عمق شارل داخل الباب
const FAC_D = 330; // عمق واجهة القلعة
const DOOR = {x0: 905, x1: 1495, top: 150};

export const Scene02: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;

  const cCharles = SCENE02_TRACK.byId.s02_charles7_1;
  const cNar1 = SCENE02_TRACK.byId.s02_nar_1;
  const cNar2 = SCENE02_TRACK.byId.s02_nar_2;

  const TITLE_BURST_T = cCharles.t1 + 0.18;
  const MONTAGE_T = cNar1.t0;
  const FINAL_CARD_T = cNar2.t0;

  const sfx = [
    {at: 0.25, name: 'knock', vol: 0.9, dur: 0.95},
    {at: 1.15, name: 'pop', vol: 0.55, dur: 0.3},
    {at: 1.55, name: 'pop', vol: 0.5, dur: 0.3},
    {at: TITLE_BURST_T, name: 'trumpet', vol: 0.65, dur: 1.35},
    {at: MONTAGE_T, name: 'whoosh', vol: 0.6, dur: 0.5},
    {at: MONTAGE_T + 3.4, name: 'whoosh', vol: 0.55, dur: 0.5},
    {at: MONTAGE_T + 6.8, name: 'whoosh', vol: 0.55, dur: 0.5},
    {at: FINAL_CARD_T, name: 'stamp', vol: 0.65, dur: 0.4},
  ];

  const mt = t - MONTAGE_T;
  const totalM = FINAL_CARD_T - MONTAGE_T;
  const cut1 = totalM * 0.35;
  const cut2 = totalM * 0.7;

  let view: React.ReactNode;
  if (t < TITLE_BURST_T) view = <CastleGate f={f} t={t} endT={TITLE_BURST_T} />;
  else if (t < MONTAGE_T) view = <Question f={f} t={t} at={TITLE_BURST_T} endT={MONTAGE_T} />;
  else if (mt < cut1) view = <HeroHill f={f} p={mt / cut1} />;
  else if (mt < cut2) view = <ArmyRun f={f} lt={mt - cut1} dur={cut2 - cut1} />;
  else if (t < FINAL_CARD_T) view = <GreatBanner f={f} p={(mt - cut2) / (totalM - cut2)} />;
  else view = <TitleCard f={f} t={t} at={FINAL_CARD_T} />;

  return (
    <AbsoluteFill style={{background: '#0d0b12'}}>
      {view}
      <SceneTrackAudio track={SCENE02_TRACK} sfx={sfx} />
      <SceneTrackSubtitles track={SCENE02_TRACK} hideDialogue />
    </AbsoluteFill>
  );
};

/* ================= المرحلة 1: باب القلعة + حوار جان وشارل ================= */
const CastleGate: React.FC<{f: number; t: number; endT: number}> = ({f, t, endT}) => {
  const P = CHINON;
  const cJoan = SCENE02_TRACK.byId.s02_joan_1;
  const cCharles = SCENE02_TRACK.byId.s02_charles7_1;

  // اهتزاز الباب عند الطرقات الثلاث (0.29s، 0.55s، 0.81s)
  const knockPulse = (kt: number) => {
    const dt = t - kt;
    return dt >= 0 && dt < 0.16 ? Math.sin((dt / 0.16) * Math.PI) : 0;
  };
  const ks = [knockPulse(0.29), knockPulse(0.55), knockPulse(0.81)];
  const doorShake = (ks[0] + ks[1] + ks[2]) * 8;
  const isKnocking = t >= 0.22 && t <= 0.98;

  const doorOpen = easeOut(prog(t, 1.15, 1.85));
  const tagPop = easeOutBack(prog(t, 1.5, 1.95));

  // صمت شارل السابع + الرمشة البطيئة + الالتفات للمستشارين
  const silenceMid = cJoan.t1 + 0.45;
  const slowBlink = t >= silenceMid - 0.14 && t <= silenceMid + 0.16;
  const turnT = cJoan.t1 + 0.72;
  const turnedToAdvisors = t >= turnT;

  const joanTalk = talkOf(SCENE02_TRACK, 's02_joan_1', t);
  const charlesTalk = talkOf(SCENE02_TRACK, 's02_charles7_1', t);
  const joanBub = bubbleOf(SCENE02_TRACK, 's02_joan_1', t);
  const charlesBub = bubbleOf(SCENE02_TRACK, 's02_charles7_1', t);

  const charlesExpr = slowBlink
    ? 'sleepy'
    : t >= cJoan.t0 + 4.5 && t < cJoan.t1 + 0.2
      ? 'shock'
      : t >= cJoan.t0 + 1.2 && t < cJoan.t0 + 4.5
        ? 'think'
        : 'neutral';

  const F = (s: number) => Math.round(s * FPS);
  const cam = camAt(f, [
    {f: 0, x: -150, y: 40, z: 200, ry: -7, rx: 0, fov: 44},
    {f: F(1.05), x: -110, y: 40, z: 170, ry: -5},
    {f: F(2.0), x: 0, y: -10, z: 10, ry: 0, fov: 45},
    {f: F(cJoan.t0 + 4.2), x: -50, y: -4, z: 70, ry: -3},
    {f: F(cJoan.t1 - 1), x: -20, y: -12, z: 110, ry: 1},
    {f: F(cJoan.t1 + 0.25), x: 110, y: -10, z: 150, ry: 4},
    {f: F(silenceMid + 0.1), x: 170, y: 0, z: 300, ry: 5},
    {f: F(cCharles.t0 + 0.2), x: 170, y: -14, z: 250, ry: 2},
    {f: F(endT), x: 185, y: -16, z: 300, ry: 0},
  ]);
  cam.x += doorShake * 0.7;

  const joanX = isKnocking || t < 0.98 ? 822 : lerp(822, 655, doorOpen);
  const charlesX = lerp(1290, 1150, doorOpen);
  const yJ = gy(J2D);
  const yC = gy(IN_D);

  const light = {...LIGHTS.chinon, points: [{x: 250, y: 470, color: P.warm, r: 620}]};
  const inside = {...LIGHTS.chinon, dir: 1, key: '#ffcf8a', shadow: '#3a2238', ambient: 0.04, rim: 0.7, points: [{x: 1320, y: 420, color: '#ffb45a', r: 700}]};

  const charlesYaw = 26;

  const headJ = toScreen(joanX, yJ - 322, J2D, cam);
  const headC = toScreen(charlesX, yC - 418, IN_D, cam);
  const tagTo = toScreen(joanX - 60, yJ - 180, J2D, cam);

  return (
    <>
      <Sky background={`linear-gradient(${P.skyTop} 0%, ${P.skyMid} 48%, ${P.horizon} 92%)`} />
      <LitStage cam={cam} light={light}>
        {/* ١: سماء الغروب */}
        <Layer d={2800}>
          <Art>
            <Halo id="s02sun" cx={-260} cy={600} r={900} color={P.horizon} opacity={0.8} core={5} />
            <Cloud id="s02c1" x={-200 + f * 0.25} y={330} w={1200} h={85} lit={P.rim} shade={P.skyMid} opacity={0.75} />
            <Cloud id="s02c2" x={700 + f * 0.18} y={170} w={900} h={70} lit={P.rim} shade={P.skyTop} opacity={0.6} />
          </Art>
        </Layer>
        {/* ٢: تلال وقرية بعيدة */}
        <Layer d={1900}>
          <Art>
            <Ridge id="s02r" fn={(x) => 690 - 46 * Math.sin(x / 380 + 1) - 18 * Math.sin(x / 110)} top={atmos(P.far, P.haze, 0.45)} bottom={P.city} rim={P.rim} rimOpacity={0.5} />
            {scatter('s02v', 14, -1300, 700, 0, 1).map((b, i) => (
              <g key={i} transform={`translate(${b.x} ${672 + b.r * 22})`} fill={atmos(P.city, P.haze, 0.3)}>
                <rect x={-18} y={-30} width={40} height={34} />
                <path d="M -24 -28 L 2 -54 L 28 -28 Z" />
                <rect x={-4} y={-18} width={9} height={11} fill={P.warm} opacity={0.9} />
              </g>
            ))}
            <MistBand id="s02m" frame={f} y={720} color={P.haze} h={60} />
          </Art>
        </Layer>
        {/* ٣: برج وسور جانبي أبعد */}
        <Layer d={1050}>
          <Art>
            <g transform="translate(130 0)">
              <Masonry seed="s02tw" x={-150} y={170} w={300} h={900} bw={86} rh={46} base={atmos('#5d566e', P.haze, 0.22)} alt={atmos('#6c647e', P.haze, 0.22)} line="#3c3650" lit={P.rim} />
              {[-158, -92, -26, 40, 106].map((x) => (
                <rect key={x} x={x} y={118} width={46} height={60} fill={atmos('#665e78', P.haze, 0.2)} stroke={INK} strokeWidth={4} />
              ))}
              <rect x={-150} y={170} width={300} height={900} fill="none" stroke={INK} strokeWidth={5} />
              <path d="M -150 170 L -110 170 L -110 1070 L -150 1070 Z" fill={P.rim} opacity={0.28} />
              <path d="M 40 170 L 150 170 L 150 1070 L 40 1070 Z" fill="#1c1430" opacity={0.36} />
              <rect x={-16} y={330} width={32} height={84} rx={16} fill={P.warm} stroke={INK} strokeWidth={5} />
              <path d={`M 0 118 L 0 20 L ${84 + Math.sin(f / 7) * 8} 44 L 0 72`} fill="#2a55a8" stroke={INK} strokeWidth={5} />
            </g>
            <Masonry seed="s02sw" x={-1300} y={430} w={1290} h={700} bw={110} rh={56} base={atmos('#59526a', P.haze, 0.2)} alt={atmos('#686078', P.haze, 0.2)} line="#3c3650" />
            <line x1={-1300} x2={-10} y1={430} y2={430} stroke={P.rim} strokeWidth={6} opacity={0.6} />
          </Art>
        </Layer>
        {/* ٤: عمق القاعة خلف الباب */}
        <Layer d={1150}>
          <Art>
            <rect x={700} y={-300} width={1100} height={1300} fill="#3a2c36" />
            <Masonry seed="s02hall" x={700} y={-200} w={1100} h={1100} bw={120} rh={62} base="#463642" alt="#54424a" line="#2a1e2a" lit="#c88a5a" />
            <Halo id="s02fireH" cx={1330} cy={640} r={520} color="#ff9a3c" opacity={0.75} />
            {/* مدفأة ضخمة مشتعلة */}
            <path d="M 1190 800 L 1190 540 Q 1330 440 1470 540 L 1470 800 Z" fill="#6a5a60" stroke={INK} strokeWidth={6} />
            <path d="M 1226 800 L 1226 580 Q 1330 500 1434 580 L 1434 800 Z" fill="#1a1014" stroke={INK} strokeWidth={5} />
            <Campfire id="s02fire" x={1330} y={795} frame={f} s={1.0} smoke="#3a2a2c" warm="#ff9a3c" />
            <HangingBanner id="s02hb1" x={1090} y={250} w={120} h={320} frame={f} />
            <HangingBanner id="s02hb2" x={1580} y={250} w={120} h={320} frame={f} seed={2} />
          </Art>
        </Layer>
        {/* ٥: أعمدة داخل القاعة */}
        <Layer d={760}>
          <Art>
            {[940, 1520].map((x) => (
              <g key={x} stroke={INK} strokeWidth={5}>
                <rect x={x - 40} y={-200} width={80} height={1100} fill="#4c3c48" />
                <rect x={x - 26} y={-200} width={18} height={1100} fill="#c8925e" opacity={0.35} stroke="none" />
                <rect x={x - 56} y={gy(760) - 44} width={112} height={50} fill="#5a4854" />
              </g>
            ))}
            {/* ثريا حديد بشموع */}
            <g transform={`translate(1220 250) rotate(${Math.sin(f / 40) * 1.4})`} stroke={INK} strokeWidth={5}>
              <line x1={0} y1={-600} x2={0} y2={0} />
              <ellipse cx={0} cy={0} rx={150} ry={26} fill="#2e2a34" />
              {[-130, -65, 0, 65, 130].map((x, i) => (
                <g key={x}>
                  <rect x={x - 8} y={-36} width={16} height={32} fill="#f0e0bc" strokeWidth={3} />
                  <path d={`M ${x} -36 q -9 -14 0 ${-28 - Math.sin(f * 0.6 + i) * 4} q 9 14 0 28`} fill="#ffc24a" stroke="none" />
                </g>
              ))}
            </g>
            <Halo id="s02ch" cx={1220} cy={215} r={330} color="#ffbe62" opacity={0.55} />
          </Art>
        </Layer>
        {/* أرضية القاعة والساحة بمنظور حقيقي */}
      </LitStage>
      <LitStage cam={cam} light={light}>
        <Floor3D d0={-460} d1={1150}>
          {(len) => <FloorTiles id="s02fl" len={len} a="#6a6274" b="#5e566a" line="#3a3346" size={170} far="#d08a5c" near="#1c1530" />}
        </Floor3D>
      </LitStage>
      <LitStage cam={cam} light={light}>
        {/* ٦: شارل والمستشاران داخل الباب */}
        <Layer d={560}>
          <Art>
            <CharLightCtx.Provider value={inside}>
              <g opacity={clamp(doorOpen * 2.2)}>
                <Person x={1300} y={gy(560)} s={1.12} flip frame={f + 7} {...extra('medievalNoble', 1)} view="threeQuarter" expr={turnedToAdvisors ? 'think' : 'shock'} pose="stand" shading="cel" />
                <Person x={1410} y={gy(540)} s={1.08} flip frame={f + 19} {...extra('medievalNoble', 2)} view="threeQuarter" expr={turnedToAdvisors ? 'shock' : 'think'} pose="chin" shading="cel" />
              </g>
            </CharLightCtx.Provider>
          </Art>
        </Layer>
        <Layer d={IN_D}>
          <Art>
            <CharLightCtx.Provider value={inside}>
              {doorOpen > 0.12 && (
                <Person
                  x={charlesX}
                  y={yC}
                  s={1.32}
                  flip={!turnedToAdvisors}
                  frame={f}
                  {...look('charles7')}
                  view={charlesYaw}
                  expr={charlesExpr}
                  pose={turnedToAdvisors ? 'gesture' : 'stand'}
                  talk={charlesTalk}
                  jolt={Math.sin(prog(t, cJoan.t0 + 4.5, cJoan.t0 + 4.85) * Math.PI) * 0.6}
                  shading="cel"
                />
              )}
            </CharLightCtx.Provider>
          </Art>
        </Layer>
        {/* ٧: الباب يدور حول مفصلته اليمنى بمنظور حقيقي */}
        <Layer d={FAC_D + 12}>
          <div
            style={{
              position: 'absolute',
              left: DOOR.x0,
              top: DOOR.top,
              width: DOOR.x1 - DOOR.x0,
              height: gy(FAC_D) - DOOR.top,
              transformOrigin: '100% 50%',
              transform: `perspective(1500px) translateX(${doorShake}px) rotateY(${-doorOpen * 97}deg)`,
            }}
          >
            <GateDoor w={DOOR.x1 - DOOR.x0} h={gy(FAC_D) - DOOR.top} open={doorOpen} knock={ks[0] + ks[1] + ks[2]} />
          </div>
        </Layer>
        {/* ٨: واجهة القلعة بفتحة قوس حقيقية */}
        <Layer d={FAC_D}>
          <Art>
            <Facade f={f} />
          </Art>
        </Layer>
        {/* ٩: جان + عناصر الساحة القريبة */}
        <Layer d={J2D}>
          <Art>
            <ellipse cx={1200} cy={gy(J2D) - 6} rx={430 * doorOpen} ry={36 * doorOpen} fill="#ffb45a" opacity={0.28} />
            <g stroke={INK} strokeWidth={5}>
              <Barrel x={1720} y={gy(J2D) - 4} s={1.1} />
              <Barrel x={1830} y={gy(J2D) + 16} s={1.2} />
            </g>
            <Person
              x={joanX}
              y={yJ}
              s={1.2}
              frame={f}
              {...look('joanOfArc', {variant: 'village'})}
              view="threeQuarter"
              expr="determined"
              pose={isKnocking ? 'point' : joanTalk !== undefined ? 'gesture' : 'stand'}
              talk={joanTalk}
              shading="cel"
            />
          </Art>
        </Layer>
        {/* ١٠: مقدمة خارج التركيز */}
        <Layer d={-300} blur={9}>
          <Art>
            <path d="M -700 1300 L -700 560 Q -380 520 -330 760 Q -160 800 -150 1300 Z" fill="#171026" />
            <path d="M 1960 1300 L 1980 -200 L 2500 -200 L 2500 1300 Z" fill="#171026" />
            <Embers id="s02em" x={120} y={900} frame={f} n={14} spread={500} rise={760} size={6} life={90} />
          </Art>
        </Layer>
        <Layer d={-120}>
          <Art>
            <Motes id="s02mo" frame={f} x0={-200} x1={2100} y0={150} y1={900} color="#ffd8a0" n={34} size={2.6} />
          </Art>
        </Layer>
      </LitStage>
      <ColorGrade p={P} lightAt={[12, 48]} lightStrength={0.2} />
      <SoftFilm frame={f} />
      <Hud>
        {/* مؤثر بصري للطرقات */}
        {ks.map((k, i) => {
          if (k <= 0.05) return null;
          const at = toScreen([960, 1030, 980][i], [470, 400, 330][i], FAC_D, cam);
          return (
            <g key={i} transform={`translate(${at.x} ${at.y}) scale(${0.9 + k * 0.6}) rotate(${[-10, 8, -6][i]})`}>
              <text x={0} y={0} textAnchor="middle" direction="rtl" fontFamily="Amiri" fontWeight={700} fontSize={84} fill={i === 2 ? '#ff9f43' : '#ffd447'} stroke={INK} strokeWidth={12} style={{paintOrder: 'stroke'}} strokeLinejoin="round">
                طق!
              </text>
            </g>
          );
        })}
        {tagPop > 0.02 && t < cJoan.t1 + 0.1 && (
          <g opacity={clamp(tagPop)}>
            <CalloutTag x={240} y={Math.min(760, tagTo.y + 10)} lines={['العمر: ١٧ عاماً', 'الخبرة العسكرية: صفر']} arrowTo={[tagTo.x - 14, tagTo.y]} scale={tagPop * 1.25} />
          </g>
        )}
        {joanBub && <SpeechBubble text={joanBub.text} style="say" headX={headJ.x} headTop={headJ.y} s={headJ.s} age={joanBub.age} left={joanBub.left} side={-1} />}
        {charlesBub && <SpeechBubble text={charlesBub.text} style="say" headX={headC.x} headTop={headC.y} s={1} age={charlesBub.age} left={charlesBub.left} side={-1} />}
      </Hud>
    </>
  );
};

/** برميل خشب */
const Barrel: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={8} cy={-2} rx={62} ry={13} fill="#000" opacity={0.35} stroke="none" />
    <path d="M -44 -6 Q -62 -66 -44 -124 L 44 -124 Q 62 -66 44 -6 Q 0 8 -44 -6 Z" fill="#7a4c26" />
    <path d="M 14 -124 L 44 -124 Q 62 -66 44 -6 Q 30 0 14 2 Q 26 -60 14 -124 Z" fill="#3a2010" opacity={0.5} stroke="none" />
    <path d="M -54 -92 Q 0 -80 54 -92 M -54 -40 Q 0 -26 54 -40" fill="none" stroke="#2c2c34" strokeWidth={11} />
    <ellipse cx={0} cy={-124} rx={44} ry={11} fill="#9a6838" />
  </g>
);

/** ضلفة باب ضخمة بألواح وأشرطة حديد ومسامير */
const GateDoor: React.FC<{w: number; h: number; open: number; knock: number}> = ({w, h, open, knock}) => {
  const arch = `M 0 ${h} L 0 ${h * 0.3} Q 0 0 ${w / 2} 0 Q ${w} 0 ${w} ${h * 0.3} L ${w} ${h} Z`;
  return (
    <svg width={w} height={h} style={{overflow: 'visible'}}>
      <defs>
        <clipPath id="s02dc">
          <path d={arch} />
        </clipPath>
        <linearGradient id="s02dg" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#ffce8a" stopOpacity={0.3} />
          <stop offset="45%" stopColor="#ffce8a" stopOpacity={0} />
          <stop offset="100%" stopColor="#120a1c" stopOpacity={0.5} />
        </linearGradient>
      </defs>
      <g clipPath="url(#s02dc)">
        <rect width={w} height={h} fill="#70472a" />
        {Array.from({length: 7}, (_, i) => (
          <g key={i}>
            <rect x={(i * w) / 7} y={0} width={w / 7} height={h} fill={i % 2 ? '#7a4e2e' : '#694226'} />
            <line x1={(i * w) / 7} x2={(i * w) / 7} y1={0} y2={h} stroke="#3a2212" strokeWidth={6} />
            <path d={`M ${(i * w) / 7 + 34} ${h * 0.2} q 10 ${h * 0.2} -4 ${h * 0.5}`} fill="none" stroke="#4a2c16" strokeWidth={3} opacity={0.7} />
          </g>
        ))}
        {[0.24, 0.55, 0.84].map((k) => (
          <g key={k} stroke={INK} strokeWidth={4}>
            <rect x={-10} y={h * k} width={w + 20} height={38} fill="#3a3f4a" />
            <line x1={0} x2={w} y1={h * k + 7} y2={h * k + 7} stroke="#8b94a6" strokeWidth={4} opacity={0.7} />
            {Array.from({length: 8}, (_, i) => (
              <g key={i}>
                <circle cx={40 + i * (w / 8)} cy={h * k + 19} r={10} fill="#7d8492" />
                <circle cx={37 + i * (w / 8)} cy={h * k + 16} r={3.5} fill="#d8dee8" stroke="none" />
              </g>
            ))}
          </g>
        ))}
        <rect width={w} height={h} fill="url(#s02dg)" />
        <rect width={w} height={h} fill="#0c0618" opacity={0.45 * open} />
      </g>
      <path d={arch} fill="none" stroke={INK} strokeWidth={7} />
      {/* حلقة الطرق */}
      <g transform={`translate(92 ${h * 0.49}) rotate(${knock * 16})`}>
        <circle cx={0} cy={44} r={38} fill="none" stroke={INK} strokeWidth={19} />
        <circle cx={0} cy={44} r={38} fill="none" stroke="#a8b0be" strokeWidth={11} />
        <circle cx={0} cy={4} r={19} fill="#565d6a" stroke={INK} strokeWidth={5} />
      </g>
    </svg>
  );
};

/** واجهة القلعة الحجرية بفتحة قوس ومشاعل ورايات وشرفة علوية */
const Facade: React.FC<{f: number}> = React.memo(({f}) => {
  const P = CHINON;
  const by = gy(FAC_D);
  const {x0, x1, top} = DOOR;
  const hole = `M ${x0} ${by} L ${x0} ${top + 220} Q ${x0} ${top} ${(x0 + x1) / 2} ${top} Q ${x1} ${top} ${x1} ${top + 220} L ${x1} ${by} Z`;
  return (
    <g>
      <defs>
        <clipPath id="s02fc">
          <path clipRule="evenodd" d={`M 330 -800 L 3400 -800 L 3400 ${by} L 330 ${by} Z ${hole}`} />
        </clipPath>
        <linearGradient id="s02fg" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#ffb07a" stopOpacity={0.45} />
          <stop offset="18%" stopColor="#ffb07a" stopOpacity={0.08} />
          <stop offset="100%" stopColor="#150e2c" stopOpacity={0.5} />
        </linearGradient>
        <linearGradient id="s02fao" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#120a20" stopOpacity={0.55} />
          <stop offset="35%" stopColor="#120a20" stopOpacity={0} />
          <stop offset="78%" stopColor="#120a20" stopOpacity={0} />
          <stop offset="100%" stopColor="#120a20" stopOpacity={0.6} />
        </linearGradient>
      </defs>
      <g clipPath="url(#s02fc)">
        <FacadeStone by={by} />
        <rect x={330} y={-800} width={3100} height={by + 800} fill="url(#s02fg)" />
        <rect x={330} y={-200} width={3100} height={by + 200} fill="url(#s02fao)" />
        {/* لبلاب متسلق */}
        {scatter('s02ivy', 70, 340, 520, 60, by).map((p, i) => (
          <ellipse key={i} cx={p.x - (p.y / by) * 40} cy={p.y} rx={15 + p.r * 9} ry={11} fill={i % 3 ? '#3f5a3c' : '#567a48'} stroke={INK} strokeWidth={2.5} transform={`rotate(${p.p * 40} ${p.x} ${p.y})`} />
        ))}
      </g>
      <line x1={330} x2={330} y1={-800} y2={by} stroke={INK} strokeWidth={7} />
      <line x1={336} x2={336} y1={-800} y2={by} stroke={P.rim} strokeWidth={5} opacity={0.7} />
      {/* سماكة القوس (عمق الجدار) */}
      <path d={`M ${x1} ${by} L ${x1} ${top + 220} Q ${x1} ${top} ${(x0 + x1) / 2} ${top} Q ${x0} ${top} ${x0} ${top + 220} L ${x0} ${by}`} fill="none" stroke="#2c243a" strokeWidth={34} />
      {/* أحجار إطار القوس */}
      {Array.from({length: 17}, (_, i) => {
        const a = Math.PI - (i / 16) * Math.PI;
        const cx = (x0 + x1) / 2;
        const rx = (x1 - x0) / 2 + 40;
        const px = cx + Math.cos(a) * rx;
        const py = top + 226 - Math.sin(a) * 262;
        return <rect key={i} x={-34} y={-27} width={68} height={54} rx={8} fill={i % 2 ? '#8d8499' : '#7d748c'} stroke={INK} strokeWidth={5} transform={`translate(${px} ${py}) rotate(${(-a * 180) / Math.PI})`} />;
      })}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} stroke={INK} strokeWidth={5}>
          <rect x={x0 - 72 - (i % 2) * 14} y={top + 262 + i * 76} width={72 + (i % 2) * 14} height={72} rx={8} fill={i % 2 ? '#8d8499' : '#7d748c'} />
          <rect x={x1} y={top + 262 + i * 76} width={72 + (i % 2) * 14} height={72} rx={8} fill={i % 2 ? '#857c92' : '#756c84'} />
        </g>
      ))}
      {/* درع فوق الباب */}
      <g transform={`translate(${(x0 + x1) / 2} ${top - 96})`}>
        <path d="M -74 -66 L 74 -66 L 74 8 Q 66 74 0 96 Q -66 74 -74 8 Z" fill="#264b9c" stroke={INK} strokeWidth={7} />
        <path d="M 4 -62 L 70 -62 L 70 8 Q 62 70 4 90 Z" fill="#14285e" opacity={0.6} />
        <Fleur x={0} y={-8} s={0.95} />
      </g>
      <HangingBanner id="s02fb1" x={690} y={110} w={140} h={340} frame={f} />
      <HangingBanner id="s02fb2" x={1730} y={110} w={140} h={340} frame={f} seed={3} />
      <TorchFX id="s02t1" x={520} y={560} frame={f} s={1.25} warm={P.warm} smoke="#4a3a4c" />
      <TorchFX id="s02t2" x={1895} y={560} frame={f} s={1.25} warm={P.warm} smoke="#4a3a4c" />
    </g>
  );
});

const FacadeStone: React.FC<{by: number}> = React.memo(({by}) => (
  <Masonry seed="s02f" x={330} y={-420} w={2700} h={by + 420} bw={168} rh={86} base="#6b647a" alt="#7a7288" line="#463f58" lit="#ffc9a0" />
));

/* ================= المرحلة 2: "الجنون التام.. أم المعجزة التاريخية؟" ================= */
const Question: React.FC<{f: number; t: number; at: number; endT: number}> = ({f, t, at, endT}) => {
  const p = easeOutBack(prog(t, at, at + 0.35));
  const p2 = easeOutBack(prog(t, at + 0.55, at + 0.92));
  const F = (s: number) => Math.round(s * FPS);
  const cam = camAt(f, [
    {f: F(at), z: -180, ry: -9, rx: 2, fov: 48},
    {f: F(at + 0.55), z: 60, ry: -3, rx: 0, fov: 45},
    {f: F(endT), z: 200, ry: 7, rx: -1},
  ]);
  return (
    <>
      <RoyalBackdrop id="s02q" f={f} cam={cam}>
        <LitStage cam={cam} light={LIGHTS.royal}>
        <Layer d={260}>
          <Art>
            <g transform={`translate(960 400) scale(${p})`}>
              <Plate w={1180} h={186} fill="#c8242e" dark="#6e0f18" />
              <text x={0} y={34} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={108} fill="#fffdf6" direction="rtl" stroke="#5a0a12" strokeWidth={10} style={{paintOrder: 'stroke'}}>
                الجنون التام..
              </text>
            </g>
          </Art>
        </Layer>
        <Layer d={-40}>
          <Art>
            {p2 > 0.02 && (
              <g transform={`translate(960 665) scale(${p2})`}>
                <Plate w={1330} h={186} fill="#f2c43a" dark="#9a6c10" />
                <text x={0} y={34} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={108} fill={INK} direction="rtl">
                  أم المعجزة التاريخية؟
                </text>
              </g>
            )}
          </Art>
        </Layer>
        <Layer d={-260} blur={6}>
          <Art>
            {[
              [150, 260, 1.5, -14],
              [1790, 840, 1.8, 12],
            ].map(([x, y, s, r], i) => (
              <g key={i} transform={`translate(${x} ${y + Math.sin(f / 14 + i) * 16}) rotate(${r})`}>
                <Fleur x={0} y={0} s={s} />
              </g>
            ))}
          </Art>
        </Layer>
        </LitStage>
      </RoyalBackdrop>
    </>
  );
};

/** لوحة عنوان سميكة (وجه + جانب سفلي + لمعة) */
const Plate: React.FC<{w: number; h: number; fill: string; dark: string}> = ({w, h, fill, dark}) => (
  <g>
    <rect x={-w / 2 + 14} y={-h / 2 + 34} width={w} height={h} rx={30} fill="#000" opacity={0.35} />
    <rect x={-w / 2} y={-h / 2 + 18} width={w} height={h} rx={28} fill={dark} stroke={INK} strokeWidth={8} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill={fill} stroke={INK} strokeWidth={8} />
    <rect x={-w / 2 + 18} y={-h / 2 + 14} width={w - 36} height={h * 0.3} rx={18} fill="#fff" opacity={0.18} />
    <rect x={-w / 2 + 16} y={-h / 2 + 16} width={w - 32} height={h - 32} rx={18} fill="none" stroke="#fff2c0" strokeWidth={3} opacity={0.6} />
  </g>
);

/** خلفية ملكية زرقاء بطبقات أشعة وغبار ذهبي */
const RoyalBackdrop: React.FC<{id: string; f: number; cam: Cam; children: React.ReactNode}> = ({id, f, cam, children}) => (
  <>
    <Sky background="radial-gradient(circle at 50% 48%, #3a6cd0 0%, #1c3f92 42%, #0c1a48 100%)" />
    <LitStage cam={cam} light={LIGHTS.royal}>
      <Layer d={2600}>
        <Art>
          <Rays cx={960} cy={540} rot={f * 0.25} color="#8fb4ff" opacity={0.14} n={14} />
        </Art>
      </Layer>
      <Layer d={1500}>
        <Art>
          <Rays cx={960} cy={540} rot={-f * 0.5} color="#f2c43a" opacity={0.16} n={18} />
          <Halo id={`${id}h`} cx={960} cy={520} r={900} color="#ffe6a0" opacity={0.4} />
        </Art>
      </Layer>
      <Layer d={800}>
        <Art>
          <Motes id={`${id}m1`} frame={f} x0={-600} x1={2500} y0={-100} y1={1200} color="#ffe29a" n={60} size={4} />
        </Art>
      </Layer>
    </LitStage>
    {children}
    <LitStage cam={cam} light={LIGHTS.royal}>
      <Layer d={-150}>
        <Art>
          <Motes id={`${id}m2`} frame={f * 1.6} x0={-200} x1={2100} y0={0} y1={1100} color="#fff0c0" n={26} size={5} />
        </Art>
      </Layer>
    </LitStage>
    <ColorGrade p={ROYAL} lightAt={[50, 45]} lightStrength={0.22} />
    <SoftFilm frame={f} />
  </>
);

/* ================= المونتاج ١: جان بالدرع والراية فوق تلة الشروق ================= */
const HeroHill: React.FC<{f: number; p: number}> = ({f, p}) => {
  const P = GOLDEN;
  const cam: Cam = {...CAM0, x: lerp(-110, 60, p), y: lerp(50, -34, p), z: lerp(-90, 250, easeInOut(p)), ry: lerp(-6, 4, p), rx: lerp(-3, 1, p), fov: lerp(50, 42, p)};
  return (
    <>
      <Sky background={`linear-gradient(${P.skyTop} 0%, ${P.skyMid} 46%, ${P.horizon} 78%)`} />
      <LitStage cam={cam} light={LIGHTS.golden}>
        <Layer d={2900}>
          <Art>
            <GodRays id="s02gr" cx={1240} cy={640} frame={f} color="#fff4d0" opacity={0.6} n={15} />
            <Halo id="s02gs" cx={1240} cy={640} r={900} color="#fff0c0" opacity={0.95} core={9} />
            <circle cx={1240} cy={640} r={120} fill="#fffbe8" />
            <Cloud id="s02g1" x={300 + f * 0.5} y={360} w={1300} h={100} lit="#fff2d0" shade="#d8806a" opacity={0.85} />
            <Cloud id="s02g2" x={1700 + f * 0.4} y={240} w={1100} h={85} lit="#fff2d0" shade="#b86a72" opacity={0.75} />
          </Art>
        </Layer>
        <Layer d={2100}>
          <Art>
            <Ridge id="s02g3" fn={(x) => 720 - 70 * Math.sin(x / 420) - 26 * Math.sin(x / 130)} top={atmos(P.far, P.haze, 0.55)} bottom={atmos(P.city, P.haze, 0.35)} rim={P.rim} />
            <g fill={atmos(P.city, P.haze, 0.38)}>
              <rect x={430} y={560} width={90} height={150} />
              <path d="M 418 562 L 475 480 L 532 562 Z" />
              <rect x={520} y={610} width={180} height={110} />
              <rect x={690} y={540} width={70} height={180} />
              <path d="M 680 542 L 725 466 L 770 542 Z" />
            </g>
          </Art>
        </Layer>
        {/* جيش بعيد بالرايات */}
        <Layer d={1300}>
          <Art>
            <Ridge id="s02g4" fn={(x) => 800 - 40 * Math.sin(x / 520 + 2)} top={atmos(P.mid, P.haze, 0.3)} bottom={P.mid} rim={P.rim} />
            <FarArmy id="s02fa" y={(x) => 800 - 40 * Math.sin(x / 520 + 2)} n={90} x0={-900} x1={2900} frame={f} c={atmos(P.mid, P.haze, 0.18)} rim={P.rim} h={62} />
            <MistBand id="s02g5" frame={f} y={830} color={P.haze} h={70} />
          </Art>
        </Layer>
        {/* التلة البطولية */}
        <Layer d={160}>
          <Art>
            <Ridge id="s02g6" fn={(x) => 885 + ((x - 960) / 620) ** 2 * 90} top="#5a5a44" bottom="#2a2832" rim={P.rim} rimOpacity={0.9} outline />
            {scatter('s02gg', 90, 100, 1850, 0, 1).map((b, i) => {
              const y = 885 + ((b.x - 960) / 620) ** 2 * 90;
              const sw = Math.sin(f / 9 + b.p) * 5;
              return <path key={i} d={`M ${b.x} ${y + 6} q ${sw * 0.5} -16 ${sw} ${-24 - b.r * 18}`} fill="none" stroke={i % 2 ? '#7a7444' : '#4c4a3a'} strokeWidth={4} strokeLinecap="round" />;
            })}
            <Person x={930} y={892} s={2.0} frame={f} {...look('joanOfArc')} expr="determined" pose="stand" holdL="joanBanner" shading="cel" />
          </Art>
        </Layer>
        <Layer d={-120}>
          <Art>
            <Embers id="s02ge" x={960} y={1050} frame={f} n={40} spread={1900} rise={900} size={4.6} life={100} wind={140} color="#ffe09a" />
          </Art>
        </Layer>
        <Layer d={-340} blur={10}>
          <Art>
            {scatter('s02gf', 34, -300, 2300, 1080, 1240).map((b, i) => (
              <path key={i} d={`M ${b.x} 1400 Q ${b.x + Math.sin(f / 10 + b.p) * 18} ${b.y} ${b.x + 24 + Math.sin(f / 10 + b.p) * 34} ${b.y - 130}`} fill="none" stroke="#2c2430" strokeWidth={17} strokeLinecap="round" />
            ))}
          </Art>
        </Layer>
      </LitStage>
      <ColorGrade p={P} lightAt={[66, 54]} lightStrength={0.28} />
      <SoftFilm frame={f} />
    </>
  );
};


/* ================= المونتاج ٢: الجيش الفرنسي يندفع بقيادة لا هير ================= */
const ArmyRun: React.FC<{f: number; lt: number; dur: number}> = ({f, lt, dur}) => {
  const P = CLEAR_DAY;
  const march = lt * 190;
  const p = lt / dur;
  const cam: Cam = {...CAM0, x: lerp(-60, 260, p), y: 20 + Math.sin(f * 0.45) * 5, z: lerp(-30, 130, p), ry: lerp(7, -3, p), rz: Math.sin(f * 0.22) * 0.5, fov: 47};
  const row = (d: number, n: number, x0: number, gap: number, s: number, seed: number) =>
    Array.from({length: n}, (_, i) => (
      <Person
        key={i}
        x={x0 + i * gap + march * 0.6 + ((i * 37) % 40)}
        y={gy(d) + (i % 2) * 16}
        s={s + (i % 3) * 0.04}
        frame={f + i * 5 + seed * 3}
        {...extra('frenchSoldier', i + seed)}
        motion="run"
        travel={march + i * 60}
        energy={0.75}
        expr={i % 3 === 0 ? 'shout' : 'determined'}
        pose={i % 2 ? 'carry' : 'raise'}
        holdR={i % 3 === 0 ? 'flagFrance' : 'spear'}
        shading="cel"
      />
    ));
  return (
    <>
      <Sky background="linear-gradient(#4f94d6 0%, #a4d0f0 52%, #f2ecd2 84%)" />
      <LitStage cam={cam} light={LIGHTS.day}>
        <Layer d={2900}>
          <Art>
            <Halo id="s02ah" cx={420} cy={180} r={620} color="#fff6d0" opacity={0.8} core={6} />
            <Cloud id="s02a1" x={300 + f * 0.6} y={250} w={1100} h={95} lit="#ffffff" shade="#c8dcec" opacity={0.95} />
            <Cloud id="s02a2" x={1600 + f * 0.5} y={170} w={1300} h={110} lit="#ffffff" shade="#c8dcec" opacity={0.95} />
          </Art>
        </Layer>
        <Layer d={2200}>
          <Art>
            <Ridge id="s02a3" fn={(x) => 650 - 60 * Math.sin(x / 430 + 2) - 20 * Math.sin(x / 140)} top="#9fb8ae" bottom="#8aa894" rim="#fff6dc" rimOpacity={0.5} />
            <Ridge id="s02a4" fn={(x) => 700 - 40 * Math.sin(x / 300)} top="#88a878" bottom="#6f9460" rim="#fff6dc" rimOpacity={0.35} />
            {scatter('s02at', 46, -1300, 3200, 690, 730).map((b, i) => (
              <RoundTree key={i} x={b.x} y={b.y} h={44 + b.r * 34} D={false} c="#5f8a52" />
            ))}
          </Art>
        </Layer>
        <Layer d={1400}>
          <Art>
            <rect x={-1400} y={742} width={4800} height={900} fill="#7fa458" />
            <FarArmy id="s02aa" y={() => 742} n={130} x0={-1500} x1={3000} frame={f} c="#6d7f94" rim="#f4f8ff" h={66} march={march * 0.3} />
            <MistBand id="s02am" frame={f} y={775} color="#e8dcb8" h={60} speed={2} />
          </Art>
        </Layer>
      </LitStage>
      <LitStage cam={cam} light={LIGHTS.day}>
        <Floor3D d0={-460} d1={1400}>
          {(len) => (
            <g>
              <defs>
                <linearGradient id="s02ag" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#8cb060" />
                  <stop offset="100%" stopColor="#4c7636" />
                </linearGradient>
              </defs>
              <rect x={-2200} y={0} width={6320} height={len} fill="url(#s02ag)" />
              {scatter('s02ap', 110, -2200, 4100, 0, len).map((b, i) => (
                <ellipse key={i} cx={b.x} cy={b.y} rx={60 + b.r * 130} ry={20 + b.r * 46} fill={i % 2 ? '#6e9848' : '#9ab86a'} opacity={0.45} />
              ))}
              <path d={`M -2200 ${len * 0.52} Q 960 ${len * 0.4} 4120 ${len * 0.54} L 4120 ${len * 0.8} Q 960 ${len * 0.68} -2200 ${len * 0.82} Z`} fill="#c8a878" opacity={0.55} />
            </g>
          )}
        </Floor3D>
      </LitStage>
      <LitStage cam={cam} light={LIGHTS.day}>
        <Layer d={760}>
          <Art>{row(760, 10, -500, 250, 0.82, 1)}</Art>
        </Layer>
        <Layer d={640}>
          <Art>
            <Smoke id="s02d1" x={300 + march * 0.5} y={gy(640)} frame={f} color="#d8c49a" n={12} rise={120} size={70} drift={-300} opacity={0.5} life={60} />
            <Smoke id="s02d2" x={1300 + march * 0.5} y={gy(640)} frame={f + 22} color="#d8c49a" n={12} rise={120} size={70} drift={-300} opacity={0.5} life={60} />
          </Art>
        </Layer>
        <Layer d={400}>
          <Art>{row(400, 7, -330, 300, 1.02, 4)}</Art>
        </Layer>
        <Layer d={120}>
          <Art>
            <Person x={120 + march * 0.6} y={gy(120)} s={1.2} frame={f} {...extra('frenchSoldier', 3)} motion="run" travel={march} energy={0.8} expr="shout" pose="raise" holdR="flagFrance" shading="cel" />
            <Person x={560 + march * 0.6} y={gy(120) + 14} s={1.24} frame={f + 9} {...extra('frenchSoldier', 8)} motion="run" travel={march + 90} energy={0.8} expr="shout" pose="raise" holdR="longsword" shading="cel" />
            <Person x={1140 + march * 0.62} y={gy(120) + 6} s={1.58} frame={f} {...look('laHire')} motion="run" travel={march} pose="raise" holdR="battleAxe" expr="shout" shading="cel" />
            <Smoke id="s02d3" x={1080 + march * 0.6} y={gy(120)} frame={f} color="#e0cca4" n={10} rise={90} size={46} drift={-340} opacity={0.6} life={44} />
          </Art>
        </Layer>
        <Layer d={-300} blur={9}>
          <Art>
            {[0, 1, 2, 3].map((i) => (
              <g key={i} transform={`translate(${-500 + i * 820 + march * 1.5 - 200} ${1150 + Math.sin(f * 0.5 + i * 2) * 22}) rotate(${12 + i * 3})`}>
                <rect x={-13} y={-640} width={26} height={1000} fill="#4a3018" />
                <path d="M 0 -760 L 36 -650 L 0 -616 L -36 -650 Z" fill="#b8c2d0" />
              </g>
            ))}
          </Art>
        </Layer>
      </LitStage>
      <ColorGrade p={P} lightAt={[22, 16]} lightStrength={0.24} />
      <SoftFilm frame={f} strength={0.22} />
    </>
  );
};

/* ================= المونتاج ٣: الراية البيضاء ترفرف بملء الشاشة ================= */
const GreatBanner: React.FC<{f: number; p: number}> = ({f, p}) => {
  const P = GOLDEN;
  const cam: Cam = {...CAM0, x: lerp(-70, 60, p), y: lerp(30, -20, p), z: lerp(-60, 130, p), ry: lerp(9, -4, p), rx: lerp(-2, 1, p), fov: 46};
  const N = 24;
  const X0 = 330;
  const LEN = 1330;
  const wv = (u: number) => Math.sin(f * 0.2 - u * 5.4) * 40 * (0.15 + 0.85 * u);
  const pt = (u: number, y: number) => `${X0 + u * LEN - Math.cos(f * 0.2 - u * 5.4) * 10 * u} ${y + wv(u)}`;
  const topP = Array.from({length: N + 1}, (_, i) => pt(i / N, 190));
  const botP = Array.from({length: N + 1}, (_, i) => pt(1 - i / N, 760));
  const cloth = `M ${topP.join(' L ')} L ${botP.join(' L ')} Z`;
  return (
    <>
      <Sky background="linear-gradient(#2a5cae 0%, #6ea4dc 48%, #ffe2ac 92%)" />
      <LitStage cam={cam} light={LIGHTS.golden}>
        <Layer d={2900}>
          <Art>
            <GodRays id="s02bg" cx={1500} cy={760} frame={f} color="#fff4d0" opacity={0.55} n={15} />
            <Halo id="s02bh" cx={1500} cy={760} r={900} color="#ffecb8" opacity={0.9} core={5} />
            <Cloud id="s02b1" x={200 + f * 0.9} y={330} w={1400} h={120} lit="#ffffff" shade="#e8b89a" opacity={0.92} />
            <Cloud id="s02b2" x={1800 + f * 0.7} y={560} w={1200} h={110} lit="#fff8e8" shade="#e0a890" opacity={0.85} />
            <Cloud id="s02b3" x={-300 + f * 0.8} y={720} w={1200} h={110} lit="#fff8e8" shade="#e0a890" opacity={0.85} />
          </Art>
        </Layer>
        <Layer d={1700}>
          <Art>
            <Ridge id="s02b4" fn={(x) => 960 - 60 * Math.sin(x / 460) - 22 * Math.sin(x / 130)} top={atmos('#5a6a7c', P.haze, 0.5)} bottom="#4a4a66" rim={P.rim} />
          </Art>
        </Layer>
        <Layer d={900}>
          <Art>
            <FarArmy id="s02bf" y={() => 1010} n={70} x0={-600} x1={2600} frame={f} c="#4c4866" rim={P.rim} h={96} />
          </Art>
        </Layer>
        <Layer d={120}>
          <Art>
            <defs>
              <clipPath id="s02bc">
                <path d={cloth} />
              </clipPath>
              <linearGradient id="s02bl" gradientUnits="userSpaceOnUse" x1={X0} x2={X0 + LEN} y1={0} y2={0}>
                {Array.from({length: 13}, (_, i) => {
                  const u = i / 12;
                  const c = Math.cos(f * 0.2 - u * 5.4);
                  return <stop key={i} offset={`${u * 100}%`} stopColor={c > 0 ? '#ffe9b4' : '#4a4a86'} stopOpacity={Math.abs(c) * (0.12 + 0.3 * u)} />;
                })}
              </linearGradient>
            </defs>
            <path d={cloth} fill="#000" opacity={0.18} transform="translate(26 34)" />
            <path d={cloth} fill="#fdfaf0" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
            <g clipPath="url(#s02bc)">
              <path d={`M ${Array.from({length: N + 1}, (_, i) => pt(i / N, 222)).join(' L ')}`} fill="none" stroke="#e8b830" strokeWidth={14} />
              <path d={`M ${Array.from({length: N + 1}, (_, i) => pt(i / N, 728)).join(' L ')}`} fill="none" stroke="#e8b830" strokeWidth={14} />
              {[
                [0.22, 1.9],
                [0.5, 2.6],
                [0.78, 1.9],
              ].map(([u, s]) => (
                <g key={u} transform={`translate(0 ${wv(u)}) `}>
                  <Fleur x={X0 + u * LEN} y={478} s={s} />
                </g>
              ))}
              <rect x={X0 - 80} y={60} width={LEN + 200} height={860} fill="url(#s02bl)" />
            </g>
            <g stroke={INK} strokeWidth={7}>
              <rect x={296} y={70} width={36} height={1500} rx={14} fill="#7a5230" />
              <rect x={302} y={70} width={10} height={1500} fill="#c89660" stroke="none" opacity={0.7} />
              <path d="M 314 -30 L 350 60 L 314 92 L 278 60 Z" fill="#f2c43a" />
            </g>
          </Art>
        </Layer>
        <Layer d={-150}>
          <Art>
            <Embers id="s02be" x={960} y={1120} frame={f} n={30} spread={1900} rise={1000} size={5} life={90} wind={160} color="#fff0b8" />
          </Art>
        </Layer>
      </LitStage>
      <ColorGrade p={P} lightAt={[78, 70]} lightStrength={0.24} />
      <SoftFilm frame={f} />
    </>
  );
};

/* ================= بطاقة العنوان الرئيسية "قصة جان دارك" ================= */
const TitleCard: React.FC<{f: number; t: number; at: number}> = ({f, t, at}) => {
  const pop = easeOutBack(prog(t, at, at + 0.45));
  const F = (s: number) => Math.round(s * FPS);
  const cam = camAt(f, [
    {f: F(at), z: 190, y: 10, ry: 5, fov: 46},
    {f: F(at + 0.8), z: 30, y: 0, ry: 0},
    {f: SCENE02_TRACK.durationFrames, z: 120, x: 20, ry: -4},
  ]);
  return (
    <RoyalBackdrop id="s02tc" f={f} cam={cam}>
    <LitStage cam={cam} light={LIGHTS.royal}>
      <Layer d={1100}>
        <Art>
          <g fill="#12275e" stroke="#0a1638" strokeWidth={4}>
            {scatter('s02sky', 22, -1000, 2900, 0, 1).map((b, i) => (
              <g key={i}>
                <rect x={b.x} y={720 - b.r * 120} width={90 + b.r * 70} height={500} />
                <path d={`M ${b.x - 10} ${722 - b.r * 120} l ${55 + b.r * 35} -80 l ${55 + b.r * 35} 80 Z`} />
                {b.r > 0.4 && <rect x={b.x + 36} y={770 - b.r * 100} width={16} height={26} rx={8} fill="#ffd067" stroke="none" />}
              </g>
            ))}
          </g>
        </Art>
      </Layer>
    </LitStage>
    <LitStage cam={cam} light={LIGHTS.royal}>
      <Floor3D d0={-460} d1={1100}>
        {(len) => <FloorTiles id="s02tf" len={len} a="#1c3474" b="#234088" line="#0e1c48" size={210} far="#8fb0ff" near="#060c24" />}
      </Floor3D>
    </LitStage>
    <LitStage cam={cam} light={LIGHTS.royal}>
      {/* رايتان خلف البطاقة */}
      <Layer d={520}>
        <Art>
          <HangingBanner id="s02th1" x={360} y={-40} w={190} h={520} frame={f} c="#c8242e" dark="#6e0f18" />
          <HangingBanner id="s02th2" x={1560} y={-40} w={190} h={520} frame={f} c="#c8242e" dark="#6e0f18" seed={2} />
        </Art>
      </Layer>
      <Layer d={300}>
        <Art>
          <g transform={`translate(960 420) scale(${pop})`}>
            <rect x={-452} y={-190} width={930} height={430} rx={34} fill="#000" opacity={0.4} />
            <rect x={-465} y={-210} width={930} height={430} rx={34} fill="#8a6414" stroke={INK} strokeWidth={8} />
            <rect x={-465} y={-228} width={930} height={430} rx={34} fill="#fdfaf2" stroke={INK} strokeWidth={8} />
            <rect x={-443} y={-206} width={886} height={386} rx={22} fill="none" stroke="#e8b830" strokeWidth={7} />
            <Fleur x={0} y={-146} s={0.95} />
            {[-400, 400].map((x) => (
              <Fleur key={x} x={x} y={-160} s={0.5} />
            ))}
            <text x={0} y={18} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={130} fill="#1c2a54" direction="rtl">
              قصة جان دارك
            </text>
            <rect x={-372} y={76} width={744} height={86} rx={18} fill="#c8242e" stroke={INK} strokeWidth={6} />
            <text x={0} y={134} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={48} fill="#fffdf6" direction="rtl">
              بأبسط وأطرف طريقة ممكنة!
            </text>
          </g>
        </Art>
      </Layer>
      <Layer d={90}>
        <Art>
          <Person x={270} y={gy(90)} s={1.6} frame={f} {...look('joanOfArc')} expr="happy" pose="stand" holdL="joanBanner" shading="cel" />
          <Person x={1500} y={gy(90) - 8} s={1.24} flip frame={f} {...extra('frenchSoldier', 2)} act="cheer" energy={0.75} shading="cel" />
          <Person x={1690} y={gy(90)} s={1.18} flip frame={f + 5} {...extra('englishSoldier', 1)} act="scared" energy={0.9} shading="cel" />
        </Art>
      </Layer>
    </LitStage>
    </RoyalBackdrop>
  );
};
