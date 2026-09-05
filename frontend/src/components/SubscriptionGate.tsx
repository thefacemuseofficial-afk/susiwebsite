import React from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubscriptionGateProps {
  isAuthenticated: boolean;
  onSubscribe?: () => void;
}

export function SubscriptionGate({ isAuthenticated, onSubscribe }: SubscriptionGateProps) {
  return (
    <div className="rounded-2xl bg-card backdrop-blur-md p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <Lock className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-display text-lg font-bold text-card-foreground mb-2">Unlock Shade Recommendations</h3>
      <p className="text-sm text-muted-foreground mb-1">
        Subscribe to The Face Muse Pro to view personalised product matches across all categories.
      </p>
      <p className="text-xl font-bold text-card-foreground mb-4">
        $6<span className="text-sm font-normal text-muted-foreground">/month</span>
      </p>
      {isAuthenticated ? (
        <Button onClick={onSubscribe} className="rounded-full bg-primary text-primary-foreground px-8">
          Subscribe Now
        </Button>
      ) : (
        <div className="flex flex-col gap-2 items-center">
          <Link to="/signup">
            <Button className="rounded-full bg-primary text-primary-foreground px-8">Sign Up to Subscribe</Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground underline underline-offset-2">Log in</Link>
          </p>
        </div>
      )}
    </div>
  );
}
