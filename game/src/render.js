// All canvas drawing: warm warung kitchen, order board, stations, HUD, screens.
// Everything is drawn with canvas shapes — no images, no emoji, no network.
import { H, W } from './config.js';
import { INGREDIENTS, INGREDIENT_ORDER, RECIPES, recipeById } from './recipes.js';
import { orderUrgency } from './orders.js';
import { starsForCoins, UPGRADES } from './progression.js';
import { isMuted } from './audio.js';

export const ZONES = {
  chop: { x: 40, y: 240, w: 230, h: 200 },
  wok0: { x: 300, y: 240, w: 150, h: 200 },
  wok1: { x: 465, y: 240, w: 150, h: 200 },
  assembly: { x: 640, y: 240, w: 330, h: 200 },
  plate: { x: 1000, y: 240, w: 244, h: 200 },
};
export const BIN_Y = 520, BIN_H = 140, BIN_W = 98, BIN_GAP = 5, BIN_X0 = 16;
export function binRect(i) { return { x: BIN_X0 + i * (BIN_W + BIN_GAP), y: BIN_Y, w: BIN_W, h: BIN_H }; }
export function ticketRect(i) { return { x: 16 + i * 212, y: 76, w: 200, h: 112 }; }

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function text(ctx, s, x, y, size, color, align = 'left', bold = true, font = 'system-ui, sans-serif') {
  ctx.fillStyle = color;
  ctx.font = `${bold ? '700' : '400'} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}
function bar(ctx, x, y, w, h, frac, fill, bg = '#3a2a1a') {
  roundRect(ctx, x, y, w, h, h / 2); ctx.fillStyle = bg; ctx.fill();
  if (frac > 0) { roundRect(ctx, x, y, Math.max(h, w * Math.min(1, frac)), h, h / 2); ctx.fillStyle = fill; ctx.fill(); }
}
export function drawStar(ctx, x, y, r, filled, color = '#ffd94d') {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    ctx[i === 0 ? 'moveTo' : 'lineTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = filled ? color : '#5a4632';
  ctx.fill();
  ctx.strokeStyle = '#8a6a42'; ctx.lineWidth = 1.5; ctx.stroke();
}

// --- food drawing (canvas shapes only) ---
export function drawIngredientIcon(ctx, ingId, cx, cy, r) {
  const ing = INGREDIENTS[ingId];
  if (!ing) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = ing.color;
  ctx.strokeStyle = ing.dark; ctx.lineWidth = 2;
  if (ingId === 'rice' || ingId === 'noodle') {
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = ing.dark; ctx.lineWidth = 1.5;
    for (let i = -2; i <= 2; i += 1) { ctx.beginPath(); ctx.moveTo(-r * 0.7, i * r * 0.25); ctx.quadraticCurveTo(0, i * r * 0.25 - r * 0.2, r * 0.7, i * r * 0.25); ctx.stroke(); }
  } else if (ingId === 'egg') {
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.75, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2); ctx.fillStyle = '#ff9d00'; ctx.fill();
  } else if (ingId === 'chilli') {
    ctx.beginPath(); ctx.moveTo(-r, r * 0.3); ctx.quadraticCurveTo(0, -r * 1.1, r * 0.9, -r * 0.4); ctx.quadraticCurveTo(r * 0.4, r * 0.7, -r, r * 0.3); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#2e7d3c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(r * 0.8, -r * 0.4); ctx.quadraticCurveTo(r * 1.2, -r * 0.8, r * 1.1, -r * 1.1); ctx.stroke();
  } else if (ingId === 'broth') {
    ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2); ctx.fillStyle = '#fff3c9'; ctx.fill();
  } else if (ingId === 'cracker') {
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.fillStyle = '#fff3c9'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2); ctx.fillStyle = ing.dark; ctx.fill();
  } else if (ingId === 'lime') {
    ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -r * 0.6); ctx.lineTo(0, r * 0.6); ctx.moveTo(-r * 0.5, 0); ctx.lineTo(r * 0.5, 0); ctx.strokeStyle = '#e8ffb0'; ctx.lineWidth = 2; ctx.stroke();
  } else {
    // chunky pieces: chicken / beef / tofu / veg / peanut
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.8, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(r * 0.3, -r * 0.3, r * 0.55, r * 0.45, 0.3, 0, Math.PI * 2); ctx.fillStyle = ing.dark; ctx.globalAlpha = 0.55; ctx.fill(); ctx.globalAlpha = 1;
    if (ingId === 'veg') { ctx.strokeStyle = '#2e7d3c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-r * 0.6, r * 0.4); ctx.lineTo(r * 0.6, -r * 0.4); ctx.stroke(); }
  }
  ctx.restore();
}

export function drawDish(ctx, recipe, cx, cy, r) {
  // white plate
  ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.25, r * 0.9, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fdf6e3'; ctx.fill(); ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.95, r * 0.65, 0, 0, Math.PI * 2);
  ctx.fillStyle = recipe.color; ctx.fill();
  // second colour mound + garnish
  ctx.beginPath(); ctx.ellipse(cx - r * 0.25, cy - r * 0.15, r * 0.55, r * 0.35, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = recipe.color2; ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r * 0.45, cy - r * 0.3, r * 0.18, 0, Math.PI * 2); ctx.fillStyle = '#58b368'; ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r * 0.2, cy + r * 0.25, r * 0.14, 0, Math.PI * 2); ctx.fillStyle = '#ffd94d'; ctx.fill();
}

function drawFace(ctx, x, y, r, mood) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = mood === 'angry' ? '#e87a5d' : mood === 'worried' ? '#e8c96a' : '#f2c9a0'; ctx.fill();
  ctx.strokeStyle = '#7a5230'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#2a1a10';
  ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.15, r * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.35, y - r * 0.15, r * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  if (mood === 'angry') { ctx.moveTo(x - r * 0.45, y + r * 0.45); ctx.lineTo(x, y + r * 0.15); ctx.lineTo(x + r * 0.45, y + r * 0.45); }
  else { ctx.arc(x, y + r * 0.25, r * 0.4, 0.15 * Math.PI, 0.85 * Math.PI); }
  ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 2; ctx.stroke();
  // chef hat brim
  ctx.beginPath(); ctx.ellipse(x, y - r * 0.85, r * 0.9, r * 0.35, 0, Math.PI, 0); ctx.fillStyle = '#fdf6e3'; ctx.fill();
}

function drawTicket(ctx, world, order, i) {
  const r = ticketRect(i);
  const recipe = recipeById(order.recipeId);
  const frac = Math.max(0, order.patience / order.patienceMax);
  const mood = orderUrgency(order);
  const selected = world.activeOrderId === order.id;
  roundRect(ctx, r.x, r.y, r.w, r.h, 12);
  ctx.fillStyle = selected ? '#fff3c9' : '#fdf6e3'; ctx.fill();
  ctx.strokeStyle = selected ? '#d9381e' : mood === 'angry' ? '#d9381e' : '#c9a24a';
  ctx.lineWidth = selected ? 4 : 2; ctx.stroke();
  drawFace(ctx, r.x + 26, r.y + 30, 18, mood);
  text(ctx, order.name, r.x + 50, r.y + 26, 15, '#3a2a1a');
  text(ctx, recipe.short, r.x + 50, r.y + 48, 14, '#8f1d0c');
  text(ctx, `"${order.line}"`, r.x + 12, r.y + 72, 11, '#6a5238', 'left', false);
  drawDish(ctx, recipe, r.x + 168, r.y + 34, 22);
  bar(ctx, r.x + 12, r.y + 88, r.w - 24, 10, frac, frac < 0.25 ? '#d9381e' : frac < 0.5 ? '#e8a34c' : '#58b368');
  text(ctx, `Rp ${recipe.price} + tip`, r.x + 12, r.y + 106, 11, '#6a5238', 'left', false);
}

function drawStationLabel(ctx, x, y, label) {
  text(ctx, label, x, y, 15, '#fff3c9');
}

function drawWok(ctx, world, idx, zone) {
  const slot = world.wokSlots[idx];
  roundRect(ctx, zone.x, zone.y, zone.w, zone.h, 12);
  ctx.fillStyle = '#4a3423'; ctx.fill(); ctx.strokeStyle = '#8a6a42'; ctx.lineWidth = 2; ctx.stroke();
  drawStationLabel(ctx, zone.x + 10, zone.y + 22, idx === 0 ? 'WOK 1 — Stove' : 'WOK 2 — Stove');
  // stove rings
  ctx.beginPath(); ctx.ellipse(zone.x + zone.w / 2, zone.y + 150, 52, 16, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#2a1a10'; ctx.fill();
  if (slot) {
    const cx = zone.x + zone.w / 2, cy = zone.y + 130;
    const done = slot.t >= slot.cookTime;
    const burnt = slot.t >= slot.cookTime + 2.2;
    ctx.beginPath(); ctx.ellipse(cx, cy, 56, 20, 0, 0, Math.PI * 2);
    ctx.fillStyle = burnt ? '#1a1a1a' : done ? '#58b368' : '#3a2a1a'; ctx.fill();
    ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 3; ctx.stroke();
    drawIngredientIcon(ctx, slot.ing, cx, cy - 8, 26);
    const frac = Math.min(1, slot.t / slot.cookTime);
    bar(ctx, zone.x + 14, zone.y + 62, zone.w - 28, 12, frac, done ? (burnt ? '#d9381e' : '#58b368') : '#e8a34c');
    text(ctx, burnt ? 'BURNT! Click to toss' : done ? 'READY! Click to take out' : 'Cooking...', zone.x + zone.w / 2, zone.y + 92, 12, burnt ? '#ff6b5e' : done ? '#7CFC98' : '#fff3c9', 'center');
    text(ctx, INGREDIENTS[slot.ing].name, zone.x + zone.w / 2, zone.y + 44, 13, '#fff3c9', 'center');
  } else {
    text(ctx, 'Empty — click an', zone.x + zone.w / 2, zone.y + 70, 12, '#a98a62', 'center', false);
    text(ctx, 'ingredient that cooks', zone.x + zone.w / 2, zone.y + 90, 12, '#a98a62', 'center', false);
    ctx.beginPath(); ctx.ellipse(zone.x + zone.w / 2, zone.y + 135, 52, 18, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#6a5238'; ctx.lineWidth = 2; ctx.stroke();
  }
  // flame
  if (slot && slot.t < slot.cookTime) {
    ctx.fillStyle = 'rgba(255,150,40,0.85)';
    ctx.beginPath();
    ctx.moveTo(zone.x + zone.w / 2 - 18, zone.y + 168);
    ctx.quadraticCurveTo(zone.x + zone.w / 2, zone.y + 138, zone.x + zone.w / 2 + 18, zone.y + 168);
    ctx.closePath(); ctx.fill();
  }
}

function drawChopBoard(ctx, world) {
  const z = ZONES.chop;
  roundRect(ctx, z.x, z.y, z.w, z.h, 12);
  ctx.fillStyle = '#6e4a26'; ctx.fill(); ctx.strokeStyle = '#8a6a42'; ctx.lineWidth = 2; ctx.stroke();
  drawStationLabel(ctx, z.x + 10, z.y + 22, 'CHOPPING BOARD');
  // wooden board
  roundRect(ctx, z.x + 20, z.y + 40, z.w - 40, 110, 10);
  ctx.fillStyle = '#c9a24a'; ctx.fill(); ctx.strokeStyle = '#8a6a42'; ctx.stroke();
  const slot = world.chopSlot;
  if (slot) {
    drawIngredientIcon(ctx, slot.ing, z.x + z.w / 2, z.y + 95, 34);
    bar(ctx, z.x + 24, z.y + 162, z.w - 48, 12, slot.progress, '#58b368');
    text(ctx, 'Click board / Space to chop!', z.x + z.w / 2, z.y + 192, 12, '#fff3c9', 'center');
  } else {
    text(ctx, 'Empty — click an', z.x + z.w / 2, z.y + 90, 12, '#a98a62', 'center', false);
    text(ctx, 'ingredient that chops', z.x + z.w / 2, z.y + 110, 12, '#a98a62', 'center', false);
    // knife drawn on board
    ctx.save(); ctx.translate(z.x + z.w / 2, z.y + 150); ctx.rotate(-0.4);
    roundRect(ctx, -40, -6, 70, 12, 4); ctx.fillStyle = '#d9d9d9'; ctx.fill();
    roundRect(ctx, 30, -5, 22, 10, 3); ctx.fillStyle = '#3a2a1a'; ctx.fill(); ctx.restore();
  }
}

function drawAssembly(ctx, world) {
  const z = ZONES.assembly;
  roundRect(ctx, z.x, z.y, z.w, z.h, 12);
  ctx.fillStyle = '#7a5230'; ctx.fill(); ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 2; ctx.stroke();
  drawStationLabel(ctx, z.x + 10, z.y + 22, 'ASSEMBLY COUNTER');
  const order = world.orders.find((o) => o.id === world.activeOrderId);
  if (world.build) {
    const recipe = recipeById(world.build.recipeId);
    drawDish(ctx, recipe, z.x + 70, z.y + 120, 44);
    recipe.steps.forEach((s, i) => {
    const y = z.y + 52 + i * 26;
    const done = world.build.done.has(i);
    ctx.beginPath(); ctx.arc(z.x + 140, y - 4, 8, 0, Math.PI * 2);
    ctx.fillStyle = done ? '#58b368' : '#3a2a1a'; ctx.fill();
    if (done) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(z.x + 136, y - 4); ctx.lineTo(z.x + 139, y); ctx.lineTo(z.x + 145, y - 8); ctx.stroke(); }
    text(ctx, `${INGREDIENTS[s.ing].name} — ${s.action === 'raw' ? 'add' : s.action === 'chop' ? 'chop' : s.action === 'cook' ? 'cook' : 'chop + cook'}`, z.x + 156, y, 13, done ? '#7CFC98' : '#fff3c9', 'left', done);
  });
  } else if (world.plate) {
    drawDish(ctx, recipeById(world.plate.recipeId), z.x + 110, z.y + 120, 52);
    text(ctx, recipeById(world.plate.recipeId).name, z.x + 190, z.y + 100, 15, '#fff3c9');
    text(ctx, 'Dish complete!', z.x + 190, z.y + 126, 13, '#7CFC98');
  } else {
    text(ctx, order ? `Building: ${recipeById(order.recipeId).name}` : 'Pick a ticket, then tap', z.x + z.w / 2, z.y + 70, 14, '#fff3c9', 'center');
    text(ctx, order ? 'ingredients below in order' : 'ingredients below to start', z.x + z.w / 2, z.y + 94, 12, '#e8c96a', 'center', false);
    if (order) drawDish(ctx, recipeById(order.recipeId), z.x + z.w / 2, z.y + 140, 34);
  }
}

function drawServePass(ctx, world) {
  const z = ZONES.plate;
  roundRect(ctx, z.x, z.y, z.w, z.h, 12);
  ctx.fillStyle = world.plate ? '#2e7d3c' : '#4a3423'; ctx.fill();
  ctx.strokeStyle = world.plate ? '#7CFC98' : '#8a6a42'; ctx.lineWidth = world.plate ? 4 : 2; ctx.stroke();
  drawStationLabel(ctx, z.x + 10, z.y + 22, 'SERVING PASS');
  if (world.plate) {
    const two = !!world.plate2;
    drawDish(ctx, recipeById(world.plate.recipeId), z.x + z.w / 2 - (two ? 52 : 0), z.y + 105, two ? 38 : 48);
    if (two) drawDish(ctx, recipeById(world.plate2.recipeId), z.x + z.w / 2 + 52, z.y + 105, 38);
    text(ctx, two ? '2 PLATES READY!' : 'READY TO SERVE!', z.x + z.w / 2, z.y + 172, 16, '#ffd94d', 'center');
    text(ctx, 'Click here to serve', z.x + z.w / 2, z.y + 192, 12, '#fff3c9', 'center', false);
  } else {
    text(ctx, 'No plate ready yet.', z.x + z.w / 2, z.y + 90, 13, '#a98a62', 'center', false);
    text(ctx, 'Finish a dish at the', z.x + z.w / 2, z.y + 112, 12, '#a98a62', 'center', false);
    text(ctx, 'assembly counter.', z.x + z.w / 2, z.y + 132, 12, '#a98a62', 'center', false);
    ctx.beginPath(); ctx.ellipse(z.x + z.w / 2, z.y + 160, 60, 16, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#6a5238'; ctx.lineWidth = 2; ctx.stroke();
  }
}

function drawBins(ctx, world) {
  text(ctx, 'INGREDIENTS — click one to prep it for the selected ticket  (hotkeys 1-9, 0, -, =)', 16, 508, 14, '#fff3c9');
  INGREDIENT_ORDER.forEach((id, i) => {
    const r = binRect(i);
    const ing = INGREDIENTS[id];
    roundRect(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fillStyle = '#fdf6e3'; ctx.fill(); ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 2; ctx.stroke();
    drawIngredientIcon(ctx, id, r.x + r.w / 2, r.y + 42, 26);
    text(ctx, ing.name, r.x + r.w / 2, r.y + 88, 13, '#3a2a1a', 'center');
    text(ctx, ing.chop && ing.cook ? 'chop+cook' : ing.chop ? 'chop' : ing.cook ? 'cook' : 'add', r.x + r.w / 2, r.y + 108, 11, '#8f6a3a', 'center', false);
    text(ctx, `${i + 1 > 9 ? ['0', '-', '='][i - 9] : i + 1}`, r.x + r.w - 10, r.y + 16, 11, '#a98a62', 'right', false);
  });
}

function drawHUD(ctx, world, screen) {
  roundRect(ctx, 0, 0, W, 64, 0);
  ctx.fillStyle = '#2a1a10'; ctx.fill();
  text(ctx, 'SIZZLE & SPICE', 16, 28, 22, '#ffd94d');
  text(ctx, 'Warung Kitchen Rush', 16, 50, 12, '#e8a34c', 'left', false);
  const scriptLabel = world.mode === 'career' ? `Day ${world.day} / 5` : world.mode === 'rush' ? 'RUSH' : 'ZEN';
  text(ctx, scriptLabel, 330, 30, 18, '#fff3c9');
  if (world.timeLeft !== Infinity) {
    const total = world.mode === 'rush' ? 180 : 120;
    const frac = Math.max(0, world.timeLeft / total);
    const mm = Math.floor(world.timeLeft / 60), ss = Math.floor(world.timeLeft % 60);
    text(ctx, `TIME ${mm}:${String(ss).padStart(2, '0')}`, 330, 52, 14, frac < 0.2 ? '#ff6b5e' : '#fff3c9');
    bar(ctx, 470, 18, 300, 20, frac, frac < 0.2 ? '#d9381e' : '#e8a34c');
  } else {
    text(ctx, 'No timer — relax!', 470, 32, 14, '#7CFC98');
  }
  text(ctx, `COINS ${world.coins}`, 800, 30, 18, '#ffd94d');
  text(ctx, `SCORE ${world.score}`, 800, 52, 13, '#fff3c9', 'left', false);
  const combo = world.combo;
  text(ctx, combo > 1 ? `COMBO x${combo}  (+${Math.min(combo, 12) * 10}%)` : 'COMBO —', 980, 30, 16, combo > 1 ? '#ff9d00' : '#a98a62');
  text(ctx, `Served ${world.served}   Best ${world.bestCombo} combo`, 980, 52, 12, '#e8c96a', 'left', false);
  text(ctx, isMuted() ? 'M: muted' : 'M: sound on', 1240, 30, 12, '#a98a62', 'right', false);
  text(ctx, 'P pause · R restart', 1240, 50, 12, '#a98a62', 'right', false);
  if (world.messageT > 0) {
    text(ctx, world.message, W / 2, 200, 16, '#ffd94d', 'center');
  }
}

function drawParticles(ctx, world) {
  for (const q of world.particles.list) {
    const a = 1 - q.life / q.max;
    if (q.kind === 'steam') {
      ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (1 + q.life), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.35 * a})`; ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
      ctx.fillStyle = q.color; ctx.globalAlpha = a; ctx.fill(); ctx.globalAlpha = 1;
    }
  }
  for (const q of world.particles.popups) {
    const a = 1 - q.life / q.max;
    ctx.globalAlpha = Math.min(1, a * 1.5);
    text(ctx, q.text, q.x, q.y, 18, q.color, 'center');
    ctx.globalAlpha = 1;
  }
}

