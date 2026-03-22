// Генерация PNG иконок расширения через sharp + SVG
// Запуск: node scripts/generate-icons.mjs

import sharp from "sharp";
import { mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

function makeSVG(size) {
  const r = Math.round(size * 0.22);
  const fontSize = Math.round(size * 0.54);
  const cy = Math.round(size / 2 + fontSize * 0.36);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#4338ca"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#g)"/>
  <text
    x="${size / 2}"
    y="${cy}"
    font-family="Arial Black, Arial, Helvetica, sans-serif"
    font-weight="900"
    font-size="${fontSize}"
    fill="white"
    text-anchor="middle"
  >Z</text>
</svg>`);
}

for (const size of [16, 48, 128]) {
  const outPath = path.join(outDir, `icon${size}.png`);
  await sharp(makeSVG(size), { density: 96 })
    .png()
    .resize(size, size)
    .toFile(outPath);
  console.log(`✅ icon${size}.png → ${outPath}`);
}

console.log("\n🎉 Все иконки сгенерированы в public/icons/");
