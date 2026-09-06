import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Logo } from "./Logo";
import { SlideMenu } from "./SlideMenu";
import { TrialBanner } from "./TrialBanner";

export function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="grid grid-cols-[1fr_auto_1fr] items-center px-5 py-4">
        <button
          onClick={() => setMenuOpen(true)}
          className="p-1 text-foreground justify-self-start"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Logo />
        <div className="w-6 justify-self-end" />
      </header>
      <TrialBanner />
      <SlideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