export function drawGame(ctx, world) {
  // warm kitchen backdrop
  ctx.fillStyle = '#8a5a2e'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#a06a35'; ctx.fillRect(0, 200, W, 300);
  // wall tiles
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let x = 0; x < W; x += 80) for (let y = 64; y < 200; y += 40) ctx.fillRect(x, y, 76, 36);
  // counter top
  ctx.fillStyle = '#5a3a1e'; ctx.fillRect(0, 440, W, 60);
  ctx.fillStyle = '#7a5230'; ctx.fillRect(0, 440, W, 10);
  text(ctx, 'ORDER BOARD — click a ticket to cook it', 16, 72, 12, '#ffd94d', 'left', false);
  if (world.orders.length === 0) text(ctx, 'No orders yet — the lunch crowd is coming...', 200, 140, 15, '#fff3c9', 'left', false);
  world.orders.forEach((o, i) => drawTicket(ctx, world, o, i));
  drawChopBoard(ctx, world);
  drawWok(ctx, world, 0, ZONES.wok0);
  if (world.upgrades.has('wok2')) drawWok(ctx, world, 1, ZONES.wok1);
  else {
    const z = ZONES.wok1;
    roundRect(ctx, z.x, z.y, z.w, z.h, 12); ctx.fillStyle = 'rgba(42,26,16,0.55)'; ctx.fill();
    ctx.strokeStyle = '#6a5238'; ctx.lineWidth = 2; ctx.stroke();
    text(ctx, 'WOK 2 — LOCKED', z.x + z.w / 2, z.y + 90, 13, '#a98a62', 'center');
    text(ctx, 'Buy "Second Wok"', z.x + z.w / 2, z.y + 112, 12, '#a98a62', 'center', false);
    text(ctx, 'in the day shop (40c)', z.x + z.w / 2, z.y + 132, 12, '#a98a62', 'center', false);
  }
  drawAssembly(ctx, world);
  drawServePass(ctx, world);
  drawBins(ctx, world);
  drawParticles(ctx, world);
  drawHUD(ctx, world);
  // order queue hint
  if (world.orders.length > 0 && !world.activeOrderId && !world.build) {
    text(ctx, 'Click a ticket to start cooking it!', W / 2, 228, 15, '#ffd94d', 'center');
  }
}

