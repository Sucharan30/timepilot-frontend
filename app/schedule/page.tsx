"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SchedulePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    apiClient.get("/events").then(res => setEvents(res.data)).catch(console.error);
  }, []);

  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start, end: addDays(start, 6) });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentDate(addDays(currentDate, -7))}>Prev</Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
          <Button variant="outline" onClick={() => setCurrentDate(addDays(currentDate, 7))}>Next</Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map(day => {
          const dayEvents = events.filter(e => new Date(e.start_datetime).toDateString() === day.toDateString());
          return (
            <Card key={day.toISOString()} className="min-h-[400px]">
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-center text-sm">{format(day, "EEE")}<br/><span className="text-2xl">{format(day, "d")}</span></CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-2">
                {dayEvents.map(e => (
                  <div key={e.id} className="p-2 text-xs bg-primary/10 rounded-md border border-primary/20 cursor-pointer hover:bg-primary/20">
                    <div className="font-semibold">{format(new Date(e.start_datetime), "HH:mm")}</div>
                    <div className="truncate">{e.title}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
