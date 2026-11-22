import {random} from 'remotion';
import type {PersonProps} from '../characters/Person';

/** المظهر فقط (بدون موضع/إطار/تمثيل) */
export type Look = Omit<PersonProps, 'x' | 'y' | 'frame' | 'expr' | 'pose' | 'act' | 'motion' | 'travel' | 'view' | 'flip' | 'rot' | 'jolt' | 'look'>;

export type Character = {
  id: string;
  /** الاسم بالعربية كما يظهر في اللوحات */
  name: string;
  /** الحقبة/التواريخ */
  era?: string;
  /** المرجع البصري الذي بُني عليه الشكل (للدقة التاريخية) */
  ref?: string;
  look: Look;
  /** نسخ بديلة: تُدمج فوق المظهر الأساسي */
  variants?: Record<string, Partial<Look>>;
};

/**
 * دور عام (جندي، عامل، متظاهر…) يولّد أشكالاً متنوعة حتمية من seed:
 * كل خاصية إما قيمة ثابتة أو قائمة يُختار منها.
 */
export type Role = {
  id: string;
  name: string;
  era?: string;
  base: Look;
  vary: {[K in keyof Look]?: Look[K][]};
};

export const defineCharacter = (c: Character) => c;
export const defineRole = (r: Role) => r;

/** يختار مظهراً متنوعاً لدور حسب seed — نفس seed يعطي نفس الشكل دائماً */
export const roleLook = (r: Role, seed: number | string): Look => {
  const out: Look = {...r.base};
  (Object.keys(r.vary) as (keyof Look)[]).forEach((k) => {
    const opts = r.vary[k] as unknown[];
    if (opts?.length) (out as Record<string, unknown>)[k] = opts[Math.floor(random(`${r.id}-${seed}-${String(k)}`) * opts.length)];
  });
  out.seed = typeof seed === 'number' ? seed : Math.floor(random(`${r.id}-${seed}`) * 100);
  return out;
};
