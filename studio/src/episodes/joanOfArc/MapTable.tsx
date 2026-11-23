import React from 'react';
import {Img, staticFile} from 'remotion';
import {Candle, TableWood} from './tableProps';
import {Cam, Layer} from '../../lib/stage';
import {Motes} from '../../lib/fx';
import {Art} from '../../lib/stage';
import {INK} from '../../lib/util';
import {CountryCode, EUROPE_COUNTRIES, EUROPE_RIVERS, LonLat} from '../../world/maps/europeData';
import {MapProj, RealEuropeMap, TerritoryOverlay, makeProjection} from '../../world/maps/MapEngine';
import {LIGHTS, LitStage, WAR_TABLE, mix, projectWorld} from './stage3d';

/* =====================================================================
 * «طاولة الحرب»: الخريطة الحقيقية كورقة على طاولة خشب مائلة بمنظور حقيقي.
 * فرنسا وإنجلترا مجسّمتان بارتفاع، والمدن والشخصيات مجسّمات واقفة فوقها.
 * الإسقاط ثابت؛ الحركة كلها بالكاميرا (فتبقى الخريطة مخبأة لا يُعاد رسمها).
 * ===================================================================== */

export const THETA = 27;
const MAP_W = 2560;
const MAP_H = 1640;
const OX = (1920 - MAP_W) / 2;
const OY = (1080 - MAP_H) / 2;
const PLANE_Z = -40;
/** ارتفاع الأرض المجسّمة فوق سطح الورقة */
export const LAND_Z = 20;

const RAISED: CountryCode[] = ['GBR', 'FRA'];

const vb = `${OX} ${OY} ${MAP_W} ${MAP_H}`;
const sheet: React.CSSProperties = {position: 'absolute', left: OX, top: OY, width: MAP_W, height: MAP_H};

