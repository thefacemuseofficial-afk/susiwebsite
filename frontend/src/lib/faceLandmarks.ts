import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

// Loads MediaPipe FaceLandmarker (WASM + model from CDN) once, and detects
// 468 face landmarks on a still selfie. Results are cached per image data URL.

export interface LmPoint { x: number; y: number }

let landmarkerPromise: Promise<FaceLandmarker> | null = null;
const cache = new Map<string, LmPoint[] | null>();

async function getLandmarker(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const fileset = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      return FaceLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "IMAGE",
        numFaces: 1,
      });
    })();
  }
  return landmarkerPromise;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function detectFaceLandmarks(dataUrl: string): Promise<LmPoint[] | null> {
  if (cache.has(dataUrl)) return cache.get(dataUrl)!;
  try {
    const [lm, img] = await Promise.all([getLandmarker(), loadImage(dataUrl)]);
    const res = lm.detect(img);
    const pts = res.faceLandmarks?.[0]?.map((p) => ({ x: p.x, y: p.y })) ?? null;
    cache.set(dataUrl, pts);
    return pts;
  } catch (e) {
    cache.set(dataUrl, null);
    return null;
  }
}
