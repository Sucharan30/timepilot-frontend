import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";

type SSEEvent = {
  type: string;
  data: any;
};

export function useSSE() {
  const { user } = useAuth();
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://timepilot-backend-production.up.railway.app";
    const url = `${baseUrl}/events/stream?token=${token}`;
    
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log("[SSE] Connected to event stream");
    };

    eventSource.addEventListener("update", (event: any) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "ping") return;
        setLastEvent({ type: data.type, data: data.payload || data });
      } catch (err) {
        console.error("[SSE] Failed to parse event", err);
      }
    });

    eventSource.onerror = (error) => {
      console.error("[SSE] Connection error", error);
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [user]);

  return { lastEvent, isConnected };
}
