/* خامات خريطة جان دارك (ورق قديم + تضاريس) — مولّدة رياضياً، بلا حقوق، ونتيجتها ثابتة.
 * تُستخدم بدل فلاتر SVG الثقيلة في src/episodes/joanOfArc/MapTable.tsx
 *   node scripts/joan-textures.mjs   →   public/joan/tex/{paper,relief}.png
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

const W = 1280;
const H = 820;
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'joan', 'tex');

const hash = (x, y, s) => {
  let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const noise = (x, y, s) => {
  const xi = Math.floor(x), yi = Math.floor(y);
  const u = x - xi, v = y - yi;
  const a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v);
  return (hash(xi, yi, s) * (1 - a) + hash(xi + 1, yi, s) * a) * (1 - b) + (hash(xi, yi + 1, s) * (1 - a) + hash(xi + 1, yi + 1, s) * a) * b;
};
const fbm = (x, y, s, cell, oct) => {
  let o = 0, amp = 1, tot = 0;
  for (let i = 0; i < oct; i++, amp /= 2, cell /= 2) { o += amp * noise(x / cell, y / cell, s + i); tot += amp; }
  return o / tot;
};
const crcT = Array.from({length: 256}, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const td = Buffer.concat([Buffer.from(t), d]); const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const save = (name, fn) => {
  const raw = Buffer.alloc((W * 4 + 1) * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const [r, g, b, a] = fn(x, y);
    const o = y * (W * 4 + 1) + 1 + x * 4;
    raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = Math.max(0, Math.min(255, Math.round(a * 255)));
  }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 6;
  const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw, {level: 9})), chunk('IEND', Buffer.alloc(0))]);
  fs.writeFileSync(path.join(OUT, name), png);
  console.log(name, Math.round(png.length / 1024) + 'KB');
};
fs.mkdirSync(OUT, {recursive: true});
save('paper.png', (x, y) => [107, 71, 31, Math.max(0, Math.min(0.5, (fbm(x, y, 7, 90, 5) - 0.42) * 1.5))]);
const hgt = (x, y) => fbm(x, y, 31, 46, 4);
save('relief.png', (x, y) => {
  const s = (hgt(x + 1, y) - hgt(x - 1, y) + hgt(x, y + 1) - hgt(x, y - 1)) * 15;
  return s > 0 ? [10, 10, 36, Math.min(0.5, s * 0.5)] : [255, 255, 235, Math.min(0.3, -s * 0.3)];
});