export function drawTitle(ctx, save) {
  ctx.fillStyle = '#2a1a10'; ctx.fillRect(0, 0, W, H);
  // warm glow + big plate
  const g = ctx.createRadialGradient(640, 300, 40, 640, 300, 420);
  g.addColorStop(0, '#7a4a22'); g.addColorStop(1, '#2a1a10');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  drawDish(ctx, RECIPES[0], 640, 250, 110);
  text(ctx, 'SIZZLE & SPICE', 640, 130, 58, '#ffd94d', 'center');
  text(ctx, '— Warung Kitchen Rush —', 640, 168, 24, '#e8a34c', 'center', false);
  text(ctx, 'Run your own warung: chop, wok, plate and serve before the crowd storms out!', 640, 420, 17, '#fff3c9', 'center', false);
  text(ctx, '12 original recipes · 5 career days · Rush & Zen modes · upgrades between days', 640, 448, 14, '#e8c96a', 'center', false);
  const modes = [
    { key: '1', label: 'CAREER — 5 days, rising rush', sub: 'Stars + upgrade shop' },
    { key: '2', label: 'RUSH — 3 minutes endless', sub: 'How many can you serve?' },
    { key: '3', label: 'ZEN — no timer, no anger', sub: 'Relaxed cooking, still scored' },
  ];
  modes.forEach((m, i) => {
    const y = 490 + i * 56;
    roundRect(ctx, 390, y, 500, 46, 12);
    ctx.fillStyle = '#fdf6e3'; ctx.fill(); ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 2; ctx.stroke();
    text(ctx, `[${m.key}] ${m.label}`, 640, y + 20, 16, '#3a2a1a', 'center');
    text(ctx, m.sub, 640, y + 38, 12, '#8f6a3a', 'center', false);
  });
  text(ctx, 'Click a mode or press 1 / 2 / 3 · Mouse + keyboard · P pause · M mute · R restart', 640, 680, 13, '#a98a62', 'center', false);
  if (save.bestScore > 0) text(ctx, `Best score ${save.bestScore} · Best coins ${save.bestCoins}`, 640, 700, 13, '#ffd94d', 'center', false);
}

