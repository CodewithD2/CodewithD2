import {defineRole} from './define';

/* ======================= أدوار عامة تولّد أشكالاً متنوعة ======================= */

const SKINS = ['#efc29b', '#e2b48c', '#d9a27a', '#c98f68', '#b87d58'];
const DARK_HAIR = ['#1a1512', '#2a1a12', '#3a2416', '#2a2018'];

export const byzGuard = defineRole({
  id: 'byzGuard',
  name: 'حارس بيزنطي',
  era: 'القرن ١٥',
  base: {robe: '#7a2430', trim: '#d9b13a', hat: 'byzHelmet', skin: '#e8b994'},
  vary: {skin: ['#e8b994', '#efc29b', '#e2b48c'], build: ['normal', 'normal', 'broad'], face: ['round', 'jaw', 'square'], beard: [undefined, undefined, '#3a2416']},
});

export const janissary = defineRole({
  id: 'janissary',
  name: 'إنكشاري',
  era: 'القرن ١٥–١٨',
  base: {robe: '#2c5f8a', trim: '#c0262d', hat: 'bork', beard: '#2a1a10'},
  vary: {skin: SKINS, robe: ['#2c5f8a', '#24507a', '#3a6a9a'], build: ['normal', 'broad'], beard: ['#2a1a10', '#3a2416', undefined]},
});

export const ottomanWorker = defineRole({
  id: 'ottomanWorker',
  name: 'عامل عثماني',
  era: 'القرن ١٥',
  base: {robe: '#d98b2b', trim: '#4a2e18', hat: 'cap'},
  vary: {robe: ['#d98b2b', '#6b8f3a', '#b85a2e', '#3f7fa8', '#9a6b3c', '#c9502f'], skin: SKINS, build: ['normal', 'slim', 'belly']},
});

export const egyptOfficer = defineRole({
  id: 'egyptOfficer',
  name: 'ضابط مصري — الخمسينيات',
  era: '1950s',
  base: {robe: '#6b6a5a', outfit: 'uniform', hat: 'officerCap', trim: '#d9b13a', hair: '#1a1512'},
  vary: {skin: ['#c98f68', '#b87d58', '#d9a27a'], build: ['normal', 'broad'], mustache: [undefined, '#1a1512'], face: ['round', 'jaw', 'square']},
});

export const egyptCivilian = defineRole({
  id: 'egyptCivilian',
  name: 'رجل مدني — الخمسينيات',
  era: '1950s',
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
  base: {build: 'female', outfit: 'dress', hat: 'hijab', trim: '#e0b43a', robe: '#5a3a6a'},
  vary: {robe: ['#5a3a6a', '#2f6f4a', '#3a4a6a', '#7a3a2a'], scarf: ['#e8dcc4', '#2a2a3a', '#c9b8d8', '#f0e6d2'], skin: SKINS, lips: ['#b5524a', '#9a3040']},
});

export const fellah = defineRole({
  id: 'fellah',
  name: 'فلاح',
  base: {robe: '#6a7a8a', trim: '#e8dcc4', hat: 'cap'},
  vary: {robe: ['#6a7a8a', '#8a7a5a', '#5a6a5a', '#7a5a4a'], trim: ['#e8dcc4', '#c9b9a0'], skin: ['#c98f68', '#b87d58', '#a86f48'], mustache: [undefined, '#2a2018'], build: ['slim', 'normal']},
});

export const protester = defineRole({
  id: 'protester',
  name: 'متظاهر',
  base: {outfit: 'suit', hat: 'none', robe: '#f2ece0', tie: '#3a3a4a'},
  vary: {robe: ['#f2ece0', '#d9cfb8', '#8fa3b8', '#b89a78'], hair: DARK_HAIR, skin: SKINS, mustache: [undefined, '#1a1512'], build: ['slim', 'normal'], face: ['round', 'long', 'square']},
});

export const ROLES = {byzGuard, janissary, ottomanWorker, egyptOfficer, egyptCivilian, woman1950s, womanHijab, fellah, protester};
