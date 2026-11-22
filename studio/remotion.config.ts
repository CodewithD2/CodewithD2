import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
// متصفح Chromium المثبت مسبقاً في البيئة (احذف السطر إن كان Remotion سيحمّل متصفحه بنفسه)
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
