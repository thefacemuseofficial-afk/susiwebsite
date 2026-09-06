import React from "react";
import { Link } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubscriptionGateProps {
  isAuthenticated: boolean;
  onStartTrial?: () => void;
  onSubscribeLater?: () => void;
}

export function SubscriptionGate({ isAuthenticated, onStartTrial, onSubscribeLater }: SubscriptionGateProps) {
  return (
    <div className="rounded-2xl bg-card backdrop-blur-md p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <Lock className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-display text-lg font-bold text-card-foreground mb-2">Unlock Shade Recommendations</h3>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground mb-3">
        <Sparkles className="h-3.5 w-3.5" /> First 14 days free
      </span>
      <p className="text-sm text-muted-foreground mb-1">
        Subscribe to The Face Muse Pro to view personalised product matches across all categories.
      </p>
      <p className="text-xl font-bold text-card-foreground mb-1">
        $6<span className="text-sm font-normal text-muted-foreground">/month</span>
      </p>
      <p className="text-[11px] text-muted-foreground mb-5">after your free trial · cancel anytime</p>

      {isAuthenticated ? (
        <div className="flex flex-col items-center gap-3">
          <Button onClick={onStartTrial} className="rounded-full bg-primary text-primary-foreground px-8">
            Start my 14-day free trial
          </Button>
          <button onClick={onSubscribeLater} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
            Subscribe later
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 items-center">
          <Link to="/signup">
            <Button className="rounded-full bg-primary text-primary-foreground px-8">Sign Up — 14 Days Free</Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            You must have an account to start your free trial.
          </p>
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground underline underline-offset-2">Log in</Link>
          </p>
        </div>
      )}
    </div>
  );
}
