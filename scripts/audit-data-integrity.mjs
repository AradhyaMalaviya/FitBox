import assert from "node:assert";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// Ensure mock environment variables so src/lib/env.ts loads cleanly in Node
process.env.VITE_SUPABASE_URL = "https://mock-fitbox.supabase.co";
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = "mock-publishable-key";

// Provide a mock localStorage for Node environment
const storageMap = new Map();
globalThis.localStorage = {
  getItem: (k) => storageMap.get(k) ?? null,
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: (k) => storageMap.delete(k),
  clear: () => storageMap.clear(),
};

// Load jiti for seamless TypeScript execution with path aliases
const { default: createJiti } = await import("jiti");
const jiti = createJiti(import.meta.url, {
  alias: {
    "@/lib/env": path.resolve(rootDir, "scripts/mock-env.mjs"),
    "@/contexts/AuthContext": path.resolve(rootDir, "scripts/mock-auth.mjs"),
    "@": path.resolve(rootDir, "src"),
  },
  extensions: [".js", ".ts", ".tsx", ".jsx", ".json", ".mjs"],
});

console.log("🔍 Starting FitBox Deep Data & Algorithm Integrity Audit...\n");

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

// 1. Exercise Data Integrity
const exercisesModule = jiti(path.resolve(rootDir, "src/data/exercises.ts"));
const exercises = exercisesModule.exercises;

check("Exercise Database: has exercises and all IDs are unique", () => {
  assert(Array.isArray(exercises) && exercises.length > 50, "At least 50 exercises exist");
  const ids = new Set();
  for (const ex of exercises) {
    assert(ex.id && typeof ex.id === "string", `Exercise ${ex.name || "unknown"} has valid id string`);
    assert(!ids.has(ex.id), `Duplicate exercise id: ${ex.id}`);
    ids.add(ex.id);
  }
});

check("Exercise Database: each exercise has valid mandatory attributes", () => {
  const allowedDifficulties = new Set(["Beginner", "Intermediate", "Advanced"]);
  for (const ex of exercises) {
    assert(ex.name && ex.name.trim().length > 0, `Exercise ${ex.id} has name`);
    assert(ex.muscleGroup && ex.muscleGroup.trim().length > 0, `Exercise ${ex.id} has muscleGroup`);
    assert(ex.equipment && ex.equipment.trim().length > 0, `Exercise ${ex.id} has equipment`);
    assert(allowedDifficulties.has(ex.difficulty), `Exercise ${ex.id} has valid difficulty: ${ex.difficulty}`);
    assert(ex.duration && ex.duration.trim().length > 0, `Exercise ${ex.id} has duration`);
  }
});

// 2. Muscle Mapping Integrity
const mappingModule = jiti(path.resolve(rootDir, "src/lib/muscleMapping.ts"));
const { MUSCLE_SLUGS, normalizeMuscleSlug, getMuscleDisplayName } = mappingModule;

check("Muscle Mapping: canonical slugs and normalization", () => {
  assert(Array.isArray(MUSCLE_SLUGS) && MUSCLE_SLUGS.length >= 19, "All 19+ canonical slugs present");
  for (const slug of MUSCLE_SLUGS) {
    assert(typeof normalizeMuscleSlug(slug) === "string", `Normalizes ${slug}`);
    assert(typeof getMuscleDisplayName(slug) === "string", `Display name for ${slug}`);
  }
  // Test slang normalization
  assert(normalizeMuscleSlug("quads") === "quadriceps", "Normalizes quads");
  assert(normalizeMuscleSlug("glutes") === "gluteal", "Normalizes glutes");
  assert(normalizeMuscleSlug("abs") === "abs", "Normalizes abs");
  assert(normalizeMuscleSlug("pecs") === "chest", "Normalizes pecs");
  assert(normalizeMuscleSlug("delts") === "deltoids", "Normalizes delts");
  assert(normalizeMuscleSlug("lats") === "upper-back", "Normalizes lats");
  assert(normalizeMuscleSlug("traps") === "trapezius", "Normalizes traps");
});

// 3. Indian Food Database Integrity
const foodModule = jiti(path.resolve(rootDir, "src/data/indianFoodDatabase.ts"));
const { allFoods, proteinSwaps } = foodModule;

check("Food Database: populated and all IDs unique", () => {
  assert(Array.isArray(allFoods) && allFoods.length >= 90, "At least 90 food items exist");
  const ids = new Set();
  for (const f of allFoods) {
    assert(f.id && typeof f.id === "string", `Food has id: ${f.name}`);
    assert(!ids.has(f.id), `Duplicate food id: ${f.id}`);
    ids.add(f.id);
  }
});

check("Food Database: nutritional validity (non-negative and calorie sanity)", () => {
  for (const f of allFoods) {
    assert(f.protein >= 0, `Food ${f.name} protein >= 0`);
    assert(f.carbs >= 0, `Food ${f.name} carbs >= 0`);
    assert(f.fat >= 0, `Food ${f.name} fat >= 0`);
    assert(f.calories >= 0, `Food ${f.name} calories >= 0`);
    assert(f.name && f.name.length > 0, "Food has name");
    assert(f.category && f.category.length > 0, `Food ${f.name} has category`);
  }
});

