# استوديو الحلقات (Remotion · 2.5D)

مشاهد تاريخية بطبقات parallax حقيقية في مساحة CSS 3D، وكاميرا متحركة، وزاوية رؤية (FOV) قابلة للتحريك.

```bash
cd studio
npm install
npm run studio                       # معاينة تفاعلية بخط زمني
npx remotion render src/index.ts ShipsOverland ../output/ships-overland-2.5d.mp4
```
إن لم يستطع Remotion تحميل متصفحه، اضبط `REMOTION_BROWSER` على مسار Chrome/Chromium headless.

## البنية
- `src/lib/stage.tsx` — المحرك: `Stage` (الكاميرا + المنظور)، `Layer d={عمق}`، `camAt` لاستيفاء مفاتيح الكاميرا.
- `src/characters/Person.tsx` — الشخصيات (تعابير: smug, shock, think, strain, idea… / أوضاع: cross, chin, point, pull…).
- `src/lib/props.tsx` — سفن، أفق مدينة، أسوار، مشاعل، خيام، ماء، نجوم.
- `src/shots/` — اللقطات، كل لقطة ٧–٨ طبقات.
- `src/cues.json` — توقيت الجمل من edge-tts (`narrator/narrate.py`).

## كيف يعمل الـ 2.5D
كل `Layer` توضع على عمق `d` وتُكبَّر تعويضياً `(P+d)/P` لتبدو بحجمها المرسوم عند الكاميرا المرجعية.
عند تحريك الكاميرا تتحرك الطبقات القريبة أسرع من البعيدة تلقائياً بفعل المنظور.
اللقطة الأخيرة تستخدم Dolly Zoom: الكاميرا تقترب وتتسع زاوية الرؤية معاً فيثبت حجم الحارس وتتمدد الخلفية.
