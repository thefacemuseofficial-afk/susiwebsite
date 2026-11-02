import React, { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Check, LoaderCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";

export default function Feedback() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    document.title = "Feedback — chic shades club";
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("form-name", "feedback");
    const encodedData = new URLSearchParams();
    formData.forEach((value, key) => encodedData.append(key, value.toString()));

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodedData.toString(),
      });
      if (!response.ok) throw new Error("Feedback submission failed");
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

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
          Send us a note and our team will read it. Leave your email blank if you do not need a reply.
        </p>
        {status === "sent" ? (
          <div role="status" className="mt-8 flex items-center gap-3 border-l-2 border-primary pl-4 text-sm leading-6">
            <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
            Thank you. Your feedback has been submitted.
          </div>
        ) : (
          <form name="feedback" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={handleSubmit} className="mt-8 space-y-5">
            <input type="hidden" name="form-name" value="feedback" />
            <div className="hidden" aria-hidden="true">
              <label>Leave this field empty <input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
            </div>
            <div>
              <label htmlFor="feedback-name" className="mb-2 block text-sm font-semibold">Name <span className="font-normal text-foreground/60">(optional)</span></label>
              <input id="feedback-name" name="name" type="text" autoComplete="name" maxLength={100} className="w-full rounded-md border border-foreground/20 bg-background px-3 py-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label htmlFor="feedback-email" className="mb-2 block text-sm font-semibold">Email <span className="font-normal text-foreground/60">(optional)</span></label>
              <input id="feedback-email" name="email" type="email" autoComplete="email" maxLength={254} className="w-full rounded-md border border-foreground/20 bg-background px-3 py-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label htmlFor="feedback-subject" className="mb-2 block text-sm font-semibold">Subject <span className="font-normal text-foreground/60">(optional)</span></label>
              <input id="feedback-subject" name="subject" type="text" maxLength={150} className="w-full rounded-md border border-foreground/20 bg-background px-3 py-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label htmlFor="feedback-message" className="mb-2 block text-sm font-semibold">Message</label>
              <textarea id="feedback-message" name="message" required minLength={5} maxLength={5000} rows={6} className="w-full resize-y rounded-md border border-foreground/20 bg-background px-3 py-3 text-sm outline-none focus:border-primary" />
            </div>
            {status === "error" && <p role="alert" className="text-sm leading-6 text-destructive">We couldn’t submit your feedback. Please try again later.</p>}
            <button type="submit" disabled={status === "sending"} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {status === "sending" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
              {status === "sending" ? "Sending…" : "Send feedback"}
            </button>
            <p className="text-sm text-foreground/65">
              You can also email <a className="underline underline-offset-4" href="mailto:feedback@chicshades.club">feedback@chicshades.club</a>.
            </p>
          </form>
        )}
      </section>
    </main>
  );
}