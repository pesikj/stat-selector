import { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Navigation />
      <main className="py-8">
        {children}
      </main>
    </div>
  );
}