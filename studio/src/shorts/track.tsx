import React from 'react';
import {Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BackgroundMusic} from '../lib/music';
import {OUTPUT} from '../lib/output';

/* =====================================================================
 * محرك الصوت العام للشورتس: مقطع لكل جملة (narrator/joan_audio.py) + توقيت كل كلمة
 * + مؤثرات حقيقية + موسيقى خلفية بـ ducking + ترجمة عمودية.
 *   const T = makeTrack({audio, order, dir: 'whywall', sfxFiles})
 *   T.wordAt('s2', 'الخيل')  ·  T.S('s3')  ·  <T.Audio sfx={…} music={MUSIC.x} />  ·  <T.Subtitles />
 * ===================================================================== */

export const FPS = 30;
type Word = {t: number; d: number; text: string};
type Entry = {dur: number; display: string; words: Word[]};
export type Clip = {id: string; t0: number; t1: number; e: Entry};
export type SfxCue = {at: number; name: string; vol?: number; dur?: number; fadeIn?: number; fadeOut?: number; loop?: boolean};

const norm = (s: string) =>
  s
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[^ء-ي0-9]/g, '');

export const makeTrack = (o: {
  audio: Record<string, unknown>;
  /** [معرّف الجملة، فاصل بعدها بالثواني] */
  order: [string, number][];
  /** مجلد الصوت داخل public */
  dir: string;
  sfxFiles?: Record<string, string>;
  lead?: number;
  tail?: number;
  /** طول الجملة = نهاية آخر كلمة + 0.12ث (يحذف صمت نهاية مقاطع edge-tts ≈0.75ث لكل جملة) */
  tight?: boolean;
}) => {
  const AUDIO = o.audio as Record<string, Entry>;
  const CLIPS: Record<string, Clip> = {};
  let cur = o.lead ?? 0.25;
  for (const [id, gap] of o.order) {
    const e = AUDIO[id];
    if (!e) throw new Error(`صوت ناقص: ${id} — شغّل narrator/joan_audio.py بملف المانيفست`);
    const last = e.words[e.words.length - 1];
    const len = o.tight && last ? Math.min(e.dur, last.t + last.d + 0.12) : e.dur;
    CLIPS[id] = {id, t0: cur, t1: cur + len, e};
    cur += len + gap;
  }
  const TOTAL_S = cur + (o.tail ?? 0.8);
  const S = (id: string) => CLIPS[id].t0;
  const E = (id: string) => CLIPS[id].t1;
  const wordAt = (id: string, needle: string, nth = 1): number => {
    const c = CLIPS[id];
    const n = norm(needle);
    let seen = 0;
    for (const w of c.e.words) if (norm(w.text).includes(n) && ++seen === nth) return c.t0 + w.t;
    throw new Error(`الكلمة "${needle}" غير موجودة في ${id}`);
  };
  const files = o.sfxFiles ?? {};

  const TrackAudio: React.FC<{sfx: SfxCue[]; music?: string; musicHigh?: number; musicLow?: number; musicMute?: {t0: number; t1: number}[]}> = ({sfx, music, musicHigh = 0.24, musicLow = 0.1, musicMute = []}) => (
    <>
      {OUTPUT.voice && Object.values(CLIPS).map((c) => (
        <Sequence key={c.id} from={Math.round(c.t0 * FPS)} durationInFrames={Math.ceil((c.e.dur + 0.3) * FPS)} layout="none">
          <Audio src={staticFile(`${o.dir}/${c.id}.mp3`)} />
        </Sequence>
      ))}
      {sfx.map((q, i) => {
        const file = files[q.name];
        if (!file || !OUTPUT.sfx) return null;
        const dur = Math.ceil((q.dur ?? 2) * FPS);
        const fi = (q.fadeIn ?? 0.2) * FPS;
        const fo = (q.fadeOut ?? 0.4) * FPS;
        return (
          <Sequence key={i} from={Math.max(0, Math.round(q.at * FPS))} durationInFrames={dur} layout="none">
            <Audio src={staticFile(`${o.dir}/sfx/${file}`)} loop={q.loop ?? true} volume={(f) => (q.vol ?? 0.5) * Math.min(1, f / Math.max(1, fi), (dur - f) / Math.max(1, fo))} />
          </Sequence>
        );
      })}
      {music && <BackgroundMusic src={music} speech={Object.values(CLIPS)} high={musicHigh} low={musicLow} mute={musicMute} />}
    </>
  );

  /** ترجمة عمودية: فوق منطقة عنوان يوتيوب وبعيداً عن عمود الأزرار */
  const Subtitles: React.FC = () => {
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

  return {CLIPS, TOTAL_S, TOTAL_FRAMES: Math.ceil(TOTAL_S * FPS), S, E, wordAt, Audio: TrackAudio, Subtitles};
};
