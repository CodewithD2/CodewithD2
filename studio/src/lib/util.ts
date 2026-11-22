import {random} from 'remotion';

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
export const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mixColor = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (p: number, s: number) => (p >> s) & 255;
  const c = (s: number) => Math.round(lerp(ch(pa, s), ch(pb, s), t));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
};

/** قائمة نقاط عشوائية ثابتة (لا تتغير بين الإطارات) */
export const scatter = (seed: string, n: number, x0: number, x1: number, y0: number, y1: number) =>
  Array.from({length: n}, (_, i) => ({
    x: lerp(x0, x1, random(`${seed}-x-${i}`)),
    y: lerp(y0, y1, random(`${seed}-y-${i}`)),
    r: random(`${seed}-r-${i}`),
    p: random(`${seed}-p-${i}`) * Math.PI * 2,
  }));

/** مسار SVG لخط أفق تلال من دالة */
export const ridgePath = (fn: (x: number) => number, x0: number, x1: number, bottom: number, step = 20) => {
  let d = `M ${x0} ${bottom} L ${x0} ${fn(x0)}`;
  for (let x = x0 + step; x <= x1; x += step) d += ` L ${x} ${fn(x).toFixed(1)}`;
  return d + ` L ${x1} ${bottom} Z`;
};

export const INK = '#1b1a22';
