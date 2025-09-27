import { useState } from "react";
import { Copy, Check, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { WizardResult, AlternativeOption } from "@/lib/types";

interface InfoBubbleProps {
  result: WizardResult;
  className?: string;
}

export function InfoBubble({ result, className }: InfoBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [selectedAlternative, setSelectedAlternative] = useState<AlternativeOption | null>(null);

  const handleCopy = async () => {
    const text = `Statistical Test: ${result.test.name}${result.test.alt ? `\nAlternative: ${result.test.alt}` : ''}`;

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


        {result.details && (
          <>
            <div>
              <h4 className="font-medium text-foreground mb-2">Popis testu</h4>
              <p className="text-muted-foreground leading-relaxed">
                {result.details.description}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">Hypotézy</h4>
                {result.details.alternatives && result.details.alternatives.length > 0 && (
                  <Select onValueChange={(value) => {
                    const alt = result.details.alternatives?.find(a => a.symbol === value);
                    setSelectedAlternative(alt || null);
                  }}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue placeholder="≠" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="≠">≠</SelectItem>
                      {result.details.alternatives.map((alt) => (
                        <SelectItem key={alt.symbol} value={alt.symbol}>
                          {alt.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground mb-1">Nulová hypotéza:</p>
                  <p className="text-muted-foreground">
                    {selectedAlternative ? selectedAlternative.nullHypothesis : result.details.nullHypothesis}
                  </p>
                  {result.details?.specificExamples && (
                    <p className="text-xs text-muted-foreground/80 mt-1 italic">
                      Příklad: {result.details.specificExamples.nullHypothesis}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground mb-1">Alternativní hypotéza:</p>
                  <p className="text-muted-foreground">
                    {selectedAlternative ? selectedAlternative.alternativeHypothesis : result.details.alternativeHypothesis}
                  </p>
                  {result.details?.specificExamples && (
                    <p className="text-xs text-muted-foreground/80 mt-1 italic">
                      Příklad: {result.details.specificExamples.alternativeHypothesis}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {result.details.examples && result.details.examples.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Příklady použití</h4>
                <div className="space-y-2">
                  {result.details.examples.map((example, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-foreground">{example}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-foreground mb-2">Implementace v Pythonu</h4>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code className="text-foreground">
                  {selectedAlternative ? selectedAlternative.pythonCode : result.details.pythonCode}
                </code>
              </pre>
            </div>
          </>
        )}

        <div className="pt-2 border-t border-border">
          <h4 className="font-medium text-foreground mb-2">Vaše volby</h4>
          <div className="flex flex-wrap gap-2">
            {result.selections.samples && (
              <Badge variant="outline">
                Výběry: {result.selections.samples === 'one' ? 'jeden' :
                  result.selections.samples === 'two' ? 'dva' :
                    "tři a více"}
              </Badge>
            )}
            {result.selections.measure && (
              <Badge variant="outline">
                Porovnává: {
                  result.selections.measure === 'mean' ? 'průměr' :
                    result.selections.measure === 'variance' ? 'rozptyl' :
                      result.selections.measure === 'normality' ? 'normalitu' :
                        result.selections.measure === 'means' ? 'průměry' :
                          result.selections.measure === 'variances' ? 'rozptyly' :
                            result.selections.measure === 'correlation' ? 'korelaci' :
                              result.selections.measure === 'distributions' ? 'rozdělení' :
                                ""
                }
              </Badge>
            )}
            {result.selections.normality && (
              <Badge variant="outline">
                Rozdělení: {result.selections.normality === 'yes' ? 'normální' :
                  result.selections.normality === 'no' ? 'není normální' :
                    'nevíme'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}