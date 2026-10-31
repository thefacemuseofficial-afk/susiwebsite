import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Loader2, X, MapPin, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { Button } from "@/components/ui/button";
import { analyzeSkin, barcodeLookup, getScans, addScan, deleteScanApi, type DemoProduct, type StoredScan } from "@/lib/mockServices";
import { loadSkinProfile, saveSkinProfile, getFitzpatrickLabel, type FitzpatrickType, type SkinProfile } from "@/lib/skinProfile";
import { resizeDataUrl } from "@/lib/image";
import { detectUserLocation, loadStoredRegion, locationForRegion, type UserLocation } from "@/lib/geolocation";
import { getBrandsForRetailer, getRetailersForRegion, getShadesForCategoryWithOverrides, retailerSites, type CategorySlug } from "@/lib/shadeData";
import { compareShade, verdictLabel, type MatchResult, type Undertone } from "@/lib/shadeMatch";
import { useAuth } from "@/lib/mockAuth";

const RECOMMEND_CATEGORIES: CategorySlug[] = ["foundation", "concealer"];

export default function Shopping() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<SkinProfile | null>(() => loadSkinProfile());
  const [product, setProduct] = useState<DemoProduct | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [store, setStore] = useState<string>("");
  const [locating, setLocating] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [recent, setRecent] = useState<StoredScan[]>([]);

  useEffect(() => {
    document.title = "Shopping Mode — chic shades club";
    const stored = loadStoredRegion();
    if (stored) { setLocation(locationForRegion(stored)); return; }
    detectUserLocation().then(setLocation);
  }, []);

  useEffect(() => { if (isAuthenticated) getScans().then(setRecent); else setRecent([]); }, [isAuthenticated]);

  const retailers = useMemo(() => (location ? getRetailersForRegion(location.region) : []), [location]);
  useEffect(() => { if (!store && retailers.length > 0) setStore(retailers[0]); }, [retailers, store]);

  const useDeviceLocation = async () => {
    setLocating(true);
    try { setLocation(await detectUserLocation()); } finally { setLocating(false); }
  };

  const handleBarcode = async (barcode: string) => {
    setProductError(null); setProduct(null); setResult(null); setProductLoading(true);
    try {
      const data = await barcodeLookup(barcode);
      if (data.kind === "not_found") setProductError(data.message || "Product not found.");
      else setProduct(data);
    } catch {
      setProductError("Couldn't identify that product.");
    } finally {
      setProductLoading(false);
    }
  };

  const compareNow = async () => {
    if (!product || !profile || product.kind !== "makeup") return;
    const match = compareShade({ productHex: product.shadeHex!, productUndertone: (product.shadeUndertone || "neutral") as Undertone, skinHex: profile.skinHex, skinUndertone: profile.undertone as Undertone });
    setResult(match);
    if (isAuthenticated) {
      try {
        const saved = await addScan({ brand: product.brand || null, product: product.product || null, shade: product.shade || null, shade_hex: product.shadeHex || null, verdict: match.verdict, reason: match.reason, store: store || null });
        setRecent((r) => [saved, ...r].slice(0, 6));
      } catch { /* ignore */ }
    }
  };

  useEffect(() => {
    if (product && product.kind === "makeup" && profile && !result) compareNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, profile]);

  const clearProduct = () => { setProduct(null); setResult(null); setProductError(null); };
  const removeScan = async (id: string) => { await deleteScanApi(id); setRecent((r) => r.filter((s) => s.scan_id !== id)); };

  const storeRecommendations = useMemo(() => {
    if (!profile || !store || !location) return [];
    const brands = new Set(getBrandsForRetailer(store, location.region));
    if (brands.size === 0) return [];
    const items: { brand: string; product: string; shade: string; hex: string; category: CategorySlug }[] = [];
    for (const cat of RECOMMEND_CATEGORIES) {
      const shades = getShadesForCategoryWithOverrides(cat, profile.fitzpatrick as FitzpatrickType, undefined);
      for (const s of shades) if (brands.has(s.brand)) items.push({ brand: s.brand, product: s.product, shade: s.shade, hex: s.hex, category: cat });
    }
    const seen = new Set<string>(); const unique: typeof items = [];
    for (const it of items) { const key = `${it.brand}|${it.product}|${it.shade}|${it.category}`; if (!seen.has(key)) { seen.add(key); unique.push(it); } if (unique.length >= 6) break; }
    return unique;
  }, [profile, store, location]);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 px-5 pb-16">
        <div className="flex flex-col items-center text-center pt-2 mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-3"><ShoppingBag className="h-6 w-6 text-foreground" /></div>
          <h1 className="font-display text-2xl italic font-bold text-foreground mb-1">Shopping Mode</h1>
          <p className="text-sm text-muted-foreground max-w-[300px]">Scan the product barcode, scan your skin, and I'll tell you if it matches, runs too warm, or too cool.</p>
        </div>

        <section className="mb-8 rounded-2xl bg-card px-5 py-4">
          <div className="flex items-center gap-2 mb-3 text-foreground"><MapPin className="h-4 w-4" /><p className="text-sm font-semibold">Where are you shopping?</p></div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={store} onChange={(e) => setStore(e.target.value)} className="flex-1 rounded-full border border-foreground/15 bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
              {retailers.length === 0 && <option value="">Detecting…</option>}
              {retailers.map((r) => (<option key={r} value={r}>{retailerSites[r]?.name ?? r}</option>))}
            </select>
            <Button type="button" variant="outline" onClick={useDeviceLocation} disabled={locating} className="rounded-full text-xs gap-1">{locating ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />} Re-detect</Button>
          </div>
          {location && <p className="mt-2 text-[11px] text-muted-foreground">Region: {location.country} ({location.currency})</p>}
        </section>

        <div className="grid gap-8 md:grid-cols-2 mb-8">
          <section className="flex flex-col items-center">
            <h2 className="font-display text-lg font-bold text-foreground mb-1">1. Scan your skin</h2>
            <p className="text-xs text-muted-foreground text-center mb-4 max-w-[260px]">{profile ? "Your skin profile is loaded. Rescan any time for updated lighting." : "Take a selfie so we know your undertone."}</p>
            <SkinScanPanel profile={profile} onProfile={setProfile} />
          </section>

          <section className="flex flex-col items-center">
            <h2 className="font-display text-lg font-bold text-foreground mb-1">2. Scan the product</h2>
            <p className="text-xs text-muted-foreground text-center mb-4 max-w-[260px]">Point at the barcode on the back of the makeup product.</p>
            {!product && !productLoading && <BarcodeScanner onDetected={handleBarcode} disabled={productLoading} />}
            {productLoading && (<div className="w-52 h-52 rounded-3xl border-2 border-dashed border-foreground/20 flex flex-col items-center justify-center gap-3 text-foreground/50"><Loader2 className="h-8 w-8 animate-spin" /><span className="text-xs">Looking up product…</span></div>)}
            {product && product.kind === "makeup" && (
              <div className="w-full max-w-[280px] rounded-2xl bg-card px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border border-foreground/10 flex-shrink-0" style={{ backgroundColor: product.shadeHex }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-card-foreground truncate">{product.brand}</p>
                    <p className="text-xs text-muted-foreground truncate">{product.product}</p>
                    <p className="text-xs text-foreground/70">{product.shade || product.shadeHex}<span className="ml-2 text-muted-foreground capitalize">· {product.shadeUndertone}</span></p>
                  </div>
                  <button onClick={clearProduct} className="p-1 text-muted-foreground hover:text-foreground" aria-label="Clear product"><X className="h-4 w-4" /></button>
                </div>
              </div>
            )}
            {productError && <p className="mt-3 text-xs text-destructive text-center max-w-[260px]">{productError}</p>}
          </section>
        </div>

        <div className="flex flex-col items-center mb-10">
          <Button onClick={compareNow} disabled={!product || !profile || product.kind !== "makeup"} className="rounded-full bg-primary text-primary-foreground px-10 py-3 gap-2"><Sparkles className="h-4 w-4" /> Check the match</Button>
          {result && product && (
            <div className={`mt-6 w-full max-w-[420px] rounded-2xl px-5 py-5 text-center ${result.verdict === "match" ? "bg-emerald-100/60 text-emerald-950" : result.verdict === "too_warm" ? "bg-orange-100/70 text-orange-950" : "bg-sky-100/70 text-sky-950"}`}>
              <div className="flex items-center justify-center gap-3 mb-2"><div className="w-8 h-8 rounded-full border border-black/10" style={{ backgroundColor: product.shadeHex }} /><span className="font-display text-xl font-bold">{verdictLabel(result.verdict)}</span></div>
              <p className="text-sm">{result.reason}</p>
            </div>
          )}
        </div>

        {storeRecommendations.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-lg font-bold text-foreground mb-3">Also at {retailerSites[store]?.name ?? store}</h2>
            <p className="text-xs text-muted-foreground mb-4">Shades matching your skin tone from brands stocked here.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {storeRecommendations.map((r, i) => (
                <div key={`${r.brand}-${r.shade}-${i}`} className="rounded-2xl bg-card px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-foreground/10 flex-shrink-0" style={{ backgroundColor: r.hex }} />
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-card-foreground truncate">{r.brand}</p><p className="text-xs text-muted-foreground truncate">{r.product} — {r.shade}</p><p className="text-[10px] text-muted-foreground capitalize">{r.category}</p></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {recent.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-bold text-foreground mb-3">Recent scans</h2>
            <div className="flex flex-col gap-2">
              {recent.map((s) => (
                <div key={s.scan_id} className="rounded-2xl bg-card px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-foreground/10 flex-shrink-0" style={{ backgroundColor: s.shade_hex ?? "#ccc" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-card-foreground truncate">{s.brand ?? "Unknown"} <span className="text-xs font-normal text-muted-foreground">· {s.shade ?? ""}</span></p>
                    <p className="text-xs text-muted-foreground truncate">{s.product ?? ""}</p>
                    <p className={`text-[11px] font-semibold ${s.verdict === "match" ? "text-emerald-700" : s.verdict === "too_warm" ? "text-orange-700" : "text-sky-700"}`}>{verdictLabel(s.verdict as MatchResult["verdict"])}{s.store ? ` · ${retailerSites[s.store]?.name ?? s.store}` : ""}</p>
                  </div>
                  <button onClick={() => removeScan(s.scan_id)} className="p-1 text-muted-foreground hover:text-destructive" aria-label="Delete scan"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </section>
        )}

        {!profile && <p className="mt-8 text-center text-xs text-muted-foreground">Never done a full skin scan? <Link to="/scan" className="text-foreground underline underline-offset-2">Do it here</Link>.</p>}
      </main>
    </div>
  );
}

function SkinScanPanel({ profile, onProfile }: { profile: SkinProfile | null; onProfile: (p: SkinProfile) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recapture, setRecapture] = useState(false);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const resized = await resizeDataUrl(reader.result as string, 1024, 0.82);
      setPreview(resized);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!preview) return;
    setAnalyzing(true); setError(null);
    try {
      const data = await analyzeSkin(preview);
      const newProfile: SkinProfile = { fitzpatrick: data.fitzpatrick, undertone: data.undertone, skinHex: data.skinHex, label: data.label, eyeColour: data.eyeColour || undefined, selfieDataUrl: preview, timestamp: Date.now(), faceShape: data.faceShape || undefined };
      saveSkinProfile(newProfile); onProfile(newProfile); setPreview(null); setRecapture(false);
    } catch (e: any) { setError(e?.response?.data?.detail || "Analysis failed."); } finally { setAnalyzing(false); }
  };

  if (profile && !preview && !recapture) {
    return (
      <div className="w-full max-w-[280px] flex flex-col items-center gap-3">
        <div className="w-52 h-52 rounded-3xl bg-card flex flex-col items-center justify-center gap-2">
          <div className="w-16 h-16 rounded-full border border-foreground/10" style={{ backgroundColor: profile.skinHex }} />
          <p className="text-sm font-semibold text-card-foreground">{profile.label}</p>
          <p className="text-xs text-muted-foreground capitalize">{getFitzpatrickLabel(profile.fitzpatrick)} · {profile.undertone}</p>
        </div>
        <Button type="button" variant="outline" onClick={() => { setRecapture(true); inputRef.current?.click(); }} className="rounded-full text-xs gap-1"><Camera className="h-3 w-3" /> Rescan skin</Button>
        <input ref={inputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={onFile} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[280px] flex flex-col items-center gap-3">
      {!preview && (
        <button type="button" onClick={() => inputRef.current?.click()} className="w-52 h-52 rounded-3xl border-2 border-dashed border-foreground/20 flex flex-col items-center justify-center gap-3 text-foreground/50 hover:border-foreground/40 hover:text-foreground/70 transition-colors">
          <Camera className="h-10 w-10" /><span className="text-sm font-bold">Take a selfie</span>
        </button>
      )}
      {preview && (
        <>
          <div className="relative w-52 h-52 rounded-3xl overflow-hidden border-2 border-foreground/10">
            <img src={preview} alt="Selfie" className="w-full h-full object-cover" />
            <button onClick={() => { setPreview(null); setRecapture(false); }} className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 text-foreground/70 hover:text-foreground" aria-label="Discard"><X className="h-4 w-4" /></button>
          </div>
          <Button onClick={analyze} disabled={analyzing} className="rounded-full bg-primary text-primary-foreground px-6 gap-2">{analyzing ? (<><Loader2 className="h-4 w-4 animate-spin" /> Analysing…</>) : "Confirm skin"}</Button>
        </>
      )}
      <input ref={inputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={onFile} />
      {error && <p className="text-xs text-destructive text-center max-w-[260px]">{error}</p>}
    </div>
  );
}
