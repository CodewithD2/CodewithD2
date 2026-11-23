import {defineRole} from './define';

/* ======================= أدوار عامة تولّد أشكالاً متنوعة ======================= */

const SKINS = ['#efc29b', '#e2b48c', '#d9a27a', '#c98f68', '#b87d58'];
const DARK_HAIR = ['#1a1512', '#2a1a12', '#3a2416', '#2a2018'];

export const byzGuard = defineRole({
  id: 'byzGuard',
  name: 'حارس بيزنطي',
  era: 'القرن ١٥',
  voices: [{name: 'ar-SY-LaithNeural'}, {name: 'ar-LB-RamiNeural', pitch: '+4Hz'}, {name: 'ar-TN-HediNeural'}],
  base: {robe: '#7a2430', trim: '#d9b13a', hat: 'byzHelmet', skin: '#e8b994'},
  vary: {skin: ['#e8b994', '#efc29b', '#e2b48c'], build: ['normal', 'normal', 'broad'], face: ['round', 'jaw', 'square'], beard: [undefined, undefined, '#3a2416']},
});

export const janissary = defineRole({
  id: 'janissary',
  name: 'إنكشاري',
  era: 'القرن ١٥–١٨',
  voices: [{name: 'ar-KW-FahedNeural'}, {name: 'ar-IQ-BasselNeural'}, {name: 'ar-BH-AliNeural'}, {name: 'ar-AE-HamdanNeural', pitch: '+6Hz'}],
  base: {robe: '#2c5f8a', trim: '#c0262d', hat: 'bork', beard: '#2a1a10'},
  vary: {skin: SKINS, robe: ['#2c5f8a', '#24507a', '#3a6a9a'], build: ['normal', 'broad'], beard: ['#2a1a10', '#3a2416', undefined]},
});

export const ottomanWorker = defineRole({
  id: 'ottomanWorker',
  name: 'عامل عثماني',
  era: 'القرن ١٥',
  voices: [{name: 'ar-JO-TaimNeural'}, {name: 'ar-YE-SalehNeural'}, {name: 'ar-MA-JamalNeural'}],
  base: {robe: '#d98b2b', trim: '#4a2e18', hat: 'cap'},
  vary: {robe: ['#d98b2b', '#6b8f3a', '#b85a2e', '#3f7fa8', '#9a6b3c', '#c9502f'], skin: SKINS, build: ['normal', 'slim', 'belly']},
});

export const egyptOfficer = defineRole({
  id: 'egyptOfficer',
  name: 'ضابط مصري — الخمسينيات',
  era: '1950s',
  voices: [{name: 'ar-QA-MoazNeural', pitch: '-4Hz'}, {name: 'ar-KW-FahedNeural', pitch: '-6Hz'}, {name: 'ar-LY-OmarNeural'}],
  base: {robe: '#6b6a5a', outfit: 'uniform', hat: 'officerCap', trim: '#d9b13a', hair: '#1a1512'},
  vary: {skin: ['#c98f68', '#b87d58', '#d9a27a'], build: ['normal', 'broad'], mustache: [undefined, '#1a1512'], face: ['round', 'jaw', 'square']},
});

export const egyptCivilian = defineRole({
  id: 'egyptCivilian',
  name: 'رجل مدني — الخمسينيات',
  era: '1950s',
  voices: [{name: 'ar-EG-ShakirNeural', pitch: '+6Hz'}, {name: 'ar-JO-TaimNeural', pitch: '-4Hz'}, {name: 'ar-DZ-IsmaelNeural'}],
  base: {outfit: 'suit', hat: 'none', robe: '#3a3e4a', tie: '#1e3a5a'},
  vary: {
    robe: ['#3a3e4a', '#2e3440', '#5a4a3a', '#4a5a6a'],
    tie: ['#1e3a5a', '#7a1e28', '#2f5a3a'],
    hair: DARK_HAIR,
    mustache: [undefined, '#2a2018', '#1a1512'],
    skin: SKINS,
    build: ['normal', 'slim', 'belly'],
    face: ['round', 'long', 'square', 'wide'],
  },
});

