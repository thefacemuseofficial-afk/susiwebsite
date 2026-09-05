// Rule-based mixing recipes using L.A. Girl PRO.coverage HD Illuminating
// Foundation as a base plus the PRO.coverage mixing pigment range.
// These are a colour-maths starting point, not official brand instructions.

import type { FitzpatrickType, Undertone } from "./skinProfile";

export type PigmentName =
  | "White"
  | "Yellow"
  | "Orange"
  | "Red"
  | "Blue"
  | "Green"
  | "Brown"
  | "Black";

export interface Pigment {
  name: PigmentName;
  hex: string;
  /** What this pigment does in a mix. */
  effect: string;
}

export const PIGMENTS: Record<PigmentName, Pigment> = {
  White: { name: "White", hex: "#F7F4F0", effect: "Lightens without changing undertone." },
  Yellow: { name: "Yellow", hex: "#E8C55A", effect: "Warms and cancels pink or ruddy tones." },
  Orange: { name: "Orange", hex: "#D98443", effect: "Adds golden warmth and cancels grey/ashiness." },
  Red: { name: "Red", hex: "#B8443C", effect: "Adds richness to sallow or flat-looking skin." },
  Blue: { name: "Blue", hex: "#4A5C9B", effect: "Cools a shade down and cancels orange." },
  Green: { name: "Green", hex: "#5C8A5C", effect: "Neutralises redness." },
  Brown: { name: "Brown", hex: "#6B4630", effect: "Deepens without going muddy." },
  Black: { name: "Black", hex: "#2A2320", effect: "Deepens sharply — one drop at a time." },
};

export interface RecipeDrop {
  pigment: Pigment;
  drops: number;
  why: string;
}

export interface MixRecipe {
  /** Plain-language depth band to buy the base foundation in. */
  baseBand: string;
  baseHex: string;
  baseDrops: number;
  drops: RecipeDrop[];
  mixedHex: string;
  targetHex: string;
  summary: string;
  adjustments: { symptom: string; fix: string }[];
}

