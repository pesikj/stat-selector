import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Option } from "@/lib/types";

interface SelectCardProps {
  options: Option[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  className?: string;
  ariaLabel?: string;
}

export function SelectCard({ 
  options, 
  selectedValue, 
  onSelect, 
  className,
  ariaLabel 
}: SelectCardProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <div 
          className="grid gap-3"
          role="radiogroup"
          aria-label={ariaLabel}
        >
          {options.map((option) => {
            const isSelected = selectedValue === option.id;
            
            return (
              <Button
                key={option.id}
                variant={isSelected ? "wizard-selected" : "wizard"}
                className="h-auto p-4 text-left justify-start"
                onClick={() => onSelect(option.id)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
              >
                <div className="flex items-center w-full">
                  <div
                    className={cn(
                      "mr-3 h-4 w-4 rounded-full border-2 transition-all duration-200",
                      {
                        "border-primary-foreground bg-primary-foreground": isSelected,
                        "border-muted-foreground": !isSelected,
                      }
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <div className="h-full w-full rounded-full bg-primary scale-75" />
                    )}
                  </div>
                  <span className="font-medium">{option.label}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}