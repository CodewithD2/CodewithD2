#!/usr/bin/env python3
"""يولّد أصوات جمل الحوار (edge-tts) + توقيت كل كلمة.
يُستدعى من `npm run dialogue` (studio/scripts/dialogue.mjs) بقائمة الجمل الناقصة:
  python narrator/dialogue.py manifest.json --public studio/public/dlg --index studio/src/dialogue/clips.json
كل جملة: {id, text, voice: {name, rate?, pitch?}} → public/dlg/<id>.mp3 و clips.json[id] = {dur, words}.
"""
import argparse, asyncio, json, os, subprocess
import edge_tts

TICKS = 10_000_000


def proxy():
    return os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")


async def gen(item, out_dir):
    v = item["voice"]
    comm = edge_tts.Communicate(item["text"], v["name"], rate=v.get("rate") or "-5%", pitch=v.get("pitch") or "+0Hz", boundary="WordBoundary", proxy=proxy())
    path = os.path.join(out_dir, item["id"] + ".mp3")
    words = []
    with open(path, "wb") as f:
        async for ch in comm.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({"t": round(ch["offset"] / TICKS, 3), "d": round(ch["duration"] / TICKS, 3), "text": ch["text"]})
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).decode().strip())
    return {"dur": round(dur, 3), "words": words}


async def main(a):
    items = json.load(open(a.manifest, encoding="utf-8"))
    os.makedirs(a.public, exist_ok=True)
    index = json.load(open(a.index, encoding="utf-8")) if os.path.exists(a.index) else {}
    for it in items:
        info = await gen(it, a.public)
        index[it["id"]] = info
        print(f"  ✓ {it['id']}  {info['dur']:.2f}s  {it['voice']['name']}: {it['text']}")
        # حفظ بعد كل جملة حتى لا يضيع شيء عند انقطاع الشبكة
        with open(a.index, "w", encoding="utf-8") as f:
            json.dump(index, f, ensure_ascii=False, indent=1, sort_keys=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("manifest")
    ap.add_argument("--public", required=True)
    ap.add_argument("--index", required=True)
    asyncio.run(main(ap.parse_args()))
