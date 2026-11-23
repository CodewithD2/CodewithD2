import React from 'react';
import {AbsoluteFill} from 'remotion';
import {camAt} from '../../lib/stage';
import {GodRays, Halo, Motes} from '../../lib/fx';
import {DizzyBirds} from '../../lib/comicFx';
import {INK, clamp, easeInOut, easeOutBack, lerp, prog} from '../../lib/util';
import {Person} from '../../characters/Person';
import type {CharLight} from '../../characters/light';
import {extra, look} from '../../cast';
import {Hud, VArt, VLayer, VStage} from '../../shorts/vstage';
import {Grade, hand} from '../../shorts/polish';
import {ChannelBadge, Txt, fade, pop} from '../../shorts/common';
import {FPS} from '../../shorts/track';
import {Camel} from '../whyWall/assets';
import {Bomb, GermSkull, GoldBag, House, Lock, MAIN_ROUTE, PaperScroll, SilkMap, Silkworm, SpiceSack, Sticker, sm} from './assets';
import {S, TOTAL_S, wordAt} from './track';
import type {SceneProps} from './ScenesA';

const F = (s: number) => Math.round(s * FPS);

/** موضع على الطريق الرئيسي (u: 0 الصين → 1 أوروبا) بإحداثيات الكادر */
const routeAt = (u: number): [number, number] => {
  const pts = MAIN_ROUTE.map(sm);
  const seg = Math.min(pts.length - 2, Math.floor(u * (pts.length - 1)));
  const k = u * (pts.length - 1) - seg;
  return [lerp(pts[seg][0], pts[seg + 1][0], k), lerp(pts[seg][1], pts[seg + 1][1], k)];
};

/* ===================== ٦) سر الحرير: دودة القز + إمبراطور غاضب + «حرفياً!» ===================== */
export const SceneSecret: React.FC<SceneProps> = ({t, f}) => {
  const t0 = S('s5_1') - 0.3;
  const t1 = S('s6_1');
  const tSecret = wordAt('s5_1', 'سرا');
  const tReveal = wordAt('s5_1', 'كشفته');
  const tLose = wordAt('s5_1', 'ستفقد');
  const tLit = wordAt('s5_1', 'حرفيا');
  const emp = clamp(prog(t, tLose - 0.15, tLose + 0.15));
  const L: CharLight = {dir: -1, key: '#ffd0a0', shadow: '#3a1a2a', ambient: 0.1, rim: 0.9};
  const cam = hand(camAt(f, [{f: F(t0), z: 0, y: 0}, {f: F(tLose - 0.2), z: 120, y: 0}]), t, 0.6, {at: tLose, amp: 18});
  // قفزة الرأس الكرتونية (نابض) عند «حرفياً»
  const spring = t > tLit ? Math.sin((t - tLit) * 18) * Math.exp(-(t - tLit) * 3) * 60 + clamp((t - tLit) * 6) * 180 : 0;
  return (
    <AbsoluteFill style={{background: emp > 0 ? `radial-gradient(circle at 50% 40%, #ff6a3a 0%, #8a1a1a 70%)` : 'linear-gradient(#bfe0c8 0%, #f2ecd0 100%)'}}>
      {emp < 1 && (
        <VStage cam={cam}>
          <VLayer d={300}>
            <VArt>
              <Halo id="sc-l" cx={540} cy={700} r={600} color="#fffbe0" opacity={0.8} core={0.3} />
              <Silkworm x={540} y={760} s={1.6} t={t} />
              <g transform={`translate(780 420) scale(${pop(t, tSecret - 0.1)})`}>
                <Lock x={0} y={0} s={1.2} />
              </g>
              {/* جاسوس يتسلل */}
              <g opacity={prog(t, tReveal - 0.3, tReveal)}>
                <Person {...extra('silkMerchant', 4)} light={L} x={lerp(-100, 240, easeInOut(prog(t, tReveal - 0.4, tReveal + 0.4)))} y={1260} s={1.15} frame={f} view={28} pose="point" expr="smug" />
              </g>
            </VArt>
          </VLayer>
        </VStage>
      )}
      {emp > 0 && (
        <VStage cam={{...cam, z: lerp(-400, 260, easeOutBack(emp)), fov: lerp(60, 40, emp)}}>
          <VLayer d={600}>
            <VArt>
              <GodRays id="sc-gr" cx={540} cy={700} frame={f} color="#ffd27a" opacity={0.45} />
            </VArt>
          </VLayer>
          <VLayer d={100}>
            <VArt>
              <Person {...extra('chineseEmperor', 0)} light={{dir: 1, key: '#ffb060', shadow: '#2a0a10', ambient: 0.2, rim: 1}} x={540} y={1380} s={2.6} frame={f} expr="angry" act={t > tLose + 0.4 ? 'angry' : undefined} energy={0.9} view={0} />
            </VArt>
          </VLayer>
        </VStage>
      )}
      <Grade g={emp > 0 ? {top: '#ff6a3a', bottom: '#3a0606', opacity: 0.35, light: '#ffd27a', at: [50, 37], strength: 0.3} : {top: '#cfeed8', bottom: '#5a6a3a', opacity: 0.25, light: '#fffbe0', at: [50, 37], strength: 0.25}} />
      <Hud>
        <g transform={`translate(540 250) scale(${pop(t, tSecret - 0.1)})`} opacity={1 - emp}>
          <rect x={-300} y={-80} width={600} height={130} rx={28} fill="#a8322c" stroke={INK} strokeWidth={6} />
          <Txt x={0} y={10} size={76} fill="#ffd23a" stroke="none" sw={0}>
            سرٌّ صيني!
          </Txt>
        </g>
        <g transform={`translate(540 250) scale(${pop(t, tLose - 0.05, 0.35)})`}>
          <Txt x={0} y={0} size={104} fill="#fff" sw={15}>
            ستفقد رأسك..
          </Txt>
        </g>
        {/* «حرفياً!» + رأس كرتوني يقفز على نابض */}
        {t > tLit - 0.1 && (
          <g>
            <g transform={`translate(540 430) scale(${pop(t, tLit - 0.1, 0.3)})`}>
              <Txt x={0} y={0} size={130} fill="#ffd23a" sw={17}>
                حرفياً!
              </Txt>
            </g>
            <g transform={`translate(860 ${1100 - spring})`}>
              <path d={`M 0 ${spring} ${Array.from({length: 8}, (_, i) => `L ${i % 2 ? 26 : -26} ${spring - ((i + 1) * spring) / 8}`).join(' ')}`} stroke="#9aa4b2" strokeWidth={8} fill="none" strokeLinejoin="round" />
              <circle cx={0} cy={0} r={58} fill="#d9a27a" stroke={INK} strokeWidth={6} />
              <ellipse cx={-20} cy={-6} rx={9} ry={12} fill={INK} />
              <ellipse cx={20} cy={-6} rx={9} ry={12} fill={INK} />
              <ellipse cx={0} cy={28} rx={14} ry={10} fill={INK} />
              <DizzyBirds x={0} y={-70} frame={f} r={50} />
            </g>
          </g>
        )}
      </Hud>
    </AbsoluteFill>
  );
};

