import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, RefreshCw } from "lucide-react";
import { loadSkinProfile, type SkinProfile } from "@/lib/skinProfile";

const categories = [
  { slug: "foundation", label: "Foundation", description: "Find your perfect base shade" },
  { slug: "concealer", label: "Concealer", description: "Match your under-eye and blemish concealer" },
  { slug: "contour", label: "Contour", description: "Sculpt and define with the right shade" },
  { slug: "bronzer", label: "Bronzer", description: "Get a sun-kissed glow that suits your skin" },
  { slug: "highlighter", label: "Highlighter", description: "Add luminosity with the perfect highlight" },
  { slug: "lipstick", label: "Lips", description: "Lipsticks and lip stains for your tone" },
  { slug: "eyeshadow", label: "Eyeshadow", description: "Find complementary eye shades" },
];

export default function ResultsIndex() {
  const [profile, setProfile] = useState<SkinProfile | null>(null);

  useEffect(() => {
    document.title = "Your Skin Analysis Results — chic shades club";
    setProfile(loadSkinProfile());
  }, []);

  const skinTone = profile?.label ?? "Not scanned yet";
  const undertone = profile?.undertone
    ? `${profile.undertone.charAt(0).toUpperCase() + profile.undertone.slice(1)} Undertone`
    : "—";
  const swatchColor = profile?.skinHex ?? "#CCBBAA";

  return (
    <main className="flex-1 px-5 pb-10">
      <div className="rounded-2xl bg-card backdrop-blur-md p-6 mb-8">
        <h2 className="font-display text-lg font-bold text-card-foreground text-center mb-4">YOUR COLOUR MATCH</h2>
        <div className="flex items-center justify-center mb-4">
          <div className="w-20 h-20 rounded-full border-2 border-foreground/10 shadow-sm" style={{ backgroundColor: swatchColor }} />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-base font-semibold text-card-foreground">{skinTone}</span>
          <span className="rounded-full bg-accent px-4 py-1 text-xs font-medium text-accent-foreground">{undertone}</span>
        </div>
        <div className="mt-4 text-center">
          {profile ? (
            <Link to="/scan" className="inline-flex items-center gap-1.5 text-xs font-medium text-butter-yellow hover:underline">
              <RefreshCw className="h-3 w-3" /> Re-scan
            </Link>
          ) : (
            <Link to="/scan" className="text-xs font-medium text-butter-yellow hover:underline">Scan your skin first →</Link>
          )}
        </div>
      </div>

      <h3 className="font-display text-base font-bold text-foreground mb-1">What would you like to match?</h3>
      <p className="text-xs text-muted-foreground mb-5">Choose a product category to see your shade recommendations.</p>

      <div className="flex flex-col gap-3">
        {categories.map((cat) => (
          <Link key={cat.slug} to={`/results/${cat.slug}`} className="flex items-center justify-between rounded-2xl bg-card backdrop-blur-md px-5 py-4 hover:bg-card/80 transition-colors">
            <div>
              <p className="text-sm font-semibold text-card-foreground">{cat.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </Link>
        ))}
      </div>
    </main>
  );
}
