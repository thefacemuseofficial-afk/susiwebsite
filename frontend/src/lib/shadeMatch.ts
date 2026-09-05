// Shade comparison logic: compare a product's shade to a user's skin tone
// and return whether it's a match, too warm, or too cool.

export type Undertone = "warm" | "cool" | "neutral";
export type Verdict = "match" | "too_warm" | "too_cool";

export interface MatchInput {
  productHex: string;
  productUndertone: Undertone;
  skinHex: string;
  skinUndertone: Undertone;
}

export interface MatchResult {
  verdict: Verdict;
  reason: string;
}

interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

function hexToHsl(hex: string): HSL {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

// Warm hues: red-orange-yellow (0-50) or magenta/pink wrap (330-360).
// Cool hues: blue-teal band (180-260).
function hueTone(h: number): Undertone {
  if ((h >= 0 && h <= 50) || h >= 330) return "warm";
  if (h >= 180 && h <= 260) return "cool";
  return "neutral";
}

export function compareShade(input: MatchInput): MatchResult {
  const { productUndertone, skinUndertone } = input;
  const productHsl = hexToHsl(input.productHex);
  const skinHsl = hexToHsl(input.skinHex);

  // 1. Direct undertone clash overrides everything.
  if (productUndertone === "warm" && skinUndertone === "cool") {
    return { verdict: "too_warm", reason: "This shade leans warm (yellow/golden) but your skin reads cool. Look for a cooler alternative." };
  }
  if (productUndertone === "cool" && skinUndertone === "warm") {
    return { verdict: "too_cool", reason: "This shade leans cool (pink/rosy) but your skin reads warm. Look for a warmer alternative." };
  }

  // 2. Compatible undertones — check lightness delta.
  const lightnessDelta = productHsl.l - skinHsl.l;
  const productHueTone = hueTone(productHsl.h);
  const skinHueTone = hueTone(skinHsl.h);

  if (Math.abs(lightnessDelta) <= 12) {
    // Similar depth — still flag a strong hue mismatch.
    if (productHueTone === "warm" && skinHueTone === "cool") {
      return { verdict: "too_warm", reason: "The shade's warmth doesn't match your skin's cooler tone." };
    }
    if (productHueTone === "cool" && skinHueTone === "warm") {
      return { verdict: "too_cool", reason: "The shade's coolness doesn't match your skin's warmer tone." };
    }
    return { verdict: "match", reason: "Nice match — this shade sits close to your skin tone." };
  }

  // 3. Lightness gap wide — direction depends on hue lean.
  if (lightnessDelta > 12) {
    // Product is much lighter. If it also leans warm → too warm; else too cool.
    const verdict: Verdict = productHueTone === "cool" ? "too_cool" : "too_warm";
    return {
      verdict,
      reason:
        verdict === "too_warm"
          ? "This shade is lighter and warmer than your skin — it may look ashy or peachy on you."
          : "This shade is lighter and cooler than your skin — it may look pale or pink.",
    };
  }
  // lightnessDelta < -12 (product much darker)
  const verdict: Verdict = productHueTone === "warm" ? "too_warm" : "too_cool";
  return {
    verdict,
    reason:
      verdict === "too_warm"
        ? "This shade is darker and warmer than your skin — it may look muddy."
        : "This shade is darker and cooler than your skin — it may look grey.",
  };
}

export function verdictLabel(v: Verdict): string {
  return v === "match" ? "Match" : v === "too_warm" ? "Too Warm" : "Too Cool";
}
