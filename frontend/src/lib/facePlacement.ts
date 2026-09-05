import type { FaceShape } from "./skinProfile";

export type PlacementProduct = "concealer" | "contour" | "bronzer" | "highlighter";

export interface PlacementZone {
  id: string;
  label: string;
  tip: string;
  /** SVG path d string, drawn on a 300 x 400 viewBox */
  path: string;
}

/**
 * Face silhouette outline, drawn on a 300 x 400 viewBox. Roughly an oval face
 * centred at (150, 200). Individual zones are drawn on top of this outline.
 */
export const FACE_OUTLINE_PATH =
  "M150 45 C 105 45 75 80 70 130 C 66 165 72 205 82 240 C 92 275 108 305 128 330 C 138 345 145 352 150 354 C 155 352 162 345 172 330 C 192 305 208 275 218 240 C 228 205 234 165 230 130 C 225 80 195 45 150 45 Z";


// Simple facial reference lines (eyes / lips / brows) drawn subtly under zones.
export const FACE_REFERENCE_PATHS: string[] = [
  // left brow
  "M95 145 Q 115 138 135 145",
  // right brow
  "M165 145 Q 185 138 205 145",
  // left eye
  "M100 165 Q 115 158 130 165 Q 115 172 100 165 Z",
  // right eye
  "M170 165 Q 185 158 200 165 Q 185 172 170 165 Z",
  // nose
  "M150 175 L 145 225 Q 150 232 155 225 Z",
  // upper lip
  "M125 265 Q 140 258 150 264 Q 160 258 175 265 Q 160 272 150 270 Q 140 272 125 265 Z",
  // lower lip
  "M125 268 Q 150 285 175 268 Q 150 278 125 268 Z",
];

// ---------------------------------------------------------------------------
// Concealer — mostly universal, tip copy varies slightly by shape.
// ---------------------------------------------------------------------------
function concealerZones(shape: FaceShape): PlacementZone[] {
  const chinTip =
    shape === "heart" || shape === "diamond"
      ? "Brighten the chin to visually widen the lower face."
      : shape === "oblong"
      ? "Keep the chin dab tiny — over-brightening lengthens the face."
      : "A tiny dab lifts the chin and balances the lower face.";

  const foreheadTip =
    shape === "oblong"
      ? "Skip or keep very light — a bright forehead makes the face look longer."
      : "Brighten between the brows to open up the face.";

  return [
    {
      id: "under-eye-left",
      label: "Under-eye triangle (left)",
      tip: "Draw an upside-down triangle from the inner corner down onto the top of the cheek, then blend upward.",
      path: "M100 180 L 138 180 L 118 210 Z",
    },
    {
      id: "under-eye-right",
      label: "Under-eye triangle (right)",
      tip: "Draw an upside-down triangle from the inner corner down onto the top of the cheek, then blend upward.",
      path: "M162 180 L 200 180 L 182 210 Z",
    },
    {
      id: "forehead-center",
      label: "Between the brows",
      tip: foreheadTip,
      path: "M140 120 L 160 120 L 160 138 L 140 138 Z",
    },
    {
      id: "nasolabial-left",
      label: "Around the nose (left)",
      tip: "A thin line beside the nostril softens redness and shadow.",
      path: "M130 240 Q 128 250 134 258 Q 138 250 136 240 Z",
    },
    {
      id: "nasolabial-right",
      label: "Around the nose (right)",
      tip: "A thin line beside the nostril softens redness and shadow.",
      path: "M170 240 Q 172 250 166 258 Q 162 250 164 240 Z",
    },
    {
      id: "chin-center",
      label: "Chin",
      tip: chinTip,
      path: "M138 305 Q 150 300 162 305 Q 158 320 150 322 Q 142 320 138 305 Z",
    },
  ];
}

