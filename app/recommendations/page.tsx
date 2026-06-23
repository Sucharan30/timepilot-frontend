"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Sparkles, BrainCircuit, RefreshCw, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingIns, setLoadingIns] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  const [insError, setInsError] = useState<string | null>(null);

  const generateRecs = async () => {
    setLoadingRecs(true);
    setRecError(null);
    try {
      const res = await apiClient.get("/recommendations/generate");
      setRecommendations(res.data || []);
    } catch (err: any) {
      const msg = err?.response?.data?.detail;
      const readable = typeof msg === "string" ? msg : "Gemini couldn't generate recommendations. Try again after adding more events.";
      setRecError(readable);
    } finally {
      setLoadingRecs(false);
    }
  };

  const generateInsights = async () => {
    setLoadingIns(true);
    setInsError(null);
    try {
      const res = await apiClient.get("/insights/generate");
      setInsights(res.data || []);
    } catch (err: any) {
      const msg = err?.response?.data?.detail;
      const readable = typeof msg === "string" ? msg : "Gemini couldn't generate insights. Try again after logging some expenses.";
      setInsError(readable);
    } finally {
      setLoadingIns(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    // Run both independently — one failing won't block the other
    await Promise.all([generateRecs(), generateInsights()]);
    setGenerating(false);
    toast.success("AI analysis complete!");
  };

  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-muted-foreground mt-1">Smart recommendations based on your schedule and spending.</p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="shadow-sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${generating ? "animate-spin" : ""}`} />
          {generating ? "Analyzing..." : "Generate New Insights"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recommendations */}
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Recommendations</CardTitle>
            </div>
            <CardDescription>Actionable advice to improve your routine</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRecs ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : recError ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <AlertCircle className="h-10 w-10 text-amber-500 opacity-70" />
                <p className="text-sm text-muted-foreground max-w-xs">{recError}</p>
                <Button size="sm" variant="outline" onClick={generateRecs}>Try Again</Button>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-5 transition-all hover:shadow-sm">
                    <p className="text-sm font-medium leading-relaxed">{rec.recommendation_text}</p>
                    <p className="text-xs text-muted-foreground mt-3">
                      {format(new Date(rec.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Sparkles className="h-12 w-12 opacity-20 mb-3" />
                <p>No recommendations yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Insights */}
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-accent" />
              <CardTitle>Data Insights</CardTitle>
            </div>
            <CardDescription>Patterns discovered in your data</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingIns ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : insError ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <AlertCircle className="h-10 w-10 text-amber-500 opacity-70" />
                <p className="text-sm text-muted-foreground max-w-xs">{insError}</p>
                <Button size="sm" variant="outline" onClick={generateInsights}>Try Again</Button>
              </div>
            ) : insights.length > 0 ? (
              <div className="space-y-4">
                {insights.map((insight: any, idx: number) => (
                  <div key={idx} className="rounded-xl border bg-gradient-to-br from-accent/5 to-transparent p-5 transition-all hover:shadow-sm">
                    <p className="text-sm font-medium leading-relaxed">{insight.insight_text}</p>
                    <p className="text-xs text-muted-foreground mt-3">
                      {format(new Date(insight.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <BrainCircuit className="h-12 w-12 opacity-20 mb-3" />
                <p>No insights yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tip */}
      <Card className="border border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="p-5 flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-primary mb-1">Why might AI insights fail?</p>
            <p className="text-muted-foreground">
              Gemini needs some data to analyze. Try creating a few events on the Schedule page and logging
              some expenses on the Budget page first — then come back and generate insights.
              Also ensure the <code className="bg-muted px-1 rounded">GEMINI_API_KEY</code> is set in Railway Variables.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
