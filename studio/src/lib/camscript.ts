import {CAM0, Cam, perspectiveFor, REF_FOV} from './stage';

/**
 * مسار الكاميرا في سكريبت الحركة — الشخصية المحجوزة `camera`:
 *   @0s   camera: follow ali dx=120 lag=0.4
 *   @3s   camera: zoom 1.4 dur=1.5s
 *   @"انفجر" camera: shake amp=14 for 0.8s
 *   @6s   camera: unfollow | move to x=0 z=0 dur=2s
 *   @8s   camera: reset 1s
 * كل الحسابات دوال نقية من الزمن → آمنة للتصيير المتوازي.
 */

export type CamCmdError = (msg: string) => never;
type CamS = Cam & {zoom: number};
type Seg = {t0: number; t1: number; a: CamS; b: CamS};
type Follow = {t0: number; t1: number; id: string; dx: number; dy: number; lag: number; blend: number; blendOut: number; y: boolean};
type Shake = {t0: number; t1: number; amp: number};

const P_REF = perspectiveFor(REF_FOV);
const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const BASE: CamS = {...CAM0, zoom: 1};
const KEYS = ['x', 'y', 'z', 'ry', 'rx', 'rz', 'fov', 'zoom'] as const;

export type CamTimeline = {
  /** ينفّذ أوامر سطر واحد بدءاً من t ويعيد زمن الانتهاء */
  run: (body: string, t: number, fail: CamCmdError, sec: (tok: string) => number, knownActor: (id: string) => boolean, onSfx?: (t: number, name: string, kv: Record<string, string>, dur?: number) => void) => number;
  /** الكاميرا عند الزمن t؛ pos(id,t) يعيد موضع الشخصية على الشاشة */
  at: (t: number, pos: (id: string, t: number) => {x: number; y: number}) => Cam;
  used: () => boolean;
};

