#!/usr/bin/env node
// WCAG 2.x contrast ratio between two hex colours: node contrast.mjs <fg> <bg>
// Prints the ratio and which levels it passes, so the ratio is calculated rather than guessed.

const [fg, bg] = process.argv.slice(2);
if (!fg || !bg) {
  console.error("Usage: node contrast.mjs <foreground hex> <background hex>   e.g. node contrast.mjs '#686873' '#fbf8f1'");
  process.exit(1);
}

function luminance(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`Not a 3- or 6-digit hex colour: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
const ratio = (l1 + 0.05) / (l2 + 0.05);
const pass = (min) => (ratio >= min ? "pass" : "FAIL");
console.log(`${ratio.toFixed(2)}:1  body text ${pass(4.5)}  large text / UI ${pass(3)}  AAA body ${pass(7)}`);
