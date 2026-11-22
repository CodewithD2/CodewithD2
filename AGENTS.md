# AGENTS.md — دليل العمل على مشروع قناة الفيديوهات التاريخية

> هذا الملف موجّه لأي agent (أو مطوّر) يستلم المشروع. اقرأه كاملاً قبل أي تعديل.
> ملاحظة: `README.md` في جذر المستودع هو ملف بروفايل GitHub الشخصي لصاحب الحساب — **لا تعدّله** ولا علاقة له بالمشروع.

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

المشهد المنجز حتى الآن: **«السفن فوق اليابسة»** (حصار القسطنطينية ١٤٥٣) — ٣١ ثانية، ٤ لقطات.

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
فرع العمل: `claude/inspiring-maxwell-kcpkyq`. آخر محاولات الـ push فشلت بـ **403** لأن تطبيق Claude على GitHub لا يملك صلاحية `Contents: Read & Write` على `CodewithD2/CodewithD2`. نسخة احتياطية كاملة (`output/CodewithD2-work.bundle` و`output/CodewithD2-project.zip`) أُرسلت لصاحب المشروع. إن لم تجد الـ commits على الـ remote، اطلب منه الـ bundle:
```bash
git fetch CodewithD2-work.bundle claude/inspiring-maxwell-kcpkyq:claude/inspiring-maxwell-kcpkyq
```

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
    ├── Episode.tsx         # ترتيب اللقطات (SHOTS)، الانتقالات، الصوت، الترجمة، fade in/out
    ├── Subtitles.tsx       # الترجمة من cues.json + VOICE_DELAY
    ├── cues.json           # توقيت الجمل (ثوانٍ) من SRT
    ├── characters/Person.tsx
    ├── lib/
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
- `expr`: `neutral | smug | shock | think | strain | idea | sleepy | happy`
- `pose`: `stand | cross | chin | point | pull | armsUp | stretch`
- `hat`: `sultan` (عمامة بيضاء + قاووق أحمر) | `vizier` | `byzHelmet` (خوذة بيزنطية + ريشة) | `bork` (قبعة الإنكشارية) | `cap` (عامل) | `none`
- `look=[dx,dy]` اتجاه النظر (−1..1). `jolt` 0..1 قفزة لحظية (استعمل `Math.sin(prog(f,a,a+10)*Math.PI)`). `seed` يغيّر توقيت الرمش والتنفس بين الشخصيات.
- `flip` يعكس الشخصية أفقياً. `rot` لميلها على منحدر.
- الشخصيات المعتمدة في المشهد: السلطان محمد الثاني (robe `#b3262c`، hat `sultan`، beard `#3a2416`)، الوزير (`#2f5f8f`، `vizier`، beard رمادي)، الحارس البيزنطي (`#7a2430`، `byzHelmet`)، العمال (`cap`، ألوان متنوعة، `strain`+`pull`)، الضابط الإنكشاري (`#2c5f8a`، `bork`).

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

## ١٢. إضافة حلقة/مشهد جديد — الخطوات

1. اكتب النص في `narrator/scripts/<name>.txt` (§٥).
2. ولّد الصوت + SRT إلى `studio/public/`، حوّل SRT إلى `cues.json`، أعد تسمية الصوت (أو اجعل `Episode` يقبل اسم الملف كـ prop إن تعددت الحلقات).
3. ولّد `drone.wav` بالمدة الصحيحة.
4. لكل جملة/فكرة لقطة في `src/shots/ShotN*.tsx`:
   - اختر/أنشئ `Palette`.
   - `Sky` ← `Stage cam={camAt(...)}` ← ٦–٨ `Layer` بأعماق متدرجة ← `ColorGrade`.
   - أعد استخدام `CityEpic`، `Ridge`، `Person`، `Ship`، `Campfire`... قبل رسم جديد.
5. حدّث `SHOTS` و`DURATION_S` في `Episode.tsx` (وأنشئ Composition جديدة في `Root.tsx` إن أردت الإبقاء على القديمة).
6. `npx tsc --noEmit -p .` ← لقطات `still` ← تصيير كامل.

---

## ١٣. مشاكل معروفة / أعمال مقترحة

- أشجار السرو في `Shot3Haul` (طبقة d=1100) ما زالت تبدو كأشواك — تحتاج شكلاً أعرض أو لوناً أفتح.
- في `Shot1Night` حواف الضوء (rim) لأشجار المدينة تظهر كخطوط رفيعة لأن الشجرة بلون قريب من الخلفية.
- `props.tsx` يحوي مكونات أقدم (`Skyline`، `SeaWall`، `Torch`، `Glow`) حلّت محلها `CityEpic`، `Battlement`، `TorchFX`، `Halo` — استخدم الجديدة.
- `narrator/render.js` + `narrator/scene/ships-overland.html` = النسخة الأولى (Canvas 2D + Playwright + ffmpeg). غير مستخدمة في الإنتاج الحالي.
- تحسينات مقترحة: نسخة عمودية 9:16 لـ Shorts (Composition ثانية بأبعاد 1080×1920)، موسيقى خلفية حقيقية مرخّصة، مكتبة شخصيات أكبر، جعل `Episode` عاماً يقبل (صوت، cues، لقطات) كـ props.

---

## ١٤. سجل ما أُنجز (بالترتيب)

1. اختيار edge-tts لتوليد صوت فصيح مجاني؛ عيّنات بخمسة أصوات؛ المعتمد `ar-SA-HamedNeural`.
2. `narrator/narrate.py`: نص → MP3 + SRT (حدود الجمل `SentenceBoundary`).
3. مشهد ٣٠ ثانية أول بـ HTML5 Canvas + Playwright + ffmpeg (`narrator/render.js`) بخط Amiri.
4. إعادة البناء بـ Remotion 4 في `studio/`: محرك 2.5D (طبقات parallax في CSS 3D، كاميرا، FOV، dolly zoom) + شخصيات كرتونية أصلية بتعابير ووضعيات.
5. تمريرة فنية ملحمية: لوحات ألوان لكل لقطة، atmospheric perspective، bloom حقيقي، شرر، دخان، ذرات، ضباب، سحب مرسومة، أشعة شمس، color grading، مدينة ملحمية، ومعسكر بالمدفع والرايات، وإصلاح ترتيب العناصر حسب العمق.
