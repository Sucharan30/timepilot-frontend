"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Zap, Sparkles, Plus, Trash2, Check, X, Clock } from "lucide-react";
import { format } from "date-fns";

interface Task {
  name: string;
  duration_minutes: number;
}

interface SuggestedEvent {
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  event_type: string;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  meeting: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  task: "bg-green-500/20 text-green-400 border-green-500/30",
  study: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  reminder: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default function AISchedulePage() {
  const [tasks, setTasks] = useState<Task[]>([
    { name: "", duration_minutes: 60 },
  ]);
  const [freeStart, setFreeStart] = useState("");
  const [freeEnd, setFreeEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [suggested, setSuggested] = useState<SuggestedEvent[] | null>(null);

  const addTask = () => setTasks([...tasks, { name: "", duration_minutes: 60 }]);
  const removeTask = (i: number) => setTasks(tasks.filter((_, idx) => idx !== i));
  const updateTask = (i: number, field: keyof Task, value: any) => {
    const updated = [...tasks];
    updated[i] = { ...updated[i], [field]: value };
    setTasks(updated);
  };

  const handleNegotiate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validTasks = tasks.filter(t => t.name.trim());
    if (validTasks.length === 0) {
      toast.error("Please add at least one task.");
      return;
    }
    if (!freeStart || !freeEnd) {
      toast.error("Please specify your free time window.");
      return;
    }
    setLoading(true);
    setSuggested(null);
    try {
      const payload = {
        tasks: validTasks,
        free_start: new Date(freeStart).toISOString(),
        free_end: new Date(freeEnd).toISOString(),
      };
      const res = await apiClient.post("/ai/schedule/negotiate", payload);
      setSuggested(res.data.suggested_events);
      toast.success("AI has suggested a schedule! Review and accept below.");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to generate schedule.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!suggested) return;
    setConfirming(true);
    try {
      await apiClient.post("/ai/schedule/confirm", { events: suggested });
      toast.success("Schedule saved to your calendar! 🚀");
      setSuggested(null);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save schedule.");
    } finally {
      setConfirming(false);
    }
  };

  const removeEvent = (i: number) => {
    if (!suggested) return;
    setSuggested(suggested.filter((_, idx) => idx !== i));
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Zap className="h-8 w-8 text-purple-500" />
          AI Schedule Negotiation
        </h1>
        <p className="text-muted-foreground mt-1">
          Tell AI your tasks and free time window. It will create an optimal schedule.
          Review and accept before saving to your calendar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Tasks</CardTitle>
              <CardDescription>List the tasks you need to complete</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="Task name"
                    value={task.name}
                    onChange={e => updateTask(i, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={15}
                    max={480}
                    step={15}
                    value={task.duration_minutes}
                    onChange={e => updateTask(i, "duration_minutes", Number(e.target.value))}
                    className="w-24"
                    title="Duration in minutes"
                  />
                  <span className="text-xs text-muted-foreground shrink-0">min</span>
                  {tasks.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeTask(i)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addTask} className="w-full mt-2">
                <Plus className="h-3 w-3 mr-1" /> Add Task
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Free Time Window</CardTitle>
              <CardDescription>When are you available?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Free From</Label>
                <Input
                  type="datetime-local"
                  value={freeStart}
                  onChange={e => setFreeStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Free Until</Label>
                <Input
                  type="datetime-local"
                  value={freeEnd}
                  onChange={e => setFreeEnd(e.target.value)}
                />
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading} onClick={handleNegotiate as any}>
                {loading ? (
                  <><span className="animate-spin mr-2">⏳</span> Generating...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Generate Optimal Schedule</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div>
          {suggested && suggested.length > 0 ? (
            <Card className="border-purple-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      AI Suggested Schedule
                    </CardTitle>
                    <CardDescription>{suggested.length} events</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSuggested(null)}>
                      <X className="h-3 w-3 mr-1" /> Discard
                    </Button>
                    <Button size="sm" onClick={handleAccept} disabled={confirming} className="bg-purple-600 hover:bg-purple-700">
                      {confirming ? (
                        <><span className="animate-spin mr-2">⏳</span></>
                      ) : (
                        <><Check className="h-3 w-3 mr-1" /> Accept</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                {suggested.map((ev, i) => {
                  const start = new Date(ev.start_datetime);
                  const end   = new Date(ev.end_datetime);
                  const duration = Math.round((end.getTime() - start.getTime()) / 60000);
                  const colorCls = EVENT_TYPE_COLORS[ev.event_type] || "bg-primary/20 text-primary border-primary/30";
                  return (
                    <div key={i} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={`text-xs ${colorCls}`}>
                              {ev.event_type}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {duration} min
                            </span>
                          </div>
                          <div className="font-medium text-sm">{ev.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {isNaN(start.getTime()) ? ev.start_datetime : format(start, "MMM d, HH:mm")} →{" "}
                            {isNaN(end.getTime()) ? ev.end_datetime : format(end, "HH:mm")}
                          </div>
                          {ev.description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{ev.description}</div>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive ml-2" onClick={() => removeEvent(i)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed h-full min-h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground p-8">
                <Zap className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">AI Schedule Preview</p>
                <p className="text-sm mt-1">Add tasks and click generate to see your optimal schedule here.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
