import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {camAt} from '../../lib/stage';
import {GodRays, Halo, Motes} from '../../lib/fx';
import {INK, clamp, easeInOut, easeOutBack, lerp, prog} from '../../lib/util';
import {Person} from '../../characters/Person';
import type {CharLight} from '../../characters/light';
import {extra} from '../../cast';
import {Hud, VArt, VLayer, VStage} from '../../shorts/vstage';
import {FloorPlane, Stand, project, visible} from '../../shorts/space3d';
import {Grade, Petals, WindStreaks, hand} from '../../shorts/polish';
import {ChannelBadge, Txt, fade, pop} from '../../shorts/common';
import {FPS} from '../../shorts/track';
import {Camel, MountainBand, PagodaRoof} from '../whyWall/assets';
import {BigX, Crate, Rock, SilkMap, sm, CITIES} from './assets';
import {S, wordAt} from './track';

export type SceneProps = {t: number; f: number};
const F = (s: number) => Math.round(s * FPS);
const FLOOR = 1300;

/* ===================== ١) سجادة الحرير: تاجر يمشي بفخامة (مجسّم 3D) ===================== */
const CarpetWorld: React.FC<{t: number; f: number; frozen?: boolean}> = ({t, f}) => {
  const L: CharLight = {dir: 1, key: '#ffe0a0', shadow: '#5a2a40', ambient: 0.1, rim: 0.9};
  const tEnd = S('s1_2');
  const zW = lerp(-2600, 150, easeInOut(prog(t, 0, tEnd)));
  const cam = hand({x: 0, y: -40, z: lerp(0, 220, prog(t, 0, tEnd)), rx: 0, ry: Math.sin(t * 0.7) * 2, rz: 0, fov: 45}, t, 0.5);
  const sheen = (t * 260) % 700;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#f6b66a 0%, #ffd9a0 45%, #f4c48a 100%)'}}>
      {/* القصر في الخلف */}
      <VStage cam={{...cam, z: cam.z * 0.05}}>
        <VLayer d={3200}>
          <VArt>
            <Halo id="cp-sun" cx={540} cy={820} r={700} color="#fff2c4" opacity={0.95} core={0.25} />
            <GodRays id="cp-gr" cx={540} cy={820} frame={f} color="#fff0c0" opacity={0.28} />
            <rect x={-200} y={760} width={1480} height={700} fill="#c9502f" stroke={INK} strokeWidth={10} />
            {Array.from({length: 9}, (_, i) => (
              <rect key={i} x={-120 + i * 170} y={800} width={40} height={660} fill="#a8322c" stroke={INK} strokeWidth={6} />
            ))}
            <PagodaRoof x={540} y={770} w={1700} h={240} color="#2f5a4a" under="#e2b23a" />
            <rect x={340} y={420} width={400} height={180} fill="#c9502f" stroke={INK} strokeWidth={10} />
            <PagodaRoof x={540} y={430} w={760} h={180} color="#2f5a4a" under="#e2b23a" />
          </VArt>
        </VLayer>
      </VStage>
      {/* الأرضية الحجرية (مسرح منفصل — قاعدة التقاطع) */}
      <VStage cam={cam}>
        <FloorPlane floorY={FLOOR} x0={-1400} x1={2480} z0={1500} z1={-5000}>
          {(w, len) => (
            <g>
              <rect width={w} height={len} fill="#d8b888" />
              {Array.from({length: Math.ceil(len / 220)}, (_, r) => (
                <line key={r} x1={0} y1={r * 220} x2={w} y2={r * 220} stroke="#b8946a" strokeWidth={6} />
              ))}
              {Array.from({length: 18}, (_, c) => (
                <line key={c} x1={c * 220} y1={0} x2={c * 220} y2={len} stroke="#b8946a" strokeWidth={6} />
              ))}
            </g>
          )}
        </FloorPlane>
      </VStage>
      {/* سجادة الحرير الحمراء بلمعة تتحرك */}
      <VStage cam={cam}>
        <FloorPlane floorY={FLOOR - 1} x0={300} x1={780} z0={1500} z1={-5000}>
          {(w, len) => (
            <g>
              <defs>
                <linearGradient id="cp-sheen" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#fff" stopOpacity={0} />
                  <stop offset="50%" stopColor="#ffd6d6" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <rect width={w} height={len} fill="#c41f2c" />
              <rect x={0} y={0} width={34} height={len} fill="#e2b23a" />
              <rect x={w - 34} y={0} width={34} height={len} fill="#e2b23a" />
              {Array.from({length: Math.ceil(len / 700) + 1}, (_, i) => (
                <rect key={i} x={40} y={len - sheen - i * 700} width={w - 80} height={260} fill="url(#cp-sheen)" />
              ))}
              {Array.from({length: Math.ceil(len / 300)}, (_, i) => (
                <path key={'o' + i} d={`M ${w / 2 - 50} ${i * 300 + 150} Q ${w / 2} ${i * 300 + 90} ${w / 2 + 50} ${i * 300 + 150} Q ${w / 2} ${i * 300 + 210} ${w / 2 - 50} ${i * 300 + 150} Z`} fill="#e2b23a" opacity={0.5} />
              ))}
            </g>
          )}
        </FloorPlane>
      </VStage>
      {/* الحراس على الجانبين + التاجر */}
      <VStage cam={cam}>
        {[-1700, -900, -100, 700].map((z, i) =>
          [-1, 1].map((side) =>
            !visible(z, cam.z, 300) ? null : (
              <Stand key={`${z}${side}`} z={z} x0={side < 0 ? 60 : 790} x1={side < 0 ? 290 : 1020} y0={FLOOR - 520} y1={FLOOR}>
                <Person {...extra('mingSoldier', i * 2 + (side > 0 ? 1 : 0))} light={L} x={side < 0 ? 175 : 905} y={FLOOR - 2} s={1.1} frame={f} seed={i} flip={side > 0} view={25} holdR="spear" />
              </Stand>
            ),
          ),
        )}
        {visible(zW, cam.z, 200) && (
          <Stand z={zW} x0={340} x1={740} y0={FLOOR - 560} y1={FLOOR}>
            <Person {...extra('silkMerchant', 1)} light={L} x={540} y={FLOOR - 2} s={1.25} frame={f} view={0} motion="walk" travel={(zW + 2600) * 0.35} expr="smug" pose="stand" energy={0.5} />
          </Stand>
        )}
      </VStage>
      <VStage cam={{...cam, z: 0}}>
        <VLayer d={-150} blur={1.2}>
          <VArt>
            <Petals t={t} n={22} seed="cp-p" color="#ff9ab0" />
            <Motes id="cp-m" frame={f} n={40} x0={-100} x1={1200} y0={200} y1={1600} color="#fff2c0" size={4} />
          </VArt>
        </VLayer>
      </VStage>
    </AbsoluteFill>
  );
};

