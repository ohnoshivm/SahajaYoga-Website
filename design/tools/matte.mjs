import sharp from "sharp";
const [src, out, preview, th] = process.argv.slice(2); const TH = Number(th ?? 9);
const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, N = W * H;
const px = (i) => [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

// 1. fit a quadratic background model per channel from border-strip pixels that are not letters
const samples = [];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const edge = x < 30 || x > W - 30 || y > H - 22 || (y < 40);
  if (!edge) continue;
  const c = px(y * W + x); if (lum(c) < 140) continue; // skip letters
  samples.push([x / W, y / H, c]);
}
// least squares on basis [1,x,y,x2,y2,xy]
const basis = (x, y) => [1, x, y, x * x, y * y, x * y];
function solve(A, b) { const n = A.length; for (let i = 0; i < n; i++) { let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r; [A[i], A[p]] = [A[p], A[i]]; [b[i], b[p]] = [b[p], b[i]]; for (let r = i + 1; r < n; r++) { const f = A[r][i] / A[i][i]; for (let c = i; c < n; c++) A[r][c] -= f * A[i][c]; b[r] -= f * b[i]; } } const x = Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c]; x[i] = s / A[i][i]; } return x; }
const coef = [0, 1, 2].map((ch) => { const A = Array.from({ length: 6 }, () => Array(6).fill(0)), b = Array(6).fill(0); for (const [x, y, c] of samples) { const f = basis(x, y); for (let i = 0; i < 6; i++) { b[i] += f[i] * c[ch]; for (let j = 0; j < 6; j++) A[i][j] += f[i] * f[j]; } } return solve(A, b); });
const bgAt = (x, y) => coef.map((k) => basis(x / W, y / H).reduce((s, f, i) => s + f * k[i], 0));

// 2. background-likeness: close to bg model, or dark letter ink
const dist = new Float32Array(N), passable = new Uint8Array(N);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x, c = px(i), b = bgAt(x, y);
  const d = Math.hypot(c[0] - b[0], c[1] - b[1], c[2] - b[2]); dist[i] = d;
  // letter ink and its anti-aliased edge: colour lies on the segment between ink and the local bg
  const k = [62, 53, 49]; const v = [b[0] - k[0], b[1] - k[1], b[2] - k[2]], w = [c[0] - k[0], c[1] - k[1], c[2] - k[2]];
  const t = (v[0] * w[0] + v[1] * w[1] + v[2] * w[2]) / (v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
  const res = Math.hypot(w[0] - t * v[0], w[1] - t * v[1], w[2] - t * v[2]);
  const ink = t > -0.05 && t < 0.7 && res < 10;
  passable[i] = d < TH || ink ? 1 : 0;
}
// base petals: their shaded undersides sit close to the ground tone, so protect their bodies
const protect = [[186, 413, 42, 13], [250, 442, 104, 40], [428, 424, 88, 32], [600, 442, 100, 40]];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (const [cx, cy, rx, ry] of protect) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1) passable[y * W + x] = 0;
// cursor: force background
for (let y = 352; y < 396; y++) for (let x = 704; x < 742; x++) passable[y * W + x] = 1;

// 3. flood fill from the border
const bg = new Uint8Array(N), q = new Int32Array(N); let qh = 0, qt = 0;
const push = (i) => { if (!bg[i] && passable[i]) { bg[i] = 1; q[qt++] = i; } };
for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
while (qh < qt) { const i = q[qh++], x = i % W, y = (i / W) | 0; if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (y > 0) push(i - W); if (y < H - 1) push(i + W); }

// 4. alpha: 1 inside; soft ramp on boundary pixels from bg distance; then unmix edge colour
const alpha = new Float32Array(N);
for (let i = 0; i < N; i++) alpha[i] = bg[i] ? 0 : 1;
// morphological opening (r=1): drops 1-2 px hairlines left by letter anti-aliasing
{ const er = new Float32Array(N); for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; er[i] = alpha[i] && alpha[i - 1] && alpha[i + 1] && alpha[i - W] && alpha[i + W] && alpha[i - W - 1] && alpha[i - W + 1] && alpha[i + W - 1] && alpha[i + W + 1] ? 1 : 0; }
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; alpha[i] = alpha[i] && (er[i] || er[i - 1] || er[i + 1] || er[i - W] || er[i + W] || er[i - W - 1] || er[i - W + 1] || er[i + W - 1] || er[i + W + 1]) ? 1 : 0; } }
// remove specks: keep only the largest foreground component
const comp = new Int32Array(N).fill(-1); let best = -1, bestSize = 0, id = 0;
for (let s = 0; s < N; s++) { if (alpha[s] !== 1 || comp[s] !== -1) continue; let size = 0; qh = qt = 0; q[qt++] = s; comp[s] = id; while (qh < qt) { const i = q[qh++]; size++; const x = i % W, y = (i / W) | 0; for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1]) if (j >= 0 && alpha[j] === 1 && comp[j] === -1) { comp[j] = id; q[qt++] = j; } } if (size > bestSize) { bestSize = size; best = id; } id++; }
for (let i = 0; i < N; i++) if (alpha[i] === 1 && comp[i] !== best) alpha[i] = 0;
// boundary softening: fg pixels touching bg get alpha from distance; bg pixels touching fg too
const a2 = Float32Array.from(alpha);
for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
  const i = y * W + x; let nb = 0; for (const j of [i - 1, i + 1, i - W, i + W]) nb += alpha[j];
  if (nb > 0 && nb < 4) { const t = Math.min(1, Math.max(0, (dist[i] - 6) / 34)); a2[i] = alpha[i] ? Math.max(0.35, t) : Math.min(0.6, t); }
}
const outBuf = Buffer.alloc(N * 4);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x, a = a2[i], c = px(i), b = bgAt(x, y);
  const f = a > 0 && a < 1 ? c.map((v, k) => Math.min(255, Math.max(0, (v - (1 - a) * b[k]) / a))) : c;
  outBuf.set([f[0], f[1], f[2], Math.round(a * 255)], i * 4);
}
await sharp(outBuf, { raw: { width: W, height: H, channels: 4 } }).png().toFile(out);
await sharp({ create: { width: W, height: H, channels: 3, background: "#16324A" } }).composite([{ input: out }]).png().toFile(preview);
console.log("fg px", bestSize, "of", N);
