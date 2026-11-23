import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {extra, look} from '../../cast';
import {Person} from '../../characters/Person';
import {CalloutTag, DizzyBirds, TitleBanner} from '../../lib/comicFx';
import {SpeechBubble} from '../../lib/dialogue';
import {Cypress, TorchFX} from '../../lib/epic';
import {Bloom, Cloud, ColorGrade, Embers, Halo, MistBand, Motes} from '../../lib/fx';
import {Ship, Stars, Water} from '../../lib/props';
import {Art, Layer, Sky, camAt} from '../../lib/stage';
import {INK, clamp, easeOut, easeOutBack, lerp, prog, scatter} from '../../lib/util';
import {RoundTree} from '../../world/buildings';
import type {LonLat} from '../../world/maps/europeData';
import {CITIES_1429} from '../../world/maps/france1429';
import {GamePiece} from './MapPieces';
import {CityStandee, MapTable, Standee} from './MapTable';
import {CLEAR_DAY, FarArmy, Floor3D, FloorTiles, GOLDEN, Hud, LIGHTS, LitStage, Rays, SEA_NIGHT, STORM, SoftFilm, WAR_TABLE, gy, mix, mixLight, mixPalette, toScreen} from './stage3d';
import {FPS, SceneTrackAudio, SceneTrackSubtitles, bubbleOf, buildTrack, talkOf} from './audioHelper';

/* =====================================================================
 * المشهد ٣ — الفصل الأول: حرب المائة عام (١١٦ عاماً!) والقناة الإنجليزية
 * ===================================================================== */

export const SCENE03_TRACK = buildTrack(
  [
    {kind: 'pause', sec: 0.35},
    {kind: 'clip', id: 's03_nar_1', padAfter: 0.2},
    {kind: 'clip', id: 's03_nar_2', padAfter: 0.25},
    {kind: 'clip', id: 's03_nar_3', padAfter: 0.08},
    {kind: 'clip', id: 's03_soldier_1', padAfter: 0.22},
    {kind: 'clip', id: 's03_nar_4', padAfter: 0.2},
  ],
  0.55,
);

const MAP_CENTER: LonLat = [1.4, 48.9];
const MAP_ZOOM = 0.9;
const MAP_COLORS = {FRA: '#2b5eb8', GBR: '#c8242e'};

/** سيف أو قبعة طائرة في مسار مقوّس عبر القناة (مع أثر حركة) */
const FlyingProp: React.FC<{phase: number; dir: 1 | -1; kind: 'sword' | 'hat'; arcH?: number}> = ({phase, dir, kind, arcH = 260}) => {
  const at = (ph: number) => {
    const u = ((ph % 1) + 1) % 1;
    return {u, x: dir === 1 ? lerp(470, 1450, u) : lerp(1450, 470, u), y: 590 - Math.sin(u * Math.PI) * arcH};
  };
  const {u, x, y} = at(phase);
  const rot = u * 720 * dir;
  const trail = [0.02, 0.045, 0.075, 0.11].map((k) => at(phase - k)).filter((q) => q.u < u);
  return (
    <g>
      {trail.map((q, i) => (
        <circle key={i} cx={q.x} cy={q.y} r={14 - i * 3} fill="#ffffff" opacity={0.34 - i * 0.07} />
      ))}
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1.35)`}>
        {kind === 'sword' ? (
          <g stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
            <path d="M -5 -48 L 0 -64 L 5 -48 L 5 18 L -5 18 Z" fill="#dce4f0" />
            <line x1={0} x2={0} y1={-52} y2={14} stroke="#8f9aa8" strokeWidth={2} />
            <rect x={-18} y={14} width={36} height={7} rx={2} fill="#e8b830" />
            <rect x={-4} y={21} width={8} height={20} rx={3} fill="#5a3418" />
          </g>
        ) : (
          <g stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
            <path d="M -30 4 Q -36 -28 0 -30 Q 36 -28 30 4 Z" fill={dir === 1 ? '#c8242e' : '#2452a4'} />
            <path d="M 8 -29 Q 36 -28 30 4 L 16 2 Q 20 -20 8 -29 Z" fill="#000" opacity={0.25} stroke="none" />
            <path d="M -32 4 Q 0 -4 32 4" fill="none" stroke="#f2c43a" strokeWidth={4} />
          </g>
        )}
      </g>
    </g>
  );
};

/** شريط بحر بعمق معيّن: قمة موج متحركة + تدرج + زبد */
const SEA_G = 470;
const SeaBand: React.FC<{id: string; d: number; f: number; c1: string; c2: string; foam: string; amp?: number; phase?: number}> = ({id, d, f, c1, c2, foam, amp = 10, phase = 0}) => {
  const y = gy(d, SEA_G);
  const pts: string[] = [];
  for (let x = -1400; x <= 3300; x += 40) pts.push(`${x} ${(y + Math.sin(x / 120 + f * 0.09 + phase) * amp + Math.sin(x / 53 - f * 0.05 + phase) * amp * 0.4).toFixed(1)}`);
  return (
    <g>
      <defs>
        <linearGradient id={`sb-${id}`} gradientUnits="userSpaceOnUse" x1={0} x2={0} y1={y - amp} y2={y + 300}>
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <path d={`M ${pts.join(' L ')} L 3300 1900 L -1400 1900 Z`} fill={`url(#sb-${id})`} />
      <path d={`M ${pts.join(' L ')}`} fill="none" stroke={foam} strokeWidth={amp * 0.5 + 2} opacity={0.75} strokeLinecap="round" />
      {scatter(`sbf-${id}`, 26, -1300, 3200, y + 14, y + 150).map((p, i) => (
        <path
          key={i}
          d={`M ${p.x + Math.sin(f * 0.05 + p.p) * 22} ${p.y} q 26 ${-7 - amp * 0.3} ${52 + p.r * 40} 0`}
          fill="none"
          stroke={foam}
          strokeWidth={3 + amp * 0.12}
          strokeLinecap="round"
          opacity={0.18 + 0.3 * Math.sin(f / 14 + p.p) ** 2}
        />
      ))}
    </g>
  );
};

