import React from 'react';

/* =====================================================================
 * إضاءة الشخصيات بألوان المشهد (البند ٨)
 * تقرؤها Person من CharLightCtx (توفّره Backdrop تلقائياً حسب الوقت)، أو من prop light.
 * ===================================================================== */

export type PointLight = {x: number; y: number; color: string; r: number};

export type CharLight = {
  /** جهة الضوء الرئيسي على الشاشة: −1 من اليسار، 1 من اليمين */
  dir: number;
  /** لون حافة الضوء (القمر/الشمس) */
  key: string;
  /** لون الظل (يحل محل البنفسجي الافتراضي) */
  shadow: string;
  /** 0..1 صبغة لون الجو فوق الشخصية كلها (الليل أعلى) */
  ambient: number;
  /** 0..1 شدة حافة الضوء */
  rim: number;
  /** مصادر ضوء نقطية بنفس إحداثيات الشخصيات (نار، مصباح، مشعل) */
  points?: PointLight[];
};

export const CharLightCtx = React.createContext<CharLight | null>(null);

/** إضاءة جاهزة لكل وقت (تستخدمها Backdrop) */
export const LIGHT_BY_TIME: Record<'dawn' | 'day' | 'dusk' | 'night', Omit<CharLight, 'dir' | 'points'>> = {
  dawn: {key: '#ffb08a', shadow: '#5a2f55', ambient: 0.12, rim: 0.7},
  day: {key: '#fff6dc', shadow: '#3a3a5a', ambient: 0, rim: 0.35},
  dusk: {key: '#ffa070', shadow: '#3e2452', ambient: 0.18, rim: 0.85},
  night: {key: '#9fb4ee', shadow: '#16204a', ambient: 0.34, rim: 0.6},
};
