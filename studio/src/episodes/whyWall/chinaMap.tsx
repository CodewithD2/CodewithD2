import React from 'react';
import {INK} from '../../lib/util';
import {WORLD_LAND} from '../../world/maps/worldLand';
import type {LonLat} from '../../world/maps/europeData';

/* خريطة شرق آسيا (إسقاط متساوي المسافات بسيط) للمشهد الثالث — يابسة Natural Earth 110m */
export const MAP = {lon0: 95, lon1: 132, lat0: 22, lat1: 50, x: 70, y: 300, w: 940};
const K = MAP.w / (MAP.lon1 - MAP.lon0);
export const MAP_H = (MAP.lat1 - MAP.lat0) * K * 1.18;
export const mp = ([lon, lat]: LonLat): [number, number] => [MAP.x + (lon - MAP.lon0) * K, MAP.y + (MAP.lat1 - lat) * K * 1.18];
export const line = (pts: LonLat[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${mp(p)[0].toFixed(1)} ${mp(p)[1].toFixed(1)}`).join(' ');

/** أسوار الممالك المتحاربة قبل التوحيد (مواضع تقريبية مبسّطة) */
export const STATE_WALLS: {name: string; pts: LonLat[]}[] = [
  {name: 'تشين', pts: [[103.8, 35.6], [105.5, 37.4], [107.6, 38.6], [109.4, 39.4]]},
  {name: 'تشاو', pts: [[110.6, 40.6], [112.8, 41.3], [114.9, 41.1]]},
  {name: 'يان', pts: [[115.9, 41.2], [118.6, 42.1], [121.4, 42.0], [123.6, 41.4]]},
  {name: 'وي', pts: [[109.3, 36.4], [110.2, 37.9]]},
  {name: 'تشي', pts: [[115.6, 36.0], [117.8, 36.3], [119.8, 36.1]]},
];
/** خط السور الموحّد في عهد تشين (تقريبي): من لينتاو غرباً إلى لياودونغ شرقاً */
export const QIN_WALL: LonLat[] = [
  [103.8, 35.4], [105.5, 37.3], [107.5, 38.7], [109.6, 39.9], [111.4, 40.9], [113.6, 41.4], [115.9, 41.3], [118.5, 42.1], [121.3, 42.0], [124.0, 41.2],
];
/** حدود تقريبية لإمبراطورية تشين الموحّدة */
export const QIN_EMPIRE: LonLat[] = [
  [103.2, 34.6], [104.5, 37.2], [107.4, 39.0], [110.2, 40.6], [114.2, 41.3], [118.2, 41.9], [123.8, 41.0], [121.6, 38.4], [120.8, 33.8], [121.8, 31.0], [119.5, 26.0], [116.0, 22.8], [110.5, 21.5], [106.6, 22.4], [103.4, 24.0], [101.5, 27.0], [102.2, 31.0],
];

export const AsiaMap: React.FC<{id: string; children?: React.ReactNode}> = ({id, children}) => (
  <g>
    <defs>
      <clipPath id={`${id}-clip`}>
        <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP_H} rx={18} />
      </clipPath>
      <radialGradient id={`${id}-paper`} cx="50%" cy="45%" r="70%">
        <stop offset="0%" stopColor="#f4e6c4" />
        <stop offset="100%" stopColor="#d9bf8e" />
      </radialGradient>
    </defs>
    {/* ورقة الخريطة */}
    <rect x={MAP.x - 18} y={MAP.y - 18} width={MAP.w + 36} height={MAP_H + 36} rx={24} fill="#7a5532" stroke={INK} strokeWidth={6} />
    <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP_H} rx={18} fill="#9cc6d8" />
    <g clipPath={`url(#${id}-clip)`}>
      {WORLD_LAND.map((poly, i) => {
        if (!poly.some(([lo, la]) => lo > MAP.lon0 - 10 && lo < MAP.lon1 + 10 && la > MAP.lat0 - 10 && la < MAP.lat1 + 10)) return null;
        return <path key={i} d={line(poly) + 'Z'} fill={`url(#${id}-paper)`} stroke="#5a4028" strokeWidth={3} strokeLinejoin="round" />;
      })}
      {children}
    </g>
    <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP_H} rx={18} fill="none" stroke={INK} strokeWidth={5} />
  </g>
);
