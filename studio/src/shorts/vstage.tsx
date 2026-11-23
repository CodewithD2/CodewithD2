import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cam, REF_FOV} from '../lib/stage';

/* =====================================================================
 * محرك 2.5D عمودي (Shorts 1080×1920) — نفس رياضيات lib/stage.tsx تماماً
 * لكن بأبعاد عمودية: الطبقة على عمق d تظهر بحجمها المرسوم عند الكاميرا المرجعية،
 * والـ parallax يأتي من المنظور الحقيقي عند تحريك الكاميرا (camAt من lib/stage).
 * ===================================================================== */

export const VW = 1080;
export const VH = 1920;
export const vPerspective = (fov: number) => VH / 2 / Math.tan((fov * Math.PI) / 360);
const P_REF = vPerspective(REF_FOV);

export const VStage: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => {
  const P = vPerspective(cam.fov);
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

export const VLayer: React.FC<{d: number; blur?: number; opacity?: number; children: React.ReactNode}> = ({d, blur, opacity, children}) => {
  const k = (P_REF + d) / P_REF;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: VW,
        height: VH,
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

/** لوحة SVG بإحداثيات الكادر العمودي وتمتد خارجه */
export const VArt: React.FC<{x0?: number; y0?: number; w?: number; h?: number; children: React.ReactNode}> = ({
  x0 = -900,
  y0 = -1400,
  w = VW + 1800,
  h = VH + 2800,
  children,
}) => (
  <svg width={w} height={h} viewBox={`${x0} ${y0} ${w} ${h}`} style={{position: 'absolute', left: x0, top: y0, overflow: 'visible'}}>
    {children}
  </svg>
);

/** طبقة مسطحة فوق المسرح (نصوص، أيقونات) بإحداثيات الكادر */
export const Hud: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={VW} height={VH} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    {children}
  </svg>
);