/* ===================== ٧) ما انتقل عبره: توابل، ورق، بارود… وأوبئة! ===================== */
export const SceneGoods: React.FC<SceneProps> = ({t, f}) => {
  const t0 = S('s6_1') - 0.3;
  const t1 = S('s7_1');
  const items = [
    {at: wordAt('s6_1', 'التوابل'), C: SpiceSack, label: 'توابل'},
    {at: wordAt('s6_1', 'والورق'), C: PaperScroll, label: 'ورق'},
    {at: wordAt('s6_1', 'والبارود'), C: Bomb, label: 'بارود'},
    {at: wordAt('s6_1', 'الأوبئة'), C: GermSkull, label: 'أوبئة!'},
  ];
  const tPlague = items[3].at;
  const plague = clamp(prog(t, tPlague - 0.1, tPlague + 0.3));
  const cam = hand(camAt(f, [{f: F(t0), z: 240, y: -150}, {f: F(t1), z: 360, y: -150}]), t, 0.6, {at: tPlague, amp: 10});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #6a4428 0%, #24140a 75%)'}}>
      <VStage cam={cam}>
        <VLayer d={250}>
          <VArt>
            <rect x={-900} y={-1400} width={2900} height={4800} fill="#4a2e1a" />
            <SilkMap id="gd" draw={1} tint={plague * 0.15}>
              {plague > 0 && <rect x={0} y={0} width={1080} height={1920} fill="#5ad65a" opacity={0.12 * plague * (0.6 + 0.4 * Math.sin(t * 10))} />}
            </SilkMap>
            {items.map((it, i) => {
              const u = clamp(prog(t, it.at - 0.2, it.at + 1.6));
              if (u <= 0) return null;
              const [x, y] = routeAt(u);
              const C = it.C as React.FC<{x: number; y: number; s?: number; t: number}>;
              return (
                <g key={i}>
                  <g transform={`translate(${x} ${y - 70 - Math.abs(Math.sin(u * Math.PI * 4)) * 40}) scale(${easeOutBack(clamp(u * 5))})`}>
                    <C x={0} y={0} s={0.8} t={t} />
                  </g>
                </g>
              );
            })}
          </VArt>
        </VLayer>
      </VStage>
      <Grade g={{top: '#6a4a2a', bottom: '#1a0e06', opacity: 0.35, light: '#ffcf80', at: [50, 35], strength: 0.3}} />
      <Hud>
        {items.map((it, i) => (
          <g key={i} transform={`translate(${200 + i * 228} ${i === 3 ? 1060 : 1060}) scale(${pop(t, it.at - 0.05)})`}>
            <rect x={-100} y={-52} width={200} height={84} rx={20} fill={i === 3 ? '#3a8a2a' : '#fff8e0'} stroke={INK} strokeWidth={5} />
            <Txt x={0} y={4} size={42} fill={i === 3 ? '#fff' : INK} stroke="none" sw={0}>
              {it.label}
            </Txt>
          </g>
        ))}
        <g transform={`translate(540 230) scale(${pop(t, wordAt('s6_1', 'للحظ') - 0.1)})`} opacity={1 - prog(t, tPlague - 0.2, tPlague)}>
          <Txt x={0} y={0} size={86} fill="#fff" sw={12}>
            ويا للحظ السعيد..
          </Txt>
        </g>
        <g transform={`translate(540 240) scale(${pop(t, tPlague, 0.3)})`}>
          <Txt x={0} y={0} size={110} fill="#8fd65a" sw={15}>
            أوبئة أيضاً!
          </Txt>
        </g>
      </Hud>
    </AbsoluteFill>
  );
};

