"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<any[]>([]);
  const [procrastination, setProcrastination] = useState<any>(null);

  useEffect(() => { 
    apiClient.get("/insights/generate").then(res => setInsights(res.data)).catch(console.error);
    apiClient.get("/ai/procrastination").then(res => setProcrastination(res.data)).catch(console.error);
  }, []);
  
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
      
      {procrastination && (
         <Card className="bg-primary/5 border-primary/20 mb-8">
            <CardHeader><CardTitle className="flex items-center gap-2"><BrainCircuit className="text-primary"/> Procrastination Analysis</CardTitle></CardHeader>
            <CardContent>
              <p className="font-medium text-lg mb-2">Trend: {procrastination.procrastination_trend}</p>
              <p className="text-muted-foreground">{procrastination.recommendation}</p>
            </CardContent>
         </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight: any, i: number) => (
          <Card key={i}>
            <CardHeader><CardTitle className="text-lg">{insight.category}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{insight.message}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
