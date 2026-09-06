import React from "react";
import { Link } from "react-router-dom";
import logoAsset from "@/assets/logo.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center ${className}`} aria-label="the face muse — home">
      <img
        src={logoAsset}
        alt="the face muse"
        className="h-12 w-auto select-none"
      />
    </Link>
  );
}
