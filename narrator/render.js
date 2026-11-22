// تصيير مشهد HTML إلى فيديو MP4 مع التعليق الصوتي
// node narrator/render.js <scene.html> <voice.mp3> <subs.srt> <out.mp4> [--fps 30] [--preview 2,12,20,27]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : d; };
const VOICE_DELAY = 0.6; // يبدأ الصوت بعد ظهور الصورة بقليل
const fps = +opt('--fps', 30);
const preview = opt('--preview', null);
const [html, audio, srt, out] = args;

function parseSrt(s) {
  const ts = x => { const [h, m, r] = x.split(':'); return +h * 3600 + +m * 60 + parseFloat(r.replace(',', '.')); };
  return s.trim().split(/\r?\n\r?\n/).map(b => {
    const l = b.split(/\r?\n/); const [a, e] = l[1].split(' --> ');
    return { s: ts(a) + VOICE_DELAY, e: ts(e) + VOICE_DELAY, text: l.slice(2).join(' ') };
  });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.resolve(html));
  await page.evaluate(async c => { window.setCues(c); await window.fontsReady; }, parseSrt(fs.readFileSync(srt, 'utf8')));
  const grab = async t => {
    const b64 = await page.evaluate(t => { window.renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }, t);
    return Buffer.from(b64, 'base64');
  };
  if (preview) {
    for (const t of preview.split(',').map(Number)) fs.writeFileSync(`${out}-${t}s.jpg`, await grab(t));
    await browser.close(); return;
  }
  const dur = await page.evaluate(() => window.END);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-i', audio,
    '-f', 'lavfi', '-t', String(dur), '-i', `aevalsrc='0.5*sin(2*PI*55*t)*(0.6+0.4*sin(2*PI*0.1*t))+0.3*sin(2*PI*82.4*t)+0.2*sin(2*PI*110*t)*(0.5+0.5*sin(2*PI*0.07*t))':s=44100`,
    '-filter_complex', `[1:a]adelay=${VOICE_DELAY * 1000}|${VOICE_DELAY * 1000},volume=1.0[v];[2:a]lowpass=f=400,volume=0.06,afade=t=in:d=2,afade=t=out:st=${dur - 2.5}:d=2.5[m];[v][m]amix=inputs=2:duration=longest:normalize=0[a]`,
    '-map', '0:v', '-map', '[a]', '-t', String(dur),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(dur * fps);
  for (let i = 0; i < n; i++) {
    const ok = ff.stdin.write(await grab(i / fps));
    if (!ok) await new Promise(r => ff.stdin.once('drain', r));
    if (i % (fps * 5) === 0) console.log(`frame ${i}/${n}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('✔ ' + out);
})();
