import React from 'react';
import cues from './cues.json';
import {EpisodeBase, ShotDef} from './lib/EpisodeBase';
import {Shot1Night} from './shots/Shot1Night';
import {Shot2Sultan} from './shots/Shot2Sultan';
import {Shot3Haul} from './shots/Shot3Haul';
import {Shot4Dawn} from './shots/Shot4Dawn';

// الحلقة ١: السفن فوق اليابسة (القسطنطينية ١٤٥٣)
export const SHOTS: ShotDef[] = [
  {at: 0, C: Shot1Night},
  {at: 10.1, C: Shot2Sultan},
  {at: 17.55, C: Shot3Haul},
  {at: 24.0, C: Shot4Dawn},
];
export const DURATION_S = 31;

export const Episode: React.FC = () => <EpisodeBase shots={SHOTS} cues={cues} voice="voice.mp3" drone="drone.wav" />;
