import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {DURATION_S, Episode} from './Episode';

// تحميل خط أميري محلياً قبل التصيير
const fontHandle = delayRender('Amiri font');
Promise.all(
  [400, 700].map((w) =>
    new FontFace('Amiri', `url(${staticFile(`amiri-arabic-${w}-normal.woff2`)}) format('woff2')`, {weight: String(w)})
      .load()
      .then((ff) => document.fonts.add(ff)),
  ),
).then(() => continueRender(fontHandle));

export const Root: React.FC = () => (
  <Composition id="ShipsOverland" component={Episode} durationInFrames={DURATION_S * 30} fps={30} width={1920} height={1080} />
);
