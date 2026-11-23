import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {camAt} from '../../lib/stage';
import {Cloud, Halo, GodRays, Motes} from '../../lib/fx';
import {INK, clamp, easeInOut, lerp, mixColor, prog, ridgePath} from '../../lib/util';
import {Bird, Chick, FarBirds, Flock, bezier, vFormation} from './Bird';
import {Hud, VArt, VLayer, VStage} from './vstage';
import {BirdLight, Breath, Butterfly, Feathers, Fireflies, Grade, Petals, ShootingStar, WindStreaks, hand} from './polish';
import {Bug, ChannelBadge, Cross, InfoCard, Seed, Snow, Thermo, Txt, fade, pop} from './common';
import {E, FPS, S, wordAt} from './track';

export type SceneProps = {t: number; f: number};
const F = (s: number) => Math.round(s * FPS);

/* ===================== ١) الافتتاح: سرب V في السماء + السؤال ===================== */
export const SceneOpen: React.FC<SceneProps> = ({t, f}) => {
  const L: BirdLight = {lx: 1, shadow: '#4a4a86', rim: '#fff1c2', ambient: '#ffd9a0', ambientOp: 0.12};
  const t0 = 0;
  const t1 = S('s2_2');
  const u0 = prog(t, t0, t1);
  // متابعة السرب بتأخير: الكاميرا تنظر لموضع القائد قبل ٠٫٤ث
  const lagP = bezier([[-420, 1320], [180, 820], [760, 1180], [1950, 380]], Math.max(0, Math.min(1, prog(t - 0.4, t0, t1) * 1.08)));
  const base = camAt(f, [
    {f: F(t0), y: 240, z: 0, rz: -1.5},
    {f: F(t1), y: -120, z: 160, rz: 1},
  ]);
  const cam = hand({...base, x: (Math.max(-200, Math.min(1300, lagP.x)) - 540) * 0.22 * (1 - prog(u0, 0.75, 1)), rz: base.rz + (lagP.ang / 30) * 0.8}, t, 1.2);
  const u = prog(t, t0, t1);
  const lead = {x: lerp(-160, 1800, u), y: lerp(1120, 420, easeInOut(u))};
  const tq = wordAt('s1_2', 'لماذا');
  const k = pop(t, tq - 0.08, 0.4);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#2f7fcf 0%, #8ccbf0 45%, #ffe1ae 100%)'}}>
      <VStage cam={cam}>
        <VLayer d={2600}>
          <VArt>
            <Halo id="op-sun" cx={820} cy={520} r={420} color="#fff1c2" opacity={0.9} core={0.25} />
            <circle cx={820} cy={520} r={90} fill="#fff6d8" />
          </VArt>
        </VLayer>
        <VLayer d={1800}>
          <VArt>
            <path d={ridgePath((x) => 1560 - 160 * Math.sin(x / 230) - 90 * Math.sin(x / 97 + 1), -900, 2000, 3400)} fill="#9fc0d8" />
            <FarBirds frame={f} seed="op-far" color="#5a6a80" pts={Array.from({length: 14}, (_, i) => ({x: 120 + i * 60 + Math.sin(i) * 30, y: 380 + (i % 5) * 40 + i * 6, s: 0.9}))} />
          </VArt>
        </VLayer>
        <VLayer d={1100}>
          <VArt>
            <Cloud id="op-c1" x={160} y={760} w={620} h={150} lit="#ffffff" shade="#d6e8f6" />
            <Cloud id="op-c2" x={960} y={1060} w={700} h={170} lit="#fff8ea" shade="#e7dccd" />
            <Cloud id="op-c3" x={420} y={1500} w={900} h={200} lit="#fff3dc" shade="#efd8ba" />
            <path d={ridgePath((x) => 1720 - 120 * Math.sin(x / 180 + 2), -900, 2000, 3400)} fill="#7fa6bf" />
          </VArt>
        </VLayer>
        <VLayer d={260}>
          <VArt>
            <Flock path={[[-420, 1320], [180, 820], [760, 1180], [1950, 380]]} u={u * 1.08} frame={f} n={7} gap={120} kind="goose" s={0.95} light={L} maxTilt={24} />
          </VArt>
        </VLayer>
        <VLayer d={-380} blur={3}>
          <VArt>
            <Feathers t={t} n={5} seed="op-fe" s={1.3} />
          </VArt>
        </VLayer>
        <VLayer d={-260} blur={6}>
          <VArt>
            <Motes id="op-m" frame={f} n={40} x0={-200} x1={1300} y0={200} y1={1700} color="#fff4cf" size={4} />
            <Cloud id="op-f1" x={lerp(-100, 300, u)} y={1700} w={900} h={260} lit="#ffffff" shade="#f1e6d6" opacity={0.85} />
          </VArt>
        </VLayer>
      </VStage>
      <Grade g={{top: '#2f6fc0', bottom: '#ff9f60', opacity: 0.32, light: '#fff1c2', at: [76, 27], strength: 0.3}} />
      <Hud>
        <ChannelBadge x={540} y={150} s={0.9} opacity={fade(t, 0.2, 0.6, tq - 0.4, tq)} />
        {/* «آلاف الكيلومترات» — مسار متقطع خلف السرب */}
        <g opacity={fade(t, wordAt('s1_1', 'الكيلومترات') - 0.2, wordAt('s1_1', 'الكيلومترات') + 0.3, tq - 0.3, tq)}>
          <Txt x={540} y={300} size={86} fill="#fff" sw={12}>
            آلاف الكيلومترات
          </Txt>
        </g>
        {k > 0 && (
          <g transform={`translate(540 330) scale(${k})`}>
            <Txt x={0} y={-30} size={132} fill="#fff" sw={18}>
              لماذا تهاجرُ
            </Txt>
            <Txt x={0} y={130} size={150} fill="#ffd23a" sw={20}>
              الطيور؟
            </Txt>
          </g>
        )}
      </Hud>
    </AbsoluteFill>
  );
};

