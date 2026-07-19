#!/usr/bin/env node
/** Copy index.html → 404.html so static hosts serve the SPA shell on deep-link refresh. */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..", "dist", "pwa");
const index = join(root, "index.html");
const fallback = join(root, "404.html");

if (!existsSync(index)) {
  console.error("spa-fallback-html: missing", index, "(run build:pwa first)");
  process.exit(1);
}

copyFileSync(index, fallback);

let html = readFileSync(fallback, "utf8");
html = html.replace(
  /<title>[^<]*<\/title>/i,
  "<title>Page not found · Meili Manager</title>",
);
const robotsMeta =
  /<meta\s+name=(?:["']robots["']|robots)\s+content=(?:["'][^"']*["']|[^\s>]+)\s*\/?>/i;
if (robotsMeta.test(html)) {
  html = html.replace(
    robotsMeta,
    '<meta name="robots" content="noindex, nofollow" />',
  );
} else {
  html = html.replace(
    /<meta\s+charset=(?:["']utf-8["']|utf-8)\s*\/?>/i,
    '<meta charset="utf-8" /><meta name="robots" content="noindex, nofollow" />',
  );
}
writeFileSync(fallback, html, "utf8");

console.log("spa-fallback-html: wrote", fallback, "(noindex + distinct title)");
