import React from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/mockAuth";
import { startCheckout } from "@/lib/mockServices";

// Gentle banner shown while the user is on their free trial, more urgent as it nears its end.
export function TrialBanner() {
  const { user } = useAuth();
  if (!user || !user.on_trial) return null;
  const days = user.trial_days_left ?? 0;
  const urgent = days <= 3;

  return (
    <div className={`mx-4 mb-3 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 ${urgent ? "bg-destructive/10" : "bg-accent"}`}>
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className={`h-4 w-4 shrink-0 ${urgent ? "text-destructive" : "text-foreground/70"}`} />
        <p className="text-[12px] leading-tight text-foreground">
          {days <= 0
            ? "Your free trial ends today."
            : <>Free trial · <strong>{days} day{days === 1 ? "" : "s"} left</strong>{urgent ? " — subscribe to keep your matches." : "."}</>}
        </p>
      </div>
      <button
        onClick={() => startCheckout(user.user_id)}
        className="shrink-0 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold px-3.5 py-1.5"
      >
        Subscribe
      </button>
    </div>
  );
}
