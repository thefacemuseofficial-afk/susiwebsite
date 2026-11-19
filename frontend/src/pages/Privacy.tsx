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
              <h3 className="font-semibold text-foreground">Collection and use</h3>
              <p>When you grant camera access or choose a photo and submit a scan, susi processes the selected image. You can scan a skin area; a full-face photo is not required. The image may nevertheless include your face. susi uses it to estimate complexion depth (Fitzpatrick type), undertone, a representative skin colour, face shape, eye colour, lighting quality, and a confidence score. These estimates help provide personalized makeup and skin-shade recommendations. We do not use face data for advertising, identity verification, facial recognition, user tracking, or creating a biometric identity template.</p>

              <h3 className="font-semibold text-foreground">Sharing and disclosure</h3>
              <p>The image is sent over HTTPS to the susi backend hosted by Render. The backend sends it to Google Gemini through the paid Gemini API for analysis and returns the resulting attributes to your device. We do not sell face data or opt in to using Gemini API data to improve Google’s models. Under Google’s Paid Services terms, prompts, images, and responses are not used to improve Google products. Google may log them for a limited period solely for abuse monitoring and required legal or regulatory disclosures.</p>

              <h3 className="font-semibold text-foreground">Storage, retention, and deletion</h3>
              <p>The selected image is stored on your device as part of the locally saved skin profile until you clear the app’s storage or remove the app. If you are signed in, the scan’s derived profile attributes (not the image) may also be saved to your account in MongoDB. The backend keeps up to two saved skin profiles per account; saving another profile can replace the oldest one. Product-comparison history is stored separately and contains product and comparison details, not your skin colour or undertone. The app displays up to six recent entries, which you can delete individually; the backend code does not configure automatic expiration for these records.</p>
              <p>You can delete account-saved profiles and individual comparison entries in the app. To remove the locally saved image and profile, clear the app’s storage or remove the app. The account-deletion page sends a request for manual review and processing; submitting it does not immediately delete your account or its data. Account deletion does not itself clear data stored locally on your device. Google’s processing and any limited operational retention of images are governed by the Gemini API terms and the settings that apply to the Google project used for the request.</p>
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
              <p>We keep account information while your account is active and as needed for security, legal obligations, and disputes. Data stored locally on your device remains there until you clear the app’s storage or remove the app. Gemini and other providers handle information according to their terms and applicable service settings.</p>
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
