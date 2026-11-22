import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Battlement, Bombard, Campfire, CityEpic, Ridge, Walkway} from '../lib/epic';
import {Cloud, ColorGrade, GodRays, Halo, MistBand, Motes, Smoke} from '../lib/fx';
import {atmos} from '../lib/palette';
import {Ship, Stars, Tent, Water} from '../lib/props';
import {Art, CAM0, Cam, Layer, Sky, Stage} from '../lib/stage';
import {INK, scatter} from '../lib/util';
import {DepthSort, Sorted} from '../lib/depth';
import {Qaitbay, Steamer} from '../episodes/suez1956/props';
import {
  CairoHouse,
  CityGate,
  EuroApartment,
  GovBuilding,
  Kiosk,
  Lighthouse,
  MamlukMosque,
  MudHouse,
  PalmTree,
  Pyramid,
  RoundTree,
  Shop,
  SouqStall,
  StreetLamp,
  WallTower,
  Warehouse,
} from './buildings';
import {TimeOfDay, World, WorldCtx, shadeOf, tinted, useWorld, worldFor} from './lighting';

/* =====================================================================
 * مكتبة الخلفيات — بيئة كاملة بطبقات عمق وإضاءة حسب الوقت:
 *
 *   <Backdrop name="cairoMamlukStreet" time="dusk" cam={cam}>
 *     <Actor scene={scene} id="ali" />          // الشخصيات (SVG) توضع على طبقة الممثلين
 *   </Backdrop>
 *
 * أرضية الممثلين عند y≈880–960 (انظر GROUND لكل خلفية).
 * ===================================================================== */

export type BackdropName =
  | 'cairoMamlukStreet'
  | 'alexCorniche'
  | 'cityPlaza1950s'
  | 'nileCountryside'
  | 'desertPyramids'
  | 'harbor'
  | 'palaceInterior'
  | 'militaryCamp'
  | 'besiegedWalls';

export const BACKDROP_LABEL: Record<BackdropName, string> = {
  cairoMamlukStreet: 'شارع قاهري مملوكي',
  alexCorniche: 'كورنيش الإسكندرية',
  cityPlaza1950s: 'ميدان الخمسينيات',
  nileCountryside: 'ريف ونيل',
  desertPyramids: 'صحراء وأهرامات',
  harbor: 'ميناء',
  palaceInterior: 'قصر من الداخل',
  militaryCamp: 'معسكر حربي',
  besiegedWalls: 'أسوار مدينة محاصرة',
};

/** خط الأرض الذي تقف عليه الشخصيات في كل خلفية */
export const GROUND: Record<BackdropName, number> = {
  cairoMamlukStreet: 930,
  alexCorniche: 930,
  cityPlaza1950s: 930,
  nileCountryside: 930,
  desertPyramids: 930,
  harbor: 930,
  palaceInterior: 940,
  militaryCamp: 930,
  besiegedWalls: 930,
};

type L = {d: number; blur?: number; opacity?: number; el: React.ReactNode};
/** طبقة اللعب: الأرضية + عناصر قريبة تُرتَّب بالعمق مع الشخصيات */
type StageDef = {d: number; ground: React.ReactNode; props: {z: number; el: React.ReactNode}[]};

