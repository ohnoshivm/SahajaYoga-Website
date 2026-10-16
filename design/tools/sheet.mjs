import sharp from "sharp";
const T = "/private/tmp/claude-501/chakras";
const W = { mooladhara: "#3B1A16", swadisthan: "#3A2E10", nabhi: "#12301F", anahat: "#211B3D", vishuddhi: "#16324A", agnya: "#25282E", sahasrara: "#F4F1EC" };
const tiles = [];
for (const [k, bg] of Object.entries(W)) tiles.push(await sharp({ create: { width: 1000, height: 1000, channels: 3, background: bg } }).composite([{ input: `${T}/chakra-${k}.png` }]).png().toBuffer());
const big = await sharp({ create: { width: 4000, height: 2000, channels: 3, background: "#000" } }).composite(tiles.map((t, i) => ({ input: t, left: (i % 4) * 1000, top: Math.floor(i / 4) * 1000 }))).png().toBuffer();
await sharp(big).resize(1600).toFile(`${T}/sheet.png`);
