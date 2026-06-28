"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { apiClient } from "@/lib/api/client";
import { useSSE } from "@/lib/hooks/useSSE";
import { Calendar, CheckCircle2, Wallet, Activity, Zap, Flame, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const { user } = useAuth();
  const { lastEvent } = useSSE();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [overviewRes, analyticsRes, streaksRes, insightsRes, budgetRes] = await Promise.all([
        apiClient.get("/overview").catch(() => ({ data: {} })),
        apiClient.get("/analytics/daily").catch(() => ({ data: {} })),
        apiClient.get("/streaks").catch(() => ({ data: {} })),
        apiClient.get("/insights/generate").catch(() => ({ data: [] })),
        apiClient.get("/budget/summary").catch(() => ({ data: [] }))
      ]);
      setData({
        overview: overviewRes.data,
        analytics: analyticsRes.data,
        streaks: streaksRes.data,
        insights: insightsRes.data,
        budgetSummary: Array.isArray(budgetRes.data) ? budgetRes.data : []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (lastEvent) fetchData(); }, [lastEvent]);

  if (loading) return <div className="p-8 animate-pulse"><Skeleton className="h-12 w-64 mb-8" /></div>;

  const events = data?.overview?.today_events || [];
  const tasks = data?.overview?.tasks_due || [];
  const prodScore = data?.analytics?.productivity_score || 0;
  const streak = data?.streaks?.current_streak || 0;
  const studyMinutes = data?.analytics?.total_study_minutes || 0;
  const budgetSummary = data?.budgetSummary || [];
  
  const totalLimit = budgetSummary.reduce((acc: number, b: any) => acc + (b.monthly_limit || 0), 0);
  const totalSpent = budgetSummary.reduce((acc: number, b: any) => acc + (b.spent || 0), 0);
  const budgetProgress = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-fade-in-up max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.full_name || "User"}. Here is your briefing for {format(new Date(), "EEEE, MMMM do")}.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2 flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Events Today</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{events.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2 flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Pending Tasks</CardTitle><CheckCircle2 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{tasks.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2 flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Productivity</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{prodScore}/100</div></CardContent></Card>
        <Card><CardHeader className="pb-2 flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Current Streak</CardTitle><Flame className="h-4 w-4 text-orange-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{streak} Days</div></CardContent></Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader><CardTitle>Upcoming Schedule</CardTitle></CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between p-4 border rounded-xl">
                    <div><p className="font-medium">{e.title}</p><p className="text-sm text-muted-foreground">{format(new Date(e.start_datetime), "h:mm a")}</p></div>
                    <Badge variant="outline">{e.event_type}</Badge>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No events scheduled.</p>}
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-teal-500"/> Study Progress</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Today's Study Time</span>
                <span className="font-medium">{studyMinutes} min</span>
              </div>
              <Progress value={Math.min((studyMinutes / 120) * 100, 100)} className="h-2 [&>div]:bg-teal-500" />
              <p className="text-xs text-muted-foreground">Goal: 120 min / day</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-primary"/> Budget Overview</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Spent</span>
                <span className="font-medium">₹{totalSpent.toLocaleString(undefined, {maximumFractionDigits: 0})} / ₹{totalLimit.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              </div>
              <Progress value={budgetProgress} className={`h-2 ${budgetProgress >= 100 ? '[&>div]:bg-destructive' : budgetProgress >= 80 ? '[&>div]:bg-orange-500' : ''}`} />
              <p className="text-xs text-muted-foreground">
                {budgetProgress >= 100 ? "Over budget limit!" : budgetProgress >= 80 ? "Nearing budget limit." : "On track."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
