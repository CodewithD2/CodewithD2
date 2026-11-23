# AGENTS.md — دليل العمل على مشروع قناة الفيديوهات التاريخية

> هذا الملف موجّه لأي agent (أو مطوّر) يستلم المشروع. اقرأه كاملاً قبل أي تعديل.
> ملاحظة: `README.md` في جذر المستودع هو ملف بروفايل GitHub الشخصي لصاحب الحساب — **لا تعدّله** ولا علاقة له بالمشروع.
> ⭐ **معيار الجودة الافتراضي (قرار صاحب المشروع):** كل فيديو يُنفَّذ مباشرة بأعلى مستوى بصري «عالمي» **دون انتظار طلب**: إضاءة وظلال على الشخصيات، تلوين لكل مشهد (grade)، كاميرا حية (حركة + اهتزاز يد + صدمات عند الأحداث)، جسيمات مناسبة للمشهد، عمق ميدان (عناصر أمامية مموهة)، مؤثرات صوتية حقيقية، وموسيقى خلفية هادئة. الأدوات في `src/shorts/polish.tsx` و`lib/fx.tsx` و`lib/music.tsx`.

---

## ١. ما هو المشروع؟

خط إنتاج مجاني بالكامل لفيديوهات تاريخية بالعربية الفصحى لقناة يوتيوب:

```
نص الحلقة (.txt)
   │  edge-tts  (narrator/narrate.py)
   ▼
تعليق صوتي MP3  +  ترجمة SRT (توقيت كل جملة)
   │  تحويل SRT → studio/src/cues.json
   ▼
مشروع Remotion (studio/) — مشاهد 2.5D: طبقات parallax في CSS 3D + كاميرا + FOV
   │  شخصيات كرتونية مبسّطة + مؤثرات (bloom، شرر، دخان، ضباب، أشعة، color grading)
   ▼
فيديو MP4 بدقة 1920×1080، 30fps، مع الصوت والترجمة المدمجة
```

الحلقات المنجزة (كل حلقة Composition مستقلة في `studio/src/Root.tsx`):

| Composition | الموضوع | المدة | الملفات |
|---|---|---|---|
| `ShipsOverland` | السفن فوق اليابسة — حصار القسطنطينية ١٤٥٣ | ٣١ث، ٤ لقطات | `src/Episode.tsx`، `src/shots/`، `src/cues.json`، `public/voice.mp3`، `public/drone.wav` |
| `Suez1956` | خطاب عبد الناصر وتأميم قناة السويس — ٢٦ يوليو ١٩٥٦ | ٣٢ث، ٤ لقطات | `src/episodes/suez1956/`، `public/suez/voice.mp3`، `public/suez/drone.wav` |
| `JoanOfArc` (+ `JoanScene01..09`) | قصة جان دارك — الدفعة الأولى: فرنسا ١٤٢٩ ← حرب المائة عام ← شارل المجنون ← أجينكورت ← تروا ← الملك الرضيع ← حصار أورليان ودومريمي | ≈ ٥ دقائق، ٩ مشاهد | `src/episodes/joanOfArc/`، `public/joan/*.mp3`، `narrator/scripts/joan_manifest.json` — التفاصيل في §١١.٦ |
| `WhyBirdsMigrate` (عمودي 1080×1920) | شورت قناة «ليه ولماذا؟»: لماذا تهاجر الطيور؟ | ٥٩٫٨ث، ٧ مشاهد | `src/episodes/whyBirds/`، `public/whybirds/*.mp3`، `narrator/scripts/birds_manifest.json` — التفاصيل في §١١.٨ |
| `WhyGreatWall` (عمودي 1080×1920) | شورت «ليه ولماذا؟»: لماذا بُني سور الصين العظيم؟ | ٥٧٫٩ث، ٧ مشاهد | `src/episodes/whyWall/`، `public/whywall/`، `narrator/scripts/wall_manifest.json` — §١١.١٠ |

يوجد في المستودع **نظامان**:

| المجلد | الحالة | الوصف |
|---|---|---|
| `studio/` | **الأساسي — اعمل هنا** | Remotion + React + TypeScript، مشاهد 2.5D |
| `narrator/` | أداة الصوت فعّالة؛ نظام الـ Canvas قديم | `narrate.py` لتوليد الصوت (مستخدم). `render.js` + `scene/*.html` = النسخة الأولى بـ Canvas 2D، محفوظة للمرجعية فقط |

---

## ٢. المتطلبات والإصدارات (المختبرة فعلياً)

| الأداة | الإصدار المختبر | ملاحظات |
|---|---|---|
| Node.js | 22.x | |
| npm | مرفق مع Node | |
| Python | 3.13 (أي 3.9+ يعمل) | |
| ffmpeg / ffprobe | 6.1 | لتوليد الصوت الخلفي وفحص الملفات؛ Remotion يحمل ffmpeg خاصاً به للتصيير |
| edge-tts (pip) | 7.3.1 | `pip install -r narrator/requirements.txt` |
| remotion / @remotion/cli | **4.0.540** (مثبّت بالضبط) | كل حزم `@remotion/*` يجب أن تكون بنفس الإصدار تماماً |
| react / react-dom | 18.3.1 | |
| typescript | 5.6.3 | |
| Chromium headless | أي إصدار حديث | Remotion يحمّل متصفحه تلقائياً؛ في البيئات المقيّدة استخدم متصفحاً مثبتاً (انظر §٤) |

الخط: **Amiri** (رخصة SIL OFL — مسموح تجارياً)، ملفات woff2 محلية في `studio/public/` و`narrator/scene/fonts/`. لا يُحمَّل من Google Fonts.

---

## ٣. التثبيت خطوة بخطوة

```bash
# من جذر المستودع
pip install -r narrator/requirements.txt      # edge-tts
cd studio
npm install                                    # remotion + react + typescript
npx tsc --noEmit -p .                          # فحص الأنواع — يجب أن يمر بلا أخطاء
```

---

## ٤. متطلبات الشبكة والبيئة (مهم في البيئات السحابية/المقيّدة)

### ٤.١ edge-tts يحتاج الوصول إلى:
- `speech.platform.bing.com` (HTTPS + WebSocket)

إن كانت الشبكة مقيّدة بقائمة سماح، أضف هذا المضيف. بدونه يفشل بـ `Cannot connect to host` أو `SkewAdjustmentError: No server date in headers` (الخطأ الثاني يعني أن الـ proxy رفض الاتصال).

### ٤.٢ خلف HTTPS proxy
`narrate.py` يقرأ `HTTPS_PROXY` تلقائياً ويمرره لـ edge-tts. إن كان الـ proxy يستخدم شهادة CA خاصة، مرّر ملف الشهادات:
```bash
SSL_CERT_FILE=/path/to/ca-bundle.crt python narrator/narrate.py ...
```
(في بيئة Claude Code السحابية: `SSL_CERT_FILE=/root/.ccr/ca-bundle.crt`)

### ٤.٣ متصفح Remotion
Remotion يحاول تحميل Chrome Headless Shell من الإنترنت عند أول تصيير. إن كان التحميل ممنوعاً، وجّهه لمتصفح موجود عبر متغير البيئة (يقرؤه `studio/remotion.config.ts`):
```bash
export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
```
(هذا المسار في بيئة Claude Code السحابية؛ على جهاز عادي غالباً لا تحتاج هذا المتغير.)

### ٤.٤ حزم npm
`registry.npmjs.org` يجب أن يكون متاحاً. خط Amiri جُلب أصلاً من حزمة npm `@fontsource/amiri@5.1.1` (ملفات `files/amiri-arabic-{400,700}-normal.woff2`) ونُسخ إلى المشروع — لا حاجة لتكراره.

### ٤.٥ الرفع إلى GitHub
فرع العمل: `claude/inspiring-maxwell-kcpkyq` (مرفوع على `origin`). ارفع بـ `git push -u origin claude/inspiring-maxwell-kcpkyq`. إن فشل بـ **403** فتطبيق Claude على GitHub يحتاج صلاحية `Contents: Read & Write` على المستودع؛ في هذه الحالة أرسل لصاحب المشروع نسخة `git bundle` من الفرع.

---

## ٥. الأوامر اليومية

### توليد الصوت والترجمة
```bash
python narrator/narrate.py narrator/scripts/ships-overland.txt --rate=-5% -o studio/public
#  → studio/public/ships-overland.mp3 + ships-overland.srt
python narrator/narrate.py --list-voices          # الأصوات العربية
```
خيارات: `--voice` (افتراضي `ar-SA-HamedNeural`)، `--rate` (افتراضي `-8%`)، `--pitch` (افتراضي `-4Hz`).
⚠️ القيم السالبة تُمرَّر بعلامة `=`: `--rate=-5%` وليس `--rate -5%`.

قواعد كتابة النص (`narrator/scripts/*.txt`):
- كل جملة/فقرة في سطر. الأسطر التي تبدأ بـ `#` ملاحظات مونتاج لا تُقرأ.
- شكّل أسماء الأعلام والكلمات الملتبسة. اكتب الأرقام والتواريخ **بالحروف**.
- ≈ ٧٠ كلمة ≈ ٣٠ ثانية بسرعة `-5%`.

### تحويل SRT إلى cues.json (يستخدمه Remotion للترجمة وتوقيت اللقطات)
```bash
cd studio && python3 - <<'EOF'
import json,re
s=open('public/ships-overland.srt',encoding='utf-8').read().strip()
ts=lambda x:(lambda h,m,r:int(h)*3600+int(m)*60+float(r.replace(',','.')))(*x.split(':'))
cues=[{'s':ts(a),'e':ts(e),'text':' '.join(l[2:])} for b in re.split(r'\n\s*\n',s) for l in [b.splitlines()] for a,e in [l[1].split(' --> ')]]
json.dump(cues,open('src/cues.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
EOF
mv public/ships-overland.mp3 public/voice.mp3 && rm public/ships-overland.srt
```

### الصوت الخلفي (drone منخفض مولَّد، بدون حقوق)
```bash
ffmpeg -y -f lavfi -t 31 -i "aevalsrc='0.5*sin(2*PI*55*t)*(0.6+0.4*sin(2*PI*0.1*t))+0.3*sin(2*PI*82.4*t)+0.2*sin(2*PI*110*t)*(0.5+0.5*sin(2*PI*0.07*t))':s=44100" -af "lowpass=f=400,afade=t=in:d=2,afade=t=out:st=28.5:d=2.5" studio/public/drone.wav
```
(غيّر `-t` و`st=` حسب مدة المشهد.)

### معاينة وتصيير
```bash
cd studio
npm run studio                                                      # معاينة تفاعلية بخط زمني (localhost:3000)
npx remotion still src/index.ts ShipsOverland out.jpg --frame=420 --scale=0.5   # لقطة ثابتة للمراجعة السريعة
npx remotion render src/index.ts ShipsOverland ../output/name.mp4 --concurrency=4 --crf=18 --timeout=120000
```
- مدة التصيير المرصودة: **~٨–١٢ دقيقة** لـ ٣١ ثانية على ٤ أنوية (المؤثرات ثقيلة). شغّله في الخلفية.
- **راجع دائماً بلقطات `still` قبل التصيير الكامل.** اختر إطاراً من منتصف كل لقطة.
- `output/` و`studio/out/` و`node_modules/` في `.gitignore` — لا ترفع الفيديوهات.

