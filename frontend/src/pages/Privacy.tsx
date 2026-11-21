import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy — susi";
  }, []);

  return (
    <main className="min-h-screen px-5 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> susi
        </Link>

        <article className="mt-10 space-y-8">
          <header>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Privacy Policy</h1>
            <p className="mt-2 text-sm text-foreground/70">Last updated: November 2026</p>
          </header>

          <div className="space-y-7 leading-7 text-foreground/80">
            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">Information we collect</h2>
              <p>To create and manage user accounts, susi collects information such as email addresses and usernames. Depending on how you sign in, this may also include your name and Google profile image. Account passwords are stored as hashes, not plain text.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">Face data in the susi app</h2>
              <p>When you submit a skin scan, susi captures a photo using your device’s camera. We use it to estimate your skin colour, complexion depth, undertone, face shape, eye colour when visible, and lighting quality, to provide personalized makeup recommendations.</p>
              <p>The photo is sent securely through our backend hosted by Render to Google Gemini for analysis. Google handles the information under its terms and our project settings. We do not intentionally save scan photos in our backend database.</p>
              <p>After a successful analysis, the app deletes the original and resized local photo files before saving your results. If a scan is interrupted or deletion fails, temporary files may remain. Photos from earlier app versions may also remain on the device.</p>
              <p>Your current skin profile and up to two scan-history entries are stored on your device without a fixed expiry. Clearing scan history does not remove the current profile. If you are signed in and compare a product, your estimated skin colour and undertone are saved with the comparison in our MongoDB database. You can delete comparison entries individually.</p>
              <p>You can delete your account directly in the app, which removes associated backend records and clears profile and history records on that device. This does not explicitly delete photos left by earlier or interrupted scans. You may also submit a deletion request through our website’s <Link to="/delete-account" className="text-foreground underline underline-offset-4 hover:opacity-75">account-deletion page</Link>.</p>
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
              <p>We keep account information while your account is active and as needed for security, legal obligations, and disputes. Some records may be retained where required by law.</p>
              <p>For privacy questions, contact <a className="text-foreground underline underline-offset-4 hover:opacity-75" href="mailto:feedback@susiofficial.com">feedback@susiofficial.com</a>.</p>
              <p>Read our <Link to="/terms-of-service" className="text-foreground underline underline-offset-4 hover:opacity-75">Terms of Service</Link>.</p>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
