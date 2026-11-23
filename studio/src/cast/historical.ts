import {defineCharacter} from './define';

/* ======================= شخصيات تاريخية حقيقية =======================
 * كاريكاتير مبسّط ومحترم: تُعرف كل شخصية بعلامات مميزة (الزي، الشعر، الشارب، غطاء الرأس، الحقبة).
 * ref = المرجع البصري الذي بُني عليه الشكل.
 */

export const mehmed2 = defineCharacter({
  id: 'mehmed2',
  name: 'السلطان محمد الثاني (الفاتح)',
  era: '1432–1481',
  ref: 'المنمنمات العثمانية: عمامة بيضاء ضخمة بقاووق أحمر، قفطان أحمر بحواف ذهبية، لحية داكنة',
  voice: {name: 'ar-AE-HamdanNeural', pitch: '-6Hz'},
  look: {robe: '#b3262c', trim: '#e0b43a', hat: 'sultan', beard: '#3a2416', skin: '#efc29b'},
  variants: {
    older: {beard: '#6a5a4a', build: 'belly', face: 'wide'},
  },
});

export const halilPasha = defineCharacter({
  id: 'halilPasha',
  name: 'خليل باشا (الصدر الأعظم)',
  era: '؟–1453',
  ref: 'وزير عثماني: عمامة أصغر بقلنسوة زرقاء، قفطان أزرق، لحية رمادية',
  voice: {name: 'ar-OM-AbdullahNeural', rate: '-12%', pitch: '-10Hz'},
  look: {robe: '#2f5f8f', trim: '#c9c2a8', hat: 'vizier', beard: '#9c968c', skin: '#e6b48d'},
});

export const constantine11 = defineCharacter({
  id: 'constantine11',
  name: 'الإمبراطور قسطنطين الحادي عشر',
  era: '1405–1453',
  ref: 'آخر أباطرة بيزنطة: تاج ذهبي، ثوب أرجواني إمبراطوري، لحية',
  voice: {name: 'ar-LB-RamiNeural', rate: '-8%', pitch: '-4Hz'},
  look: {robe: '#5a2a6a', trim: '#e0b43a', hat: 'crown', beard: '#4a3426', skin: '#e8b994', face: 'long'},
});

export const nasser = defineCharacter({
  id: 'nasser',
  name: 'جمال عبد الناصر',
  era: '1918–1970',
  ref: 'صور 1956: بدلة داكنة، ربطة عنق داكنة، شعر أسود مصفف للخلف، شارب كثيف',
  voice: {name: 'ar-EG-ShakirNeural', rate: '-6%', pitch: '-8Hz'},
  look: {robe: '#3a3e4a', trim: '#3a3e4a', outfit: 'suit', tie: '#5a1e28', hair: '#1a1512', mustache: '#1a1512', skin: '#c98f68', hat: 'none', seed: 4},
  variants: {
    officer1952: {outfit: 'uniform', robe: '#6b6a5a', trim: '#d9b13a', hat: 'officerCap'},
    sixties: {hair: '#6a6a6a', mustache: '#5a5a5a', build: 'belly'},
  },
});

export const mahmoudYounis = defineCharacter({
  id: 'mahmoudYounis',
  name: 'المهندس محمود يونس',
  era: '1911–1976',
  ref: 'قائد فريق تسلّم شركة القناة 1956: بدلة مدنية داكنة، فك قوي',
  voice: {name: 'ar-QA-MoazNeural', rate: '-4%'},
  look: {robe: '#2e3440', outfit: 'suit', hat: 'none', hair: '#1a1512', tie: '#7a1e28', skin: '#d9a27a', face: 'jaw'},
});

/* =================== شخصيات حرب المائة عام وجان دارك =================== */

