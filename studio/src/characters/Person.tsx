import React from 'react';
import {INK, mixColor} from '../lib/util';
import {Held, HeldItem} from './items';
import {CharLight, CharLightCtx} from './light';

/*
 * شخصية بأسلوب كرتوني مبسّط: رأس مستدير كبير، عيون نقطية، خط خارجي سميك،
 * جسم صغير وأذرع مرنة. نقطة الأصل (0,0) عند القدمين، والطول ≈ 270 وحدة.
 */

export type Expr = 'neutral' | 'smug' | 'shock' | 'think' | 'strain' | 'idea' | 'sleepy' | 'happy' | 'speak' | 'shout' | 'angry' | 'laugh' | 'sad' | 'dizzy' | 'determined';
/** نمط الحركة: still ثابت (السلوك القديم)، idle وقوف حي، walk مشي، run جري */
export type Motion = 'still' | 'idle' | 'walk' | 'run';
/** الاتجاه: front 0°، threeQuarter 45°، side 90°، threeQuarterBack 135°، back 180° — أو أي زاوية رقمية */
export type View = 'front' | 'threeQuarter' | 'side' | 'threeQuarterBack' | 'back';
export const VIEW_YAW: Record<View, number> = {front: 0, threeQuarter: 45, side: 90, threeQuarterBack: 135, back: 180};
/** حالات تمثيل جاهزة تجمع التعبير والوضعية وحركة الجسم والمؤثرات */
export type Act = 'angry' | 'laugh' | 'sad' | 'scared' | 'orate' | 'cheer';
export type Hat =
  | 'sultan'
  | 'vizier'
  | 'byzHelmet'
  | 'bork'
  | 'cap'
  | 'officerCap'
  | 'hijab'
  | 'crown'
  | 'tiltedCrown'
  | 'oversizedCrown'
  | 'nobleHat'
  | 'chaperon'
  | 'mitre'
  | 'medievalHelmet'
  | 'scholarCap'
  | 'none';
export type Outfit = 'robe' | 'suit' | 'uniform' | 'dress' | 'skirt' | 'abaya' | 'armor' | 'royal' | 'peasant' | 'cleric' | 'baby';
/** تسريحات الشعر */
export type HairStyle = 'short' | 'long' | 'bun' | 'ponytail' | 'bob' | 'braid' | 'bowlCut' | 'messy';
/** شعار على الصدر (عصور وسطى أوروبية) */
export type Emblem = 'fleur' | 'cross' | 'saltire';
/** البنية الجسدية */
export type Build = 'normal' | 'broad' | 'belly' | 'slim' | 'female' | 'femaleFull';
/** شكل الوجه */
export type Face = 'round' | 'square' | 'jaw' | 'pointy' | 'long' | 'wide';
/** التظليل: none مسطح، cel ظل حاد كرتوني، soft تدرج ناعم */
export type Shading = 'none' | 'cel' | 'soft';

const BODY: Record<Build, {d: string; sh: number; belt: [number, number]; beltY?: number; bust?: boolean}> = {
  normal: {d: 'M -40 -40 L -48 -128 Q 0 -150 48 -128 L 40 -40 Q 0 -30 -40 -40 Z', sh: 40, belt: [-44, 88]},
  broad: {d: 'M -36 -40 L -74 -122 Q -70 -148 0 -152 Q 70 -148 74 -122 L 36 -40 Q 0 -30 -36 -40 Z', sh: 64, belt: [-50, 100]},
  belly: {d: 'M -44 -40 Q -84 -66 -62 -108 L -44 -130 Q 0 -148 44 -130 L 62 -108 Q 84 -66 44 -40 Q 0 -26 -44 -40 Z', sh: 42, belt: [-76, 152]},
  slim: {d: 'M -30 -40 L -38 -128 Q 0 -146 38 -128 L 30 -40 Q 0 -32 -30 -40 Z', sh: 34, belt: [-35, 70]},
  // جسم أنثوي: كتفان أضيق، خصر محدد، وركان أعرض
  female: {
    d: 'M -27 -86 Q -44 -64 -48 -40 Q 0 -30 48 -40 Q 44 -64 27 -86 Q 22 -104 36 -128 Q 0 -146 -36 -128 Q -22 -104 -27 -86 Z',
    sh: 33,
    belt: [-29, 58],
    beltY: -92,
    bust: true,
  },
  femaleFull: {
    d: 'M -36 -84 Q -62 -62 -62 -40 Q 0 -28 62 -40 Q 62 -62 36 -84 Q 30 -102 44 -128 Q 0 -148 -44 -128 Q -30 -102 -36 -84 Z',
    sh: 40,
    belt: [-38, 76],
    beltY: -90,
    bust: true,
  },
};

const FACE: Record<Face, {d: string; top: number}> = {
  round: {d: 'M -64 -200 A 64 64 0 1 1 64 -200 A 64 64 0 1 1 -64 -200 Z', top: -264},
  square: {d: 'M -40 -262 L 40 -262 Q 62 -262 62 -240 L 62 -160 Q 62 -134 38 -134 L -38 -134 Q -62 -134 -62 -160 L -62 -240 Q -62 -262 -40 -262 Z', top: -262},
  jaw: {d: 'M -60 -206 Q -62 -270 0 -272 Q 62 -270 60 -206 L 60 -168 Q 58 -144 30 -130 L -30 -130 Q -58 -144 -60 -168 Z', top: -272},
  pointy: {d: 'M -62 -212 Q -64 -270 0 -272 Q 64 -270 62 -212 Q 58 -168 28 -144 L 0 -120 L -28 -144 Q -58 -168 -62 -212 Z', top: -272},
  long: {d: 'M -52 -204 A 52 78 0 1 1 52 -204 A 52 78 0 1 1 -52 -204 Z', top: -282},
  wide: {d: 'M -78 -198 A 78 64 0 1 1 78 -198 A 78 64 0 1 1 -78 -198 Z', top: -270},
};

/** لون الظل: يميل للبنفسجي البارد بدل الأسود ليبقى حيوياً */
let SHADOW_TINT = '#3a2244'; // يتغير حسب إضاءة المشهد أثناء رسم كل شخصية
const shadeOf = (c: string, k = 0.38) => (c.startsWith('#') && c.length === 7 ? mixColor(c, SHADOW_TINT, k) : 'rgba(40,20,50,0.35)');
const lightOf = (c: string, k = 0.35) => (c.startsWith('#') && c.length === 7 ? mixColor(c, '#fff4e0', k) : 'rgba(255,255,255,0.3)');
export type Pose =
  | 'stand' | 'cross' | 'chin' | 'point' | 'pull' | 'armsUp' | 'stretch' | 'fist' | 'wave' | 'podium' | 'fists' | 'belly' | 'droop' | 'cower' | 'gesture'
  /* وضعيات مع الأشياء */
  | 'raise' | 'swing' | 'read' | 'present' | 'aim' | 'shoulder' | 'carry' | 'phone';

export type PersonProps = {
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  rot?: number;
  frame: number;
  seed?: number;
  /** فتحة الفم أثناء الكلام 0..1 (من سكريبت الحوار) — تتجاوز فم التعبير مع إبقاء العينين والحاجبين */
  talk?: number;
  skin?: string;
  robe: string;
  trim?: string;
  hat: Hat;
  expr?: Expr;
  pose?: Pose;
  beard?: string;
  /** لون الشعر (يظهر حين لا يغطي الرأسَ غطاء كامل) */
  hair?: string;
  mustache?: string;
  /** robe = ثوب تقليدي، suit = بدلة بقميص وربطة عنق، uniform = زي عسكري */
  outfit?: Outfit;
  tie?: string;
  build?: Build;
  face?: Face;
  shading?: Shading;
  /** نمط الحركة (افتراضي still) */
  motion?: Motion;
  /** المسافة المقطوعة بالبكسل على الشاشة — تضبط إيقاع الخطوات فلا تنزلق القدمان. إن لم تُعطَ تُحسب من frame */
  travel?: number;
  /** شدة الحركة 0..1 (0.3 هادئ، 1 مبالغ) */
  energy?: number;
  /** حالة تمثيل جاهزة (تتجاوز expr و pose) */
  act?: Act;
  /**
   * الاتجاه (اسم أو زاوية 0..180). الشخصية تنظر لليمين؛ استخدم flip لليسار.
   * إن لم يُحدَّد: جانبي تلقائياً أثناء walk/run، وأمامي غير ذلك. للالتفات الناعم استخدم yawAt().
   */
  view?: View | number;
  /** شيء في اليد اليمنى للشخصية (يسار الشاشة في المنظر الأمامي) */
  holdR?: Held;
  /** إضاءة المشهد (إن لم تُعطَ تُقرأ من CharLightCtx) */
  light?: CharLight;
  /** شيء في اليد اليسرى */
  holdL?: Held;
  hairStyle?: HairStyle;
  /** رموش (تلقائياً مع البنية الأنثوية) */
  lashes?: boolean;
  lips?: string;
  earrings?: string;
  /** لون الحجاب (افتراضياً trim) */
  scarf?: string;
  /** لون التنورة في outfit='skirt' */
  skirt?: string;
  /** لون النصف الثاني لرداء مقسّم لونين (مثل هنري الخامس) */
  robe2?: string;
  /** رداء علوي قصير فوق الدرع (مثل جان دارك) */
  surcoat?: string;
  /** شعار على الصدر: زهرة زنبق / صليب / صليب مائل X */
  emblem?: Emblem;
  /** حواف فرو (أبيض/قاقم) للنبلاء والملوك */
  fur?: string;
  /** قضبان حديدية مخيطة في الرداء (شارل السادس) */
  ironRods?: boolean;
  /** لون المريلة في زي القرية */
  apron?: string;
  /** نظارات دائرية صغيرة (للعلماء) */
  glasses?: boolean;
  /** قطرة عرق دائمة بجانب الجبهة */
  sweat?: boolean;
  /** خدان ورديان دائمان (للأطفال) */
  rosy?: boolean;
  /** حاجبان سميكان غاضبان (مثل لا هير) */
  heavyBrows?: boolean;
  /** شارب كثيف مقوس للأسفل (مثل بودريكور) */
  droopMustache?: boolean;
  /** عيون شاردة/حلزونية (مثل شارل السادس) */
  spiralEyes?: boolean;
  look?: [number, number];
  /** 0..1 للانتقال الحاد في التعبير (مثل قفزة الصدمة) */
  jolt?: number;
};

const SW = 5; // سُمك الخط الخارجي

const ArmShade = React.createContext<string | null>(null);
/** إسقاط الذراعين حسب الاتجاه + أي ذراع يُرسم الآن (البعيدة قبل الجسم، القريبة بعده) */
/**
 * ترتيب الرسم بالعمق: كل ذراع تُرسم في واحدة من ثلاث خانات حسب عمقها بعد الدوران:
 *   back  = قبل الجسم (الذراع البعيدة)
 *   mid   = بعد الجسم وقبل الرأس (الوضع العادي)
 *   front = بعد الرأس (اليد متقدمة أمام الوجه)
 */
type ArmSlot = 'back' | 'mid' | 'front';
type ArmCtxT = {cy: number; sy: number; slot: ArmSlot};
/** نقطة ذراع: [x, y] أو [x, y, z] حيث z = التقدم نحو الكاميرا في المنظر الأمامي */
type Pt = [number, number] | [number, number, number];
const FRONT_DEPTH = 40; // خارج صورة الرأس: يد أعمق من هذا تُرسم بعد الرأس
const HEAD_R = 66; // نصف قطر كرة الرأس (مركزها 0,−200)
/** الأشياء الممسوكة: R لليد اليمنى (الذراع ذات x<0 في الأمامي)، L لليسرى، وزوايا ثابتة لبعض الوضعيات */
type ItemCtxT = {R?: Held; L?: Held; ovR?: number; ovL?: number; frame: number; frontDy?: number; frontDx?: number};
const ItemCtx = React.createContext<ItemCtxT>({frame: 0});
const ArmCtx = React.createContext<ArmCtxT>({cy: 1, sy: 0, slot: 'mid'});

