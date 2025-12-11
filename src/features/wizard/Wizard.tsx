import { useEffect } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stepper } from "@/components/Stepper";
import { SelectCard } from "@/components/SelectCard";
import { InfoBubble } from "@/components/InfoBubble";
import { useWizardStore } from "./wizardStore";
import { useConfigStore } from "../config/configStore";
import { cn } from "@/lib/utils";
import { Option } from "@/lib/types";

export function Wizard() {
  const {
    currentStep,
    selections,
    result,
    isComplete,
    setSelection,
    nextStep,
    prevStep,
    reset,
    canProceed,
    getTotalSteps,
    shouldSkipNormalityStep,
  } = useWizardStore();

  const { ui, loadConfig, isLoading, error } = useConfigStore();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Načítání konfigurace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadConfig} variant="outline">
            Zkusit znovu
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!ui) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Žádná konfigurace není načtena</p>
        </CardContent>
      </Card>
    );
  }

  const totalSteps = getTotalSteps();

  // Get the filtered steps based on whether we should skip normality
  const getFilteredSteps = () => {
    if (!ui) return [];
    if (shouldSkipNormalityStep()) {
      return ui.steps.filter(step => step.id !== 'normality');
    }
    return ui.steps;
  };

  const filteredSteps = getFilteredSteps();
  const currentStepData = filteredSteps[currentStep];

  // Get options for current step
  const getStepOptions = (): Option[] => {
    if (!currentStepData) return [];

    if (currentStepData.id === "measure" && currentStepData.optionsBySamples && selections.samples) {
      return currentStepData.optionsBySamples[selections.samples] || [];
    }

    return currentStepData.options || [];
  };

  const stepOptions = getStepOptions();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {ui.title}
        </h1>
        <p className="text-muted-foreground">
          Odpovězte na několik otázek a najděte správný statistický test pro vaše data
        </p>
      </div>

      {isComplete && result ? (
        <div className="space-y-6">
          <div className="text-center">
            <Button
              onClick={reset}
              variant="outline"
              className="mb-6"
              aria-label="Start over with new selections"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Začít znovu
            </Button>
          </div>
          <InfoBubble result={result} className="mx-auto" />
        </div>
      ) : (
        <div className="space-y-6">
          <Stepper
            currentStep={currentStep}
            totalSteps={totalSteps}
            className="max-w-md mx-auto"
          />

          {currentStep > 0 && Object.keys(selections).length > 0 && (
            <Card className="max-w-2xl mx-auto mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Vaše předchozí volby</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  {selections.samples && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Počet výběrů:</span>
                      <span className="font-medium">{
                        ui.steps.find(s => s.id === 'samples')?.options?.find(o => o.id === selections.samples)?.label || selections.samples
                      }</span>
                    </div>
                  )}
                  {selections.measure && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Co porovnávat:</span>
                      <span className="font-medium">{
                        (() => {
                          const measureStep = ui.steps.find(s => s.id === 'measure');
                          if (measureStep?.optionsBySamples && selections.samples) {
                            return measureStep.optionsBySamples[selections.samples]?.find(o => o.id === selections.measure)?.label || selections.measure;
                          }
                          return measureStep?.options?.find(o => o.id === selections.measure)?.label || selections.measure;
                        })()
                      }</span>
                    </div>
                  )}
                  {selections.normality && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Normalita dat:</span>
                      <span className="font-medium">{
                        ui.steps.find(s => s.id === 'normality')?.options?.find(o => o.id === selections.normality)?.label || selections.normality
                      }</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                {currentStepData?.label || "Unknown Step"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {stepOptions.length > 0 ? (
                <SelectCard
                  options={stepOptions}
                  selectedValue={
                    currentStepData?.id === "samples"
                      ? selections.samples
                      : currentStepData?.id === "measure"
                      ? selections.measure
                      : currentStepData?.id === "normality"
                      ? selections.normality
                      : undefined
                  }
                  onSelect={(value) => {
                    if (currentStepData) {
                      setSelection(
                        currentStepData.id as keyof typeof selections,
                        value
                      );
                    }
                  }}
                  ariaLabel={`Select ${currentStepData?.label?.toLowerCase()}`}
                />
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Pro tento krok nejsou k dispozici žádné možnosti
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between items-center max-w-2xl mx-auto">
            <Button
              onClick={prevStep}
              variant="outline"
              disabled={currentStep === 0}
              className={cn(
                "transition-all duration-200",
                currentStep === 0 && "invisible"
              )}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Předchozí
            </Button>

            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="ml-auto"
            >
              {currentStep === totalSteps - 1 ? "Získat výsledek" : "Další"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}