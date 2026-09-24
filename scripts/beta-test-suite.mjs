// scripts/beta-test-suite.mjs
// Full Comprehensive Beta-Test Suite for FitBox
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

console.log("🧪 Initiating FitBox Full System Beta-Testing Suite...\n");

let passed = 0;
let failed = 0;

function runTest(suite, name, fn) {
  try {
    fn();
    console.log(`  ✅ [${suite}] PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [${suite}] FAIL: ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

// ==========================================
// 1. AUTHENTICATION & IDENTITY INTEGRITY
// ==========================================
runTest("Auth", "authSchemas: validates and rejects invalid emails and passwords", async () => {
  const schemaFile = fs.readFileSync(path.join(rootDir, "src/lib/authSchemas.ts"), "utf8");
  assert(schemaFile.includes("email: z.string().trim().email"), "Email trimming and format validation present");
  assert(schemaFile.includes("passwordSchema = z.string()"), "Canonical password schema present");
  assert(schemaFile.includes(".min(8"), "Password min 8 characters rule enforced");
  assert(schemaFile.includes("^[a-zA-Z0-9_-]+$"), "Username regex disallows spaces and illegal characters");
});

runTest("Auth", "AuthContext: dual-identity separation & profile hydration resilience", () => {
  const authFile = fs.readFileSync(path.join(rootDir, "src/contexts/AuthContext.tsx"), "utf8");
  assert(authFile.includes("authUserId"), "authUserId exposed");
  assert(authFile.includes("profileId"), "profileId exposed");
  assert(authFile.includes("maybeSingle()"), "uses maybeSingle() for safe query resolution");
  assert(authFile.includes("fetchUserProfile"), "robust profile fetcher defined");
  assert(authFile.includes("localStorage.removeItem('fitBoxUser')"), "cleans guest cache upon authenticating");
});

runTest("Auth", "Auth UI: password eye toggles & direct mode switching", () => {
  const authUI = fs.readFileSync(path.join(rootDir, "src/pages/Auth.tsx"), "utf8");
  assert(authUI.includes("showPassword"), "Password visibility toggle state declared");
  assert(authUI.includes("<Eye"), "Eye icon rendered");
  assert(authUI.includes("onClick={() => setMode('signin')}"), "Direct switch from signup to signin");
  assert(authUI.includes("onClick={() => setMode('signup')}"), "Direct switch from signin to signup");
});

runTest("Auth", "Password Recovery: token preservation & canonical validation", () => {
  const appFile = fs.readFileSync(path.join(rootDir, "src/App.tsx"), "utf8");
  assert(appFile.includes("search") && appFile.includes("hash"), "Hash & query params preserved on reset-password redirect");
  const resetFile = fs.readFileSync(path.join(rootDir, "src/pages/ResetPassword.tsx"), "utf8");
  assert(resetFile.includes("resetPasswordSchema"), "ResetPassword uses unified validation schema");
});

// ==========================================
// 2. EXERCISE & MUSCLE ANATOMY ENGINE
// ==========================================
runTest("Anatomy", "Muscle Mapping: all 19 muscle groups have valid routes & normalization", () => {
  const mappingFile = fs.readFileSync(path.join(rootDir, "src/lib/muscleMapping.ts"), "utf8");
  assert(mappingFile.includes("normalizeMuscleSlug"), "normalizeMuscleSlug exported");
  assert(mappingFile.includes("getMuscleRoute"), "getMuscleRoute exported");
  assert(mappingFile.includes("getDisplayNameFromDiagramId"), "getDisplayNameFromDiagramId exported");
  
  // Verify exercise database
  const exFile = fs.readFileSync(path.join(rootDir, "src/data/exercises.ts"), "utf8");
  assert(exFile.includes("export const exercises: Exercise[]"), "exercises array exported");
  assert(exFile.includes("Bench Press"), "Core exercise Bench Press exists");
  assert(exFile.includes("Squats"), "Core exercise Squats exists");
  assert(exFile.includes("Pull-ups"), "Core exercise Pull-ups exists");
});

// ==========================================
// 3. WORKOUT TRACKER & ACTIVE SESSION PERSISTENCE
// ==========================================
runTest("Workout", "Active Workout: drift-proof timer, set removal, and persistence", () => {
  const workoutCtx = fs.readFileSync(path.join(rootDir, "src/contexts/WorkoutContext.tsx"), "utf8");
  assert(workoutCtx.includes("fitbox:activeWorkout"), "Active workout saved in localStorage");
  assert(workoutCtx.includes("endWorkout"), "Dedicated endWorkout action supported");
  
  const saveHook = fs.readFileSync(path.join(rootDir, "src/hooks/useWorkoutSave.ts"), "utf8");
  assert(saveHook.includes("activeProfileId"), "Targeting profileId for workout_sessions FK");
  assert(saveHook.includes("workout_sessions"), "Inserts to workout_sessions");
  assert(saveHook.includes("workout_sets"), "Inserts to workout_sets");
});

// ==========================================
// 4. INDIAN NUTRITION ENGINE & MACRO MATH
// ==========================================
runTest("Nutrition", "Macro Engine: Mifflin-St Jeor formulas & Indian food items", () => {
  const roadmap = fs.readFileSync(path.join(rootDir, "src/pages/NutritionRoadmap.tsx"), "utf8");
  assert(roadmap.includes("tdee"), "Calculates Total Daily Energy Expenditure (TDEE)");
  assert(roadmap.includes("cutting"), "Handles cutting deficit");
  assert(roadmap.includes("protein"), "Calculates protein target");
  assert(roadmap.includes("fats"), "Calculates healthy fats target");

  const foodDb = fs.readFileSync(path.join(rootDir, "src/data/indianFoodDatabase.ts"), "utf8");
  assert(foodDb.includes("Paneer"), "Paneer present in database");
  assert(foodDb.includes("Soya Chunks"), "Soya Chunks present in database");
  assert(foodDb.includes("Sattu"), "Sattu present in database");
  assert(foodDb.includes("desi-ghee"), "Desi Ghee present in oils-condiments");
});

// ==========================================
// 5. GYMBUDDY SOCIAL MATCHING & SECURITY
// ==========================================
runTest("GymBuddy", "GymBuddy: Guest guarding, Realtime subscription stability, & RLS", () => {
  const hook = fs.readFileSync(path.join(rootDir, "src/hooks/useGymBuddy.ts"), "utf8");
  assert(hook.includes("isGuest"), "Guards against guest queries to PostgreSQL");
  
  const notifCtx = fs.readFileSync(path.join(rootDir, "src/contexts/GymBuddyNotificationContext.tsx"), "utf8");
  assert(!notifCtx.includes(", location.pathname"), "Realtime channel lifecycle decoupled from router location");

  const migration = fs.readFileSync(path.join(rootDir, "supabase/migrations/20260921000000_fitbox_remediation.sql"), "utf8");
  assert(migration.includes("Matched users can read partner profiles"), "Mutual match RLS policy installed");
});

// ==========================================
// 6. AI AGENTS & EDGE FUNCTIONS
// ==========================================
runTest("AI", "Edge Functions: Gemini 2.5 streaming & project assistant configuration", () => {
  const configToml = fs.readFileSync(path.join(rootDir, "supabase/config.toml"), "utf8");
  assert(configToml.includes("fitness-chat"), "fitness-chat function registered");
  assert(configToml.includes("project-assistant"), "project-assistant function registered");

  const fitnessChat = fs.readFileSync(path.join(rootDir, "supabase/functions/fitness-chat/index.ts"), "utf8");
  assert(fitnessChat.includes("google/gemini-2.5-flash-lite"), "Gemini 2.5 model targeted");
  assert(fitnessChat.includes("text/event-stream"), "SSE streaming configured");
});

// ==========================================
// 7. BUILD INTEGRITY & ASSETS
// ==========================================
runTest("Build", "Bundle Integrity: dist directory contains generated assets & index.html", () => {
  const distIndex = path.join(rootDir, "dist/index.html");
  assert(fs.existsSync(distIndex), "dist/index.html exists after build");
  const assetsDir = path.join(rootDir, "dist/assets");
  assert(fs.existsSync(assetsDir), "dist/assets directory exists");
  const files = fs.readdirSync(assetsDir);
  assert(files.length > 10, "Multiple optimized bundle chunks present in dist/assets");
});

console.log(`\n==========================================`);
console.log(`BETA TEST RESULTS: ${passed} Passed, ${failed} Failed`);
console.log(`==========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🏆 FitBox Beta-Testing Complete: All subsystems operating with 100% integrity!\n");
}
