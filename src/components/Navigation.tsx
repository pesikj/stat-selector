import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="text-xl font-bold text-primary hover:text-primary-glow transition-colors"
          >
            Výběr statistického testu
          </Link>
          
          <div className="flex gap-2">
            <Button
              asChild
              variant={location.pathname === "/" ? "default" : "ghost"}
              size="sm"
            >
              <Link to="/">
                <Calculator className="h-4 w-4 mr-2" />
                Průvodce
              </Link>
            </Button>
            
            <Button
              asChild
              variant={location.pathname === "/config" ? "default" : "ghost"}
              size="sm"
            >
              <Link to="/config">
                <Settings className="h-4 w-4 mr-2" />
                Konfigurace
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}