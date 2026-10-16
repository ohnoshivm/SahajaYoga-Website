// Export each .ab artboard of the design deck to PNG.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const DECK = "/Users/hustle/Downloads/OhnoShivm/SahajaYoga-Website/design/index.html";
const OUT = process.argv[2] ?? "/Users/hustle/Downloads/OhnoShivm/SahajaYoga-Website/design/exports";
const ONLY = process.argv[3] ? process.argv[3].split(",") : null;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
for (const dsf of [1, 2]) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: dsf });
  page.on("pageerror", (e) => console.log("pageerror:", e.message));
  await page.goto("file://" + DECK, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.documentElement.dataset.ready === "1");
  const ids = await page.$$eval(".ab", (els) => els.map((e) => ({ id: e.id, phone: e.classList.contains("ab--phone") })));
  for (const { id, phone } of ids) {
    if ((dsf === 2) !== phone) continue;
    if (ONLY && !ONLY.includes(id)) continue;
    await page.locator(`#${id}`).screenshot({ path: `${OUT}/${id}.png` });
    console.log("exported", id);
  }
  await page.close();
}
await browser.close();
