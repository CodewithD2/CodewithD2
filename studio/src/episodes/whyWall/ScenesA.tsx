import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {camAt} from '../../lib/stage';
import {Cloud, Embers, GodRays, Halo, MistBand, Motes, Smoke} from '../../lib/fx';
import {INK, clamp, easeInOut, lerp, mixColor, prog} from '../../lib/util';
import {Person} from '../../characters/Person';
import type {CharLight} from '../../characters/light';
import {extra, look} from '../../cast';
import {FarBirds} from '../whyBirds/Bird';
import {Hud, VArt, VLayer, VStage} from '../../shorts/vstage';
import {Grade, WindStreaks, hand} from '../../shorts/polish';
import {ChannelBadge, Txt, fade, pop} from '../../shorts/common';
import {Horse, MountainBand, PagodaRoof, SteppeGrass, WallRidge, Watchtower} from './assets';
import {AsiaMap, MAP, MAP_H, QIN_EMPIRE, QIN_WALL, STATE_WALLS, line, mp} from './chinaMap';
import {S, wordAt} from './track';
import {FPS} from '../../shorts/track';

export type SceneProps = {t: number; f: number};
const F = (s: number) => Math.round(s * FPS);

/* ===================== ١) الافتتاح: السور يتلوّى فوق الجبال عند الفجر ===================== */
export const SceneOpen: React.FC<SceneProps> = ({t, f}) => {
  const t1 = S('s2_1');
  const cam = hand(camAt(f, [
    {f: 0, y: 420, z: 0, rz: -1},
    {f: F(t1), y: -80, z: 260, rz: 0.8},
  ]), t, 1);
  const tq = wordAt('s1_2', 'فلماذا');
  const tKm = wordAt('s1_1', 'الكيلومترات');
  const far = (x: number) => 1060 - 170 * Math.abs(Math.sin(x / 230 + 0.6)) - 40 * Math.sin(x / 71);
  const mid = (x: number) => 1260 - 200 * Math.abs(Math.sin(x / 300 + 1.4)) - 30 * Math.sin(x / 90);
  const near = (x: number) => 1560 - 360 * Math.sin((x + 200) / 520) - 40 * Math.sin(x / 120);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#5b86c6 0%, #b7c9e2 38%, #ffd7a0 70%, #ffb877 100%)'}}>
      <VStage cam={cam}>
        <VLayer d={2800}>
          <VArt>
            <Halo id="op-sun" cx={720} cy={980} r={620} color="#fff0c0" opacity={0.95} core={0.25} />
            <circle cx={720} cy={980} r={120} fill="#fff4d0" />
            <GodRays id="op-gr" cx={720} cy={980} frame={f} color="#fff0c0" opacity={0.25} />
            <Cloud id="op-c1" x={260} y={560} w={560} h={110} lit="#fff3e0" shade="#e2c7b8" opacity={0.9} />
            <Cloud id="op-c2" x={960} y={420} w={480} h={90} lit="#fff6e6" shade="#d9c4c4" opacity={0.8} />
          </VArt>
        </VLayer>
        <VLayer d={1900}>
          <VArt>
            <MountainBand fn={far} fill="#a6b4c8" />
            <WallRidge id="op-w1" fn={far} x0={-700} x1={1800} h={12} step={10} outline={2} stone="#b9b3b0" top="#cfc6bf" towersAt={[-200, 300, 820, 1350]} towerS={0.6} />
            <MistBand id="op-m1" frame={f} y={1120} color="#f2e0d0" x0={-900} x1={2000} h={160} />
          </VArt>
        </VLayer>
        <VLayer d={1000}>
          <VArt>
            <MountainBand fn={mid} fill="#7d8fa8" />
            <WallRidge id="op-w2" fn={mid} x0={-700} x1={1800} h={26} step={14} outline={3} stone="#b5a690" top="#d2c3a6" towersAt={[-100, 520, 1180]} towerS={0.6} />
            <MistBand id="op-m2" frame={f} y={1340} color="#efd9c4" x0={-900} x1={2000} h={200} />
            <FarBirds frame={f} seed="op-b" color="#4a4a5a" pts={Array.from({length: 7}, (_, i) => ({x: 200 + i * 46 + lerp(0, 380, prog(t, 0, t1)), y: 700 + (i % 3) * 22 - i * 8, s: 0.8}))} />
          </VArt>
        </VLayer>
        <VLayer d={280}>
          <VArt>
            <MountainBand fn={near} fill="#5b6e5a" />
            <path d={`M -900 3400 L -900 ${near(-900)} ${Array.from({length: 220}, (_, i) => `L ${-900 + i * 14} ${near(-900 + i * 14) + 30}`).join(' ')} L 2200 3400 Z`} fill="#4c5f4c" opacity={0.5} />
            <WallRidge id="op-w3" fn={near} x0={-700} x1={1800} h={70} step={18} towersAt={[-260, 420, 1120]} towerS={0.95} />
          </VArt>
        </VLayer>
        <VLayer d={-320} blur={5}>
          <VArt>
            {/* غصن صنوبر أمامي خارج التركيز */}
            <path d="M 1300 80 C 1100 140 960 180 760 300" stroke="#2c3a2a" strokeWidth={30} fill="none" strokeLinecap="round" />
            {Array.from({length: 16}, (_, i) => {
              const x = 1240 - i * 30;
              const y = 100 + i * 12;
              return <path key={i} d={`M ${x} ${y} l -40 70 M ${x} ${y} l 30 76 M ${x} ${y} l -70 30`} stroke="#3b5a36" strokeWidth={9} strokeLinecap="round" />;
            })}
          </VArt>
        </VLayer>
        <VLayer d={-150} blur={1.5}>
          <VArt>
            <Motes id="op-mo" frame={f} n={40} x0={-200} x1={1300} y0={300} y1={1600} color="#fff1c8" size={4} />
          </VArt>
        </VLayer>
      </VStage>
      <Grade g={{top: '#4a6fb0', bottom: '#ff9a5a', opacity: 0.3, light: '#fff0c0', at: [67, 51], strength: 0.3}} />
      <Hud>
        <ChannelBadge x={540} y={150} s={0.9} opacity={fade(t, 0.2, 0.6, tq - 0.4, tq)} />
        <g opacity={fade(t, tKm - 0.15, tKm + 0.3, tq - 0.3, tq)}>
          <Txt x={540} y={320} size={88} fill="#fff" sw={13}>
            آلاف الكيلومترات
          </Txt>
        </g>
        {pop(t, tq - 0.08, 0.4) > 0 && (
          <g transform={`translate(540 300) scale(${pop(t, tq - 0.08, 0.4)})`}>
            <Txt x={0} y={0} size={120} fill="#fff" sw={17}>
              لماذا بُنيَ
            </Txt>
            <Txt x={0} y={150} size={118} fill="#ffd23a" sw={17}>
              سورُ الصين؟
            </Txt>
          </g>
        )}
      </Hud>
    </AbsoluteFill>
  );
};

