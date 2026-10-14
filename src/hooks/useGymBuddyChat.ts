import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GymBuddyMessage, GymBuddyMatch, GymBuddyProfile } from '@/lib/gymBuddyTypes';
import {
  getLocalMatches,
  getLocalProfile,
  getLocalMessages,
  recordLocalMessage,
  isOfflineError,
} from '@/lib/mockDatabase';

export function useGymBuddyChat(matchId: string) {
  const { user, authUserId } = useAuth();
  const activeAuthUserId = authUserId || user?.authUserId || user?.id;

  const [messages, setMessages] = useState<GymBuddyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<GymBuddyProfile | null>(null);
  const [matchDetails, setMatchDetails] = useState<GymBuddyMatch | null>(null);

  const markMessagesAsRead = useCallback(async (messageIds: string[]) => {
    if (messageIds.length === 0) return;
    try {
      await supabase
        .from('gymbuddy_messages')
        .update({ is_read: true })
        .in('id', messageIds);
    } catch (err) {
      console.error('Failed to mark messages as read', err);
    }
  }, []);

  const loadLocalChatData = useCallback(() => {
    const localMatches = getLocalMatches();
    const match = localMatches.find((m) => m.id === matchId);
    if (match) {
      setMatchDetails(match);
      const partnerId = match.user1_id === activeAuthUserId ? match.user2_id : match.user1_id;
      const localPartner = getLocalProfile(partnerId);
      if (localPartner) setPartner(localPartner);
    }
    const localMsgs = getLocalMessages(matchId);
    setMessages(localMsgs);
  }, [activeAuthUserId, matchId]);

  const fetchChatData = useCallback(async () => {
    if (!activeAuthUserId || !matchId) return;

    if (user?.isGuest) {
      loadLocalChatData();
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch match and partner info
      const { data: matchData, error: matchError } = await supabase
        .from('gymbuddy_matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;
      if (!matchData.user1_id || !matchData.user2_id) {
        throw new Error('Match record is missing a participant');
      }
      setMatchDetails(matchData as GymBuddyMatch);

      const partnerId = matchData.user1_id === activeAuthUserId ? matchData.user2_id : matchData.user1_id;
      
      const { data: partnerData, error: partnerError } = await supabase
        .from('gymbuddy_profiles')
        .select('*')
        .eq('id', partnerId)
        .single();
        
      if (partnerError) throw partnerError;
      setPartner(partnerData as GymBuddyProfile);

      // 2. Fetch messages
      const { data: messagesData, error: msgError } = await supabase
        .from('gymbuddy_messages')
        .select('*')
        .eq('match_id', matchId)
        .order('sent_at', { ascending: true });

      if (msgError) throw msgError;
      setMessages(messagesData as GymBuddyMessage[]);

      // 3. Mark unread messages from partner as read
      const unreadFromPartner = messagesData
        .filter(m => m.sender_id !== activeAuthUserId && !m.is_read)
        .map(m => m.id);

      if (unreadFromPartner.length > 0) {
        await markMessagesAsRead(unreadFromPartner);
        setMessages(prev => prev.map(m => 
          unreadFromPartner.includes(m.id) ? { ...m, is_read: true } : m
        ));
      }

    } catch (err) {
      if (isOfflineError(err)) {
        loadLocalChatData();
      } else {
        console.error('Failed to load chat data:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [activeAuthUserId, matchId, markMessagesAsRead, user?.isGuest, loadLocalChatData]);

  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);

  // Realtime subscription
  useEffect(() => {
    if (!matchId || !activeAuthUserId || user?.isGuest) return;

    const channel = supabase
      .channel(`gymbuddy_chat_${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'gymbuddy_messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          const newMsg = payload.new as GymBuddyMessage;
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          if (newMsg.sender_id !== activeAuthUserId && !newMsg.is_read) {
            markMessagesAsRead([newMsg.id]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'gymbuddy_messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          const updatedMsg = payload.new as GymBuddyMessage;
          setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, activeAuthUserId, markMessagesAsRead, user?.isGuest]);

  const sendMessage = async (content: string) => {
    if (!activeAuthUserId || !matchId || !content.trim()) return;

    if (user?.isGuest) {
      const localMsg = recordLocalMessage(matchId, activeAuthUserId, content.trim());
      setMessages((prev) => [...prev, localMsg]);
      return localMsg;
    }

    try {
      const { data, error } = await supabase
        .from('gymbuddy_messages')
        .insert({
          match_id: matchId,
          sender_id: activeAuthUserId,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      if (isOfflineError(err)) {
        const localMsg = recordLocalMessage(matchId, activeAuthUserId, content.trim());
        setMessages((prev) => [...prev, localMsg]);
        return localMsg;
      }
      console.error('Failed to send message:', err);
      throw err;
    }
  };

  return {
    messages,
    loading,
    partner,
    matchDetails,
    sendMessage
  };
}
