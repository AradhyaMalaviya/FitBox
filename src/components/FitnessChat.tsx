import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Bot, Send, X, Loader2, Cpu } from "lucide-react";
import { exercises } from "@/data/exercises";
import { supabase } from "@/integrations/supabase/client";
import { supabaseUrl, supabasePublishableKey } from "@/lib/env";

type Message = { role: "user" | "assistant"; content: string; isStreaming?: boolean };

// Canned response generator for simulated Gemini 2.5 Flash Lite SSE Cloud Coach
function generateCloudCoachResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("protein") || q.includes("veg") || q.includes("diet") || q.includes("food")) {
    return "For an Indian vegetarian fitness diet, prioritize high-protein staples:\n\n• Soya Chunks (52g protein / 100g)\n• Low-fat Paneer (20g protein / 100g)\n• Sattu Shake (20g protein / 100g)\n• Curd / Dahi (7g protein / 100g)\n\nAim for 2.2g of protein per kg of bodyweight daily split across 4 balanced meals!";
  }
  if (q.includes("split") || q.includes("routine") || q.includes("ppl") || q.includes("plan")) {
    return "The Push-Pull-Legs (PPL) split is ideal for hypertrophy:\n\n• Day 1 (Push): Bench Press, Overhead Dumbbell Press, Incline Flyes, Tricep Pushdowns.\n• Day 2 (Pull): Lat Pulldowns, Seated Cable Rows, Face Pulls, Barbell Bicep Curls.\n• Day 3 (Legs): Barbell Squats, Romanian Deadlifts, Leg Extensions, Calf Raises.\n• Day 4: Rest / Active Recovery.";
  }
  if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
    return "Namaste! I am your AI Cloud Coach powered by Gemini 2.5 Flash Lite. Ask me anything about workout splits, Indian nutrition, macro targets, or recovery science!";
  }
  return `Great question regarding "${query}"! To optimize progressive overload, ensure you log every set with weight and reps. Aim for 8-12 reps per working set near failure, rest 2 minutes between compound lifts, and hydrate with at least 3-4 liters of water daily.`;
}

// Functional Local NLP Engine
function processLocalNLP(input: string): string {
  const cleanInput = input.toLowerCase().trim();
  const bodyParts = [
    "chest", "pecs",
    "back", "lats", "traps",
    "legs", "quads", "hamstrings", "glutes", "calves",
    "arms", "biceps", "triceps", "forearms",
    "shoulders", "delts",
    "core", "abs"
  ];

  // 1. Check for Muscle Entity Intent
  const foundPart = bodyParts.find((part) => cleanInput.includes(part));
  if (foundPart) {
    const targetGroup =
      foundPart === "abs" || foundPart === "core" ? "Core" :
      foundPart === "biceps" || foundPart === "triceps" || foundPart === "forearms" || foundPart === "arms" ? "Arms" :
      foundPart === "quads" || foundPart === "hamstrings" || foundPart === "glutes" || foundPart === "calves" || foundPart === "legs" ? "Legs" :
      foundPart === "lats" || foundPart === "traps" || foundPart === "back" ? "Back" :
      foundPart === "pecs" || foundPart === "chest" ? "Chest" :
      foundPart === "delts" || foundPart === "shoulders" ? "Shoulders" :
      foundPart.charAt(0).toUpperCase() + foundPart.slice(1);

    const filtered = exercises.filter((e) => e.muscleGroup.toLowerCase() === targetGroup.toLowerCase());
    const beginner = filtered.filter((e) => e.difficulty === "Beginner").map((e) => e.name).slice(0, 3);
    const intermediate = filtered.filter((e) => e.difficulty === "Intermediate").map((e) => e.name).slice(0, 3);

    return `💪 [Local NLP Engine] Extracted Muscle Entity: "${targetGroup}"\n\n• Recommended Beginner Movements: ${beginner.join(", ") || "Push-ups, Bodyweight Squats"}\n• Recommended Intermediate Movements: ${intermediate.join(", ") || "Barbell Press, Deadlifts"}\n\nSelect any movement from the Exercise Directory to view form guides!`;
  }

  // 2. Check for Warm-Up Intent
  if (cleanInput.includes("warmup") || cleanInput.includes("warm up") || cleanInput.includes("stretch") || cleanInput.includes("prep")) {
    return `🔥 [Local NLP Engine] Functional 4-Step Dynamic Warm-Up Routine:\n\n1. 5 mins Arm Circles & Torso Twists (Joint Mobility)\n2. 10 Banded Face Pulls (Shoulder/Rotator Cuff Activation)\n3. 15 Bodyweight Air Squats (Hip/Knee Lubrication)\n4. 2 Warm-Up Sets with 50% working weight before heavy lifts.`;
  }

  // 3. Check for Form / Technique Intent
  if (cleanInput.includes("how") || cleanInput.includes("form") || cleanInput.includes("technique")) {
    const matchedExercise = exercises.find((e) => cleanInput.includes(e.name.toLowerCase()));
    if (matchedExercise) {
      return `📌 [Local NLP Engine] Form Technique for ${matchedExercise.name}:\n\n${matchedExercise.description}\nEquipment: ${matchedExercise.equipment} | Difficulty: ${matchedExercise.difficulty}`;
    }
  }

  // 4. Fallback Generic Response
  return `🤖 [Local NLP Engine] Zero-latency offline classification:\n\nTry asking me about specific muscle groups (e.g., "exercises for chest", "leg workout"), warm-up routines, or form guidance!`;
}

