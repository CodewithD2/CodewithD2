import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {extra, look} from './cast';
import type {Look} from './cast';
import {Person} from './characters/Person';
import type {Held} from './characters/items';
import {
  MapAttackArrow,
  MapBattleIcon,
  MapCityPin,
  MapFallenX,
  MapLegend,
  MapMarchPath,
  RealEuropeMap,
} from './world/maps/MapEngine';
import {
  BURGUNDY_1429,
  CITIES_1429,
  ENGLISH_GUYENNE_1429,
  ENGLISH_NORTH_1429,
  HENRY5_INVASION_ROUTE,
  JOAN_MARCH_ROUTE,
} from './world/maps/france1429';
import {INK} from './lib/util';

/* =====================================================================
 * لوحات مراجعة الدفعة 0 — الشخصيات التاريخية + الأدوار + الخريطة الحقيقية
 * ===================================================================== */

const SheetBg: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#f8f2e4, #e7dac2)'}}>
    <svg width={1920} height={1080}>
      <text x={960} y={66} fontFamily="Amiri" fontSize={48} fontWeight={700} textAnchor="middle" fill="#2a2030" direction="rtl">
        {title}
      </text>
      {children}
    </svg>
  </AbsoluteFill>
);

type CastCard = {
  p: Look;
  label: string;
  sub: string;
  s?: number;
  holdR?: Held;
  holdL?: Held;
  pose?: 'stand' | 'carry' | 'raise' | 'cross' | 'present';
  expr?: 'neutral' | 'determined' | 'smug' | 'angry' | 'happy' | 'dizzy';
};

/** لوحة شخصيات جان دارك التاريخية الـ 9 مع نسخها الأساسية */
export const JoanCastSheet: React.FC = () => {
  const f = useCurrentFrame();
  const cards: CastCard[] = [
    {p: look('joanOfArc', {variant: 'village'}), label: 'جان دارك — القرية', sub: "variant: 'village'", expr: 'determined'},
    {p: look('joanOfArc', {variant: 'travel'}), label: 'جان دارك — السفر', sub: "variant: 'travel'", expr: 'determined'},
    {p: look('joanOfArc'), label: 'جان دارك — الدرع والراية', sub: "look('joanOfArc')", holdL: 'joanBanner', pose: 'stand', expr: 'determined'},
    {p: look('charles6'), label: 'الملك شارل السادس', sub: "look('charles6')", expr: 'dizzy'},
    {p: look('charles7'), label: 'الدوفين شارل السابع', sub: "look('charles7')", expr: 'neutral'},
    {p: look('charles7', {variant: 'king'}), label: 'شارل السابع — ملكاً', sub: "variant: 'king'", expr: 'happy'},
    {p: look('henry5'), label: 'الملك هنري الخامس', sub: "look('henry5')", holdR: 'longsword', pose: 'raise', expr: 'smug'},
    {p: look('henry6Baby'), label: 'الرضيع هنري السادس', sub: "look('henry6Baby')", s: 0.48, holdR: 'rattle', pose: 'raise', expr: 'happy'},
    {p: look('philipGood'), label: 'دوق بورغوندي', sub: "look('philipGood')", holdL: 'moneyBag', expr: 'smug'},
    {p: look('laHire'), label: 'القائد لا هير', sub: "look('laHire')", holdR: 'battleAxe', pose: 'raise', expr: 'angry'},
    {p: look('baudricourt'), label: 'روبير دي بودريكور', sub: "look('baudricourt')", holdR: 'mug', pose: 'cross', expr: 'angry'},
    {p: look('pierreCauchon'), label: 'الأسقف بيير كوشون', sub: "look('pierreCauchon')", holdL: {id: 'moneyBag', text: 'ذهب إنجليزي'}, expr: 'smug'},
  ];

  const perRow = 6;
  return (
    <SheetBg title="مكتبة شخصيات جان دارك — جاهزة لإعادة الاستخدام في أي فيديو">
      {cards.map((c, i) => {
        const col = i % perRow;
        const row = Math.floor(i / perRow);
        const x = 185 + col * 310;
        const y = 455 + row * 475;
        return (
          <g key={i}>
            <rect x={x - 138} y={y - 315} width={276} height={415} rx={18} fill="#fffcf5" fillOpacity={0.62} stroke="#cbbca4" strokeWidth={2} />
            <Person
              x={x}
              y={y}
              s={c.s ?? 0.78}
              frame={f + i * 7}
              {...c.p}
              shading="cel"
              expr={c.expr ?? 'neutral'}
              pose={c.pose ?? 'stand'}
              holdR={c.holdR}
              holdL={c.holdL}
            />
            <text x={x} y={y + 42} fontFamily="Amiri" fontSize={25} fontWeight={700} textAnchor="middle" fill="#2a2030" direction="rtl">
              {c.label}
            </text>
            <text x={x} y={y + 72} fontFamily="DejaVu Sans Mono, monospace" fontSize={13} textAnchor="middle" fill="#7a6a7a">
              {c.sub}
            </text>
          </g>
        );
      })}
    </SheetBg>
  );
};

