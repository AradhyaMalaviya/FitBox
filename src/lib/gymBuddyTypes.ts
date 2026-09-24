export type FitnessGoal = 'fat_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'flexibility' | 'general_fitness';
export type WorkoutSplit = 'push_pull_legs' | 'full_body' | 'upper_lower' | 'bro_split' | 'athletic' | 'cardio_focused';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type PreferredTiming = 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible';
export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
export type ProfileVisibility = 'public' | 'gym_only' | 'private';

export interface GymBuddyProfile {
  id: string; // references auth.users
  display_name: string;
  bio: string; // max 150 chars
  fitness_goals: FitnessGoal[];
  workout_split: WorkoutSplit;
  experience_level: ExperienceLevel;
  preferred_timings: PreferredTiming[];
  gym_location: string;
  gender?: Gender;
  age_range_min: number;
  age_range_max: number;
  is_discoverable: boolean;
  profile_visibility: ProfileVisibility;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GymBuddySwipe {
  id: string;
  swiper_id: string;
  target_id: string;
  direction: 'right' | 'left';
  created_at?: string;
}

export interface GymBuddyMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at?: string;
  shared_streak: number;
  last_session_logged?: string;
}

export interface GymBuddyMessage {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  sent_at?: string;
  is_read: boolean;
}

export interface GymBuddySessionLog {
  id: string;
  match_id: string;
  logged_by: string;
  session_date: string; // Date string
  notes?: string;
  created_at?: string;
}

export interface CompatibilityBreakdown {
  goals: number;      // 0-100%
  split: number;      // 0-100%
  timing: number;     // 0-100%
  location: number;   // 0-100%
  experience: number; // 0-100%
}

// Extends the profile to include match specifics when rendered in discovery or match list
export interface GymBuddyCandidate extends GymBuddyProfile {
  compatibility_score?: number;
  compatibility_label?: string;
  compatibility_breakdown?: CompatibilityBreakdown;
}