export const woman1950s = defineRole({
  id: 'woman1950s',
  name: 'سيدة — الخمسينيات',
  era: '1950s',
  voices: [{name: 'ar-EG-SalmaNeural'}, {name: 'ar-LB-LaylaNeural'}, {name: 'ar-JO-SanaNeural'}],
  base: {build: 'female', outfit: 'skirt', robe: '#f2ece0', hat: 'none', trim: '#c0262d'},
  vary: {
    skirt: ['#2f5f8f', '#c0504a', '#3a6a4a', '#6a4a7a'],
    hair: ['#2a1a12', '#3a2416', '#5a3a1e'],
    hairStyle: ['bob', 'bun', 'long'],
    skin: SKINS,
    lips: ['#c0392b', '#a8324a', '#b5524a'],
  },
});

export const womanHijab = defineRole({
  id: 'womanHijab',
  name: 'سيدة بالحجاب',
  voices: [{name: 'ar-EG-SalmaNeural', pitch: '-4Hz'}, {name: 'ar-SA-ZariyahNeural'}, {name: 'ar-SY-AmanyNeural'}, {name: 'ar-KW-NouraNeural'}],
  base: {build: 'female', outfit: 'dress', hat: 'hijab', trim: '#e0b43a', robe: '#5a3a6a'},
  vary: {robe: ['#5a3a6a', '#2f6f4a', '#3a4a6a', '#7a3a2a'], scarf: ['#e8dcc4', '#2a2a3a', '#c9b8d8', '#f0e6d2'], skin: SKINS, lips: ['#b5524a', '#9a3040']},
});

export const fellah = defineRole({
  id: 'fellah',
  name: 'فلاح',
  voices: [{name: 'ar-EG-ShakirNeural', rate: '-8%', pitch: '-2Hz'}, {name: 'ar-YE-SalehNeural', pitch: '-4Hz'}, {name: 'ar-LY-OmarNeural', rate: '-6%'}],
  base: {robe: '#6a7a8a', trim: '#e8dcc4', hat: 'cap'},
  vary: {robe: ['#6a7a8a', '#8a7a5a', '#5a6a5a', '#7a5a4a'], trim: ['#e8dcc4', '#c9b9a0'], skin: ['#c98f68', '#b87d58', '#a86f48'], mustache: [undefined, '#2a2018'], build: ['slim', 'normal']},
});

export const protester = defineRole({
  id: 'protester',
  name: 'متظاهر',
  voices: [{name: 'ar-IQ-BasselNeural', rate: '+6%'}, {name: 'ar-TN-HediNeural', rate: '+6%'}, {name: 'ar-MA-JamalNeural', rate: '+4%'}],
  base: {outfit: 'suit', hat: 'none', robe: '#f2ece0', tie: '#3a3a4a'},
  vary: {robe: ['#f2ece0', '#d9cfb8', '#8fa3b8', '#b89a78'], hair: DARK_HAIR, skin: SKINS, mustache: [undefined, '#1a1512'], build: ['slim', 'normal'], face: ['round', 'long', 'square']},
});

/* =================== أدوار العصور الوسطى الأوروبية =================== */

const EURO_SKINS = ['#f4cbb0', '#efc29b', '#e6b692', '#f0c8a8'];

export const frenchSoldier = defineRole({
  id: 'frenchSoldier',
  name: 'جندي فرنسي — القرن ١٥',
  era: 'القرن ١٥',
  voices: [{name: 'ar-SY-LaithNeural'}, {name: 'ar-LB-RamiNeural'}, {name: 'ar-JO-TaimNeural', pitch: '-4Hz'}],
  base: {outfit: 'armor', robe: '#9aa4b2', surcoat: '#2653a4', emblem: 'fleur', trim: '#e8b830', hat: 'medievalHelmet', skin: '#efc29b'},
  vary: {skin: EURO_SKINS, build: ['normal', 'normal', 'broad'], face: ['round', 'jaw', 'square'], mustache: [undefined, '#4a3220', '#2a1a12'], beard: [undefined, undefined, '#3a2416']},
});

