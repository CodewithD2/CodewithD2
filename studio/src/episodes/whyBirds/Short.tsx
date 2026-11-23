import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {FilmLook} from '../../shots/common';
import {SceneEnd, SceneNav, SceneTern} from './ScenesB';
import {SceneOpen, SceneProps, SceneSouth, SceneSpring, SceneWinter} from './ScenesA';
import {FPS, S, ShortAudio, ShortSubtitles, SfxCue, TOTAL_FRAMES, TOTAL_S, wordAt} from './track';

/* =====================================================================
 * شورت «ليه ولماذا؟» — لماذا تهاجر الطيور؟ (1080×1920، أقل من دقيقة)
 * ===================================================================== */

export const WHY_BIRDS_FRAMES = TOTAL_FRAMES;
const XF = 0.3; // ثوانٍ لتداخل المشاهد

const SCENES: {from: number; C: React.FC<SceneProps>}[] = [
  {from: 0, C: SceneOpen},
  {from: S('s2_2') - 0.3, C: SceneWinter},
  {from: S('s3_1') - 0.3, C: SceneSouth},
  {from: S('s4_1') - 0.3, C: SceneSpring},
  {from: S('s5_1') - 0.3, C: SceneNav},
  {from: S('s6_1') - 0.3, C: SceneTern},
  {from: S('s7_1') - 0.3, C: SceneEnd},
];

/** مواضع المؤثرات الصوتية الحقيقية (تعمل تلقائياً حين تُضاف ملفاتها في sfx.json) */
export const WHY_BIRDS_SFX: SfxCue[] = [
  {at: 0.2, name: 'wings', vol: 0.07, dur: S('s2_2') - 0.4},
  {at: 0.8, name: 'geese', vol: 0.17, dur: S('s2_2') - 1.2},
  {at: wordAt('s1_2', 'لماذا') - 0.15, name: 'whoosh', vol: 0.22, dur: 1.2},
  {at: S('s2_2') - 0.4, name: 'wind', vol: 0.12, dur: S('s3_1') - S('s2_2') + 0.6},
  {at: wordAt('s2_2', 'تتجمد') - 0.1, name: 'ice', vol: 0.5, dur: 2.2},
  {at: S('s3_1') - 0.35, name: 'whoosh', vol: 0.22, dur: 1.2},
  {at: S('s3_1') + 0.6, name: 'waves', vol: 0.18, dur: 2.6},
  {at: S('s3_1'), name: 'wings', vol: 0.07, dur: S('s4_1') - S('s3_1')},
  {at: S('s4_1') - 0.3, name: 'spring', vol: 0.4, dur: S('s5_1') - S('s4_1') + 0.3},
  {at: S('s4_2') + 0.2, name: 'chicks', vol: 0.3, dur: S('s5_1') - S('s4_2')},
  {at: S('s5_1') - 0.3, name: 'crickets', vol: 0.55, dur: S('s6_1') - S('s5_1') + 0.3},
  {at: wordAt('s5_2', 'المجال') - 0.2, name: 'whoosh', vol: 0.22, dur: 1.2},
  {at: S('s6_1') - 0.3, name: 'whoosh', vol: 0.22, dur: 1.2},
  {at: wordAt('s6_1', 'فتقطع'), name: 'wings', vol: 0.07, dur: 3},
  {at: S('s7_1') - 0.3, name: 'geese', vol: 0.2, dur: TOTAL_S - S('s7_1') + 0.3},
];

export const WhyBirdsShort: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const fadeBlack = Math.max(interpolate(t, [0, 0.35], [1, 0], {extrapolateRight: 'clamp'}), interpolate(t, [TOTAL_S - 0.7, TOTAL_S - 0.1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {SCENES.map(({from, C}, i) => {
        const to = i < SCENES.length - 1 ? SCENES[i + 1].from + XF : Infinity;
        if (t < from || t > to) return null;
        const op = i === 0 ? 1 : interpolate(t, [from, from + XF], [0, 1], {extrapolateRight: 'clamp'});
        return (
          <AbsoluteFill key={i} style={{opacity: op}}>
            <C t={t} f={f} />
          </AbsoluteFill>
        );
      })}
      <FilmLook frame={f} />
      <ShortSubtitles />
      <AbsoluteFill style={{background: '#000', opacity: fadeBlack}} />
      <ShortAudio sfx={WHY_BIRDS_SFX} />
    </AbsoluteFill>
  );
};
