// Deterministic screenshot scenes behind ?shot=start|play|rush|day.
// Each one plays the REAL rules forward from a fresh world with an autopilot
// that clicks the same actions a player would (select ticket, prep ingredients,
// chop, take the wok out, serve), so every frame is a genuine render of the
// game's own code and the same seed always gives the same frame.
import { SCREEN_DAY, SCREEN_PLAY, SCREEN_TITLE } from './config.js';
import { activeOrder, addIngredient, chopHit, createWorld, scriptFor, servePlate, startDay, stepWorld, takeWok } from './kitchen.js';
import { makeOrder } from './orders.js';
import { recipeById } from './recipes.js';

const STEP = 1 / 30;

/** One autopilot action per tick: serve, take a done wok, chop, or start the next step. */
function autopilotTick(world, serve = true) {
  if (world.plate) { if (serve) servePlate(world); return; }
  for (let i = 0; i < world.wokSlots.length; i += 1) {
    const slot = world.wokSlots[i];
    if (slot && slot.t >= slot.cookTime) { takeWok(world, i); return; }
  }
  if (world.chopSlot) { chopHit(world); return; }
  const order = activeOrder(world);
  if (!order) {
    if (world.orders.length > 0) world.activeOrderId = world.orders[0].id;
    return;
  }
  const recipe = recipeById(order.recipeId);
  const done = world.build ? world.build.done : new Set();
  const busySteps = new Set();
  if (world.chopSlot) busySteps.add(world.chopSlot.stepIndex);
  world.wokSlots.forEach((s) => { if (s) busySteps.add(s.stepIndex); });
  for (let i = 0; i < recipe.steps.length; i += 1) {
    if (done.has(i) || busySteps.has(i)) continue;
    addIngredient(world, recipe.steps[i].ing);
    return;
  }
}

function runAutopilot(world, seconds) {
  const steps = Math.floor(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    autopilotTick(world);
    stepWorld(world, STEP);
    if (world.dayDone) break;
  }
}

/**
 * Drive the world until one plate is ready, then start a second dish on
 * another ticket, so the frame shows all at once: a full order board, a dish
 * mid-assembly on the counter (with a wok cooking and the board in use), and
 * a plate ready to serve at the pass. Everything is produced by the real
 * rules — no hand-placed pixels, only real player actions.
 */
function ensurePlateAndSecondDish(world) {
  for (let i = 0; i < 100 / STEP && !world.plate; i += 1) {
    autopilotTick(world, false); // do not serve: keep the plate for the frame
    stepWorld(world, STEP);
    if (world.dayDone) break;
  }
  if (!world.plate) return;
  const script = scriptFor(world);
  while (world.orders.length < 3) {
    const o = makeOrder(world.rng, world, script);
    o.patience = o.patienceMax * 0.85;
    world.orders.push(o);
  }
  let other = world.orders.find((o) => o.recipeId !== world.plate.recipeId
      && recipeById(o.recipeId).steps.some((s, i) => i >= 2 && (s.action === 'chop' || s.action === 'chopcook')));
  if (!other) {
    // No ticket with a late chop step: reticket one spare order to Mie Ayam
    // (unlocked in every mode), a real order the game itself then cooks.
    other = world.orders.find((o) => o.recipeId !== world.plate.recipeId);
    if (other) { other.recipeId = 'mie-ayam'; other.patience = other.patienceMax * 0.85; }
  }
  if (!other) return;
  world.activeOrderId = other.id;
  const recipe = recipeById(other.recipeId);
  addIngredient(world, recipe.steps[0].ing);
  for (let i = 0; i < 6 && world.chopSlot; i += 1) chopHit(world);
  if (recipe.steps[1]) addIngredient(world, recipe.steps[1].ing);
  for (let i = 0; i < 6 && world.chopSlot; i += 1) chopHit(world);
  // Leave one later chop step half-chopped on the board, so the frame shows
  // the board in use as well as the wok and the half-built dish.
  if (world.build) {
    for (let i = 2; i < recipe.steps.length; i += 1) {
      const s = recipe.steps[i];
      if (!world.build.done.has(i) && (s.action === 'chop' || s.action === 'chopcook')) {
        if (addIngredient(world, s.ing)) { chopHit(world); chopHit(world); }
        break;
      }
    }
  }
  world.message = '';
  world.messageT = 0;
}

/**
 * Set `world` to the named scene and return the screen to draw over it.
 * start: title screen. play: mid-service, career day 1. rush: rush mode, high
 * combo, plate ready. day: day-complete summary with stars + upgrade shop.
 */
export function stageShot(name, world) {
  if (name === 'rush') {
    Object.assign(world, createWorld(world.seed, 'rush'));
    world.combo = 7;
    world.bestCombo = 7;
    world.coins = 86;
    runAutopilot(world, 55);
    ensurePlateAndSecondDish(world);
    return { screen: SCREEN_PLAY };
  }
  if (name === 'day') {
    Object.assign(world, createWorld(world.seed, 'career'));
    startDay(world, 1);
    world.timeLeft = 45; // shorten the day so the summary arrives quickly
    runAutopilot(world, 50);
    world.dayDone = true;
    return { screen: SCREEN_DAY };
  }
  if (name === 'play') {
    Object.assign(world, createWorld(world.seed, 'career'));
    startDay(world, 1);
    runAutopilot(world, 30);
    ensurePlateAndSecondDish(world);
    return { screen: SCREEN_PLAY };
  }
  Object.assign(world, createWorld(world.seed, 'career'));
  runAutopilot(world, 2);
  return { screen: SCREEN_TITLE };
}