const Arm: React.FC<{from: Pt; mid: Pt; to: Pt; robe: string; skin: string}> = ({from: from0, mid: mid0, to: to0, robe, skin}) => {
  const shade = React.useContext(ArmShade);
  const {cy, sy, slot} = React.useContext(ArmCtx);
  const items = React.useContext(ItemCtx);
  // اليد اليمنى للشخصية = الذراع ذات x<0 في المنظر الأمامي
  const right = from0[0] < 0;
  // z الافتراضي للنقاط ثنائية الأبعاد: الامتداد الجانبي يُعتبر متقدماً قليلاً (فيُقرأ للأمام في الجانب)
  const Z = (p: Pt) => (p.length === 3 ? p[2] : Math.abs(p[0] - from0[0]) * 0.6);
  const rot = (p: Pt, z: number): [number, number, number] => [p[0] * cy + z * sy, p[1], -p[0] * sy + z * cy];
  const F = rot(from0, 0);
  const Mi = rot(mid0, Z(mid0));
  const T = rot(to0, Z(to0));
  // الخانة حسب العمق: إن كانت اليد داخل صورة الرأس نقارنها بسطح كرة الرأس عند تلك النقطة
  const hdx = T[0];
  const hdy = T[1] + 200;
  const r2 = HEAD_R * HEAD_R - hdx * hdx - hdy * hdy;
  // خارج صورة الرأس: اليد المرفوعة فوق مستوى الرأس (بجانبه أو فوقه) تُرسم بعده ما لم تكن خلفه بوضوح،
  // وإلا فلا تُرسم بعده إلا إن تقدمت بوضوح (حتى لا تغطي الذراعان اللحية والذقن)
  // (من الخلف تبقى الذراع المرفوعة خلف مؤخرة الرأس لأن سطحه أقرب للكاميرا منها)
  const inFront = r2 > 0 ? T[2] > Math.sqrt(r2) : T[2] > (T[1] < -200 && cy > -0.2 ? -10 : FRONT_DEPTH);
  const mySlot: ArmSlot = inFront ? 'front' : (F[2] + T[2]) / 2 < -8 ? 'back' : 'mid';
  if (mySlot !== slot) return null;
  const from: [number, number] = [F[0], F[1]];
  const mid: [number, number] = [Mi[0], Mi[1]];
  const to: [number, number] = [T[0], T[1]];
  const near = right;
  const d = `M ${from[0]} ${from[1]} Q ${mid[0]} ${mid[1]} ${to[0]} ${to[1]}`;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={24} fill="none" strokeLinecap="round" />
      <path d={d} stroke={robe} strokeWidth={14} fill="none" strokeLinecap="round" />
      {shade && <path d={d} stroke={shade} strokeWidth={5} fill="none" strokeLinecap="round" transform="translate(2 4)" opacity={0.85} />}
      {(near ? items.R : items.L) && (
        <HeldItem
          item={(near ? items.R : items.L) as Held}
          at={to}
          dir={Math.atan2(to[1] - mid[1], to[0] - mid[0])}
          frame={items.frame}
          angleOverride={near ? items.ovR : items.ovL}
          frontDy={items.frontDy}
          frontDx={near ? items.frontDx : 0}
          squash={Math.max(0.3, Math.abs(cy))}
        />
      )}
      <circle cx={to[0]} cy={to[1]} r={11} fill={skin} stroke={INK} strokeWidth={SW - 1} />
    </g>
  );
};

const Eyes: React.FC<{expr: Expr; blink: boolean; look: [number, number]; skin: string; lashes?: boolean; spiralEyes?: boolean; glasses?: boolean; only?: 0 | 1}> = ({
  expr,
  blink,
  look,
  skin,
  lashes,
  spiralEyes,
  glasses,
  only,
}) => {
  const [lx, ly] = look;
  const E = only === undefined ? [-21, 21] : [[-21, 21][only]];
  const ey = -206;
  const spec = glasses ? (
    <g fill="rgba(255,255,255,0.22)" stroke={INK} strokeWidth={3.5}>
      {E.map((x) => (
        <circle key={`gl${x}`} cx={x} cy={ey} r={14} />
      ))}
      {only !== 1 && <line x1={-7} y1={ey} x2={0} y2={ey} />}
      {only !== 0 && <line x1={0} y1={ey} x2={7} y2={ey} />}
    </g>
  ) : null;
  if (expr === 'strain') {
    return (
      <g>
        <g stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none">
          {E.map((x) => {
            const k = Math.sign(x);
            return <path key={x} d={`M ${x + k * 9} ${ey - 7} L ${x - k * 6} ${ey} L ${x + k * 9} ${ey + 7}`} />;
          })}
        </g>
        {spec}
      </g>
    );
  }
  if (expr === 'laugh') {
    // عيون مغمضة من الضحك ^ ^
    return (
      <g>
        <g stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none">
          {E.map((x) => (
            <path key={x} d={`M ${x - 9} ${ey + 3} Q ${x} ${ey - 10} ${x + 9} ${ey + 3}`} />
          ))}
        </g>
        {spec}
      </g>
    );
  }
  if (expr === 'sleepy' || blink) {
    return (
      <g>
        <g stroke={INK} strokeWidth={5} strokeLinecap="round">
          {E.map((x) => (
            <line key={x} x1={x - 8} y1={ey + 2} x2={x + 8} y2={ey + 2} />
          ))}
        </g>
        {spec}
      </g>
    );
  }
  if (expr === 'dizzy' || (spiralEyes && expr !== 'shock')) {
    return (
      <g>
        {E.map((x) => (
          <g key={x}>
            <circle cx={x} cy={ey - 2} r={15} fill="#fff" stroke={INK} strokeWidth={3.5} />
            <path
              d={`M ${x} ${ey - 2} m -2 0 a 2 2 0 1 1 4 0 a 5 5 0 1 1 -10 0 a 8.5 8.5 0 1 1 17 0`}
              fill="none"
              stroke={INK}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </g>
        ))}
        {spec}
      </g>
    );
  }
  if (expr === 'shock') {
    return (
      <g>
        {E.map((x) => (
          <g key={x}>
            <circle cx={x} cy={ey - 4} r={17} fill="#fff" stroke={INK} strokeWidth={4} />
            <circle cx={x + lx * 4} cy={ey - 4 + ly * 4} r={4.5} fill={INK} />
          </g>
        ))}
        {spec}
      </g>
    );
  }
  const ry = expr === 'idea' || expr === 'happy' ? 12 : 10;
  return (
    <g>
      {E.map((x) => (
        <ellipse key={x} cx={x + lx * 5} cy={ey + ly * 5} rx={6.5} ry={ry} fill={INK} />
      ))}
      {lashes &&
        E.map((x) => {
          const sd = Math.sign(x);
          return (
            <g key={`lash${x}`} stroke={INK} strokeWidth={3.5} strokeLinecap="round">
              <line x1={x + sd * 5} y1={ey - 8} x2={x + sd * 13} y2={ey - 15} />
              <line x1={x + sd * 7} y1={ey - 3} x2={x + sd * 15} y2={ey - 7} />
            </g>
          );
        })}
      {(expr === 'smug' || expr === 'determined') &&
        E.map((x) => (
          <g key={`lid${x}`}>
            <rect x={x - 12} y={ey - 16} width={24} height={expr === 'determined' ? 11 : 14} fill={skin} />
            <line
              x1={x - 10}
              y1={ey - (expr === 'determined' ? 5 : 2)}
              x2={x + 10}
              y2={ey - (expr === 'determined' ? 5 : 2)}
              stroke={INK}
              strokeWidth={4}
              strokeLinecap="round"
            />
          </g>
        ))}
      {spec}
    </g>
  );
};

const Brows: React.FC<{expr: Expr; heavy?: boolean; only?: 0 | 1}> = ({expr, heavy, only}) => {
  const y = -228;
  const b: Record<Expr, [number, number, number, number]> = {
    // [ارتفاع اليسار, ميل اليسار, ارتفاع اليمين, ميل اليمين]
    neutral: [0, 0, 0, 0],
    smug: [2, 3, -8, -4],
    shock: [-14, -2, -14, 2],
    think: [-2, 6, 2, -2],
    strain: [4, 9, 4, -9],
    idea: [-10, -3, -10, 3],
    sleepy: [4, -2, 4, 2],
    happy: [-6, -2, -6, 2],
    speak: [-4, 2, -4, -2],
    angry: [8, 13, 8, -13],
    laugh: [-8, -3, -8, 3],
    sad: [-4, -10, -4, 10],
    shout: [2, 8, 2, -8],
    dizzy: [-10, -4, -10, 4],
    determined: [3, 6, 3, -6],
  };
  const [ly, ls, ry, rs] = b[expr];
  const sw = heavy ? 10 : 6;
  const extraTilt = heavy && (expr === 'neutral' || expr === 'speak') ? 8 : 0;
  return (
    <g stroke={INK} strokeWidth={sw} strokeLinecap="round">
      {only !== 1 && <line x1={-35} y1={y + ly - ls - extraTilt * 0.4} x2={heavy ? -4 : -11} y2={y + ly + ls + extraTilt} />}
      {only !== 0 && <line x1={heavy ? 4 : 11} y1={y + ry + rs + extraTilt} x2={35} y2={y + ry - rs - extraTilt * 0.4} />}
    </g>
  );
};

