// Kitchen world: the whole game state and its rules — stations, prep pipeline,
// assembly, serving, day timer and mode flow. Pure logic; render.js draws it.
import { makeRng } from './random.js';
import { INGREDIENTS, recipeById } from './recipes.js';
import { DAY_LENGTH, DAY_SCRIPTS, RUSH_LENGTH, RUSH_SCRIPT, ZEN_SCRIPT, BURN_GRACE, PERFECT_CHOP_BONUS, PERFECT_COOK_BONUS, PERFECT_COOK_WINDOW } from './config.js';
import { makeOrder, serveValue, spawnOrderIfDue, stepOrders } from './orders.js';
import { chopPerHit, wokSlots } from './progression.js';
import { makeParticles, spawnBurst, spawnPopup, spawnSteam, stepParticles } from './particles.js';
import { sfx } from './audio.js';

export function scriptFor(world) {
  if (world.mode === 'rush') return RUSH_SCRIPT;
  if (world.mode === 'zen') return ZEN_SCRIPT;
  return DAY_SCRIPTS[world.day - 1];
}

export function createWorld(seed = 1, mode = 'career') {
  const world = {
    rng: makeRng(seed),
    seed,
    mode, // 'career' | 'rush' | 'zen'
    day: 1,
    elapsed: 0,
    timeLeft: mode === 'career' ? DAY_LENGTH : mode === 'rush' ? RUSH_LENGTH : Infinity,
    coins: 0,
    dayCoins: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    angryCount: 0,
    perfectCount: 0,
    orders: [],
    spawnTimer: 2.5,
    activeOrderId: null,
    chopSlot: null, // { ing, progress, stepIndex }
    wokSlots: [null, null], // { ing, t, cookTime, stepIndex, perfect }
    build: null, // { recipeId, done: Set(stepIndex), stepsTotal }
    plate: null, // { recipeId } ready to serve
    plate2: null, // second plate waiting at the pass while the next dish cooks
    upgrades: new Set(),
    particles: makeParticles(),
    dayDone: false,
    runOver: false,
    overReason: '',
    message: '',
    messageT: 0,
  };
  return world;
}

export function resetWorld(world, mode = world.mode, day = 1) {
  const fresh = createWorld(world.seed, mode);
  fresh.upgrades = new Set(world.upgrades);
  fresh.coins = world.coins;
  Object.assign(world, fresh);
  world.day = day;
  world.timeLeft = mode === 'career' ? DAY_LENGTH : mode === 'rush' ? RUSH_LENGTH : Infinity;
}

export function startDay(world, day) {
  resetWorld(world, world.mode, day);
  world.spawnTimer = 1.5;
}

export function activeOrder(world) {
  return world.orders.find((o) => o.id === world.activeOrderId) || null;
}

export function selectOrder(world, id) {
  if (!world.orders.some((o) => o.id === id)) return false;
  if (world.build && world.activeOrderId !== id) return false; // finish the dish in progress first
  world.activeOrderId = id;
  sfx.click();
  return true;
}

/** Begin prepping one step of the active order's recipe for ingredient `ingId`. */
export function addIngredient(world, ingId) {
  const order = activeOrder(world);
  if (!order) { world.message = 'Pick a ticket first!'; world.messageT = 1.2; return false; }
  // A ready plate waits at the pass while the next dish is cooked — but the
  // pass holds at most two plates, so a full pass blocks new builds.
  if (world.plate && world.plate2) { world.message = 'Pass is full — serve a plate first!'; world.messageT = 1.2; return false; }
  const recipe = recipeById(order.recipeId);
  if (!world.build) world.build = { recipeId: recipe.id, done: new Set(), stepsTotal: recipe.steps.length };
  const stepIndex = recipe.steps.findIndex((s, i) => s.ing === ingId && !world.build.done.has(i));
  if (stepIndex === -1) { world.message = 'Not in this recipe!'; world.messageT = 1.2; return false; }
  const step = recipe.steps[stepIndex];
  const ing = INGREDIENTS[ingId];
  if (step.action === 'raw') {
    completeStep(world, stepIndex, false);
    return true;
  }
  if (step.action === 'chop' || step.action === 'chopcook') {
    if (world.chopSlot) { world.message = 'Board is busy!'; world.messageT = 1.2; return false; }
    world.chopSlot = { ing: ingId, progress: 0, stepIndex, needsCook: step.action === 'chopcook' };
    sfx.sizzle();
    return true;
  }
  // cook only
  return startCook(world, ingId, stepIndex);
}

function startCook(world, ingId, stepIndex) {
  const slots = wokSlots(world);
  for (let i = 0; i < slots; i += 1) {
    if (!world.wokSlots[i]) {
      world.wokSlots[i] = { ing: ingId, t: 0, cookTime: INGREDIENTS[ingId].cookTime, stepIndex, perfect: false };
      sfx.sizzle();
      return true;
    }
  }
  world.message = 'Woks are full!'; world.messageT = 1.2;
  return false;
}

