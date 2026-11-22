import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Shot1Night} from './shots/Shot1Night';
import {Shot2Sultan} from './shots/Shot2Sultan';
import {Shot3Haul} from './shots/Shot3Haul';
import {Shot4Dawn} from './shots/Shot4Dawn';
import {FilmLook} from './shots/common';
import {Subtitles, VOICE_DELAY} from './Subtitles';

const XF = 14; // إطارات الانتقال بين اللقطات

// بدايات اللقطات بالثواني، مضبوطة على جمل التعليق + تأخير الصوت
export const SHOTS = [
  {at: 0, C: Shot1Night},
  {at: 10.1, C: Shot2Sultan},
  {at: 17.55, C: Shot3Haul},
  {at: 24.0, C: Shot4Dawn},
];
export const DURATION_S = 31;

const FadeIn: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: interpolate(f, [0, XF], [0, 1], {extrapolateRight: 'clamp'})}}>{children}</AbsoluteFill>;
};

export const Episode: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const fade = Math.max(
    interpolate(frame, [0, 22], [1, 0], {extrapolateRight: 'clamp'}),
    interpolate(frame, [durationInFrames - 45, durationInFrames - 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  );
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {SHOTS.map(({at, C}, i) => {
        const from = Math.round(at * fps) - (i ? XF / 2 : 0);
        const end = i < SHOTS.length - 1 ? Math.round(SHOTS[i + 1].at * fps) + XF / 2 : durationInFrames;
        return (
          <Sequence key={i} from={from} durationInFrames={end - from}>
            {i === 0 ? <C /> : <FadeIn><C /></FadeIn>}
          </Sequence>
        );
      })}
      <FilmLook frame={frame} />
      <Subtitles />
      <AbsoluteFill style={{background: '#000', opacity: fade}} />
      <Sequence from={Math.round(VOICE_DELAY * fps)}>
        <Audio src={staticFile('voice.mp3')} />
      </Sequence>
      <Audio src={staticFile('drone.wav')} volume={0.06} />
    </AbsoluteFill>
  );
};
