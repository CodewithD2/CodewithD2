import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {DURATION_S, Episode} from './Episode';
import {SUEZ_DURATION_S, SuezEpisode} from './episodes/suez1956/Episode';
import {SheetBuild, SheetFaces, SheetWomen} from './CharacterSheet';

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
  <>
    <Composition id="ShipsOverland" component={Episode} durationInFrames={DURATION_S * 30} fps={30} width={1920} height={1080} />
    <Composition id="Suez1956" component={SuezEpisode} durationInFrames={SUEZ_DURATION_S * 30} fps={30} width={1920} height={1080} />
    {/* لوحات مرجعية للشخصيات (صور ثابتة) */}
    <Composition id="SheetBuild" component={SheetBuild} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="SheetFaces" component={SheetFaces} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="SheetWomen" component={SheetWomen} durationInFrames={60} fps={30} width={1920} height={1080} />
  </>
);