/* ---------- السماء المشتركة ---------- */
const SkyLayer: React.FC<{f: number; clouds?: number}> = ({f, clouds = 3}) => {
  const W = useWorld();
  const {P} = W;
  const [sx, sy] = W.sun;
  const night = W.time === 'night';
  return (
    <>
      {night && <Stars frame={f} />}
      {W.time !== 'day' && <GodRays id={`sky-gr-${W.time}`} cx={sx} cy={sy} frame={f} color={P.light} opacity={night ? 0 : 0.28} />}
      <Halo id={`sky-h-${W.time}`} cx={sx} cy={sy} r={night ? 420 : 620} color={night ? '#c8d4ff' : P.light} opacity={night ? 0.45 : 0.7} core={6} />
      <circle cx={sx} cy={sy} r={night ? 56 : 70} fill={night ? '#f2f1e6' : '#fff6d8'} />
      {Array.from({length: clouds}, (_, i) => (
        <Cloud
          key={i}
          id={`sky-c${i}-${W.time}`}
          x={-200 + i * 900 + f * (0.2 + i * 0.05)}
          y={220 + (i % 2) * 110}
          w={900 + i * 120}
          h={80}
          lit={W.time === 'day' ? '#ffffff' : P.rim}
          shade={W.time === 'day' ? '#d8e4ee' : P.skyMid}
          opacity={W.time === 'day' ? 0.9 : 0.65}
        />
      ))}
    </>
  );
};

/** ضباب جوي فوق طبقة بعيدة (atmospheric perspective) */
const Haze: React.FC<{y?: number; k?: number}> = ({y = -800, k = 0.35}) => {
  const W = useWorld();
  return <rect x={-1400} y={y} width={4700} height={2600} fill={W.P.haze} opacity={k} />;
};

/** أرضية بتدرج وخطوط */
const Ground: React.FC<{y: number; c: string; lines?: 'cobble' | 'tiles' | 'sand' | 'grass' | 'none'; seed: string}> = ({y, c, lines = 'none', seed}) => {
  const W = useWorld();
  const base = tinted(W, c);
  return (
    <g>
      <rect x={-1400} y={y} width={4700} height={1600} fill={base} stroke={INK} strokeWidth={4} />
      <rect x={-1400} y={y} width={4700} height={40} fill={shadeOf(W, c, 0.25)} opacity={0.5} />
      {lines === 'cobble' &&
        scatter(`cb-${seed}`, 160, -1300, 3200, y + 20, y + 300).map((p, i) => (
          <ellipse key={i} cx={p.x} cy={p.y} rx={16 + p.r * 10} ry={7} fill="none" stroke={shadeOf(W, c, 0.3)} strokeWidth={2} opacity={0.6} />
        ))}
      {lines === 'tiles' &&
        Array.from({length: 40}, (_, i) => <line key={i} x1={-1300 + i * 120} y1={y} x2={-1300 + i * 120 + (i * 120 - 1300 - 960) * 0.35} y2={y + 300} stroke={shadeOf(W, c, 0.25)} strokeWidth={2} opacity={0.6} />)}
      {lines === 'sand' &&
        scatter(`sd-${seed}`, 40, -1300, 3200, y + 20, y + 260).map((p, i) => (
          <path key={i} d={`M ${p.x} ${p.y} q 30 -8 60 0`} fill="none" stroke={shadeOf(W, c, 0.2)} strokeWidth={2.5} opacity={0.6} />
        ))}
      {lines === 'grass' &&
        scatter(`gr-${seed}`, 120, -1300, 3200, y + 10, y + 260).map((p, i) => (
          <path key={i} d={`M ${p.x} ${p.y} l 4 -14 M ${p.x + 6} ${p.y} l 2 -18 M ${p.x + 12} ${p.y} l -2 -12`} stroke={shadeOf(W, '#4a7a3a', 0.1)} strokeWidth={3} />
        ))}
    </g>
  );
};

