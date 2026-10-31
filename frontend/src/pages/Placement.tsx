import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { FaceMap } from "@/components/FaceMap";
import { loadSkinProfile, getFaceShapeLabel, getFaceShapeDescription, type SkinProfile, type FaceShape } from "@/lib/skinProfile";
import { PRODUCT_LABELS, type PlacementProduct } from "@/lib/facePlacement";

const PRODUCTS: PlacementProduct[] = ["concealer", "contour", "bronzer", "highlighter"];
const isProduct = (v: string | null): v is PlacementProduct =>
  v === "concealer" || v === "contour" || v === "bronzer" || v === "highlighter";

export default function Placement() {
  const [searchParams] = useSearchParams();
  const productSearch = searchParams.get("product");
  const [profile, setProfile] = useState<SkinProfile | null>(null);
  const [product, setProduct] = useState<PlacementProduct>(isProduct(productSearch) ? productSearch : "contour");

  useEffect(() => {
    document.title = "Placement Guide — chic shades club";
    setProfile(loadSkinProfile());
  }, []);

  useEffect(() => {
    if (isProduct(productSearch)) setProduct(productSearch);
  }, [productSearch]);

  const detected = profile?.faceShape;
  const shape: FaceShape = detected ?? "oval";

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 px-5 pb-10">
        <Link to="/results" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"><ArrowLeft className="h-4 w-4" /> Back</Link>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-foreground/70" />
          <h1 className="font-display text-xl font-bold text-foreground">Placement Guide</h1>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Hover or tap any zone to see how to apply each product.</p>

        <div className="rounded-2xl bg-card px-4 py-3 mb-4">
          <p className="text-xs font-semibold text-card-foreground">{detected ? "Your face shape" : "Face shape"}: {getFaceShapeLabel(shape)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{getFaceShapeDescription(shape)}</p>
          {!profile && <p className="text-[11px] text-muted-foreground mt-2"><Link to="/scan" className="underline">Scan your face</Link> to tailor these zones to your face shape.</p>}
          {profile && !detected && <p className="text-[11px] text-muted-foreground mt-2">We couldn't detect a face shape from your scan. <Link to="/scan" className="underline">Scan again</Link> with a full face photo for a personalised guide.</p>}
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {PRODUCTS.map((p) => {
            const active = p === product;
            return (
              <button key={p} type="button" onClick={() => setProduct(p)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${active ? "border-foreground bg-foreground text-background" : "border-foreground/20 bg-card text-foreground hover:bg-muted"}`}>{PRODUCT_LABELS[p]}</button>
            );
          })}
        </div>

        <FaceMap key={`${shape}-${product}`} faceShape={shape} product={product} />

        <Link to="/guide" className="mt-5 block text-center text-xs text-foreground/60 underline underline-offset-4 hover:text-foreground/80">See the full step-by-step application guide</Link>
      </main>
    </div>
  );
}
