import AUDIO from './audio.json';
import SFX from './sfx.json';
import {makeTrack} from '../../shorts/track';

/** صوت شورت «لماذا سُمّي بطريق الحرير؟» (النسخة المختصرة ~٥١ث، tight) */
export const T = makeTrack({
  audio: AUDIO,
  dir: 'whysilk',
  sfxFiles: SFX as Record<string, string>,
  tight: true,
  order: [
    ['s1_1', 0.15],
    ['s1_2', 0.35],
    ['s2_1', 0.2],
    ['s3_1', 0.2],
    ['s4_1', 0.2],
    ['s5_1', 0.3],
    ['s6_1', 0.25],
    ['s7_1', 0.25],
    ['s8_1', 0],
  ],
  tail: 1.0,
});
export const {S, E, wordAt, TOTAL_S, TOTAL_FRAMES} = T;
