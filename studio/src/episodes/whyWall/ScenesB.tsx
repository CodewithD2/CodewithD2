import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {camAt} from '../../lib/stage';
import {GodRays, Halo, Motes, Smoke} from '../../lib/fx';
import {INK, clamp, easeInOut, lerp, prog} from '../../lib/util';
import {Person} from '../../characters/Person';
import type {CharLight} from '../../characters/light';
import {extra} from '../../cast';
import {FarBirds} from '../whyBirds/Bird';
import {Hud, VArt, VLayer, VStage} from '../../shorts/vstage';
import {Feathers, Grade, WindStreaks, hand} from '../../shorts/polish';
import {ChannelBadge, InfoCard, Txt, fade, pop} from '../../shorts/common';
import {FPS} from '../../shorts/track';
import {Camel, FortGate, MountainBand, WallRidge, Watchtower} from './assets';
import {S, TOTAL_S, wordAt} from './track';
import type {SceneProps} from './ScenesA';

const F = (s: number) => Math.round(s * FPS);

const Coin: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => (
  <g transform={`translate(${x} ${y}) scale(${Math.abs(Math.cos(t * 5)) * s + 0.05} ${s})`}>
    <circle r={30} fill="#f2c23a" stroke={INK} strokeWidth={5} />
    <rect x={-9} y={-9} width={18} height={18} fill="#c9952a" stroke={INK} strokeWidth={3} />
  </g>
);

