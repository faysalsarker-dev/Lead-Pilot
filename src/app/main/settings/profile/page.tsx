"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { UserModel } from "@/app/generated/prisma/models";
import {
  ArrowLeft,
  Bell,
  Bot,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  Flame,
  Loader2,
  Mail,
  Pencil,
  Save,
  ShieldCheck,
  Sparkles,
  Trophy,
  Upload,
  UserRound,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from "@/redux/hooks";

type ProfileValues = Pick<
  UserModel,
  "name" | "email" | "image" | "service" | "autoEnrich" | "defaultSendWindow" | "webPushEnabled"
> & {
  name: string;
  email: string;
  image: string;
  service: string;
  defaultSendWindow: string;
};

function getInitials(name?: string, email?: string) {
  const value = name?.trim() || email?.split("@")[0] || "User";
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value?: Date | string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatRelativeLogin(value?: Date | string | null) {
  if (!value) return "No login recorded yet";

  const lastLogin = new Date(value);
  const diffMs = Date.now() - lastLogin.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays <= 0) return "Logged in today";
  if (diffDays === 1) return "Logged in yesterday";
  return `Logged in ${diffDays} days ago`;
}

function getCompletenessScore(values: {
  name?: string | null;
  image?: string | null;
  service?: string | null;
  defaultSendWindow?: string | null;
  autoEnrich?: boolean | null;
}) {
  const checks = [
    Boolean(values.name),
    Boolean(values.image),
    Boolean(values.service),
    Boolean(values.defaultSendWindow),
    values.autoEnrich !== null && values.autoEnrich !== undefined,
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default function ProfileSettingsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { data: profileData, isLoading: isProfileLoading, isError: isProfileError } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isSavingProfile }] = useUpdateUserProfileMutation();
  const profile = profileData?.data;
  const isLoading = isProfileLoading;
  const isSaving = isSavingProfile;

  const form = useForm<ProfileValues>({
    defaultValues: {
      name: "",
      email: "",
      image: "",
      service: "",
      autoEnrich: true,
      defaultSendWindow: "09:00-11:00",
      webPushEnabled: false,
    },
  });

  const [image, name, email, autoEnrich, webPushEnabled] = useWatch({
    control: form.control,
    name: ["image", "name", "email", "autoEnrich", "webPushEnabled"],
  });

  useEffect(() => {
    if (!profile) return;

    form.reset({
      name: profile?.name || "",
      email: profile?.email || "",
      image: profile?.image || "",
      service: profile?.service || "",
      autoEnrich: profile?.autoEnrich ?? true,
      defaultSendWindow: profile?.defaultSendWindow ?? "09:00-11:00",
      webPushEnabled: profile?.webPushEnabled ?? false,
    });
  }, [form, profile]);

  async function handleImageUpload(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB");
      return;
    }

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        data?: { imageUrl?: string };
        error?: string;
      };

      if (!response.ok || !result.data?.imageUrl) {
        throw new Error(result.error || "Image upload failed");
      }

      form.setValue("image", result.data.imageUrl, { shouldDirty: true, shouldValidate: true });
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload that image");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function onSubmit(values: ProfileValues) {
    try {
      await updateProfile({
        name: values.name,
        image: values.image || null,
        service: values.service || null,
        autoEnrich: values.autoEnrich,
        defaultSendWindow: values.defaultSendWindow,
        webPushEnabled: values.webPushEnabled,
      }).unwrap();

      toast.success("Profile updated");
      setIsDialogOpen(false);
    } catch {
      toast.error("Failed to update profile");
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl space-y-6 p-6">
        <Skeleton className="h-56 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const status = profile?.status || (profile?.isActive === false ? "BLOCKED" : "ACTIVE");
  const currentStreak = profile?.currentStreak ?? 0;
  const longestStreak = profile?.longestStreak ?? 0;
  const defaultSendWindow = profile?.defaultSendWindow ?? "09:00-11:00";
  const completenessScore = getCompletenessScore({
    name: profile?.name,
    image: profile?.image,
    service: profile?.service,
    defaultSendWindow,
    autoEnrich: profile?.autoEnrich,
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="outline" className="w-fit gap-2">
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
            Settings
          </Link>
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-fit gap-2">
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>Update your avatar, identity, outreach defaults, and notification preferences.</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={image || undefined} alt={name || "User profile"} />
                    <AvatarFallback className="text-2xl">{getInitials(name, email)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <p className="font-medium">Profile image</p>
                      <p className="text-sm text-muted-foreground">Upload a JPG, PNG, or WebP image under 2 MB.</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleImageUpload(event.target.files?.[0])}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        disabled={isUploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {isUploadingImage ? "Uploading..." : "Upload Image"}
                      </Button>
                      {image && (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={isUploadingImage}
                          onClick={() => form.setValue("image", "", { shouldDirty: true, shouldValidate: true })}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" disabled className="bg-muted" {...field} />
                        </FormControl>
                        <FormDescription>Email changes are handled by authentication.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Positioning</FormLabel>
                        <FormControl>
                          <Input placeholder="AI lead generation for local businesses" {...field} />
                        </FormControl>
                        <FormDescription>Used by AI-assisted campaigns and replies.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultSendWindow"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Send Window</FormLabel>
                        <FormControl>
                          <Input placeholder="09:00-11:00" {...field} />
                        </FormControl>
                        <FormDescription>Use 24-hour local time.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="autoEnrich"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-4 rounded-lg border p-4">
                        <div className="space-y-1">
                          <FormLabel>Auto-Enrich Leads</FormLabel>
                          <FormDescription>Run AI enrichment when new leads are created.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="webPushEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-4 rounded-lg border p-4">
                        <div className="space-y-1">
                          <FormLabel>Web Push Notifications</FormLabel>
                          <FormDescription>Receive reply and campaign alerts in the browser.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>

            <DialogFooter>
              <Button type="submit" form="profile-form" disabled={isSaving || isUploadingImage} className="gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isProfileError && (
        <Alert variant="destructive">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Profile unavailable</AlertTitle>
          <AlertDescription>We could not load your user profile. Please sign in again or retry in a moment.</AlertDescription>
        </Alert>
      )}

      <section className="overflow-hidden rounded-xl border bg-background">
        <div className="bg-primary px-6 py-8 text-primary-foreground">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative w-fit">
                <Avatar className="h-28 w-28 border-4 border-primary-foreground/30">
                  <AvatarImage src={profile?.image || undefined} alt={profile?.name || "User profile"} />
                  <AvatarFallback className="bg-primary-foreground text-3xl text-primary">
                    {getInitials(profile?.name, profile?.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-2 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-background text-foreground shadow-sm">
                  <Camera className="h-4 w-4" />
                </span>
              </div>

              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{profile?.name || "Your Profile"}</h1>
                  <Badge variant={status === "ACTIVE" ? "secondary" : "destructive"}>{status.replaceAll("_", " ")}</Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-primary-foreground/85">
                  <span className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile?.email}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Joined {formatDate(profile?.createdAt)}
                  </span>
                </div>
                <p className="max-w-2xl text-sm text-primary-foreground/85">
                  {profile?.service || "Add your service positioning so campaigns and AI drafts sound more personal."}
                </p>
              </div>
            </div>

            <div className="grid min-w-64 grid-cols-2 gap-3 rounded-lg bg-primary-foreground/10 p-3">
              <div>
                <p className="text-sm text-primary-foreground/75">Current streak</p>
                <p className="text-3xl font-semibold">{currentStreak}</p>
              </div>
              <div>
                <p className="text-sm text-primary-foreground/75">Longest streak</p>
                <p className="text-3xl font-semibold">{longestStreak}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Login Streak</p>
              <p className="text-2xl font-semibold">{currentStreak} days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
              <p className="text-2xl font-semibold">{longestStreak} days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profile Strength</p>
              <p className="text-2xl font-semibold">{completenessScore}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Workspace Identity</CardTitle>
            <CardDescription>The details Lead Pilot uses across outreach, AI drafts, and notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <UserRound className="h-4 w-4" />
                  Name
                </div>
                <p className="font-medium">{profile?.name || "Not set"}</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Bot className="h-4 w-4" />
                  Service
                </div>
                <p className="font-medium">{profile?.service || "Not set"}</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  Send Window
                </div>
                <p className="font-medium">{defaultSendWindow}</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  Last Login
                </div>
                <p className="font-medium">{formatRelativeLogin(profile?.lastLoggedInAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Quick account state and automation controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Bot className="h-4 w-4" />
                Auto enrich
              </span>
              <Badge variant={autoEnrich ? "default" : "outline"}>{autoEnrich ? "On" : "Off"}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Bell className="h-4 w-4" />
                Web push
              </span>
              <Badge variant={webPushEnabled ? "default" : "outline"}>{webPushEnabled ? "On" : "Off"}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                Account
              </span>
              <Badge variant={status === "ACTIVE" ? "secondary" : "destructive"}>{status.replaceAll("_", " ")}</Badge>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Updated</p>
              <p className="font-medium">{formatDate(profile?.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