/** لوحة الأدوار الأوروبية الوسطى (جنود فرنسيون/إنجليز/بورغونديون + نبلاء + علماء بواتييه) */
export const JoanRolesSheet: React.FC = () => {
  const f = useCurrentFrame();
  const roles = [
    {id: 'frenchSoldier' as const, name: 'الجنود الفرنسيون — زهرة الزنبق', holdR: 'flagFrance' as Held},
    {id: 'englishSoldier' as const, name: 'الجنود الإنجليز — الصليب', holdR: 'flagEngland' as Held},
    {id: 'burgundianSoldier' as const, name: 'الجنود البورغونديون — صليب X', holdR: 'flagBurgundy' as Held},
    {id: 'medievalNoble' as const, name: 'نبلاء القصر الملكي — شينون', holdR: undefined},
    {id: 'poitiersScholar' as const, name: 'علماء ولاهوتيو بواتييه', holdR: 'scroll' as Held},
  ];
  return (
    <SheetBg title="مكتبة الأدوار الأوروبية الوسطى — ٣ نسخ متنوعة لكل دور">
      {roles.map((r, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const cx = row === 0 ? 330 + col * 630 : 620 + col * 680;
        const y = 445 + row * 475;
        return (
          <g key={r.id}>
            <rect x={cx - 270} y={y - 300} width={540} height={395} rx={18} fill="#fffcf5" fillOpacity={0.62} stroke="#cbbca4" strokeWidth={2} />
            {[1, 2, 3].map((seed, k) => (
              <Person
                key={seed}
                x={cx - 155 + k * 155}
                y={y}
                s={0.72}
                frame={f + seed * 11}
                {...extra(r.id, seed)}
                shading="cel"
                expr="neutral"
                pose="stand"
                holdL={k === 2 ? r.holdR : undefined}
              />
            ))}
            <text x={cx} y={y + 44} fontFamily="Amiri" fontSize={28} fontWeight={700} textAnchor="middle" fill="#2a2030" direction="rtl">
              {r.name}
            </text>
            <text x={cx} y={y + 74} fontFamily="DejaVu Sans Mono, monospace" fontSize={16} textAnchor="middle" fill="#7a6a7a">
              extra('{r.id}', seed)
            </text>
          </g>
        );
      })}
    </SheetBg>
  );
};

/** لوحة مراجعة الخريطة الجغرافية الحقيقية (فرنسا وإنجلترا ١٤٢٩ — Natural Earth 50m) */
export const EuropeMapSheet: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <RealEuropeMap
        center={[1.5, 48.0]}
        zoom={0.84}
        countryColors={{
          FRA: '#2b5eb8',
          GBR: '#c8242e',
        }}
        highlightRiver="Loire"
        territories={[
          {id: 'eng-n', clipTo: 'FRA', polygon: ENGLISH_NORTH_1429, fill: '#c8242e', opacity: 0.9},
          {id: 'eng-sw', clipTo: 'FRA', polygon: ENGLISH_GUYENNE_1429, fill: '#c8242e', opacity: 0.9},
          {id: 'burg', clipTo: 'FRA', polygon: BURGUNDY_1429, fill: '#7b2242', opacity: 0.9},
        ]}
      >
        {(proj) => (
          <>
            {/* مسار الغزو الإنجليزي ومسار رحلة جان دارك */}
            <MapAttackArrow proj={proj} points={HENRY5_INVASION_ROUTE} progress={1} color="#e03030" width={13} />
            <MapMarchPath proj={proj} points={JOAN_MARCH_ROUTE} progress={1} color="#f6cc44" />
            <MapBattleIcon proj={proj} pos={CITIES_1429.agincourt.pos} frame={f} scale={0.72} />
            <MapFallenX proj={proj} pos={CITIES_1429.rouen.pos} scale={0.68} />

            {/* المدن بإحداثياتها الحقيقية */}
            <MapCityPin proj={proj} pos={CITIES_1429.london.pos} label="لندن" color="#c8242e" important labelOffset={[0, -28]} />
            <MapCityPin proj={proj} pos={CITIES_1429.paris.pos} label="باريس" color="#c8242e" important labelOffset={[0, -28]} />
            <MapCityPin proj={proj} pos={CITIES_1429.reims.pos} label="ريمس" color="#7b2242" labelOffset={[64, -18]} />
            <MapCityPin proj={proj} pos={CITIES_1429.orleans.pos} label="أورليان" color="#2452a4" important pulse={(f % 30) / 30} labelOffset={[0, 42]} />
            <MapCityPin proj={proj} pos={CITIES_1429.bourges.pos} label="بورج" color="#2452a4" labelOffset={[62, 24]} />
            <MapCityPin proj={proj} pos={CITIES_1429.chinon.pos} label="شينون" color="#2452a4" labelOffset={[-66, 16]} />
            <MapCityPin proj={proj} pos={CITIES_1429.poitiers.pos} label="بواتييه" color="#2452a4" labelOffset={[-66, 26]} />
            <MapCityPin proj={proj} pos={CITIES_1429.domremy.pos} label="دومريمي" color="#2b9a54" important labelOffset={[92, 8]} />
            <MapCityPin proj={proj} pos={CITIES_1429.bordeaux.pos} label="بوردو" color="#c8242e" labelOffset={[-68, 12]} />

            {/* عنوان ومفتاح الخريطة */}
            <g transform="translate(42 36)">
              <rect x={0} y={0} width={560} height={84} rx={14} fill="#fdfaf2" fillOpacity={0.94} stroke={INK} strokeWidth={3.5} />
              <text x={280} y={54} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={36} fill={INK} direction="rtl">
                خريطة فرنسا وإنجلترا الحقيقية — ١٤٢٩
              </text>
            </g>
            <MapLegend x={1490} y={36} />
          </>
        )}
      </RealEuropeMap>
    </AbsoluteFill>
  );
};
