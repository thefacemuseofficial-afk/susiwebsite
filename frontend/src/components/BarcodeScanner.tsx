import React, { useState } from "react";
import { ScanLine, Loader2 } from "lucide-react";

// MOCK barcode scanner. Real camera barcode scanning (@zxing) is unreliable in
// the preview iframe, so this simulates a scan and returns a demo barcode.
export function BarcodeScanner({
  onDetected,
  disabled,
}: {
  onDetected: (barcode: string) => void;
  disabled?: boolean;
}) {
  const [scanning, setScanning] = useState(false);

  const simulate = () => {
    if (disabled || scanning) return;
    setScanning(true);
    window.setTimeout(() => {
      setScanning(false);
      onDetected(String(3600530000000 + Math.floor(Math.random() * 999999)));
    }, 1100);
  };

  return (
    <button
      type="button"
      onClick={simulate}
      disabled={disabled}
      className="relative w-52 h-52 rounded-3xl border-2 border-dashed border-foreground/20 flex flex-col items-center justify-center gap-3 text-foreground/50 hover:border-foreground/40 hover:text-foreground/70 transition-colors overflow-hidden"
    >
      {scanning ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-xs">Scanning…</span>
        </>
      ) : (
        <>
          <ScanLine className="h-10 w-10" />
          <span className="text-sm font-bold">Scan a demo product</span>
          <span className="text-[10px] text-foreground/40 max-w-[150px] text-center">Tap to simulate a barcode scan</span>
        </>
      )}
      {scanning && (
        <span className="pointer-events-none absolute left-4 right-4 h-0.5 bg-destructive/70 animate-pulse" style={{ top: "50%" }} />
      )}
    </button>
  );
}
