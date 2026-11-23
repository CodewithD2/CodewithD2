import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {camAt} from '../../lib/stage';
import {Halo, GodRays} from '../../lib/fx';
import {INK, clamp, easeInOut, lerp, prog, ridgePath} from '../../lib/util';
import type {LonLat} from '../../world/maps/europeData';
import {Bird, FarBirds, vFormation} from './Bird';
import {Globe, GlobeProj, densify, geoLine, gproj} from './Globe';
import {Hud, VArt, VLayer, VStage} from './vstage';
import {ChannelBadge, Txt, fade, pop} from './common';
import {FPS, S, wordAt} from './track';
import type {SceneProps} from './ScenesA';

const F = (s: number) => Math.round(s * FPS);

const Stars: React.FC<{n: number; seed: string; f: number; y1?: number}> = ({n, seed, f, y1 = 1500}) => (
  <g fill="#fff">
    {Array.from({length: n}, (_, i) => (
      <circle key={i} cx={-300 + random(`${seed}${i}`) * 1700} cy={-400 + random(`${seed}y${i}`) * (y1 + 400)} r={1.5 + random(`${seed}r${i}`) * 2.5} opacity={0.5 + 0.5 * Math.sin(f * 0.08 + i)} />
    ))}
  </g>
);

/* ===================== ٥) كيف تعرف طريقها؟ الشمس والنجوم والمجال المغناطيسي ===================== */
// نجوم الدب الأكبر + النجم القطبي (ترتيب تقريبي للشكل)
const DIPPER: [number, number][] = [
  [180, 520], [270, 500], [350, 530], [420, 580], [520, 560], [560, 650], [450, 680],
];
const POLARIS: [number, number] = [700, 330];