/* ---------- تعريف الخلفيات ---------- */
const DEFS: Record<BackdropName, (W: World, f: number) => {layers: L[]; actorD: number; stage?: StageDef}> = {
  cairoMamlukStreet: (W, f) => ({
    actorD: 150,
    stage: {
      d: 300,
      ground: <Ground y={900} c="#a89070" lines="cobble" seed="c2" />,
      props: [
        {z: 920, el: <SouqStall x={170} y={920} s={1.1} seed="s1" />},
        {z: 920, el: <SouqStall x={1760} y={920} s={1.1} seed="s2" />},
      ],
    },
    layers: [
      {
        d: 2000,
        el: (
          <>
            {[-500, 200, 1250, 2100].map((x, i) => (
              <MamlukMosque key={x} x={x} y={720} s={0.45 + (i % 2) * 0.1} D={false} />
            ))}
            {[-200, 500, 900, 1600, 2500].map((x) => (
              <CairoHouse key={x} x={x} y={720} s={0.45} D={false} />
            ))}
            <Haze k={0.4} />
          </>
        ),
      },
      {
        d: 900,
        el: (
          <>
            <Ground y={840} c="#b8a07a" seed="c1" />
            <CairoHouse x={-300} y={860} s={1} seed="ch1" />
            <CairoHouse x={130} y={860} s={0.9} seed="ch2" c="#e4d2b0" />
            <MamlukMosque x={900} y={860} s={1} />
            <CairoHouse x={1650} y={860} s={0.95} seed="ch3" c="#d4b892" />
            <CairoHouse x={2080} y={860} s={1.05} seed="ch4" />
          </>
        ),
      },
      {
        d: -260,
        blur: 7,
        el: (
          <>
            <path d="M -400 -40 Q 400 140 1200 -20 Q 1800 120 2400 -40" fill="none" stroke={tinted(W, '#3a2a20')} strokeWidth={6} />
            {Array.from({length: 9}, (_, i) => (
              <g key={i}>
                <line x1={-200 + i * 300} y1={40} x2={-200 + i * 300} y2={110} stroke={tinted(W, '#3a2a20')} strokeWidth={4} />
                <rect x={-218 + i * 300} y={110} width={36} height={50} rx={10} fill={W.lit > 0.2 ? W.P.warm : tinted(W, '#c0504a')} stroke={INK} strokeWidth={4} />
              </g>
            ))}
          </>
        ),
      },
    ],
  }),

  alexCorniche: (W, f) => ({
    actorD: 150,
    stage: {
      d: 250,
      ground: <Ground y={900} c="#c9b89a" lines="tiles" seed="a2" />,
      props: [
        ...[-200, 500, 1300, 2000].map((x, i) => ({z: 915, el: <PalmTree key={x} x={x} y={915} h={340} frame={f} seed={i} />})),
        ...[150, 900, 1650].map((x) => ({z: 916, el: <StreetLamp key={x} x={x} y={915} s={1.1} />})),
        {
          z: 1040,
          el: (
            <g stroke={INK} strokeWidth={3}>
              <rect x={-1400} y={985} width={4700} height={10} fill={tinted(W, '#e8e0d0')} />
              {Array.from({length: 60}, (_, i) => (
                <rect key={i} x={-1300 + i * 80} y={995} width={12} height={40} fill={tinted(W, '#e8e0d0')} />
              ))}
            </g>
          ),
        },
      ],
    },
    layers: [
      {
        d: 2300,
        el: (
          <>
            <Water id={`ac-w-${W.time}`} top={700} frame={f} c1={W.P.water1} c2={W.P.water2} shine={W.P.rim} reflectX={W.sun[0]} reflectW={220} />
            <Qaitbay x={2350} y={712} s={0.5} fill={atmos(tinted(W, '#c9b48e'), W.P.haze, 0.3)} rim={W.P.rim} />
          </>
        ),
      },
      {
        d: 1400,
        el: (
          <>
            {Array.from({length: 10}, (_, i) => (
              <EuroApartment key={i} x={-1100 + i * 300} y={760} s={0.55} D={false} floors={4 + (i % 3)} seed={`fa${i}`} c={['#e4d2b0', '#d8c0a0', '#e8dcc4'][i % 3]} />
            ))}
            <Haze k={0.35} />
          </>
        ),
      },
      {
        d: 700,
        el: (
          <>
            <Ground y={820} c="#9a8a78" seed="a1" />
            {Array.from({length: 7}, (_, i) => (
              <EuroApartment key={i} x={-500 + i * 420} y={840} s={0.95} floors={4 + (i % 2)} seed={`na${i}`} c={['#e4d2b0', '#d8c0a0', '#e8dcc4', '#d4bc98'][i % 4]} />
            ))}
          </>
        ),
      },
    ],
  }),

  cityPlaza1950s: (W, f) => ({
    actorD: 150,
    stage: {
      d: 320,
      ground: <Ground y={900} c="#c4b8a0" lines="tiles" seed="p2" />,
      props: [
        {z: 915, el: <Shop x={-120} y={915} s={1.05} sign="مقهى" seed="sh1" />},
        {z: 915, el: <Shop x={2020} y={915} s={1.05} sign="مكتبة" seed="sh2" c="#d4bc98" />},
        {z: 915, el: <Kiosk x={420} y={915} s={1} />},
        ...[260, 1580].map((x) => ({z: 916, el: <StreetLamp key={x} x={x} y={915} s={1.15} />})),
        ...[1300, 1760].map((x) => ({z: 915, el: <RoundTree key={x} x={x} y={915} h={260} />})),
      ],
    },
    layers: [
      {
        d: 1900,
        el: (
          <>
            {Array.from({length: 12}, (_, i) => (
              <EuroApartment key={i} x={-1200 + i * 330} y={740} s={0.5} D={false} floors={5 + (i % 3)} seed={`fp${i}`} />
            ))}
            <Haze k={0.4} />
          </>
        ),
      },
      {
        d: 900,
        el: (
          <>
            <Ground y={840} c="#a8a090" seed="p1" />
            <EuroApartment x={-250} y={860} s={1} floors={6} seed="pa1" />
            <GovBuilding x={900} y={860} s={0.95} />
            <EuroApartment x={2050} y={860} s={1} floors={6} seed="pa2" c="#d8c0a0" />
          </>
        ),
      },
    ],
  }),

  nileCountryside: (W, f) => ({
    actorD: 150,
    layers: [
      {
        d: 2300,
        el: (
          <>
            <Ridge id={`nc-r-${W.time}`} fn={(x) => 690 - 30 * Math.sin(x / 400) - 12 * Math.sin(x / 120)} top={atmos(tinted(W, '#c9a878'), W.P.haze, 0.4)} bottom={tinted(W, '#b8946a')} rim={W.P.rim} rimOpacity={0.4} />
          </>
        ),
      },
      {
        d: 1400,
        el: (
          <>
            <Water id={`nc-w-${W.time}`} top={740} frame={f} c1={W.P.water1} c2={W.P.water2} shine={W.P.rim} reflectX={W.sun[0]} />
            {[-300, 700, 1700].map((x, i) => (
              <Ship key={x} x={x + ((f * (0.6 + i * 0.2)) % 400)} y={770} s={0.35} frame={f + i * 9} hull={tinted(W, '#6a4a2a')} sail={tinted(W, '#f2ece0')} />
            ))}
            {scatter('ncp', 12, -1200, 3100, 0, 1).map((p, i) => (
              <PalmTree key={i} x={p.x} y={745} h={160 + p.r * 80} frame={f} seed={i} D={false} />
            ))}
          </>
        ),
      },
      {
        d: 650,
        el: (
          <>
            <Ground y={840} c="#6a8a3a" lines="grass" seed="n1" />
            {Array.from({length: 6}, (_, i) => (
              <rect key={i} x={-1300} y={850 + i * 14} width={4700} height={6} fill={shadeOf(W, '#6a8a3a', 0.15)} opacity={0.5} />
            ))}
            <MudHouse x={180} y={860} s={0.95} seed="m1" />
            <MudHouse x={1700} y={860} s={0.85} seed="m2" c="#a88058" />
            {[520, 1350, 2050].map((x, i) => (
              <PalmTree key={x} x={x} y={860} h={320} frame={f} seed={i + 3} />
            ))}
          </>
        ),
      },
      {
        d: 240,
        el: <Ground y={905} c="#a08460" lines="sand" seed="n2" />,
      },
      {
        d: -240,
        blur: 6,
        el: (
          <>
            {scatter('reed', 30, -900, 2800, 1060, 1120).map((g, i) => (
              <path key={i} d={`M ${g.x} 1250 Q ${g.x + 8 + Math.sin(f / 18 + g.p) * 10} ${g.y - 100} ${g.x + 22} ${g.y - 190 * (0.6 + g.r)}`} stroke={tinted(W, '#3a5a2a')} strokeWidth={7} fill="none" />
            ))}
          </>
        ),
      },
    ],
  }),

  desertPyramids: (W, f) => ({
    actorD: 150,
    layers: [
      {
        d: 1900,
        el: (
          <>
            <Ridge id={`dp-r-${W.time}`} fn={(x) => 760 - 20 * Math.sin(x / 300)} top={atmos(tinted(W, '#d9b878'), W.P.haze, 0.35)} bottom={tinted(W, '#c9a868')} />
            <Pyramid x={300} y={770} s={1.1} D={W.time !== 'night'} />
            <Pyramid x={1050} y={770} s={0.85} w={560} />
            <Pyramid x={1600} y={770} s={0.45} w={480} />
            <Haze k={0.22} />
          </>
        ),
      },
      {
        d: 900,
        el: (
          <>
            <Ridge id={`dp-d-${W.time}`} fn={(x) => 850 - 40 * Math.sin(x / 260 + 1) - 14 * Math.sin(x / 90)} top={tinted(W, '#e0c088')} bottom={tinted(W, '#c9a060')} rim={W.P.rim} rimOpacity={0.5} />
            {[1900, 2050, 2200].map((x, i) => (
              <PalmTree key={x} x={x} y={860} h={220 + i * 30} frame={f} seed={i} />
            ))}
          </>
        ),
      },
      {d: 260, el: <Ground y={905} c="#d4b078" lines="sand" seed="d1" />},
      {
        d: -220,
        el: (
          <>
            {scatter('rock', 8, -1000, 2900, 1070, 1110).map((r, i) => (
              <ellipse key={i} cx={r.x} cy={r.y} rx={70 + r.r * 90} ry={30 + r.r * 30} fill={shadeOf(W, '#a88050', 0.2)} stroke={INK} strokeWidth={4} />
            ))}
          </>
        ),
      },
    ],
  }),

  harbor: (W, f) => ({
    actorD: 150,
    layers: [
      {
        d: 2300,
        el: (
          <>
            <Water id={`hb-w-${W.time}`} top={720} frame={f} c1={W.P.water1} c2={W.P.water2} shine={W.P.rim} reflectX={W.sun[0]} />
            {[-400, 400, 1300].map((x, i) => (
              <Steamer key={x} id={`hb-s${i}-${W.time}`} x={x} y={745} s={0.3} hull={atmos(tinted(W, '#2a2a30'), W.P.haze, 0.3)} deck={atmos(tinted(W, '#d9d4c4'), W.P.haze, 0.3)} win={W.P.warm} frame={f} smoke={W.P.smoke} />
            ))}
          </>
        ),
      },
      {
        d: 1300,
        el: (
          <>
            <rect x={1400} y={770} width={1400} height={40} fill={tinted(W, '#8a8278')} stroke={INK} strokeWidth={4} />
            <Lighthouse x={1700} y={780} s={0.9} frame={f} />
            <Steamer id={`hb-big-${W.time}`} x={880} y={820} s={0.7} hull={tinted(W, '#2a2a30')} deck={tinted(W, '#d9d4c4')} win={W.P.warm} frame={f} smoke={W.P.smoke} />
          </>
        ),
      },
      {
        d: 600,
        el: (
          <>
            <Ground y={860} c="#8a8278" seed="h1" />
            {[-250, 300, 1600, 2150].map((x, i) => (
              <Warehouse key={x} x={x} y={870} s={0.9} c={['#9a6a4a', '#7a5a4a', '#a8784a', '#8a6a5a'][i]} />
            ))}
          </>
        ),
      },
      {
        d: 240,
        el: (
          <>
            <Ground y={905} c="#9a9288" lines="tiles" seed="h2" />
            {scatter('crates', 6, -300, 2200, 0, 1).map((c, i) => (
              <g key={i} stroke={INK} strokeWidth={4}>
                <rect x={c.x} y={850 - c.r * 20} width={90} height={70 + c.r * 20} fill={tinted(W, '#a87a4a')} />
                <path d={`M ${c.x} ${850 - c.r * 20} l 90 ${70 + c.r * 20} M ${c.x + 90} ${850 - c.r * 20} l -90 ${70 + c.r * 20}`} stroke={shadeOf(W, '#a87a4a', 0.4)} strokeWidth={3} />
              </g>
            ))}
          </>
        ),
      },
    ],
  }),

  palaceInterior: (W, f) => {
    // داخلي: لا سماء — جدار خلفي بنوافذ يدخل منها الضوء
    const wall = '#d9c4a0';
    return {
      actorD: 160,
      layers: [
        {
          d: 1200,
          el: (
            <>
              <rect x={-1400} y={-800} width={4700} height={2600} fill={tinted(W, wall)} />
              {Array.from({length: 9}, (_, i) => {
                const x = -700 + i * 400;
                return (
                  <g key={i}>
                    <path d={`M ${x} 760 L ${x} 380 Q ${x} 250 ${x + 110} 240 Q ${x + 220} 250 ${x + 220} 380 L ${x + 220} 760 Z`} fill={shadeOf(W, wall, 0.25)} stroke={INK} strokeWidth={4} />
                    <path d={`M ${x + 40} 640 L ${x + 40} 400 Q ${x + 40} 320 ${x + 110} 312 Q ${x + 180} 320 ${x + 180} 400 L ${x + 180} 640 Z`} fill={W.time === 'night' ? tinted(W, '#1a2040') : W.P.skyMid} stroke={INK} strokeWidth={4} />
                    {W.time !== 'night' && <path d={`M ${x + 40} 400 L ${x + 180} 400 L ${x + 420} 1100 L ${x + 120} 1100 Z`} fill={W.P.light} opacity={0.12} />}
                  </g>
                );
              })}
              <rect x={-1400} y={200} width={4700} height={20} fill={shadeOf(W, wall, 0.4)} />
            </>
          ),
        },
        {
          d: 600,
          el: (
            <>
              {Array.from({length: 8}, (_, i) => (
                <g key={i}>
                  <rect x={-560 + i * 440} y={180} width={60} height={720} fill={tinted(W, '#e8dcc4')} stroke={INK} strokeWidth={4} />
                  <rect x={-576 + i * 440} y={170} width={92} height={24} fill={tinted(W, '#c9a43a')} stroke={INK} strokeWidth={3} />
                  <rect x={-576 + i * 440} y={890} width={92} height={24} fill={tinted(W, '#c9a43a')} stroke={INK} strokeWidth={3} />
                  {/* قنديل معلق */}
                  <line x1={-310 + i * 440} y1={-100} x2={-310 + i * 440} y2={260} stroke={INK} strokeWidth={3} />
                  {W.lit > 0 && <ellipse cx={-310 + i * 440} cy={290} rx={110} ry={110} fill={W.P.warm} opacity={0.25 * Math.max(0.3, W.lit)} />}
                  <path d={`M ${-330 + i * 440} 260 L ${-290 + i * 440} 260 L ${-280 + i * 440} 310 L ${-310 + i * 440} 330 L ${-340 + i * 440} 310 Z`} fill={W.lit > 0 ? '#ffd27a' : tinted(W, '#c9a43a')} stroke={INK} strokeWidth={3} />
                </g>
              ))}
            </>
          ),
        },
        {
          d: 260,
          el: (
            <>
              <Ground y={900} c="#8a5a3a" lines="tiles" seed="pi" />
              <path d="M 300 905 L 1620 905 L 1900 1300 L 20 1300 Z" fill={tinted(W, '#8a1e2a')} stroke={INK} strokeWidth={4} />
              <path d="M 380 930 L 1540 930 L 1760 1260 L 160 1260 Z" fill="none" stroke={tinted(W, '#d9b13a')} strokeWidth={6} />
            </>
          ),
        },
        {
          d: -280,
          blur: 8,
          el: (
            <>
              <path d={`M -500 -200 Q -300 ${400 + Math.sin(f / 40) * 10} -380 1300 L -700 1300 L -700 -200 Z`} fill={tinted(W, '#6a1a2a')} />
              <path d={`M 2400 -200 Q 2200 ${400 + Math.sin(f / 40) * 10} 2280 1300 L 2600 1300 L 2600 -200 Z`} fill={tinted(W, '#6a1a2a')} />
            </>
          ),
        },
      ],
    };
  },

  militaryCamp: (W, f) => ({
    actorD: 150,
    stage: {
      d: 300,
      ground: <Ground y={900} c="#7a6a48" lines="sand" seed="mc2" />,
      props: [
        {z: 915, el: <Tent x={260} y={915} s={1.1} a={tinted(W, '#b3262c')} b={tinted(W, '#efe4cc')} />},
        {z: 915, el: <Tent x={1680} y={915} s={1.1} a={tinted(W, '#2f6f4a')} b={tinted(W, '#efe4cc')} />},
        {z: 916, el: <Campfire id={`mc-fire-${W.time}`} x={980} y={915} frame={f} s={0.9} smoke={W.P.smoke} warm={W.P.warm} />},
      ],
    },
    layers: [
      {
        d: 2000,
        el: (
          <>
            <Ridge id={`mc-r-${W.time}`} fn={(x) => 720 - 40 * Math.sin(x / 280)} top={atmos(tinted(W, '#6a5a4a'), W.P.haze, 0.35)} bottom={tinted(W, '#5a4a3a')} />
            {scatter('mct', 30, -1200, 3200, 0, 1).map((t, i) => (
              <path key={i} d={`M ${t.x - 20} ${730 + t.y * 20} L ${t.x} ${700 + t.y * 20} L ${t.x + 20} ${730 + t.y * 20} Z`} fill={atmos(tinted(W, '#e9dcc0'), W.P.haze, 0.4)} />
            ))}
            <Haze k={0.3} />
          </>
        ),
      },
      {
        d: 1000,
        el: (
          <>
            <Ground y={820} c="#6a5a3a" seed="mc1" />
            {scatter('mct2', 10, -900, 2800, 0, 1)
              .map((t, i) => ({...t, i, y: 830 + t.y * 40}))
              .sort((a, b) => a.y - b.y)
              .map((t) => (
                <Tent key={t.i} x={t.x} y={t.y} s={0.55 + t.r * 0.2} a={tinted(W, t.i % 3 ? '#b3262c' : '#2f6f4a')} b={tinted(W, '#e9dcc0')} />
              ))}
          </>
        ),
      },
    ],
  }),

  besiegedWalls: (W, f) => ({
    actorD: 150,
    layers: [
      {
        d: 2100,
        el: (
          <>
            <CityEpic id={`bw-city-${W.time}`} x={-300} base={700} s={0.7} fill={atmos(tinted(W, '#4a3e4e'), W.P.haze, 0.2)} back={atmos(tinted(W, '#4a3e4e'), W.P.haze, 0.45)} rim={W.P.rim} win={W.P.warm} frame={f} bloom={false} />
            {[100, 900, 1700].map((x, i) => (
              <Smoke key={x} id={`bw-sm${i}-${W.time}`} x={x} y={620} frame={f + i * 40} color={W.P.smoke} size={70} rise={800} drift={200} n={8} opacity={0.3} life={240} />
            ))}
          </>
        ),
      },
      {
        d: 1100,
        el: (
          <>
            <Ground y={800} c="#6a5a48" seed="bw1" />
            {[-600, 0, 600, 1800, 2400].map((x) => (
              <WallTower key={x} x={x} y={820} s={1} />
            ))}
            <CityGate x={1200} y={820} s={1} />
          </>
        ),
      },
      {
        d: 300,
        el: (
          <>
            <Ground y={900} c="#5a4a38" lines="sand" seed="bw2" />
            <Bombard x={1650} y={905} s={0.7} rim={W.P.rim} />
            {Array.from({length: 18}, (_, i) => (
              <rect key={i} x={-400 + i * 30} y={830} width={16} height={80} fill={tinted(W, '#6a4a2a')} stroke={INK} strokeWidth={3} transform={`rotate(${-6 + (i % 3) * 4} ${-392 + i * 30} 910)`} />
            ))}
          </>
        ),
      },
      {
        d: -250,
        blur: 9,
        opacity: 0.55,
        el: <MistBand id={`bw-mist-${W.time}`} frame={f} y={980} color={W.P.smoke} speed={0.8} />,
      },
    ],
  }),
};

