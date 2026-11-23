import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {extra, look} from '../../cast';
import {Person} from '../../characters/Person';
import {BigStamp, TitleBanner} from '../../lib/comicFx';
import {SpeechBubble} from '../../lib/dialogue';
import {Halo} from '../../lib/fx';
import {Art, Layer, camAt} from '../../lib/stage';
import {INK, easeOut, easeOutBack, lerp, prog} from '../../lib/util';
import {Cathedral} from './sets';
import {Hud, gy, toScreen} from './stage3d';
import {FPS, SceneTrackAudio, SceneTrackSubtitles, bubbleOf, buildTrack, talkOf} from './audioHelper';

/* =====================================================================
 * المشهد ٧ — معاهدة تروا ١٤٢٠: «أنت مطرود من الميراث!»
 * ===================================================================== */

export const SCENE07_TRACK = buildTrack(
  [
    {kind: 'pause', sec: 0.25},
    {kind: 'clip', id: 's07_nar_1', padAfter: 0.14},
    {kind: 'clip', id: 's07_charles6_1', padAfter: 0.2},
    {kind: 'clip', id: 's07_nar_2', padAfter: 0.12},
    {kind: 'clip', id: 's07_charles7_1', padAfter: 0.24},
    {kind: 'clip', id: 's07_nar_3', padAfter: 0.2},
  ],
  0.55,
);

const KING_D = 230; // عمق الملكين خلف الطاولة
const TABLE_D = 190;
const DAU_D = 110; // عمق الدوفين القريب

