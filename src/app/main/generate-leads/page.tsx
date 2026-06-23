"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Building2,
  CheckCircle2,
  Globe2,
  MapPin,
  Play,
  Search,
  Sparkles,
  Target,
} from "lucide-react";

const collectionSteps = [
  "Scanning markets",
  "Finding businesses",
  "Checking contact signals",
  "Preparing leads",
];

const sourceTypes = ["Google Maps", "Business directories", "Company websites", "Social profiles"];

export default function GenerateLeadsPage() {
  const [country, setCountry] = useState("united-states");
  const [category, setCategory] = useState("saas");
  const [leadCount, setLeadCount] = useState("100");

  return (
    <div className="w-full max-w-none space-y-6 p-6">
      <div className="grid min-h-[360px] grid-cols-1 overflow-hidden rounded-xl border bg-neutral-950 text-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-between gap-8 p-6 sm:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/80">
              <Sparkles className="h-4 w-4 text-amber-300" />
              AI lead discovery
            </div>
            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Generate Leads
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                Set a market, niche, and location. The agent will collect and organize
                prospect data from global business signals.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
              <p className="text-xs text-white/50">Coverage</p>
              <p className="mt-2 text-2xl font-semibold">Global</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
              <p className="text-xs text-white/50">Signals</p>
              <p className="mt-2 text-2xl font-semibold">4 sources</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
              <p className="text-xs text-white/50">Output</p>
              <p className="mt-2 text-2xl font-semibold">Leads</p>
            </div>
          </div>
        </div>

        <div className="relative min-h-[340px] overflow-hidden border-t border-white/10 bg-neutral-900 lg:border-l lg:border-t-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.24),rgba(255,255,255,0.06)_34%,transparent_62%)]" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-white/[0.04] shadow-[0_0_80px_rgba(255,255,255,0.16)] sm:h-80 sm:w-80">
            <div className="absolute inset-6 rounded-full border border-white/15" />
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/20" />
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />
            <div className="absolute left-1/2 top-0 h-full w-24 -translate-x-1/2 rounded-full border border-white/15" />
            <div className="absolute left-0 top-1/2 h-24 w-full -translate-y-1/2 rounded-full border border-white/15" />
          </div>
          <div className="absolute left-[18%] top-[24%] rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
            North America
          </div>
          <div className="absolute right-[14%] top-[42%] rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
            Europe
          </div>
          <div className="absolute bottom-[22%] left-[30%] rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
            Asia Pacific
          </div>
          <div className="absolute bottom-6 left-6 right-6 rounded-lg border border-white/10 bg-black/25 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-white text-neutral-950">
                <Globe2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Global collection map</p>
                <p className="text-xs text-white/60">Ready to scan selected markets</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" />
              Search Setup
            </CardTitle>
            <CardDescription>Choose the market and lead profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Country</label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="united-states">United States</SelectItem>
                  <SelectItem value="united-kingdom">United Kingdom</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                  <SelectItem value="australia">Australia</SelectItem>
                  <SelectItem value="bangladesh">Bangladesh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8" placeholder="New York, London, Toronto..." />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saas">SaaS Companies</SelectItem>
                  <SelectItem value="real-estate">Real Estate Agencies</SelectItem>
                  <SelectItem value="ecommerce">Ecommerce Brands</SelectItem>
                  <SelectItem value="clinics">Clinics & Healthcare</SelectItem>
                  <SelectItem value="restaurants">Restaurants</SelectItem>
                  <SelectItem value="agencies">Marketing Agencies</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Lead Count</label>
                <Select value={leadCount} onValueChange={setLeadCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 leads</SelectItem>
                    <SelectItem value="50">50 leads</SelectItem>
                    <SelectItem value="100">100 leads</SelectItem>
                    <SelectItem value="250">250 leads</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Keywords</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-8" placeholder="founder, owner, agency..." />
                </div>
              </div>
            </div>

            <Button className="w-full gap-2">
              <Play className="h-4 w-4" />
              Start Lead Generation
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="h-4 w-4" />
                Agent Workflow
              </CardTitle>
              <CardDescription>Collection stages for the selected market.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {collectionSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{step}</p>
                    <p className="text-xs text-muted-foreground">Queued</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Data Sources
              </CardTitle>
              <CardDescription>Where the agent will look for businesses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sourceTypes.map((source) => (
                <div key={source} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm font-medium">{source}</span>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                    Enabled
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Lead Preview</CardTitle>
              <CardDescription>Generated leads will appear here before saving.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {["Business name", "Decision maker", "Email / website"].map((label) => (
                  <div key={label} className="rounded-lg border border-dashed p-4">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Waiting for generation</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
