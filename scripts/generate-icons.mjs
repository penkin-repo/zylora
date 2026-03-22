// Генерация PNG иконок расширения через sharp + SVG
// Запуск: node scripts/generate-icons.mjs

import sharp from "sharp";
import { mkdirSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const outDir = path.join(publicDir, "icons");
const sourceSvg = path.join(publicDir, "favicon.svg");

mkdirSync(outDir, { recursive: true });

if (!existsSync(sourceSvg)) {
  console.error(`❌ Не найден файл ${sourceSvg}`);
  process.exit(1);
}

for (const size of [16, 48, 128]) {
  const outPath = path.join(outDir, `icon${size}.png`);
  // Читаем SVG-файл и конвертируем его в нужный размер PNG
  await sharp(sourceSvg, { density: 300 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath);
  console.log(`✅ icon${size}.png → ${outPath}`);
}

console.log("\n🎉 Иконки расширения успешно сгенерированы из вашего favicon.svg!");
