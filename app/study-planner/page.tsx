"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BookOpen, Sparkles, Check, X, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface StudySession {
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  event_type?: string;
}

export default function StudyPlannerPage() {
  const [form, setForm] = useState({
    subject: "",
    chapters: 10,
    exam_date: "",
    daily_hours: 2,
  });
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [sessions, setSessions] = useState<StudySession[] | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.exam_date) {
      toast.error("Please fill in subject and exam date.");
      return;
    }
    setLoading(true);
    setSessions(null);
    try {
      const res = await apiClient.post("/study/generate", form);
      setSessions(res.data);
      toast.success(`Generated ${res.data.length} study sessions!`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to generate study plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!sessions) return;
    setConfirming(true);
    try {
      await apiClient.post("/study/confirm", { sessions });
      toast.success("Study plan saved to your calendar! 📚");
      setSessions(null);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save study plan.");
    } finally {
      setConfirming(false);
    }
  };

  const handleDiscard = () => {
    setSessions(null);
    toast.info("Study plan discarded.");
  };

  const removeSession = (index: number) => {
    if (!sessions) return;
    setSessions(sessions.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-teal-500" />
          Study Planner
        </h1>
        <p className="text-muted-foreground mt-1">
          AI generates a personalized study schedule based on your exam date and chapters.
          Sessions appear in your calendar with reminders.
        </p>
      </div>

      {/* Input Form */}
      <Card className="border-teal-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-500" />
            Generate Study Plan
          </CardTitle>
          <CardDescription>
            Fill in the details below. AI will create an optimal day-by-day plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Subject / Course Name</Label>
                <Input
                  required
                  placeholder="e.g. Operating Systems"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Number of Chapters</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={form.chapters}
                  onChange={e => setForm({ ...form, chapters: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Exam Date</Label>
                <Input
                  required
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={form.exam_date}
                  onChange={e => setForm({ ...form, exam_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Daily Study Hours</Label>
                <Input
                  type="number"
                  min={0.5}
                  max={12}
                  step={0.5}
                  value={form.daily_hours}
                  onChange={e => setForm({ ...form, daily_hours: Number(e.target.value) })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" /> Generate AI Study Plan
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Generated Plan Preview */}
      {sessions && sessions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Generated Plan — {sessions.length} Sessions</h2>
              <p className="text-sm text-muted-foreground">Review and edit before saving to your calendar.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleDiscard} disabled={confirming}>
                <X className="h-4 w-4 mr-2" /> Discard
              </Button>
              <Button onClick={handleConfirm} disabled={confirming} className="bg-teal-600 hover:bg-teal-700">
                {confirming ? (
                  <><span className="animate-spin mr-2">⏳</span> Saving...</>
                ) : (
                  <><Check className="h-4 w-4 mr-2" /> Save All to Calendar</>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {sessions.map((session, i) => {
              const startDt = new Date(session.start_datetime);
              const endDt   = new Date(session.end_datetime);
              const duration = Math.round((endDt.getTime() - startDt.getTime()) / 60000);
              return (
                <Card key={i} className="border-teal-500/20 hover:border-teal-500/50 transition-colors">
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 text-center min-w-[60px]">
                        <div className="text-xs text-muted-foreground font-medium">
                          {isNaN(startDt.getTime()) ? "?" : format(startDt, "MMM d")}
                        </div>
                        <div className="text-sm font-bold text-teal-500">
                          {isNaN(startDt.getTime()) ? "?" : format(startDt, "HH:mm")}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/30 text-xs">
                            📚 Study
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {duration} min
                          </span>
                        </div>
                        <div className="font-semibold text-sm">{session.title}</div>
                        {session.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{session.description}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeSession(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleDiscard} className="flex-1" disabled={confirming}>
              <X className="h-4 w-4 mr-2" /> Discard Plan
            </Button>
            <Button onClick={handleConfirm} className="flex-1 bg-teal-600 hover:bg-teal-700" disabled={confirming}>
              {confirming ? (
                <><span className="animate-spin mr-2">⏳</span> Saving to Calendar...</>
              ) : (
                <><Check className="h-4 w-4 mr-2" /> Confirm & Save {sessions.length} Sessions</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
