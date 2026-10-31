import React from "react";
import { Link } from "react-router-dom";
import { X, User, Sun, Palette, Eye, Heart, LogIn, LogOut, Droplets, ShoppingBag, Sparkles, Brush } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "@/lib/mockAuth";

const categoryItems = [
  { label: "Foundation", to: "/results/foundation" },
  { label: "Concealer", to: "/results/concealer" },
  { label: "Contour", to: "/results/contour" },
  { label: "Bronzer", to: "/results/bronzer" },
  { label: "Highlighter", to: "/results/highlighter" },
  { label: "Lips", to: "/results/lipstick" },
  { label: "Eyeshadow", to: "/results/eyeshadow" },
];

interface SlideMenuProps {
  open: boolean;
  onClose: () => void;
}

export function SlideMenu({ open, onClose }: SlideMenuProps) {
  const { isAuthenticated, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-foreground/25" onClick={onClose} aria-label="Close menu" />
      <aside
        className="absolute inset-y-0 left-0 z-10 flex h-[100dvh] max-h-[100dvh] w-[300px] max-w-[82vw] flex-col overflow-hidden bg-background text-foreground shadow-lg"
        aria-label="Navigation menu"
      >
        <div className="flex shrink-0 items-start justify-between px-6 pb-4 pt-5">
          <Logo />
          <button onClick={onClose} className="p-1 text-foreground/70 hover:text-foreground" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-6 pb-3">
          <div className="flex flex-col gap-0.5">
            {isAuthenticated && (
              <>
                <Link to="/profile" onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-accent transition-colors">
                  <User className="h-4 w-4" />
                  <span className="text-[13px] font-medium leading-tight">Profile</span>
                </Link>
                <Link to="/favourites" onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-accent transition-colors">
                  <Heart className="h-4 w-4" />
                  <span className="text-[13px] font-medium leading-tight">Favourites</span>
                </Link>
                <div className="h-px bg-foreground/10 my-1" />
              </>
            )}

            <Link to="/shopping" onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-accent transition-colors">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-[13px] font-medium leading-tight">Shopping Mode</span>
            </Link>
            <div className="h-px bg-foreground/10 my-1" />

            {categoryItems.map((item) => (
              <Link key={item.label} to={item.to} onClick={onClose} className="flex items-center rounded-lg px-3 py-2 text-foreground hover:bg-accent transition-colors">
                <span className="text-[13px] font-medium leading-tight">{item.label}</span>
              </Link>
            ))}

            <div className="h-px bg-foreground/10 my-1" />

            {isAuthenticated ? (
              <button onClick={handleLogout} className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-accent transition-colors">
                <LogOut className="h-4 w-4" />
                <span className="text-[13px] font-medium leading-tight">Log Out</span>
              </button>
            ) : (
              <Link to="/login" onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-accent transition-colors">
                <LogIn className="h-4 w-4" />
                <span className="text-[13px] font-medium leading-tight">Log In</span>
              </Link>
            )}
          </div>
        </nav>

        <div className="shrink-0 px-6 py-3 flex justify-center">
          <Logo />
        </div>
      </aside>
    </div>
  );
}
