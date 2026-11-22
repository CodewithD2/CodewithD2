import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Act, Expr, Person, PersonProps, Pose, VIEW_YAW, View} from '../characters/Person';
import {Held, ITEM_MODE, ItemId} from '../characters/items';
import {makeCamTimeline} from './camscript';
import {CAM0, Cam} from './stage';
import {SfxEvent, SFX_NAMES, footsteps} from './sfx';

/* =====================================================================
 * سكريبت الحركة — تكتب التمثيل كنص، والمحرك يحسب كل إطار.
 *
 *   @0s        younis:  enter x=-200 y=915 | walk to 700
 *   @"فوراً"    younis:  act orate energy=0.6 for 2s
 *   @after younis  officer: run to 1300
 *
 * التوقيت:  @2s  @2.5  @45f  @+1s (بعد السطر السابق)  @"كلمة"  @"كلمتان معاً"+0.3s  @"كلمة"#2
 *           @after <id>  (حين تنهي الشخصية آخر أوامرها)
 * الأوامر في السطر الواحد تُنفَّذ بالتتابع ويفصل بينها |
 * ===================================================================== */

export type Word = {t: number; d: number; text: string};
export type CastMember = Omit<PersonProps, 'x' | 'y' | 'frame'> & {x?: number; y?: number; s?: number; autoFront?: boolean};
export type SceneOpts = {
  /** عمق طبقة الممثلين (d) — تحتاجه الكاميرا للمتابعة والتكبير. افتراضي 150 (مثل Backdrop) */
  camDepth?: number;
  fps?: number;
  cast: Record<string, CastMember>;
  /** توقيت كلمات التعليق (من narrate.py → *.words.json) */
  words?: Word[];
  /** ثوانٍ تُضاف لتوقيت الكلمة لتحويله لزمن اللقطة (انظر wordOffsetForShot) */
  wordOffset?: number;
};

const SPEED: Record<string, number> = {slow: 95, normal: 150, fast: 215}; // بكسل/ثانية عند s=1
const RUN_SPEED = 400;
const TURN_DUR = 0.35;

type PosSeg = {t0: number; t1: number; x0: number; x1: number; y0: number; y1: number; s0: number; s1: number; kind: 'walk' | 'run' | 'move' | 'set'; trav0: number};
type YawSeg = {t0: number; t1: number; a0: number; a1: number; soft?: boolean};
type Step<T> = {t: number; v: T};

type ActorTL = {
  pos: PosSeg[];
  yaw: YawSeg[];
  flip: Step<boolean>[];
  act: Step<Act | undefined>[];
  expr: Step<Expr | undefined>[];
  pose: Step<Pose | undefined>[];
  energy: Step<number>[];
  visible: Step<boolean>[];
  autoFront: Step<boolean>[];
  holdR: Step<Held | undefined>[];
  holdL: Step<Held | undefined>[];
  jumps: {t0: number; t1: number; h: number}[];
  steps: Step<boolean>[];
  cursor: number; // متى تنتهي آخر أوامر الشخصية
};

export type ActorState = {
  x: number;
  y: number;
  s: number;
  flip: boolean;
  view: number;
  motion: 'idle' | 'walk' | 'run';
  travel: number;
  act?: Act;
  expr?: Expr;
  pose?: Pose;
  energy: number;
  visible: boolean;
  holdR?: Held;
  holdL?: Held;
};

export class ScriptError extends Error {
  constructor(
    public line: number,
    msg: string,
  ) {
    super(`سطر ${line}: ${msg}`);
  }
}

/* ---------- أدوات ---------- */
const stepAt = <T,>(steps: Step<T>[], t: number, def: T): T => {
  let v = def;
  for (const s of steps) if (s.t <= t + 1e-9) v = s.v;
  return v;
};
const smooth = (u: number) => u * u * (3 - 2 * u);
const normAr = (s: string) =>
  s
    .replace(/[ً-ٰٟـ]/g, '') // تشكيل وتطويل
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}]/gu, '');

