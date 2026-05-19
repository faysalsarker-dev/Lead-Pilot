"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useBulkCreateLeadsMutation } from "@/redux/hooks";
import type { CreateLeadRequest } from "@/redux/features/leads/leads.api";

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function parseLeads(csv: string): CreateLeadRequest[] {
  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const get = (key: string) => cells[headers.indexOf(key)] || "";

    return {
      name: get("name"),
      email: get("email"),
      businessName: get("businessname") || get("business_name") || get("company"),
      businessType: get("businesstype") || get("business_type") || get("industry"),
      website: get("website"),
      country: get("country"),
      timezone: get("timezone"),
      notes: get("notes"),
    };
  }).filter((lead) => lead.name && lead.email);
}

export default function ImportLeadsPage() {
  const router = useRouter();
  const [csv, setCsv] = useState("name,email,businessName,businessType,website,country,timezone,notes\n");
  const [bulkCreate, { isLoading }] = useBulkCreateLeadsMutation();
  const leads = useMemo(() => parseLeads(csv), [csv]);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setCsv(String(reader.result || ""));
    reader.readAsText(file);
  }

  async function handleImport() {
    if (leads.length === 0) {
      toast.error("Add at least one valid row with name and email");
      return;
    }

    try {
      const result = await bulkCreate({ leads }).unwrap();
      toast.success(`Imported ${result.data.created} leads`);
      router.push("/leads");
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : "Failed to import leads";
      toast.error(message);
    }
  }

  return (
    <div className="w-full max-w-6xl p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Leads</h1>
          <p className="text-muted-foreground mt-2">Upload or paste a CSV, preview the rows, then create leads in bulk.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/leads")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Leads
        </Button>
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertTitle>CSV columns</AlertTitle>
        <AlertDescription>
          Required columns are name and email. Optional columns: businessName, businessType, website, country, timezone, notes.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>CSV Input</CardTitle>
            <CardDescription>Choose a file or paste comma-separated rows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="file" accept=".csv,text/csv" onChange={handleFile} />
            <Textarea value={csv} onChange={(event) => setCsv(event.target.value)} className="min-h-[420px] font-mono text-sm" />
            <Button onClick={handleImport} disabled={isLoading || leads.length === 0} className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Import {leads.length} Lead{leads.length === 1 ? "" : "s"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>{leads.length} valid row{leads.length === 1 ? "" : "s"} detected</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[520px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.slice(0, 25).map((lead, index) => (
                  <TableRow key={`${lead.email}-${index}`}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                  </TableRow>
                ))}
                {leads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                      No valid rows yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
