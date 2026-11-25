// Sizzle & Spice — Warung Kitchen Rush: game loop, screens and wiring.
// Title -> play -> day summary / upgrade shop -> next day ... -> final tally.
// Keyboard: 1-9/0/-/ = ingredients, Space chop/serve, P/Esc pause, M mute, R restart.
import { H, W, SCREEN_DAY, SCREEN_OVER, SCREEN_PAUSE, SCREEN_PLAY, SCREEN_TITLE } from './config.js';
import { createWorld, startDay, stepWorld, selectOrder, addIngredient, chopHit, takeWok, servePlate, discardWok, finishDaySummary } from './kitchen.js';
import { drawDaySummary, drawGame, drawOver, drawPause, drawTitle, ticketRect, binRect, ZONES } from './render.js';
import { drainClicks, drainKeys, hitRect, makeInput } from './input.js';
import { stageShot } from './shots.js';
import { loadSave, recordDayStars, recordScore } from './save.js';
import { buyUpgrade, starsForCoins } from './progression.js';
import { ensureAudio, isMuted, sfx, toggleMute } from './audio.js';
import { INGREDIENT_ORDER } from './recipes.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || '1') || 1;

const save = loadSave();
let world = createWorld(seed, 'career');
let screen = SCREEN_TITLE;
let paused = false;
let shotMode = false;

const input = makeInput(canvas);
const statusEl = document.getElementById('status');

function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }

function startMode(mode) {
  world = createWorld(seed, mode);
  world.upgrades = new Set();
  world.coins = 0;
  startDay(world, 1);
  screen = SCREEN_PLAY;
  paused = false;
  ensureAudio();
  setStatus(mode === 'career' ? 'Career day 1: serve the lunch crowd!' : mode === 'rush' ? 'Rush mode: 3 minutes, serve all you can!' : 'Zen mode: no timer, just cook.');
}

function advanceFromDay() {
  const summary = finishDaySummary(world);
  if (world.mode === 'career') {
    recordDayStars(save, world.day, starsForCoins(summary.coins));
    if (world.day < 5) {
      startDay(world, world.day + 1);
      screen = SCREEN_PLAY;
      return;
    }
  }
  recordScore(save, world.coins, world.score);
  screen = SCREEN_OVER;
}

function handleTitleClick(x, y) {
  for (let i = 0; i < 3; i += 1) {
    if (hitRect(x, y, { x: 390, y: 490 + i * 56, w: 500, h: 46 })) {
      startMode(['career', 'rush', 'zen'][i]);
      return;
    }
  }
}

function handleDayClick(x, y) {
  // upgrade rows (career, not last day)
  if (world.mode === 'career' && world.day < 5) {
    for (let i = 0; i < 5; i += 1) {
      if (hitRect(x, y, { x: 380, y: 372 + i * 40, w: 520, h: 34 })) {
        const ids = ['knife', 'wok2', 'calm', 'spatula', 'apron'];
        if (buyUpgrade(world, ids[i])) sfx.coin(); else sfx.click();
        return;
      }
    }
  }
  if (hitRect(x, y, { x: 340, y: 80, w: 600, h: 520 })) advanceFromDay();
}

function handlePlayClick(x, y) {
  for (let i = 0; i < world.orders.length; i += 1) {
    if (hitRect(x, y, ticketRect(i))) { selectOrder(world, world.orders[i].id); return; }
  }
  if (hitRect(x, y, ZONES.chop)) { chopHit(world); return; }
  if (hitRect(x, y, ZONES.wok0)) {
    const s = world.wokSlots[0];
    if (s && s.t >= s.cookTime) takeWok(world, 0);
    return;
  }
  if (hitRect(x, y, ZONES.wok1) && world.upgrades.has('wok2')) {
    const s = world.wokSlots[1];
    if (s && s.t >= s.cookTime) takeWok(world, 1);
    return;
  }
  if (hitRect(x, y, ZONES.plate)) { servePlate(world); return; }
  for (let i = 0; i < INGREDIENT_ORDER.length; i += 1) {
    if (hitRect(x, y, binRect(i))) { addIngredient(world, INGREDIENT_ORDER[i]); return; }
  }
}

const ING_KEYS = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal'];
function handleKey(code) {
  if (code === 'KeyM') { toggleMute(); return; }
  if (shotMode) return;
  if (screen === SCREEN_TITLE) {
    if (code === 'Digit1') startMode('career');
    else if (code === 'Digit2') startMode('rush');
    else if (code === 'Digit3') startMode('zen');
    return;
  }
  if (code === 'KeyP' || code === 'Escape') {
    if (screen === SCREEN_PLAY) { paused = !paused; }
    return;
  }
  if (paused) { if (code === 'KeyR') startMode(world.mode); return; }
  if (screen === SCREEN_DAY) {
    if (code === 'Enter' || code === 'Space') advanceFromDay();
    return;
  }
  if (screen === SCREEN_OVER) {
    if (code === 'KeyR' || code === 'Enter' || code === 'Space') { screen = SCREEN_TITLE; }
    return;
  }
  if (screen !== SCREEN_PLAY) return;
  if (code === 'KeyR') { startMode(world.mode); return; }
  if (code === 'Space') {
    if (world.plate) servePlate(world);
    else chopHit(world);
    return;
  }
  if (code === 'Enter' && world.mode === 'zen') { world.dayDone = true; screen = SCREEN_DAY; return; }
  const ki = ING_KEYS.indexOf(code);
  if (ki !== -1) addIngredient(world, INGREDIENT_ORDER[ki]);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const clicks = drainClicks(input);
  const keys = drainKeys(input);
  for (const k of keys) handleKey(k);
  if (!shotMode) {
    for (const c of clicks) {
      ensureAudio();
      if (screen === SCREEN_TITLE) handleTitleClick(c.x, c.y);
      else if (screen === SCREEN_DAY) handleDayClick(c.x, c.y);
      else if (screen === SCREEN_OVER) screen = SCREEN_TITLE;
      else if (screen === SCREEN_PLAY && !paused) handlePlayClick(c.x, c.y);
    }
    if (screen === SCREEN_PLAY && !paused) {
      stepWorld(world, dt);
      if (world.dayDone) {
        if (world.mode === 'zen') { recordScore(save, world.coins, world.score); screen = SCREEN_OVER; }
        else screen = SCREEN_DAY;
      }
    }
  }
  ctx.clearRect(0, 0, W, H);
  if (screen === SCREEN_TITLE) drawTitle(ctx, save);
  else if (screen === SCREEN_DAY) { drawGame(ctx, world); drawDaySummary(ctx, world, save); }
  else if (screen === SCREEN_OVER) drawOver(ctx, world, save);
  else {
    drawGame(ctx, world);
    if (paused) drawPause(ctx);
  }
  requestAnimationFrame(frame);
}

if (shotName) {
  shotMode = true;
  const staged = stageShot(shotName, world);
  screen = staged.screen;
  setStatus(`Screenshot scene: ${shotName}`);
} else {
  setStatus('Sizzle & Spice — pick a mode to start cooking.');
}
canvas.width = W;
canvas.height = H;
requestAnimationFrame(frame);
