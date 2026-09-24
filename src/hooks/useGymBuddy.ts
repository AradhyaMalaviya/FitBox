import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GymBuddyProfile, GymBuddyCandidate } from '@/lib/gymBuddyTypes';
import { calculateCompatibilityScore } from '@/lib/compatibilityScore';

export function useGymBuddy() {
  const { user, authUserId } = useAuth();
  const effectiveUserId = authUserId || user?.authUserId || user?.id;
  const isGuest = user?.isGuest === true || effectiveUserId === 'guest';

  const [profile, setProfile] = useState<GymBuddyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!effectiveUserId || isGuest) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gymbuddy_profiles')
        .select('*')
        .eq('id', effectiveUserId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data as GymBuddyProfile | null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId, isGuest]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async (updates: Partial<GymBuddyProfile>) => {
    if (isGuest) throw new Error('Sign up to save your GymBuddy profile!');
    if (!effectiveUserId) throw new Error('No authenticated user found');
    try {
      const { data, error } = await supabase
        .from('gymbuddy_profiles')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert({ id: effectiveUserId, ...updates } as any)
        .select()
        .single();

      if (error) throw error;
      setProfile(data as GymBuddyProfile);
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      if (msg === 'Failed to fetch') {
         throw new Error("Network Error: Cannot connect to Supabase. Your project might be paused or blocked by Brave Shields.");
      }
      throw err;
    }
  };

  const getCandidates = async (): Promise<GymBuddyCandidate[]> => {
    if (isGuest) return [];
    if (!effectiveUserId || !profile) return [];
    
    try {
      // 1. Get IDs of users we've already swiped on
      const { data: swipes } = await supabase
        .from('gymbuddy_swipes')
        .select('target_id')
        .eq('swiper_id', effectiveUserId);
        
      const swipedIds = swipes?.map(s => s.target_id) || [];
      
      // 2. Fetch profiles of discoverable users, excluding self and already swiped
      let query = supabase
        .from('gymbuddy_profiles')
        .select('*')
        .eq('is_discoverable', true)
        .neq('id', effectiveUserId);
        
      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`);
      }

      const { data: candidates, error } = await query;

      if (error) throw error;

      // Client-side fallback filter in case DB filter didn't work as expected
      const filteredCandidates = (candidates as GymBuddyProfile[]).filter(
        c => !swipedIds.includes(c.id)
      );

      // 3. Calculate compatibility scores
      const scoredCandidates = filteredCandidates.map(candidate => {
        const { score, compatibilityLabel } = calculateCompatibilityScore(profile, candidate);
        return {
          ...candidate,
          compatibility_score: score,
          compatibility_label: compatibilityLabel
        };
      });

      // 4. Sort by score descending
      scoredCandidates.sort((a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0));

      return scoredCandidates;
    } catch (err: unknown) {
      console.error('Error fetching candidates:', err);
      return [];
    }
  };

  const swipe = async (targetId: string, direction: 'right' | 'left'): Promise<{ match: boolean }> => {
    if (isGuest) throw new Error('Sign up to use GymBuddy matching!');
    if (!effectiveUserId) throw new Error('No authenticated user found');
    
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
        const { data: mutualSwipe } = await supabase
          .from('gymbuddy_swipes')
          .select('*')
          .eq('swiper_id', targetId)
          .eq('target_id', effectiveUserId)
          .eq('direction', 'right')
          .maybeSingle();

        if (mutualSwipe) {
          // It's a match!
          const user1_id = effectiveUserId < targetId ? effectiveUserId : targetId;
          const user2_id = effectiveUserId < targetId ? targetId : effectiveUserId;

          const { error: matchError } = await supabase
            .from('gymbuddy_matches')
            .insert({
              user1_id,
              user2_id,
              shared_streak: 0
            });

          if (matchError && matchError.code !== '23505') {
            throw matchError;
          }
          
          return { match: true };
        }
      }

      return { match: false };
    } catch (err: unknown) {
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