// ---------------------------------------------------------------------------
// Contour — sculpting where shadows would fall. Varies by shape.
// ---------------------------------------------------------------------------
function contourZones(shape: FaceShape): PlacementZone[] {
  const zones: PlacementZone[] = [];

  // Cheek hollows — deeper for round & square, gentler for heart & diamond.
  const cheekTip: Record<FaceShape, string> = {
    oval: "Sweep from the top of the ear down toward the corner of the mouth.",
    round: "Carve a deeper diagonal from ear toward the mouth to add definition.",
    square: "Angle contour inward from the ear to soften the cheek and jaw.",
    heart: "Keep contour on the outer cheek only — don't drag toward the mouth.",
    oblong: "Contour horizontally under the cheekbones to break up the length.",
    diamond: "Soften the outer cheekbone — the widest point of your face.",
  };
  zones.push({
    id: "cheek-hollow-left",
    label: "Cheek hollow (left)",
    tip: cheekTip[shape],
    path:
      shape === "oblong"
        ? "M70 205 Q 100 215 125 210 Q 100 225 70 220 Z"
        : "M75 195 Q 100 235 120 245 Q 105 220 85 205 Z",
  });
  zones.push({
    id: "cheek-hollow-right",
    label: "Cheek hollow (right)",
    tip: cheekTip[shape],
    path:
      shape === "oblong"
        ? "M175 210 Q 200 215 230 205 Q 200 225 175 220 Z"
        : "M180 245 Q 200 235 225 195 Q 215 205 195 220 Z",
  });

  // Jawline — heart/diamond widen jaw sides, square/round soften corners.
  const jawTip: Record<FaceShape, string> = {
    oval: "Trace lightly along the jawline for definition.",
    round: "Blend along the outer jaw to sharpen a rounded face.",
    square: "Feather along the jaw corners to soften strong angles.",
    heart: "Contour the outer jaw sides — this narrows a wider forehead.",
    oblong: "Skip or keep faint — heavy jaw contour lengthens the face.",
    diamond: "Light contour along the jaw balances wider cheekbones.",
  };
  if (shape !== "oblong") {
    zones.push({
      id: "jaw-left",
      label: "Jawline (left)",
      tip: jawTip[shape],
      path: "M75 265 Q 90 300 120 330 Q 100 305 85 275 Z",
    });
    zones.push({
      id: "jaw-right",
      label: "Jawline (right)",
      tip: jawTip[shape],
      path: "M225 265 Q 210 300 180 330 Q 200 305 215 275 Z",
    });
  }

  // Forehead / hairline — oblong needs a top-of-forehead shadow to shorten.
  const foreheadTip: Record<FaceShape, string> = {
    oval: "A light sweep along the hairline adds subtle dimension.",
    round: "Contour along the temples to give length.",
    square: "Soften the forehead corners for a rounder shape.",
    heart: "Contour the sides of the forehead to narrow the top.",
    oblong: "Shade the top of the forehead to visually shorten the face.",
    diamond: "Contour the narrow forehead sparingly — mostly the temples.",
  };
  zones.push({
    id: "forehead-sides",
    label: shape === "oblong" ? "Top of forehead" : "Forehead sides",
    tip: foreheadTip[shape],
    path:
      shape === "oblong"
        ? "M100 55 Q 150 45 200 55 Q 150 80 100 55 Z"
        : "M80 90 Q 90 130 105 145 Q 95 120 85 95 Z M220 95 Q 210 120 195 145 Q 210 130 220 90 Z",
  });

  // Nose sides for lengthening / slimming.
  zones.push({
    id: "nose-sides",
    label: "Sides of nose",
    tip:
      shape === "round" || shape === "square"
        ? "Slim the nose with straight vertical lines from brow to tip."
        : "Optional — a light sweep down each side of the nose refines it.",
    path: "M138 155 L 141 220 L 138 225 L 135 225 Q 133 190 138 155 Z M162 155 Q 167 190 165 225 L 162 225 L 159 220 Z",
  });

  // Chin — oblong avoids, heart & diamond widen visually via base of chin.
  if (shape !== "oblong") {
    zones.push({
      id: "under-chin",
      label: "Under the chin",
      tip:
        shape === "round"
          ? "Blend under the jaw to sharpen the chin area."
          : "A soft shadow under the chin adds definition.",
      path: "M120 335 Q 150 355 180 335 Q 150 348 120 335 Z",
    });
  }

  return zones;
}

// ---------------------------------------------------------------------------
// Bronzer — warmth on high points of the face.
// ---------------------------------------------------------------------------
function bronzerZones(shape: FaceShape): PlacementZone[] {
  const zones: PlacementZone[] = [];

  // "3" sweep — forehead ↔ cheeks ↔ jaw. Oblong skips forehead; heart minimises jaw.
  if (shape !== "oblong") {
    zones.push({
      id: "bronze-forehead",
      label: "Forehead",
      tip:
        shape === "heart"
          ? "Concentrate on the temples — a wide forehead doesn't need extra warmth in the centre."
          : "Sweep across the top of the forehead where the sun hits.",
      path: "M85 85 Q 150 60 215 85 Q 150 105 85 85 Z",
    });
  }

  zones.push({
    id: "bronze-cheek-left",
    label: "Outer cheek (left)",
    tip: "Sweep bronzer along the cheekbone toward the temple.",
    path: "M70 210 Q 105 195 130 215 Q 100 225 70 220 Z",
  });
  zones.push({
    id: "bronze-cheek-right",
    label: "Outer cheek (right)",
    tip: "Sweep bronzer along the cheekbone toward the temple.",
    path: "M170 215 Q 195 195 230 210 Q 200 225 170 220 Z",
  });

  if (shape !== "heart") {
    zones.push({
      id: "bronze-jaw",
      label: "Jaw & neck",
      tip:
        shape === "oblong"
          ? "Extra warmth along the jaw and under the chin visually shortens the face."
          : "A whisper of bronzer along the jaw ties the face and neck together.",
      path: "M85 275 Q 150 330 215 275 Q 150 345 85 275 Z",
    });
  }

  zones.push({
    id: "bronze-nose",
    label: "Bridge of nose",
    tip: "A light dot on the bridge mimics sun exposure.",
    path: "M143 200 Q 150 195 157 200 Q 150 215 143 200 Z",
  });

  return zones;
}

