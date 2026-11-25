// WebAudio-synthesised sounds: sizzle, chop, ding, coin, success jingle. No audio files.
let ctx = null;
let muted = false;
export function isMuted() { return muted; }
export function toggleMute() { muted = !muted; return muted; }
export function ensureAudio() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}
function tone(freq, dur, type, vol, when = 0, slideTo = 0) {
  if (muted || !ensureAudio()) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.02);
}
function noise(dur, vol, filterFreq, when = 0) {
  if (muted || !ensureAudio()) return;
  const t0 = ctx.currentTime + when;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = filterFreq;
  const gain = ctx.createGain(); gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  src.start(t0);
}
export const sfx = {
  chop() { noise(0.09, 0.35, 1800); tone(180, 0.06, 'square', 0.12); },
  sizzle() { noise(0.5, 0.12, 5200); },
  ding() { tone(880, 0.35, 'sine', 0.2); tone(1320, 0.3, 'sine', 0.12, 0.02); },
  coin() { tone(988, 0.09, 'square', 0.14); tone(1319, 0.22, 'square', 0.14, 0.08); },
  serve() { tone(523, 0.12, 'triangle', 0.2); tone(659, 0.12, 'triangle', 0.2, 0.09); tone(784, 0.25, 'triangle', 0.22, 0.18); },
  angry() { tone(220, 0.3, 'sawtooth', 0.14, 0, 110); },
  burn() { noise(0.4, 0.25, 300); tone(140, 0.35, 'sawtooth', 0.12, 0, 70); },
  click() { tone(660, 0.05, 'square', 0.08); },
  star() { tone(1047, 0.15, 'sine', 0.18); tone(1568, 0.3, 'sine', 0.16, 0.1); },
  jingle() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.2, i * 0.11)); },
};
