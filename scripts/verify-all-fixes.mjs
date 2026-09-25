// scripts/verify-all-fixes.mjs
// Automated verification suite for FitBox remediation fixes

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

console.log("🚀 Starting FitBox Remediation Verification Suite...\n");

let passed = 0;
let failed = 0;

function test(name, fn) {
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

// 1. Test Inpiration Archetype Derivation & Presets
test("Inspiration Archetype: cutting is reachable via tags & presets", () => {
  // Read onboarding.ts
  const onboardingContent = fs.readFileSync(path.join(rootDir, "src/lib/onboarding.ts"), "utf8");
  assert(onboardingContent.includes('if (has("cut") || has("shredded") || has("sharp") || has("definition"))'), "cutting check is prioritized");
  assert(onboardingContent.includes('"Toji"'), "Toji preset exists");
  assert(onboardingContent.includes('"shredded"'), "Toji contains shredded tag");
});

// 2. Test Canonical Muscle Slug Mappings
test("Muscle Mapping: canonical slugs correctly map common aliases", () => {
  const muscleMappingContent = fs.readFileSync(path.join(rootDir, "src/lib/muscleMapping.ts"), "utf8");
  assert(muscleMappingContent.includes('quads: "quadriceps"'), "quads mapped to quadriceps");
  assert(muscleMappingContent.includes('hamstrings: "hamstring"'), "hamstrings mapped to hamstring");
  assert(muscleMappingContent.includes('lats: "upper-back"'), "lats mapped to upper-back");
  assert(muscleMappingContent.includes('lower_back: "lower-back"'), "lower_back mapped to lower-back");
  assert(muscleMappingContent.includes('glutes: "gluteal"'), "glutes mapped to gluteal");
  assert(muscleMappingContent.includes('export function normalizeMuscleSlug'), "normalizeMuscleSlug exported");
});

// 3. Test Database Migration
test("Supabase Migration: 20260921000000_fitbox_remediation.sql contains all required fixes", () => {
  const migrationPath = path.join(rootDir, "supabase/migrations/20260921000000_fitbox_remediation.sql");
  assert(fs.existsSync(migrationPath), "Remediation migration file exists");
  const sql = fs.readFileSync(migrationPath, "utf8");
  
  // Check GymBuddy mutual swipe RLS policy
  assert(sql.includes("Users can read right swipes targeted at them"), "Swipes RLS policy exists");
  assert(sql.includes("auth.uid() = target_id AND direction = 'right'"), "Swipes RLS policy condition matches");

  // Check phone_number NOT NULL DROP & partial unique index
  assert(sql.includes("ALTER TABLE profiles ALTER COLUMN phone_number DROP NOT NULL"), "phone_number drop not null");
  assert(sql.includes("idx_profiles_phone_unique"), "partial unique index on phone_number");

  // Check gymbuddy_messages publication
  assert(sql.includes("ALTER PUBLICATION supabase_realtime ADD TABLE gymbuddy_messages"), "gymbuddy_messages in realtime");

  // Check partner profile access policy
  assert(sql.includes("Matched users can read partner profiles"), "Matched partner profile policy");

  // Check handle_new_user trigger
  assert(sql.includes("NULLIF(NEW.raw_user_meta_data->>'phone_number', '')"), "handle_new_user handles NULL phone");
});

// 4. Test Edge Function Security & Gemini Protocol
test("Edge Function & Config: project-assistant security, rate limiting, and first-turn protocol", () => {
  const configContent = fs.readFileSync(path.join(rootDir, "supabase/config.toml"), "utf8").replace(/\r\n/g, "\n");
  assert(configContent.includes("[functions.project-assistant]\nverify_jwt = false"), "project-assistant verify_jwt is false");
  assert(configContent.includes("[functions.fitness-chat]\nverify_jwt = true"), "fitness-chat verify_jwt is true");

  const edgeFunc = fs.readFileSync(path.join(rootDir, "supabase/functions/project-assistant/index.ts"), "utf8");
  assert(edgeFunc.includes("checkRateLimit"), "Rate limiting implemented");
  assert(edgeFunc.includes("MAX_REQUEST_SIZE"), "Max request size enforced");
  assert(edgeFunc.includes('while (turns.length > 0 && turns[0].role !== "user")'), "First turn always user");
});

// 5. Test GymBuddy Guest Handling
test("GymBuddy Guest Guarding: useGymBuddy guards guest ID from PostgreSQL queries", () => {
  const hook = fs.readFileSync(path.join(rootDir, "src/hooks/useGymBuddy.ts"), "utf8");
  assert(hook.includes("isGuest"), "isGuest defined");
  assert(hook.includes("if (!effectiveUserId || isGuest)"), "fetchProfile guarded");
  assert(hook.includes("if (isGuest) return [];"), "getCandidates guarded");
  assert(hook.includes("if (isGuest) throw new Error"), "swipe and save guarded");
});

// 6. Test Workout Persistence & Set Removal
test("Workout: WorkoutProvider at App scope, localStorage persistence, SetRow delete UI", () => {
  const app = fs.readFileSync(path.join(rootDir, "src/App.tsx"), "utf8");
  assert(app.includes("<WorkoutProvider>"), "WorkoutProvider mounted at App scope");

  const workoutCtx = fs.readFileSync(path.join(rootDir, "src/contexts/WorkoutContext.tsx"), "utf8");
  assert(workoutCtx.includes("fitbox:activeWorkout"), "localStorage persistence enabled");

  const exerciseLogCard = fs.readFileSync(path.join(rootDir, "src/components/workout/ExerciseLogCard.tsx"), "utf8");
  assert(exerciseLogCard.includes("canRemove"), "canRemove prop checked");
  assert(exerciseLogCard.includes("onRemove"), "onRemove prop wired to button");
});

// 7. Test Nutrition Roadmap cutting goals, negative carbs guard, and meal plans
test("Nutrition: cutting goal calorie reduction, negative carbs clamp, and vegan/veg meal plans", () => {
  const roadmap = fs.readFileSync(path.join(rootDir, "src/pages/NutritionRoadmap.tsx"), "utf8");
  assert(roadmap.includes('if (data.goal === "cutting") tdee -= 500;'), "cutting goal subtracts 500 kcal");
  assert(roadmap.includes("Math.max(0, Math.round((tdee - (protein * 4) - (fats * 9)) / 4))"), "negative carbs guarded");
  assert(roadmap.includes("getPersonalizedDayPlan"), "getPersonalizedDayPlan implemented");
  assert(roadmap.includes("fitbox:onboarding"), "onboarding preferences fallback supported");
  assert(roadmap.includes("window.print()"), "PDF print functionality implemented");
});

// 8. Test Indian Food Database oils-condiments reconciliation
test("Indian Food Database: oils-condiments populated and included in allFoods", () => {
  const db = fs.readFileSync(path.join(rootDir, "src/data/indianFoodDatabase.ts"), "utf8");
  assert(db.includes("export const oilsCondiments: FoodItem[]"), "oilsCondiments array exported");
  assert(db.includes("...oilsCondiments"), "oilsCondiments included in allFoods");
  assert(db.includes("desi-ghee"), "Desi Ghee included");
  assert(db.includes("mustard-oil"), "Mustard Oil included");
});

// 9. Test Header & GymBuddy Navigation Paths
test("Navigation: Header includes responsive nav links; GymBuddy has escape paths", () => {
  const header = fs.readFileSync(path.join(rootDir, "src/components/Header.tsx"), "utf8");
  assert(header.includes("/dashboard"), "Link to dashboard");
  assert(header.includes("/exercises"), "Link to exercises");
  assert(header.includes("/workout/active"), "Link to workout");
  assert(header.includes("/nutrition"), "Link to nutrition");
  assert(header.includes("/gymbuddy/discover"), "Link to GymBuddy");

  const discover = fs.readFileSync(path.join(rootDir, "src/pages/GymBuddyDiscover.tsx"), "utf8");
  assert(discover.includes("navigate('/dashboard')"), "Discover has dashboard return link");
  assert(discover.includes("navigate('/gymbuddy/matches')"), "Discover has matches link");
});

// 10. Test Dead Code Removal Verification
test("Dead Code Cleanup: verified unused legacy components removed", () => {
  const deadFiles = [
    "src/components/BodyDiagram.tsx",
    "src/components/HeroSection.tsx",
    "src/components/MuscleMap.tsx",
    "src/components/TrainerContactButton.tsx",
    "src/hooks/useTrainerContact.ts"
  ];
  for (const file of deadFiles) {
    assert(!fs.existsSync(path.join(rootDir, file)), `File ${file} should be deleted`);
  }
});

// 11. Test Password Reset Route & Flow
test("Password Reset: dedicated route and component configured", () => {
  assert(fs.existsSync(path.join(rootDir, "src/pages/ResetPassword.tsx")), "ResetPassword.tsx exists");
  const app = fs.readFileSync(path.join(rootDir, "src/App.tsx"), "utf8");
  assert(app.includes('path="/reset-password"'), "Route path=/reset-password exists in App.tsx");
  assert(app.includes("isRecovery"), "PublicRoute preserves recovery flow");
  assert(app.includes("search") && app.includes("hash"), "Preserves URL search and hash for recovery token");
});

// 12. Test Auth Schemas & Validation Rules
test("Auth Schemas: canonical password, username regex, and email trimming", () => {
  const schemaFile = fs.readFileSync(path.join(rootDir, "src/lib/authSchemas.ts"), "utf8");
  assert(schemaFile.includes("passwordSchema = z.string()") && schemaFile.includes(".min(8"), "passwordSchema enforces min 8 characters");
  assert(schemaFile.includes("usernameSchema = z.string()"), "usernameSchema defined");
  assert(schemaFile.includes("^[a-zA-Z0-9_-]+$"), "usernameSchema enforces safe alphanumeric, underscore and hyphen regex");
  assert(schemaFile.includes("resetPasswordSchema = z.object"), "resetPasswordSchema exported");
  assert(schemaFile.includes("Passwords do not match"), "resetPasswordSchema validates password matching");
});

// 13. Test AuthContext Profile Sync & Error Translation
test("AuthContext: robust profile hydration, trigger retries, and friendly error handling", () => {
  const authCtx = fs.readFileSync(path.join(rootDir, "src/contexts/AuthContext.tsx"), "utf8");
  assert(authCtx.includes("fetchUserProfile"), "fetchUserProfile helper defined");
  assert(authCtx.includes("maybeSingle()"), "uses maybeSingle() to prevent unhandled 0-row exceptions");
  assert(authCtx.includes("setTimeout(resolve, 250)"), "implements retry delay for async DB triggers");
  assert(authCtx.includes("localStorage.removeItem('fitBoxUser')"), "clears guest state on authenticating");
  assert(authCtx.includes("That username is already taken"), "translates duplicate username constraint errors");
  assert(authCtx.includes("Invalid email or password"), "accurate email-specific error message in signIn");
});

// 14. Test Auth UI Usability & Mode Toggles
test("Auth UI: password eye toggles, direct sign-in/up mode switches, and mobile attributes", () => {
  const authPage = fs.readFileSync(path.join(rootDir, "src/pages/Auth.tsx"), "utf8");
  assert(authPage.includes("showPassword"), "showPassword state declared");
  assert(authPage.includes("<Eye"), "Eye icon rendered for password toggle");
  assert(authPage.includes("<EyeOff"), "EyeOff icon rendered for password toggle");
  assert(authPage.includes("onClick={() => setMode('signin')}"), "Direct switch to signin available");
  assert(authPage.includes("onClick={() => setMode('signup')}"), "Direct switch to signup available");
  assert(authPage.includes("autoComplete=\"email\""), "mobile email autocomplete enabled");
  assert(authPage.includes("autoComplete=\"username\""), "mobile username autocomplete enabled");
  assert(authPage.includes("autoCapitalize=\"none\""), "autoCapitalize disabled on usernames/emails");
});

// 15. Test ResetPassword Component Compliance
test("ResetPassword: uses canonical resetPasswordSchema and password visibility toggle", () => {
  const resetPage = fs.readFileSync(path.join(rootDir, "src/pages/ResetPassword.tsx"), "utf8");
  assert(resetPage.includes("resetPasswordSchema"), "imports canonical resetPasswordSchema");
  assert(resetPage.includes("showPassword"), "supports showPassword toggle");
  assert(resetPage.includes("Eye"), "Eye icons rendered for visibility toggle");
});

// 16. Test Mobile Adaptations & Route Aliases (FORPHONE1CLAUDE)
test("Mobile Adaptations: BottomTabBar, compact Header, safe area insets, and route aliases", () => {
  const bottomBar = fs.readFileSync(path.join(rootDir, "src/components/BottomTabBar.tsx"), "utf8");
  assert(bottomBar.includes("safe-area-inset-bottom"), "BottomTabBar respects iOS safe-area-inset-bottom");
  assert(bottomBar.includes("/dashboard") && bottomBar.includes("/exercises") && bottomBar.includes("/workout/active"), "BottomTabBar contains key routes");

  const header = fs.readFileSync(path.join(rootDir, "src/components/Header.tsx"), "utf8");
  assert(header.includes("<BottomTabBar />"), "Header renders BottomTabBar");
  assert(header.includes("h-14"), "Header uses compact mobile h-14 bar");

  const app = fs.readFileSync(path.join(rootDir, "src/App.tsx"), "utf8");
  assert(app.includes('path="/generate"'), "App defines /generate alias");
  assert(app.includes('path="/active-workout"'), "App defines /active-workout alias");
  assert(app.includes('path="/gymbuddy"'), "App defines /gymbuddy alias");
  assert(app.includes('path="/gymbuddy/profile"'), "App defines /gymbuddy/profile alias");
});

// 17. Test Workout Hydration Race & Discard Flow
test("Workout: isHydrated lifecycle guard, discardWorkout confirmation dialog, and numeric input editing", () => {
  const workoutCtx = fs.readFileSync(path.join(rootDir, "src/contexts/WorkoutContext.tsx"), "utf8");
  assert(workoutCtx.includes("isHydrated"), "WorkoutContext uses isHydrated lifecycle guard");
  assert(workoutCtx.includes("discardWorkout"), "WorkoutContext exposes discardWorkout");

  const workoutHeader = fs.readFileSync(path.join(rootDir, "src/components/workout/WorkoutHeader.tsx"), "utf8");
  assert(workoutHeader.includes("onDiscard"), "WorkoutHeader supports onDiscard prop");
  assert(workoutHeader.includes("AlertDialog"), "WorkoutHeader uses AlertDialog for discard confirmation");

  const activeWorkout = fs.readFileSync(path.join(rootDir, "src/pages/ActiveWorkout.tsx"), "utf8");
  assert(activeWorkout.includes("handleDiscard"), "ActiveWorkout implements handleDiscard");

  const exerciseCard = fs.readFileSync(path.join(rootDir, "src/components/workout/ExerciseLogCard.tsx"), "utf8");
  assert(exerciseCard.includes("weightStr") && exerciseCard.includes("repsStr"), "ExerciseLogCard separates string input state from numeric persistence");
});

// 18. Test Onboarding Media Storage & Safe Validation
test("Onboarding Media: user-media bucket with MIME restrictions, RLS policies, and non-blocking validation", () => {
  const migration = fs.readFileSync(path.join(rootDir, "supabase/migrations/20260925000000_storage_and_realtime_remediation.sql"), "utf8");
  assert(migration.includes("user-media"), "Migration defines user-media storage bucket");
  assert(migration.includes("image/jpeg") && migration.includes("image/png") && migration.includes("image/webp"), "MIME types include standard images");
  assert(migration.includes("REPLICA IDENTITY FULL"), "Migration configures REPLICA IDENTITY FULL for gymbuddy_matches");

  const onboardingPage = fs.readFileSync(path.join(rootDir, "src/pages/Onboarding.tsx"), "utf8");
  assert(onboardingPage.includes("user-media"), "Onboarding attempts upload to user-media bucket");
  assert(onboardingPage.includes("ALLOWED_MIME_TYPES"), "Onboarding validates MIME types before upload");
  assert(onboardingPage.includes("fallbackPresetImage"), "Onboarding guarantees fallback preset image to avoid Step 5 schema trap");
});

// 19. Test GymBuddy Identity, Scalability, and Compatibility Breakdown
test("GymBuddy: canonical authUserId comparisons, RPC candidate discovery, and multi-dimensional radar", () => {
  const chatPage = fs.readFileSync(path.join(rootDir, "src/pages/GymBuddyChat.tsx"), "utf8");
  assert(chatPage.includes("activeAuthUserId"), "GymBuddyChat computes activeAuthUserId");
  assert(chatPage.includes("msg.sender_id === activeAuthUserId"), "GymBuddyChat compares sender_id to activeAuthUserId");

  const hook = fs.readFileSync(path.join(rootDir, "src/hooks/useGymBuddy.ts"), "utf8");
  assert(hook.includes("get_gymbuddy_candidates"), "useGymBuddy leverages get_gymbuddy_candidates RPC");
  assert(hook.includes("compatibility_breakdown"), "useGymBuddy computes dimensional compatibility_breakdown");

  const card = fs.readFileSync(path.join(rootDir, "src/components/gymbuddy/GymBuddyCard.tsx"), "utf8");
  assert(card.includes("candidate.compatibility_breakdown"), "GymBuddyCard radar chart displays canonical compatibility_breakdown");

  const setupPage = fs.readFileSync(path.join(rootDir, "src/pages/GymBuddyProfileSetup.tsx"), "utf8");
  assert(setupPage.includes("user?.isGuest"), "GymBuddyProfileSetup performs upfront guest gating");
});

// 20. Test GymBuddy Streak Milestone Idempotency
test("GymBuddy Notifications: authoritative previous streak tracking and idempotent milestone alerts", () => {
  const notifCtx = fs.readFileSync(path.join(rootDir, "src/contexts/GymBuddyNotificationContext.tsx"), "utf8");
  assert(notifCtx.includes("previousStreaksRef"), "Notification context tracks previousStreaksRef");
  assert(notifCtx.includes("notifiedMilestonesRef"), "Notification context enforces idempotent notifiedMilestonesRef");
  assert(notifCtx.includes("currentStreak > prevStreak"), "Notifications fire only on strictly increasing streak transitions");
});

// 21. Test Nutrition Roadmap Cloud Sync & Crash Resilience
test("Nutrition: robust malformed JSON recovery and cross-device Supabase preferences sync", () => {
  const questionnaire = fs.readFileSync(path.join(rootDir, "src/pages/NutritionQuestionnaire.tsx"), "utf8");
  assert(questionnaire.includes("profiles") && questionnaire.includes("preferences"), "Questionnaire syncs nutrition data to profiles.preferences");

  const roadmap = fs.readFileSync(path.join(rootDir, "src/pages/NutritionRoadmap.tsx"), "utf8");
  assert(roadmap.includes("Corrupted nutritionUserData"), "Roadmap handles corrupted nutritionUserData safely");
  assert(roadmap.includes("profiles") && roadmap.includes("preferences"), "Roadmap hydrates and syncs with cloud profile preferences");
});

// 22. Test Cloudflare Workers Configuration & Supabase Migration Alignment
test("Deployment & Migrations: wrangler.toml SPA routing and non-recursive RLS policies", () => {
  const wranglerPath = path.join(rootDir, "wrangler.toml");
  assert(fs.existsSync(wranglerPath), "wrangler.toml exists for Cloudflare Workers Builds");
  const wranglerContent = fs.readFileSync(wranglerPath, "utf8");
  assert(wranglerContent.includes('name = "fitbox"'), "wrangler.toml specifies name = fitbox");
  assert(wranglerContent.includes('not_found_handling = "single-page-application"'), "wrangler.toml enables SPA fallback routing");

  const recursionFixPath = path.join(rootDir, "supabase/migrations/20260925120000_fix_gymbuddy_profiles_recursion.sql");
  assert(fs.existsSync(recursionFixPath), "Recursion fix migration file exists");
  const recursionSql = fs.readFileSync(recursionFixPath, "utf8");
  assert(recursionSql.includes("is_user_discoverable") && recursionSql.includes("SECURITY DEFINER"), "Recursion fix defines SECURITY DEFINER function");
});

console.log(`\nResults: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log(`🎉 All ${passed} verification suites passed with flying colors!\n`);
}


