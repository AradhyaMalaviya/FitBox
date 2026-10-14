/**
 * Client-Side Mock Database Layer for FitBox Prototype.
 * Provides 1:1 structural parity with Postgres/Supabase tables using localStorage.
 */

import type {
  GymBuddyProfile,
  GymBuddyMatch,
  GymBuddySwipe,
  GymBuddyMessage,
  GymBuddyCandidate,
} from './gymBuddyTypes';
import { calculateCompatibilityScore } from './compatibilityScore';

export interface MockProfile {
  id: string;
  username: string;
  phone?: string;
  displayName: string;
  bio?: string;
  fitnessGoals: string[];
  workoutSplit: string;
  experienceLevel: string;
  preferredTimings: string[];
  gymLocation: string;
  avatarUrl?: string;
  isDiscoverable: boolean;
  profileVisibility: 'public' | 'private';
  gender?: string;
  createdAt: string;
}

export interface MockWorkoutSession {
  id: string;
  user_id: string;
  name: string;
  started_at: string;
  completed_at: string;
  duration_seconds: number;
}

export interface MockWorkoutLog {
  id: string;
  session_id: string;
  exercise_name: string;
  exercise_id: string;
  order_index: number;
}

export interface MockWorkoutSet {
  id: string;
  log_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  completed: boolean;
}

export interface MockGymBuddyProfile {
  id: string;
  display_name: string;
  bio: string;
  fitness_goals: string[];
  workout_split: 'push_pull_legs' | 'full_body' | 'upper_lower' | 'bro_split' | 'athletic' | 'cardio_focused';
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  preferred_timings: string[];
  gym_location: string;
  gender: string;
  age_range_min: number;
  age_range_max: number;
  is_discoverable: boolean;
  profile_visibility: string;
  avatar_url: string;
  created_at: string;
}

export interface MockSwipe {
  id: string;
  swiper_id: string;
  target_id: string;
  direction: 'left' | 'right';
  created_at: string;
}

export interface MockMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
  shared_streak: number;
  last_session_logged?: string;
}

export interface MockMessage {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
  is_read: boolean;
}

const STORAGE_KEYS = {
  PROFILES: 'fitbox_profiles',
  WORKOUT_SESSIONS: 'fitbox_workout_sessions',
  WORKOUT_LOGS: 'fitbox_workout_logs',
  WORKOUT_SETS: 'fitbox_workout_sets',
  GYMBUDDY_PROFILES: 'fitbox_gymbuddy_profiles',
  GYMBUDDY_SWIPES: 'fitbox_gymbuddy_swipes',
  GYMBUDDY_MATCHES: 'fitbox_gymbuddy_matches',
  GYMBUDDY_MESSAGES: 'fitbox_gymbuddy_messages',
  CURRENT_SESSION: 'fitbox_current_session',
};

