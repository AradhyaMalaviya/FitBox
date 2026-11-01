import assert from "node:assert";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// Mock environment variables
process.env.VITE_SUPABASE_URL = "https://mock-fitbox.supabase.co";
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = "mock-publishable-key";

// Mock localStorage
const storageMap = new Map();
globalThis.localStorage = {
  getItem: (k) => storageMap.get(k) ?? null,
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: (k) => storageMap.delete(k),
  clear: () => storageMap.clear(),
};

// Load jiti for seamless TypeScript execution
const { default: createJiti } = await import("jiti");
const jiti = createJiti(import.meta.url, {
  alias: {
    "@/lib/env": path.resolve(rootDir, "scripts/mock-env.mjs"),
    "@/contexts/AuthContext": path.resolve(rootDir, "scripts/mock-auth.mjs"),
    "@": path.resolve(rootDir, "src"),
  },
  extensions: [".js", ".ts", ".tsx", ".jsx", ".json", ".mjs"],
});

console.log("================================================================================");
console.log("🚀 FITBOX AI ENGINEERING PIPELINE TEST SUITE");
console.log("   Task A: Gemini Autonomous Tool Calling & State Mutation Engine");
console.log("   Task B: Guided Exercise Catalog Search");
console.log("   Task C: Schema-Constrained Decoding & Programmatic Anti-Hallucination");
console.log("================================================================================\n");

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.stack || err.message}`);
    failed++;
  }
}

async function checkAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.stack || err.message}`);
    failed++;
  }
}

// ============================================================================
// PART A: AGENT TOOL CALLING INFRASTRUCTURE
// ============================================================================
console.log("\n📦 [PART A] Testing Gemini Tool Calling & Agent Execution Engine...");

const fitnessAgentTools = jiti(path.resolve(rootDir, "src/lib/ai/fitnessAgentTools.ts"));
const toolCallingRouter = jiti(path.resolve(rootDir, "src/lib/ai/toolCallingRouter.ts"));

check("Tool registry defines all 5 canonical Gemini function declarations", () => {
  const tools = fitnessAgentTools.FITNESS_AGENT_TOOLS;
  assert(Array.isArray(tools), "Tools must be an array");
  assert.strictEqual(tools.length, 5, "Expected 5 tools registered");

  const names = tools.map((t) => t.name);
  assert(names.includes("search_exercises"), "Missing search_exercises tool");
  assert(names.includes("calculate_macros"), "Missing calculate_macros tool");
  assert(names.includes("add_to_workout"), "Missing add_to_workout tool");
  assert(names.includes("calculate_1rm"), "Missing calculate_1rm tool");
  assert(names.includes("get_food_nutrition"), "Missing get_food_nutrition tool");
});

await checkAsync("Tool search_exercises executes and returns filtered exercises", async () => {
  const result = await fitnessAgentTools.executeAgentTool("search_exercises", {
    muscle: "chest",
    equipment: "Barbell",
  });
  assert(result.toolName === "search_exercises", "Tool execution should match name");
  assert(Array.isArray(result.result), "Result data must be an array");
  assert(result.result.length > 0, "Should return at least 1 exercise");
  const hasBench = result.result.some((e) => e.name.toLowerCase().includes("bench"));
  assert(hasBench, "Results should contain bench press");
});

await checkAsync("Tool calculate_macros computes metabolic baseline and macro splits", async () => {
  const result = await fitnessAgentTools.executeAgentTool("calculate_macros", {
    weightKg: 75,
    heightCm: 178,
    age: 26,
    gender: "male",
    goal: "bulking",
  });
  assert(result.toolName === "calculate_macros", "Tool execution should match name");
  const { calories, proteinGrams, carbsGrams, fatGrams } = result.result;
  assert(calories > 2000 && calories < 3500, `Unexpected calories: ${calories}`);
  assert(proteinGrams >= 130, `Protein should be sufficient for hypertrophy: ${proteinGrams}g`);
  assert(carbsGrams > 100, `Carbs must be present: ${carbsGrams}g`);
  assert(fatGrams > 40, `Fats must be present: ${fatGrams}g`);
});

