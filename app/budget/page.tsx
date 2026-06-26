"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  useEffect(() => { apiClient.get("/budget").then(res => setBudgets(res.data)).catch(console.error); }, []);
  
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Budget Center</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((b: any) => (
          <Card key={b.id}>
            <CardHeader><CardTitle>{b.category}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Spent: ₹{b.current_spent}</span>
                <span>Limit: ₹{b.monthly_limit}</span>
              </div>
              <Progress value={(b.current_spent / b.monthly_limit) * 100} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
