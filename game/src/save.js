// Best scores and day stars, saved in localStorage (never a cookie, never a network call).
const KEY = 'sizzle-and-spice-save-v1';
export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { bestCoins: 0, bestScore: 0, stars: {}, careerBestDay: 0 };
    const data = JSON.parse(raw);
    return { bestCoins: data.bestCoins | 0, bestScore: data.bestScore | 0, stars: data.stars || {}, careerBestDay: data.careerBestDay | 0 };
  } catch { return { bestCoins: 0, bestScore: 0, stars: {}, careerBestDay: 0 }; }
}
export function storeSave(save) {
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch { /* storage unavailable: play on */ }
}
export function recordDayStars(save, day, stars) {
  if ((save.stars[day] | 0) < stars) save.stars[day] = stars;
  if (day > save.careerBestDay) save.careerBestDay = day;
  storeSave(save);
  return save;
}
export function recordScore(save, coins, score) {
  if (coins > save.bestCoins) save.bestCoins = coins;
  if (score > save.bestScore) save.bestScore = score;
  storeSave(save);
  return save;
}
