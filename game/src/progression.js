// Day/level progression, star ratings and the between-day upgrade shop.
import { STAR_THRESHOLDS } from './config.js';
export const UPGRADES = [
  { id: 'knife',    name: 'Faster Knife',   cost: 25, desc: 'Chop in fewer hits: +0.15 progress per chop.', icon: 'knife' },
  { id: 'wok2',     name: 'Second Wok',     cost: 40, desc: 'Unlock a second wok so two dishes cook at once.', icon: 'wok' },
  { id: 'calm',     name: 'Calm Customers', cost: 30, desc: 'Customers wait 25% longer before getting angry.', icon: 'heart' },
  { id: 'spatula',  name: 'Golden Spatula', cost: 35, desc: 'Tips are worth 50% more on every serve.', icon: 'star' },
  { id: 'apron',    name: 'Lucky Apron',    cost: 20, desc: '+2 coins on every dish served, all day long.', icon: 'coin' },
];
export function upgradeById(id) { return UPGRADES.find((u) => u.id === id); }
export function starsForCoins(coins) {
  if (coins >= STAR_THRESHOLDS[2]) return 3;
  if (coins >= STAR_THRESHOLDS[1]) return 2;
  if (coins >= STAR_THRESHOLDS[0]) return 1;
  return 0;
}
export function hasUpgrade(world, id) { return world.upgrades.has(id); }
export function buyUpgrade(world, id) {
  const up = upgradeById(id);
  if (!up || world.upgrades.has(id) || world.coins < up.cost) return false;
  world.coins -= up.cost;
  world.upgrades.add(id);
  return true;
}
export function chopPerHit(world) {
  return world.upgrades.has('knife') ? 0.4 : 0.25;
}
export function patienceMultiplier(world) {
  return world.upgrades.has('calm') ? 1.25 : 1;
}
export function tipMultiplier(world) {
  return world.upgrades.has('spatula') ? 1.5 : 1;
}
export function serveBonus(world) {
  return world.upgrades.has('apron') ? 2 : 0;
}
export function wokSlots(world) {
  return world.upgrades.has('wok2') ? 2 : 1;
}