// Seed Fictional GymBuddy Profiles (15-20 profiles)
export const INITIAL_GYMBUDDY_PROFILES: MockGymBuddyProfile[] = [
  {
    id: 'buddy-1',
    display_name: 'Aarav Sharma',
    bio: 'PPL lifter pushing heavy volume at Cult Fit HSR. Looking for a serious leg day partner!',
    fitness_goals: ['Hypertrophy', 'Strength'],
    workout_split: 'push_pull_legs',
    experience_level: 'intermediate',
    preferred_timings: ['Morning', '6:00 AM - 8:00 AM'],
    gym_location: 'Cult Fit, HSR Layout, Bengaluru',
    gender: 'Male',
    age_range_min: 22,
    age_range_max: 28,
    is_discoverable: true,
    profile_visibility: 'public',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString(),
  },
  {
    id: 'buddy-2',
    display_name: 'Priya Patel',
    bio: 'Athletic functional training & powerlifting. 5 AM club at Gold Gym Koramangala!',
    fitness_goals: ['Strength', 'Athletic Performance'],
    workout_split: 'upper_lower',
    experience_level: 'advanced',
    preferred_timings: ['Morning', '5:30 AM - 7:00 AM'],
    gym_location: 'Gold Gym, Koramangala, Bengaluru',
    gender: 'Female',
    age_range_min: 24,
    age_range_max: 30,
    is_discoverable: true,
    profile_visibility: 'public',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString(),
  },
  {
    id: 'buddy-3',
    display_name: 'Rohan Verma',
    bio: 'Bro split fan. Arm day every Friday. Let us hit PRs together!',
    fitness_goals: ['Bulk', 'Hypertrophy'],
    workout_split: 'bro_split',
    experience_level: 'intermediate',
    preferred_timings: ['Evening', '7:00 PM - 9:00 PM'],
    gym_location: 'Fitness First, Indiranagar, Bengaluru',
    gender: 'Male',
    age_range_min: 20,
    age_range_max: 26,
    is_discoverable: true,
    profile_visibility: 'public',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString(),
  },
  {
    id: 'buddy-4',
    display_name: 'Ananya Iyer',
    bio: 'Full body strength & mobility enthusiast. Always down for post-workout protein smoothie.',
    fitness_goals: ['Endurance', 'Flexibility'],
    workout_split: 'full_body',
    experience_level: 'beginner',
    preferred_timings: ['Flexible'],
    gym_location: 'Snap Fitness, Whitefield, Bengaluru',
    gender: 'Female',
    age_range_min: 21,
    age_range_max: 27,
    is_discoverable: true,
    profile_visibility: 'public',
    avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString(),
  },
  {
    id: 'buddy-5',
    display_name: 'Vikram Singh',
    bio: 'Powerlifter squatting 200kg+. Need a reliable spotter for heavy bench & deadlifts.',
    fitness_goals: ['Strength', 'Powerlifting'],
    workout_split: 'push_pull_legs',
    experience_level: 'advanced',
    preferred_timings: ['Evening', '6:30 PM - 8:30 PM'],
    gym_location: 'Cult Fit, HSR Layout, Bengaluru',
    gender: 'Male',
    age_range_min: 25,
    age_range_max: 32,
    is_discoverable: true,
    profile_visibility: 'public',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString(),
  },
  {
    id: 'buddy-6',
    display_name: 'Sneha Kulkarni',
    bio: 'HIIT & cardio hybrid training. Preparing for 10k marathon while building lean muscle.',
    fitness_goals: ['Cardio', 'Fat Loss'],
    workout_split: 'cardio_focused',
    experience_level: 'intermediate',
    preferred_timings: ['Morning', '6:30 AM - 7:30 AM'],
    gym_location: 'Gold Gym, Jayanagar, Bengaluru',
    gender: 'Female',
    age_range_min: 23,
    age_range_max: 29,
    is_discoverable: true,
    profile_visibility: 'public',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString(),
  },
  {
    id: 'buddy-7',
    display_name: 'Kabir Mehta',
    bio: 'Calisthenics & weighted dips addict. Training at Cubbon Park outdoors & local gym.',
    fitness_goals: ['Athletic Performance', 'Hypertrophy'],
    workout_split: 'athletic',
    experience_level: 'intermediate',
    preferred_timings: ['Flexible'],
    gym_location: 'Anytime Fitness, MG Road, Bengaluru',
    gender: 'Male',
    age_range_min: 22,
    age_range_max: 27,
    is_discoverable: true,
    profile_visibility: 'public',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString(),
  },
  {
    id: 'buddy-8',
    display_name: 'Diya Nambiar',
    bio: 'Upper/Lower split focus with emphasis on posterior chain. Let us get disciplined!',
    fitness_goals: ['Hypertrophy', 'Strength'],
    workout_split: 'upper_lower',
    experience_level: 'intermediate',
    preferred_timings: ['Evening', '5:30 PM - 7:00 PM'],
    gym_location: 'Cult Fit, Bellandur, Bengaluru',
    gender: 'Female',
    age_range_min: 24,
    age_range_max: 30,
    is_discoverable: true,
    profile_visibility: 'public',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString(),
  },
  {
    id: 'buddy-9',
    display_name: 'Siddharth Rao',
    bio: 'Strict PPL program. Track macros carefully & push progressive overload every session.',
    fitness_goals: ['Bulk', 'Hypertrophy'],
    workout_split: 'push_pull_legs',
    experience_level: 'intermediate',
    preferred_timings: ['Morning', '7:00 AM - 8:30 AM'],
    gym_location: 'Fitness First, Indiranagar, Bengaluru',
    gender: 'Male',
    age_range_min: 23,
    age_range_max: 29,
    is_discoverable: true,
    profile_visibility: 'public',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString(),
  },
  {
    id: 'buddy-10',
    display_name: 'Rhea Deshmukh',
    bio: 'Full body strength workouts 3x a week. Consistent and focused training sessions.',
    fitness_goals: ['General Fitness', 'Recomposition'],
    workout_split: 'full_body',
    experience_level: 'beginner',
    preferred_timings: ['Evening', '6:00 PM - 7:30 PM'],
    gym_location: 'Gold Gym, Koramangala, Bengaluru',
    gender: 'Female',
    age_range_min: 22,
    age_range_max: 28,
    is_discoverable: true,
    profile_visibility: 'public',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString(),
  },
  {
    id: 'buddy-11',
    display_name: 'Arjun Das',
    bio: 'Hybrid athlete combining heavy compound lifts with sprint conditioning.',
    fitness_goals: ['Athletic Performance', 'Conditioning'],
    workout_split: 'athletic',
    experience_level: 'advanced',
    preferred_timings: ['Morning', '6:00 AM - 7:30 AM'],
    gym_location: 'Cult Fit, HSR Layout, Bengaluru',
    gender: 'Male',
    age_range_min: 26,
    age_range_max: 33,
    is_discoverable: true,
    profile_visibility: 'public',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString(),
  },
  {
    id: 'buddy-12',
    display_name: 'Kavya Reddy',
    bio: 'PPL routine focusing on glute & hamstrings hypertrophy. Looking for workout partner.',
    fitness_goals: ['Hypertrophy', 'Tone'],
    workout_split: 'push_pull_legs',
    experience_level: 'intermediate',
    preferred_timings: ['Evening', '7:00 PM - 8:30 PM'],
    gym_location: 'Snap Fitness, Whitefield, Bengaluru',
    gender: 'Female',
    age_range_min: 23,
    age_range_max: 29,
    is_discoverable: true,
    profile_visibility: 'public',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString(),
  },
  {
    id: 'buddy-13',
    display_name: 'Manish Pandey',
    bio: 'Classic 5-day bro split. Biceps, triceps, chest, back, legs. Old school lifting.',
    fitness_goals: ['Bulk', 'Strength'],
    workout_split: 'bro_split',
    experience_level: 'intermediate',
    preferred_timings: ['Morning', '6:30 AM - 8:00 AM'],
    gym_location: 'Cult Fit, Bellandur, Bengaluru',
    gender: 'Male',
    age_range_min: 24,
    age_range_max: 30,
    is_discoverable: true,
    profile_visibility: 'public',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString(),
  },
  {
    id: 'buddy-14',
    display_name: 'Tara Kapoor',
    bio: 'Cardio & core split. High energy HIIT & endurance training.',
    fitness_goals: ['Fat Loss', 'Endurance'],
    workout_split: 'cardio_focused',
    experience_level: 'beginner',
    preferred_timings: ['Flexible'],
    gym_location: 'Gold Gym, Jayanagar, Bengaluru',
    gender: 'Female',
    age_range_min: 20,
    age_range_max: 25,
    is_discoverable: true,
    profile_visibility: 'public',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString(),
  },
  {
    id: 'buddy-15',
    display_name: 'Nikhil Roy',
    bio: 'Upper/Lower body split focused on progressive overload and form precision.',
    fitness_goals: ['Strength', 'Hypertrophy'],
    workout_split: 'upper_lower',
    experience_level: 'advanced',
    preferred_timings: ['Evening', '6:00 PM - 7:30 PM'],
    gym_location: 'Anytime Fitness, MG Road, Bengaluru',
    gender: 'Male',
    age_range_min: 27,
    age_range_max: 34,
    is_discoverable: true,
    profile_visibility: 'public',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString(),
  }
];

