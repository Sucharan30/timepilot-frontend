"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Event } from "@/types";
import { format } from "date-fns";
import { Plus, Edit2, Trash2, Calendar, List, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getApiError } from "@/lib/utils/api-error";
import { EventModal } from "@/components/modals/EventModal";

export default function SchedulePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await apiClient.get("/events");
      setEvents(res.data || []);
    } catch (err) {
      toast.error(getApiError(err, "Failed to fetch events"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSave = async (data: any) => {
    try {
      // Ensure ISO format with timezone for FastAPI
      const payload = {
        ...data,
        start_datetime: new Date(data.start_datetime).toISOString(),
        end_datetime: data.end_datetime ? new Date(data.end_datetime).toISOString() : null,
      };

      if (editingEvent) {
        await apiClient.put(`/events/${editingEvent.id}`, payload);
        toast.success("Event updated");
      } else {
        await apiClient.post("/events", payload);
        toast.success("Event created");
      }
      setIsModalOpen(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (err: any) {
      toast.error(getApiError(err, "Failed to save event"));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await apiClient.delete(`/events/${id}`);
        toast.success("Event deleted");
        fetchEvents();
      } catch (err) {
        toast.error(getApiError(err, "Failed to delete event"));
      }
    }
  };

  if (loading) return <div className="p-8 space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage your events, meetings, and tasks.</p>
        </div>
        <Button onClick={() => { setEditingEvent(null); setIsModalOpen(true); }} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        {events.length > 0 ? (
          <div className="divide-y">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary text-center">
                    <span className="text-sm font-bold">{format(new Date(event.start_datetime), "h:mm a")}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(event.start_datetime), "MMM d, yyyy")}
                      </span>
                      {event.end_datetime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          until {format(new Date(event.end_datetime), "h:mm a")}
                        </span>
                      )}
                      <Badge variant="outline" className="capitalize text-[10px] h-4 py-0 px-1.5">{event.event_type}</Badge>
                      {event.status === "completed" && <Badge variant="success" className="text-[10px] h-4 py-0 px-1.5">Completed</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingEvent(event); setIsModalOpen(true); }} className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <Calendar className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">You have a clear schedule. Enjoy your free time or add a new event to stay productive!</p>
            <Button onClick={() => { setEditingEvent(null); setIsModalOpen(true); }} size="lg">
              Create your first event
            </Button>
          </div>
        )}
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingEvent(null); }}
        onSave={handleSave}
        initialData={editingEvent}
      />
    </div>
  );
}
