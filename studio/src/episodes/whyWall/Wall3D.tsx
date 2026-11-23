import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Cam, REF_FOV, camAt} from '../../lib/stage';
import {Banner} from '../../lib/epic';
import {GodRays, Halo, MistBand, Motes} from '../../lib/fx';
import {INK, easeInOut, lerp, mixColor, prog} from '../../lib/util';
import {Person} from '../../characters/Person';
import type {CharLight} from '../../characters/light';
import {extra} from '../../cast';
import {FarBirds} from '../whyBirds/Bird';
import {Hud, VArt, VLayer, VStage, VW, VH, vPerspective} from '../../shorts/vstage';
import {Grade, hand} from '../../shorts/polish';
import {ChannelBadge, Txt, fade} from '../../shorts/common';
import {FPS} from '../../shorts/track';
import {MountainBand, PagodaRoof, WallRidge} from './assets';
import {S, wordAt} from './track';
import type {SceneProps} from './ScenesA';

/* =====================================================================
 * «ممشى السور» مجسّم 3D حقيقي: أرضية الممشى سطح أفقي يمتد في العمق، والحاجزان الجانبيان
 * بشرفاتهما سطحان عموديان، وبرج بوابة بقوس تعبره الكاميرا، والجنود والرايات لوحات قائمة
 * على أعماق مختلفة. العالم: x,y بإحداثيات الكادر، z نحو الكاميرا (translateZ).
 * القطع مقسّمة ومخفية حين تقترب من مستوى الكاميرا (تجنّب تشوّه CSS 3D عند اختراقها).
 * ===================================================================== */

const P = vPerspective(REF_FOV);
const FLOOR_Y = 1250; // مستوى أرضية الممشى (≈ 290 تحت مركز الكادر = ارتفاع العين)
const HALF = 380; // نصف عرض الممشى
const PH = 150; // ارتفاع الحاجز
const SEG = 300;
const Z_NEAR = 1600;
const Z_FAR = -7600;
const GATE_Z = -2600;
const HAZE = '#e9cfb0';

/** لون حسب العمق (منظور جوي) */
const fog = (c: string, z: number) => mixColor(c, HAZE, Math.min(0.75, Math.max(0, (-z + 400) / 9000)));
const visible = (zNear: number, camZ: number, margin = 60) => zNear + camZ < P - margin;

const Plane: React.FC<{left: number; top: number; w: number; h: number; origin: string; transform: string; children: React.ReactNode}> = ({left, top, w, h, origin, transform, children}) => (
  <div style={{position: 'absolute', left, top, width: w, height: h, transformOrigin: origin, transform, backfaceVisibility: 'visible'}}>
    <svg width={w} height={h} style={{display: 'block', overflow: 'visible'}}>
      {children}
    </svg>
  </div>
);

/** لوحة قائمة على عمق z (بلا تعويض حجم: تصغر بالمنظور الحقيقي) */
const Stand: React.FC<{z: number; children: React.ReactNode}> = ({z, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: VW, height: VH, transform: `translateZ(${z}px)`}}>
    <svg width={VW} height={VH} style={{overflow: 'visible'}}>
      {children}
    </svg>
  </div>
);

const SOLDIERS: {x: number; z: number; seed: number; flip?: boolean; item?: 'spear' | 'flagByz'; look?: number}[] = [
  {x: 540 - 250, z: 700, seed: 1, item: 'spear'},
  {x: 540 + 255, z: 300, seed: 2, flip: true, item: 'spear'},
  {x: 540 - 240, z: -300, seed: 3},
  {x: 540 + 250, z: -800, seed: 4, flip: true, item: 'spear'},
  {x: 540 - 250, z: -1400, seed: 5, item: 'spear'},
  {x: 540 + 240, z: -1900, seed: 6, flip: true},
  {x: 540 - 230, z: -3300, seed: 7, item: 'spear'},
  {x: 540 + 240, z: -3900, seed: 8, flip: true, item: 'spear'},
  {x: 540 - 240, z: -4700, seed: 9},
  {x: 540 + 230, z: -5500, seed: 10, flip: true, item: 'spear'},
];

