import React from "react";
import { Link } from "react-router-dom";
import logoAsset from "@/assets/logo.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`relative inline-block h-[43px] w-[43px] overflow-hidden ${className}`}>
      <img
        src={logoAsset}
        alt="the face muse"
        className="absolute left-0 top-0 h-[60px] w-[60px] max-w-none select-none"
        style={{ transform: "translate(-15px, -13px)" }}
      />
    </Link>
  );
}