const Mouth: React.FC<{expr: Expr; frame: number; lips?: string; talk?: number}> = ({expr, frame, lips, talk}) => {
  if (talk !== undefined && expr !== 'laugh') {
    // كلام متزامن مع الصوت: الفم يفتح بقدر talk ويُغلق بين الكلمات
    const y0 = -172;
    if (talk < 0.08) return <line x1={-10} y1={y0 + 2} x2={10} y2={y0 + 2} stroke={lips ?? INK} strokeWidth={5} strokeLinecap="round" />;
    const ry = 2 + 11 * talk;
    const rx = 10 + 4 * (1 - talk);
    return (
      <g>
        <ellipse cx={0} cy={y0 + 2} rx={rx} ry={ry} fill={INK} />
        {talk > 0.45 && <ellipse cx={0} cy={y0 + 2 + ry * 0.55} rx={rx * 0.55} ry={ry * 0.3} fill="#c0485a" />}
      </g>
    );
  }
  const y = -172;
  if (lips && (expr === 'neutral' || expr === 'think')) {
    return (
      <path d={`M -12 ${y} Q -6 ${y - 6} 0 ${y - 2} Q 6 ${y - 6} 12 ${y} Q 0 ${y + 10} -12 ${y} Z`} fill={lips} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
    );
  }
  if (lips && expr === 'smug') {
    return <path d={`M -14 ${y} Q 4 ${y + 9} 18 ${y - 8} Q 4 ${y + 2} -14 ${y} Z`} fill={lips} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
  }
  switch (expr) {
    case 'smug':
      return <path d={`M -14 ${y} Q 4 ${y + 6} 18 ${y - 8}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
    case 'shock':
      return <ellipse cx={0} cy={y + 4} rx={13} ry={18} fill={INK} />;
    case 'think':
      return <path d={`M -12 ${y} q 6 -5 12 0 t 12 0`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
    case 'strain':
      return (
        <g>
          <rect x={-20} y={y - 9} width={40} height={18} rx={5} fill="#fff" stroke={INK} strokeWidth={4} />
          <line x1={-20} y1={y} x2={20} y2={y} stroke={INK} strokeWidth={3} />
          {[-10, 0, 10].map((x) => (
            <line key={x} x1={x} y1={y - 9} x2={x} y2={y + 9} stroke={INK} strokeWidth={2} />
          ))}
        </g>
      );
    case 'idea':
    case 'happy':
      return <path d={`M -22 ${y - 8} Q 0 ${y + 22} 22 ${y - 8} Z`} fill={INK} />;
    case 'angry':
      // أسنان مضغوطة بفم مقلوب
      return (
        <g>
          <path d={`M -20 ${y + 6} Q 0 ${y - 12} 20 ${y + 6} L 20 ${y + 10} Q 0 ${y - 4} -20 ${y + 10} Z`} fill="#fff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          {[-8, 0, 8].map((tx) => (
            <line key={tx} x1={tx} y1={y - 2} x2={tx} y2={y + 6} stroke={INK} strokeWidth={2} />
          ))}
        </g>
      );
    case 'laugh':
      return (
        <g>
          <path d={`M -26 ${y - 10} Q 0 ${y + 34} 26 ${y - 10} Z`} fill={INK} />
          <path d={`M -14 ${y + 8} Q 0 ${y + 20} 14 ${y + 8}`} fill="#c0485a" />
        </g>
      );
    case 'sad':
      return <path d={`M -14 ${y + 4} Q 0 ${y - 8} 14 ${y + 4}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
    case 'speak': {
      // فم يتكلم: يفتح ويغلق بإيقاع غير منتظم
      const o = 3 + 9 * Math.abs(Math.sin(frame / 2.6) * Math.sin(frame / 7.3));
      return <ellipse cx={0} cy={y + 2} rx={13} ry={o} fill={INK} />;
    }
    case 'shout':
      return (
        <g>
          <path d={`M -24 ${y - 10} Q 0 ${y + 34} 24 ${y - 10} Z`} fill={INK} />
          <path d={`M -14 ${y + 6} Q 0 ${y + 20} 14 ${y + 6}`} fill="#c0485a" />
        </g>
      );
    case 'sleepy': {
      const o = 6 + 6 * Math.abs(Math.sin(frame / 14));
      return <ellipse cx={0} cy={y + 2} rx={7} ry={o} fill={INK} />;
    }
    case 'dizzy':
      return <path d={`M -18 ${y + 2} Q -9 ${y + 10} 0 ${y} Q 9 ${y - 7} 18 ${y + 4}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
    case 'determined':
      return <path d={`M -12 ${y + 2} Q 0 ${y - 3} 14 ${y - 1}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
    default:
      return <line x1={-10} y1={y} x2={10} y2={y} stroke={INK} strokeWidth={5} strokeLinecap="round" />;
  }
};

const HatShape: React.FC<{hat: Hat; trim: string; cy?: number; sy?: number}> = ({hat, trim, cy = 1, sy = 0}) => {
  // زخارف الواجهة (جوهرة، شارة، واقي أنف…) تدور مع الرأس وتختفي من الخلف
  const Front: React.FC<{children: React.ReactNode}> = ({children}) =>
    cy < -0.05 ? null : <g transform={`translate(${sy * 40} 0) scale(${Math.max(0.3, cy)} 1)`}>{children}</g>;
  switch (hat) {
    case 'sultan':
      // عمامة ضخمة بيضاء يعلوها قاووق أحمر
      return (
        <g stroke={INK} strokeWidth={SW}>
          <path d="M -30 -262 Q -26 -330 0 -334 Q 26 -330 30 -262 Z" fill="#c0262d" />
          <ellipse cx={0} cy={-252} rx={86} ry={46} fill="#f6f1e4" />
          <path d="M -70 -262 Q 0 -232 70 -262" fill="none" strokeWidth={3} />
          <path d="M -58 -280 Q 0 -250 58 -280" fill="none" strokeWidth={3} />
          <Front>
            <circle cx={0} cy={-246} r={10} fill={trim} />
            <path d="M 0 -256 Q 6 -300 18 -306" fill="none" stroke={INK} strokeWidth={4} />
            <ellipse cx={20} cy={-310} rx={6} ry={12} fill="#fff" strokeWidth={3} />
          </Front>
        </g>
      );
    case 'vizier':
      return (
        <g stroke={INK} strokeWidth={SW}>
          <path d="M -26 -262 L -18 -318 L 18 -318 L 26 -262 Z" fill="#2f6fae" />
          <ellipse cx={0} cy={-256} rx={70} ry={34} fill="#f6f1e4" />
          <path d="M -55 -262 Q 0 -240 55 -262" fill="none" strokeWidth={3} />
        </g>
      );
    case 'byzHelmet':
      // خوذة بيزنطية مخروطية بريشة حمراء
      return (
        <g stroke={INK} strokeWidth={SW}>
          <path d="M 0 -300 Q 6 -340 40 -350 Q 22 -320 14 -296 Z" fill="#b3262c" />
          <path d="M -64 -236 Q -64 -300 0 -306 Q 64 -300 64 -236 Z" fill="#9aa3ad" />
          <rect x={-70} y={-242} width={140} height={16} rx={6} fill="#c9a43a" />
          <Front>
            <rect x={-5} y={-236} width={10} height={20} fill="#9aa3ad" />
          </Front>
        </g>
      );
    case 'bork':
      // قبعة الإنكشارية البيضاء الطويلة المنثنية للخلف
      return (
        <g stroke={INK} strokeWidth={SW}>
          <path d="M 40 -262 Q 30 -330 -10 -360 Q -60 -380 -110 -330 Q -60 -340 -30 -300 Q -40 -280 -44 -262 Z" fill="#f4efe2" />
          <rect x={-56} y={-272} width={110} height={24} rx={8} fill={trim} />
          <Front>
            <path d="M -6 -270 L 0 -318 L 6 -270 Z" fill={trim} />
          </Front>
        </g>
      );
    case 'hijab':
      // الحجاب يُرسم كمنطقة خط شعر (HAIRLINE.hijab) + الجزء الخلفي المنسدل
      return null;
    case 'crown':
      return (
        <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
          <path d="M -46 -252 L -50 -306 L -24 -280 L 0 -318 L 24 -280 L 50 -306 L 46 -252 Z" fill="#e8b830" />
          <rect x={-48} y={-262} width={96} height={14} rx={4} fill="#d9a020" />
          <Front>
            {[-28, 0, 28].map((cx, i) => (
              <circle key={cx} cx={cx} cy={-255} r={5} fill={['#c0262d', '#2f6fae', '#2f8f5a'][i]} strokeWidth={2} />
            ))}
          </Front>
        </g>
      );
    case 'officerCap':
      // كاب ضابط بحافة أمامية وشارة
      return (
        <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
          <path d="M -66 -244 Q -70 -300 0 -304 Q 70 -300 66 -244 Z" fill="#8a7b4e" />
          <rect x={-64} y={-256} width={128} height={16} fill="#5a4e30" />
          {/* الحافة: للأمام في الجانب، مختفية من الخلف */}
          {cy > -0.3 && (
            <g transform={`translate(${sy * 44} 0) scale(${0.62 + 0.38 * Math.max(0, cy)} 1)`}>
              <path d="M -50 -240 Q 10 -232 74 -246 Q 60 -226 -40 -230 Z" fill="#2a2418" />
            </g>
          )}
          <Front>
            <circle cx={0} cy={-276} r={10} fill={trim} />
          </Front>
        </g>
      );
    case 'cap':
      return (
        <g stroke={INK} strokeWidth={SW}>
          <path d="M -58 -238 Q -60 -296 0 -298 Q 60 -296 58 -238 Q 0 -256 -58 -238 Z" fill={trim} />
          <path d="M -58 -240 Q 0 -262 58 -240" fill="none" strokeWidth={3} />
        </g>
      );
    case 'tiltedCrown':
      // تاج مائل قليلاً (شارل السادس المجنون)
      return (
        <g transform="rotate(15 0 -262)" stroke={INK} strokeWidth={4} strokeLinejoin="round">
          <path d="M -44 -250 L -48 -302 L -22 -276 L 0 -314 L 22 -276 L 48 -302 L 44 -250 Z" fill="#e8b830" />
          <rect x={-46} y={-260} width={92} height={14} rx={4} fill="#d9a020" />
          <Front>
            {[-26, 0, 26].map((cx, i) => (
              <circle key={cx} cx={cx} cy={-253} r={5} fill={['#2f6fae', '#c0262d', '#2f6fae'][i]} strokeWidth={2} />
            ))}
          </Front>
        </g>
      );
    case 'oversizedCrown':
      // تاج ذهبي عملاق ينزلق فوق العينين (الملك الرضيع هنري السادس)
      return (
        <g transform="rotate(-8 0 -230)" stroke={INK} strokeWidth={4.5} strokeLinejoin="round">
          <path d="M -68 -216 Q -66 -286 0 -290 Q 66 -286 68 -216 Z" fill="#9e1e2b" />
          <path d="M -76 -208 L -84 -292 L -40 -254 L 0 -308 L 40 -254 L 84 -292 L 76 -208 Z" fill="#f0c434" />
          <rect x={-78} y={-224} width={156} height={20} rx={6} fill="#dba61e" />
          <Front>
            {[-46, 0, 46].map((cx, i) => (
              <circle key={cx} cx={cx} cy={-214} r={7} fill={['#c0262d', '#2860a8', '#c0262d'][i]} strokeWidth={2.5} />
            ))}
          </Front>
        </g>
      );
    case 'nobleHat':
      // قبعة نبلاء العصور الوسطى المنتفخة بريشة (الدوفين شارل السابع والنبلاء)
      return (
        <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
          <path d="M -22 -296 Q -44 -356 14 -372 Q -2 -334 8 -296 Z" fill="#f6f1e4" strokeWidth={4} />
          <path d="M -68 -244 Q -84 -304 -18 -314 Q 68 -316 74 -256 Q 68 -238 56 -238 L -58 -238 Q -66 -238 -68 -244 Z" fill={trim} />
          <path d="M -62 -246 Q 0 -258 62 -246" fill="none" stroke="#e8b830" strokeWidth={5} />
          <Front>
            <circle cx={-12} cy={-266} r={10} fill="#e8b830" strokeWidth={3} />
          </Front>
        </g>
      );
    case 'chaperon':
      // قبعة العصور الوسطى الملفوفة الضخمة (Chaperon — دوق بورغوندي)
      return (
        <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
          {/* الذيل المتدلي على الجانب */}
          <path d="M 46 -264 Q 90 -248 92 -184 Q 82 -164 66 -170 Q 74 -216 42 -244 Z" fill={trim} />
          {/* اللفة المنتفخة حول الرأس */}
          <path d="M -78 -248 Q -88 -304 -14 -314 Q 76 -318 82 -260 Q 82 -232 52 -236 L -56 -236 Q -76 -232 -78 -248 Z" fill={trim} />
          <path d="M -66 -254 Q -10 -276 58 -254" fill="none" strokeWidth={3.5} />
          <path d="M -52 -284 Q 8 -298 62 -276" fill="none" strokeWidth={3} />
          <Front>
            <circle cx={0} cy={-258} r={9} fill="#e8b830" strokeWidth={3} />
          </Front>
        </g>
      );
    case 'mitre':
      // قبعة أسقفية طويلة (Mitre — الأسقف بيير كوشون)
      return (
        <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
          <path d="M -52 -244 L -46 -324 L 0 -374 L 46 -324 L 52 -244 Z" fill="#8e1b2a" />
          <rect x={-56} y={-256} width={112} height={18} rx={4} fill={trim} />
          <Front>
            <path d="M 0 -358 L 0 -256 M -26 -310 L 26 -310" stroke={trim} strokeWidth={8} strokeLinecap="round" />
            <circle cx={0} cy={-310} r={7} fill="#fff4d0" strokeWidth={2.5} />
          </Front>
        </g>
      );
    case 'medievalHelmet':
      // خوذة معدنية أوروبية من العصور الوسطى (Sallet / Kettle — الجنود وبودريكور)
      return (
        <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
          <path d="M -66 -236 Q -68 -308 0 -312 Q 68 -308 66 -236 Z" fill="#9ca6b4" />
          <path d="M -36 -294 Q -10 -304 16 -296" fill="none" stroke="#dce4ee" strokeWidth={5} strokeLinecap="round" />
          <path d="M -78 -236 Q 0 -248 78 -236 Q 74 -222 0 -226 Q -74 -222 -78 -236 Z" fill="#7d8794" />
          <Front>
            <rect x={-5} y={-292} width={10} height={54} rx={3} fill={trim} strokeWidth={2.5} />
          </Front>
        </g>
      );
    case 'scholarCap':
      // قبعة علماء بواتييه المربعة السوداء
      return (
        <g stroke={INK} strokeWidth={4.5} strokeLinejoin="round">
          <path d="M -56 -242 Q -56 -278 0 -280 Q 56 -278 56 -242 Z" fill="#23222c" />
          <path d="M -68 -268 L 0 -296 L 68 -268 L 0 -250 Z" fill="#2b2a36" />
          <circle cx={0} cy={-274} r={6} fill={trim} strokeWidth={2.5} />
        </g>
      );
    default:
      return null;
  }
};

export const Person: React.FC<PersonProps> = ({
  x,
  y,
  s = 1,
  flip,
  rot = 0,
  frame,
  seed = 0,
  talk,
  skin = '#f2c6a0',
  robe,
  trim = '#d9a520',
  hat,
  expr: exprIn = 'neutral',
  pose: poseIn = 'stand',
  beard,
  hair,
  mustache,
  outfit = 'robe',
  tie = '#2a2a3a',
  build = 'normal',
  face = 'round',
  shading = 'none',
  hairStyle = 'short',
  lashes,
  lips,
  earrings,
  scarf,
  skirt,
  robe2,
  surcoat,
  emblem,
  fur,
  ironRods,
  apron,
  glasses,
  sweat,
  rosy,
  heavyBrows,
  droopMustache,
  spiralEyes,
  look: lookIn = [0, 0],
  jolt = 0,
  motion = 'still',
  travel,
  energy = 0.5,
  act,
  view,
  holdR,
  holdL,
  light: lightIn,
}) => {
  const ctxLight = React.useContext(CharLightCtx);
  const L = lightIn ?? ctxLight;
  SHADOW_TINT = L ? L.shadow : '#3a2244';
  // ===== الاتجاه =====
  const yawDeg = Math.max(0, Math.min(180, view === undefined ? (motion === 'walk' || motion === 'run' ? 90 : 0) : typeof view === 'number' ? view : VIEW_YAW[view]));
  const yr = (yawDeg * Math.PI) / 180;
  const cy = Math.cos(yr); // 1 أمامي، 0 جانبي، −1 خلفي
  const sy = Math.sin(yr); // 0 أمامي/خلفي، 1 جانبي
  /** إسقاط نقطة على كرة الرأس عند زاوية theta (درجات) */
  const onHead = (theta: number, r = 64) => {
    const a = (theta * Math.PI) / 180 + yr;
    return {x: r * Math.sin(a), z: Math.cos(a)};
  };
  // ===== حالات التمثيل تحدد التعبير والوضعية =====
  const ACTS: Record<Act, {expr: Expr; pose: Pose}> = {
    angry: {expr: 'angry', pose: 'fists'},
    laugh: {expr: 'laugh', pose: 'belly'},
    sad: {expr: 'sad', pose: 'droop'},
    scared: {expr: 'shock', pose: 'cower'},
    orate: {expr: 'speak', pose: 'gesture'},
    cheer: {expr: 'happy', pose: 'armsUp'},
  };
  const expr: Expr = act ? ACTS[act].expr : exprIn;
  const pose: Pose = act ? ACTS[act].pose : poseIn;
  const M = computeMotion({motion, travel, frame, s, energy, act, seed});
  const look: [number, number] = act === 'sad' || poseIn === 'read' ? [0, 1] : lookIn;
  const itemCtx: ItemCtxT = {
    R: holdR,
    L: holdL,
    frame,
    ovR: poseIn === 'aim' ? 90 : poseIn === 'shoulder' ? -20 : undefined,
    frontDy: poseIn === 'read' ? 54 : poseIn === 'present' ? 24 : 0,
    // في القراءة: الورقة في المنتصف بين اليدين (الإزاحة تدور مع الالتفات)
    frontDx: poseIn === 'read' ? 50 * cy : 0,
  };

  // رمش كل ثلاث ثوانٍ تقريباً، مع اختلاف التوقيت بين الشخصيات
  const blink = (frame + seed * 37) % 97 < 4;
  // تنفّس / ارتداد خفيف
  const bob = (pose === 'pull' ? Math.sin((frame + seed * 9) / 5) * 4 : motion === 'still' && !act ? Math.sin((frame + seed * 13) / 18) * 2.5 : 0) + M.bodyY;
  const lean = (pose === 'pull' ? 14 + Math.sin((frame + seed * 9) / 5) * 4 : 0) + M.tilt;
  const hop = -jolt * 28;

  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  // ===== الإضاءة: جهة الضوء في إحداثيات الشخصية المحلية (تنعكس مع flip) =====
  const fs = flip ? -1 : 1;
  const ldir = (L?.dir ?? -1) * fs;
  // مصادر الضوء النقطية: أقواها فقط (لون + شدة + جهة)
  const pt = (() => {
    let best: {color: string; k: number; dir: number} | null = null;
    for (const p of L?.points ?? []) {
      const dx = p.x - x;
      const dy = p.y - (y - 150 * s);
      const d = Math.hypot(dx, dy);
      const k = Math.max(0, 1 - d / p.r);
      if (k > 0.02 && (!best || k > best.k)) best = {color: p.color, k, dir: Math.sign(dx || 1) * fs};
    }
    return best;
  })();
  const shadeOn = shading !== 'none' || !!L;
  const shadeMode = shading === 'none' ? 'cel' : shading;
  const B = BODY[build];
  const F = FACE[face];
  const dTop = F.top + 264; // إزاحة الشعر والقبعة حسب ارتفاع الرأس
  const sh: [number, number] = [-B.sh, -122];
  const sh2: [number, number] = [B.sh, -122];
  let arms: React.ReactNode;
  const swingArms = (motion === 'walk' || motion === 'run') && pose === 'stand' && !act;
  switch (swingArms ? ('__swing' as Pose) : pose) {
    case '__swing' as Pose: {
      // الذراعان تتأرجحان عكس الرجلين؛ في الجري مثنيتان
      const L = 70;
      const handAt = (shx: number, a: number, bend: number): [number, number] => [shx + Math.sin(a) * L * (1 - bend * 0.35), -122 + Math.cos(a) * L * (1 - bend * 0.55) - bend * 18];
      const bend = motion === 'run' ? 1 : 0;
      const a1 = (-M.swing * 0.9 * Math.PI) / 180;
      const a2 = (M.swing * 0.9 * Math.PI) / 180;
      // تأرجح أمامي-خلفي حقيقي (z)، مع قليل من الحركة الجانبية ليُقرأ المشي من الأمام أيضاً
      const swingArm = (shx: number, a: number) => {
        const h = handAt(0, a, bend);
        const hand: Pt = [shx + h[0] * 0.35, h[1], h[0]];
        const elbow: Pt = [shx + h[0] * 0.15, (-122 + h[1]) / 2 + bend * 10, h[0] * 0.5 - bend * 16];
        return {from: [shx, -122] as Pt, mid: elbow, to: hand};
      };
      const A1 = swingArm(-B.sh + 4, a1);
      const A2 = swingArm(B.sh - 4, a2);
      arms = (
        <>
          <Arm from={A1.from} mid={A1.mid} to={A1.to} robe={robe} skin={skin} />
          <Arm from={A2.from} mid={A2.mid} to={A2.to} robe={robe} skin={skin} />
        </>
      );
      break;
    }
    case 'raise':
      // يرفع الشيء فوق الرأس
      arms = (
        <>
          <Arm from={sh} mid={[sh[0] - 22, -196]} to={[sh[0] - 4, -268 - Math.sin(frame / 6) * 4 * M.sc]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[56, -80]} to={[46, -52]} robe={robe} skin={skin} />
        </>
      );
      break;
    case 'swing': {
      // ضربة سيف: رفع للخلف ← ضربة سريعة ← عودة
      const p = (((frame + seed * 5) % 30) + 30) % 30 / 30;
      const ease = (t: number) => 1 - (1 - t) * (1 - t);
      const a = p < 0.6 ? 0.3 + (-2.8 - 0.3) * ease(p / 0.6) : p < 0.75 ? -2.8 + (1.0 + 2.8) * ((p - 0.6) / 0.15) : 1.0 + (0.3 - 1.0) * ((p - 0.75) / 0.25);
      const L = 72;
      const hand: Pt = [sh[0] + Math.sin(a) * L, -122 + Math.cos(a) * L, 26];
      const elbow: Pt = [sh[0] + Math.sin(a) * L * 0.5 - 14, -122 + Math.cos(a) * L * 0.5 + 6, 14];
      const strike = p >= 0.6 && p < 0.8;
      arms = (
        <>
          {strike && (
            <path
              d={`M ${sh[0] + Math.sin(-2.6) * 190} ${-122 + Math.cos(-2.6) * 190} A 190 190 0 0 1 ${sh[0] + Math.sin(a) * 190} ${-122 + Math.cos(a) * 190}`}
              fill="none"
              stroke="#fff"
              strokeWidth={14}
              opacity={0.55}
              strokeLinecap="round"
            />
          )}
          <Arm from={sh} mid={elbow} to={hand} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[56, -90]} to={[40, -64]} robe={robe} skin={skin} />
        </>
      );
      break;
    }
    case 'read':
      // يمسك الورقة أمام صدره بيديه ويقرأ
      arms = (
        <>
          <Arm from={sh} mid={[sh[0] - 10, -86, 30]} to={[-50, -108, 56]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[sh2[0] + 10, -86, 30]} to={[50, -108, 56]} robe={robe} skin={skin} />
        </>
      );
      break;
    case 'present':
      // يمد الشيء للأمام ويعرضه
      arms = (
        <>
          <Arm from={sh} mid={[sh[0] - 40, -104, 40]} to={[sh[0] - 70, -128, 72]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[56, -80]} to={[46, -52]} robe={robe} skin={skin} />
        </>
      );
      break;
    case 'aim':
      // يصوّب البندقية للأمام
      arms = (
        <>
          <Arm from={sh} mid={[-20, -120, 30]} to={[-4, -150, 44]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[60, -130, 40]} to={[74, -154, 62]} robe={robe} skin={skin} />
        </>
      );
      break;
    case 'shoulder':
      // الشيء على الكتف
      arms = (
        <>
          <Arm from={sh} mid={[sh[0] - 20, -110]} to={[sh[0] + 2, -150]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[56, -80]} to={[46, -52]} robe={robe} skin={skin} />
        </>
      );
      break;
    case 'phone':
      // اليد اليسرى عند الأذن (سماعة هاتف)
      arms = (
        <>
          <Arm from={sh} mid={[-56, -80]} to={[-46, -52]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[64, -140, 18]} to={[60, -194, 32]} robe={robe} skin={skin} />
        </>
      );
      break;
    case 'carry':
      // الشيء في اليد بجانب الجسم
      arms = (
        <>
          <Arm from={sh} mid={[sh[0] - 14, -92]} to={[sh[0] - 12, -60]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[56, -80]} to={[46, -52]} robe={robe} skin={skin} />
        </>
      );
      break;
    case 'fists': {
      // قبضتان مشدودتان بجانب الجسم وترتجفان
      const t = Math.sin(frame * 1.7) * 3 * M.sc;
      arms = (
        <>
          <Arm from={sh} mid={[-B.sh - 22, -96]} to={[-B.sh - 8 + t, -70]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[B.sh + 22, -96]} to={[B.sh + 8 - t, -70]} robe={robe} skin={skin} />
        </>
      );
      break;
    }
    case 'belly': {
      // يمسك بطنه من الضحك
      const t = Math.sin(frame / 3) * 3;
      arms = (
        <>
          <Arm from={sh} mid={[-B.sh - 18, -96]} to={[-16, -78 + t]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[B.sh + 18, -96]} to={[16, -74 - t]} robe={robe} skin={skin} />
        </>
      );
      break;
    }
    case 'droop':
      arms = (
        <>
          <Arm from={sh} mid={[-B.sh - 4, -84]} to={[-B.sh + 12, -46]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[B.sh + 4, -84]} to={[B.sh - 12, -46]} robe={robe} skin={skin} />
        </>
      );
      break;
    case 'cower': {
      // يحمي وجهه بيديه
      const t = Math.sin(frame * 2.2) * 2 * M.sc;
      arms = (
        <>
          <Arm from={sh} mid={[-B.sh - 30, -150, 30]} to={[-30 + t, -196, 62]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[B.sh + 30, -150, 30]} to={[30 - t, -200, 62]} robe={robe} skin={skin} />
        </>
      );
      break;
    }
    case 'gesture': {
      // خطيب: اليد تضرب الهواء مع إيقاع الكلام
      const beat = Math.max(0, Math.sin(frame / 7)) ** 2;
      arms = (
        <>
          <Arm from={sh} mid={[-B.sh - 20, -90]} to={[-B.sh - 6, -64]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[B.sh + 50, -150 + beat * 30]} to={[B.sh + 74, -190 + beat * 70]} robe={robe} skin={skin} />
        </>
      );
      break;
    }
    case 'cross':
      arms = (
        <>
          <Arm from={sh} mid={[-30, -80, 30]} to={[26, -96, 36]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[30, -76, 30]} to={[-24, -92, 36]} robe={robe} skin={skin} />
        </>
      );
      break;
    case 'chin':
      arms = (
        <>
          <Arm from={sh} mid={[-54, -70]} to={[-30, -84]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[52, -100, 20]} to={[14, -152, 52]} robe={robe} skin={skin} />
        </>
      );
      break;
    case 'point': {
      const w = Math.sin(frame / 4) * 4;
      arms = (
        <>
          <Arm from={sh} mid={[-56, -76]} to={[-42, -50]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[90, -150]} to={[132, -186 + w]} robe={robe} skin={skin} />
        </>
      );
      break;
    }
    case 'pull': {
      const tug = Math.sin((frame + seed * 9) / 5) * 6;
      arms = (
        <>
          <Arm from={sh} mid={[-74, -104]} to={[-96 + tug, -110]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[-20, -100]} to={[-70 + tug, -112]} robe={robe} skin={skin} />
        </>
      );
      break;
    }
    case 'armsUp': {
      const w = Math.sin(frame / 3) * 10;
      arms = (
        <>
          <Arm from={sh} mid={[-80, -150]} to={[-76 - w, -214]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[80, -150]} to={[76 + w, -214]} robe={robe} skin={skin} />
        </>
      );
      break;
    }
    case 'fist': {
      // قبضة مرفوعة بحماس
      const pump = Math.abs(Math.sin(frame / 5)) * 16;
      arms = (
        <>
          <Arm from={sh} mid={[-56, -80]} to={[-46, -52]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[76, -170]} to={[60, -250 - pump]} robe={robe} skin={skin} />
        </>
      );
      break;
    }
    case 'wave': {
      const w = Math.sin(frame / 4 + seed) * 16;
      arms = (
        <>
          <Arm from={sh} mid={[-56, -80]} to={[-46, -52]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[80, -160]} to={[70 + w, -240]} robe={robe} skin={skin} />
        </>
      );
      break;
    }
    case 'podium': {
      // يمسك حافة المنصة ويحرك يده أثناء الكلام
      const g = Math.sin(frame / 6) * 18;
      arms = (
        <>
          <Arm from={sh} mid={[-60, -96]} to={[-50, -70]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[80, -120 + g / 2]} to={[96, -150 + g]} robe={robe} skin={skin} />
        </>
      );
      break;
    }
    case 'stretch':
      arms = (
        <>
          <Arm from={sh} mid={[-60, -190]} to={[-20, -300]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[60, -190]} to={[20, -300]} robe={robe} skin={skin} />
        </>
      );
      break;
    default:
      arms = (
        <>
          <Arm from={sh} mid={[-56, -80]} to={[-46, -52]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[56, -80]} to={[46, -52]} robe={robe} skin={skin} />
        </>
      );
  }

  const longDress = outfit === 'dress' || outfit === 'abaya' || outfit === 'peasant' || outfit === 'cleric' || outfit === 'baby';
  const isFemale = build === 'female' || build === 'femaleFull';
  const showLashes = lashes ?? isFemale;
  const hijabColor = scarf ?? trim;
  const LEG = LEGS[build];
  const legs = longDress ? (
    <g fill={INK}>
      <ellipse cx={-15 + M.legA * 0.5} cy={-2 - M.liftA * 0.4} rx={14} ry={7} />
      <ellipse cx={15 + M.legB * 0.5} cy={-2 - M.liftB * 0.4} rx={14} ry={7} />
    </g>
  ) : pose === 'pull' ? (
    <g fill={INK}>
      <rect x={-6} y={-44} width={15} height={48} rx={6} transform="rotate(28 0 -40)" />
      <rect x={-6} y={-44} width={15} height={48} rx={6} transform="rotate(-18 0 -40)" />
    </g>
  ) : (
    <g fill={INK}>
      {/* في الجانب: الرجلان متقاربتان، البعيدة أفتح قليلاً وتُرسم أولاً، والقدم تشير للأمام */}
      <Leg hipX={LEG.hip * (0.3 + 0.7 * Math.abs(cy))} w={LEG.w} angle={M.legB * (0.35 + 0.65 * sy)} lift={M.liftB} toe={8 * sy} far={sy > 0.4} />
      <Leg hipX={-LEG.hip * (0.3 + 0.7 * Math.abs(cy))} w={LEG.w} angle={M.legA * (0.35 + 0.65 * sy)} lift={M.liftA} toe={8 * sy} />
    </g>
  );
  // تأرجح طرف الفستان مع المشي
  const hemSway = longDress ? M.swing * 0.35 : 0;

  // ===== قيم الالتفات =====
  const bodyW = 1 - 0.3 * sy; // الجسم أضيق من الجانب
  const coverK = (1 - cy) / 2; // 0 أمامي … 0.5 جانبي … 1 خلفي
  const coverX = -66 + 156 * coverK;
  const coverY = -192 + 44 * coverK;
  const backOnTop = cy < -0.2;

  // ===== منطقة الشعر =====
  const noDefaultHair =
    hat === 'none' ||
    hat === 'sultan' ||
    hat === 'vizier' ||
    hat === 'crown' ||
    hat === 'tiltedCrown' ||
    hat === 'oversizedCrown' ||
    hat === 'mitre';
  const hairKind: HairlineKind | null =
    hat === 'hijab'
      ? 'hijab'
      : hair
        ? hairStyle === 'bun' || hairStyle === 'ponytail' || hairStyle === 'braid'
          ? 'pulled'
          : hairStyle
        : !noDefaultHair
          ? 'short'
          : null;
  const hairColor = hat === 'hijab' ? hijabColor : hair ?? '#2a1d16';
  const bunBehind = hairStyle === 'bun' && hair && hat !== 'hijab' ? onHead(180, 46) : null;
  const hairRegion = hairKind ? (
    <g>
      <HairRegion id={`h${uid}`} kind={hairKind} yaw={yawDeg} faceD={F.d} color={hairColor} dTop={dTop} />
      {bunBehind && bunBehind.z >= 0 && <circle cx={bunBehind.x} cy={-268 + dTop} r={28} fill={hairColor} stroke={INK} strokeWidth={4} />}
    </g>
  ) : null;
  const backLayer = (
    <g transform={`translate(${-sy * 14} ${dTop})`}>
      {hat === 'hijab' && (
        <path
          d="M -80 -200 Q -84 -294 0 -296 Q 84 -294 80 -200 Q 84 -128 62 -104 Q 0 -90 -62 -104 Q -84 -128 -80 -200 Z"
          fill={hijabColor}
          stroke={INK}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
      )}
      {hair && hat !== 'hijab' && <BackHair style={hairStyle} color={hair} frame={frame} seed={seed} yaw={yawDeg} />}
    </g>
  );

  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}
    >
      {/* ظل على الأرض */}
      <ellipse cx={L ? -ldir * 12 : 0} cy={2} rx={L ? 54 : 46} ry={9} fill={L ? L.shadow : '#000'} opacity={L ? 0.45 : 0.28} />
      {pt && <ellipse cx={-pt.dir * 40 * pt.k} cy={3} rx={40 + 50 * pt.k} ry={8} fill="#000" opacity={0.25 * pt.k} />}
      {M.dust > 0 && <Dust frame={frame} phase={M.dustPhase} amount={M.dust} />}
      {legs}
      <g transform={`translate(${M.shakeX} ${bob + hop}) rotate(${lean} 0 -40) translate(0 -40) scale(${M.sqX} ${M.sqY}) translate(0 40)`}>
        {/* شعر خلفي / الجزء الخلفي من الحجاب: خلف الجسم، إلا في المنظر الخلفي فيغطي الظهر */}
        {!backOnTop && backLayer}
        {/* الذراع البعيدة خلف الجسم عند الالتفات */}
        {(
          <ArmCtx.Provider value={{cy, sy, slot: 'back'}}>
            <ArmShade.Provider value={shadeOn ? shadeOf(robe) : null}>
              <ItemCtx.Provider value={itemCtx}>{arms}</ItemCtx.Provider>
            </ArmShade.Provider>
          </ArmCtx.Provider>
        )}
        {/* الجسم: يضيق عند الالتفات */}
        <g transform={`scale(${bodyW} 1)`}>
          {/* الكرش يبرز للأمام في الجانب (يُرسم خلف الجسم فيظهر الجزء البارز فقط) */}
          {build === 'belly' && sy > 0.6 && <ellipse cx={(34 * sy) / bodyW} cy={-80} rx={32 / bodyW} ry={36} fill={robe} stroke={INK} strokeWidth={SW} />}
        {/* الجسم */}
        <path
          d={B.d}
          fill={robe}
          stroke={INK}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
        {robe2 && (
          <g>
            <defs>
              <clipPath id={`r2${uid}`}>
                <path d={B.d} />
              </clipPath>
            </defs>
            <rect x={0} y={-160} width={110} height={140} fill={robe2} clipPath={`url(#r2${uid})`} />
            <path d={B.d} fill="none" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          </g>
        )}
        {(longDress || outfit === 'skirt') && (
          <path
            d={
              outfit === 'baby'
                ? `M ${B.belt[0] - 8} -122 Q ${B.belt[0] - 32} -56 ${-74 + hemSway} -6 Q ${hemSway} 8 ${74 + hemSway} -6 Q ${-B.belt[0] + 32} -56 ${-B.belt[0] + 8} -122 Q 0 -138 ${B.belt[0] - 8} -122 Z`
                : longDress
                  ? `M ${B.belt[0]} ${(B.beltY ?? -78) + 4} Q ${B.belt[0] - 20} -40 ${-62 + hemSway} -6 Q ${hemSway} ${4 + Math.abs(hemSway) * 0.2} ${62 + hemSway} -6 Q ${-B.belt[0] + 20} -40 ${-B.belt[0]} ${(B.beltY ?? -78) + 4} Z`
                  : `M ${B.belt[0]} ${(B.beltY ?? -78) + 4} Q ${B.belt[0] - 16} -50 -56 -20 Q 0 -10 56 -20 Q ${-B.belt[0] + 16} -50 ${-B.belt[0]} ${(B.beltY ?? -78) + 4} Z`
            }
            fill={outfit === 'skirt' ? skirt ?? trim : robe}
            stroke={INK}
            strokeWidth={SW}
            strokeLinejoin="round"
          />
        )}
        {/* تفاصيل الواجهة الأمامية تنزاح وتضيق مع الالتفات وتختفي في الخلفي */}
        {cy > -0.05 ? (
          <g transform={`translate(${(sy * 22) / bodyW} 0) scale(${Math.max(0.22, cy)} 1)`}>
        {longDress && outfit !== 'baby' && (
          <g stroke={mixColor(robe.length === 7 ? robe : '#444444', '#1b1a22', 0.35)} strokeWidth={3} fill="none" opacity={0.6}>
            <path d="M -14 -70 Q -20 -40 -26 -8" />
            <path d="M 14 -70 Q 20 -40 26 -8" />
          </g>
        )}
        {B.bust && outfit !== 'armor' && (
          <path d="M -26 -112 Q -15 -100 -3 -108 M 3 -108 Q 15 -100 26 -112" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.55} />
        )}
        {(outfit === 'dress' || outfit === 'skirt') && (
          <rect x={B.belt[0]} y={(B.beltY ?? -78) - 2} width={B.belt[1]} height={9} rx={4} fill={trim} stroke={INK} strokeWidth={3} />
        )}
        {outfit === 'peasant' && (
          <g stroke={INK} strokeWidth={3.5} strokeLinejoin="round">
            {/* مريلة القرية البيضاء */}
            <path d={`M ${B.belt[0] + 6} ${(B.beltY ?? -86) + 2} L ${-B.belt[0] - 6} ${(B.beltY ?? -86) + 2} L ${36 + hemSway * 0.5} -12 Q ${hemSway * 0.5} -4 ${-36 + hemSway * 0.5} -12 Z`} fill={apron ?? '#f6f2e8'} />
            <rect x={B.belt[0]} y={(B.beltY ?? -86) - 3} width={B.belt[1]} height={9} rx={4} fill={apron ?? '#f6f2e8'} />
          </g>
        )}
        {outfit === 'cleric' && (
          <g stroke={INK} strokeWidth={3} strokeLinejoin="round">
            <path d="M -16 -138 L 16 -138 L 22 -14 L -22 -14 Z" fill={trim} />
            <path d="M -14 -138 Q 0 -126 14 -138" fill="#f6f2e8" />
            <path d="M 0 -116 L 0 -86 M -10 -104 L 10 -104" stroke="#e8b830" strokeWidth={4} strokeLinecap="round" />
          </g>
        )}
        {outfit === 'baby' && (
          <g stroke={INK} strokeWidth={3} strokeLinejoin="round">
            <path d="M -32 -130 Q -16 -108 0 -118 Q 16 -108 32 -130 Q 0 -140 -32 -130 Z" fill="#f7f4ec" />
            <path d="M 0 -118 L 0 -6" stroke={trim} strokeWidth={8} />
          </g>
        )}
        {outfit === 'royal' && (
          <g stroke={INK} strokeWidth={3} strokeLinejoin="round">
            {fur && (
              <>
                <path d={`M ${-B.sh - 4} -136 Q 0 -114 ${B.sh + 4} -136 Q 0 -152 ${-B.sh - 4} -136 Z`} fill={fur} />
                {[-20, -6, 8, 22].map((fx) => (
                  <circle key={fx} cx={fx} cy={-134} r={2} fill={INK} stroke="none" />
                ))}
                <rect x={-9} y={-124} width={18} height={86} fill={fur} />
              </>
            )}
            {!fur && <path d="M 0 -142 L 0 -40" stroke={trim} strokeWidth={6} />}
            <rect x={B.belt[0]} y={B.beltY ?? -78} width={B.belt[1]} height={11} rx={3} fill={trim} />
            <rect x={-8} y={(B.beltY ?? -78) - 2} width={16} height={15} rx={3} fill="#e8b830" />
            {ironRods && (
              <g stroke={INK} strokeWidth={2.5}>
                {/* قضبان حديدية مخيطة داخل رداء شارل السادس */}
                <rect x={-B.sh - 10} y={-118} width={8} height={82} rx={3} fill="#a8b2be" />
                <rect x={B.sh + 2} y={-118} width={8} height={82} rx={3} fill="#a8b2be" />
                <rect x={-26} y={-48} width={52} height={7} rx={2} fill="#a8b2be" />
                <circle cx={-B.sh - 6} cy={-96} r={2} fill="#3a404a" stroke="none" />
                <circle cx={B.sh + 6} cy={-96} r={2} fill="#3a404a" stroke="none" />
              </g>
            )}
          </g>
        )}
        {outfit === 'armor' && (
          <g stroke={INK} strokeWidth={3} strokeLinejoin="round">
            {/* درع فولاذي + كتفان معدنيان + لمعة */}
            <path d="M -26 -130 L -6 -108 L 14 -130" fill="none" stroke="#eef4fa" strokeWidth={4} opacity={0.75} />
            <path d="M -32 -88 Q 0 -80 32 -88 M -34 -64 Q 0 -56 34 -64" fill="none" stroke="#626b78" strokeWidth={3} />
            <ellipse cx={-B.sh - 4} cy={-126} rx={17} ry={12} fill="#b8c2ce" />
            <ellipse cx={B.sh + 4} cy={-126} rx={17} ry={12} fill="#b8c2ce" />
            {surcoat && (
              <path d={`M -28 -134 L 28 -134 L 34 -40 Q 0 -30 -34 -40 Z`} fill={surcoat} stroke={INK} strokeWidth={3.5} />
            )}
            <rect x={B.belt[0]} y={B.beltY ?? -78} width={B.belt[1]} height={10} rx={3} fill="#6a4626" />
            <rect x={-7} y={(B.beltY ?? -78) - 2} width={14} height={14} rx={2} fill={trim} />
          </g>
        )}
        {outfit === 'robe' && (
          <>
            <path d="M 0 -142 L 0 -40" stroke={trim} strokeWidth={6} />
            <rect x={B.belt[0]} y={B.beltY ?? -78} width={B.belt[1]} height={11} fill={trim} stroke={INK} strokeWidth={3} />
          </>
        )}
        {outfit === 'suit' && (
          <g stroke={INK} strokeLinejoin="round">
            <path d="M -20 -142 L 0 -92 L 20 -142 Z" fill="#f4f1ea" strokeWidth={3} />
            <path d="M -6 -138 L 6 -138 L 9 -104 L 0 -92 L -9 -104 Z" fill={tie} strokeWidth={3} />
            <path d="M -20 -142 L -6 -96 L -30 -112 M 20 -142 L 6 -96 L 30 -112" fill="none" strokeWidth={3} />
            <circle cx={0} cy={-72} r={3.5} fill={INK} stroke="none" />
            <circle cx={0} cy={-56} r={3.5} fill={INK} stroke="none" />
          </g>
        )}
        {outfit === 'uniform' && (
          <g stroke={INK} strokeWidth={3}>
            <rect x={B.belt[0]} y={-78} width={B.belt[1]} height={10} fill="#4a3a22" />
            <rect x={-6} y={-79} width={12} height={12} fill={trim} />
            <rect x={-B.sh - 10} y={-136} width={26} height={8} rx={3} fill={trim} />
            <rect x={B.sh - 16} y={-136} width={26} height={8} rx={3} fill={trim} />
            <path d="M -14 -142 L 0 -122 L 14 -142" fill="none" />
          </g>
        )}
        {/* شعارات العصور الوسطى على الصدر */}
        {emblem === 'fleur' && (
          <g transform="translate(0 -106) scale(0.9)" fill="#f2c43a" stroke={INK} strokeWidth={2.4} strokeLinejoin="round">
            <path d="M 0 -20 Q 8 -8 4 4 L -4 4 Q -8 -8 0 -20 Z" />
            <path d="M -3 3 Q -20 -8 -16 6 Q -10 12 -3 6 Z" />
            <path d="M 3 3 Q 20 -8 16 6 Q 10 12 3 6 Z" />
            <rect x={-10} y={4} width={20} height={5} rx={2} />
            <path d="M -5 9 L 0 18 L 5 9 Z" />
          </g>
        )}
        {emblem === 'cross' && (
          <g transform="translate(0 -106)" stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
            <path d="M -6 -20 L 6 -20 L 6 -6 L 20 -6 L 20 6 L 6 6 L 6 20 L -6 20 L -6 6 L -20 6 L -20 -6 L -6 -6 Z" fill="#f7f4ec" />
          </g>
        )}
        {emblem === 'saltire' && (
          <g transform="translate(0 -106)" stroke="#c0262d" strokeWidth={9} strokeLinecap="round">
            <line x1={-16} y1={-16} x2={16} y2={16} />
            <line x1={16} y1={-16} x2={-16} y2={16} />
          </g>
        )}
          </g>
        ) : (
          <g stroke={INK} strokeWidth={3}>
            <path d="M 0 -138 L 0 -44" fill="none" opacity={0.5} />
            {outfit !== 'abaya' && outfit !== 'suit' && <rect x={B.belt[0]} y={(B.beltY ?? -78) - 2} width={B.belt[1]} height={10} rx={4} fill={outfit === 'uniform' ? '#4a3a22' : trim} />}
            {outfit === 'suit' && <path d="M -22 -140 Q 0 -132 22 -140" fill="none" />}
          </g>
        )}
        {shadeOn && <Shade id={`b${uid}`} d={B.d} color={shadeOf(robe)} light={lightOf(robe)} mode={shadeMode} dx={16 * ldir} dy={-6} neck />}
        {L && <LightFX id={`bl${uid}`} d={B.d} L={L} ldir={ldir} pt={pt} />}
        </g>
        <ArmCtx.Provider value={{cy, sy, slot: 'mid'}}>
          <ArmShade.Provider value={shadeOn ? shadeOf(robe) : null}>
              <ItemCtx.Provider value={itemCtx}>{arms}</ItemCtx.Provider>
            </ArmShade.Provider>
        </ArmCtx.Provider>
        {backOnTop && backLayer}
        {/* الرأس */}
        <g transform={`rotate(${(pose === 'pull' ? 6 : 0) + M.headTilt} 0 -140)`}>
          {bunBehind && bunBehind.z < 0 && <circle cx={bunBehind.x} cy={-268 + dTop} r={28} fill={hairColor} stroke={INK} strokeWidth={4} />}
          <path d={F.d} fill={skin} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          {act === 'angry' && <path d={F.d} fill="#e0301e" opacity={(0.12 + 0.18 * energy) * (0.75 + 0.25 * Math.sin(frame / 4))} />}
          {shadeOn && <Shade id={`f${uid}`} d={F.d} color={shadeOf(skin, 0.34)} light={lightOf(skin)} mode={shadeMode} dx={14 * ldir} dy={-12} highlight={[26 * ldir, F.top + 34]} />}
          {L && <LightFX id={`hl${uid}`} d={F.d} L={L} ldir={ldir} pt={pt} />}
          {(rosy || (shadeMode === 'cel' && shadeOn)) &&
            [-36, 36].map((th) => {
              const p = onHead(th, 60);
              return p.z > 0.2 ? (
                <ellipse
                  key={th}
                  cx={p.x}
                  cy={-178}
                  rx={(rosy ? 14 : 11) * Math.min(1, p.z * 1.2)}
                  ry={rosy ? 8 : 6}
                  fill={rosy ? '#f27c82' : '#e0706a'}
                  opacity={rosy ? 0.52 : 0.28}
                />
              ) : null;
            })}
          {/* الأذنان: تظهران عند الالتفات */}
          {yawDeg > 12 &&
            hat !== 'hijab' &&
            [-90, 90].map((th) => {
              const p = onHead(th, 60);
              if (p.z < -0.3) return null;
              return (
                <g key={th}>
                  <ellipse cx={p.x} cy={-194} rx={7 + 4 * Math.max(0, p.z)} ry={14} fill={skin} stroke={INK} strokeWidth={4} />
                  {earrings && <circle cx={p.x} cy={-176} r={6} fill={earrings} stroke={INK} strokeWidth={2.5} />}
                </g>
              );
            })}
          {earrings && yawDeg <= 12 && hat !== 'hijab' && [-63, 63].map((ex) => <circle key={ex} cx={ex} cy={-178} r={6} fill={earrings} stroke={INK} strokeWidth={2.5} />)}
          {beard && cy > -0.3 && (
            <g transform={`translate(${onHead(0, 34).x} 0) scale(${1 - 0.35 * sy} 1)`}>
              <path
                d="M -50 -176 Q -46 -120 0 -112 Q 46 -120 50 -176 Q 30 -150 0 -152 Q -30 -150 -50 -176 Z"
                fill={beard}
                stroke={INK}
                strokeWidth={4}
              />
            </g>
          )}
          {/* الملامح: كل عين وحاجب على حدة حسب موقعه على كرة الرأس */}
          {[0, 1].map((i) => {
            const p = onHead(i ? 19 : -19, 56);
            if (p.z < 0.08) return null;
            const ex = i ? 21 : -21;
            const sx = Math.max(0.35, Math.min(1, p.z * 1.25));
            return (
              <g key={i} transform={`translate(${p.x} 0) scale(${sx} 1) translate(${-ex} 0)`}>
                <Brows expr={expr} heavy={heavyBrows} only={i as 0 | 1} />
                <Eyes
                  expr={expr}
                  blink={blink && expr !== 'shock' && expr !== 'dizzy' && !spiralEyes}
                  look={[Math.max(-1, Math.min(1, look[0] + 0.7 * sy)), look[1]]}
                  skin={skin}
                  lashes={showLashes}
                  spiralEyes={spiralEyes}
                  glasses={glasses}
                  only={i as 0 | 1}
                />
              </g>
            );
          })}
          {/* الأنف: يظهر عند الالتفات */}
          {sy > 0.12 && cy > -0.2 && (() => {
            const nx = onHead(0, 62).x;
            return (
              <path
                d={`M ${nx - 3} -204 Q ${nx + 6 + 12 * sy} -200 ${nx + 3 + 7 * sy} -186 Q ${nx} -183 ${nx - 3} -186`}
                fill={skin}
                stroke={INK}
                strokeWidth={3.5}
                strokeLinejoin="round"
              />
            );
          })()}
          {onHead(0, 60).z > -0.12 && (
            <g transform={`translate(${onHead(0, 58).x} 0) scale(${Math.max(0.42, onHead(0).z)} 1)`}>
              {mustache &&
                (droopMustache ? (
                  <path
                    d="M -38 -164 Q -26 -196 0 -188 Q 26 -196 38 -164 Q 24 -170 16 -178 Q 0 -178 -16 -178 Q -24 -170 -38 -164 Z"
                    fill={mustache}
                    stroke={INK}
                    strokeWidth={3.5}
                    strokeLinejoin="round"
                  />
                ) : (
                  <path d="M -30 -186 Q -14 -198 0 -190 Q 14 -198 30 -186 Q 16 -176 0 -182 Q -16 -176 -30 -186 Z" fill={mustache} stroke={INK} strokeWidth={3} />
                ))}
              <Mouth expr={expr} frame={frame} lips={lips} talk={talk} />
            </g>
          )}
          {(expr === 'strain' || sweat) && cy > -0.2 && (
            <path
              d={`M ${sweat ? 48 : 62} ${sweat ? -224 : -238} q 9 ${14 + (sweat ? Math.sin(frame / 10) * 3 : frame % 20)} 0 ${21 + (sweat ? Math.sin(frame / 10) * 3 : frame % 20)} q -9 -7 0 -${21 + (sweat ? Math.sin(frame / 10) * 3 : frame % 20)} Z`}
              fill="#7fc8ff"
              stroke={INK}
              strokeWidth={3}
            />
          )}
          {/* الشعر/الحجاب: منطقة واحدة فوق خط شعر يلتف حول الرأس — تُحسب لكل زاوية */}
          {hairRegion}
          {hat !== 'hijab' && (
            <g transform={`translate(${sy * 5} ${dTop}) scale(${1 - 0.08 * sy} 1)`}>
              <HatShape hat={hat} trim={trim} cy={cy} sy={sy} />
            </g>
          )}
          {act && <ActFX act={act} frame={frame} energy={energy} top={F.top} />}
        </g>
        {/* الأيدي المتقدمة أمام الوجه تُرسم بعد الرأس */}
        <ArmCtx.Provider value={{cy, sy, slot: 'front'}}>
          <ArmShade.Provider value={shadeOn ? shadeOf(robe) : null}>
            <ItemCtx.Provider value={itemCtx}>{arms}</ItemCtx.Provider>
          </ArmShade.Provider>
        </ArmCtx.Provider>
      </g>
    </g>
  );
};

