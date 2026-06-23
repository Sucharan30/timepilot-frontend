"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  event_type: z.enum(["meeting", "appointment", "class", "task", "reminder", "deadline"]),
  start_datetime: z.string().min(1, "Start date/time is required"),
  end_datetime: z.string().optional().nullable(),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EventFormValues) => void;
  initialData?: any;
}

export function EventModal({ isOpen, onClose, onSave, initialData }: EventModalProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      event_type: "meeting",
      start_datetime: "",
      end_datetime: "",
    },
  });

  useEffect(() => {
    if (initialData && isOpen) {
      form.reset({
        title: initialData.title,
        description: initialData.description || "",
        event_type: initialData.event_type,
        start_datetime: initialData.start_datetime ? new Date(initialData.start_datetime).toISOString().slice(0, 16) : "",
        end_datetime: initialData.end_datetime ? new Date(initialData.end_datetime).toISOString().slice(0, 16) : "",
      });
    } else if (isOpen) {
      form.reset({
        title: "",
        description: "",
        event_type: "meeting",
        start_datetime: new Date().toISOString().slice(0, 16),
        end_datetime: "",
      });
    }
  }, [initialData, isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription>Fill out the details for your event below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input {...form.register("title")} placeholder="Event Title" />
            {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input {...form.register("description")} placeholder="Optional description" />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <select
              {...form.register("event_type")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="meeting">Meeting</option>
              <option value="appointment">Appointment</option>
              <option value="class">Class</option>
              <option value="task">Task</option>
              <option value="reminder">Reminder</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start</Label>
              <Input type="datetime-local" {...form.register("start_datetime")} />
            </div>
            <div className="space-y-2">
              <Label>End (Optional)</Label>
              <Input type="datetime-local" {...form.register("end_datetime")} />
            </div>
          </div>
          <DialogFooter className="mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
