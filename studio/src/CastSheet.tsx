import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HISTORICAL, ROLES, extra, look} from './cast';
import type {Look} from './cast';
import {Person} from './characters/Person';

/** لوحات مكتبة الشخصيات — تُحدَّث تلقائياً كلما أُضيفت شخصية أو دور */

const Bg: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
  <AbsoluteFill style={{background: 'linear-gradient(#f6efe2, #e6d9c4)'}}>
    <svg width={1920} height={1080}>
      <text x={960} y={74} fontFamily="Amiri" fontSize={56} fontWeight={700} textAnchor="middle" fill="#2a2030" direction="rtl">
        {title}
      </text>
      {children}
    </svg>
  </AbsoluteFill>
);

const Card: React.FC<{x: number; y: number; p: Look; s: number; label: string; sub?: string; i: number}> = ({x, y, p, s, label, sub, i}) => (
  <g>
    <Person x={x} y={y} s={s} frame={20 + i * 7} {...p} shading="cel" expr="neutral" pose="stand" />
    <text x={x} y={y + 46} fontFamily="Amiri" fontSize={28} fontWeight={700} textAnchor="middle" fill="#2a2030" direction="rtl">
      {label}
    </text>
    {sub && (
      <text x={x} y={y + 78} fontFamily="DejaVu Sans Mono, monospace" fontSize={17} textAnchor="middle" fill="#7a6a7a">
        {sub}
      </text>
    )}
  </g>
);

/** الشخصيات التاريخية ونسخها البديلة */
export const CastHistorical: React.FC = () => {
  const items: {p: Look; label: string; sub: string}[] = [];
  Object.values(HISTORICAL).forEach((c) => {
    items.push({p: look(c.id as keyof typeof HISTORICAL), label: c.name.split(' (')[0], sub: `look('${c.id}')`});
    Object.keys(c.variants ?? {}).forEach((v) =>
      items.push({p: look(c.id as keyof typeof HISTORICAL, {variant: v}), label: `${c.name.split(' (')[0]} — ${v}`, sub: `variant: '${v}'`}),
    );
  });
  const perRow = 4;
  return (
    <Bg title="مكتبة الشخصيات — شخصيات تاريخية">
      {items.map((it, i) => {
        const col = i % perRow;
        const row = Math.floor(i / perRow);
        return <Card key={i} i={i} x={240 + col * 480} y={430 + row * 440} p={it.p} s={0.95} label={it.label} sub={it.sub} />;
      })}
    </Bg>
  );
};

/** الأدوار العامة: ثلاثة أشكال متنوعة لكل دور */
export const CastRoles: React.FC = () => {
  const roles = Object.values(ROLES);
  return (
    <Bg title="مكتبة الشخصيات — أدوار عامة، ٣ أشكال لكل دور">
      {roles.map((r, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const cx = 330 + col * 630;
        const y = 345 + row * 315;
        return (
          <g key={r.id}>
            {[1, 2, 3].map((seed, k) => (
              <Person key={seed} x={cx - 150 + k * 150} y={y} s={0.62} frame={20 + seed * 9} {...extra(r.id as keyof typeof ROLES, seed)} shading="cel" expr="neutral" pose="stand" />
            ))}
            <text x={cx} y={y + 40} fontFamily="Amiri" fontSize={30} fontWeight={700} textAnchor="middle" fill="#2a2030" direction="rtl">
              {r.name}
            </text>
            <text x={cx} y={y + 68} fontFamily="DejaVu Sans Mono, monospace" fontSize={17} textAnchor="middle" fill="#7a6a7a">
              extra('{r.id}', seed)
            </text>
          </g>
        );
      })}
    </Bg>
  );
};
