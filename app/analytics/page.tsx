"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>({});
  
  useEffect(() => {
    Promise.all([
      apiClient.get("/analytics/daily"),
      apiClient.get("/analytics/weekly"),
      apiClient.get("/analytics/monthly"),
      apiClient.get("/analytics/yearly")
    ]).then(([d, w, m, y]) => {
      setAnalytics({ daily: d.data, weekly: w.data, monthly: m.data, yearly: y.data });
    }).catch(console.error);
  }, []);

  const renderData = (data: any) => {
    if (!data) return null;
    const expenseData = Object.entries(data.expenses_by_category || {}).map(([name, value]) => ({ name, value }));
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7'];

    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Productivity Score</CardTitle></CardHeader>
          <CardContent className="flex justify-center items-center h-64 text-6xl font-bold text-primary">
            {data.productivity_score}/100
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Today</TabsTrigger>
          <TabsTrigger value="weekly">Week</TabsTrigger>
          <TabsTrigger value="monthly">Month</TabsTrigger>
          <TabsTrigger value="yearly">Year</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">{renderData(analytics.daily)}</TabsContent>
        <TabsContent value="weekly">{renderData(analytics.weekly)}</TabsContent>
        <TabsContent value="monthly">{renderData(analytics.monthly)}</TabsContent>
        <TabsContent value="yearly">{renderData(analytics.yearly)}</TabsContent>
      </Tabs>
    </div>
  );
}
