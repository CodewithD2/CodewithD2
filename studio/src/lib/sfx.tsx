import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import type {ActorState, Scene} from './script';

/**
 * المؤثرات الصوتية — ملفات `public/sfx/*.wav` مولّدة بـ `narrator/sfx_synth.py` (بلا حقوق).
 * قصيرة: step step2 run land whoosh clang pop boom — ممتدة (تتكرر): waves wind fire murmur cheer
 */
export const SFX_NAMES = [
  'step', 'step2', 'run', 'land', 'whoosh', 'clang', 'pop', 'boom',
  'drumroll', 'scratch', 'buzzer', 'knock', 'doorSlam', 'glass', 'snip', 'trumpet', 'stamp', 'jawDrop',
  'waves', 'wind', 'fire', 'murmur', 'cheer',
];
export const SFX_LOOPS = new Set(['waves', 'wind', 'fire', 'murmur', 'cheer']);
const SFX_LEN: Record<string, number> = {
  step: 0.22, step2: 0.22, run: 0.18, land: 0.35, whoosh: 0.45, clang: 1.4, pop: 0.15, boom: 2.5,
  drumroll: 1.6, scratch: 0.45, buzzer: 0.65, knock: 0.9, doorSlam: 0.55, glass: 0.75, snip: 0.42, trumpet: 1.25, stamp: 0.35, jawDrop: 0.55,
  waves: 7.5, wind: 7.5, fire: 7.5, murmur: 7.5, cheer: 6,
};

export type SfxEvent = {t: number; name: string; vol: number; dur?: number; who?: string};

/**
 * لحظات ملامسة القدم للأرض من نفس معادلة المشي في Person (computeMotion):
 * الطور = (المسافة/s ÷ الدورة)·2π + seed، والملامسة كل نصف دورة.
 */
export const footsteps = (id: string, frames: number, fps: number, at: (f: number) => ActorState, seed: number): SfxEvent[] => {
  const out: SfxEvent[] = [];
  let prev: number | undefined;
  let n = 0;
  for (let f = 0; f <= frames; f++) {
    const st = at(f);
    if (!st.visible || (st.motion !== 'walk' && st.motion !== 'run')) {
      prev = undefined;
      continue;
    }
    const run = st.motion === 'run';
    const cycle = run ? 230 : 150;
    const k = Math.floor(((st.travel / st.s / cycle) * Math.PI * 2 + seed) / Math.PI);
    if (prev !== undefined && k !== prev) {
      const vol = Math.min(1, 0.35 + 0.35 * st.s) * (run ? 0.9 : 0.6);
      out.push({t: f / fps, name: run ? 'run' : n++ % 2 ? 'step2' : 'step', vol, who: id});
    }
    prev = k;
  }
  return out;
};

/** يشغّل كل أصوات المشهد — ضعه مرة واحدة في اللقطة (خارج <svg>) */
export const SceneAudio: React.FC<{scene: Scene; volume?: number; steps?: number; voices?: number}> = ({scene, volume = 1, steps = 1, voices = 1}) => (
  <>
    {/* جمل الحوار (المولَّدة فقط — الناقص يولَّد بـ npm run dialogue) */}
    {scene
      .dialogue()
      .filter((l) => l.ready && voices > 0)
      .map((l, i) => (
        <Sequence key={'dlg' + i} from={Math.max(0, Math.round(l.t * scene.fps))} durationInFrames={Math.ceil((l.t1 - l.t + 0.3) * scene.fps)} layout="none">
          <Audio src={staticFile(`dlg/${l.clip}.mp3`)} volume={l.vol * voices} />
        </Sequence>
      ))}
    {scene.sfx().map((e, i) => {
      const from = Math.max(0, Math.round(e.t * scene.fps));
      const loop = SFX_LOOPS.has(e.name);
      const dur = Math.ceil((e.dur ?? SFX_LEN[e.name] ?? 1) * scene.fps) + 1;
      const isStep = e.name === 'step' || e.name === 'step2' || e.name === 'run';
      const v = e.vol * volume * (isStep ? steps : 1);
      if (v <= 0) return null;
      const fade = loop && e.dur ? 0.5 * scene.fps : 0;
      return (
        <Sequence key={i} from={from} durationInFrames={dur} layout="none">
          <Audio
            src={staticFile(`sfx/${e.name}.wav`)}
            loop={loop && !!e.dur && e.dur > (SFX_LEN[e.name] ?? 1)}
            volume={(f) => v * (fade ? Math.min(1, f / fade, (dur - f) / fade) : 1)}
          />
        </Sequence>
      );
    })}
  </>
);

/** صوت محيطي متكرر طوال المشهد */
export const AmbientLoop: React.FC<{name: string; volume: number}> = ({name, volume}) => (
  <Audio src={staticFile(`sfx/${name}.wav`)} loop volume={(f) => volume * Math.min(1, f / 20)} />
);