export const FitnessChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"cloud" | "local">("cloud");

  // Cloud Coach Messages
  const [cloudMessages, setCloudMessages] = useState<Message[]>([
    { role: "assistant", content: "Namaste! I am your AI Cloud Coach. Ask me about workouts or Indian nutrition!" },
  ]);
  const [cloudInput, setCloudInput] = useState("");
  const [isCloudLoading, setIsCloudLoading] = useState(false);

  // Local Trainer Messages
  const [localMessages, setLocalMessages] = useState<Message[]>([
    { role: "assistant", content: "⚡ Local Trainer NLP Engine Active (0ms Latency). Ask for muscle workouts or warm-ups!" },
  ]);
  const [localInput, setLocalInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, cloudMessages, localMessages, activeTab]);

  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, []);

  // Cloud Coach: Live Supabase Edge Function with Streaming + Simulated SSE Fallback
  const sendCloudMessage = async () => {
    if (!cloudInput.trim() || isCloudLoading) return;

    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }

    const userText = cloudInput.trim();
    const nextMessages: Message[] = [...cloudMessages, { role: "user", content: userText }];
    setCloudMessages(nextMessages);
    setCloudInput("");
    setIsCloudLoading(true);

    // Shared: append a single placeholder assistant message that both
    // the streaming path and the simulation fallback will update in-place.
    // This prevents the "ghost bubble" bug where runSimulation() would
    // previously push a *second* empty assistant message.
    const addPlaceholder = () => {
      setCloudMessages((prev) => [...prev, { role: "assistant", content: "", isStreaming: true }]);
    };

    const runSimulation = (needsPlaceholder: boolean) => {
      const fullResponse = generateCloudCoachResponse(userText);
      const tokens = fullResponse.split(" ");
      let currentTokenIndex = 0;

      if (needsPlaceholder) {
        addPlaceholder();
      }

      streamIntervalRef.current = setInterval(() => {
        if (currentTokenIndex < tokens.length) {
          const chunk = tokens.slice(0, currentTokenIndex + 1).join(" ");
          setCloudMessages((prev) => {
            const newArr = [...prev];
            newArr[newArr.length - 1] = { role: "assistant", content: chunk, isStreaming: true };
            return newArr;
          });
          currentTokenIndex++;
        } else {
          if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
            streamIntervalRef.current = null;
          }
          setIsCloudLoading(false);
          setCloudMessages((prev) => {
            const newArr = [...prev];
            newArr[newArr.length - 1] = { role: "assistant", content: fullResponse, isStreaming: false };
            return newArr;
          });
        }
      }, 40);
    };

    try {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session?.access_token || !supabaseUrl) {
        runSimulation(true);
        return;
      }

      // Build a concise exercise data summary for the Edge Function
      const exerciseDataSummary = exercises.map((e) => `${e.name} (${e.muscleGroup}, ${e.difficulty})`).join("; ");

      const CHAT_URL = `${supabaseUrl}/functions/v1/fitness-chat`;
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabasePublishableKey,
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          exerciseData: exerciseDataSummary,
        }),
      });

      if (!response.ok || !response.body) {
        runSimulation(true);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let accumulated = "";

      addPlaceholder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const token = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (token) {
              accumulated += token;
              setCloudMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: "assistant", content: accumulated, isStreaming: true };
                return next;
              });
            }
          } catch {
            // Wait for next chunk
          }
        }
      }

      if (!accumulated) {
        // Placeholder already exists — runSimulation updates it in-place
        runSimulation(false);
        return;
      }

      setCloudMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: accumulated, isStreaming: false };
        return next;
      });
      setIsCloudLoading(false);
    } catch {
      runSimulation(true);
    }
  };

  // Immediate Local NLP Execution
  const sendLocalMessage = () => {
    if (!localInput.trim()) return;

    const userText = localInput.trim();
    const replyText = processLocalNLP(userText);

    setLocalMessages((prev) => [
      ...prev,
      { role: "user", content: userText },
      { role: "assistant", content: replyText },
    ]);
    setLocalInput("");
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 rounded-full w-14 h-14 p-0 bg-primary hover:bg-primary/90 shadow-xl border-2 border-primary/50 flex items-center justify-center animate-bounce"
        >
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </Button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-[92vw] max-w-sm h-[520px] z-50 flex flex-col bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl overflow-hidden">
          {/* Header & Tabs */}
          <div className="p-3 bg-muted/60 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-border/50">
              <button
                onClick={() => setActiveTab("cloud")}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === "cloud" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Cloud Coach
              </button>
              <button
                onClick={() => setActiveTab("local")}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === "local" ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Local Trainer
              </button>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {(activeTab === "cloud" ? cloudMessages : localMessages).map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none border border-border/50"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <div className="p-3 border-t border-border bg-card/80">
            {activeTab === "cloud" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendCloudMessage();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={cloudInput}
                  onChange={(e) => setCloudInput(e.target.value)}
                  placeholder="Ask Cloud Coach (SSE Sim)..."
                  className="text-xs bg-background"
                  disabled={isCloudLoading}
                />
                <Button type="submit" size="icon" disabled={isCloudLoading || !cloudInput.trim()}>
                  {isCloudLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendLocalMessage();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={localInput}
                  onChange={(e) => setLocalInput(e.target.value)}
                  placeholder="Query Local NLP Engine..."
                  className="text-xs bg-background"
                />
                <Button type="submit" size="icon" disabled={!localInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
        </Card>
      )}
    </>
  );
};