export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
};

export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
};

export const initMockDatabase = () => {
  // Ensure default gymbuddy profiles exist
  const existingProfiles = getStorageItem<MockGymBuddyProfile[]>(STORAGE_KEYS.GYMBUDDY_PROFILES, []);
  if (existingProfiles.length === 0) {
    setStorageItem(STORAGE_KEYS.GYMBUDDY_PROFILES, INITIAL_GYMBUDDY_PROFILES);
  }

  // Ensure default arrays exist
  if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) setStorageItem(STORAGE_KEYS.PROFILES, []);
  if (!localStorage.getItem(STORAGE_KEYS.WORKOUT_SESSIONS)) setStorageItem(STORAGE_KEYS.WORKOUT_SESSIONS, []);
  if (!localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS)) setStorageItem(STORAGE_KEYS.WORKOUT_LOGS, []);
  if (!localStorage.getItem(STORAGE_KEYS.WORKOUT_SETS)) setStorageItem(STORAGE_KEYS.WORKOUT_SETS, []);
  if (!localStorage.getItem(STORAGE_KEYS.GYMBUDDY_SWIPES)) setStorageItem(STORAGE_KEYS.GYMBUDDY_SWIPES, []);
  if (!localStorage.getItem(STORAGE_KEYS.GYMBUDDY_MATCHES)) setStorageItem(STORAGE_KEYS.GYMBUDDY_MATCHES, []);
  if (!localStorage.getItem(STORAGE_KEYS.GYMBUDDY_MESSAGES)) setStorageItem(STORAGE_KEYS.GYMBUDDY_MESSAGES, []);
};

