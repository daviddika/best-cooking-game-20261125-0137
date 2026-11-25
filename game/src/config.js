// Sizzle & Spice — Warung Kitchen Rush: all tuning constants in one place.
export const W = 1280;
export const H = 720;
export const DAY_LENGTH = 120; // seconds per career day
export const RUSH_LENGTH = 180; // seconds of endless rush
export const MAX_ORDERS = 4;
export const MAX_COMBO = 12;
export const COMBO_STEP = 0.1; // +10% pay per combo level
export const TIP_MAX = 6; // max tip coins for a lightning serve
export const ANGRY_PENALTY = 5; // coins lost when a ticket expires
export const PERFECT_CHOP_BONUS = 2;
export const PERFECT_COOK_BONUS = 3;
export const BURN_GRACE = 3.0; // seconds past done before a wok item burns
export const PERFECT_COOK_WINDOW = 0.9; // seconds around done that count as perfect
export const CHOP_PER_HIT = 0.25; // chop progress per click / Space press
export const CHOP_PER_HIT_UPGRADED = 0.4;
export const STAR_THRESHOLDS = [60, 120, 200]; // coins per day for 1/2/3 stars
export const DAY_SCRIPTS = [
  { day: 1, spawnEvery: 11, patience: 42, unlock: 4, label: 'Day 1 — Soft Opening' },
  { day: 2, spawnEvery: 9.5, patience: 38, unlock: 6, label: 'Day 2 — Lunch Crowd' },
  { day: 3, spawnEvery: 8, patience: 34, unlock: 8, label: 'Day 3 — Dinner Rush' },
  { day: 4, spawnEvery: 6.8, patience: 30, unlock: 10, label: 'Day 4 — Weekend Rush' },
  { day: 5, spawnEvery: 5.6, patience: 26, unlock: 12, label: 'Day 5 — Grand Feast' },
];
export const RUSH_SCRIPT = { spawnEvery: 6.5, patience: 32, unlock: 12, label: 'Rush Mode' };
export const ZEN_SCRIPT = { spawnEvery: 12, patience: 9999, unlock: 12, label: 'Zen Mode' };
// Screen ids used by main.js, render.js and shots.js
export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_DAY = 'day';
export const SCREEN_OVER = 'over';
export const SCREEN_PAUSE = 'pause';
