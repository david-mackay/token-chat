// src/utils/colorGeneration.ts

function hashToRange(hash: number, min: number, max: number): number {
  return Math.floor(Math.abs(hash) % (max - min + 1)) + min;
}

export function generateColorFromAddress(address: string): string {
  // Create a hash from the wallet address
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash) + address.charCodeAt(i);
    hash = hash & hash;
  }

  // Generate multiple sub-hashes for different color components
  const hash1 = ((hash << 3) - hash) & hash;
  const hash2 = ((hash << 7) - hash) & hash;
  const hash3 = ((hash << 11) - hash) & hash;

  // Define ranges for pastel colors
  const hue = hashToRange(hash1, 0, 360);  // Full hue range
  const saturation = hashToRange(hash2, 70, 85);  // Mid-high saturation for vibrancy
  const lightness = hashToRange(hash3, 65, 75);   // Mid-high lightness for pastel look

  // Convert HSL to hex
  return hslToHex(hue, saturation, lightness);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c/2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  // Convert to hex
  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}