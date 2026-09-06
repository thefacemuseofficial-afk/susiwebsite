import React, { useEffect, useRef, useState } from "react";
import { ScanLine, Loader2, X } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";

// Real camera barcode scanner using @zxing/browser. Falls back to a demo
// button when the camera is unavailable (e.g. blocked in an iframe).
export function BarcodeScanner({
  onDetected,
  disabled,
}: {
  onDetected: (barcode: string) => void;
  disabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<any>(null);
  const [active, setActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = () => {
    try { controlsRef.current?.stop(); } catch { /* ignore */ }
    controlsRef.current = null;
    setActive(false);
  };

  useEffect(() => () => stop(), []);

  const start = async () => {
    if (disabled) return;
    setError(null);
    setStarting(true);
    try {
      const reader = new BrowserMultiFormatReader();
      setActive(true);
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (result, _err, ctrl) => {
          controlsRef.current = ctrl;
          if (result) {
            const text = result.getText();
            try { ctrl.stop(); } catch { /* ignore */ }
            controlsRef.current = null;
            setActive(false);
            onDetected(text);
          }
        }
      );
      controlsRef.current = controls;
    } catch (e: any) {
      setActive(false);
      setError(
        e?.name === "NotAllowedError"
          ? "Camera access blocked — allow it in your browser, or use the demo button below."
          : "Couldn't open the camera. Use the demo button below."
      );
    } finally {
      setStarting(false);
    }
  };

  const useDemo = () => onDetected(String(3600530000000 + Math.floor(Math.random() * 999999)));

  if (active) {
    return (
      <div className="w-52 flex flex-col items-center gap-3">
        <div className="relative w-52 h-52 rounded-3xl overflow-hidden border-2 border-foreground/10 bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <span className="pointer-events-none absolute left-4 right-4 top-1/2 h-0.5 bg-destructive/80 animate-pulse" />
          <button onClick={stop} className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 text-foreground/70 hover:text-foreground" aria-label="Stop">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground text-center">Point at the barcode on the product</p>
      </div>
    );
  }

  return (
    <div className="w-52 flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={start}
        disabled={disabled || starting}
        className="relative w-52 h-52 rounded-3xl border-2 border-dashed border-foreground/20 flex flex-col items-center justify-center gap-3 text-foreground/50 hover:border-foreground/40 hover:text-foreground/70 transition-colors"
      >
        {starting ? <Loader2 className="h-8 w-8 animate-spin" /> : <ScanLine className="h-10 w-10" />}
        <span className="text-sm font-bold">Scan a barcode</span>
        <span className="text-[10px] text-foreground/40 max-w-[150px] text-center">Uses your camera</span>
      </button>
      {error && <p className="text-[11px] text-destructive text-center max-w-[220px]">{error}</p>}
      <button onClick={useDemo} className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground">
        Use a demo product instead
      </button>
    </div>
  );
}
