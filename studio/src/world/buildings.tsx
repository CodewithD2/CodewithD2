import React from 'react';
import {random} from 'remotion';
import {INK} from '../lib/util';
import {Awning, Balcony, Cornice, Dome, Door, Mashrabiya, Minaret, TileRoof, Wall, Win} from './kit';
import {lightOf, shadeOf, tinted, useWorld} from './lighting';

/* =====================================================================
 * مكتبة المباني — كل مبنى: <X x y s D seed />
 *   (x, y) = منتصف القاعدة على الأرض · s = مقياس · D = مفصّل (true) أو مبسّط (false)
 * ===================================================================== */

export type BuildingProps = {x: number; y: number; s?: number; D?: boolean; seed?: string; c?: string};

const G: React.FC<{x: number; y: number; s?: number; children: React.ReactNode}> = ({x, y, s = 1, children}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>{children}</g>
);
/** ظل أرضي ناعم تحت المبنى (المفصّل فقط) */
const GroundShadow: React.FC<{w: number; D?: boolean}> = ({w, D}) => {
  const W = useWorld();
  return D ? <ellipse cx={W.lightDir < 0 ? 24 : -24} cy={4} rx={w * 0.6} ry={14} fill="#000" opacity={W.time === 'day' ? 0.22 : 0.3} /> : null;
};

/* ---------------- عثماني / بيزنطي ---------------- */

/** جامع عثماني: قبة كبرى + نصف قباب + مئذنتان قلميتان + رواق */
export const OttomanMosque: React.FC<BuildingProps> = ({x, y, s, D = true, c = '#d8cdb8'}) => (
  <G x={x} y={y} s={s}>
    <GroundShadow w={520} D={D} />
    <Minaret x={-270} by={0} h={430} c={c} D={D} />
    <Minaret x={270} by={0} h={430} c={c} D={D} />
    <Wall x={-220} y={-200} w={440} h={200} c={c} D={D} tex="stone" depth={30} seed="om" />
    <Wall x={-150} y={-260} w={300} h={64} c={c} D={D} tex="stone" seed="om2" />
    <Dome cx={-150} by={-200} rw={70} rh={55} c="#8a9aa8" D={D} ribs={4} />
    <Dome cx={150} by={-200} rw={70} rh={55} c="#8a9aa8" D={D} ribs={4} />
    <Dome cx={0} by={-260} rw={150} rh={120} c="#8a9aa8" D={D} ribs={8} finial="crescent" />
    {Array.from({length: 7}, (_, i) => (
      <Win key={i} x={-108 + i * 32} y={-252} w={16} h={34} arch D={D} seed={`omw${i}`} />
    ))}
    {Array.from({length: 5}, (_, i) => (
      <Door key={i} x={-190 + i * 80} y={-130} w={56} h={130} c={D ? '#3a2a22' : '#4a3a30'} D={D} arch="pointed" />
    ))}
  </G>
);

/** كنيسة بيزنطية: كتلة + قبة على رقبة بنوافذ + حنية */
export const ByzChurch: React.FC<BuildingProps> = ({x, y, s, D = true, c = '#c9a882'}) => (
  <G x={x} y={y} s={s}>
    <GroundShadow w={420} D={D} />
    <Wall x={-200} y={-220} w={400} h={220} c={c} D={D} tex="brick" depth={26} seed="bc" />
    <Dome cx={200} by={-110} rw={60} rh={70} c={c} D={D} />
    <Wall x={-90} y={-300} w={180} h={82} c={c} D={D} tex="brick" seed="bc2" />
    <Dome cx={0} by={-300} rw={100} rh={80} c="#b08a5a" D={D} ribs={6} finial="cross" />
    {Array.from({length: 6}, (_, i) => (
      <Win key={i} x={-78 + i * 28} y={-292} w={14} h={30} arch D={D} seed={`bcw${i}`} />
    ))}
    {[-150, -70, 50, 130].map((wx, i) => (
      <Win key={i} x={wx} y={-180} w={24} h={58} arch D={D} seed={`bcx${i}`} />
    ))}
    <Door x={-28} y={-120} w={56} h={120} D={D} arch="round" />
  </G>
);

