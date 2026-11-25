#!/usr/bin/env python3
"""مولّد المؤثرات الصوتية — كلها مُركّبة رياضياً (بلا حقوق) ونتيجتها ثابتة (seed).
الاستخدام:  python narrator/sfx_synth.py  [-o studio/public/sfx]
"""
import argparse, os, wave
import numpy as np

SR = 44100
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(SR * d)) / SR


def noise(d):
    return rng.standard_normal(int(SR * d))


def lowpass(x, fc):
    # مرشح بسيط أحادي القطب مكرر مرتين
    a = np.exp(-2 * np.pi * fc / SR)
    for _ in range(2):
        y = np.empty_like(x); acc = 0.0
        for i, v in enumerate(x):
            acc = (1 - a) * v + a * acc; y[i] = acc
        x = y
    return x


def lp_fast(x, fc):
    """مرشح تمرير منخفض بالـ FFT (أسرع للأصوات الطويلة)"""
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x))


def bp_fast(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (1 / (1 + (f / hi) ** 4)) * (1 - 1 / (1 + (f / lo) ** 4))
    return np.fft.irfft(X, len(x))


def env(d, a, r, shape=3.0):
    t = t_(d)
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape / max(r, 1e-4))
    return e


def norm(x, peak=0.8):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def loopable(x, fade=0.5):
    """يجعل الصوت يتكرر بلا قطع: يمزج النهاية في البداية"""
    n = int(SR * fade)
    head, body, tail = x[:n], x[n:-n] if n else x, x[-n:]
    w = np.linspace(0, 1, n)
    return np.concatenate([tail * (1 - w) + head * w, body])


def save(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype('<i2').tobytes())


def step(heavy=1.0):
    d = 0.22
    thump = np.sin(2 * np.pi * (70 + 40 * np.exp(-t_(d) * 30)) * t_(d)) * env(d, 0.003, 0.06, 4)
    scuff = bp_fast(noise(d), 300, 2500) * env(d, 0.004, 0.05, 5) * 0.5
    return norm(thump * heavy + scuff, 0.7)


