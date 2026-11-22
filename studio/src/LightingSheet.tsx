import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Person} from './characters/Person';
import {extra, look} from './cast';
import {BACKDROP_LABEL, Backdrop, BackdropName, GROUND} from './world/backdrops';
import {TIMES, TIME_LABEL, TimeOfDay} from './world/lighting';

/** لوحة إضاءة الشخصيات: نفس الشخصيات في كل خلفية × الأوقات الأربعة، وتأثير مصادر الضوء القريبة */

const Group: React.FC<{name: BackdropName; f: number}> = ({name, f}) => {
  const g = GROUND[name];
  return (
    <>
      <Person {...look('nasser')} x={760} y={g} s={1.25} frame={f} expr="neutral" pose="stand" view="threeQuarter" />
      <Person {...extra('woman1950s', 2)} x={1110} y={g} s={1.2} frame={f} seed={3} expr="happy" pose="stand" flip view="threeQuarter" />
    </>
  );
};

const Cell: React.FC<{name: BackdropName; time: TimeOfDay; lighting?: boolean; scale: number}> = ({name, time, lighting = true, scale}) => (
  <div style={{position: 'relative', width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left'}}>
    <Backdrop name={name} time={time} frame={40} lighting={lighting}>
      <Group name={name} f={40} />
    </Backdrop>
  </div>
);

const Grid: React.FC<{names: BackdropName[]; title: string}> = ({names, title}) => (
  <AbsoluteFill style={{background: '#14121c'}}>
    <div style={{position: 'absolute', top: 18, width: '100%', textAlign: 'center', fontFamily: 'Amiri', fontWeight: 700, fontSize: 46, color: '#efe6d4', direction: 'rtl'}}>{title}</div>
    {TIMES.map((t, c) => (
      <div key={t} style={{position: 'absolute', top: 86, left: 1920 - 470 - c * 470, width: 456, textAlign: 'center', fontFamily: 'Amiri', fontSize: 30, color: '#c9bfd6'}}>
        {TIME_LABEL[t]}
      </div>
    ))}
    {names.map((n, r) => (
      <React.Fragment key={n}>
        <div style={{position: 'absolute', top: 140 + r * 312 + 110, left: 6, width: 60, fontFamily: 'Amiri', fontSize: 26, color: '#efe6d4', writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}>
          {BACKDROP_LABEL[n]}
        </div>
        {TIMES.map((t, c) => (
          <div key={t} style={{position: 'absolute', top: 140 + r * 312, left: 1920 - 470 - c * 470, width: 456, height: 256, overflow: 'hidden', borderRadius: 10}}>
            <Cell name={n} time={t} scale={0.2375} />
          </div>
        ))}
      </React.Fragment>
    ))}
  </AbsoluteFill>
);

export const LightingSheet: React.FC = () => <Grid names={['cityPlaza1950s', 'militaryCamp', 'alexCorniche']} title="إضاءة الشخصيات بألوان المشهد" />;

/** مقارنة: بدون إضاءة | بإضاءة — ليلاً بجوار النار وفي الغروب */
export const LightingCompare: React.FC = () => {
  const cells: {name: BackdropName; time: TimeOfDay; lighting: boolean; label: string}[] = [
    {name: 'militaryCamp', time: 'night', lighting: false, label: 'بدون إضاءة'},
    {name: 'militaryCamp', time: 'night', lighting: true, label: 'بإضاءة — نار المعسكر'},
    {name: 'cityPlaza1950s', time: 'dusk', lighting: false, label: 'بدون إضاءة'},
    {name: 'cityPlaza1950s', time: 'dusk', lighting: true, label: 'بإضاءة — الغروب'},
  ];
  return (
    <AbsoluteFill style={{background: '#14121c'}}>
      {cells.map((c, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const left = 1920 - 955 - col * 950;
        const top = 20 + row * 530;
        return (
          <div key={i} style={{position: 'absolute', left, top, width: 940, height: 529, overflow: 'hidden', borderRadius: 10}}>
            <Cell name={c.name} time={c.time} lighting={c.lighting} scale={940 / 1920} />
            <div style={{position: 'absolute', top: 10, right: 16, fontFamily: 'Amiri', fontWeight: 700, fontSize: 30, color: '#fff', textShadow: '0 2px 6px #000', direction: 'rtl'}}>{c.label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
