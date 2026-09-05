// Skin profile types and localStorage persistence

export type FitzpatrickType = 1 | 2 | 3 | 4 | 5 | 6;
export type Undertone = "warm" | "cool" | "neutral";
export type EyeColourType = "brown" | "blue" | "green" | "hazel" | "grey";
export type FaceShape = "oval" | "round" | "square" | "heart" | "oblong" | "diamond";

export type LightingType =
  | "daylight"
  | "warm_indoor"
  | "cool_indoor"
  | "mixed"
  | "low_light"
  | "overexposed";

export interface SkinProfile {
  fitzpatrick: FitzpatrickType;
  undertone: Undertone;
  skinHex: string;
  label: string;
  eyeColour?: EyeColourType;
  selfieDataUrl?: string;
  timestamp: number;
  lighting?: LightingType;
  confidence?: number;
  lightingNotes?: string;
  faceShape?: FaceShape;
}

const STORAGE_KEY = "thebasemuse_skin_profile";

export function saveSkinProfile(profile: SkinProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // localStorage may be unavailable
  }
}

export function loadSkinProfile(): SkinProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SkinProfile;
  } catch {
    return null;
  }
}

export function clearSkinProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

// Fitzpatrick label mapping
export function getFitzpatrickLabel(type: FitzpatrickType): string {
  const labels: Record<FitzpatrickType, string> = {
    1: "Very Fair",
    2: "Fair",
    3: "Medium",
    4: "Olive",
    5: "Tan / Brown",
    6: "Dark / Deep",
  };
  return labels[type];
}

export function getFaceShapeLabel(shape: FaceShape): string {
  const labels: Record<FaceShape, string> = {
    oval: "Oval",
    round: "Round",
    square: "Square",
    heart: "Heart",
    oblong: "Oblong",
    diamond: "Diamond",
  };
  return labels[shape];
}

export function getFaceShapeDescription(shape: FaceShape): string {
  const desc: Record<FaceShape, string> = {
    oval: "Balanced proportions — forehead slightly wider than jaw.",
    round: "Soft curves — face width and length are similar.",
    square: "Strong jaw — forehead, cheeks and jaw a similar width.",
    heart: "Wider forehead tapering to a narrow, pointed chin.",
    oblong: "Longer than wide — forehead, cheeks and jaw a similar width.",
    diamond: "Narrow forehead and jaw with wider cheekbones.",
  };
  return desc[shape];
}

