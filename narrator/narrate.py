#!/usr/bin/env python3
"""تحويل نص حلقة تاريخية إلى تعليق صوتي بالفصحى (MP3) وملف ترجمة (SRT).

الاستخدام:
    python narrator/narrate.py narrator/scripts/example.txt
    python narrator/narrate.py script.txt --voice ar-EG-ShakirNeural --rate -10%
    python narrator/narrate.py --list-voices
"""
import argparse
import asyncio
import os
import re
from pathlib import Path

import edge_tts

# إعدادات مناسبة للسرد التاريخي: إيقاع أهدأ قليلاً ونبرة أعمق
DEFAULT_VOICE = "ar-SA-HamedNeural"
DEFAULT_RATE = "-8%"
DEFAULT_PITCH = "-4Hz"


def proxy():
    return os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")


def clean(text: str) -> str:
    # أسطر تبدأ بـ # ملاحظات للمونتاج ولا تُقرأ
    lines = [l for l in text.splitlines() if not l.lstrip().startswith("#")]
    text = "\n".join(lines)
    return re.sub(r"[ \t]+", " ", text).strip()


async def narrate(src: Path, out_dir: Path, voice: str, rate: str, pitch: str):
    text = clean(src.read_text(encoding="utf-8"))
    out_dir.mkdir(parents=True, exist_ok=True)
    mp3 = out_dir / f"{src.stem}.mp3"
    srt = out_dir / f"{src.stem}.srt"

    comm = edge_tts.Communicate(
        text, voice, rate=rate, pitch=pitch,
        boundary="SentenceBoundary", proxy=proxy(),
    )
    sub = edge_tts.SubMaker()
    with mp3.open("wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
                sub.feed(chunk)
    srt.write_text(sub.get_srt(), encoding="utf-8")
    print(f"✔ {mp3}\n✔ {srt}")


async def list_voices():
    for v in await edge_tts.list_voices(proxy=proxy()):
        if v["Locale"].startswith("ar-"):
            print(f'{v["ShortName"]:<28} {v["Gender"]}')


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("script", nargs="?", type=Path, help="ملف نص الحلقة (.txt)")
    p.add_argument("-o", "--out", type=Path, default=Path("output"), help="مجلد الإخراج")
    p.add_argument("--voice", default=DEFAULT_VOICE)
    p.add_argument("--rate", default=DEFAULT_RATE, help="مثل -10%% أو +5%%")
    p.add_argument("--pitch", default=DEFAULT_PITCH, help="مثل -5Hz أو +0Hz")
    p.add_argument("--list-voices", action="store_true", help="عرض الأصوات العربية")
    a = p.parse_args()

    if a.list_voices:
        asyncio.run(list_voices())
    elif a.script:
        asyncio.run(narrate(a.script, a.out, a.voice, a.rate, a.pitch))
    else:
        p.print_help()


if __name__ == "__main__":
    main()
