import React from "react";
import { Link } from "react-router-dom";
import susiLogo from "@/assets/susi-logo.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center ${className}`} aria-label="SUSI — home">
      <img src={susiLogo} alt="SUSI" className="h-auto w-[120px] select-none" />
    </Link>
  );
}