/** بيت خشبي عثماني: دور أرضي حجري + دور علوي خشبي بارز (جومبا) + سقف قرميد */
export const OttomanHouse: React.FC<BuildingProps> = ({x, y, s, D = true, c = '#c98a5a', seed = 'oh'}) => (
  <G x={x} y={y} s={s}>
    <GroundShadow w={260} D={D} />
    <Wall x={-110} y={-130} w={220} h={130} c="#bdb4a4" D={D} tex="stone" depth={18} seed={`${seed}a`} />
    <Wall x={-130} y={-290} w={260} h={160} c={c} D={D} tex="wood" depth={22} seed={`${seed}b`} />
    {D && <path d="M -130 -130 L -110 -112 L 110 -112 L 130 -130 Z" fill="#000" opacity={0.22} />}
    <TileRoof x={-130} y={-290} w={260} h={60} D={D} />
    {[-100, -30, 40].map((wx, i) => (
      <Win key={i} x={wx} y={-260} w={44} h={70} D={D} seed={`${seed}w${i}`} />
    ))}
    <Win x={-80} y={-100} w={36} h={50} D={D} seed={`${seed}g`} />
    <Door x={30} y={-96} w={48} h={96} D={D} arch="flat" />
  </G>
);

/** سور + برج مربع بشرفات وفتحات رمي */
export const WallTower: React.FC<BuildingProps> = ({x, y, s, D = true, c = '#a89a88'}) => {
  const W = useWorld();
  return (
    <G x={x} y={y} s={s}>
      <GroundShadow w={420} D={D} />
      <Wall x={-260} y={-200} w={520} h={200} c={c} D={D} tex="stone" seed="wt" />
      {Array.from({length: 11}, (_, i) => (
        <rect key={i} x={-256 + i * 48} y={-228} width={30} height={30} fill={D ? lightOf(W, c, 0.08) : tinted(W, c)} stroke={INK} strokeWidth={D ? 4 : 3} />
      ))}
      <Wall x={-80} y={-340} w={160} h={340} c={c} D={D} tex="stone" depth={30} seed="wt2" />
      {Array.from({length: 4}, (_, i) => (
        <rect key={i} x={-78 + i * 42} y={-370} width={30} height={32} fill={D ? lightOf(W, c, 0.08) : tinted(W, c)} stroke={INK} strokeWidth={D ? 4 : 3} />
      ))}
      {[-240, -120, 1].map((k, i) => (
        <rect key={i} x={-6} y={-300 + i * 90} width={12} height={40} rx={6} fill={W.lit > 0.4 ? W.P.warm : shadeOf(W, '#1a1a22', 0.2)} stroke={INK} strokeWidth={2.5} />
      ))}
    </G>
  );
};

/** خان: واجهة بطابقين من الأروقة وبوابة كبيرة */
export const Khan: React.FC<BuildingProps> = ({x, y, s, D = true, c = '#cdb58e'}) => (
  <G x={x} y={y} s={s}>
    <GroundShadow w={560} D={D} />
    <Wall x={-280} y={-240} w={560} h={240} c={c} D={D} tex="stone" depth={24} seed="kh" />
    <Cornice x={-280} y={-252} w={560} c={c} D={D} />
    {Array.from({length: 8}, (_, i) => (
      <Win key={i} x={-260 + i * 68} y={-220} w={40} h={70} arch D={D} seed={`khw${i}`} />
    ))}
    {Array.from({length: 8}, (_, i) =>
      i === 3 || i === 4 ? null : <Door key={i} x={-260 + i * 68} y={-110} w={44} h={110} D={D} arch="pointed" c="#3a2a22" />,
    )}
    <Door x={-46} y={-150} w={92} h={150} D={D} arch="pointed" />
  </G>
);

/* ---------------- مصري إسلامي ---------------- */

/** بيت قاهري بمشربيات */
export const CairoHouse: React.FC<BuildingProps> = ({x, y, s, D = true, c = '#d9c4a0', seed = 'ch'}) => (
  <G x={x} y={y} s={s}>
    <GroundShadow w={260} D={D} />
    <Wall x={-120} y={-360} w={240} h={360} c={c} D={D} tex="plaster" depth={22} seed={seed} />
    <Cornice x={-120} y={-372} w={240} c={c} D={D} />
    <Mashrabiya x={-90} y={-320} w={90} h={110} D={D} />
    <Mashrabiya x={20} y={-200} w={80} h={90} D={D} />
    <Win x={40} y={-320} w={36} h={56} D={D} seed={`${seed}w`} shutters="#3a5a4a" />
    <Win x={-80} y={-170} w={30} h={46} D={D} seed={`${seed}w2`} />
    <Door x={-34} y={-110} w={60} h={110} D={D} arch="pointed" />
  </G>
);