---

## ٦. بنية `studio/`

```
studio/
├── remotion.config.ts      # jpeg 92، overwrite، REMOTION_BROWSER اختياري
├── public/                 # voice.mp3، drone.wav، amiri-arabic-{400,700}-normal.woff2
└── src/
    ├── index.ts            # registerRoot
    ├── Root.tsx            # تحميل خط Amiri محلياً (FontFace + delayRender) + تعريف Composition "ShipsOverland"
    ├── Episode.tsx         # الحلقة ١ (ShipsOverland): قائمة SHOTS فقط → EpisodeBase
    ├── Subtitles.tsx       # الترجمة (تستقبل cues كـ prop) + VOICE_DELAY + type Cue
    ├── cues.json           # توقيت جمل الحلقة ١
    ├── episodes/
    │   └── suez1956/       # الحلقة ٢ — نمط كل حلقة جديدة:
    │       ├── Episode.tsx #   SUEZ_SHOTS + SUEZ_DURATION_S + SuezEpisode → EpisodeBase
    │       ├── cues.json   #   توقيت الجمل
    │       ├── palettes.ts #   ALEX_DUSK، SPEECH، CANAL_NIGHT، CELEBRATE
    │       ├── props.tsx   #   Crowd، Bourse، Mics، Searchlights، AlexSkyline، Qaitbay، Palm، CanalHQ، Steamer، Car، Radio، RadioWaves، Confetti، EgyptFlag
    │       ├── ShotsA.tsx  #   NASSER (مظهر الشخصية) + SuezShot1 (الحشود) + SuezShot2 (كلمة السر)
    │       └── ShotsB.tsx  #   SuezShot3 (الإسماعيلية) + SuezShot4 (الإعلان والاحتفال)
    ├── world/              # مكتبة المباني والخلفيات: lighting.ts، kit.tsx، buildings.tsx، backdrops.tsx
    ├── cast/               # مكتبة الشخصيات: define.ts، historical.ts، roles.ts، index.ts (look/extra/roleBase/castOf)
    ├── characters/Person.tsx
    ├── lib/
    │   ├── EpisodeBase.tsx # هيكل عام لأي حلقة: لقطات + crossfade + صوت + drone + ترجمة + FilmLook + fade
    │   ├── stage.tsx       # محرك 2.5D: Stage، Layer، Art، Sky، camAt
    │   ├── palette.ts      # لوحات الألوان + atmos()
    │   ├── fx.tsx          # Bloom، Halo، Embers، Smoke، Motes، Cloud، GodRays، MistBand، ColorGrade
    │   ├── epic.tsx        # CityEpic، Ridge، Cypress، Battlement، Walkway، Banner، Bombard، Campfire، TorchFX
    │   ├── props.tsx       # Ship، Water، Stars، Tent، Moon، Glow، Skyline، SeaWall، Torch (أبسط/أقدم)
    │   └── util.ts         # clamp، prog، lerp، mixColor، scatter، ridgePath، INK، easings
    └── shots/
        ├── Shot1Night.tsx  # ليل القسطنطينية + السلسلة + الحارس المتعالي + عنوان
        ├── Shot2Sultan.tsx # معسكر السلطان + لحظة الفكرة + فقاعة تفكير
        ├── Shot3Haul.tsx   # جرّ السفن فوق التل (تتبع جانبي)
        ├── Shot4Dawn.tsx   # الفجر + الأسطول + صدمة الحارس + dolly zoom
        └── common.tsx      # FilmLook (حبيبات + vignette)، Fog (قديم)
```

---

## ٧. محرك الـ 2.5D (`lib/stage.tsx`) — كيف يعمل بالضبط

- إحداثيات كل طبقة = إحداثيات الشاشة **1920×1080** (الأصل أعلى اليسار).
- `Stage cam={...}`: حاوية `perspective: P` حيث `P = (H/2)/tan(fov/2)`، وداخلها `preserve-3d`. تحويل الكاميرا:
  `translateZ(P) rotateZ(rz) rotateX(rx) rotateY(ry) translateZ(-P) translate3d(-x, -y, z)`
- `Layer d={عمق}`: `translateZ(-d) scale((P_REF+d)/P_REF)` حيث `P_REF` عند `REF_FOV = 45°`.
  → عند الكاميرا المرجعية تظهر كل طبقة **بحجمها المرسوم تماماً**، والـ parallax ينتج تلقائياً من المنظور عند تحريك الكاميرا.
  - `d` موجب = خلف الشاشة (بعيد). `d` سالب = أمام الشاشة (قريب جداً، استخدمه للمقدمة مع `blur`).
  - القيم المستخدمة: سماء/قمر 2600–3000، تلال بعيدة 1600–2200، مدينة 900–1450، ماء 500–1000، الشخصيات 0–300، مقدمة −180 إلى −480.
  - `blur` و`opacity` اختياريان (عمق ميدان).
- `Art`: عنصر `<svg>` يغطي `x ∈ [-1200, 3120]`، `y ∈ [-800, 1680]` بنفس إحداثيات الشاشة، حتى تبقى الطبقات مغطاة عند حركة الكاميرا. ارسم العناصر الواسعة من −1400 إلى 3300.
- `Sky background="..."`: خلفية ثابتة خارج المسرح (بُعد لا نهائي).
- `camAt(frame, keys)`: استيفاء مفاتيح الكاميرا `{f, x?, y?, z?, ry?, rx?, rz?, fov?}` بمنحنى bezier ناعم؛ كل خاصية تُستوفى بين المفاتيح التي تحددها فقط.
  - `z` موجب = اقتراب (dolly in). لا تجعل `z` يتجاوز `P + d` لأقرب طبقة (تصبح خلف الكاميرا).
- **Dolly zoom** (في `Shot4Dawn`): تُغيَّر `fov` ويُحسب `z` بحيث يبقى الحجم الظاهري لطبقة الهدف (عمق `SOLDIER_D`) ثابتاً:
  `z = P(fov) + d − k·P(fov)/S` حيث `k=(P_REF+d)/P_REF` و`S` الحجم الظاهري عند بداية الحركة.

---

## ٨. نظام الألوان والمؤثرات

### ٨.١ اللوحات (`lib/palette.ts`)
`type Palette = { skyTop, skyMid, horizon, haze, far, city, mid, near, rim, water1, water2, light, warm, smoke, gradeTop, gradeBottom, gradeOpacity }`

اللوحات الجاهزة: `NIGHT_CITY`، `CAMP`، `HAUL`، و`dawnAt(t)` (تدرج من ما قبل الشروق t=0 إلى الذهبي t=1).

**قواعد:**
- كل ألوان اللقطة تُشتق من لوحتها — لا ألوان عشوائية في الخلفيات.
- **Atmospheric perspective:** `atmos(color, P.haze, t)` يذيب اللون في لون الجو؛ t أكبر للطبقات الأبعد (0.05 قريب، 0.3–0.45 بعيد).
- `mixColor` و`atmos` يقبلان `#rrggbb` (و`atmos` يقبل `rgb()` أيضاً عبر `toHex`). `dawnAt` يعيد `rgb()` — مرّره بـ `toHex()` قبل مكونات SVG التي تمزج الألوان.
- كل لقطة تنتهي بـ `<ColorGrade p={P} lightAt={[x%, y%]} />` بعد `</Stage>` — طبقات soft-light + screen + multiply توحّد الألوان **بما فيها الشخصيات**.

### ٨.٢ المؤثرات (`lib/fx.tsx`)
| المكوّن | الاستخدام |
|---|---|
| `Bloom id x y w h radius? strength?` | يلف العناصر المضيئة (لهب، نوافذ، فوانيس، شمس). **حدّد منطقة x,y,w,h صغيرة بقدر الإمكان** — فلتر SVG مكلف. لا تستخدمه في طبقات بعيدة جداً واسعة؛ استعمل `Halo` هناك |
| `Halo id cx cy r color opacity? core?` | توهج رخيص بتدرج دائري (قمر، شمس، نار) |
| `Embers id x y frame n? spread? rise? life? size? color? wind?` | شرر يتطاير (يُوضع داخل `Bloom`) |
| `Smoke id x y frame color n? rise? life? size? drift? opacity?` | دخان يتصاعد ويتمدد |
| `Motes id frame x0 x1 y0 y1 color n? size?` | ذرات تلمع في الضوء (طبقة أمامية مع blur خفيف) |
| `MistBand id frame y color h? speed?` | شريط ضباب متحرك |
| `Cloud id x y w h lit shade opacity?` | سحابة مرسومة بتدرج (حافة مضيئة → ظل) |
| `GodRays id cx cy frame color opacity?` | أشعة شمس من مصدر |
| `ColorGrade p lightAt lightStrength?` | التلوين النهائي (انظر أعلاه) |

كل الجسيمات **حتمية** (deterministic) باستخدام `random(seed)` من Remotion و`frame` — لا تستخدم `Math.random()` أبداً (يكسر التصيير المتوازي).

### ٨.٣ عناصر ملحمية (`lib/epic.tsx`)
| المكوّن | الوصف |
|---|---|
| `CityEpic id x base s fill back rim win frame smoke? bloom?` | مدينة على ٣ تلال: ~٤٠٠ بيت، نوافذ مضيئة، كنيسة بقبة كبرى وأنصاف قباب (بدون مآذن — قبل ١٤٥٣)، قناة مياه بطابقين، عمود، أشجار سرو، سور بحري بـ١٧ برجاً ومشاعل. `bloom={false}` للطبقات البعيدة |
| `Ridge id fn top bottom rim? outline?` | تلال من دالة `y=fn(x)` بتدرج وحافة ضوء |
| `Cypress x y h fill rim? sway?` | شجرة سرو |
| `Walkway` + `Battlement` | سور: ارسم `Walkway` ← الشخصية (قدماها تحت `top` بـ ~٥٠) ← `Battlement` فتغطي الشرفات أرجلها |
| `Banner x y h color frame seed?` | راية ترفرف |
| `Bombard x y s` | مدفع أوربان العملاق |
| `Campfire id x y frame s smoke warm` | نار كاملة: لهب + bloom + شرر + دخان + هالة |
| `TorchFX id x y frame warm smoke? embers?` | مشعل كامل بالمؤثرات |

### ٨.٤ قواعد معرّفات SVG (مهم)
كل `<defs>` (gradients/filters) في المستند كله تتشارك نفس مساحة الأسماء. **كل مكوّن يقبل `id` يجب أن يُعطى id فريداً على مستوى الفيديو كله** (مثال: `id="t3-${i}"`)، وإلا ستأخذ عناصر لون/فلتر عنصر آخر.

---

## ٩. الشخصيات (`characters/Person.tsx`)

أسلوب كرتوني مبسّط **أصلي** (رأس مستدير كبير، عيون نقطية، خط خارجي `INK` سميك 5px، جسم صغير، أذرع مرنة). مستوحى من الأسلوب العام للرسوم التعليمية المبسّطة — لا تنسخ شخصيات قناة بعينها.

