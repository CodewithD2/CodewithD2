import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {SCENE01_TRACK, Scene01} from './Scene01';
import {SCENE02_TRACK, Scene02} from './Scene02';
import {SCENE03_TRACK, Scene03} from './Scene03';
import {SCENE04_TRACK, Scene04} from './Scene04';
import {SCENE05_TRACK, Scene05} from './Scene05';
import {SCENE06_TRACK, Scene06} from './Scene06';
import {SCENE07_TRACK, Scene07} from './Scene07';
import {SCENE08_TRACK, Scene08} from './Scene08';
import {SCENE09_TRACK, Scene09} from './Scene09';

/* =====================================================================
 * حلقة جان دارك — هيكل تجميعي قابل للتوسع مشهد بمشهد ولكل الدفعات القادمة
 * كل مشهد جديد يُضاف هنا في JOAN_SCENES فتُحسب المدة الكلية تلقائياً.
 * ===================================================================== */

export type JoanSceneEntry = {
  id: string;
  title: string;
  component: React.FC;
  durationFrames: number;
};

export const JOAN_SCENES: JoanSceneEntry[] = [
  {id: 'Scene01', title: 'المشهد ١ — كابوس فرنسا ١٤٢٩', component: Scene01, durationFrames: SCENE01_TRACK.durationFrames},
  {id: 'Scene02', title: 'المشهد ٢ — طرق الباب والوعد المستحيل', component: Scene02, durationFrames: SCENE02_TRACK.durationFrames},
  {id: 'Scene03', title: 'المشهد ٣ — حرب المائة عام والقناة الإنجليزية', component: Scene03, durationFrames: SCENE03_TRACK.durationFrames},
  {id: 'Scene04', title: 'المشهد ٤ — الملك شارل السادس المجنون', component: Scene04, durationFrames: SCENE04_TRACK.durationFrames},
  {id: 'Scene05', title: 'المشهد ٥ — الحرب الأهلية وهنري الخامس', component: Scene05, durationFrames: SCENE05_TRACK.durationFrames},
  {id: 'Scene06', title: 'المشهد ٦ — أجينكورت وخيانة بورغوندي', component: Scene06, durationFrames: SCENE06_TRACK.durationFrames},
  {id: 'Scene07', title: 'المشهد ٧ — معاهدة تروا ١٤٢٠', component: Scene07, durationFrames: SCENE07_TRACK.durationFrames},
  {id: 'Scene08', title: 'المشهد ٨ — مفاجأة ١٤٢٢ والملك الرضيع', component: Scene08, durationFrames: SCENE08_TRACK.durationFrames},
  {id: 'Scene09', title: 'المشهد ٩ — حصار أورليان وقرية دومريمي', component: Scene09, durationFrames: SCENE09_TRACK.durationFrames},
];

export const JOAN_TOTAL_FRAMES = JOAN_SCENES.reduce((acc, s) => acc + s.durationFrames, 0);

export const JoanOfArcEpisode: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: '#0d0b12'}}>
      {JOAN_SCENES.map((sc) => {
        const start = from;
        from += sc.durationFrames;
        const Comp = sc.component;
        return (
          <Sequence key={sc.id} from={start} durationInFrames={sc.durationFrames}>
            <Comp />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