/** جامع مملوكي: واجهة أبلق مخططة، مدخل بعقد مدبب، مئذنة طبقات، قبة مضلعة */
export const MamlukMosque: React.FC<BuildingProps> = ({x, y, s, D = true, c = '#e0caa4'}) => {
  const W = useWorld();
  return (
    <G x={x} y={y} s={s}>
      <GroundShadow w={500} D={D} />
      <Minaret x={-200} by={-60} h={420} w={40} c={c} D={D} style="mamluk" />
      <Wall x={-240} y={-260} w={480} h={260} c={c} D={D} tex="ablaq" depth={26} seed="mm" />
      {Array.from({length: 14}, (_, i) => (
        <path key={i} d={`M ${-236 + i * 34} -260 l 13 -22 l 13 22 Z`} fill={D ? lightOf(W, c, 0.1) : tinted(W, c)} stroke={INK} strokeWidth={D ? 3 : 2} />
      ))}
      <Wall x={60} y={-340} w={140} h={80} c={c} D={D} tex="ablaq" seed="mm2" />
      <Dome cx={130} by={-340} rw={70} rh={86} c={c} D={D} ribs={10} finial="crescent" />
      {/* المدخل: تجويف بعقد مدبب */}
      <path d="M -70 0 L -70 -170 Q -70 -240 0 -250 Q 70 -240 70 -170 L 70 0 Z" fill={D ? shadeOf(W, c, 0.35) : tinted(W, c)} stroke={INK} strokeWidth={D ? 4 : 3} />
      {D && Array.from({length: 5}, (_, i) => <path key={i} d={`M ${-56 + i * 28} -200 q 14 -18 28 0`} fill="none" stroke={shadeOf(W, c, 0.55)} strokeWidth={2.5} />)}
      <Door x={-30} y={-120} w={60} h={120} D={D} arch="flat" />
      {[-170, 110, 170].map((wx, i) => (
        <Win key={i} x={wx} y={-200} w={30} h={66} arch D={D} seed={`mmw${i}`} />
      ))}
    </G>
  );
};

/** بوابة مدينة: برجان مستديران + عقد */
export const CityGate: React.FC<BuildingProps> = ({x, y, s, D = true, c = '#c4ad8a'}) => {
  const W = useWorld();
  const tower = (tx: number, key: string) => (
    <g key={key}>
      <Wall x={tx - 70} y={-380} w={140} h={380} c={c} D={D} tex="stone" depth={18} seed={`cg${key}`} />
      {Array.from({length: 4}, (_, i) => (
        <rect key={i} x={tx - 66 + i * 36} y={-408} width={24} height={30} fill={D ? lightOf(W, c, 0.08) : tinted(W, c)} stroke={INK} strokeWidth={D ? 4 : 3} />
      ))}
      <Win x={tx - 12} y={-300} w={24} h={46} arch D={D} seed={`cgw${key}`} />
    </g>
  );
  return (
    <G x={x} y={y} s={s}>
      <GroundShadow w={420} D={D} />
      <Wall x={-110} y={-300} w={220} h={300} c={c} D={D} tex="stone" seed="cgm" />
      {tower(-150, 'L')}
      {tower(150, 'R')}
      <path d="M -70 0 L -70 -160 Q -70 -230 0 -236 Q 70 -230 70 -160 L 70 0 Z" fill={tinted(W, '#2a2228')} stroke={INK} strokeWidth={D ? 4 : 3} />
      {D && <path d="M -82 -160 Q -82 -246 0 -252 Q 82 -246 82 -160" fill="none" stroke={lightOf(W, c, 0.2)} strokeWidth={10} />}
    </G>
  );
};