def make(out):
    S = {}
    S['step'] = step(1.0)
    S['step2'] = norm(step(0.8) * 0.95, 0.6)
    d = 0.18
    S['run'] = norm(np.sin(2 * np.pi * 90 * t_(d)) * env(d, 0.002, 0.05, 5) + bp_fast(noise(d), 500, 4000) * env(d, 0.002, 0.04, 5) * 0.8, 0.75)
    d = 0.35
    S['land'] = norm(np.sin(2 * np.pi * (55 + 60 * np.exp(-t_(d) * 20)) * t_(d)) * env(d, 0.003, 0.12, 4) + bp_fast(noise(d), 200, 1800) * env(d, 0.003, 0.1, 5) * 0.6, 0.8)
    # ضربة سيف: هواء يعبر بتردد صاعد ثم هابط
    d = 0.45; t = t_(d)
    sweep = np.exp(-((t - 0.18) / 0.08) ** 2)
    S['whoosh'] = norm(bp_fast(noise(d), 400, 3500) * sweep, 0.7)
    # ارتطام معدن: ترددات غير متناغمة تتلاشى
    d = 1.4; t = t_(d)
    partials = [(523, 1), (1187, 0.6), (1863, 0.45), (2797, 0.3), (3951, 0.2)]
    ring = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * (3 + f / 900)) for f, a in partials)
    S['clang'] = norm(ring + bp_fast(noise(d), 2000, 8000) * env(d, 0.001, 0.02, 6) * 2, 0.8)
    # بوب/ظهور
    d = 0.15; t = t_(d)
    S['pop'] = norm(np.sin(2 * np.pi * (300 + 900 * t / d) * t) * env(d, 0.002, 0.08, 4), 0.6)
    # طلقة/مدفع بعيد
    d = 2.5; t = t_(d)
    S['boom'] = norm(lp_fast(noise(d), 180) * env(d, 0.004, 0.9, 3) + np.sin(2 * np.pi * 42 * t) * env(d, 0.004, 0.6, 3), 0.9)

    # ---- مؤثرات كوميدية وتاريخية (حلقات العصور الوسطى) ----
    # طبول حرب متسارعة
    d = 1.6; t = t_(d); dr = np.zeros_like(t)
    beat_times = [0.0, 0.28, 0.52, 0.72, 0.89, 1.04, 1.17, 1.28, 1.38, 1.46, 1.53]
    for bt in beat_times:
        i0 = int(bt * SR); blen = min(int(0.18 * SR), len(dr) - i0)
        if blen > 0:
            tb = np.arange(blen) / SR
            hit = np.sin(2 * np.pi * (88 + 55 * np.exp(-tb * 28)) * tb) * np.exp(-tb * 18) + bp_fast(noise(blen / SR), 180, 900) * np.exp(-tb * 24) * 0.4
            dr[i0:i0 + blen] += hit
    S['drumroll'] = norm(dr, 0.85)
    # توقف مفاجئ (Record Scratch)
    d = 0.45; t = t_(d)
    f_sc = 1800 * np.exp(-t * 6.5) + 140
    ph = 2 * np.pi * np.cumsum(f_sc) / SR
    S['scratch'] = norm((np.sin(ph) + 0.5 * np.sin(2.3 * ph) + bp_fast(noise(d), 1200, 5000) * 0.45) * env(d, 0.005, 0.16, 3), 0.75)
    # جرس خطأ (Buzzer)
    d = 0.65; t = t_(d)
    bz = np.sign(np.sin(2 * np.pi * 118 * t)) + 0.6 * np.sign(np.sin(2 * np.pi * 124 * t))
    S['buzzer'] = norm(lp_fast(bz, 1200) * env(d, 0.008, 0.45, 2.5), 0.65)
    # ثلاث طرقات باب خشبي (طق.. طق.. طق)
    d = 0.9; t = t_(d); kn = np.zeros_like(t)
    for bt in [0.04, 0.30, 0.56]:
        i0 = int(bt * SR); blen = min(int(0.14 * SR), len(kn) - i0)
        tb = np.arange(blen) / SR
        hit = (np.sin(2 * np.pi * 210 * tb) + 0.6 * np.sin(2 * np.pi * 390 * tb)) * np.exp(-tb * 36) + bp_fast(noise(blen / SR), 300, 1600) * np.exp(-tb * 45) * 0.5
        kn[i0:i0 + blen] += hit
    S['knock'] = norm(kn, 0.8)
    # إغلاق باب خشبي ثقيل
    d = 0.55; t = t_(d)
    S['doorSlam'] = norm(np.sin(2 * np.pi * (75 + 80 * np.exp(-t * 32)) * t) * env(d, 0.002, 0.14, 4) + lp_fast(noise(d), 1400) * env(d, 0.002, 0.18, 4) * 0.9, 0.9)
    # تحطم زجاجي خفيف وطريف
    d = 0.75; t = t_(d); gl = np.zeros_like(t)
    for _ in range(28):
        i0 = rng.integers(0, int(0.35 * SR)); blen = min(int(0.28 * SR), len(gl) - i0)
        tb = np.arange(blen) / SR; f0 = rng.uniform(2200, 7600)
        gl[i0:i0 + blen] += np.sin(2 * np.pi * f0 * tb) * np.exp(-tb * rng.uniform(16, 38)) * rng.uniform(0.3, 1.0)
    S['glass'] = norm(gl + bp_fast(noise(d), 3000, 9000) * env(d, 0.002, 0.08, 5) * 0.5, 0.7)
    # مقص شعر (تشك تشك)
    d = 0.42; t = t_(d); sn = np.zeros_like(t)
    for bt in [0.03, 0.21]:
        i0 = int(bt * SR); blen = min(int(0.11 * SR), len(sn) - i0)
        tb = np.arange(blen) / SR
        sn[i0:i0 + blen] += (bp_fast(noise(blen / SR), 2800, 8500) + 0.35 * np.sin(2 * np.pi * 4200 * tb)) * np.exp(-tb * 35)
    S['snip'] = norm(sn, 0.7)
    # بوق بطولي (معركة الرنجة / إعلان)
    d = 1.25; t = t_(d); tr = np.zeros_like(t)
    for st, en, freq in [(0.0, 0.22, 392.0), (0.24, 0.46, 523.25), (0.48, 0.68, 659.25), (0.70, 1.22, 783.99)]:
        m = (t >= st) & (t < en); tm = t[m] - st
        brass = sum((1.0 / k) * np.sin(2 * np.pi * freq * k * tm) for k in range(1, 6))
        tr[m] += brass * np.minimum(1, tm / 0.025) * np.exp(-tm * 1.4)
    S['trumpet'] = norm(lp_fast(tr, 2600), 0.72)
    # ختم موافقة ثقيل
    d = 0.35; t = t_(d)
    S['stamp'] = norm(np.sin(2 * np.pi * (95 + 70 * np.exp(-t * 35)) * t) * env(d, 0.002, 0.09, 5) + bp_fast(noise(d), 250, 2200) * env(d, 0.002, 0.06, 6) * 0.7, 0.85)
    # سقوط فك جماعي كوميدي
    d = 0.55; t = t_(d)
    f_jd = 520 * np.exp(-t * 4.5) + 65
    ph_jd = 2 * np.pi * np.cumsum(f_jd) / SR
    thud = np.sin(2 * np.pi * 68 * np.maximum(0, t - 0.36)) * (t >= 0.36) * np.exp(-np.maximum(0, t - 0.36) * 18) * 1.4
    S['jawDrop'] = norm(np.sin(ph_jd) * env(d, 0.01, 0.35, 2) * 0.6 + thud, 0.78)

    # ---- أصوات ممتدة قابلة للتكرار ----
    L = 8.0; t = t_(L)
    # أمواج: ضوضاء منخفضة تعلو وتهبط كل ~4 ثوانٍ
    swell = 0.35 + 0.65 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 4 - 1.2)) ** 2
    hiss = bp_fast(noise(L), 150, 2200)
    S['waves'] = norm(loopable(hiss * swell + lp_fast(noise(L), 90) * 0.6), 0.6)
    # ريح: ضوضاء بنطاق متحرك
    gust = 0.5 + 0.5 * np.sin(2 * np.pi * t / 5.3) * np.sin(2 * np.pi * t / 2.1 + 1)
    S['wind'] = norm(loopable(bp_fast(noise(L), 250, 900) * (0.4 + 0.6 * gust) + bp_fast(noise(L), 900, 2400) * 0.15 * gust), 0.5)
    # نار: هدير منخفض + طقطقة عشوائية
    crack = np.zeros(int(SR * L))
    for _ in range(140):
        i = rng.integers(0, len(crack) - 2000); n = rng.integers(80, 600)
        crack[i:i + n] += rng.standard_normal(n) * np.exp(-np.arange(n) / (n / 4)) * rng.uniform(0.3, 1)
    S['fire'] = norm(loopable(lp_fast(noise(L), 200) * 0.5 + bp_fast(crack, 1500, 7000)), 0.55)
    # همهمة حشد: أصوات مُشكّلة (formants) كثيرة متداخلة
    mur = np.zeros(int(SR * L))
    for _ in range(40):
        f0 = rng.uniform(95, 230); ph = rng.uniform(0, 6.28)
        rate = rng.uniform(2.5, 5); am = np.clip(np.sin(2 * np.pi * rate * t + ph) + rng.uniform(-0.3, 0.4), 0, None)
        v = np.sign(np.sin(2 * np.pi * f0 * (t + 0.003 * np.sin(2 * np.pi * 0.7 * t + ph))))
        mur += v * am * rng.uniform(0.3, 1)
    mur = bp_fast(mur, 250, 1200) + bp_fast(mur, 1800, 2800) * 0.3
    S['murmur'] = norm(loopable(mur + bp_fast(noise(L), 300, 3000) * 0.4 * np.max(np.abs(mur)) / 3), 0.45)
    # هتاف: همهمة أعلى + "هيييه" صاعد + تصفيق
    L2 = 6.0; t2 = t_(L2)
    ch = np.zeros(int(SR * L2))
    for _ in range(60):
        f0 = rng.uniform(160, 420); st = rng.uniform(0, 2.5); dur = rng.uniform(1.2, 3.2)
        e = np.clip((t2 - st) / 0.15, 0, 1) * np.clip((st + dur - t2) / 0.6, 0, 1)
        vib = np.sin(2 * np.pi * f0 * t2 * (1 + 0.04 * np.minimum(t2 - st, 1)) + 0.02 * np.sin(2 * np.pi * 6 * t2))
        ch += np.sign(vib) * e * rng.uniform(0.3, 1)
    ch = bp_fast(ch, 400, 1600) + bp_fast(ch, 2200, 3400) * 0.4
    clap = np.zeros_like(ch)
    for _ in range(500):
        i = rng.integers(0, len(clap) - 600); clap[i:i + 400] += rng.standard_normal(400) * np.exp(-np.arange(400) / 60)
    clap = bp_fast(clap, 800, 6000)
    master = np.clip(t2 / 0.4, 0, 1) * np.clip((L2 - t2) / 1.8, 0, 1)
    S['cheer'] = norm((norm(ch) + norm(clap) * 0.45 + norm(bp_fast(noise(L2), 300, 4000)) * 0.2) * master, 0.75)

    os.makedirs(out, exist_ok=True)
    for k, v in S.items():
        save(os.path.join(out, f'{k}.wav'), v.astype(np.float64))
        print(f'{k:8s} {len(v) / SR:5.2f}s')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('-o', default=os.path.join(os.path.dirname(__file__), '..', 'studio', 'public', 'sfx'))
    make(ap.parse_args().o)
