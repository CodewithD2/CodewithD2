import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CharLight} from '../../characters/light';
import {Candle} from './tableProps';
import {ColorGrade, Embers, Halo, Motes} from '../../lib/fx';
import type {Palette} from '../../lib/palette';
import {Art, Cam, Layer, Sky} from '../../lib/stage';
import {INK, scatter} from '../../lib/util';
import {Fleur, Floor3D, FloorTiles, HangingBanner, LIGHTS, LitStage, Masonry, PALACE_DAY, Rays, ROYAL, SoftFilm, gy, mix} from './stage3d';

/* =====================================================================
 * أطقم أماكن جان دارك (2.5D): مسرح مخملي، كاتدرائية، غرفة حجرية
 * كل طقم ثلاث مراحل رسم منفصلة: خلفية ← أرضية بمنظور ← عناصر وممثلون
 * (الفصل ضروري حتى لا تتقاطع الأرضية المائلة مع الطبقات العمودية).
 * ===================================================================== */

/* ---------------- المسرح المخملي ---------------- */
export const CurtainStage: React.FC<{
  id: string;
  f: number;
  cam: Cam;
  c: string;
  dark: string;
  glow?: string;
  light?: CharLight;
  palette?: Palette;
  rays?: number;
  raysColor?: string;
  floorA?: string;
  floorB?: string;
  vignette?: number;
  children: React.ReactNode;
}> = ({id, f, cam, c, dark, glow = '#ffd48a', light = LIGHTS.palace, palette = PALACE_DAY, rays = 0, raysColor = '#ffe6a0', floorA = '#4a2a2a', floorB = '#56322e', vignette = 0.42, children}) => (
  <>
    <Sky background={dark} />
    <LitStage cam={cam} light={light}>
      <Layer d={1300}>
        <Art>
          <defs>
            <linearGradient id={`${id}vf`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={dark} />
              <stop offset="40%" stopColor={c} />
              <stop offset="60%" stopColor={mix(c, '#ffb0b0', 0.16)} />
              <stop offset="100%" stopColor={dark} />
            </linearGradient>
          </defs>
          {Array.from({length: 30}, (_, i) => (
            <path key={i} d={`M ${-1400 + i * 158} -800 q ${Math.sin(f / 30 + i) * 12} 900 0 2500 L ${-1400 + (i + 1) * 158} 1700 q ${Math.sin(f / 30 + i + 1) * 12} -900 0 -2500 Z`} fill={`url(#${id}vf)`} />
          ))}
          {rays > 0 && <Rays cx={960} cy={500} rot={f * 0.6} color={raysColor} opacity={rays} n={14} />}
          <Halo id={`${id}h`} cx={960} cy={420} r={1000} color={glow} opacity={0.36} />
        </Art>
      </Layer>
      <Layer d={720}>
        <Art>
          {Array.from({length: 7}, (_, i) => (
            <g key={i} transform={`translate(${-640 + i * 530} -60)`}>
              <path d="M -290 -300 L 290 -300 L 265 40 Q 0 250 -265 40 Z" fill={c} stroke={INK} strokeWidth={6} />
              <path d="M -200 -60 Q 0 120 200 -60 M -220 10 Q 0 190 220 10" fill="none" stroke={dark} strokeWidth={16} opacity={0.6} />
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
    <LitStage cam={cam} light={light}>
      <Floor3D d0={-470} d1={1300}>{(len) => <FloorTiles id={`${id}fl`} len={len} a={floorA} b={floorB} line={mix(floorA, '#000000', 0.5)} size={200} far={glow} near="#0c0408" />}</Floor3D>
    </LitStage>
    <LitStage cam={cam} light={light}>
      {children}
      <Layer d={-200}>
        <Art>
          <Motes id={`${id}m`} frame={f} x0={-100} x1={2000} y0={40} y1={1000} color="#ffe6b0" n={26} size={3} />
        </Art>
      </Layer>
    </LitStage>
    <ColorGrade p={palette} lightAt={[50, 34]} lightStrength={0.2} />
    <SoftFilm frame={f} strength={vignette} />
  </>
);

/** منصة دائرية ذهبية مع مخروط ضوء (الأصل: مركز سطحها) */
export const Podium: React.FC<{x: number; y: number; w?: number; on?: number; c?: string; beam?: string}> = ({x, y, w = 220, on = 1, c = '#a82a3a', beam = '#fff0c0'}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M -80 -1300 L 80 -1300 L ${w * 1.25} 20 L ${-w * 1.25} 20 Z`} fill={beam} opacity={0.15 * on} />
    <ellipse cx={0} cy={54} rx={w * 1.15} ry={46} fill="#000" opacity={0.4} />
    <path d={`M ${-w} 0 L ${-w} 42 Q 0 ${42 + w * 0.3} ${w} 42 L ${w} 0 Z`} fill={mix('#b8862a', '#3a2c20', 1 - on)} stroke={INK} strokeWidth={6} />
    <ellipse cx={0} cy={0} rx={w} ry={w * 0.2} fill={mix('#f0c860', '#5a4630', 1 - on)} stroke={INK} strokeWidth={6} />
    <ellipse cx={0} cy={0} rx={w * 0.84} ry={w * 0.155} fill={mix(c, '#2a1418', 1 - on)} stroke={INK} strokeWidth={4} />
  </g>
);

/* ---------------- كاتدرائية قوطية ---------------- */
const NAVE: Palette = {
  ...PALACE_DAY,
  haze: '#b8a8b4',
  near: '#2a2030',
  rim: '#ffe8c0',
  light: '#ffe6c0',
  gradeTop: '#ffd0a0',
  gradeBottom: '#2a1a3a',
  gradeOpacity: 0.3,
};

const NavePillar: React.FC<{id: string; x: number; by: number; w: number; tint: number}> = ({id, x, by, w, tint}) => {
  const T = (c: string) => mix(c, '#a898a8', tint);
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={T('#8c7c78')} />
          <stop offset="35%" stopColor={T('#e6d8c4')} />
          <stop offset="70%" stopColor={T('#b4a294')} />
          <stop offset="100%" stopColor={T('#6a5a60')} />
        </linearGradient>
      </defs>
      <ellipse cx={x} cy={by} rx={w * 1.1} ry={w * 0.2} fill="#000" opacity={0.35} />
      <rect x={x - w / 2} y={-900} width={w} height={by + 900} fill={`url(#${id})`} stroke={INK} strokeWidth={5} />
      <g stroke={T('#7a6a68')} strokeWidth={4} opacity={0.7}>
        <line x1={x - w * 0.2} x2={x - w * 0.2} y1={-900} y2={by - 50} />
        <line x1={x + w * 0.16} x2={x + w * 0.16} y1={-900} y2={by - 50} />
      </g>
      <rect x={x - w * 0.66} y={by - 56} width={w * 1.32} height={30} fill={T('#c8b8a4')} stroke={INK} strokeWidth={5} />
      <rect x={x - w * 0.78} y={by - 28} width={w * 1.56} height={32} fill={T('#a89684')} stroke={INK} strokeWidth={5} />
    </g>
  );
};

/** نافذة وردية كبيرة */
const RoseWindow: React.FC<{cx: number; cy: number; r: number; f: number}> = ({cx, cy, r, f}) => (
  <g transform={`translate(${cx} ${cy})`}>
    <circle r={r * 1.14} fill="#6a5a62" stroke={INK} strokeWidth={6} />
    <circle r={r} fill="#fff0c8" />
    {Array.from({length: 12}, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return (
        <g key={i}>
          <circle cx={Math.cos(a) * r * 0.72} cy={Math.sin(a) * r * 0.72} r={r * 0.2} fill={['#d8384a', '#3a6ad0', '#f2c43a', '#3a9a6a'][i % 4]} opacity={0.82 + 0.16 * Math.sin(f / 20 + i)} stroke="#3a2a34" strokeWidth={5} />
          <line x1={0} y1={0} x2={Math.cos(a + Math.PI / 12) * r} y2={Math.sin(a + Math.PI / 12) * r} stroke="#3a2a34" strokeWidth={6} />
        </g>
      );
    })}
    {Array.from({length: 8}, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return <circle key={i} cx={Math.cos(a) * r * 0.36} cy={Math.sin(a) * r * 0.36} r={r * 0.12} fill={i % 2 ? '#e86a5a' : '#5a8ae0'} stroke="#3a2a34" strokeWidth={4} />;
    })}
    <circle r={r * 0.2} fill="#f2c43a" stroke="#3a2a34" strokeWidth={6} />
    <circle r={r} fill="none" stroke="#3a2a34" strokeWidth={9} />
  </g>
);

const NaveBack: React.FC<{id: string; f: number; bannerL: [string, string]; bannerR: [string, string]}> = ({id, f, bannerL, bannerR}) => (
  <>
    <Layer d={1900}>
      <Art>
        <Masonry seed={`${id}nb`} x={360} y={-300} w={1200} h={1100} bw={90} rh={44} base="#9a8a94" alt="#a898a0" line="#7a6a78" />
        <Halo id={`${id}rh`} cx={960} cy={330} r={620} color="#ffe6b0" opacity={0.8} />
        <RoseWindow cx={960} cy={330} r={150} f={f} />
        {[760, 1160].map((x) => (
          <path key={x} d={`M ${x - 40} 690 L ${x - 40} 530 Q ${x} 460 ${x + 40} 530 L ${x + 40} 690 Z`} fill="#ffe8b8" stroke={INK} strokeWidth={5} />
        ))}
        {/* مذبح وصليب */}
        <rect x={860} y={650} width={200} height={70} fill="#f2e6cc" stroke={INK} strokeWidth={4} />
        <rect x={850} y={640} width={220} height={16} fill="#e8b830" stroke={INK} strokeWidth={4} />
        <path d="M 960 636 L 960 560 M 936 584 L 984 584" stroke={INK} strokeWidth={15} strokeLinecap="round" />
        <path d="M 960 636 L 960 560 M 936 584 L 984 584" stroke="#e8b830" strokeWidth={8} strokeLinecap="round" />
      </Art>
    </Layer>
    {[
      [1500, 300, 60, 0.5],
      [1120, 370, 76, 0.32],
      [760, 460, 96, 0.16],
    ].map(([d, off, w, tint], i) => (
      <Layer key={d} d={d}>
        <Art>
          {/* عقد مدبّب يصل العمودين فوق الكادر */}
          <path d={`M ${960 - off} 190 Q ${960 - off * 0.82} -60 960 -190 Q ${960 + off * 0.82} -60 ${960 + off} 190 L ${960 + off + w * 0.5} 190 Q ${960 + off * 0.95} -160 960 -320 Q ${960 - off * 0.95} -160 ${960 - off - w * 0.5} 190 Z`} fill={mix('#b4a294', '#a898a8', tint)} stroke={INK} strokeWidth={5} />
          {/* جدار جانبي بنوافذ ضيقة بين الأعمدة */}
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`translate(${960 + sd * (off + 230)} 0)`}>
              <rect x={-230} y={-700} width={460} height={700 + gy(d)} fill={mix('#8a7a82', '#a898a8', tint)} />
              <path d="M -50 470 L -50 190 Q 0 90 50 190 L 50 470 Z" fill="#cfe2f0" stroke={INK} strokeWidth={5} />
              <path d="M 0 120 L 0 470 M -50 290 L 50 290 M -50 380 L 50 380" stroke={INK} strokeWidth={3.5} />
              <path d="M -46 466 L -46 300 L 46 300 L 46 466 Z" fill={sd < 0 ? '#5a8ae0' : '#e86a5a'} opacity={0.25} />
            </g>
          ))}
          <NavePillar id={`${id}p${i}a`} x={960 - off} by={gy(d)} w={w} tint={tint} />
          <NavePillar id={`${id}p${i}b`} x={960 + off} by={gy(d)} w={w} tint={tint} />
          {i > 0 && (
            <>
              <HangingBanner id={`${id}bl${i}`} x={960 - off} y={170 - i * 10} w={w * 1.05} h={250} frame={f + i * 9} c={bannerL[0]} dark={bannerL[1]} />
              <HangingBanner id={`${id}br${i}`} x={960 + off} y={170 - i * 10} w={w * 1.05} h={250} frame={f + i * 13} c={bannerR[0]} dark={bannerR[1]} seed={2} />
            </>
          )}
        </Art>
      </Layer>
    ))}
  </>
);