/** دكان سوق بمظلة وبضاعة */
export const SouqStall: React.FC<BuildingProps> = ({x, y, s, D = true, c = '#b8784a', seed = 'ss'}) => {
  const W = useWorld();
  const cols = ['#c0504a', '#e0b43a', '#2f6f4a', '#2f5f8f'];
  return (
    <G x={x} y={y} s={s}>
      <GroundShadow w={200} D={D} />
      <Wall x={-100} y={-200} w={200} h={200} c="#cdb58e" D={D} tex="plaster" seed={seed} />
      <rect x={-90} y={-160} width={180} height={120} fill={shadeOf(W, '#2a2030', 0.2)} stroke={INK} strokeWidth={3} />
      <rect x={-96} y={-56} width={192} height={56} fill={tinted(W, c)} stroke={INK} strokeWidth={D ? 4 : 3} />
      {Array.from({length: 6}, (_, i) => (
        <g key={i}>
          <ellipse cx={-72 + i * 29} cy={-72} rx={12} ry={16} fill={tinted(W, cols[Math.floor(random(`${seed}${i}`) * 4)])} stroke={INK} strokeWidth={2.5} />
          {D && <ellipse cx={-76 + i * 29} cy={-78} rx={4} ry={6} fill="#fff" opacity={0.3} />}
        </g>
      ))}
      <Awning x={-110} y={-210} w={220} c={cols[Math.floor(random(`${seed}a`) * 4)]} D={D} />
    </G>
  );
};

/* ---------------- الخمسينيات ---------------- */

/** عمارة أوروبية الطراز بشرفات (كورنيش الإسكندرية / وسط القاهرة) */
export const EuroApartment: React.FC<BuildingProps & {floors?: number}> = ({x, y, s, D = true, c = '#e4d2b0', seed = 'ea', floors = 5}) => {
  const fh = 74;
  const H = floors * fh + 60;
  return (
    <G x={x} y={y} s={s}>
      <GroundShadow w={300} D={D} />
      <Wall x={-140} y={-H} w={280} h={H} c={c} D={D} tex="plaster" depth={24} seed={seed} />
      <Cornice x={-140} y={-H - 12} w={280} c={c} D={D} h={16} />
      {Array.from({length: floors}, (_, f) => {
        const fy = -H + 20 + f * fh;
        return (
          <g key={f}>
            {[-110, -30, 50].map((wx, i) => (
              <Win key={i} x={wx + 8} y={fy + 6} w={44} h={50} D={D} seed={`${seed}${f}${i}`} shutters={D ? '#4a6a5a' : undefined} />
            ))}
            {f % 2 === 1 && <Balcony x={-120} y={fy + 60} w={240} c={c} D={D} />}
          </g>
        );
      })}
      <Awning x={-130} y={-70} w={260} c="#2f5f8f" D={D} drop={34} />
      <rect x={-120} y={-34} width={240} height={34} fill="#2a2a30" stroke={INK} strokeWidth={3} />
    </G>
  );
};

/** مبنى حكومي بأعمدة وجملون ودرج */
export const GovBuilding: React.FC<BuildingProps> = ({x, y, s, D = true, c = '#ddd0b4'}) => {
  const W = useWorld();
  return (
    <G x={x} y={y} s={s}>
      <GroundShadow w={560} D={D} />
      <Wall x={-260} y={-300} w={520} h={300} c={c} D={D} tex="stone" depth={28} seed="gb" />
      <path d="M -290 -300 L 0 -400 L 290 -300 Z" fill={D ? lightOf(W, c, 0.1) : tinted(W, c)} stroke={INK} strokeWidth={D ? 4 : 3} />
      {D && <path d="M -220 -310 L 0 -385 L 220 -310 Z" fill={shadeOf(W, c, 0.3)} />}
      {Array.from({length: 7}, (_, i) => (
        <Wall key={i} x={-232 + i * 76} y={-290} w={30} h={250} c={c} D={D} tex="none" seed={`gbc${i}`} />
      ))}
      {Array.from({length: 3}, (_, i) => (
        <rect key={i} x={-280 + i * 12} y={-40 + i * 14} width={560 - i * 24} height={14} fill={D ? lightOf(W, c, 0.06 * i) : tinted(W, c)} stroke={INK} strokeWidth={2.5} />
      ))}
    </G>
  );
};

