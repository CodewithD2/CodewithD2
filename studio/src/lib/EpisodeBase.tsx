import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FilmLook} from '../shots/common';
import {Cue, Subtitles, VOICE_DELAY} from '../Subtitles';

const XF = 14; // إطارات الانتقال بين اللقطات

export type ShotDef = {at: number; C: React.FC};

/**
 * هيكل عام لأي حلقة: لقطات بانتقالات ناعمة + تعليق صوتي + صوت خلفي + ترجمة + fade.
 * at = بداية اللقطة بالثواني (= بداية الجملة في cues + VOICE_DELAY)
 */
export const EpisodeBase: React.FC<{shots: ShotDef[]; cues: Cue[]; voice: string; drone?: string; droneVolume?: number}> = ({
  shots,
  cues,
  voice,
  drone,
  droneVolume = 0.06,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const fade = Math.max(
    interpolate(frame, [0, 22], [1, 0], {extrapolateRight: 'clamp'}),
    interpolate(frame, [durationInFrames - 45, durationInFrames - 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  );
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {shots.map(({at, C}, i) => {
        const from = Math.round(at * fps) - (i ? XF / 2 : 0);
        const end = i < shots.length - 1 ? Math.round(shots[i + 1].at * fps) + XF / 2 : durationInFrames;
        return (
          <Sequence key={i} from={from} durationInFrames={end - from}>
            {i === 0 ? <C /> : <FadeIn><C /></FadeIn>}
          </Sequence>
        );
      })}
      <FilmLook frame={frame} />
      <Subtitles cues={cues} />
      <AbsoluteFill style={{background: '#000', opacity: fade}} />
      <Sequence from={Math.round(VOICE_DELAY * fps)}>
        <Audio src={staticFile(voice)} />
      </Sequence>
      {drone && <Audio src={staticFile(drone)} volume={droneVolume} />}
    </AbsoluteFill>
  );
};

const FadeIn: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: interpolate(f, [0, XF], [0, 1], {extrapolateRight: 'clamp'})}}>{children}</AbsoluteFill>;
};