/** جرف ساحلي بعشب وطبقات صخر وظل (side: −1 إنجلترا يساراً، 1 فرنسا يميناً) */
const Cliff: React.FC<{side: 1 | -1; rock: string; rockDark: string; grass: string; f: number; label: string; labelC: string}> = React.memo(({side, rock, rockDark, grass, f, label, labelC}) => {
  const layers = scatter(`cl${side}`, 22, 0, 520, 800, 1150);
  return (
    <g transform={side === 1 ? 'translate(1920 0) scale(-1 1)' : undefined}>
      <path d="M -900 735 L 545 735 Q 600 760 588 830 Q 640 880 618 960 Q 668 1040 640 1400 L -900 1400 Z" fill={rock} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 545 735 Q 600 760 588 830 Q 640 880 618 960 Q 668 1040 640 1400 L 500 1400 Q 540 1040 500 950 Q 520 850 480 760 Z" fill={rockDark} opacity={0.65} />
      {layers.map((p, i) => (
        <path key={i} d={`M ${p.x - 420} ${p.y} q 60 ${8 - p.r * 18} ${120 + p.r * 160} 4`} fill="none" stroke={rockDark} strokeWidth={4} strokeLinecap="round" opacity={0.55} />
      ))}
      <path d="M -900 722 Q 200 700 520 722 Q 566 728 574 760 Q 540 786 506 768 Q 470 800 430 770 Q 380 796 330 772 Q 250 802 190 774 Q 100 800 20 772 L -900 780 Z" fill={grass} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -900 726 Q 200 704 520 726" fill="none" stroke="#fff6cc" strokeWidth={6} opacity={0.4} />
      {scatter(`cg${side}`, 44, -300, 540, 722, 742).map((p, i) => (
        <path key={i} d={`M ${p.x} ${p.y} q ${Math.sin(f / 9 + p.p) * 4} -12 ${Math.sin(f / 9 + p.p) * 7} ${-20 - p.r * 12}`} fill="none" stroke={mix(grass, '#ffffff', 0.2 + p.r * 0.2)} strokeWidth={4} strokeLinecap="round" />
      ))}
      {/* لوح خشبي باسم المملكة */}
      <g transform={`translate(225 832) scale(${side === 1 ? -1 : 1} 1) rotate(-2)`}>
        <rect x={-128} y={-40} width={262} height={84} rx={12} fill="#000" opacity={0.3} />
        <rect x={-131} y={-46} width={262} height={84} rx={12} fill="#7a4e2a" stroke={INK} strokeWidth={5} />
        <rect x={-118} y={-34} width={236} height={60} rx={8} fill={labelC} stroke={INK} strokeWidth={4} />
        <text x={0} y={10} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={44} fill="#fff" direction="rtl">
          {label}
        </text>
      </g>
    </g>
  );
});

/** قلعة ساحلية خلف الملك */
const KeepTower: React.FC<{x: number; y: number; s: number; stone: string; dark: string; roof: string; flag: string; f: number; warm: string; lit: number}> = ({x, y, s, stone, dark, roof, flag, f, warm, lit}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={5} strokeLinejoin="round">
    <rect x={-170} y={-190} width={340} height={240} fill={stone} />
    <rect x={60} y={-190} width={110} height={240} fill={dark} opacity={0.5} stroke="none" />
    {Array.from({length: 7}, (_, i) => (
      <rect key={i} x={-170 + i * 50} y={-216} width={30} height={30} fill={stone} />
    ))}
    <rect x={-60} y={-380} width={120} height={430} fill={stone} />
    <rect x={14} y={-380} width={46} height={430} fill={dark} opacity={0.55} stroke="none" />
    <path d="M -82 -380 L 0 -500 L 82 -380 Z" fill={roof} />
    <path d="M 14 -380 L 0 -500 L 82 -380 Z" fill="#000" opacity={0.28} stroke="none" />
    <path d={`M 0 -500 L 0 -572 L ${70 + Math.sin(f / 6) * 7} -552 L 0 -530`} fill={flag} />
    {[
      [-12, -330],
      [-12, -220],
      [-130, -140],
      [106, -140],
    ].map(([wx, wy], i) => (
      <rect key={i} x={wx} y={wy} width={24} height={48} rx={12} fill={mix('#2a2838', warm, lit)} strokeWidth={4} />
    ))}
    <path d="M -34 50 L -34 -30 Q 0 -72 34 -30 L 34 50 Z" fill="#33241c" />
  </g>
);

