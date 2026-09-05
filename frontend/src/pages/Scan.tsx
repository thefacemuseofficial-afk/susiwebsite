import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, X, Star } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { analyzeSkinMock } from "@/lib/mockServices";
import { saveSkinProfile, type SkinProfile } from "@/lib/skinProfile";

const cuteLoadingMessages = [
  "Loading your matches now…",
  "Finding your perfect little shade lineup…",
  "Mixing up your match list…",
  "Getting your glow picks ready…",
];

const SPARKLES = [
  { top: "18%", left: "22%", size: 22, delay: "0s", dur: "1.8s" },
  { top: "12%", left: "60%", size: 14, delay: "0.4s", dur: "2.4s" },
  { top: "40%", left: "78%", size: 18, delay: "0.9s", dur: "2s" },
  { top: "68%", left: "70%", size: 12, delay: "0.2s", dur: "2.6s" },
  { top: "76%", left: "34%", size: 20, delay: "0.7s", dur: "1.9s" },
  { top: "50%", left: "12%", size: 16, delay: "1.1s", dur: "2.2s" },
  { top: "45%", left: "45%", size: 26, delay: "0.5s", dur: "2.1s" },
  { top: "28%", left: "40%", size: 10, delay: "1.3s", dur: "2.5s" },
  { top: "60%", left: "52%", size: 12, delay: "0.3s", dur: "2.3s" },
];

export default function Scan() {
  const navigate = useNavigate();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Scan Your Skin Tone — The Face Muse";
  }, []);

  useEffect(() => {
    if (!analyzing) { setLoadingMessageIndex(0); return; }
    const interval = window.setInterval(() => {
      setLoadingMessageIndex((c) => (c + 1) % cuteLoadingMessages.length);
    }, 1800);
    return () => window.clearInterval(interval);
  }, [analyzing]);

  const openCamera = () => { setError(null); cameraInputRef.current?.click(); };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!preview || !preview.startsWith("data:image/") || preview.length < 200) {
      setError("Photo didn't capture properly — please try again.");
      setPreview(null);
      return;
    }
    setAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeSkinMock(preview);
      const profile: SkinProfile = {
        fitzpatrick: data.fitzpatrick,
        undertone: data.undertone,
        skinHex: data.skinHex,
        label: data.label,
        eyeColour: data.eyeColour,
        selfieDataUrl: preview,
        timestamp: Date.now(),
        lighting: data.lighting,
        confidence: data.confidence,
        lightingNotes: data.lightingNotes,
        faceShape: data.faceShape,
      };
      saveSkinProfile(profile);
      navigate("/results");
    } catch {
      setError("Couldn't load your matches. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-center pt-6"><Logo /></div>
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
        <h1 className="font-display text-xl font-bold text-foreground mb-2">Scan Your Skin</h1>
        <p className="text-sm text-muted-foreground text-center mb-8 max-w-[300px]">
          Take a well-lit photo of your bare skin — your cheek, forehead, wrist or inner arm all work. No full face needed.
        </p>

        {!preview && !analyzing && (
          <>
            <button type="button" onClick={openCamera} className="w-52 h-52 rounded-full border-2 border-dashed border-foreground/20 flex flex-col items-center justify-center gap-3 text-foreground/50 hover:border-foreground/40 hover:text-foreground/70 transition-colors touch-manipulation">
              <Camera className="h-10 w-10" />
              <span className="text-base font-bold">Take a photo</span>
            </button>
            <p className="mt-4 text-[11px] text-muted-foreground text-center max-w-[280px]">
              Best results: face a window in daylight. Avoid direct flash, tungsten lamps, or overhead fluorescents.
            </p>
          </>
        )}

        {preview && !analyzing && (
          <div className="relative w-52 h-52 rounded-full overflow-hidden mb-2 border-2 border-foreground/10">
            <img src={preview} alt="Your skin" className="w-full h-full object-cover" />
            <button onClick={() => { setPreview(null); setError(null); if (cameraInputRef.current) cameraInputRef.current.value = ""; }} className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 text-foreground/70 hover:text-foreground" aria-label="Remove photo">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {analyzing && (
          <div className="relative w-52 h-52 rounded-full flex items-center justify-center mb-2 overflow-hidden">
            {SPARKLES.map((s, i) => (
              <Star key={i} className="absolute star-twinkle text-primary fill-primary" style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.dur }} />
            ))}
          </div>
        )}

        <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileSelect} />

        {error && <p className="mt-4 text-sm text-destructive text-center max-w-[280px]">{error}</p>}

        {preview && !analyzing && (
          <Button onClick={handleAnalyze} disabled={analyzing} className="mt-8 rounded-full bg-primary text-primary-foreground px-10 py-3 gap-2">
            <Upload className="h-4 w-4" /> Find My Matches
          </Button>
        )}

        {analyzing && <p className="mt-6 text-xs text-muted-foreground animate-pulse">{cuteLoadingMessages[loadingMessageIndex]}</p>}
      </main>
    </div>
  );
}