export const SceneCarpet: React.FC<SceneProps> = ({t, f}) => {
  const tQ = wordAt('s1_1', 'لماذا');
  const tCarpet = wordAt('s1_1', 'مفروشا');
  return (
    <AbsoluteFill>
      <CarpetWorld t={t} f={f} />
      <Grade g={{top: '#ffb86a', bottom: '#6a2a3a', opacity: 0.3, light: '#fff0c0', at: [50, 42], strength: 0.3}} />
      <Hud>
        <ChannelBadge x={540} y={150} s={0.9} opacity={fade(t, 0.2, 0.6, S('s1_2') - 0.5, S('s1_2') - 0.2)} />
        <g transform={`translate(540 320) scale(${pop(t, tQ - 0.05)})`} opacity={1 - prog(t, tCarpet - 0.4, tCarpet - 0.1)}>
          <Txt x={0} y={0} size={110} fill="#fff" sw={16}>
            لماذا سُمّي
          </Txt>
          <Txt x={0} y={140} size={124} fill="#ffd23a" sw={17}>
            طريق الحرير؟
          </Txt>
        </g>
        <g transform={`translate(540 320) scale(${pop(t, tCarpet - 0.1)})`}>
          <Txt x={0} y={0} size={86} fill="#fff" sw={13}>
            شارعٌ مفروشٌ
          </Txt>
          <Txt x={0} y={110} size={96} fill="#ff6a7a" sw={14}>
            بالحرير؟
          </Txt>
        </g>
      </Hud>
    </AbsoluteFill>
  );
};

