import React, { useEffect } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { FEEDBACK_EMAIL } from "@/lib/contact";

export default function Feedback() {
  useEffect(() => {
    document.title = "Feedback — chic shades club";
  }, []);

  return (
    <main className="flex min-h-screen flex-col px-6 text-foreground">
      <header className="mx-auto w-full max-w-5xl py-7">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to home
        </Link>
      </header>
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center pb-20">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-foreground/65">
          We’re listening
        </p>
        <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
          Tell us what you think.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/75">
          Your ideas help us make Chic Shades Club better. Send us a note and our team will read it.
        </p>
        <a
          href={`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent("Chic Shades Club feedback")}`}
          className="mt-9 inline-flex w-fit items-center gap-3 rounded-full bg-secondary px-7 py-3.5 text-sm font-semibold text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80"
        >
          <Mail size={17} aria-hidden="true" />
          Email your feedback
        </a>
        <p className="mt-4 text-sm text-foreground/65">{FEEDBACK_EMAIL}</p>
      </section>
    </main>
  );
}