```tsx
<Person x y s? flip? rot? frame seed? skin? robe trim? hat expr pose beard? look? jolt? />
```
- الأصل (0,0) **عند القدمين**؛ الطول ≈ 270 وحدة عند `s=1`. الرأس مركزه y=−200.
- `expr`: `neutral | smug | shock | think | strain | idea | sleepy | happy | speak` (فم يتكلم متحرك) `| shout` (هتاف بحماس)
- `pose`: `stand | cross | chin | point | pull | armsUp | stretch | fist` (قبضة مرفوعة) `| wave` (تلويح) `| podium` (خطيب يحرك يده)
- `hat`: `sultan` (عمامة بيضاء + قاووق أحمر) | `vizier` | `byzHelmet` (خوذة بيزنطية + ريشة) | `bork` (قبعة الإنكشارية) | `cap` (عامل) | `officerCap` (كاب ضابط) | `none`
- `outfit`: `robe` (افتراضي: ثوب بخط وحزام بلون `trim`) | `suit` (بدلة + قميص أبيض + ربطة عنق بلون `tie`) | `uniform` (زي عسكري بحزام وكتّافات بلون `trim`)
- `hair` (لون الشعر، يظهر مع `hat='none'` أو `officerCap`)، `mustache` (لون الشارب)، `beard` (لون اللحية)
- `build`: `normal | broad` (كتفان عريضان، شكل V) `| belly` (كرش) `| slim` (نحيف). يغيّر شكل الجسم وموضع الكتفين وعرض الحزام والأرجل.
- `face`: `round | square | jaw` (فك قوي) `| pointy` (ذقن حاد) `| long | wide` (عريض ممتلئ). الشعر والقبعة يُزاحان تلقائياً حسب ارتفاع الرأس (`FACE[face].top`).
- `shading`: `none` (افتراضي، مسطّح) `| cel` (هلال ظل حاد بلون بنفسجي بارد في الجهة البعيدة عن الضوء + لمعة + احمرار خدين + ظل تحت الذقن + ظل على الأذرع) `| soft` (تدرج دائري ناعم). الضوء مفترض من أعلى اليسار. يستخدم `React.useId()` لمعرّفات mask/clip فريدة.
- **شخصيات نسائية:** `build='female'` (كتفان أضيق، خصر محدد، وركان أعرض، خط صدر خفيف) أو `femaleFull` (أكثر امتلاءً/أكبر سناً). الرموش تظهر تلقائياً معهما (`lashes` للتحكم).
  - `outfit`: `dress` (فستان طويل يغطي الأرجل، تظهر القدمان فقط) `| skirt` (بلوزة بلون `robe` + تنورة بلون `skirt`) `| abaya` (عباءة طويلة بلا حزام).
  - `hairStyle`: `short | long | bun | ponytail | bob | braid` — الجزء الخلفي (`BackHair`) يُرسم قبل الجسم، والأمامي (`FrontHair`) فوق الوجه.
  - `hat='hijab'` (جزء خلفي قبل الرأس + إطار أمامي حول الوجه، لونه `scarf` أو `trim`) و`hat='crown'` (تاج ذهبي بأحجار).
  - `lips` لون الشفاه (للتعابير neutral/think/smug)، `earrings` لون الأقراط.
  - الأسلوب محتشم وكرتوني؛ حافظ عليه.
- **الحركة (البند ١ — معتمد للتنفيذ):**
  - `motion`: `still` (افتراضي، السلوك القديم: تنفّس فقط) `| idle` (وقوف حي: نقل وزن + تنفّس) `| walk | run`.
  - `travel`: المسافة المقطوعة **بالبكسل على الشاشة** منذ بداية الحركة (عادة `x - x0`). إيقاع الخطوات يُحسب منها فلا تنزلق القدمان. بدونها يُحسب من `frame` (مشي في المكان).
  - `energy` 0..1: شدة كل الحركات (≈0.3 مشهد جاد/هادئ، 1 مبالغ/كوميدي). المضاعف الداخلي `sc = 0.5 + energy`.
  - الأرجل بسيطة تتأرجح من الورك بلا ركبة + قدم بيضاوية (`Leg`، أبعادها في `LEGS[build]`). الرجل المتقدمة ترتفع، الجسم يرتفع عند تجاور الرجلين، ضغط/مط عند الملامسة، ميل للأمام، الرأس يتأخر قليلاً (`headTilt`). في الجري: ذراعان مثنيتان وغبار (`Dust`).
  - مع `pose='stand'` أثناء walk/run تتأرجح الذراعان تلقائياً عكس الرجلين. أي وضعية أخرى (مثل `point`) تبقى كما هي أثناء المشي.
  - الفستان/العباءة: يتأرجح طرف الثوب وتتحرك القدمان تحته.
  - `act`: `angry` (ارتجاف، ضرب بالقدم، احمرار، 💢، بخار عند energy>0.5) `| laugh` `| sad` (مطر خفيف عند energy>0.6) `| scared` (ارتجاف، انكماش، عرق) `| orate` (إيماءات خطابة) `| cheer` (قفز). يتجاوز `expr` و`pose`.
  - تعابير جديدة: `angry`، `laugh`، `sad`. وضعيات جديدة: `fists`، `belly`، `droop`، `cower`، `gesture`.
  - كل الحسابات في `computeMotion()` داخل `Person.tsx` — دالة نقية من (frame, travel, energy, act) فالتصيير المتوازي آمن.
  - اختبار مرئي: Composition `MotionTest` (`src/MotionTest.tsx`).
- **الاتجاهات (البند ٢):**
  - `view`: `'front' | 'threeQuarter' | 'side' | 'threeQuarterBack' | 'back'` أو زاوية رقمية 0..180 (0 أمامي، 90 جانبي، 180 خلفي). الشخصية تنظر لليمين؛ `flip` لليسار.
  - إن لم يُحدَّد `view`: جانبي تلقائياً مع `motion='walk'|'run'`، وأمامي غير ذلك.
  - **الالتفات الناعم:** `view={yawAt(frame, [{f: 0, view: 'side'}, {f: 16, view: 'front'}])}` — الزاوية مستمرة فالالتفات يمر بالثلاثة أرباع تلقائياً.
  - **كيف يعمل:** كل ملمح نقطة على كرة الرأس (`onHead(theta, r)` → x مُسقط + z للظهور). العينان (±19°) والحاجبان يُرسمان كل واحد على حدة بإزاحة وضغط أفقي، وتختفي العين حين z<0.08. الفم والشارب واللحية تنزاح للأمام وتضيق. الأنف يظهر حين sin>0.12. الأذنان تظهران عند الالتفات (yaw>12°).
  - **الشعر = خط شعر يلتف حول الرأس (`HAIRLINE` + `HairRegion`):** لكل نوع (`short`، `pulled` للكعكة/ذيل الحصان/الضفيرة، `bob`، `long`، `hijab`) جدول ارتفاع خط الشعر حسب الزاوية حول الرأس (0 جبهة، 90 فوق الأذن، 180 مؤخرة). لكل x مرئي نحسب زاوية النقطة `asin(x/R) - yaw` ثم ارتفاع الخط عندها، فتنتج منطقة شعر واحدة متصلة تلتف بسلاسة. المنطقة مقصوصة بشكل الوجه مكبّراً (`vol`) لتعطي حجماً للشعر. لا قطع منفصلة ولا خصلات أمامية ثابتة.
  - الحجاب نوع خط شعر (`hijab`) ينزل تحت الذقن على الجانبين فيؤطر الوجه من كل اتجاه + الطرف المنسدل خلف الرأس (`backLayer`). لا يُرسم له إطار حجم.
  - تحت القبعات العسكرية (خوذة، كاب، بورك…) بلا `hair`: شعر قصير بني داكن افتراضي. السلطان والوزير والتاج بلا شعر افتراضي.
  - الكعكة تُرسم خلف الرأس أو أمامه حسب `onHead(180).z`.
  - **الجسم:** يضيق إلى 70% في الجانب (`bodyW`)؛ تفاصيل الواجهة (ربطة العنق، الأزرار، الخط) تنزاح وتضيق وتختفي في الخلفي، ويظهر بدلها خط ظهر + حزام. الكرش يبرز للأمام في الجانب.
  - **الذراعان:** `ArmCtx` يُسقط نقاط الذراع (الامتداد الجانبي يصير أمامياً في الجانب ومعكوساً في الخلفي). الذراع البعيدة (x>0 في الأمامي) تُرسم قبل الجسم حين sin>0.3، والقريبة بعده.
  - **الأرجل:** تتقارب في الجانب، البعيدة بلون أفتح وتُرسم أولاً، التأرجح يكتمل في الجانب ويخف في الأمامي، والقدم تشير للأمام.
  - **الشعر الخلفي والحجاب:** خلف الجسم عادةً، وفوق الظهر في المنظر الخلفي (`backOnTop`). ذيل الحصان والضفيرة يُعكسان في الجانب ويتوسطان في الخلفي. الحجاب يغطي الرأس كاملاً من الخلف.
  - **القبعات:** زخارف الواجهة داخل `<Front>` في `HatShape` (تدور وتختفي من الخلف)؛ حافة الكاب تبرز للأمام في الجانب.
  - اختبار: Compositions `TurnSheetA/B/C` (لوحات دوران) و`TurnTest` (فيديو) في `src/Turnaround.tsx`.
- **الأشياء في الأيدي (البند ٥) — `characters/items.tsx`:**
  - `holdR` (اليد اليمنى للشخصية = الذراع ذات x<0 في المنظر الأمامي) و`holdL`. القيمة `ItemId` أو `{id, text}` للجريدة واللافتة.
  - الأشياء (20): `kilij`، `spatha`، `spear`، `shield`، `bow`، `rifle`، `scroll`، `paper`، `book`، `newspaper`، `flagEgypt`، `flagOttoman`، `flagByz`، `placard`، `mic`، `torch`، `lantern`، `phone`، `tea`، `briefcase`.
  - طريقة التثبيت (`ITEM_MODE`): `along` يتبع اتجاه الساعد، `upright` رأسي دائماً، `hang` يتدلى، `front` يواجه الكاميرا. الأصل المحلي للشيء = نقطة المسك، و−y = بعيداً عن اليد.
  - الشيء يُرسم داخل `Arm` (عبر `ItemCtx`) قبل دائرة اليد، فيتبع إسقاط الذراع في كل الاتجاهات تلقائياً، ويختفي خلف الجسم مع الذراع البعيدة.
  - وضعيات الأشياء: `raise`، `swing` (ضربة متحركة بدورة 30 إطاراً + أثر أبيض)، `read` (الشيء ينزل للصدر `frontDy=78` والعينان للأسفل)، `present` (`frontDy=24`)، `aim` (زاوية ثابتة 90°)، `shoulder` (−20°)، `carry`.
  - السكريبت: `take <item> [right|left] [text="…"]` · `drop [right|left|both]` · `give [right|left] to <id>` (عرض ← انتقال الشيء عند +0.5ث ← رجوع الوضعيتين).
  - لوحات: `ItemsCatalog`، `ItemPoses` (مع تسلسل إطارات الضربة والتسليم)، `ItemsTurn` — `src/ItemsSheet.tsx`.