export const makeCamTimeline = (depth: number): CamTimeline => {
  const segs: Seg[] = [{t0: 0, t1: 0, a: BASE, b: BASE}];
  const follows: Follow[] = [];
  const shakes: Shake[] = [];
  let used = false;

  const baseAt = (t: number): CamS => {
    let s = segs[0];
    for (const q of segs) if (q.t0 <= t + 1e-9) s = q;
    const u = s.t1 > s.t0 ? Math.min(1, Math.max(0, (t - s.t0) / (s.t1 - s.t0))) : 1;
    const e = ease(u);
    const o = {...s.a};
    for (const k of KEYS) o[k] = s.a[k] + (s.b[k] - s.a[k]) * e;
    return o;
  };
  const tween = (t: number, dur: number, to: Partial<CamS>) => {
    const from = baseAt(t);
    // اقطع ما يبدأ بعد t
    for (let i = segs.length - 1; i > 0; i--) if (segs[i].t0 > t + 1e-9) segs.splice(i, 1);
    const last = segs[segs.length - 1];
    if (last.t1 > t) Object.assign(last, {t1: t, b: from});
    segs.push({t0: t, t1: t + dur, a: from, b: {...from, ...to}});
    return t + dur;
  };

  const run: CamTimeline['run'] = (body, t, fail, sec, knownActor, onSfx) => {
    used = true;
    let cur = t;
    for (const raw of body.split('|')) {
      const tok = raw.trim().split(/\s+/).filter(Boolean);
      if (!tok.length) continue;
      const kv: Record<string, string> = {};
      const pos: string[] = [];
      for (const k of tok.slice(1)) {
        const e = k.indexOf('=');
        if (e > 0) kv[k.slice(0, e)] = k.slice(e + 1);
        else pos.push(k);
      }
      const num = (k: string, d: number) => (kv[k] !== undefined ? +kv[k] : d);
      const durTok = kv.dur ?? pos.find((p) => /^[\d.]+[sf]$/.test(p));
      const fi = pos.indexOf('for');
      const forDur = fi >= 0 && pos[fi + 1] ? sec(pos[fi + 1]) : undefined;
      const dur = (d: number) => (durTok ? sec(durTok) : d);
      switch (tok[0]) {
        case 'follow': {
          const id = pos[0];
          if (!id || !knownActor(id)) fail(`follow تحتاج شخصية معرّفة: ${id ?? ''}`);
          for (const f of follows) if (f.t1 > cur) f.t1 = cur;
          follows.push({t0: cur, t1: forDur !== undefined ? cur + forDur : Infinity, id, dx: num('dx', 0), dy: num('dy', 0), lag: num('lag', 0.35), blend: num('blend', 0.6), blendOut: num('blend', 0.6), y: pos.includes('y') || kv.dy !== undefined});
          break;
        }
        case 'unfollow':
        case 'stopfollow':
          for (const f of follows) if (f.t1 > cur) {
            f.t1 = cur;
            f.blendOut = num('blend', f.blendOut);
          }
          break;
        case 'move':
        case 'pan': {
          const to: Partial<CamS> = {};
          for (const k of KEYS) if (kv[k] !== undefined) to[k] = +kv[k];
          if (!Object.keys(to).length) fail('move to تحتاج قيمة واحدة على الأقل: x= y= z= ry= rx= rz= fov= zoom=');
          cur = tween(cur, dur(1), to);
          break;
        }
        case 'zoom': {
          const z = pos[0] && !/[sf]$/.test(pos[0]) ? +pos[0] : num('to', NaN);
          if (!(z > 0.2 && z < 6)) fail(`zoom تحتاج معامل تكبير بين 0.2 و6، مثل: zoom 1.4 dur=1s`);
          cur = tween(cur, dur(1), {zoom: z});
          break;
        }
        case 'shake': {
          const d = forDur ?? dur(0.6);
          shakes.push({t0: cur, t1: cur + d, amp: num('amp', 10)});
          break;
        }
        case 'sfx':
          onSfx?.(cur, pos[0], kv, forDur);
          break;
        case 'reset':
          for (const f of follows) if (f.t1 > cur) f.t1 = cur;
          cur = tween(cur, dur(1), {...BASE});
          break;
        case 'wait':
          cur += sec(pos[0] ?? '1s');
          break;
        default:
          fail(`أمر كاميرا غير معروف: ${tok[0]}. المتاح: follow unfollow move zoom shake sfx reset wait`);
      }
    }
    return cur;
  };

  const at: CamTimeline['at'] = (t, pos) => {
    const b = baseAt(t);
    const P = perspectiveFor(b.fov);
    const k = (P_REF + depth) / P_REF;
    // التكبير = اقتراب يجعل طبقة الممثلين تكبر بالمعامل zoom
    const zoomZ = (P + depth) * (1 - 1 / b.zoom);
    let x = b.x;
    let y = b.y;
    for (const f of follows) {
      if (t < f.t0) continue;
      const wIn = f.blend > 0 ? ease(Math.min(1, (t - f.t0) / f.blend)) : 1;
      const wOut = t > f.t1 ? (f.blendOut > 0 ? 1 - ease(Math.min(1, (t - f.t1) / f.blendOut)) : 0) : 1;
      const w = wIn * wOut;
      if (w <= 0) continue;
      // متوسط موضع الشخصية في نافذة lag الأخيرة = متابعة ناعمة متأخرة قليلاً
      const tt = Math.min(t, f.t1);
      let sx = 0;
      let sy = 0;
      const N = 10;
      for (let i = 0; i < N; i++) {
        const p = pos(f.id, Math.max(f.t0, tt - (f.lag * i) / N));
        sx += p.x;
        sy += p.y;
      }
      const tx = (sx / N - 960) * k + f.dx;
      const ty = (sy / N - 700) * k + f.dy; // مركز الجسم تقريباً في منتصف الكادر
      x = x + (tx - x) * w;
      if (f.y) y = y + (ty - y) * w;
    }
    let rz = b.rz;
    let rx = b.rx;
    for (const s of shakes) {
      if (t < s.t0 || t > s.t1) continue;
      const u = (t - s.t0) / (s.t1 - s.t0);
      const env = Math.min(1, u * 8) * (1 - u) * (1 - u);
      const q = t * 30;
      x += s.amp * env * (Math.sin(q * 1.9) * 0.6 + Math.sin(q * 3.7 + 1.3) * 0.4);
      y += s.amp * env * (Math.sin(q * 2.3 + 0.7) * 0.6 + Math.sin(q * 4.1 + 2.1) * 0.4);
      rz += s.amp * 0.05 * env * Math.sin(q * 2.9 + 0.4);
      rx += s.amp * 0.02 * env * Math.sin(q * 3.3);
    }
    return {x, y, z: b.z + zoomZ, ry: b.ry, rx, rz, fov: b.fov};
  };

  return {run, at, used: () => used};
};
