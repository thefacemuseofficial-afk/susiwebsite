import React from "react";
import { Link } from "react-router-dom";
import logoAsset from "@/assets/logo.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center ${className}`} aria-label="stark tint — home">
      <img
        src={logoAsset}
        alt="stark tint"
        className="h-12 w-auto select-none"
      />
    </Link>
  );
}