- **ترتيب الرسم بالعمق داخل الشخصية (البند ٥ب):**
  - نقاط الذراع `Pt = [x, y]` أو `[x, y, z]`؛ z = التقدم نحو الكاميرا في المنظر الأمامي. النقاط ثنائية الأبعاد تأخذ z افتراضياً = `|x − x_الكتف| × 0.6`. أعطِ z صريحاً لكل يد تتقدم أمام الجسم أو الوجه (عرض، قراءة، تصويب، هاتف، يدان مكتوفتان…).
  - الدوران حقيقي حول المحور الرأسي: `x' = x·cos(yaw) + z·sin(yaw)`، `depth = −x·sin(yaw) + z·cos(yaw)`.
  - كل ذراع (مع الشيء الذي تمسكه) تُرسم في **خانة** من ثلاث: `back` قبل الجسم (متوسط عمقها < −8)، `mid` بين الجسم والرأس، `front` بعد الرأس. الذراعان تُمرَّران ثلاث مرات وكل ذراع تظهر في خانتها فقط.
  - **اختبار الرأس:** إن وقعت اليد داخل صورة الرأس (دائرة مركزها 0,−200 ونصف قطرها `HEAD_R=66`) تكون أمامه فقط إذا كان عمقها أكبر من سطح الكرة عندها `√(R²−dx²−dy²)`. خارجها: اليد المرفوعة فوق مستوى الرأس (y<−200) تُرسم بعده ما لم يكن عمقها < −10 (فتظهر الذراع المرفوعة أمام القبعة)، **إلا من الخلف** (cos<−0.2) حيث تبقى خلف مؤخرة الرأس؛ وغير المرفوعة تُرسم بعده فقط إذا تجاوز عمقها `FRONT_DEPTH=40` (حتى لا تغطي الذراعان اللحية).
  - وضعية `read`: اليدان تمسكان الورقة من جانبيها عند الصدر، والورقة في المنتصف بينهما (`frontDx = 50·cos`).
  - حدود معروفة: القبعة تُرسم قطعة واحدة مع الرأس (لا جزء أمامي/خلفي منفصل).
  - الأشياء الأمامية (ورقة، ترس…) تُضغط أفقياً بـ `|cos(yaw)|` فتُرى من حافتها في الجانب.
  - وضعية `phone`: اليد اليسرى عند الأذن (للسماعة).
- **ترتيب الرسم بالعمق داخل المشهد — `lib/depth.tsx`:**
  - `<DepthSort>` يرتّب أبناءه حسب قاعدتهم على الأرض (y أكبر = أقرب = يُرسم آخراً)، في كل إطار. `<Sorted z={…}>` لعمق صريح، و`Actor` يأخذ عمقه من موضع قدميه (دالة ساكنة `depthOf`)، و`Person` من `y`.
  - مرّر الشخصيات أبناءً مباشرين (لا تلفّها في Fragment) حتى تُرتَّب.
  - في `Backdrop`: الخلفيات التي لها `stage` (شارع قاهري، كورنيش، ميدان، معسكر) تضع أرضيتها وعناصرها القريبة (دكاكين، أعمدة، نخيل، خيام، درابزين) في طبقة واحدة مرتبة مع الشخصيات، فتمر الشخصية خلف الدكان أو أمامه تلقائياً.
  - لوحات: `DepthTurn` (أيدٍ وأشياء أمام الرأس وخلفه × ٥ اتجاهات)، `DepthWalk` (تسلسل المرور خلف الدكان وأمامه) — `src/DepthSheet.tsx`.
- لوحات مرجعية: Compositions `SheetBuild` و`SheetFaces` و`SheetWomen` في `src/CharacterSheet.tsx` — صدّرها بـ `npx remotion still src/index.ts SheetFaces out.png --frame=0`.
- `look=[dx,dy]` اتجاه النظر (−1..1). `jolt` 0..1 قفزة لحظية (استعمل `Math.sin(prog(f,a,a+10)*Math.PI)`). `seed` يغيّر توقيت الرمش والتنفس بين الشخصيات.
- `flip` يعكس الشخصية أفقياً. `rot` لميلها على منحدر.
- شخصيات الحلقة ٢: عبد الناصر — ثابت `NASSER` في `episodes/suez1956/ShotsA.tsx` (بدلة `#3a3e4a`، ربطة `#5a1e28`، شعر وشارب `#1a1512`، بشرة `#c98f68`). استورده بـ `{...NASSER}` لضمان ثبات المظهر. فريق التسلّم: بدل مدنية + ضباط بـ `uniform`/`officerCap`.
- الشخصيات المعتمدة في الحلقة ١: السلطان محمد الثاني (robe `#b3262c`، hat `sultan`، beard `#3a2416`)، الوزير (`#2f5f8f`، `vizier`، beard رمادي)، الحارس البيزنطي (`#7a2430`، `byzHelmet`)، العمال (`cap`، ألوان متنوعة، `strain`+`pull`)، الضابط الإنكشاري (`#2c5f8a`، `bork`).

---

## ١٠. قواعد الترتيب والعمق (أخطاء سابقة — لا تكررها)

1. **داخل الطبقة الواحدة يُرسم من الخلف للأمام:** الأرض ← المشاعل/الرايات الخلفية ← السفن ← الحبال ← الشخصيات ← الواجهات الأمامية (الشرفات) ← الرموز (؟!).
2. **العناصر المتناثرة (خيام، سفن الأسطول) تُرتّب حسب y تصاعدياً قبل الرسم** (`.sort((a,b)=>a.y-b.y)`) ويُكبَّر حجمها مع y.
3. **الشخصية على سور تقف خلف الشرفات** (Walkway → Person → Battlement)، لا فوقها.
4. العناصر التي تتداخل في مكان واحد ضعها في **نفس الطبقة** (نفس `d`) حتى لا ينكسر الترتيب مع حركة الكاميرا.
5. اترك أسفل الكادر (y > ~880) خالياً من العناصر المهمة — الترجمة تغطيه.
6. الأشجار والمباني يجب أن تُرسم بنفس دالة التل الذي تقف عليه (وإلا تطفو).
7. بعد أي تعديل: لقطة `still` من كل لقطة وافحصها بصرياً.

---

## ١١. التوقيت والمزامنة

- `VOICE_DELAY = 0.6` ثانية (`Subtitles.tsx`): الصوت يبدأ بعد ظهور الصورة. الترجمة تُزاح بنفس القيمة تلقائياً.
- بدايات اللقطات في `Episode.tsx → SHOTS[].at` (بالثواني) = بداية الجملة في `cues.json` + `VOICE_DELAY`. حالياً: `0، 10.1، 17.55، 24.0`.
- الانتقال بين اللقطات: crossfade `XF = 14` إطاراً. fade من/إلى الأسود في البداية والنهاية.
- داخل كل لقطة `useCurrentFrame()` يبدأ من 0 (Sequence)، والأحداث معرّفة بثوابت (مثل `IDEA = 100`، `NOTICE = 78`).
- مدة الـ Composition: `DURATION_S = 31` × 30fps.

---

## ١١.٣ مكتبة الشخصيات (البند ٤) — `src/cast/`
مصدر واحد لمظهر كل شخصية في كل الحلقات. **لا تكتب مظهر شخصية داخل ملف لقطة** — أضفها للمكتبة.
- `historical.ts`: شخصيات تاريخية حقيقية (`defineCharacter`: `id`، `name` بالعربية، `era`، `ref` = المرجع البصري للدقة التاريخية، `look`، `variants`). الحالية: `mehmed2` (+`older`)، `halilPasha`، `constantine11`، `nasser` (+`officer1952`، `sixties`)، `mahmoudYounis`. أسلوبها كاريكاتير مبسّط ومحترم.
- `roles.ts`: أدوار عامة (`defineRole`: `base` + `vary` = قوائم يُختار منها حتمياً حسب seed): `byzGuard`، `janissary`، `ottomanWorker`، `egyptOfficer`، `egyptCivilian`، `woman1950s`، `womanHijab`، `fellah`، `protester`.
- الاستخدام (`src/cast/index.ts`):
  ```tsx
  <Person {...look('nasser')} ... />                       // المظهر الأساسي
  <Person {...look('nasser', {variant: 'sixties', shading: 'cel'})} ... />
  <Person {...roleBase('byzGuard')} ... />                  // الشكل الأساسي للدور
  <Person {...extra('janissary', 3)} ... />                 // شكل متنوع (نفس seed = نفس الشكل)
  const CAST = castOf({younis: 'mahmoudYounis', o1: ['egyptOfficer', 1]}, {shading: 'cel'});  // لسكريبت الحركة
  ```
- المكتبة لا تفرض `shading` — اختر الأسلوب عند الاستخدام (الحلقتان الحاليتان مسطّحتان عدا فريق الإسماعيلية).
- لوحات المكتبة (صور ثابتة تُحدَّث تلقائياً): Compositions `CastHistorical` و`CastRoles` (`src/CastSheet.tsx`).
- في نصوص SVG العربية تجنّب الأقواس () — تنعكس بسبب اتجاه النص؛ استخدم «—».

## ١١.٣ب مكتبة المباني والخلفيات (البند ٤ب) — `src/world/`
- **`lighting.ts`:** `TimeOfDay = 'dawn'|'day'|'dusk'|'night'`، `worldFor(time)` → `{P (لوحة)، lit (إضاءة النوافذ 0..1)، tint (صبغ المواد)، lightDir (جهة الضوء)، sun (موقع الشمس/القمر)}`، و`WorldCtx` يمررها لكل المباني. `tinted/shadeOf/lightOf(W, color)` تحسب لون المادة وظلها وضوءها للوقت.
- **`kit.tsx` (أدوات الرسم):** `Wall` (ملمس: stone/brick/plaster/wood/mud/ablaq + وجه جانبي للعمق + ظل أرضي AO)، `Cornice`، `Win` (غائرة، تضيء ليلاً حتمياً حسب seed)، `Door`، `Dome` (تدرج + أضلاع + حافة ضوء + هلال/صليب)، `Minaret` (ottoman/mamluk)، `Mashrabiya`، `Awning`، `Balcony`، `TileRoof`. كل أداة تقبل `D` (مفصّل) أو تُرسم مبسّطة.
- **`buildings.tsx` (18 مبنى، كلها `<X x y s D seed c />`، الأصل منتصف القاعدة):** `OttomanMosque`، `ByzChurch`، `OttomanHouse`، `WallTower`، `Khan`، `CairoHouse`، `MamlukMosque`، `CityGate`، `SouqStall`، `EuroApartment` (floors)، `GovBuilding`، `Shop` (sign)، `Kiosk`، `StreetLamp`، `MudHouse`، `Pyramid`، `Warehouse`، `Lighthouse` (frame)، + طبيعة `PalmTree`، `RoundTree`.
  - **المستويان:** `D={false}` مبسّط مسطّح للبعيد والحشود، `D` (افتراضي) مفصّل بظل وضوء وملمس. القاعدة: الطبقات البعيدة (d ≥ 1400) مبسّطة + `Haze`، القريبة مفصّلة.
  - يجب أن تكون المباني داخل `WorldCtx.Provider` (تلقائي داخل `Backdrop`)؛ خارجها تُستخدم إضاءة النهار.