/* ================= القناة الإنجليزية بعمق كامل (سماء ثابتة أو تعاقب سنوات) ================= */
const EnglishChannel: React.FC<{f: number; lf: number; dur: number; fastCycle: boolean; tossing: boolean; yearText?: string; showClaim?: number}> = ({f, lf, dur, fastCycle, tossing, yearText, showClaim = 0}) => {
  // دورة ليل/نهار سريعة عند مرور العقود
  const angle = fastCycle ? f * 0.16 : 0.75;
  const dayness = fastCycle ? 0.5 + 0.5 * Math.sin(angle) : 1; // 1 نهار، 0 ليل
  const P = mixPalette(SEA_NIGHT, CLEAR_DAY, dayness);
  const dusk = fastCycle ? Math.max(0, 1 - Math.abs(dayness - 0.5) * 3.2) : 0;

  const sunX = 960 - Math.cos(angle) * 820;
  const sunY = 720 - Math.sin(angle) * 560;
  const moonX = 960 + Math.cos(angle) * 820;
  const moonY = 720 + Math.sin(angle) * 560;
  const night = clamp(1 - dayness * 2);

  const cam = fastCycle
    ? camAt(lf, [
        {f: 0, x: -50, y: 20, z: 60, ry: -4, rx: 0, fov: 46},
        {f: dur * 0.5, x: 30, y: 0, z: 0, ry: 2},
        {f: dur, x: 60, y: -20, z: 110, ry: 5},
      ])
    : camAt(lf, [
        {f: 0, x: 0, y: -90, z: -120, ry: 0, rx: 2, fov: 50},
        {f: 45, x: -70, y: -10, z: 40, ry: -5, rx: 0, fov: 46},
        {f: dur * 0.68, x: -150, y: 0, z: 150, ry: -7},
        {f: dur * 0.8, x: 150, y: 0, z: 120, ry: 6},
        {f: dur, x: 170, y: -4, z: 170, ry: 7},
      ]);

  const light = mixLight({...LIGHTS.night, dir: -1}, {...LIGHTS.day, dir: 1}, dayness);
  const sea = (t: number) => mix(mix('#16264e', '#3f97d0', dayness), P.haze, t);
  const seaD = (t: number) => mix(mix('#0a1230', '#1d6299', dayness), P.haze, t);
  const foam = mix('#7f9ad8', '#ffffff', dayness);
  const tone = (c: string, k = 0) => mix(mix(c, P.haze, k), '#1a2448', night * 0.55);

  const yB = 735;
  const claimAt = toScreen(440, yB - 392, 180, cam);

  return (
    <>
      <Sky background={`linear-gradient(${P.skyTop} 0%, ${P.skyMid} 40%, ${mix(P.horizon, '#ff9a5a', dusk * 0.75)} 68%)`} />
      <LitStage cam={cam} light={light}>
        {/* ١: نجوم وشمس وقمر خلف كل شيء */}
        <Layer d={2900}>
          <Art>
            {night > 0.02 && (
              <g opacity={night}>
                <Stars frame={f} />
              </g>
            )}
            {sunY < 900 && (
              <g>
                <Halo id="s03sunH" cx={sunX} cy={sunY} r={560} color={mix('#ffe9a0', '#ff8a4a', dusk)} opacity={0.8} core={6} />
                <circle cx={sunX} cy={sunY} r={76} fill={mix('#fff2b8', '#ffb060', dusk)} />
              </g>
            )}
            {fastCycle && moonY < 900 && (
              <g>
                <Halo id="s03moonH" cx={moonX} cy={moonY} r={380} color="#c8d8ff" opacity={0.55} core={5} />
                <circle cx={moonX} cy={moonY} r={58} fill="#f4f0dc" />
                <circle cx={moonX + 20} cy={moonY - 10} r={48} fill={P.skyTop} opacity={0.9} />
              </g>
            )}
          </Art>
        </Layer>
        {/* ٢: سحب تجري */}
        <Layer d={2500}>
          <Art>
            {[0, 1, 2].map((i) => (
              <Cloud
                key={i}
                id={`s03c${i}`}
                x={-300 + i * 1050 + ((f * (fastCycle ? 7 : 0.5) * (1 + i * 0.2)) % 900)}
                y={250 + (i % 2) * 130}
                w={900 + i * 140}
                h={88}
                lit={mix(mix('#7a8cc8', '#ffffff', dayness), '#ffb890', dusk * 0.6)}
                shade={mix(mix('#222c56', '#c4d8ea', dayness), '#a86a80', dusk * 0.5)}
                opacity={0.85}
              />
            ))}
          </Art>
        </Layer>
        {/* ٣: أفق البحر وانعكاس الضوء */}
        <Layer d={2250}>
          <Art>
            <Water id="s03w" top={gy(2250, SEA_G) - 12} frame={f} c1={sea(0.38)} c2={sea(0.1)} shine={foam} reflectX={dayness > 0.5 ? sunX : moonX} reflectW={240} />
            <MistBand id="s03mist" frame={f} y={gy(2250, SEA_G)} color={P.haze} h={46} />
          </Art>
        </Layer>
        {/* ٤: سفن بعيدة وسواحل ممتدة */}
        <Layer d={1500}>
          <Art>
            <path d={`M -1400 ${gy(1500, SEA_G) + 60} L -1400 620 Q -300 640 250 672 Q 330 690 350 ${gy(1500, SEA_G) + 60} Z`} fill={tone('#dcd6c8', 0.4)} />
            <path d="M -1400 612 Q -300 630 262 668 L 240 690 Q -300 660 -1400 650 Z" fill={tone('#6e9c5a', 0.35)} />
            <path d={`M 3300 ${gy(1500, SEA_G) + 60} L 3300 640 Q 2200 640 1700 690 Q 1620 704 1600 ${gy(1500, SEA_G) + 60} Z`} fill={tone('#9a8c78', 0.4)} />
            <path d="M 3300 632 Q 2200 634 1690 686 L 1710 704 Q 2200 660 3300 664 Z" fill={tone('#5c8c4e', 0.35)} />
            <SeaBand id="s03b1" d={1500} f={f} c1={sea(0.22)} c2={seaD(0.16)} foam={foam} amp={5} />
            <Ship x={820 + Math.sin(f / 60) * 40} y={gy(1500, SEA_G) + 14} s={0.34} frame={f} hull={tone('#6a4426', 0.15)} sail={tone('#f4ece0', 0.1)} />
            <Ship x={1120 - Math.sin(f / 70) * 40} y={gy(1500, SEA_G) + 22} s={0.38} flip frame={f + 20} hull={tone('#6a4426', 0.15)} sail={tone('#a8c0f0', 0.1)} />
          </Art>
        </Layer>
        <Layer d={900}>
          <Art>
            <SeaBand id="s03b2" d={900} f={f} c1={sea(0.1)} c2={seaD(0.08)} foam={foam} amp={9} phase={2} />
            <text x={960} y={gy(900, SEA_G) + 38} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={42} fill="#f0faff" opacity={0.85} direction="rtl" stroke={seaD(0)} strokeWidth={8} style={{paintOrder: 'stroke'}}>
              القناة الإنجليزية
            </text>
          </Art>
        </Layer>
        {/* ٥: قلعتا الضفتين */}
        <Layer d={520}>
          <Art>
            <KeepTower x={60} y={735} s={0.86} stone={tone('#a89ea6', 0.12)} dark={tone('#5c5468', 0.1)} roof={tone('#a8262e', 0.08)} flag="#c8242e" f={f} warm={P.warm} lit={night} />
            <KeepTower x={1860} y={735} s={0.86} stone={tone('#a89c90', 0.12)} dark={tone('#5c5058', 0.1)} roof={tone('#2a55a8', 0.08)} flag="#2f5fc0" f={f + 9} warm={P.warm} lit={night} />
            <SeaBand id="s03b3" d={520} f={f} c1={sea(0.03)} c2={seaD(0.02)} foam={foam} amp={13} phase={4} />
            {[-260, 300, 1640, 2160].map((x, i) => (
              <g key={x} transform={`translate(${x} 735)`}>
                <RoundTree x={0} y={0} h={150 + (i % 2) * 40} c={tone('#4e8240', 0.06)} />
              </g>
            ))}
          </Art>
        </Layer>
        {/* ٦: الجرفان والملكان (نفس الطبقة) */}
        <Layer d={180}>
          <Art>
            <SeaBand id="s03b4" d={180} f={f} c1={sea(0)} c2={seaD(0)} foam={foam} amp={16} phase={1} />
            <Cliff side={-1} rock={tone('#ece6d8')} rockDark={tone('#b8ac9c')} grass={tone('#62a04c')} f={f} label="إنجلترا" labelC="#c8242e" />
            <Cliff side={1} rock={tone('#a08e78')} rockDark={tone('#66564a')} grass={tone('#4f903e')} f={f} label="فرنسا" labelC="#2452a4" />
            <Person
              x={420}
              y={yB}
              s={1.28}
              frame={f}
              {...look('henry5')}
              view={24}
              expr={tossing ? 'angry' : 'smug'}
              pose={tossing ? 'swing' : 'point'}
              holdR={tossing ? 'longsword' : undefined}
              holdL="flagEngland"
              shading="cel"
            />
            <Person
              x={1500}
              y={yB}
              s={1.28}
              flip
              frame={f + 6}
              {...look('charles7', {variant: 'king'})}
              view={24}
              expr="angry"
              pose={tossing ? 'swing' : 'fists'}
              holdR={tossing ? 'longsword' : undefined}
              holdL="flagFrance"
              shading="cel"
            />
            {tossing && (
              <>
                <FlyingProp phase={f / 26} dir={1} kind="sword" arcH={280} />
                <FlyingProp phase={f / 26 + 0.5} dir={-1} kind="sword" arcH={250} />
                <FlyingProp phase={f / 32 + 0.25} dir={1} kind="hat" arcH={340} />
                <FlyingProp phase={f / 32 + 0.75} dir={-1} kind="hat" arcH={310} />
              </>
            )}
          </Art>
        </Layer>
        {/* ٧: رذاذ وموج قريب خارج التركيز */}
        <Layer d={-240} blur={8}>
          <Art>
            <SeaBand id="s03b5" d={-240} f={f * 1.3} c1={sea(0)} c2={seaD(0)} foam={foam} amp={30} phase={3} />
          </Art>
        </Layer>
        <Layer d={-120}>
          <Art>
            <Motes id="s03mo" frame={f * 1.5} x0={-200} x1={2100} y0={200} y1={1000} color={foam} n={26} size={2.6} />
          </Art>
        </Layer>
      </LitStage>
      <ColorGrade p={P} lightAt={[dayness > 0.5 ? clamp(sunX / 19.2, 5, 95) : clamp(moonX / 19.2, 5, 95), 24]} lightStrength={0.18 + dusk * 0.14} />
      <SoftFilm frame={f} />
      <Hud>
        {showClaim > 0.02 && (
          <g opacity={clamp(showClaim)}>
            <CalloutTag x={Math.max(360, claimAt.x + 60)} y={Math.max(110, claimAt.y - 150)} lines={['مهلاً! أنا قريب لملك فرنسا..', 'إذن العرش الفرنسي من حقي!']} arrowTo={[claimAt.x, claimAt.y]} accent="#c8242e" scale={showClaim * 1.4} />
          </g>
        )}
        {yearText && (
          <g transform="translate(960 108)">
            <rect x={-188} y={-46} width={388} height={108} rx={20} fill="#000" opacity={0.35} />
            <rect x={-194} y={-46} width={388} height={108} rx={20} fill="#8a6414" stroke={INK} strokeWidth={6} />
            <rect x={-194} y={-58} width={388} height={108} rx={20} fill="#fdfaf2" stroke={INK} strokeWidth={6} />
            <text x={0} y={22} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={74} fill="#c8242e">
              {yearText}
            </text>
          </g>
        )}
      </Hud>
    </>
  );
};

