import React, { useEffect, useMemo, useState } from "react";
import { detectFaceLandmarks, type LmPoint } from "@/lib/faceLandmarks";
import { PRODUCT_COLOURS, type PlacementProduct } from "@/lib/facePlacement";
import { Loader2 } from "lucide-react";

interface Spot { idx: number[]; rx: number; ry: number; along?: [number, number]; }
interface Zone { id: string; label: string; tip: string; spots: Spot[]; }

// Landmark-index recipes per product (MediaPipe FaceMesh 468). rx/ry are
// fractions of the measured face width; `along` rotates a streak to a direction.
const ZONES: Record<PlacementProduct, Zone[]> = {
  highlighter: [
    { id: "cheeks", label: "Tops of cheekbones", tip: "Sweep highlighter along the highest point of each cheekbone, up toward the temple.", spots: [{ idx: [117], rx: 0.15, ry: 0.11 }, { idx: [346], rx: 0.15, ry: 0.11 }] },
    { id: "nose", label: "Bridge of nose", tip: "A thin line down the centre of the nose bridge catches the light.", spots: [{ idx: [197, 5], rx: 0.16, ry: 0.05, along: [168, 4] }] },
    { id: "cupid", label: "Cupid's bow", tip: "A tiny dab on the cupid's bow lifts the lips.", spots: [{ idx: [0], rx: 0.06, ry: 0.045 }] },
    { id: "brow", label: "Brow bones", tip: "Just under the arch of each brow to open the eyes.", spots: [{ idx: [105], rx: 0.07, ry: 0.05 }, { idx: [334], rx: 0.07, ry: 0.05 }] },
    { id: "forehead", label: "Centre of forehead", tip: "A soft touch in the centre of the forehead.", spots: [{ idx: [151], rx: 0.10, ry: 0.08 }] },
  ],
  blush: [
    { id: "apples", label: "Apples of the cheeks", tip: "Smile and apply to the round apples, blending up toward the temple.", spots: [{ idx: [50], rx: 0.17, ry: 0.13 }, { idx: [280], rx: 0.17, ry: 0.13 }] },
  ],
  bronzer: [
    { id: "forehead", label: "Forehead & temples", tip: "Where the sun hits: hairline and temples.", spots: [{ idx: [10], rx: 0.16, ry: 0.09 }, { idx: [127], rx: 0.10, ry: 0.10 }, { idx: [356], rx: 0.10, ry: 0.10 }] },
    { id: "cheeks", label: "Under the cheekbones", tip: "A soft sweep under the cheekbones warms the face.", spots: [{ idx: [117], rx: 0.15, ry: 0.08, along: [117, 172] }, { idx: [346], rx: 0.15, ry: 0.08, along: [346, 397] }] },
    { id: "jaw", label: "Jawline", tip: "Lightly along the jaw to tie it together.", spots: [{ idx: [172], rx: 0.11, ry: 0.07 }, { idx: [397], rx: 0.11, ry: 0.07 }] },
  ],
  contour: [
    { id: "temples", label: "Temples", tip: "Deepen the temples to frame the face.", spots: [{ idx: [127], rx: 0.10, ry: 0.09 }, { idx: [356], rx: 0.10, ry: 0.09 }] },
    { id: "hollows", label: "Cheekbone hollows", tip: "Suck in your cheeks and draw along the hollow beneath the cheekbone.", spots: [{ idx: [117, 50], rx: 0.16, ry: 0.055, along: [117, 172] }, { idx: [346, 280], rx: 0.16, ry: 0.055, along: [346, 397] }] },
    { id: "nose", label: "Sides of the nose", tip: "Thin lines down each side of the nose to slim it.", spots: [{ idx: [51], rx: 0.13, ry: 0.03, along: [168, 4] }, { idx: [281], rx: 0.13, ry: 0.03, along: [168, 4] }] },
    { id: "jaw", label: "Jawline", tip: "Under the jaw to sharpen its edge.", spots: [{ idx: [172], rx: 0.11, ry: 0.06 }, { idx: [397], rx: 0.11, ry: 0.06 }] },
  ],
  concealer: [
    { id: "undereye", label: "Under-eyes", tip: "A triangle under each eye brightens and lifts.", spots: [{ idx: [119, 120], rx: 0.12, ry: 0.08 }, { idx: [348, 349], rx: 0.12, ry: 0.08 }] },
    { id: "forehead", label: "Centre of forehead", tip: "A little between the brows and centre forehead.", spots: [{ idx: [151], rx: 0.10, ry: 0.08 }] },
    { id: "chin", label: "Chin", tip: "A dab on the chin evens the tone.", spots: [{ idx: [152], rx: 0.09, ry: 0.07 }] },
    { id: "nose", label: "Base of the nose", tip: "Around the base of the nose to cancel redness.", spots: [{ idx: [51], rx: 0.055, ry: 0.05 }, { idx: [281], rx: 0.055, ry: 0.05 }] },
  ],
};