- **`backdrops.tsx` (9 خلفيات × 4 أوقات):** `cairoMamlukStreet`، `alexCorniche`، `cityPlaza1950s`، `nileCountryside`، `desertPyramids`، `harbor`، `palaceInterior` (داخلي بلا سماء)، `militaryCamp`، `besiegedWalls`.
  ```tsx
  <Backdrop name="cairoMamlukStreet" time="dusk" cam={cam}>
    <Actor scene={scene} id="ali" />     {/* SVG للشخصيات — تُرسم على طبقة الممثلين */}
  </Backdrop>
  ```
  الأرضية التي تقف عليها الشخصيات: `GROUND[name]` (≈930). كل خلفية: سماء مشتركة (شمس/قمر/نجوم/سحب/أشعة حسب الوقت) + 3–5 طبقات عمق + ذرات + `ColorGrade`.
- لوحات المراجعة (صور ثابتة): `BuildingsSheetA/B` (كل مبنى مبسّط | مفصّل)، `BuildingsSheetNight`، `BackdropsSheetA/B/C` (كل خلفية في الأوقات الأربعة) — `src/WorldSheet.tsx`.

## ١١.٣ج إضاءة الشخصيات بألوان المشهد (البند ٨) — `characters/light.ts`
- `CharLight = {dir, key, shadow, ambient, rim, points?}`؛ `LIGHT_BY_TIME[time]` قيم جاهزة للأوقات الأربعة. `PointLight = {x, y, color, r}` مصدر ضوء قريب (نار، مصباح) بإحداثيات الشاشة.
- `Backdrop` يوفّر `CharLightCtx` تلقائياً (اتجاه الضوء من `W.lightDir` + مصادر `stage.lights`: نار المعسكر، مصابيح الكورنيش والميدان حين تضيء). أطفئه بـ `lighting={false}`.
- خارج `Backdrop`: مرّر `light={...}` لـ `Person` أو لُفّ المشهد بـ `<CharLightCtx.Provider>`. بدون إضاءة = السلوك القديم المسطّح تماماً.
- التأثير على الشخصية: ظل cel بلون ظل المشهد في الجهة البعيدة عن الضوء (يُفعَّل تلقائياً حتى مع `shading='none'`)، صبغة جو (`ambient`)، حافة ضوء (`rim`) بلون `key`، ضوء دافئ وحافة من أقرب مصدر نقطي حسب جهته، وظل أرضي مُزاح عكس الضوء.
- لوحات: `LightingSheet` (٣ خلفيات × ٤ أوقات)، `LightingCompare` (بدون | بإضاءة) — `src/LightingSheet.tsx`.

## ١١.٤ سكريبت الحركة (البند ٣) — `src/lib/script.tsx`
اكتب التمثيل كنص داخل ملف اللقطة، والمحرك يحسب كل إطار (موضع، مسافة الخطوات، الاتجاه، الالتفات، التمثيل):
```tsx
const CAST: Record<string, CastMember> = {ali: {...مظهر Person..., shading: 'cel'}};
const SCRIPT = `
@0s         ali:  enter x=-150 y=960 s=1.1 | walk to 640
@"فوراً"     ali:  act angry energy=0.9 for 2s
@after ali  ali:  turn back | walk to x=700 y=800 s=0.75 speed=slow
`;
const scene = useScene(SCRIPT, {cast: CAST, words, wordOffset: wordOffsetForShot(at, index)});
// داخل <svg>/<Art>:
<Actor scene={scene} id="ali" />
// فوق اللقطة (رسالة خطأ واضحة برقم السطر في Studio):
<ScriptErrorOverlay scene={scene} />
```
- **الصيغة:** `@<زمن> <شخصية>: <أمر> | <أمر> …` — أوامر السطر تُنفَّذ بالتتابع. الأسطر التي تبدأ بـ `#` تعليقات.
- **الزمن:** `@2s` `@2.5` `@45f` `@+1s` (بعد السطر السابق) `@after <id>` (حين تنهي الشخصية أوامرها) `@"كلمة"` أو `@"كلمتان معاً"+0.3s` أو `@"كلمة"#2` (المرة الثانية).
- **مزامنة الكلمات:** `narrate.py` يحفظ `<name>.words.json` (توقيت كل كلمة عبر WordBoundary). المطابقة تتجاهل التشكيل والهمزات والتاء المربوطة والترقيم. `wordOffsetForShot(at, index)` (في `EpisodeBase.tsx`) يحوّل زمن التعليق لزمن اللقطة.
- **الأوامر:**
  - `enter x= y= s= view= face=left|right` · `hide` · `show` · `exit`
  - `walk to <x>` أو `walk to x= y= s=` · `run to …` · `move to …` (انزلاق بلا خطوات) · خيارات: `speed=slow|normal|fast|<px/s>` `dur=2s` `view=back`
  - `stop` · `wait 1s` · `jump height=70`
  - `turn front|threeQuarter|side|threeQuarterBack|back|<زاوية> [مدة]` · `face left|right` · `look at <id>`
  - `act <name>|none [energy=] [for 2s]` · `expr <name> [for …]` · `pose <name> [for …]` · `energy 0.8`
  - `hold` (لا تلتفت للكاميرا تلقائياً عند الوقوف) · `release`
  - `take <item> [right|left] [text=…]` · `drop [right|left|both]` · `give [right|left] to <id>`
- **التلقائي:** المدة من المسافة والسرعة (السرعة × مقياس الشخصية)؛ `travel` لإيقاع الخطوات؛ الحركة الأفقية → جانبي باتجاه الحركة (التفات عبر الأمام عند تغيير الجهة)؛ الحركة في العمق تحافظ على الاتجاه الحالي (فـ `turn back | walk to y=…` = ابتعاد بالظهر)؛ عند الوقوف التفات ناعم للكاميرا ما لم يُستخدم `hold`؛ `for` تعيد الحالة السابقة بعد المدة.
- **الكاميرا (`camera:` اسم محجوز — `lib/camscript.ts`):**
  - `follow <id> [dx= dy= lag=0.35 blend=0.6] [y] [for 2s]` متابعة ناعمة متأخرة قليلاً (متوسط موضع الشخصية في نافذة `lag`)، `y` لمتابعة رأسية أيضاً · `unfollow [blend=]`
  - `move to x= y= z= ry= rx= rz= fov= zoom= [dur=1s]` · `zoom 1.4 [dur=1s]` (يكبّر طبقة الممثلين بالمعامل بالضبط عبر dolly؛ الخلفيات تكبر أقل = parallax) · `shake [amp=10] [for 0.6s]` · `reset [1s]` · `wait 1s`
  - `scene.cam(frame)` يعيد `Cam` جاهزة: `<Backdrop cam={scene.cam(f)}>` أو `<Stage cam={scene.cam(f)}>`. عمق طبقة الممثلين `opts.camDepth` (افتراضي 150 = طبقة الممثلين في `Backdrop`).
  - `@after camera` يعمل. اختبار: `CameraTest` (فيديو) و`CameraSheet` (لوحة إطارات) — `src/CameraTest.tsx`.
- اختبار: Composition `ScriptTest` (`src/ScriptTest.tsx`) تعرض السكريبت والسطر المنفَّذ. مثال حقيقي: `TEAM_SCRIPT` في `episodes/suez1956/ShotsB.tsx`.

## ١١.٤ب المؤثرات الصوتية (البند ٩) — `lib/sfx.tsx` + `narrator/sfx_synth.py`
- كل الأصوات **مُركّبة رياضياً** (numpy، بلا حقوق، نتيجة ثابتة): `python narrator/sfx_synth.py` → `studio/public/sfx/*.wav`.
  قصيرة: `step step2 run land whoosh clang pop boom` — ممتدة تتكرر بلا قطع: `waves wind fire murmur cheer`.
- **تلقائي من السكريبت:** خطوات متزامنة مع ملامسة القدم (نفس معادلة الطور في `computeMotion`: دورة 150 مشي/230 جري ÷ s)، صوت هبوط بعد `jump`، `whoosh` كل ثانية مع `pose swing`. علوّ الخطوة يتبع حجم الشخصية.
- **أوامر:** `sfx <name> [vol=0.8] [delay=0.3s] [for 3s]` (لأي شخصية أو `camera:`) · `steps off|on` · `jump sound=off` · `pose swing sound=off`.
- **التشغيل:** `<SceneAudio scene={scene} volume? steps? />` مرة واحدة في اللقطة (خارج svg). `scene.sfx()` يعيد قائمة الأحداث.
- **الصوت المحيطي:** `Backdrop` يشغّل تلقائياً `AMBIENCE[name](time)` (أمواج للكورنيش والميناء، نار+ريح للمعسكر، ريح للصحراء، همهمة للشوارع…). `ambience={0}` للإيقاف أو رقم للشدة.
- **مراجعة الصوت بلا تصيير فيديو:** `npx remotion render src/index.ts SfxTest out.mp3 --codec=mp3` (~٤٠ث، لا يرسم إطارات).
- اختبار: `SfxTest` (`src/SfxTest.tsx`).
- إصلاح: الشخصية التي أول أوامرها `enter` بعد البداية تكون مخفية قبله.

## ١١.٤ج الحوار بين الشخصيات (البند ٦) — `lib/dialogue.tsx`
> ⛔ **قرار صاحب المشروع: لا تستخدم نظام الحوار هذا (أوامر `say` وأصوات edge-tts للشخصيات وفقاعات الكلام) في أي مشهد أو حلقة بشكل تلقائي.**
> أصوات الحوار سيسجّلها صاحب المشروع بنفسه. **اسأله قبل أي استخدام** لـ `say` أو `npm run dialogue` أو إضافة حوار لمشهد.
> الأداة موقوفة: `npm run dialogue` يرفض العمل إلا مع `-- --confirm` بعد موافقته. الكود موجود للمرجعية فقط.

- **في السكريبت:** `say "النص" [style=say|shout|think|whisper|none] [vol=1] [act=orate] [nowait] [for 2s]`
  - `say` (فقاعة عادية)، `shout` (مسننة + خط أكبر)، `whisper` (حد متقطع + نص مائل)، `think` (فقاعة تفكير بدوائر — **بلا صوت ولا حركة فم**)، `none` (صوت بلا فقاعة).
  - تنتظر الجملة حتى تنتهي ثم تكمل الأوامر (`@after <id>` يعمل للتناوب في الحوار). `nowait` = يتكلم وهو يمشي. `act=` تمثيل طوال الجملة.
  - `voice <اسم edge-tts> [rate=] [pitch=]` لتغيير صوت شخصية داخل المشهد.
