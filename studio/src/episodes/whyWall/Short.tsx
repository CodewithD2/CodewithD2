import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {FilmLook} from '../../shots/common';
import {MUSIC} from '../../lib/music';
import {FPS, SfxCue} from '../../shorts/track';
import {SceneBeacons, SceneNomads, SceneOpen, SceneProps, SceneUnify} from './ScenesA';
import {SceneEnd, SceneMing, SceneSilk} from './ScenesB';
import {SceneWallHook} from './Wall3D';
import {S, T, TOTAL_FRAMES, TOTAL_S, wordAt} from './track';

/* =====================================================================
 * شورت «ليه ولماذا؟» — لماذا بُني سور الصين العظيم؟ (1080×1920، أقل من دقيقة)
 * ===================================================================== */

export const WHY_WALL_FRAMES = TOTAL_FRAMES;
const XF = 0.3;

const SCENES: {from: number; C: React.FC<SceneProps>}[] = [
  {from: 0, C: SceneWallHook},
  {from: S('s1_2') - 0.3, C: SceneOpen},
  {from: S('s2_1') - 0.3, C: SceneNomads},
  {from: S('s3_1') - 0.3, C: SceneUnify},
  {from: S('s4_1') - 0.3, C: SceneBeacons},
  {from: S('s5_1') - 0.3, C: SceneSilk},
  {from: S('s6_1') - 0.3, C: SceneMing},
  {from: S('s7_1') - 0.3, C: SceneEnd},
];

/** مواضع المؤثرات الحقيقية (تعمل حين تُسجَّل ملفاتها في sfx.json) */
export const WHY_WALL_SFX: SfxCue[] = [
  {at: 0.1, name: 'mountainWind', vol: 0.1, dur: S('s2_1')},
  // الهوك ثلاثي الأبعاد: ووش عند عبور قوس البوابة
  {at: S('s1_2') * 0.6, name: 'whoosh', vol: 0.3, dur: 1.4, loop: false},
  {at: wordAt('s1_2', 'فلماذا') - 0.15, name: 'whoosh', vol: 0.22, dur: 1.2, loop: false},
  {at: S('s2_1') - 0.3, name: 'gallop', vol: 0.2, dur: wordAt('s2_1', 'يختفون') - S('s2_1') + 1.2},
  {at: wordAt('s2_1', 'يغيرون') - 0.1, name: 'warDrums', vol: 0.18, dur: 2.4},
  {at: S('s3_1') - 0.3, name: 'whoosh', vol: 0.22, dur: 1.2, loop: false},
  {at: wordAt('s3_1', 'بربطها') + 0.35, name: 'stamp', vol: 0.6, dur: 1.2, loop: false},
  {at: S('s4_1') - 0.3, name: 'nightCrickets', vol: 0.25, dur: wordAt('s4_1', 'والدخان') - S('s4_1') + 0.6},
  {at: wordAt('s4_1', 'تشعل') - 0.15, name: 'fire', vol: 0.22, dur: wordAt('s4_1', 'والدخان') - wordAt('s4_1', 'تشعل') + 0.6},
  {at: wordAt('s4_1', 'والدخان') - 0.2, name: 'mountainWind', vol: 0.08, dur: S('s5_1') - wordAt('s4_1', 'والدخان') + 0.2},
  {at: S('s5_1') - 0.3, name: 'camelBells', vol: 0.28, dur: S('s6_1') - S('s5_1') + 0.3},
  {at: wordAt('s5_1', 'الضرائب') + 0.05, name: 'coins', vol: 0.5, dur: 1.6, loop: false},
  {at: S('s6_1') - 0.3, name: 'stoneWork', vol: 0.22, dur: wordAt('s6_1', 'وبملاط') - S('s6_1') + 0.3},
  {at: wordAt('s6_1', 'بحساء') - 0.05, name: 'goo', vol: 0.5, dur: 1.8, loop: false},
  {at: S('s7_1') - 0.3, name: 'mountainWind', vol: 0.07, dur: TOTAL_S - S('s7_1') + 0.3},
];

export const WhyWallShort: React.FC = () => {
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
      <T.Subtitles />
      <AbsoluteFill style={{background: '#000', opacity: fadeBlack}} />
      <T.Audio sfx={WHY_WALL_SFX} music={MUSIC.karst} musicHigh={0.2} musicLow={0.09} />
    </AbsoluteFill>
  );
};