/* ===================== ٢) فرسان السهوب يغيرون ثم يختفون ===================== */
const RIDERS = [0, 1, 2];
export const SceneNomads: React.FC<SceneProps> = ({t, f}) => {
  const t0 = S('s2_1') - 0.3;
  const t1 = S('s3_1');
  const tHorse = wordAt('s2_1', 'الخيل');
  const tRaid = wordAt('s2_1', 'يغيرون');
  const tVanish = wordAt('s2_1', 'يختفون');
  const run = prog(t, t0, t1);
  const L: CharLight = {dir: 1, key: '#ffe0a8', shadow: '#5a3a4a', ambient: 0.1, rim: 0.7};
  const riderX = (i: number) => lerp(-520, 1700, easeInOut(prog(t, t0 + i * 0.25, t1 + 0.6))) - i * 230;
  const camX = clamp((riderX(1) - 540) * 0.18, -60, 160);
  const cam = hand({...camAt(f, [{f: F(t0), z: 0, y: 40}, {f: F(t1), z: 160, y: 0}]), x: camX}, t, 1.2, {at: tRaid - 0.05, amp: 9});
  const scared = t > tRaid - 0.2;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#6fa6d8 0%, #bcd8e8 45%, #f6dca4 100%)'}}>
      <VStage cam={cam}>
        <VLayer d={2400}>
          <VArt>
            <Halo id="nm-sun" cx={880} cy={520} r={380} color="#fff4cc" opacity={0.9} core={0.3} />
            <Cloud id="nm-c1" x={300} y={480} w={520} h={110} lit="#fff" shade="#d8e6f0" />
            <Cloud id="nm-c2" x={900} y={760} w={420} h={90} lit="#fffaf0" shade="#e6e0d6" opacity={0.85} />
          </VArt>
        </VLayer>
        <VLayer d={1500}>
          <VArt>
            <MountainBand fn={(x) => 1180 - 90 * Math.sin(x / 260) - 30 * Math.sin(x / 80)} fill="#c7b58a" />
            <MountainBand fn={(x) => 1260 - 60 * Math.sin(x / 190 + 2)} fill="#b8a46e" />
          </VArt>
        </VLayer>
        <VLayer d={600}>
          <VArt>
            <rect x={-1000} y={1240} width={3200} height={2400} fill="#c9b062" />
            {/* قرية ومزرعة على اليمين */}
            {[[760, 1240, 1], [930, 1250, 0.8], [1080, 1236, 0.9]].map(([x, y, s], i) => (
              <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
                <rect x={-70} y={-110} width={140} height={110} fill="#d8c4a0" stroke={INK} strokeWidth={5} />
                <rect x={-18} y={-64} width={36} height={64} fill="#5a3a24" stroke={INK} strokeWidth={4} />
                <PagodaRoof x={0} y={-110} w={170} h={54} color="#5a4a3a" under="#8a3a2a" />
              </g>
            ))}
            {Array.from({length: 7}, (_, i) => (
              <path key={i} d={`M ${620 + i * 30} 1330 q 260 -10 520 0`} stroke="#9a8a3a" strokeWidth={6} fill="none" opacity={0.6} />
            ))}
          </VArt>
        </VLayer>
        <VLayer d={260}>
          <VArt>
            <Person {...extra('chineseFarmer', 2)} light={L} x={820} y={1300} s={0.78} frame={f} flip expr={scared ? 'shock' : 'neutral'} pose={scared ? 'armsUp' : 'stand'} act={scared ? 'scared' : undefined} jolt={Math.sin(prog(t, tRaid - 0.2, tRaid + 0.15) * Math.PI)} />
          </VArt>
        </VLayer>
        <VLayer d={90}>
          <VArt>
            {RIDERS.map((i) => (
              <Horse
                key={i}
                x={riderX(i)}
                y={1250 + i * 34}
                s={0.82 + i * 0.05}
                frame={f}
                seed={i * 1.7}
                color={['#7a4a2a', '#3a2a22', '#c8b090'][i]}
                mane={['#2a1a10', '#1a1210', '#6a5a4a'][i]}
                rider={<Person {...extra('steppeRider', i + 1)} light={L} x={-8} y={-140} s={0.78} frame={f} view="side" pose={i === 1 ? 'point' : 'fist'} expr="shout" />}
              />
            ))}
          </VArt>
        </VLayer>
        <VLayer d={-260} blur={4}>
          <VArt>
            <SteppeGrass y0={1700} y1={2300} n={120} t={t} seed="nm-g" color="#8a7a3a" />
          </VArt>
        </VLayer>
      </VStage>
      <Grade g={{top: '#6a9ad0', bottom: '#b07a3a', opacity: 0.28, light: '#fff0c0', at: [80, 27], strength: 0.25}} />
      <Hud>
        <WindStreaks t={t} n={10} seed="nm-ws" color="#f3e0b0" opacity={0.35} speed={1300} />
        <g opacity={fade(t, tHorse - 0.4, tHorse, tRaid - 0.3, tRaid)} transform={`translate(540 250) scale(${0.9 + 0.1 * pop(t, tHorse - 0.4)})`}>
          <Txt x={0} y={0} size={92} fill="#fff" sw={13}>
            البدو الرُّحَّل
          </Txt>
        </g>
        <g opacity={fade(t, tRaid - 0.1, tRaid + 0.2, tVanish - 0.2, tVanish + 0.2)} transform={`translate(540 260) scale(${pop(t, tRaid - 0.1, 0.35)})`}>
          <Txt x={0} y={0} size={110} fill="#ff6a4a" sw={15}>
            غارة!
          </Txt>
        </g>
        {/* سحابة غبار تبقى بعد اختفائهم */}
        <g opacity={fade(t, tVanish - 0.3, tVanish + 0.4) * (1 - prog(t, t1 - 0.6, t1))}>
          {Array.from({length: 9}, (_, i) => (
            <circle key={i} cx={680 + i * 70 + Math.sin(t + i) * 20} cy={1150 - (i % 3) * 40 - prog(t, tVanish, t1) * 60} r={70 + (i % 4) * 25 + prog(t, tVanish, t1) * 40} fill="#e6d2a4" opacity={0.55} />
          ))}
        </g>
      </Hud>
    </AbsoluteFill>
  );
};

