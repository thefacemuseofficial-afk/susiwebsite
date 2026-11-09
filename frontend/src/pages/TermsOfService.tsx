import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfService() {
  useEffect(() => {
    document.title = "Terms of Service — susi";
  }, []);

  return (
    <main className="min-h-screen px-5 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> susi
        </Link>

        <article className="mt-10 space-y-8">
          <header>
            <h1 className="text-3xl font-bold sm:text-4xl">Terms of Service</h1>
            <p className="mt-2 text-sm text-foreground/70">Last Updated: November 2026</p>
          </header>

          <div className="space-y-7 leading-7 text-foreground/80">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Agreement to Terms</h2>
              <p>By downloading, accessing, or using susi, you agree to these Terms of Service.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">About susi</h2>
              <p>susi is a beauty technology service that provides makeup shade matching and cosmetic recommendations based on user-submitted information and images.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">No Guarantee of Results</h2>
              <p>While we strive to provide accurate recommendations, shade matching results are estimates only.</p>
              <p>Lighting conditions, camera settings, skin characteristics, product formulations, and other factors may affect recommendations. Users should use their own judgment before purchasing products.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">User Content</h2>
              <p>You may upload photos and other information for the purpose of receiving recommendations.</p>
              <p>You retain ownership of your content but grant susi permission to process it in order to provide app functionality.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Subscriptions</h2>
              <p>Certain features may require a paid subscription.</p>
              <p>Subscriptions automatically renew unless cancelled through your Apple App Store or Google Play account before the renewal date.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Acceptable Use</h2>
              <p>Users may not:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Use the service for unlawful purposes.</li>
                <li>Attempt to interfere with the operation of the service.</li>
                <li>Reverse engineer or exploit the application.</li>
                <li>Submit content that violates applicable laws.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Intellectual Property</h2>
              <p>All branding, software, designs, and content associated with susi remain the property of susi unless otherwise stated.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Disclaimer</h2>
              <p>susi provides cosmetic recommendations for informational purposes only and does not provide medical, dermatological, or professional beauty advice.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Limitation of Liability</h2>
              <p>To the fullest extent permitted by law, susi shall not be liable for losses or damages arising from the use of the service or reliance on recommendations provided by the service.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Changes to These Terms</h2>
              <p>We may update these Terms periodically. Continued use of the service after changes are posted constitutes acceptance of the revised Terms.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Contact Us</h2>
              <p>For questions regarding these Terms, contact:</p>
              <a className="text-foreground underline underline-offset-4 hover:opacity-75" href="mailto:support@susiofficial.com">
                support@susiofficial.com
              </a>
            </section>
          </div>
        </article>

        <footer className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-foreground/15 pt-5 text-xs text-foreground/70">
          <Link to="/about" className="underline underline-offset-4 hover:text-foreground">About susi</Link>
          <Link to="/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy</Link>
          <Link to="/delete-account" className="underline underline-offset-4 hover:text-foreground">Delete account</Link>
        </footer>
      </div>
    </main>
  );
}