await checkAsync("Tool calculate_1rm calculates multi-formula consensus strength", async () => {
  const result = await fitnessAgentTools.executeAgentTool("calculate_1rm", {
    weight: 100,
    reps: 5,
    unit: "kg",
  });
  assert(result.toolName === "calculate_1rm", "1RM calculation should match tool");
  const { average, brzycki, epley } = result.result;
  assert(average > 110 && average < 120, `Unexpected 1RM: ${average}`);
  assert(brzycki > 110, "Brzycki formula calculation valid");
  assert(epley > 110, "Epley formula calculation valid");
});

await checkAsync("Tool get_food_nutrition retrieves Indian food database items", async () => {
  const result = await fitnessAgentTools.executeAgentTool("get_food_nutrition", {
    foodQuery: "paneer",
  });
  assert(result.toolName === "get_food_nutrition", "Food nutrition lookup should match tool");
  assert(Array.isArray(result.result) && result.result.length > 0, "Should return paneer item");
  assert(result.result[0].protein > 0, "Paneer should have protein data");
});

await checkAsync("Tool add_to_workout produces structured state mutation payload", async () => {
  let receivedPrescription;
  const result = await fitnessAgentTools.executeAgentTool("add_to_workout", {
    exerciseNameOrId: "bench-press",
    sets: 3,
    reps: 10,
    targetWeightKg: 80,
  }, {
    onAddToWorkout: (_exerciseName, _exerciseId, prescription) => {
      receivedPrescription = prescription;
    },
  });
  assert(result.toolName === "add_to_workout", "Add to workout should match tool");
  assert(result.result.success, "Tool execution reported success");
  assert(result.result.exercise.name.includes("Bench Press"), "Exercise name contains Bench Press");
  assert.strictEqual(result.result.prescribedSets, 3);
  assert.deepStrictEqual(receivedPrescription, { sets: 3, reps: 10, targetWeightKg: 80 });
  assert(Array.isArray(result.result.warmupGuidance) && result.result.warmupGuidance.length > 0, "Warmup guidance included");
});

