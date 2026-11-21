// Répétition espacée (SM-2 simplifié). q : 0 = à revoir, 1 = difficile, 2 = bien, 3 = facile
const DAY = 864e5;
export function review(card, q) {
  const c = { ease: 2.5, ivl: 0, reps: 0, ...card };
  if (q === 0) { c.reps = 0; c.ivl = 0; c.due = Date.now() + 10 * 60e3; }
  else {
    c.ease = Math.max(1.3, c.ease + [0, -0.15, 0, 0.15][q]);
    c.ivl = c.reps === 0 ? (q === 3 ? 3 : 1) : c.reps === 1 ? (q === 1 ? 3 : 6) : Math.round(c.ivl * c.ease * (q === 1 ? 0.8 : q === 3 ? 1.3 : 1));
    c.reps++; c.due = Date.now() + c.ivl * DAY;
  }
  c.last = Date.now();
  return c;
}
export const isDue = (c) => !c.due || c.due <= Date.now();
export const nextLabel = (card, q) => { const c = review(card, q); return q === 0 ? '10 min' : c.ivl + ' j'; };
