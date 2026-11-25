import React from 'react';
import {INK} from './util';
import CLIPS from '../dialogue/clips.json';

/* =====================================================================
 * الحوار (البند ٦): صوت لكل شخصية + فم متزامن مع الكلمات + فقاعات كلام.
 *
 *   @2s nasser: say "أيها المواطنون" style=shout
 *   @after nasser amer: say "سمعاً وطاعة يا سيادة الرئيس"
 *
 * الصوت: `npm run dialogue` (من studio/) يجمع كل جمل `say` من كل المشاهد المعرّفة بـ defineScene،
 * ويولّد الناقص فقط بـ edge-tts إلى public/dlg/<id>.mp3 + توقيت الكلمات في src/dialogue/clips.json.
 * قبل توليد الصوت: المدة تُقدَّر من طول النص (الفقاعة والتوقيت يعملان، بلا صوت).
 * ===================================================================== */

export type Voice = {name: string; rate?: string; pitch?: string};
export type Word = {t: number; d: number; text: string};
export type ClipInfo = {dur: number; words: Word[]};
export type BubbleStyle = 'say' | 'shout' | 'think' | 'whisper' | 'none';

/** الصوت الافتراضي لمن ليس له صوت (غير صوت الراوي ar-SA-HamedNeural) */
export const DEFAULT_VOICE: Voice = {name: 'ar-JO-TaimNeural'};
export const DEFAULT_VOICE_F: Voice = {name: 'ar-EG-SalmaNeural'};

const clips = CLIPS as Record<string, ClipInfo>;

