// scenes.js — definisi 3 scene "Pasar Senja" + gambar prosedural tiap scene.
// Setiap scene digambar dua kali: variant 0 = panel kiri (asli), variant 1 =
// panel kanan (berbeda). Perbedaan dicatat di `diffs` dengan koordinat scene
// 600x400 yang sama untuk kedua panel. Semua posisi tetap (deterministik).

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function star4(ctx, x, y, r, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.quadraticCurveTo(0, 0, 0, r);
  ctx.quadraticCurveTo(0, 0, -r, 0);
  ctx.quadraticCurveTo(0, 0, 0, -r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function text(ctx, s, x, y, font, fill, align) {
  ctx.font = font;
  ctx.fillStyle = fill;
  ctx.textAlign = align || "left";
  ctx.textBaseline = "middle";
  ctx.fillText(s, x, y);
}

// ---------------------------------------------------------------------------
// LEVEL 1 — Pasar Senja (mudah, 7 perbedaan, 180 detik)
// ---------------------------------------------------------------------------
function drawMarket(ctx, v) {
  // Langit senja.
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, "#2d1b4e");
  sky.addColorStop(0.45, "#b34a7a");
  sky.addColorStop(0.8, "#ff9a56");
  sky.addColorStop(1, "#ffc46b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 400);

  // Bintang-bintang (tetap).
  const stars = [[40, 30], [150, 55], [240, 28], [330, 48], [420, 30], [540, 38], [200, 80], [300, 70]];
  for (const [x, y] of stars) star4(ctx, x, y, 4, "rgba(255,244,200,0.9)");
  // Perbedaan 6: satu bintang tambahan di varian kanan.
  if (v === 1) star4(ctx, 90, 45, 5, "rgba(255,244,200,0.95)");

  // Bulan. Perbedaan 5: varian kanan lebih besar dan lebih pucat.
  if (v === 0) {
    circle(ctx, 480, 70, 26, "#ffd76e");
    circle(ctx, 472, 64, 6, "#e8b64a");
    circle(ctx, 488, 78, 4, "#e8b64a");
  } else {
    circle(ctx, 480, 70, 36, "#ffeec2");
    circle(ctx, 468, 60, 7, "#f2dd9e");
    circle(ctx, 492, 80, 5, "#f2dd9e");
  }

  // Lampu gantung: dua tali melengkung dengan bohlam.
  ctx.strokeStyle = "#3a2a1c";
  ctx.lineWidth = 2;
  for (const [x0, y0, x1, y1] of [[20, 95, 300, 120], [300, 120, 580, 95]]) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + 26, x1, y1);
    ctx.stroke();
  }
  const bulbs = [[70, 108], [170, 122], [270, 124], [370, 124], [470, 122], [540, 104]];
  bulbs.forEach(([x, y], i) => {
    // Perbedaan 1: bohlam di (120,105) hilang di varian kanan.
    if (v === 1 && i === 0) return;
    circle(ctx, x, y + 8, 7, ["#ffdf6b", "#ff9d5c", "#ffd76e"][i % 3]);
    ctx.strokeStyle = "#3a2a1c";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 3);
    ctx.stroke();
  });
  // Bohlam perbedaan 1 (posisi tetap di kiri).
  if (v === 0) circle(ctx, 120, 116, 7, "#ffdf6b");

  // Tanah / jalan batu.
  rect(ctx, 0, 300, 600, 100, "#6b4a3a");
  ctx.fillStyle = "#7d5a48";
  for (let x = 0; x < 600; x += 46) {
    ctx.beginPath();
    ctx.ellipse(x + 22, 330, 20, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 40, 368, 20, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tiga kios: merah (kiri), hijau (tengah), biru (kanan).
  // Perbedaan 2: atap kios merah menjadi hijau di varian kanan.
  const stalls = [
    { x: 50, roof: v === 1 ? "#3f9e57" : "#c0392b", awn: "#e8dcc0" },
    { x: 235, roof: "#3f9e57", awn: "#f2e6c8" },
    { x: 420, roof: "#2e6fb0", awn: "#e8dcc0" },
  ];
  for (const s of stalls) {
    rect(ctx, s.x, 210, 130, 90, "#8a5a3b"); // badan kios
    poly(ctx, [[s.x - 8, 212], [s.x + 65, 168], [s.x + 138, 212]], s.roof); // atap
    rect(ctx, s.x + 6, 214, 118, 16, s.awn); // awning
    ctx.strokeStyle = "#5e3d26";
    ctx.lineWidth = 2;
    ctx.strokeRect(s.x + 6, 214, 118, 16);
    rect(ctx, s.x + 10, 246, 110, 10, "#5e3d26"); // meja
  }
  // Papan nama di kios tengah.
  rect(ctx, 268, 178, 64, 24, "#f7ead0");
  ctx.strokeStyle = "#5e3d26";
  ctx.lineWidth = 2;
  ctx.strokeRect(268, 178, 64, 24);
  text(ctx, "BUAH", 300, 191, "bold 15px system-ui, sans-serif", "#7a3b1e", "center");
  // Bendera di tiang kios biru. Perbedaan 7: merah -> kuning.
  ctx.strokeStyle = "#3a2a1c";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(500, 168);
  ctx.lineTo(500, 132);
  ctx.stroke();
  poly(ctx, [[500, 132], [532, 140], [500, 150]], v === 0 ? "#e23b3b" : "#f2c230");

  // Penjual di balik kios tengah.
  circle(ctx, 300, 236, 14, "#f0c08a"); // kepala
  poly(ctx, [[282, 262], [318, 262], [312, 236], [288, 236]], "#7a4a8a"); // badan
  rect(ctx, 288, 228, 24, 6, "#3a2a1c"); // topi

  // Keranjang buah.
  // Perbedaan 3: keranjang jeruk hilang di varian kanan.
  if (v === 0) {
    ellipse(ctx, 150, 336, 34, 14, "#a06a2c");
    for (const [x, y] of [[136, 326], [150, 320], [164, 326], [143, 332], [157, 332]]) circle(ctx, x, y, 7, "#ff8c1a");
  }
  // Keranjang apel (selalu ada).
  ellipse(ctx, 350, 336, 34, 14, "#a06a2c");
  for (const [x, y] of [[336, 326], [350, 320], [364, 326], [343, 332], [357, 332]]) circle(ctx, x, y, 7, "#d63030");

  // Kucing di atas peti. Perbedaan 4: hilang di varian kanan.
  rect(ctx, 496, 318, 52, 26, "#9a6b3f");
  ctx.strokeStyle = "#6e4a28";
  ctx.lineWidth = 2;
  ctx.strokeRect(496, 318, 52, 26);
  if (v === 0) {
    ellipse(ctx, 522, 306, 20, 11, "#3d3d3d");
    circle(ctx, 540, 300, 9, "#3d3d3d");
    poly(ctx, [[534, 293], [537, 284], [541, 292]], "#3d3d3d");
    poly(ctx, [[543, 292], [547, 284], [549, 293]], "#3d3d3d");
    ctx.strokeStyle = "#3d3d3d";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(504, 308);
    ctx.quadraticCurveTo(496, 298, 502, 292);
    ctx.stroke();
  }

  // Lampion kertas di kanan.
  circle(ctx, 566, 250, 14, "#ff5a4e");
  ctx.strokeStyle = "#c22f2f";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(566, 236);
  ctx.lineTo(566, 264);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// LEVEL 2 — Pelabuhan Pagi (sedang, 10 perbedaan, 150 detik)
// ---------------------------------------------------------------------------
function drawHarbor(ctx, v) {
  // Langit pagi.
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, "#8ec9ee");
  sky.addColorStop(0.55, "#cfeefb");
  sky.addColorStop(1, "#fde9b8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 400);

  // Matahari.
  circle(ctx, 90, 60, 30, "#ffdf5e");
  circle(ctx, 90, 60, 42, "rgba(255,223,94,0.35)");

  // Awan. Perbedaan 7: awan di (380,50) hilang di varian kanan.
  const clouds = [[240, 60], [470, 45]];
  if (v === 0) clouds.push([380, 50]);
  for (const [x, y] of clouds) {
    ellipse(ctx, x, y, 34, 14, "rgba(255,255,255,0.95)");
    ellipse(ctx, x + 22, y + 4, 26, 11, "rgba(255,255,255,0.95)");
    ellipse(ctx, x - 22, y + 4, 24, 10, "rgba(255,255,255,0.95)");
  }

  // Burung camar. Perbedaan 1: camar di (200,80) hilang di varian kanan.
  const gulls = [[140, 110], [300, 90]];
  if (v === 0) gulls.push([200, 80]);
  ctx.strokeStyle = "#3a4a5a";
  ctx.lineWidth = 2.5;
  for (const [x, y] of gulls) {
    ctx.beginPath();
    ctx.moveTo(x - 9, y);
    ctx.quadraticCurveTo(x - 3, y - 7, x, y);
    ctx.quadraticCurveTo(x + 3, y - 7, x + 9, y);
    ctx.stroke();
  }

  // Laut.
  rect(ctx, 0, 210, 600, 190, "#2f7fb8");
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = 0; i < 6; i++) {
    const y = 240 + i * 24;
    for (let x = (i % 2) * 40; x < 600; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 14, y - 6, x + 28, y);
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Perahu layar. Perbedaan 3: layar putih -> merah.
  // Perbedaan 10: angka lambung 7 -> 9.
  poly(ctx, [[118, 252], [196, 252], [196, 268], [118, 268]], "#7a4a26");
  ctx.strokeStyle = "#5e3418";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(158, 252);
  ctx.lineTo(158, 168);
  ctx.stroke();
  poly(ctx, [[162, 172], [162, 248], [206, 248]], v === 0 ? "#ffffff" : "#e23b3b");
  text(ctx, v === 0 ? "7" : "9", 158, 260, "bold 13px system-ui, sans-serif", "#ffe9b0", "center");

  // Perahu dayung.
  ellipse(ctx, 350, 292, 44, 12, "#8a5a2e");
  rect(ctx, 344, 272, 4, 18, "#5e3418");
  rect(ctx, 352, 272, 4, 18, "#5e3418");

  // Ikan melompat tambahan. Perbedaan 6: hanya di varian kanan.
  if (v === 1) {
    ellipse(ctx, 300, 240, 12, 5, "#c8d8e8");
    poly(ctx, [[310, 240], [318, 234], [318, 246]], "#c8d8e8");
  }
  // Ikan kecil yang selalu ada.
  ellipse(ctx, 260, 262, 9, 4, "#dce8f2");
  poly(ctx, [[268, 262], [274, 258], [274, 266]], "#dce8f2");

  // Mercusuar. Perbedaan 4: jendela menyala (kiri) / padam (kanan).
  // Perbedaan 9: bendera mengarah kanan (kiri) / kiri (kanan).
  rect(ctx, 508, 96, 34, 124, "#f2ede0");
  ctx.strokeStyle = "#c0392b";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(508, 140);
  ctx.lineTo(542, 140);
  ctx.moveTo(508, 178);
  ctx.lineTo(542, 178);
  ctx.stroke();
  rect(ctx, 500, 78, 50, 20, "#3a4a5a");
  circle(ctx, 525, 88, 7, v === 0 ? "#ffe66b" : "#4a5a6a");
  if (v === 0) {
    circle(ctx, 525, 88, 14, "rgba(255,230,107,0.35)");
    poly(ctx, [[525, 88], [580, 70], [580, 106]], "rgba(255,230,107,0.18)");
  }
  ctx.strokeStyle = "#3a2a1c";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(525, 78);
  ctx.lineTo(525, 56);
  ctx.stroke();
  if (v === 0) poly(ctx, [[525, 56], [551, 62], [525, 69]], "#e23b3b");
  else poly(ctx, [[525, 56], [499, 62], [525, 69]], "#e23b3b");

  // Dermaga kayu.
  rect(ctx, 0, 300, 210, 100, "#8a6a42");
  ctx.strokeStyle = "#6e4a28";
  ctx.lineWidth = 2;
  for (let y = 316; y < 400; y += 22) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(210, y);
    ctx.stroke();
  }
  // Peti. Perbedaan 5: peti di (90,360) hilang di varian kanan.
  if (v === 0) {
    rect(ctx, 66, 344, 48, 34, "#a06a2c");
    ctx.strokeStyle = "#6e4a28";
    ctx.lineWidth = 2;
    ctx.strokeRect(66, 344, 48, 34);
    ctx.beginPath();
    ctx.moveTo(66, 344);
    ctx.lineTo(114, 378);
    ctx.moveTo(114, 344);
    ctx.lineTo(66, 378);
    ctx.stroke();
  }
  rect(ctx, 140, 352, 40, 28, "#b07a34");
  ctx.strokeStyle = "#6e4a28";
  ctx.lineWidth = 2;
  ctx.strokeRect(140, 352, 40, 28);

  // Tali di dermaga. Perbedaan 8: melingkar (kiri) / lurus (kanan).
  ctx.strokeStyle = "#d8c49a";
  ctx.lineWidth = 3;
  if (v === 0) {
    for (const r of [6, 11, 16]) {
      ctx.beginPath();
      ctx.arc(100, 340, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(70, 352);
    ctx.lineTo(140, 330);
    ctx.stroke();
  }

  // Nelayan di dermaga.
  circle(ctx, 180, 296, 10, "#f0c08a");
  poly(ctx, [[168, 316], [192, 316], [188, 300], [172, 300]], "#2e6fb0");
  rect(ctx, 170, 288, 20, 5, "#e8c33a");
  ctx.strokeStyle = "#5e3418";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(192, 306);
  ctx.lineTo(214, 330);
  ctx.stroke();

  // Pelampung. Perbedaan 2: merah (kiri) / kuning (kanan).
  circle(ctx, 430, 320, 14, v === 0 ? "#e23b3b" : "#f2c230");
  circle(ctx, 430, 320, 6, "#ffffff");
  ctx.strokeStyle = "#7a1e1e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(430, 320, 14, 0, Math.PI * 2);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// LEVEL 3 — Hutan Kunang-kunang (sulit, 12 perbedaan, 120 detik)
// ---------------------------------------------------------------------------
function drawForest(ctx, v) {
  // Langit malam hutan.
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, "#0a1a2e");
  sky.addColorStop(0.6, "#122e26");
  sky.addColorStop(1, "#0d241c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 400);

  // Bintang. Perbedaan 6: satu bintang tambahan di varian kanan.
  const stars = [[60, 36], [160, 28], [260, 44], [340, 30], [540, 46], [210, 66]];
  for (const [x, y] of stars) star4(ctx, x, y, 3.5, "rgba(255,244,200,0.85)");
  if (v === 1) star4(ctx, 100, 40, 4.5, "rgba(255,244,200,0.95)");

  // Bulan di sela kanopi. Perbedaan 12: purnama (kiri) / sabit (kanan).
  if (v === 0) {
    circle(ctx, 480, 60, 28, "#f2ead0");
    circle(ctx, 470, 52, 6, "#d8cba6");
    circle(ctx, 490, 68, 4, "#d8cba6");
  } else {
    ctx.beginPath();
    ctx.arc(480, 60, 28, 0, Math.PI * 2);
    ctx.fillStyle = "#f2ead0";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(492, 54, 24, 0, Math.PI * 2);
    ctx.fillStyle = "#0a1a2e";
    ctx.fill();
  }

  // Kanopi pepohonan.
  for (const [x, y, r] of [[80, 60, 90], [200, 40, 100], [330, 55, 95], [460, 45, 90], [560, 70, 80]]) {
    circle(ctx, x, y, r, "#0f3524");
    circle(ctx, x - 40, y + 24, r * 0.7, "#123d2a");
    circle(ctx, x + 40, y + 24, r * 0.7, "#123d2a");
  }
  // Dahan. Perbedaan 9: dahan di (250,100) hilang di varian kanan.
  ctx.strokeStyle = "#3a2a1c";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(180, 130);
  ctx.lineTo(320, 110);
  ctx.stroke();
  if (v === 0) {
    ctx.beginPath();
    ctx.moveTo(250, 118);
    ctx.lineTo(250, 92);
    ctx.stroke();
  }

  // Batang pohon.
  rect(ctx, 36, 150, 26, 250, "#2e2018");
  rect(ctx, 300, 140, 30, 260, "#2e2018");
  rect(ctx, 540, 160, 24, 240, "#2e2018");

  // Tanah hutan.
  rect(ctx, 0, 330, 600, 70, "#16281c");
  ellipse(ctx, 120, 372, 60, 12, "#1d3524");
  ellipse(ctx, 420, 378, 70, 12, "#1d3524");

  // Aliran sungai. Perbedaan 8: riak 2 busur (kiri) / 3 busur (kanan).
  poly(ctx, [[180, 400], [220, 340], [300, 340], [340, 400]], "#1e5a7a");
  ctx.strokeStyle = "rgba(220,240,255,0.7)";
  ctx.lineWidth = 2;
  const ripples = v === 0 ? [[250, 362], [268, 380]] : [[244, 358], [262, 374], [280, 388]];
  for (const [x, y] of ripples) {
    ctx.beginPath();
    ctx.moveTo(x - 12, y);
    ctx.quadraticCurveTo(x, y - 5, x + 12, y);
    ctx.stroke();
  }

  // Batu. Perbedaan 4: batu di (300,360) hilang di varian kanan.
  if (v === 0) ellipse(ctx, 300, 360, 22, 12, "#5a6a72");
  ellipse(ctx, 90, 366, 18, 10, "#4a5a62");
  ellipse(ctx, 480, 368, 20, 11, "#4a5a62");

  // Jamur. Perbedaan 2: merah (kiri) / biru (kanan).
  // Perbedaan 7: satu jamur tambahan di varian kanan.
  const mushColor = v === 0 ? "#d63030" : "#3a6fd8";
  for (const [x, y, s] of [[112, 330, 1], [132, 336, 0.8]]) {
    rect(ctx, x - 3 * s, y, 6 * s, 12 * s, "#f2ead0");
    ctx.beginPath();
    ctx.arc(x, y, 12 * s, Math.PI, 0);
    ctx.fillStyle = mushColor;
    ctx.fill();
    circle(ctx, x - 5 * s, y - 5 * s, 2, "#ffffff");
    circle(ctx, x + 4 * s, y - 7 * s, 2, "#ffffff");
  }
  if (v === 1) {
    rect(ctx, 177, 345, 5, 10, "#f2ead0");
    ctx.beginPath();
    ctx.arc(180, 345, 10, Math.PI, 0);
    ctx.fillStyle = "#3a6fd8";
    ctx.fill();
  }

  // Bunga. Perbedaan 10: merah muda (kiri) / ungu (kanan).
  for (const [x, y] of [[200, 350], [212, 356]]) {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      circle(ctx, x + Math.cos(a) * 5, y + Math.sin(a) * 5, 3.5, v === 0 ? "#ff7fb0" : "#b06be8");
    }
    circle(ctx, x, y, 3, "#ffe66b");
  }

  // Pakis. Perbedaan 5: 5 helai (kiri) / 3 helai (kanan).
  ctx.strokeStyle = "#2f7a4a";
  ctx.lineWidth = 3;
  const fronds = v === 0 ? 5 : 3;
  for (let i = 0; i < fronds; i++) {
    const x0 = 500 + i * 10;
    ctx.beginPath();
    ctx.moveTo(x0, 360);
    ctx.quadraticCurveTo(x0 + 6, 330, x0 + (i - 2) * 8, 312);
    ctx.stroke();
  }

  // Burung hantu di dahan. Perbedaan 1: mata terbuka (kiri) / tertutup (kanan).
  ellipse(ctx, 450, 152, 20, 26, "#6b4a2e");
  poly(ctx, [[432, 132], [438, 118], [444, 130]], "#6b4a2e");
  poly(ctx, [[456, 130], [462, 118], [468, 132]], "#6b4a2e");
  if (v === 0) {
    circle(ctx, 443, 146, 6, "#ffffff");
    circle(ctx, 457, 146, 6, "#ffffff");
    circle(ctx, 443, 146, 3, "#1a1a1a");
    circle(ctx, 457, 146, 3, "#1a1a1a");
  } else {
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(438, 146);
    ctx.lineTo(448, 146);
    ctx.moveTo(452, 146);
    ctx.lineTo(462, 146);
    ctx.stroke();
  }
  poly(ctx, [[448, 158], [452, 158], [450, 163]], "#e8a33a");

  // Kunang-kunang (posisi tetap).
  const flies = [[80, 200], [160, 160], [220, 220], [280, 170], [330, 240], [390, 150], [500, 240], [540, 190], [120, 260], [470, 300]];
  for (const [x, y] of flies) {
    circle(ctx, x, y, 7, "rgba(190,255,120,0.25)");
    circle(ctx, x, y, 3, "#c8ff6b");
  }
  // Perbedaan 3: kunang-kunang di (350,180) hilang di varian kanan.
  if (v === 0) {
    circle(ctx, 350, 180, 7, "rgba(190,255,120,0.25)");
    circle(ctx, 350, 180, 3, "#c8ff6b");
  }
  // Perbedaan 11: kunang-kunang pindah — (420,220) kiri, (460,200) kanan.
  const fx = v === 0 ? 420 : 460;
  const fy = v === 0 ? 220 : 200;
  circle(ctx, fx, fy, 7, "rgba(190,255,120,0.25)");
  circle(ctx, fx, fy, 3, "#c8ff6b");
}

export const SCENES = [
  {
    id: "pasar",
    name: "Pasar Senja",
    sub: "Mudah — 7 perbedaan",
    timeLimit: 180,
    draw: drawMarket,
    diffs: [
      { id: "lampion", x: 120, y: 112, r: 30, label: "Lampion hilang" },
      { id: "atap", x: 140, y: 168, r: 32, label: "Warna atap kios" },
      { id: "jeruk", x: 150, y: 332, r: 30, label: "Keranjang jeruk" },
      { id: "kucing", x: 522, y: 302, r: 28, label: "Kucing di peti" },
      { id: "bulan", x: 480, y: 70, r: 32, label: "Ukuran bulan" },
      { id: "bintang", x: 90, y: 45, r: 20, label: "Bintang tambahan" },
      { id: "bendera", x: 512, y: 141, r: 26, label: "Warna bendera" },
    ],
  },
  {
    id: "pelabuhan",
    name: "Pelabuhan Pagi",
    sub: "Sedang — 10 perbedaan",
    timeLimit: 150,
    draw: drawHarbor,
    diffs: [
      { id: "camar", x: 200, y: 80, r: 24, label: "Camar hilang" },
      { id: "pelampung", x: 430, y: 320, r: 26, label: "Warna pelampung" },
      { id: "layar", x: 180, y: 210, r: 30, label: "Warna layar" },
      { id: "mercusuar", x: 525, y: 88, r: 24, label: "Lampu mercusuar" },
      { id: "peti", x: 90, y: 361, r: 28, label: "Peti hilang" },
      { id: "ikan", x: 300, y: 240, r: 26, label: "Ikan melompat" },
      { id: "awan", x: 380, y: 50, r: 28, label: "Awan hilang" },
      { id: "tali", x: 100, y: 340, r: 26, label: "Tali di dermaga" },
      { id: "bendera", x: 525, y: 62, r: 22, label: "Arah bendera" },
      { id: "angka", x: 158, y: 260, r: 22, label: "Angka lambung" },
    ],
  },
  {
    id: "hutan",
    name: "Hutan Kunang-kunang",
    sub: "Sulit — 12 perbedaan",
    timeLimit: 120,
    draw: drawForest,
    diffs: [
      { id: "mata", x: 450, y: 150, r: 26, label: "Mata burung hantu" },
      { id: "jamur", x: 122, y: 330, r: 26, label: "Warna jamur" },
      { id: "kunang1", x: 350, y: 180, r: 20, label: "Kunang-kunang hilang" },
      { id: "batu", x: 300, y: 360, r: 26, label: "Batu hilang" },
      { id: "pakis", x: 520, y: 330, r: 28, label: "Helai pakis" },
      { id: "bintang", x: 100, y: 40, r: 18, label: "Bintang tambahan" },
      { id: "jamur2", x: 180, y: 345, r: 22, label: "Jamur tambahan" },
      { id: "riak", x: 262, y: 374, r: 28, label: "Riak sungai" },
      { id: "dahan", x: 250, y: 100, r: 26, label: "Dahan hilang" },
      { id: "bunga", x: 206, y: 353, r: 22, label: "Warna bunga" },
      { id: "kunang2", x: 440, y: 210, r: 22, label: "Kunang-kunang pindah" },
      { id: "bulan", x: 480, y: 60, r: 28, label: "Fase bulan" },
    ],
  },
];
