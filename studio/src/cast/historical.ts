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
  look: {robe: '#2f5f8f', trim: '#c9c2a8', hat: 'vizier', beard: '#9c968c', skin: '#e6b48d'},
});

export const constantine11 = defineCharacter({
  id: 'constantine11',
  name: 'الإمبراطور قسطنطين الحادي عشر',
  era: '1405–1453',
  ref: 'آخر أباطرة بيزنطة: تاج ذهبي، ثوب أرجواني إمبراطوري، لحية',
  look: {robe: '#5a2a6a', trim: '#e0b43a', hat: 'crown', beard: '#4a3426', skin: '#e8b994', face: 'long'},
});

export const nasser = defineCharacter({
  id: 'nasser',
  name: 'جمال عبد الناصر',
  era: '1918–1970',
  ref: 'صور 1956: بدلة داكنة، ربطة عنق داكنة، شعر أسود مصفف للخلف، شارب كثيف',
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
  look: {robe: '#2e3440', outfit: 'suit', hat: 'none', hair: '#1a1512', tie: '#7a1e28', skin: '#d9a27a', face: 'jaw'},
});

export const HISTORICAL = {mehmed2, halilPasha, constantine11, nasser, mahmoudYounis};
