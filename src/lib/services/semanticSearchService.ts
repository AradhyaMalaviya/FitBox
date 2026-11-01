import { exercises, type Exercise } from "@/data/exercises";

export interface GuidedSearchResult {
  exercise: Exercise;
  relevanceScore: number;
  rationale: string;
}

const STOP_WORDS = new Set([
  "a", "an", "and", "any", "for", "i", "in", "it", "me", "my", "of", "the", "that", "to", "with",
]);

const SYNONYMS: Record<string, string[]> = {
  abs: ["core", "abdominal"],
  arms: ["biceps", "triceps"],
  biceps: ["arms", "curl"],
  chest: ["pec", "pectoral"],
  delts: ["deltoid", "shoulder"],
  dumbbells: ["dumbbell"],
  glutes: ["glute", "hip"],
  lats: ["lat", "back"],
  pecs: ["chest", "pectoral"],
  quads: ["quad", "quadriceps", "legs"],
  shoulders: ["shoulder", "deltoid", "delts"],
  triceps: ["arms", "pushdown"],
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const tokensFor = (value: string) =>
  normalize(value).split(/\s+/).filter((token) => token.length > 1 && !STOP_WORDS.has(token));

const hasAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term));

function exerciseText(exercise: Exercise) {
  return normalize([
    exercise.name,
    exercise.muscleGroup,
    exercise.equipment,
    exercise.difficulty,
    exercise.description || "",
    ...(exercise.instructions || []),
    ...(exercise.cues || []),
  ].join(" "));
}

function scoreExercise(query: string, exercise: Exercise) {
  const text = exerciseText(exercise);
  const queryTokens = [...new Set(tokensFor(query))];
  const shoulderFriendlyQuery = hasAny(query, ["front delt", "shoulder friendly", "shoulder pain", "shoulder strain", "rotator cuff"]);
  const kneeFriendlyQuery = hasAny(query, ["knee friendly", "knee pain", "patellar"]);
  const backFriendlyQuery = hasAny(query, ["lower back friendly", "back pain", "spine sparing", "lumbar"]);

  let matchedTerms = 0;
  for (const token of queryTokens) {
    const relatedTerms = [token, ...(SYNONYMS[token] || [])];
    if (relatedTerms.some((term) => text.includes(term))) matchedTerms += 1;
  }

  let score = queryTokens.length ? matchedTerms / queryTokens.length : 0;
  const isShoulderFriendly = /neutral grip|squeeze press|shoulder friendly|reduce shoulder strain/.test(text);
  const isKneeFriendlyCandidate = /leg press|hamstring|lying leg curl|romanian deadlift/.test(text);
  const isBackFriendlyCandidate = /chest supported|leg press|hip thrust/.test(text);

  if (shoulderFriendlyQuery) {
    if (exercise.muscleGroup.toLowerCase() !== "chest" || !isShoulderFriendly) return null;
    score += 0.8;
  }
  if (kneeFriendlyQuery) {
    if (exercise.muscleGroup.toLowerCase() !== "legs" || !isKneeFriendlyCandidate) return null;
    score += 0.7;
  }
  if (backFriendlyQuery) {
    if (!isBackFriendlyCandidate) return null;
    score += 0.7;
  }

  if (score <= 0) return null;

  const rationale = shoulderFriendlyQuery
    ? "Catalog cues identify a neutral-grip or shoulder-friendly chest variation."
    : kneeFriendlyQuery
      ? "Matches a leg exercise commonly selected for reduced knee loading; use pain-free range and stop if symptoms increase."
      : backFriendlyQuery
        ? "Matches a supported or hip-dominant exercise option; stop if it increases back symptoms."
        : `Matches the query terms for ${exercise.muscleGroup.toLowerCase()} and ${exercise.equipment.toLowerCase()}.`;

  return { exercise, relevanceScore: score, rationale };
}

/**
 * Searches the local exercise catalog using explicit word matches and fitness-specific synonyms.
 * Scores order results only; they are not embedding similarity or confidence percentages.
 */
export const searchExercisesGuided = (
  query: string,
  options: { limit?: number; filterMuscle?: string; filterEquipment?: string; filterDifficulty?: string } = {},
): GuidedSearchResult[] => {
  const cleanQuery = normalize(query);
  if (!cleanQuery) return [];

  const { limit = 8, filterMuscle, filterEquipment, filterDifficulty } = options;
  return exercises
    .filter((exercise) =>
      !filterMuscle || filterMuscle === "All" || exercise.muscleGroup.toLowerCase() === filterMuscle.toLowerCase(),
    )
    .filter((exercise) =>
      !filterEquipment || filterEquipment === "All" || exercise.equipment.toLowerCase().includes(filterEquipment.toLowerCase()),
    )
    .filter((exercise) =>
      !filterDifficulty || filterDifficulty === "All" || exercise.difficulty.toLowerCase() === filterDifficulty.toLowerCase(),
    )
    .map((exercise) => scoreExercise(cleanQuery, exercise))
    .filter((result): result is GuidedSearchResult => result !== null)
    .sort((a, b) => b.relevanceScore - a.relevanceScore || a.exercise.name.localeCompare(b.exercise.name))
    .slice(0, Math.max(1, limit));
};