export function drawDaySummary(ctx, world, save) {
  ctx.fillStyle = 'rgba(42,26,16,0.92)'; ctx.fillRect(0, 0, W, H);
  roundRect(ctx, 340, 80, 600, 520, 18);
  ctx.fillStyle = '#fdf6e3'; ctx.fill(); ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 3; ctx.stroke();
  const lastDay = world.mode === 'career' && world.day >= 5;
  text(ctx, lastDay ? 'CAREER COMPLETE!' : `DAY ${world.day} COMPLETE!`, 640, 140, 34, '#8f1d0c', 'center');
  const stars = starsForCoins(world.dayCoins);
  for (let i = 0; i < 3; i += 1) drawStar(ctx, 560 + i * 80, 190, 30, i < stars);
  text(ctx, `Coins earned today: ${world.dayCoins}`, 640, 250, 20, '#3a2a1a', 'center');
  text(ctx, `Dishes served: ${world.served}   Best combo: x${world.bestCombo}   Perfect: ${world.perfectCount}`, 640, 284, 15, '#6a5238', 'center', false);
  text(ctx, `Walk-outs: ${world.angryCount}   Total coins: ${world.coins}`, 640, 310, 15, '#6a5238', 'center', false);
  if (world.mode !== 'career' || lastDay) {
    text(ctx, 'Press Enter / click Continue for the final tally.', 640, 350, 15, '#8f1d0c', 'center');
  } else {
    text(ctx, '— UPGRADE SHOP — spend coins, keep them all career long', 640, 350, 15, '#8f1d0c', 'center');
    UPGRADES.forEach((u, i) => {
      const y = 372 + i * 40;
      const owned = world.upgrades.has(u.id);
      const afford = world.coins >= u.cost;
      roundRect(ctx, 380, y, 520, 34, 8);
      ctx.fillStyle = owned ? '#d8f5d8' : afford ? '#fff3c9' : '#e8dcc8'; ctx.fill();
      ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 1.5; ctx.stroke();
      text(ctx, `${owned ? 'OWNED' : `${u.cost}c`}  ${u.name}`, 394, y + 22, 14, '#3a2a1a', 'left');
      text(ctx, u.desc, 700, y + 22, 11, '#6a5238', 'left', false);
    });
  }
  text(ctx, world.mode === 'career' && !lastDay ? 'Click an upgrade to buy · Click CONTINUE (or Enter) for Day ' + (world.day + 1) : 'Click CONTINUE (or Enter) to finish', 640, 580, 15, '#3a2a1a', 'center');
}

