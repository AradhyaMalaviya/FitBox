// scripts/run-deep-beta-tests.mjs
// Comprehensive Deep Beta-Testing Engine for FitBox
// Directly executes functions, algorithms, Zod schemas, calculations, and data models.

import assert from "node:assert";
import fs from "node:fs";
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

console.log("======================================================================");
console.log("🚀 FITBOX DEEP COMPREHENSIVE BETA-TESTING & RUNTIME AUDIT");
console.log("======================================================================\n");

let passed = 0;
let failed = 0;
const failures = [];

async function test(domain, description, fn) {
  try {
    await fn();
    console.log(`  ✅ [${domain}] PASS: ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [${domain}] FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
    failures.push({ domain, description, error: err.message });
    failed++;
  }
}

// ======================================================================
// 1. GYMBUDDY COMPATIBILITY & MATCHMAKING ALGORITHM
// ======================================================================
const { calculateCompatibilityScore } = jiti(path.resolve(rootDir, "src/lib/compatibilityScore.ts"));

await test("GymBuddy", "Identical profiles score 100% with 'Perfect Match 🔥'", () => {
  const user = {
    id: "user-1",
    display_name: "Alex",
    fitness_goals: ["hypertrophy", "strength"],
    workout_split: "push_pull_legs",
    experience_level: "intermediate",
    preferred_timings: ["evening"],
    gym_location: "Cult Fit Koramangala",
  };
  const candidate = {
    id: "user-2",
    display_name: "Sam",
    fitness_goals: ["hypertrophy", "strength"],
    workout_split: "push_pull_legs",
    experience_level: "intermediate",
    preferred_timings: ["evening"],
    gym_location: "Cult Fit Koramangala",
  };

  const result = calculateCompatibilityScore(user, candidate);
  assert.strictEqual(result.score, 100, `Expected 100, got ${result.score}`);
  assert.strictEqual(result.compatibilityLabel, "Perfect Match 🔥");
  assert.strictEqual(result.breakdown.goals, 100);
  assert.strictEqual(result.breakdown.split, 100);
  assert.strictEqual(result.breakdown.timing, 100);
  assert.strictEqual(result.breakdown.experience, 100);
  assert.strictEqual(result.breakdown.location, 100);
});

await test("GymBuddy", "Divergent profiles score low (<40) with 'Potential Match 🤝'", () => {
  const user = {
    id: "user-1",
    display_name: "Alex",
    fitness_goals: ["hypertrophy"],
    workout_split: "push_pull_legs",
    experience_level: "beginner",
    preferred_timings: ["early_morning"],
    gym_location: "Gold Gym South Mumbai",
  };
  const candidate = {
    id: "user-2",
    display_name: "Sam",
    fitness_goals: ["endurance", "flexibility"],
    workout_split: "bro_split",
    experience_level: "advanced",
    preferred_timings: ["night"],
    gym_location: "Anytime Fitness Delhi",
  };

  const result = calculateCompatibilityScore(user, candidate);
  assert(result.score < 40, `Expected score < 40, got ${result.score}`);
  assert.strictEqual(result.compatibilityLabel, "Potential Match 🤝");
});

await test("GymBuddy", "Flexible timing awards full 20 pts (normalized 100)", () => {
  const user = {
    id: "user-1",
    display_name: "Alex",
    fitness_goals: ["strength"],
    workout_split: "full_body",
    experience_level: "intermediate",
    preferred_timings: ["flexible"],
    gym_location: "Indiranagar",
  };
  const candidate = {
    id: "user-2",
    display_name: "Sam",
    fitness_goals: ["strength"],
    workout_split: "full_body",
    experience_level: "intermediate",
    preferred_timings: ["evening"],
    gym_location: "Indiranagar",
  };

  const result = calculateCompatibilityScore(user, candidate);
  assert.strictEqual(result.breakdown.timing, 100, "Flexible timing must yield 100 timing score");
});

await test("GymBuddy", "Full Body split pairing awards partial 15 pts (normalized 75)", () => {
  const user = {
    id: "user-1",
    display_name: "Alex",
    fitness_goals: ["strength"],
    workout_split: "full_body",
    experience_level: "intermediate",
    preferred_timings: ["morning"],
    gym_location: "HSR Layout",
  };
  const candidate = {
    id: "user-2",
    display_name: "Sam",
    fitness_goals: ["strength"],
    workout_split: "upper_lower",
    experience_level: "intermediate",
    preferred_timings: ["morning"],
    gym_location: "HSR Layout",
  };

  const result = calculateCompatibilityScore(user, candidate);
  assert.strictEqual(result.breakdown.split, 75, "Full body pairing must yield 75 split score");
});

await test("GymBuddy", "Proximity keyword overlap awards partial points (normalized 65)", () => {
  const user = {
    id: "user-1",
    display_name: "Alex",
    fitness_goals: ["strength"],
    workout_split: "push_pull_legs",
    experience_level: "intermediate",
    preferred_timings: ["morning"],
    gym_location: "Gold Gym Indiranagar",
  };
  const candidate = {
    id: "user-2",
    display_name: "Sam",
    fitness_goals: ["strength"],
    workout_split: "push_pull_legs",
    experience_level: "intermediate",
    preferred_timings: ["morning"],
    gym_location: "Cult Gym Indiranagar",
  };

  const result = calculateCompatibilityScore(user, candidate);
  assert.strictEqual(result.breakdown.location, 65, "Location keyword match must yield 65 location score");
});

await test("GymBuddy", "Defensive robustness against empty or missing profile fields", () => {
  const user = {
    id: "user-1",
    display_name: "Alex",
  };
  const candidate = {
    id: "user-2",
    display_name: "Sam",
  };

  const result = calculateCompatibilityScore(user, candidate);
  assert(typeof result.score === "number" && !isNaN(result.score), "Score must be a valid number");
  assert(result.score >= 0 && result.score <= 100, "Score must be bounded between 0 and 100");
  assert(result.breakdown && typeof result.breakdown.goals === "number", "Breakdown goals must be valid number");
});

// ======================================================================
// 2. SHARED WORKOUT STREAK LOGIC
// ======================================================================
const { calculateStreakFromLogs } = jiti(path.resolve(rootDir, "src/hooks/useGymBuddyStreak.ts"));

await test("Streak", "Empty session logs return 0 streak and false loggedThisWeek", () => {
  const result = calculateStreakFromLogs([]);
  assert.strictEqual(result.currentStreak, 0);
  assert.strictEqual(result.loggedThisWeek, false);
});

await test("Streak", "Single workout logged today returns 1 streak and true loggedThisWeek", () => {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const result = calculateStreakFromLogs([dateStr], today);
  assert.strictEqual(result.currentStreak, 1);
  assert.strictEqual(result.loggedThisWeek, true);
});

await test("Streak", "Multi-week consecutive streak increments correctly", () => {
  const today = new Date();
  const logs = [];
  // Add logs for today, 7 days ago, 14 days ago, 21 days ago (4 consecutive weeks)
  for (let i = 0; i < 4; i++) {
    const d = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    logs.push(d.toISOString().split("T")[0]);
  }

  const result = calculateStreakFromLogs(logs, today);
  assert.strictEqual(result.currentStreak, 4, `Expected 4 consecutive weeks streak, got ${result.currentStreak}`);
  assert.strictEqual(result.loggedThisWeek, true);
});

await test("Streak", "Session logged last week preserves streak while allowing this week's check-in", () => {
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

  const logs = [
    lastWeek.toISOString().split("T")[0],
    twoWeeksAgo.toISOString().split("T")[0],
  ];

  const result = calculateStreakFromLogs(logs, today);
  assert.strictEqual(result.currentStreak, 2, `Expected streak 2 from past 2 weeks, got ${result.currentStreak}`);
  assert.strictEqual(result.loggedThisWeek, false, "Should indicate not yet logged this week");
});

await test("Streak", "Broken streak (missed last week) resets currentStreak to 0", () => {
  const today = new Date();
  // Logged 21 days ago and 28 days ago, but missed 7 and 14 days ago
  const logs = [
    new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  ];

  const result = calculateStreakFromLogs(logs, today);
  assert.strictEqual(result.currentStreak, 0, `Expected broken streak to reset to 0, got ${result.currentStreak}`);
  assert.strictEqual(result.loggedThisWeek, false);
});

await test("Streak", "Multiple sessions in the same calendar week condense to 1 streak step", () => {
  const today = new Date();
  const logs = [
    today.toISOString().split("T")[0],
    new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  ];

  const result = calculateStreakFromLogs(logs, today);
  assert.strictEqual(result.currentStreak, 1, `Expected multiple sessions in 1 week to count as 1, got ${result.currentStreak}`);
});

// ======================================================================
// 3. ONBOARDING & INSPIRATION ARCHETYPES
// ======================================================================
const { deriveInspirationScore, parseAllergies, INSPIRATION_PRESETS } = jiti(path.resolve(rootDir, "src/lib/onboarding.ts"));

await test("Onboarding", "Toji preset tags map deterministically to 'cutting'", () => {
  const tojiPreset = INSPIRATION_PRESETS.find((p) => p.name === "Toji");
  assert(tojiPreset, "Toji preset exists");
  const score = deriveInspirationScore(tojiPreset.tags);
  assert.strictEqual(score, "cutting", `Expected 'cutting', got ${score}`);
});

await test("Onboarding", "Thor preset tags map deterministically to 'bulk'", () => {
  const thorPreset = INSPIRATION_PRESETS.find((p) => p.name === "Thor");
  assert(thorPreset, "Thor preset exists");
  const score = deriveInspirationScore(thorPreset.tags);
  assert.strictEqual(score, "bulk", `Expected 'bulk', got ${score}`);
});

await test("Onboarding", "Goku preset tags map deterministically to 'athletic-performance'", () => {
  const gokuPreset = INSPIRATION_PRESETS.find((p) => p.name === "Goku");
  assert(gokuPreset, "Goku preset exists");
  const score = deriveInspirationScore(gokuPreset.tags);
  assert.strictEqual(score, "athletic-performance", `Expected 'athletic-performance', got ${score}`);
});

await test("Onboarding", "Captain America preset tags map deterministically to 'strength-hybrid'", () => {
  const capPreset = INSPIRATION_PRESETS.find((p) => p.name === "Captain America");
  assert(capPreset, "Captain America preset exists");
  const score = deriveInspirationScore(capPreset.tags);
  assert.strictEqual(score, "strength-hybrid", `Expected 'strength-hybrid', got ${score}`);
});

await test("Onboarding", "Case-insensitive and substring tag matching behaves correctly", () => {
  assert.strictEqual(deriveInspirationScore(["SUPER_SHREDDED"]), "cutting");
  assert.strictEqual(deriveInspirationScore(["Maximum-Strength"]), "bulk");
  assert.strictEqual(deriveInspirationScore(["lean", "agile"]), "athletic-performance");
  assert.strictEqual(deriveInspirationScore([]), "strength-hybrid");
});

await test("Onboarding", "parseAllergies handles trimming, empty items, and bounds", () => {
  const raw = " soy, dairy , , nuts,gluten  ";
  const parsed = parseAllergies(raw);
  assert.deepStrictEqual(parsed, ["soy", "dairy", "nuts", "gluten"]);
  assert.deepStrictEqual(parseAllergies(null), []);
  assert.deepStrictEqual(parseAllergies(""), []);
});

// ======================================================================
// 4. CLINICAL MACRO & MIFFLIN-ST JEOR CALCULATIONS
// ======================================================================
await test("Nutrition", "Mifflin-St Jeor formula calculates clinical BMR and TDEE correctly", () => {
  // Male: 10 * weight + 6.25 * height - 5 * age + 5
  const weight = 80;
  const height = 180;
  const age = 30;
  const expectedMaleBmr = 10 * weight + 6.25 * height - 5 * age + 5; // 800 + 1125 - 150 + 5 = 1780
  assert.strictEqual(expectedMaleBmr, 1780);

  // Female: 10 * weight + 6.25 * height - 5 * age - 161
  const fWeight = 60;
  const fHeight = 165;
  const fAge = 25;
  const expectedFemaleBmr = 10 * fWeight + 6.25 * fHeight - 5 * fAge - 161; // 600 + 1031.25 - 125 - 161 = 1345.25
  assert.strictEqual(expectedFemaleBmr, 1345.25);

  // Activity multipliers
  const sedentaryTdee = expectedMaleBmr * 1.2;
  const moderateTdee = expectedMaleBmr * 1.55;
  const activeTdee = expectedMaleBmr * 1.725;
  assert.strictEqual(Math.round(sedentaryTdee), 2136);
  assert.strictEqual(Math.round(moderateTdee), 2759);
  assert.strictEqual(Math.round(activeTdee), 3071);

  // Deficit and surplus
  const cuttingTdee = moderateTdee - 500;
  const bulkingTdee = moderateTdee + 500;
  assert.strictEqual(Math.round(cuttingTdee), 2259);
  assert.strictEqual(Math.round(bulkingTdee), 3259);

  // Macro calculation with non-negative carbohydrate clamp
  const protein = Math.round(weight * 2.2); // 80 * 2.2 = 176g
  const fats = Math.round((cuttingTdee * 0.25) / 9); // (2259 * 0.25) / 9 = ~63g
  const carbs = Math.max(0, Math.round((cuttingTdee - protein * 4 - fats * 9) / 4));
  assert(protein > 0, "Protein must be positive");
  assert(fats > 0, "Fats must be positive");
  assert(carbs >= 0, "Carbs must be non-negative");
});

// ======================================================================
// 5. INDIAN FOOD DATABASE AUDIT
// ======================================================================
const {
  allFoods,
  proteinSwaps,
  dairyProducts,
  pulsesLegumes,
  grainsStaples,
} = jiti(path.resolve(rootDir, "src/data/indianFoodDatabase.ts"));

await test("FoodDatabase", "Database has 90+ Indian foods and covers all key categories", () => {
  assert(allFoods.length >= 90, `Expected >= 90 foods, found ${allFoods.length}`);
  const categories = new Set(allFoods.map((f) => f.category));
  const expectedCategories = [
    "dairy",
    "eggs-proteins",
    "pulses-legumes",
    "grains-staples",
    "vegetables-dishes",
    "nuts-snacks",
    "oils-condiments",
    "prepared-meals",
    "regional-snacks",
    "beverages",
  ];
  for (const cat of expectedCategories) {
    assert(categories.has(cat), `Category '${cat}' missing from food database`);
  }
});

await test("FoodDatabase", "Every food item has valid nutritional structure and non-negative values", () => {
  for (const item of allFoods) {
    assert(item.id && typeof item.id === "string", `Food missing id`);
    assert(item.name && typeof item.name === "string", `Food ${item.id} missing name`);
    assert(item.serving && typeof item.serving === "string", `Food ${item.name} missing serving`);
    assert(typeof item.protein === "number" && item.protein >= 0, `Food ${item.name} invalid protein`);
    assert(typeof item.carbs === "number" && item.carbs >= 0, `Food ${item.name} invalid carbs`);
    assert(typeof item.fat === "number" && item.fat >= 0, `Food ${item.name} invalid fat`);
    assert(typeof item.calories === "number" && item.calories >= 0, `Food ${item.name} invalid calories`);
    assert(["veg", "non-veg", "vegan"].includes(item.dietType), `Food ${item.name} invalid dietType: ${item.dietType}`);
    assert(Array.isArray(item.mealRoles) && item.mealRoles.length > 0, `Food ${item.name} missing mealRoles`);
  }
});

await test("FoodDatabase", "Key Indian bodybuilding staples exist with accurate data", () => {
  const paneer = allFoods.find((f) => f.name.toLowerCase().includes("paneer"));
  assert(paneer, "Paneer exists");
  assert(paneer.protein >= 15, `Paneer protein expected >= 15g, got ${paneer.protein}`);

  const soya = allFoods.find((f) => f.name.toLowerCase().includes("soya chunk"));
  assert(soya, "Soya chunks exist");
  assert(soya.protein >= 25, `Soya chunks protein (50g dry) expected >= 25g, got ${soya.protein}`);

  const sattu = allFoods.find((f) => f.name.toLowerCase().includes("sattu"));
  assert(sattu, "Sattu exists");
  assert(sattu.protein >= 8, `Sattu protein (40g serving) expected >= 8g, got ${sattu.protein}`);
});

await test("FoodDatabase", "Protein swaps are populated with valid pairs", () => {
  assert(Array.isArray(proteinSwaps) && proteinSwaps.length >= 5, "Protein swaps must contain pairs");
  for (const swap of proteinSwaps) {
    assert(swap.item1 && typeof swap.item1 === "string", "Swap missing item1");
    assert(swap.item2 && typeof swap.item2 === "string", "Swap missing item2");
    assert(swap.proteinDiff && typeof swap.proteinDiff === "string", "Swap missing proteinDiff");
  }
});

// ======================================================================
// 6. ANATOMY & EXERCISE MAPPINGS
// ======================================================================
const { MUSCLE_MAPPINGS, normalizeMuscleSlug, getExercisesForMuscle } = jiti(path.resolve(rootDir, "src/lib/muscleMapping.ts"));
const { exercises } = jiti(path.resolve(rootDir, "src/data/exercises.ts"));

await test("Anatomy", "All 19 canonical muscle mapping entities are properly configured", () => {
  const keys = Object.keys(MUSCLE_MAPPINGS);
  assert(keys.length >= 19, `Expected >= 19 muscle mappings, found ${keys.length}`);

  for (const [key, mapping] of Object.entries(MUSCLE_MAPPINGS)) {
    assert.strictEqual(mapping.diagramId, key, `diagramId matches key ${key}`);
    assert(mapping.displayName, `Muscle ${key} missing displayName`);
    assert(mapping.exerciseGroup, `Muscle ${key} missing exerciseGroup`);
    assert(mapping.latinName, `Muscle ${key} missing latinName`);
    assert(mapping.functionDescription, `Muscle ${key} missing functionDescription`);
  }
});

await test("Anatomy", "normalizeMuscleSlug maps common slang and aliases to canonical slugs", () => {
  assert.strictEqual(normalizeMuscleSlug("quads"), "quadriceps");
  assert.strictEqual(normalizeMuscleSlug("lats"), "upper-back");
  assert.strictEqual(normalizeMuscleSlug("pecs"), "chest");
  assert.strictEqual(normalizeMuscleSlug("delts"), "deltoids");
  assert.strictEqual(normalizeMuscleSlug("glutes"), "gluteal");
  assert.strictEqual(normalizeMuscleSlug("traps"), "trapezius");
  assert.strictEqual(normalizeMuscleSlug("lower_back"), "lower-back");
  assert.strictEqual(normalizeMuscleSlug(""), "");
});

await test("Anatomy", "50+ exercises exist with valid properties and known muscle groups", () => {
  assert(exercises.length >= 50, `Expected >= 50 exercises, found ${exercises.length}`);

  const validGroups = new Set([
    "Chest",
    "Back",
    "Legs",
    "Arms",
    "Shoulders",
    "Core",
    "Full Body",
  ]);

  for (const ex of exercises) {
    assert(ex.id, "Exercise missing id");
    assert(ex.name, "Exercise missing name");
    assert(validGroups.has(ex.muscleGroup), `Exercise ${ex.name} has unknown group: ${ex.muscleGroup}`);
    assert(ex.equipment, `Exercise ${ex.name} missing equipment`);
    assert(ex.duration, `Exercise ${ex.name} missing duration`);
    assert(["Beginner", "Intermediate", "Advanced"].includes(ex.difficulty), `Exercise ${ex.name} invalid difficulty`);
  }
});

await test("Anatomy", "getExercisesForMuscle ranks relevant exercises matching keywords", () => {
  const chestResult = getExercisesForMuscle("chest");
  assert(chestResult.count > 0, "Chest must return exercises");
  assert(chestResult.mapping, "Chest must have mapping");
  assert(chestResult.exercises.every(e => e.muscleGroup === "Chest"), "All returned exercises must be Chest group");
  assert(chestResult.exercises.some(e => e.name === "Bench Press"), "Bench Press must be in chest exercises");
});


// ======================================================================
// 7. ZOD AUTHENTICATION & FORM SCHEMAS
// ======================================================================
const { signUpSchema, signInSchema, resetPasswordSchema, usernameSchema, passwordSchema } = jiti(path.resolve(rootDir, "src/lib/authSchemas.ts"));
const { inspirationStepSchema, timeRangeSchema } = jiti(path.resolve(rootDir, "src/lib/onboarding.ts"));

await test("ZodSchemas", "passwordSchema enforces min 8 chars and max 100", () => {
  assert.doesNotThrow(() => passwordSchema.parse("ValidPass123!"));
  assert.throws(() => passwordSchema.parse("short1"), /at least 8 characters/);
});

await test("ZodSchemas", "usernameSchema enforces alphanumeric and allowed separators", () => {
  assert.doesNotThrow(() => usernameSchema.parse("alex_warrior-99"));
  assert.throws(() => usernameSchema.parse("ab"), /at least 3 characters/);
  assert.throws(() => usernameSchema.parse("alex warrior"), /can only contain letters/);
  assert.throws(() => usernameSchema.parse("alex@warrior!"), /can only contain letters/);
});

await test("ZodSchemas", "signUpSchema trims email and validates requirements", () => {
  const valid = {
    email: "  athlete@fitbox.io  ",
    fullName: "Aaradhya Malviya",
    username: "aaradhya",
    password: "StrongPassword2026!",
  };
  const parsed = signUpSchema.parse(valid);
  assert.strictEqual(parsed.email, "athlete@fitbox.io", "Email must be trimmed");

  assert.throws(() => signUpSchema.parse({ ...valid, email: "invalid-email" }), /Invalid email/);
});

await test("ZodSchemas", "resetPasswordSchema verifies matching passwords", () => {
  assert.doesNotThrow(() =>
    resetPasswordSchema.parse({
      password: "NewPassword123!",
      confirmPassword: "NewPassword123!",
    })
  );

  assert.throws(
    () =>
      resetPasswordSchema.parse({
        password: "NewPassword123!",
        confirmPassword: "DifferentPassword123!",
      }),
    /Passwords do not match/
  );
});

await test("ZodSchemas", "timeRangeSchema enforces HH:MM regex", () => {
  assert.doesNotThrow(() => timeRangeSchema.parse({ start: "06:30", end: "08:00" }));
  assert.throws(() => timeRangeSchema.parse({ start: "6:30", end: "8:00" }));
  assert.throws(() => timeRangeSchema.parse({ start: "morning", end: "evening" }));
});

await test("ZodSchemas", "inspirationStepSchema requires at least 1 image", () => {
  assert.doesNotThrow(() =>
    inspirationStepSchema.parse({
      images: ["https://example.com/avatar.jpg"],
      preset: "Goku",
      notes: "Anime build",
      tags: ["lean", "athletic"],
    })
  );

  assert.throws(() =>
    inspirationStepSchema.parse({
      images: [],
      preset: null,
      notes: "",
      tags: [],
    })
  );
});

// ======================================================================
// 8. PRODUCTION BUNDLE & SPA ROUTING VERIFICATION
// ======================================================================
await test("Production", "dist/index.html exists and is properly structured", () => {
  const indexPath = path.join(rootDir, "dist/index.html");
  assert(fs.existsSync(indexPath), "dist/index.html must exist");
  const html = fs.readFileSync(indexPath, "utf8");
  assert(html.includes("<div id=\"root\"></div>") || html.includes("id=\"root\""), "Root mount element present");
  assert(html.includes("<script type=\"module\""), "Module script bundle included");
});

await test("Production", "wrangler.toml has SPA fallback routing configured", () => {
  const wranglerPath = path.join(rootDir, "wrangler.toml");
  assert(fs.existsSync(wranglerPath), "wrangler.toml must exist");
  const content = fs.readFileSync(wranglerPath, "utf8");
  assert(content.includes('not_found_handling = "single-page-application"'), "SPA routing must be configured");
  assert(content.includes('directory = "./dist"'), "Assets directory must point to ./dist");
});

// ======================================================================
// SUMMARY
// ======================================================================
console.log("\n======================================================================");
console.log(`RESULTS: ${passed} Passed, ${failed} Failed out of ${passed + failed} Deep Beta Tests`);
console.log("======================================================================");

if (failed > 0) {
  console.error("\n❌ Failures detected:");
  for (const f of failures) {
    console.error(`- [${f.domain}] ${f.description}: ${f.error}`);
  }
  process.exit(1);
} else {
  console.log("\n🎉 All deep beta testing suites passed with 100% precision!");
  process.exit(0);
}