export const Scene03: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;

  const c2 = SCENE03_TRACK.byId.s03_nar_2;
  const c3 = SCENE03_TRACK.byId.s03_nar_3;
  const cSol = SCENE03_TRACK.byId.s03_soldier_1;
  const c4 = SCENE03_TRACK.byId.s03_nar_4;

  const BUZZER_T = c2.t0 + 2.05;
  const CHANNEL_T = c3.t0 - 0.1;
  const SOLDIER_T = cSol.t0 - 0.04;
  const TOSS_T = c4.t0;
  const PALACE_T = c4.t0 + (c4.t1 - c4.t0) * 0.54;

  const sfx = [
    {at: 0.25, name: 'pop', vol: 0.5, dur: 0.3},
    {at: BUZZER_T, name: 'buzzer', vol: 0.72, dur: 0.7},
    {at: CHANNEL_T, name: 'whoosh', vol: 0.5, dur: 0.5},
    {at: SOLDIER_T, name: 'pop', vol: 0.85, dur: 0.3},
    {at: TOSS_T + 0.3, name: 'whoosh', vol: 0.45, dur: 0.45},
    {at: TOSS_T + 1.3, name: 'clang', vol: 0.4, dur: 1.0},
    {at: TOSS_T + 2.6, name: 'whoosh', vol: 0.45, dur: 0.45},
    {at: TOSS_T + 3.8, name: 'clang', vol: 0.4, dur: 1.0},
    {at: PALACE_T, name: 'boom', vol: 0.65, dur: 2.0},
  ];

  let view: React.ReactNode;
  if (t < CHANNEL_T) {
    view = <HundredYears f={f} t={t} c2t={c2.t0} buzzerT={BUZZER_T} endT={CHANNEL_T} />;
  } else if (t < SOLDIER_T) {
    view = (
      <EnglishChannel f={f} lf={f - CHANNEL_T * FPS} dur={(SOLDIER_T - CHANNEL_T) * FPS} fastCycle={false} tossing={false} showClaim={easeOutBack(prog(t, c3.t0 + 1.1, c3.t0 + 1.5)) * (1 - prog(t, c3.t0 + 8.5, c3.t0 + 8.9))} />
    );
  } else if (t < TOSS_T) {
    view = <AngrySoldier f={f} t={t} at={SOLDIER_T} endT={TOSS_T} />;
  } else if (t < PALACE_T) {
    const yr = Math.round(lerp(1337, 1392, prog(t, TOSS_T, PALACE_T)));
    const arDigits = String(yr).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
    view = <EnglishChannel f={f} lf={f - TOSS_T * FPS} dur={(PALACE_T - TOSS_T) * FPS} fastCycle tossing yearText={arDigits} />;
  } else {
    view = <StormPalace f={f} t={t} at={PALACE_T} />;
  }

  return (
    <AbsoluteFill style={{background: '#0d0b12'}}>
      {view}
      <SceneTrackAudio track={SCENE03_TRACK} sfx={sfx} />
      <SceneTrackSubtitles track={SCENE03_TRACK} hideDialogue />
    </AbsoluteFill>
  );
};