export const joanOfArc = defineCharacter({
  id: 'joanOfArc',
  name: 'جان دارك',
  era: '1412–1431',
  ref: 'عذراء أورليان: قصة شعر قصيرة Bob سوداء، درع فولاذي فضي ورداء أبيض بزهرة الزنبق الذهبية، ولها زي القرية وزي السفر',
  voice: {name: 'ar-SA-ZariyahNeural', rate: '-2%', pitch: '+4Hz'},
  look: {
    build: 'female',
    outfit: 'armor',
    robe: '#c8d2de',
    surcoat: '#f8f5ec',
    emblem: 'fleur',
    trim: '#e8b830',
    hat: 'none',
    hair: '#1e1918',
    hairStyle: 'bob',
    skin: '#f4cbb0',
    lips: '#c86a68',
    seed: 11,
  },
  variants: {
    village: {
      outfit: 'peasant',
      robe: '#9b8d7e',
      apron: '#f6f2e8',
      surcoat: undefined,
      emblem: undefined,
      hairStyle: 'ponytail',
    },
    travel: {
      outfit: 'robe',
      robe: '#5c4d3e',
      trim: '#3a2c20',
      surcoat: undefined,
      emblem: undefined,
      hairStyle: 'bob',
    },
  },
});

export const charles6 = defineCharacter({
  id: 'charles6',
  name: 'الملك شارل السادس — المجنون',
  era: '1368–1422',
  ref: 'ملك فرنسا المصاب بوهم الزجاج: نحيف، شعر رمادي منكوش، عيون شاردة حلزونية، رداء أزرق بقضبان حديدية، تاج مائل',
  voice: {name: 'ar-EG-ShakirNeural', rate: '+2%', pitch: '+0Hz'},
  look: {
    build: 'slim',
    face: 'long',
    outfit: 'royal',
    robe: '#244b96',
    trim: '#e8b830',
    ironRods: true,
    hat: 'tiltedCrown',
    hair: '#b2b6bc',
    hairStyle: 'messy',
    spiralEyes: true,
    skin: '#efd0b8',
    seed: 12,
  },
});

export const charles7 = defineCharacter({
  id: 'charles7',
  name: 'الدوفين شارل السابع',
  era: '1403–1461',
  ref: 'ولي العهد المتردد: قطرة عرق دائمة، رداء مخملي بنفسجي وقبعة نبلاء منتفخة، ونسختا التنكّر والتتويج',
  voice: {name: 'ar-JO-TaimNeural', rate: '+0%', pitch: '+6Hz'},
  look: {
    build: 'slim',
    face: 'pointy',
    outfit: 'royal',
    robe: '#522c72',
    trim: '#2c4a98',
    hat: 'nobleHat',
    hair: '#5c3c24',
    sweat: true,
    skin: '#f0c8a8',
    seed: 13,
  },
  variants: {
    disguised: {
      outfit: 'robe',
      robe: '#7a7066',
      trim: '#4a423a',
      hat: 'cap',
      sweat: true,
    },
    king: {
      outfit: 'royal',
      robe: '#244b96',
      trim: '#f2c43a',
      fur: '#f6f2e8',
      emblem: 'fleur',
      hat: 'crown',
      sweat: false,
    },
  },
});

export const henry5 = defineCharacter({
  id: 'henry5',
  name: 'الملك هنري الخامس',
  era: '1386–1422',
  ref: 'ملك إنجلترا: قصة الصحن الشهيرة Bowl Cut، ذقن مربعة، سترة ملكية مقسمة أحمر وأزرق، تاج ذهبي',
  voice: {name: 'ar-AE-HamdanNeural', rate: '-2%', pitch: '-4Hz'},
  look: {
    build: 'normal',
    face: 'square',
    outfit: 'royal',
    robe: '#b8242e',
    robe2: '#244b96',
    trim: '#e8b830',
    hat: 'crown',
    hair: '#6a4426',
    hairStyle: 'bowlCut',
    skin: '#f0c4a2',
    seed: 14,
  },
});

