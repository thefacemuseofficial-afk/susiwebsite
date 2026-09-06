import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, ArrowUpDown, Store, Heart } from "lucide-react";
import { getShadesForCategoryWithOverrides, getEyeshadowByEyeColourWithOverrides, getEyeshadowPalettesByEyeColour, getCategoryDescription, getRetailerLinks, type EyeColour } from "@/lib/shadeData";
import { detectUserLocation, convertPrice, locationForRegion, type UserLocation, type Region } from "@/lib/geolocation";
import { loadSkinProfile, type SkinProfile } from "@/lib/skinProfile";
import { Slider } from "@/components/ui/slider";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { useAuth, useSubscription, useFavourites } from "@/lib/mockAuth";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}
function colorDistance(a: [number, number, number] | null, b: [number, number, number] | null): number {
  if (!a || !b) return Number.POSITIVE_INFINITY;
  const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export default function CategoryResults() {
  const { category = "foundation" } = useParams();
  const title = category === "lipstick" ? "Lips" : category.charAt(0).toUpperCase() + category.slice(1);
  const description = getCategoryDescription(category);

  const { user, isAuthenticated } = useAuth();
  const { isSubscribed, isLoading: subLoading, startTrial } = useSubscription(user?.user_id);
  const { isFavourite, toggleFavourite } = useFavourites(user?.user_id);
  const navigate = useNavigate();

  const [location, setLocation] = useState<UserLocation | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [eyeColour, setEyeColour] = useState<EyeColour>("brown");
  const [profile, setProfile] = useState<SkinProfile | null>(null);

  useEffect(() => {
    document.title = `${title} Shade Matches — The Face Muse`;
    detectUserLocation().then(setLocation);
    const p = loadSkinProfile();
    setProfile(p);
    if (category === "eyeshadow" && p?.eyeColour) setEyeColour(p.eyeColour as EyeColour);
  }, [category, title]);

  const fitzpatrick = profile?.fitzpatrick ?? 2;
  const baseShades = category === "eyeshadow"
    ? getEyeshadowByEyeColourWithOverrides(eyeColour, undefined)
    : getShadesForCategoryWithOverrides(category, fitzpatrick, undefined);

  const exchangeRate = location?.exchangeRate ?? 1;
  const localPrice = (usd: number) => usd * exchangeRate;
  const skinHex = profile?.skinHex ?? null;

  const maxPrice = Math.ceil(Math.max(...baseShades.map((s) => localPrice(s.priceUSD)), 60 * exchangeRate));

  useEffect(() => {
    if (baseShades.length > 0) setPriceRange([0, maxPrice]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, exchangeRate]);

  const filteredAndSorted = useMemo(() => {
    let result = baseShades.filter((s) => { const p = localPrice(s.priceUSD); return p >= priceRange[0] && p <= priceRange[1]; });
    if (skinHex && category !== "eyeshadow") {
      const target = hexToRgb(skinHex);
      if (target) result = [...result].map((s) => ({ s, d: colorDistance(target, hexToRgb(s.hex)) })).sort((a, b) => a.d - b.d).map((x) => x.s);
    }
    if (category !== "eyeshadow") {
      const seen = new Set<string>();
      result = result.filter((s) => { if (seen.has(s.brand)) return false; seen.add(s.brand); return true; });
    }
    if (sortOrder === "asc") result = [...result].sort((a, b) => a.priceUSD - b.priceUSD);
    else if (sortOrder === "desc") result = [...result].sort((a, b) => b.priceUSD - a.priceUSD);
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseShades, priceRange, sortOrder, exchangeRate, skinHex, category]);

  if (!subLoading && !isSubscribed) {
    return (
      <main className="flex-1 px-5 pb-10">
        <Link to="/results" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"><ArrowLeft className="h-4 w-4" /> Back</Link>
        <h1 className="font-display text-xl font-bold text-foreground mb-1">{title}</h1>
        <p className="text-xs text-muted-foreground mb-6">{description}</p>
        <SubscriptionGate isAuthenticated={isAuthenticated} onStartTrial={startTrial} onSubscribeLater={() => navigate("/results")} />
      </main>
    );
  }

  const eyeSwatch: Record<EyeColour, string> = { brown: "#6B4423", blue: "#4A90C2", green: "#4C7A4A", hazel: "#8B7355", grey: "#8892A0" };

  return (
    <main className="flex-1 px-5 pb-10">
      <Link to="/results" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <h1 className="font-display text-xl font-bold text-foreground mb-1">{title}</h1>
      <p className="text-xs text-muted-foreground mb-1">{description}</p>
      {profile ? (
        <p className="text-[11px] text-muted-foreground mb-4">{category === "eyeshadow" ? `Matched for your eye colour · ${profile.eyeColour ?? "brown"}` : `Matched for your skin tone · ${profile.undertone} undertone`}</p>
      ) : (
        <p className="text-[11px] text-muted-foreground mb-4"><Link to="/scan" className="text-butter-yellow hover:underline">Scan your skin</Link> for personalised results</p>
      )}
      {(category === "concealer" || category === "contour" || category === "bronzer" || category === "highlighter") && (
        <Link to={`/placement?product=${category}`} className="inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-2 mb-4">See where to apply →</Link>
      )}

      <div className="rounded-2xl bg-card backdrop-blur-md px-5 py-4 mb-4 mt-2">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-card-foreground">Price: {location?.currencySymbol ?? "$"}{priceRange[0]} — {location?.currencySymbol ?? "$"}{priceRange[1]}</p>
          <button onClick={() => setSortOrder((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null))} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors">
            <ArrowUpDown className="h-3 w-3" /> {sortOrder === "asc" ? "Low → High" : sortOrder === "desc" ? "High → Low" : "Sort price"}
          </button>
        </div>
        <Slider min={0} max={maxPrice} step={1} value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} className="w-full" />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>$</span><span>$$</span></div>
      </div>

      {category === "eyeshadow" && (
        <div className="mb-5">
          <p className="text-[11px] text-muted-foreground mb-3">Shades chosen to complement your {eyeColour} eye colour{profile?.eyeColour && eyeColour === profile.eyeColour ? " from your scan" : ""}.</p>
          <div className="mb-4">
            <p className="text-xs font-semibold text-foreground mb-2">Your eye colour</p>
            <div className="flex flex-wrap gap-2">
              {(["brown", "blue", "green", "hazel", "grey"] as EyeColour[]).map((c) => {
                const active = eyeColour === c;
                return (
                  <button key={c} type="button" onClick={() => setEyeColour(c)} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${active ? "border-foreground bg-foreground text-background" : "border-foreground/20 bg-card text-foreground hover:bg-muted"}`}>
                    <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: eyeSwatch[c] }} />{c}
                  </button>
                );
              })}
            </div>
          </div>
          <h2 className="text-sm font-semibold text-foreground mb-2">Palettes</h2>
          <div className="flex flex-col gap-3">
            {getEyeshadowPalettesByEyeColour(eyeColour).filter((p) => { const lp = localPrice(p.priceUSD); return lp >= priceRange[0] && lp <= priceRange[1]; }).map((palette, i) => {
              const displayPrice = location ? `${location.currencySymbol}${convertPrice(palette.priceUSD, location.exchangeRate)}` : `$${palette.priceUSD}`;
              const retailers = getRetailerLinks(palette.brand, palette.product, `${palette.brand} ${palette.product}`, location?.region ?? "OTHER");
              return (
                <div key={`pal-${i}`} className="rounded-2xl bg-card backdrop-blur-md px-5 py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-1 flex-wrap gap-1.5">{palette.shades.map((s, si) => (<div key={si} title={s.name} className="w-7 h-7 rounded-full border border-foreground/10" style={{ backgroundColor: s.hex }} />))}</div>
                    <span className="text-sm font-semibold text-card-foreground whitespace-nowrap">{displayPrice}</span>
                  </div>
                  <div className="mt-3"><p className="text-sm font-semibold text-card-foreground">{palette.brand}</p><p className="text-xs text-muted-foreground break-words">{palette.product}</p></div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-foreground/5">
                    <a href={palette.brandUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"><ExternalLink className="h-3 w-3" /> Buy online</a>
                    {retailers.map((r) => (<a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"><Store className="h-3 w-3" /> {r.name}</a>))}
                  </div>
                </div>
              );
            })}
          </div>
          <h2 className="text-sm font-semibold text-foreground mt-6 mb-2">Single shades</h2>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filteredAndSorted.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">No products in this price range.</p>}
        {filteredAndSorted.map((shade, i) => {
          const displayPrice = location ? `${location.currencySymbol}${convertPrice(shade.priceUSD, location.exchangeRate)}` : `$${shade.priceUSD}`;
          const productQuery = `${shade.brand} ${shade.product} ${shade.shade}`;
          const retailers = getRetailerLinks(shade.brand, shade.product, productQuery, location?.region ?? "OTHER");
          const hearted = isAuthenticated && isFavourite(shade.brand, shade.product, shade.shade, category);
          return (
            <div key={i} className="rounded-2xl bg-card backdrop-blur-md px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-foreground/10 flex-shrink-0" style={{ backgroundColor: shade.hex }} />
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-card-foreground">{shade.brand}</p><p className="text-xs text-muted-foreground break-words">{shade.product} — {shade.shade}</p></div>
                <button onClick={() => { if (!isAuthenticated) return; toggleFavourite({ brand: shade.brand, product: shade.product, shade: shade.shade, hex: shade.hex, priceUSD: shade.priceUSD, brandUrl: shade.brandUrl, category }); }} className={`p-2 transition-colors ${!isAuthenticated ? "text-muted-foreground/30 cursor-default" : hearted ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`} title={!isAuthenticated ? "Sign up to save favourites" : hearted ? "Remove from favourites" : "Add to favourites"}>
                  <Heart className={`h-5 w-5 ${hearted ? "fill-current" : ""}`} />
                </button>
                <span className="text-sm font-semibold text-card-foreground">{displayPrice}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-foreground/5">
                <a href={shade.brandUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"><ExternalLink className="h-3 w-3" /> Buy online</a>
                {retailers.map((r) => (<a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"><Store className="h-3 w-3" /> {r.name}</a>))}
              </div>
            </div>
          );
        })}
      </div>

      {location && <p className="text-[10px] text-muted-foreground mt-6 text-center">Prices shown in {location.currency} based on your location ({location.country}). Actual prices may vary.</p>}
    </main>
  );
}