// Execute initialization
initMockDatabase();


// ──────────────────────────────────────────────────────────────────────────────
// Offline-fallback helper functions used by useGymBuddy.ts & GymBuddyMatches.tsx
// ──────────────────────────────────────────────────────────────────────────────

/** Detect Supabase / network offline errors so callers can fall back to local data. */
export function isOfflineError(err: unknown): boolean {
  if (!err) return false;
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err);
  const lower = msg.toLowerCase();
  return (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network error') ||
    lower.includes('load failed') ||
    lower.includes('project is paused') ||
    lower.includes('502') ||
    lower.includes('503') ||
    lower.includes('504')
  );
}

// ─── Profile helpers ─────────────────────────────────────────────────────────

/** Get all locally cached GymBuddy profiles. */
export function getLocalProfiles(): GymBuddyProfile[] {
  return getStorageItem<GymBuddyProfile[]>(STORAGE_KEYS.GYMBUDDY_PROFILES, []);
}

/** Get a single GymBuddy profile by ID from local cache. */
export function getLocalProfile(userId: string): GymBuddyProfile | null {
  const profiles = getLocalProfiles();
  return profiles.find((p) => p.id === userId) ?? null;
}

/** Add / update a profile in the local cache. */
export function upsertLocalProfile(profile: GymBuddyProfile): void {
  const profiles = getLocalProfiles();
  const idx = profiles.findIndex((p) => p.id === profile.id);
  if (idx >= 0) {
    profiles[idx] = profile;
  } else {
    profiles.push(profile);
  }
  setStorageItem(STORAGE_KEYS.GYMBUDDY_PROFILES, profiles);
}

/** Get-or-create a minimal default profile for guest / offline use. */
export function ensureLocalProfile(userId: string, displayName: string): GymBuddyProfile {
  const existing = getLocalProfile(userId);
  if (existing) return existing;

  const defaultProfile: GymBuddyProfile = {
    id: userId,
    display_name: displayName,
    bio: '',
    fitness_goals: ['general_fitness'],
    workout_split: 'full_body',
    experience_level: 'beginner',
    preferred_timings: ['flexible'],
    gym_location: '',
    is_discoverable: true,
    profile_visibility: 'public',
    age_range_min: 18,
    age_range_max: 60,
    created_at: new Date().toISOString(),
  };
  upsertLocalProfile(defaultProfile);
  return defaultProfile;
}

/** Bulk-cache an array of profiles (merge, do not replace). */
export function cacheLocalProfiles(profiles: GymBuddyProfile[]): void {
  const existing = getLocalProfiles();
  const map = new Map(existing.map((p) => [p.id, p]));
  for (const p of profiles) {
    map.set(p.id, p);
  }
  setStorageItem(STORAGE_KEYS.GYMBUDDY_PROFILES, [...map.values()]);
}

// ─── Swipe helpers ───────────────────────────────────────────────────────────

function getLocalSwipes(): GymBuddySwipe[] {
  return getStorageItem<GymBuddySwipe[]>(STORAGE_KEYS.GYMBUDDY_SWIPES, []);
}

