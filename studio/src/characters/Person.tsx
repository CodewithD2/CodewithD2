import React from 'react';
import {INK, mixColor} from '../lib/util';

/*
 * شخصية بأسلوب كرتوني مبسّط: رأس مستدير كبير، عيون نقطية، خط خارجي سميك،
 * جسم صغير وأذرع مرنة. نقطة الأصل (0,0) عند القدمين، والطول ≈ 270 وحدة.
 */

export type Expr = 'neutral' | 'smug' | 'shock' | 'think' | 'strain' | 'idea' | 'sleepy' | 'happy' | 'speak' | 'shout';
export type Hat = 'sultan' | 'vizier' | 'byzHelmet' | 'bork' | 'cap' | 'officerCap' | 'hijab' | 'crown' | 'none';
export type Outfit = 'robe' | 'suit' | 'uniform' | 'dress' | 'skirt' | 'abaya';
/** تسريحات الشعر */
export type HairStyle = 'short' | 'long' | 'bun' | 'ponytail' | 'bob' | 'braid';
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
const shadeOf = (c: string, k = 0.38) => (c.startsWith('#') && c.length === 7 ? mixColor(c, '#3a2244', k) : 'rgba(40,20,50,0.35)');
const lightOf = (c: string, k = 0.35) => (c.startsWith('#') && c.length === 7 ? mixColor(c, '#fff4e0', k) : 'rgba(255,255,255,0.3)');
export type Pose = 'stand' | 'cross' | 'chin' | 'point' | 'pull' | 'armsUp' | 'stretch' | 'fist' | 'wave' | 'podium';

export type PersonProps = {
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  rot?: number;
  frame: number;
  seed?: number;
  skin?: string;
  robe: string;
  trim?: string;
  hat: Hat;
  expr: Expr;
  pose: Pose;
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
  hairStyle?: HairStyle;
  /** رموش (تلقائياً مع البنية الأنثوية) */
  lashes?: boolean;
  lips?: string;
  earrings?: string;
  /** لون الحجاب (افتراضياً trim) */
  scarf?: string;
  /** لون التنورة في outfit='skirt' */
  skirt?: string;
  look?: [number, number];
  /** 0..1 للانتقال الحاد في التعبير (مثل قفزة الصدمة) */
  jolt?: number;
};

const SW = 5; // سُمك الخط الخارجي

const ArmShade = React.createContext<string | null>(null);

const Arm: React.FC<{from: [number, number]; mid: [number, number]; to: [number, number]; robe: string; skin: string}> = ({
  from,
  mid,
  to,
  robe,
  skin,
}) => {
  const d = `M ${from[0]} ${from[1]} Q ${mid[0]} ${mid[1]} ${to[0]} ${to[1]}`;
  const shade = React.useContext(ArmShade);
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={24} fill="none" strokeLinecap="round" />
      <path d={d} stroke={robe} strokeWidth={14} fill="none" strokeLinecap="round" />
      {shade && <path d={d} stroke={shade} strokeWidth={5} fill="none" strokeLinecap="round" transform="translate(2 4)" opacity={0.85} />}
      <circle cx={to[0]} cy={to[1]} r={11} fill={skin} stroke={INK} strokeWidth={SW - 1} />
    </g>
  );
};

const Eyes: React.FC<{expr: Expr; blink: boolean; look: [number, number]; skin: string; lashes?: boolean}> = ({expr, blink, look, skin, lashes}) => {
  const [lx, ly] = look;
  const E = [-21, 21];
  const ey = -206;
  if (expr === 'strain') {
    return (
      <g stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none">
        <path d={`M ${E[0] - 9} ${ey - 7} L ${E[0] + 6} ${ey} L ${E[0] - 9} ${ey + 7}`} />
        <path d={`M ${E[1] + 9} ${ey - 7} L ${E[1] - 6} ${ey} L ${E[1] + 9} ${ey + 7}`} />
      </g>
    );
  }
  if (expr === 'sleepy' || blink) {
    return (
      <g stroke={INK} strokeWidth={5} strokeLinecap="round">
        {E.map((x) => (
          <line key={x} x1={x - 8} y1={ey + 2} x2={x + 8} y2={ey + 2} />
        ))}
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
      {expr === 'smug' &&
        E.map((x) => (
          <g key={`lid${x}`}>
            <rect x={x - 12} y={ey - 16} width={24} height={14} fill={skin} />
            <line x1={x - 10} y1={ey - 2} x2={x + 10} y2={ey - 2} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          </g>
        ))}
    </g>
  );
};

const Brows: React.FC<{expr: Expr}> = ({expr}) => {
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
    shout: [2, 8, 2, -8],
  };
  const [ly, ls, ry, rs] = b[expr];
  return (
    <g stroke={INK} strokeWidth={6} strokeLinecap="round">
      <line x1={-33} y1={y + ly - ls} x2={-11} y2={y + ly + ls} />
      <line x1={11} y1={y + ry + rs} x2={33} y2={y + ry - rs} />
    </g>
  );
};

