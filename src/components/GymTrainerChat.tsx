import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { exercises } from "@/data/exercises";
import { supabasePublishableKey, supabaseUrl } from "@/lib/env";

type Message = { role: "user" | "assistant"; content: string };

// Build a compact summary of the FitBox exercise library so the model can
// ground its recommendations in exercises that actually exist in the app.
const getExerciseSummary = () => {
    const muscleGroups = [...new Set(exercises.map(e => e.muscleGroup))];
    return muscleGroups.map(group => {
        const groupExercises = exercises.filter(e => e.muscleGroup === group);
        const byDifficulty = {
            Beginner: groupExercises.filter(e => e.difficulty === 'Beginner').map(e => e.name),
            Intermediate: groupExercises.filter(e => e.difficulty === 'Intermediate').map(e => e.name),
            Advanced: groupExercises.filter(e => e.difficulty === 'Advanced').map(e => e.name),
        };
        return `${group}: Beginner[${byDifficulty.Beginner.join(', ')}], Intermediate[${byDifficulty.Intermediate.join(', ')}], Advanced[${byDifficulty.Advanced.join(', ')}]`;
    }).join('\n');
};

const WELCOME_MESSAGE =
    "Hey there, champ! 💪 I'm your personal gym trainer — backed by FitBox's exercise library. Tell me what body part you want to hit today (chest, back, legs, arms, shoulders, or core), your experience level, and I'll build a plan from exercises that actually exist in the app.";

export const GymTrainerChat = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: WELCOME_MESSAGE }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const CHAT_URL = `${supabaseUrl}/functions/v1/fitness-chat`;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (overrideMessage?: string) => {
        const messageText = overrideMessage ?? input;
        if (!messageText.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content: messageText };
        const nextMessages = [...messages, userMsg];
        setMessages(nextMessages);
        setInput("");
        setIsLoading(true);

        let assistantSoFar = "";
        const upsertAssistant = (nextChunk: string) => {
            assistantSoFar += nextChunk;
            setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                    return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
            });
        };

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.access_token) {
                toast({
                    title: "Sign in required",
                    description: "The AI Gym Trainer requires an account. Please sign in or create an account to start chatting with your AI coach!",
                });
                setMessages(prev => [
                    ...prev,
                    { role: "assistant", content: "To get customized workout plans and advice from your AI Gym Trainer, please sign in or create a free account! 💪" }
                ]);
                setIsLoading(false);
                return;
            }

            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                "apikey": supabasePublishableKey,
                "Authorization": `Bearer ${session.access_token}`,
            };

            const resp = await fetch(CHAT_URL, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    messages: nextMessages,
                    exerciseData: getExerciseSummary(),
                }),
            });

            if (resp.status === 429 || resp.status === 402) {
                const error = await resp.json();
                toast({ title: "Error", description: error.error, variant: "destructive" });
                setIsLoading(false);
                return;
            }

            if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let textBuffer = "";
            let streamDone = false;

            while (!streamDone) {
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
                    if (jsonStr === "[DONE]") {
                        streamDone = true;
                        break;
                    }

                    try {
                        const parsed = JSON.parse(jsonStr);
                        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
                        if (content) upsertAssistant(content);
                    } catch (parseError) {
                        console.warn("Failed to parse streaming chunk:", parseError);
                        textBuffer = line + "\n" + textBuffer;
                        break;
                    }
                }
            }

            if (textBuffer.trim()) {
                for (let raw of textBuffer.split("\n")) {
                    if (!raw) continue;
                    if (raw.endsWith("\r")) raw = raw.slice(0, -1);
                    if (raw.startsWith(":") || raw.trim() === "") continue;
                    if (!raw.startsWith("data: ")) continue;
                    const jsonStr = raw.slice(6).trim();
                    if (jsonStr === "[DONE]") continue;
                    try {
                        const parsed = JSON.parse(jsonStr);
                        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
                        if (content) upsertAssistant(content);
                    } catch (parseError) {
                        console.warn("Failed to parse remaining chunk:", parseError);
                    }
                }
            }

            setIsLoading(false);
        } catch (e) {
            console.error("Gym trainer chat error:", e);
            toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const resetChat = () => {
        setMessages([{ role: "assistant", content: WELCOME_MESSAGE }]);
    };

    // Render formatted message content
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

    // Only show for authenticated users
    if (!user) {
        return null;
    }

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg bg-primary hover:bg-primary/90 z-50 animate-pulse"
                size="icon"
                title="Chat with your Gym Trainer"
            >
                <span className="text-2xl">💪</span>
            </Button>
        );
    }

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                onClick={() => setIsOpen(false)}
            />

            {/* Chat card */}
            <Card className="fixed bottom-6 right-6 w-[400px] h-[550px] flex flex-col shadow-2xl border-2 border-primary/50 bg-background z-[70]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">💪</span>
                        <div>
                            <h3 className="font-bold">Your Gym Trainer</h3>
                            <p className="text-xs opacity-80">Always here to help you grow!</p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={resetChat}
                            className="hover:bg-primary-foreground/20 text-primary-foreground h-8 w-8"
                            title="Start new conversation"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-primary-foreground/20 text-primary-foreground h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card/50">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${msg.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-br-md"
                                        : "bg-background border border-border text-foreground rounded-bl-md"
                                    }`}
                            >
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {renderMessageContent(msg.content)}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-background border border-border text-foreground rounded-2xl rounded-bl-md p-3 shadow-sm flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <span className="text-sm text-muted-foreground">Thinking...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border bg-background rounded-b-lg">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask your trainer..."
                            disabled={isLoading}
                            className="flex-1 bg-card border-border focus:ring-primary"
                        />
                        <Button
                            onClick={() => sendMessage()}
                            disabled={isLoading || !input.trim()}
                            size="icon"
                            className="bg-primary hover:bg-primary/90"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </>
    );
};
