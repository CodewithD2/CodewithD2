import React from 'react';
import {AbsoluteFill} from 'remotion';
import {extra, look, roleBase} from './cast';
import type {Look} from './cast';
import {Held, ITEM_LABEL, ItemId} from './characters/items';
import {Person, Pose, View} from './characters/Person';
import {CastMember, useScene} from './lib/script';

/** لوحات البند ٥: الأشياء في الأيدي */

const Bg: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#f6efe2, #e6d9c4)'}}>
    <svg width={1920} height={1080}>
      <text x={960} y={64} fontFamily="Amiri" fontSize={50} fontWeight={700} textAnchor="middle" fill="#2a2030" direction="rtl">
        {title}
      </text>
      {children}
    </svg>
  </AbsoluteFill>
);
const Label: React.FC<{x: number; y: number; t: string; sub?: string}> = ({x, y, t, sub}) => (
  <g textAnchor="middle">
    <text x={x} y={y} fontFamily="Amiri" fontSize={26} fontWeight={700} fill="#2a2030" direction="rtl">
      {t}
    </text>
    {sub && (
      <text x={x} y={y + 24} fontFamily="DejaVu Sans Mono, monospace" fontSize={15} fill="#7a6a7a">
        {sub}
      </text>
    )}
  </g>
);

/* ---------- ١: كتالوج الأشياء ---------- */
const CATALOG: {item: ItemId; who: Look; pose: Pose; left?: boolean; held?: Held; expr?: 'speak' | 'happy' | 'neutral'}[] = [
  {item: 'kilij', who: roleBase('janissary'), pose: 'raise'},
  {item: 'spatha', who: roleBase('byzGuard'), pose: 'carry'},
  {item: 'spear', who: extra('byzGuard', 2), pose: 'stand'},
  {item: 'shield', who: extra('byzGuard', 3), pose: 'stand', left: true},
  {item: 'bow', who: extra('janissary', 2), pose: 'stand', left: true},
  {item: 'rifle', who: roleBase('egyptOfficer'), pose: 'shoulder'},
  {item: 'scroll', who: look('halilPasha'), pose: 'present'},
  {item: 'paper', who: look('mahmoudYounis'), pose: 'read'},
  {item: 'book', who: extra('woman1950s', 2), pose: 'read'},
  {item: 'newspaper', who: extra('egyptCivilian', 3), pose: 'read', held: {id: 'newspaper', text: 'تأميم القناة'}},
  {item: 'flagEgypt', who: extra('protester', 1), pose: 'raise', expr: 'happy'},
  {item: 'flagOttoman', who: extra('janissary', 4), pose: 'raise'},
  {item: 'flagByz', who: extra('byzGuard', 5), pose: 'raise'},
  {item: 'placard', who: extra('protester', 2), pose: 'raise', held: {id: 'placard', text: 'القناة لنا'}, expr: 'happy'},
  {item: 'mic', who: look('nasser'), pose: 'present', expr: 'speak'},
  {item: 'torch', who: extra('ottomanWorker', 1), pose: 'raise'},
  {item: 'lantern', who: extra('fellah', 1), pose: 'carry'},
  {item: 'phone', who: extra('egyptCivilian', 5), pose: 'phone', left: true, expr: 'speak'},
  {item: 'tea', who: extra('womanHijab', 1), pose: 'present'},
  {item: 'briefcase', who: extra('egyptCivilian', 8), pose: 'carry'},
];

export const ItemsCatalog: React.FC = () => (
  <Bg title="مكتبة الأشياء — عشرون شيئاً في الأيدي">
    {CATALOG.map((c, i) => {
      const col = i % 7;
      const row = Math.floor(i / 7);
      const x = 1780 - col * 272;
      const y = 380 + row * 320;
      const held = c.held ?? c.item;
      return (
        <g key={c.item}>
          <Person x={x} y={y} s={0.52} frame={24 + i * 5} seed={i} {...c.who} shading="cel" pose={c.pose} expr={c.expr ?? 'neutral'} holdR={c.left ? undefined : held} holdL={c.left ? held : undefined} />
          <Label x={x} y={y + 34} t={ITEM_LABEL[c.item]} sub={`'${c.item}'`} />
        </g>
      );
    })}
  </Bg>
);

/* ---------- ٢: الوضعيات + تسلسل الضرب بالسيف + تسليم الورقة ---------- */
const GIVE_CAST: Record<string, CastMember> = {
  a: {...look('mahmoudYounis'), shading: 'cel'},
  b: {...look('nasser'), shading: 'cel'},
};
const GIVE_SCRIPT = `
@0s   a: enter x=0 y=0 view=threeQuarter | take scroll right
@0s   b: enter x=210 y=0 face=left view=threeQuarter
@0.5s a: give right to b
@after a  b: pose present for 1s
`;