/**
 * طبقة تظليل داخل شكل معيّن:
 * cel  = هلال ظل حاد في الجهة البعيدة عن الضوء (الضوء من أعلى اليسار) + لمعة
 * soft = تدرج دائري ناعم من الضوء إلى الظل
 */
const Shade: React.FC<{
  id: string;
  d: string;
  color: string;
  light: string;
  mode: Shading;
  dx: number;
  dy: number;
  highlight?: [number, number];
  neck?: boolean;
}> = ({id, d, color, light, mode, dx, dy, highlight, neck}) => (
  <g>
    <defs>
      <clipPath id={`c${id}`}>
        <path d={d} />
      </clipPath>
      {mode === 'cel' ? (
        <mask id={`m${id}`}>
          <path d={d} fill="#fff" />
          <path d={d} fill="#000" transform={`translate(${dx} ${dy})`} />
        </mask>
      ) : (
        <radialGradient id={`g${id}`} cx="0.32" cy="0.28" r="0.85">
          <stop offset="0%" stopColor={light} stopOpacity={0.55} />
          <stop offset="45%" stopColor={light} stopOpacity={0} />
          <stop offset="70%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0.85} />
        </radialGradient>
      )}
    </defs>
    {mode === 'cel' ? (
      <path d={d} fill={color} mask={`url(#m${id})`} opacity={0.9} />
    ) : (
      <path d={d} fill={`url(#g${id})`} />
    )}
    <g clipPath={`url(#c${id})`}>
      {neck && <ellipse cx={0} cy={-136} rx={40} ry={14} fill={color} opacity={0.55} />}
      {highlight && mode === 'cel' && (
        <ellipse cx={highlight[0]} cy={highlight[1]} rx={15} ry={8} fill="#fff" opacity={0.35} transform={`rotate(-30 ${highlight[0]} ${highlight[1]})`} />
      )}
    </g>
  </g>
);

