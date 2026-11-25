// Ingredients and the 12 original recipes of Sizzle & Spice.
// A step is { ing, action }: 'raw' goes straight to the plate, 'chop' needs the
// chopping board, 'cook' needs the wok, 'chopcook' needs board then wok.
export const INGREDIENTS = {
  rice:    { id: 'rice',    name: 'Nasi',      short: 'Rice',   color: '#f5ead2', dark: '#d9c49a', chop: false, cook: true,  cookTime: 3.2 },
  noodle:  { id: 'noodle',  name: 'Mie',       short: 'Noodle', color: '#f2c14e', dark: '#c98f1b', chop: false, cook: true,  cookTime: 3.6 },
  chicken: { id: 'chicken', name: 'Ayam',      short: 'Chicken',color: '#e8a34c', dark: '#b06a1e', chop: true,  cook: true,  cookTime: 4.2 },
  beef:    { id: 'beef',    name: 'Sapi',      short: 'Beef',   color: '#a34d2d', dark: '#6e2f1a', chop: true,  cook: true,  cookTime: 4.8 },
  egg:     { id: 'egg',     name: 'Telur',     short: 'Egg',    color: '#ffd94d', dark: '#d9a400', chop: false, cook: true,  cookTime: 2.6 },
  tofu:    { id: 'tofu',    name: 'Tahu',      short: 'Tofu',   color: '#f7f3e3', dark: '#cfc39a', chop: true,  cook: true,  cookTime: 3.0 },
  veg:     { id: 'veg',     name: 'Sayur',     short: 'Veg',    color: '#58b368', dark: '#2e7d3c', chop: true,  cook: false, cookTime: 0 },
  chilli:  { id: 'chilli',  name: 'Sambal',    short: 'Sambal', color: '#d9381e', dark: '#8f1d0c', chop: false, cook: false, cookTime: 0 },
  peanut:  { id: 'peanut',  name: 'Kacang',    short: 'Peanut', color: '#c98d4b', dark: '#8a5a22', chop: true,  cook: false, cookTime: 0 },
  broth:   { id: 'broth',   name: 'Kuah',      short: 'Broth',  color: '#e8b64c', dark: '#b07f1e', chop: false, cook: true,  cookTime: 3.0 },
  cracker: { id: 'cracker', name: 'Kerupuk',   short: 'Cracker',color: '#f2d492', dark: '#c9a24a', chop: false, cook: false, cookTime: 0 },
  lime:    { id: 'lime',    name: 'Jeruk',     short: 'Lime',   color: '#a8d94d', dark: '#6da31e', chop: true,  cook: false, cookTime: 0 },
};
export const INGREDIENT_ORDER = ['rice', 'noodle', 'chicken', 'beef', 'egg', 'tofu', 'veg', 'chilli', 'peanut', 'broth', 'cracker', 'lime'];