/** محل بلافتة عربية */
export const Shop: React.FC<BuildingProps & {sign?: string}> = ({x, y, s, D = true, c = '#cfb894', seed = 'sh', sign = 'مقهى'}) => {
  const W = useWorld();
  return (
    <G x={x} y={y} s={s}>
      <GroundShadow w={240} D={D} />
      <Wall x={-120} y={-260} w={240} h={260} c={c} D={D} tex="plaster" depth={16} seed={seed} />
      <rect x={-104} y={-230} width={208} height={44} fill={tinted(W, '#2f4a6a')} stroke={INK} strokeWidth={3} />
      <text x={0} y={-198} textAnchor="middle" fontFamily="Amiri" fontWeight={700} fontSize={30} fill={W.lit > 0.4 ? '#ffe7a0' : '#f4ead0'} direction="rtl">
        {sign}
      </text>
      <Awning x={-112} y={-180} w={224} c="#c0504a" D={D} drop={30} />
      <Win x={-96} y={-130} w={110} h={110} D={D} seed={`${seed}w`} />
      <Door x={30} y={-130} w={60} h={130} D={D} arch="flat" c="#4a3a2a" />
    </G>
  );
};

/** كشك صغير */
export const Kiosk: React.FC<BuildingProps> = ({x, y, s, D = true, c = '#3f7a5a'}) => {
  const W = useWorld();
  return (
    <G x={x} y={y} s={s}>
      <GroundShadow w={120} D={D} />
      <Wall x={-50} y={-150} w={100} h={150} c={c} D={D} tex="wood" seed="ks" />
      <rect x={-40} y={-120} width={80} height={50} fill={W.lit > 0.3 ? W.P.warm : shadeOf(W, '#2a2a30', 0.2)} stroke={INK} strokeWidth={3} />
      <path d="M -70 -150 L 0 -200 L 70 -150 Z" fill={tinted(W, '#a8482e')} stroke={INK} strokeWidth={D ? 4 : 3} />
    </G>
  );
};

/** عمود إنارة — يضيء ليلاً */
export const StreetLamp: React.FC<BuildingProps> = ({x, y, s, D = true}) => {
  const W = useWorld();
  return (
    <G x={x} y={y} s={s}>
      {W.lit > 0.2 && <ellipse cx={0} cy={-232} rx={90} ry={90} fill={W.P.warm} opacity={0.22 * W.lit} />}
      {W.lit > 0.2 && D && <path d="M -16 -220 L -70 0 L 70 0 L 16 -220 Z" fill={W.P.warm} opacity={0.12 * W.lit} />}
      <rect x={-5} y={-230} width={10} height={230} fill={tinted(W, '#2a2a30')} stroke={INK} strokeWidth={2.5} />
      <rect x={-14} y={-8} width={28} height={10} fill={tinted(W, '#2a2a30')} stroke={INK} strokeWidth={2} />
      <path d="M -16 -230 L -10 -256 L 10 -256 L 16 -230 Z" fill={W.lit > 0.2 ? '#fff1c0' : tinted(W, '#c9ccd4')} stroke={INK} strokeWidth={2.5} />
      <path d="M -18 -256 L 0 -270 L 18 -256 Z" fill={tinted(W, '#2a2a30')} stroke={INK} strokeWidth={2.5} />
    </G>
  );
};

/* ---------------- عامة ---------------- */

/** بيت طيني ريفي مع برج حمام */
export const MudHouse: React.FC<BuildingProps> = ({x, y, s, D = true, c = '#b08a62', seed = 'mh'}) => {
  const W = useWorld();
  return (
    <G x={x} y={y} s={s}>
      <GroundShadow w={260} D={D} />
      <Wall x={60} y={-260} w={70} h={150} c={c} D={D} tex="mud" seed={`${seed}t`} />
      {Array.from({length: 3}, (_, r) =>
        Array.from({length: 3}, (_, k) => <circle key={`${r}${k}`} cx={75 + k * 20} cy={-240 + r * 26} r={5} fill={shadeOf(W, '#2a2020', 0.2)} />),
      )}
      <Wall x={-130} y={-150} w={260} h={150} c={c} D={D} tex="mud" depth={20} seed={seed} />
      <rect x={-136} y={-160} width={272} height={12} fill={D ? lightOf(W, c, 0.1) : tinted(W, c)} stroke={INK} strokeWidth={3} />
      <Win x={-100} y={-120} w={30} h={34} D={D} seed={`${seed}w`} frameC={c} />
      <Door x={-10} y={-100} w={50} h={100} D={D} arch="flat" c="#4a6a8a" />
    </G>
  );
};