export const ItemPoses: React.FC = () => {
  const guard = {...roleBase('janissary'), shading: 'cel' as const};
  const scene = useScene(GIVE_SCRIPT, {cast: GIVE_CAST});
  const poses: {pose: Pose; held: Held; who: Look; label: string; left?: Held}[] = [
    {pose: 'raise', held: 'flagEgypt', who: extra('protester', 3), label: 'raise — رفع'},
    {pose: 'read', held: {id: 'newspaper', text: 'الأهرام'}, who: extra('egyptCivilian', 2), label: 'read — قراءة'},
    {pose: 'present', held: 'scroll', who: look('halilPasha'), label: 'present — عرض'},
    {pose: 'aim', held: 'rifle', who: roleBase('egyptOfficer'), label: 'aim — تصويب'},
    {pose: 'shoulder', held: 'rifle', who: extra('egyptOfficer', 3), label: 'shoulder — على الكتف'},
    {pose: 'carry', held: 'lantern', who: extra('fellah', 2), label: 'carry — حمل'},
  ];
  return (
    <Bg title="وضعيات الأشياء — وتسلسل الضرب بالسيف وتسليم الورقة">
      {poses.map((p, i) => (
        <g key={p.pose + i}>
          <Person x={170 + i * 316} y={370} s={0.66} frame={30} seed={i} {...p.who} shading="cel" pose={p.pose} holdR={p.held} expr={p.pose === 'read' ? 'think' : 'neutral'} />
          <Label x={170 + i * 316} y={406} t={p.label} />
        </g>
      ))}
      {/* تسلسل الضرب بالسيف: ٤ إطارات من دورة الضربة */}
      <text x={1880} y={520} fontFamily="Amiri" fontSize={30} fontWeight={700} textAnchor="start" fill="#2a2030" direction="rtl">
        ضربة السيف — swing — أربعة إطارات
      </text>
      {[2, 14, 20, 26].map((fr, i) => (
        <g key={fr}>
          <Person x={1700 - i * 230} y={800} s={0.66} frame={fr} seed={0} {...guard} pose="swing" holdR="kilij" holdL="shield" expr="angry" />
          <Label x={1700 - i * 230} y={836} t={['رفع', 'أعلى الرفع', 'الضربة', 'المتابعة'][i]} />
        </g>
      ))}
      {/* تسليم الورقة بالسكريبت: give right to b */}
      <text x={800} y={520} fontFamily="Amiri" fontSize={30} fontWeight={700} textAnchor="start" fill="#2a2030" direction="rtl">
        تسليم الورقة — give — ثلاثة إطارات
      </text>
      {[10, 28, 45].map((fr, i) => {
        const ox = 640 - i * 260;
        return (
          <g key={fr} transform={`translate(${ox - 58} 800) scale(0.55)`}>
            {(['a', 'b'] as const).map((id) => {
              const st = scene.at(id, fr);
              return <Person key={id} {...GIVE_CAST[id]} x={st.x} y={st.y} s={1} flip={st.flip} view={st.view} pose={st.pose ?? 'stand'} holdR={st.holdR} frame={fr} />;
            })}
          </g>
        );
      })}
      {[10, 28, 45].map((fr, i) => (
        <Label key={fr} x={640 - i * 260} y={836} t={['قبل', 'لحظة التسليم', 'بعد'][i]} />
      ))}
    </Bg>
  );
};

/* ---------- ٣: الأشياء في الاتجاهات الخمسة ---------- */
const VIEWS: {v: View; label: string}[] = [
  {v: 'front', label: 'أمامي'},
  {v: 'threeQuarter', label: 'ثلاثة أرباع'},
  {v: 'side', label: 'جانبي'},
  {v: 'threeQuarterBack', label: 'ثلاثة أرباع خلفي'},
  {v: 'back', label: 'خلفي'},
];
export const ItemsTurn: React.FC = () => {
  const rows: {who: Look; pose: Pose; R?: Held; L?: Held; label: string}[] = [
    {who: roleBase('byzGuard'), pose: 'carry', R: 'spatha', L: 'shield', label: 'سيف وترس'},
    {who: roleBase('egyptOfficer'), pose: 'shoulder', R: 'rifle', label: 'بندقية على الكتف'},
    {who: extra('protester', 1), pose: 'raise', R: 'flagEgypt', L: 'briefcase', label: 'علم وحقيبة'},
  ];
  return (
    <Bg title="الأشياء في الاتجاهات الخمسة">
      {VIEWS.map((v, c) => (
        <text key={v.v} x={1880 - 140 - c * 330} y={130} fontFamily="Amiri" fontSize={30} fontWeight={700} textAnchor="middle" fill="#5a4a5a" direction="rtl">
          {v.label}
        </text>
      ))}
      {rows.map((r, i) => (
        <g key={i}>
          <Label x={110} y={300 + i * 310} t={r.label} />
          {VIEWS.map((v, c) => (
            <Person key={v.v} x={1880 - 140 - c * 330} y={400 + i * 310} s={0.72} frame={30} seed={i} {...r.who} shading="cel" pose={r.pose} holdR={r.R} holdL={r.L} view={v.v} />
          ))}
        </g>
      ))}
    </Bg>
  );
};