export const englishSoldier = defineRole({
  id: 'englishSoldier',
  name: 'جندي إنجليزي — القرن ١٥',
  era: 'القرن ١٥',
  voices: [{name: 'ar-BH-AliNeural'}, {name: 'ar-AE-HamdanNeural', pitch: '+4Hz'}, {name: 'ar-YE-SalehNeural'}],
  base: {outfit: 'armor', robe: '#9aa4b2', surcoat: '#c0262d', emblem: 'cross', trim: '#f2c43a', hat: 'medievalHelmet', skin: '#f4cbb0'},
  vary: {skin: EURO_SKINS, build: ['normal', 'broad'], face: ['square', 'round', 'jaw'], mustache: [undefined, '#5a3a22'], beard: [undefined, '#5a3a22']},
});

export const burgundianSoldier = defineRole({
  id: 'burgundianSoldier',
  name: 'جندي بورغوندي — القرن ١٥',
  era: 'القرن ١٥',
  voices: [{name: 'ar-EG-ShakirNeural', pitch: '+4Hz'}, {name: 'ar-KW-FahedNeural'}],
  base: {outfit: 'armor', robe: '#9aa4b2', surcoat: '#f4f0e6', emblem: 'saltire', trim: '#b8242e', hat: 'medievalHelmet', skin: '#efc29b'},
  vary: {skin: EURO_SKINS, build: ['normal', 'broad'], face: ['round', 'square', 'jaw'], beard: [undefined, '#4a3220']},
});

export const medievalNoble = defineRole({
  id: 'medievalNoble',
  name: 'نبيل أوروبي — القرن ١٥',
  era: 'القرن ١٥',
  voices: [{name: 'ar-LB-RamiNeural', pitch: '+4Hz'}, {name: 'ar-OM-AbdullahNeural'}, {name: 'ar-SY-LaithNeural', pitch: '-4Hz'}],
  base: {outfit: 'royal', robe: '#522c72', trim: '#8a2c5a', fur: '#f6f2e8', hat: 'nobleHat', skin: '#f0c8a8'},
  vary: {
    robe: ['#522c72', '#26538a', '#2e6a4a', '#8a2a38', '#7a5228'],
    trim: ['#8a2c5a', '#2c4a98', '#3c7a52', '#a8343a', '#9a6a2a'],
    skin: EURO_SKINS,
    build: ['slim', 'normal', 'belly'],
    face: ['long', 'pointy', 'wide', 'round'],
    mustache: [undefined, '#4a3220'],
  },
});

export const poitiersScholar = defineRole({
  id: 'poitiersScholar',
  name: 'عالم ولاهوتي — بواتييه',
  era: 'القرن ١٥',
  voices: [{name: 'ar-OM-AbdullahNeural', rate: '-6%', pitch: '-6Hz'}, {name: 'ar-QA-MoazNeural', rate: '-4%'}, {name: 'ar-SY-LaithNeural', rate: '-4%', pitch: '-6Hz'}],
  base: {outfit: 'cleric', robe: '#25242e', trim: '#4c4a5c', hat: 'scholarCap', glasses: true, beard: '#9c968c', skin: '#ebd0bc'},
  vary: {
    beard: ['#9c968c', '#c6c2ba', '#6e6a64'],
    face: ['long', 'pointy', 'round'],
    build: ['slim', 'normal', 'belly'],
    skin: EURO_SKINS,
  },
});

