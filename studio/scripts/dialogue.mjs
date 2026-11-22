// يجمع كل جمل `say` من المشاهد المعرّفة بـ defineScene(...) ويكتب قائمة بالناقص منها
// ثم يستدعي narrator/dialogue.py لتوليدها. الاستخدام (من studio/):  npm run dialogue  [-- --list]
import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const walk = (d) => fs.readdirSync(d, {withFileTypes: true}).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(src).filter((f) => /\.tsx?$/.test(f) && !f.endsWith('lib/script.tsx') && /defineScene\(/.test(fs.readFileSync(f, 'utf8')));
if (!files.length) {
  console.log('لا توجد مشاهد معرّفة بـ defineScene');
  process.exit(0);
}
const tmp = fs.mkdtempSync(path.join(root, '.dlg-'));
const entry = path.join(tmp, 'entry.ts');
fs.writeFileSync(
  entry,
  `import {buildScene} from ${JSON.stringify(path.join(src, 'lib/script'))};\n` +
    files.map((f, i) => `import * as m${i} from ${JSON.stringify(f.replace(/\.tsx?$/, ''))};`).join('\n') +
    `\nexport const mods = [${files.map((_, i) => `m${i}`).join(', ')}];\nexport {buildScene};\n`,
);
const out = path.join(tmp, 'bundle.mjs');
try {
  await build({entryPoints: [entry], bundle: true, platform: 'node', format: 'esm', outfile: out, jsx: 'automatic', loader: {'.json': 'json'}, logLevel: 'error', external: ['react', 'react-dom', 'remotion']});
  const {mods, buildScene} = await import(pathToFileURL(out).href);
  const all = [];
  for (const m of mods)
    for (const v of Object.values(m))
      if (v && v.__scene) {
        const sc = buildScene(v.script, {cast: v.cast, lenient: true});
        for (const l of sc.dialogue()) all.push({scene: v.name, who: l.who, id: l.clip, text: l.text, voice: l.voice, ready: l.ready});
      }
  const uniq = [...new Map(all.map((l) => [l.id, l])).values()];
  const missing = uniq.filter((l) => !l.ready || !fs.existsSync(path.join(root, 'public/dlg', l.id + '.mp3')));
  console.log(`جمل الحوار: ${uniq.length} — الناقص: ${missing.length}`);
  for (const l of uniq) console.log(`  ${missing.includes(l) ? '✗' : '✓'} [${l.scene}] ${l.who} (${l.voice.name}): ${l.text}`);
  if (missing.length && !process.argv.includes('--list')) {
    const man = path.join(tmp, 'manifest.json');
    fs.writeFileSync(man, JSON.stringify(missing, null, 1));
    execFileSync('python3', [path.join(root, '../narrator/dialogue.py'), man, '--public', path.join(root, 'public/dlg'), '--index', path.join(src, 'dialogue/clips.json')], {stdio: 'inherit'});
  }
} finally {
  fs.rmSync(tmp, {recursive: true, force: true});
}