/** الشعر الخلفي (يُرسم خلف الرأس والجسم) */
const BackHair: React.FC<{style: HairStyle; color: string; frame: number; seed: number; yaw?: number}> = ({style, color, frame, seed, yaw = 0}) => {
  // ذيل الحصان والضفيرة: خلف الرأس دائماً — يُعكسان في الجانب ويتوسطان في الخلفي
  const tail = yaw >= 150 ? 'translate(-62 8)' : yaw > 55 ? 'scale(-1 1)' : '';
  const st = {fill: color, stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const};
  const sway = Math.sin(frame / 9 + seed) * 6;
  switch (style) {
    case 'long':
      return <path d={`M -68 -222 Q -84 -150 -66 -92 Q -30 -84 0 -88 Q 30 -84 66 -92 Q 84 -150 68 -222 Q 0 -300 -68 -222 Z`} {...st} />;
    case 'bob':
      return <path d="M -74 -214 Q -80 -160 -62 -136 Q 0 -128 62 -136 Q 80 -160 74 -214 Q 0 -296 -74 -214 Z" {...st} />;
    case 'bowlCut':
      return <path d="M -72 -224 Q -74 -290 0 -292 Q 74 -290 72 -224 L 68 -216 L -68 -216 Z" {...st} />;
    case 'messy':
      return (
        <path
          d="M -70 -206 L -92 -236 L -68 -248 L -82 -278 L -46 -272 L -36 -302 L -8 -282 L 18 -304 L 36 -276 L 78 -282 L 66 -250 L 92 -236 L 68 -206 Q 0 -184 -70 -206 Z"
          {...st}
        />
      );
    case 'ponytail':
      return (
        <g transform={tail}>
          <path d={`M 44 -250 Q ${118 + sway} -236 ${104 + sway} -160 Q ${98 + sway} -126 ${78 + sway} -112 Q ${92 + sway} -168 56 -214 Z`} {...st} />
        </g>
      );
    case 'braid':
      return (
        <g transform={tail}>
          {Array.from({length: 7}, (_, i) => (
            <ellipse key={i} cx={52 + i * 3 + (sway * i) / 7} cy={-176 + i * 18} rx={13 - i * 0.6} ry={11} {...st} />
          ))}
        </g>
      );
    default:
      return null;
  }
};