/* ===================== ٢) «لا، إطلاقاً!» — تجميد + X عملاق + خدش أسطوانة ===================== */
export const SceneNo: React.FC<SceneProps> = ({t, f}) => {
  const t0 = S('s1_2');
  const freezeT = t0 - 0.05;
  const k = easeOutBack(clamp(prog(t, t0 + 0.05, t0 + 0.35)));
  const shake = t > t0 + 0.2 && t < t0 + 0.7 ? Math.sin(t * 70) * 16 * (1 - prog(t, t0 + 0.2, t0 + 0.7)) : 0;
  return (
    <AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
      <AbsoluteFill style={{filter: `grayscale(${clamp(prog(t, t0 - 0.05, t0 + 0.1))}) brightness(0.75)`}}>
        <CarpetWorld t={freezeT} f={F(freezeT)} />
      </AbsoluteFill>
      <Hud>
        <BigX x={540} y={760} k={k} r={360} />
        <g transform={`translate(540 300) scale(${pop(t, t0 + 0.1, 0.3)})`}>
          <Txt x={0} y={0} size={140} fill="#fff" sw={20}>
            لا، إطلاقاً!
          </Txt>
        </g>
      </Hud>
    </AbsoluteFill>
  );
};

/* ===================== ٣) شبكة طرق فوضوية بطول ٦٤٠٠ كم ===================== */
export const SceneNetwork: React.FC<SceneProps> = ({t, f}) => {
  const t0 = S('s2_1') - 0.3;
  const t1 = S('s3_1');
  const tMess = wordAt('s2_1', 'فوضوية');
  const tKm = wordAt('s2_1', 'ستة');
  const tChina = wordAt('s2_1', 'الصين');
  const tEurope = wordAt('s2_1', 'بأوروبا');
  const draw = clamp(prog(t, t0 + 0.3, tKm + 0.6));
  const china = sm(CITIES.changan);
  const venice = sm(CITIES.venice);
  const cam = hand(camAt(f, [
    {f: F(t0), z: 650, x: 300, y: -180},
    {f: F(tMess), z: 300, x: 120, y: -150},
    {f: F(tKm + 0.4), z: 200, x: 0, y: -150},
    {f: F(t1), z: 260, x: 0, y: -150},
  ]), t, 0.6);
  const km = Math.round(6400 * easeInOut(clamp(prog(t, tKm - 0.2, tKm + 1.2))) / 100) * 100;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #6a4428 0%, #24140a 75%)'}}>
      <VStage cam={cam}>
        <VLayer d={250}>
          <VArt>
            <rect x={-900} y={-1400} width={2900} height={4800} fill="#4a2e1a" />
            <SilkMap id="nw" draw={draw}>
              {/* شارات الصين وأوروبا */}
              <g transform={`translate(${china[0]} ${china[1] - 50}) scale(${pop(t, tChina - 0.1)})`}>
                <rect x={-80} y={-40} width={160} height={66} rx={14} fill="#a8322c" stroke={INK} strokeWidth={5} />
                <Txt x={0} y={8} size={40} fill="#fff" stroke="none" sw={0}>
                  الصين
                </Txt>
              </g>
              <g transform={`translate(${venice[0] + 30} ${venice[1] - 60}) scale(${pop(t, tEurope - 0.1)})`}>
                <rect x={-90} y={-40} width={180} height={66} rx={14} fill="#2f5a9a" stroke={INK} strokeWidth={5} />
                <Txt x={0} y={8} size={40} fill="#fff" stroke="none" sw={0}>
                  أوروبا
                </Txt>
              </g>
            </SilkMap>
          </VArt>
        </VLayer>
        <VLayer d={-150} blur={1.5}>
          <VArt>
            <Motes id="nw-m" frame={f} n={30} x0={-100} x1={1200} y0={200} y1={1500} color="#ffd9a0" size={3.5} />
          </VArt>
        </VLayer>
      </VStage>
      <Grade g={{top: '#6a4a2a', bottom: '#1a0e06', opacity: 0.35, light: '#ffcf80', at: [50, 35], strength: 0.3}} />
      <Hud>
        <g transform={`translate(540 230) scale(${pop(t, tMess - 0.1)})`} opacity={1 - prog(t, tKm - 0.3, tKm)}>
          <Txt x={0} y={0} size={100} fill="#ffd23a" sw={14}>
            شبكة فوضوية!
          </Txt>
        </g>
        <g opacity={fade(t, tKm - 0.2, tKm + 0.1)}>
          <rect x={240} y={150} width={600} height={130} rx={30} fill="#1a0e06" stroke="#ffd23a" strokeWidth={6} opacity={0.9} />
          <Txt x={540} y={240} size={90} fill="#ffd23a" sw={9}>
            {`${km.toLocaleString('ar-EG')} كم`}
          </Txt>
        </g>
        <g opacity={fade(t, tChina - 0.2, tChina + 0.3)}>
          <Txt x={540} y={1110} size={56} fill="#fff" sw={9}>
            من الصين إلى أوروبا
          </Txt>
        </g>
      </Hud>
    </AbsoluteFill>
  );
};

