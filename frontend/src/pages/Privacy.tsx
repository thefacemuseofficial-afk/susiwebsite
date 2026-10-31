import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy — SUSI";
  }, []);

  return (
    <main className="min-h-screen px-5 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> SUSI
        </Link>

        <article className="mt-10 space-y-8">
          <header>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Privacy Policy</h1>
            <p className="mt-2 text-sm text-foreground/70">Last updated: October 31, 2026</p>
            <p className="mt-4 leading-7 text-foreground/80">
              This policy explains how SUSI handles information when you use our shade-matching service and website.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold">Information we handle</h2>
            <p className="leading-7 text-foreground/80">
              Depending on how you use SUSI, we may handle your account email, name, sign-in details, and profile image; skin-tone profile details you save; product favourites and scan history; and subscription or transaction status. Passwords for email accounts are stored as password hashes, not as plain text.
            </p>
            <p className="leading-7 text-foreground/80">
              If you request a skin analysis, the photo you submit is sent to our AI service provider to produce the result. Our application does not save that photo to your account. The provider may handle it under its own terms and policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold">How we use information</h2>
            <p className="leading-7 text-foreground/80">
              We use information to provide and secure accounts, perform shade analysis, save your preferences and scans, process subscriptions, respond to support requests, and operate and improve SUSI.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold">Service providers</h2>
            <p className="leading-7 text-foreground/80">
              We use Google for sign-in, OpenAI through our integration for requested image analysis, Stripe for payment processing, Resend for email delivery, PostHog for analytics, and MongoDB and Emergent for data storage and app infrastructure. Information is shared with these providers as needed to provide their services and is handled under their own privacy policies and terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold">Cookies and local storage</h2>
            <p className="leading-7 text-foreground/80">
              SUSI uses browser storage and session cookies to keep you signed in and support essential site functions. We use PostHog analytics to understand site usage.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold">Retention and your choices</h2>
            <p className="leading-7 text-foreground/80">
              We keep account information while your account is active and as needed to operate the service, meet legal obligations, and resolve disputes. You can request deletion of your account and associated app data at any time using our{" "}
              <Link to="/delete-account" className="underline underline-offset-4">account deletion page</Link>.
              Some records may need to be retained where required by law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold">Contact</h2>
            <p className="leading-7 text-foreground/80">
              For privacy questions or requests, email{" "}
              <a className="underline underline-offset-4" href="mailto:feedback@chicshades.club">feedback@chicshades.club</a>.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
