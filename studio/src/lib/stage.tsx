import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';

export const W = 1920;
export const H = 1080;

/** المسافة بين الكاميرا ومستوى الشاشة لزاوية رؤية رأسية معينة (FOV بالدرجات) */
export const perspectiveFor = (fovDeg: number) => H / 2 / Math.tan((fovDeg * Math.PI) / 360);

/** زاوية الرؤية المرجعية: عندها تظهر كل طبقة بحجمها الطبيعي مهما كان عمقها */
export const REF_FOV = 45;
const P_REF = perspectiveFor(REF_FOV);

export type Cam = {
  x: number; // تحريك أفقي (truck)
  y: number; // تحريك رأسي (pedestal)
  z: number; // تقدم للأمام (dolly) — موجب = اقتراب
  ry: number; // دوران حول المحور الرأسي (pan/orbit) بالدرجات
  rx: number; // ميل للأعلى/الأسفل (tilt)
  rz: number; // ميلان الكاميرا (roll)
  fov: number; // زاوية الرؤية
};

export const CAM0: Cam = {x: 0, y: 0, z: 0, ry: 0, rx: 0, rz: 0, fov: REF_FOV};

export type CamKey = Partial<Cam> & {f: number};

const smooth = Easing.bezier(0.45, 0, 0.25, 1);

/** استيفاء مفاتيح الكاميرا بمنحنى ناعم */
export const camAt = (frame: number, keys: CamKey[]): Cam => {
  const out = {...CAM0};
  (Object.keys(CAM0) as (keyof Cam)[]).forEach((prop) => {
    const ks = keys.filter((k) => k[prop] !== undefined);
    if (ks.length === 0) return;
    if (ks.length === 1) {
      out[prop] = ks[0][prop] as number;
      return;
    }
    out[prop] = interpolate(
      frame,
      ks.map((k) => k.f),
      ks.map((k) => k[prop] as number),
      {easing: smooth, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
    );
  });
  return out;
};

/** خلفية لا نهائية البعد (السماء) لا تتأثر بحركة الكاميرا */
export const Sky: React.FC<{background: string; children?: React.ReactNode}> = ({background, children}) => (
  <AbsoluteFill style={{background}}>{children}</AbsoluteFill>
);

/** المسرح ثلاثي الأبعاد: كل ما بداخله يتحرك مع الكاميرا والمنظور */
export const Stage: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => {
  const P = perspectiveFor(cam.fov);
  return (
    <AbsoluteFill style={{perspective: P, perspectiveOrigin: '50% 50%', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transform:
            `translateZ(${P}px) rotateZ(${cam.rz}deg) rotateX(${cam.rx}deg) rotateY(${cam.ry}deg) translateZ(${-P}px) ` +
            `translate3d(${-cam.x}px, ${-cam.y}px, ${cam.z}px)`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/**
 * طبقة على عمق d خلف مستوى الشاشة (سالب = أقرب من الشاشة).
 * تُكبَّر تعويضياً لتظهر بحجمها المرسوم عند الكاميرا المرجعية،
 * فيأتي الـ parallax من المنظور الحقيقي عند تحريك الكاميرا.
 */
export const Layer: React.FC<{
  d: number;
  blur?: number;
  opacity?: number;
  children: React.ReactNode;
}> = ({d, blur, opacity, children}) => {
  const k = (P_REF + d) / P_REF;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: W,
        height: H,
        transformOrigin: '50% 50%',
        transform: `translateZ(${-d}px) scale(${k})`,
        filter: blur ? `blur(${blur}px)` : undefined,
        opacity,
      }}
    >
      {children}
    </div>
  );
};

/** لوحة SVG بإحداثيات الشاشة نفسها لكنها تمتد خارجها (للرسم الأوسع من الكادر) */
export const Art: React.FC<{
  x0?: number;
  y0?: number;
  w?: number;
  h?: number;
  children: React.ReactNode;
}> = ({x0 = -1200, y0 = -800, w = W + 2400, h = H + 1400, children}) => (
  <svg
    width={w}
    height={h}
    viewBox={`${x0} ${y0} ${w} ${h}`}
    style={{position: 'absolute', left: x0, top: y0, overflow: 'visible'}}
  >
    {children}
  </svg>
);