export const henry6Baby = defineCharacter({
  id: 'henry6Baby',
  name: 'الملك الرضيع هنري السادس',
  era: '1421–1471',
  ref: 'تولى العرش بعمر 9 أشهر: رداء ملكي ضخم، خدان ورديان، وتاج ذهبي عملاق ينزلق فوق عينيه',
  voice: {name: 'ar-QA-AmalNeural', rate: '+8%', pitch: '+24Hz'},
  look: {
    build: 'normal',
    face: 'round',
    outfit: 'baby',
    robe: '#b8242e',
    trim: '#f2c43a',
    hat: 'oversizedCrown',
    rosy: true,
    skin: '#f8d8c2',
    seed: 15,
  },
});

export const philipGood = defineCharacter({
  id: 'philipGood',
  name: 'دوق بورغوندي — فيليب الطيب',
  era: '1396–1467',
  ref: 'حليف الإنجليز الانتهازي: ممتلئ قليلاً، لحية مشذبة، ثوب عنابي فاخر بفرو أبيض، قبعة Chaperon ضخمة',
  voice: {name: 'ar-EG-ShakirNeural', rate: '-4%', pitch: '-4Hz'},
  look: {
    build: 'belly',
    face: 'wide',
    outfit: 'royal',
    robe: '#661830',
    trim: '#4a1426',
    fur: '#f6f2e8',
    hat: 'chaperon',
    beard: '#4a3220',
    skin: '#ecc2a0',
    seed: 16,
  },
});

export const laHire = defineCharacter({
  id: 'laHire',
  name: 'القائد لا هير',
  era: '1390–1443',
  ref: 'رفيق جان دارك الضخم الغاضب: بنية عريضة، لحية كثيفة فوضوية، حاجبان سميكان، درع ثقيل',
  voice: {name: 'ar-KW-FahedNeural', rate: '-4%', pitch: '-12Hz'},
  look: {
    build: 'broad',
    face: 'jaw',
    outfit: 'armor',
    robe: '#8a929e',
    trim: '#c9a43a',
    hat: 'none',
    hair: '#3a2618',
    hairStyle: 'messy',
    beard: '#3a2618',
    heavyBrows: true,
    skin: '#e4b28c',
    seed: 17,
  },
});

export const pierreCauchon = defineCharacter({
  id: 'pierreCauchon',
  name: 'الأسقف بيير كوشون',
  era: '1371–1442',
  ref: 'قاضي محاكمة جان: نحيف، وجه طويل، رداء أسقفي قرمزي داكن وقبعة Mitre طويلة',
  voice: {name: 'ar-QA-MoazNeural', rate: '-8%', pitch: '-10Hz'},
  look: {
    build: 'slim',
    face: 'long',
    outfit: 'cleric',
    robe: '#8e1b2a',
    trim: '#d9a82e',
    hat: 'mitre',
    skin: '#ebd0bc',
    seed: 18,
  },
});

export const baudricourt = defineCharacter({
  id: 'baudricourt',
  name: 'القائد روبير دي بودريكور',
  era: '1400–1454',
  ref: 'قائد حامية فوكولور المتجهم: شارب كثيف مقوس للأسفل، خوذة معدنية وسترة عسكرية ثقيلة',
  voice: {name: 'ar-IQ-BasselNeural', rate: '-2%', pitch: '-6Hz'},
  look: {
    build: 'broad',
    face: 'square',
    outfit: 'armor',
    robe: '#7b8594',
    surcoat: '#34527a',
    trim: '#c9a43a',
    hat: 'medievalHelmet',
    mustache: '#4a3424',
    droopMustache: true,
    skin: '#e6b894',
    seed: 19,
  },
});

export const HISTORICAL = {
  mehmed2,
  halilPasha,
  constantine11,
  nasser,
  mahmoudYounis,
  joanOfArc,
  charles6,
  charles7,
  henry5,
  henry6Baby,
  philipGood,
  laHire,
  pierreCauchon,
  baudricourt,
};
