import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import landingImage from "@/assets/image.png";

export default function TemporaryLanding() {
  useEffect(() => {
    document.title = "SUSI — Find your perfect shade";
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
      <main className="flex flex-1 flex-col items-center justify-center pb-4">
        <a
          href="https://play.google.com/store/apps/details?id=com.susiapp.app"
          target="_blank"
          rel="noreferrer"
          aria-label="Download SUSI on Google Play"
          className="relative block w-[min(88vw,420px)]"
        >
          <img
            src={landingImage}
            alt="SUSI. Scan the QR code to download the app, or get it on Google Play."
            className="block h-auto w-full"
          />
          <span className="absolute inset-x-0 top-[32%] -translate-y-1/2 text-[10px] font-medium uppercase leading-none tracking-[0.18em] text-foreground sm:text-xs sm:tracking-[0.24em]">
            Find your perfect shade
          </span>
        </a>
      </main>
      <footer className="flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 py-4 text-xs text-foreground/70">
        <Link to="/feedback" className="underline underline-offset-4 hover:text-foreground">
          Feedback
        </Link>
        <Link to="/about" className="underline underline-offset-4 hover:text-foreground">
          About SUSI
        </Link>
        <Link to="/privacy" className="underline underline-offset-4 hover:text-foreground">
          Privacy
        </Link>
        <Link to="/delete-account" className="underline underline-offset-4 hover:text-foreground">
          Delete account
        </Link>
        <span>© {new Date().getFullYear()} SUSI</span>
      </footer>
    </div>
  );
}