export const Cathedral: React.FC<{
  id: string;
  f: number;
  cam: Cam;
  bannerL?: [string, string];
  bannerR?: [string, string];
  light?: CharLight;
  /** 0..1 تحوّل الجو إلى عتمة درامية */
  gloom?: number;
  children: React.ReactNode;
}> = ({id, f, cam, bannerL = ['#2a55a8', '#152c66'], bannerR = ['#c8242e', '#6e0f18'], light = LIGHTS.palace, gloom = 0, children}) => (
  <>
    <AbsoluteFill style={{background: '#3a2e3c'}} />
    <LitStage cam={cam} light={light}>
      <NaveBack id={id} f={f} bannerL={bannerL} bannerR={bannerR} />
    </LitStage>
    <LitStage cam={cam} light={light}>
      <Floor3D d0={-470} d1={1900}>
        {(len) => (
          <g>
            <FloorTiles id={`${id}fl`} len={len} a="#b8a698" b="#8c7a7c" line="#6a5a60" size={180} far="#ffe2b0" near="#1e1428" />
            <rect x={790} y={0} width={340} height={len} fill="#7a1c34" />
            <rect x={790} y={0} width={14} height={len} fill="#e8b830" />
            <rect x={1116} y={0} width={14} height={len} fill="#e8b830" />
            {/* بقع زجاج ملوّن على الأرض */}
            {scatter(`${id}gl`, 16, 100, 1800, len * 0.3, len * 0.9).map((p, i) => (
              <ellipse key={i} cx={p.x} cy={p.y} rx={60 + p.r * 70} ry={34 + p.r * 30} fill={['#e86a5a', '#5a8ae0', '#f2c43a', '#6ab87a'][i % 4]} opacity={0.22} />
            ))}
          </g>
        )}
      </Floor3D>
    </LitStage>
    <LitStage cam={cam} light={light}>
      {/* أعمدة قريبة جانبية */}
      <Layer d={420}>
        <Art>
          <NavePillar id={`${id}q1`} x={250} by={gy(420)} w={126} tint={0.04} />
          <NavePillar id={`${id}q2`} x={1670} by={gy(420)} w={126} tint={0.04} />
          <HangingBanner id={`${id}b1`} x={250} y={120} w={140} h={330} frame={f} c={bannerL[0]} dark={bannerL[1]} />
          <HangingBanner id={`${id}b2`} x={1670} y={120} w={140} h={330} frame={f} c={bannerR[0]} dark={bannerR[1]} seed={3} />
        </Art>
      </Layer>
      {/* أشعة من النافذة الوردية */}
      <Layer d={340}>
        <Art>
          <defs>
            <linearGradient id={`${id}sh`} x1="0.5" x2="0.5" y1="0" y2="1">
              <stop offset="0%" stopColor="#fff0c8" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#fff0c8" stopOpacity={0} />
            </linearGradient>
          </defs>
          {[-2, -1, 0, 1, 2].map((k) => (
            <path key={k} d={`M ${930 + k * 24} 200 L ${980 + k * 24} 200 L ${1080 + k * 330} 960 L ${840 + k * 330} 960 Z`} fill={`url(#${id}sh)`} opacity={(0.35 + 0.15 * Math.sin(f / 26 + k * 2)) * (1 - gloom * 0.6)} />
          ))}
        </Art>
      </Layer>
      {children}
      <Layer d={-60}>
        <Art>
          <Motes id={`${id}m`} frame={f} x0={-200} x1={2100} y0={60} y1={900} color="#fff0c8" n={36} size={2.6} />
        </Art>
      </Layer>
      <Layer d={-330} blur={9}>
        <Art>
          <Candle id={`${id}ca`} x={-120} y={1180} s={1.9} frame={f} warm="#ffb860" />
          <Candle id={`${id}cb`} x={2050} y={1200} s={2.0} frame={f + 14} warm="#ffb860" />
        </Art>
      </Layer>
    </LitStage>
    <ColorGrade p={{...NAVE, gradeTop: mix(NAVE.gradeTop, '#6a5ac0', gloom), gradeBottom: mix(NAVE.gradeBottom, '#100a28', gloom), gradeOpacity: 0.3 + gloom * 0.25}} lightAt={[50, 28]} lightStrength={0.2 * (1 - gloom * 0.5)} />
    <SoftFilm frame={f} strength={0.34 + gloom * 0.25} />
  </>
);