const Mouth: React.FC<{expr: Expr; frame: number; lips?: string}> = ({expr, frame, lips}) => {
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
    default:
      return <line x1={-10} y1={y} x2={10} y2={y} stroke={INK} strokeWidth={5} strokeLinecap="round" />;
  }
};

const HatShape: React.FC<{hat: Hat; trim: string}> = ({hat, trim}) => {
  switch (hat) {
    case 'sultan':
      // عمامة ضخمة بيضاء يعلوها قاووق أحمر
      return (
        <g stroke={INK} strokeWidth={SW}>
          <path d="M -30 -262 Q -26 -330 0 -334 Q 26 -330 30 -262 Z" fill="#c0262d" />
          <ellipse cx={0} cy={-252} rx={86} ry={46} fill="#f6f1e4" />
          <path d="M -70 -262 Q 0 -232 70 -262" fill="none" strokeWidth={3} />
          <path d="M -58 -280 Q 0 -250 58 -280" fill="none" strokeWidth={3} />
          <circle cx={0} cy={-246} r={10} fill={trim} />
          <path d="M 0 -256 Q 6 -300 18 -306" fill="none" stroke={INK} strokeWidth={4} />
          <ellipse cx={20} cy={-310} rx={6} ry={12} fill="#fff" strokeWidth={3} />
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
          <rect x={-5} y={-236} width={10} height={20} fill="#9aa3ad" />
        </g>
      );
    case 'bork':
      // قبعة الإنكشارية البيضاء الطويلة المنثنية للخلف
      return (
        <g stroke={INK} strokeWidth={SW}>
          <path d="M 40 -262 Q 30 -330 -10 -360 Q -60 -380 -110 -330 Q -60 -340 -30 -300 Q -40 -280 -44 -262 Z" fill="#f4efe2" />
          <rect x={-56} y={-272} width={110} height={24} rx={8} fill={trim} />
          <path d="M -6 -270 L 0 -318 L 6 -270 Z" fill={trim} />
        </g>
      );
    case 'hijab':
      // الجزء الأمامي من الحجاب: إطار حول الوجه (الجزء الخلفي يُرسم قبل الرأس)
      return (
        <path
          d="M -68 -192 Q -72 -280 0 -284 Q 72 -280 68 -192 Q 64 -252 0 -258 Q -64 -252 -68 -192 Z"
          fill={trim}
          stroke={INK}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
      );
    case 'crown':
      return (
        <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
          <path d="M -46 -252 L -50 -306 L -24 -280 L 0 -318 L 24 -280 L 50 -306 L 46 -252 Z" fill="#e8b830" />
          <rect x={-48} y={-262} width={96} height={14} rx={4} fill="#d9a020" />
          {[-28, 0, 28].map((cx, i) => (
            <circle key={cx} cx={cx} cy={-255} r={5} fill={['#c0262d', '#2f6fae', '#2f8f5a'][i]} strokeWidth={2} />
          ))}
        </g>
      );
    case 'officerCap':
      // كاب ضابط بحافة أمامية وشارة
      return (
        <g stroke={INK} strokeWidth={SW} strokeLinejoin="round">
          <path d="M -66 -244 Q -70 -300 0 -304 Q 70 -300 66 -244 Z" fill="#8a7b4e" />
          <rect x={-64} y={-256} width={128} height={16} fill="#5a4e30" />
          <path d="M -50 -240 Q 10 -232 74 -246 Q 60 -226 -40 -230 Z" fill="#2a2418" />
          <circle cx={0} cy={-276} r={10} fill={trim} />
        </g>
      );
    case 'cap':
      return (
        <g stroke={INK} strokeWidth={SW}>
          <path d="M -58 -238 Q -60 -296 0 -298 Q 60 -296 58 -238 Q 0 -256 -58 -238 Z" fill={trim} />
          <path d="M -58 -240 Q 0 -262 58 -240" fill="none" strokeWidth={3} />
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
  skin = '#f2c6a0',
  robe,
  trim = '#d9a520',
  hat,
  expr,
  pose,
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
  look = [0, 0],
  jolt = 0,
}) => {
  // رمش كل ثلاث ثوانٍ تقريباً، مع اختلاف التوقيت بين الشخصيات
  const blink = (frame + seed * 37) % 97 < 4;
  // تنفّس / ارتداد خفيف
  const bob = pose === 'pull' ? Math.sin((frame + seed * 9) / 5) * 4 : Math.sin((frame + seed * 13) / 18) * 2.5;
  const lean = pose === 'pull' ? 14 + Math.sin((frame + seed * 9) / 5) * 4 : 0;
  const hop = -jolt * 28;

  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const B = BODY[build];
  const F = FACE[face];
  const dTop = F.top + 264; // إزاحة الشعر والقبعة حسب ارتفاع الرأس
  const sh: [number, number] = [-B.sh, -122];
  const sh2: [number, number] = [B.sh, -122];
  let arms: React.ReactNode;
  switch (pose) {
    case 'cross':
      arms = (
        <>
          <Arm from={sh} mid={[-30, -80]} to={[26, -96]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[30, -76]} to={[-24, -92]} robe={robe} skin={skin} />
        </>
      );
      break;
    case 'chin':
      arms = (
        <>
          <Arm from={sh} mid={[-54, -70]} to={[-30, -84]} robe={robe} skin={skin} />
          <Arm from={sh2} mid={[52, -100]} to={[14, -152]} robe={robe} skin={skin} />
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

  const longDress = outfit === 'dress' || outfit === 'abaya';
  const isFemale = build === 'female' || build === 'femaleFull';
  const showLashes = lashes ?? isFemale;
  const hijabColor = scarf ?? trim;
  const legs = longDress ? (
    <g fill={INK}>
      <ellipse cx={-15} cy={-2} rx={14} ry={7} />
      <ellipse cx={15} cy={-2} rx={14} ry={7} />
    </g>
  ) : isFemale && pose !== 'pull' ? (
    <g fill={INK}>
      <rect x={-20} y={-44} width={13} height={46} rx={6} />
      <rect x={7} y={-44} width={13} height={46} rx={6} />
    </g>
  ) :
    pose === 'pull' ? (
      <g fill={INK}>
        <rect x={-6} y={-44} width={15} height={48} rx={6} transform="rotate(28 0 -40)" />
        <rect x={-6} y={-44} width={15} height={48} rx={6} transform="rotate(-18 0 -40)" />
      </g>
    ) : (
      <g fill={INK}>
        <rect x={build === 'slim' ? -20 : build === 'normal' ? -24 : -30} y={-44} width={build === 'slim' ? 14 : build === 'normal' ? 16 : 20} height={46} rx={6} />
        <rect x={build === 'slim' ? 6 : build === 'normal' ? 8 : 10} y={-44} width={build === 'slim' ? 14 : build === 'normal' ? 16 : 20} height={46} rx={6} />
      </g>
    );

  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}
    >
      {/* ظل على الأرض */}
      <ellipse cx={0} cy={2} rx={46} ry={9} fill="rgba(0,0,0,0.28)" />
      {legs}
      <g transform={`translate(0 ${bob + hop}) rotate(${lean} 0 -40)`}>
        {/* شعر خلفي / الجزء الخلفي من الحجاب — قبل الجسم والرأس */}
        <g transform={`translate(0 ${dTop})`}>
          {hat === 'hijab' && (
            <path
              d="M -80 -200 Q -84 -294 0 -296 Q 84 -294 80 -200 Q 84 -128 62 -104 Q 0 -90 -62 -104 Q -84 -128 -80 -200 Z"
              fill={hijabColor}
              stroke={INK}
              strokeWidth={SW}
              strokeLinejoin="round"
            />
          )}
          {hair && hat !== 'hijab' && <BackHair style={hairStyle} color={hair} frame={frame} seed={seed} />}
        </g>
        {/* الجسم */}
        <path
          d={B.d}
          fill={robe}
          stroke={INK}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
        {(longDress || outfit === 'skirt') && (
          <path
            d={
              longDress
                ? `M ${B.belt[0]} ${(B.beltY ?? -78) + 4} Q ${B.belt[0] - 20} -40 -62 -6 Q 0 4 62 -6 Q ${-B.belt[0] + 20} -40 ${-B.belt[0]} ${(B.beltY ?? -78) + 4} Z`
                : `M ${B.belt[0]} ${(B.beltY ?? -78) + 4} Q ${B.belt[0] - 16} -50 -56 -20 Q 0 -10 56 -20 Q ${-B.belt[0] + 16} -50 ${-B.belt[0]} ${(B.beltY ?? -78) + 4} Z`
            }
            fill={outfit === 'skirt' ? skirt ?? trim : robe}
            stroke={INK}
            strokeWidth={SW}
            strokeLinejoin="round"
          />
        )}
        {longDress && (
          <g stroke={mixColor(robe.length === 7 ? robe : '#444444', '#1b1a22', 0.35)} strokeWidth={3} fill="none" opacity={0.6}>
            <path d="M -14 -70 Q -20 -40 -26 -8" />
            <path d="M 14 -70 Q 20 -40 26 -8" />
          </g>
        )}
        {B.bust && (
          <path d="M -26 -112 Q -15 -100 -3 -108 M 3 -108 Q 15 -100 26 -112" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.55} />
        )}
        {(outfit === 'dress' || outfit === 'skirt') && (
          <rect x={B.belt[0]} y={(B.beltY ?? -78) - 2} width={B.belt[1]} height={9} rx={4} fill={trim} stroke={INK} strokeWidth={3} />
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
        {shading !== 'none' && <Shade id={`b${uid}`} d={B.d} color={shadeOf(robe)} light={lightOf(robe)} mode={shading} dx={-16} dy={-6} neck />}
        <ArmShade.Provider value={shading === 'none' ? null : shadeOf(robe)}>{arms}</ArmShade.Provider>
        {/* الرأس */}
        <g transform={`rotate(${pose === 'pull' ? 6 : 0} 0 -200)`}>
          <path d={F.d} fill={skin} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          {shading !== 'none' && <Shade id={`f${uid}`} d={F.d} color={shadeOf(skin, 0.34)} light={lightOf(skin)} mode={shading} dx={-14} dy={-12} highlight={[-26, F.top + 34]} />}
          {shading === 'cel' &&
            [-38, 38].map((cx) => <ellipse key={cx} cx={cx} cy={-178} rx={11} ry={6} fill="#e0706a" opacity={0.28} />)}
          {beard && (
            <path
              d="M -50 -176 Q -46 -120 0 -112 Q 46 -120 50 -176 Q 30 -150 0 -152 Q -30 -150 -50 -176 Z"
              fill={beard}
              stroke={INK}
              strokeWidth={4}
            />
          )}
          {hair && (hat === 'none' || hat === 'officerCap' || hat === 'crown') && (
            <g transform={`translate(0 ${dTop})`}>
              <FrontHair style={hairStyle} color={hair} />
            </g>
          )}
          {earrings && hat !== 'hijab' && [-63, 63].map((ex) => <circle key={ex} cx={ex} cy={-178} r={6} fill={earrings} stroke={INK} strokeWidth={2.5} />)}
          {mustache && <path d="M -30 -186 Q -14 -198 0 -190 Q 14 -198 30 -186 Q 16 -176 0 -182 Q -16 -176 -30 -186 Z" fill={mustache} stroke={INK} strokeWidth={3} />}
          <Brows expr={expr} />
          <Eyes expr={expr} blink={blink && expr !== 'shock'} look={look} skin={skin} lashes={showLashes} />
          <Mouth expr={expr} frame={frame} lips={lips} />
          {expr === 'strain' && (
            <path
              d={`M 62 -236 q 9 ${14 + (frame % 20)} 0 ${20 + (frame % 20)} q -9 -6 0 -${20 + (frame % 20)} Z`}
              fill="#7fc8ff"
              stroke={INK}
              strokeWidth={3}
            />
          )}
          <g transform={`translate(0 ${dTop})`}>
            <HatShape hat={hat} trim={hat === 'hijab' ? hijabColor : trim} />
          </g>
        </g>
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
const BackHair: React.FC<{style: HairStyle; color: string; frame: number; seed: number}> = ({style, color, frame, seed}) => {
  const st = {fill: color, stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const};
  const sway = Math.sin(frame / 9 + seed) * 6;
  switch (style) {
    case 'long':
      return <path d={`M -68 -222 Q -84 -150 -66 -92 Q -30 -84 0 -88 Q 30 -84 66 -92 Q 84 -150 68 -222 Q 0 -300 -68 -222 Z`} {...st} />;
    case 'bob':
      return <path d="M -74 -214 Q -80 -160 -62 -136 Q 0 -128 62 -136 Q 80 -160 74 -214 Q 0 -296 -74 -214 Z" {...st} />;
    case 'ponytail':
      return <path d={`M 44 -250 Q ${118 + sway} -236 ${104 + sway} -160 Q ${98 + sway} -126 ${78 + sway} -112 Q ${92 + sway} -168 56 -214 Z`} {...st} />;
    case 'braid':
      return (
        <g>
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
