# الراوي — تعليق صوتي بالفصحى لقناة التاريخ

يحوّل نص الحلقة إلى ملف صوتي (MP3) وملف ترجمة (SRT) جاهزين للمونتاج، باستخدام [edge-tts](https://github.com/rany2/edge-tts).

## التثبيت
```bash
pip install -r narrator/requirements.txt
```

## الاستخدام
```bash
python narrator/narrate.py narrator/scripts/example.txt
```
الملفات تُحفظ في مجلد `output/`.

خيارات:
- `--voice`: الصوت (الافتراضي `ar-SA-HamedNeural`). لعرض كل الأصوات: `--list-voices`
- `--rate`: السرعة، مثل `-10%`
- `--pitch`: النبرة، مثل `-5Hz`

## كتابة النص
- كل فقرة في سطر أو أكثر، واترك سطراً فارغاً بين المشاهد.
- الأسطر التي تبدأ بـ `#` ملاحظات للمونتاج ولا تُقرأ.
- شكّل الكلمات الملتبسة أو أسماء الأعلام (مثل: مُحَمَّدٌ الفاتِح) لضبط النطق.
- اكتب الأرقام والتواريخ بالحروف لنطق أدق.

## تحويل مشهد إلى فيديو
كل مشهد صفحة HTML ترسم الصورة على canvas بدلالة الزمن (`narrator/scene/`). افتحها في المتصفح لمعاينتها مباشرة.

```bash
python narrator/narrate.py narrator/scripts/ships-overland.txt --rate=-5%
node narrator/render.js narrator/scene/ships-overland.html output/ships-overland.mp3 output/ships-overland.srt output/ships-overland.mp4
```
يتطلب Node مع Playwright و ffmpeg. الخيار `--preview 3,15,25` يحفظ لقطات ثابتة للمراجعة بدل الفيديو.

خط العناوين والترجمة: أميري (رخصة SIL OFL).
