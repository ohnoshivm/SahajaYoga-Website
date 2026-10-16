import sharp from "sharp";
const [src, out] = process.argv.slice(2);
const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const a = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) a[i] = data[i * 4 + 3];
// drop dark, partly transparent edge pixels (letter ink bleeding into the matte)
for (let i = 0; i < W * H; i++) { const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2]; const L = 0.2126 * r + 0.7152 * g + 0.0722 * b; if (a[i] < 255 && L < 170) a[i] = 0; }
// erode 1px, then a light 3x3 blur for a soft, clean edge
const er = new Uint8Array(W * H);
for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { let m = 255; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) m = Math.min(m, a[(y + dy) * W + x + dx]); er[y * W + x] = m; }
for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { let s = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += er[(y + dy) * W + x + dx]; data[(y * W + x) * 4 + 3] = Math.round(s / 9); }
await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toFile(out);
console.log("ok");
