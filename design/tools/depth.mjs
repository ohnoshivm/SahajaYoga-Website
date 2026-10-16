// Depth map for the approved lotus: a soft dome from the silhouette, nearer toward the
// bottom (the camera looks slightly down into the flower), the heart set back a little.
import sharp from "sharp";
const [src, out] = process.argv.slice(2);
const { data, info } = await sharp(src).ensureAlpha().extractChannel(3).blur(28).raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, d = Buffer.alloc(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x, dome = data[i] / 255;
  const lower = y / H; // bottom petals are nearest
  const cx = (x - W * 0.5) / (W * 0.18), cy = (y - H * 0.55) / (H * 0.22);
  const heart = Math.exp(-(cx * cx + cy * cy)); // the cup recedes
  d[i] = Math.round(255 * Math.max(0, Math.min(1, 0.55 * dome + 0.45 * lower * dome - 0.18 * heart)));
}
await sharp(d, { raw: { width: W, height: H, channels: 1 } }).blur(6).png().toFile(out);
console.log("depth", W, H);