/** الشعر الأمامي (فوق الوجه، تحت القبعة) */
const FrontHair: React.FC<{style: HairStyle; color: string}> = ({style, color}) => {
  const st = {fill: color, stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const};
  switch (style) {
    case 'short':
      return <path d="M -63 -206 Q -66 -262 -8 -270 Q 50 -272 64 -210 Q 58 -236 34 -246 Q 8 -238 -18 -248 Q -46 -240 -63 -206 Z" {...st} />;
    case 'bun':
      return (
        <g>
          <circle cx={0} cy={-276} r={28} {...st} />
          <path d="M -63 -206 Q -64 -268 0 -270 Q 64 -268 63 -206 Q 52 -248 0 -250 Q -52 -248 -63 -206 Z" {...st} />
        </g>
      );
    case 'long':
      return (
        <g>
          <path d="M -64 -206 Q -66 -270 0 -272 Q 66 -270 64 -206 Q 58 -240 28 -246 Q 4 -232 -6 -252 Q -34 -236 -64 -206 Z" {...st} />
          <path d="M -64 -210 Q -74 -166 -62 -132 L -52 -140 Q -58 -176 -56 -216 Z" {...st} />
          <path d="M 64 -210 Q 74 -166 62 -132 L 52 -140 Q 58 -176 56 -216 Z" {...st} />
        </g>
      );
    case 'bob':
      return (
        <g>
          <path d="M -66 -200 Q -68 -272 0 -274 Q 68 -272 66 -200 Q 56 -236 20 -238 Q 0 -244 -20 -238 Q -56 -236 -66 -200 Z" {...st} />
          <path d="M -66 -204 Q -72 -164 -60 -146 L -50 -150 Q -56 -176 -56 -210 Z" {...st} />
          <path d="M 66 -204 Q 72 -164 60 -146 L 50 -150 Q 56 -176 56 -210 Z" {...st} />
        </g>
      );
    default:
      // ponytail / braid: غرة مشدودة للخلف
      return <path d="M -63 -206 Q -64 -268 0 -270 Q 64 -268 63 -206 Q 50 -244 10 -246 Q -40 -244 -63 -206 Z" {...st} />;
  }
};

