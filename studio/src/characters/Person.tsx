import React from 'react';
import {INK} from '../lib/util';

/*
 * شخصية بأسلوب كرتوني مبسّط: رأس مستدير كبير، عيون نقطية، خط خارجي سميك،
 * جسم صغير وأذرع مرنة. نقطة الأصل (0,0) عند القدمين، والطول ≈ 270 وحدة.
 */

export type Expr = 'neutral' | 'smug' | 'shock' | 'think' | 'strain' | 'idea' | 'sleepy' | 'happy' | 'speak' | 'shout';
export type Hat = 'sultan' | 'vizier' | 'byzHelmet' | 'bork' | 'cap' | 'officerCap' | 'none';
export type Outfit = 'robe' | 'suit' | 'uniform';
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
  look?: [number, number];
  /** 0..1 للانتقال الحاد في التعبير (مثل قفزة الصدمة) */
  jolt?: number;
};

const SW = 5; // سُمك الخط الخارجي

const Arm: React.FC<{from: [number, number]; mid: [number, number]; to: [number, number]; robe: string; skin: string}> = ({
  from,
  mid,
  to,
  robe,
  skin,
}) => {
  const d = `M ${from[0]} ${from[1]} Q ${mid[0]} ${mid[1]} ${to[0]} ${to[1]}`;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={24} fill="none" strokeLinecap="round" />
      <path d={d} stroke={robe} strokeWidth={14} fill="none" strokeLinecap="round" />
      <circle cx={to[0]} cy={to[1]} r={11} fill={skin} stroke={INK} strokeWidth={SW - 1} />
    </g>
  );
};

const Eyes: React.FC<{expr: Expr; blink: boolean; look: [number, number]; skin: string}> = ({expr, blink, look, skin}) => {
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

const Mouth: React.FC<{expr: Expr; frame: number}> = ({expr, frame}) => {
  const y = -172;
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
  look = [0, 0],
  jolt = 0,
}) => {
  // رمش كل ثلاث ثوانٍ تقريباً، مع اختلاف التوقيت بين الشخصيات
  const blink = (frame + seed * 37) % 97 < 4;
  // تنفّس / ارتداد خفيف
  const bob = pose === 'pull' ? Math.sin((frame + seed * 9) / 5) * 4 : Math.sin((frame + seed * 13) / 18) * 2.5;
  const lean = pose === 'pull' ? 14 + Math.sin((frame + seed * 9) / 5) * 4 : 0;
  const hop = -jolt * 28;

  const sh: [number, number] = [-40, -122];
  const sh2: [number, number] = [40, -122];
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

  const legs =
    pose === 'pull' ? (
      <g fill={INK}>
        <rect x={-6} y={-44} width={15} height={48} rx={6} transform="rotate(28 0 -40)" />
        <rect x={-6} y={-44} width={15} height={48} rx={6} transform="rotate(-18 0 -40)" />
      </g>
    ) : (
      <g fill={INK}>
        <rect x={-24} y={-44} width={16} height={46} rx={6} />
        <rect x={8} y={-44} width={16} height={46} rx={6} />
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
        {/* الجسم */}
        <path
          d="M -40 -40 L -48 -128 Q 0 -150 48 -128 L 40 -40 Q 0 -30 -40 -40 Z"
          fill={robe}
          stroke={INK}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
        {outfit === 'robe' && (
          <>
            <path d="M 0 -142 L 0 -40" stroke={trim} strokeWidth={6} />
            <rect x={-44} y={-78} width={88} height={11} fill={trim} stroke={INK} strokeWidth={3} />
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
            <rect x={-44} y={-78} width={88} height={10} fill="#4a3a22" />
            <rect x={-6} y={-79} width={12} height={12} fill={trim} />
            <rect x={-50} y={-136} width={26} height={8} rx={3} fill={trim} />
            <rect x={24} y={-136} width={26} height={8} rx={3} fill={trim} />
            <path d="M -14 -142 L 0 -122 L 14 -142" fill="none" />
          </g>
        )}
        {arms}
        {/* الرأس */}
        <g transform={`rotate(${pose === 'pull' ? 6 : 0} 0 -200)`}>
          <circle cx={0} cy={-200} r={64} fill={skin} stroke={INK} strokeWidth={SW} />
          {beard && (
            <path
              d="M -50 -176 Q -46 -120 0 -112 Q 46 -120 50 -176 Q 30 -150 0 -152 Q -30 -150 -50 -176 Z"
              fill={beard}
              stroke={INK}
              strokeWidth={4}
            />
          )}
          {hair && (hat === 'none' || hat === 'officerCap') && (
            <path
              d="M -63 -206 Q -66 -262 -8 -270 Q 50 -272 64 -210 Q 58 -236 34 -246 Q 8 -238 -18 -248 Q -46 -240 -63 -206 Z"
              fill={hair}
              stroke={INK}
              strokeWidth={4}
              strokeLinejoin="round"
            />
          )}
          {mustache && <path d="M -30 -186 Q -14 -198 0 -190 Q 14 -198 30 -186 Q 16 -176 0 -182 Q -16 -176 -30 -186 Z" fill={mustache} stroke={INK} strokeWidth={3} />}
          <Brows expr={expr} />
          <Eyes expr={expr} blink={blink && expr !== 'shock'} look={look} skin={skin} />
          <Mouth expr={expr} frame={frame} />
          {expr === 'strain' && (
            <path
              d={`M 62 -236 q 9 ${14 + (frame % 20)} 0 ${20 + (frame % 20)} q -9 -6 0 -${20 + (frame % 20)} Z`}
              fill="#7fc8ff"
              stroke={INK}
              strokeWidth={3}
            />
          )}
          <HatShape hat={hat} trim={trim} />
        </g>
      </g>
    </g>
  );
};
