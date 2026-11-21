// audio.js — efek suara murni Web Audio (tanpa file audio).
// AudioContext dibuat malas pada interaksi pertama (kebijakan autoplay browser).

let ctx = null;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, dur, type, vol, when, slideTo) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + (when || 0);
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type || "sine";
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

export const sfx = {
  click(muted) {
    if (muted) return;
    tone(520, 0.07, "triangle", 0.08);
  },
  chime(muted) {
    if (muted) return;
    tone(880, 0.16, "sine", 0.14);
    tone(1318, 0.22, "sine", 0.12, 0.09);
  },
  buzz(muted) {
    if (muted) return;
    tone(140, 0.22, "square", 0.07, 0, 90);
  },
  hint(muted) {
    if (muted) return;
    tone(660, 0.12, "sine", 0.1);
    tone(990, 0.14, "sine", 0.08, 0.08);
  },
  win(muted) {
    if (muted) return;
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, "triangle", 0.12, i * 0.11));
  },
  lose(muted) {
    if (muted) return;
    [392, 330, 262].forEach((f, i) => tone(f, 0.25, "triangle", 0.1, i * 0.14));
  },
};
