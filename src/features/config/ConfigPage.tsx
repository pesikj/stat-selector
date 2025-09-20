import { useState } from "react";
import { RefreshCw, Save, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useConfigStore } from "./configStore";
import { UIConfigSchema, TestsConfigSchema } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ConfigPage() {
  const { ui, tests, reloadConfig, updateUIConfig, updateTestsConfig, isLoading, error } = useConfigStore();
  
  const [uiJson, setUiJson] = useState("");
  const [testsJson, setTestsJson] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Initialize JSON strings when config loads
  useState(() => {
    if (ui) setUiJson(JSON.stringify(ui, null, 2));
    if (tests) setTestsJson(JSON.stringify(tests, null, 2));
  });

  const handleReload = async () => {
    try {
      await reloadConfig();
      if (ui) setUiJson(JSON.stringify(ui, null, 2));
      if (tests) setTestsJson(JSON.stringify(tests, null, 2));
      setValidationError(null);
      setSaveSuccess("Configuration reloaded successfully!");
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      setValidationError("Failed to reload configuration");
    }
  };

  const validateAndSaveUI = async () => {
    try {
      const parsed = JSON.parse(uiJson);
      const validated = UIConfigSchema.parse(parsed);
      await updateUIConfig(validated);
      setSaveSuccess("UI configuration saved successfully!");
      setValidationError(null);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setValidationError(`Invalid JSON: ${err.message}`);
      } else {
        setValidationError(`Validation error: ${err}`);
      }
    }
  };

  const validateAndSaveTests = async () => {
    try {
      const parsed = JSON.parse(testsJson);
      const validated = TestsConfigSchema.parse(parsed);
      await updateTestsConfig(validated);
      setSaveSuccess("Tests configuration saved successfully!");
      setValidationError(null);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setValidationError(`Invalid JSON: ${err.message}`);
      } else {
        setValidationError(`Validation error: ${err}`);
      }
    }
  };

  const downloadConfig = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uploadConfig = (callback: (content: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          callback(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Configuration Editor
        </h1>
        <p className="text-muted-foreground">
          Edit and manage the statistical test picker configuration
        </p>
      </div>

      <div className="mb-6 flex gap-4 justify-center">
        <Button
          onClick={handleReload}
          variant="outline"
          disabled={isLoading}
          className={cn(isLoading && "animate-pulse")}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Reload Config
        </Button>
      </div>

      {(error || validationError) && (
        <Alert className="mb-6 border-destructive">
          <AlertDescription className="text-destructive">
            {error || validationError}
          </AlertDescription>
        </Alert>
      )}

      {saveSuccess && (
        <Alert className="mb-6 border-success bg-success/10">
          <AlertDescription className="text-success">
            {saveSuccess}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="ui" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
          <TabsTrigger value="ui">UI Configuration</TabsTrigger>
          <TabsTrigger value="tests">Tests Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="ui">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                UI Configuration (ui.json)
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => uploadConfig(setUiJson)}
                    aria-label="Upload UI configuration file"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadConfig(uiJson, 'ui.json')}
                    aria-label="Download UI configuration file"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={uiJson}
                onChange={(e) => setUiJson(e.target.value)}
                className="font-mono text-sm min-h-[400px]"
                placeholder="Enter UI configuration JSON..."
                aria-label="UI configuration JSON editor"
              />
              <Button onClick={validateAndSaveUI} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Validate & Save UI Config
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Tests Configuration (tests.json)
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => uploadConfig(setTestsJson)}
                    aria-label="Upload tests configuration file"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadConfig(testsJson, 'tests.json')}
                    aria-label="Download tests configuration file"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={testsJson}
                onChange={(e) => setTestsJson(e.target.value)}
                className="font-mono text-sm min-h-[400px]"
                placeholder="Enter tests configuration JSON..."
                aria-label="Tests configuration JSON editor"
              />
              <Button onClick={validateAndSaveTests} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Validate & Save Tests Config
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold text-sm mb-2">Configuration Help</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Make sure JSON is valid before saving</li>
          <li>• UI config defines steps, labels, and options</li>
          <li>• Tests config maps selections to statistical tests</li>
          <li>• Use the "Reload Config" button to refresh from server files</li>
          <li>• Changes are validated using JSON schema</li>
        </ul>
      </div>
    </div>
  );
}