/* ===================== ٥) بوابات طريق الحرير: القوافل والضرائب ===================== */
export const SceneSilk: React.FC<SceneProps> = ({t, f}) => {
  const t0 = S('s5_1') - 0.3;
  const t1 = S('s6_1');
  const tSilk = wordAt('s5_1', 'طريق');
  const tTax = wordAt('s5_1', 'الضرائب');
  const L: CharLight = {dir: 1, key: '#ffe2a8', shadow: '#6a3a3a', ambient: 0.1, rim: 0.7};
  const cam = hand(camAt(f, [{f: F(t0), z: 0, y: 60, x: -40}, {f: F(t1), z: 220, y: 20, x: 40}]), t, 1);
  const walk = prog(t, t0, t1 + 0.5);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#5f9bd0 0%, #a9cfe6 40%, #f6d79a 100%)'}}>
      <VStage cam={cam}>
        <VLayer d={2500}>
          <VArt>
            <Halo id="sk-sun" cx={260} cy={520} r={420} color="#fff2c0" opacity={0.95} core={0.28} />
            <circle cx={260} cy={520} r={84} fill="#fff6d6" />
            <GodRays id="sk-gr" cx={260} cy={520} frame={f} color="#fff0c0" opacity={0.2} />
          </VArt>
        </VLayer>
        <VLayer d={1500}>
          <VArt>
            <MountainBand fn={(x) => 1000 - 140 * Math.abs(Math.sin(x / 240)) - 40 * Math.sin(x / 70)} fill="#c8a978" snow="#ffffff" />
            <WallRidge id="sk-w" fn={(x) => 1000 - 140 * Math.abs(Math.sin(x / 240)) - 40 * Math.sin(x / 70)} x0={-800} x1={1900} h={14} step={10} outline={2} towersAt={[-100, 1250]} towerS={0.5} />
          </VArt>
        </VLayer>
        <VLayer d={700}>
          <VArt>
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M -900 ${1180 + i * 90} Q ${-200 + i * 300} ${1080 + i * 80} ${500 + i * 120} ${1170 + i * 80} T 2100 ${1160 + i * 90} V 3400 H -900 Z`} fill={['#eac088', '#e2b070', '#d9a462'][i]} />
            ))}
            <FortGate x={560} y={1220} s={0.92} />
          </VArt>
        </VLayer>
        <VLayer d={160}>
          <VArt>
            <rect x={-900} y={1300} width={3000} height={2000} fill="#d8a460" />
            <path d="M -900 1300 Q 540 1270 2100 1300" stroke="#b8844a" strokeWidth={10} fill="none" />
            {/* القافلة تتجه للبوابة */}
            {[0, 1, 2].map((i) => (
              <Camel key={i} x={lerp(-260, 640, walk) - i * 280} y={1380 + i * 6} s={0.72 - i * 0.04} frame={f} seed={i * 2} load={['#9a3a2e', '#2e5a9a', '#3a7a4a'][i]} />
            ))}
            <Person {...extra('steppeRider', 7)} hat="cap" light={L} x={lerp(-60, 840, walk)} y={1386} s={0.78} frame={f} motion="walk" travel={lerp(-60, 840, walk) * 1.2} />
            {/* موظف الجمارك والجندي */}
            <Person {...extra('mingSoldier', 3)} light={L} x={330} y={1360} s={0.82} frame={f} holdR="spear" pose="stand" />
            <Person {...extra('chineseFarmer', 5)} hat="none" hair="#1a1512" robe="#2a4a6a" trim="#c9a43a" light={L} x={930} y={1360} s={0.84} frame={f} flip holdR={t > tTax - 0.3 ? 'paper' : undefined} pose={t > tTax - 0.3 ? 'present' : 'stand'} expr={t > tTax ? 'smug' : 'neutral'} />
          </VArt>
        </VLayer>
        <VLayer d={-280} blur={3}>
          <VArt>
            <path d="M -900 2050 Q 300 1920 1900 2070 V 3200 H -900 Z" fill="#b98a4e" />
            <Motes id="sk-m" frame={f} n={30} x0={-100} x1={1200} y0={500} y1={1600} color="#fff0cc" size={3.6} />
          </VArt>
        </VLayer>
      </VStage>
      <Grade g={{top: '#7aaad8', bottom: '#b4703a', opacity: 0.28, light: '#fff0c0', at: [24, 27], strength: 0.3}} />
      <Hud>
        <WindStreaks t={t} n={12} seed="sk-ws" color="#f6deb0" opacity={0.3} speed={900} />
        <g transform={`translate(540 230) scale(${pop(t, tSilk - 0.15)})`} opacity={1 - prog(t, tTax - 0.4, tTax - 0.1)}>
          <rect x={-300} y={-80} width={600} height={120} rx={28} fill="#7a2a22" stroke="#d9a520" strokeWidth={6} />
          <Txt x={0} y={0} size={70} fill="#f2c23a" stroke="none" sw={0}>
            طريق الحرير
          </Txt>
        </g>
        <InfoCard x={540} y={240} k={pop(t, tTax - 0.1)} label="ضرائب" w={460} icon={<Coin x={0} y={0} s={1.2} t={t} />} />
        {t > tTax &&
          Array.from({length: 8}, (_, i) => {
            const k = prog(t, tTax + i * 0.07, tTax + 0.8 + i * 0.07);
            return <Coin key={i} x={930 + (i - 4) * 36 + Math.sin(i) * 20} y={1120 - k * (220 + (i % 3) * 60) + k * k * 160} s={0.7} t={t + i} />;
          })}
      </Hud>
    </AbsoluteFill>
  );
};

/* ===================== ٦) أسرة مينغ: طوب وحجر… وحساء الأرز اللزج! ===================== */
export const SceneMing: React.FC<SceneProps> = ({t, f}) => {
  const t0 = S('s6_1') - 0.3;
  const t1 = S('s7_1');
  const tMing = wordAt('s6_1', 'مينغ');
  const tBrick = wordAt('s6_1', 'بالطوب');
  const tStone = wordAt('s6_1', 'والحجر');
  const tMortar = wordAt('s6_1', 'وبملاط');
  const tRice = wordAt('s6_1', 'بحساء');
  const L: CharLight = {dir: -1, key: '#ffe0b0', shadow: '#4a2a3a', ambient: 0.08, rim: 0.7};
  const pour = clamp(prog(t, tRice - 0.1, tRice + 0.9));
  const cam = hand(camAt(f, [
    {f: F(t0), z: 0, y: 40, x: 0},
    {f: F(tMortar - 0.2), z: 80, y: 20, x: 0},
    {f: F(tRice + 0.4), z: 420, y: 260, x: 120},
    {f: F(t1), z: 470, y: 280, x: 130},
  ]), t, 0.8);
  const rows = Math.floor(clamp(prog(t, t0 + 0.3, tStone + 0.6)) * 9);
  const shocked = t > tRice + 0.2;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#8ab8de 0%, #d8e6ee 50%, #e9d4b0 100%)'}}>
      <VStage cam={cam}>
        <VLayer d={1600}>
          <VArt>
            <MountainBand fn={(x) => 880 - 140 * Math.abs(Math.sin(x / 200 + 1)) - 30 * Math.sin(x / 60)} fill="#9cb0b8" />
            <WallRidge id="mg-w" fn={(x) => 880 - 140 * Math.abs(Math.sin(x / 200 + 1)) - 30 * Math.sin(x / 60)} x0={-800} x1={1900} h={16} step={10} outline={2} towersAt={[60, 900]} towerS={0.5} />
          </VArt>
        </VLayer>
        <VLayer d={300}>
          <VArt>
            {/* السور تحت البناء: صفوف طوب تُرصّ */}
            <rect x={-900} y={1240} width={3000} height={2000} fill="#a88e68" />
            {Array.from({length: 9}, (_, r) =>
              r < rows ? (
                <g key={r}>
                  {Array.from({length: 14}, (_, c) => {
                    const x = -280 + c * 110 + (r % 2) * 55;
                    const y = 1220 - r * 56;
                    const stone = r < 3;
                    return <rect key={c} x={x} y={y - 50} width={stone ? 104 : 104} height={50} rx={stone ? 12 : 4} fill={stone ? ['#9a9488', '#8c8680', '#a49c90'][(r + c) % 3] : ['#8a6a5a', '#7a5a4c', '#96705e'][(r + c) % 3]} stroke={INK} strokeWidth={4} />;
                  })}
                </g>
              ) : null,
            )}
            {/* مدرج سقالة خشبية */}
            <path d="M 940 1240 L 940 620 M 1000 1240 L 1000 620 M 940 1000 L 1000 1000 M 940 800 L 1000 800" stroke="#6a4a2a" strokeWidth={16} strokeLinecap="round" />
          </VArt>
        </VLayer>
        <VLayer d={120}>
          <VArt>
            <Person {...extra('wallBuilder', 1)} light={L} x={190} y={1330} s={0.92} frame={f} pose={t < tRice ? 'pull' : 'armsUp'} expr={shocked ? 'shock' : 'strain'} jolt={Math.sin(prog(t, tRice + 0.2, tRice + 0.5) * Math.PI)} />
            <Person {...extra('wallBuilder', 4)} light={L} x={420} y={1340} s={0.9} frame={f} flip pose="carry" holdR="briefcase" expr={shocked ? 'shock' : 'neutral'} />
            {/* دلو الملاط */}
            <g transform="translate(700 1340)">
              <path d="M -90 -150 L 90 -150 L 70 0 L -70 0 Z" fill="#7a6a5a" stroke={INK} strokeWidth={6} />
              <ellipse cx={0} cy={-150} rx={90} ry={20} fill={pour > 0.3 ? '#e8e0cc' : '#bab0a0'} stroke={INK} strokeWidth={5} />
            </g>
            {/* قدر حساء الأرز يُصبّ */}
            <g opacity={prog(t, tMortar - 0.1, tMortar + 0.3)} transform={`translate(${lerp(980, 850, easeInOut(pour))} ${lerp(820, 1000, easeInOut(pour))}) rotate(${-pour * 70})`}>
              <path d="M -110 -60 Q -120 60 0 80 Q 120 60 110 -60 Z" fill="#c9502f" stroke={INK} strokeWidth={6} />
              <ellipse cx={0} cy={-60} rx={110} ry={26} fill="#f6f2e6" stroke={INK} strokeWidth={5} />
              {Array.from({length: 12}, (_, i) => (
                <ellipse key={i} cx={-80 + (i % 6) * 32} cy={-64 + Math.floor(i / 6) * 10} rx={7} ry={4} fill="#fff" stroke="#d8d0c0" strokeWidth={1.5} />
              ))}
              <path d="M -60 -10 Q 0 20 60 -10" stroke="#e8c45a" strokeWidth={6} fill="none" />
            </g>
            {/* خيط الأرز اللزج المتدلي */}
            {pour > 0.25 && (
              <path d={`M ${lerp(980, 850, pour) - 90} ${lerp(820, 1000, pour) - 20} Q ${760} ${1120} ${710} ${1200}`} stroke="#f4efe0" strokeWidth={20 + 6 * Math.sin(f * 0.4)} strokeLinecap="round" fill="none" opacity={0.95} />
            )}
            {pour > 0.2 && <Smoke id="mg-st" x={850} y={900} frame={f} color="#ffffff" n={8} rise={260} size={40} drift={40} opacity={0.4} />}
          </VArt>
        </VLayer>
        <VLayer d={-300} blur={4}>
          <VArt>
            <path d="M -200 1900 L -200 900 M -140 1900 L -140 940" stroke="#5a3a22" strokeWidth={34} strokeLinecap="round" />
            <path d="M -260 1100 L 40 1100" stroke="#5a3a22" strokeWidth={22} strokeLinecap="round" />
          </VArt>
        </VLayer>
        <VLayer d={-140} blur={1.2}>
          <VArt>
            <Motes id="mg-m" frame={f} n={36} x0={-100} x1={1200} y0={400} y1={1600} color="#f4e4c4" size={3.4} />
          </VArt>
        </VLayer>
      </VStage>
      <Grade g={{top: '#9ac4e8', bottom: '#8a5a3a', opacity: 0.26, light: '#fff4d8', at: [70, 20], strength: 0.25}} />
      <Hud>
        <g transform={`translate(540 220) scale(${pop(t, tMing - 0.15)})`} opacity={1 - prog(t, tMortar - 0.3, tMortar)}>
          <rect x={-310} y={-86} width={620} height={150} rx={28} fill="#a8322c" stroke="#f2c23a" strokeWidth={6} />
          <Txt x={0} y={0} size={70} fill="#f2c23a" stroke="none" sw={0}>
            أسرة مينغ
          </Txt>
          <Txt x={0} y={48} size={38} fill="#fff4dc" stroke="none" sw={0}>
            ١٣٦٨ – ١٦٤٤م
          </Txt>
        </g>
        <g opacity={fade(t, tBrick - 0.1, tBrick + 0.2, tMortar - 0.3, tMortar)}>
          <InfoCard x={350} y={430} k={pop(t, tBrick - 0.1)} label="طوب" w={300} icon={<rect x={-30} y={-18} width={60} height={36} rx={4} fill="#8a6a5a" stroke={INK} strokeWidth={4} />} />
          <InfoCard x={730} y={430} k={pop(t, tStone - 0.1)} label="حجر" w={300} icon={<path d="M -32 14 L -24 -18 L 8 -26 L 32 -6 L 22 22 Z" fill="#9a9488" stroke={INK} strokeWidth={4} />} />
        </g>
        <g transform={`translate(540 240) scale(${pop(t, tRice - 0.05, 0.4)})`}>
          <Txt x={0} y={0} size={90} fill="#fff" sw={13}>
            حساء الأرز!
          </Txt>
        </g>
        <g transform={`translate(330 760) scale(${pop(t, tRice + 0.3, 0.3)})`}>
          <Txt x={0} y={0} size={150} fill="#ff5a3a" sw={16}>
            !
          </Txt>
        </g>
      </Hud>
    </AbsoluteFill>
  );
};

/* ===================== ٧) الختام: درع إمبراطورية عبر ألفي عام ===================== */
export const SceneEnd: React.FC<SceneProps> = ({t, f}) => {
  const t0 = S('s7_1') - 0.3;
  const tOnly = wordAt('s7_1', 'مجرد');
  const tShield = wordAt('s7_1', 'درع');
  const tYears = wordAt('s7_1', 'ألفي');
  const L: CharLight = {dir: 1, key: '#ffc890', shadow: '#2a1030', ambient: 0.3, rim: 1};
  const cam = hand(camAt(f, [{f: F(t0), z: 0, y: 120}, {f: F(TOTAL_S), z: 300, y: -60}]), t, 0.8);
  const ridge = (x: number) => 1230 - 300 * Math.sin((x + 300) / 520);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#2a1d5a 0%, #a8407a 38%, #ff8a4a 68%, #ffcf7a 100%)'}}>
      <VStage cam={cam}>
        <VLayer d={2800}>
          <VArt>
            <Halo id="en-sun" cx={540} cy={960} r={620} color="#ffd9a0" opacity={0.95} core={0.25} />
            <circle cx={540} cy={960} r={180} fill="#fff0c4" />
            <GodRays id="en-gr" cx={540} cy={960} frame={f} color="#ffe2b0" opacity={0.3} />
          </VArt>
        </VLayer>
        <VLayer d={1600}>
          <VArt>
            <MountainBand fn={(x) => 1080 - 160 * Math.abs(Math.sin(x / 220 + 0.4))} fill="#8a3a6a" />
            <WallRidge id="en-w1" fn={(x) => 1080 - 160 * Math.abs(Math.sin(x / 220 + 0.4))} x0={-800} x1={1900} h={14} step={10} outline={2} stone="#6a2a52" top="#7a3a5e" towersAt={[-80, 640, 1300]} towerS={0.5} />
            <FarBirds frame={f} seed="en-b" color="#3a1a3a" pts={Array.from({length: 6}, (_, i) => ({x: 300 + i * 40 + lerp(0, 260, prog(t, t0, TOTAL_S)), y: 760 - (i % 3) * 18, s: 0.8}))} />
          </VArt>
        </VLayer>
        <VLayer d={300}>
          <VArt>
            <MountainBand fn={ridge} fill="#3a1638" />
            <WallRidge id="en-w2" fn={ridge} x0={-800} x1={1900} h={70} step={18} stone="#4a1e46" top="#5e2a54" towersAt={[-300, 900]} towerS={1} />
            <Watchtower x={330} y={ridge(330) - 10} s={1.25} stone="#4a1e46" dark="#ffb24a" />
            <Person {...extra('mingSoldier', 5)} light={L} x={330} y={ridge(330) - 228} s={0.85} frame={f} holdR="spear" pose="stand" view={28} />
          </VArt>
        </VLayer>
        <VLayer d={-240} blur={2}>
          <VArt>
            <Feathers t={t} n={5} seed="en-fe" color="#ffd8b0" s={1.1} />
            <Motes id="en-m" frame={f} n={40} x0={-100} x1={1200} y0={400} y1={1600} color="#ffe0b0" size={4} />
          </VArt>
        </VLayer>
      </VStage>
      <Grade g={{top: '#ff9a6a', bottom: '#20082e', opacity: 0.42, light: '#ffe0a0', at: [50, 50], strength: 0.35}} />
      <Hud>
        <g opacity={fade(t, tOnly - 0.2, tOnly + 0.2, tShield - 0.3, tShield)}>
          <Txt x={540} y={300} size={86} fill="#fff" sw={13}>
            ليس مجرد حجارة..
          </Txt>
        </g>
        <g transform={`translate(540 300) scale(${pop(t, tShield - 0.1, 0.45)})`}>
          <Txt x={0} y={0} size={130} fill="#ffe27a" sw={18}>
            درعُ إمبراطورية
          </Txt>
          <g transform={`scale(${pop(t, tYears - 0.1)})`}>
            <Txt x={0} y={120} size={80} fill="#fff" sw={12}>
              عبر ألفي عام
            </Txt>
          </g>
        </g>
        <ChannelBadge x={540} y={600} s={pop(t, tYears + 0.6, 0.4)} />
      </Hud>
    </AbsoluteFill>
  );
};
