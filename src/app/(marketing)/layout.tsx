import { LandingPageNavbar } from "@/components/LandingPageNavbar";
import React from "react";

interface LandingPageLayoutProps {
  children: React.ReactNode;
}

export default function LandingPageLayout({
  children,
}: LandingPageLayoutProps) {
  return (
    <div className="flex w-full flex-col overflow-x-hidden">
      <LandingPageNavbar />
      {children}
    </div>
  );
}