/** هرم بوجهين مضاء ومظلل */
export const Pyramid: React.FC<BuildingProps & {w?: number}> = ({x, y, s, D = true, c = '#d9b878', w = 600}) => {
  const W = useWorld();
  const h = w * 0.64;
  const apexX = W.lightDir < 0 ? w * 0.08 : -w * 0.08;
  return (
    <G x={x} y={y} s={s}>
      <path d={`M ${-w / 2} 0 L ${apexX} ${-h} L ${w / 2} 0 Z`} fill={tinted(W, c)} stroke={INK} strokeWidth={D ? 4 : 3} strokeLinejoin="round" />
      <path d={`M ${apexX} ${-h} L ${W.lightDir < 0 ? w / 2 : -w / 2} 0 L ${apexX + (W.lightDir < 0 ? w * 0.12 : -w * 0.12)} 0 Z`} fill={shadeOf(W, c, D ? 0.4 : 0.25)} stroke={INK} strokeWidth={D ? 3 : 2} />
      {D &&
        Array.from({length: 12}, (_, i) => {
          const t = (i + 1) / 13;
          return <line key={i} x1={-w / 2 + (apexX + w / 2) * t} y1={-h * t} x2={apexX + (W.lightDir < 0 ? w * 0.12 : -w * 0.12) * (1 - t) + 0} y2={-h * t} stroke={shadeOf(W, c, 0.25)} strokeWidth={2} opacity={0.6} />;
        })}
    </G>
  );
};

/** مخزن ميناء بسقف جملوني وبوابة كبيرة */
export const Warehouse: React.FC<BuildingProps> = ({x, y, s, D = true, c = '#9a6a4a'}) => {
  const W = useWorld();
  return (
    <G x={x} y={y} s={s}>
      <GroundShadow w={400} D={D} />
      <Wall x={-200} y={-200} w={400} h={200} c={c} D={D} tex="brick" depth={26} seed="wh" />
      <path d="M -216 -200 L 0 -290 L 216 -200 Z" fill={tinted(W, '#5a5a62')} stroke={INK} strokeWidth={D ? 4 : 3} />
      <rect x={-70} y={-150} width={140} height={150} fill={tinted(W, '#4a4a52')} stroke={INK} strokeWidth={3} />
      {D && Array.from({length: 6}, (_, i) => <line key={i} x1={-70 + i * 24} y1={-150} x2={-70 + i * 24} y2={0} stroke={shadeOf(W, '#4a4a52', 0.4)} strokeWidth={2} />)}
      <Win x={-170} y={-160} w={50} h={40} D={D} seed="whw1" />
      <Win x={120} y={-160} w={50} h={40} D={D} seed="whw2" />
    </G>
  );
};

/** منارة بحرية — يدور ضوؤها ليلاً */
export const Lighthouse: React.FC<BuildingProps & {frame?: number}> = ({x, y, s, D = true, c = '#ece4d4', frame = 0}) => {
  const W = useWorld();
  const a = (frame / 30) * 0.8;
  return (
    <G x={x} y={y} s={s}>
      {W.lit > 0.3 && (
        <path d={`M 0 -470 L ${Math.cos(a) * 900} ${-470 + Math.sin(a) * 60 - 40} L ${Math.cos(a) * 900} ${-470 + Math.sin(a) * 60 + 40} Z`} fill={W.P.warm} opacity={0.25 * W.lit} />
      )}
      <path d="M -60 0 L -36 -420 L 36 -420 L 60 0 Z" fill={tinted(W, c)} stroke={INK} strokeWidth={D ? 4 : 3} />
      {[-340, -220, -100].map((by, i) => (
        <path key={i} d={`M ${-60 + ((by + 420) / 420) * 24 * -1 + 24} ${by} L ${60 - ((by + 420) / 420) * 24 * -1 - 24} ${by} L ${60 - ((by + 420 - 50) / 420) * 24 * -1 - 24} ${by + 50} L ${-60 + ((by + 420 - 50) / 420) * 24 * -1 + 24} ${by + 50} Z`} fill={tinted(W, '#c0392b')} stroke={INK} strokeWidth={2.5} />
      ))}
      {D && <path d="M 10 -420 L 36 -420 L 60 0 L 24 0 Z" fill={shadeOf(W, c, 0.35)} opacity={0.6} />}
      <rect x={-46} y={-436} width={92} height={16} fill={tinted(W, '#2a2a30')} stroke={INK} strokeWidth={3} />
      <rect x={-30} y={-480} width={60} height={44} fill={W.lit > 0.3 ? '#fff1c0' : tinted(W, '#9fc6d6')} stroke={INK} strokeWidth={3} />
      <path d="M -36 -480 L 0 -510 L 36 -480 Z" fill={tinted(W, '#2a2a30')} stroke={INK} strokeWidth={3} />
    </G>
  );
};

