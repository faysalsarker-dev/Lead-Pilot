"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Bot, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useGetUserSettingsQuery, useUpdateUserSettingsMutation } from "@/redux/hooks";

export default function AiSettingsPage() {
  const { data } = useGetUserSettingsQuery();
  const [updateSettings, { isLoading }] = useUpdateUserSettingsMutation();
  const settings = data?.data;
  const [autoEnrichOverride, setAutoEnrichOverride] = useState<boolean | null>(null);
  const [sendWindowOverride, setSendWindowOverride] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("Prioritize likely buyers, recent business activity, and clear personalization hooks.");
  const autoEnrich = autoEnrichOverride ?? settings?.autoEnrich ?? true;
  const defaultSendWindow = sendWindowOverride ?? settings?.defaultSendWindow ?? "09:00-17:00";

  async function handleSave() {
    try {
      await updateSettings({
        autoEnrich,
        defaultSendWindow,
      }).unwrap();
      toast.success("AI settings saved");
    setApiKey("");
    setAutoEnrichOverride(null);
    setSendWindowOverride(null);
    } catch {
      toast.error("Failed to save AI settings");
    }
  }

  return (
    <div className="w-full max-w-4xl p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Settings</h1>
          <p className="text-muted-foreground mt-2">Configure enrichment and writing preferences.</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/settings"><ArrowLeft className="h-4 w-4" />Settings</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Configuration
          </CardTitle>
          <CardDescription>These controls use the existing user settings endpoint and leave integration internals untouched.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <Label>Auto-Enrich Leads</Label>
              <p className="text-sm text-muted-foreground">Run enrichment automatically when leads enter the system.</p>
            </div>
            <Switch checked={autoEnrich} onCheckedChange={setAutoEnrichOverride} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="send-window">Default Send Window</Label>
            <Input id="send-window" value={defaultSendWindow} onChange={(event) => setSendWindowOverride(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">Gemini API Key</Label>
            <Input id="api-key" type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Stored when backend support is available" />
            <p className="text-xs text-muted-foreground">The page is ready for the AI settings API; the current project only exposes general user settings.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Enrichment Guidance</Label>
            <Textarea id="prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} className="min-h-28 resize-none" />
          </div>

          <Button onClick={handleSave} disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save AI Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
