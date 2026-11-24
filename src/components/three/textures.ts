import * as THREE from 'three';

/** All food and surface textures are drawn procedurally at runtime: no image downloads. */

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
}

function toTexture(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function rng(seed = 1) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export async function loadFont(spec: string, text: string, timeout = 2500) {
  if (!('fonts' in document)) return;
  await Promise.race([document.fonts.load(spec, text).catch(() => undefined), new Promise((r) => setTimeout(r, timeout))]);
}

/** Vertical Japanese glyph column for a noren panel (alpha only). */
export function makeGlyphTexture(text: string) {
  const [c, g] = canvas(256, 1024);
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '700 196px "Noto Sans JP", "Hiragino Sans", sans-serif';
  const chars = [...text];
  const step = 226;
  const start = 512 - ((chars.length - 1) * step) / 2;
  chars.forEach((ch, i) => {
    g.save();
    g.translate(128, start + i * step);
    if (ch === 'ー') g.rotate(Math.PI / 2);
    g.fillText(ch, 0, 0);
    g.restore();
  });
  return toTexture(c);
}

export function makeWoodTexture() {
  const [c, g] = canvas(1024, 1024);
  const r = rng(7);
  g.fillStyle = '#211812';
  g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 220; i++) {
    const y = r() * 1024;
    const amp = 4 + r() * 14;
    const light = r() > 0.5;
    g.strokeStyle = light ? `rgba(120,86,60,${0.05 + r() * 0.12})` : `rgba(0,0,0,${0.08 + r() * 0.2})`;
    g.lineWidth = 0.6 + r() * 2.4;
    g.beginPath();
    for (let x = 0; x <= 1024; x += 16) {
      const yy = y + Math.sin(x * 0.006 + i) * amp + Math.sin(x * 0.02 + i * 3) * 1.5;
      x === 0 ? g.moveTo(x, yy) : g.lineTo(x, yy);
    }
    g.stroke();
  }
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}

