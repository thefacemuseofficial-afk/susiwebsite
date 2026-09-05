// Front-end-only MOCK services replacing Supabase edge functions.
// - analyzeSkinMock: pretends to read skin tone from a selfie.
// - barcodeLookupMock: returns a demo makeup product.
// - shopping scan history stored in localStorage.

import type { FitzpatrickType, Undertone, EyeColourType, FaceShape, LightingType } from "./skinProfile";

export interface AnalyzeResult {
  fitzpatrick: FitzpatrickType;
  undertone: Undertone;
  skinHex: string;
  label: string;
  eyeColour: EyeColourType;
  lighting: LightingType;
  confidence: number;
  lightingNotes: string;
  faceShape: FaceShape;
}

const SKIN_BY_FITZ: Record<FitzpatrickType, { hex: string; label: string }[]> = {
  1: [{ hex: "#F3DDCD", label: "Very Fair" }, { hex: "#F5E0D0", label: "Porcelain" }],
  2: [{ hex: "#EBCBB2", label: "Fair" }, { hex: "#EDCDB5", label: "Ivory" }],
  3: [{ hex: "#DDB394", label: "Light Medium" }, { hex: "#DCB396", label: "Natural Beige" }],
  4: [{ hex: "#C69574", label: "Medium Olive" }, { hex: "#C69375", label: "Warm Beige" }],
  5: [{ hex: "#9E6B4A", label: "Tan" }, { hex: "#9C6A4B", label: "Honey Caramel" }],
  6: [{ hex: "#6B432E", label: "Deep" }, { hex: "#68412D", label: "Rich Espresso" }],
};

const EYES: EyeColourType[] = ["brown", "blue", "green", "hazel", "grey"];
const SHAPES: FaceShape[] = ["oval", "round", "square", "heart", "oblong", "diamond"];
const UNDERTONES: Undertone[] = ["warm", "neutral", "cool"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function analyzeSkinMock(_imageBase64: string): Promise<AnalyzeResult> {
  const fitz = ((Math.floor(Math.random() * 6) + 1) as FitzpatrickType);
  const skin = pick(SKIN_BY_FITZ[fitz]);
  const undertone = pick(UNDERTONES);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        fitzpatrick: fitz,
        undertone,
        skinHex: skin.hex,
        label: skin.label,
        eyeColour: pick(EYES),
        lighting: "daylight",
        confidence: 0.82,
        lightingNotes: "Good, even lighting detected.",
        faceShape: pick(SHAPES),
      });
    }, 2600);
  });
}

// ---- Barcode / product lookup (mock) --------------------------------------
export interface DemoProduct {
  kind: "makeup" | "other";
  brand: string;
  product: string;
  shade: string;
  shadeHex: string;
  shadeUndertone: Undertone;
  category?: string;
  imageUrl?: string;
}

const DEMO_PRODUCTS: DemoProduct[] = [
  { kind: "makeup", brand: "Fenty Beauty", product: "Pro Filt'r Soft Matte", shade: "240", shadeHex: "#DDB394", shadeUndertone: "neutral", category: "foundation" },
  { kind: "makeup", brand: "MAC", product: "Studio Fix Fluid", shade: "NC42", shadeHex: "#C69574", shadeUndertone: "warm", category: "foundation" },
  { kind: "makeup", brand: "NARS", product: "Radiant Creamy Concealer", shade: "Vanilla", shadeHex: "#EBCBB2", shadeUndertone: "neutral", category: "concealer" },
  { kind: "makeup", brand: "Maybelline", product: "Fit Me Matte", shade: "220 Natural Beige", shadeHex: "#D8B08C", shadeUndertone: "warm", category: "foundation" },
  { kind: "makeup", brand: "Rare Beauty", product: "Liquid Blush", shade: "Joy", shadeHex: "#C56A6A", shadeUndertone: "cool", category: "blush" },
  { kind: "makeup", brand: "e.l.f.", product: "Camo Concealer", shade: "Light Sand", shadeHex: "#E6C6A8", shadeUndertone: "neutral", category: "concealer" },
];

export function barcodeLookupMock(_barcode: string): Promise<DemoProduct> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(pick(DEMO_PRODUCTS)), 1200);
  });
}

// ---- Shopping scan history (mock, localStorage) ---------------------------
export interface StoredScan {
  id: string;
  brand: string | null;
  product: string | null;
  shade: string | null;
  shade_hex: string | null;
  verdict: string;
  reason: string | null;
  store: string | null;
  created_at: string;
}

function scanKey(userId?: string) {
  return `tbm_mock_scans_${userId ?? "anon"}`;
}
export function loadScans(userId?: string): StoredScan[] {
  try {
    return JSON.parse(localStorage.getItem(scanKey(userId)) || "[]");
  } catch {
    return [];
  }
}
export function addScan(userId: string | undefined, scan: Omit<StoredScan, "id" | "created_at">): StoredScan {
  const full: StoredScan = { ...scan, id: `s_${Date.now()}`, created_at: new Date().toISOString() };
  const all = [full, ...loadScans(userId)].slice(0, 6);
  localStorage.setItem(scanKey(userId), JSON.stringify(all));
  return full;
}
export function deleteScan(userId: string | undefined, id: string) {
  const all = loadScans(userId).filter((s) => s.id !== id);
  localStorage.setItem(scanKey(userId), JSON.stringify(all));
}