export const SceneNav: React.FC<SceneProps> = ({t, f}) => {
  const t0 = S('s5_1') - 0.3;
  const t1 = S('s6_1');
  const tQ = wordAt('s5_1', 'كيف');
  const tSun = wordAt('s5_2', 'بالشمس');
  const tStars = wordAt('s5_2', 'والنجوم');
  const tMag = wordAt('s5_2', 'المجال');
  const tCompass = wordAt('s5_2', 'بوصلة');
  const globeK = prog(t, tMag - 0.2, tMag + 0.6);
  const cam = camAt(f, [
    {f: F(t0), z: 0, y: 0},
    {f: F(tMag - 0.2), z: 80, y: 0},
    {f: F(tCompass - 0.3), z: 80, y: 0},
    {f: F(tCompass + 0.5), z: 380, y: 200, x: 90},
  ]);
  const g: GlobeProj = {cx: 540, cy: 560, R: 300 * (0.6 + 0.4 * easeInOut(globeK)), lon0: 20 - t * 12, lat0: 15};
  const birdY = lerp(820, 1010, globeK);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#060b22 0%, #13214f 55%, #2b3f78 100%)'}}>
      <VStage cam={cam}>
        <VLayer d={2400}>
          <VArt>
            <Stars n={140} seed="nv" f={f} />
            {/* الدب الأكبر والنجم القطبي */}
            <g opacity={prog(t, tStars - 0.2, tStars + 0.4)}>
              <path d={'M ' + DIPPER.map((p) => p.join(' ')).join(' L ') + ' L 420 580'} stroke="#9fd0ff" strokeWidth={3} fill="none" strokeDasharray="8 8" />
              <path d={`M ${DIPPER[0].join(' ')} L ${POLARIS.join(' ')}`} stroke="#ffe680" strokeWidth={3} fill="none" strokeDasharray="6 10" opacity={prog(t, tStars + 0.3, tStars + 0.8)} />
              {DIPPER.map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r={7} fill="#fff" />
              ))}
              <Halo id="nv-pol" cx={POLARIS[0]} cy={POLARIS[1]} r={70} color="#fff3a0" opacity={0.9} core={0.25} />
              <circle cx={POLARIS[0]} cy={POLARIS[1]} r={11} fill="#fff8c0" />
            </g>
          </VArt>
        </VLayer>
        <VLayer d={1400}>
          <VArt>
            <path d={ridgePath((x) => 1500 - 90 * Math.sin(x / 190) - 40 * Math.sin(x / 61), -900, 2000, 3400)} fill="#0f1838" />
            {Array.from({length: 30}, (_, i) => (
              <circle key={i} cx={-300 + random(`lt${i}`) * 1700} cy={1520 + random(`lt2${i}`) * 200} r={4} fill="#ffd27a" opacity={0.8} />
            ))}
          </VArt>
        </VLayer>
        <VLayer d={700}>
          <VArt>
            {globeK > 0 && (
              <g opacity={globeK}>
                {/* خطوط المجال المغناطيسي: من القطب للقطب */}
                {[1.25, 1.55, 1.9, 2.3].map((k, i) =>
                  [-1, 1].map((side) => (
                    <ellipse
                      key={`${i}${side}`}
                      cx={g.cx + side * g.R * (k - 1) * 0.95}
                      cy={g.cy}
                      rx={g.R * (k - 1) * 0.95 + 4}
                      ry={g.R * (0.98 + (k - 1) * 0.55)}
                      fill="none"
                      stroke="#7ff0ff"
                      strokeWidth={4}
                      strokeDasharray="18 16"
                      strokeDashoffset={-f * 3 * side}
                      opacity={0.75 - i * 0.12}
                    />
                  )),
                )}
                <Globe id="nv-g" g={g} ocean="#2a6fb2" land="#5fae55" />
                <Txt x={g.cx} y={g.cy - g.R - 30} size={46} fill="#7ff0ff" sw={7}>
                  ش
                </Txt>
                <Txt x={g.cx} y={g.cy + g.R + 64} size={46} fill="#7ff0ff" sw={7}>
                  ج
                </Txt>
              </g>
            )}
          </VArt>
        </VLayer>
        <VLayer d={0}>
          <VArt>
            <Bird kind="swallow" mode="glide" x={540} y={birdY} s={1.45} frame={f} expr={t < tSun ? 'think' : 'happy'} />
          </VArt>
        </VLayer>
      </VStage>
      <Hud>
        {/* السؤال */}
        <g transform={`translate(700 640) scale(${pop(t, tQ - 0.1)})`} opacity={1 - prog(t, tSun - 0.3, tSun)}>
          <Txt x={0} y={0} size={220} fill="#ffd23a" sw={22}>
            ؟
          </Txt>
        </g>
        {/* الشمس */}
        <g transform={`translate(170 230) scale(${pop(t, tSun - 0.1)})`} opacity={1 - prog(t, tMag - 0.3, tMag)}>
          <circle r={62} fill="#ffd84a" stroke={INK} strokeWidth={6} />
          {Array.from({length: 10}, (_, i) => (
            <path key={i} d="M 0 -78 L 0 -100" stroke="#ffd84a" strokeWidth={10} strokeLinecap="round" transform={`rotate(${i * 36 + t * 30})`} />
          ))}
          <Txt x={0} y={170} size={54} fill="#fff" sw={8}>
            الشمس
          </Txt>
        </g>
        <g opacity={fade(t, tStars, tStars + 0.4, tMag - 0.3, tMag)}>
          <Txt x={810} y={260} size={54} fill="#fff6c0" sw={8}>
            النجوم
          </Txt>
        </g>
        <g opacity={fade(t, tMag + 0.2, tMag + 0.6, tCompass - 0.3, tCompass)}>
          <Txt x={540} y={170} size={66} fill="#7ff0ff" sw={10}>
            المجال المغناطيسي
          </Txt>
        </g>
        {/* بوصلة داخل الرأس: عدسة مكبّرة */}
        {(() => {
          const k = pop(t, tCompass - 0.1, 0.45);
          if (k <= 0) return null;
          const ang = -25 + Math.sin(t * 6) * 10 * (1 - prog(t, tCompass, tCompass + 1.2));
          return (
            <g transform={`translate(780 620) scale(${k})`}>
              <path d="M -150 230 L -60 110" stroke="#fff" strokeWidth={10} strokeDasharray="14 10" />
              <Halo id="nv-cp" cx={0} cy={0} r={240} color="#7ff0ff" opacity={0.55} core={0.2} />
              <circle r={150} fill="#fdf6e0" stroke={INK} strokeWidth={8} />
              <circle r={124} fill="none" stroke="#c9b48a" strokeWidth={4} />
              {['ش', 'ق', 'ج', 'غ'].map((l, i) => (
                <Txt key={l} x={Math.sin((i * Math.PI) / 2) * 100} y={-Math.cos((i * Math.PI) / 2) * 100 + 16} size={40} fill={INK} stroke="none" sw={0}>
                  {l}
                </Txt>
              ))}
              <g transform={`rotate(${ang})`}>
                <path d="M 0 -92 L 18 0 L -18 0 Z" fill="#d8322e" stroke={INK} strokeWidth={4} />
                <path d="M 0 92 L 18 0 L -18 0 Z" fill="#f4f4f4" stroke={INK} strokeWidth={4} />
              </g>
              <circle r={12} fill={INK} />
            </g>
          );
        })()}
      </Hud>
    </AbsoluteFill>
  );
};

