import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GymBuddyProfile, GymBuddyCandidate } from '@/lib/gymBuddyTypes';
import { calculateCompatibilityScore } from '@/lib/compatibilityScore';
import {
  cacheLocalMatches,
  cacheLocalProfiles,
  ensureLocalProfile,
  getLocalCandidates,
  getLocalProfile,
  isOfflineError,
  recordLocalSwipe,
  upsertLocalProfile,
} from '@/lib/mockDatabase';

export function useGymBuddy() {
  const { user, authUserId } = useAuth();
  const effectiveUserId = authUserId || user?.authUserId || (user?.isGuest ? 'guest' : undefined);
  const isGuest = user?.isGuest === true || effectiveUserId === 'guest';

  const [profile, setProfile] = useState<GymBuddyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!effectiveUserId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    if (isGuest) {
      setProfile(ensureLocalProfile(effectiveUserId, user?.username || 'FitBox Guest'));
      setError(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('gymbuddy_profiles')
        .select('*')
        .eq('id', effectiveUserId)
        .maybeSingle();

      if (error) throw error;
      const nextProfile = data as GymBuddyProfile | null;
      if (nextProfile) {
        upsertLocalProfile(nextProfile);
        setProfile(nextProfile);
      } else {
        const cachedProfile = getLocalProfile(effectiveUserId);
        if (!cachedProfile) {
          setProfile(null);
          return;
        }
        const { data: syncedProfile, error: syncError } = await supabase
          .from('gymbuddy_profiles')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .upsert(cachedProfile as any)
          .select()
          .maybeSingle();
        if (syncError) {
          if (!isOfflineError(syncError)) throw syncError;
          setProfile(cachedProfile);
          return;
        }
        const savedProfile = (syncedProfile as GymBuddyProfile | null) || cachedProfile;
        upsertLocalProfile(savedProfile);
        setProfile(savedProfile);
      }
    } catch (err: unknown) {
      if (isOfflineError(err)) {
        setProfile(getLocalProfile(effectiveUserId) || ensureLocalProfile(effectiveUserId, user?.username || 'FitBox Guest'));
        setError(null);
        return;
      }
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId, isGuest, user?.username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async (updates: Partial<GymBuddyProfile>) => {
    if (!effectiveUserId) throw new Error('No authenticated user found');
    const nextProfile = {
      ...(profile || ensureLocalProfile(effectiveUserId, user?.username || 'FitBox Guest')),
      ...updates,
      id: effectiveUserId,
      updated_at: new Date().toISOString(),
    } as GymBuddyProfile;
    if (isGuest) {
      upsertLocalProfile(nextProfile);
      setProfile(nextProfile);
      return nextProfile;
    }
    try {
      const { data, error } = await supabase
        .from('gymbuddy_profiles')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(nextProfile as any)
        .select()
        .single();

      if (error) throw error;
      upsertLocalProfile(data as GymBuddyProfile);
      setProfile(data as GymBuddyProfile);
      setError(null);
      return data as GymBuddyProfile;
    } catch (err: unknown) {
      if (isOfflineError(err)) {
        upsertLocalProfile(nextProfile);
        setProfile(nextProfile);
        setError(null);
        return nextProfile;
      }
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      if (msg === 'Failed to fetch') {
         throw new Error("Network Error: Cannot connect to Supabase. Your project might be paused or blocked by Brave Shields.");
      }
      throw err;
    }
  };

  const getCandidates = useCallback(async (): Promise<GymBuddyCandidate[]> => {
    if (!effectiveUserId || !profile) return [];
    if (isGuest) return getLocalCandidates(effectiveUserId, profile);
    
    try {
      let filteredCandidates: GymBuddyProfile[] = [];

      // 1. Try scalable database RPC anti-join first
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_gymbuddy_candidates', { p_limit: 50 });

      if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
        filteredCandidates = rpcData as GymBuddyProfile[];
      } else {
        // 2. Fallback: bounded query with client-side Set exclusion
        const { data: swipes } = await supabase
          .from('gymbuddy_swipes')
          .select('target_id')
          .eq('swiper_id', effectiveUserId);
          
        const swipedIds = new Set(swipes?.map(s => s.target_id) || []);
        
        const PAGE_SIZE = 50;
        const { data: candidates, error } = await supabase
          .from('gymbuddy_profiles')
          .select('*')
          .eq('is_discoverable', true)
          .neq('id', effectiveUserId)
          .limit(PAGE_SIZE + swipedIds.size)
          .order('created_at', { ascending: false });

        if (error) throw error;

        filteredCandidates = (candidates as GymBuddyProfile[] || []).filter(
          c => !swipedIds.has(c.id)
        ).slice(0, PAGE_SIZE);
      }

      // 3. Calculate compatibility scores with full dimensional breakdown
      const scoredCandidates = filteredCandidates.map(candidate => {
        const { score, compatibilityLabel, breakdown } = calculateCompatibilityScore(profile, candidate);
        return {
          ...candidate,
          compatibility_score: score,
          compatibility_label: compatibilityLabel,
          compatibility_breakdown: breakdown,
        };
      });

      cacheLocalProfiles(filteredCandidates);

      // 4. Sort by score descending
      scoredCandidates.sort((a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0));

      return scoredCandidates;
    } catch (err: unknown) {
      if (isOfflineError(err)) {
        setError(null);
        return getLocalCandidates(effectiveUserId, profile);
      }
      console.error('Error fetching candidates:', err);
      return [];
    }
  }, [effectiveUserId, isGuest, profile]);

  const swipe = async (targetId: string, direction: 'right' | 'left'): Promise<{ match: boolean }> => {
    if (!effectiveUserId) throw new Error('No authenticated user found');
    if (isGuest) return recordLocalSwipe(effectiveUserId, targetId, direction);
    
    try {
      // 1. Record the swipe
      const { error: swipeError } = await supabase
        .from('gymbuddy_swipes')
        .insert({
          swiper_id: effectiveUserId,
          target_id: targetId,
          direction
        });

      if (swipeError) throw swipeError;

      // 2. Check for match if swiped right
      if (direction === 'right') {
        const { data: mutualSwipe, error: mutualError } = await supabase
          .from('gymbuddy_swipes')
          .select('*')
          .eq('swiper_id', targetId)
          .eq('target_id', effectiveUserId)
          .eq('direction', 'right')
          .maybeSingle();
        if (mutualError) throw mutualError;

        if (mutualSwipe) {
          // It's a match!
          const user1_id = effectiveUserId < targetId ? effectiveUserId : targetId;
          const user2_id = effectiveUserId < targetId ? targetId : effectiveUserId;

          const { data: createdMatch, error: matchError } = await supabase
            .from('gymbuddy_matches')
            .insert({
              user1_id,
              user2_id,
              shared_streak: 0
            })
            .select()
            .maybeSingle();

          if (matchError && matchError.code !== '23505') {
            throw matchError;
          }

          if (createdMatch?.id && createdMatch.user1_id && createdMatch.user2_id) {
            cacheLocalMatches([{
              id: createdMatch.id,
              user1_id: createdMatch.user1_id,
              user2_id: createdMatch.user2_id,
              matched_at: createdMatch.matched_at ?? undefined,
              shared_streak: createdMatch.shared_streak ?? 0,
              last_session_logged: createdMatch.last_session_logged ?? undefined,
            }]);
          }
          recordLocalSwipe(effectiveUserId, targetId, direction);
          return { match: true };
        }
      }

      recordLocalSwipe(effectiveUserId, targetId, direction);
      return { match: false };
    } catch (err: unknown) {
      if (isOfflineError(err)) {
        setError(null);
        return recordLocalSwipe(effectiveUserId, targetId, direction);
      }
      console.error('Error swiping:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === 'Failed to fetch') {
         throw new Error("Network Error: Cannot connect to Supabase.");
      }
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    saveProfile,
    getCandidates,
    swipe,
    refreshProfile: fetchProfile
  };
}
