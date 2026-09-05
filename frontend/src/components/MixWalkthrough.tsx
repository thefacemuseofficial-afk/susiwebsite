import React, { useEffect, useState } from "react";
import { Play, Pause } from "lucide-react";
import { ratioLine, ratioLegend, type MixRecipe } from "@/lib/foundationMixing";

// Simplified animated walkthrough (the original used a Remotion video).
// This steps through the mix chapters with animated swatches.
const CHAPTERS = [
  { title: "Start with your base", key: "base" },
  { title: "Correct the depth", key: "depth" },
  { title: "Balance the undertone", key: "undertone" },
  { title: "Blend & check", key: "blend" },
];

export function MixWalkthrough({ recipe, personalised }: { recipe: MixRecipe; personalised: boolean }) {
  const [playing, setPlaying] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => setStep((s) => (s + 1) % CHAPTERS.length), 2200);
    return () => window.clearInterval(t);
  }, [playing]);

  const swatches = [
    { hex: recipe.baseHex, label: "Base" },
    ...recipe.drops.map((d) => ({ hex: d.pigment.hex, label: d.pigment.name })),
    { hex: recipe.mixedHex, label: "Mixed" },
  ];

  return (
    <div className="rounded-2xl bg-card overflow-hidden mb-8">
      <div
        className="relative flex flex-col items-center justify-center gap-4 px-6 py-8"
        style={{ background: "linear-gradient(160deg, #c3caff 0%, #B8C0FF 60%, #aab3f5 100%)" }}
      >
        <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/60">
          {personalised ? "Your recipe" : "Example recipe"}
        </p>
        <p className="font-display text-2xl font-bold text-foreground text-center min-h-[2rem] transition-all">
          {CHAPTERS[step].title}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {swatches.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className="h-11 w-11 rounded-full border border-foreground/15 shadow-sm transition-transform duration-500"
                style={{
                  backgroundColor: s.hex,
                  transform: playing && i === step % swatches.length ? "scale(1.18)" : "scale(1)",
                }}
              />
              <span className="text-[9px] text-foreground/60">{s.label}</span>
            </div>
          ))}
        </div>

        <p className="font-display text-3xl font-bold tracking-tight text-foreground">{ratioLine(recipe)}</p>
        <p className="text-[11px] text-foreground/60">{ratioLegend(recipe).join(" : ")}</p>

        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "Pause" : "Play"}
        </button>
      </div>
      <div className="flex gap-1 px-4 py-3">
        {CHAPTERS.map((c, i) => (
          <button
            key={c.key}
            onClick={() => { setStep(i); setPlaying(false); }}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i === step ? "bg-foreground" : "bg-foreground/20"}`}
            aria-label={c.title}
          />
        ))}
      </div>
    </div>
  );
}
