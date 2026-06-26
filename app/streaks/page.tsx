"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";

export default function StreaksPage() {
  const [streaks, setStreaks] = useState<any>(null);
  useEffect(() => { apiClient.get("/streaks").then(res => setStreaks(res.data)).catch(console.error); }, []);
  
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Streaks Dashboard</h1>
      {streaks && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardHeader><CardTitle className="flex items-center gap-2"><Flame className="text-orange-500" /> Current Streak</CardTitle></CardHeader>
            <CardContent className="text-6xl font-bold text-orange-500">{streaks.current_streak} <span className="text-xl font-normal text-muted-foreground">Days</span></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Longest Streak</CardTitle></CardHeader>
            <CardContent className="text-6xl font-bold text-primary">{streaks.longest_streak} <span className="text-xl font-normal text-muted-foreground">Days</span></CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