/* ===================== ٤) «أمازون العالم القديم»: جمل بطيء + صندوق + قاطع طريق ===================== */
export const SceneAmazon: React.FC<SceneProps> = ({t, f}) => {
  const t0 = S('s3_1') - 0.3;
  const t1 = S('s4_1');
  const tAmz = wordAt('s3_1', 'أمازون');
  const tYears = wordAt('s3_1', 'عامين');
  const tRob = wordAt('s3_1', 'يسرقك');
  const L: CharLight = {dir: 1, key: '#ffe2a8', shadow: '#6a3a3a', ambient: 0.1, rim: 0.8};
  const robbed = t > tRob;
  const camelX = lerp(80, 520, prog(t, t0, tRob));
  const jump = clamp(prog(t, tRob - 0.25, tRob + 0.2));
  const banditX = lerp(900, 700, easeInOut(jump));
  const banditY = 1340 - Math.sin(jump * Math.PI) * 160;
  const grab = clamp(prog(t, tRob + 0.15, tRob + 0.6));
  const cam = hand(camAt(f, [{f: F(t0), z: 0, y: 40}, {f: F(tRob - 0.2), z: 120, y: 30}, {f: F(t1), z: 260, x: 120, y: 60}]), t, 1, {at: tRob, amp: 16});
  const bar = clamp(prog(t, tAmz, t1)) * 0.07;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#5f9bd0 0%, #a9cfe6 40%, #f6d79a 100%)'}}>
      <VStage cam={cam}>
        <VLayer d={2400}>
          <VArt>
            <Halo id="az-sun" cx={820} cy={560} r={420} color="#fff2c0" opacity={0.95} core={0.28} />
            <circle cx={820} cy={560} r={86} fill="#fff6d6" />
          </VArt>
        </VLayer>
        <VLayer d={1200}>
          <VArt>
            <MountainBand fn={(x) => 1120 - 90 * Math.sin(x / 200) - 30 * Math.sin(x / 70)} fill="#e2b070" />
          </VArt>
        </VLayer>
        <VLayer d={500}>
          <VArt>
            {[0, 1].map((i) => (
              <path key={i} d={`M -900 ${1250 + i * 90} Q ${-100 + i * 300} ${1160 + i * 70} ${500 + i * 100} ${1240 + i * 80} T 2100 ${1230 + i * 90} V 3400 H -900 Z`} fill={['#eac088', '#e0ae6e'][i]} />
            ))}
          </VArt>
        </VLayer>
        <VLayer d={150}>
          <VArt>
            <rect x={-900} y={1380} width={3000} height={2000} fill="#d8a460" />
            <Rock x={960} y={1400} s={1.1} />
            <Camel x={camelX} y={1440} s={0.95} frame={f} walk={robbed ? 0 : 0.5} />
            {/* الصندوق فوق الجمل ثم في يد قاطع الطريق */}
            <Crate x={lerp(camelX + 10, banditX - 40, grab)} y={lerp(1180, banditY - 280, grab)} s={0.85} rot={grab * -15} />
            {t > tRob - 0.3 && <Person {...extra('bandit', 0)} light={L} x={banditX} y={banditY} s={1.05} frame={f} flip holdR="kilij" expr="angry" pose={grab > 0.5 ? 'armsUp' : 'point'} />}
          </VArt>
        </VLayer>
        <VLayer d={-260} blur={3}>
          <VArt>
            <path d="M -900 2000 Q 300 1880 1900 2020 V 3200 H -900 Z" fill="#b98a4e" />
          </VArt>
        </VLayer>
      </VStage>
      <Grade g={{top: '#7aaad8', bottom: '#b4703a', opacity: 0.26, light: '#fff0c0', at: [76, 29], strength: 0.28}} />
      <Hud>
        <WindStreaks t={t} n={10} seed="az-ws" color="#f6deb0" opacity={0.3} speed={800} />
        {/* بطاقة تتبع الطلب */}
        <g transform={`translate(540 270) scale(${pop(t, tAmz - 0.1)})`}>
          <rect x={-420} y={-130} width={840} height={260} rx={30} fill="#fff" stroke={INK} strokeWidth={7} />
          <Txt x={0} y={-60} size={56} fill={INK} stroke="none" sw={0}>
            أمازون العالم القديم
          </Txt>
          <Txt x={0} y={8} size={40} fill="#5a5a6a" stroke="none" sw={0}>
            {robbed ? 'حالة الطلب: سُرق!' : t > tYears ? 'موعد الوصول: بعد عامين' : 'الطلب: حرير — قيد التوصيل'}
          </Txt>
          <rect x={-360} y={50} width={720} height={36} rx={18} fill="#e6e6ea" stroke={INK} strokeWidth={4} />
          <rect x={360 - 720 * bar} y={50} width={720 * bar} height={36} rx={18} fill={robbed ? '#e0302a' : '#f2a03a'} />
        </g>
        {robbed && (
          <g transform={`translate(760 1020) rotate(-10) scale(${pop(t, tRob + 0.1)})`}>
            <Txt x={0} y={0} size={110} fill="#ff4a3a" sw={15}>
              سُرق!
            </Txt>
          </g>
        )}
      </Hud>
    </AbsoluteFill>
  );
};

