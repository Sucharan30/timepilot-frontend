"use client";

import { useEffect, useState } from "react";
import { KPICard } from "@/components/cards/KPICard";
import { useAuth } from "@/lib/auth/context";
import { apiClient } from "@/lib/api/client";
import { Calendar, CheckCircle2, Wallet, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, analyticsRes, budgetRes] = await Promise.all([
          apiClient.get("/overview"),
          apiClient.get("/analytics/daily").catch(() => ({ data: { data: null } })), // graceful fallback if analytics is empty
          apiClient.get("/budget").catch(() => ({ data: { data: [] } }))
        ]);
        setData({
          overview: overviewRes.data,
          analytics: analyticsRes.data,
          budgets: budgetRes.data || []
        });
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const eventsCount = data?.overview?.today_events?.length || 0;
  const tasksDueCount = data?.overview?.tasks_due?.length || 0;
  const prodScore = data?.analytics?.productivity_score || 0;

  // Calculate budget remaining purely from allocated limit for KPI representation
  let totalBudget = 0;
  data?.budgets?.forEach((b: any) => { totalBudget += Number(b.monthly_limit); });

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()}{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here is what's happening on {format(new Date(), "EEEE, MMMM do")}.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Events Today" value={eventsCount} icon={Calendar} description="Scheduled for today" />
        <KPICard title="Tasks Due" value={tasksDueCount} icon={CheckCircle2} description="Pending tasks" />
        <KPICard title="Budget Allocated" value={`₹${totalBudget}`} icon={Wallet} description="Total monthly limits" />
        <KPICard title="Productivity Score" value={`${prodScore}/100`} icon={Activity} trend={{ value: 5, label: "vs last week" }} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 border shadow-sm">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Upcoming events for today</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.overview?.today_events?.length > 0 ? (
              <div className="space-y-4">
                {data.overview.today_events.slice(0, 5).map((event: any) => (
                  <div key={event.id} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50">
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary text-center">
                      <span className="text-sm font-bold">{format(new Date(event.start_datetime), "h:mm a")}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{event.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{event.description || "No description"}</p>
                    </div>
                    <Badge variant={event.event_type === "meeting" ? "default" : "secondary"} className="capitalize">
                      {event.event_type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed">
                <Calendar className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No events scheduled for today.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 border shadow-sm">
          <CardHeader>
            <CardTitle>Tasks Due</CardTitle>
            <CardDescription>Tasks that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.overview?.tasks_due?.length > 0 ? (
              <div className="space-y-4">
                {data.overview.tasks_due.slice(0, 5).map((task: any) => (
                  <div key={task.id} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50">
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-full bg-muted text-center border">
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {task.end_datetime ? format(new Date(task.end_datetime), "MMM d, h:mm a") : "Anytime"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No tasks due today. Great job!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