export const steppeRider = defineRole({
  id: 'steppeRider',
  name: 'فارس من السهوب',
  era: 'القرن ٣ ق.م – ١٧ م',
  base: {robe: '#3f5f7a', trim: '#7a4a2a', hat: 'nomadFur', skin: '#d9a27a', mustache: '#2a1a10'},
  vary: {robe: ['#3f5f7a', '#6b4a2e', '#5a6a3a', '#7a3a2e'], trim: ['#7a4a2a', '#4a6a8a', '#8a3a2a'], skin: ['#d9a27a', '#c98f68', '#e2b48c'], beard: [undefined, '#2a1a10'], build: ['normal', 'broad']},
});

export const mingSoldier = defineRole({
  id: 'mingSoldier',
  name: 'جندي من أسرة مينغ',
  era: '١٣٦٨–١٦٤٤',
  base: {robe: '#a8322c', trim: '#c9a43a', outfit: 'uniform', hat: 'mingHelmet', skin: '#e3b48a'},
  vary: {skin: ['#e3b48a', '#d9a27a', '#efc29b'], mustache: [undefined, '#1a1512'], face: ['round', 'jaw', 'square']},
});

export const chineseFarmer = defineRole({
  id: 'chineseFarmer',
  name: 'فلاح صيني',
  era: 'عام',
  base: {robe: '#5a7a9a', trim: '#3a4a5a', hat: 'strawHat', skin: '#e3b48a'},
  vary: {robe: ['#5a7a9a', '#7a8a5a', '#8a6a4a', '#4a6a6a'], skin: ['#e3b48a', '#d9a27a', '#efc29b'], build: ['normal', 'slim']},
});

export const wallBuilder = defineRole({
  id: 'wallBuilder',
  name: 'عامل بناء السور',
  era: 'عام',
  base: {robe: '#8a7a5a', trim: '#4a3a2a', hat: 'cap', skin: '#d9a27a'},
  vary: {robe: ['#8a7a5a', '#6a5a4a', '#7a6a3a', '#5a5a4a'], skin: ['#e3b48a', '#d9a27a', '#c98f68'], build: ['normal', 'broad', 'slim']},
});

export const chineseEmperor = defineRole({
  id: 'chineseEmperor',
  name: 'إمبراطور صيني',
  era: 'عام',
  base: {robe: '#c9a020', trim: '#a8322c', outfit: 'royal', hat: 'mianguan', mustache: '#1a1512', beard: '#1a1512', skin: '#e3b48a', face: 'long', build: 'broad'},
  vary: {robe: ['#c9a020', '#1f1b22'], face: ['long', 'jaw']},
});

export const silkMerchant = defineRole({
  id: 'silkMerchant',
  name: 'تاجر على طريق الحرير',
  era: 'عام',
  base: {robe: '#7a3a6a', trim: '#e2b23a', hat: 'vizier', skin: '#d9a27a', beard: '#2a1a10'},
  vary: {robe: ['#7a3a6a', '#2f6a8a', '#8a5a2a', '#3a7a4a', '#a8322c'], trim: ['#e2b23a', '#f0e6d0', '#5a2a1a'], skin: ['#d9a27a', '#c98f68', '#e2b48c', '#efc29b'], beard: ['#2a1a10', '#4a3426', undefined], build: ['normal', 'belly', 'broad']},
});

export const bandit = defineRole({
  id: 'bandit',
  name: 'قاطع طريق',
  era: 'عام',
  base: {robe: '#3a3a3a', trim: '#7a2a22', hat: 'nomadFur', skin: '#c98f68', mustache: '#1a1210', beard: '#1a1210', build: 'broad', face: 'jaw'},
  vary: {robe: ['#3a3a3a', '#4a3a2a'], trim: ['#7a2a22', '#3a5a3a']},
});

export const ROLES = {
  chineseEmperor,
  silkMerchant,
  bandit,
  steppeRider,
  mingSoldier,
  chineseFarmer,
  wallBuilder,
  byzGuard,
  janissary,
  ottomanWorker,
  egyptOfficer,
  egyptCivilian,
  woman1950s,
  womanHijab,
  fellah,
  protester,
  frenchSoldier,
  englishSoldier,
  burgundianSoldier,
  medievalNoble,
  poitiersScholar,
};