/* ===================== ٥) سباق تتابع: الصندوق يُقذف من تاجر لآخر على طريق بعمق 3D ===================== */
const RUNNERS: {x: number; z: number; seed: number}[] = [
  {x: 700, z: -3400, seed: 1},
  {x: 380, z: -2400, seed: 2},
  {x: 720, z: -1400, seed: 3},
  {x: 360, z: -400, seed: 4},
  {x: 700, z: 500, seed: 5},
];
export const SceneRelay: React.FC<SceneProps> = ({t, f}) => {
  const t0 = S('s4_1') - 0.3;
  const t1 = S('s5_1');
  const tNo = wordAt('s4_1', 'ولم');
  const tPass = wordAt('s4_1', 'تنقلت');
  const tRelay = wordAt('s4_1', 'كسباق');
  const L: CharLight = {dir: 1, key: '#ffe2a8', shadow: '#5a3a4a', ambient: 0.1, rim: 0.8};
  const hops = RUNNERS.length - 1;
  const p = clamp(prog(t, tPass - 0.3, t1 - 0.2)) * hops;
  const hop = Math.min(hops - 1, Math.floor(p));
  const u = p - hop;
  const a = RUNNERS[hop];
  const b = RUNNERS[hop + 1];
  const camZ = lerp(0, 3000, easeInOut(clamp(prog(t, tPass - 0.3, t1))));
  const cam = hand({x: 0, y: -60, z: camZ, rx: 0, ry: Math.sin(t) * 2, rz: Math.sin(t * 0.8) * 1, fov: 45}, t, 0.6);
  const crW = {x: lerp(a.x, b.x, u), y: 1300 - 330 - Math.sin(u * Math.PI) * 200, z: lerp(a.z, b.z, u)};
  const cr = project(crW.x, crW.y, crW.z, cam);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#6fa6d8 0%, #c4dcea 45%, #f2d49a 100%)'}}>
      <VStage cam={{...cam, z: cam.z * 0.03}}>
        <VLayer d={2600}>
          <VArt>
            <Halo id="rl-sun" cx={540} cy={900} r={520} color="#fff2c0" opacity={0.9} core={0.25} />
            <MountainBand fn={(x) => 1040 - 140 * Math.abs(Math.sin(x / 230 + 0.4))} fill="#c8a978" />
          </VArt>
        </VLayer>
      </VStage>
      <VStage cam={cam}>
        <FloorPlane floorY={1300} x0={-2200} x1={3280} z0={1800} z1={-6000}>
          {(w, len) => <rect width={w} height={len} fill="#e2b678" />}
        </FloorPlane>
      </VStage>
      <VStage cam={cam}>
        <FloorPlane floorY={1299} x0={260} x1={820} z0={1800} z1={-6000}>
          {(w, len) => (
            <g>
              <rect width={w} height={len} fill="#c9925a" />
              {Array.from({length: Math.ceil(len / 400)}, (_, i) => (
                <rect key={i} x={w / 2 - 10} y={i * 400} width={20} height={180} fill="#e8c48a" />
              ))}
            </g>
          )}
        </FloorPlane>
      </VStage>
      <VStage cam={cam}>
        {RUNNERS.map((r, i) =>
          !visible(r.z, cam.z, 300) ? null : (
            <Stand key={i} z={r.z} x0={r.x - 170} x1={r.x + 170} y0={1300 - 560} y1={1300}>
              <Person {...extra('silkMerchant', r.seed)} light={L} x={r.x} y={1298} s={1.2} frame={f} seed={i} flip={r.x > 540} view={30} pose={i === hop + 1 && u > 0.6 ? 'armsUp' : i === hop && u < 0.3 ? 'point' : 'stand'} expr={i === hop + 1 ? 'shock' : 'happy'} motion="idle" energy={0.7} />
            </Stand>
          ),
        )}
      </VStage>
      <Grade g={{top: '#7aaad8', bottom: '#a0603a', opacity: 0.26, light: '#fff0c0', at: [50, 47], strength: 0.25}} />
      <Hud>
        <Crate x={cr.x} y={Math.max(260, cr.y)} s={Math.min(1.3, 0.9 * cr.k)} rot={u * 360} />
        <g opacity={fade(t, tNo - 0.1, tNo + 0.2, tPass - 0.3, tPass)} transform="translate(540 260)">
          <Txt x={0} y={0} size={72} fill="#fff" sw={11}>
            تاجر واحد؟
          </Txt>
          <g transform={`scale(${pop(t, tNo + 0.6)})`}>
            <Txt x={0} y={110} size={110} fill="#ff4a3a" sw={15}>
              لا!
            </Txt>
          </g>
        </g>
        <g transform={`translate(540 250) scale(${pop(t, tRelay - 0.1)})`}>
          <rect x={-330} y={-80} width={660} height={130} rx={30} fill="#2f5a9a" stroke={INK} strokeWidth={6} />
          <Txt x={0} y={10} size={76} fill="#fff" stroke="none" sw={0}>
            سباق تتابع!
          </Txt>
        </g>
      </Hud>
    </AbsoluteFill>
  );
};
void random;
