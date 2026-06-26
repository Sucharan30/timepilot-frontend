"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  useEffect(() => { apiClient.get("/saving-goals").then(res => setGoals(res.data)).catch(console.error); }, []);
  
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((g: any) => (
          <Card key={g.id}>
            <CardHeader><CardTitle>{g.name}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Saved: ₹{g.current_amount}</span>
                <span>Target: ₹{g.target_amount}</span>
              </div>
              <Progress value={(g.current_amount / g.target_amount) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">Deadline: {g.target_date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