- **الصوت لكل شخصية:** `voice` في `historical.ts` (ثابت: ناصر `ar-EG-ShakirNeural`، محمد الثاني `ar-AE-HamdanNeural`…) و`voices` في `roles.ts` (قائمة يُختار منها حسب نفس seed الشكل). `castOf` يضعه تلقائياً في `CastMember.voice`. الافتراضي: `ar-JO-TaimNeural` للرجال و`ar-EG-SalmaNeural` للنساء. **لا تستخدم `ar-SA-HamedNeural` لشخصية — هو صوت الراوي.** الأصوات العربية المتاحة: `python narrator/narrate.py --list-voices`.
- **الفم:** `Person.talk` (0..1) يفتح الفم داخل كل كلمة بإيقاع المقاطع ويغلقه بين الكلمات، من توقيت الكلمات الحقيقي (WordBoundary). العينان والحاجبان يبقيان حسب التعبير.
- **الفقاعات:** `<Bubbles scene={scene} />` بعد الممثلين داخل نفس svg/`Backdrop` (تُرسم فوق الجميع). تلتف الأسطر تلقائياً (≤560px)، تبقى داخل الكادر، ذيلها لجهة نظر المتكلم، تظهر بقفزة وتختفي بعد 0.35ث.
- **توليد الصوت:**
  1. عرّف المشهد بـ `export const X = defineScene('اسم', SCRIPT, CAST)` (ضروري ليجده الأداة) واستعمله `useScene(X.script, {cast: X.cast, …})`.
  2. من `studio/`: `SSL_CERT_FILE=/root/.ccr/ca-bundle.crt npm run dialogue` (المتغير في بيئة Claude السحابية فقط). `npm run dialogue -- --list` للعرض فقط.
  3. الأداة (`scripts/dialogue.mjs` بـ esbuild) تجمع كل جمل `say` وتولّد **الناقص فقط** عبر `narrator/dialogue.py` → `public/dlg/<id>.mp3` + `src/dialogue/clips.json` (`{dur, words}`).
  - المعرّف = hash (الصوت + السرعة + الطبقة + النص): تعديل النص أو الصوت = ملف جديد. الملفات القديمة غير المستخدمة يمكن حذفها يدوياً.
  - قبل التوليد: المدة تُقدَّر من طول النص (~١٣ حرفاً/ث) فتعمل الفقاعات والتوقيت بلا صوت. **بعد التوليد تتغير المدد** فأعد مراجعة التوقيت.
- **التشغيل:** `<SceneAudio scene={scene} />` يشغّل الحوار مع المؤثرات (`voices={0}` لكتمه).
- شكّل النص لنطق صحيح. اختبار: `DialogueTest` (فيديو) و`DialogueSheet` (لوحة) — `src/DialogueTest.tsx`. مراجعة الصوت: `npx remotion render src/index.ts DialogueTest out.mp3 --codec=mp3`.

## ١١.٥ الحشود الكبيرة (`Crowd` في `episodes/suez1956/props.tsx`)
- شخوص خفيفة (جسم + رأس + شعر + يد مرفوعة اختيارية + علم اختياري) بدل `Person` الثقيل.
- `rows`، `gap`، `s0→s1` (حجم الصف الخلفي → الأمامي)، `cheer` 0..1 (رفع الأيدي والقفز)، `flags` نسبة حاملي الأعلام، `hats` قبعات تُرمى، `outline` للصفوف القريبة فقط.
- **الأداء:** `sp` يزيد التباعد (1.5 للحشد البعيد)، و`mass` يرسم كتلة لون خلف الحشد فيبدو كثيفاً بعدد أقل من الشخوص. وزّع الحشد على ٣ طبقات (بعيد/متوسط/قريب) لعمق حقيقي.
- **التكوين:** اجعل الحشد يملأ النصف السفلي من الكادر فوق خط الترجمة (المبنى/الخطيب في الثلث العلوي)، وإلا يختفي الحشد تحت الترجمة.

## ١١.٦ حلقة جان دارك — نمط الحلقات الطويلة (مشهد بمشهد) — `src/episodes/joanOfArc/`
> هذا هو النمط المعتمد للحلقات الطويلة والشورتس الجديدة: صوت لكل جملة + مشاهد مستقلة + أدوات 2.5D المتقدمة (§١١.٧).

### الصوت: مقطع لكل جملة (بدل ملف صوت واحد + SRT)
- النص في `narrator/scripts/joan_manifest.json`: قائمة `{id, speaker, voice:{name, rate, pitch}, text (مشكول للنطق), display (للترجمة)}`. المعرّف `sNN_<متكلم>_<رقم>`.
- التوليد: `python narrator/joan_audio.py [--scene s03] [--force]` ← `studio/public/joan/<id>.mp3` + `src/episodes/joanOfArc/audio.json` (المدة + توقيت كل كلمة). يولّد **الناقص أو المتغيّر فقط** (hash للنص والصوت).
- ⚠️ أصوات الشخصيات (غير الراوي) في الحلقة الحالية من edge-tts — راجع قرار صاحب المشروع في §١١.٤ج قبل إضافة أصوات شخصيات جديدة.
- `audioHelper.tsx`: `buildTrack([{kind:'pause', sec}, {kind:'clip', id, padAfter}], tailPad)` يرتّب المقاطع بلا تداخل ويحسب مدة المشهد (`durationFrames`) — **المدة تأتي من الصوت، لا تكتبها يدوياً**. ثم `track.byId.<id>.t0/t1` لتوقيت الأحداث، `talkOf()` لفم المتكلم، `bubbleOf()` للفقاعة، `<SceneTrackAudio track sfx=[{at,name,vol,dur}] />`، `<SceneTrackSubtitles track hideDialogue />`.
- **التزامن:** اربط كل حدث بصري بتوقيت الكلمة الحقيقية (`audio.json → words[].t`) وليس بنسبة من مدة الجملة؛ الثوابت الحالية في بعض المشاهد تسبق الكلمة بثوانٍ (راجع §١٣).

### هيكل المشاهد
- كل مشهد `SceneNN.tsx` يصدّر `SCENENN_TRACK` و`SceneNN`، ومسجّل كـ Composition مستقلة `JoanSceneNN` في `Root.tsx` للمراجعة. `Episode.tsx` يجمعها في `JOAN_SCENES` وتُحسب المدة الكلية تلقائياً.
- داخل المشهد: مكوّن لكل مرحلة (مثلاً `CastleGate`، `Question`، `HeroHill`) ومكوّن رئيسي يختار المرحلة حسب الزمن ويضع الصوت والترجمة **مرة واحدة** خارج المراحل.
- الشخصيات من المكتبة: `joanOfArc` (+`village`/`travel`)، `charles6`، `charles7` (+`disguised`/`king`)، `henry5`، `henry6Baby`، `philipGood`، `laHire`، `pierreCauchon`، `baudricourt`؛ والأدوار `frenchSoldier`، `englishSoldier`، `burgundianSoldier`، `medievalNoble`، `poitiersScholar`. لوحاتها: `JoanCastSheet`، `JoanRolesSheet`، `EuropeMapSheet`.
- رموز كوميدية جاهزة (`lib/comicFx.tsx`): `DizzyBirds`، `SwearBubble`، `CalloutTag`، `FlipCalendar`، `BigStamp`، `TitleBanner`.
- خرائط حقيقية (`world/maps/`): `europeData.ts` (Natural Earth، حدود وأنهار)، `MapEngine.tsx` (`makeProjection`، `RealEuropeMap`، `MapAttackArrow`، `MapBattleIcon`، `MapCityPin`…)، `france1429.ts` (المدن ومناطق السيطرة ومسارات الحملات).

## ١١.٧ أدوات 2.5D المتقدمة (طاولة الحرب، الأرضيات بالمنظور، الأطقم) — مستخدمة في جان دارك
كل ما يلي فوق `lib/stage.tsx` بلا تعديله، وقابل للنقل لأي حلقة.

### `stage3d.tsx` — الأساس
- **أرضية واحدة للعالم:** `G0 = 372` (ارتفاع الأرض تحت مركز الكادر). `gy(d)` = خط الأرض على الشاشة عند العمق d. ضع قدمي كل شخصية/مبنى في طبقة عمقها d عند `y = gy(d)` فيقف الجميع على أرض واحدة مهما تحركت الكاميرا. `ACT_D = 150`، `ACT_Y = gy(150)`.
- `Floor3D d0 d1 G?` مستوى أفقي بمنظور حقيقي (أرضية؛ و`G` سالب = سقف)، `Wall3D x d0 d1` جدار جانبي عمودي، `FloorTiles` بلاط بتدرج بُعد، `Masonry` أحجار غير منتظمة.
- `toScreen(x, y, d, cam)` / `projectWorld()`: موقع نقطة من المسرح على الشاشة — للفقاعات والبطاقات والأصوات المكتوبة (طق!) في `Hud` (طبقة SVG مسطّحة فوق التلوين).
- `LitStage cam light` = `Stage` + `CharLightCtx`. `LIGHTS.{table, chinon, golden, day, night, palace, royal}`، `mixLight`، `mixPalette`، `mix`.
- لوحات: `WAR_TABLE`، `CHINON`، `GOLDEN`، `CLEAR_DAY`، `SEA_NIGHT`، `STORM`، `PALACE_DAY`، `ROYAL`. قطع: `Fleur`، `HangingBanner`، `Rays`، `FarArmy` (صف جنود بعيد خفيف)، `SoftFilm` (حبيبات + vignette أخف من `FilmLook`).

