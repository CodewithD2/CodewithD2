import AUDIO from './audio.json';
import SFX from './sfx.json';
import {makeTrack} from '../../shorts/track';

/** صوت شورت «لماذا بُني سور الصين العظيم؟» — [الجملة، الفاصل بعدها] */
export const T = makeTrack({
  audio: AUDIO,
  dir: 'whywall',
  sfxFiles: SFX as Record<string, string>,
  order: [
    ['s1_1', 0.12],
    ['s1_2', 0.25],
    ['s2_1', 0.15],
    ['s3_1', 0.15],
    ['s4_1', 0.15],
    ['s5_1', 0.15],
    ['s6_1', 0.2],
    ['s7_1', 0],
  ],
});
export const {S, E, wordAt, TOTAL_S, TOTAL_FRAMES} = T;