export const WallWalk3D: React.FC<{cam: Cam; t: number; f: number}> = ({cam, t, f}) => {
  const L: CharLight = {dir: 1, key: '#ffd8a0', shadow: '#4a3050', ambient: 0.12, rim: 0.85};
  const segs = Array.from({length: Math.ceil((Z_NEAR - Z_FAR) / SEG)}, (_, i) => Z_NEAR - i * SEG);
  return (
    <VStage cam={cam}>
      {/* الأرضية: بلاط حجري بلون يذوب في الضباب */}
      {segs.map((zs) =>
        !visible(zs, cam.z, 20) ? null : (
          <Plane key={'f' + zs} left={540 - HALF} top={FLOOR_Y} w={HALF * 2} h={SEG} origin="50% 0%" transform={`translateZ(${zs - SEG}px) rotateX(90deg)`}>
            <rect width={HALF * 2} height={SEG} fill={fog('#b8a284', zs)} />
            {[0, 1, 2, 3].map((r) => (
              <g key={r}>
                <line x1={0} y1={r * 75} x2={HALF * 2} y2={r * 75} stroke={fog('#8a765c', zs)} strokeWidth={4} />
                {Array.from({length: 6}, (_, c) => (
                  <line key={c} x1={(c + (r % 2) * 0.5) * 130} y1={r * 75} x2={(c + (r % 2) * 0.5) * 130} y2={r * 75 + 75} stroke={fog('#8a765c', zs)} strokeWidth={4} />
                ))}
              </g>
            ))}
            <rect x={0} y={0} width={26} height={SEG} fill={fog('#8f7a5e', zs)} />
            <rect x={HALF * 2 - 26} y={0} width={26} height={SEG} fill={fog('#8f7a5e', zs)} />
          </Plane>
        ),
      )}
      {/* الحاجزان الجانبيان بشرفات */}
      {[-1, 1].map((side) =>
        segs.map((zs) =>
          !visible(zs, cam.z, 20) ? null : (
            <Plane key={`w${side}${zs}`} left={540 + side * HALF} top={FLOOR_Y - PH - 60} w={SEG} h={PH + 60} origin="0% 50%" transform={`translateZ(${zs}px) rotateY(90deg)`}>
              <path d={`M 0 60 ${Array.from({length: 5}, (_, k) => `L ${k * 60} 60 L ${k * 60} 4 L ${k * 60 + 44} 4 L ${k * 60 + 44} 60`).join(' ')} L ${SEG} 60 L ${SEG} ${PH + 60} L 0 ${PH + 60} Z`} fill={fog(side < 0 ? '#c9b08a' : '#a8916e', zs)} stroke={fog('#3a2e24', zs)} strokeWidth={5} strokeLinejoin="round" />
              {[100, 150].map((y) => (
                <line key={y} x1={0} y1={y} x2={SEG} y2={y} stroke={fog('#7a6650', zs)} strokeWidth={3} opacity={0.6} />
              ))}
              {/* فتحة رماية */}
              <rect x={SEG / 2 - 10} y={86} width={20} height={34} rx={6} fill={fog('#3a2e24', zs)} />
            </Plane>
          ),
        ),
      )}
      {/* برج البوابة: واجهة بقوس تعبره الكاميرا */}
      {visible(GATE_Z, cam.z, 10) && (
        <Stand z={GATE_Z}>
          <path d={`M -500 ${FLOOR_Y} L -500 ${FLOOR_Y - 760} L 1580 ${FLOOR_Y - 760} L 1580 ${FLOOR_Y} L ${540 + 230} ${FLOOR_Y} L ${540 + 230} ${FLOOR_Y - 330} Q 540 ${FLOOR_Y - 560} ${540 - 230} ${FLOOR_Y - 330} L ${540 - 230} ${FLOOR_Y} Z`} fill={fog('#c2a77e', GATE_Z)} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          {[1, 2, 3, 4].map((r) => (
            <line key={r} x1={-500} y1={FLOOR_Y - r * 150} x2={1580} y2={FLOOR_Y - r * 150} stroke={fog('#8a765c', GATE_Z)} strokeWidth={4} />
          ))}
          {Array.from({length: 14}, (_, i) => (
            <rect key={i} x={-480 + i * 150} y={FLOOR_Y - 830} width={90} height={70} fill={fog('#c2a77e', GATE_Z)} stroke={INK} strokeWidth={6} />
          ))}
          <rect x={540 - 260} y={FLOOR_Y - 1110} width={520} height={280} fill="#b8322c" stroke={INK} strokeWidth={8} />
          <PagodaRoof x={540} y={FLOOR_Y - 1110} w={680} h={110} />
          <rect x={540 - 90} y={FLOOR_Y - 700} width={180} height={70} rx={8} fill="#1f2a4a" stroke="#d9a520" strokeWidth={6} />
        </Stand>
      )}
      {/* برج النهاية البعيد */}
      <Stand z={Z_FAR + 200}>
        <rect x={540 - 420} y={FLOOR_Y - 640} width={840} height={640} fill={fog('#c2a77e', Z_FAR)} stroke={fog(INK, Z_FAR)} strokeWidth={8} />
        <PagodaRoof x={540} y={FLOOR_Y - 640} w={980} h={150} color={fog('#2f5a4a', Z_FAR)} under={fog('#c9302c', Z_FAR)} />
        <path d={`M ${540 - 140} ${FLOOR_Y} L ${540 - 140} ${FLOOR_Y - 220} Q 540 ${FLOOR_Y - 340} ${540 + 140} ${FLOOR_Y - 220} L ${540 + 140} ${FLOOR_Y} Z`} fill={fog('#2a1e1a', Z_FAR)} />
      </Stand>
      {/* الرايات على الحاجزين */}
      {Array.from({length: 12}, (_, i) => {
        const z = 1200 - i * 760;
        const side = i % 2 ? 1 : -1;
        if (!visible(z, cam.z, 300)) return null;
        return (
          <Stand key={'b' + i} z={z}>
            <Banner x={540 + side * (HALF + 10)} y={FLOOR_Y - PH - 40} h={360} color={i % 3 === 0 ? '#2f5a9a' : '#c9302c'} frame={f} seed={i} />
          </Stand>
        );
      })}
      {/* الجنود */}
      {SOLDIERS.map((s) =>
        !visible(s.z, cam.z, 280) ? null : (
          <Stand key={'s' + s.seed} z={s.z}>
            <Person {...extra('mingSoldier', s.seed)} light={L} x={s.x} y={FLOOR_Y + 6} s={1.15} frame={f} seed={s.seed} flip={s.flip} view={s.flip ? 30 : 30} holdR={s.item} pose={s.item === 'spear' ? 'stand' : 'cross'} motion="idle" energy={0.3} />
          </Stand>
        ),
      )}
    </VStage>
  );
};

