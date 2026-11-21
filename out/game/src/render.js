// render.js — menggambar satu frame game ke canvas 1280x720.
// Semua teks memakai font sistem (tanpa network). Panel digambar dari dua
// canvas offscreen 600x400 yang dibuat sekali per level.

export const LAYOUT = {
  W: 1280,
  H: 720,
  headerH: 96,
  panelY: 120,
  panelW: 600,
  panelH: 400,
  leftX: 20,
  rightX: 660,
  footerY: 540,
  hintBtn: { x: 1070, y: 26, w: 150, h: 44 },
  menuCards: [
    { x: 140, y: 300, w: 300, h: 190, level: 0 },
    { x: 490, y: 300, w: 300, h: 190, level: 1 },
    { x: 840, y: 300, w: 300, h: 190, level: 2 },
  ],
  winBtns: {
    next: { x: 440, y: 470, w: 180, h: 52 },
    replay: { x: 650, y: 470, w: 180, h: 52 },
    menu: { x: 545, y: 540, w: 190, h: 44 },
  },
  loseBtns: {
    retry: { x: 470, y: 470, w: 170, h: 52 },
    menu: { x: 670, y: 470, w: 170, h: 52 },
  },
};

export function makeSceneCanvases(scene) {
  const mk = (variant) => {
    const c = document.createElement("canvas");
    c.width = 600;
    c.height = 400;
    scene.draw(c.getContext("2d"), variant);
    return c;
  };
  return [mk(0), mk(1)];
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fmtTime(s) {
  const m = Math.floor(Math.max(0, s) / 60);
  const ss = Math.floor(Math.max(0, s) % 60);
  return m + ":" + String(ss).padStart(2, "0");
}

function drawHeader(ctx, g) {
  const L = LAYOUT;
  ctx.fillStyle = "#1d1730";
  ctx.fillRect(0, 0, L.W, L.headerH);
  ctx.fillStyle = "#ffd278";
  ctx.fillRect(0, L.headerH - 3, L.W, 3);

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffd278";
  ctx.font = "bold 30px system-ui, sans-serif";
  ctx.fillText("CARI PERBEDAAN", 24, 32);
  ctx.fillStyle = "#cbbd9d";
  ctx.font = "16px system-ui, sans-serif";
  ctx.fillText(g.scene.name + "  ·  " + g.scene.sub, 24, 66);

  // Counter ditemukan.
  ctx.textAlign = "center";
  ctx.fillStyle = "#f3ead8";
  ctx.font = "bold 26px system-ui, sans-serif";
  ctx.fillText("Ditemukan " + g.found.size + "/" + g.scene.diffs.length, 620, 34);
  ctx.fillStyle = "#8fd0ff";
  ctx.font = "15px system-ui, sans-serif";
  ctx.fillText("Skor " + g.score, 620, 66);

  // Timer.
  const low = g.timeLeft <= 30;
  ctx.fillStyle = low ? "#ff6b5e" : "#f3ead8";
  ctx.font = "bold 30px system-ui, sans-serif";
  ctx.fillText(fmtTime(g.timeLeft), 900, 34);
  ctx.fillStyle = "#cbbd9d";
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillText("sisa waktu", 900, 66);

  // Tombol hint.
  const b = L.hintBtn;
  rr(ctx, b.x, b.y, b.w, b.h, 10);
  ctx.fillStyle = g.hints > 0 ? "#2e6fb0" : "#4a4458";
  ctx.fill();
  ctx.strokeStyle = "#ffd278";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 17px system-ui, sans-serif";
  ctx.fillText("HINT (" + g.hints + ")  [H]", b.x + b.w / 2, b.y + b.h / 2 + 1);
}

function drawPanels(ctx, g, now) {
  const L = LAYOUT;
  const shake = now < g.shakeUntil ? Math.sin(now / 38) * 5 * ((g.shakeUntil - now) / 300) : 0;

  for (let p = 0; p < 2; p++) {
    const x = (p === 0 ? L.leftX : L.rightX) + shake;
    ctx.drawImage(g.canvases[p], x, L.panelY);
    ctx.strokeStyle = "#ffd278";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, L.panelY, L.panelW, L.panelH);
    // Label panel.
    ctx.fillStyle = "rgba(20,16,31,0.85)";
    ctx.fillRect(x + 8, L.panelY + 8, p === 0 ? 118 : 168, 28);
    ctx.fillStyle = "#ffd278";
    ctx.font = "bold 15px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(p === 0 ? "KIRI — ASLI" : "KANAN — BERBEDA", x + 16, L.panelY + 23);
  }

  // Marker emas pada perbedaan yang sudah ketemu (di kedua panel).
  for (const d of g.scene.diffs) {
    if (!g.found.has(d.id)) continue;
    const pulse = 3 * Math.sin(now / 220);
    for (const px of [L.leftX, L.rightX]) {
      ctx.beginPath();
      ctx.arc(px + d.x, L.panelY + d.y, d.r * 0.7 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffd23e";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(px + d.x, L.panelY + d.y, d.r * 0.7 + pulse + 6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,210,62,0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Sorotan hint (lingkaran biru berdenyut) pada satu perbedaan yang belum ketemu.
  if (g.hint && now < g.hint.until) {
    const d = g.hint.diff;
    const pulse = 6 * Math.sin(now / 160);
    for (const px of [L.leftX, L.rightX]) {
      ctx.beginPath();
      ctx.arc(px + d.x, L.panelY + d.y, d.r * 0.8 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = "#35d0ff";
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  }
}

function drawFooter(ctx, g) {
  const L = LAYOUT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Pesan status hanya saat bermain: di layar menang/kalah pesannya tertutup
  // tombol overlay, jadi jangan digambar dua kali.
  if (g.phase === "playing") {
    ctx.fillStyle = "#f3ead8";
    ctx.font = "bold 21px system-ui, sans-serif";
    ctx.fillText(g.message, L.W / 2, L.footerY + 26);
  }
  // Indikator suara di kanan footer, sejajar pesan status.
  ctx.textAlign = "right";
  ctx.fillStyle = "#cbbd9d";
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillText(g.muted ? "Suara: mati [M]" : "Suara: hidup [M]", 1256, L.footerY + 26);
  ctx.textAlign = "center";
  ctx.fillStyle = "#cbbd9d";
  ctx.font = "15px system-ui, sans-serif";
  ctx.fillText(
    "Klik perbedaan di gambar kiri atau kanan  •  H: Hint  •  R: Ulang level  •  1/2/3: Pilih level  •  M: Suara",
    L.W / 2,
    L.footerY + 62,
  );
  // Titik progres level.
  ctx.fillStyle = "#cbbd9d";
  ctx.font = "15px system-ui, sans-serif";
  ctx.fillText("Level 1  •  Level 2  •  Level 3", L.W / 2, L.footerY + 96);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(560 + i * 80, L.footerY + 122, 7, 0, Math.PI * 2);
    ctx.fillStyle = g.cleared.has(i) ? "#ffd23e" : "#4a4458";
    ctx.fill();
  }
  ctx.fillStyle = "#cbbd9d";
  ctx.font = "13px system-ui, sans-serif";
  ctx.fillText("Bintang emas = level selesai", L.W / 2, L.footerY + 150);
}

function drawMenu(ctx, g) {
  const L = LAYOUT;
  ctx.fillStyle = "#14101f";
  ctx.fillRect(0, 0, L.W, L.H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffd278";
  ctx.font = "bold 56px system-ui, sans-serif";
  ctx.fillText("CARI PERBEDAAN", L.W / 2, 110);
  ctx.fillStyle = "#f3ead8";
  ctx.font = "22px system-ui, sans-serif";
  ctx.fillText("Dua gambar nyaris sama — temukan semua perbedaannya sebelum waktu habis!", L.W / 2, 168);
  ctx.fillStyle = "#cbbd9d";
  ctx.font = "17px system-ui, sans-serif";
  ctx.fillText("Klik perbedaan di gambar kiri atau kanan. Klik salah: −5 detik. Hint (H): 3× per level.", L.W / 2, 204);
  ctx.fillText("Pilih level dengan klik kartu di bawah, atau tekan 1 / 2 / 3.", L.W / 2, 234);

  for (const c of L.menuCards) {
    const scene = g.scenes[c.level];
    rr(ctx, c.x, c.y, c.w, c.h, 14);
    ctx.fillStyle = "#241d3d";
    ctx.fill();
    ctx.strokeStyle = g.cleared.has(c.level) ? "#ffd23e" : "#6b5a8a";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#ffd278";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.fillText(scene.name, c.x + c.w / 2, c.y + 52);
    ctx.fillStyle = "#f3ead8";
    ctx.font = "17px system-ui, sans-serif";
    ctx.fillText(scene.sub, c.x + c.w / 2, c.y + 92);
    ctx.fillStyle = "#cbbd9d";
    ctx.font = "15px system-ui, sans-serif";
    ctx.fillText("Waktu " + fmtTime(scene.timeLimit), c.x + c.w / 2, c.y + 122);
    ctx.fillText(g.cleared.has(c.level) ? "★ SELESAI" : "Tekan " + (c.level + 1), c.x + c.w / 2, c.y + 152);
  }
  ctx.fillStyle = "#8a7ba8";
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillText("Semua gambar digambar prosedural di dalam game — tanpa aset luar, tanpa internet.", L.W / 2, 560);
}

function overlay(ctx, title, titleColor, lines, buttons) {
  const L = LAYOUT;
  ctx.fillStyle = "rgba(16,12,28,0.82)";
  ctx.fillRect(0, 0, L.W, L.H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = titleColor;
  ctx.font = "bold 52px system-ui, sans-serif";
  ctx.fillText(title, L.W / 2, 210);
  ctx.fillStyle = "#f3ead8";
  ctx.font = "22px system-ui, sans-serif";
  lines.forEach((s, i) => ctx.fillText(s, L.W / 2, 290 + i * 38));
  for (const b of buttons) {
    rr(ctx, b.rect.x, b.rect.y, b.rect.w, b.rect.h, 10);
    ctx.fillStyle = b.primary ? "#c98a1b" : "#3a3352";
    ctx.fill();
    ctx.strokeStyle = "#ffd278";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.fillText(b.label, b.rect.x + b.rect.w / 2, b.rect.y + b.rect.h / 2 + 1);
  }
}

export function drawFrame(ctx, g, now) {
  const L = LAYOUT;
  ctx.clearRect(0, 0, L.W, L.H);
  if (g.phase === "menu") {
    drawMenu(ctx, g);
    return;
  }
  drawHeader(ctx, g);
  drawPanels(ctx, g, now);
  drawFooter(ctx, g);
  if (g.phase === "won") {
    overlay(ctx, "LEVEL SELESAI!", "#ffd23e", [
      g.scene.name + " — semua " + g.scene.diffs.length + " perbedaan ketemu!",
      "Bonus waktu: +" + g.timeBonus + "   •   Skor level: " + g.levelScore,
      "Skor total: " + g.score,
    ], [
      { rect: L.winBtns.next, label: "Level berikut ▶", primary: true },
      { rect: L.winBtns.replay, label: "Ulang level (R)", primary: false },
      { rect: L.winBtns.menu, label: "Pilih level", primary: false },
    ]);
  } else if (g.phase === "lost") {
    overlay(ctx, "WAKTU HABIS", "#ff6b5e", [
      g.scene.name + " — ketemu " + g.found.size + " dari " + g.scene.diffs.length + " perbedaan.",
      "Coba lagi — perbedaan yang sudah ketemu tetap tersimpan di percobaan ini.",
      "Skor total: " + g.score,
    ], [
      { rect: L.loseBtns.retry, label: "Coba lagi (R)", primary: true },
      { rect: L.loseBtns.menu, label: "Pilih level", primary: false },
    ]);
  }
}
