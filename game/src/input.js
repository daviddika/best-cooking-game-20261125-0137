// Mouse + keyboard input: tracks clicks (in canvas coordinates) and pressed keys.
export function makeInput(canvas) {
  const input = { clicks: [], keys: [], mouseX: 0, mouseY: 0, hoverX: -1, hoverY: -1 };
  function toCanvas(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
  }
  canvas.addEventListener('pointerdown', (e) => {
    const p = toCanvas(e);
    input.clicks.push(p); input.mouseX = p.x; input.mouseY = p.y;
  });
  canvas.addEventListener('pointermove', (e) => {
    const p = toCanvas(e); input.hoverX = p.x; input.hoverY = p.y;
  });
  window.addEventListener('keydown', (e) => {
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
    if (!e.repeat) input.keys.push(e.code);
  });
  return input;
}
export function drainClicks(input) { const c = input.clicks; input.clicks = []; return c; }
export function drainKeys(input) { const k = input.keys; input.keys = []; return k; }
export function hitRect(x, y, r) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }
