import React from 'react';
import {INK} from '../../lib/util';
import {WORLD_LAND} from '../../world/maps/worldLand';
import type {LonLat} from '../../world/maps/europeData';

/* =====================================================================
 * كرة أرضية كرتونية بإسقاط orthographic حقيقي (يابسة Natural Earth 110m).
 * ===================================================================== */

const RAD = Math.PI / 180;

export type GlobeProj = {cx: number; cy: number; R: number; lon0: number; lat0: number};

/** إسقاط نقطة: يعيد [x, y, z] حيث z>0 = في الوجه المرئي */
export const gproj = (g: GlobeProj, [lon, lat]: LonLat): [number, number, number] => {
  const l = (lon - g.lon0) * RAD;
  const p = lat * RAD;
  const p0 = g.lat0 * RAD;
  const x = Math.cos(p) * Math.sin(l);
  const y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l);
  const z = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l);
  return [g.cx + g.R * x, g.cy - g.R * y, z];
};

/** مسار مضلع على الكرة: النقاط الخلفية تُسقط على حافة القرص */
const polyPath = (g: GlobeProj, pts: LonLat[]) => {
  let d = '';
  let any = false;
  pts.forEach((pt, i) => {
    let [x, y, z] = gproj(g, pt);
    if (z > 0) any = true;
    else {
      const dx = x - g.cx;
      const dy = y - g.cy;
      const r = Math.hypot(dx, dy) || 1;
      x = g.cx + (dx / r) * g.R;
      y = g.cy + (dy / r) * g.R;
    }
    d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  return any ? d + 'Z' : '';
};

/** خط على الكرة (يُخفى الجزء الخلفي) */
export const geoLine = (g: GlobeProj, pts: LonLat[]) => {
  let d = '';
  let pen = false;
  for (const pt of pts) {
    const [x, y, z] = gproj(g, pt);
    if (z > 0.02) {
      d += `${pen ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
      pen = true;
    } else pen = false;
  }
  return d;
};

/** منحنى ناعم بين نقاط جغرافية (استيفاء خطي بخطوات صغيرة) */
export const densify = (pts: LonLat[], step = 1.5): LonLat[] => {
  const out: LonLat[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 0; k < n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  out.push(pts[pts.length - 1]);
  return out;
};

export const Globe: React.FC<{
  id: string;
  g: GlobeProj;
  ocean?: string;
  land?: string;
  ice?: string;
  children?: React.ReactNode;
  grid?: boolean;
}> = ({id, g, ocean = '#3d8fd0', land = '#7cc26a', ice = '#f4f8fb', children, grid = true}) => (
  <g>
    <defs>
      <radialGradient id={`${id}-sh`} cx="38%" cy="32%" r="75%">
        <stop offset="0%" stopColor="#fff" stopOpacity={0.28} />
        <stop offset="55%" stopColor="#fff" stopOpacity={0} />
        <stop offset="100%" stopColor="#0a1530" stopOpacity={0.55} />
      </radialGradient>
      <clipPath id={`${id}-clip`}>
        <circle cx={g.cx} cy={g.cy} r={g.R} />
      </clipPath>
    </defs>
    <circle cx={g.cx} cy={g.cy} r={g.R + 26} fill="#8fd0ff" opacity={0.18} />
    <circle cx={g.cx} cy={g.cy} r={g.R} fill={ocean} />
    <g clipPath={`url(#${id}-clip)`}>
      {grid &&
        [-60, -30, 0, 30, 60].map((lat) => (
          <path key={'la' + lat} d={geoLine(g, Array.from({length: 73}, (_, i) => [-180 + i * 5, lat] as LonLat))} stroke="#fff" strokeOpacity={0.14} strokeWidth={2} fill="none" />
        ))}
      {grid &&
        Array.from({length: 12}, (_, i) => -180 + i * 30).map((lon) => (
          <path key={'lo' + lon} d={geoLine(g, Array.from({length: 37}, (_, k) => [lon, -90 + k * 5] as LonLat))} stroke="#fff" strokeOpacity={0.14} strokeWidth={2} fill="none" />
        ))}
      {WORLD_LAND.map((p, i) => {
        const d = polyPath(g, p);
        if (!d) return null;
        const polar = p.every(([, la]) => la < -60) || p.every(([, la]) => la > 72);
        return <path key={i} d={d} fill={polar ? ice : land} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
      })}
      {children}
    </g>
    <circle cx={g.cx} cy={g.cy} r={g.R} fill={`url(#${id}-sh)`} />
    <circle cx={g.cx} cy={g.cy} r={g.R} fill="none" stroke={INK} strokeWidth={6} />
  </g>
);
