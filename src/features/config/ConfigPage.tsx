import { useEffect, useState } from "react";
import { RefreshCw, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useConfigStore } from "./configStore";
import { cn } from "@/lib/utils";

export function ConfigPage() {
  const { ui, tests, reloadConfig, isLoading, error } = useConfigStore();
  
  const [uiJson, setUiJson] = useState("");
  const [testsJson, setTestsJson] = useState("");

  useEffect(() => {
    if (ui) setUiJson(JSON.stringify(ui, null, 2));
  }, [ui]);

  useEffect(() => {
    if (tests) setTestsJson(JSON.stringify(tests, null, 2));
  }, [tests]);

  const handleReload = async () => {
    await reloadConfig();
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
          <p className="text-muted-foreground">Načítání konfigurace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Editor konfigurace
        </h1>
        <p className="text-muted-foreground">
          Prohlédněte si konfiguraci výběru statistických testů (pouze pro čtení)
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
          Načíst konfiguraci
        </Button>
      </div>

      {error && (
        <Alert className="mb-6 border-destructive">
          <AlertDescription className="text-destructive">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="ui" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
          <TabsTrigger value="ui">Konfigurace rozhraní</TabsTrigger>
          <TabsTrigger value="tests">Konfigurace testů</TabsTrigger>
        </TabsList>

        <TabsContent value="ui">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Konfigurace rozhraní (ui.json)
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
                readOnly
                className="font-mono text-sm min-h-[400px]"
                placeholder="JSON konfigurace rozhraní (pouze pro čtení)"
                aria-label="UI configuration JSON viewer"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Konfigurace testů (tests.json)
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
                readOnly
                className="font-mono text-sm min-h-[400px]"
                placeholder="JSON konfigurace testů (pouze pro čtení)"
                aria-label="Tests configuration JSON viewer"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold text-sm mb-2">Nápověda ke konfiguraci</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Konfiguraci lze upravit pouze mimo aplikaci úpravou zdrojových souborů</li>
          <li>• Konfigurace rozhraní definuje kroky, popisky a možnosti</li>
          <li>• Konfigurace testů mapuje výběry na statistické testy</li>
          <li>• Použijte tlačítko "Načíst konfiguraci" pro obnovení ze serverových souborů</li>
          <li>• Stávající nastavení si můžete stáhnout pomocí ikonky stažení</li>
        </ul>
      </div>
    </div>
  );
}
