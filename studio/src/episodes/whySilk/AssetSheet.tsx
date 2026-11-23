import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Person} from '../../characters/Person';
import {extra, look} from '../../cast';
import {BigX, Bomb, Crate, GermSkull, GoldBag, House, Lock, PaperScroll, Rock, Silkworm, SilkMap, SpiceSack, Sticker} from './assets';

export const SilkAssetSheet: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#cfe6f0, #f3e6cc)'}}>
    <svg width={1080} height={1920}>
      <SilkMap id="sh" draw={1} />
      <Sticker x={540} y={330} k={1} text="طريق الحرير" sub="١٨٧٧" />
      <BigX x={180} y={1180} k={0.35} />
      <Crate x={420} y={1180} s={0.9} />
      <Silkworm x={780} y={1180} s={0.6} t={0.3} />
      <Lock x={150} y={1450} s={0.7} />
      <SpiceSack x={330} y={1430} />
      <PaperScroll x={480} y={1430} />
      <Bomb x={640} y={1430} t={0.2} />
      <GermSkull x={820} y={1430} t={0.2} s={0.9} />
      <Rock x={980} y={1500} s={0.5} />
      <House x={160} y={1760} s={0.7} />
      <GoldBag x={330} y={1760} s={0.7} t={0.2} />
      <Person {...look('richthofen')} x={520} y={1860} s={0.95} frame={0} expr="smug" />
      <Person {...extra('chineseEmperor', 0)} x={700} y={1860} s={0.95} frame={0} expr="angry" />
      <Person {...extra('silkMerchant', 1)} x={860} y={1860} s={0.9} frame={0} expr="happy" />
      <Person {...extra('bandit', 0)} x={1000} y={1860} s={0.9} frame={0} expr="angry" holdR="kilij" />
    </svg>
  </AbsoluteFill>
);
