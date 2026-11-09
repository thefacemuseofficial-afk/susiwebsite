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
            <p className="mt-2 text-sm text-foreground/70">Last updated: November 2026</p>
          </header>

          <div className="space-y-7 leading-7 text-foreground/80">
            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">Information we collect</h2>
              <p>To create and manage user accounts, SUSI collects information such as email addresses and usernames. Depending on how you sign in, this may also include your name and Google profile image. Account passwords are stored as hashes, not plain text.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">Skin scans and saved profiles</h2>
              <p>When you request a skin analysis, the photo is sent to Google Gemini to estimate skin tone and related attributes, such as undertone, Fitzpatrick type, face shape, and lighting. The app saves the selected photo in local browser storage as part of your skin profile until you remove it or clear that storage. The analysis result may also be saved to your account if you are signed in; the original photo is not sent to our account database.</p>
              <p>Saved profiles, preferences, favourites, product scan history, and subscription status may be stored on your device or associated with your account, depending on the feature you use.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">Payments and analytics</h2>
              <p>In-app subscription purchases are processed through Apple App Store or Google Play. If a web checkout is offered, it is processed through Stripe. We do not collect or store card details; we may receive purchase and subscription status needed to provide the service.</p>
              <p>Analytics may be used to understand app performance and usage and to improve the user experience.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">Feedback and service providers</h2>
              <p>If you submit feedback or an account-deletion request, we receive the message and any contact details you provide. Website forms are processed by Netlify and can be sent to our feedback inbox. Other service providers may include Google for sign-in and Gemini analysis, MongoDB for account data, and Resend for app email delivery. Providers handle information under their own privacy terms.</p>
              <p>We do not sell personal information to third parties.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">Retention and deletion</h2>
              <p>We keep account information while your account is active and as needed for security, legal obligations, and disputes. Photos saved in local browser storage remain there until removed or the storage is cleared. Gemini and other providers handle information according to their terms and applicable service settings.</p>
              <p>
                Users may request deletion of their account and associated data through our{" "}
                <Link to="/delete-account" className="text-foreground underline underline-offset-4 hover:opacity-75">account deletion page</Link>.
                Requests are reviewed and processed by our team; submitting a request does not delete an account immediately. Some records may be retained where required by law.
              </p>
              <p>For privacy questions, contact <a className="text-foreground underline underline-offset-4 hover:opacity-75" href="mailto:feedback@susiofficial.com">feedback@susiofficial.com</a>.</p>
              <p>Read our <Link to="/terms-of-service" className="text-foreground underline underline-offset-4 hover:opacity-75">Terms of Service</Link>.</p>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
