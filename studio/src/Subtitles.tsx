import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {prog} from './lib/util';

export const VOICE_DELAY = 0.6; // ثوانٍ قبل بدء التعليق

export type Cue = {s: number; e: number; text: string};

export const Subtitles: React.FC<{cues: Cue[]}> = ({cues}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps - VOICE_DELAY;
  const cue = cues.find((c) => t >= c.s && t <= c.e + 0.15);
  if (!cue) return null;
  const a = Math.min(prog(t, cue.s, cue.s + 0.25), 1 - prog(t, cue.e - 0.05, cue.e + 0.15));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 56, display: 'flex', justifyContent: 'center', opacity: a}}>
      <div
        style={{
          maxWidth: 1720,
          padding: '10px 40px 18px',
          background: 'rgba(10,8,14,0.62)',
          borderRadius: 14,
          fontFamily: 'Amiri',
          fontWeight: 700,
          fontSize: 52,
          lineHeight: 1.5,
          color: '#fff6e0',
          direction: 'rtl',
          textAlign: 'center',
          textShadow: '0 2px 8px #000',
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};