/** معرّف ثابت للجملة: نفس النص + نفس الصوت = نفس الملف (FNV-1a) */
export const clipId = (text: string, v: Voice) => {
  const s = `${v.name}|${v.rate ?? '-5%'}|${v.pitch ?? '+0Hz'}|${text.trim()}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return 'd' + h.toString(36);
};

export const clipInfo = (id: string): ClipInfo | undefined => clips[id];

/** تقدير مدة جملة لم يُولَّد صوتها بعد (≈ ١٣ حرفاً/ث بعد حذف التشكيل) + كلمات تقديرية */
export const estimateClip = (text: string): ClipInfo => {
  const words = text.trim().split(/\s+/);
  const plain = (w: string) => w.replace(/[ً-ْٰ]/g, '').length;
  let t = 0.1;
  const out: Word[] = [];
  for (const w of words) {
    const d = Math.max(0.18, plain(w) / 13);
    out.push({t, d, text: w});
    t += d + 0.06;
  }
  return {dur: t + 0.1, words: out};
};

/** فتحة الفم 0..1 عند زمن u من بداية الجملة: تفتح داخل الكلمات بإيقاع المقاطع وتُغلق بينها */
export const mouthAt = (clip: ClipInfo, u: number): number => {
  const w = clip.words.find((x) => u >= x.t - 0.02 && u <= x.t + x.d);
  if (!w) return 0;
  const n = Math.max(1, Math.round(w.text.replace(/[ً-ْٰ]/g, '').length / 2.5));
  const p = Math.min(1, Math.max(0, (u - w.t) / w.d));
  return Math.pow(Math.abs(Math.sin(p * n * Math.PI)), 0.7) * (0.55 + 0.45 * Math.abs(Math.sin(w.t * 13.7)));
};

/* ---------------- فقاعة الكلام ---------------- */

const FS = 42;
const LINE = FS * 1.5;
const MAX_W = 560;
const charW = (ch: string) => (/[ً-ْٰ]/.test(ch) ? 0 : ch === ' ' ? FS * 0.25 : FS * 0.42);
const textW = (s: string) => [...s].reduce((a, c) => a + charW(c), 0);
const wrap = (text: string): string[] => {
  const lines: string[] = [];
  let cur = '';
  for (const w of text.trim().split(/\s+/)) {
    const next = cur ? cur + ' ' + w : w;
    if (cur && textW(next) > MAX_W) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
};

export type Speech = {text: string; style: BubbleStyle; t0: number; t1: number};

/**
 * فقاعة فوق رأس الشخصية. headX/headTop = قمة الرأس على الشاشة، side = جهة الذيل (+1 يمين).
 * age/left بالثواني منذ البداية وحتى النهاية (للظهور والاختفاء).
 */
export const SpeechBubble: React.FC<{text: string; style: BubbleStyle; headX: number; headTop: number; s: number; age: number; left: number; side?: number}> = ({
  text,
  style,
  headX,
  headTop,
  s,
  age,
  left,
  side = 1,
}) => {
  if (style === 'none') return null;
  const lines = wrap(text);
  const w = Math.max(...lines.map(textW)) + 64;
  const h = lines.length * LINE + 34;
  // الفقاعة مائلة قليلاً لجهة الذيل، ومحصورة داخل الكادر
  const cx = Math.max(w / 2 + 30, Math.min(1920 - w / 2 - 30, headX + side * 60 * s));
  const bottom = Math.max(h + 30, headTop - 34 * Math.max(0.7, s));
  const top = bottom - h;
  const pop = Math.min(1, age / 0.22);
  const sc = pop < 1 ? 0.4 + 0.6 * (1 - Math.pow(1 - pop, 3)) + Math.sin(pop * Math.PI) * 0.12 : 1;
  const op = Math.min(1, age / 0.12, left / 0.2);
  if (op <= 0) return null;
  const fill = style === 'whisper' ? '#eef2f7' : '#fffdf6';
  const stroke = style === 'shout' ? '#1a0f0f' : INK;
  const tipX = headX + side * 14 * s;
  const tipY = headTop - 6 * s;
  const baseX = Math.max(cx - w / 2 + 40, Math.min(cx + w / 2 - 40, headX + side * 30 * s));

  let body: React.ReactNode;
  if (style === 'shout') {
    // فقاعة مسننة
    const pts: string[] = [];
    const N = 22;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const r = i % 2 ? 1 : 1.16;
      pts.push(`${cx + Math.cos(a) * (w / 2 + 18) * r},${top + h / 2 + Math.sin(a) * (h / 2 + 16) * r}`);
    }
    body = (
      <>
        <path d={`M ${baseX - 22} ${bottom - 4} L ${tipX} ${tipY} L ${baseX + 22} ${bottom - 4} Z`} fill={fill} stroke={stroke} strokeWidth={5} strokeLinejoin="round" />
        <polygon points={pts.join(' ')} fill={fill} stroke={stroke} strokeWidth={5} strokeLinejoin="round" />
      </>
    );
  } else if (style === 'think') {
    body = (
      <>
        {[0.25, 0.55, 0.8].map((k, i) => (
          <circle key={i} cx={tipX + (baseX - tipX) * k} cy={tipY + (bottom + 6 - tipY) * k} r={5 + i * 4} fill={fill} stroke={stroke} strokeWidth={4} />
        ))}
        <rect x={cx - w / 2} y={top} width={w} height={h} rx={h / 2} fill={fill} stroke={stroke} strokeWidth={5} />
      </>
    );
  } else {
    body = (
      <>
        <rect x={cx - w / 2} y={top} width={w} height={h} rx={26} fill={fill} stroke={stroke} strokeWidth={5} strokeDasharray={style === 'whisper' ? '14 10' : undefined} />
        {/* الذيل: يغطي حد الفقاعة عند قاعدته */}
        <path d={`M ${baseX - 18} ${bottom - 3} Q ${baseX} ${bottom + 10} ${tipX} ${tipY} Q ${baseX + 4} ${bottom + 6} ${baseX + 18} ${bottom - 3}`} fill={fill} stroke={stroke} strokeWidth={5} strokeLinejoin="round" />
        <rect x={baseX - 15} y={bottom - 8} width={30} height={6} fill={fill} />
      </>
    );
  }
  return (
    <g opacity={op} transform={`translate(${tipX} ${tipY}) scale(${sc}) translate(${-tipX} ${-tipY})`}>
      <g filter={undefined}>{body}</g>
      {lines.map((l, i) => (
        <text
          key={i}
          x={cx}
          y={top + 17 + LINE * (i + 0.5)}
          dominantBaseline="central"
          textAnchor="middle"
          direction="rtl"
          fontFamily="Amiri"
          fontWeight={700}
          fontSize={style === 'shout' ? FS * 1.08 : style === 'whisper' ? FS * 0.9 : FS}
          fill={style === 'whisper' ? '#4a4a5a' : '#1c1622'}
          fontStyle={style === 'whisper' ? 'italic' : undefined}
        >
          {l}
        </text>
      ))}
    </g>
  );
};