/* ---------------- غرفة حجرية (الدوفين) — غضب أحمر أو كآبة ممطرة ---------------- */
export const StoneChamber: React.FC<{id: string; f: number; cam: Cam; rage: number; children: React.ReactNode}> = ({id, f, cam, rage, children}) => {
  const wallA = mix('#7c7a8a', '#8c2a2a', rage * 0.75);
  const wallB = mix('#8a8898', '#a83a30', rage * 0.75);
  const line = mix('#56546a', '#5a1418', rage);
  const light: CharLight = rage > 0.5 ? {dir: -1, key: '#ffb060', shadow: '#5a1020', ambient: 0.1, rim: 1} : {dir: -1, key: '#c8d8f0', shadow: '#2e3050', ambient: 0.14, rim: 0.6};
  return (
    <>
      <AbsoluteFill style={{background: line}} />
      <LitStage cam={cam} light={light}>
        <Layer d={1000}>
          <Art>
            <Masonry seed={`${id}w`} x={-500} y={-500} w={2920} h={1360} bw={150} rh={76} base={wallA} alt={wallB} line={line} />
            {/* نافذة ممطرة */}
            {[470, 1450].map((x, k) => (
              <g key={x}>
                <path d={`M ${x - 96} 560 L ${x - 96} 250 Q ${x} 110 ${x + 96} 250 L ${x + 96} 560 Z`} fill={mix('#8fa4c0', '#5a1420', rage)} stroke={INK} strokeWidth={8} />
                <g stroke="#dce8f8" strokeWidth={3} opacity={0.5 * (1 - rage)}>
                  {scatter(`${id}r${k}`, 26, x - 86, x + 86, 0, 360).map((p, i) => {
                    const y = 190 + ((p.y + f * 13) % 360);
                    return <line key={i} x1={p.x} y1={y} x2={p.x - 5} y2={y + 24} />;
                  })}
                </g>
                <path d={`M ${x} 150 L ${x} 560 M ${x - 96} 330 L ${x + 96} 330 M ${x - 96} 450 L ${x + 96} 450`} stroke={INK} strokeWidth={6} />
                <path d={`M ${x - 96} 560 L ${x - 96} 250 Q ${x} 110 ${x + 96} 250 L ${x + 96} 560`} fill="none" stroke={mix('#9a98a8', '#a84a3a', rage)} strokeWidth={20} opacity={0.6} />
              </g>
            ))}
            <HangingBanner id={`${id}b`} x={960} y={70} w={190} h={460} frame={f} />
          </Art>
        </Layer>
        {rage > 0.02 && (
          <Layer d={820}>
            <Art>
              <g opacity={rage}>
                <Rays cx={960} cy={540} rot={f * 1.1} color="#ffd447" alt="#ff4d3a" opacity={0.4} n={18} />
                <Halo id={`${id}rh`} cx={960} cy={540} r={800} color="#ff8a3c" opacity={0.55} />
              </g>
            </Art>
          </Layer>
        )}
      </LitStage>
      <LitStage cam={cam} light={light}>
        <Floor3D d0={-470} d1={1000}>{(len) => <FloorTiles id={`${id}fl`} len={len} a={mix('#6a6878', '#6a2424', rage)} b={mix('#5c5a6c', '#5a1a1c', rage)} line={line} size={180} far={mix('#c8d4ea', '#ff9a4a', rage)} near="#0e0c1c" />}</Floor3D>
      </LitStage>
      <LitStage cam={cam} light={light}>
        <Layer d={520}>
          <Art>
            {[110, 1810].map((x) => (
              <g key={x} stroke={INK} strokeWidth={5}>
                <rect x={x - 60} y={-600} width={120} height={600 + gy(520)} fill={mix('#8e8c9c', '#9a3a34', rage * 0.8)} />
                <rect x={x + 10} y={-600} width={50} height={600 + gy(520)} fill="#000" opacity={0.28} stroke="none" />
                <rect x={x - 82} y={gy(520) - 40} width={164} height={44} fill={mix('#7a788a', '#7a2a2a', rage * 0.8)} />
              </g>
            ))}
          </Art>
        </Layer>
        {children}
        {rage > 0.05 && (
          <Layer d={-120}>
            <Art>
              <g opacity={rage}>
                <Embers id={`${id}e`} x={960} y={1120} frame={f * 1.4} n={44} spread={1900} rise={1050} size={6} life={56} wind={50} />
              </g>
            </Art>
          </Layer>
        )}
        <Layer d={-330} blur={9}>
          <Art>
            <Candle id={`${id}c`} x={2010} y={1200} s={1.9} frame={f} warm="#ffb860" />
          </Art>
        </Layer>
      </LitStage>
      <ColorGrade
        p={{...ROYAL, gradeTop: mix('#8a9ac8', '#ff8a4a', rage), gradeBottom: mix('#1a1c3a', '#4a0814', rage), light: mix('#dce6f8', '#ffd08a', rage), gradeOpacity: 0.34}}
        lightAt={[26, 26]}
        lightStrength={0.16}
      />
      <SoftFilm frame={f} strength={0.4} />
    </>
  );
};

