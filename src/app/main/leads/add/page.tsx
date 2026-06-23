"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateLeadMutation } from "@/redux/hooks";

const emptyToUndefined = (value: FormDataEntryValue | null) => {
  const text = typeof value === "string" ? value.trim() : "";
  return text || undefined;
};

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "message" in error.data &&
    typeof error.data.message === "string"
  ) {
    return error.data.message;
  }

  return "Failed to create lead";
}

export default function AddLeadPage() {
  const router = useRouter();
  const [createLead, { isLoading }] = useCreateLeadMutation();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = emptyToUndefined(formData.get("name"));
    const businessName = emptyToUndefined(formData.get("businessName"));

    if (!name || !businessName) {
      toast.error("Name and business name are required");
      return;
    }

    try {
      const response = await createLead({
        name,
        businessName,
        email: emptyToUndefined(formData.get("email")),
        businessType: emptyToUndefined(formData.get("businessType")),
        website: emptyToUndefined(formData.get("website")),
        country: emptyToUndefined(formData.get("country")),
        timezone: emptyToUndefined(formData.get("timezone")),
        notes: emptyToUndefined(formData.get("notes")),
      }).unwrap();
      toast.success("Lead created");
      router.push(`/leads/${response.data.id}`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="w-full max-w-5xl p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Lead</h1>
          <p className="text-muted-foreground mt-2">Create a new prospect record for outreach.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/leads")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Leads
        </Button>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Lead Information</CardTitle>
          <CardDescription>Uses Prisma generated Lead fields without a duplicate validation schema.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">Name *<Input name="name" required minLength={2} placeholder="John Doe" /></label>
              <label className="space-y-2 text-sm font-medium">Email<Input name="email" type="email" placeholder="john@example.com" /></label>
              <label className="space-y-2 text-sm font-medium">Business Name *<Input name="businessName" required minLength={2} placeholder="Acme Corp" /></label>
              <label className="space-y-2 text-sm font-medium">Business Type<Input name="businessType" placeholder="SaaS, Agency, Restaurant" /></label>
              <label className="space-y-2 text-sm font-medium">Website<Input name="website" type="url" placeholder="https://example.com" /></label>
              <label className="space-y-2 text-sm font-medium">Country<Input name="country" placeholder="Bangladesh" /></label>
              <label className="space-y-2 text-sm font-medium">Timezone<Input name="timezone" placeholder="Asia/Dhaka" /></label>
            </div>
            <label className="space-y-2 text-sm font-medium">Notes<Textarea name="notes" className="min-h-28 resize-none" placeholder="Add internal notes about this lead..." /></label>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push("/leads")} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Create Lead
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