/** الورقة الأساسية + الطاولة (ثابتة) */
const BaseSheet: React.FC<{center: LonLat; zoom: number; sides: Partial<Record<CountryCode, string>>}> = React.memo(({center, zoom, sides}) => (
  <>
    <div style={{position: 'absolute', left: -2600, top: -2000, width: 7120, height: 4200, transform: 'translateZ(-10px)'}}>
      <TableWood w={7120} h={4200} />
    </div>
    <div style={{...sheet, boxShadow: '0 26px 60px rgba(0,0,0,0.65)', background: '#e8d6ac'}}>
      <RealEuropeMap center={center} zoom={zoom} width={MAP_W} height={MAP_H} countryColors={sides} seaColor="#93bfd0" landColor="#e9d8b2" showRivers={false} />
      <Img src={staticFile('joan/tex/paper.png')} style={{position: 'absolute', left: 0, top: 0, width: MAP_W, height: MAP_H, opacity: 0.55}} />
      <svg width={MAP_W} height={MAP_H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="jmEdge" cx="50%" cy="50%" r="72%">
            <stop offset="62%" stopColor="#5a3818" stopOpacity={0} />
            <stop offset="100%" stopColor="#4a2a10" stopOpacity={0.62} />
          </radialGradient>
        </defs>
        <rect width={MAP_W} height={MAP_H} fill="url(#jmEdge)" />
        <rect x={22} y={22} width={MAP_W - 44} height={MAP_H - 44} fill="none" stroke="#6b4420" strokeWidth={14} />
        <rect x={44} y={44} width={MAP_W - 88} height={MAP_H - 88} fill="none" stroke="#c9a04a" strokeWidth={6} />
        <rect x={58} y={58} width={MAP_W - 116} height={MAP_H - 116} fill="none" stroke="#6b4420" strokeWidth={3} strokeDasharray="34 20" />
        {/* وردة البوصلة */}
        <g transform="translate(330 1010)" opacity={0.75}>
          <circle r={118} fill="none" stroke="#6b4420" strokeWidth={4} />
          <circle r={100} fill="none" stroke="#6b4420" strokeWidth={2} strokeDasharray="8 10" />
          {Array.from({length: 8}, (_, i) => (
            <g key={i} transform={`rotate(${i * 45})`}>
              <path d={`M 0 ${i % 2 ? -78 : -138} L 15 -16 L 0 0 Z`} fill="#7b3a20" />
              <path d={`M 0 ${i % 2 ? -78 : -138} L -15 -16 L 0 0 Z`} fill="#d9b060" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  </>
));

/** حواف الأرض المجسّمة (جوانب داكنة متراكبة) */
const LandSides: React.FC<{proj: MapProj; sides: Partial<Record<CountryCode, string>>}> = React.memo(({proj, sides}) => (
  <>
    {[5, 10, 15].map((z) => (
      <div key={z} style={{...sheet, transform: `translateZ(${z}px)`}}>
        <svg width={MAP_W} height={MAP_H} viewBox={vb}>
          {RAISED.map((c) =>
            (EUROPE_COUNTRIES[c] ?? []).map((poly, i) => (
              <path key={`${c}${i}`} d={proj.pathOf(poly, true)} fill={sides[c]} stroke={mix(sides[c] ?? '#333333', '#000000', 0.35)} strokeWidth={3} strokeLinejoin="round" />
            )),
          )}
        </svg>
      </div>
    ))}
  </>
));

/** مسار قصّ خامة التضاريس بحدود فرنسا وبريطانيا (بإحداثيات الورقة) */
const landClipCache = new WeakMap<MapProj, string>();
const landClip = (proj: MapProj) => {
  const hit = landClipCache.get(proj);
  if (hit) return hit;
  let d = '';
  for (const c of RAISED)
    for (const poly of EUROPE_COUNTRIES[c] ?? [])
      d += poly.map((p, i) => { const [x, y] = proj.toXY(p); return `${i ? 'L' : 'M'}${(x - OX).toFixed(1)} ${(y - OY).toFixed(1)}`; }).join(' ') + ' Z ';
  landClipCache.set(proj, d);
  return d;
};

/** وجه الأرض المجسّمة: لون + تضاريس + مناطق السيطرة + أنهار */
const LandTop: React.FC<{proj: MapProj; colors: Partial<Record<CountryCode, string>>; territories: TerritoryOverlay[]; river?: string; id: string}> = ({proj, colors, territories, river, id}) => (
  <div style={{...sheet, transform: `translateZ(${LAND_Z}px)`}}>
    <svg width={MAP_W} height={MAP_H} viewBox={vb}>
      <defs>
        {RAISED.map((c) => (
          <clipPath key={c} id={`jmc-${c}-${id}`}>
            {(EUROPE_COUNTRIES[c] ?? []).map((poly, i) => (
              <path key={i} d={proj.pathOf(poly, true)} />
            ))}
          </clipPath>
        ))}
        <linearGradient id={`jmLit-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff4d0" stopOpacity={0.34} />
          <stop offset="45%" stopColor="#fff4d0" stopOpacity={0} />
          <stop offset="100%" stopColor="#1a1030" stopOpacity={0.34} />
        </linearGradient>
      </defs>
      {RAISED.map((c) => (
        <g key={c}>
          {(EUROPE_COUNTRIES[c] ?? []).map((poly, i) => (
            <path key={i} d={proj.pathOf(poly, true)} fill={colors[c]} />
          ))}
        </g>
      ))}
      {territories.map((t) => (
        <g key={t.id} clipPath={t.clipTo ? `url(#jmc-${t.clipTo}-${id})` : undefined}>
          <path d={proj.pathOf(t.polygon, true)} fill={t.fill} fillOpacity={t.opacity ?? 0.9} stroke="#2b1e1a" strokeWidth={3} strokeDasharray="9 6" strokeOpacity={t.opacity ?? 1} />
        </g>
      ))}
      {RAISED.map((c) => (
        <g key={`r${c}`} clipPath={`url(#jmc-${c}-${id})`}>
          {Object.entries(EUROPE_RIVERS).map(([name, lines]) => (
            <g key={name} fill="none" strokeLinecap="round" strokeLinejoin="round">
              {lines.map((ln, i) => (
                <path key={i} d={proj.pathOf(ln, false)} stroke={river === name ? '#58b4f4' : '#7ec0e0'} strokeWidth={river === name ? 7 : 3.4} opacity={river === name ? 0.95 : 0.55} />
              ))}
            </g>
          ))}
          <rect x={OX} y={OY} width={MAP_W} height={MAP_H} fill={`url(#jmLit-${id})`} />
        </g>
      ))}
      {RAISED.map((c) =>
        (EUROPE_COUNTRIES[c] ?? []).map((poly, i) => (
          <g key={`o${c}${i}`}>
            <path d={proj.pathOf(poly, true)} fill="none" stroke="#fff0c8" strokeWidth={9} opacity={0.22} clipPath={`url(#jmc-${c}-${id})`} />
            <path d={proj.pathOf(poly, true)} fill="none" stroke={INK} strokeWidth={3.4} strokeLinejoin="round" />
          </g>
        )),
      )}
    </svg>
    <Img src={staticFile('joan/tex/relief.png')} style={{position: 'absolute', left: 0, top: 0, width: MAP_W, height: MAP_H, opacity: 0.6, clipPath: `path('${landClip(proj)}')`}} />
  </div>
);

/** طبقة رسم مسطّحة فوق الأرض (أسهم، ظلال، خطوط) */
export const MapFlat: React.FC<{z?: number; children: React.ReactNode}> = ({z = LAND_Z + 4, children}) => (
  <div style={{...sheet, transform: `translateZ(${z}px)`}}>
    <svg width={MAP_W} height={MAP_H} viewBox={vb}>
      {children}
    </svg>
  </div>
);

const SB = 1000;
const SBY = 800;
/** مجسّم واقف فوق الخريطة عند نقطة (إحداثيات proj). الأصل (0,0) عند قاعدته */
export const Standee: React.FC<{at: [number, number]; z?: number; up?: number; scale?: number; children: React.ReactNode}> = ({at, z = LAND_Z + 8, up = 1, scale = 1, children}) =>
  up <= 0.01 ? null : (
    <div
      style={{
        position: 'absolute',
        left: at[0] - SB / 2,
        top: at[1] - SBY,
        width: SB,
        height: SB,
        transformOrigin: `50% ${SBY}px`,
        transform: `translateZ(${z}px) rotateX(${-THETA}deg) scale(${scale}) scaleY(${up})`,
      }}
    >
      <svg width={SB} height={SB} viewBox={`${-SB / 2} ${-SBY} ${SB} ${SB}`} style={{overflow: 'visible'}}>
        {children}
      </svg>
    </div>
  );

/** موقع نقطة على الخريطة (مع ارتفاع h فوقها) على الشاشة — للفقاعات المسطّحة */
export const mapToScreen = (at: [number, number], cam: Cam, h = 0, z = LAND_Z) => {
  const th = (THETA * Math.PI) / 180;
  const x = at[0] - 960;
  const y0 = at[1] - 540;
  return projectWorld(x, y0 * Math.cos(th) - z * Math.sin(th) - h, y0 * Math.sin(th) + z * Math.cos(th) + PLANE_Z, cam);
};

/** دبوس مدينة واقف بلافتة كبيرة مقروءة */
export const CityStandee: React.FC<{at: [number, number]; label: string; color: string; frame: number; big?: boolean; pulse?: boolean; dx?: number; h?: number}> = ({
  at,
  label,
  color,
  frame,
  big,
  pulse,
  dx = 0,
  h = 62,
}) => {
  const fs = big ? 36 : 30;
  const w = label.length * fs * 0.56 + 40;
  return (
    <Standee at={at}>
      {pulse && <ellipse cx={0} cy={-2} rx={14 + (frame % 28) * 1.6} ry={7 + (frame % 28) * 0.7} fill="none" stroke={color} strokeWidth={4} opacity={1 - (frame % 28) / 28} />}
      <ellipse cx={5} cy={0} rx={17} ry={6} fill="#000" opacity={0.4} />
      <line x1={0} y1={0} x2={dx * 0.3} y2={-h} stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <line x1={0} y1={0} x2={dx * 0.3} y2={-h} stroke="#d9b060" strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={0} cy={-6} r={big ? 12 : 9} fill={color} stroke={INK} strokeWidth={4} />
      <g transform={`translate(${dx} ${-h - fs * 0.6})`}>
        <rect x={-w / 2 + 4} y={-fs * 0.72 + 5} width={w} height={fs * 1.45} rx={10} fill="#000" opacity={0.3} />
        <rect x={-w / 2} y={-fs * 0.72} width={w} height={fs * 1.45} rx={10} fill="#fbf3df" stroke={INK} strokeWidth={4} />
        <rect x={-w / 2 + 5} y={-fs * 0.72 + 5} width={w - 10} height={6} rx={3} fill={color} />
        <text x={0} y={fs * 0.4} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={fs} fill={INK} direction="rtl">
          {label}
        </text>
      </g>
    </Standee>
  );
};

const plane: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: 1920,
  height: 1080,
  transformStyle: 'preserve-3d',
  transformOrigin: '50% 50%',
  transform: `translateZ(${PLANE_Z}px) rotateX(${THETA}deg)`,
};

export type MapTableCtx = {proj: MapProj; xy: (p: LonLat) => [number, number]};

export const MapTable: React.FC<{
  id: string;
  cam: Cam;
  frame: number;
  center: LonLat;
  zoom: number;
  colors: {FRA: string; GBR: string};
  territories?: TerritoryOverlay[];
  river?: string;
  /** رسم مسطّح فوق الأرض (MapFlat) */
  children?: (m: MapTableCtx) => React.ReactNode;
  /** المجسّمات الواقفة (Standee) — في مسرح مستقل فوق الخريطة حتى لا تتقاطع مع سطحها */
  pieces?: (m: MapTableCtx) => React.ReactNode;
}> = ({id, cam, frame, center, zoom, colors, territories = [], river, children, pieces}) => {
  const [lon, lat] = center;
  const {proj, sides, ctr} = React.useMemo(() => {
    const c: LonLat = [lon, lat];
    return {
      ctr: c,
      proj: makeProjection(c, zoom),
      sides: {FRA: mix(colors.FRA, '#0a0a20', 0.55), GBR: mix(colors.GBR, '#1a0508', 0.55)} as Partial<Record<CountryCode, string>>,
    };
  }, [lon, lat, zoom, colors.FRA, colors.GBR]);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#1a100a'}}>
      <LitStage cam={cam} light={LIGHTS.table}>
        <div style={plane}>
          <BaseSheet center={ctr} zoom={zoom} sides={sides} />
          <LandSides proj={proj} sides={sides} />
          <LandTop id={id} proj={proj} colors={colors} territories={territories} river={river} />
          {children?.({proj, xy: proj.toXY})}
        </div>
      </LitStage>
      <LitStage cam={cam} light={LIGHTS.table}>
        <div style={plane}>{pieces?.({proj, xy: proj.toXY})}</div>
        {/* مقدمة خارج التركيز: شمعة وذرات غبار في الضوء */}
        <Layer d={-330} blur={9}>
          <Art>
            <Candle id={`${id}c1`} x={-40} y={1130} s={1.5} frame={frame} warm={WAR_TABLE.warm} />
          </Art>
        </Layer>
        <Layer d={-180} blur={2}>
          <Art>
            <Motes id={`${id}m`} frame={frame} x0={-300} x1={2200} y0={100} y1={1000} color="#ffe6b0" n={22} size={2.4} />
          </Art>
        </Layer>
      </LitStage>
    </div>
  );
};
