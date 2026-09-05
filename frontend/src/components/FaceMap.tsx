import React, { useState } from "react";
import {
  PRODUCT_COLOURS,
  getPlacementZones,
  type PlacementProduct,
  type PlacementZone,
} from "@/lib/facePlacement";
import faceModel from "@/assets/face-model.png";
import type { FaceShape } from "@/lib/skinProfile";

export const ZONE_TRANSFORMS: Record<PlacementProduct, string> = {
  concealer: "translate(20 34) scale(0.9 0.8)",
  contour: "translate(20 34) scale(0.9 0.8)",
  bronzer: "translate(20 26) scale(0.9 0.9)",
  highlighter: "translate(20 22) scale(0.9 0.88)",
};

interface FaceMapProps {
  faceShape: FaceShape;
  product: PlacementProduct;
}

export function FaceMap({ faceShape, product }: FaceMapProps) {
  const zones = getPlacementZones(faceShape, product);
  const colours = PRODUCT_COLOURS[product];
  const [activeId, setActiveId] = useState<string | null>(zones[0]?.id ?? null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const focusId = hoverId ?? activeId;
  const active = zones.find((z) => z.id === focusId) ?? zones[0] ?? null;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full max-w-[320px] overflow-hidden rounded-2xl bg-card aspect-[3/4]">
        <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" role="img" aria-label={`Placement guide for ${product} on ${faceShape} face`}>
          <image href={faceModel} x={-56} y={-34} width={412} height={412} preserveAspectRatio="xMidYMid slice" />
          <g transform={ZONE_TRANSFORMS[product]}>
            {zones.map((zone, i) => {
              const isActive = zone.id === active?.id;
              return (
                <g key={zone.id}>
                  <path
                    d={zone.path}
                    fill={colours.fill}
                    stroke={colours.stroke}
                    strokeWidth={isActive ? 3 : 1.25}
                    opacity={isActive ? 0.95 : 0.65}
                    style={{ cursor: "pointer", transition: "opacity 150ms, stroke-width 150ms" }}
                    onClick={() => setActiveId(zone.id)}
                    onMouseEnter={() => setHoverId(zone.id)}
                    onMouseLeave={() => setHoverId((h) => (h === zone.id ? null : h))}
                  />
                  <ZoneNumber index={i + 1} zone={zone} active={isActive} onClick={() => setActiveId(zone.id)} onHover={setHoverId} />
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {active && (
        <div className="mt-4 w-full rounded-2xl bg-card px-4 py-3">
          <p className="text-xs font-semibold text-card-foreground">
            {zones.findIndex((z) => z.id === active.id) + 1}. {active.label}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{active.tip}</p>
        </div>
      )}

      <ol className="mt-4 w-full flex flex-col gap-1.5">
        {zones.map((zone, i) => {
          const isActive = zone.id === active?.id;
          return (
            <li key={zone.id}>
              <button
                type="button"
                onClick={() => setActiveId(zone.id)}
                onMouseEnter={() => setHoverId(zone.id)}
                onMouseLeave={() => setHoverId((h) => (h === zone.id ? null : h))}
                className={`w-full text-left flex items-start gap-3 rounded-xl px-3 py-2 transition-colors ${isActive ? "bg-accent" : "hover:bg-accent/60"}`}
              >
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                  {i + 1}
                </span>
                <span className="text-[12px] leading-tight text-foreground">{zone.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ZoneNumber({
  index,
  zone,
  active,
  onClick,
  onHover,
}: {
  index: number;
  zone: PlacementZone;
  active: boolean;
  onClick: () => void;
  onHover: (id: string | null) => void;
}) {
  const anchor = firstCoord(zone.path);
  if (!anchor) return null;
  const [x, y] = anchor;
  return (
    <g style={{ cursor: "pointer" }} onClick={onClick} onMouseEnter={() => onHover(zone.id)} onMouseLeave={() => onHover(null)}>
      <circle cx={x} cy={y} r={9} fill="rgba(63, 33, 63, 0.9)" stroke="rgba(253, 246, 237, 0.95)" strokeWidth={active ? 2 : 1} />
      <text x={x} y={y + 3} textAnchor="middle" fontSize={10} fontWeight={700} fill="rgba(253, 246, 237, 0.95)" style={{ pointerEvents: "none" }}>
        {index}
      </text>
    </g>
  );
}

function firstCoord(d: string): [number, number] | null {
  const m = /M\s*([-\d.]+)[ ,]+([-\d.]+)/.exec(d);
  if (!m) return null;
  return [parseFloat(m[1]), parseFloat(m[2])];
}