/* ===================== محرك الحركة ===================== */

/** أرجل كل بنية: نصف المسافة بين الوركين والعرض */
const LEGS: Record<Build, {hip: number; w: number}> = {
  normal: {hip: 16, w: 16},
  broad: {hip: 20, w: 20},
  belly: {hip: 20, w: 20},
  slim: {hip: 13, w: 14},
  female: {hip: 13.5, w: 13},
  femaleFull: {hip: 16, w: 15},
};

/** رِجل بسيطة تتأرجح من الورك (بلا ركبة) مع قدم بيضاوية */
const Leg: React.FC<{hipX: number; w: number; angle: number; lift: number; toe?: number; far?: boolean}> = ({hipX, w, angle, lift, toe = 0, far}) => (
  <g transform={`translate(${hipX} ${-44 - lift}) rotate(${angle})`} fill={far ? '#3a3846' : INK}>
    <rect x={-w / 2} y={0} width={w} height={44} rx={w / 2.4} />
    <ellipse cx={3 + toe} cy={44} rx={w * 0.8 + Math.abs(toe) * 0.6} ry={6.5} />
  </g>
);

type MotionState = {
  sc: number; // مضاعف الشدة
  swing: number; // زاوية تأرجح الأرجل (درجات)
  legA: number;
  legB: number;
  liftA: number;
  liftB: number;
  bodyY: number;
  tilt: number;
  shakeX: number;
  sqX: number;
  sqY: number;
  headTilt: number;
  dust: number; // 0..1 كمية الغبار
  dustPhase: number;
};

/**
 * يحسب كل قيم الحركة لإطار معيّن: إيقاع الخطوات من المسافة المقطوعة،
 * الارتداد، الميل، الضغط والمط، تأخير الرأس، وحركات التمثيل.
 */