function avg(pts: LmPoint[], idx: number[]): LmPoint {
  const s = idx.reduce((a, i) => ({ x: a.x + (pts[i]?.x ?? 0), y: a.y + (pts[i]?.y ?? 0) }), { x: 0, y: 0 });
  return { x: s.x / idx.length, y: s.y / idx.length };
}

export function SelfiePlacement({ selfie, product }: { selfie: string; product: PlacementProduct }) {
  const [pts, setPts] = useState<LmPoint[] | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "fail">("loading");
  const zones = ZONES[product];
  const colours = PRODUCT_COLOURS[product];
  const [activeId, setActiveId] = useState<string>(zones[0]?.id ?? "");

  useEffect(() => { setActiveId(zones[0]?.id ?? ""); }, [product]); // eslint-disable-line

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    const img = new Image();
    img.onload = () => { if (alive) setDims({ w: img.naturalWidth, h: img.naturalHeight }); };
    img.src = selfie;
    detectFaceLandmarks(selfie).then((p) => {
      if (!alive) return;
      setPts(p);
      setStatus(p ? "ok" : "fail");
    });
    return () => { alive = false; };
  }, [selfie]);

  const W = dims?.w ?? 300;
  const H = dims?.h ?? 400;
  const faceW = useMemo(() => {
    if (!pts) return 0;
    const a = pts[234], b = pts[454];
    if (!a || !b) return 0.4;
    return Math.hypot((a.x - b.x) * W, (a.y - b.y) * H);
  }, [pts, W, H]);

  const active = zones.find((z) => z.id === activeId) ?? zones[0];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full max-w-[340px] overflow-hidden rounded-2xl bg-card">
        <img src={selfie} alt="Your selfie" className="block w-full h-auto" />
        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/40 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-foreground/70" />
            <span className="text-[11px] text-foreground/70">Mapping your face…</span>
          </div>
        )}
        {status === "ok" && pts && dims && (
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" style={{ mixBlendMode: "multiply" }}>
            <defs>
              <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation={Math.max(3, faceW * 0.02)} />
              </filter>
            </defs>
            {zones.map((zone) => {
              const isActive = zone.id === active?.id;
              return (
                <g key={zone.id} filter="url(#soft)" opacity={isActive ? 0.85 : 0.4}>
                  {zone.spots.map((sp, i) => {
                    const c = avg(pts, sp.idx);
                    const cx = c.x * W, cy = c.y * H;
                    let rot = 0;
                    if (sp.along) {
                      const p0 = pts[sp.along[0]], p1 = pts[sp.along[1]];
                      if (p0 && p1) rot = Math.atan2((p1.y - p0.y) * H, (p1.x - p0.x) * W) * 180 / Math.PI;
                    }
                    return (
                      <ellipse key={i} cx={cx} cy={cy} rx={sp.rx * faceW} ry={sp.ry * faceW}
                        fill={colours.fill} transform={`rotate(${rot} ${cx} ${cy})`} />
                    );
                  })}
                </g>
              );
            })}
            {zones.map((zone, i) => {
              const c = avg(pts, zone.spots[0].idx);
              return (
                <g key={`n-${zone.id}`} style={{ cursor: "pointer" }} onClick={() => setActiveId(zone.id)}>
                  <circle cx={c.x * W} cy={c.y * H} r={Math.max(9, faceW * 0.05)} fill="rgba(63,15,45,0.92)" stroke="#FFF4E8" strokeWidth={zone.id === active?.id ? 2.5 : 1.2} />
                  <text x={c.x * W} y={c.y * H + faceW * 0.018} textAnchor="middle" fontSize={Math.max(10, faceW * 0.05)} fontWeight={700} fill="#FFF4E8" style={{ pointerEvents: "none" }}>{i + 1}</text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {status === "fail" && (
        <p className="mt-3 text-[12px] text-muted-foreground text-center max-w-[300px]">
          We couldn't map a face in your selfie. Try a clear, front-facing, well-lit photo — or use the illustrated guide below.
        </p>
      )}

      {status === "ok" && active && (
        <div className="mt-4 w-full max-w-[340px] rounded-2xl bg-card px-4 py-3">
          <p className="text-xs font-semibold text-card-foreground">{zones.findIndex((z) => z.id === active.id) + 1}. {active.label}</p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{active.tip}</p>
        </div>
      )}

      {status === "ok" && (
        <ol className="mt-4 w-full max-w-[340px] flex flex-col gap-1.5">
          {zones.map((zone, i) => {
            const isActive = zone.id === active?.id;
            return (
              <li key={zone.id}>
                <button type="button" onClick={() => setActiveId(zone.id)}
                  className={`w-full text-left flex items-start gap-3 rounded-xl px-3 py-2 transition-colors ${isActive ? "bg-accent" : "hover:bg-accent/60"}`}>
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">{i + 1}</span>
                  <span className="text-[12px] leading-tight text-foreground">{zone.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
