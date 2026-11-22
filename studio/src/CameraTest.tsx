import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Actor, ScriptErrorOverlay, useScene} from './lib/script';
import {castOf} from './cast';
import {Backdrop} from './world/backdrops';

/** اختبار أوامر الكاميرا في السكريبت: متابعة، تكبير، اهتزاز، رجوع */

const CAST = castOf({nasser: 'nasser', mona: ['woman1950s', 2]});

export const CAMERA_SCRIPT = `# أوامر الكاميرا
@0s      nasser: enter x=150 y=930 s=1.1 | walk to 760
@0s      mona:   enter x=1250 y=930 s=1.05 face=left
@0s      camera: follow nasser lag=0.4 blend=0.2
@after nasser camera: zoom 1.5 dur=1.2s
@after nasser nasser: act angry energy=0.9 for 1.6s
@5.2s    camera: shake amp=16 for 0.8s
@5.2s    mona:   act scared for 1.2s
@6.4s    camera: unfollow blend=1 | zoom 1 dur=1s
@7.6s    mona:   run to 2200
@7.8s    camera: follow mona lag=0.5
@9.6s    camera: reset 1.2s
`;

export const CAMERA_TEST_FRAMES = 345;

const Frame: React.FC<{f: number}> = ({f}) => {
  const scene = useScene(CAMERA_SCRIPT, {cast: CAST});
  return (
    <>
      <Backdrop name="cityPlaza1950s" time="dusk" frame={f} cam={scene.cam(f)}>
        <Actor scene={scene} id="mona" frameOffset={f - useCurrentFrame()} />
        <Actor scene={scene} id="nasser" frameOffset={f - useCurrentFrame()} />
      </Backdrop>
      <ScriptErrorOverlay scene={scene} />
    </>
  );
};

export const CameraTest: React.FC = () => <Frame f={useCurrentFrame()} />;

/** لوحة إطارات متتابعة للمراجعة بدون تصيير فيديو */
export const CameraSheet: React.FC = () => {
  const times = [0.8, 2.6, 3.9, 5.4, 7.0, 8.4, 9.4, 11];
  return (
    <AbsoluteFill style={{background: '#14121c'}}>
      {times.map((t, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return (
          <div key={i} style={{position: 'absolute', left: 1920 - 476 - col * 476, top: 20 + row * 275, width: 468, height: 263, overflow: 'hidden', borderRadius: 8}}>
            <div style={{width: 1920, height: 1080, transform: `scale(${468 / 1920})`, transformOrigin: 'top left', position: 'relative'}}>
              <Frame f={Math.round(t * 30)} />
            </div>
            <div style={{position: 'absolute', top: 4, right: 8, color: '#fff', fontFamily: 'Amiri', fontSize: 24, textShadow: '0 1px 4px #000'}}>{t}s</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 40, top: 580, width: 1840, whiteSpace: 'pre', color: '#c9c4d6', fontFamily: 'DejaVu Sans Mono, monospace', fontSize: 20, lineHeight: 1.5, direction: 'ltr'}}>{CAMERA_SCRIPT}</div>
    </AbsoluteFill>
  );
};
