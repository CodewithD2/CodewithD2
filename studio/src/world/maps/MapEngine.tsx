import React from 'react';
import {INK} from '../../lib/util';
import {CountryCode, EUROPE_COUNTRIES, EUROPE_RIVERS, LonLat} from './europeData';

/* =====================================================================
 * محرك الخرائط الجغرافية الحقيقية (Natural Earth 50m)
 * إسقاط Mercator حقيقي يحافظ على نسب فرنسا وإنجلترا بدقة تامة.
 * قابل لإعادة الاستخدام في أي حلقة تاريخية مع تحريك الكاميرا (pan/zoom).
 * ===================================================================== */

export type MapProj = {
  /** يحوّل [lon, lat] إلى إحداثيات الشاشة [x, y] */
  toXY: (pt: LonLat) => [number, number];
  /** يحوّل قائمة نقاط إلى مسار SVG */
  pathOf: (pts: LonLat[], close?: boolean) => string;
  scale: number;
};

const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + ((lat * Math.PI) / 180) / 2));

/**
 * يبني دالة إسقاط Mercator لمركز جغرافي ومستوى تكبير.
 * zoom=1 → 1° طول ≈ 95px (مناسب لعرض فرنسا وإنجلترا كاملتين في 1920×1080)
 */
export const makeProjection = (center: LonLat, zoom = 1, width = 1920, height = 1080): MapProj => {
  const radPerDeg = Math.PI / 180;
  const pxPerRad = (95 * zoom) / radPerDeg;
  const cx = center[0] * radPerDeg;
  const cy = mercY(center[1]);
  const toXY = ([lon, lat]: LonLat): [number, number] => [
    width / 2 + (lon * radPerDeg - cx) * pxPerRad,
    height / 2 - (mercY(lat) - cy) * pxPerRad,
  ];
  const pathOf = (pts: LonLat[], close = true) => {
    if (!pts.length) return '';
    const s = pts
      .map((p, i) => {
        const [x, y] = toXY(p);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
    return close ? `${s} Z` : s;
  };
  return {toXY, pathOf, scale: zoom};
};

export type TerritoryOverlay = {
  id: string;
  /** يُقص تلقائياً بحدود الدولة (مثلاً FRA) ليطابق الساحل الحقيقي بدقة */
  clipTo?: CountryCode;
  polygon: LonLat[];
  fill: string;
  opacity?: number;
  stroke?: string;
};

export type MapCanvasProps = {
  center?: LonLat;
  zoom?: number;
  width?: number;
  height?: number;
  /** ألوان الدول الخاصة (مثلاً FRA أزرق ملكي، GBR أحمر) */
  countryColors?: Partial<Record<CountryCode, string>>;
  /** لون البحر */
  seaColor?: string;
  /** لون اليابسة الافتراضي لبقية الدول */
  landColor?: string;
  /** إظهار الأنهار الحقيقية (اللوار، السين، الرون، التيمز…) */
  showRivers?: boolean;
  /** تمييز نهر معين (مثل Loire في حصار أورليان) */
  highlightRiver?: string;
  /** طبقات السيطرة التكتيكية (مقصوصة بسواحل الدول الحقيقية) */
  territories?: TerritoryOverlay[];
  /** إظهار أسماء المناطق أو خطوط الشبكة الجغرافية الخفيفة */
  showGrid?: boolean;
  /** أطفال SVG إضافيون (مدن، أسهم، شخصيات على الخريطة) يستقبلون proj */
  children?: (proj: MapProj) => React.ReactNode;
};

const DRAW_ORDER: CountryCode[] = ['ESP', 'PRT', 'ITA', 'CHE', 'DEU', 'NLD', 'BEL', 'LUX', 'IRL', 'GBR', 'FRA'];

export const RealEuropeMap: React.FC<MapCanvasProps> = ({
  center = [1.8, 48.2],
  zoom = 1.05,
  width = 1920,
  height = 1080,
  countryColors = {},
  seaColor = '#8ec5e4',
  landColor = '#efe3c8',
  showRivers = true,
  highlightRiver,
  territories = [],
  showGrid = true,
  children,
}) => {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const proj = makeProjection(center, zoom, width, height);

  const clipCodes = Array.from(new Set(territories.map((t) => t.clipTo).filter(Boolean) as CountryCode[]));

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <radialGradient id={`sea${uid}`} cx="50%" cy="45%" r="72%">
          <stop offset="0%" stopColor={seaColor} />
          <stop offset="100%" stopColor="#6fa9cc" />
        </radialGradient>
        {clipCodes.map((code) => (
          <clipPath key={code} id={`clip-${code}-${uid}`}>
            {(EUROPE_COUNTRIES[code] ?? []).map((poly, i) => (
              <path key={i} d={proj.pathOf(poly, true)} />
            ))}
          </clipPath>
        ))}
      </defs>

      {/* البحر */}
      <rect x={0} y={0} width={width} height={height} fill={`url(#sea${uid})`} />

      {/* خطوط طول وعرض خفيفة لطابع أطلس تكتيكي */}
      {showGrid && (
        <g stroke="#ffffff" strokeOpacity={0.18} strokeWidth={1.5} strokeDasharray="6 8">
          {[-8, -4, 0, 4, 8, 12].map((lon) => {
            const [x1, y1] = proj.toXY([lon, 40]);
            const [x2, y2] = proj.toXY([lon, 60]);
            return <line key={`lon${lon}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
          {[42, 46, 50, 54, 58].map((lat) => {
            const [x1, y1] = proj.toXY([-12, lat]);
            const [x2, y2] = proj.toXY([15, lat]);
            return <line key={`lat${lat}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </g>
      )}

      {/* ظل خفيف تحت اليابسة لفصل الساحل بوضوح */}
      <g transform="translate(4 6)" opacity={0.22}>
        {DRAW_ORDER.map((code) =>
          (EUROPE_COUNTRIES[code] ?? []).map((poly, i) => (
            <path key={`sh-${code}-${i}`} d={proj.pathOf(poly, true)} fill="#22455c" />
          )),
        )}
      </g>

      {/* الدول الحقيقية */}
      {DRAW_ORDER.map((code) => {
        const fill = countryColors[code] ?? landColor;
        const isMain = code === 'FRA' || code === 'GBR';
        return (
          <g key={code}>
            {(EUROPE_COUNTRIES[code] ?? []).map((poly, i) => (
              <path
                key={i}
                d={proj.pathOf(poly, true)}
                fill={fill}
                stroke="#4a4035"
                strokeWidth={isMain ? 2.8 : 1.8}
                strokeLinejoin="round"
              />
            ))}
          </g>
        );
      })}

      {/* طبقات السيطرة التكتيكية مقصوصة بحدود الدول الحقيقية */}
      {territories.map((t) => (
        <g key={t.id} clipPath={t.clipTo ? `url(#clip-${t.clipTo}-${uid})` : undefined}>
          <path
            d={proj.pathOf(t.polygon, true)}
            fill={t.fill}
            fillOpacity={t.opacity ?? 0.88}
            stroke={t.stroke ?? '#2b1e1a'}
            strokeWidth={2.5}
            strokeDasharray={t.stroke ? undefined : '8 5'}
            strokeLinejoin="round"
          />
        </g>
      ))}

      {/* إعادة رسم خط ساحل فرنسا وبريطانيا فوق طبقات السيطرة ليبقى حاداً ونظيفاً */}
      {(['GBR', 'FRA'] as CountryCode[]).map((code) =>
        (EUROPE_COUNTRIES[code] ?? []).map((poly, i) => (
          <path key={`ol-${code}-${i}`} d={proj.pathOf(poly, true)} fill="none" stroke={INK} strokeWidth={3.2} strokeLinejoin="round" />
        )),
      )}

      {/* الأنهار الحقيقية */}
      {showRivers &&
        Object.entries(EUROPE_RIVERS).map(([name, lines]) => {
          const hi = highlightRiver === name;
          return (
            <g key={name} fill="none" strokeLinecap="round" strokeLinejoin="round">
              {lines.map((ln, i) => (
                <path
                  key={i}
                  d={proj.pathOf(ln, false)}
                  stroke={hi ? '#2884d8' : '#4a98c8'}
                  strokeWidth={hi ? 6.5 : 3.2}
                  opacity={hi ? 0.95 : 0.72}
                />
              ))}
            </g>
          );
        })}

      {/* العناصر المتحركة فوق الخريطة */}
      {children?.(proj)}
    </svg>
  );
};

/* ================= أدوات تكتيكية متحركة فوق الخريطة ================= */

/** دبوس مدينة عربية بإحداثياتها الحقيقية */
export const MapCityPin: React.FC<{
  proj: MapProj;
  pos: LonLat;
  label: string;
  color?: string;
  important?: boolean;
  pulse?: number; // 0..1 نبضة اختيارية
  labelOffset?: [number, number];
}> = ({proj, pos, label, color = '#2452a4', important = false, pulse = 0, labelOffset = [0, -24]}) => {
  const [x, y] = proj.toXY(pos);
  const r = important ? 11 : 7.5;
  return (
    <g transform={`translate(${x} ${y})`}>
      {pulse > 0 && (
        <circle cx={0} cy={0} r={r + pulse * 34} fill="none" stroke={color} strokeWidth={4} opacity={Math.max(0, 1 - pulse)} />
      )}
      <circle cx={0} cy={0} r={r + 3} fill="#fff" stroke={INK} strokeWidth={3} />
      <circle cx={0} cy={0} r={r - 1} fill={color} />
      <g transform={`translate(${labelOffset[0]} ${labelOffset[1]})`}>
        <rect x={-label.length * 9 - 14} y={-24} width={label.length * 18 + 28} height={32} rx={8} fill="#fdfaf2" fillOpacity={0.92} stroke={INK} strokeWidth={2.5} />
        <text x={0} y={0} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={important ? 24 : 21} fill={INK} direction="rtl">
          {label}
        </text>
      </g>
    </g>
  );
};

/** سهم هجوم عريض متحرك على طول مسار جغرافي حقيقي */
export const MapAttackArrow: React.FC<{
  proj: MapProj;
  points: LonLat[];
  progress: number; // 0..1
  color?: string;
  width?: number;
}> = ({proj, points, progress, color = '#c8242e', width = 16}) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0.01 || points.length < 2) return null;
  const xy = points.map((pt) => proj.toXY(pt));
  // حساب الأطوال التراكمية لاقتطاع المسار عند progress
  const segs: number[] = [0];
  let total = 0;
  for (let i = 1; i < xy.length; i++) {
    total += Math.hypot(xy[i][0] - xy[i - 1][0], xy[i][1] - xy[i - 1][1]);
    segs.push(total);
  }
  const targetLen = total * p;
  const sub: [number, number][] = [xy[0]];
  let angle = 0;
  for (let i = 1; i < xy.length; i++) {
    if (segs[i] >= targetLen) {
      const segLen = Math.max(1e-6, segs[i] - segs[i - 1]);
      const t = (targetLen - segs[i - 1]) / segLen;
      const nx = xy[i - 1][0] + (xy[i][0] - xy[i - 1][0]) * t;
      const ny = xy[i - 1][1] + (xy[i][1] - xy[i - 1][1]) * t;
      sub.push([nx, ny]);
      angle = (Math.atan2(xy[i][1] - xy[i - 1][1], xy[i][0] - xy[i - 1][0]) * 180) / Math.PI;
      break;
    }
    sub.push(xy[i]);
    angle = (Math.atan2(xy[i][1] - xy[i - 1][1], xy[i][0] - xy[i - 1][0]) * 180) / Math.PI;
  }
  const d = sub.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(' ');
  const tip = sub[sub.length - 1];
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={width + 8} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      <g transform={`translate(${tip[0]} ${tip[1]}) rotate(${angle})`}>
        <path d={`M 16 0 L -18 -18 L -10 0 L -18 18 Z`} fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>
    </g>
  );
};

/** مسار حركة منقط متحرك (مثل رحلة جان دارك من فوكولور إلى شينون) */
export const MapMarchPath: React.FC<{
  proj: MapProj;
  points: LonLat[];
  progress: number;
  color?: string;
}> = ({proj, points, progress, color = '#f2c43a'}) => {
  const p = Math.max(0, Math.min(1, progress));
  if (p <= 0.01 || points.length < 2) return null;
  const xy = points.map((pt) => proj.toXY(pt));
  const segs: number[] = [0];
  let total = 0;
  for (let i = 1; i < xy.length; i++) {
    total += Math.hypot(xy[i][0] - xy[i - 1][0], xy[i][1] - xy[i - 1][1]);
    segs.push(total);
  }
  const targetLen = total * p;
  const sub: [number, number][] = [xy[0]];
  for (let i = 1; i < xy.length; i++) {
    if (segs[i] >= targetLen) {
      const t = (targetLen - segs[i - 1]) / Math.max(1e-6, segs[i] - segs[i - 1]);
      sub.push([xy[i - 1][0] + (xy[i][0] - xy[i - 1][0]) * t, xy[i - 1][1] + (xy[i][1] - xy[i - 1][1]) * t]);
      break;
    }
    sub.push(xy[i]);
  }
  const d = sub.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(' ');
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={11} strokeDasharray="16 14" />
      <path d={d} stroke={color} strokeWidth={6} strokeDasharray="16 14" />
    </g>
  );
};

/** أيقونة معركة: سحابة غبار كرتونية + سيفان متقاطعان */
export const MapBattleIcon: React.FC<{proj: MapProj; pos: LonLat; frame: number; scale?: number}> = ({proj, pos, frame, scale = 1}) => {
  const [x, y] = proj.toXY(pos);
  const pulse = 1 + Math.sin(frame / 3) * 0.08;
  const puff = Math.sin(frame / 4) * 5;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * pulse})`}>
      {/* سحابة غبار كرتونية */}
      <g fill="#f2ead8" stroke={INK} strokeWidth={3.5}>
        <circle cx={-22 - puff * 0.3} cy={6} r={18} />
        <circle cx={22 + puff * 0.3} cy={8} r={17} />
        <circle cx={0} cy={-14 - puff * 0.3} r={20} />
        <circle cx={0} cy={12} r={18} stroke="none" />
      </g>
      {/* سيفان متقاطعان */}
      <g stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
        <g transform="rotate(42)">
          <path d="M -4 -36 L 0 -46 L 4 -36 L 4 22 L -4 22 Z" fill="#dce3ee" />
          <rect x={-13} y={12} width={26} height={6} rx={2} fill="#e8b830" />
        </g>
        <g transform="rotate(-42)">
          <path d="M -4 -36 L 0 -46 L 4 -36 L 4 22 L -4 22 Z" fill="#dce3ee" />
          <rect x={-13} y={12} width={26} height={6} rx={2} fill="#e8b830" />
        </g>
      </g>
    </g>
  );
};

/** علامة X حمراء لسقوط قلعة */
export const MapFallenX: React.FC<{proj: MapProj; pos: LonLat; scale?: number}> = ({proj, pos, scale = 1}) => {
  const [x, y] = proj.toXY(pos);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} strokeLinecap="round">
      <line x1={-18} y1={-18} x2={18} y2={18} stroke={INK} strokeWidth={13} />
      <line x1={18} y1={-18} x2={-18} y2={18} stroke={INK} strokeWidth={13} />
      <line x1={-18} y1={-18} x2={18} y2={18} stroke="#e02424" strokeWidth={7} />
      <line x1={18} y1={-18} x2={-18} y2={18} stroke="#e02424" strokeWidth={7} />
    </g>
  );
};

/** مفتاح ألوان الخريطة (Legend) */
export const MapLegend: React.FC<{x?: number; y?: number}> = ({x = 1490, y = 36}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={0} y={0} width={390} height={158} rx={14} fill="#fdfaf2" fillOpacity={0.95} stroke={INK} strokeWidth={3.5} />
    {[
      {c: '#2b5eb8', label: 'فرنسا الملكية — شارل السابع'},
      {c: '#c8242e', label: 'مناطق الإنجليز'},
      {c: '#7b2242', label: 'حلفاء دوق بورغوندي'},
    ].map((it, i) => (
      <g key={i} transform={`translate(22 ${38 + i * 44})`}>
        <rect x={312} y={-18} width={34} height={24} rx={5} fill={it.c} stroke={INK} strokeWidth={2.5} />
        <text x={298} y={2} textAnchor="start" fontFamily="Amiri" fontWeight={700} fontSize={24} fill={INK} direction="rtl">
          {it.label}
        </text>
      </g>
    ))}
  </g>
);
