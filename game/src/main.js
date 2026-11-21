// main.js — boot game, loop render, input, mode screenshot (?shot=),
// dan API debug window.__SPOTDIFF__ untuk verifikasi otomatis.

import { createGame, startLevel, handleCanvasClick, handleKey, update, clickAtScene } from "./game.js";
import { drawFrame, LAYOUT } from "./render.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const game = createGame();

function toLogical(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * LAYOUT.W,
    y: ((e.clientY - r.top) / r.height) * LAYOUT.H,
  };
}

canvas.addEventListener("click", (e) => {
  const p = toLogical(e);
  handleCanvasClick(game, p.x, p.y, performance.now());
});

window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  handleKey(game, e.key, performance.now());
});

function frame(now) {
  update(game, now);
  drawFrame(ctx, game, now);
  requestAnimationFrame(frame);
}

// Mode screenshot deterministik untuk pembuatan screenshots/:
// ?shot=cover  — level 1 tengah jalan (3 dari 7 ketemu, counter terlihat)
// ?shot=levels — layar pilih level
// ?shot=scene2 — level 2 tengah jalan (2 dari 10 ketemu)
// ?shot=win    — layar menang level 1 (semua ketemu)
function applyShotMode() {
  const shot = new URLSearchParams(window.location.search).get("shot");
  if (!shot) return;
  const now = performance.now();
  if (shot === "cover") {
    startLevel(game, 0);
    for (const id of ["lampion", "jeruk", "bulan"]) game.found.add(id);
    game.score = 300;
    game.levelScore = 300;
    game.timeLeft = 132;
    game.message = "Ketemu! Ukuran bulan  (+100)";
  } else if (shot === "levels") {
    game.phase = "menu";
  } else if (shot === "scene2") {
    startLevel(game, 1);
    for (const id of ["camar", "pelampung"]) game.found.add(id);
    game.score = 200;
    game.levelScore = 200;
    game.timeLeft = 118;
    game.message = "Ketemu! Warna pelampung  (+100)";
  } else if (shot === "win") {
    startLevel(game, 0);
    for (const d of game.scene.diffs) game.found.add(d.id);
    game.score = 700;
    game.levelScore = 700;
    game.timeLeft = 96;
    game.phase = "won";
    game.timeBonus = Math.floor(game.timeLeft) * 5;
    game.score += game.timeBonus;
    game.cleared.add(0);
    game.message = "Level selesai! Bonus waktu +" + game.timeBonus + ".";
  }
  // Bekukan timer di mode shot agar screenshot stabil.
  game.frozen = true;
}

applyShotMode();
requestAnimationFrame(frame);

// API debug untuk verifikasi Playwright (bukan bagian gameplay normal).
window.__SPOTDIFF__ = {
  game,
  state() {
    return {
      phase: game.phase,
      level: game.levelIndex,
      scene: game.scene.id,
      found: [...game.found],
      foundCount: game.found.size,
      total: game.scene.diffs.length,
      score: game.score,
      timeLeft: Math.round(game.timeLeft * 10) / 10,
      hints: game.hints,
      muted: game.muted,
      message: game.message,
    };
  },
  startLevel(i) {
    startLevel(game, i);
  },
  clickAt(x, y) {
    return clickAtScene(game, x, y, performance.now());
  },
  clickCanvas(lx, ly) {
    handleCanvasClick(game, lx, ly, performance.now());
  },
  key(k) {
    handleKey(game, k, performance.now());
  },
  diffs() {
    return game.scene.diffs.map((d) => ({ id: d.id, x: d.x, y: d.y, r: d.r }));
  },
};
