/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GymBuddyMatch, GymBuddyProfile } from '@/lib/gymBuddyTypes';

export const GymBuddyNotificationContext = createContext({});

export function GymBuddyNotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, authUserId } = useAuth();
  const activeAuthUserId = authUserId || user?.authUserId || user?.id;

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const pathnameRef = React.useRef(location.pathname);
  pathnameRef.current = location.pathname;
  
  const [matches, setMatches] = useState<GymBuddyMatch[]>([]);
  const [partnerProfiles, setPartnerProfiles] = useState<Record<string, GymBuddyProfile>>({});
  const previousStreaksRef = React.useRef<Record<string, number>>({});
  const notifiedMilestonesRef = React.useRef<Set<string>>(new Set());

  const fetchPartnerProfile = async (partnerId: string): Promise<GymBuddyProfile | null> => {
    const { data, error } = await supabase
      .from('gymbuddy_profiles')
      .select('*')
      .eq('id', partnerId)
      .single();
    if (error) {
      console.error('Failed to fetch partner profile:', error.message);
      return null;
    }
    return data as GymBuddyProfile | null;
  };

  // Initial load
  useEffect(() => {
    if (!activeAuthUserId) return;
    
    const loadInitialData = async () => {
      const { data: matchData } = await supabase
        .from('gymbuddy_matches')
        .select('*')
        .or(`user1_id.eq.${activeAuthUserId},user2_id.eq.${activeAuthUserId}`);
        
      if (matchData && matchData.length > 0) {
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
        validMatches.forEach(m => {
          previousStreaksRef.current[m.id] = m.shared_streak ?? 0;
        });
        setMatches(validMatches);
        
        const pIds = validMatches.map(m => m.user1_id === activeAuthUserId ? m.user2_id : m.user1_id);
        const { data: profiles } = await supabase
          .from('gymbuddy_profiles')
          .select('*')
          .in('id', pIds);
          
        if (profiles) {
          const pMap: Record<string, GymBuddyProfile> = {};
          profiles.forEach(p => { pMap[p.id] = p as unknown as GymBuddyProfile; });
          setPartnerProfiles(pMap);
        }
      }
    };
    
    loadInitialData();
  }, [activeAuthUserId]);

  // Match listeners
  useEffect(() => {
    if (!activeAuthUserId) return;

    const handleNewMatch = async (payload: Record<string, unknown>) => {
      const newMatch = payload.new as GymBuddyMatch;
      
      setMatches(prev => {
        if (prev.some(m => m.id === newMatch.id)) return prev;
        return [...prev, newMatch];
      });

      const partnerId = newMatch.user1_id === activeAuthUserId ? newMatch.user2_id : newMatch.user1_id;
      const partner = await fetchPartnerProfile(partnerId);
      
      if (partner) {
        setPartnerProfiles(prev => ({ ...prev, [partnerId]: partner }));
        toast({
          title: "🎉 You matched!",
          description: `You matched with ${partner.display_name}!`,
          action: (
            <button onClick={() => navigate(`/gymbuddy/chat/${newMatch.id}`)} className="text-sm underline font-medium">
              Say Hi
            </button>
          )
        });
      }
    };

    const matchChannel1 = supabase.channel('matches_user1')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gymbuddy_matches', filter: `user1_id=eq.${activeAuthUserId}` }, handleNewMatch)
      .subscribe();
      
    const matchChannel2 = supabase.channel('matches_user2')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gymbuddy_matches', filter: `user2_id=eq.${activeAuthUserId}` }, handleNewMatch)
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel1);
      supabase.removeChannel(matchChannel2);
    };
  }, [activeAuthUserId, navigate, toast]);

  // Messages and Logs listeners
  useEffect(() => {
    if (!activeAuthUserId || matches.length === 0) return;

    const matchIds = matches.map(m => m.id);

    const channel = supabase.channel('gymbuddy_activity')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gymbuddy_messages' }, (payload) => {
        const msg = payload.new;
        if (!matchIds.includes(msg.match_id)) return;
        if (msg.sender_id !== activeAuthUserId) {
          if (pathnameRef.current === `/gymbuddy/chat/${msg.match_id}`) return;
          
          const match = matches.find(m => m.id === msg.match_id);
          if (match) {
            const partnerId = match.user1_id === activeAuthUserId ? match.user2_id : match.user1_id;
            const partnerName = partnerProfiles[partnerId]?.display_name || 'A partner';
            
            toast({
              title: `💬 New message from ${partnerName}`,
              description: msg.content.length > 30 ? msg.content.substring(0, 30) + '...' : msg.content,
              action: (
                <button onClick={() => navigate(`/gymbuddy/chat/${match.id}`)} className="text-sm underline font-medium">
                  Reply
                </button>
              )
            });
          }
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gymbuddy_session_logs' }, (payload) => {
        const log = payload.new;
        if (!matchIds.includes(log.match_id)) return;
        if (log.logged_by !== activeAuthUserId) {
          const match = matches.find(m => m.id === log.match_id);
          if (match) {
            const partnerId = match.user1_id === activeAuthUserId ? match.user2_id : match.user1_id;
            const partnerName = partnerProfiles[partnerId]?.display_name || 'A partner';
            
            toast({
              title: "🏋️ Session Logged!",
              description: `${partnerName} logged a session. Confirm yours to keep the streak going!`,
              action: (
                <button onClick={() => navigate(`/gymbuddy/matches`)} className="text-sm underline font-medium">
                  View
                </button>
              )
            });
          }
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'gymbuddy_matches' }, (payload) => {
         const newMatch = payload.new as GymBuddyMatch;
         if (!newMatch?.id || !matchIds.includes(newMatch.id)) return;
         
         const prevStreak = previousStreaksRef.current[newMatch.id] ?? 0;
         const currentStreak = newMatch.shared_streak ?? 0;
         previousStreaksRef.current[newMatch.id] = currentStreak;

         // Update local matches state so UI reflects new streak
         setMatches(prev => prev.map(m => m.id === newMatch.id ? { ...m, ...newMatch } : m));

         // Milestone notifications fire ONLY when streak strictly increases across a milestone threshold
         const MILESTONES = [4, 8, 12, 26, 52];
         if (currentStreak > prevStreak) {
           for (const milestone of MILESTONES) {
             const milestoneKey = `${newMatch.id}-${milestone}`;
             if (currentStreak >= milestone && prevStreak < milestone && !notifiedMilestonesRef.current.has(milestoneKey)) {
               notifiedMilestonesRef.current.add(milestoneKey);
               const partnerId = newMatch.user1_id === activeAuthUserId ? newMatch.user2_id : newMatch.user1_id;
               const partnerName = partnerProfiles[partnerId]?.display_name || 'your partner';
               toast({
                 title: "🔥 Streak Milestone!",
                 description: `You and ${partnerName} hit a ${milestone}-week streak! Keep it up!`,
               });
               break;
             }
           }
         }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeAuthUserId, matches, partnerProfiles, navigate, toast]);

  return (
    <GymBuddyNotificationContext.Provider value={{}}>
      {children}
    </GymBuddyNotificationContext.Provider>
  );
}

export const useGymBuddyNotifications = () => {
  return useContext(GymBuddyNotificationContext);
};
