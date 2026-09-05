import type { PlacementProduct } from "./facePlacement";

export interface GuideStep {
  id: string;
  title: string;
  /** One-line summary of the step. */
  summary: string;
  /** Ordered how-to instructions. */
  how: string[];
  /** Links this step to the interactive face map. */
  product?: PlacementProduct;
  optional?: boolean;
}

export const APPLICATION_STEPS: GuideStep[] = [
  {
    id: "prep",
    title: "Prep your skin",
    summary: "Clean, hydrated skin is what makes everything after this sit properly.",
    how: [
      "Cleanse and pat dry — never apply base over the day's oil.",
      "Moisturise and let it absorb for two to three minutes.",
      "Primer last: gripping primer where makeup slides, blurring primer over texture.",
    ],
  },
  {
    id: "colour-correct",
    title: "Colour correct",
    summary: "Only where you need it — a thin layer cancels discolouration before foundation.",
    optional: true,
    how: [
      "Green over redness around the nose and cheeks.",
      "Peach or orange over blue-purple under-eye circles.",
      "Press it in with a fingertip; don't rub it away.",
    ],
  },
  {
    id: "foundation",
    title: "Foundation",
    summary: "Build from the centre of the face outward, where you need the most coverage.",
    how: [
      "Dot foundation on the forehead, nose, chin and centre of each cheek.",
      "Blend outward with a damp sponge or buffing brush in small circles.",
      "Sheer it out toward the hairline, ears and jaw so there's no visible edge.",
      "Take the last of what's on the brush down onto the neck.",
    ],
  },
  {
    id: "concealer",
    title: "Concealer",
    summary: "Brightens the centre of the face and lifts the eye area.",
    product: "concealer",
    how: [
      "Draw an upside-down triangle under each eye, wider than the circle itself.",
      "Add a small amount between the brows, beside the nostrils and on the chin.",
      "Blend upward and outward with a damp sponge, then set immediately with a light powder.",
    ],
  },
  {
    id: "contour",
    title: "Contour",
    summary: "Cool-toned shadow where you want the face to recede.",
    product: "contour",
    how: [
      "Suck in your cheeks to find the hollow, then draw from the top of the ear toward the mouth — stop two fingers from the corner of the lips.",
      "Trace along the jaw and the sides of the forehead.",
      "Blend upward, never downward — downward strokes drag the face.",
      "Use a shade only one to two steps deeper than your skin, and cool-toned so it reads like shadow.",
    ],
  },
  {
    id: "bronzer",
    title: "Bronzer",
    summary: "Warmth, not shadow — this is where the sun would hit.",
    product: "bronzer",
    how: [
      "Sweep a loose '3' from the temple, in along the cheekbone, and out along the jaw.",
      "Tap the leftover product over the bridge of the nose and the chin.",
      "Take a light pass down the sides of the neck so the face and neck match.",
    ],
  },
  {
    id: "blush",
    title: "Blush",
    summary: "The step that brings the face back to life after contouring.",
    how: [
      "Smile to find the apples, then sweep up toward the temple.",
      "Placing it higher on the cheekbone lifts the face; lower and rounder reads softer and youthful.",
      "Two light layers always beat one heavy one.",
    ],
  },
  {
    id: "highlighter",
    title: "Highlighter",
    summary: "Light on the high points, in a thin line rather than a wide patch.",
    product: "highlighter",
    how: [
      "Tops of the cheekbones, just above where the blush ends.",
      "Brow bone, inner corner of the eye, bridge of the nose and cupid's bow.",
      "A whisper on the centre of the chin.",
      "Tap it in with a fingertip if it looks too glittery.",
    ],
  },
  {
    id: "set",
    title: "Set and finish",
    summary: "Locks everything in and takes away the powdery look.",
    how: [
      "Powder only where you get shiny — usually the T-zone and under the eyes.",
      "Leave the cheeks alone if you want a skin-like finish.",
      "Finish with setting spray, held an arm's length away, in an X and then a T motion.",
    ],
  },
];
