import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { User, Camera, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, useSubscription } from "@/lib/mockAuth";
import { api } from "@/lib/api";
import { startCheckout } from "@/lib/mockServices";
import { getFitzpatrickLabel } from "@/lib/skinProfile";

interface ProfileRow {
  profile_id: string;
  fitzpatrick: number;
  undertone: string;
  skinHex: string;
  label: string;
  eyeColour?: string | null;
  faceShape?: string | null;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isSubscribed, onTrial, trialDaysLeft } = useSubscription(user?.user_id);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Profile — chic shades club";
    if (!isLoading && !isAuthenticated) navigate("/login");
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    api.get("/profiles").then((r) => { setProfiles(r.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id: string) => {
    await api.delete(`/profiles/${id}`);
    setProfiles((prev) => prev.filter((p) => p.profile_id !== id));
  };

  const statusLine = isSubscribed
    ? (onTrial ? `Free trial · ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left · ${profiles.length}/2 profiles` : `Pro subscriber · ${profiles.length}/2 profiles`)
    : "Free account";

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 px-5 pb-10">
        <h1 className="font-display text-xl font-bold text-foreground mb-2">Your Profile</h1>
        <p className="text-xs text-muted-foreground mb-1">{user?.name || user?.email}</p>
        <p className="text-xs text-muted-foreground mb-6">{statusLine}</p>

        {!isSubscribed && (
          <div className="rounded-2xl bg-card backdrop-blur-md p-5 mb-6 text-center">
            <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground mb-2">First 14 days free</span>
            <p className="text-sm text-card-foreground mb-2">Start your free trial to save skin profiles &amp; unlock all shade matches.</p>
            <p className="text-lg font-bold text-card-foreground">$6<span className="text-sm font-normal text-muted-foreground">/month after</span></p>
            <Button onClick={() => startCheckout(user?.user_id)} className="mt-3 rounded-full bg-primary text-primary-foreground px-8">Subscribe Now</Button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-10">Loading…</p>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center text-center pt-10">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4"><User className="h-8 w-8 text-muted-foreground" /></div>
            <p className="text-sm text-muted-foreground mb-2">No skin profiles saved.</p>
            <p className="text-xs text-muted-foreground mb-6 max-w-[240px]">Scan your skin to save your profile and get personalised matches.</p>
            <Link to="/scan"><Button className="rounded-full bg-primary text-primary-foreground px-8 gap-2"><Camera className="h-4 w-4" /> Start a Scan</Button></Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {profiles.map((p) => (
              <div key={p.profile_id} className="rounded-2xl bg-card backdrop-blur-md p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-2 border-foreground/10" style={{ backgroundColor: p.skinHex }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-card-foreground">{p.label}</p>
                    <p className="text-xs text-muted-foreground capitalize">{getFitzpatrickLabel(p.fitzpatrick as any)} · {p.undertone} undertone{p.eyeColour ? ` · ${p.eyeColour} eyes` : ""}</p>
                  </div>
                  <button onClick={() => handleDelete(p.profile_id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors" aria-label="Delete profile"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            <Link to="/scan" className="text-center"><Button variant="outline" className="rounded-full px-8 gap-2"><Camera className="h-4 w-4" /> Scan Another Profile</Button></Link>
          </div>
        )}
      </main>
    </div>
  );
}
