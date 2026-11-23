import type {LonLat} from './europeData';

/* =====================================================================
 * جغرافيا فرنسا وإنجلترا في حرب المائة عام (١٤١٥–١٤٣١)
 * كل مدينة بإحداثياتها الجغرافية الحقيقية [lon, lat]
 * ===================================================================== */

export type CityDef = {
  id: string;
  nameAr: string;
  nameEn: string;
  pos: LonLat;
  faction?: 'france' | 'england' | 'burgundy' | 'neutral';
  capital?: boolean;
};

export const CITIES_1429: Record<string, CityDef> = {
  paris: {id: 'paris', nameAr: 'باريس', nameEn: 'Paris', pos: [2.352, 48.857], faction: 'england', capital: true},
  orleans: {id: 'orleans', nameAr: 'أورليان', nameEn: 'Orléans', pos: [1.909, 47.903], faction: 'france', capital: true},
  reims: {id: 'reims', nameAr: 'ريمس', nameEn: 'Reims', pos: [4.032, 49.258], faction: 'england'},
  rouen: {id: 'rouen', nameAr: 'روان', nameEn: 'Rouen', pos: [1.099, 49.443], faction: 'england'},
  bourges: {id: 'bourges', nameAr: 'بورج', nameEn: 'Bourges', pos: [2.399, 47.081], faction: 'france'},
  chinon: {id: 'chinon', nameAr: 'شينون', nameEn: 'Chinon', pos: [0.243, 47.167], faction: 'france'},
  poitiers: {id: 'poitiers', nameAr: 'بواتييه', nameEn: 'Poitiers', pos: [0.34, 46.58], faction: 'france'},
  blois: {id: 'blois', nameAr: 'بلوا', nameEn: 'Blois', pos: [1.336, 47.586], faction: 'france'},
  domremy: {id: 'domremy', nameAr: 'دومريمي', nameEn: 'Domrémy', pos: [5.675, 48.442], faction: 'france'},
  vaucouleurs: {id: 'vaucouleurs', nameAr: 'فوكولور', nameEn: 'Vaucouleurs', pos: [5.666, 48.603], faction: 'france'},
  agincourt: {id: 'agincourt', nameAr: 'أجينكورت', nameEn: 'Agincourt', pos: [2.129, 50.464], faction: 'england'},
  troyes: {id: 'troyes', nameAr: 'تروا', nameEn: 'Troyes', pos: [4.074, 48.297], faction: 'burgundy'},
  london: {id: 'london', nameAr: 'لندن', nameEn: 'London', pos: [-0.128, 51.507], faction: 'england', capital: true},
  calais: {id: 'calais', nameAr: 'كاليه', nameEn: 'Calais', pos: [1.859, 50.951], faction: 'england'},
  bordeaux: {id: 'bordeaux', nameAr: 'بوردو', nameEn: 'Bordeaux', pos: [-0.579, 44.838], faction: 'england'},
  dijon: {id: 'dijon', nameAr: 'ديجون', nameEn: 'Dijon', pos: [5.042, 47.322], faction: 'burgundy'},
};

/**
 * مضلعات السيطرة التكتيكية عام ١٤٢٨–١٤٢٩ (تُقص تلقائياً بحدود فرنسا الحقيقية
 * من Natural Earth فتتطابق مع الساحل الحقيقي بدقة تامة!)
 */

/** الشمال الخاضع للإنجليز (نورماندي + مين + باريس + بيكاردي + شمال اللوار) */
export const ENGLISH_NORTH_1429: LonLat[] = [
  [-2.6, 51.4],
  [3.6, 51.4],
  [4.3, 49.7],
  [4.1, 49.0],
  [3.4, 48.35],
  [2.5, 48.05],
  [1.6, 48.0],
  [0.6, 47.95],
  [-0.5, 47.8],
  [-1.5, 48.55],
  [-2.6, 49.3],
];

/** إقليم غويين/بوردو الإنجليزي في الجنوب الغربي */
export const ENGLISH_GUYENNE_1429: LonLat[] = [
  [-2.5, 45.7],
  [-0.6, 45.5],
  [0.45, 45.1],
  [0.55, 44.3],
  [-0.1, 43.4],
  [-2.4, 43.1],
];

/** مناطق دوقية بورغوندي وحلفائها في الشرق والشمال الشرقي (ديجون، تروا، ريمس، شامبانيا، فلاندرز) */
export const BURGUNDY_1429: LonLat[] = [
  [3.2, 51.4],
  [8.6, 51.4],
  [8.5, 46.2],
  [5.4, 46.0],
  [4.3, 46.25],
  [3.7, 46.8],
  [3.4, 47.6],
  [3.1, 48.2],
  [3.6, 48.8],
  [4.1, 49.55],
  [2.6, 50.3],
  [2.5, 51.2],
];

/** خط الانقسام الداخلي ١٤١٠–١٤٢٠ (أرمانياك غرباً vs بورغوندي شرقاً) */
export const CIVIL_WAR_BURGUNDY: LonLat[] = [
  [2.2, 51.4],
  [8.8, 51.4],
  [8.6, 45.6],
  [4.8, 45.7],
  [3.7, 46.5],
  [3.3, 47.7],
  [2.6, 48.8],
  [2.2, 49.8],
];

/** مسار رحلة جان دارك التاريخية من فوكولور إلى شينون (فبراير–مارس ١٤٢٩ — ١١ يوماً) */
export const JOAN_MARCH_ROUTE: LonLat[] = [
  [5.666, 48.603], // فوكولور
  [4.95, 48.12],
  [4.1, 47.92],
  [3.57, 47.79], // أوكسير
  [2.63, 47.68], // جيان (عبور اللوار)
  [1.75, 47.42],
  [0.95, 47.24],
  [0.65, 47.06], // فيربوا
  [0.243, 47.167], // شينون
];

/** مسار غزو هنري الخامس ١٤١٥ (إنجلترا → نورماندي → أجينكورت) */
export const HENRY5_INVASION_ROUTE: LonLat[] = [
  [-1.4, 50.9], // ساوثهامبتون
  [0.12, 49.5], // هارفلور
  [1.4, 50.05],
  [2.129, 50.464], // أجينكورت
];