export const RECIPES = [
  { id: 'nasi-goreng', name: 'Nasi Goreng Sizzle', short: 'Nasi Goreng', price: 14, day: 1, color: '#e8a34c', color2: '#d9381e',
    desc: 'Wok-tossed rice, chicken, egg and sambal.',
    steps: [{ ing: 'rice', action: 'cook' }, { ing: 'chicken', action: 'chopcook' }, { ing: 'egg', action: 'cook' }, { ing: 'chilli', action: 'raw' }] },
  { id: 'mie-ayam', name: 'Mie Ayam Lada', short: 'Mie Ayam', price: 13, day: 1, color: '#f2c14e', color2: '#58b368',
    desc: 'Peppery noodles with chicken and greens.',
    steps: [{ ing: 'noodle', action: 'cook' }, { ing: 'chicken', action: 'chopcook' }, { ing: 'veg', action: 'chop' }, { ing: 'cracker', action: 'raw' }] },
  { id: 'ayam-geprek', name: 'Ayam Geprek Lava', short: 'Ayam Geprek', price: 15, day: 1, color: '#e8a34c', color2: '#d9381e',
    desc: 'Smashed fried chicken drowned in sambal.',
    steps: [{ ing: 'chicken', action: 'chopcook' }, { ing: 'chilli', action: 'raw' }, { ing: 'rice', action: 'cook' }, { ing: 'cracker', action: 'raw' }] },
  { id: 'soto-ember', name: 'Soto Ember Hangat', short: 'Soto Ember', price: 12, day: 1, color: '#e8b64c', color2: '#f5ead2',
    desc: 'Golden broth, chicken, egg and lime.',
    steps: [{ ing: 'broth', action: 'cook' }, { ing: 'chicken', action: 'chopcook' }, { ing: 'egg', action: 'cook' }, { ing: 'lime', action: 'chop' }] },
  { id: 'gado-gado', name: 'Gado-Gado Pelangi', short: 'Gado-Gado', price: 11, day: 2, color: '#58b368', color2: '#c98d4b',
    desc: 'Rainbow veg, tofu, egg and peanut sauce.',
    steps: [{ ing: 'veg', action: 'chop' }, { ing: 'tofu', action: 'chopcook' }, { ing: 'egg', action: 'cook' }, { ing: 'peanut', action: 'chop' }] },
  { id: 'mie-goreng', name: 'Mie Goreng Api', short: 'Mie Goreng', price: 14, day: 2, color: '#f2c14e', color2: '#d9381e',
    desc: 'Fire-tossed noodles, beef and sambal.',
    steps: [{ ing: 'noodle', action: 'cook' }, { ing: 'beef', action: 'chopcook' }, { ing: 'veg', action: 'chop' }, { ing: 'chilli', action: 'raw' }] },
  { id: 'nasi-ayam', name: 'Nasi Ayam Mentega', short: 'Nasi Mentega', price: 16, day: 3, color: '#f5ead2', color2: '#e8a34c',
    desc: 'Buttery rice with glazed chicken and lime.',
    steps: [{ ing: 'rice', action: 'cook' }, { ing: 'chicken', action: 'chopcook' }, { ing: 'lime', action: 'chop' }, { ing: 'cracker', action: 'raw' }] },
  { id: 'soto-betawi', name: 'Soto Betawi Susu', short: 'Soto Betawi', price: 17, day: 3, color: '#e8b64c', color2: '#a34d2d',
    desc: 'Creamy beef broth with cracker crunch.',
    steps: [{ ing: 'broth', action: 'cook' }, { ing: 'beef', action: 'chopcook' }, { ing: 'veg', action: 'chop' }, { ing: 'cracker', action: 'raw' }] },
  { id: 'tahu-gejrot', name: 'Tahu Gejrot Pedas', short: 'Tahu Gejrot', price: 10, day: 4, color: '#f7f3e3', color2: '#d9381e',
    desc: 'Crisp tofu swimming in chilli broth.',
    steps: [{ ing: 'tofu', action: 'chopcook' }, { ing: 'chilli', action: 'raw' }, { ing: 'broth', action: 'cook' }, { ing: 'peanut', action: 'chop' }] },
  { id: 'mie-aceh', name: 'Mie Aceh Rempah', short: 'Mie Aceh', price: 18, day: 4, color: '#f2c14e', color2: '#a34d2d',
    desc: 'Spiced thick noodles, beef, egg and lime.',
    steps: [{ ing: 'noodle', action: 'cook' }, { ing: 'beef', action: 'chopcook' }, { ing: 'egg', action: 'cook' }, { ing: 'lime', action: 'chop' }] },
  { id: 'nasi-padang', name: 'Nasi Padang Rajo', short: 'Nasi Padang', price: 19, day: 5, color: '#f5ead2', color2: '#d9381e',
    desc: 'The royal plate: beef, egg, veg and sambal.',
    steps: [{ ing: 'rice', action: 'cook' }, { ing: 'beef', action: 'chopcook' }, { ing: 'egg', action: 'cook' }, { ing: 'veg', action: 'chop' }, { ing: 'chilli', action: 'raw' }] },
  { id: 'soto-lamongan', name: 'Soto Lamongan Emas', short: 'Soto Lamongan', price: 18, day: 5, color: '#e8b64c', color2: '#c98d4b',
    desc: 'Golden chicken soup, cracker and lime.',
    steps: [{ ing: 'broth', action: 'cook' }, { ing: 'chicken', action: 'chopcook' }, { ing: 'cracker', action: 'raw' }, { ing: 'lime', action: 'chop' }, { ing: 'egg', action: 'cook' }] },
];
export function recipeById(id) { return RECIPES.find((r) => r.id === id); }
export function unlockedRecipes(day) { return RECIPES.filter((r) => r.day <= day); }
export const CUSTOMER_NAMES = ['Bu Sari', 'Pak Joko', 'Mbak Rina', 'Mas Budi', 'Dek Ani', 'Om Tono', 'Kak Dewi', 'Bang Fajar', 'Neng Sinta', 'Pak Haji', 'Mbak Lilis', 'Mas Eko'];
export const CUSTOMER_LINES = [
  'Lapar banget, cepat ya!', 'Yang pedas, jangan pelit sambal!', 'Ini favoritku dari dulu.',
  'Aku buru-buru, tolong cepat!', 'Bikin yang enak ya, Chef!', 'Sudah lama nunggu nih...',
  'Porsinya yang besar ya!', 'Aromanya saja sudah juara.', 'Anakku juga pesan satu!',
  'Kalau enak, aku balik lagi!', 'Jangan lupa kerupuknya!', 'Pedas sedang saja, ya.',
];