/** لوحة إطار ذهبي سميكة */
export const GoldFrame: React.FC<{w: number; h: number; inner?: string; children?: React.ReactNode}> = ({w, h, inner = '#fffaec', children}) => (
  <g>
    <rect x={-w / 2 + 16} y={-h / 2 + 26} width={w} height={h} rx={30} fill="#000" opacity={0.4} />
    <rect x={-w / 2} y={-h / 2 + 14} width={w} height={h} rx={30} fill="#7a5414" stroke={INK} strokeWidth={8} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={30} fill="#d9a82e" stroke={INK} strokeWidth={8} />
    <rect x={-w / 2 + 14} y={-h / 2 + 12} width={w - 28} height={30} rx={14} fill="#fff0b8" opacity={0.45} />
    <rect x={-w / 2 + 38} y={-h / 2 + 38} width={w - 76} height={h - 76} rx={16} fill={inner} stroke={INK} strokeWidth={6} />
    {[-1, 1].map((a) => [-1, 1].map((b) => <Fleur key={`${a}${b}`} x={a * (w / 2 - 24)} y={b * (h / 2 - 24)} s={0.36} fill="#fff0b8" />))}
    {children}
  </g>
);

/** لوحة اسم صغيرة سميكة */
export const NamePlate: React.FC<{x: number; y: number; text: string; color: string; fs?: number; w?: number}> = ({x, y, text, color, fs = 36, w}) => {
  const ww = w ?? text.length * fs * 0.48 + 60;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-ww / 2 + 5} y={-fs * 0.78 + 9} width={ww} height={fs * 1.62} rx={14} fill="#000" opacity={0.35} />
      <rect x={-ww / 2} y={-fs * 0.78 + 6} width={ww} height={fs * 1.62} rx={14} fill={mix(color, '#000000', 0.35)} stroke={INK} strokeWidth={5} />
      <rect x={-ww / 2} y={-fs * 0.78} width={ww} height={fs * 1.62} rx={14} fill="#fdfaf2" stroke={INK} strokeWidth={5} />
      <text x={0} y={fs * 0.4} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={fs} fill={color} direction="rtl">
        {text}
      </text>
    </g>
  );
};

/** مطر مائل حتمي */
export const Rain: React.FC<{id: string; f: number; n: number; len: number; w: number; speed: number; op: number; color?: string}> = ({id, f, n, len, w, speed, op, color = '#d6e4f4'}) => (
  <g stroke={color} strokeWidth={w} strokeLinecap="round" opacity={op}>
    {scatter(`rain-${id}`, n, -400, 2500, 0, 1600).map((p, i) => {
      const y = ((p.y + f * speed * (0.8 + p.r * 0.4)) % 1600) - 250;
      const x = p.x - y * 0.16;
      return <line key={i} x1={x} y1={y} x2={x - len * 0.16} y2={y + len} />;
    })}
  </g>
);
