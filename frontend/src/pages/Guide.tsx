import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, FlaskConical, Clapperboard } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { FaceMap } from "@/components/FaceMap";
import { MixWalkthrough } from "@/components/MixWalkthrough";
import { APPLICATION_STEPS } from "@/lib/applicationGuide";
import { getMixRecipe, recipeLine, ratioLine, ratioLegend, scaleRecipe, formatMl, DROPS_PER_PUMP, type MixRecipe } from "@/lib/foundationMixing";
import { loadSkinProfile, getFaceShapeLabel, getFitzpatrickLabel, type FaceShape, type FitzpatrickType, type SkinProfile, type Undertone } from "@/lib/skinProfile";

const FITZ_OPTIONS: FitzpatrickType[] = [1, 2, 3, 4, 5, 6];
const UNDERTONES: Undertone[] = ["warm", "neutral", "cool"];
const FALLBACK_HEX: Record<FitzpatrickType, string> = { 1: "#F5E0D0", 2: "#EDCDB5", 3: "#DCB396", 4: "#C69375", 5: "#9C6A4B", 6: "#68412D" };

export default function Guide() {
  const [profile, setProfile] = useState<SkinProfile | null>(null);
  const [manualFitz, setManualFitz] = useState<FitzpatrickType>(3);
  const [manualUndertone, setManualUndertone] = useState<Undertone>("neutral");

  useEffect(() => {
    document.title = "Application Guide & Foundation Mixing — The Face Muse";
    setProfile(loadSkinProfile());
  }, []);

  const fitz = profile?.fitzpatrick ?? manualFitz;
  const undertone = profile?.undertone ?? manualUndertone;
  const targetHex = profile?.skinHex ?? FALLBACK_HEX[manualFitz];
  const shape: FaceShape = profile?.faceShape ?? "oval";

  const recipe = useMemo(() => getMixRecipe(targetHex, undertone, fitz), [targetHex, undertone, fitz]);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 px-5 pb-12 max-w-[640px] mx-auto w-full">
        <Link to="/results" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"><ArrowLeft className="h-4 w-4" /> Back</Link>
        <h1 className="font-display text-xl font-bold text-foreground mb-1">Application Guide</h1>
        <p className="text-xs text-muted-foreground mb-5">How to apply each product, in order — and how to mix your own foundation shade.</p>

        <div className="flex items-center gap-2 mb-3">
          <Clapperboard className="h-4 w-4 text-foreground/70" />
          <h2 className="font-display text-lg font-bold text-foreground">Watch: how to mix your shade</h2>
        </div>
        <MixWalkthrough recipe={recipe} personalised={!!profile} />

        <section className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-foreground/70" />
            <h2 className="font-display text-lg font-bold text-foreground">Step by step</h2>
          </div>
          <div className="rounded-2xl bg-card px-4 py-3 mb-4">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {profile?.faceShape ? (<>Sculpting steps below are tailored to your detected <strong className="text-card-foreground">{getFaceShapeLabel(shape)}</strong> face shape.</>) : (<><Link to="/scan" className="underline">Scan your face</Link> to tailor the sculpting steps to your face shape.</>)}
            </p>
          </div>
          <ol className="flex flex-col gap-4">
            {APPLICATION_STEPS.map((step, i) => (
              <li key={step.id} className="rounded-2xl bg-card px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-card-foreground">{step.title}{step.optional && <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Optional</span>}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{step.summary}</p>
                    <ul className="mt-2 list-disc pl-4 space-y-1">
                      {step.how.map((line) => (<li key={line} className="text-[12px] leading-relaxed text-foreground/85">{line}</li>))}
                    </ul>
                    {step.product && (
                      <div className="mt-3">
                        <FaceMap key={`${shape}-${step.product}`} faceShape={shape} product={step.product} />
                        <Link to={`/placement?product=${step.product}`} className="mt-3 inline-block text-[11px] text-foreground/60 underline underline-offset-4 hover:text-foreground/80">Open {step.title.toLowerCase()} in the Placement Guide</Link>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical className="h-4 w-4 text-foreground/70" />
            <h2 className="font-display text-lg font-bold text-foreground">Mix your own shade with L.A. Girl Pro</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">L.A. Girl PRO.coverage HD mixing pigments let you correct a base foundation to your exact tone. Below is a starting recipe based on {profile ? "your scan result" : "the depth and undertone you pick"} — mix, test, then adjust.</p>

          {!profile && (
            <div className="rounded-2xl bg-card px-4 py-4 mb-4">
              <p className="text-[11px] font-semibold text-card-foreground mb-2">Your depth</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {FITZ_OPTIONS.map((f) => (<button key={f} type="button" onClick={() => setManualFitz(f)} className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${f === manualFitz ? "border-foreground bg-foreground text-background" : "border-foreground/20 bg-background text-foreground hover:bg-muted"}`}>{getFitzpatrickLabel(f)}</button>))}
              </div>
              <p className="text-[11px] font-semibold text-card-foreground mb-2">Your undertone</p>
              <div className="flex flex-wrap gap-1.5">
                {UNDERTONES.map((u) => (<button key={u} type="button" onClick={() => setManualUndertone(u)} className={`rounded-full border px-3 py-1.5 text-[11px] font-medium capitalize transition-colors ${u === manualUndertone ? "border-foreground bg-foreground text-background" : "border-foreground/20 bg-background text-foreground hover:bg-muted"}`}>{u}</button>))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3"><Link to="/scan" className="underline">Scan your face</Link> for a recipe built from your real skin hex.</p>
            </div>
          )}

          <MixCard recipe={recipe} fitz={fitz} undertone={undertone} personalised={!!profile} />
        </section>
      </main>
    </div>
  );
}

function MixCard({ recipe, fitz, undertone, personalised }: { recipe: MixRecipe; fitz: FitzpatrickType; undertone: Undertone; personalised: boolean }) {
  const [batch, setBatch] = useState<1 | 5>(1);
  const scaled = useMemo(() => scaleRecipe(recipe, batch), [recipe, batch]);
  const legend = ratioLegend(recipe);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-card px-4 py-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{personalised ? "Your result" : "Selected tone"}</p>
        <p className="text-sm font-semibold text-card-foreground mt-0.5">{getFitzpatrickLabel(fitz)} · <span className="capitalize">{undertone}</span> undertone</p>
        <p className="text-[12px] text-foreground/80 mt-2 leading-relaxed">{recipe.summary}</p>
      </div>

      <div className="rounded-2xl bg-card px-4 py-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Start with</p>
        <div className="flex items-center gap-3">
          <span className="h-9 w-9 shrink-0 rounded-full border border-foreground/15" style={{ backgroundColor: recipe.baseHex }} />
          <p className="text-[12px] text-foreground/85 leading-snug">{recipe.baseBand} — pick the closest L.A. Girl PRO.coverage HD foundation shade to this depth.</p>
        </div>
      </div>

      <div className="rounded-2xl bg-card px-4 py-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Your ratio</p>
        <p className="font-display text-3xl font-bold tracking-tight text-card-foreground">{ratioLine(recipe)}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{legend.join(" : ")}</p>
        <p className="text-[11px] text-foreground/70 mt-2 leading-relaxed">Parts are dropper drops. Keep the ratio and you can mix any amount you like.</p>
      </div>

      <div className="rounded-2xl bg-card px-4 py-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">How much to mix</p>
          <div className="flex rounded-full border border-foreground/15 p-0.5">
            {([1, 5] as const).map((m) => (<button key={m} type="button" onClick={() => setBatch(m)} className={`rounded-full px-3 py-1 text-[10px] font-semibold transition-colors ${batch === m ? "bg-foreground text-background" : "text-foreground/70 hover:text-foreground"}`}>{m === 1 ? "One face" : "Full week"}</button>))}
          </div>
        </div>
        <p className="font-display text-base font-bold text-card-foreground mb-1">{recipeLine(recipe)}{batch > 1 && <span className="text-muted-foreground"> ×{batch}</span>}</p>
        <p className="text-[11px] text-muted-foreground mb-3">Total {scaled.totalDrops} drops · about {formatMl(scaled.totalMl)} of finished foundation{batch === 1 ? " — one full face." : " — roughly five faces' worth."}</p>
        <ul className="flex flex-col gap-2">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-foreground/15" style={{ backgroundColor: recipe.baseHex }} />
            <span className="text-[12px] leading-snug text-foreground/85"><strong className="text-card-foreground">{scaled.baseDrops} drops base</strong> <span className="text-muted-foreground">(~{formatMl(scaled.baseMl)}, about {Math.round((scaled.baseDrops / DROPS_PER_PUMP) * 10) / 10} pump{scaled.baseDrops / DROPS_PER_PUMP === 1 ? "" : "s"})</span> — your chosen foundation shade.</span>
          </li>
          {scaled.drops.map((d) => (
            <li key={d.pigment.name} className="flex items-start gap-3">
              <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-foreground/15" style={{ backgroundColor: d.pigment.hex }} />
              <span className="text-[12px] leading-snug text-foreground/85"><strong className="text-card-foreground">{d.drops} drop{d.drops > 1 ? "s" : ""} {d.pigment.name}</strong> <span className="text-muted-foreground">(~{formatMl(d.ml)})</span> — {d.why}</span>
            </li>
          ))}
          {scaled.drops.length === 0 && <li className="text-[12px] text-foreground/85">No pigment needed — the base band on its own should sit close to your tone.</li>}
        </ul>
        <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">One drop is roughly 0.05 ml. Don't try to split a drop — if you need less than one, touch the dropper tip to the mix and blend that trace amount in instead.</p>
      </div>

      <div className="rounded-2xl bg-card px-4 py-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3">Mixed result vs your skin</p>
        <div className="flex items-center gap-4">
          <Swatch label="Mixed" hex={recipe.mixedHex} />
          <Swatch label={personalised ? "Your skin" : "Target"} hex={recipe.targetHex} />
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">These are a guide on screen — always check the real mix on your jawline in daylight, and give it ten minutes to oxidise before deciding.</p>
      </div>

      <div className="rounded-2xl bg-card px-4 py-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">If it looks off</p>
        <ul className="flex flex-col gap-1.5">
          {recipe.adjustments.map((a) => (<li key={a.symptom} className="text-[12px] leading-snug text-foreground/85"><strong className="text-card-foreground">{a.symptom}:</strong> {a.fix}</li>))}
        </ul>
      </div>
    </div>
  );
}

function Swatch({ label, hex }: { label: string; hex: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="h-14 w-14 rounded-full border border-foreground/15" style={{ backgroundColor: hex }} />
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-[10px] font-mono text-foreground/60">{hex.toUpperCase()}</span>
    </div>
  );
}
