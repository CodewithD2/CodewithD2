import React from 'react';
import type {Palette} from '../lib/palette';
import {dawnAt, toHex} from '../lib/palette';
import {mixColor} from '../lib/util';

/* ===================== الإضاءة حسب الوقت =====================
 * كل المباني والخلفيات تقرأ الإضاءة من WorldCtx فتتلون وتُظلَّل وتضيء نوافذها تلقائياً.
 */
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';
export const TIMES: TimeOfDay[] = ['dawn', 'day', 'dusk', 'night'];
export const TIME_LABEL: Record<TimeOfDay, string> = {dawn: 'فجر', day: 'نهار', dusk: 'غروب', night: 'ليل'};

const DAY: Palette = {
  skyTop: '#5f9fd6',
  skyMid: '#9cc8e8',
  horizon: '#e9e2cf',
  haze: '#cfd8dc',
  far: '#a9b4b8',
  city: '#9a8a78',
  mid: '#8a7a68',
  near: '#5a4a3e',
  rim: '#fff6e0',
  water1: '#5a9ab8',
  water2: '#2a5a78',
  light: '#fffbe8',
  warm: '#ffd27a',
  smoke: '#e8e2d8',
  gradeTop: '#ffe9c0',
  gradeBottom: '#3a4a5a',
  gradeOpacity: 0.25,
};
const DUSK: Palette = {
  skyTop: '#1e2350',
  skyMid: '#6a3e6a',
  horizon: '#f08a5a',
  haze: '#b0708a',
  far: '#5a4670',
  city: '#3a2e4e',
  mid: '#2e2440',
  near: '#1c1628',
  rim: '#ffb08a',
  water1: '#5a4a7a',
  water2: '#161226',
  light: '#ffd9a0',
  warm: '#ffcf7a',
  smoke: '#a090b0',
  gradeTop: '#ff9a70',
  gradeBottom: '#1a1438',
  gradeOpacity: 0.42,
};
const NIGHT: Palette = {
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

/** لوحة كل وقت (الفجر من dawnAt بعد الشروق بقليل) */
export const paletteFor = (time: TimeOfDay): Palette => {
  if (time === 'day') return DAY;
  if (time === 'dusk') return DUSK;
  if (time === 'night') return NIGHT;
  const d = dawnAt(0.75);
  const out = {} as Palette;
  (Object.keys(d) as (keyof Palette)[]).forEach((k) => ((out as Record<string, unknown>)[k] = typeof d[k] === 'string' ? toHex(d[k] as string) : d[k]));
  return out;
};

export type World = {
  time: TimeOfDay;
  P: Palette;
  /** 0..1 كم تُضاء النوافذ والمصابيح */
  lit: number;
  /** 0..1 كم يُصبغ لون المبنى بلون الجو/الليل */
  tint: number;
  /** جهة الضوء: −1 من اليسار، 1 من اليمين */
  lightDir: number;
  /** موقع الشمس/القمر في السماء (إحداثيات الشاشة) */
  sun: [number, number];
};

export const worldFor = (time: TimeOfDay): World => ({
  time,
  P: paletteFor(time),
  lit: {dawn: 0.25, day: 0, dusk: 0.75, night: 1}[time],
  tint: {dawn: 0.28, day: 0.06, dusk: 0.35, night: 0.58}[time],
  lightDir: time === 'dusk' ? 1 : -1,
  sun: ({dawn: [380, 640], day: [1450, 170], dusk: [1580, 620], night: [1480, 170]} as Record<TimeOfDay, [number, number]>)[time],
});

export const WorldCtx = React.createContext<World>(worldFor('day'));
export const useWorld = () => React.useContext(WorldCtx);

/** يصبغ لون مادة المبنى بإضاءة الوقت (أغمق وأبرد ليلاً، أدفأ عند الغروب) */
export const tinted = (w: World, c: string) => mixColor(toHex(c), toHex(w.time === 'day' ? w.P.haze : w.P.city), w.tint);
/** درجة الظل والضوء لنفس المادة */
export const shadeOf = (w: World, c: string, k = 0.32) => mixColor(toHex(tinted(w, c)), toHex(w.P.near), k);
export const lightOf = (w: World, c: string, k = 0.22) => mixColor(toHex(tinted(w, c)), toHex(w.P.rim), k);
