import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {DURATION_S, Episode} from './Episode';
import {SUEZ_DURATION_S, SuezEpisode} from './episodes/suez1956/Episode';
import {SheetBuild, SheetFaces, SheetWomen} from './CharacterSheet';
import {MOTION_TEST_FRAMES, MotionTest} from './MotionTest';
import {SCRIPT_TEST_FRAMES, ScriptTest} from './ScriptTest';
import {CastHistorical, CastRoles} from './CastSheet';
import {BackdropsSheetA, BackdropsSheetB, BackdropsSheetC, BuildingsSheetA, BuildingsSheetB, BuildingsSheetNight} from './WorldSheet';
import {TURN_TEST_FRAMES, TurnSheetA, TurnSheetB, TurnSheetC, TurnTest} from './Turnaround';

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
    {/* اختبار الحركة والتمثيل */}
    <Composition id="MotionTest" component={MotionTest} durationInFrames={MOTION_TEST_FRAMES} fps={30} width={1920} height={1080} />
    {/* اختبار الاتجاهات والالتفات */}
    <Composition id="TurnSheetA" component={TurnSheetA} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="TurnSheetB" component={TurnSheetB} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="TurnSheetC" component={TurnSheetC} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="TurnTest" component={TurnTest} durationInFrames={TURN_TEST_FRAMES} fps={30} width={1920} height={1080} />
    {/* لوحات مكتبة الشخصيات */}
    <Composition id="CastHistorical" component={CastHistorical} durationInFrames={30} fps={30} width={1920} height={1080} />
    <Composition id="CastRoles" component={CastRoles} durationInFrames={30} fps={30} width={1920} height={1080} />
    {/* لوحات مكتبة المباني */}
    <Composition id="BuildingsSheetA" component={BuildingsSheetA} durationInFrames={30} fps={30} width={1920} height={1080} />
    <Composition id="BuildingsSheetB" component={BuildingsSheetB} durationInFrames={30} fps={30} width={1920} height={1080} />
    <Composition id="BuildingsSheetNight" component={BuildingsSheetNight} durationInFrames={30} fps={30} width={1920} height={1080} />
    <Composition id="BackdropsSheetA" component={BackdropsSheetA} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="BackdropsSheetB" component={BackdropsSheetB} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="BackdropsSheetC" component={BackdropsSheetC} durationInFrames={60} fps={30} width={1920} height={1080} />
    {/* اختبار سكريبت الحركة */}
    <Composition id="ScriptTest" component={ScriptTest} durationInFrames={SCRIPT_TEST_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
