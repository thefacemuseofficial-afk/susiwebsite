import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import faceLineArt from "@/assets/landing-face-illustration.png";

export default function TemporaryLanding() {
  useEffect(() => {
    document.title = "susi — Find your perfect shade";
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center px-5 pb-8 text-center text-foreground">
      <header className="flex w-full max-w-6xl justify-end py-5">
        <Link
          to="/feedback"
          className="text-sm font-semibold underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          Feedback
        </Link>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-2 pb-4">
        <h1 className="font-display text-[clamp(3rem,20vw,5rem)] font-bold leading-none text-[#4c082d]">susi</h1>
        <img
          src={faceLineArt}
          alt="Illustration of a face in line art"
          className="block h-auto w-[min(88vw,420px)]"
        />
      </main>
      <footer className="flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 py-4 text-xs text-foreground/70">
        <Link to="/feedback" className="underline underline-offset-4 hover:text-foreground">
          Feedback
        </Link>
        <Link to="/about" className="underline underline-offset-4 hover:text-foreground">
          About susi
        </Link>
        <Link to="/privacy" className="underline underline-offset-4 hover:text-foreground">
          Privacy
        </Link>
        <Link to="/terms-of-service" className="underline underline-offset-4 hover:text-foreground">
          Terms of Service
        </Link>
        <Link to="/delete-account" className="underline underline-offset-4 hover:text-foreground">
          Delete account
        </Link>
        <span>© {new Date().getFullYear()} susi</span>
      </footer>
    </div>
  );
}
