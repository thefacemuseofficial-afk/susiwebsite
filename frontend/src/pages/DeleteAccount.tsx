import React, { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Trash2 } from "lucide-react";

const SUPPORT_EMAIL = "feedback@susiofficial.com";

export default function DeleteAccount() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    document.title = "Request Account Deletion — SUSI";
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("form-name", "account-deletion");
    const encodedData = new URLSearchParams();
    formData.forEach((value, key) => encodedData.append(key, value.toString()));

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodedData.toString(),
      });
      if (!response.ok) throw new Error("Deletion request submission failed");
      setStatus("sent");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Account deletion request")}&body=${encodeURIComponent(`Please delete the account and associated data for: ${email}`)}`;

  return (
    <main className="min-h-screen px-5 py-10 text-foreground">
      <div className="mx-auto max-w-lg">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> SUSI
        </Link>

        <section className="mt-10 max-w-md">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl font-bold">Request account deletion</h1>
          <p className="mt-3 text-sm leading-6 text-foreground/75">
            Enter the email address associated with your account. We will use it to locate your account and respond to your deletion request.
          </p>
          <p className="mt-3 text-sm leading-6 text-foreground/75">
            Our team will verify your request and delete your account and associated app data, including saved skin profiles, favourites, and scan history. Some records may be retained where required by law. Submitting this form sends a request; it does not delete your account immediately.
          </p>

          {status === "sent" ? (
            <div role="status" className="mt-7 border-l-2 border-primary pl-4 text-sm leading-6">
              Your request has been sent. We will follow up at the email address you provided.
            </div>
          ) : (
            <form name="account-deletion" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={handleSubmit} className="mt-7">
              <input type="hidden" name="form-name" value="account-deletion" />
              <div className="hidden" aria-hidden="true">
                <label>Leave this field empty <input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
              </div>
              <label htmlFor="account-email" className="mb-2 block text-sm font-semibold">Account email</label>
              <input
                id="account-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-md border border-foreground/20 bg-background px-3 py-3 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {status === "sending" ? "Sending request…" : "Send deletion request"}
              </button>
              {status === "error" && (
                <p role="alert" className="mt-4 text-sm leading-6 text-foreground/75">
                  We could not submit the form. You can still request deletion by emailing{" "}
                  <a className="underline underline-offset-4" href={mailto}>{SUPPORT_EMAIL}</a>.
                </p>
              )}
            </form>
          )}
        </section>
      </div>
    </main>
  );
}