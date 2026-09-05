import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { User, Camera, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, useSubscription } from "@/lib/mockAuth";
import { loadSkinProfile, clearSkinProfile, getFitzpatrickLabel, type SkinProfile } from "@/lib/skinProfile";

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isSubscribed, subscribe } = useSubscription(user?.id);
  const [profile, setProfile] = useState<SkinProfile | null>(null);

  useEffect(() => {
    document.title = "Profile — The Face Muse";
    if (!isAuthenticated) { navigate("/login"); return; }
    setProfile(loadSkinProfile());
  }, [isAuthenticated, navigate]);

  const handleDelete = () => { clearSkinProfile(); setProfile(null); };
  const savedCount = profile ? 1 : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 px-5 pb-10">
        <h1 className="font-display text-xl font-bold text-foreground mb-2">Your Profile</h1>
        <p className="text-xs text-muted-foreground mb-1">{user?.name || user?.email}</p>
        <p className="text-xs text-muted-foreground mb-6">{isSubscribed ? `Pro subscriber · ${savedCount}/2 skin profiles saved` : "Free account · Subscribe to save skin profiles"}</p>

        {!isSubscribed && (
          <div className="rounded-2xl bg-card backdrop-blur-md p-5 mb-6 text-center">
            <p className="text-sm text-card-foreground mb-2">Subscribe to save up to 2 skin profiles.</p>
            <p className="text-lg font-bold text-card-foreground">$6<span className="text-sm font-normal text-muted-foreground">/month</span></p>
            <Button onClick={subscribe} className="mt-3 rounded-full bg-primary text-primary-foreground px-8">Subscribe Now</Button>
          </div>
        )}

        {!profile ? (
          <div className="flex flex-col items-center text-center pt-10">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4"><User className="h-8 w-8 text-muted-foreground" /></div>
            <p className="text-sm text-muted-foreground mb-2">No skin profiles saved.</p>
            <p className="text-xs text-muted-foreground mb-6 max-w-[240px]">Scan your skin to save your profile and get personalised matches.</p>
            <Link to="/scan"><Button className="rounded-full bg-primary text-primary-foreground px-8 gap-2"><Camera className="h-4 w-4" /> Start a Scan</Button></Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-card backdrop-blur-md p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-2 border-foreground/10" style={{ backgroundColor: profile.skinHex }} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-card-foreground">{profile.label}</p>
                  <p className="text-xs text-muted-foreground">{getFitzpatrickLabel(profile.fitzpatrick)} · {profile.undertone} undertone{profile.eyeColour && ` · ${profile.eyeColour} eyes`}</p>
                </div>
                <button onClick={handleDelete} className="p-2 text-muted-foreground hover:text-destructive transition-colors" aria-label="Delete profile"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <Link to="/scan" className="text-center"><Button variant="outline" className="rounded-full px-8 gap-2"><Camera className="h-4 w-4" /> Scan Another Profile</Button></Link>
          </div>
        )}
      </main>
    </div>
  );
}