/* ===================== ٣) من أسوار متفرقة إلى سور واحد: تشين شي هوانغ ===================== */
export const SceneUnify: React.FC<SceneProps> = ({t, f}) => {
  const t0 = S('s3_1') - 0.3;
  const t1 = S('s4_1');
  const tBuild = wordAt('s3_1', 'تبني');
  const tUnite = wordAt('s3_1', 'وحد');
  const tQin = wordAt('s3_1', 'تشين');
  const tYears = wordAt('s3_1', 'ألفي');
  const tJoin = wordAt('s3_1', 'بربطها');
  const L: CharLight = {dir: -1, key: '#ffcf80', shadow: '#3a2030', ambient: 0.12, rim: 0.8};
  const cam = hand(camAt(f, [
    {f: F(t0), z: -60, y: 60, rx: 0},
    {f: F(tJoin - 0.4), z: 120, y: 20},
    {f: F(t1), z: 220, y: -10},
  ]), t, 0.6, {at: tJoin + 0.45, amp: 14});
  const joinK = clamp(prog(t, tJoin - 0.1, tJoin + 0.9));
  const qinPath = line(QIN_WALL);
  const center = mp([113, 34]);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 30%, #6a4428 0%, #2a1a10 70%)'}}>
      <VStage cam={cam}>
        <VLayer d={400}>
          <VArt>
            {/* سطح الطاولة الخشبي */}
            <rect x={-900} y={-1400} width={2900} height={4800} fill="#5a3a22" />
            {Array.from({length: 30}, (_, i) => (
              <path key={i} d={`M -900 ${-1300 + i * 160} q 1400 ${30 * Math.sin(i)} 2900 0`} stroke="#3e2614" strokeWidth={6} fill="none" opacity={0.5} />
            ))}
          </VArt>
        </VLayer>
        <VLayer d={200}>
          <VArt>
            <AsiaMap id="un-map">
              {/* إمبراطورية تشين بعد التوحيد */}
              <path d={line(QIN_EMPIRE) + 'Z'} fill="#c9302c" opacity={0.28 * prog(t, tUnite - 0.2, tUnite + 0.8)} stroke="#a82a26" strokeWidth={4} strokeDasharray="10 8" />
              {/* أسوار الممالك المتحاربة */}
              {STATE_WALLS.map((w, i) => {
                const k = prog(t, tBuild - 0.1 + i * 0.18, tBuild + 0.5 + i * 0.18);
                if (k <= 0) return null;
                const [lx, ly] = mp(w.pts[Math.floor(w.pts.length / 2)]);
                return (
                  <g key={w.name} opacity={1 - 0.5 * joinK}>
                    <path d={line(w.pts)} stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} />
                    <path d={line(w.pts)} stroke="#a0582e" strokeWidth={10} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} />
                    <g opacity={k * (1 - joinK)}>
                      <Txt x={lx} y={ly + (i === 4 ? 52 : -24)} size={30} fill="#3a2414" stroke="#f4e6c4" sw={6}>
                        {w.name}
                      </Txt>
                    </g>
                  </g>
                );
              })}
              {/* السور الموحّد يُرسم ذهبياً */}
              <path d={qinPath} stroke={INK} strokeWidth={20} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${joinK} 1`} />
              <path d={qinPath} stroke="#f2c23a" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${joinK} 1`} />
              <Txt x={mp([104, 45])[0]} y={mp([104, 45])[1]} size={44} fill="#5a3a20" stroke="#f4e6c4" sw={7} opacity={0.85}>
                السهوب
              </Txt>
              <Txt x={center[0]} y={center[1]} size={54} fill="#7a2a22" stroke="#f4e6c4" sw={8} opacity={prog(t, tUnite, tUnite + 0.6)}>
                الصين
              </Txt>
            </AsiaMap>
            {/* ختم الإمبراطور */}
            {t > tJoin + 0.35 && (
              <g transform={`translate(${MAP.x + MAP.w - 150} ${MAP.y + MAP_H - 120}) rotate(-8) scale(${1 + 1.2 * (1 - pop(t, tJoin + 0.35, 0.25))})`} opacity={Math.min(1, (t - tJoin - 0.35) * 6)}>
                <rect x={-90} y={-90} width={180} height={180} rx={18} fill="none" stroke="#c9302c" strokeWidth={12} />
                <rect x={-70} y={-70} width={140} height={140} rx={10} fill="#c9302c" opacity={0.85} />
                <Txt x={0} y={22} size={64} fill="#f4e6c4" stroke="none" sw={0}>
                  تشين
                </Txt>
              </g>
            )}
          </VArt>
        </VLayer>
        <VLayer d={30}>
          <VArt>
            {/* الإمبراطور يظهر بجانب الخريطة */}
            <g opacity={prog(t, tQin - 0.5, tQin)}>
              <Person {...look('qinShiHuang')} light={L} x={lerp(-120, 200, easeInOut(prog(t, tQin - 0.6, tQin + 0.2)))} y={1250} s={1.45} frame={f} view={22} expr={t > tJoin ? 'smug' : 'neutral'} pose={t > tJoin - 0.2 && t < tJoin + 1 ? 'point' : 'stand'} />
            </g>
            {/* ضوء شمعة */}
            <Halo id="un-cd" cx={980} cy={1180} r={420} color="#ffb860" opacity={0.55} core={0.2} />
          </VArt>
        </VLayer>
        <VLayer d={-200} blur={2}>
          <VArt>
            <Motes id="un-m" frame={f} n={34} x0={-100} x1={1200} y0={200} y1={1500} color="#ffd9a0" size={3.6} />
          </VArt>
        </VLayer>
      </VStage>
      <Grade g={{top: '#5a3a2a', bottom: '#120806', opacity: 0.4, light: '#ffb860', at: [88, 60], strength: 0.3}} />
      <Hud>
        <g opacity={fade(t, tBuild - 0.2, tBuild + 0.2, tQin - 0.4, tQin - 0.1)}>
          <Txt x={540} y={200} size={72} fill="#ffe6b0" sw={11}>
            ممالك متفرقة.. أسوار متفرقة
          </Txt>
        </g>
        {/* بطاقة اسم الإمبراطور */}
        <g transform={`translate(540 200) scale(${pop(t, tQin - 0.1)})`} opacity={1 - prog(t, tJoin - 0.3, tJoin)}>
          <rect x={-330} y={-70} width={660} height={130} rx={26} fill="#1f1b22" stroke="#d9a520" strokeWidth={6} />
          <Txt x={0} y={10} size={64} fill="#f2c23a" stroke="none" sw={0}>
            تشين شي هوانغ
          </Txt>
          <Txt x={0} y={52} size={32} fill="#e8dcc0" stroke="none" sw={0}>
            أول إمبراطور للصين الموحّدة
          </Txt>
        </g>
        <g opacity={fade(t, tYears - 0.1, tYears + 0.3, tJoin - 0.3, tJoin)} transform={`translate(540 380) scale(${pop(t, tYears - 0.1)})`}>
          <Txt x={0} y={0} size={64} fill="#fff" sw={10}>
            قبل أكثر من ألفي عام
          </Txt>
        </g>
        <g opacity={fade(t, tJoin + 0.2, tJoin + 0.6)} transform={`translate(540 210) scale(${pop(t, tJoin + 0.2)})`}>
          <Txt x={0} y={0} size={86} fill="#f2c23a" sw={12}>
            سورٌ واحد
          </Txt>
        </g>
      </Hud>
    </AbsoluteFill>
  );
};