/* ===================== ٨) المفارقة: عالم ألماني اخترع الاسم عام ١٨٧٧ ===================== */
export const SceneName: React.FC<SceneProps> = ({t, f}) => {
  const t0 = S('s7_1') - 0.3;
  const t1 = S('s8_1');
  const tIrony = wordAt('s7_1', 'والمفارقة');
  const tGerman = wordAt('s7_1', 'عالم');
  const tYear = wordAt('s7_1', 'ألف');
  const tSlap = wordAt('s7_1', 'اخترعه');
  const L: CharLight = {dir: -1, key: '#ffe6b0', shadow: '#3a2a1a', ambient: 0.1, rim: 0.8};
  const walk = clamp(prog(t, tGerman - 0.8, tGerman + 0.6));
  const sx = lerp(1260, 800, easeInOut(walk));
  const cam = hand(camAt(f, [{f: F(t0), z: 0, y: -60}, {f: F(t1), z: 160, y: -60}]), t, 0.6, {at: tSlap + 0.15, amp: 12});
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#5a4632 0%, #2a1e14 100%)'}}>
      <VStage cam={cam}>
        <VLayer d={400}>
          <VArt>
            {/* مكتب القرن التاسع عشر: جدار بورق مزخرف */}
            <rect x={-900} y={-1400} width={2900} height={4800} fill="#6a5238" />
            {Array.from({length: 26}, (_, i) => (
              <line key={i} x1={-900 + i * 120} y1={-1400} x2={-900 + i * 120} y2={3400} stroke="#5a4430" strokeWidth={20} />
            ))}
            <Halo id="nm-lamp" cx={200} cy={300} r={700} color="#ffd890" opacity={0.6} core={0.2} />
          </VArt>
        </VLayer>
        <VLayer d={250}>
          <VArt>
            <g opacity={0.92}>
              <SilkMap id="nm" draw={1} tint={0.18} />
            </g>
          </VArt>
        </VLayer>
        <VLayer d={80}>
          <VArt>
            <rect x={-900} y={1260} width={2900} height={800} fill="#3a2614" />
            <Person {...look('richthofen')} light={L} x={sx} y={1300} s={1.35} frame={f} flip motion={walk < 1 ? 'walk' : 'idle'} travel={(1260 - sx) * 1.4} view={walk < 1 ? undefined : 25} pose={t > tSlap - 0.2 && t < tSlap + 0.8 ? 'point' : 'stand'} expr={t > tSlap ? 'smug' : 'neutral'} />
          </VArt>
        </VLayer>
        <VLayer d={-200} blur={1.5}>
          <VArt>
            <Motes id="nm-m" frame={f} n={30} x0={-100} x1={1200} y0={200} y1={1500} color="#ffe0a0" size={3.4} />
          </VArt>
        </VLayer>
      </VStage>
      <Grade g={{top: '#8a6a3a', bottom: '#1a0e06', opacity: 0.4, light: '#ffd890', at: [18, 15], strength: 0.3}} />
      <Hud>
        <g transform={`translate(540 230) scale(${pop(t, tIrony - 0.1)})`} opacity={1 - prog(t, tGerman - 0.3, tGerman)}>
          <Txt x={0} y={0} size={110} fill="#ffd23a" sw={15}>
            المفارقة؟
          </Txt>
        </g>
        <g transform={`translate(540 230) scale(${pop(t, tGerman - 0.1)})`} opacity={1 - prog(t, tSlap + 0.2, tSlap + 0.4)}>
          <rect x={-330} y={-70} width={660} height={130} rx={26} fill="#2a2a34" stroke="#e2b23a" strokeWidth={6} />
          <Txt x={0} y={6} size={52} fill="#f2c23a" stroke="none" sw={0}>
            فرديناند فون ريشتهوفن
          </Txt>
          <Txt x={0} y={46} size={30} fill="#e8dcc0" stroke="none" sw={0}>
            جغرافي ألماني
          </Txt>
        </g>
        <Sticker x={540} y={600} k={clamp(prog(t, tSlap + 0.1, tSlap + 0.35))} text="طريق الحرير" sub={t > tYear - 0.1 ? '١٨٧٧' : undefined} />
      </Hud>
    </AbsoluteFill>
  );
};

