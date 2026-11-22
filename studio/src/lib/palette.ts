import {mixColor} from './util';

/**
 * لوحة ألوان المشهد: كل الألوان تُشتق منها حتى يبدو المشهد متماسكاً.
 * - haze: لون الجو/الأفق — الطبقات البعيدة تذوب فيه (atmospheric perspective)
 * - grade*: طبقة التلوين النهائية فوق المشهد كله (تشمل الشخصيات)
 */
export type Palette = {
  skyTop: string;
  skyMid: string;
  horizon: string;
  haze: string;
  far: string; // أبعد التلال
  city: string; // كتل المدينة
  mid: string; // تلال متوسطة
  near: string; // الأرض القريبة
  rim: string; // حافة الضوء (ضوء القمر/الشمس)
  water1: string;
  water2: string;
  light: string; // المصدر الرئيسي (قمر/شمس)
  warm: string; // ضوء النار والنوافذ
  smoke: string;
  gradeTop: string;
  gradeBottom: string;
  gradeOpacity: number;
};

export const NIGHT_CITY: Palette = {
  skyTop: '#050a1c',
  skyMid: '#13234a',
  horizon: '#3d5287',
  haze: '#4b6196',
  far: '#2a3a68',
  city: '#16203f',
  mid: '#101831',
  near: '#0b0f20',
  rim: '#9fb4ee',
  water1: '#1d2d58',
  water2: '#050913',
  light: '#eef2ff',
  warm: '#ffb45e',
  smoke: '#8f9cc4',
  gradeTop: '#3a56a8',
  gradeBottom: '#0d0f2a',
  gradeOpacity: 0.5,
};

export const CAMP: Palette = {
  skyTop: '#0a0820',
  skyMid: '#261a45',
  horizon: '#8c3d4c',
  haze: '#6e3b58',
  far: '#3c2650',
  city: '#2a1a3e',
  mid: '#24162f',
  near: '#170e1c',
  rim: '#f0a070',
  water1: '#33275a',
  water2: '#120c22',
  light: '#d6dcff',
  warm: '#ff9a3c',
  smoke: '#7a6a80',
  gradeTop: '#5a2f7a',
  gradeBottom: '#3a0f12',
  gradeOpacity: 0.55,
};

export const HAUL: Palette = {
  skyTop: '#040714',
  skyMid: '#111b3a',
  horizon: '#363a63',
  haze: '#424a78',
  far: '#252e56',
  city: '#1a2142',
  mid: '#161c38',
  near: '#0d1022',
  rim: '#8fa2dc',
  water1: '#1c2a52',
  water2: '#070b18',
  light: '#e6ebff',
  warm: '#ffa648',
  smoke: '#7c7f99',
  gradeTop: '#34478f',
  gradeBottom: '#24100c',
  gradeOpacity: 0.5,
};

const DAWN_A: Palette = {
  skyTop: '#1f1c45',
  skyMid: '#5a3660',
  horizon: '#b8606a',
  haze: '#a86a80',
  far: '#4a3458',
  city: '#33243f',
  mid: '#2a1d33',
  near: '#1b1322',
  rim: '#ff9f80',
  water1: '#5a3a5e',
  water2: '#160f1f',
  light: '#ffd9a8',
  warm: '#ffb060',
  smoke: '#a08aa0',
  gradeTop: '#6a3f8f',
  gradeBottom: '#2a1028',
  gradeOpacity: 0.45,
};

const DAWN_B: Palette = {
  skyTop: '#41406f',
  skyMid: '#d9775e',
  horizon: '#ffd28c',
  haze: '#ffc49a',
  far: '#b0707e',
  city: '#6e4357',
  mid: '#4c2c40',
  near: '#2a1826',
  rim: '#fff0c0',
  water1: '#d98a68',
  water2: '#2a1626',
  light: '#fff3d0',
  warm: '#ffc070',
  smoke: '#e8c0a8',
  gradeTop: '#ffb070',
  gradeBottom: '#3a1636',
  gradeOpacity: 0.4,
};

/** الفجر يتدرج من ما قبل الشروق إلى الضوء الذهبي */
export const dawnAt = (t: number): Palette => {
  const out = {} as Palette;
  (Object.keys(DAWN_A) as (keyof Palette)[]).forEach((k) => {
    const a = DAWN_A[k];
    const b = DAWN_B[k];
    (out as Record<string, unknown>)[k] = typeof a === 'number' ? a + ((b as number) - a) * t : mixColor(a as string, b as string, t);
  });
  return out;
};

/** يذيب لوناً في لون الجو حسب البعد (0 = قريب، 1 = عند الأفق) */
export const atmos = (color: string, haze: string, t: number) => mixColor(toHex(color), toHex(haze), t);

/** يقبل #rrggbb أو rgb(r,g,b) ويعيد #rrggbb */
export const toHex = (c: string) => {
  if (c.startsWith('#')) return c;
  const m = c.match(/\d+/g);
  if (!m) return '#000000';
  return '#' + m.slice(0, 3).map((v) => (+v).toString(16).padStart(2, '0')).join('');
};