const computeMotion = ({
  motion,
  travel,
  frame,
  s,
  energy,
  act,
  seed,
}: {
  motion: Motion;
  travel?: number;
  frame: number;
  s: number;
  energy: number;
  act?: Act;
  seed: number;
}): MotionState => {
  const sc = 0.5 + energy; // 0.8 هادئ … 1.5 مبالغ
  const m: MotionState = {sc, swing: 0, legA: 0, legB: 0, liftA: 0, liftB: 0, bodyY: 0, tilt: 0, shakeX: 0, sqX: 1, sqY: 1, headTilt: 0, dust: 0, dustPhase: 0};

  if (motion === 'walk' || motion === 'run') {
    const run = motion === 'run';
    const cycle = run ? 230 : 150; // طول دورة الخطوتين بوحدات الشخصية
    const dist = (travel ?? frame * (run ? 11 : 4.2) * s) / s;
    const ph = (dist / cycle) * Math.PI * 2 + seed;
    const sn = Math.sin(ph);
    const cs = Math.cos(ph);
    m.swing = sn * (run ? 36 : 18) * sc;
    m.legA = -m.swing;
    m.legB = m.swing;
    // الرجل المتقدمة ترتفع قليلاً في منتصف تأرجحها
    m.liftA = Math.max(0, cs) * (run ? 14 : 6) * sc;
    m.liftB = Math.max(0, -cs) * (run ? 14 : 6) * sc;
    const passing = 1 - Math.abs(sn); // 1 حين تتجاور الرجلان
    m.bodyY = -passing * (run ? 12 : 4) * sc;
    m.tilt = (run ? 10 : 3) * sc * 0.8 + sn * (run ? 2 : 1.5);
    const contact = Math.abs(sn) ** 6; // لحظة ملامسة الأرض
    m.sqY = 1 - contact * (run ? 0.07 : 0.03) * sc;
    m.sqX = 1 + contact * (run ? 0.05 : 0.02) * sc;
    m.headTilt = -sn * 2 * sc - (run ? 3 : 0);
    if (run) {
      m.dust = Math.min(1, energy + 0.3);
      m.dustPhase = ph;
    }
  } else if (motion === 'idle' || act) {
    // نقل الوزن ببطء + تنفّس
    const w = Math.sin(frame / 40 + seed);
    m.legA = w * 2 * sc;
    m.legB = w * 1 * sc;
    m.tilt = w * 1.2 * sc;
    m.bodyY = Math.sin(frame / 22 + seed) * 1.6;
    m.sqY = 1 + Math.sin(frame / 22 + seed) * 0.008;
  }

  switch (act) {
    case 'angry': {
      m.shakeX = Math.sin(frame * 2.3) * 1.6 * sc * energy;
      // ضربة قدم كل ٢٦ إطاراً
      const c = ((frame + seed * 7) % 26) / 26;
      const up = c < 0.6 ? Math.sin((c / 0.6) * Math.PI) : 0;
      m.legB = -8 * up * sc;
      m.liftB = 18 * up * sc;
      const slam = c >= 0.6 && c < 0.75 ? 1 - (c - 0.6) / 0.15 : 0;
      m.sqY = 1 - 0.07 * slam * sc;
      m.sqX = 1 + 0.05 * slam * sc;
      m.tilt = 6 * sc;
      m.headTilt = -3 * sc + Math.sin(frame * 1.1) * 1.5 * energy;
      m.dust = slam > 0 ? slam * energy : 0;
      m.dustPhase = Math.PI / 2;
      break;
    }
    case 'laugh': {
      const b = Math.abs(Math.sin(frame / 3.2));
      m.bodyY = -b * 7 * sc;
      m.sqY = 1 + b * 0.03 * sc;
      m.sqX = 1 - b * 0.02 * sc;
      m.tilt = -5 * sc;
      m.headTilt = -6 * sc + Math.sin(frame / 3.2) * 2 * sc;
      break;
    }
    case 'sad': {
      m.bodyY = 5 * sc + Math.sin(frame / 30) * 1.5;
      m.tilt = 4 * sc;
      m.headTilt = 9 * sc;
      m.sqY = 0.97;
      break;
    }
    case 'scared': {
      m.shakeX = Math.sin(frame * 3.1) * 2.4 * sc;
      m.sqY = 0.93 - 0.02 * energy;
      m.sqX = 1.03;
      m.bodyY = 4;
      m.tilt = -4 * sc;
      break;
    }
    case 'orate': {
      const beat = Math.max(0, Math.sin(frame / 7)) ** 2;
      m.tilt = 2 + beat * 5 * sc;
      m.headTilt = beat * 3 * sc;
      m.bodyY = -beat * 3 * sc;
      break;
    }
    case 'cheer': {
      const j = Math.abs(Math.sin(frame / 6.5));
      m.bodyY = -j * 34 * sc;
      m.liftA = m.liftB = j * 30 * sc;
      m.legA = -6 * j;
      m.legB = 6 * j;
      const land = j < 0.18 ? 1 - j / 0.18 : 0;
      m.sqY = 1 - land * 0.08 * sc + j * 0.04;
      m.sqX = 1 + land * 0.06 * sc;
      break;
    }
  }
  return m;
};

/** غبار عند ملامسة الأرض في الجري أو ضرب القدم */
const Dust: React.FC<{frame: number; phase: number; amount: number}> = ({frame, phase, amount}) => {
  const c = (((phase / Math.PI) % 1) + 1) % 1;
  return (
    <g opacity={0.55 * amount}>
      {[0, 1, 2].map((i) => {
        const a = (c + i * 0.18) % 1;
        return <circle key={i} cx={-20 - a * 50 - i * 12} cy={-4 - a * 18} r={6 + a * 16} fill="#c9b9a0" opacity={1 - a} />;
      })}
    </g>
  );
};

/** مؤثرات التمثيل: علامة الغضب، البخار، العرق، … */
const ActFX: React.FC<{act: Act; frame: number; energy: number; top: number}> = ({act, frame, energy, top}) => {
  switch (act) {
    case 'angry': {
      const p = 1 + Math.sin(frame / 3) * 0.15;
      return (
        <g>
          {/* 💢 */}
          <g transform={`translate(56 ${top + 30}) scale(${p * (0.7 + 0.5 * energy)})`} stroke="#d8231a" strokeWidth={6} strokeLinecap="round" fill="none">
            <path d="M -14 -4 Q -6 -6 -4 -14" />
            <path d="M 4 -14 Q 6 -6 14 -4" />
            <path d="M 14 4 Q 6 6 4 14" />
            <path d="M -4 14 Q -6 6 -14 4" />
          </g>
          {energy > 0.5 &&
            [-1, 1].map((side) =>
              [0, 1, 2].map((i) => {
                const a = ((frame / 18 + i / 3) % 1 + 1) % 1;
                return <circle key={`${side}-${i}`} cx={side * (58 + a * 30)} cy={top + 20 - a * 60} r={8 + a * 12} fill="#f4f4f4" stroke="#1b1a22" strokeWidth={2} opacity={(1 - a) * 0.9} />;
              }),
            )}
        </g>
      );
    }
    case 'scared':
      return (
        <g>
          {[0, 1, 2].map((i) => {
            const a = ((frame / 14 + i / 3) % 1 + 1) % 1;
            const side = i % 2 ? 1 : -1;
            return (
              <path
                key={i}
                d={`M ${side * (66 + a * 30)} ${top + 40 + a * 30} q 7 12 0 17 q -7 -5 0 -17 Z`}
                fill="#7fc8ff"
                stroke="#1b1a22"
                strokeWidth={2.5}
                opacity={1 - a}
              />
            );
          })}
        </g>
      );
    case 'sad':
      return energy > 0.6 ? (
        <g stroke="#6a86b8" strokeWidth={4} strokeLinecap="round" opacity={0.7}>
          {[-40, -10, 20, 50].map((x, i) => (
            <line key={x} x1={x} y1={top - 40 + ((frame * 3 + i * 17) % 40)} x2={x - 4} y2={top - 28 + ((frame * 3 + i * 17) % 40)} />
          ))}
        </g>
      ) : null;
    default:
      return null;
  }
};

/**
 * التفات ناعم: يستوفي زاوية الاتجاه بين مفاتيح {f, view}. الالتفات من الأمام للجانب يمر بالثلاثة أرباع تلقائياً.
 * مثال: view={yawAt(frame, [{f: 0, view: 'side'}, {f: 20, view: 'front'}])}
 */
export const yawAt = (frame: number, keys: {f: number; view: View | number}[]): number => {
  const ks = keys.map((k) => ({f: k.f, y: typeof k.view === 'number' ? k.view : VIEW_YAW[k.view]}));
  if (frame <= ks[0].f) return ks[0].y;
  for (let i = 1; i < ks.length; i++) {
    if (frame <= ks[i].f) {
      const t = (frame - ks[i - 1].f) / Math.max(1, ks[i].f - ks[i - 1].f);
      const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      return ks[i - 1].y + (ks[i].y - ks[i - 1].y) * e;
    }
  }
  return ks[ks.length - 1].y;
};

/* ===================== خط الشعر حول الرأس ===================== */
export type HairlineKind = 'short' | 'bob' | 'long' | 'pulled' | 'hijab' | 'bowlCut' | 'messy';

/**
 * ارتفاع خط الشعر (y) حسب الزاوية حول الرأس: 0 = منتصف الجبهة، 90 = فوق الأذن، 180 = مؤخرة الرأس.
 * كل ما فوق الخط شعر. القيم الأصغر = أعلى.
 */
const HAIRLINE: Record<HairlineKind, {pts: [number, number][]; vol: number}> = {
  short: {pts: [[0, -238], [40, -233], [68, -214], [90, -202], [130, -186], [180, -176]], vol: 1.05},
  pulled: {pts: [[0, -242], [40, -236], [68, -218], [90, -206], [130, -190], [180, -180]], vol: 1.04},
  bob: {pts: [[0, -232], [32, -228], [58, -204], [74, -168], [92, -146], [180, -146]], vol: 1.1},
  long: {pts: [[0, -236], [30, -232], [56, -208], [72, -170], [92, -140], [180, -140]], vol: 1.1},
  hijab: {pts: [[0, -250], [28, -244], [48, -212], [62, -160], [76, -112], [180, -100]], vol: 1.13},
  bowlCut: {pts: [[0, -224], [55, -224], [90, -222], [135, -218], [180, -216]], vol: 1.09},
  messy: {pts: [[0, -240], [32, -228], [64, -222], [95, -204], [135, -188], [180, -178]], vol: 1.08},
};

const hairlineY = (kind: HairlineKind, theta: number) => {
  let t = Math.abs(((theta + 540) % 360) - 180); // 0..180
  const pts = HAIRLINE[kind].pts;
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const k = (t - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]);
      const e = k * k * (3 - 2 * k);
      return pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * e;
    }
  }
  return pts[pts.length - 1][1];
};

/**
 * منطقة الشعر المرئية لزاوية معينة: لكل x على نصف الكرة المواجه للكاميرا نحسب
 * زاوية النقطة حول الرأس ثم ارتفاع خط الشعر عندها — فيلتف الشعر بسلاسة مع الالتفات.
 */
const HairRegion: React.FC<{id: string; kind: HairlineKind; yaw: number; faceD: string; color: string; dTop: number}> = ({id, kind, yaw, faceD, color, dTop}) => {
  const R = 66;
  const N = 36;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const x = -R + (2 * R * i) / N;
    const a = (Math.asin(Math.max(-1, Math.min(1, x / R))) * 180) / Math.PI;
    pts.push([x, hairlineY(kind, a - yaw) + dTop * 0.3]);
  }
  const line = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const region = `M -120 -420 L -120 ${pts[0][1]} L ${line.slice(2)} L 120 ${pts[N][1]} L 120 -420 Z`;
  const vol = HAIRLINE[kind].vol;
  const volT = `translate(0 -200) scale(${vol}) translate(0 200)`;
  return (
    <g>
      <defs>
        <clipPath id={`hv${id}`}>
          <path d={faceD} transform={volT} />
        </clipPath>
        <clipPath id={`hr${id}`}>
          <path d={region} />
        </clipPath>
      </defs>
      <g clipPath={`url(#hv${id})`}>
        <path d={region} fill={color} />
        <path d={line} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>
      {/* حافة حجم الشعر — لا تُرسم للحجاب لأن الطرف المنسدل يرسم حدوده */}
      {kind !== 'hijab' && (
        <g clipPath={`url(#hr${id})`}>
          <path d={faceD} transform={volT} fill="none" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
};

/**
 * طبقات الإضاءة فوق شكل (رأس أو جسم):
 *  - صبغة الجو (لون ظل المشهد بشدة ambient)
 *  - حافة ضوء رفيعة بلون الضوء الرئيسي في الجهة المواجهة له
 *  - إن وُجد مصدر نقطي قريب: حافة دافئة من جهته + توهج خفيف
 */
const LightFX: React.FC<{id: string; d: string; L: CharLight; ldir: number; pt: {color: string; k: number; dir: number} | null}> = ({id, d, L, ldir, pt}) => (
  <g>
    <defs>
      <mask id={`rim${id}`}>
        <path d={d} fill="#fff" />
        <path d={d} fill="#000" transform={`translate(${-ldir * 8} 5)`} />
      </mask>
      {pt && (
        <mask id={`pt${id}`}>
          <path d={d} fill="#fff" />
          <path d={d} fill="#000" transform={`translate(${-pt.dir * 12} 3)`} />
        </mask>
      )}
    </defs>
    {L.ambient > 0 && <path d={d} fill={L.shadow} opacity={L.ambient} />}
    {pt && <path d={d} fill={pt.color} opacity={0.22 * pt.k} />}
    <path d={d} fill={L.key} mask={`url(#rim${id})`} opacity={L.rim * (pt ? 1 - pt.k * 0.6 : 1)} />
    {pt && <path d={d} fill={pt.color} mask={`url(#pt${id})`} opacity={Math.min(1, 1.2 * pt.k)} />}
  </g>
);
