import React from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";

export default function ResultsLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <Outlet />
    </div>
  );
}