/* ================= المرحلة 1: خريطة أوروبا الغربية + عداد ١١٦ ================= */
const HundredYears: React.FC<{f: number; t: number; c2t: number; buzzerT: number; endT: number}> = ({f, t, c2t, buzzerT, endT}) => {
  const bannerPop = easeOutBack(prog(t, 0.15, 0.6));
  const calcPop = easeOutBack(prog(t, c2t + 0.25, c2t + 0.7));
  const countP = easeOut(prog(t, c2t + 0.6, buzzerT));
  const numVal = Math.round(lerp(0, 116, countP));
  const buzzed = t >= buzzerT;
  const buzzShake = buzzed && t < buzzerT + 0.45 ? Math.sin(f * 3.8) * 10 : 0;
  const histPop = easeOutBack(prog(t, buzzerT + 0.45, buzzerT + 0.9));

  const F = (s: number) => Math.round(s * FPS);
  const cam = camAt(f, [
    {f: 0, x: -120, y: -40, z: -260, rx: 7, ry: -5, fov: 47},
    {f: F(2.4), x: 0, y: -30, z: -20, rx: 2, ry: -1, fov: 45},
    {f: F(c2t), x: 20, y: -90, z: 20, ry: 1},
    {f: F(c2t + 0.9), x: 60, y: -90, z: 30, ry: 3},
    {f: F(buzzerT + 0.9), x: 0, y: -85, z: 60, ry: -1},
    {f: F(endT), x: -50, y: -80, z: 110, ry: -4, rx: 0},
  ]);
  cam.x += buzzShake * 0.6;

  return (
    <>
      <MapTable
        id="s03"
        cam={cam}
        frame={f}
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        colors={MAP_COLORS}
        pieces={({xy}) => (
          <>
            <CityStandee at={xy(CITIES_1429.london.pos)} label="لندن" color="#c8242e" frame={f} big h={52} />
            <CityStandee at={xy(CITIES_1429.paris.pos)} label="باريس" color="#2452a4" frame={f} big h={60} />
            {/* مؤرخ يصاب بالصداع من الرياضيات */}
            {histPop > 0.02 && (
              <Standee at={xy([-3.9, 47.15])} up={histPop} z={10} scale={1.12}>
                <GamePiece label="مؤرخ محترم" color="#3c3346" w={250} fs={36}>
                  <Person x={0} y={0} s={1.12} frame={f} {...extra('poitiersScholar', 1)} expr="dizzy" pose="cower" shading="cel" />
                  <DizzyBirds x={0} y={-345} frame={f} r={74} />
                </GamePiece>
              </Standee>
            )}
          </>
        )}
      />
      <ColorGrade p={WAR_TABLE} lightAt={[12, 78]} lightStrength={0.22 + 0.02 * Math.sin(f * 0.6)} />
      <SoftFilm frame={f} />
      {/* العدّاد جهاز سميك أمام الطاولة */}
      <LitStage cam={{...cam, x: cam.x * 0.5, y: cam.y * 0.5, z: cam.z * 0.4, rx: 0}} light={LIGHTS.table}>
        <Layer d={-30}>
          <Art>
            {calcPop > 0.02 && (
              <g transform={`translate(${1440 + buzzShake} 500) scale(${calcPop * 1.06})`}>
                <rect x={-236} y={-150} width={520} height={360} rx={26} fill="#000" opacity={0.42} />
                <rect x={-260} y={-165} width={520} height={360} rx={26} fill="#4a3418" stroke={INK} strokeWidth={7} />
                <rect x={-260} y={-190} width={520} height={360} rx={26} fill="#8a5e2e" stroke={INK} strokeWidth={7} />
                <rect x={-260} y={-190} width={520} height={22} rx={11} fill="#d8a45c" opacity={0.6} />
                {[-236, 236].map((bx) => [-166, 146].map((by) => <circle key={`${bx}${by}`} cx={bx} cy={by} r={11} fill="#e8c05a" stroke={INK} strokeWidth={4} />))}
                <rect x={-214} y={-156} width={428} height={292} rx={16} fill="#1c1a28" stroke={INK} strokeWidth={5} />
                <text x={0} y={-92} textAnchor="middle" fontFamily="DejaVu Sans Mono, monospace" fontWeight={700} fontSize={44} fill="#e8e2d0">
                  1453 - 1337 =
                </text>
                <rect x={-168} y={-62} width={336} height={140} rx={16} fill={buzzed ? '#3a1016' : '#10161e'} stroke={buzzed ? '#ff3b3b' : '#50607a'} strokeWidth={5} />
                <Bloom id="s03calc" x={-200} y={-90} w={400} h={200} radius={12} strength={1.1}>
                  <text x={0} y={42} textAnchor="middle" fontFamily="DejaVu Sans Mono, monospace" fontWeight={900} fontSize={112} fill={buzzed ? '#ff4a42' : '#ffd447'}>
                    {numVal}
                  </text>
                </Bloom>
                <path d="M -160 -54 L 60 -54 L 10 10 L -160 10 Z" fill="#fff" opacity={0.07} />
                {buzzed && (
                  <text x={0} y={120} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={38} fill="#ff8a80" direction="rtl">
                    عاماً.. وليست ١٠٠!
                  </text>
                )}
              </g>
            )}
          </Art>
        </Layer>
      </LitStage>
      <Hud>
        <TitleBanner y={96} title="حرب المائة عام — ١٣٣٧ إلى ١٤٥٣" sub="الفصل الأول" accent="#c8242e" scale={bannerPop} />
      </Hud>
    </>
  );
};

