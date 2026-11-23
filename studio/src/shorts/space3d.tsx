import React from 'react';
import {REF_FOV} from '../lib/stage';
import {VH, VW, vPerspective} from './vstage';

/* =====================================================================
 * أدوات مجسّمات CSS 3D داخل VStage (عالم: x,y بإحداثيات الكادر، z نحو الكاميرا).
 * - Plane: سطح مستطيل بتحويل حر (أرضية: rotateX(90deg) من الحافة العليا؛ جدار: rotateY(90deg) من اليسار).
 * - Stand: لوحة قائمة على عمق z بحدود ضيقة (لا تعبر الأسطح الأخرى — قاعدة التقاطع).
 * - visible(): أخفِ ما يقترب من مستوى الكاميرا. project(): موقع نقطة عالمية على الشاشة.
 * ===================================================================== */

export const P3 = vPerspective(REF_FOV);

export const visible = (zNear: number, camZ: number, margin = 60) => zNear + camZ < P3 - margin;

/** إسقاط نقطة (x,y,z) على الشاشة لكاميرا بلا دوران (x,y,z من cam) */
export const project = (x: number, y: number, z: number, cam: {x: number; y: number; z: number}) => {
  const k = P3 / Math.max(1, P3 - (z + cam.z));
  return {x: VW / 2 + (x - cam.x - VW / 2) * k, y: VH / 2 + (y - cam.y - VH / 2) * k, k};
};

export const Plane: React.FC<{left: number; top: number; w: number; h: number; origin: string; transform: string; children: React.ReactNode}> = ({left, top, w, h, origin, transform, children}) => (
  <div style={{position: 'absolute', left, top, width: w, height: h, transformOrigin: origin, transform}}>
    <svg width={w} height={h} style={{display: 'block', overflow: 'visible'}}>
      {children}
    </svg>
  </div>
);

/** أرضية أفقية عند y=floorY من z0 (قريب) إلى z1 (بعيد) بعرض x0..x1 — المحتوى بإحداثيات محلية (0..w, 0..طول) والقريب في الأسفل */
export const FloorPlane: React.FC<{floorY: number; x0: number; x1: number; z0: number; z1: number; children: (w: number, len: number) => React.ReactNode}> = ({floorY, x0, x1, z0, z1, children}) => {
  const w = x1 - x0;
  const len = z0 - z1;
  return (
    <Plane left={x0} top={floorY} w={w} h={len} origin="50% 0%" transform={`translateZ(${z1}px) rotateX(90deg)`}>
      {children(w, len)}
    </Plane>
  );
};

export const Stand: React.FC<{z: number; x0?: number; x1?: number; y0?: number; y1?: number; children: React.ReactNode}> = ({z, x0 = 0, x1 = VW, y0 = 0, y1 = VH, children}) => (
  <div style={{position: 'absolute', left: x0, top: y0, width: x1 - x0, height: y1 - y0, transform: `translateZ(${z}px)`, overflow: 'hidden'}}>
    <svg width={x1 - x0} height={y1 - y0} viewBox={`${x0} ${y0} ${x1 - x0} ${y1 - y0}`} style={{display: 'block'}}>
      {children}
    </svg>
  </div>
);
