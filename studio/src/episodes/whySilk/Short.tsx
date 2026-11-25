import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {FilmLook} from '../../shots/common';
import {MUSIC} from '../../lib/music';
import {FPS, SfxCue} from '../../shorts/track';
import {SceneAmazon, SceneCarpet, SceneNetwork, SceneNo, SceneProps, SceneRelay} from './ScenesA';
import {SceneAsk, SceneGoods, SceneName, SceneSecret} from './ScenesB';
import {S, T, TOTAL_FRAMES, TOTAL_S, E, wordAt} from './track';

/* =====================================================================
 * شورت «ليه ولماذا؟» — لماذا سُمّي بطريق الحرير؟ (1080×1920، ~٥٢ث، أسلوب كوميدي)
 * ===================================================================== */

export const WHY_SILK_FRAMES = TOTAL_FRAMES;
const XF = 0.25;

const SCENES: {from: number; C: React.FC<SceneProps>; cut?: boolean}[] = [
  {from: 0, C: SceneCarpet},
  {from: S('s1_2') - 0.05, C: SceneNo, cut: true},
  {from: S('s2_1') - 0.3, C: SceneNetwork},
  {from: S('s3_1') - 0.3, C: SceneAmazon},
  {from: S('s4_1') - 0.3, C: SceneRelay},
  {from: S('s5_1') - 0.3, C: SceneSecret},
  {from: S('s6_1') - 0.3, C: SceneGoods},
  {from: S('s7_1') - 0.3, C: SceneName},
  {from: S('s8_1') - 0.3, C: SceneAsk},
];

/** لحظات النكت: خدش أسطوانة داخل وقفة صامتة (لا يتداخل مع الكلام أبداً) + إسكات الموسيقى حتى بعد الكلمة */
const wordEnd = (id: string, w: string) => {
  const c = T.CLIPS[id];
  const t = wordAt(id, w) - c.t0;
  const x = c.e.words.find((q) => Math.abs(q.t - t) < 1e-6)!;
  return c.t0 + x.t + x.d;
};
// [بداية الوقفة، الكلمة التالية بعد الوقفة]
const GAPS: [number, number][] = [
  [E('s1_1'), S('s1_2')],
  [wordEnd('s5_1', 'كشفته'), wordAt('s5_1', 'ستفقد')],
  [wordEnd('s6_1', 'البارود'), wordAt('s6_1', 'ويا')],
];
const SCRATCH = GAPS.map(([a, b]) => ({at: a + 0.04, dur: Math.max(0.3, b - a - 0.1)}));
export const SILK_MUSIC_MUTE = GAPS.map(([a, b]) => ({t0: a, t1: b + 1.0}));

export const WHY_SILK_SFX: SfxCue[] = [
  ...SCRATCH.map(({at, dur}) => ({at, name: 'scratch', vol: 0.5, dur, fadeOut: 0.08, loop: false})),
  {at: wordAt('s1_1', 'لماذا') - 0.1, name: 'pop', vol: 0.35, dur: 0.6, loop: false},
  {at: S('s1_2') + 0.1, name: 'thud', vol: 0.4, dur: 1, loop: false},
  {at: wordAt('s2_1', 'فوضوية') - 0.1, name: 'pop', vol: 0.3, dur: 0.6, loop: false},
  {at: S('s3_1') - 0.3, name: 'camelBells', vol: 0.22, dur: wordAt('s3_1', 'يسرقك') - S('s3_1') + 0.4},
  {at: wordAt('s3_1', 'يسرقك') - 0.1, name: 'swoosh', vol: 0.4, dur: 1, loop: false},
  {at: wordAt('s4_1', 'تنقلت') - 0.2, name: 'swoosh', vol: 0.3, dur: 1, loop: false},
  {at: wordAt('s4_1', 'تاجر', 2) - 0.1, name: 'swoosh', vol: 0.3, dur: 1, loop: false},
  {at: wordAt('s4_1', 'كسباق') - 0.1, name: 'swoosh', vol: 0.3, dur: 1, loop: false},
  {at: wordAt('s4_1', 'العملاق'), name: 'swoosh', vol: 0.3, dur: 1, loop: false},
  {at: wordAt('s5_1', 'سر') - 0.1, name: 'pop', vol: 0.35, dur: 0.6, loop: false},
  {at: wordAt('s5_1', 'حرفيا') - 0.05, name: 'boing', vol: 0.5, dur: 1.2, loop: false},
  ...['التوابل', 'والورق', 'البارود'].map((w) => ({at: wordAt('s6_1', w) - 0.1, name: 'pop', vol: 0.35, dur: 0.6, loop: false})),
  {at: wordAt('s7_1', 'اخترعه') + 0.1, name: 'thud', vol: 0.5, dur: 1, loop: false},
  {at: wordAt('s8_1', 'هل'), name: 'pop', vol: 0.3, dur: 0.6, loop: false},
];

export const WhySilkShort: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const fadeBlack = Math.max(interpolate(t, [0, 0.3], [1, 0], {extrapolateRight: 'clamp'}), interpolate(t, [TOTAL_S - 0.7, TOTAL_S - 0.1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {SCENES.map(({from, C, cut}, i) => {
        const to = i < SCENES.length - 1 ? SCENES[i + 1].from + (SCENES[i + 1].cut ? 0 : XF) : Infinity;
        if (t < from || t > to) return null;
        const op = i === 0 || cut ? 1 : interpolate(t, [from, from + XF], [0, 1], {extrapolateRight: 'clamp'});
        return (
          <AbsoluteFill key={i} style={{opacity: op}}>
            <C t={t} f={f} />
          </AbsoluteFill>
        );
      })}
      <FilmLook frame={f} />
      <T.Subtitles />
      <AbsoluteFill style={{background: '#000', opacity: fadeBlack}} />
      <T.Audio sfx={WHY_SILK_SFX} music={MUSIC.bluesky} musicHigh={0.15} musicLow={0.055} musicMute={SILK_MUSIC_MUTE} />
    </AbsoluteFill>
  );
};
