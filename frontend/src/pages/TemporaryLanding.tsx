import React, { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import susiLogo from "@/assets/susi-logo.png";

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
      <main className="flex flex-1 flex-col items-center pb-4">
        <Sparkles className="mb-1 h-7 w-7" strokeWidth={1.6} aria-hidden="true" />
        <h1 className="relative h-[112px] w-[min(100%,520px)] overflow-hidden sm:h-[160px]">
          <img
            src={susiLogo}
            alt="SUSI"
            className="absolute left-1/2 top-1/2 w-[160%] max-w-none -translate-x-1/2 -translate-y-1/2"
          />
        </h1>
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.32em] sm:text-base">
          Find your perfect shade
        </p>
        <a
          href="https://play.google.com/store/apps/details?id=com.chicshadesclub.app"
          target="_blank"
          rel="noreferrer"
          aria-label="Open SUSI on Google Play"
          className="mt-4 block aspect-square w-[min(76vw,260px)] overflow-hidden rounded-[2rem] shadow-[0_18px_55px_rgba(102,15,51,0.14)]"
          style={{
            backgroundColor: "#f8eaf0",
            backgroundImage: "url('/feedback-poster.png')",
            backgroundPosition: "center 50%",
            backgroundRepeat: "no-repeat",
            backgroundSize: "192% auto",
          }}
        />
        <p className="mt-4 text-sm font-medium uppercase tracking-[0.24em] sm:text-base">
          Scan to download
        </p>
        <a
          href="https://play.google.com/store/apps/details?id=com.chicshadesclub.app"
          target="_blank"
          rel="noreferrer"
          aria-label="Get SUSI on Google Play"
          className="mt-2 block h-12 w-44 overflow-hidden rounded-md"
          style={{
            backgroundImage: "url('/feedback-poster.png')",
            backgroundPosition: "center 92%",
            backgroundRepeat: "no-repeat",
            backgroundSize: "360% auto",
          }}
        />
      </main>
      <footer className="flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 py-4 text-xs text-foreground/70">
        <Link to="/feedback" className="underline underline-offset-4 hover:text-foreground">
          Feedback
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