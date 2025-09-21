import { useState } from "react";
import { Copy, Check, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WizardResult } from "@/lib/types";

interface InfoBubbleProps {
  result: WizardResult;
  className?: string;
}

export function InfoBubble({ result, className }: InfoBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `Statistical Test: ${result.test.name}
Rationale: ${result.rationale}
Assumptions: ${result.assumptions}${result.test.alt ? `\nAlternative: ${result.test.alt}` : ''}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card 
      className={cn("w-full max-w-2xl shadow-accent border-accent/20", className)}
      role="region"
      aria-labelledby="result-title"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle 
            id="result-title"
            className="text-xl font-bold text-accent flex items-center gap-2"
          >
            <Info className="h-5 w-5" aria-hidden="true" />
            Doporučený test
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0"
            aria-label="Copy test details to clipboard"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-primary mb-2">
            {result.test.name}
          </h3>
          {result.test.alt && (
            <Badge variant="secondary" className="mb-3">
              Alternativa: {result.test.alt}
            </Badge>
          )}
        </div>

        <div>
          <h4 className="font-medium text-foreground mb-2">Proč tento test?</h4>
          <p className="text-muted-foreground">{result.rationale}</p>
        </div>

        <div>
          <h4 className="font-medium text-foreground mb-2">Předpoklady</h4>
          <p className="text-muted-foreground leading-relaxed">
            {result.assumptions}
          </p>
        </div>

        {result.details && (
          <>
            <div>
              <h4 className="font-medium text-foreground mb-2">Popis testu</h4>
              <p className="text-muted-foreground leading-relaxed">
                {result.details.description}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-2">Hypotézy</h4>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground mb-1">Nulová hypotéza:</p>
                  <p className="text-muted-foreground">{result.details.nullHypothesis}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground mb-1">Alternativní hypotéza:</p>
                  <p className="text-muted-foreground">{result.details.alternativeHypothesis}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-2">Implementace v Pythonu</h4>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code className="text-foreground">{result.details.pythonCode}</code>
              </pre>
            </div>
          </>
        )}

        <div className="pt-2 border-t border-border">
          <h4 className="font-medium text-foreground mb-2">Vaše volby</h4>
          <div className="flex flex-wrap gap-2">
            {result.selections.samples && (
              <Badge variant="outline">
                Vzorky: {result.selections.samples.replace('_', ' ')}
              </Badge>
            )}
            {result.selections.measure && (
              <Badge variant="outline">
                Měření: {result.selections.measure}
              </Badge>
            )}
            {result.selections.normality && (
              <Badge variant="outline">
                Rozdělení: {result.selections.normality === 'yes' ? 'Normální' : 
                             result.selections.normality === 'no' ? 'Nenormální' : 
                             'Nejisté'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}