/* ===================== ٦) الخرشنة القطبية: من القطب إلى القطب ===================== */
// مسار تقريبي مستوحى من دراسة التتبّع (Egevang وآخرون ٢٠١٠): نزول بمحاذاة شرق الأطلسي وعودة بمسار S في وسطه
const ROUTE: LonLat[] = densify([
  [-22, 71], [-28, 58], [-24, 45], [-20, 30], [-19, 15], [-14, 0], [-8, -15], [-2, -32], [4, -48], [0, -62], [-20, -68], [-42, -62],
  [-48, -45], [-36, -28], [-28, -10], [-36, 8], [-44, 26], [-42, 44], [-30, 60], [-22, 71],
], 1.2);
const AR_DIG = (n: number) => n.toLocaleString('ar-EG');

export const SceneTern: React.FC<SceneProps> = ({t, f}) => {
  const t0 = S('s6_1') - 0.3;
  const t1 = S('s7_1');
  const tName = wordAt('s6_1', 'الخرشنة');
  const tGo = wordAt('s6_1', 'فتقطع');
  const tNum = wordAt('s6_1', 'سبعين');
  const tKm = wordAt('s6_1', 'كيلومتر');
  const tTwice = S('s6_2');
  const tX2 = wordAt('s6_2', 'مرتين');
  const p = clamp(prog(t, tGo - 0.2, tKm + 0.5));
  const n = Math.max(2, Math.round(ROUTE.length * easeInOut(p)));
  const shrink = easeInOut(prog(t, tTwice - 0.1, tTwice + 0.9));
  const g: GlobeProj = {cx: 540, cy: lerp(660, 700, shrink), R: lerp(430, 300, shrink), lon0: -25 + shrink * (t - tTwice) * 25, lat0: 4};
  const head = ROUTE[Math.min(ROUTE.length - 1, n - 1)];
  const [hx, hy] = gproj(g, head);
  const prev = ROUTE[Math.max(0, n - 4)];
  const [px, py] = gproj(g, prev);
  const ang = (Math.atan2(hy - py, hx - px) * 180) / Math.PI;
  const km = Math.round(70000 * easeInOut(clamp(prog(t, tGo, tKm + 0.3))) / 100) * 100;
  const cam = camAt(f, [
    {f: F(t0), z: 0},
    {f: F(t1), z: 120},
  ]);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 38%, #1f3f7a 0%, #0b1533 70%)'}}>
      <VStage cam={cam}>
        <VLayer d={1600}>
          <VArt>
            <Stars n={110} seed="tn" f={f} />
          </VArt>
        </VLayer>
        <VLayer d={300}>
          <VArt>
            {/* حلقتان حول الأرض = مرتين */}
            {shrink > 0 &&
              [0, 1].map((i) => {
                const k = clamp(prog(t, tTwice + 0.3 + i * 0.7, tTwice + 1.0 + i * 0.7));
                const rx = g.R * (1.28 + i * 0.22);
                const ry = g.R * (0.42 + i * 0.1);
                const len = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2);
                return (
                  <ellipse key={i} cx={g.cx} cy={g.cy} rx={rx} ry={ry} fill="none" stroke="#ffd23a" strokeWidth={9} strokeDasharray={`${len * k} ${len}`} transform={`rotate(${-12 + i * 20} ${g.cx} ${g.cy})`} opacity={0.95} />
                );
              })}
            <Globe id="tn-g" g={g}>
              <path d={geoLine(g, ROUTE.slice(0, n))} stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.35} />
              <path d={geoLine(g, ROUTE.slice(0, n))} stroke="#ff4f3a" strokeWidth={7} fill="none" strokeLinecap="round" strokeDasharray="16 10" />
            </Globe>
            {p > 0 && shrink < 0.5 && <Bird kind="tern" mode="fly" x={hx} y={hy} s={0.62} frame={f} rot={ang} flapRate={1.4} />}
            {/* القطبان */}
            <g opacity={1 - shrink}>
              <Txt x={540} y={gproj(g, [0, 90])[1] - 40} size={44} fill="#e9f6ff" sw={7}>
                القطب الشمالي
              </Txt>
              <Txt x={540} y={gproj(g, [0, -90])[1] + 74} size={44} fill="#e9f6ff" sw={7}>
                القطب الجنوبي
              </Txt>
            </g>
          </VArt>
        </VLayer>
      </VStage>
      <Hud>
        {/* بطاقة الطائر */}
        <g transform={`translate(540 120) scale(${pop(t, tName - 0.15)})`} opacity={1 - prog(t, tGo + 0.2, tGo + 0.6)}>
          <rect x={-330} y={-70} width={660} height={140} rx={34} fill="#fff" stroke={INK} strokeWidth={6} />
          <g transform="translate(220 10) scale(0.62)">
            <Bird kind="tern" mode="perch" x={0} y={-20} frame={f} expr="happy" />
          </g>
          <Txt x={-60} y={22} size={64} fill={INK} stroke="none" sw={0}>
            الخرشنة القطبية
          </Txt>
        </g>
        {/* العداد */}
        <g opacity={fade(t, tGo + 0.4, tGo + 0.7, tTwice - 0.2, tTwice + 0.1)} transform={`translate(540 150)`}>
          <rect x={-330} y={-78} width={660} height={120} rx={28} fill="#0d1a3a" stroke="#ffd23a" strokeWidth={6} opacity={0.92} />
          <Txt x={0} y={14} size={78} fill="#ffd23a" sw={8}>
            {`${AR_DIG(km)} كم`}
          </Txt>
        </g>
        {/* × ٢ */}
        <g transform={`translate(540 ${300}) scale(${pop(t, tX2 - 0.1, 0.4)})`}>
          <Txt x={0} y={0} size={190} fill="#ffd23a" sw={22}>
            ×٢
          </Txt>
          <Txt x={0} y={90} size={56} fill="#fff" sw={8}>
            حول الأرض
          </Txt>
        </g>
      </Hud>
    </AbsoluteFill>
  );
};

