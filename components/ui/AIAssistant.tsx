"use client";
import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ role: "ai", text: "Hi! I am your TimePilot AI Assistant. What can I do for you today?" }]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if(!input.trim()) return;
    const userMsg = input;
    setMessages(p => [...p, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    
    try {
      const res: any = await apiClient.post("/ai/chat", { text: userMsg });
      const msg = res.data.message || res.data.response || "I have processed your request.";
      setMessages(p => [...p, { role: "ai", text: msg }]);
    } catch(err) {
      setMessages(p => [...p, { role: "ai", text: "Sorry, I encountered an error communicating with the backend." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-16 right-0 w-[350px] bg-card border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
            <div className="bg-primary p-4 flex justify-between items-center text-primary-foreground">
              <div className="flex items-center gap-2 font-medium"><Sparkles className="h-5 w-5"/> AI Assistant</div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-primary-foreground hover:bg-primary/50 rounded-full"><X className="h-5 w-5" /></Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="p-3 bg-muted rounded-2xl rounded-bl-sm"><span className="animate-pulse">Thinking...</span></div>
                </div>
              )}
            </div>
            <div className="p-3 border-t flex gap-2 bg-background">
              <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask AI..." className="rounded-full bg-muted/50 border-none focus-visible:ring-1" disabled={loading} />
              <Button size="icon" className="rounded-full shrink-0 shadow-sm" onClick={sendMessage} disabled={loading}><Send className="h-4 w-4" /></Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl bg-primary text-primary-foreground hover:scale-105 transition-transform" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
}
