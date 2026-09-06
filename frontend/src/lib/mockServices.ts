import { api } from "./api";
import type { FitzpatrickType, Undertone, EyeColourType, FaceShape, LightingType } from "./skinProfile";

export interface AnalyzeResult {
  fitzpatrick: FitzpatrickType;
  undertone: Undertone;
  skinHex: string;
  label: string;
  eyeColour: EyeColourType | null;
  lighting: LightingType;
  confidence: number;
  lightingNotes: string;
  faceShape: FaceShape | null;
}

/** Real AI skin analysis via backend (GPT-4o vision). */
export async function analyzeSkin(imageBase64: string): Promise<AnalyzeResult> {
  const res = await api.post("/analyze-skin", { imageBase64 });
  return res.data as AnalyzeResult;
}

export interface DemoProduct {
  kind: "makeup" | "other" | "not_found";
  brand?: string;
  product?: string;
  shade?: string;
  shadeHex?: string;
  shadeUndertone?: Undertone;
  category?: string;
  message?: string;
}

export async function barcodeLookup(barcode: string): Promise<DemoProduct> {
  const res = await api.post("/product-lookup", { barcode });
  return res.data as DemoProduct;
}

export interface StoredScan {
  scan_id: string;
  brand: string | null;
  product: string | null;
  shade: string | null;
  shade_hex: string | null;
  verdict: string;
  reason: string | null;
  store: string | null;
  created_at: string;
}

export async function getScans(): Promise<StoredScan[]> {
  try { const res = await api.get("/scans"); return res.data || []; } catch { return []; }
}
export async function addScan(scan: Omit<StoredScan, "scan_id" | "created_at">): Promise<StoredScan> {
  const res = await api.post("/scans", scan);
  return res.data as StoredScan;
}
export async function deleteScanApi(id: string): Promise<void> {
  try { await api.delete(`/scans/${id}`); } catch { /* ignore */ }
}

/** Start Stripe checkout for the $6/month Pro plan and redirect to Stripe. */
export async function startCheckout(userId?: string): Promise<void> {
  const res = await api.post("/payments/checkout", {
    lookup_key: "pro_monthly",
    origin_url: window.location.origin,
    user_id: userId || null,
  });
  if (res.data?.checkout_url) window.location.href = res.data.checkout_url;
}
