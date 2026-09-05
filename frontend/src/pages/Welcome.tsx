import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import faceLineArt from "@/assets/face-line-art.svg";

export default function Welcome() {
  useEffect(() => {
    document.title = "The Face Muse — Find Your Perfect Shade Match";
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center px-6 text-center">
      <div className="pt-6 pb-2">
        <Logo />
      </div>
      <main className="flex-1 flex flex-col items-center justify-center">
        <img src={faceLineArt} alt="" aria-hidden="true" className="w-40 h-auto mb-8 select-none pointer-events-none" />
        <h1 className="font-display text-xl font-bold text-foreground mb-4">Start Your Shade Matching Journey</h1>
        <p className="text-base leading-relaxed text-foreground/80 max-w-[280px] mb-12">
          Still playing the guessing game with your makeup shades? Let us match your perfect shade in seconds.
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center justify-center rounded-full bg-secondary px-10 py-3.5 text-sm font-semibold text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 mb-4"
        >
          Create a profile
        </Link>
        <Link to="/scan" className="text-sm text-foreground/60 underline underline-offset-4 hover:text-foreground/80 transition-colors">
          Skip for now
        </Link>
      </main>
    </div>
  );
}
