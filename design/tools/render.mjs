// Render chakra forms to transparent PNGs (supersampled 2x, then downscaled).
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import sharp from "sharp";

const ROOT = new URL(".", import.meta.url).pathname;
const OUT = process.argv[2];
const KINDS = (process.argv[3] ?? "mooladhara,swadisthan,nabhi,anahat,vishuddhi,agnya,sahasrara").split(",");
const TILT = process.argv[4] ?? "-0.42";
const MIME = { ".html": "text/html", ".js": "text/javascript" };

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
page.on("console", (m) => m.type() === "error" && console.log("console:", m.text()));
page.on("pageerror", (e) => console.log("pageerror:", e.message));
await page.route("http://render.local/**", (route) => {
  const p = new URL(route.request().url()).pathname;
  const file = p.startsWith("/three/") ? join(ROOT, "node_modules", p) : join(ROOT, p);
  route.fulfill({ body: readFileSync(file), contentType: MIME[extname(file)] ?? "application/octet-stream" });
});
for (const kind of KINDS) {
  await page.goto(`http://render.local/chakra.html?kind=${kind}&size=2000&tilt=${TILT}`);
  await page.waitForFunction(() => window.__done, null, { timeout: 60000 });
  const url = await page.evaluate(() => window.__done);
  const buf = Buffer.from(url.split(",")[1], "base64");
  await sharp(buf).resize(1000, 1000, { kernel: "lanczos3" }).png().toFile(`${OUT}/chakra-${kind}.png`);
  console.log("rendered", kind);
}
await browser.close();
