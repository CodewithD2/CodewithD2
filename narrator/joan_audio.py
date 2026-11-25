#!/usr/bin/env python3
"""مولّد صوت حلقة جان دارك — مشهد بمشهد (edge-tts + توقيت كل كلمة WordBoundary).
يقرأ narrator/scripts/joan_manifest.json ويولّد المقاطع الناقصة فقط (أو --force لمقطع محدد)
إلى studio/public/joan/<id>.mp3 ويحفظ التوقيت والمدد في studio/src/episodes/joanOfArc/audio.json.
"""
import argparse, asyncio, hashlib, json, os, shutil, subprocess
import edge_tts

TICKS = 10_000_000


def proxy():
    return os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")


def text_hash(item):
    v = item["voice"]
    s = f"{v['name']}|{v.get('rate', '-2%')}|{v.get('pitch', '+0Hz')}|{item['text'].strip()}"
    return hashlib.sha1(s.encode("utf-8")).hexdigest()[:12]


def mp3_duration(path, words):
    if shutil.which("ffprobe"):
        try:
            out = subprocess.check_output(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                stderr=subprocess.DEVNULL,
            ).decode().strip()
            return round(float(out), 3)
        except Exception:
            pass
    # احتياطي دقيق من ملف MP3 نفسه (24kHz mono 48kbps من edge-tts) أو آخر كلمة
    if words:
        last = words[-1]
        return round(last["t"] + last["d"] + 0.18, 3)
    return round(os.path.getsize(path) / 6000.0, 3)


async def gen_one(item, out_dir):
    v = item["voice"]
    path = os.path.join(out_dir, f"{item['id']}.mp3")
    words = []
    for boundary in ("WordBoundary", "SentenceBoundary"):
        words = []
        try:
            comm = edge_tts.Communicate(
                item["text"],
                v["name"],
                rate=v.get("rate") or "+0%",
                pitch=v.get("pitch") or "+0Hz",
                boundary=boundary,
                proxy=proxy(),
            )
            with open(path, "wb") as f:
                async for ch in comm.stream():
                    if ch["type"] == "audio":
                        f.write(ch["data"])
                    elif ch["type"] == "WordBoundary":
                        words.append({
                            "t": round(ch["offset"] / TICKS, 3),
                            "d": round(ch["duration"] / TICKS, 3),
                            "text": ch["text"],
                        })
            break
        except edge_tts.exceptions.NoAudioReceived:
            if boundary == "SentenceBoundary":
                raise
    dur = mp3_duration(path, words)
    if not words:
        # تقدير توقيت الكلمات لحركة الفم عند عدم توفر WordBoundary
        raw_words = [w for w in item["text"].strip().split() if w]
        total_chars = sum(max(1, len(w)) for w in raw_words) or 1
        cur = 0.08
        usable = max(0.3, dur - 0.16)
        for w in raw_words:
            wd = usable * (max(1, len(w)) / total_chars)
            words.append({"t": round(cur, 3), "d": round(max(0.08, wd - 0.03), 3), "text": w})
            cur += wd
    return {
        "dur": dur,
        "hash": text_hash(item),
        "text": item["text"],
        "display": item.get("display") or item["text"],
        "speaker": item.get("speaker") or "narrator",
        "voice": v["name"],
        "words": words,
    }


async def main(a):
    manifest = json.load(open(a.manifest, encoding="utf-8"))
    os.makedirs(a.public, exist_ok=True)
    os.makedirs(os.path.dirname(a.index), exist_ok=True)
    index = json.load(open(a.index, encoding="utf-8")) if os.path.exists(a.index) else {}

    for it in manifest:
        if a.scene and not it["id"].startswith(a.scene):
            continue
        h = text_hash(it)
        mp3_path = os.path.join(a.public, f"{it['id']}.mp3")
        if not a.force and it["id"] in index and index[it["id"]].get("hash") == h and os.path.exists(mp3_path):
            print(f"  = {it['id']:16s} (cached {index[it['id']]['dur']:.2f}s)")
            continue
        info = await gen_one(it, a.public)
        index[it["id"]] = info
        print(f"  + {it['id']:16s} {info['dur']:5.2f}s  [{info['voice']}]  {it['text'][:60]}")
        with open(a.index, "w", encoding="utf-8") as f:
            json.dump(index, f, ensure_ascii=False, indent=2, sort_keys=True)


if __name__ == "__main__":
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", default=os.path.join(root, "narrator", "scripts", "joan_manifest.json"))
    ap.add_argument("--public", default=os.path.join(root, "studio", "public", "joan"))
    ap.add_argument("--index", default=os.path.join(root, "studio", "src", "episodes", "joanOfArc", "audio.json"))
    ap.add_argument("--scene", help="توليد مقاطع مشهد محدد فقط (مثل s01)")
    ap.add_argument("--force", action="store_true")
    asyncio.run(main(ap.parse_args()))
