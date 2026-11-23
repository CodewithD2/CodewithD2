import React from 'react';
import {Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import AUDIO_RAW from './audio.json';
import SFX_FILES from './sfx.json';
import {OUTPUT} from '../../lib/output';

/* =====================================================================
 * صوت الشورت: مقطع لكل جملة (narrator/joan_audio.py) + توقيت كل كلمة + مؤثرات حقيقية.
 * ===================================================================== */

export const FPS = 30;
type Word = {t: number; d: number; text: string};
type Entry = {dur: number; display: string; words: Word[]};
const AUDIO = AUDIO_RAW as unknown as Record<string, Entry>;

export type Clip = {id: string; t0: number; t1: number; e: Entry};

/** ترتيب الجمل: [المعرّف، فاصل بعدها بالثواني] */
const ORDER: [string, number][] = [
  ['s1_1', 0.12],
  ['s1_2', 0.2],
  ['s2_2', 0.15],
  ['s3_1', 0.12],
  ['s4_1', 0.1],
  ['s4_2', 0.18],
  ['s5_1', 0.1],
  ['s5_2', 0.12],
  ['s6_1', 0.08],
  ['s6_2', 0.18],
  ['s7_1', 0],
];
const LEAD = 0.25;
const TAIL = 0.8;

export const CLIPS: Record<string, Clip> = {};
let cur = LEAD;
for (const [id, gap] of ORDER) {
  const e = AUDIO[id];
  if (!e) throw new Error(`صوت ناقص: ${id} — شغّل narrator/joan_audio.py بملف birds_manifest.json`);
  CLIPS[id] = {id, t0: cur, t1: cur + e.dur, e};
  cur += e.dur + gap;
}
export const TOTAL_S = cur + TAIL;
export const TOTAL_FRAMES = Math.ceil(TOTAL_S * FPS);

const norm = (s: string) =>
  s
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[^ء-ي0-9]/g, '');

/** زمن كلمة داخل جملة (بالثواني من بداية الشورت). nth للمرة الثانية… */
export const wordAt = (id: string, needle: string, nth = 1): number => {
  const c = CLIPS[id];
  const n = norm(needle);
  let seen = 0;
  for (const w of c.e.words) {
    if (norm(w.text).includes(n) && ++seen === nth) return c.t0 + w.t;
  }
  throw new Error(`الكلمة "${needle}" غير موجودة في ${id}`);
};
export const S = (id: string) => CLIPS[id].t0;
export const E = (id: string) => CLIPS[id].t1;

/* ---------------- المؤثرات الصوتية الحقيقية ---------------- */
/** أسماء المؤثرات المطلوبة — الملفات تُضاف لاحقاً في public/whybirds/sfx/ وتُسجَّل في sfx.json */
export type SfxName = 'wings' | 'geese' | 'wind' | 'ice' | 'waves' | 'spring' | 'chicks' | 'crickets' | 'whoosh';
export type SfxCue = {at: number; name: SfxName; vol?: number; dur?: number; fadeIn?: number; fadeOut?: number};
const FILES = SFX_FILES as Partial<Record<SfxName, string>>;

/** يشغّل الجمل + المؤثرات المتوفرة فقط (الناقص يُتجاهل بصمت حتى تصل الملفات) */
export const ShortAudio: React.FC<{sfx: SfxCue[]}> = ({sfx}) => (
  <>
    {OUTPUT.voice && Object.values(CLIPS).map((c) => (
      <Sequence key={c.id} from={Math.round(c.t0 * FPS)} durationInFrames={Math.ceil((c.e.dur + 0.3) * FPS)} layout="none">
        <Audio src={staticFile(`whybirds/${c.id}.mp3`)} />
      </Sequence>
    ))}
    {sfx.map((q, i) => {
      const file = FILES[q.name];
      if (!file || !OUTPUT.sfx) return null;
      const dur = Math.ceil((q.dur ?? 2) * FPS);
      const fi = (q.fadeIn ?? 0.2) * FPS;
      const fo = (q.fadeOut ?? 0.4) * FPS;
      return (
        <Sequence key={i} from={Math.max(0, Math.round(q.at * FPS))} durationInFrames={dur} layout="none">
          <Audio src={staticFile(`whybirds/sfx/${file}`)} loop volume={(f) => (q.vol ?? 0.6) * Math.min(1, f / Math.max(1, fi), (dur - f) / Math.max(1, fo))} />
        </Sequence>
      );
    })}
  </>
);

/** ترجمة عمودية: فوق منطقة عنوان يوتيوب السفلية وبعيداً عن عمود الأزرار الأيمن */
export const ShortSubtitles: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (!OUTPUT.subtitles) return null;
  const c = Object.values(CLIPS).find((x) => t >= x.t0 - 0.05 && t <= x.t1 + 0.12);
  if (!c) return null;
  const a = interpolate(t, [c.t0 - 0.05, c.t0 + 0.12, c.t1, c.t1 + 0.12], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 50, right: 130, top: 1240, display: 'flex', justifyContent: 'center', opacity: a}}>
      <div
        style={{
          background: 'rgba(12,14,24,0.74)',
          borderRadius: 22,
          padding: '14px 30px 20px',
          textAlign: 'center',
          direction: 'rtl',
          fontFamily: 'Amiri',
          fontWeight: 700,
          fontSize: 54,
          lineHeight: 1.45,
          color: '#fffaf0',
          textShadow: '0 3px 8px rgba(0,0,0,0.8)',
        }}
      >
        {c.e.display}
      </div>
    </div>
  );
};
