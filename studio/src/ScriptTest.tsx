import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Actor, CastMember, ScriptErrorOverlay, useScene} from './lib/script';
import {INK} from './lib/util';

/** اختبار البند ٣: سكريبت الحركة — السكريبت معروض بجانب المشهد والسطر المنفَّذ مضاء */

const CAST: Record<string, CastMember> = {
  ali: {robe: '#3a4a6a', outfit: 'suit', tie: '#a8323a', hat: 'none', hair: '#2a1a12', mustache: '#2a1a12', face: 'square', skin: '#d9a27a', shading: 'cel'},
  mona: {build: 'female', outfit: 'dress', robe: '#2f6f4a', trim: '#e0b43a', hat: 'none', hair: '#3a2416', hairStyle: 'ponytail', lips: '#b5524a', skin: '#efc29b', shading: 'cel', expr: 'happy'},
};

export const DEMO_SCRIPT = `# تجربة سكريبت الحركة
@0s         ali:  enter x=-150 y=960 s=1.1 | walk to 640
@0.4s       mona: enter x=2050 y=860 s=0.85 | walk to 1350 speed=slow
@after ali  ali:  expr happy
@4s         mona: look at ali | act laugh for 1.5s
@4.6s       ali:  act angry energy=0.9 for 2s
@after ali  ali:  turn back | walk to x=700 y=800 s=0.75 speed=slow
@7.2s       mona: jump | run to 2250
@10s        ali:  turn front | act cheer for 1.6s
`;

export const SCRIPT_TEST_FRAMES = 375;

export const ScriptTest: React.FC = () => {
  const f = useCurrentFrame();
  const scene = useScene(DEMO_SCRIPT, {cast: CAST});
  const t = f / 30;
  const shown = DEMO_SCRIPT.split('\n').filter((l) => l.trim());
  const activeLines = new Set(scene.lines.filter((l) => l.t <= t && t < l.t + 1.4).map((l) => l.line));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="ssky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8fc4e8" />
            <stop offset="100%" stopColor="#f3e3c3" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#ssky)" />
        {[0, 260, 520, 780, 1040, 1300, 1560, 1820].map((bx, i) => (
          <rect key={bx} x={bx} y={420 - (i % 3) * 60} width={230} height={420 + (i % 3) * 60} fill={['#d8b48c', '#c99a78', '#e0c4a0'][i % 3]} stroke={INK} strokeWidth={4} />
        ))}
        <rect y={760} width={1920} height={320} fill="#d6c29a" stroke={INK} strokeWidth={5} />
        <Actor scene={scene} id="mona" />
        <Actor scene={scene} id="ali" />
      </svg>
      {/* لوحة السكريبت */}
      <div
        style={{
          position: 'absolute',
          left: 30,
          top: 30,
          padding: '16px 22px',
          background: 'rgba(20,18,30,0.82)',
          borderRadius: 12,
          fontFamily: 'DejaVu Sans Mono, monospace',
          fontSize: 21,
          lineHeight: 1.55,
          color: '#c9c4d6',
          whiteSpace: 'pre',
          direction: 'ltr',
        }}
      >
        {shown.map((l, i) => {
          const lineNo = DEMO_SCRIPT.split('\n').indexOf(l) + 1;
          const on = activeLines.has(lineNo);
          return (
            <div key={i} style={{color: l.startsWith('#') ? '#8a849a' : on ? '#ffe37a' : undefined, fontWeight: on ? 700 : 400}}>
              {l}
            </div>
          );
        })}
        <div style={{marginTop: 8, color: '#8fd0ff'}}>t = {t.toFixed(1)}s</div>
      </div>
      <ScriptErrorOverlay scene={scene} />
    </AbsoluteFill>
  );
};
