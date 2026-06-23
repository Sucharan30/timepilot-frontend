"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KPICard } from "@/components/cards/KPICard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Activity, Clock, PieChart, Target } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/analytics/${period}`);
        setData(res.data);
      } catch (err) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [period]);

  const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];

  const timeData = data ? [
    { name: "Study/Work", value: data.total_study_minutes || 0 },
    { name: "Meetings", value: data.total_meeting_minutes || 0 },
    { name: "Personal", value: data.total_personal_minutes || 0 },
  ].filter(d => d.value > 0) : [];

  const expenseData = [
    { category: "Total", amount: data?.total_expenses || 0 },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your productivity, time, and spending.</p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <KPICard title="Productivity Score" value={`${data?.productivity_score || 0}`} icon={Activity} description="Out of 100" />
            <KPICard title="Total Events" value={data?.event_count || 0} icon={Target} description={`Events this ${period}`} />
            <KPICard title="Most Active" value={data?.most_active_category || "None"} icon={PieChart} description="Top event category" className="capitalize" />
            <KPICard title="Expenses" value={`₹${data?.total_expenses || 0}`} icon={Clock} description={`Spent this ${period}`} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-1 border shadow-sm">
              <CardHeader>
                <CardTitle>Time Allocation</CardTitle>
                <CardDescription>How you spent your time (minutes)</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {timeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={timeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {timeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No time data available for this period.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-1 border shadow-sm">
              <CardHeader>
                <CardTitle>Spending Overview</CardTitle>
                <CardDescription>Your expenses by category</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {data?.total_expenses > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseData}>
                      <XAxis dataKey="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No expense data available for this period.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