/** Record a swipe locally and check for a mutual match. */
export function recordLocalSwipe(
  swiperId: string,
  targetId: string,
  direction: 'right' | 'left',
): { match: boolean } {
  const swipes = getLocalSwipes();

  // Avoid duplicates
  if (!swipes.find((s) => s.swiper_id === swiperId && s.target_id === targetId)) {
    swipes.push({
      id: `swipe-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      swiper_id: swiperId,
      target_id: targetId,
      direction,
      created_at: new Date().toISOString(),
    });
    setStorageItem(STORAGE_KEYS.GYMBUDDY_SWIPES, swipes);
  }

  if (direction !== 'right') return { match: false };

  // Check for mutual right-swipe
  const mutual = swipes.find(
    (s) => s.swiper_id === targetId && s.target_id === swiperId && s.direction === 'right',
  );
  if (!mutual) return { match: false };

  // Create the match
  const matches = getLocalMatches();
  const exists = matches.find(
    (m) =>
      (m.user1_id === swiperId && m.user2_id === targetId) ||
      (m.user1_id === targetId && m.user2_id === swiperId),
  );
  if (!exists) {
    const user1 = swiperId < targetId ? swiperId : targetId;
    const user2 = swiperId < targetId ? targetId : swiperId;
    matches.push({
      id: `match-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user1_id: user1,
      user2_id: user2,
      matched_at: new Date().toISOString(),
      shared_streak: 0,
    });
    setStorageItem(STORAGE_KEYS.GYMBUDDY_MATCHES, matches);
  }
  return { match: true };
}

// ─── Candidate helpers ───────────────────────────────────────────────────────

/** Return un-swiped profiles scored by compatibility (for guest / offline). */
export function getLocalCandidates(userId: string, userProfile: GymBuddyProfile): GymBuddyCandidate[] {
  const profiles = getLocalProfiles();
  const swipes = getLocalSwipes();
  const swipedIds = new Set(
    swipes.filter((s) => s.swiper_id === userId).map((s) => s.target_id),
  );

  const candidates = profiles.filter(
    (p) => p.id !== userId && p.is_discoverable && !swipedIds.has(p.id),
  );

  return candidates
    .map((candidate) => {
      const { score, compatibilityLabel, breakdown } = calculateCompatibilityScore(
        userProfile,
        candidate,
      );
      return {
        ...candidate,
        compatibility_score: score,
        compatibility_label: compatibilityLabel,
        compatibility_breakdown: breakdown,
      } as GymBuddyCandidate;
    })
    .sort((a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0));
}

// ─── Match helpers ───────────────────────────────────────────────────────────

/** Get all locally cached matches. */
export function getLocalMatches(): GymBuddyMatch[] {
  return getStorageItem<GymBuddyMatch[]>(STORAGE_KEYS.GYMBUDDY_MATCHES, []);
}

/** Bulk-cache matches (merge, do not replace). */
export function cacheLocalMatches(matches: GymBuddyMatch[]): void {
  const existing = getLocalMatches();
  const map = new Map(existing.map((m) => [m.id, m]));
  for (const m of matches) {
    map.set(m.id, m);
  }
  setStorageItem(STORAGE_KEYS.GYMBUDDY_MATCHES, [...map.values()]);
}

// ─── Message helpers ─────────────────────────────────────────────────────────

/** Get all messages for a given match. */
export function getLocalMessages(matchId: string): GymBuddyMessage[] {
  const allMessages = getStorageItem<GymBuddyMessage[]>(STORAGE_KEYS.GYMBUDDY_MESSAGES, []);
  return allMessages.filter((m) => m.match_id === matchId);
}

/** Save a new message locally and return it. */
export function recordLocalMessage(
  matchId: string,
  senderId: string,
  content: string
): GymBuddyMessage {
  const allMessages = getStorageItem<GymBuddyMessage[]>(STORAGE_KEYS.GYMBUDDY_MESSAGES, []);
  const newMsg: GymBuddyMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    match_id: matchId,
    sender_id: senderId,
    content,
    sent_at: new Date().toISOString(),
    is_read: false,
  };
  allMessages.push(newMsg);
  setStorageItem(STORAGE_KEYS.GYMBUDDY_MESSAGES, allMessages);
  return newMsg;
}
