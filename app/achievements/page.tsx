"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Medal } from "lucide-react";

export default function AchievementsPage() {
  const [rewards, setRewards] = useState<any[]>([]);
  useEffect(() => { apiClient.get("/rewards").then(res => setRewards(res.data)).catch(console.error); }, []);
  
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {rewards.map((r: any) => (
          <Card key={r.id} className="relative overflow-hidden group border-primary/20 hover:border-primary transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Trophy className="h-24 w-24" /></div>
            <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Medal className="h-5 w-5 text-yellow-500" /> {r.badge_name}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{r.description}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