export const Scene07: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;

  const c1 = SCENE07_TRACK.byId.s07_nar_1;
  const cC6 = SCENE07_TRACK.byId.s07_charles6_1;
  const c2 = SCENE07_TRACK.byId.s07_nar_2;
  const cC7 = SCENE07_TRACK.byId.s07_charles7_1;
  const c3 = SCENE07_TRACK.byId.s07_nar_3;

  const STAMP_T = c1.t0 + 3.2;
  const JAW_T = cC6.t0 + 0.5;
  const TEASE_T = c3.t0 + (c3.t1 - c3.t0) * 0.62;

  const sfx = [
    {at: STAMP_T, name: 'stamp', vol: 0.68, dur: 0.4},
    {at: JAW_T, name: 'jawDrop', vol: 0.78, dur: 0.6},
    {at: cC7.t0, name: 'pop', vol: 0.65, dur: 0.3},
    {at: TEASE_T, name: 'boom', vol: 0.58, dur: 1.4},
  ];

  const c6Talk = talkOf(SCENE07_TRACK, 's07_charles6_1', t);
  const c7Talk = talkOf(SCENE07_TRACK, 's07_charles7_1', t);
  const c6Bub = bubbleOf(SCENE07_TRACK, 's07_charles6_1', t);
  const c7Bub = bubbleOf(SCENE07_TRACK, 's07_charles7_1', t);

  const c6Speaking = t >= cC6.t0 - 0.05 && t <= cC6.t1 + 0.1;
  const c7Speaking = t >= cC7.t0 - 0.05 && t <= cC7.t1 + 0.1;
  const jawDropped = t >= JAW_T && t < cC7.t0;
  const signedP = prog(t, STAMP_T, STAMP_T + 0.25);
  const crownSlide = easeOut(prog(t, c2.t0 + 0.8, c2.t0 + 2.4));
  const teasePop = easeOutBack(prog(t, TEASE_T, TEASE_T + 0.45));
  const gloom = easeOut(prog(t, TEASE_T, TEASE_T + 0.8));

  // كاميرا: دخول عبر صحن الكاتدرائية ← التوقيع ← شارل السادس ← صدمة الدوفين ← التاج ← الصرخة ← التشويق
  const F = (s: number) => Math.round(s * FPS);
  const cam = camAt(f, [
    {f: 0, x: 0, y: -120, z: -420, rx: 4, ry: 0, fov: 54},
    {f: F(c1.t0 + 2.2), x: -60, y: -10, z: -10, rx: 0, ry: -3, fov: 46},
    {f: F(STAMP_T) - 2, x: -150, y: 10, z: 120, ry: -5},
    {f: F(STAMP_T) + 6, z: 200},
    {f: F(cC6.t0), x: -170, y: -10, z: 190, ry: -5},
    {f: F(cC6.t1), x: -100, y: -10, z: 150, ry: -2},
    {f: F(c2.t0 + 0.5), x: 60, y: 0, z: 60, ry: 2},
    {f: F(c2.t0 + 2.4), x: 0, y: 10, z: 150, ry: 0},
    {f: F(cC7.t0) - 3, x: 90, y: 0, z: 80, ry: 3},
    {f: F(cC7.t0) + 7, x: 270, y: -10, z: 250, ry: 5, fov: 42},
    {f: F(cC7.t1), x: 280, y: -14, z: 290, ry: 3},
    {f: F(c3.t0 + 1.4), x: 60, y: -10, z: 20, ry: 0, fov: 46},
    {f: F(TEASE_T), x: 0, y: -40, z: -60, ry: -2, rx: 1},
    {f: SCENE07_TRACK.durationFrames, x: 0, y: -110, z: -300, ry: 0, rx: 4, fov: 50},
  ]);
  cam.y += 34;
  if (c7Speaking) {
    cam.x += Math.sin(f * 3.7) * 5;
    cam.y += Math.cos(f * 3.1) * 4;
  }
  if (t >= STAMP_T && t < STAMP_T + 0.3) cam.y += Math.sin(f * 4) * 8;

  const yK = gy(KING_D) - 34;
  const yT = gy(TABLE_D) + 6;
  const yD = gy(DAU_D);
  const head6 = toScreen(560, yK - 400, KING_D, cam);
  const head7 = toScreen(1540, yD - 400, DAU_D, cam);

  return (
    <AbsoluteFill style={{background: '#2a1e2c'}}>
      <Cathedral id="s07c" f={f} cam={cam} gloom={gloom}>
        {/* شهود من نبلاء الطرفين خلف الملكين */}
        <Layer d={560}>
          <Art>
            <Person x={340} y={gy(560)} s={0.92} frame={f + 6} {...extra('medievalNoble', 4)} expr={jawDropped ? 'shock' : 'think'} pose="chin" view={24} shading="cel" />
            <Person x={720} y={gy(560) - 4} s={0.9} frame={f + 17} {...extra('medievalNoble', 2)} expr="neutral" pose="stand" view={16} shading="cel" />
            <Person x={1190} y={gy(560) - 4} s={0.92} flip frame={f + 11} {...extra('englishSoldier', 2)} expr="smug" pose="stand" holdR="spear" view={20} shading="cel" />
            <Person x={1380} y={gy(560)} s={0.92} flip frame={f + 21} {...extra('englishSoldier', 5)} expr="smug" pose="stand" holdR="spear" view={20} shading="cel" />
          </Art>
        </Layer>
        {/* الملكان خلف الطاولة */}
        <Layer d={KING_D}>
          <Art>
            <Person
              x={560}
              y={yK}
              s={1.32}
              frame={f}
              {...look('charles6')}
              expr={c6Speaking ? 'happy' : 'dizzy'}
              pose={c6Speaking ? 'point' : 'present'}
              holdR="quill"
              look={c6Speaking ? [1, 0] : [0, -1]}
              talk={c6Talk}
              shading="cel"
            />
            <Person
              x={1030}
              y={yK}
              s={1.36}
              flip
              frame={f + 4}
              {...look('henry5')}
              act={t >= c2.t0 && t < TEASE_T ? 'laugh' : undefined}
              expr="smug"
              pose={t >= c2.t0 ? 'armsUp' : 'cross'}
              shading="cel"
            />
          </Art>
        </Layer>
        {/* طاولة التوقيع */}
        <Layer d={TABLE_D}>
          <Art>
            <g transform={`translate(795 ${yT}) scale(1 0.8)`}>
              <ellipse cx={10} cy={4} rx={470} ry={30} fill="#000" opacity={0.4} />
              <g stroke={INK} strokeWidth={5} strokeLinejoin="round">
                {/* سطح بمنظور */}
                <path d="M -400 -206 L 400 -206 L 448 -164 L -448 -164 Z" fill="#8a5a32" />
                <path d="M -400 -206 L 400 -206 L 408 -198 L -410 -198 Z" fill="#b88250" stroke="none" />
                <rect x={-448} y={-164} width={896} height={22} rx={5} fill="#5e3a1c" />
                {/* مفرش مخملي بطيّات */}
                <path d="M -420 -142 L 420 -142 L 434 0 Q 380 -18 320 2 Q 250 -16 180 2 Q 100 -18 20 2 Q -60 -16 -140 2 Q -220 -18 -300 2 Q -370 -16 -434 0 Z" fill="#9c1e30" />
                {[-340, -200, -60, 80, 220, 350].map((x) => (
                  <path key={x} d={`M ${x} -138 Q ${x + 14} -70 ${x - 6} -6`} fill="none" stroke="#5e0e1c" strokeWidth={10} opacity={0.6} />
                ))}
                <path d="M -433 -16 Q 0 -30 433 -16" fill="none" stroke="#f2c43a" strokeWidth={9} />
                <path d="M -421 -138 L 421 -138" stroke="#f2c43a" strokeWidth={8} />
                {/* لافتة المعاهدة */}
                <rect x={-262} y={-118} width={524} height={88} rx={14} fill="#7a5414" />
                <rect x={-262} y={-126} width={524} height={88} rx={14} fill="#fdfaf2" />
              </g>
              <text x={0} y={-66} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={50} fill="#8a1822" direction="rtl">
                معاهدة تروا — ١٤٢٠
              </text>
              {/* الوثيقة والمحبرة والشمعدان */}
              <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
                <path d="M -252 -202 L -78 -202 L -62 -170 L -272 -170 Z" fill="#f7eed2" />
                <path d="M -236 -192 L -96 -192 M -244 -182 L -86 -182" stroke="#8c7b60" strokeWidth={3} />
                <circle cx={-92} cy={-178} r={10} fill="#b8242e" strokeWidth={3} />
                <g transform="translate(96 0)"><path d="M 300 -186 L 300 -250 M 274 -186 L 326 -186 M 262 -240 Q 300 -216 338 -240" fill="none" stroke="#d9a82e" strokeWidth={9} />
                {[262, 300, 338].map((x, i) => (
                  <g key={x}>
                    <rect x={x - 7} y={-280 + (i === 1 ? -10 : 0)} width={14} height={40} fill="#f6ead0" strokeWidth={3} />
                    <path d={`M ${x} ${-282 + (i === 1 ? -10 : 0)} q -9 -13 0 ${-28 - Math.sin(f * 0.6 + i) * 4} q 9 15 0 28`} fill="#ffc24a" stroke="none" />
                  </g>
                ))}</g>
                <path d="M -330 -172 L -336 -206 L -296 -206 L -302 -172 Z" fill="#2a2838" />
              </g>
              <Halo id="s07cd" cx={396} cy={-290} r={170} color="#ffc870" opacity={0.5} />
              {/* تاج فرنسا ينزلق نحو هنري الخامس */}
              <g transform={`translate(${lerp(-150, 190, crownSlide)} -196)`}>
                <ellipse cx={4} cy={14} rx={56} ry={10} fill="#000" opacity={0.35} />
                {crownSlide > 0.02 && crownSlide < 0.98 && [0, 1, 2].map((i) => <line key={i} x1={-64 - i * 18} x2={-104 - i * 30} y1={-6 - i * 16} y2={-6 - i * 16} stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.8} />)}
                <g stroke={INK} strokeWidth={5} strokeLinejoin="round">
                  <path d="M -46 8 L -54 -50 L -22 -22 L 0 -60 L 22 -22 L 54 -50 L 46 8 Z" fill="#f2c43a" />
                  <path d="M 14 8 L 20 -22 L 54 -50 L 46 8 Z" fill="#b8821a" opacity={0.6} stroke="none" />
                  <rect x={-50} y={0} width={100} height={16} rx={4} fill="#dba61e" />
                  <circle cx={0} cy={8} r={5} fill="#c8242e" strokeWidth={2} />
                </g>
                <path transform={`translate(34 -58) scale(${0.7 + 0.4 * Math.sin(f / 5) ** 2})`} d="M 0 -20 L 5 -5 L 20 0 L 5 5 L 0 20 L -5 5 L -20 0 L -5 -5 Z" fill="#fffbe0" />
              </g>
              {/* ختم «مُوقَّع!» */}
              {signedP > 0 && t < cC6.t0 + 0.1 && (
                <g transform="translate(-160 -260) scale(0.85)">
                  <BigStamp x={0} y={0} text="مُوقَّع!" color="#c8242e" progress={signedP} rot={-10} />
                </g>
              )}
            </g>
          </Art>
        </Layer>
        {/* الدوفين على الطرف الأيمن */}
        <Layer d={DAU_D}>
          <Art>
            <g transform={`translate(1540 ${yD})`}>
              <Person
                x={0}
                y={0}
                s={1.4}
                flip
                frame={f}
                {...look('charles7')}
                expr={c7Speaking ? 'shout' : jawDropped ? 'shock' : 'think'}
                pose={c7Speaking ? 'armsUp' : jawDropped ? 'droop' : 'stand'}
                talk={c7Talk}
                jolt={Math.sin(prog(t, JAW_T, JAW_T + 0.35) * Math.PI)}
                shading="cel"
              />
              {jawDropped && (
                <g transform="translate(0 -220) scale(1.18)">
                  <ellipse cx={0} cy={lerp(8, 38, easeOutBack(prog(t, JAW_T, JAW_T + 0.2)))} rx={24} ry={lerp(16, 58, easeOutBack(prog(t, JAW_T, JAW_T + 0.2)))} fill={INK} />
                  <ellipse cx={0} cy={76} rx={15} ry={12} fill="#c0485a" />
                </g>
              )}
            </g>
          </Art>
        </Layer>
        {/* حشد ظهورهم للكاميرا في المقدمة */}
        <Layer d={-270} blur={8}>
          <Art>
            {[260, 720, 1180, 1660].map((x, i) => (
              <g key={x} transform={`translate(${x} ${1290 + (i % 2) * 24 + Math.sin(f / 20 + i) * 4})`} fill="#1a1222">
                <circle cx={0} cy={-190} r={74} />
                <path d="M -120 60 Q -120 -110 0 -118 Q 120 -110 120 60 Z" />
              </g>
            ))}
          </Art>
        </Layer>
      </Cathedral>
      <Hud>
        {c6Bub && <SpeechBubble text={c6Bub.text} style="shout" headX={head6.x} headTop={Math.max(250, head6.y)} s={1.1} age={c6Bub.age} left={c6Bub.left} side={1} />}
        {c7Bub && <SpeechBubble text={c7Bub.text} style="shout" headX={head7.x} headTop={Math.max(300, head7.y)} s={1.15} age={c7Bub.age} left={c7Bub.left} side={-1} />}
        <TitleBanner
          y={88}
          title={teasePop > 0.05 ? 'لكن بعد عامين فقط.. مفاجأة درامية!' : 'معاهدة تروا — ١٤٢٠'}
          accent={teasePop > 0.05 ? '#f2a620' : '#8e1b2a'}
          scale={teasePop > 0.05 ? Math.max(0, teasePop) : 1}
        />
      </Hud>
      <SceneTrackAudio track={SCENE07_TRACK} sfx={sfx} />
      <SceneTrackSubtitles track={SCENE07_TRACK} hideDialogue />
    </AbsoluteFill>
  );
};
