// Steam, sparks, floating score popups and little bursts of kitchen juice.
export function makeParticles() { return { list: [], popups: [] }; }
export function spawnSteam(p, x, y, n = 1) {
  for (let i = 0; i < n; i += 1) {
    p.list.push({ kind: 'steam', x: x + (Math.random() - 0.5) * 26, y, vx: (Math.random() - 0.5) * 8, vy: -22 - Math.random() * 18, life: 0, max: 0.9 + Math.random() * 0.6, r: 5 + Math.random() * 7 });
  }
}
export function spawnBurst(p, x, y, color, n = 10) {
  for (let i = 0; i < n; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const sp = 40 + Math.random() * 90;
    p.list.push({ kind: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30, life: 0, max: 0.5 + Math.random() * 0.4, r: 2 + Math.random() * 3, color });
  }
}
export function spawnPopup(p, x, y, text, color = '#ffd94d') {
  p.popups.push({ x, y, text, color, life: 0, max: 1.2 });
}
export function stepParticles(p, dt) {
  for (const q of p.list) { q.life += dt; q.x += q.vx * dt; q.y += q.vy * dt; if (q.kind === 'spark') q.vy += 160 * dt; }
  p.list = p.list.filter((q) => q.life < q.max);
  for (const q of p.popups) { q.life += dt; q.y -= 34 * dt; }
  p.popups = p.popups.filter((q) => q.life < q.max);
  if (p.list.length > 220) p.list.splice(0, p.list.length - 220);
}
