import React from 'react';
import {EpisodeBase, ShotDef} from '../../lib/EpisodeBase';
import cues from './cues.json';
import {SuezShot1, SuezShot2} from './ShotsA';
import {SuezShot3, SuezShot4} from './ShotsB';

// الحلقة ٢: خطاب التأميم — الإسكندرية ٢٦ يوليو ١٩٥٦
// بدايات اللقطات = بداية الجملة في cues.json + VOICE_DELAY (0.6)
export const SUEZ_SHOTS: ShotDef[] = [
  {at: 0, C: SuezShot1},
  {at: 11.94, C: SuezShot2},
  {at: 18.22, C: SuezShot3},
  {at: 24.36, C: SuezShot4},
];
export const SUEZ_DURATION_S = 32;

export const SuezEpisode: React.FC = () => (
  <EpisodeBase shots={SUEZ_SHOTS} cues={cues} voice="suez/voice.mp3" drone="suez/drone.wav" />
);
