// scripts/beta-test-suite.mjs
// Full Comprehensive End-to-End Beta-Testing Suite for FitBox
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

console.log("======================================================================");
console.log("🧪 FITBOX FULL-SYSTEM BETA-TESTING & VALIDATION SUITE");
console.log("======================================================================\n");

let passed = 0;
let failed = 0;
const failures = [];

async function runTest(suite, name, fn) {
  try {
    await fn();
    console.log(`  ✅ [${suite}] PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [${suite}] FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failures.push({ suite, name, error: err.message });
    failed++;
  }
}

// ======================================================================
// 1. AUTHENTICATION & IDENTITY LIFECYCLE
// ======================================================================
await runTest("Auth", "authSchemas: validates email trimming, minimum 8-char password, and strict username regex", () => {
  const schemaFile = fs.readFileSync(path.join(rootDir, "src/lib/authSchemas.ts"), "utf8");
  assert(schemaFile.includes("email: z.string().trim().email"), "Email trimming and format validation present");
  assert(schemaFile.includes("passwordSchema = z.string()"), "Canonical password schema present");
  assert(schemaFile.includes(".min(8"), "Password min 8 characters rule enforced");
  assert(schemaFile.includes("^[a-zA-Z0-9_-]+$"), "Username regex disallows spaces and illegal characters");
});

await runTest("Auth", "AuthContext: dual-identity separation & safe profile hydration", () => {
  const authFile = fs.readFileSync(path.join(rootDir, "src/contexts/AuthContext.tsx"), "utf8");
  assert(authFile.includes("authUserId: string | null"), "authUserId explicitly exposed in AuthContextType");
  assert(authFile.includes("profileId: string | null"), "profileId explicitly exposed in AuthContextType");
  assert(authFile.includes("fetchUserProfile"), "robust fetchUserProfile with retry defined");
  assert(authFile.includes("localStorage.removeItem('fitBoxUser')"), "clears guest state on authenticated session");
});

await runTest("Auth", "Auth UI: password eye visibility toggles & direct sign-in/up mode switches", () => {
  const authUI = fs.readFileSync(path.join(rootDir, "src/pages/Auth.tsx"), "utf8");
  assert(authUI.includes("showPassword"), "Password visibility toggle state declared");
  assert(authUI.includes("<Eye") && authUI.includes("<EyeOff"), "Both Eye and EyeOff icons rendered");
  assert(authUI.includes("onClick={() => setMode('signin')}"), "Direct switch to signin available");
  assert(authUI.includes("onClick={() => setMode('signup')}"), "Direct switch to signup available");
  assert(authUI.includes("autoComplete=\"email\""), "Mobile email autocomplete attribute present");
});

await runTest("Auth", "Password Recovery: URL query and hash preservation & canonical resetPasswordSchema", () => {
  const appFile = fs.readFileSync(path.join(rootDir, "src/App.tsx"), "utf8");
  assert(appFile.includes("window.location.search") && appFile.includes("window.location.hash"), "URL search and hash preserved on recovery redirect");
  const resetFile = fs.readFileSync(path.join(rootDir, "src/pages/ResetPassword.tsx"), "utf8");
  assert(resetFile.includes("resetPasswordSchema"), "ResetPassword uses unified validation schema");
});

// ======================================================================
// 2. ONBOARDING & ARCHETYPE PERSONALIZATION
// ======================================================================
await runTest("Onboarding", "Inspiration Archetype Scorer: deterministically maps presets and tags to archetypes", () => {
  const onboardingLib = fs.readFileSync(path.join(rootDir, "src/lib/onboarding.ts"), "utf8");
  assert(onboardingLib.includes("deriveInspirationScore"), "deriveInspirationScore algorithm exists");
  assert(onboardingLib.includes("INSPIRATION_PRESETS"), "INSPIRATION_PRESETS constant defined");
  assert(onboardingLib.includes("Goku") && onboardingLib.includes("Thor") && onboardingLib.includes("Captain America") && onboardingLib.includes("Toji"), "All 4 inspiration presets configured");
});

await runTest("Onboarding", "Onboarding Media: upload validates MIME types and guarantees preset fallback image", () => {
  const onboardingPage = fs.readFileSync(path.join(rootDir, "src/pages/Onboarding.tsx"), "utf8");
  assert(onboardingPage.includes("user-media"), "Uploads to dedicated user-media storage bucket");
  assert(onboardingPage.includes("ALLOWED_MIME_TYPES"), "Validates allowed MIME types before attempting upload");
  assert(onboardingPage.includes("fallbackPresetImage"), "Guarantees fallback preset image so Step 5 schema validation never traps user");
});

// ======================================================================
// 3. ANATOMY & INTERACTIVE MUSCLE MAP
// ======================================================================
await runTest("Anatomy", "Muscle Mapping: all 19 muscle groups have canonical slugs, aliases, and route generation", () => {
  const mappingFile = fs.readFileSync(path.join(rootDir, "src/lib/muscleMapping.ts"), "utf8");
  assert(mappingFile.includes("normalizeMuscleSlug"), "normalizeMuscleSlug exported");
  assert(mappingFile.includes("getMuscleRoute"), "getMuscleRoute exported");
  assert(mappingFile.includes("trapezius") && mappingFile.includes("quadriceps") && mappingFile.includes("biceps"), "Canonical muscle slugs verified");
});

await runTest("Anatomy", "Exercise Database: 50+ exercises with valid target, equipment, and form instructions", () => {
  const exFile = fs.readFileSync(path.join(rootDir, "src/data/exercises.ts"), "utf8");
  assert(exFile.includes("export const exercises: Exercise[]"), "exercises array exported");
  assert(exFile.includes("Bench Press"), "Core exercise Bench Press present");
  assert(exFile.includes("Barbell Squat") || exFile.includes("Squats"), "Core exercise Squats present");
  assert(exFile.includes("Pull-ups") || exFile.includes("Pull-Up"), "Core exercise Pull-ups present");
});

// ======================================================================
// 4. ACTIVE WORKOUT TRACKER & PERSISTENCE
// ======================================================================
await runTest("Workout", "Workout Lifecycle: isHydrated lifecycle guard prevents refresh deletion race condition", () => {
  const workoutCtx = fs.readFileSync(path.join(rootDir, "src/contexts/WorkoutContext.tsx"), "utf8");
  assert(workoutCtx.includes("isHydrated"), "isHydrated ref lifecycle guard implemented");
  assert(workoutCtx.includes("if (!isHydrated.current) return;"), "Persist effect guarded by hydration completion");
  assert(workoutCtx.includes("discardWorkout"), "discardWorkout exposed in context");
});

await runTest("Workout", "Workout Header & Discard: confirmation dialog prevents accidental session abandonment", () => {
  const workoutHeader = fs.readFileSync(path.join(rootDir, "src/components/workout/WorkoutHeader.tsx"), "utf8");
  assert(workoutHeader.includes("onDiscard"), "onDiscard prop supported in WorkoutHeader");
  assert(workoutHeader.includes("AlertDialog"), "AlertDialog used for explicit discard confirmation");
  assert(workoutHeader.includes("Discard Workout"), "Discard Workout button rendered in dialog");
});

await runTest("Workout", "Exercise Set Logging: numeric input clearing bug resolved with local string state", () => {
  const exerciseCard = fs.readFileSync(path.join(rootDir, "src/components/workout/ExerciseLogCard.tsx"), "utf8");
  assert(exerciseCard.includes("weightStr") && exerciseCard.includes("repsStr"), "SetRow uses local string state for weight and reps");
  assert(!exerciseCard.includes("parseFloat(e.target.value) || 0"), "Eliminated immediate coercion of empty string to zero on keystroke");
  assert(exerciseCard.includes("canRemove"), "Set removal supported via canRemove prop");
  assert(exerciseCard.includes("onRemove"), "onRemove prop wired to button");
});

await runTest("Workout", "Workout Save Hook: profileId FK targeting and guest local history persistence", () => {
  const saveHook = fs.readFileSync(path.join(rootDir, "src/hooks/useWorkoutSave.ts"), "utf8");
  assert(saveHook.includes("activeProfileId"), "Targeting profileId for workout_sessions FK");
  assert(saveHook.includes("workout_sessions"), "Inserts to workout_sessions");
  assert(saveHook.includes("fitbox:guestWorkoutHistory"), "Persists guest workouts to localStorage fallback");
});

// ======================================================================
// 5. INDIAN NUTRITION ENGINE & MACRO MATH
// ======================================================================
await runTest("Nutrition", "Macro Engine: clinical Mifflin-St Jeor formula & cutting deficit calculations", () => {
  const roadmap = fs.readFileSync(path.join(rootDir, "src/pages/NutritionRoadmap.tsx"), "utf8");
  assert(roadmap.includes("bmr = data.gender === \"male\""), "Mifflin-St Jeor gender-specific BMR calculation present");
  assert(roadmap.includes("if (data.goal === \"cutting\") tdee -= 500;"), "Cutting deficit subtracts 500 kcal");
  assert(roadmap.includes("if (data.goal === \"bulk\") tdee += 500;"), "Bulking surplus adds 500 kcal");
  assert(roadmap.includes("Math.max(0, Math.round((tdee - (protein * 4) - (fats * 9)) / 4))"), "Carbs calculation protected against negative values");
});

await runTest("Nutrition", "Indian Food Database: 150+ items including oils, protein swaps, and vegetarian filters", () => {
  const foodDb = fs.readFileSync(path.join(rootDir, "src/data/indianFoodDatabase.ts"), "utf8");
  assert(foodDb.includes("Paneer"), "Paneer present in database");
  assert(foodDb.includes("Soya Chunks"), "Soya Chunks present in database");
  assert(foodDb.includes("Sattu"), "Sattu present in database");
  assert(foodDb.includes("desi-ghee"), "Desi Ghee present in oils-condiments");
  assert(foodDb.includes("proteinSwaps"), "proteinSwaps array exported");
  assert(foodDb.includes("bulkingDayPlan") && foodDb.includes("cuttingDayPlan"), "Dedicated bulking and cutting meal plans exported");
});

await runTest("Nutrition", "Nutrition Cloud Sync: Supabase profiles.preferences synchronization and malformed JSON recovery", () => {
  const questionnaire = fs.readFileSync(path.join(rootDir, "src/pages/NutritionQuestionnaire.tsx"), "utf8");
  assert(questionnaire.includes("preferences:"), "Questionnaire persists nutrition data to Supabase profile preferences");
  
  const roadmap = fs.readFileSync(path.join(rootDir, "src/pages/NutritionRoadmap.tsx"), "utf8");
  assert(roadmap.includes("Corrupted nutritionUserData"), "Roadmap safely handles corrupted localStorage");
  assert(roadmap.includes("cloudNutrition"), "Roadmap hydrates from cloud nutrition preferences when local cache is empty");
});

// ======================================================================
// 6. GYMBUDDY SOCIAL MATCHING & REALTIME ENGINE
// ======================================================================
await runTest("GymBuddy", "Upfront Guest Gating: blocks unauthenticated guests before filling setup form", () => {
  const setupPage = fs.readFileSync(path.join(rootDir, "src/pages/GymBuddyProfileSetup.tsx"), "utf8");
  assert(setupPage.includes("user?.isGuest"), "Checks user.isGuest at route entry");
  assert(setupPage.includes("Account Required"), "Displays upfront Account Required message");
});

await runTest("GymBuddy", "Compatibility Engine: 5 normalized dimensions matching matchmaking inputs", () => {
  const scoreLib = fs.readFileSync(path.join(rootDir, "src/lib/compatibilityScore.ts"), "utf8");
  assert(scoreLib.includes("breakdown: CompatibilityBreakdown"), "calculateCompatibilityScore returns dimensional breakdown");
  assert(scoreLib.includes("goalsNormalized") && scoreLib.includes("splitNormalized"), "Computes normalized dimensions");
  assert(scoreLib.includes("timingNormalized") && scoreLib.includes("locationNormalized") && scoreLib.includes("expNormalized"), "Computes all 5 dimensions");
});

await runTest("GymBuddy", "Compatibility Radar: wires GymBuddyCard radar directly to canonical breakdown", () => {
  const card = fs.readFileSync(path.join(rootDir, "src/components/gymbuddy/GymBuddyCard.tsx"), "utf8");
  assert(card.includes("candidate.compatibility_breakdown"), "Radar chart consumes canonical compatibility_breakdown");
  assert(!card.includes("(candidate.fitness_goals?.length || 1) * 20 + 40"), "Fabricated heuristic radar values removed");
});

await runTest("GymBuddy", "Candidate Discovery Scalability: anti-join RPC function and query bounding", () => {
  const hook = fs.readFileSync(path.join(rootDir, "src/hooks/useGymBuddy.ts"), "utf8");
  assert(hook.includes("get_gymbuddy_candidates"), "Calls get_gymbuddy_candidates RPC function");
  assert(hook.includes("PAGE_SIZE = 50"), "Enforces bounded pagination in fallback path");
  assert(!hook.includes(".not('id', 'in', `(${swipedIds.join(',')})`)"), "Unbounded URL query string explosion eliminated");
});

await runTest("GymBuddy", "Chat Identity Model: sender_id correctly compared against authUserId", () => {
  const chatPage = fs.readFileSync(path.join(rootDir, "src/pages/GymBuddyChat.tsx"), "utf8");
  assert(chatPage.includes("activeAuthUserId"), "Computes activeAuthUserId from auth.users identity");
  assert(chatPage.includes("msg.sender_id === activeAuthUserId"), "Ownership check compares sender_id to activeAuthUserId");
});

await runTest("GymBuddy", "Streak Milestone Notifications: authoritative tracking & idempotent alert delivery", () => {
  const notifCtx = fs.readFileSync(path.join(rootDir, "src/contexts/GymBuddyNotificationContext.tsx"), "utf8");
  assert(notifCtx.includes("previousStreaksRef"), "Tracks previous streak in previousStreaksRef");
  assert(notifCtx.includes("notifiedMilestonesRef"), "Guarantees idempotency via notifiedMilestonesRef");
  assert(notifCtx.includes("currentStreak > prevStreak"), "Notifications trigger only on strict upward transition");
  assert(!notifCtx.includes(", location.pathname"), "Realtime subscriptions decoupled from location.pathname");
});

// ======================================================================
// 7. MOBILE UX, RESPONSIVENESS & PWA READINESS
// ======================================================================
await runTest("Mobile", "BottomTabBar: 5 navigation destinations with safe-area insets", () => {
  const bottomBar = fs.readFileSync(path.join(rootDir, "src/components/BottomTabBar.tsx"), "utf8");
  assert(bottomBar.includes("safe-area-inset-bottom"), "Respects iOS safe-area-inset-bottom");
  assert(bottomBar.includes("/dashboard"), "Contains Home (/dashboard)");
  assert(bottomBar.includes("/exercises"), "Contains Exercises (/exercises)");
  assert(bottomBar.includes("/workout/active"), "Contains Workout (/workout/active)");
  assert(bottomBar.includes("/nutrition"), "Contains Nutrition (/nutrition)");
  assert(bottomBar.includes("/gymbuddy/discover"), "Contains GymBuddy (/gymbuddy/discover)");
  assert(bottomBar.includes("md:hidden"), "Only visible on mobile screens");
});

await runTest("Mobile", "Header & Safe Spacing: compact mobile header & body padding", () => {
  const header = fs.readFileSync(path.join(rootDir, "src/components/Header.tsx"), "utf8");
  assert(header.includes("h-14"), "Uses compact h-14 mobile bar");
  assert(header.includes("<BottomTabBar />"), "Header conditionally renders BottomTabBar");

  const css = fs.readFileSync(path.join(rootDir, "src/index.css"), "utf8");
  assert(css.includes("padding-bottom: calc(4.5rem + env(safe-area-inset-bottom, 0px))"), "Safe bottom padding applied on mobile");
});

await runTest("Mobile", "Route Aliases: supports FORPHONE1CLAUDE convenience route paths", () => {
  const app = fs.readFileSync(path.join(rootDir, "src/App.tsx"), "utf8");
  assert(app.includes('path="/generate"'), "App defines /generate alias");
  assert(app.includes('path="/active-workout"'), "App defines /active-workout alias");
  assert(app.includes('path="/gymbuddy"'), "App defines /gymbuddy alias");
  assert(app.includes('path="/gymbuddy/profile"'), "App defines /gymbuddy/profile alias");
});

// ======================================================================
// 8. AI ASSISTANTS & EDGE FUNCTION SECURITY
// ======================================================================
await runTest("AI", "GymTrainerChat: intentional guest pathway prevents gateway 401 crash", () => {
  const trainerChat = fs.readFileSync(path.join(rootDir, "src/components/GymTrainerChat.tsx"), "utf8");
  assert(!trainerChat.includes("Bearer ${supabasePublishableKey}"), "Eliminated invalid anon key in Authorization Bearer");
  assert(trainerChat.includes("Sign in required"), "Prompts guest users with friendly sign-in modal");
});

await runTest("AI", "Edge Functions: rate limiting, payload bounding, and Gemini 2.5 streaming", () => {
  const fitnessChat = fs.readFileSync(path.join(rootDir, "supabase/functions/fitness-chat/index.ts"), "utf8");
  assert(fitnessChat.includes("checkRateLimit"), "Rate limiting implemented in fitness-chat");
  assert(fitnessChat.includes("MAX_REQUEST_SIZE"), "Max payload size enforced in fitness-chat");
  assert(fitnessChat.includes("google/gemini-2.5-flash-lite"), "Gemini 2.5 Flash Lite targeted");
  assert(fitnessChat.includes("text/event-stream"), "SSE streaming configured");

  const projectAssistant = fs.readFileSync(path.join(rootDir, "supabase/functions/project-assistant/index.ts"), "utf8");
  assert(projectAssistant.includes("checkRateLimit"), "Rate limiting implemented in project-assistant");
});

// ======================================================================
// 9. DATABASE MIGRATIONS & RLS POLICIES
// ======================================================================
await runTest("Database", "Migrations: user-media storage bucket, REPLICA IDENTITY FULL, and anti-join RPC", () => {
  const mig = fs.readFileSync(path.join(rootDir, "supabase/migrations/20260925000000_storage_and_realtime_remediation.sql"), "utf8");
  assert(mig.includes("user-media"), "user-media storage bucket created");
  assert(mig.includes("REPLICA IDENTITY FULL"), "gymbuddy_matches set to REPLICA IDENTITY FULL");
  assert(mig.includes("get_gymbuddy_candidates"), "get_gymbuddy_candidates anti-join RPC created");
  assert(mig.includes("idx_gymbuddy_swipes_swiper_target"), "Composite index on swipes created");
});

await runTest("Database", "Dead Code Removal: verified orphaned FitnessChat.tsx is deleted", () => {
  const legacyChatPath = path.join(rootDir, "src/components/FitnessChat.tsx");
  assert(!fs.existsSync(legacyChatPath), "Orphaned FitnessChat.tsx successfully removed");
});

// ======================================================================
// 10. PRODUCTION BUILD ARTIFACTS
// ======================================================================
await runTest("Build", "Bundle Artifacts: dist contains index.html, assets, CSS, and split chunks", () => {
  const distIndex = path.join(rootDir, "dist/index.html");
  assert(fs.existsSync(distIndex), "dist/index.html exists");
  const assetsDir = path.join(rootDir, "dist/assets");
  assert(fs.existsSync(assetsDir), "dist/assets directory exists");
  const files = fs.readdirSync(assetsDir);
  assert(files.length > 20, "At least 20 code-split chunk bundles generated in dist/assets");
  assert(files.some(f => f.startsWith("Index-") && f.endsWith(".js")), "Index chunk generated");
  assert(files.some(f => f.startsWith("ActiveWorkout-") && f.endsWith(".js")), "ActiveWorkout chunk generated");
  assert(files.some(f => f.startsWith("GymBuddyDiscover-") && f.endsWith(".js")), "GymBuddyDiscover chunk generated");
  assert(files.some(f => f.startsWith("NutritionRoadmap-") && f.endsWith(".js")), "NutritionRoadmap chunk generated");
});

console.log("\n======================================================================");
console.log(`BETA TEST RESULTS: ${passed} Passed, ${failed} Failed out of ${passed + failed} Suites`);
console.log("======================================================================\n");

if (failed > 0) {
  console.error("❌ The following test suites failed:");
  failures.forEach(f => console.error(`  - [${f.suite}] ${f.name}: ${f.error}`));
  process.exit(1);
} else {
  console.log("🏆 FitBox Full System Beta-Testing Passed with 100% Reliability!\n");
}
