import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/mockAuth";

export function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { refreshUser } = useAuth();
  const [state, setState] = useState<"checking" | "paid" | "pending" | "error">("checking");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Payment — chic shades club";
    if (!sessionId) { setState("error"); return; }
    let tries = 0;
    const poll = async () => {
      try {
        const res = await api.get(`/payments/status/${sessionId}`);
        if (res.data.payment_status === "paid") { setState("paid"); refreshUser(); return; }
      } catch { /* ignore */ }
      tries += 1;
      if (tries >= 6) { setState("pending"); return; }
      setTimeout(poll, 2000);
    };
    poll();
  }, [sessionId, refreshUser]);

  return (
    <div className="min-h-screen flex flex-col items-center px-6">
      <div className="pt-6 pb-2"><Logo /></div>
      <main className="flex-1 flex flex-col items-center justify-center text-center">
        {state === "checking" && (<><Loader2 className="h-10 w-10 animate-spin text-foreground/60 mb-4" /><p className="text-sm text-muted-foreground">Confirming your payment…</p></>)}
        {state === "paid" && (
          <>
            <CheckCircle2 className="h-14 w-14 text-emerald-600 mb-4" />
            <h1 className="font-display text-xl font-bold text-foreground mb-2">You're subscribed!</h1>
            <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">Thank you — all your shade matches are unlocked.</p>
            <Button onClick={() => navigate("/results")} className="rounded-full bg-primary text-primary-foreground px-8">View my matches</Button>
          </>
        )}
        {state === "pending" && (<><Loader2 className="h-10 w-10 text-foreground/60 mb-4" /><h1 className="font-display text-lg font-bold text-foreground mb-2">Payment processing</h1><p className="text-sm text-muted-foreground mb-6 max-w-[280px]">This can take a moment. Your matches will unlock shortly.</p><Link to="/results" className="text-sm text-foreground underline underline-offset-4">Back to results</Link></>)}
        {state === "error" && (<><XCircle className="h-12 w-12 text-destructive mb-4" /><p className="text-sm text-muted-foreground mb-6">Something went wrong confirming your payment.</p><Link to="/results" className="text-sm text-foreground underline underline-offset-4">Back to results</Link></>)}
      </main>
    </div>
  );
}

export function PaymentCancel() {
  return (
    <div className="min-h-screen flex flex-col items-center px-6">
      <div className="pt-6 pb-2"><Logo /></div>
      <main className="flex-1 flex flex-col items-center justify-center text-center">
        <XCircle className="h-12 w-12 text-foreground/40 mb-4" />
        <h1 className="font-display text-lg font-bold text-foreground mb-2">Checkout cancelled</h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">No charge was made. You can subscribe any time.</p>
        <Link to="/results" className="text-sm text-foreground underline underline-offset-4">Back to results</Link>
      </main>
    </div>
  );
}
