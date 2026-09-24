import { GymBuddyProfile, CompatibilityBreakdown } from './gymBuddyTypes';

export function calculateCompatibilityScore(
  currentUser: GymBuddyProfile,
  candidate: GymBuddyProfile
): { score: number; compatibilityLabel: string; breakdown: CompatibilityBreakdown } {
  let score = 0;

  // 1. Fitness goals overlap (30 pts max)
  const userGoals = new Set(currentUser.fitness_goals || []);
  const candidateGoals = new Set(candidate.fitness_goals || []);
  const allGoals = new Set([...userGoals, ...candidateGoals]);
  const sharedGoals = [...userGoals].filter(goal => candidateGoals.has(goal));
  
  let goalsNormalized = 40;
  if (allGoals.size > 0) {
    const ratio = sharedGoals.length / allGoals.size;
    score += ratio * 30;
    goalsNormalized = Math.round(ratio * 100);
  }

  // 2. Experience level match (20 pts max)
  const expLevels = ['beginner', 'intermediate', 'advanced'];
  const userExpIdx = expLevels.indexOf(currentUser.experience_level);
  const candidateExpIdx = expLevels.indexOf(candidate.experience_level);
  
  const expDiff = (userExpIdx !== -1 && candidateExpIdx !== -1)
    ? Math.abs(userExpIdx - candidateExpIdx)
    : 1;

  let expNormalized = 25;
  if (expDiff === 0) {
    score += 20;
    expNormalized = 100;
  } else if (expDiff === 1) {
    score += 10;
    expNormalized = 60;
  } else {
    expNormalized = 20;
  }

  // 3. Workout split compatibility (20 pts max)
  let splitNormalized = 30;
  if (currentUser.workout_split === candidate.workout_split) {
    score += 20;
    splitNormalized = 100;
  } else if (
    currentUser.workout_split === 'full_body' || 
    candidate.workout_split === 'full_body'
  ) {
    score += 15;
    splitNormalized = 75;
  }

  // 4. Timing overlap (20 pts max)
  const userTimings = currentUser.preferred_timings || [];
  const candidateTimings = candidate.preferred_timings || [];
  
  let timingNormalized = 30;
  if (userTimings.includes('flexible') || candidateTimings.includes('flexible')) {
    score += 20;
    timingNormalized = 100;
  } else {
    const uTimings = new Set(userTimings);
    const cTimings = new Set(candidateTimings);
    const allTimings = new Set([...uTimings, ...cTimings]);
    const sharedTimings = [...uTimings].filter(timing => cTimings.has(timing));
    
    if (allTimings.size > 0) {
      const ratio = sharedTimings.length / allTimings.size;
      score += ratio * 20;
      timingNormalized = Math.round(ratio * 100);
    }
  }

  // 5. Gym/location proximity (10 pts max)
  const uLocation = (currentUser.gym_location || '').toLowerCase().trim();
  const cLocation = (candidate.gym_location || '').toLowerCase().trim();

  let locationNormalized = 25;
  if (uLocation && cLocation && uLocation === cLocation) {
    score += 10;
    locationNormalized = 100;
  } else if (uLocation && cLocation) {
    const uWords = uLocation.split(/[\s,]+/).filter(w => w.length > 3);
    const cWords = new Set(cLocation.split(/[\s,]+/).filter(w => w.length > 3));
    const hasSharedKeyword = uWords.some(word => cWords.has(word));
    if (hasSharedKeyword) {
      score += 5;
      locationNormalized = 65;
    }
  }

  // Round score to nearest integer
  const finalScore = Math.min(100, Math.round(score));

  // Label assignment
  let compatibilityLabel = "Potential Match 🤝"; // 0-39
  if (finalScore >= 80) {
    compatibilityLabel = "Perfect Match 🔥";
  } else if (finalScore >= 60) {
    compatibilityLabel = "Strong Match 💪";
  } else if (finalScore >= 40) {
    compatibilityLabel = "Good Fit ✅";
  }

  const breakdown: CompatibilityBreakdown = {
    goals: goalsNormalized,
    split: splitNormalized,
    timing: timingNormalized,
    location: locationNormalized,
    experience: expNormalized,
  };

  return { score: finalScore, compatibilityLabel, breakdown };
}