/** خلفية جاهزة — الشخصيات (children) تُرسم على طبقة الممثلين بين الوسط والمقدمة */
export const Backdrop: React.FC<{name: BackdropName; time: TimeOfDay; cam?: Cam; frame?: number; children?: React.ReactNode; grade?: boolean}> = ({
  name,
  time,
  cam = CAM0,
  frame,
  children,
  grade = true,
}) => {
  const cf = useCurrentFrame();
  const f = frame ?? cf;
  const W = worldFor(time);
  const def = DEFS[name](W, f);
  const indoor = name === 'palaceInterior';
  return (
    <WorldCtx.Provider value={W}>
      <Sky background={`linear-gradient(${W.P.skyTop} 0%, ${W.P.skyMid} 55%, ${W.P.horizon} 100%)`} />
      <Stage cam={cam}>
        {!indoor && (
          <Layer d={3000}>
            <Art>
              <SkyLayer f={f} />
            </Art>
          </Layer>
        )}
        {def.layers.map((l, i) => (
          <Layer key={i} d={l.d} blur={l.blur} opacity={l.opacity}>
            <Art>{l.el}</Art>
          </Layer>
        ))}
        {def.stage ? (
          <Layer d={def.stage.d}>
            <Art>
              {def.stage.ground}
              <DepthSort frame={f}>
                {def.stage.props.map((p, i) => (
                  <Sorted key={`p${i}`} z={p.z}>
                    {p.el}
                  </Sorted>
                ))}
                {children}
              </DepthSort>
            </Art>
          </Layer>
        ) : (
          children && (
            <Layer d={def.actorD}>
              <Art>
                <DepthSort frame={f}>{children}</DepthSort>
              </Art>
            </Layer>
          )
        )}
        <Layer d={-320} blur={3}>
          <Art>
            <Motes id={`bd-m-${name}-${time}`} frame={f} x0={-600} x1={2500} y0={150} y1={1000} color={W.P.light} n={18} size={2.6} />
          </Art>
        </Layer>
      </Stage>
      {grade && <ColorGrade p={W.P} lightAt={[(W.sun[0] / 1920) * 100, (W.sun[1] / 1080) * 100]} lightStrength={time === 'night' ? 0.12 : 0.18} />}
    </WorldCtx.Provider>
  );
};

export const BACKDROPS = Object.keys(DEFS) as BackdropName[];
