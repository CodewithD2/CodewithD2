import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {DURATION_S, Episode} from './Episode';
import {SUEZ_DURATION_S, SuezEpisode} from './episodes/suez1956/Episode';
import {SheetBuild, SheetFaces, SheetWomen} from './CharacterSheet';
import {MOTION_TEST_FRAMES, MotionTest} from './MotionTest';
import {SCRIPT_TEST_FRAMES, ScriptTest} from './ScriptTest';
import {CastHistorical, CastRoles} from './CastSheet';
import {EuropeMapSheet, JoanCastSheet, JoanRolesSheet} from './JoanBatch0Sheets';
import {JOAN_TOTAL_FRAMES, JoanOfArcEpisode} from './episodes/joanOfArc/Episode';
import {SCENE01_TRACK, Scene01} from './episodes/joanOfArc/Scene01';
import {SCENE02_TRACK, Scene02} from './episodes/joanOfArc/Scene02';
import {SCENE03_TRACK, Scene03} from './episodes/joanOfArc/Scene03';
import {SCENE04_TRACK, Scene04} from './episodes/joanOfArc/Scene04';
import {SCENE05_TRACK, Scene05} from './episodes/joanOfArc/Scene05';
import {SCENE06_TRACK, Scene06} from './episodes/joanOfArc/Scene06';
import {SCENE07_TRACK, Scene07} from './episodes/joanOfArc/Scene07';
import {SCENE08_TRACK, Scene08} from './episodes/joanOfArc/Scene08';
import {SCENE09_TRACK, Scene09} from './episodes/joanOfArc/Scene09';
import {ItemPoses, ItemsCatalog, ItemsTurn} from './ItemsSheet';
import {DepthTurn, DepthWalk} from './DepthSheet';
import {LightingCompare, LightingSheet} from './LightingSheet';
import {CAMERA_TEST_FRAMES, CameraSheet, CameraTest} from './CameraTest';
import {SFX_TEST_FRAMES, SfxTest} from './SfxTest';
import {DIALOGUE_TEST_FRAMES, DialogueSheet, DialogueTest} from './DialogueTest';
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
    {/* حلقة جان دارك (تُبنى مشهد بمشهد) */}
    <Composition id="JoanOfArc" component={JoanOfArcEpisode} durationInFrames={JOAN_TOTAL_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="JoanScene01" component={Scene01} durationInFrames={SCENE01_TRACK.durationFrames} fps={30} width={1920} height={1080} />
    <Composition id="JoanScene02" component={Scene02} durationInFrames={SCENE02_TRACK.durationFrames} fps={30} width={1920} height={1080} />
    <Composition id="JoanScene03" component={Scene03} durationInFrames={SCENE03_TRACK.durationFrames} fps={30} width={1920} height={1080} />
    <Composition id="JoanScene04" component={Scene04} durationInFrames={SCENE04_TRACK.durationFrames} fps={30} width={1920} height={1080} />
    <Composition id="JoanScene05" component={Scene05} durationInFrames={SCENE05_TRACK.durationFrames} fps={30} width={1920} height={1080} />
    <Composition id="JoanScene06" component={Scene06} durationInFrames={SCENE06_TRACK.durationFrames} fps={30} width={1920} height={1080} />
    <Composition id="JoanScene07" component={Scene07} durationInFrames={SCENE07_TRACK.durationFrames} fps={30} width={1920} height={1080} />
    <Composition id="JoanScene08" component={Scene08} durationInFrames={SCENE08_TRACK.durationFrames} fps={30} width={1920} height={1080} />
    <Composition id="JoanScene09" component={Scene09} durationInFrames={SCENE09_TRACK.durationFrames} fps={30} width={1920} height={1080} />
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
    {/* لوحات الدفعة 0 — شخصيات وخرائط جان دارك */}
    <Composition id="JoanCastSheet" component={JoanCastSheet} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="JoanRolesSheet" component={JoanRolesSheet} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="EuropeMapSheet" component={EuropeMapSheet} durationInFrames={60} fps={30} width={1920} height={1080} />
    {/* لوحات مكتبة المباني */}
    <Composition id="BuildingsSheetA" component={BuildingsSheetA} durationInFrames={30} fps={30} width={1920} height={1080} />
    <Composition id="BuildingsSheetB" component={BuildingsSheetB} durationInFrames={30} fps={30} width={1920} height={1080} />
    <Composition id="BuildingsSheetNight" component={BuildingsSheetNight} durationInFrames={30} fps={30} width={1920} height={1080} />
    <Composition id="BackdropsSheetA" component={BackdropsSheetA} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="BackdropsSheetB" component={BackdropsSheetB} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="BackdropsSheetC" component={BackdropsSheetC} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="LightingSheet" component={LightingSheet} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="LightingCompare" component={LightingCompare} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="CameraTest" component={CameraTest} durationInFrames={CAMERA_TEST_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="CameraSheet" component={CameraSheet} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="SfxTest" component={SfxTest} durationInFrames={SFX_TEST_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="DialogueTest" component={DialogueTest} durationInFrames={DIALOGUE_TEST_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="DialogueSheet" component={DialogueSheet} durationInFrames={60} fps={30} width={1920} height={1080} />
    {/* لوحات الأشياء في الأيدي */}
    <Composition id="ItemsCatalog" component={ItemsCatalog} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="ItemPoses" component={ItemPoses} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="ItemsTurn" component={ItemsTurn} durationInFrames={60} fps={30} width={1920} height={1080} />
    {/* لوحات ترتيب العمق */}
    <Composition id="DepthTurn" component={DepthTurn} durationInFrames={60} fps={30} width={1920} height={1080} />
    <Composition id="DepthWalk" component={DepthWalk} durationInFrames={60} fps={30} width={1920} height={1080} />
    {/* اختبار سكريبت الحركة */}
    <Composition id="ScriptTest" component={ScriptTest} durationInFrames={SCRIPT_TEST_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