/* ================= المرحلة 3: تقريب مفاجئ للجندي الفرنسي "لا، وألفُ لا!" ================= */
const AngrySoldier: React.FC<{f: number; t: number; at: number; endT: number}> = ({f, t, at, endT}) => {
  const solTalk = talkOf(SCENE03_TRACK, 's03_soldier_1', t);
  const solBub = bubbleOf(SCENE03_TRACK, 's03_soldier_1', t);
  const slam = easeOutBack(prog(t, at, at + 0.16));
  const lf = f - at * FPS;
  const cam = camAt(lf, [
    {f: 0, z: -420, ry: -8, fov: 56},
    {f: 6, z: 70, ry: 2, fov: 44},
    {f: (endT - at) * FPS, z: 190, ry: -3, fov: 41},
  ]);
  cam.x += Math.sin(f * 4.1) * 9;
  cam.y += Math.cos(f * 3.5) * 7;
  return (
    <>
      <Sky background="radial-gradient(circle at 50% 50%, #ffcf6a 0%, #e0602c 34%, #7a1a24 74%, #3a0c1a 100%)" />
      <LitStage cam={cam} light={{dir: -1, key: '#ffe0a0', shadow: '#5a1c30', ambient: 0.08, rim: 1}}>
        <Layer d={2400}>
          <Art>
            <Rays cx={960} cy={560} rot={f * 1.2} color="#ffd447" alt="#ff4d3a" opacity={0.42} n={22} />
          </Art>
        </Layer>
        <Layer d={1200}>
          <Art>
            <Halo id="s03sH" cx={960} cy={560} r={820} color="#fff0a0" opacity={0.75} />
            <Rays cx={960} cy={560} rot={-f * 2} color="#fff4c0" opacity={0.2} n={12} />
          </Art>
        </Layer>
        <Layer d={620} blur={3}>
          <Art>
            <FarArmy id="s03fa" y={() => 1000} n={46} x0={-500} x1={2500} frame={f} c="#5a1c2c" rim="#ffc070" h={240} />
          </Art>
        </Layer>
        <Layer d={60}>
          <Art>
            <g transform={`translate(960 1180) scale(${slam}) translate(-960 -1180)`}>
              <Person x={960} y={1230} s={2.75} frame={f} {...extra('frenchSoldier', 1)} expr="shout" pose="fists" talk={solTalk} shading="cel" />
            </g>
          </Art>
        </Layer>
        <Layer d={-120}>
          <Art>
            <Embers id="s03se" x={960} y={1150} frame={f * 1.6} n={46} spread={1900} rise={1100} size={7} life={50} wind={60} />
          </Art>
        </Layer>
        <Layer d={-380} blur={12}>
          <Art>
            {[260, 1660].map((x, i) => (
              <g key={x} transform={`translate(${x} 1250) rotate(${i ? -10 : 10})`}>
                <rect x={-15} y={-900} width={30} height={1200} fill="#4a2a18" />
                <path d="M 0 -1010 L 40 -900 L 0 -860 L -40 -900 Z" fill="#d8dee8" />
              </g>
            ))}
          </Art>
        </Layer>
      </LitStage>
      <ColorGrade p={{...GOLDEN, gradeTop: '#ff9a4a', gradeBottom: '#4a0c1c'}} lightAt={[50, 45]} lightStrength={0.2} />
      <SoftFilm frame={f} strength={0.45} />
      <Hud>{solBub && <SpeechBubble text={solBub.text} style="shout" headX={960} headTop={300} s={1.25} age={solBub.age} left={solBub.left} side={1} />}</Hud>
    </>
  );
};