// Neutral reference base tones per Fitzpatrick depth band.
const BASE_BANDS: Record<FitzpatrickType, { label: string; hex: string }> = {
  1: { label: "Very fair / porcelain base", hex: "#F3DDCD" },
  2: { label: "Fair / ivory base", hex: "#EBCBB2" },
  3: { label: "Light-medium / natural beige base", hex: "#DDB394" },
  4: { label: "Medium-olive / warm beige base", hex: "#C69574" },
  5: { label: "Tan to brown / honey-caramel base", hex: "#9E6B4A" },
  6: { label: "Deep / rich espresso base", hex: "#6B432E" },
};

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------
export function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  return [
    parseInt(c.slice(0, 2), 16),
    parseInt(c.slice(2, 4), 16),
    parseInt(c.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** Weighted average of base + pigment drops — a simple subtractive-ish preview. */
export function mixPreviewHex(
  baseHex: string,
  baseDrops: number,
  drops: { hex: string; drops: number }[],
): string {
  let [r, g, b] = hexToRgb(baseHex).map((v) => v * baseDrops) as [number, number, number];
  let total = baseDrops;
  for (const d of drops) {
    const [pr, pg, pb] = hexToRgb(d.hex);
    // Pigments are highly concentrated — weight each drop x2.2 vs base.
    const w = d.drops * 2.2;
    r += pr * w;
    g += pg * w;
    b += pb * w;
    total += w;
  }
  return rgbToHex(r / total, g / total, b / total);
}

// ---------------------------------------------------------------------------
// Recipe
// ---------------------------------------------------------------------------
export function getMixRecipe(
  targetHex: string,
  undertone: Undertone,
  fitzpatrick: FitzpatrickType,
): MixRecipe {
  const band = BASE_BANDS[fitzpatrick];
  const baseDrops = 10;
  const drops: RecipeDrop[] = [];

  const targetL = luminance(targetHex);
  const baseL = luminance(band.hex);
  const deltaL = targetL - baseL;

  // Depth correction.
  if (deltaL > 14) {
    drops.push({
      pigment: PIGMENTS.White,
      drops: deltaL > 28 ? 2 : 1,
      why: "Your skin reads lighter than the base band, so a touch of White lifts it.",
    });
  } else if (deltaL < -14) {
    if (deltaL < -34) {
      drops.push({
        pigment: PIGMENTS.Brown,
        drops: 2,
        why: "Brown deepens the base toward your depth without dulling it.",
      });
      drops.push({
        pigment: PIGMENTS.Black,
        drops: 1,
        why: "One drop of Black takes it the rest of the way down.",
      });
    } else {
      drops.push({
        pigment: PIGMENTS.Brown,
        drops: 1,
        why: "A single drop of Brown deepens the base to match you.",
      });
    }
  }

  // Undertone correction.
  const [tr, tg, tb] = hexToRgb(targetHex);
  const redness = tr - (tg + tb) / 2;

  if (undertone === "warm") {
    drops.push({
      pigment: PIGMENTS.Yellow,
      drops: 2,
      why: "Your skin reads warm, so Yellow pulls the base golden instead of pink.",
    });
    if (fitzpatrick >= 4) {
      drops.push({
        pigment: PIGMENTS.Orange,
        drops: 1,
        why: "A drop of Orange keeps deeper warm skin from looking ashy.",
      });
    }
  } else if (undertone === "cool") {
    drops.push({
      pigment: PIGMENTS.Blue,
      drops: 1,
      why: "Your skin reads cool, so a single drop of Blue takes the yellow out of the base.",
    });
    if (redness > 34) {
      drops.push({
        pigment: PIGMENTS.Green,
        drops: 1,
        why: "There's visible redness in your reading — Green cancels it.",
      });
    }
  } else {
    drops.push({
      pigment: PIGMENTS.Yellow,
      drops: 1,
      why: "Your skin reads neutral, so just one drop of Yellow stops the base looking pink.",
    });
  }

  // Sallow / flat deeper skin benefits from a touch of Red.
  if (fitzpatrick >= 5 && undertone !== "cool") {
    drops.push({
      pigment: PIGMENTS.Red,
      drops: 1,
      why: "A drop of Red adds richness so the mix doesn't go flat or grey.",
    });
  }

  const mixedHex = mixPreviewHex(
    band.hex,
    baseDrops,
    drops.map((d) => ({ hex: d.pigment.hex, drops: d.drops })),
  );

  const undertoneWord =
    undertone === "warm" ? "warm (golden)" : undertone === "cool" ? "cool (pink/rosy)" : "neutral";

  const summary = `Start with a ${band.label.toLowerCase()}, then correct toward your ${undertoneWord} undertone. Mix on the back of your hand and add pigment one drop at a time — pigments are concentrated and a single extra drop shifts the whole mix.`;

  const adjustments = [
    { symptom: "Too dark", fix: "Add White, one drop at a time." },
    { symptom: "Too light or chalky", fix: "Add Brown, or Black if you're more than a shade off." },
    { symptom: "Too orange", fix: "Add Blue — a pinhead amount is enough." },
    { symptom: "Too pink", fix: "Add Yellow." },
    { symptom: "Grey or ashy", fix: "Add Orange, or Red on deeper skin." },
    { symptom: "Red or ruddy", fix: "Add Green." },
  ];

  return {
    baseBand: band.label,
    baseHex: band.hex,
    baseDrops,
    drops,
    mixedHex,
    targetHex,
    summary,
    adjustments,
  };
}

export function recipeLine(recipe: MixRecipe): string {
  const parts = [`${recipe.baseDrops} drops base`];
  for (const d of recipe.drops) {
    parts.push(`${d.drops} drop${d.drops > 1 ? "s" : ""} ${d.pigment.name}`);
  }
  return parts.join(" + ");
}

// ---------------------------------------------------------------------------
// Measurable quantities
// ---------------------------------------------------------------------------

/** Approximate volume of a single dropper drop, in millilitres. */
export const DROP_ML = 0.05;
/** One pump of foundation is roughly this many drops. */
export const DROPS_PER_PUMP = 10;

export interface ScaledRecipe {
  multiplier: number;
  baseDrops: number;
  baseMl: number;
  drops: { pigment: Pigment; drops: number; ml: number; why: string }[];
  totalDrops: number;
  totalMl: number;
}

export function scaleRecipe(recipe: MixRecipe, multiplier = 1): ScaledRecipe {
  const baseDrops = recipe.baseDrops * multiplier;
  const drops = recipe.drops.map((d) => ({
    pigment: d.pigment,
    drops: d.drops * multiplier,
    ml: d.drops * multiplier * DROP_ML,
    why: d.why,
  }));
  const totalDrops = baseDrops + drops.reduce((s, d) => s + d.drops, 0);
  return {
    multiplier,
    baseDrops,
    baseMl: baseDrops * DROP_ML,
    drops,
    totalDrops,
    totalMl: totalDrops * DROP_ML,
  };
}

/** e.g. "10 : 2 : 1" for base + each pigment, in recipe order. */
export function ratioLine(recipe: MixRecipe): string {
  return [recipe.baseDrops, ...recipe.drops.map((d) => d.drops)].join(" : ");
}

/** Labels matching each part of `ratioLine`. */
export function ratioLegend(recipe: MixRecipe): string[] {
  return ["Base", ...recipe.drops.map((d) => d.pigment.name)];
}

export function formatMl(ml: number): string {
  return ml >= 1 ? `${ml.toFixed(1).replace(/\.0$/, "")} ml` : `${Math.round(ml * 1000) / 1000} ml`;
}

// ---------------------------------------------------------------------------
// Grouping for the video sync panel
// ---------------------------------------------------------------------------

const WARM_PIGMENTS: PigmentName[] = ["Yellow", "Orange", "Red"];
const COOL_PIGMENTS: PigmentName[] = ["Blue", "Green"];
const DEPTH_PIGMENTS: PigmentName[] = ["White", "Brown", "Black"];

export interface RecipeGroups {
  warm: RecipeDrop[];
  cool: RecipeDrop[];
  depth: RecipeDrop[];
}

/** Split a recipe's drops into the groups each video chapter talks about. */
export function groupRecipeDrops(recipe: MixRecipe): RecipeGroups {
  return {
    warm: recipe.drops.filter((d) => WARM_PIGMENTS.includes(d.pigment.name)),
    cool: recipe.drops.filter((d) => COOL_PIGMENTS.includes(d.pigment.name)),
    depth: recipe.drops.filter((d) => DEPTH_PIGMENTS.includes(d.pigment.name)),
  };
}

