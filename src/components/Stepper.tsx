import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function Stepper({ currentStep, totalSteps, className }: StepperProps) {
  return (
    <nav 
      aria-label="Progress" 
      className={cn("flex items-center justify-between mb-8", className)}
    >
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isLast = index === totalSteps - 1;

        return (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                {
                  "border-primary bg-primary text-primary-foreground shadow-elegant": isActive,
                  "border-success bg-success text-success-foreground": isCompleted,
                  "border-muted bg-background text-muted-foreground": !isActive && !isCompleted,
                }
              )}
              aria-current={isActive ? "step" : undefined}
            >
              {isCompleted ? (
                <Check className="h-5 w-5" aria-hidden="true" />
              ) : (
                <span className="text-sm font-medium">{stepNumber}</span>
              )}
            </div>
            
            {!isLast && (
              <div
                className={cn(
                  "ml-4 h-0.5 w-16 transition-colors duration-300 sm:w-20",
                  {
                    "bg-success": isCompleted,
                    "bg-primary": isActive && index > 0,
                    "bg-muted": !isCompleted && !(isActive && index > 0),
                  }
                )}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}