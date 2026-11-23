import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Bird, Chick} from './Bird';

/** لوحة مرجعية للطائر: الأنواع × الحالات */
export const BirdSheet: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#bfe3f5, #f6ecd6)'}}>
    <svg width={1920} height={1080}>
      {(['sparrow', 'swallow', 'goose', 'tern'] as const).map((k, r) => (
        <g key={k}>
          <Bird kind={k} x={200} y={140 + r * 240} frame={3} mode="fly" />
          <Bird kind={k} x={480} y={140 + r * 240} frame={10} mode="fly" />
          <Bird kind={k} x={760} y={140 + r * 240} frame={0} mode="glide" expr="happy" />
          <Bird kind={k} x={1040} y={120 + r * 240} frame={0} mode="perch" expr="sad" shiver={1} />
          <Bird kind={k} x={1320} y={120 + r * 240} frame={0} mode="perch" peck={1} />
          <Bird kind={k} x={1600} y={120 + r * 240} frame={0} mode="perch" expr="shock" mouth={1} carry={k === 'sparrow' ? 'worm' : null} flip />
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <Chick key={i} x={1800} y={200 + i * 120} frame={i * 3 + 2} seed={i} />
      ))}
    </svg>
  </AbsoluteFill>
);