/* ===================== ٢) الشمال المتجمد: لا طعام ===================== */
const SNOW_GROUND = 1120;
export const SceneWinter: React.FC<SceneProps> = ({t, f}) => {
  const L: BirdLight = {lx: -1, shadow: '#5d6f96', rim: '#ffffff', ambient: '#bcd2ec', ambientOp: 0.18};
  const t0 = S('s2_2') - 0.3;
  const t1 = S('s3_1');
  const cam = hand(camAt(f, [
    {f: F(t0), z: 0, y: 30},
    {f: F(t1), z: 220, y: 60},
  ]), t, 0.8, {at: wordAt('s2_2', 'تتجمد'), amp: 12});
  const tFood = wordAt('s2_2', 'الطعام');
  const tWinter = wordAt('s2_2', 'الشتاء');
  const tFreeze = wordAt('s2_2', 'تتجمد');
  const tBugs = wordAt('s2_2', 'الحشرات');
  const tSeeds = wordAt('s2_2', 'والبذور');
  const ice = clamp(prog(t, tFreeze - 0.1, tFreeze + 0.9));
  const storm = 0.4 + 0.6 * prog(t, tWinter - 0.2, tWinter + 0.8);
  const peck = Math.max(0, Math.sin(t * 5.5)) ** 6 * (t < tFood ? 1 : 0.4);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#7f97b0 0%, #b9c8d6 55%, #e8eef3 100%)'}}>
      <VStage cam={cam}>
        <VLayer d={2000}>
          <VArt>
            <path d={ridgePath((x) => 1180 - 260 * Math.abs(Math.sin(x / 260)) - 60 * Math.sin(x / 70), -900, 2000, 3400)} fill="#dfe8f1" />
            <path d={ridgePath((x) => 1180 - 260 * Math.abs(Math.sin(x / 260)) - 60 * Math.sin(x / 70) + 90, -900, 2000, 3400)} fill="#b9c9da" opacity={0.6} />
          </VArt>
        </VLayer>
        <VLayer d={900}>
          <VArt>
            <path d={ridgePath((x) => 1250 - 70 * Math.sin(x / 200 + 1), -900, 2000, 3400)} fill="#eef3f8" />
            {[-160, 120, 860, 1160].map((x, i) => (
              <BareTree key={i} x={x} y={1250 - 70 * Math.sin(x / 200 + 1) + 6} s={0.8 + (i % 2) * 0.25} />
            ))}
          </VArt>
        </VLayer>
        <VLayer d={150}>
          <VArt>
            <rect x={-900} y={SNOW_GROUND} width={2900} height={2400} fill="#f4f8fb" />
            <path d={`M -900 ${SNOW_GROUND} Q 200 ${SNOW_GROUND - 40} 540 ${SNOW_GROUND} T 2000 ${SNOW_GROUND} V ${SNOW_GROUND + 30} H -900 Z`} fill="#ffffff" />
            {/* بركة تتجمد */}
            <ellipse cx={820} cy={SNOW_GROUND + 70} rx={230} ry={48} fill={mixColor('#5aa0d8', '#cfe7f7', ice)} stroke={INK} strokeWidth={5} />
            {ice > 0 &&
              [0, 1, 2, 3, 4].map((i) => (
                <path
                  key={i}
                  d={`M ${820 + (i - 2) * 50} ${SNOW_GROUND + 70} l ${30 + i * 8} ${-18 + i * 6} l ${20} ${14}`}
                  stroke="#ffffff"
                  strokeWidth={4}
                  fill="none"
                  opacity={ice}
                />
              ))}
            <Bird light={L} kind="sparrow" mode="perch" x={430} y={SNOW_GROUND - 56} s={1.7} frame={f} expr={t > tFood ? 'sad' : 'neutral'} shiver={storm} peck={peck} />
            <Breath t={t} x={585} y={1018} />
            {/* آثار أقدام */}
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${260 - i * 70} ${SNOW_GROUND + 26} l -8 -10 m 8 10 l 0 -12 m 0 12 l 8 -10`} stroke="#b8c8d8" strokeWidth={4} fill="none" />
            ))}
          </VArt>
        </VLayer>
      </VStage>
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <VStage cam={cam}>
          <VLayer d={-420} blur={5}>
            <VArt>
              <path d="M -300 180 C 0 260 200 230 420 330 C 520 375 600 380 700 360" stroke="#3b2e2a" strokeWidth={46} fill="none" strokeLinecap="round" />
              <path d="M -300 150 C 0 225 200 196 420 296 C 520 340 600 346 700 330" stroke="#ffffff" strokeWidth={24} fill="none" strokeLinecap="round" />
              <path d="M 300 300 C 340 400 330 470 380 540" stroke="#3b2e2a" strokeWidth={20} fill="none" strokeLinecap="round" />
            </VArt>
          </VLayer>
        </VStage>
      </AbsoluteFill>
      <Grade g={{top: '#a8c4e8', bottom: '#3d4e72', opacity: 0.42, light: '#ffffff', at: [18, 8], strength: 0.2}} />
      <Hud>
        <Snow frame={f} n={Math.round(60 + 90 * storm)} seed="w-sn" speed={3 + 5 * storm} />
        <WindStreaks t={t} n={Math.round(14 * storm)} seed="w-ws" opacity={0.35 * storm} speed={1400} />
        <Snow frame={f} n={14} seed="w-sn2" speed={9} size={16} opacity={0.75} />
        {/* فقاعة تفكير: أين الطعام؟ */}
        {(() => {
          const k = pop(t, tFood - 0.1);
          const out = fade(t, 0, 0.01, tBugs - 0.3, tBugs);
          return k > 0 && out > 0 ? (
            <g transform={`translate(640 780) scale(${k})`} opacity={out}>
              <circle cx={-110} cy={120} r={14} fill="#fff" stroke={INK} strokeWidth={4} />
              <circle cx={-76} cy={78} r={22} fill="#fff" stroke={INK} strokeWidth={4} />
              <ellipse cx={40} cy={-20} rx={170} ry={110} fill="#fff" stroke={INK} strokeWidth={6} />
              <Bug x={-20} y={-20} s={2.2} frame={f} />
              <Seed x={70} y={-20} s={1.6} />
              <Txt x={130} y={50} size={90} fill="#d8322e" stroke="#fff" sw={10}>
                ؟
              </Txt>
            </g>
          ) : null;
        })()}
        <Thermo x={140} y={460} s={1.4} level={1 - 0.85 * prog(t, tWinter - 0.2, tFreeze + 0.6)} />
        <g opacity={fade(t, tWinter - 0.2, tWinter + 0.2)}>
          <Txt x={140} y={620} size={56} fill="#e9f4ff" sw={9}>
            شتاء
          </Txt>
        </g>
        <InfoCard x={600} y={330} k={pop(t, tBugs - 0.1)} label="الحشرات" icon={<g><Bug x={0} y={0} s={2} frame={f} /><Cross k={pop(t, tBugs + 0.3)} /></g>} w={520} />
        <InfoCard x={600} y={490} k={pop(t, tSeeds - 0.1)} label="البذور" icon={<g><Seed x={0} y={0} s={1.5} /><Cross k={pop(t, tSeeds + 0.3)} /></g>} w={520} />
      </Hud>
    </AbsoluteFill>
  );
};

const BareTree: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke="#5b4a40" strokeLinecap="round" fill="none">
    <path d="M 0 0 L 0 -260" strokeWidth={24} />
    <path d="M 0 -120 L -80 -210 M 0 -170 L 70 -260 M 0 -220 L -40 -300 M -50 -175 L -100 -200 M 40 -220 L 100 -230" strokeWidth={11} />
    <path d="M -100 -205 q 20 -14 40 -4 M 60 -262 q 22 -12 44 0" stroke="#fff" strokeWidth={10} />
  </g>
);

/* ===================== ٣) الرحلة جنوباً: من الثلج إلى الدفء ===================== */
// شريط عمودي طويل: الشمال في الأعلى والجنوب في الأسفل، والكاميرا تنزل مع السرب
export const SceneSouth: React.FC<SceneProps> = ({t, f}) => {
  const L: BirdLight = {lx: 1, shadow: '#3a2f6a', rim: '#ffe6a8'};
  const t0 = S('s3_1') - 0.3;
  const t1 = S('s4_1');
  const tWarm = wordAt('s3_1', 'الدفء');
  const tFood = wordAt('s3_1', 'والغذاء');
  const cy = camAt(f, [
    {f: F(t0), y: -4500},
    {f: F(tWarm + 0.3), y: 230},
  ]).y;
  const cam = hand({x: 0, y: cy, z: 0, rx: 0, ry: 0, rz: 2.2 * Math.sin(t * 1.3), fov: 45}, t, 1.6);
  const flockY = cy + 760 + 30 * Math.sin(t * 2);
  const arrive = prog(t, tWarm, t1);
  return (
    <AbsoluteFill style={{background: mixColor('#8fb0cc', '#f7c98a', prog(t, t0, tWarm))}}>
      <VStage cam={cam}>
        <VLayer d={500}>
          <VArt y0={-4600} h={7400}>
            {/* الشمال الثلجي */}
            <rect x={-900} y={-4600} width={2900} height={2500} fill="#eef4f8" />
            {Array.from({length: 22}, (_, i) => {
              const x = -300 + (i % 11) * 160 + (i > 10 ? 80 : 0);
              const y = -3200 + (i > 10 ? 420 : 0) + random(`pn${i}`) * 120;
              return <path key={i} d={`M ${x} ${y} l -45 110 h 90 Z M ${x} ${y + 50} l -55 120 h 110 Z`} fill="#2f5d4a" stroke={INK} strokeWidth={4} />;
            })}
            {/* الساحل والبحر */}
            <path d="M -900 -2100 Q 200 -2000 540 -2140 T 2000 -2080 V -700 H -900 Z" fill="#3f8fcf" />
            {Array.from({length: 26}, (_, i) => {
              const y = -1980 + Math.floor(i / 6) * 260;
              const x = -260 + (i % 6) * 280 + Math.sin(f * 0.08 + i) * 20 + (Math.floor(i / 6) % 2) * 140;
              return <path key={i} d={`M ${x} ${y} q 30 -24 60 0 q 30 -24 60 0`} stroke="#d9efff" strokeWidth={6} fill="none" strokeLinecap="round" />;
            })}
            {/* الصحراء */}
            <path d="M -900 -760 Q 300 -820 540 -700 T 2000 -760 V 500 H -900 Z" fill="#efc47e" />
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={ridgePath((x) => -420 + i * 230 - 70 * Math.sin(x / 170 + i * 2), -900, 2000, -420 + i * 230 + 240)} fill={['#e8b56a', '#f2cc8a', '#e3aa5a', '#efc27c'][i]} />
            ))}
            {/* الجنوب الدافئ: مستنقع أخضر وبحيرة */}
            <path d="M -900 420 Q 300 360 540 440 T 2000 400 V 2600 H -900 Z" fill="#7cc26a" />
            <ellipse cx={560} cy={1150} rx={420} ry={120} fill="#4fa7d8" stroke={INK} strokeWidth={6} />
            {Array.from({length: 16}, (_, i) => {
              const x = 100 + i * 60;
              const y = 1050 + (i % 2) * 210 - (i > 7 ? 0 : 0);
              return <path key={i} d={`M ${x} ${y} q -6 -60 4 -110`} stroke="#3d7a32" strokeWidth={7} fill="none" strokeLinecap="round" />;
            })}
          </VArt>
        </VLayer>
        <VLayer d={0}>
          <VArt y0={-5000} h={8000}>
            <Flock path={[[300, flockY - 200], [450, flockY - 100], [620, flockY + 10], [800, flockY + 130]]} u={0.72 + 0.06 * Math.sin(t * 1.4)} frame={f} n={5} gap={150} kind="swallow" s={1.05} light={L} bursts={false} tilt={34} seed={3} />
            {/* حشرات وفيرة عند الوصول */}
            {arrive > 0 &&
              Array.from({length: 18}, (_, i) => (
                <g key={i} opacity={clamp(prog(t, tFood - 0.2 + i * 0.03, tFood + 0.2 + i * 0.03))}>
                  <Bug x={160 + random(`sb${i}`) * 760 + Math.sin(f * 0.1 + i) * 30} y={cy + 1000 + random(`sb2${i}`) * 260 + Math.cos(f * 0.12 + i) * 20} s={1.1} frame={f} seed={i} />
                </g>
              ))}
          </VArt>
        </VLayer>
      </VStage>
      <Grade g={{top: '#ffd590', bottom: '#4a3a70', opacity: 0.3, light: '#fff0c0', at: [50, 0], strength: 0.25}} />
      <Hud>
        <WindStreaks t={t} n={16} seed="s-ws" vertical speed={-1600} opacity={0.3 * (1 - prog(t, tWarm - 0.2, tWarm + 0.4))} />
        {/* بوصلة الاتجاه: جنوباً */}
        <g transform="translate(930 260)">
          <circle r={82} fill="#fff" stroke={INK} strokeWidth={6} />
          <path d="M 0 -58 L 18 0 L 0 62 L -18 0 Z" fill="#d8322e" stroke={INK} strokeWidth={4} transform={`rotate(${180 * pop(t, t0 + 0.3)})`} />
          <Txt x={0} y={-92} size={40} fill={INK} stroke="#fff" sw={6}>
            ش
          </Txt>
          <Txt x={0} y={130} size={40} fill={INK} stroke="#fff" sw={6}>
            ج
          </Txt>
        </g>
        <g opacity={fade(t, t0 + 0.2, t0 + 0.6, tWarm - 0.3, tWarm)}>
          <Txt x={480} y={300} size={110} fill="#fff" sw={15}>
            جنوباً
          </Txt>
          <path d="M 480 340 L 480 420 M 450 392 L 480 426 L 510 392" stroke="#fff" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
        <Thermo x={130} y={470} s={1.3} level={0.15 + 0.8 * prog(t, t0, tWarm + 0.2)} />
        <g opacity={fade(t, tWarm - 0.1, tWarm + 0.3)}>
          <Txt x={480} y={300} size={96} fill="#ffe27a" sw={14}>
            دفء
          </Txt>
        </g>
        <g opacity={fade(t, tFood - 0.1, tFood + 0.3)}>
          <Txt x={480} y={440} size={84} fill="#c8f7a8" sw={12}>
            وغذاء وفير
          </Txt>
        </g>
      </Hud>
    </AbsoluteFill>
  );
};

/* ===================== ٤) الربيع في الشمال: لماذا العودة؟ + العش ===================== */
export const SceneSpring: React.FC<SceneProps> = ({t, f}) => {
  const L: BirdLight = {lx: -1, shadow: '#36557a', rim: '#fff6c0', ambient: '#fff3c0', ambientOp: 0.1};
  const t0 = S('s4_1') - 0.3;
  const t1 = S('s5_1');
  const tNest = S('s4_2');
  const tLong = wordAt('s4_1', 'أطول');
  const tMore = wordAt('s4_1', 'أكثر');
  const tLess = wordAt('s4_1', 'أقل');
  const cam = hand(camAt(f, [
    {f: F(t0), x: 0, y: 80, z: 0},
    {f: F(tNest - 0.3), x: 0, y: 40, z: 60},
    {f: F(tNest + 0.9), x: 170, y: -160, z: 900},
    {f: F(t1), x: 180, y: -170, z: 980},
  ]), t, 1);
  const flyIn = prog(t, t0, t0 + 4.6);
  const tLand = tNest + 1.7;
  const landU = prog(t, tNest + 0.35, tLand);
  const landP = bezier([[1300, 470], [1080, 520], [920, 760], [790, 885]], 1 - (1 - landU) * (1 - landU));
  const since = t - tLand;
  const shake = since > 0 ? 3.2 * Math.exp(-since * 4) * Math.sin(since * 26) : 0;
  const squash = since > 0 ? Math.exp(-since * 6) * Math.sin(since * 22) * 10 : 0;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#4aa6ec 0%, #a9dcf7 55%, #e9f7e2 100%)'}}>
      <VStage cam={cam}>
        <VLayer d={2400}>
          <VArt>
            <Halo id="sp-sun" cx={300} cy={380} r={360} color="#fff6c8" opacity={0.95} core={0.3} />
            <circle cx={300} cy={380} r={88} fill="#fff4b8" stroke="#ffd24a" strokeWidth={8} />
            <GodRays id="sp-gr" cx={300} cy={380} frame={f} color="#fff3b0" opacity={0.22} />
          </VArt>
        </VLayer>
        <VLayer d={1300}>
          <VArt>
            <Cloud id="sp-c1" x={820} y={560} w={520} h={130} lit="#fff" shade="#dcecf8" />
            <path d={ridgePath((x) => 1320 - 110 * Math.sin(x / 210 + 0.5), -900, 2000, 3400)} fill="#8fcf74" />
          </VArt>
        </VLayer>
        <VLayer d={600}>
          <VArt>
            <path d={ridgePath((x) => 1400 - 60 * Math.sin(x / 150 + 2), -900, 2000, 3400)} fill="#6fbf5a" />
            {Array.from({length: 40}, (_, i) => (
              <circle key={i} cx={-300 + random(`fl${i}`) * 1700} cy={1420 + random(`fl2${i}`) * 300} r={9} fill={['#ffef6a', '#ff8fb0', '#ffffff'][i % 3]} stroke={INK} strokeWidth={2.5} />
            ))}
          </VArt>
        </VLayer>
        <VLayer d={150}>
          <VArt>
            {/* شجرة مزهرة والعش */}
            <path d="M 820 1900 C 800 1500 840 1200 780 900" stroke="#6b4a32" strokeWidth={54} fill="none" strokeLinecap="round" />
            <path d="M 790 1000 C 700 940 640 930 560 940" stroke="#6b4a32" strokeWidth={26} fill="none" strokeLinecap="round" />
            {Array.from({length: 9}, (_, i) => (
              <circle key={i} cx={760 + Math.cos(i * 0.8) * 230} cy={720 + Math.sin(i * 1.3) * 120} r={120} fill={i % 2 ? '#8fd16e' : '#7cc25c'} stroke={INK} strokeWidth={5} />
            ))}
            {Array.from({length: 22}, (_, i) => (
              <circle key={i} cx={560 + random(`bl${i}`) * 420} cy={600 + random(`bl2${i}`) * 260} r={10} fill="#ffc4d6" stroke={INK} strokeWidth={2.5} />
            ))}
            {/* العش + الأب: يهتزان معاً حين يهبط الأب على الغصن */}
            <g transform={`rotate(${shake} 560 940)`}>
            <g transform="translate(640 930)">
              {[0, 1, 2].map((i) => (
                <Chick key={i} x={-46 + i * 46 + (since > 0 ? Math.min(1, since * 3) * (8 + i * 6) : 0)} y={-34 - (since > 0 ? Math.abs(Math.sin(since * 9 + i)) * 14 * Math.exp(-since * 0.8) : 0)} s={0.85} frame={f} seed={i} chirp={t > tNest ? 1 : 0.2} />
              ))}
              <path d="M -110 -20 Q 0 70 110 -20 Q 90 30 0 40 Q -90 30 -110 -20 Z" fill="#a87a4a" stroke={INK} strokeWidth={5} />
              {[-80, -40, 0, 40, 80].map((x) => (
                <path key={x} d={`M ${x - 30} ${-4 + Math.abs(x) * 0.1} q 30 14 60 0`} stroke="#7a5532" strokeWidth={4} fill="none" />
              ))}
            </g>
            {/* الأب يصل بدودة */}
            {t > tNest + 0.35 && (
              <Bird
                light={L}
                kind="swallow"
                mode={since < 0 ? 'fly' : 'perch'}
                x={landP.x}
                y={landP.y + squash}
                s={0.95}
                frame={f}
                flip
                carry="worm"
                expr="happy"
                flare={since < 0 ? prog(landU, 0.5, 0.95) : 0}
                legs={since < 0 ? prog(landU, 0.4, 0.85) : 0}
                rot={since < 0 ? -12 * (1 - landU) : 0}
              />
            )}
            </g>
          </VArt>
        </VLayer>
        <VLayer d={60}>
          <VArt>
            <Butterfly x={300 + Math.sin(t * 0.9) * 140} y={1180 + Math.cos(t * 1.3) * 60} t={t} />
            <Butterfly x={960 + Math.sin(t * 1.1 + 2) * 120} y={1060 + Math.cos(t * 0.8) * 70} t={t + 0.3} color="#8fd0ff" s={0.85} />
            <Motes id="sp-m" frame={f} n={36} x0={-100} x1={1200} y0={400} y1={1500} color="#fff6b0" size={3.5} />
          </VArt>
        </VLayer>
        <VLayer d={-360} blur={4}>
          <VArt>
            {Array.from({length: 26}, (_, i) => (
              <path key={i} d={`M ${-260 + i * 62} 2000 q ${(i % 3) * 14 - 14} -160 ${(i % 2) * 30 - 10} -${260 + (i % 4) * 50}`} stroke={i % 2 ? '#4f9a3e' : '#3e8030'} strokeWidth={22} fill="none" strokeLinecap="round" />
            ))}
            <Petals t={t} n={16} seed="sp-pt" />
          </VArt>
        </VLayer>
        <VLayer d={0}>
          <VArt>
            {/* السرب عائد للشمال */}
            {flyIn < 1 && <Flock path={[[-350, 1300], [250, 760], [720, 820], [1850, -150]]} u={flyIn * 1.12} frame={f} n={5} gap={105} kind="swallow" s={0.9} light={L} seed={5} />}
            {t > tMore - 0.3 && t < tNest + 0.5 &&
              Array.from({length: 14}, (_, i) => (
                <Bug key={i} x={120 + random(`spb${i}`) * 800 + Math.sin(f * 0.1 + i) * 30} y={900 + random(`spb2${i}`) * 300 + Math.cos(f * 0.13 + i) * 20} s={1.1} frame={f} seed={i} />
              ))}
          </VArt>
        </VLayer>
      </VStage>
      <Grade g={{top: '#fff0b0', bottom: '#2f5a44', opacity: 0.3, light: '#fff6c0', at: [28, 20], strength: 0.3}} />
      <Hud>
        {(() => {
          const out = 1 - prog(t, tNest - 0.2, tNest + 0.2);
          if (out <= 0) return null;
          return (
            <g opacity={out}>
              <InfoCard x={540} y={200} k={pop(t, tLong - 0.15)} label="نهار أطول" w={620} icon={<g><circle r={34} fill="#ffd84a" stroke={INK} strokeWidth={5} />{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <path key={i} d="M 0 -44 L 0 -56" stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * 45})`} />)}</g>} />
              <InfoCard x={540} y={350} k={pop(t, tMore - 0.15)} label="طعام أكثر" w={620} icon={<g><Bug x={-16} y={8} s={1.3} frame={f} /><Bug x={20} y={-14} s={1.1} frame={f} seed={2} /></g>} />
              <InfoCard x={540} y={500} k={pop(t, tLess - 0.15)} label="منافسة أقل" w={620} icon={<g transform="scale(0.42)"><Bird light={L} kind="sparrow" mode="perch" x={0} y={-10} frame={f} expr="happy" /></g>} />
            </g>
          );
        })()}
      </Hud>
    </AbsoluteFill>
  );
};
