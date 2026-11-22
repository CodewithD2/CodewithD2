import React from 'react';
import {AbsoluteFill} from 'remotion';
import {extra, look, roleBase} from './cast';
import type {Look} from './cast';
import {Held} from './characters/items';
import {Person, Pose, View} from './characters/Person';
import {DepthSort, Sorted} from './lib/depth';
import {Actor, CastMember, useScene} from './lib/script';
import {SouqStall} from './world/buildings';
import {WorldCtx, worldFor} from './world/lighting';

/** لوحات البند ٥ب: ترتيب الرسم حسب العمق */

const Title: React.FC<{t: string}> = ({t}) => (
  <text x={960} y={62} fontFamily="Amiri" fontSize={48} fontWeight={700} textAnchor="middle" fill="#2a2030" direction="rtl">
    {t}
  </text>
);
const VIEWS: {v: View; label: string}[] = [
  {v: 'front', label: 'أمامي'},
  {v: 'threeQuarter', label: 'ثلاثة أرباع'},
  {v: 'side', label: 'جانبي'},
  {v: 'threeQuarterBack', label: 'ثلاثة أرباع خلفي'},
  {v: 'back', label: 'خلفي'},
];

/** أيدٍ وأشياء أمام الوجه وخلف الرأس في الاتجاهات الخمسة */
export const DepthTurn: React.FC = () => {
  const rows: {who: Look; pose: Pose; R?: Held; L?: Held; label: string; expr?: 'speak' | 'think' | 'angry' | 'neutral'}[] = [
    {who: extra('egyptCivilian', 3), pose: 'read', R: {id: 'newspaper', text: 'الأهرام'}, label: 'يقرأ جريدة', expr: 'think'},
    {who: look('halilPasha'), pose: 'present', R: 'scroll', label: 'يعرض مخطوطة'},
    {who: extra('egyptCivilian', 5), pose: 'phone', L: 'phone', label: 'يتكلم في الهاتف', expr: 'speak'},
    {who: roleBase('janissary'), pose: 'raise', R: 'kilij', L: 'shield', label: 'يرفع سيفاً', expr: 'angry'},
  ];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#f6efe2, #e6d9c4)'}}>
      <svg width={1920} height={1080}>
        <Title t="ترتيب الرسم بالعمق — الأيدي والأشياء أمام الرأس وخلفه" />
        {VIEWS.map((v, c) => (
          <text key={v.v} x={1790 - c * 330} y={118} fontFamily="Amiri" fontSize={28} fontWeight={700} textAnchor="middle" fill="#5a4a5a" direction="rtl">
            {v.label}
          </text>
        ))}
        {rows.map((r, i) => (
          <g key={i}>
            <text x={130} y={300 + i * 236} fontFamily="Amiri" fontSize={28} fontWeight={700} textAnchor="middle" fill="#2a2030" direction="rtl">
              {r.label}
            </text>
            {VIEWS.map((v, c) => (
              <Person key={v.v} x={1790 - c * 330} y={350 + i * 236} s={0.6} frame={30} seed={i} {...r.who} shading="cel" pose={r.pose} holdR={r.R} holdL={r.L} view={v.v} expr={r.expr ?? 'neutral'} />
            ))}
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** شخصية تمشي خلف دكان السوق ثم أمامه — DepthSort يبدّل الترتيب تلقائياً */
const WALK_CAST: Record<string, CastMember> = {ali: {...extra('egyptCivilian', 2), shading: 'cel'}};
const WALK_SCRIPT = `
@0s        ali: enter x=420 y=870 s=0.85 | walk to 1480 speed=fast
@after ali ali: walk to x=1480 y=1000 s=1
@after ali ali: walk to 420 speed=fast
`;
export const DepthWalk: React.FC = () => {
  const scene = useScene(WALK_SCRIPT, {cast: WALK_CAST});
  const frames = [87, 200, 285];
  const labels = ['خلف الدكان', 'ينزل نحو الكاميرا', 'أمام الدكان'];
  return (
    <AbsoluteFill style={{background: '#1a1824'}}>
      <div style={{position: 'absolute', top: 24, width: '100%', textAlign: 'center', fontFamily: 'Amiri', fontWeight: 700, fontSize: 46, color: '#efe6d4', direction: 'rtl'}}>
        الترتيب في المشهد — شخصية تمر خلف الدكان ثم أمامه
      </div>
      {frames.map((fr, i) => (
        <div key={fr} style={{position: 'absolute', top: 130 + (i === 2 ? 470 : 0), left: i === 2 ? 480 : 980 - i * 960 + 0, width: 940, height: 440, overflow: 'hidden', borderRadius: 12, background: '#cfe3f2'}}>
          <svg width={940} height={440} viewBox="300 560 1300 609">
            <WorldCtx.Provider value={worldFor('day')}>
              <rect x={0} y={0} width={1920} height={1080} fill="#cfe3f2" />
              <rect x={0} y={860} width={1920} height={300} fill="#c8b48e" stroke="#1b1a22" strokeWidth={4} />
              <DepthSort frame={fr}>
                <Sorted z={920}>
                  <SouqStall x={950} y={920} s={1.15} seed="dw" />
                </Sorted>
                <Actor scene={scene} id="ali" frameOffset={fr} />
              </DepthSort>
            </WorldCtx.Provider>
          </svg>
          <div style={{position: 'absolute', bottom: 8, width: '100%', textAlign: 'center', fontFamily: 'Amiri', fontSize: 34, fontWeight: 700, color: '#2a2030', direction: 'rtl'}}>
            {i + 1} — {labels[i]}
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