/* ===================== ٧) الختام: رحلة بقاء ===================== */
export const SceneEnd: React.FC<SceneProps> = ({t, f}) => {
  const t0 = S('s7_1') - 0.3;
  const tTrip = wordAt('s7_1', 'رحلة');
  const tLife = wordAt('s7_1', 'بقاء');
  const u = prog(t, t0, t0 + 6);
  const cam = camAt(f, [
    {f: F(t0), z: 0, y: 60},
    {f: F(t0 + 6), z: 260, y: -40},
  ]);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#3a2a6e 0%, #c3507a 40%, #ff9b5a 70%, #ffd38a 100%)'}}>
      <VStage cam={cam}>
        <VLayer d={2600}>
          <VArt>
            <Halo id="en-sun" cx={540} cy={880} r={520} color="#ffd9a0" opacity={0.95} core={0.25} />
            <circle cx={540} cy={880} r={170} fill="#fff0c4" />
            <GodRays id="en-gr" cx={540} cy={880} frame={f} color="#ffe2b0" opacity={0.28} />
          </VArt>
        </VLayer>
        <VLayer d={1200}>
          <VArt>
            <path d={ridgePath((x) => 1180 - 90 * Math.sin(x / 210 + 1), -900, 2000, 3400)} fill="#6b2d5a" />
            <path d={ridgePath((x) => 1320 - 60 * Math.sin(x / 140 + 3), -900, 2000, 3400)} fill="#4a1f45" />
          </VArt>
        </VLayer>
        <VLayer d={200}>
          <VArt>
            {/* السرب يبتعد نحو الشمس */}
            {vFormation(9, 130).map((p) => (
              <g key={p.i} opacity={1 - prog(u, 0.85, 1)}>
                <Bird kind="goose" x={540 + p.dy * lerp(1.3, 0.35, u) + 0} y={lerp(1150, 820, u) - p.dx * lerp(0.5, 0.15, u)} s={lerp(1.0, 0.28, u) * (1 - p.i * 0.02)} frame={f} seed={p.i} rot={-90} />
              </g>
            ))}
          </VArt>
        </VLayer>
      </VStage>
      <Hud>
        <g opacity={fade(t, t0 + 0.2, t0 + 0.6, tTrip - 0.3, tTrip)}>
          <Txt x={540} y={300} size={90} fill="#fff" sw={13}>
            ليست نزهة..
          </Txt>
        </g>
        <g transform={`translate(540 330) scale(${pop(t, tTrip - 0.1, 0.45)})`}>
          <Txt x={0} y={0} size={150} fill="#ffe27a" sw={20}>
            رحلةُ بقاء
          </Txt>
        </g>
        <ChannelBadge x={540} y={520} s={pop(t, tLife + 0.5, 0.4)} />
        <FarBirds frame={f} seed="en" color="#3a1f40" pts={[{x: 220, y: 640, s: 1.2}, {x: 270, y: 610, s: 1}, {x: 320, y: 640, s: 0.9}]} />
      </Hud>
    </AbsoluteFill>
  );
};
