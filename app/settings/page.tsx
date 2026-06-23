"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { apiClient } from "@/lib/api/client";
import { getApiError } from "@/lib/utils/api-error";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Smartphone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      await apiClient.put("/auth/me", { full_name: fullName.trim() });
      await refreshUser();          // <— re-fetch user so dashboard greeting updates
      toast.success("Profile updated! Dashboard will now show your name.");
    } catch (err) {
      toast.error(getApiError(err, "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up pb-8 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <div className="grid gap-8">
        {/* Profile */}
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input defaultValue={user?.phone_number || ""} disabled className="bg-muted cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Phone number cannot be changed.</p>
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "Update Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Telegram Integration */}
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle>Telegram Integration</CardTitle>
            </div>
            <CardDescription>Connect Telegram to receive daily briefings and log expenses via chat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl border border-dashed p-5 space-y-4">
              <p className="text-sm font-semibold">How to connect your Telegram account:</p>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Open Telegram and search for your bot (the one you set up with BotFather).</li>
                <li>Send <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono text-xs">/start</code> or <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono text-xs">Hello</code> to the bot.</li>
                <li>The bot should reply with a greeting and list of commands.</li>
                <li>Once connected, you can say <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono text-xs">show today's schedule</code> or <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono text-xs">Spent ₹200 on food</code>.</li>
              </ol>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm space-y-1">
                <p className="font-semibold text-primary">Available Bot Commands:</p>
                <ul className="text-muted-foreground space-y-1 mt-2 list-disc list-inside">
                  <li><span className="font-mono text-foreground text-xs">Hello</span> — greet the bot</li>
                  <li><span className="font-mono text-foreground text-xs">show today's schedule</span> — see today's events</li>
                  <li><span className="font-mono text-foreground text-xs">Spent ₹500 on food</span> — log an expense (confirms before saving)</li>
                  <li><span className="font-mono text-foreground text-xs">Meeting tomorrow 3 PM</span> — create an event (confirms before saving)</li>
                  <li><span className="font-mono text-foreground text-xs">confirm / cancel</span> — confirm or discard a pending action</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> "show today's schedule" and expense saving require your Telegram chat to be linked to your account.
                Account linking is automatic after your phone number is verified.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure how you receive alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Daily Briefing</Label>
                <p className="text-sm text-muted-foreground">Receive a summary of your day at 7:00 AM UTC via Telegram.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Budget Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when you exceed 80% of your budget limit.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Event Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded before upcoming events (handled by backend scheduler).</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Notifications are handled automatically by the backend APScheduler running on Railway. No extra setup needed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
