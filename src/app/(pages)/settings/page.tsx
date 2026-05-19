"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useGetUserProfileQuery, useUpdateUserSettingsMutation } from "@/redux/hooks";

export default function SettingsPage() {
  const { data: userData, isLoading, error } = useGetUserProfileQuery({});
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserSettingsMutation();

  // Form state
  const [formData, setFormData] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    timezone: userData?.timezone || "UTC",
    autoEnrich: userData?.autoEnrich ?? true,
    notificationEmails: userData?.notificationEmails ?? true,
    sendWindowStart: userData?.sendWindowStart || "09:00",
    sendWindowEnd: userData?.sendWindowEnd || "17:00",
    defaultMailboxId: userData?.defaultMailboxId || "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Update local form when data loads
  if (userData && formData.name === "") {
    setFormData({
      name: userData.name,
      email: userData.email,
      timezone: userData.timezone || "UTC",
      autoEnrich: userData.autoEnrich ?? true,
      notificationEmails: userData.notificationEmails ?? true,
      sendWindowStart: userData.sendWindowStart || "09:00",
      sendWindowEnd: userData.sendWindowEnd || "17:00",
      defaultMailboxId: userData.defaultMailboxId || "",
    });
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSuccessMessage("");
  };

  const handleSaveProfile = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await updateUser({
        name: formData.name,
        timezone: formData.timezone,
      }).unwrap();
      setSuccessMessage("Profile updated successfully!");
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to update profile");
    }
  };

  const handleSavePreferences = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await updateUser({
        autoEnrich: formData.autoEnrich,
        notificationEmails: formData.notificationEmails,
        sendWindowStart: formData.sendWindowStart,
        sendWindowEnd: formData.sendWindowEnd,
        defaultMailboxId: formData.defaultMailboxId,
      }).unwrap();
      setSuccessMessage("Preferences updated successfully!");
    } catch (err: any) {
      setErrorMessage(err.data?.message || "Failed to update preferences");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your profile and preferences</p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.toString()}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={isUpdating}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed. Contact support to update.</p>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={formData.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                    <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                    <SelectItem value="CST">CST (Central Standard Time)</SelectItem>
                    <SelectItem value="MST">MST (Mountain Standard Time)</SelectItem>
                    <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                    <SelectItem value="GMT">GMT (Greenwich Mean Time)</SelectItem>
                    <SelectItem value="CET">CET (Central European Time)</SelectItem>
                    <SelectItem value="IST">IST (Indian Standard Time)</SelectItem>
                    <SelectItem value="JST">JST (Japan Standard Time)</SelectItem>
                    <SelectItem value="AEST">AEST (Australian Eastern Standard Time)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Save Button */}
              <Button onClick={handleSaveProfile} disabled={isUpdating} className="w-full">
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Preferences</CardTitle>
              <CardDescription>Configure how PitchPilot sends emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto-Enrich Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-Enrich Leads</Label>
                  <p className="text-sm text-muted-foreground">Automatically enrich lead information</p>
                </div>
                <Switch
                  checked={formData.autoEnrich}
                  onCheckedChange={(value) => handleInputChange("autoEnrich", value)}
                />
              </div>

              {/* Notification Emails Toggle */}
              <div className="flex items-center justify-between border-t pt-4">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email notifications for important events</p>
                </div>
                <Switch
                  checked={formData.notificationEmails}
                  onCheckedChange={(value) => handleInputChange("notificationEmails", value)}
                />
              </div>

              {/* Send Window */}
              <div className="border-t pt-4 space-y-4">
                <Label>Email Send Window</Label>
                <p className="text-sm text-muted-foreground">Set the time window for sending emails</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sendWindowStart" className="text-sm">
                      Start Time
                    </Label>
                    <Input
                      id="sendWindowStart"
                      type="time"
                      value={formData.sendWindowStart}
                      onChange={(e) => handleInputChange("sendWindowStart", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sendWindowEnd" className="text-sm">
                      End Time
                    </Label>
                    <Input
                      id="sendWindowEnd"
                      type="time"
                      value={formData.sendWindowEnd}
                      onChange={(e) => handleInputChange("sendWindowEnd", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <Button onClick={handleSavePreferences} disabled={isUpdating} className="w-full">
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Preferences"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div className="space-y-4">
                <h3 className="font-medium">Change Password</h3>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" placeholder="Enter current password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
                </div>
                <Button className="w-full">Update Password</Button>
              </div>

              {/* Two-Factor Authentication */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                <Button variant="outline" className="w-full">
                  Enable Two-Factor Authentication
                </Button>
              </div>

              {/* Sessions */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-medium">Active Sessions</h3>
                <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                <Button variant="outline" className="w-full">
                  View Active Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">Danger Zone</CardTitle>
          <CardDescription className="text-red-600">Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. All your data will be permanently deleted.
            </p>
            <Button variant="destructive" className="w-full">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