check("Protein Swaps: valid source and target foods", () => {
  assert(Array.isArray(proteinSwaps) && proteinSwaps.length > 0, "Protein swaps populated");
  for (const swap of proteinSwaps) {
    assert(swap.item1 && swap.item2, "Swap structure valid");
  }
});

// 4. Compatibility Algorithm Math & Bounds
const compModule = jiti(path.resolve(rootDir, "src/lib/compatibilityScore.ts"));
const { calculateCompatibilityScore } = compModule;

check("Compatibility Score: respects mathematical bounds [0, 100]", () => {
  const dummyUser = {
    id: "user-1",
    display_name: "Test User",
    bio: "",
    fitness_goals: ["muscle_gain", "strength"],
    workout_split: "push_pull_legs",
    experience_level: "intermediate",
    preferred_timings: ["morning"],
    gym_location: "Gold Gym Indiranagar",
    age_range_min: 20,
    age_range_max: 30,
    is_discoverable: true,
    profile_visibility: "public"
  };

  const dummyCandidate = {
    ...dummyUser,
    id: "user-2",
  };

  // Identical profile test
  const perfectResult = calculateCompatibilityScore(dummyUser, dummyCandidate);
  assert(perfectResult.score === 100, `Identical profiles should score 100, got ${perfectResult.score}`);

  // Opposite / divergent profile test
  const divergentCandidate = {
    ...dummyUser,
    id: "user-3",
    fitness_goals: ["flexibility"],
    workout_split: "cardio_focused",
    experience_level: "beginner",
    preferred_timings: ["night"],
    gym_location: "Cult Fit Whitefield"
  };

  const divergentResult = calculateCompatibilityScore(dummyUser, divergentCandidate);
  assert(divergentResult.score >= 0 && divergentResult.score <= 100, "Score within 0-100");
  assert(divergentResult.score < 40, `Divergent profiles should score low, got ${divergentResult.score}`);

  // Empty field defensive test
  const emptyUser = {
    id: "user-empty",
    display_name: "Empty",
    bio: "",
    fitness_goals: [],
    workout_split: "full_body",
    experience_level: "beginner",
    preferred_timings: [],
    gym_location: "",
    age_range_min: 18,
    age_range_max: 60,
    is_discoverable: true,
    profile_visibility: "public"
  };
  const emptyResult = calculateCompatibilityScore(emptyUser, emptyUser);
  assert(emptyResult.score >= 0 && emptyResult.score <= 100, "Empty profile handled without throwing or NaN");
  assert(!isNaN(emptyResult.score), "Score is not NaN");
});

// 5. Workout Templates & Routine Programs Integrity
const workoutTemplatesModule = jiti(path.resolve(rootDir, "src/data/workoutTemplates.ts"));
const { WORKOUT_TEMPLATES, ROUTINE_PROGRAMS } = workoutTemplatesModule;

check("Workout Templates: populated, unique IDs, and valid exercises", () => {
  assert(Array.isArray(WORKOUT_TEMPLATES) && WORKOUT_TEMPLATES.length >= 6, "At least 6 workout templates exist");
  const ids = new Set();
  for (const w of WORKOUT_TEMPLATES) {
    assert(w.id && typeof w.id === "string", `Workout template has id`);
    assert(!ids.has(w.id), `Duplicate workout id: ${w.id}`);
    ids.add(w.id);
    assert(w.title && w.title.length > 0, `Workout ${w.id} has title`);
    assert(Array.isArray(w.exercises) && w.exercises.length > 0, `Workout ${w.id} has exercises`);
    assert(w.durationMinutes > 0, `Workout ${w.id} has duration`);
  }
});

check("Routine Programs: multi-day periodization validity", () => {
  assert(Array.isArray(ROUTINE_PROGRAMS) && ROUTINE_PROGRAMS.length >= 4, "At least 4 routine programs exist");
  const ids = new Set();
  for (const r of ROUTINE_PROGRAMS) {
    assert(r.id && typeof r.id === "string", `Routine has id`);
    assert(!ids.has(r.id), `Duplicate routine id: ${r.id}`);
    ids.add(r.id);
    assert(r.title && r.title.length > 0, `Routine ${r.id} has title`);
    assert(r.daysPerWeek >= 3 && r.daysPerWeek <= 7, `Routine ${r.id} has valid daysPerWeek`);
    assert(Array.isArray(r.days) && r.days.length === 7, `Routine ${r.id} has 7 day structure`);
  }
});

// 6. Fitness Articles Integrity
const articlesModule = jiti(path.resolve(rootDir, "src/data/fitnessArticles.ts"));
const { FITNESS_ARTICLES } = articlesModule;

check("Fitness Articles: evidence-based articles with author and sections", () => {
  assert(Array.isArray(FITNESS_ARTICLES) && FITNESS_ARTICLES.length >= 5, "At least 5 fitness articles exist");
  const ids = new Set();
  for (const art of FITNESS_ARTICLES) {
    assert(art.id && typeof art.id === "string", `Article has id`);
    assert(!ids.has(art.id), `Duplicate article id: ${art.id}`);
    ids.add(art.id);
    assert(art.title && art.title.length > 0, `Article ${art.id} has title`);
    assert(art.author && art.author.name, `Article ${art.id} has author name`);
    assert(Array.isArray(art.sections) && art.sections.length > 0, `Article ${art.id} has sections`);
    assert(art.readTimeMinutes > 0, `Article ${art.id} has read time`);
  }
});

console.log(`\nAudit Results: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