// ---------------------------------------------------------------------------
// Highlighter — high points that catch light.
// ---------------------------------------------------------------------------
function highlighterZones(shape: FaceShape): PlacementZone[] {
  const zones: PlacementZone[] = [];

  const cheekTip: Record<FaceShape, string> = {
    oval: "Sweep along the tops of the cheekbones toward the temple.",
    round: "Keep highlight high and central to lift and lengthen.",
    square: "Highlight the very tops of the cheekbones to soften angles.",
    heart: "Highlight the cheekbones — this draws light down from the forehead.",
    oblong: "Highlight only the outer cheekbones — no central length.",
    diamond: "Sweep just the very top of the cheekbone, avoid the widest point.",
  };
  zones.push({
    id: "hl-cheek-left",
    label: "Cheekbone (left)",
    tip: cheekTip[shape],
    path: "M95 195 Q 115 188 135 198 Q 115 210 95 205 Z",
  });
  zones.push({
    id: "hl-cheek-right",
    label: "Cheekbone (right)",
    tip: cheekTip[shape],
    path: "M165 198 Q 185 188 205 195 Q 185 210 165 210 Z",
  });

  zones.push({
    id: "hl-brow-left",
    label: "Brow bone (left)",
    tip: "A dab under the arch of the brow lifts the eye.",
    path: "M105 140 Q 120 134 132 138 Q 120 144 105 143 Z",
  });
  zones.push({
    id: "hl-brow-right",
    label: "Brow bone (right)",
    tip: "A dab under the arch of the brow lifts the eye.",
    path: "M168 138 Q 180 134 195 140 Q 180 144 168 143 Z",
  });

  zones.push({
    id: "hl-nose-bridge",
    label: "Bridge of the nose",
    tip: "A thin line down the centre of the nose adds lift.",
    path: "M147 165 L 153 165 L 152 220 L 148 220 Z",
  });

  zones.push({
    id: "hl-cupids-bow",
    label: "Cupid's bow",
    tip: "A tiny dot above the top lip plumps the mouth.",
    path: "M144 258 Q 150 253 156 258 Q 150 262 144 258 Z",
  });

  if (shape !== "oblong") {
    zones.push({
      id: "hl-chin",
      label: "Centre of chin",
      tip:
        shape === "round" || shape === "square"
          ? "A small dot lengthens and lifts the chin."
          : "A whisper of highlight brightens the chin.",
      path: "M144 310 Q 150 306 156 310 Q 150 316 144 310 Z",
    });
  }

  if (shape === "heart" || shape === "diamond") {
    zones.push({
      id: "hl-forehead",
      label: "Centre of forehead",
      tip: "Brighten the centre — light draws attention to your best feature.",
      path: "M138 95 Q 150 88 162 95 Q 150 108 138 105 Z",
    });
  }

  return zones;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export function getPlacementZones(shape: FaceShape, product: PlacementProduct): PlacementZone[] {
  switch (product) {
    case "concealer":
      return concealerZones(shape);
    case "contour":
      return contourZones(shape);
    case "bronzer":
      return bronzerZones(shape);
    case "highlighter":
      return highlighterZones(shape);
  }
}

/** Semantic colour hint per product (tailwind-friendly hex, translucent fill). */
export const PRODUCT_COLOURS: Record<PlacementProduct, { fill: string; stroke: string }> = {
  concealer: { fill: "rgba(253, 246, 237, 0.85)", stroke: "rgba(63, 33, 63, 0.6)" }, // cream
  contour: { fill: "rgba(120, 75, 60, 0.55)", stroke: "rgba(63, 33, 63, 0.75)" }, // warm brown
  bronzer: { fill: "rgba(196, 130, 82, 0.55)", stroke: "rgba(63, 33, 63, 0.65)" }, // bronze
  highlighter: { fill: "rgba(255, 240, 200, 0.85)", stroke: "rgba(63, 33, 63, 0.55)" }, // gold/cream
};

export const PRODUCT_LABELS: Record<PlacementProduct, string> = {
  concealer: "Concealer",
  contour: "Contour",
  bronzer: "Bronzer",
  highlighter: "Highlighter",
};
