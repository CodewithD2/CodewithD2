import React from 'react';
import {Audio, staticFile, useVideoConfig} from 'remotion';

/* =====================================================================
 * موسيقى خلفية هادئة لكل فيديو (قرار صاحب المشروع: دائماً موسيقى في الخلفية).
 * ducking تلقائي: تنخفض أثناء كلام الراوي وترتفع في الوقفات، مع ظهور واختفاء تدريجي.
 * المكتبة في public/music/ (CC0 فقط) — المصادر في public/music/CREDITS.md
 * ===================================================================== */

export const MUSIC = {
  /** بيانو هادئ بطيء — 84.7ث */
  lighthouse: 'music/eternal-lighthouse-piano.mp3',
  /** موسيقى روحانية عاطفية — 246ث (احتياطي لفيديو أطول) */
  respect: 'music/emotional-respect.mp3',
  /** موسيقى استرخاء — 89.6ث */
  relax: 'music/relaxation-10.mp3',
  /** قوجنغ صيني هادئ بطابع الجبال — 109ث (شورت سور الصين) */
  karst: 'music/karst-mountains-guzheng.mp3',
  /** قوجنغ صيني منفرد — 85ث */
  guzheng: 'music/guzheng-solo.mp3',
} as const;

export type Span = {t0: number; t1: number};

export const BackgroundMusic: React.FC<{
  src: string;
  /** فترات الكلام بالثواني (للـ ducking) */
  speech?: Span[];
  /** الشدة في الوقفات / أثناء الكلام */
  high?: number;
  low?: number;
  fadeIn?: number;
  fadeOut?: number;
  startFrom?: number;
  loop?: boolean;
  /** فترات إسكات كامل (للنكت: خدش أسطوانة + صمت) — تعود الموسيقى بعدها تدريجياً */
  mute?: Span[];
}> = ({src, speech = [], high = 0.22, low = 0.1, fadeIn = 1.2, fadeOut = 2, startFrom = 0, loop = true, mute = []}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const total = durationInFrames / fps;
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const duck = (t: number) => {
    let a = 0;
    for (const s of speech) a = Math.max(a, Math.min(clamp((t - (s.t0 - 0.45)) / 0.35), 1 - clamp((t - s.t1) / 0.5)));
    return a;
  };
  return (
    <Audio
      src={staticFile(src)}
      loop={loop}
      startFrom={Math.round(startFrom * fps)}
      volume={(f) => {
        const t = f / fps;
        const env = Math.min(clamp(t / fadeIn), clamp((total - t) / fadeOut));
        let m = 1;
        for (const q of mute) if (t > q.t0 - 0.05 && t < q.t1 + 0.6) m = Math.min(m, t < q.t1 ? 0 : clamp((t - q.t1) / 0.6));
        return env * m * (high + (low - high) * duck(t));
      }}
    />
  );
};