export function chopHit(world) {
  const slot = world.chopSlot;
  if (!slot) return false;
  slot.progress += chopPerHit(world);
  sfx.chop();
  spawnBurst(world.particles, 300, 400, '#ffd94d', 4);
  if (slot.progress >= 1) {
    const { stepIndex, needsCook, ing } = slot;
    world.chopSlot = null;
    if (slot.progress <= 1.001) { world.perfectCount += 1; world.coins += PERFECT_CHOP_BONUS; spawnPopup(world.particles, 155, 215, `PERFECT CHOP +${PERFECT_CHOP_BONUS}`, '#7CFC98'); }
    if (needsCook) { if (!startCook(world, ing, stepIndex)) world.chopSlot = { ing, progress: 1, stepIndex, needsCook: false }; }
    else completeStep(world, stepIndex, false);
  }
  return true;
}

export function takeWok(world, slotIndex) {
  const slot = world.wokSlots[slotIndex];
  if (!slot) return false;
  const done = slot.t >= slot.cookTime;
  if (!done) { world.message = 'Still raw — let it cook!'; world.messageT = 1.2; return false; }
  const perfect = Math.abs(slot.t - slot.cookTime) <= PERFECT_COOK_WINDOW;
  world.wokSlots[slotIndex] = null;
  completeStep(world, slot.stepIndex, perfect);
  return true;
}

export function discardWok(world, slotIndex) {
  if (!world.wokSlots[slotIndex]) return false;
  world.wokSlots[slotIndex] = null;
  sfx.burn();
  return true;
}

function completeStep(world, stepIndex, perfect) {
  if (!world.build) return;
  world.build.done.add(stepIndex);
  if (perfect) {
    world.perfectCount += 1;
    world.coins += PERFECT_COOK_BONUS;
    spawnPopup(world.particles, 375, 215, `PERFECT COOK +${PERFECT_COOK_BONUS}`, '#7CFC98');
  }
  const recipe = recipeById(world.build.recipeId);
  spawnBurst(world.particles, 640, 430, recipe.color, 8);
  if (world.build.done.size >= world.build.stepsTotal) {
    const finished = { recipeId: world.build.recipeId };
    if (!world.plate) world.plate = finished;
    else if (!world.plate2) world.plate2 = finished;
    world.build = null;
    sfx.ding();
    spawnPopup(world.particles, 1122, 225, 'PLATE READY!', '#ffd94d');
  }
}

export function servePlate(world) {
  if (!world.plate) return false;
  const order = world.orders.find((o) => o.recipeId === world.plate.recipeId);
  if (!order) { world.message = 'No ticket wants this dish!'; world.messageT = 1.2; return false; }
  const value = serveValue(world, order);
  world.coins += value.total;
  world.dayCoins += value.total;
  world.score += value.total * 10;
  world.combo += 1;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  world.served += 1;
  world.orders = world.orders.filter((o) => o.id !== order.id);
  if (world.activeOrderId === order.id) world.activeOrderId = null;
  world.plate = world.plate2;
  world.plate2 = null;
  sfx.serve();
  spawnBurst(world.particles, 1020, 300, '#ffd94d', 16);
  spawnPopup(world.particles, 1020, 280, `+${value.total} coins`, '#ffd94d');
  if (value.tip > 0) spawnPopup(world.particles, 1020, 250, `tip +${value.tip}`, '#7CFC98');
  return true;
}

export function stepWorld(world, dt) {
  if (world.dayDone || world.runOver) return;
  world.elapsed += dt;
  const script = scriptFor(world);
  if (world.timeLeft !== Infinity) {
    world.timeLeft -= dt;
    if (world.timeLeft <= 0) {
      world.timeLeft = 0;
      world.dayDone = true;
      return;
    }
  }
  spawnOrderIfDue(world, dt, script);
  const expired = stepOrders(world, dt, script);
  for (const o of expired) {
    sfx.angry();
    spawnPopup(world.particles, 640, 120, `${o.name} stormed out! -${5}`, '#ff6b5e');
    // An expired ticket orphans the dish being built for it: throw that work
    // away, or it would contaminate the next order's dish.
    if (o.id === world.activeOrderId) {
      world.activeOrderId = null;
      world.build = null;
      world.chopSlot = null;
      world.wokSlots = [null, null];
    }
  }
  // A plate whose ticket just stormed out is wasted — nobody wants it now.
  if (world.plate && !world.orders.some((o) => o.recipeId === world.plate.recipeId)) {
    world.plate = world.plate2;
    world.plate2 = null;
  }
  if (world.plate2 && !world.orders.some((o) => o.recipeId === world.plate2.recipeId)) world.plate2 = null;
  // Wok cooking + burn + steam
  for (let i = 0; i < world.wokSlots.length; i += 1) {
    const slot = world.wokSlots[i];
    if (!slot) continue;
    slot.t += dt;
    if (slot.t >= slot.cookTime && slot.t < slot.cookTime + BURN_GRACE) {
      if (Math.random() < dt * 6) spawnSteam(world.particles, 480 + i * 130, 330, 1);
    }
    if (slot.t >= slot.cookTime + BURN_GRACE) {
      world.wokSlots[i] = null;
      world.combo = 0;
      sfx.burn();
      spawnPopup(world.particles, 480 + i * 130, 300, 'BURNT! Dish ruined', '#ff6b5e');
    }
  }
  if (world.chopSlot && Math.random() < dt * 2) spawnSteam(world.particles, 300, 380, 1);
  stepParticles(world.particles, dt);
  if (world.messageT > 0) world.messageT -= dt;
}

export function finishDaySummary(world) {
  return {
    day: world.day,
    coins: world.dayCoins,
    served: world.served,
    angry: world.angryCount,
    bestCombo: world.bestCombo,
    perfect: world.perfectCount,
  };
}
