/**
 * Meili Manager — PWA / favicon generator from the original Weeumson SVG mark.
 *
 * Master: public/icons/meili-manager-icon.svg
 * Run from repo root: npm run icons
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, "..", "public", "icons");
const publicDir = path.join(__dirname, "..", "public");
const masterPath = path.join(iconsDir, "meili-manager-icon.svg");

if (!fs.existsSync(masterPath)) {
  console.error(`Missing icon master: ${masterPath}`);
  process.exit(1);
}

const BG = { r: 0x1a, g: 0x17, b: 0x14, alpha: 1 };

fs.mkdirSync(iconsDir, { recursive: true });

const anySizes = {
  "favicon-16x16.png": 16,
  "favicon-32x32.png": 32,
  "favicon-96x96.png": 96,
  "favicon-128x128.png": 128,
  "icon-192x192.png": 192,
  "icon-512x512.png": 512,
  "apple-touch-icon.png": 180,
};

async function renderAny(name, size) {
  await sharp(masterPath)
    .resize(size, size, { fit: "contain", background: BG })
    .png()
    .toFile(path.join(iconsDir, name));
  console.log("wrote", name);
}

/** Maskable: keep glyph in ~80% safe zone on dark page background. */
async function renderMaskable(name, size) {
  const inner = Math.round(size * 0.8);
  const offset = Math.round((size - inner) / 2);
  const subject = await sharp(masterPath)
    .resize(inner, inner, { fit: "contain", background: BG })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: subject, left: offset, top: offset }])
    .png()
    .toFile(path.join(iconsDir, name));
  console.log("wrote", name, "(maskable)");
}

for (const [name, size] of Object.entries(anySizes)) {
  await renderAny(name, size);
}

await renderMaskable("maskable-icon-192x192.png", 192);
await renderMaskable("maskable-icon-512x512.png", 512);

// Multi-size ICO for legacy browsers (uses 16 + 32).
await sharp(masterPath)
  .resize(32, 32, { fit: "contain", background: BG })
  .png()
  .toFile(path.join(publicDir, "favicon.ico"));
console.log("wrote favicon.ico (32px png as .ico fallback)");

console.log("Meili Manager icon set generated in", iconsDir);
