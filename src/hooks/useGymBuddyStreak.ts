import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfWeek, format, parseISO } from 'date-fns';

export function calculateStreakFromLogs(sessionDates: string[], today = new Date()): { currentStreak: number; loggedThisWeek: boolean } {
  if (!sessionDates.length) {
    return { currentStreak: 0, loggedThisWeek: false };
  }

  const weeks = new Set(sessionDates.map(dateStr => 
    format(startOfWeek(parseISO(dateStr), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  ));
  
  const thisWeekStr = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const lastWeekStr = format(startOfWeek(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  
  const loggedThisWeek = weeks.has(thisWeekStr);
  
  if (!loggedThisWeek && !weeks.has(lastWeekStr)) {
    return { currentStreak: 0, loggedThisWeek: false };
  }

  let currentStreak = 0;
  let checkDate = loggedThisWeek ? today : new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  while (true) {
    const weekStr = format(startOfWeek(checkDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    if (weeks.has(weekStr)) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }

  return { currentStreak, loggedThisWeek };
}

export function useGymBuddyStreak(matchId: string) {
  const { user, authUserId } = useAuth();
  const activeAuthUserId = authUserId || user?.authUserId || user?.id;

  const [streak, setStreak] = useState(0);
  const [hasLoggedThisWeek, setHasLoggedThisWeek] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!matchId) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('gymbuddy_session_logs')
      .select('session_date')
      .eq('match_id', matchId)
      .order('session_date', { ascending: false });

    if (data && !error) {
      const { currentStreak, loggedThisWeek } = calculateStreakFromLogs(data.map(d => d.session_date));
      setStreak(currentStreak);
      setHasLoggedThisWeek(loggedThisWeek);
    }
    setLoading(false);
  }, [matchId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const logSession = async (sessionDate: Date, notes: string) => {
    if (!activeAuthUserId || !matchId) return;
    
    const dateStr = format(sessionDate, 'yyyy-MM-dd');
    
    // Prevent duplicate logging for the same date by this user
    const { data: existingLog } = await supabase
      .from('gymbuddy_session_logs')
      .select('id')
      .eq('match_id', matchId)
      .eq('logged_by', activeAuthUserId)
      .eq('session_date', dateStr)
      .maybeSingle();

    if (existingLog) {
      await fetchLogs();
      return;
    }

    const { error: insertError } = await supabase
      .from('gymbuddy_session_logs')
      .insert({
        match_id: matchId,
        logged_by: activeAuthUserId,
        session_date: dateStr,
        notes: notes || null
      });
      
    if (insertError) throw insertError;
    
    // Fetch all logs to calculate the true new streak from actual history
    const { data: allLogs } = await supabase
      .from('gymbuddy_session_logs')
      .select('session_date')
      .eq('match_id', matchId);

    const sessionDates = (allLogs?.map(l => l.session_date) || []);
    const { currentStreak } = calculateStreakFromLogs(sessionDates);

    const { error: updateError } = await supabase
      .from('gymbuddy_matches')
      .update({ 
        shared_streak: currentStreak,
        last_session_logged: new Date().toISOString(),
      })
      .eq('id', matchId);
      
    if (updateError) throw updateError;
      
    await fetchLogs();
  };

  return { streak, hasLoggedThisWeek, loading, logSession, refreshStreak: fetchLogs };
}