const tokenize = (s: string) => (s.match(/"[^"]*"|\S+/g) ?? []).map((t) => t.trim());

const parseSeconds = (tok: string, fps: number, line: number): number => {
  const m = tok.match(/^([+-]?\d+(?:\.\d+)?)(s|f)?$/);
  if (!m) throw new ScriptError(line, `قيمة زمن غير مفهومة: ${tok}`);
  return m[2] === 'f' ? +m[1] / fps : +m[1];
};

/* ---------- البناء ---------- */
export type Scene = {
  error?: ScriptError;
  cast: Record<string, CastMember>;
  fps: number;
  lines: {line: number; t: number; text: string}[];
  at: (id: string, frame: number) => ActorState;
  /** الكاميرا من أسطر `camera:` (CAM0 إن لم تُستخدم) */
  cam: (frame: number) => Cam;
  /** كل الأصوات بالترتيب الزمني: أوامر sfx + القفز + ضربات السيف + الخطوات التلقائية */
  sfx: () => SfxEvent[];
};

export const buildScene = (script: string, opts: SceneOpts): Scene => {
  const fps = opts.fps ?? 30;
  const cast = opts.cast;
  const tl: Record<string, ActorTL> = {};
  const lines: Scene['lines'] = [];
  const camTL = makeCamTimeline(opts.camDepth ?? 150);
  let camCursor = 0;
  const sfxList: SfxEvent[] = [];
  const addSfx = (line: number, t: number, name: string, kv: Record<string, string>, forDur?: number, who?: string) => {
    if (!SFX_NAMES.includes(name)) throw new ScriptError(line, `صوت غير معروف: ${name}. المتاح: ${SFX_NAMES.join(' ')}`);
    sfxList.push({t: t + (kv.delay ? parseSeconds(kv.delay, fps, line) : 0), name, vol: kv.vol ? +kv.vol : 1, dur: forDur, who});
  };

  const actor = (id: string, line: number) => {
    if (!cast[id]) throw new ScriptError(line, `شخصية غير معرّفة: ${id} (المتاح: ${Object.keys(cast).join('، ')})`);
    if (!tl[id]) {
      const c = cast[id];
      tl[id] = {
        pos: [{t0: 0, t1: 0, x0: c.x ?? 0, x1: c.x ?? 0, y0: c.y ?? 900, y1: c.y ?? 900, s0: c.s ?? 1, s1: c.s ?? 1, kind: 'set', trav0: 0}],
        yaw: [{t0: 0, t1: 0, a0: 0, a1: typeof c.view === 'number' ? c.view : c.view ? VIEW_YAW[c.view] : 0}],
        flip: [{t: 0, v: !!c.flip}],
        act: [{t: 0, v: c.act}],
        expr: [{t: 0, v: c.expr}],
        pose: [{t: 0, v: c.pose}],
        energy: [{t: 0, v: c.energy ?? 0.5}],
        visible: [{t: 0, v: true}],
        autoFront: [{t: 0, v: c.autoFront ?? true}],
        holdR: [{t: 0, v: c.holdR}],
        holdL: [{t: 0, v: c.holdL}],
        jumps: [],
        steps: [{t: 0, v: true}],
        cursor: 0,
      };
    }
    return tl[id];
  };

  const posAt = (a: ActorTL, t: number) => {
    let seg = a.pos[0];
    for (const s of a.pos) if (s.t0 <= t + 1e-9) seg = s;
    const u = seg.t1 > seg.t0 ? Math.min(1, Math.max(0, (t - seg.t0) / (seg.t1 - seg.t0))) : 1;
    const e = seg.kind === 'move' ? smooth(u) : 0.8 * u + 0.2 * smooth(u);
    const x = seg.x0 + (seg.x1 - seg.x0) * e;
    const y = seg.y0 + (seg.y1 - seg.y0) * e;
    const s = seg.s0 + (seg.s1 - seg.s0) * e;
    const moving = u < 1 && seg.t1 > seg.t0 && (seg.kind === 'walk' || seg.kind === 'run');
    return {x, y, s, seg, moving, trav: seg.trav0 + Math.hypot(x - seg.x0, y - seg.y0)};
  };
  const yawAtT = (a: ActorTL, t: number) => {
    let seg = a.yaw[0];
    for (const s of a.yaw) if (s.t0 <= t + 1e-9) seg = s;
    const u = seg.t1 > seg.t0 ? Math.min(1, Math.max(0, (t - seg.t0) / (seg.t1 - seg.t0))) : 1;
    return seg.a0 + (seg.a1 - seg.a0) * smooth(u);
  };
  /** يقطع كل ما يبدأ بعد t (أوامر "ناعمة" سابقة كالالتفات التلقائي) */
  const cutPos = (a: ActorTL, t: number) => {
    const p = posAt(a, t);
    a.pos = a.pos.filter((s) => s.t0 <= t + 1e-9);
    const last = a.pos[a.pos.length - 1];
    if (last.t1 > t) Object.assign(last, {t1: t, x1: p.x, y1: p.y, s1: p.s});
    return p;
  };
  const cutYaw = (a: ActorTL, t: number) => {
    const y = yawAtT(a, t);
    a.yaw = a.yaw.filter((s) => s.t0 <= t + 1e-9);
    const last = a.yaw[a.yaw.length - 1];
    if (last.t1 > t) Object.assign(last, {t1: t, a1: y});
    return y;
  };
  const addYaw = (a: ActorTL, t: number, to: number, dur: number, soft = false) => {
    const from = cutYaw(a, t);
    a.yaw.push({t0: t, t1: t + dur, a0: from, a1: to, soft});
  };
  const flipAt = (a: ActorTL, t: number) => stepAt(a.flip, t, false);
  /** التفات لمواجهة جهة (يمر بالأمام إن تغيرت الجهة) — يعيد زمن الانتهاء */
  const faceDir = (a: ActorTL, t: number, left: boolean, endYaw: number) => {
    if (flipAt(a, t) === left) {
      addYaw(a, t, endYaw, Math.abs(yawAtT(a, t) - endYaw) > 1 ? 0.25 : 0);
      return t;
    }
    addYaw(a, t, 0, 0.15);
    a.flip = a.flip.filter((s) => s.t <= t + 0.15);
    a.flip.push({t: t + 0.15, v: left});
    addYaw(a, t + 0.15, endYaw, 0.15);
    return t + 0.3;
  };
  const autoFrontAfter = (a: ActorTL, t: number) => {
    if (stepAt(a.autoFront, t, true)) addYaw(a, t + 0.1, 0, TURN_DUR, true);
  };

  let prevT = 0;
  const raw = script.split('\n');
  raw.forEach((src, i) => {
    const line = i + 1;
    const text = src.trim();
    if (!text || text.startsWith('#') || text.startsWith('//')) return;
    const m = text.match(/^@(\S+(?:\s+\S+)?)\s+([A-Za-z_][\w]*)\s*:\s*(.+)$/) ?? text.match(/^@("[^"]+"(?:#\d+)?(?:[+-][\d.]+[sf]?)?)\s+([A-Za-z_][\w]*)\s*:\s*(.+)$/);
    if (!m) throw new ScriptError(line, 'الصيغة: @<زمن> <شخصية>: <أمر> | <أمر> …');
    const [, when, id, body] = m;
    // ---- الزمن ----
    let t: number;
    if (when.startsWith('after')) {
      const other = when.split(/\s+/)[1];
      if (other === 'camera') t = camCursor;
      else if (!other || !tl[other]) throw new ScriptError(line, `@after تحتاج شخصية سبق ذكرها: ${other}`);
      else t = tl[other].cursor;
    } else if (when.startsWith('"')) {
      const mm = when.match(/^"([^"]+)"(?:#(\d+))?([+-][\d.]+[sf]?)?$/);
      if (!mm) throw new ScriptError(line, `صيغة كلمة غير مفهومة: ${when}`);
      if (!opts.words) throw new ScriptError(line, 'لا توجد توقيتات كلمات (words) لهذه اللقطة');
      const target = mm[1].split(/\s+/).map(normAr).filter(Boolean);
      const ws = opts.words.map((w) => normAr(w.text));
      let hit = -1;
      let seen = 0;
      const need = mm[2] ? +mm[2] : 1;
      for (let k = 0; k + target.length <= ws.length; k++) {
        if (target.every((tw, j) => ws[k + j] === tw || ws[k + j].includes(tw))) {
          seen++;
          if (seen === need) {
            hit = k;
            break;
          }
        }
      }
      if (hit < 0) throw new ScriptError(line, `الكلمة غير موجودة في التعليق: "${mm[1]}"`);
      t = opts.words[hit].t + (opts.wordOffset ?? 0) + (mm[3] ? parseSeconds(mm[3], fps, line) : 0);
    } else if (when.startsWith('+')) {
      t = prevT + parseSeconds(when.slice(1), fps, line);
    } else {
      t = parseSeconds(when, fps, line);
    }
    prevT = t;
    lines.push({line, t, text});
    if (id === 'camera') {
      const fail = (msg: string): never => {
        throw new ScriptError(line, msg);
      };
      camCursor = Math.max(camCursor, camTL.run(body, t, fail, (tok) => parseSeconds(tok, fps, line), (x) => !!cast[x], (tt, name, kv, d) => addSfx(line, tt, name, kv, d)));
      return;
    }
    const a = actor(id, line);

    // ---- الأوامر بالتتابع ----
    let cur = t;
    for (const cmdRaw of body.split('|')) {
      const tok = tokenize(cmdRaw);
      if (!tok.length) continue;
      const kv: Record<string, string> = {};
      const pos: string[] = [];
      for (const k of tok.slice(1)) {
        const e = k.indexOf('=');
        if (e > 0) kv[k.slice(0, e)] = k.slice(e + 1).replace(/"/g, '');
        else pos.push(k.replace(/"/g, ''));
      }
      if (kv.energy) a.energy.push({t: cur, v: +kv.energy});
      const forDur = (() => {
        const fi = pos.indexOf('for');
        return fi >= 0 && pos[fi + 1] ? parseSeconds(pos[fi + 1], fps, line) : undefined;
      })();
      const cmd = tok[0];
      switch (cmd) {
        case 'enter':
        case 'place': {
          // أول enter بعد البداية: الشخصية مخفية قبله
          if (cmd === 'enter' && cur > 0 && a.pos.length === 1 && a.visible.length === 1) a.visible[0] = {t: 0, v: false};
          const p = cutPos(a, cur);
          a.pos.push({t0: cur, t1: cur, x0: p.x, x1: kv.x ? +kv.x : p.x, y0: p.y, y1: kv.y ? +kv.y : p.y, s0: p.s, s1: kv.s ? +kv.s : p.s, kind: 'set', trav0: p.trav});
          const pp = a.pos[a.pos.length - 1];
          Object.assign(pp, {x0: pp.x1, y0: pp.y1, s0: pp.s1});
          if (kv.view) addYaw(a, cur, isNaN(+kv.view) ? VIEW_YAW[kv.view as View] : +kv.view, 0);
          if (kv.face) a.flip.push({t: cur, v: kv.face === 'left'});
          a.visible.push({t: cur, v: true});
          break;
        }
        case 'walk':
        case 'run':
        case 'move': {
          if (pos[0] !== 'to') throw new ScriptError(line, `${cmd} to <x> أو ${cmd} to x=.. y=.. s=..`);
          const p = cutPos(a, cur);
          const tx = pos[1] !== undefined && !isNaN(+pos[1]) ? +pos[1] : kv.x ? +kv.x : p.x;
          const ty = kv.y ? +kv.y : p.y;
          const ts = kv.s ? +kv.s : p.s;
          const dx = tx - p.x;
          const dy = ty - p.y;
          const dist = Math.hypot(dx, dy);
          const sc = (p.s + ts) / 2;
          const sp = (cmd === 'run' ? RUN_SPEED : SPEED[kv.speed] ?? (kv.speed ? +kv.speed : SPEED.normal)) * sc;
          const dur = kv.dur ? parseSeconds(kv.dur, fps, line) : Math.max(0.25, dist / sp);
          // الاتجاه: جانبي تلقائياً للحركة الأفقية، وإلا يبقى الاتجاه الحالي (مثل الابتعاد بالظهر)
          let start = cur;
          if (cmd !== 'move') {
            const horiz = Math.abs(dx) > 2 * Math.abs(dy);
            const v = kv.view ? (isNaN(+kv.view) ? VIEW_YAW[kv.view as View] : +kv.view) : horiz ? 90 : yawAtT(a, cur);
            start = Math.abs(dx) > 4 ? faceDir(a, cur, dx < 0, v) : (addYaw(a, cur, v, 0.25), cur);
          }
          a.pos.push({t0: start, t1: start, x0: p.x, x1: p.x, y0: p.y, y1: p.y, s0: p.s, s1: p.s, kind: 'set', trav0: p.trav});
          a.pos.push({t0: start, t1: start + dur, x0: p.x, x1: tx, y0: p.y, y1: ty, s0: p.s, s1: ts, kind: cmd as PosSeg['kind'], trav0: p.trav});
          cur = start + dur;
          if (cmd !== 'move') autoFrontAfter(a, cur);
          break;
        }
        case 'stop': {
          cutPos(a, cur);
          autoFrontAfter(a, cur);
          break;
        }
        case 'wait':
          cur += parseSeconds(pos[0] ?? '1', fps, line);
          break;
        case 'turn': {
          const name = pos[0];
          const to = name in VIEW_YAW ? VIEW_YAW[name as View] : !isNaN(+name) ? +name : NaN;
          if (isNaN(to)) throw new ScriptError(line, `turn ${name}؟ المتاح: ${Object.keys(VIEW_YAW).join('، ')} أو زاوية`);
          const dur = pos[1] && pos[1] !== 'for' ? parseSeconds(pos[1], fps, line) : TURN_DUR;
          addYaw(a, cur, to, dur);
          cur += dur;
          break;
        }
        case 'face': {
          if (pos[0] !== 'left' && pos[0] !== 'right') throw new ScriptError(line, 'face left أو face right');
          cur = faceDir(a, cur, pos[0] === 'left', yawAtT(a, cur) || 45);
          break;
        }
        case 'look': {
          const other = pos[0] === 'at' ? pos[1] : pos[0];
          if (!other || !tl[other]) throw new ScriptError(line, `look at <شخصية سبق ذكرها>`);
          const ox = posAt(tl[other], cur).x;
          cur = faceDir(a, cur, ox < posAt(a, cur).x, Math.max(45, yawAtT(a, cur)));
          break;
        }
        case 'act':
        case 'expr':
        case 'pose': {
          const v = pos[0] === 'none' || pos[0] === 'calm' ? undefined : (pos[0] as never);
          const arr = a[cmd] as unknown as Step<unknown>[];
          const prev = stepAt(arr, cur, undefined);
          arr.push({t: cur, v});
          if (cmd === 'pose' && v === 'swing' && kv.sound !== 'off') for (let k = 0; k < Math.max(1, Math.round(forDur ?? 2)); k++) sfxList.push({t: cur + 0.35 + k, name: 'whoosh', vol: 0.8, who: id});
          if (forDur !== undefined) {
            arr.push({t: cur + forDur, v: prev});
            cur += forDur;
          }
          break;
        }
        case 'energy':
          a.energy.push({t: cur, v: +pos[0]});
          break;
        case 'jump': {
          const h = kv.height ? +kv.height : 70;
          a.jumps.push({t0: cur, t1: cur + 0.5, h});
          if (kv.sound !== 'off') sfxList.push({t: cur + 0.5, name: 'land', vol: 0.8, who: id});
          cur += 0.5;
          break;
        }
        case 'take': {
          // take <item> [right|left] [text="..."]
          const it = pos[0] as ItemId;
          if (!it || !(it in ITEM_MODE)) throw new ScriptError(line, `take <شيء>؟ المتاح: ${Object.keys(ITEM_MODE).join('، ')}`);
          const held: Held = kv.text ? {id: it, text: kv.text} : it;
          (pos[1] === 'left' ? a.holdL : a.holdR).push({t: cur, v: held});
          break;
        }
        case 'drop': {
          const side = pos[0] ?? 'right';
          if (side === 'right' || side === 'both') a.holdR.push({t: cur, v: undefined});
          if (side === 'left' || side === 'both') a.holdL.push({t: cur, v: undefined});
          break;
        }
        case 'give': {
          // give [right|left] to <id>: مدّ اليد، ينتقل الشيء، ثم يعود كل منهما
          const side = pos[0] === 'left' ? 'left' : 'right';
          const ti = pos.indexOf('to');
          const other = ti >= 0 ? pos[ti + 1] : undefined;
          if (!other) throw new ScriptError(line, 'give [right|left] to <شخصية>');
          const b = actor(other, line);
          const from = side === 'left' ? a.holdL : a.holdR;
          const item = stepAt(from, cur, undefined);
          if (!item) throw new ScriptError(line, `${id} لا يمسك شيئاً في يده ${side === 'left' ? 'اليسرى' : 'اليمنى'}`);
          const prevPoseA = stepAt(a.pose, cur, undefined);
          const prevPoseB = stepAt(b.pose, cur, undefined);
          a.pose.push({t: cur, v: 'present'});
          b.pose.push({t: cur + 0.25, v: 'present'});
          from.push({t: cur + 0.5, v: undefined});
          b.holdR.push({t: cur + 0.5, v: item});
          a.pose.push({t: cur + 0.8, v: prevPoseA});
          b.pose.push({t: cur + 0.95, v: prevPoseB});
          cur += 0.8;
          b.cursor = Math.max(b.cursor, cur + 0.15);
          break;
        }
        case 'sfx':
          // sfx <name> [vol=0.8] [delay=0.2s] [for 3s] — `for` للأصوات الممتدة (أمواج، هتاف…)
          addSfx(line, cur, pos[0], kv, forDur, id);
          break;
        case 'steps':
          // steps off|on — إيقاف/تشغيل الخطوات التلقائية
          a.steps.push({t: cur, v: pos[0] !== 'off'});
          break;
        case 'hold':
          a.autoFront.push({t: cur, v: false});
          a.yaw = a.yaw.filter((s) => !(s.soft && s.t0 >= cur - 0.2));
          break;
        case 'release':
          a.autoFront.push({t: cur, v: true});
          break;
        case 'hide':
        case 'exit':
          a.visible.push({t: cur, v: false});
          break;
        case 'show':
          a.visible.push({t: cur, v: true});
          break;
        default:
          throw new ScriptError(
            line,
            `أمر غير معروف: ${cmd}. المتاح: enter walk run move stop wait turn face look act expr pose energy jump take drop give sfx steps hold release show hide exit`,
          );
      }
    }
    a.cursor = Math.max(a.cursor, cur);
  });

  const at = (id: string, frame: number): ActorState => {
    const a = tl[id];
    const c = cast[id];
    const t = frame / fps;
    if (!a) return {x: c?.x ?? 0, y: c?.y ?? 900, s: c?.s ?? 1, flip: !!c?.flip, view: 0, motion: 'idle', travel: 0, energy: c?.energy ?? 0.5, visible: true, act: c?.act, expr: c?.expr, pose: c?.pose};
    const p = posAt(a, t);
    const j = a.jumps.find((jj) => t >= jj.t0 && t <= jj.t1);
    const jy = j ? -Math.sin(((t - j.t0) / (j.t1 - j.t0)) * Math.PI) * j.h : 0;
    return {
      x: p.x,
      y: p.y + jy,
      s: p.s,
      flip: stepAt(a.flip, t, false),
      view: yawAtT(a, t),
      motion: p.moving ? (p.seg.kind === 'run' ? 'run' : 'walk') : 'idle',
      travel: p.trav,
      act: stepAt(a.act, t, undefined),
      expr: stepAt(a.expr, t, undefined),
      pose: stepAt(a.pose, t, undefined),
      energy: stepAt(a.energy, t, 0.5),
      visible: stepAt(a.visible, t, true),
      holdR: stepAt(a.holdR, t, undefined),
      holdL: stepAt(a.holdL, t, undefined),
    };
  };

  let sfxCache: SfxEvent[] | undefined;
  const sfx = (): SfxEvent[] => {
    if (!sfxCache) {
      const end = Math.max(camCursor, ...Object.values(tl).map((a) => a.cursor)) + 1;
      const auto = Object.keys(tl).flatMap((id) =>
        footsteps(id, Math.ceil(end * fps), fps, (f) => at(id, f), cast[id]?.seed ?? 0).filter((e) => stepAt(tl[id].steps, e.t, true)),
      );
      sfxCache = [...sfxList, ...auto].sort((x, y) => x.t - y.t);
    }
    return sfxCache;
  };
  const cam = (frame: number): Cam => (camTL.used() ? camTL.at(frame / fps, (id, tt) => at(id, tt * fps)) : CAM0);
  return {cast, fps, lines, at, cam, sfx};
};

/** يبني المشهد مرة واحدة (يُعاد فقط إن تغيّر النص) ويحوّل أي خطأ إلى رسالة واضحة */
export const useScene = (script: string, opts: SceneOpts): Scene => {
  return React.useMemo(() => {
    try {
      return buildScene(script, opts);
    } catch (e) {
      const err = e instanceof ScriptError ? e : new ScriptError(0, String(e));
      return {error: err, cast: opts.cast, fps: opts.fps ?? 30, lines: [], cam: () => CAM0, sfx: () => [], at: () => ({x: 0, y: 0, s: 1, flip: false, view: 0, motion: 'idle', travel: 0, energy: 0.5, visible: false})};
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script]);
};

/** شخصية يحركها السكريبت — ضعها داخل <svg>/<Art> */
export const Actor: React.FC<{scene: Scene; id: string; frameOffset?: number}> = ({scene, id, frameOffset = 0}) => {
  const f = useCurrentFrame() + frameOffset;
  const st = scene.at(id, f);
  if (!st.visible) return null;
  const base = scene.cast[id];
  return (
    <Person
      {...base}
      x={st.x}
      y={st.y}
      s={st.s}
      flip={st.flip}
      view={st.view}
      motion={st.motion}
      travel={st.travel}
      act={st.act}
      expr={st.expr ?? base.expr}
      pose={st.pose ?? base.pose}
      energy={st.energy}
      holdR={st.holdR}
      holdL={st.holdL}
      frame={f}
    />
  );
};

/** عمق الشخصية لترتيب DepthSort = موضع قدميها في الإطار */
(Actor as unknown as {depthOf: (p: {scene: Scene; id: string; frameOffset?: number}, f: number) => number}).depthOf = (p, f) =>
  p.scene.at(p.id, f + (p.frameOffset ?? 0)).y;

/** رسالة خطأ واضحة فوق اللقطة (تظهر في Remotion Studio بدل أن ينكسر المشهد بصمت) */
export const ScriptErrorOverlay: React.FC<{scene: Scene}> = ({scene}) =>
  scene.error ? (
    <div
      style={{
        position: 'absolute',
        left: 40,
        right: 40,
        top: 40,
        padding: '18px 28px',
        background: 'rgba(160,20,20,0.92)',
        color: '#fff',
        fontFamily: 'Amiri, sans-serif',
        fontSize: 40,
        direction: 'rtl',
        borderRadius: 12,
        zIndex: 99,
      }}
    >
      خطأ في سكريبت الحركة — {scene.error.message}
    </div>
  ) : null;