export function drawOver(ctx, world, save) {
  ctx.fillStyle = 'rgba(42,26,16,0.92)'; ctx.fillRect(0, 0, W, H);
  roundRect(ctx, 340, 140, 600, 400, 18);
  ctx.fillStyle = '#fdf6e3'; ctx.fill(); ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 3; ctx.stroke();
  const title = world.mode === 'rush' ? "TIME'S UP — RUSH OVER!" : world.mode === 'zen' ? 'ZEN SESSION DONE' : 'CAREER COMPLETE!';
  text(ctx, title, 640, 200, 32, '#8f1d0c', 'center');
  text(ctx, `Final score: ${world.score}`, 640, 260, 24, '#3a2a1a', 'center');
  text(ctx, `Coins: ${world.coins}   Dishes served: ${world.served}   Best combo: x${world.bestCombo}`, 640, 300, 16, '#6a5238', 'center', false);
  text(ctx, `Perfect cooks & chops: ${world.perfectCount}   Walk-outs: ${world.angryCount}`, 640, 330, 16, '#6a5238', 'center', false);
  if (save.bestScore > 0) text(ctx, `All-time best score: ${save.bestScore}`, 640, 366, 15, '#8f1d0c', 'center');
  text(ctx, 'Press R or click to play again — thank you for cooking at Sizzle & Spice!', 640, 420, 15, '#3a2a1a', 'center');
  text(ctx, 'Tip: serve fast while patience is high — tips and combo multiply your coins.', 640, 460, 13, '#6a5238', 'center', false);
}

export function drawPause(ctx) {
  ctx.fillStyle = 'rgba(20,12,6,0.7)'; ctx.fillRect(0, 0, W, H);
  text(ctx, 'PAUSED', 640, 340, 48, '#ffd94d', 'center');
  text(ctx, 'Press P / Esc to resume · R to restart · M to mute', 640, 390, 16, '#fff3c9', 'center', false);
}
