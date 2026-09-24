import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useGymBuddyChat } from "@/hooks/useGymBuddyChat";
import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, ArrowLeft, Check, CheckCheck, Target, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WorkoutStreak } from "@/components/gymbuddy/WorkoutStreak";
import { GymBuddySessionModal } from "@/components/gymbuddy/GymBuddySessionModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

export default function GymBuddyChat() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user, authUserId } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { messages, loading, partner, sendMessage } = useGymBuddyChat(matchId || '');
  const activeAuthUserId = authUserId || user?.authUserId || user?.id;
  
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{id: number, emoji: string}[]>([]);
  const [isLiveWorkout] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const QUICK_REACTIONS = ["🔥", "💪", "👑", "⚡"];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    try {
      setSending(true);
      await sendMessage(inputValue);
      setInputValue("");
    } catch (err: unknown) {
      toast({
        title: "Failed to send message",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleQuickReaction = async (emoji: string) => {
    // Show local floating animation
    const id = Date.now() + Math.random();
    setFloatingEmojis(prev => [...prev, { id, emoji }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 2000);

    // Send as message
    try {
      await sendMessage(emoji);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !partner) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background h-screen overflow-hidden relative">
      <Header />
      
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card z-10 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate('/gymbuddy/matches')} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={partner.avatar_url} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {partner.display_name?.substring(0,2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1 min-w-0">
          <h2 className="text-sm font-semibold truncate">{partner.display_name}</h2>
          <p className="text-xs text-muted-foreground truncate">{partner.gym_location}</p>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 text-orange-500">
              <Target className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader className="mb-6">
              <SheetTitle>Match Details</SheetTitle>
            </SheetHeader>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Shared Streak</h3>
                <WorkoutStreak matchId={matchId!} />
                <Button 
                  className="w-full mt-3" 
                  variant="outline"
                  onClick={() => setSessionModalOpen(true)}
                >
                  Log Session
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Live Session Widget */}
      {isLiveWorkout && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between z-10 shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-xs font-semibold text-primary">{partner.display_name} is crushing {partner.workout_split} at the gym right now!</span>
          </div>
          <Activity className="w-4 h-4 text-primary animate-pulse" />
        </div>
      )}

      <GymBuddySessionModal
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        matchId={matchId!}
        partnerName={partner.display_name}
      />

      {/* Floating Emojis Overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {floatingEmojis.map((item) => (
            <motion.div
              key={item.id}
              initial={{ y: "80vh", x: "50%", opacity: 1, scale: 0.5 }}
              animate={{ 
                y: "20vh", 
                x: `calc(50% + ${(Math.random() - 0.5) * 100}px)`,
                opacity: 0,
                scale: 2 
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute text-5xl"
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-50">
            <div className="bg-background rounded-full p-4 mb-4">
              <span className="text-4xl">👋</span>
            </div>
            <p className="text-sm">Say hello to {partner.display_name}!</p>
            <p className="text-xs mt-1">Plan your next workout session together.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === activeAuthUserId;
            const showTime = index === 0 || 
              new Date(msg.sent_at!).getTime() - new Date(messages[index - 1].sent_at!).getTime() > 5 * 60 * 1000;
              
            const isEmojiOnly = QUICK_REACTIONS.includes(msg.content);

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {showTime && (
                  <span className="text-[10px] text-muted-foreground mb-1 mx-2">
                    {format(new Date(msg.sent_at!), 'MMM d, h:mm a')}
                  </span>
                )}
                <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMe && (
                    <Avatar className="h-6 w-6 shrink-0 mb-1">
                      <AvatarImage src={partner.avatar_url} />
                      <AvatarFallback className="text-[8px]">{partner.display_name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}
                  <div 
                    className={`${isEmojiOnly ? 'text-4xl bg-transparent shadow-none' : 'rounded-2xl px-4 py-2 text-sm shadow-sm'} ${
                      !isEmojiOnly && isMe 
                        ? 'bg-primary text-primary-foreground rounded-br-sm' 
                        : !isEmojiOnly ? 'bg-card text-card-foreground border rounded-bl-sm' : ''
                    }`}
                  >
                    {msg.content}
                    {isMe && !isEmojiOnly && (
                      <span className="ml-2 inline-flex items-center align-middle opacity-70">
                        {msg.is_read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t space-y-3">
        {/* Quick Reactions Bar */}
        <div className="flex gap-4 justify-center items-center">
          {QUICK_REACTIONS.map(emoji => (
            <button
              key={emoji}
              onClick={() => handleQuickReaction(emoji)}
              className="text-2xl hover:scale-125 transition-transform active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message ${partner.display_name}...`}
            className="flex-1 rounded-full bg-muted/50 focus-visible:ring-primary/50"
            disabled={sending}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!inputValue.trim() || sending}
            className="rounded-full shrink-0 shadow-sm"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
