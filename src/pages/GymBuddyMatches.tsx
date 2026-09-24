import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { GymBuddyMatch, GymBuddyProfile } from "@/lib/gymBuddyTypes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageCircle, MapPin, Calendar, Flame, Dumbbell, ArrowLeft, Users, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GymBuddySessionModal } from "@/components/gymbuddy/GymBuddySessionModal";

type MatchWithPartner = GymBuddyMatch & {
  partner: GymBuddyProfile;
  unreadCount: number;
};

export default function GymBuddyMatches() {
  const { user, authUserId } = useAuth();
  const activeAuthUserId = authUserId || user?.authUserId || user?.id;

  const [matches, setMatches] = useState<MatchWithPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionModal, setSessionModal] = useState({ isOpen: false, matchId: "", partnerName: "" });
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadMatches = useCallback(async () => {
    if (!activeAuthUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1. Fetch matches
      const { data: matchData, error: matchError } = await supabase
        .from('gymbuddy_matches')
        .select('*')
        .or(`user1_id.eq.${activeAuthUserId},user2_id.eq.${activeAuthUserId}`)
        .order('matched_at', { ascending: false });

      if (matchError) throw matchError;

      if (!matchData || matchData.length === 0) {
        setMatches([]);
        return;
      }

      // 2. Extract partner IDs
      const validMatches: GymBuddyMatch[] = matchData.flatMap(match => {
        if (typeof match.user1_id !== 'string' || typeof match.user2_id !== 'string') return [];
        return [{
          ...match,
          user1_id: match.user1_id,
          user2_id: match.user2_id,
          shared_streak: match.shared_streak ?? 0,
          matched_at: match.matched_at ?? undefined,
          last_session_logged: match.last_session_logged ?? undefined,
        }];
      });
      const partnerIds = validMatches.map(m => m.user1_id === activeAuthUserId ? m.user2_id : m.user1_id);

      // 3. Fetch partner profiles
      const { data: profileData, error: profileError } = await supabase
        .from('gymbuddy_profiles')
        .select('*')
        .in('id', partnerIds);

      if (profileError) throw profileError;

      // 4. Fetch unread messages count
      const { data: messageData, error: messageError } = await supabase
        .from('gymbuddy_messages')
        .select('match_id')
        .neq('sender_id', activeAuthUserId)
        .eq('is_read', false);

      if (messageError) throw messageError;

      // 5. Combine data
      const combined = validMatches.map(match => {
        const partnerId = match.user1_id === activeAuthUserId ? match.user2_id : match.user1_id;
        const partner = profileData?.find(p => p.id === partnerId);
        const unreadCount = messageData?.filter(m => m.match_id === match.id).length || 0;
        
        return {
          ...match,
          partner,
          unreadCount
        } as MatchWithPartner;
      }).filter(m => m.partner);

      setMatches(combined);
    } catch (error: unknown) {
      toast({
        title: "Error loading matches",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [activeAuthUserId, toast]);

  useEffect(() => {
    if (activeAuthUserId) {
      loadMatches();
    }
  }, [activeAuthUserId, loadMatches]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* GymBuddy Navigation Bar */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Button>
            <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/gymbuddy/discover')}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <Flame className="w-3.5 h-3.5" />
              Discover
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="text-xs font-semibold gap-1.5 bg-primary/15 text-primary hover:bg-primary/20"
            >
              <Users className="w-3.5 h-3.5" />
              Matches
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/gymbuddy/setup')}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            Profile Setup
          </Button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Matches</h1>
            <p className="text-muted-foreground mt-2">
              Connect with your gym partners and keep the streak alive.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/gymbuddy/discover')}>
            Keep Swiping
          </Button>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
            <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
            <p className="text-muted-foreground mb-6">
              Head over to discovery to find your perfect workout partner.
            </p>
            <Button onClick={() => navigate('/gymbuddy/discover')}>
              Discover Partners
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map(match => (
              <Card 
                key={match.id} 
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-border/50"
                onClick={() => navigate(`/gymbuddy/chat/${match.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    <div className="relative mr-4">
                      <Avatar className="w-16 h-16 border-2 border-primary/20">
                        <AvatarImage src={match.partner.avatar_url} />
                        <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                          {match.partner.display_name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {match.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-bold border-2 border-background">
                          {match.unreadCount}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{match.partner.display_name}</h3>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate">{match.partner.gym_location}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {match.shared_streak > 0 && (
                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20">
                          <Flame className="w-3 h-3 mr-1" />
                          {match.shared_streak} Week{match.shared_streak !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      {match.last_session_logged && (
                        <div className="flex items-center text-[10px] text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(match.last_session_logged), 'MMM d')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 px-4 py-3 flex gap-2 border-t">
                    <Button 
                      className="flex-1 rounded-full text-xs h-9" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/gymbuddy/chat/${match.id}`);
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-full text-xs h-9"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSessionModal({ isOpen: true, matchId: match.id, partnerName: match.partner.display_name });
                      }}
                    >
                      <Dumbbell className="w-4 h-4 mr-2" />
                      Log Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <GymBuddySessionModal
        isOpen={sessionModal.isOpen}
        onClose={() => {
          setSessionModal(prev => ({ ...prev, isOpen: false }));
          loadMatches();
        }}
        matchId={sessionModal.matchId}
        partnerName={sessionModal.partnerName}
      />
    </div>
  );
}
