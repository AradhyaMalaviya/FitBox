import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { supabasePublishableKey, supabaseUrl } from "@/lib/env";
import { PROJECT_KNOWLEDGE } from "@/data/projectKnowledge";

type Message = { role: "user" | "assistant"; content: string };

const WELCOME_MESSAGE =
  "Hi! I'm the FitBox project assistant. Ask me where things live, how auth/routing/Supabase work, or how to extend the app.";

const renderMessageContent = (content: string) => {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part.split("\n").map((line, j) => (
      <span key={`${i}-${j}`}>
        {j > 0 && <br />}
        {line}
      </span>
    ));
  });
};

export const ProjectAssistantChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: WELCOME_MESSAGE }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const CHAT_URL = `${supabaseUrl}/functions/v1/project-assistant`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        apikey: supabasePublishableKey,
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: nextMessages,
          // Keep payload small; the edge function also caps server-side.
          projectContext: PROJECT_KNOWLEDGE.slice(0, 12000),
        }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || "Failed to get response");

      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (e) {
      console.error("Project assistant chat error:", e);
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 rounded-full w-16 h-16 shadow-lg bg-secondary hover:bg-secondary/90 z-50"
        size="icon"
        aria-label="Open project assistant"
      >
        <span className="text-2xl">🛠️</span>
      </Button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={() => setIsOpen(false)} />
      <Card className="fixed bottom-6 left-6 w-96 h-[500px] flex flex-col shadow-2xl border-2 border-secondary/50 bg-background z-[70]">
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary text-secondary-foreground">
          <h3 className="font-semibold">Project Assistant</h3>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-secondary-foreground/20 text-secondary-foreground">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 shadow-md ${
                  msg.role === "user"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-background border-2 border-border text-foreground"
                }`}
              >
                {renderMessageContent(msg.content)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-background border-2 border-border text-foreground rounded-lg p-3 shadow-md flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-secondary" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border bg-background">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the codebase..."
              disabled={isLoading}
              className="flex-1 bg-card border-border"
            />
            <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon" className="bg-secondary hover:bg-secondary/90">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};