/** Rolled chashu: browned rim, pink meat, spiral of rendered fat. */
export function makeChashuTexture(seed = 1) {
  const [c, g] = canvas(512, 512);
  const r = rng(seed * 31);
  const grad = g.createRadialGradient(256, 256, 10, 256, 256, 256);
  grad.addColorStop(0, '#e7b29b');
  grad.addColorStop(0.55, '#d4917a');
  grad.addColorStop(0.86, '#a85b3b');
  grad.addColorStop(1, '#5e2a14');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  g.save();
  g.translate(256, 256);
  g.rotate(r() * Math.PI * 2);
  g.strokeStyle = 'rgba(252,238,218,0.78)';
  g.lineCap = 'round';
  g.filter = 'blur(3px)';
  g.beginPath();
  for (let t = 0; t < Math.PI * 6.2; t += 0.05) {
    const rr = 16 + t * 11.5 + Math.sin(t * 3) * 4;
    const x = Math.cos(t) * rr, y = Math.sin(t) * rr * 0.92;
    t === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
  }
  g.lineWidth = 15;
  g.stroke();
  g.restore();
  g.filter = 'none';
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(${r() > 0.5 ? '255,230,210' : '120,50,30'},${r() * 0.12})`;
    g.fillRect(r() * 512, r() * 512, 2, 2);
  }
  g.strokeStyle = 'rgba(70,30,12,0.9)';
  g.lineWidth = 22;
  g.beginPath();
  g.arc(256, 256, 244, 0, Math.PI * 2);
  g.stroke();
  return toTexture(c);
}

/** Cut face of a halved ajitama: soy-tinted white, jammy amber yolk. */
export function makeYolkTexture() {
  const [c, g] = canvas(512, 512);
  g.fillStyle = '#f6efe2';
  g.fillRect(0, 0, 512, 512);
  const rim = g.createRadialGradient(256, 256, 200, 256, 256, 256);
  rim.addColorStop(0, 'rgba(180,120,60,0)');
  rim.addColorStop(1, 'rgba(176,112,52,0.85)');
  g.fillStyle = rim;
  g.fillRect(0, 0, 512, 512);
  const y = g.createRadialGradient(262, 250, 8, 256, 256, 150);
  y.addColorStop(0, '#d96a05');
  y.addColorStop(0.45, '#ec8d16');
  y.addColorStop(0.85, '#f5b543');
  y.addColorStop(1, 'rgba(246,200,100,0)');
  g.fillStyle = y;
  g.beginPath();
  g.ellipse(256, 256, 150, 140, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.35)';
  g.beginPath();
  g.ellipse(225, 220, 36, 18, -0.5, 0, Math.PI * 2);
  g.fill();
  return toTexture(c);
}

export function makeNoriTexture() {
  const [c, g] = canvas(256, 256);
  const r = rng(3);
  g.fillStyle = '#0f1a13';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = r() > 0.5 ? `rgba(40,70,48,${r() * 0.5})` : `rgba(0,0,0,${r() * 0.5})`;
    g.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1 + r() * 2);
  }
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function drawRice(g: CanvasRenderingContext2D, w: number, h: number, count: number, seed: number) {
  const r = rng(seed);
  g.fillStyle = '#ebe6dc';
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < count; i++) {
    const x = r() * w, y = r() * h, rot = r() * Math.PI;
    const shade = 236 + Math.floor(r() * 19);
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    g.fillStyle = `rgba(150,140,125,0.35)`;
    g.beginPath();
    g.ellipse(1, 1.2, 9, 4.6, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = `rgb(${shade},${shade - 2},${shade - 8})`;
    g.beginPath();
    g.ellipse(0, 0, 8.5, 4.2, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
}

export function makeRiceTexture() {
  const [c, g] = canvas(512, 512);
  drawRice(g, 512, 512, 2200, 11);
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Maki cross-section: nori ring, rice, salmon and cucumber centre. */
export function makeMakiFaceTexture() {
  const [c, g] = canvas(512, 512);
  g.fillStyle = '#0f1a13';
  g.fillRect(0, 0, 512, 512);
  g.save();
  g.beginPath();
  g.arc(256, 256, 236, 0, Math.PI * 2);
  g.clip();
  drawRice(g, 512, 512, 1500, 5);
  g.restore();
  g.fillStyle = '#f07a4a';
  g.beginPath();
  g.ellipse(232, 262, 70, 54, 0.4, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = 'rgba(255,196,160,0.85)';
  g.lineWidth = 5;
  for (let i = -3; i <= 3; i++) {
    g.beginPath();
    g.moveTo(190 + i * 16, 220);
    g.quadraticCurveTo(212 + i * 16, 262, 196 + i * 16, 306);
    g.stroke();
  }
  g.fillStyle = '#4d8a35';
  g.beginPath();
  g.ellipse(316, 226, 34, 30, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#b9d98f';
  g.beginPath();
  g.ellipse(316, 226, 18, 15, 0, 0, Math.PI * 2);
  g.fill();
  return toTexture(c);
}

export function makeSlateTexture() {
  const [c, g] = canvas(512, 512);
  const r = rng(19);
  g.fillStyle = '#2b2d2f';
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) {
    g.strokeStyle = `rgba(${r() > 0.5 ? '90,94,98' : '10,10,12'},${r() * 0.25})`;
    g.lineWidth = r() * 2;
    g.beginPath();
    const y = r() * 512;
    g.moveTo(0, y);
    g.bezierCurveTo(170, y + r() * 20 - 10, 340, y + r() * 20 - 10, 512, y + r() * 16 - 8);
    g.stroke();
  }
  return toTexture(c);
}

/** Baked broth swirl for the low-power tier. */
export function makeBakedBrothTexture() {
  const [c, g] = canvas(512, 512);
  const r = rng(23);
  const grad = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  grad.addColorStop(0, '#f6ead3');
  grad.addColorStop(0.75, '#efdcbc');
  grad.addColorStop(1, '#c9a676');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  g.filter = 'blur(6px)';
  for (let i = 0; i < 26; i++) {
    g.strokeStyle = `rgba(${r() > 0.5 ? '255,250,238' : '214,186,140'},0.45)`;
    g.lineWidth = 6 + r() * 14;
    g.beginPath();
    const r0 = 30 + r() * 200, a0 = r() * Math.PI * 2;
    g.arc(256, 256, r0, a0, a0 + 0.8 + r() * 1.6);
    g.stroke();
  }
  g.filter = 'none';
  for (let i = 0; i < 140; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 220, s = 2 + r() * 7;
    g.fillStyle = 'rgba(255,214,130,0.45)';
    g.beginPath();
    g.arc(256 + Math.cos(a) * d, 256 + Math.sin(a) * d, s, 0, Math.PI * 2);
    g.fill();
  }
  return toTexture(c);
}

/** Points sampled from rendered text, centred, width normalised to 1. Used to form the steam wordmark. */
export function sampleTextPoints(text: string, count: number, font = '800 150px Archivo, "Space Grotesk", sans-serif') {
  const W = 1400, H = 240;
  const [, g] = canvas(W, H);
  g.font = font;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#fff';
  (g as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '4px';
  g.fillText(text, W / 2, H / 2 + 6);
  const data = g.getImageData(0, 0, W, H).data;
  const pts: number[] = [];
  let minX = W, maxX = 0;
  for (let y = 0; y < H; y += 2)
    for (let x = 0; x < W; x += 2)
      if (data[(y * W + x) * 4 + 3] > 140) {
        pts.push(x, y);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
  const width = Math.max(1, maxX - minX);
  const cx = (minX + maxX) / 2;
  const out = new Float32Array(count * 3);
  const r = rng(99);
  const n = pts.length / 2;
  for (let i = 0; i < count; i++) {
    const k = n ? Math.floor(r() * n) : 0;
    out[i * 3] = n ? (pts[k * 2] - cx) / width : 0;
    out[i * 3 + 1] = n ? -(pts[k * 2 + 1] - H / 2) / width : 0;
    out[i * 3 + 2] = (r() - 0.5) * 0.006;
  }
  return out;
}