/* ================= المرحلة 4ب: الكارثة بدأت داخل القصر الملكي الفرنسي! ================= */
const StormPalace: React.FC<{f: number; t: number; at: number}> = ({f, t, at}) => {
  const P = STORM;
  const lf = f - at * FPS;
  const dur = SCENE03_TRACK.durationFrames - at * FPS;
  const cam = camAt(lf, [
    {f: 0, x: -90, y: 70, z: -230, ry: -6, rx: -3, fov: 52},
    {f: dur * 0.45, x: 0, y: 10, z: 60, ry: 0, rx: 0, fov: 46},
    {f: dur, x: 0, y: -16, z: 560, ry: 2, fov: 40},
  ]);
  const raw = Math.abs(Math.sin(f * 0.45));
  const lightning = raw > 0.96 ? 0.35 : 0;
  const flash = lightning > 0 ? 1 : 0;
  const boltSide = Math.floor(f / 7) % 2;
  const stone = mix('#4c5078', '#8a94c8', flash * 0.5);
  const stoneD = mix('#343860', '#5a64a0', flash * 0.4);
  const roof = mix('#24386e', '#4a66b4', flash * 0.5);
  const by = gy(620);

  return (
    <>
      <Sky background={`linear-gradient(${mix(P.skyTop, '#5a6ab0', flash * 0.6)} 0%, ${mix(P.skyMid, '#7a8ad0', flash * 0.6)} 52%, ${P.horizon} 100%)`} />
      <LitStage cam={cam} light={LIGHTS.night}>
        {/* ١: برق وسحب عاصفة */}
        <Layer d={2900}>
          <Art>
            {flash > 0 && (
              <Bloom id="s03bolt" x={-300} y={-300} w={2600} h={1300} radius={20} strength={1.6}>
                <path
                  d={boltSide ? 'M 1560 -200 L 1490 90 L 1570 110 L 1450 360 L 1520 372 L 1400 640' : 'M 330 -200 L 400 60 L 330 90 L 450 330 L 380 350 L 470 620'}
                  fill="none"
                  stroke="#f4f8ff"
                  strokeWidth={11}
                  strokeLinejoin="round"
                />
              </Bloom>
            )}
          </Art>
        </Layer>
        <Layer d={2400}>
          <Art>
            {[0, 1, 2, 3].map((i) => (
              <Cloud key={i} id={`s03st${i}`} x={-300 + i * 760 + lf * (0.8 + i * 0.25)} y={160 + (i % 2) * 110} w={1250} h={130} lit={mix('#4c5688', '#c8d4ff', flash * 0.8)} shade="#161c38" opacity={0.94} />
            ))}
          </Art>
        </Layer>
        {/* ٢: أسطح باريس */}
        <Layer d={1600}>
          <Art>
            {scatter('s03roofs', 60, -1300, 3200, 0, 1)
              .sort((a, b) => a.y - b.y)
              .map((b, i) => {
                const h = 90 + b.r * 110;
                const w = 70 + b.y * 70;
                return (
                  <g key={i} fill={mix(P.city, P.haze, 0.3 - b.y * 0.14)}>
                    <rect x={b.x} y={770 - h} width={w} height={h + 200} />
                    <path d={`M ${b.x - 10} ${772 - h} L ${b.x + w / 2} ${700 - h} L ${b.x + w + 10} ${772 - h} Z`} />
                    {b.r > 0.35 && <rect x={b.x + w * 0.4} y={790 - h} width={13} height={20} fill={P.warm} opacity={0.75} />}
                  </g>
                );
              })}
            <MistBand id="s03pm" frame={f} y={760} color={P.haze} h={80} />
          </Art>
        </Layer>
        {/* ٣: الجناحان الخلفيان */}
        <Layer d={1050}>
          <Art>
            {[250, 1330].map((x, i) => (
              <g key={x} stroke={INK} strokeWidth={5}>
                <rect x={x} y={430} width={340} height={600} fill={mix(stoneD, P.haze, 0.16)} />
                <path d={`M ${x - 24} 432 L ${x + 60} 320 L ${x + 280} 320 L ${x + 364} 432 Z`} fill={mix(roof, P.haze, 0.16)} />
                {[60, 160, 260].map((k) => (
                  <rect key={k} x={x + k - 16} y={500} width={34} height={70} rx={17} fill={(k + i) % 3 ? P.warm : '#1a1c34'} strokeWidth={4} />
                ))}
              </g>
            ))}
          </Art>
        </Layer>
      </LitStage>
      <LitStage cam={cam} light={LIGHTS.night}>
        <Floor3D d0={-460} d1={1050}>
          {(len) => <FloorTiles id="s03pf" len={len} a="#2a2d4c" b="#232644" line="#12142c" size={200} far="#ffc566" near="#060814" />}
        </Floor3D>
      </LitStage>
      <LitStage cam={cam} light={LIGHTS.night}>
        {/* ٤: القصر */}
        <Layer d={640}>
          <Art>
            <PalaceFacade f={f} by={by} stone={stone} stoneD={stoneD} roof={roof} warm={P.warm} rim={mix('#8fa2e0', '#ffffff', flash)} />
          </Art>
        </Layer>
        <Layer d={600}>
          <Art>
            <ellipse cx={960} cy={by + 8} rx={330} ry={26} fill="#ffc566" opacity={0.2} />
            <path d={`M 880 ${by} L 1040 ${by} L 1180 ${by + 150} L 740 ${by + 150} Z`} fill="#ffc566" opacity={0.12} />
          </Art>
        </Layer>
        {/* ٥: أشجار ومصابيح الحديقة */}
        <Layer d={330}>
          <Art>
            {[90, 330, 1590, 1830].map((x, i) => (
              <Cypress key={x} x={x} y={gy(330) + 8} h={330 + (i % 2) * 70} fill="#131a34" rim="#7a8cd0" sway={Math.sin(f / 9 + i) * 12} />
            ))}
            {[560, 1360].map((x, i) => (
              <TorchFX key={x} id={`s03pt${i}`} x={x} y={gy(330) - 4} frame={f} s={1.25} warm={P.warm} smoke="#4a5270" />
            ))}
          </Art>
        </Layer>
        {/* ٦: مطر بعمقين */}
        <Layer d={60}>
          <Art>
            <Rain id="r1" f={f} n={110} len={46} w={2.4} speed={46} op={0.32} />
          </Art>
        </Layer>
        <Layer d={-260} blur={2.5}>
          <Art>
            <Rain id="r2" f={f} n={44} len={110} w={5} speed={82} op={0.26} />
          </Art>
        </Layer>
        {/* ٧: سياج حديد قريب خارج التركيز */}
        <Layer d={-330} blur={8}>
          <Art>
            <g fill="#070914">
              <rect x={-900} y={1000} width={3700} height={22} />
              {Array.from({length: 24}, (_, i) => (
                <g key={i} transform={`translate(${-700 + i * 140} 0)`}>
                  <rect x={-9} y={880} width={18} height={500} />
                  <path d="M 0 820 L 22 884 L -22 884 Z" />
                </g>
              ))}
            </g>
          </Art>
        </Layer>
      </LitStage>
      <ColorGrade p={P} lightAt={[50, 52]} lightStrength={0.16 + flash * 0.1} />
      <SoftFilm frame={f} strength={0.5} />
      {lightning > 0 && <AbsoluteFill style={{background: '#dbe8ff', opacity: lightning * 0.6, pointerEvents: 'none'}} />}
      <Hud>
        <TitleBanner y={92} title="القصر الملكي الفرنسي — باريس" accent="#2452a4" scale={easeOutBack(prog(t, at + 0.1, at + 0.5))} />
      </Hud>
    </>
  );
};

/** مطر مائل حتمي */
const Rain: React.FC<{id: string; f: number; n: number; len: number; w: number; speed: number; op: number}> = ({id, f, n, len, w, speed, op}) => (
  <g stroke="#c8d8ff" strokeWidth={w} strokeLinecap="round" opacity={op}>
    {scatter(`rain-${id}`, n, -400, 2500, 0, 1500).map((p, i) => {
      const y = ((p.y + f * speed * (0.8 + p.r * 0.4)) % 1600) - 250;
      const x = p.x - y * 0.16;
      return <line key={i} x1={x} y1={y} x2={x - len * 0.16} y2={y + len} />;
    })}
  </g>
);