/* ---------------- طبيعة ---------------- */

export const PalmTree: React.FC<{x: number; y: number; h: number; frame?: number; seed?: number; D?: boolean}> = ({x, y, h, frame = 0, seed = 0, D = true}) => {
  const W = useWorld();
  const trunk = tinted(W, '#7a5a3a');
  const leaf = tinted(W, '#3f7a3a');
  const lean = Math.sin(seed * 2.3) * 0.12;
  const tx = x + h * lean;
  const ty = y - h;
  const sway = Math.sin(frame / 25 + seed) * 4;
  return (
    <g>
      <path d={`M ${x - 10} ${y} Q ${x + h * lean * 0.3} ${y - h * 0.5} ${tx - 5} ${ty} L ${tx + 5} ${ty} Q ${x + h * lean * 0.3 + 12} ${y - h * 0.5} ${x + 10} ${y} Z`} fill={trunk} stroke={INK} strokeWidth={D ? 3.5 : 2.5} />
      {D && Array.from({length: Math.floor(h / 22)}, (_, i) => <line key={i} x1={x - 8 + (tx - x) * (i / (h / 22))} y1={y - i * 22} x2={x + 8 + (tx - x) * (i / (h / 22))} y2={y - i * 22 - 6} stroke={shadeOf(W, '#7a5a3a', 0.35)} strokeWidth={2.5} />)}
      {Array.from({length: 9}, (_, i) => {
        const a = (-170 + i * 20) * (Math.PI / 180);
        const L = h * (0.36 + 0.05 * Math.sin(i * 2));
        const ex = tx + Math.cos(a) * L + sway;
        const ey = ty + Math.sin(a) * L * 0.5 + L * 0.38;
        const mx = (tx + ex) / 2 + sway;
        const my = Math.min(ty, ey) - L * 0.25;
        return (
          <path
            key={i}
            d={`M ${tx} ${ty} Q ${mx} ${my - 10} ${ex} ${ey} Q ${mx} ${my + 8} ${tx} ${ty} Z`}
            fill={i % 2 && D ? shadeOf(W, '#3f7a3a', 0.2) : leaf}
            stroke={INK}
            strokeWidth={D ? 3 : 2}
            strokeLinejoin="round"
          />
        );
      })}
    </g>
  );
};

export const RoundTree: React.FC<{x: number; y: number; h: number; D?: boolean; c?: string}> = ({x, y, h, D = true, c = '#4a7a3a'}) => {
  const W = useWorld();
  const r = h * 0.32;
  return (
    <g>
      <rect x={x - h * 0.04} y={y - h * 0.45} width={h * 0.08} height={h * 0.45} fill={tinted(W, '#6a4a2a')} stroke={INK} strokeWidth={D ? 3 : 2} />
      {[
        [-0.5, -0.62, 0.85],
        [0.5, -0.62, 0.85],
        [0, -0.8, 1],
      ].map(([dx, dy, k], i) => (
        <circle key={i} cx={x + dx * r} cy={y + dy * h} r={r * k} fill={i === 2 || !D ? tinted(W, c) : shadeOf(W, c, 0.22)} stroke={INK} strokeWidth={D ? 3.5 : 2.5} />
      ))}
      {D && <circle cx={x - r * 0.3} cy={y - h * 0.86} r={r * 0.35} fill={lightOf(W, c, 0.25)} opacity={0.6} />}
    </g>
  );
};

/** كل المباني للوحة المرجعية */
export const BUILDINGS = {
  OttomanMosque,
  ByzChurch,
  OttomanHouse,
  WallTower,
  Khan,
  CairoHouse,
  MamlukMosque,
  CityGate,
  SouqStall,
  EuroApartment,
  GovBuilding,
  Shop,
  Kiosk,
  StreetLamp,
  MudHouse,
  Pyramid,
  Warehouse,
  Lighthouse,
};
