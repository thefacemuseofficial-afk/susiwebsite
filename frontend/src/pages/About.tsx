import React, { useEffect } from "react";
import { ArrowLeft, ArrowUpRight, Check, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import susiFace from "@/assets/susi-face-line-art.png";

const playStoreUrl = "https://play.google.com/store/apps/details?id=com.susiapp.app";

export default function About() {
  useEffect(() => {
    document.title = "About susi — Makeup shade matching";
  }, []);

  return (
    <div className="min-h-screen text-foreground">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Link to="/" className="text-xl font-bold tracking-normal">
          susi
        </Link>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/75 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Home
        </Link>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 md:grid-cols-[1fr_0.85fr] md:gap-14 md:pb-24 md:pt-12">
          <div className="order-2 space-y-5 md:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/65">
              Makeup shade matching, made personal
            </p>
            <h1 className="text-5xl font-bold leading-none sm:text-6xl">susi</h1>
            <h2 className="max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
              Find your perfect makeup shades
            </h2>
            <p className="max-w-xl text-base leading-7 text-foreground/80">
              susi helps you discover makeup shades that match your skin tone with confidence.
            </p>
            <p className="max-w-xl text-base leading-7 text-foreground/80">
              Whether you're shopping online or trying a new brand, susi makes it easier to find foundation shades that suit you without the guesswork.
            </p>
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-foreground px-5 py-3 text-sm font-semibold transition-colors hover:bg-foreground hover:text-background"
            >
              Get susi on Google Play
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <div className="order-1 mx-auto w-full max-w-md md:order-2">
            <img
              src={susiFace}
              alt="Face portrait used for personalized skin tone analysis"
              className="mx-auto block h-auto w-full max-w-[340px]"
            />
          </div>
        </section>

        <section className="border-y border-foreground/15 bg-white/35">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:py-18">
            <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
            <ol className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-3">
              <li className="border-t border-foreground/30 pt-4">
                <p className="text-3xl font-semibold">01</p>
                <h3 className="mt-3 text-lg font-semibold">Upload a photo.</h3>
              </li>
              <li className="border-t border-foreground/30 pt-4">
                <p className="text-3xl font-semibold">02</p>
                <h3 className="mt-3 text-lg font-semibold">Receive personalized shade recommendations.</h3>
              </li>
              <li className="border-t border-foreground/30 pt-4">
                <p className="text-3xl font-semibold">03</p>
                <h3 className="mt-3 text-lg font-semibold">Explore matching products from popular beauty brands.</h3>
              </li>
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14 sm:py-18">
          <h2 className="text-3xl font-bold sm:text-4xl">Why susi?</h2>
          <ul className="mt-6 grid gap-x-12 sm:grid-cols-2">
            {[
              "Fast and easy shade matching",
              "Discover equivalent shades across brands",
              "Save time and reduce costly mismatches",
              "Personalized recommendations",
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 border-b border-foreground/15 py-4 text-base leading-6">
                <Check className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-foreground text-background">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:py-14">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background/70">More ways to match</p>
              <h2 className="mt-2 text-3xl font-bold">susi Pro</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-background/80">
                Unlock premium features with susi Pro, including enhanced matching tools and additional recommendations.
              </p>
            </div>
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-2 self-start border border-background/70 px-4 py-3 text-sm font-semibold transition-colors hover:bg-background hover:text-foreground sm:self-center"
            >
              Download susi
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 sm:py-16">
          <div>
            <h2 className="text-2xl font-bold">Download susi</h2>
            <p className="mt-3 text-sm leading-6 text-foreground/75">
              Available on the App Store and Google Play.
            </p>
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 hover:opacity-70"
            >
              Get it on Google Play
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Contact</h2>
            <p className="mt-3 text-sm leading-6 text-foreground/75">Questions or support requests?</p>
            <a
              href="mailto:support@susiofficial.com"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 hover:opacity-70"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              support@susiofficial.com
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-foreground/15">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 text-xs text-foreground/70">
          <span>© {new Date().getFullYear()} susi</span>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/feedback" className="underline underline-offset-4 hover:text-foreground">Feedback</Link>
            <Link to="/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy</Link>
            <Link to="/terms-of-service" className="underline underline-offset-4 hover:text-foreground">Terms of Service</Link>
            <Link to="/delete-account" className="underline underline-offset-4 hover:text-foreground">Delete account</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}