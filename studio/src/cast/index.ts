/* =====================================================================
 * مكتبة الشخصيات — مصدر واحد لمظهر كل شخصية في كل الحلقات.
 *
 *   look('nasser')                         // المظهر الأساسي
 *   look('nasser', {variant: 'sixties'})   // نسخة بديلة
 *   look('nasser', {shading: 'cel'})       // أي خاصية إضافية تُدمج فوقه
 *   extra('janissary', 3)                  // شكل متنوع من دور عام (seed = 3)
 *   castOf({ali: 'nasser', g1: ['byzGuard', 1]}, {shading: 'cel'})   // لسكريبت الحركة
 * ===================================================================== */
import type {CastMember} from '../lib/script';
import {Character, Look, Role, roleLook, roleVoice} from './define';
import {HISTORICAL} from './historical';
import {ROLES} from './roles';

export {HISTORICAL, ROLES};
export type {Character, Look, Role};

export type CharacterId = keyof typeof HISTORICAL;
export type RoleId = keyof typeof ROLES;

export const look = (id: CharacterId, opts: {variant?: string} & Partial<Look> = {}): Look => {
  const c: Character = HISTORICAL[id];
  if (!c) throw new Error(`شخصية غير موجودة في المكتبة: ${id}`);
  const {variant, ...over} = opts;
  const v = variant ? c.variants?.[variant] : undefined;
  if (variant && !v) throw new Error(`النسخة "${variant}" غير موجودة لـ ${id}. المتاح: ${Object.keys(c.variants ?? {}).join('، ')}`);
  return {...c.look, ...v, ...over};
};

/** المظهر الأساسي لدور بلا تنويع (للشخصية الرئيسية من الدور) */
export const roleBase = (role: RoleId, over: Partial<Look> = {}): Look => ({...ROLES[role].base, ...over});

/** صوت شخصية تاريخية أو فرد من دور */
export const voiceOf = (id: CharacterId | RoleId, seed: number | string = 0) =>
  id in HISTORICAL ? HISTORICAL[id as CharacterId].voice : roleVoice(ROLES[id as RoleId], seed);

export const extra = (role: RoleId, seed: number | string, over: Partial<Look> = {}): Look => ({...roleLook(ROLES[role], seed), ...over});

/** يبني CastMember لسكريبت الحركة: القيمة إما id شخصية تاريخية، أو [دور، seed]، أو مظهر جاهز */
export const castOf = (
  map: Record<string, CharacterId | [RoleId, number | string] | Look>,
  over: Partial<CastMember> = {},
): Record<string, CastMember> => {
  const out: Record<string, CastMember> = {};
  for (const [k, v] of Object.entries(map)) {
    const base = typeof v === 'string' ? look(v) : Array.isArray(v) ? extra(v[0], v[1]) : v;
    const voice = typeof v === 'string' ? HISTORICAL[v].voice : Array.isArray(v) ? roleVoice(ROLES[v[0]], v[1]) : undefined;
    out[k] = {...base, ...(voice ? {voice} : {}), ...over} as CastMember;
  }
  return out;
};