await checkAsync("Unknown workout exercise fails safely without adding a substitute", async () => {
  let addCalled = false;
  const result = await fitnessAgentTools.executeAgentTool("add_to_workout", {
    exerciseNameOrId: "unobtainium glute machine",
    sets: 4,
  }, {
    onAddToWorkout: () => { addCalled = true; },
  });
  assert.strictEqual(result.result.success, false);
  assert.match(result.result.failureReason, /couldn't find/i);
  assert.strictEqual(addCalled, false, "Unknown exercise must not mutate the workout");
});

await checkAsync("Intent router dispatches 'Add 3 sets of bench press to active session'", async () => {
  const userQuery = "Add 3 sets of bench press to my active session and tell me my warm-up sets";
  const intent = toolCallingRouter.routeAgenticQuery(userQuery);
  assert(intent !== null, "Query should be routed to an agentic tool");
  assert(intent.hasToolCall, "hasToolCall should be true");
  assert.strictEqual(intent.toolExecution.toolName, "add_to_workout");
  assert.strictEqual(intent.toolExecution.args.sets, 3);
  assert(intent.toolExecution.result.success, "Tool execution inside router succeeded");
});

await checkAsync("Intent router dispatches 'Calculate macros for 80kg male bulking'", async () => {
  const userQuery = "Calculate my macros, I am 80kg and want to bulk";
  const intent = toolCallingRouter.routeAgenticQuery(userQuery);
  assert(intent !== null, "Query should be routed to calculate_macros");
  assert(intent.hasToolCall, "hasToolCall should be true");
  assert.strictEqual(intent.toolExecution.toolName, "calculate_macros");
  assert.strictEqual(intent.toolExecution.args.weightKg, 80);
});

// ============================================================================
// PART // PART B: GUIDED EXERCISE CATALOG SEARCH
// ============================================================================
console.log("\n📦 [PART B] Testing guided exercise catalog search...");

const semanticSearchService = jiti(path.resolve(rootDir, "src/lib/services/semanticSearchService.ts"));

check("Guided search applies shoulder constraints and returns catalog-grounded reasons", () => {
  const results = semanticSearchService.searchExercisesGuided(
    "chest exercise that doesn't hurt my front delts",
    { limit: 5 },
  );
  assert(results.length > 0, "Should return supported shoulder-friendly options");
  assert(results.every((r) => r.exercise.muscleGroup === "Chest"), "Should only return chest exercises");
  assert(results.every((r) => /neutral grip|squeeze press|shoulder friendly|reduce shoulder strain/i.test(
    [r.exercise.name, r.exercise.description || ""].join(" "),
  )), "Every result should have a relevant catalog cue");
  assert(results.every((r) => typeof r.relevanceScore === "number" && r.rationale.length > 0));
});

check("Guided search respects muscle, equipment, and difficulty filters", () => {
  const results = semanticSearchService.searchExercisesGuided("knee friendly quad builder", {
    limit: 5,
    filterMuscle: "Legs",
    filterEquipment: "Machine",
    filterDifficulty: "Beginner",
  });
  assert(results.length > 0, "Should find a beginner machine leg option");
  assert(results.every((r) => r.exercise.muscleGroup === "Legs"));
  assert(results.every((r) => r.exercise.equipment.toLowerCase().includes("machine")));
  assert(results.every((r) => r.exercise.difficulty === "Beginner"));
});

check("Guided search returns no unrelated matches for unsupported queries", () => {
  assert.deepStrictEqual(semanticSearchService.searchExercisesGuided("chocolate fudge dessert"), []);
});
// PART C: STRUCTURED OUTPUT VALIDATION & PROGRAMMATIC REPAIR
// ============================================================================
console.log("\n📦 [PART C] Testing Structured Output Validation & Anti-Hallucination Pipeline...");

const structuredGen = jiti(path.resolve(rootDir, "src/lib/ai/structuredGeneration.ts"));

check("Gemini OpenAPI-compliant JSON schema generator exports required schema", () => {
  const schema = structuredGen.getWorkoutPlanJsonSchema();
  assert.strictEqual(schema.type, "OBJECT");
  assert(schema.properties.planName, "planName required in schema");
  assert(schema.properties.days, "days array required in schema");
  assert(schema.required.includes("planName"), "planName in required list");
});

check("Hallucinated exercise ID 'bench-press-3000' is intercepted and repaired to canonical Bench Press", () => {
  const rawPlan = {
    planName: "Hypertrophy Push Day",
    fitnessLevel: "Intermediate",
    goal: "Hypertrophy",
    days: [
      {
        dayName: "Chest & Shoulders",
        focus: "Chest hypertrophy",
        exercises: [
          {
            exerciseId: "bench-press-3000", // Hallucinated ID
            exerciseName: "Barbell Bench Press",
            targetMuscle: "Chest",
            sets: 3,
            reps: "8-12",
          },
        ],
      },
    ],
  };

  const result = structuredGen.validateAndRepairWorkoutPlan(rawPlan);
  assert(result.success, "Validation should succeed after repair");
  assert(result.repaired, "Plan should be flagged as repaired");
  const repairedEx = result.data.days[0].exercises[0];
  assert(repairedEx.exerciseId === "2" || repairedEx.exerciseName.includes("Bench Press"), "Repaired to Bench Press");
  assert(result.repairs.some((r) => r.field.includes("exerciseId")));
});

check("Fitness colloquial nickname 'rdl' is intercepted and repaired to Romanian Deadlift", () => {
  const rawPlan = {
    planName: "Legs & Posterior Chain",
    fitnessLevel: "Intermediate",
    goal: "Hypertrophy",
    days: [
      {
        dayName: "Leg Day",
        focus: "Hamstrings and Glutes",
        exercises: [
          {
            exerciseId: "rdl", // Nickname
            sets: 4,
            reps: 10,
            targetMuscle: "Hamstrings",
          },
        ],
      },
    ],
  };

  const result = structuredGen.validateAndRepairWorkoutPlan(rawPlan);
  assert(result.success, "Validation succeeded");
  const repairedEx = result.data.days[0].exercises[0];
  assert(repairedEx.exerciseId === "67" || repairedEx.exerciseName.includes("Romanian Deadlift"), "Repaired to RDL");
});

check("Purely hallucinated non-existent exercise is safely substituted by targeted muscle group", () => {
  const rawPlan = {
    planName: "Cosmic Workout",
    fitnessLevel: "Advanced",
    goal: "Strength",
    days: [
      {
        dayName: "Alien Chest Blast",
        focus: "Chest",
        exercises: [
          {
            exerciseId: "quantum-anti-gravity-pectoral-fly", // Completely hallucinated
            targetMuscle: "Chest",
            sets: 4,
            reps: "10-12",
          },
        ],
      },
    ],
  };

  const result = structuredGen.validateAndRepairWorkoutPlan(rawPlan);
  assert(result.success, "Validation succeeded");
  const repairedEx = result.data.days[0].exercises[0];
  assert.strictEqual(repairedEx.targetMuscle, "Chest");
  assert(result.repairs.some((r) => r.issue.toLowerCase().includes("hallucin")));
});

check("Excessive sets (25 sets) and invalid RPE are clamped to safe biomechanical limits", () => {
  const rawPlan = {
    planName: "Volume Overload",
    fitnessLevel: "Intermediate",
    goal: "Hypertrophy",
    days: [
      {
        dayName: "Chest Day",
        focus: "Chest",
        exercises: [
          {
            exerciseId: "bench-press",
            sets: 25, // Unsafe!
            reps: "8-12",
            rpe: 2.0, // Invalid!
            restSeconds: 9999, // Unreasonable!
          },
        ],
      },
    ],
  };

  const result = structuredGen.validateAndRepairWorkoutPlan(rawPlan);
  assert(result.success, "Validation succeeded");
  const ex = result.data.days[0].exercises[0];
  assert(ex.sets <= 8, `Sets clamped to <= 8, got ${ex.sets}`);
  assert(ex.rpe >= 6 && ex.rpe <= 10, `RPE clamped to 6-10, got ${ex.rpe}`);
  assert(ex.restSeconds <= 300, `Rest clamped to <= 300, got ${ex.restSeconds}`);
});

check("Thermodynamic calorie balancing programmatically reconciles macro discrepancies in nutrition plans", () => {
  const rawNutrition = {
    planName: "High Protein Diet",
    dietType: "Non-Vegetarian",
    targetCalories: 2500,
    proteinTargetGrams: 200, // 800 kcal
    fatsTargetGrams: 70,     // 630 kcal
    carbsTargetGrams: 50,    // 200 kcal => total = 1630 kcal! 870 kcal discrepancy!
    days: [],
  };

  const result = structuredGen.validateAndRepairNutritionPlan(rawNutrition);
  assert(result.success, "Nutrition plan validation succeeded");
  assert(result.repaired, "Nutrition plan should be repaired");
  // Balanced carbs = (2500 - (800 + 630)) / 4 = 1070 / 4 = ~268g
  assert(result.data.carbsTargetGrams > 200, `Carbs reconciled to balance target calories: ${result.data.carbsTargetGrams}`);
  assert(result.repairs.some((r) => r.field === "carbsTargetGrams"));
});

// ============================================================================
// SUMMARY REPORT
// ============================================================================
console.log("\n================================================================================");
console.log(`🏁 TEST EXECUTION COMPLETE: ${passed} PASSED | ${failed} FAILED`);
console.log("================================================================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