/* ===================== ٤) أبراج الإشارة: النار ليلاً والدخان نهاراً ===================== */
const TOWERS: [number, number][] = [
  [300, 1560], [760, 1220], [360, 880], [790, 540], [380, 200], [770, -140], [420, -480],
];
const Flame: React.FC<{x: number; y: number; f: number; k: number; seed: number}> = ({x, y, f, k, seed}) => {
  if (k <= 0) return null;
  const fl = 1 + 0.18 * Math.sin(f * 0.9 + seed) + 0.1 * Math.sin(f * 1.7 + seed * 2);
  return (
    <g transform={`translate(${x} ${y}) scale(${k * 0.9} ${k * fl})`}>
      <Halo id={`fl-${seed}`} cx={0} cy={-40} r={190} color="#ff9a3a" opacity={0.75} core={0.18} />
      <path d="M -34 0 Q -44 -60 -8 -100 Q -14 -60 6 -70 Q 4 -110 30 -140 Q 26 -90 44 -60 Q 52 -20 34 0 Z" fill="#ff7a2a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M -18 0 Q -22 -40 0 -64 Q 6 -40 20 -40 Q 26 -14 16 0 Z" fill="#ffd25a" />
    </g>
  );
};
export const SceneBeacons: React.FC<SceneProps> = ({t, f}) => {
  const t0 = S('s4_1') - 0.3;
  const t1 = S('s5_1');
  const tFire = wordAt('s4_1', 'تشعل');
  const tSmoke = wordAt('s4_1', 'والدخان');
  const tKm = wordAt('s4_1', 'مئات');
  const tHours = wordAt('s4_1', 'ساعات');
  const day = clamp(prog(t, tSmoke - 0.2, tSmoke + 0.7));
  const ignite = (i: number) => tFire - 0.1 + i * 0.42;
  const climb = clamp(prog(t, tFire - 0.2, tFire + 2.7));
  const cam = hand(
    {...camAt(f, [{f: F(t0), z: 0}, {f: F(t1), z: 120}]), y: lerp(560, -620, easeInOut(climb)) + (t > tSmoke ? lerp(0, 260, easeInOut(prog(t, tSmoke, tKm))) : 0)},
    t,
    1,
  );
  const ridge = (x: number) => 0; // (الجدار يُرسم كأقسام مستقيمة بين الأبراج)
  void ridge;
  const sky = mixColor('#0c1430', '#7fb0dc', day);
  const sky2 = mixColor('#22305a', '#f0e2c0', day);
  return (
    <AbsoluteFill style={{background: `linear-gradient(${sky} 0%, ${sky2} 100%)`}}>
      <VStage cam={cam}>
        <VLayer d={2600}>
          <VArt y0={-2400} h={6000}>
            {Array.from({length: 120}, (_, i) => (
              <circle key={i} cx={-400 + random(`bs${i}`) * 1900} cy={-2000 + random(`bsy${i}`) * 3400} r={1.6 + random(`bsr${i}`) * 2.4} fill="#fff" opacity={(1 - day) * (0.5 + 0.5 * Math.sin(f * 0.08 + i))} />
            ))}
            <circle cx={820} cy={-900} r={70} fill="#f4f0d8" opacity={1 - day} />
            <Halo id="bc-moon" cx={820} cy={-900} r={260} color="#c8d8ff" opacity={0.5 * (1 - day)} core={0.2} />
          </VArt>
        </VLayer>
        <VLayer d={1200}>
          <VArt y0={-2400} h={6000}>
            {[0, 1, 2].map((k) => (
              <MountainBand key={k} fn={(x) => -900 + k * 900 - 260 * Math.abs(Math.sin(x / 260 + k)) + 2400} fill={mixColor(['#141a34', '#1a2240', '#222a48'][k], ['#9aacc0', '#8a9cb0', '#7a8ca0'][k], day)} />
            ))}
          </VArt>
        </VLayer>
        <VLayer d={200}>
          <VArt y0={-2400} h={6000}>
            {/* الجبل الذي يصعده السور */}
            <path d={`M -900 3200 L -900 1500 L 160 1700 L 640 1300 L 220 950 L 900 600 L 260 260 L 900 -100 L 320 -420 L 700 -800 L 1900 -800 L 1900 3200 Z`} fill={mixColor('#1c2238', '#6f8a6a', day)} />
            {/* أقسام السور بين الأبراج */}
            {TOWERS.slice(0, -1).map(([x, y], i) => {
              const [x2, y2] = TOWERS[i + 1];
              return (
                <g key={i}>
                  <path d={`M ${x} ${y - 40} L ${x2} ${y2 - 40} L ${x2} ${y2 + 10} L ${x} ${y + 10} Z`} fill={mixColor('#4a4650', '#b9a27e', day)} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
                  {Array.from({length: 8}, (_, k) => {
                    const u = (k + 0.5) / 8;
                    return <rect key={k} x={x + (x2 - x) * u - 9} y={y + (y2 - y) * u - 64} width={18} height={24} fill={mixColor('#4a4650', '#b9a27e', day)} stroke={INK} strokeWidth={3} />;
                  })}
                </g>
              );
            })}
            {TOWERS.map(([x, y], i) => {
              const k = clamp(prog(t, ignite(i), ignite(i) + 0.35));
              return (
                <g key={i}>
                  <Watchtower x={x} y={y + 20} s={0.95} stone={mixColor('#55505a', '#c2ab86', day)} dark={k > 0 && day < 0.5 ? '#ffb24a' : '#2a2022'} />
                  {/* نار ليلاً */}
                  <g opacity={1 - day}>
                    <Flame x={x} y={y - 160} f={f} k={k} seed={i} />
                    {k > 0 && <Embers id={`bc-e${i}`} x={x} y={y - 200} frame={f} n={14} spread={36} rise={220} color="#ffb34a" />}
                  </g>
                  {/* دخان نهاراً */}
                  {day > 0 && k > 0 && (
                    <g opacity={day}>
                      <Smoke id={`bc-s${i}`} x={x} y={y - 170} frame={f + i * 9} color="#5e5850" n={14} rise={760} size={62} drift={140} opacity={1} />
                    </g>
                  )}
                </g>
              );
            })}
            {/* جندي يشعل البرج الأول */}
            <Person {...extra('mingSoldier', 2)} x={TOWERS[0][0] + 110} y={TOWERS[0][1] + 20} s={0.8} frame={f} pose={t < ignite(0) + 0.6 ? 'point' : 'stand'} expr="shout" light={{dir: -1, key: '#ffb060', shadow: '#1a1430', ambient: 0.3 * (1 - day), rim: 0.9}} />
          </VArt>
        </VLayer>
        <VLayer d={-260} blur={3}>
          <VArt y0={-2400} h={6000}>
            <Motes id="bc-m" frame={f} n={40} x0={-100} x1={1200} y0={-1400} y1={2200} color={day > 0.5 ? '#ffffff' : '#ffb84a'} size={4} />
          </VArt>
        </VLayer>
      </VStage>
      <Grade g={day < 0.5 ? {top: '#2a3a80', bottom: '#05060f', opacity: 0.4, light: '#ff9a3a', at: [50, 40], strength: 0.28} : {top: '#cfe0f0', bottom: '#5a5a4a', opacity: 0.28, light: '#ffffff', at: [70, 10], strength: 0.2}} />
      <Hud>
        <g opacity={fade(t, tFire - 0.1, tFire + 0.3, tSmoke - 0.3, tSmoke)}>
          <Txt x={540} y={210} size={96} fill="#ffb84a" sw={13}>
            نارٌ ليلاً
          </Txt>
        </g>
        <g opacity={fade(t, tSmoke, tSmoke + 0.3, tKm - 0.2, tKm)}>
          <Txt x={540} y={210} size={96} fill="#ffffff" sw={13}>
            ودخانٌ نهاراً
          </Txt>
        </g>
        <g transform={`translate(540 220) scale(${pop(t, tKm - 0.1)})`}>
          <Txt x={0} y={0} size={78} fill="#fff" sw={11}>
            مئات الكيلومترات
          </Txt>
          <g transform={`scale(${pop(t, tHours - 0.1)})`}>
            <Txt x={0} y={110} size={96} fill="#ffd23a" sw={13}>
              في ساعات!
            </Txt>
          </g>
        </g>
      </Hud>
    </AbsoluteFill>
  );
};
