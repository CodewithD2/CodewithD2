import React from 'react';
import {useCurrentFrame} from 'remotion';

/* =====================================================================
 * ترتيب الرسم حسب العمق داخل الطبقة الواحدة (painter's algorithm):
 * كل عنصر يُرتَّب حسب موقع قاعدته على الأرض (y أكبر = أقرب للكاميرا = يُرسم آخراً).
 *
 *   <DepthSort>
 *     <Sorted z={920}><SouqStall x={950} y={920} /></Sorted>
 *     <Actor scene={scene} id="ali" />       // عمقه = موضع قدميه في هذا الإطار
 *     <Person x={..} y={..} ... />            // عمقه = y
 *   </DepthSort>
 *
 * أي مكوّن يعرّف دالة ساكنة depthOf(props, frame) يُرتَّب بها (Actor يفعل ذلك).
 * ===================================================================== */

/** يلف أي عنصر بعمق صريح */
export const Sorted: React.FC<{z: number; children: React.ReactNode}> = ({children}) => <>{children}</>;

type DepthFn = (props: Record<string, unknown>, frame: number) => number;

export const depthOf = (el: React.ReactElement, frame: number): number => {
  const props = el.props as Record<string, unknown>;
  if (typeof props.z === 'number') return props.z;
  const fn = (el.type as {depthOf?: DepthFn}).depthOf;
  if (typeof fn === 'function') return fn(props, frame);
  if (typeof props.y === 'number') return props.y;
  return 0;
};

export const DepthSort: React.FC<{children: React.ReactNode; frame?: number}> = ({children, frame}) => {
  const cf = useCurrentFrame();
  const f = frame ?? cf;
  const items = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement[];
  const sorted = items.map((el, i) => ({el, i, z: depthOf(el, f)})).sort((a, b) => a.z - b.z || a.i - b.i);
  return <>{sorted.map((s) => s.el)}</>;
};
