import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Actor, ScriptErrorOverlay, useScene} from './lib/script';
import {SceneAudio} from './lib/sfx';
import {castOf} from './cast';
import {Backdrop} from './world/backdrops';

/** اختبار المؤثرات الصوتية: خطوات تلقائية متزامنة، جري، قفز، ضربة سيف، ارتطام، هتاف + صوت المعسكر المحيطي */

const CAST = castOf({j1: ['janissary', 1], j2: ['janissary', 4], g: ['byzGuard', 2]});

export const SFX_SCRIPT = `# المؤثرات الصوتية
@0s     j1: enter x=-120 y=930 s=1.05 | walk to 620
@0.6s   g:  enter x=2050 y=930 s=1.05 | walk to 1250 speed=slow
@0s     j1: take kilij right
@0s     g:  take spear right
@after j1 j1: pose swing for 2s
@after g  g: sfx clang delay=0.35s | act scared for 1.2s
@6.4s   camera: shake amp=14 for 0.9s | sfx boom vol=0.9
@6.6s   g:  run to 2300
@7.4s   j2: enter x=-150 y=930 s=1.0 | run to 900
@after j2 j2: jump height=80 | act cheer for 2s | sfx cheer vol=0.8 for 3s
`;

export const SFX_TEST_FRAMES = 360;

export const SfxTest: React.FC = () => {
  const f = useCurrentFrame();
  const scene = useScene(SFX_SCRIPT, {cast: CAST});
  return (
    <AbsoluteFill>
      <Backdrop name="militaryCamp" time="dusk" frame={f} cam={scene.cam(f)}>
        <Actor scene={scene} id="g" />
        <Actor scene={scene} id="j2" />
        <Actor scene={scene} id="j1" />
      </Backdrop>
      <SceneAudio scene={scene} />
      <div style={{position: 'absolute', left: 30, top: 30, padding: '12px 18px', background: 'rgba(20,18,30,0.8)', borderRadius: 10, color: '#c9c4d6', fontFamily: 'DejaVu Sans Mono, monospace', fontSize: 18, whiteSpace: 'pre', direction: 'ltr'}}>
        {scene.sfx().filter((e) => e.t <= f / 30 && f / 30 < e.t + 0.5).map((e) => `♪ ${e.name}${e.who ? ' — ' + e.who : ''}`).join('\n') || ' '}
      </div>
      <ScriptErrorOverlay scene={scene} />
    </AbsoluteFill>
  );
};
