// game.js — state, input, timer, skor, hint, menang/kalah.
// Semua logika murni (tanpa DOM) kecuali pemetaan klik canvas ke koordinat scene.

import { SCENES } from "./scenes.js";
import { LAYOUT, makeSceneCanvases } from "./render.js";
import { sfx } from "./audio.js";

export function createGame() {
  return {
    scenes: SCENES,
    phase: "menu", // menu | playing | won | lost
    levelIndex: 0,
    scene: SCENES[0],
    canvases: null,
    found: new Set(),
    score: 0,
    levelScore: 0,
    timeBonus: 0,
    timeLeft: 180,
    hints: 3,
    hint: null, // {diff, until}
    muted: false,
    shakeUntil: 0,
    message: "Pilih level untuk mulai berburu perbedaan!",
    cleared: new Set(),
    frozen: false, // mode screenshot: timer dibekukan agar hasil stabil
    _lastTick: 0,
  };
}

export function startLevel(g, i) {
  const scene = SCENES[i];
  g.levelIndex = i;
  g.scene = scene;
  g.canvases = makeSceneCanvases(scene);
  g.found = new Set();
  g.levelScore = 0;
  g.timeBonus = 0;
  g.timeLeft = scene.timeLimit;
  g.hints = 3;
  g.hint = null;
  g.phase = "playing";
  g.message = scene.name + ": temukan " + scene.diffs.length + " perbedaan!";
  g._lastTick = performance.now();
}

function toMenu(g) {
  g.phase = "menu";
  g.message = "Pilih level untuk mulai berburu perbedaan!";
}

function winLevel(g) {
  g.phase = "won";
  g.timeBonus = Math.floor(g.timeLeft) * 5;
  g.score += g.timeBonus;
  g.cleared.add(g.levelIndex);
  g.message = "Level selesai! Bonus waktu +" + g.timeBonus + ".";
  sfx.win(g.muted);
}

function loseLevel(g) {
  g.phase = "lost";
  g.message = "Waktu habis! Tekan R untuk mencoba lagi.";
  sfx.lose(g.muted);
}

function useHint(g, now) {
  if (g.phase !== "playing") return;
  if (g.hints <= 0) {
    g.message = "Hint habis untuk level ini.";
    return;
  }
  const remaining = g.scene.diffs.filter((d) => !g.found.has(d.id));
  if (remaining.length === 0) return;
  const diff = remaining[Math.floor(Math.random() * remaining.length)];
  g.hints -= 1;
  g.hint = { diff, until: now + 2000 };
  g.message = "Hint: lihat lingkaran biru — satu perbedaan ada di sana!";
  sfx.hint(g.muted);
}

// Klik pada koordinat scene (0–600, 0–400). Dipakai game + debug API.
export function clickAtScene(g, x, y, now) {
  if (g.phase !== "playing") return false;
  for (const d of g.scene.diffs) {
    if (g.found.has(d.id)) continue;
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) {
      g.found.add(d.id);
      g.score += 100;
      g.levelScore += 100;
      g.message = "Ketemu! " + d.label + "  (+100)";
      sfx.chime(g.muted);
      if (g.found.size === g.scene.diffs.length) winLevel(g);
      return true;
    }
  }
  // Klik salah: penalti waktu + goyang.
  g.timeLeft = Math.max(0, g.timeLeft - 5);
  g.shakeUntil = now + 300;
  g.message = "Bukan di sana — penalti 5 detik!";
  sfx.buzz(g.muted);
  if (g.timeLeft <= 0) loseLevel(g);
  return false;
}

function inRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

// Klik pada koordinat logis canvas 1280x720.
export function handleCanvasClick(g, lx, ly, now) {
  if (g.phase === "menu") {
    for (const c of LAYOUT.menuCards) {
      if (inRect(lx, ly, c)) {
        startLevel(g, c.level);
        sfx.click(g.muted);
        return;
      }
    }
    return;
  }
  if (g.phase === "won") {
    if (inRect(lx, ly, LAYOUT.winBtns.next)) {
      startLevel(g, (g.levelIndex + 1) % SCENES.length);
      sfx.click(g.muted);
    } else if (inRect(lx, ly, LAYOUT.winBtns.replay)) {
      startLevel(g, g.levelIndex);
      sfx.click(g.muted);
    } else if (inRect(lx, ly, LAYOUT.winBtns.menu)) {
      toMenu(g);
      sfx.click(g.muted);
    }
    return;
  }
  if (g.phase === "lost") {
    if (inRect(lx, ly, LAYOUT.loseBtns.retry)) {
      startLevel(g, g.levelIndex);
      sfx.click(g.muted);
    } else if (inRect(lx, ly, LAYOUT.loseBtns.menu)) {
      toMenu(g);
      sfx.click(g.muted);
    }
    return;
  }
  // playing
  if (inRect(lx, ly, LAYOUT.hintBtn)) {
    useHint(g, now);
    return;
  }
  const L = LAYOUT;
  let panel = -1;
  let sx = 0;
  if (lx >= L.leftX && lx <= L.leftX + L.panelW && ly >= L.panelY && ly <= L.panelY + L.panelH) {
    panel = 0;
    sx = lx - L.leftX;
  } else if (lx >= L.rightX && lx <= L.rightX + L.panelW && ly >= L.panelY && ly <= L.panelY + L.panelH) {
    panel = 1;
    sx = lx - L.rightX;
  }
  if (panel >= 0) clickAtScene(g, sx, ly - L.panelY, now);
}

export function handleKey(g, key, now) {
  const k = key.toLowerCase();
  if (k === "m") {
    g.muted = !g.muted;
    g.message = g.muted ? "Suara dimatikan." : "Suara dihidupkan.";
    return;
  }
  if (k === "h") {
    useHint(g, now);
    return;
  }
  if (k === "r") {
    if (g.phase === "playing" || g.phase === "won" || g.phase === "lost") {
      startLevel(g, g.levelIndex);
      sfx.click(g.muted);
    }
    return;
  }
  if (k === "1" || k === "2" || k === "3") {
    startLevel(g, Number(k) - 1);
    sfx.click(g.muted);
  }
}

// Dipanggil tiap frame: hitung mundur timer, kadaluarsakan hint.
export function update(g, now) {
  if (g.phase !== "playing" || g.frozen) {
    g._lastTick = now;
    return;
  }
  const dt = Math.min(1, (now - g._lastTick) / 1000);
  g._lastTick = now;
  g.timeLeft -= dt;
  if (g.hint && now >= g.hint.until) g.hint = null;
  if (g.timeLeft <= 0) {
    g.timeLeft = 0;
    loseLevel(g);
  }
}
