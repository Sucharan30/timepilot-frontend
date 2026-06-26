"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const { theme, setTheme } = useTheme();
  
  useEffect(() => { 
    apiClient.get("/settings/notifications").then(res => setSettings(res.data)).catch(console.error);
  }, []);

  const saveSettings = async () => {
    try {
      await apiClient.put("/settings/notifications", {
        notification_enabled: settings.notification_enabled,
        reminder_minutes: settings.reminder_minutes
      });
      toast.success("Settings saved");
    } catch(err) { toast.error("Failed to save settings"); }
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage how you receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div><p className="font-medium">Enable Notifications</p><p className="text-sm text-muted-foreground">Receive reminders via Telegram</p></div>
            <Switch checked={settings.notification_enabled || false} onCheckedChange={(v) => setSettings({...settings, notification_enabled: v})} />
          </div>
          <Button onClick={saveSettings}>Save Notification Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>Light</Button>
            <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>Dark</Button>
            <Button variant={theme === 'system' ? 'default' : 'outline'} onClick={() => setTheme('system')}>System</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Telegram Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl">
            <div><p className="font-bold text-primary">Connected to Bot</p><p className="text-sm text-muted-foreground">Status: Active</p></div>
            <Button variant="outline" onClick={() => window.open("https://t.me/timepilot_ai_bot", "_blank")}>Open Telegram</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
