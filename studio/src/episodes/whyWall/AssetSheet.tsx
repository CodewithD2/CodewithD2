import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Person} from '../../characters/Person';
import {extra, look} from '../../cast';
import {Camel, FortGate, Horse, WallRidge, Watchtower} from './assets';

/** لوحة مراجعة أصول شورت السور */
export const WallAssetSheet: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#bfe0f0, #f3e6cc)'}}>
    <svg width={1920} height={1080}>
      <WallRidge id="sh" fn={(x) => 420 - 120 * Math.sin(x / 160)} x0={40} x1={900} h={60} towersAt={[220, 640]} towerS={0.7} />
      <g transform="translate(1180 560) scale(0.55)"><FortGate x={0} y={0} /></g>
      <Watchtower x={1700} y={520} s={1.2} />
      <Horse x={250} y={1000} s={0.85} frame={4} gait={1} rider={<Person {...extra('steppeRider', 2)} x={-6} y={-140} s={0.75} frame={4} view="side" pose="stand" />} />
      <Horse x={620} y={1000} s={0.85} frame={11} gait={1} color="#e8dcc8" mane="#8a7a6a" seed={2} />
      <Camel x={980} y={1010} s={0.8} frame={6} />
      <Person {...look('qinShiHuang')} x={1250} y={1030} s={1.1} frame={0} expr="smug" />
      <Person {...extra('mingSoldier', 1)} x={1450} y={1030} s={1.05} frame={0} />
      <Person {...extra('chineseFarmer', 2)} x={1630} y={1030} s={1.05} frame={0} expr="shock" />
      <Person {...extra('wallBuilder', 3)} x={1810} y={1030} s={1.05} frame={0} pose="pull" expr="strain" />
    </svg>
  </AbsoluteFill>
);
