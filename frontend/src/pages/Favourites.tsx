import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Heart, ExternalLink } from "lucide-react";
import { useAuth, useFavourites } from "@/lib/mockAuth";

export default function Favourites() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { favourites, toggleFavourite } = useFavourites(user?.id);

  useEffect(() => {
    document.title = "Favourites — Stark Tint";
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 px-5 pb-10">
        <h1 className="font-display text-xl font-bold text-foreground mb-6">Favourites</h1>
        {favourites.length === 0 ? (
          <div className="flex flex-col items-center text-center pt-10">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"><Heart className="h-7 w-7 text-muted-foreground" /></div>
            <p className="text-sm text-muted-foreground mb-1">No favourites yet.</p>
            <p className="text-xs text-muted-foreground max-w-[240px]">Save shade matches from your results to find them here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {favourites.map((f, i) => (
              <div key={i} className="rounded-2xl bg-card backdrop-blur-md px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-foreground/10 flex-shrink-0" style={{ backgroundColor: f.hex ?? "#ccc" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-card-foreground">{f.brand}</p>
                    <p className="text-xs text-muted-foreground truncate">{f.product} — {f.shade}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{f.category}</p>
                  </div>
                  <button onClick={() => toggleFavourite(f)} className="p-2 text-destructive hover:text-destructive/70 transition-colors" aria-label="Remove favourite"><Heart className="h-5 w-5 fill-current" /></button>
                </div>
                {f.brandUrl && (
                  <div className="mt-3 pt-3 border-t border-foreground/5">
                    <a href={f.brandUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"><ExternalLink className="h-3 w-3" /> Buy online</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
