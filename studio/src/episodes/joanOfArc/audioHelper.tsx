import React from 'react';
import {Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import AUDIO_RAW from './audio.json';
import {ClipInfo, mouthAt} from '../../lib/dialogue';

/* =====================================================================
 * محرك الصوت والترجمة والتزامن لحلقة جان دارك (قابل للتوسع لكل الدفعات)
 * ===================================================================== */

export type AudioEntry = ClipInfo & {
  hash: string;
  text: string;
  display: string;
  speaker: string;
  voice: string;
};

export const JOAN_AUDIO = AUDIO_RAW as Record<string, AudioEntry>;

export const FPS = 30;

/**
 * مفاتيح الإخراج — قرار صاحب المشروع: سيسجّل التعليق بالمصري بنفسه ويضيف المؤثرات بنفسه.
 * التوقيت ما زال يُحسب من مدد audio.json (إيقاع المشاهد كما هو) لكن لا يُشغَّل أي صوت.
 * voice: مقاطع edge-tts · sfx: المؤثرات · subtitles: الترجمة أسفل الشاشة · bubbles: فقاعات كلام الشخصيات
 */
export const JOAN_OUTPUT = {voice: false, sfx: false, subtitles: false, bubbles: false};

export type TrackStep =
  | {kind: 'clip'; id: string; vol?: number; padAfter?: number}
  | {kind: 'pause'; sec: number};

export type PlacedClip = {
  id: string;
  entry: AudioEntry;
  t0: number;
  t1: number;
  vol: number;
};

export type SceneTrack = {
  clips: PlacedClip[];
  byId: Record<string, PlacedClip>;
  durationS: number;
  durationFrames: number;
};

/** يرتب مقاطع الصوت والفواصل بالترتيب بلا أي تداخل ويحسب المدة الحقيقية للمشهد */
export const buildTrack = (steps: TrackStep[], tailPad = 0.45): SceneTrack => {
  let cursor = 0;
  const clips: PlacedClip[] = [];
  const byId: Record<string, PlacedClip> = {};
  for (const st of steps) {
    if (st.kind === 'pause') {
      cursor += st.sec;
      continue;
    }
    const entry = JOAN_AUDIO[st.id];
    if (!entry) throw new Error(`مقطع الصوت غير موجود في audio.json: ${st.id}`);
    const t0 = cursor;
    const t1 = t0 + entry.dur;
    const placed: PlacedClip = {id: st.id, entry, t0, t1, vol: st.vol ?? 1};
    clips.push(placed);
    byId[st.id] = placed;
    cursor = t1 + (st.padAfter ?? 0.22);
  }
  const durationS = Math.max(1, cursor + tailPad);
  return {
    clips,
    byId,
    durationS,
    durationFrames: Math.ceil(durationS * FPS),
  };
};

/** فتحة الفم 0..1 لشخصية تتكلم مقطعاً محدداً في اللحظة الحالية t (بالثواني) */
export const talkOf = (track: SceneTrack, id: string, t: number): number | undefined => {
  const c = track.byId[id];
  if (!c || t < c.t0 || t > c.t1) return undefined;
  return mouthAt(c.entry, t - c.t0);
};

/** هل المقطع يعمل الآن؟ يعيد {age, left} للفقاعات أو null */
export const bubbleOf = (track: SceneTrack, id: string, t: number): {age: number; left: number; text: string} | null => {
  if (!JOAN_OUTPUT.bubbles) return null;
  const c = track.byId[id];
  if (!c || t < c.t0 || t > c.t1 + 0.28) return null;
  return {age: t - c.t0, left: c.t1 + 0.28 - t, text: c.entry.display};
};

/** يشغّل كل مقاطع صوت المشهد + قائمة المؤثرات الصوتية */
export const SceneTrackAudio: React.FC<{
  track: SceneTrack;
  sfx?: {at: number; name: string; vol?: number; dur?: number}[];
}> = ({track, sfx = []}) => (
  <>
    {JOAN_OUTPUT.voice && track.clips.map((c) => (
      <Sequence
        key={c.id}
        from={Math.max(0, Math.round(c.t0 * FPS))}
        durationInFrames={Math.ceil((c.entry.dur + 0.35) * FPS)}
        layout="none"
      >
        <Audio src={staticFile(`joan/${c.id}.mp3`)} volume={c.vol} />
      </Sequence>
    ))}
    {JOAN_OUTPUT.sfx && sfx.map((e, i) => (
      <Sequence
        key={`sfx-${i}`}
        from={Math.max(0, Math.round(e.at * FPS))}
        durationInFrames={Math.ceil((e.dur ?? 2.2) * FPS)}
        layout="none"
      >
        <Audio src={staticFile(`sfx/${e.name}.wav`)} volume={e.vol ?? 0.75} />
      </Sequence>
    ))}
  </>
);

/** ترجمة عربية واضحة أسفل الشاشة متزامنة بدقة مع صوت المشهد */
export const SceneTrackSubtitles: React.FC<{track: SceneTrack; hideDialogue?: boolean}> = ({track, hideDialogue = false}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (!JOAN_OUTPUT.subtitles) return null;
  const active = track.clips.find((c) => t >= c.t0 - 0.04 && t <= c.t1 + 0.14 && (!hideDialogue || c.entry.speaker === 'narrator'));
  if (!active) return null;
  const isChar = active.entry.speaker !== 'narrator';
  return (
    <div
      style={{
        position: 'absolute',
        left: 110,
        right: 110,
        bottom: 44,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: isChar ? 'rgba(26, 22, 34, 0.86)' : 'rgba(14, 14, 22, 0.78)',
          border: isChar ? '2px solid rgba(242, 196, 58, 0.65)' : '1.5px solid rgba(255, 255, 255, 0.16)',
          borderRadius: 14,
          padding: '10px 28px 12px',
          maxWidth: 1520,
          textAlign: 'center',
          direction: 'rtl',
          fontFamily: 'Amiri',
          fontWeight: 700,
          fontSize: 40,
          lineHeight: 1.45,
          color: isChar ? '#fff2c2' : '#fbf8f0',
          textShadow: '0 2px 6px rgba(0,0,0,0.85)',
        }}
      >
        {active.entry.display}
      </div>
    </div>
  );
};
