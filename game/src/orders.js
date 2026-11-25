// Order queue: tickets arrive, patience drains, tips reward fast service,
// combos reward consecutive on-time serves, expired tickets cost coins and combo.
import { CUSTOMER_LINES, CUSTOMER_NAMES, recipeById, unlockedRecipes } from './recipes.js';
import { pick, range } from './random.js';
import { ANGRY_PENALTY, COMBO_STEP, MAX_COMBO, MAX_ORDERS, TIP_MAX } from './config.js';
import { patienceMultiplier, serveBonus, tipMultiplier } from './progression.js';

let nextOrderId = 1;
export function makeOrder(rng, world, script) {
  const pool = unlockedRecipes(world.day);
  const recipe = pick(rng, pool);
  const patience = script.patience * patienceMultiplier(world) * range(rng, 0.9, 1.15);
  return {
    id: nextOrderId += 1,
    recipeId: recipe.id,
    name: pick(rng, CUSTOMER_NAMES),
    line: pick(rng, CUSTOMER_LINES),
    patience, patienceMax: patience,
    bornAt: world.elapsed,
  };
}
export function spawnOrderIfDue(world, dt, script) {
  world.spawnTimer -= dt;
  if (world.spawnTimer > 0 || world.orders.length >= MAX_ORDERS) return null;
  world.spawnTimer = script.spawnEvery * range(world.rng, 0.8, 1.2);
  const order = makeOrder(world.rng, world, script);
  world.orders.push(order);
  return order;
}
/** Drain patience; expire tickets whose customers storm out. Returns expired orders. */
export function stepOrders(world, dt, script) {
  const expired = [];
  if (script.patience < 9000) {
    for (const o of world.orders) o.patience -= dt;
    const kept = [];
    for (const o of world.orders) {
      if (o.patience <= 0) expired.push(o); else kept.push(o);
    }
    world.orders = kept;
  }
  for (const o of expired) {
    world.combo = 0;
    world.coins = Math.max(0, world.coins - ANGRY_PENALTY);
    world.angryCount += 1;
  }
  return expired;
}
/** Coins for serving `order` now: base price + patience tip, scaled by combo. */
export function serveValue(world, order) {
  const recipe = recipeById(order.recipeId);
  const frac = Math.max(0, Math.min(1, order.patience / order.patienceMax));
  const tip = Math.round(TIP_MAX * frac * frac * tipMultiplier(world));
  const comboMult = 1 + COMBO_STEP * Math.min(world.combo, MAX_COMBO);
  const total = Math.round((recipe.price + tip) * comboMult) + serveBonus(world);
  return { total, tip, base: recipe.price, comboMult };
}
export function orderUrgency(order) {
  const frac = order.patience / order.patienceMax;
  if (frac < 0.25) return 'angry';
  if (frac < 0.5) return 'worried';
  return 'calm';
}
