import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BUILDINGS} from './world/buildings';
import {BACKDROP_LABEL, BACKDROPS, Backdrop, BackdropName} from './world/backdrops';
import {TIMES, TIME_LABEL, TimeOfDay, WorldCtx, worldFor} from './world/lighting';

/** لوحات مكتبة المباني: كل مبنى بمستوييه (مبسّط | مفصّل) */

const LABELS: Record<string, string> = {
  OttomanMosque: 'جامع عثماني',
  ByzChurch: 'كنيسة بيزنطية',
  OttomanHouse: 'بيت عثماني خشبي',
  WallTower: 'سور وبرج',
  Khan: 'خان',
  CairoHouse: 'بيت قاهري بمشربيات',
  MamlukMosque: 'جامع مملوكي',
  CityGate: 'بوابة مدينة',
  SouqStall: 'دكان سوق',
  EuroApartment: 'عمارة الخمسينيات',
  GovBuilding: 'مبنى حكومي',
  Shop: 'محل بلافتة',
  Kiosk: 'كشك',
  StreetLamp: 'عمود إنارة',
  MudHouse: 'بيت طيني ريفي',
  Pyramid: 'هرم',
  Warehouse: 'مخزن ميناء',
  Lighthouse: 'منارة',
};
const SCALE: Record<string, number> = {
  OttomanMosque: 0.42, ByzChurch: 0.5, OttomanHouse: 0.62, WallTower: 0.45, Khan: 0.4, CairoHouse: 0.55, MamlukMosque: 0.42, CityGate: 0.48, SouqStall: 0.8,
  EuroApartment: 0.5, GovBuilding: 0.38, Shop: 0.7, Kiosk: 0.95, StreetLamp: 0.8, MudHouse: 0.7, Pyramid: 0.32, Warehouse: 0.5, Lighthouse: 0.4,
};

const Sheet: React.FC<{keys: string[]; title: string; time?: TimeOfDay}> = ({keys, title, time = 'day'}) => {
  const w = worldFor(time);
  return (
    <WorldCtx.Provider value={w}>
      <AbsoluteFill style={{background: time === 'day' ? 'linear-gradient(#f6efe2, #e6d9c4)' : 'linear-gradient(#1a1d3a, #0c0f22)'}}>
        <svg width={1920} height={1080}>
          <text x={960} y={66} fontFamily="Amiri" fontSize={50} fontWeight={700} textAnchor="middle" fill={time === 'day' ? '#2a2030' : '#e8e0f0'} direction="rtl">
            {title}
          </text>
          {keys.map((k, i) => {
            const B = (BUILDINGS as Record<string, React.FC<{x: number; y: number; s?: number; D?: boolean}>>)[k];
            const col = i % 3;
            const row = Math.floor(i / 3);
            const cx = 320 + col * 640;
            const by = 370 + row * 330;
            const s = SCALE[k] ?? 0.4;
            return (
              <g key={k}>
                <rect x={cx - 300} y={by - 250} width={600} height={300} rx={14} fill={time === 'day' ? '#fff' : '#22264a'} opacity={0.35} />
                <line x1={cx - 290} x2={cx + 290} y1={by} y2={by} stroke={time === 'day' ? '#cbb89a' : '#3a3e6a'} strokeWidth={3} />
                <B x={cx - 145} y={by} s={s} D={false} />
                <B x={cx + 145} y={by} s={s} D />
                <text x={cx} y={by + 36} fontFamily="Amiri" fontSize={28} fontWeight={700} textAnchor="middle" fill={time === 'day' ? '#2a2030' : '#e8e0f0'} direction="rtl">
                  {LABELS[k]}
                </text>
                <text x={cx - 145} y={by - 230} fontFamily="Amiri" fontSize={20} textAnchor="middle" fill="#8a7a8a">
                  مبسّط
                </text>
                <text x={cx + 145} y={by - 230} fontFamily="Amiri" fontSize={20} textAnchor="middle" fill="#8a7a8a">
                  مفصّل
                </text>
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
    </WorldCtx.Provider>
  );
};

const ALL = Object.keys(LABELS);
export const BuildingsSheetA: React.FC = () => <Sheet keys={ALL.slice(0, 9)} title="مكتبة المباني ١ — عثماني وبيزنطي ومصري إسلامي" />;
export const BuildingsSheetB: React.FC = () => <Sheet keys={ALL.slice(9)} title="مكتبة المباني ٢ — الخمسينيات وعامة" />;
export const BuildingsSheetNight: React.FC = () => <Sheet keys={['MamlukMosque', 'CairoHouse', 'EuroApartment', 'Shop', 'StreetLamp', 'Lighthouse']} title="المباني ليلاً — النوافذ والمصابيح تضيء تلقائياً" time="night" />;

/* ---------------- لوحات الخلفيات: كل خلفية في الأوقات الأربعة ---------------- */

const BackdropGrid: React.FC<{names: BackdropName[]; title: string}> = ({names, title}) => (
  <AbsoluteFill style={{background: '#14121c'}}>
    <div style={{position: 'absolute', top: 18, width: '100%', textAlign: 'center', fontFamily: 'Amiri', fontWeight: 700, fontSize: 46, color: '#efe6d4', direction: 'rtl'}}>{title}</div>
    {TIMES.map((t, c) => (
      <div key={t} style={{position: 'absolute', top: 86, left: 1920 - 470 - c * 470, width: 456, textAlign: 'center', fontFamily: 'Amiri', fontSize: 30, color: '#c9bfd6'}}>
        {TIME_LABEL[t]}
      </div>
    ))}
    {names.map((n, r) => (
      <React.Fragment key={n}>
        <div style={{position: 'absolute', top: 140 + r * 312 + 110, left: 6, width: 60, fontFamily: 'Amiri', fontSize: 26, color: '#efe6d4', writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}>
          {BACKDROP_LABEL[n]}
        </div>
        {TIMES.map((t, c) => (
          <div key={t} style={{position: 'absolute', top: 140 + r * 312, left: 1920 - 470 - c * 470, width: 456, height: 256, overflow: 'hidden', borderRadius: 10}}>
            <div style={{position: 'relative', width: 1920, height: 1080, transform: 'scale(0.2375)', transformOrigin: 'top left'}}>
              <Backdrop name={n} time={t} frame={40} />
            </div>
          </div>
        ))}
      </React.Fragment>
    ))}
  </AbsoluteFill>
);

export const BackdropsSheetA: React.FC = () => <BackdropGrid names={BACKDROPS.slice(0, 3)} title="مكتبة الخلفيات ١" />;
export const BackdropsSheetB: React.FC = () => <BackdropGrid names={BACKDROPS.slice(3, 6)} title="مكتبة الخلفيات ٢" />;
export const BackdropsSheetC: React.FC = () => <BackdropGrid names={BACKDROPS.slice(6, 9)} title="مكتبة الخلفيات ٣" />;