/* ===================== ٩) سؤال للمشاهد: تخاطر لتصبح ثرياً؟ ===================== */
export const SceneAsk: React.FC<SceneProps> = ({t, f}) => {
  const t0 = S('s8_1') - 0.3;
  const tAsk = wordAt('s8_1', 'هل');
  const tRich = wordAt('s8_1', 'ثريا');
  const cam = hand(camAt(f, [{f: F(t0), z: 0}, {f: F(TOTAL_S), z: 140}]), t, 0.6);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#2a3a6a 0%, #a85a6a 55%, #ffb87a 100%)'}}>
      <VStage cam={cam}>
        <VLayer d={1500}>
          <VArt>
            <Halo id="ak-sun" cx={540} cy={1000} r={600} color="#ffe0a0" opacity={0.9} core={0.25} />
            <GodRays id="ak-gr" cx={540} cy={1000} frame={f} color="#ffe2b0" opacity={0.25} />
          </VArt>
        </VLayer>
        <VLayer d={200}>
          <VArt>
            <g transform={`translate(290 850) scale(${pop(t, tAsk)})`}>
              <rect x={-230} y={-330} width={460} height={560} rx={36} fill="#fff8e6" stroke={INK} strokeWidth={8} />
              <Camel x={0} y={60} s={0.62} frame={f} walk={0.6} />
              <GoldBag x={150} y={-150} s={0.6} t={t} />
              <Txt x={0} y={180} size={50} fill="#a8322c" stroke="none" sw={0}>
                أخاطر!
              </Txt>
            </g>
            <g transform={`translate(790 850) scale(${pop(t, tAsk + 0.25)})`}>
              <rect x={-230} y={-330} width={460} height={560} rx={36} fill="#fff8e6" stroke={INK} strokeWidth={8} />
              <House x={0} y={40} s={1.2} />
              <Txt x={0} y={180} size={50} fill="#2f5a9a" stroke="none" sw={0}>
                بيتي أأمن
              </Txt>
            </g>
          </VArt>
        </VLayer>
      </VStage>
      <Grade g={{top: '#4a5a9a', bottom: '#3a1a2a', opacity: 0.3, light: '#ffe0a0', at: [50, 52], strength: 0.3}} />
      <Hud>
        <g transform={`translate(540 260) scale(${pop(t, t0 + 0.2)})`}>
          <rect x={-330} y={-80} width={660} height={130} rx={30} fill="#fff" stroke={INK} strokeWidth={6} />
          <path d="M -200 50 L -230 100 L -160 52 Z" fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <Txt x={0} y={10} size={62} fill={INK} stroke="none" sw={0}>
            أخبرني في التعليقات
          </Txt>
        </g>
        <g transform={`translate(540 1195) scale(${pop(t, tRich - 0.1)})`}>
          <Txt x={0} y={0} size={70} fill="#fff" sw={11}>
            وأنت.. ماذا تختار؟
          </Txt>
        </g>
        <ChannelBadge x={540} y={470} s={pop(t, tRich + 0.4, 0.4)} />
      </Hud>
    </AbsoluteFill>
  );
};
