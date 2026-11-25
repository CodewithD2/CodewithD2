import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Actor, Bubbles, ScriptErrorOverlay, defineScene, useScene} from './lib/script';
import {SceneAudio} from './lib/sfx';
import {castOf} from './cast';
import {Backdrop} from './world/backdrops';

/** اختبار الحوار: صوت لكل شخصية، فم متزامن، فقاعات بأربعة أنماط */

export const DIALOGUE_TEST = defineScene(
  'DialogueTest',
  `# حوار تجريبي
@0s      younis: enter x=1350 y=930 s=1.05 face=left
@0s      nasser: enter x=-150 y=930 s=1.1 | walk to 640
@after nasser nasser: say "هل الرِّجالُ جاهِزون يا مَحمود؟"
@after nasser younis: say "نَعَم يا سِيادةَ الرَّئيس، ننتظِرُ كلِمةَ السِّرّ."
@after younis nasser: say "حين تسمَعُها في الخِطاب… تحرَّكوا فوراً." style=whisper
@after nasser younis: say "لكن… ماذا لو فشِلنا؟" style=think for 2s
@after younis nasser: say "لن نفشَل!" style=shout act=angry
@after nasser younis: say "سمعاً وطاعة!" act=cheer
`,
  castOf({nasser: 'nasser', younis: 'mahmoudYounis'}),
);

export const DIALOGUE_TEST_FRAMES = 810;

const Frame: React.FC<{f: number}> = ({f}) => {
  const scene = useScene(DIALOGUE_TEST.script, {cast: DIALOGUE_TEST.cast});
  const off = f - useCurrentFrame();
  return (
    <>
      <Backdrop name="cityPlaza1950s" time="day" frame={f}>
        <Actor scene={scene} id="younis" frameOffset={off} />
        <Actor scene={scene} id="nasser" frameOffset={off} />
        <Bubbles scene={scene} frameOffset={off} />
      </Backdrop>
      <SceneAudio scene={scene} />
      <ScriptErrorOverlay scene={scene} />
    </>
  );
};

export const DialogueTest: React.FC = () => <Frame f={useCurrentFrame()} />;

/** لوحة: لحظة من كل جملة */
export const DialogueSheet: React.FC = () => {
  const scene = useScene(DIALOGUE_TEST.script, {cast: DIALOGUE_TEST.cast});
  // منتصف كل فقاعة (بما فيها فقاعة التفكير)
  const starts = new Map<string, number>();
  for (let f = 0; f < DIALOGUE_TEST_FRAMES; f++)
    for (const id of Object.keys(scene.cast)) {
      const sp = scene.speech(id, f);
      if (sp && !starts.has(sp.text)) starts.set(sp.text, f / 30 + 0.8);
    }
  const all = [...starts.values()].slice(0, 6);
  return (
    <AbsoluteFill style={{background: '#14121c'}}>
      {all.map((t, i) => (
        <div key={i} style={{position: 'absolute', left: 1920 - 636 - (i % 3) * 636, top: 6 + Math.floor(i / 3) * 360, width: 630, height: 354, overflow: 'hidden', borderRadius: 8}}>
          <div style={{width: 1920, height: 1080, transform: `scale(${630 / 1920})`, transformOrigin: 'top left', position: 'relative'}}>
            <Frame f={Math.round(t * 30)} />
          </div>
          <div style={{position: 'absolute', bottom: 6, left: 10, color: '#fff', fontSize: 20, textShadow: '0 1px 4px #000'}}>{t.toFixed(1)}s</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