const PalaceFacade: React.FC<{f: number; by: number; stone: string; stoneD: string; roof: string; warm: string; rim: string}> = ({f, by, stone, stoneD, roof, warm, rim}) => (
  <g strokeLinejoin="round">
    <Halo id="s03ph" cx={960} cy={600} r={420} color={warm} opacity={0.35} />
    <g stroke={INK} strokeWidth={6}>
      {/* الأبراج الجانبية */}
      {[495, 1425].map((x) => (
        <g key={x}>
          <rect x={x - 80} y={330} width={160} height={by - 330} fill={stone} />
          <rect x={x + 16} y={330} width={64} height={by - 330} fill={stoneD} stroke="none" />
          <line x1={x - 76} x2={x - 76} y1={334} y2={by} stroke={rim} strokeWidth={5} opacity={0.6} />
          <path d={`M ${x - 108} 332 L ${x} 150 L ${x + 108} 332 Z`} fill={roof} />
          <path d={`M ${x + 20} 332 L ${x} 150 L ${x + 108} 332 Z`} fill="#0c1434" opacity={0.45} stroke="none" />
          <path d={`M ${x} 150 L ${x} 84 L ${x + 64 + Math.sin(f / 4 + x) * 10} 104 L ${x} 124`} fill="#3a6ad0" />
          {[400, 520, 640].map((y, i) => (
            <rect key={y} x={x - 16} y={y} width={32} height={66} rx={16} fill={i === 1 ? '#171a30' : warm} strokeWidth={4} />
          ))}
        </g>
      ))}
      {/* المبنى الرئيسي */}
      <rect x={560} y={400} width={800} height={by - 400} fill={stone} />
      <g stroke={stoneD} strokeWidth={3} opacity={0.75}>
        {[450, 500, 560, 610, 660, 710, 760].map((y, i) => (
          <path key={y} d={`M 566 ${y} H 1354 M ${620 + (i % 2) * 40} ${y} v 48 M ${760 + (i % 2) * 40} ${y} v 48 M ${1160 + (i % 2) * 40} ${y} v 48 M ${1290 - (i % 2) * 40} ${y} v 48`} />
        ))}
      </g>
      <rect x={550} y={392} width={820} height={20} fill={mix(stone, '#ffffff', 0.12)} />
      <path d="M 528 394 L 630 268 L 1290 268 L 1392 394 Z" fill={roof} />
      <path d="M 1010 268 L 1290 268 L 1392 394 L 1060 394 Z" fill="#0c1434" opacity={0.4} stroke="none" />
      <line x1={634} x2={1286} y1={270} y2={270} stroke={rim} strokeWidth={5} opacity={0.7} />
      {[690, 1230].map((x) => (
        <g key={x}>
          <path d={`M ${x - 36} 394 L ${x - 36} 336 L ${x} 296 L ${x + 36} 336 L ${x + 36} 394 Z`} fill={stone} strokeWidth={5} />
          <rect x={x - 13} y={340} width={26} height={38} rx={13} fill={warm} strokeWidth={4} />
        </g>
      ))}
      {/* البرج الأوسط */}
      <rect x={850} y={238} width={220} height={by - 238} fill={mix(stone, '#ffffff', 0.06)} />
      <rect x={1004} y={238} width={66} height={by - 238} fill={stoneD} opacity={0.75} stroke="none" />
      <path d="M 820 240 L 960 88 L 1100 240 Z" fill={roof} />
      <path d="M 980 240 L 960 88 L 1100 240 Z" fill="#0c1434" opacity={0.45} stroke="none" />
      <path d={`M 960 88 L 960 16 L ${1034 + Math.sin(f / 4) * 11} 38 L 960 62`} fill="#f2c43a" />
      <circle cx={960} cy={330} r={50} fill="#1a1e3c" />
      <circle cx={960} cy={330} r={38} fill={warm} opacity={0.85} strokeWidth={4} />
      {[0, 45, 90, 135].map((a) => (
        <line key={a} x1={-38} x2={38} y1={0} y2={0} transform={`translate(960 330) rotate(${a})`} strokeWidth={5} />
      ))}
      {/* نوافذ مضيئة */}
      {[640, 750, 1170, 1280].map((wx, i) => (
        <g key={wx}>
          <path d={`M ${wx - 30} 600 L ${wx - 30} 500 Q ${wx} 456 ${wx + 30} 500 L ${wx + 30} 600 Z`} fill={i === 1 ? '#1c1f3a' : warm} strokeWidth={5} />
          <line x1={wx} x2={wx} y1={480} y2={600} strokeWidth={4} />
          <rect x={wx - 40} y={600} width={80} height={14} fill={stone} strokeWidth={4} />
        </g>
      ))}
    </g>
    {/* النافذة المركزية الكبرى مع ظل الملك المائل */}
    <Bloom id="s03pw" x={780} y={420} w={360} h={320} radius={16} strength={0.9}>
      <path d="M 884 680 L 884 520 Q 960 440 1036 520 L 1036 680 Z" fill="#ffd978" />
    </Bloom>
    <g transform={`translate(${960 + Math.sin(f * 0.07) * 16} 636) rotate(${Math.sin(f * 0.2) * 4}) scale(0.95)`} fill="#20182b" opacity={0.9}>
      <ellipse cx={0} cy={-70} rx={30} ry={34} />
      <path d="M -34 46 L -26 -36 Q 0 -48 26 -36 L 34 46 Z" />
      <path d="M -26 -26 q -34 -6 -40 -40 l 10 -4 q 8 24 34 28 Z M 26 -26 q 34 -6 40 -40 l -10 -4 q -8 24 -34 28 Z" />
      <g transform="translate(0 -106) rotate(18)">
        <path d="M -26 14 L -30 -18 L -12 -2 L 0 -24 L 12 -2 L 30 -18 L 26 14 Z" />
      </g>
    </g>
    <g fill="none" stroke={INK}>
      <path d="M 884 680 L 884 520 Q 960 440 1036 520 L 1036 680 Z" strokeWidth={7} />
      <line x1={960} x2={960} y1={486} y2={680} strokeWidth={4} opacity={0.55} />
      <line x1={884} x2={1036} y1={580} y2={580} strokeWidth={4} opacity={0.55} />
    </g>
    <rect x={866} y={680} width={188} height={18} fill={mix(stone, '#ffffff', 0.14)} stroke={INK} strokeWidth={5} />
    {/* البوابة */}
    <path d={`M 890 ${by} L 890 ${by - 70} Q 960 ${by - 122} 1030 ${by - 70} L 1030 ${by} Z`} fill="#1c1626" stroke={INK} strokeWidth={6} />
    <path d={`M 944 ${by} L 944 ${by - 100} L 976 ${by - 100} L 976 ${by} Z`} fill={warm} opacity={0.85} />
  </g>
);