### ⚠️ قاعدة التقاطع في CSS 3D (أهم درس)
أي مستوى مائل (`Floor3D`، `Wall3D`، طاولة الخريطة) **يتقاطع** مع الطبقات العمودية في نفس سياق `preserve-3d`، فيقصّها المتصفح (BSP) وتختفي أرجل الشخصيات أو أبواب كاملة. الحل: **ثلاث `LitStage` متتالية بنفس الكاميرا**: (١) الخلفية البعيدة ← (٢) الأرضية/الجدران المائلة وحدها ← (٣) كل العناصر الأقرب والممثلين. كل `LitStage` تُرسم فوق السابقة (painter's order).

### `MapTable.tsx` — «طاولة الحرب»
- الخريطة الحقيقية كورقة على طاولة خشب مائلة `THETA = 27°`، فرنسا وإنجلترا **مجسّمتان** بارتفاع وحواف، تضاريس وأنهار، وردة بوصلة، شمعة أمامية خارج التركيز.
- `<MapTable id cam frame center zoom colors territories river pieces={({xy}) => …}>{({proj}) => <MapFlat>…</MapFlat>}</MapTable>`
  - الإسقاط **ثابت**؛ كل الحركة بالكاميرا (فلا يُعاد رسم الخريطة كل إطار).
  - `children` = رسم مسطّح على الأرض (`MapFlat`: أسهم، خطوط انقسام). `pieces` = مجسّمات واقفة في مسرح مستقل (قاعدة التقاطع).
  - `Standee at={xy([lon,lat])} up? scale? z?` مجسّم واقف (الأصل عند القاعدة). `CityStandee` دبوس مدينة بلافتة كبيرة. `GamePiece` (`MapPieces.tsx`) قاعدة قطعة لعب باسم تقف عليها شخصية. `mapToScreen()` لموقع الفقاعة.
- الخامات (ورق قديم + تضاريس) صور ثابتة بدل فلاتر SVG (أسرع ×1.7): `node studio/scripts/joan-textures.mjs` ← `public/joan/tex/{paper,relief}.png`.

### `sets.tsx` — أطقم جاهزة
`CurtainStage` (مسرح مخملي بستائر وأرضية — `c`/`dark`/`glow`/`rays`)، `Podium` (منصة دائرية بمخروط ضوء، `on` لإطفائه)، `Cathedral` (صحن كاتدرائية قوطية: أعمدة بأعماق، نافذة وردية، رايات طرفين، `gloom`)، `StoneChamber` (غرفة حجرية بنافذة ممطرة، `rage` 0..1 يحوّلها لغضب أحمر بأشعة وشرر)، `GoldFrame`، `NamePlate`، `Rain`.
وفي المشاهد أطقم أخرى قابلة للنسخ: قاعة القصر بصندوق منظور كامل `Hall` (Scene04)، القناة الإنجليزية بأشرطة بحر وجروف (Scene03)، واجهة قلعة بفتحة قوس حقيقية وباب يدور على مفصلته (Scene02)، مجسّم حصار مائل 50° بصفوف واقفة `Row` (Scene09 — صف واحد لكل قاعدة متقاربة بدل لوحة لكل عنصر، للأداء).

### قواعد عملية من التجربة
- اترك أسفل الكادر (y > ~880) خالياً — الترجمة سطران؛ إن اختفت الأقدام ارفع المشهد بـ `cam.y += 30..60`.
- `view="threeQuarter"` مع تعبير `angry` يرسم الحاجب كرقعة عين — استخدم زاوية صغيرة (`view={20..28}`) أو الأمامي.
- ارسم الأصوات المكتوبة (طق!، بونك!) في `Hud` مع `direction="rtl"` و`paintOrder: 'stroke'` حتى لا تنقلب علامة التعجب ولا يغطي الحد الحروف.
- الأداء المرصود: ≈ ١٫٣–٣ ث/إطار بتزامن ٤ (قريب من حلقة السويس). أثقل شيء: طبقات `blur` الكبيرة وفلاتر SVG — استبدل الفلاتر الثابتة بصور.
- المراجعة: لقطات `still` من كل مرحلة (لوحة تجميعية بـ ffmpeg `tile`) قبل أي تصيير.

## ١١.٨ شورت «ليه ولماذا؟» — لماذا تهاجر الطيور؟ — `src/episodes/whyBirds/`
- **قناة مختلفة** («ليه ولماذا؟» — علوم مبسطة بالفصحى) بنفس أسلوب الرسم، **عمودي 9:16 وأقل من دقيقة**. نفس صوت الراوي (`ar-SA-HamedNeural`) بسرعة `+12%` (إيقاع الشورتس)، **بلا أصوات شخصيات**.
- **الصوت:** `narrator/scripts/birds_manifest.json` ← `python narrator/joan_audio.py --manifest narrator/scripts/birds_manifest.json --public studio/public/whybirds --index studio/src/episodes/whyBirds/audio.json` (نفس أداة جان دارك بمعاملات مختلفة). ترتيب الجمل والفواصل في `track.tsx → ORDER` (المدة الكلية تُحسب من الصوت؛ حالياً ٥٩٫٨ث — لا تتجاوز ٦٠).
- **التزامن:** `wordAt(id, 'كلمة')` يعيد زمن الكلمة الحقيقي (WordBoundary) — كل حدث بصري مربوط بكلمته. `S(id)`/`E(id)` بداية/نهاية الجملة.
- **المحرك العمودي `vstage.tsx`:** `VStage`/`VLayer`/`VArt`/`Hud` = نفس رياضيات `lib/stage.tsx` بأبعاد 1080×1920 (`camAt` من lib/stage). تحذير parallax: نقطة في طبقة عمقها d تظهر عند `960 + (Y−960) − cam.y/k` حيث `k=(P+d)/P` — احسب حركة الكاميرا الطويلة بهذا (مشهد الرحلة جنوباً).
- **الطائر `Bird.tsx`:** شخصية أصلية (`kind`: sparrow/swallow/goose/tern، `mode`: fly/perch/glide، `expr`، `peck`، `shiver`، `mouth`، `carry='worm'`، `rot`)، + `Chick` (فرخ يزقزق)، `FarBirds` (طيور بعيدة رخيصة)، `vFormation(n, gap)`. لوحة: `BirdSheet`.
- **الكرة الأرضية `Globe.tsx`:** إسقاط orthographic حقيقي بيابسة Natural Earth 110m (`world/maps/worldLand.ts` — من حزمة world-atlas@2.0.2، ISC/Public Domain)، `gproj`، `geoLine` (خط يختفي خلف الكرة)، `densify`. مسار الخرشنة القطبية تقريبي مستوحى من دراسة Egevang وآخرين ٢٠١٠ (≈٧٠٬٩٠٠ كم/سنة).
- **الترجمة العمودية:** `top: 1240`، هامش أيمن 130 (عمود أزرار يوتيوب)، وأسفل ~1450 لعنوان يوتيوب — اترك المعلومات المهمة بين y≈120 و1200.
- **المؤثرات الصوتية الحقيقية (تمّت):** ٩ أصوات من Freesound بترخيص **CC0 فقط** (تحقق من صفحة كل صوت)، مصادرها وأصحابها في `public/whybirds/sfx/CREDITS.md`. معاينات HQ مقصوصة على أقوى نافذة ومُطبَّعة بـ loudnorm. المواضع والشدات في `Short.tsx → WHY_BIRDS_SFX` (المؤثرات ≈ ٧–١٣ dB تحت صوت الراوي). الشبكة الآن تسمح بـ `freesound.org` و`cdn.freesound.org`؛ Freesound يحدّ الطلبات المتتالية (403 مؤقت) — اترك ٥–١٠ث بين الطلبات. ملف جديد: ضعه في `public/whybirds/sfx/` وسجّله في `sfx.json` وأضف سطره في CREDITS.md.
- **اللمسات النهائية `polish.tsx`:** `hand(cam, t, amp, shake?)` كاميرا محمولة حتمية + صدمة (مثل تشقق الجليد)؛ `Grade` تلوين لكل مشهد (soft-light + screen + multiply) يوضع بعد المسرح وقبل `Hud` حتى لا يتلوّن النص؛ `Bird light={lx, shadow, rim, ambient}` ظل هلالي + حافة ضوء + صبغة جو؛ جسيمات: `Feathers`، `Petals`، `Fireflies`، `WindStreaks` (أفقي/رأسي)، `Breath`، `ShootingStar`، `Butterfly` + `Motes` من lib/fx. عمق الميدان: عناصر أمامية في `VLayer d<0` مع `blur` (غصن مثلج، عشب، قصب)؛ إن احتاجت أن تكون فوق التلوين ضعها في `VStage` ثانية بنفس الكاميرا.
- **حركة الطيران (`Bird`):** ضربة لأسفل سريعة (٤٠٪ من الدورة) ورجوع أبطأ مع طيّ الجناح، الجسم يرتفع مع الضربة والرأس ثابت نسبياً، الذيل يتأخر؛ `bursts` نوبات رفرفة + انزلاق؛ `flare` فرملة الهبوط (الجناحان للأمام والجسم يميل)؛ `legs` رجلان ممدودتان.
- **`Flock`:** سرب V على منحنى بيزيه (`path` ٤ نقاط، `u` 0..1) يتبع المماس، الطيور الخلفية تتأخر على المسار، تمايل وإيقاع رفرفة مختلف لكل طائر، `s` رقم أو دالة في u (للابتعاد). **اجعل كل سرب يخرج من الكادر تماماً أو ينتهي داخل مشهده** — لا تتركه يتوقف عند الحافة.
- **قيود Amiri:** لا تستخدم رموزاً مثل ↓ ☀ داخل النص (لا يدعمها الخط) — ارسمها كأشكال SVG.

## ١١.٩ موسيقى الخلفية — **قاعدة دائمة** — `lib/music.tsx`
> قرار صاحب المشروع: **كل فيديو (حلقة أو شورت) فيه موسيقى خلفية هادئة وجميلة طوال الوقت.**
- `<BackgroundMusic src={MUSIC.lighthouse} speech={spans} high={0.24} low={0.1} />` — ضعها مرة واحدة في المكوّن الرئيسي للفيديو. `speech` = فترات كلام الراوي `{t0, t1}` بالثواني (في الشورت: `Object.values(CLIPS)`) فتنخفض الموسيقى أثناء الكلام وترتفع في الوقفات، مع ظهور تدريجي في البداية واختفاء في النهاية، وتتكرر تلقائياً إن كان الفيديو أطول منها.
- المستوى المستهدف: الموسيقى ≈ ١٣–٢٠ dB تحت صوت الراوي (قِسه بتصيير `--codec=mp3` وطرح نسخة بلا موسيقى).
- المكتبة `public/music/` — **CC0 فقط** من Freesound، والمصادر في `public/music/CREDITS.md`: `lighthouse` (بيانو هادئ 84.7ث — المستخدم في شورت الطيور)، `respect` (روحاني عاطفي 246ث — للحلقات الأطول)، `relax` (استرخاء 89.6ث). لإضافة مقطع: تحقق من CC0 في صفحته، احذف صمت البداية، `loudnorm=I=-18`، وسجّله في `MUSIC` وCREDITS.md.
- الحلقات القديمة (السفن، السويس، جان دارك) لم تُضف لها الموسيقى بعد — اسأل صاحب المشروع قبل تعديلها.

## ١١.١٠ أدوات الشورتس المشتركة + شورت «لماذا بُني سور الصين العظيم؟»
### `src/shorts/` — مشتركة لكل الشورتس العمودية
- `vstage.tsx` (VStage/VLayer/VArt/Hud)، `polish.tsx` (hand، Grade، الجسيمات)، `common.tsx` (Txt، pop، fade، ChannelBadge، InfoCard، Cross، Bug، Seed، Thermo، Snow).
- `track.tsx → makeTrack({audio, order, dir, sfxFiles})` يعيد `{CLIPS, S, E, wordAt, TOTAL_S, TOTAL_FRAMES, Audio, Subtitles}`: `<T.Audio sfx={…} music={MUSIC.x} />` يشغّل الجمل + المؤثرات المتوفرة + موسيقى بـ ducking، و`<T.Subtitles />` ترجمة عمودية. **استخدمه لكل شورت جديد** (شورت الطيور له نسخته الخاصة القديمة `whyBirds/track.tsx`).
- نمط الشورت: `track.ts` + `ScenesA/B.tsx` (كل مشهد `({t, f})` بالزمن العام) + `Short.tsx` (قائمة المشاهد بتداخل 0.3ث + `FilmLook` + الترجمة + الصوت) + تسجيله في `Root.tsx` بأبعاد 1080×1920.

### شورت السور — `src/episodes/whyWall/`
- الصوت: `narrator/scripts/wall_manifest.json` ← `joan_audio.py --manifest … --public studio/public/whywall --index studio/src/episodes/whyWall/audio.json` (سرعة +12%).
- المشاهد: الافتتاح (سور على ٣ سلاسل جبال بعمق وضباب فجر) ← فرسان السهوب يغيرون على قرية ← خريطة شرق آسيا: أسوار الممالك المتحاربة ثم إمبراطورية تشين والسور الموحّد الذهبي + ختم + الإمبراطور ← أبراج الإشارة تشتعل متتابعة صعوداً ليلاً ثم دخان نهاراً ← بوابة حصن على طريق الحرير وقافلة جمال وضرائب ← بناء أسرة مينغ بالطوب والحجر وصبّ حساء الأرز في الملاط ← الختام عند الغروب.
- الأصول الجديدة (`assets.tsx`): `Horse` (خبب بساقين بمفصلين، الركبة الأمامية للخلف، عرف وذيل وغبار، فارس بين الأرجل البعيدة والجسم)، `Camel` (بجرس)، `WallRidge` (سور يتبع دالة خط القمة بشرفات وممشى وأبراج)، `Watchtower`، `FortGate` (بوابة + برج بسقفين)، `PagodaRoof`، `MountainBand`، `SteppeGrass`. لوحة: `WallAssetSheet`.
- قبعات جديدة في `Person`: `mianguan` (تاج الإمبراطور بخيوط الخرز)، `mingHelmet`، `nomadFur`، `strawHat`. شخصيات: `qinShiHuang` (تاريخية)، أدوار `steppeRider`، `mingSoldier`، `chineseFarmer`، `wallBuilder`.
- **الهوك ثلاثي الأبعاد `Wall3D.tsx` (أول ~٤ث):** ممشى السور مجسّم حقيقي في CSS 3D: أرضية بلاط (`rotateX(90deg)` من حافتها العليا) وحاجزان بشرفات (`rotateY(90deg)` من حافتهما اليسرى) مقسّمة لقطع 300px، وبرج بوابة بقوس، وبرج نهاية، والجنود والرايات لوحات قائمة على أعماق z (بلا تعويض حجم فتكبر بالمنظور الحقيقي). الكاميرا تطير z من 0 إلى ~6100 (تعبر القوس عند ~60٪) ثم ترتفع وتميل للأسفل، والمشهد البانورامي يكمل بعدها. **قاعدة:** أخفِ أي قطعة حين `zNear + cam.z > P − هامش` (`visible()`) — CSS 3D يشوّه الأسطح التي تخترق مستوى الكاميرا. الخلفية البعيدة في `VStage` منفصلة بـ `cam.z × 0.02` حتى لا تُعبَر. **وكل لوحة قائمة (`Stand`) يجب أن تكون بحدود ضيقة على محتواها ولا تعبر الحاجزين ولا تنزل تحت الأرضية** — لوحة بعرض الكادر تتقاطع مع الحاجزين فيقطّع المتصفح الجنود بخطوط رأسية (حدث فعلاً وأصلحناه)؛ والواجهات العريضة (البوابة) تُقسم لقطع: يسار الممشى، فوقه، يمينه. ينفع نقله لأي مشهد «طيران بين عناصر» (ممر، شارع، صفوف جنود).
- الخريطة `chinaMap.tsx`: إسقاط بسيط lon 95–132 / lat 22–50 بيابسة Natural Earth، `STATE_WALLS` و`QIN_WALL` و`QIN_EMPIRE` **تقريبية مبسّطة** للعرض.
- المؤثرات (CC0، `public/whywall/sfx/CREDITS.md`) والموسيقى `MUSIC.karst` (قوجنغ «Karst mountains» — neolein، CC0). المؤثرات ≈ ٩–١٦ dB تحت الصوت (≈٧ في لحظة الغارة).
- حقائق النص: المجموع الكلي لكل الأسوار ≈ ٢١ ألف كم (المسح الرسمي الصيني ٢٠١٢)، جزء مينغ ≈ ٨٨٥٠ كم، ملاط الأرز اللزج ثابت بدراسة ٢٠١٠، أبراج الإشارة: نار ليلاً ودخان نهاراً.

## ١٢. إضافة حلقة/مشهد جديد — الخطوات

1. اكتب النص في `narrator/scripts/<name>.txt` (§٥).
2. ولّد الصوت + SRT إلى `studio/public/`، حوّل SRT إلى `cues.json`، أعد تسمية الصوت (أو اجعل `Episode` يقبل اسم الملف كـ prop إن تعددت الحلقات).
3. ولّد `drone.wav` بالمدة الصحيحة، وأضف **موسيقى خلفية** بـ `BackgroundMusic` (§١١.٩) — إلزامي.
4. لكل جملة/فكرة لقطة في `src/shots/ShotN*.tsx`:
   - اختر/أنشئ `Palette`.
   - `Sky` ← `Stage cam={camAt(...)}` ← ٦–٨ `Layer` بأعماق متدرجة ← `ColorGrade`.
   - أعد استخدام `CityEpic`، `Ridge`، `Person`، `Ship`، `Campfire`... قبل رسم جديد.
5. أنشئ مجلد `src/episodes/<name>/` على نمط `suez1956`: `Episode.tsx` يعرّف قائمة اللقطات والمدة ويستدعي `<EpisodeBase shots cues voice="<name>/voice.mp3" drone="<name>/drone.wav" />`، وضع الصوت في `public/<name>/`. ثم سجّل `<Composition id=... />` جديدة في `Root.tsx`.
6. `npx tsc --noEmit -p .` ← لقطات `still` ← تصيير كامل.

---

## ١٣. مشاكل معروفة / أعمال مقترحة

- أشجار السرو في `Shot3Haul` (طبقة d=1100) ما زالت تبدو كأشواك — تحتاج شكلاً أعرض أو لوناً أفتح.
- في `Shot1Night` حواف الضوء (rim) لأشجار المدينة تظهر كخطوط رفيعة لأن الشجرة بلون قريب من الخلفية.
- `props.tsx` يحوي مكونات أقدم (`Skyline`، `SeaWall`، `Torch`، `Glow`) حلّت محلها `CityEpic`، `Battlement`، `TorchFX`، `Halo` — استخدم الجديدة.
- `narrator/render.js` + `narrator/scene/ships-overland.html` = النسخة الأولى (Canvas 2D + Playwright + ffmpeg). غير مستخدمة في الإنتاج الحالي.
- **البنود المتبقية (بالترتيب المتفق عليه — ناقش كل بند مع صاحب المشروع قبل التنفيذ):**
  - البند ٦ (الحوار): منفَّذ لكن **موقوف** — لا يُستخدم إلا بعد سؤال صاحب المشروع (سيسجّل الأصوات بنفسه).
  - البند ٧: رموز المشاعر وخطوط السرعة (❗ ❓ 💧 ✨، خطوط سرعة للجري، خطوط صدمة). موجود منها: 💢، العرق، البخار.
  - البند ١٠: نسخة Shorts عمودية 9:16 — **مؤجلة بطلب صاحب المشروع**. الفكرة المبدئية: `EpisodeBase vertical` يكبّر الكادر ×1.78 ويقص عرض 1080 حول `focus` لكل لقطة (مفاتيح [ث، x، تكبير])، وتكبير أقل مع خلفية مموهة للنصوص الطويلة، وترجمة عند y≈1180 بعيداً عن أزرار يوتيوب.
  - مراجعة الحلقتين القديمتين ونقلهما للنظام الجديد (السكريبت، المكتبات، الإضاءة، الصوت) — حين يقرر صاحب المشروع.
  - فصل القبعة لجزء أمامي/خلفي.
- **جان دارك — معلّق:**
  - التزامن: أحداث كثيرة تسبق كلماتها (أمثلة: «أقاربه الطموحون» المشهد ٤ بـ ٧ث، ختم «المجنون» ٣٫٦ث، القصر في المشهد ٣ ٣٫٨ث، السفن في المشهد ٥ ٣٫٥ث، دومريمي وظهور جان في المشهد ٩). الحل: ربطها بـ `words[].t` في `audio.json`.
  - علم إنجلترا في `characters/items.tsx` (`flagEngland`) مرسوم صليباً أبيض على أحمر (علم الدنمارك) — الصحيح أحمر على أبيض.
  - دقة تاريخية: المشهد ٣ يمثّل ملكي ١٣٣٧ بوجهي هنري الخامس وشارل السابع (الصحيح إدوارد الثالث وفيليب السادس)؛ ودوق بورغوندي في بداية الحرب الأهلية كان يوحنا الجسور لا فيليب الطيب.
- **قيود:** لا تصيير فيديو كامل إلا بطلب صريح. للمراجعة: لقطات `still` ولوحات، وللصوت `--codec=mp3`.
- تحسينات مقترحة: موسيقى خلفية حقيقية مرخّصة، مكتبة شخصيات أكبر، جعل `Episode` عاماً يقبل (صوت، cues، لقطات) كـ props.

---

## ١٤. سجل ما أُنجز (بالترتيب)

1. اختيار edge-tts لتوليد صوت فصيح مجاني؛ عيّنات بخمسة أصوات؛ المعتمد `ar-SA-HamedNeural`.
2. `narrator/narrate.py`: نص → MP3 + SRT (حدود الجمل `SentenceBoundary`).
3. مشهد ٣٠ ثانية أول بـ HTML5 Canvas + Playwright + ffmpeg (`narrator/render.js`) بخط Amiri.
4. إعادة البناء بـ Remotion 4 في `studio/`: محرك 2.5D (طبقات parallax في CSS 3D، كاميرا، FOV، dolly zoom) + شخصيات كرتونية أصلية بتعابير ووضعيات.
5. تمريرة فنية ملحمية: لوحات ألوان لكل لقطة، atmospheric perspective، bloom حقيقي، شرر، دخان، ذرات، ضباب، سحب مرسومة، أشعة شمس، color grading، مدينة ملحمية، ومعسكر بالمدفع والرايات، وإصلاح ترتيب العناصر حسب العمق.
6. الحلقة ٢ «تأميم قناة السويس»: هيكل `EpisodeBase` العام، مجلد `episodes/`، توسيع `Person` (شعر، شارب، بدلة، زي عسكري، كاب ضابط، تعابير speak/shout، أوضاع fist/wave/podium)، حشود ضخمة خفيفة، مبنى البورصة، الإسكندرية وقايتباي، كشافات، مبنى شركة القناة، بواخر، سيارات خمسينية، راديو وموجات بث، علم مصر ١٩٥٣، قصاصات احتفالية، وكلمة السر «فرديناند دي ليسبس» على الشاشة.
7. حركة الشخصيات (مشي/جري/تمثيل)، الاتجاهات الخمسة والالتفات، سكريبت الحركة بمزامنة كلمات التعليق، مكتبة الشخصيات، مكتبة المباني والخلفيات (9 × 4 أوقات)، الأشياء في الأيدي، ترتيب الرسم بالعمق.
8. إضاءة الشخصيات بألوان المشهد (البند ٨)، أوامر الكاميرا في السكريبت، المؤثرات الصوتية المركّبة + الخطوات التلقائية + الصوت المحيطي (البند ٩)، الحوار: أصوات لكل شخصية + فم متزامن + فقاعات (البند ٦).
9. حلقة جان دارك (٩ مشاهد): صوت لكل جملة بتوقيت كلمات، خرائط أوروبا الحقيقية، رموز كوميدية، شخصيات حرب المائة عام؛ ثم نقل المشاهد التسعة كلها إلى 2.5D كامل (§١١.٧): طاولة حرب بأرض مجسّمة وقطع لعب، أرضيات وجدران بمنظور حقيقي، كاتدرائية وقاعة قصر ومسرح مخملي وغرفة حجرية، قناة إنجليزية بعمق، مجسّم حصار أورليان، وخامات مولّدة بدل الفلاتر.
10. شورت «ليه ولماذا؟ — لماذا تهاجر الطيور؟» (عمودي، ٥٩٫٨ث): محرك 2.5D عمودي، شخصية الطائر الكرتونية (٤ أنواع + فرخ)، كرة أرضية بإسقاط حقيقي ويابسة Natural Earth، مسار الخرشنة القطبية مع عدّاد، بوصلة داخلية، مواضع مؤثرات حقيقية تنتظر الملفات.
11. شورت «لماذا بُني سور الصين العظيم؟» (عمودي، ٥٧٫٩ث) + نقل أدوات الشورتس إلى `src/shorts/` + `makeTrack` العام + قاعدة الجودة الافتراضية + موسيقى قوجنغ.