/* ===================== المشهد صفر (الهوك): طيران الكاميرا بين الجنود على ممشى السور ===================== */
export const SceneWallHook: React.FC<SceneProps> = ({t, f}) => {
  const tEnd = S('s1_2');
  const tKm = wordAt('s1_1', 'الكيلومترات');
  const u = prog(t, 0, tEnd);
  // طيران أمامي (يعبر قوس البوابة عند ~70٪) ثم صعود ونظرة للأسفل
  const zMove = lerp(0, 6100, easeInOut(Math.min(1, u * 1.08)));
  const rise = easeInOut(prog(t, tEnd - 1.3, tEnd + 0.3));
  const base: Cam = {
    x: Math.sin(t * 0.9) * 40,
    y: lerp(0, -900, rise) + Math.sin(t * 5) * 3,
    z: zMove,
    rx: lerp(0, -16, rise),
    ry: Math.sin(t * 0.8) * 4,
    rz: Math.sin(t * 0.6) * 1.2,
    fov: 45 + 8 * (1 - u),
  };
  const cam = hand(base, t, 0.5);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#6a8ec8 0%, #c4cde0 40%, #ffd8a8 62%, #f2c08a 100%)'}}>
      {/* سماء وجبال بعيدة جداً (لا تتأثر بمسافة الطيران تقريباً) */}
      <VStage cam={{...cam, z: cam.z * 0.02}}>
        <VLayer d={6000}>
          <VArt>
            <Halo id="wh-sun" cx={700} cy={900} r={700} color="#fff0c4" opacity={0.95} core={0.25} />
            <circle cx={700} cy={900} r={130} fill="#fff4d6" />
            <GodRays id="wh-gr" cx={700} cy={900} frame={f} color="#fff0c0" opacity={0.25} />
            <FarBirds frame={f} seed="wh-b" color="#5a5a6a" pts={Array.from({length: 6}, (_, i) => ({x: 300 + i * 40 + t * 40, y: 760 + (i % 3) * 18, s: 0.9}))} />
          </VArt>
        </VLayer>
        <VLayer d={3500}>
          <VArt>
            <MountainBand fn={(x) => 1010 - 160 * Math.abs(Math.sin(x / 260 + 0.5)) - 40 * Math.sin(x / 80)} fill="#a6b2c4" />
            <WallRidge id="wh-w1" fn={(x) => 1010 - 160 * Math.abs(Math.sin(x / 260 + 0.5)) - 40 * Math.sin(x / 80)} x0={-900} x1={2000} h={12} step={10} outline={2} stone="#b9b3b0" top="#cfc6bf" towersAt={[-300, 400, 1100]} towerS={0.5} />
            <MistBand id="wh-m1" frame={f} y={1080} color="#f0dcc8" x0={-900} x1={2000} h={180} />
          </VArt>
        </VLayer>
      </VStage>
      {/* المجسّم */}
      <WallWalk3D cam={cam} t={t} f={f} />
      {/* ذرات في الضوء أمام العدسة */}
      <VStage cam={{...cam, z: 0}}>
        <VLayer d={-200} blur={1.5}>
          <VArt>
            <Motes id="wh-mo" frame={f} n={50} x0={-200} x1={1300} y0={200} y1={1700} color="#fff1c8" size={4} />
          </VArt>
        </VLayer>
      </VStage>
      <Grade g={{top: '#4a6fb0', bottom: '#a8603a', opacity: 0.3, light: '#fff0c0', at: [65, 47], strength: 0.32}} />
      <Hud>
        <ChannelBadge x={540} y={150} s={0.9} opacity={fade(t, 0.2, 0.6, tEnd - 0.5, tEnd - 0.1)} />
        <g opacity={fade(t, tKm - 0.15, tKm + 0.3, tEnd - 0.2, tEnd + 0.2)}>
          <Txt x={540} y={320} size={88} fill="#fff" sw={13}>
            آلاف الكيلومترات
          </Txt>
        </g>
      </Hud>
    </AbsoluteFill>
  );
};
void random;
