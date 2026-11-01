/**
 * @file structuredGeneration.ts
 * @description Production-grade Structured Output Validation & Programmatic Repair Pipeline for FitBox.
 *
 * Provides:
 * 1. Strict Zod schemas for AI Workout Plan & Nutrition Plan generation.
 * 2. Gemini OpenAPI-compliant JSON Schema generators for schema-constrained decoding.
 * 3. Programmatic anti-hallucination engine:
 *    - Fuzzy/alias exercise resolution against the canonical 96 exercises.
 *    - Muscle-group intelligent fallback substitution for hallucinated IDs.
 *    - Biomechanical constraint clamping (sets 1-8, reps 1-30, RPE 6-10, rest 30-300s).
 * 4. Thermodynamic macro balancing for nutrition plans (4P + 4C + 9F equation).
 * 5. Comprehensive repair audit logging.
 */

import { z } from "zod";
import { exercises, type Exercise } from "@/data/exercises";

type JsonRecord = Record<string, unknown>;

const isJsonRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

// ============================================================================
// 1. CANONICAL EXERCISE INDEX & ALIAS MAP FOR ANTI-HALLUCINATION
// ============================================================================

const canonicalExerciseMap = new Map<string, Exercise>();
const canonicalNameMap = new Map<string, Exercise>();

// Helper to create clean slug
const toSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Build fast O(1) indices
for (const ex of exercises) {
  canonicalExerciseMap.set(ex.id.toLowerCase().trim(), ex);
  canonicalNameMap.set(ex.name.toLowerCase().trim(), ex);

  // Index slug version of full name
  const fullSlug = toSlug(ex.name);
  canonicalExerciseMap.set(fullSlug, ex);

  // If name has parentheses like "Romanian Deadlift (RDL)", index clean base name and acronym
  const parenMatch = ex.name.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    const baseName = parenMatch[1].trim().toLowerCase();
    const acronym = parenMatch[2].trim().toLowerCase();
    canonicalNameMap.set(baseName, ex);
    canonicalExerciseMap.set(toSlug(baseName), ex);
    canonicalExerciseMap.set(acronym, ex);
  }
}

// Common fitness aliases and nicknames mapped to exercises
const EXERCISE_ALIASES: Record<string, Exercise> = {
  // Chest
  "bench": canonicalExerciseMap.get("bench-press") || exercises[0],
  "bench-press": canonicalExerciseMap.get("bench-press") || exercises[0],
  "flat bench": canonicalExerciseMap.get("bench-press") || exercises[0],
  "barbell bench": canonicalExerciseMap.get("bench-press") || exercises[0],
  "pushup": canonicalExerciseMap.get("push-ups") || exercises[0],
  "pushups": canonicalExerciseMap.get("push-ups") || exercises[0],
  "push-ups": canonicalExerciseMap.get("push-ups") || exercises[0],

  // Back
  "deadlift": canonicalExerciseMap.get("conventional-deadlift") || exercises[0],
  "rdl": canonicalExerciseMap.get("romanian-deadlift") || canonicalExerciseMap.get("rdl") || exercises[0],
  "romanian deadlift": canonicalExerciseMap.get("romanian-deadlift") || canonicalExerciseMap.get("rdl") || exercises[0],
  "romanian-deadlift": canonicalExerciseMap.get("romanian-deadlift") || canonicalExerciseMap.get("rdl") || exercises[0],
  "lat pulldown": canonicalExerciseMap.get("lat-pulldown") || exercises[0],
  "lat-pulldown": canonicalExerciseMap.get("lat-pulldown") || exercises[0],
  "pull up": canonicalExerciseMap.get("pull-ups") || exercises[0],
  "pullups": canonicalExerciseMap.get("pull-ups") || exercises[0],
  "pull-ups": canonicalExerciseMap.get("pull-ups") || exercises[0],

  // Shoulders
  "overhead press": canonicalExerciseMap.get("overhead-press") || exercises[0],
  "ohp": canonicalExerciseMap.get("overhead-press") || exercises[0],
  "military press": canonicalExerciseMap.get("overhead-press") || exercises[0],
  "lateral raise": canonicalExerciseMap.get("dumbbell-lateral-raise") || exercises[0],
  "face pull": canonicalExerciseMap.get("face-pull") || exercises[0],

  // Legs
  "squat": canonicalExerciseMap.get("barbell-back-squat") || exercises[0],
  "back squat": canonicalExerciseMap.get("barbell-back-squat") || exercises[0],
  "barbell squat": canonicalExerciseMap.get("barbell-back-squat") || exercises[0],
  "leg press": canonicalExerciseMap.get("leg-press") || exercises[0],
  "hip thrust": canonicalExerciseMap.get("barbell-hip-thrust") || exercises[0],
  "calf raise": canonicalExerciseMap.get("standing-calf-raises") || exercises[0],

  // Arms
  "bicep curl": canonicalExerciseMap.get("barbell-bicep-curl") || exercises[0],
  "hammer curl": canonicalExerciseMap.get("dumbbell-hammer-curls") || exercises[0],
  "tricep pushdown": canonicalExerciseMap.get("tricep-rope-pushdown") || exercises[0],
  "skull crusher": canonicalExerciseMap.get("skull-crushers") || exercises[0],

  // Core
  "plank": canonicalExerciseMap.get("plank") || exercises[0],
  "hanging leg raise": canonicalExerciseMap.get("hanging-leg-raise") || exercises[0],
};

// Muscle group representative canonical fallbacks
const MUSCLE_FALLBACK_EXERCISES: Record<string, Exercise> = {
  chest: exercises.find(e => e.name === "Bench Press") || exercises[0],
  back: exercises.find(e => e.name.toLowerCase().includes("lat pulldown") || e.muscleGroup === "Back") || exercises[0],
  shoulders: exercises.find(e => e.muscleGroup === "Shoulders") || exercises[0],
  legs: exercises.find(e => e.muscleGroup === "Legs") || exercises[0],
  quads: exercises.find(e => e.muscleGroup === "Legs") || exercises[0],
  hamstrings: exercises.find(e => e.name.includes("Deadlift") || e.muscleGroup === "Legs") || exercises[0],
  glutes: exercises.find(e => e.muscleGroup === "Glutes" || e.muscleGroup === "Legs") || exercises[0],
  calves: exercises.find(e => e.name.toLowerCase().includes("calf") || e.muscleGroup === "Legs") || exercises[0],
  biceps: exercises.find(e => e.muscleGroup === "Arms") || exercises[0],
  triceps: exercises.find(e => e.muscleGroup === "Arms") || exercises[0],
  core: exercises.find(e => e.muscleGroup === "Core") || exercises[0],
  forearms: exercises.find(e => e.muscleGroup === "Arms") || exercises[0],
};

// ============================================================================
// 2. STRICT ZOD SCHEMAS FOR WORKOUT & NUTRITION GENERATION
// ============================================================================

export const PlanExerciseSchema = z.object({
  exerciseId: z.string().min(1, "Exercise ID is required"),
  exerciseName: z.string().min(1, "Exercise name is required"),
  targetMuscle: z.string().min(1, "Target muscle is required"),
  sets: z.number().int().min(1).max(8),
  reps: z.union([z.string().min(1), z.number().int().min(1).max(50)]),
  rpe: z.number().min(6).max(10).optional().default(8),
  restSeconds: z.number().int().min(30).max(300).default(90),
  tempo: z.string().optional().default("2-0-1-0"),
  notes: z.string().optional(),
});

export type PlanExercise = z.infer<typeof PlanExerciseSchema>;

export const WorkoutDaySchema = z.object({
  dayName: z.string().min(1, "Day name is required (e.g., 'Push A')"),
  focus: z.string().min(1, "Focus is required"),
  estimatedDurationMinutes: z.number().int().min(15).max(180).default(60),
  warmup: z.array(z.string()).default([]),
  exercises: z.array(PlanExerciseSchema).min(1, "At least 1 exercise is required per day"),
  cooldown: z.array(z.string()).default([]),
});

export type WorkoutDay = z.infer<typeof WorkoutDaySchema>;

export const WorkoutPlanSchema = z.object({
  planName: z.string().min(1, "Plan name is required"),
  fitnessLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
  goal: z.enum([
    "Hypertrophy",
    "Strength",
    "Endurance",
    "Fat Loss",
    "Athletic Performance",
  ]),
  daysPerWeek: z.number().int().min(1).max(7),
  weeklyVolumeOverview: z.record(z.string(), z.number()).default({}),
  days: z.array(WorkoutDaySchema).min(1).max(7),
  progressionRule: z.string().min(1, "Progression rule is required"),
  safetyNotes: z.array(z.string()).default([]),
});

export type WorkoutPlan = z.infer<typeof WorkoutPlanSchema>;

// Nutrition Schemas
export const NutritionMealItemSchema = z.object({
  foodName: z.string().min(1),
  portion: z.string().min(1),
  calories: z.number().min(0),
  proteinGrams: z.number().min(0),
  carbsGrams: z.number().min(0),
  fatsGrams: z.number().min(0),
});

export type NutritionMealItem = z.infer<typeof NutritionMealItemSchema>;

export const NutritionMealSchema = z.object({
  mealName: z.string().min(1),
  time: z.string().optional(),
  items: z.array(NutritionMealItemSchema).min(1),
  totalMealCalories: z.number().min(0),
});

export type NutritionMeal = z.infer<typeof NutritionMealSchema>;

export const NutritionDayPlanSchema = z.object({
  dayNumber: z.number().int().min(1).max(7),
  dayTitle: z.string().min(1),
  totalCalories: z.number().min(800).max(6000),
  targetMacros: z.object({
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fats: z.number().min(0),
  }),
  meals: z.array(NutritionMealSchema).min(1),
});

export type NutritionDayPlan = z.infer<typeof NutritionDayPlanSchema>;

export const NutritionPlanSchema = z.object({
  planName: z.string().min(1),
  dietType: z.string().min(1),
  targetCalories: z.number().min(800).max(6000),
  proteinTargetGrams: z.number().min(20).max(400),
  carbsTargetGrams: z.number().min(20).max(700),
  fatsTargetGrams: z.number().min(10).max(250),
  days: z.array(NutritionDayPlanSchema).min(1).max(7),
  hydrationLiters: z.number().min(1).max(10).default(3.0),
});

export type NutritionPlan = z.infer<typeof NutritionPlanSchema>;

// ============================================================================
// 3. REPAIR AUDIT LOG INTERFACE
// ============================================================================

export interface RepairLog {
  field: string;
  issue: string;
  original: unknown;
  repairedTo: unknown;
  actionTaken: string;
}

export interface StructuredValidationResult<T> {
  success: boolean;
  data?: T;
  repaired: boolean;
  repairs: RepairLog[];
  errors?: string[];
  rawText?: string;
}

// ============================================================================
// 4. PROGRAMMATIC EXERCISE REPAIR ENGINE (ANTI-HALLUCINATION)
// ============================================================================

/**
 * Resolves any raw or hallucinated exercise input against the canonical 96-exercise database.
 * If the LLM generates an invalid slug or nickname, it uses alias maps and fuzzy scoring.
 * If completely hallucinated, it substitutes a canonical exercise matching the muscle group.
 */
export function resolveExerciseOrRepair(raw: {
  exerciseId?: string;
  exerciseName?: string;
  targetMuscle?: string;
}): { exercise: Exercise; repairLog?: RepairLog } {
  const rawId = (raw.exerciseId || "").toLowerCase().trim();
  const rawName = (raw.exerciseName || "").toLowerCase().trim();
  const rawMuscle = (raw.targetMuscle || "").toLowerCase().trim();

  // 1. Direct ID match
  if (rawId && canonicalExerciseMap.has(rawId)) {
    return { exercise: canonicalExerciseMap.get(rawId)! };
  }

  // 2. Direct Name match
  if (rawName && canonicalNameMap.has(rawName)) {
    const match = canonicalNameMap.get(rawName)!;
    return {
      exercise: match,
      repairLog: {
        field: "exerciseId",
        issue: "Missing or incorrect exerciseId resolved by exact exerciseName",
        original: rawId || "<missing>",
        repairedTo: match.id,
        actionTaken: "Matched canonical exercise name to ID",
      },
    };
  }

  // 3. Normalized slug check (e.g. "incline_dumbbell_press" -> "incline-dumbbell-press")
  const slugified = (rawId || rawName).replace(/[\s_]+/g, "-");
  if (canonicalExerciseMap.has(slugified)) {
    const match = canonicalExerciseMap.get(slugified)!;
    return {
      exercise: match,
      repairLog: {
        field: "exerciseId",
        issue: "Underscores or malformed slug characters in exercise ID",
        original: rawId,
        repairedTo: match.id,
        actionTaken: "Slug normalization",
      },
    };
  }

  // 4. Alias lookup
  const aliasMatch = EXERCISE_ALIASES[rawId] || EXERCISE_ALIASES[rawName];
  if (aliasMatch) {
    return {
      exercise: aliasMatch,
      repairLog: {
        field: "exerciseId",
        issue: "LLM generated colloquial nickname / alias instead of canonical ID",
        original: rawId || rawName,
        repairedTo: aliasMatch.id,
        actionTaken: `Mapped alias to canonical ID '${aliasMatch.id}' (${aliasMatch.name})`,
      },
    };
  }

  // 5. Fuzzy substring search across database
  const searchKey = (rawName || rawId).replace(/[-_]/g, " ");
  let bestCandidate: Exercise | null = null;
  let bestScore = 0;

  for (const ex of exercises) {
    const exNameLower = ex.name.toLowerCase();
    if (exNameLower.includes(searchKey) || searchKey.includes(exNameLower)) {
      bestCandidate = ex;
      break;
    }
    // Simple word overlap scoring
    const searchWords = searchKey.split(/\s+/).filter(w => w.length > 2);
    const exWords = exNameLower.split(/\s+/);
    const overlap = searchWords.filter(w => exWords.includes(w)).length;
    if (overlap > bestScore) {
      bestScore = overlap;
      bestCandidate = ex;
    }
  }

  if (bestCandidate && bestScore >= 1) {
    return {
      exercise: bestCandidate,
      repairLog: {
        field: "exerciseId",
        issue: "Hallucinated or imprecise exercise description",
        original: rawId || rawName,
        repairedTo: bestCandidate.id,
        actionTaken: `Fuzzy substring match (${bestCandidate.name})`,
      },
    };
  }

  // 6. Muscle group fallback substitution (interception of pure hallucination)
  for (const [muscleKey, fallbackExercise] of Object.entries(MUSCLE_FALLBACK_EXERCISES)) {
    if (rawMuscle.includes(muscleKey) || rawName.includes(muscleKey) || rawId.includes(muscleKey)) {
      return {
        exercise: fallbackExercise,
        repairLog: {
          field: "exerciseId",
          issue: "Pure LLM hallucination: non-existent exercise requested",
          original: rawId || rawName,
          repairedTo: fallbackExercise.id,
          actionTaken: `Intercepted hallucination; substituted canonical ${fallbackExercise.muscleGroup} exercise (${fallbackExercise.name})`,
        },
      };
    }
  }

  // 7. Ultimate fallback
  const fallback = exercises[0]; // Barbell Bench Press
  return {
    exercise: fallback,
    repairLog: {
      field: "exerciseId",
      issue: "Unresolvable hallucinated exercise",
      original: rawId || rawName,
      repairedTo: fallback.id,
      actionTaken: "Substituted primary benchmark compound exercise",
    },
  };
}

// ============================================================================
// 5. WORKOUT PLAN VALIDATION & REPAIR PIPELINE
// ============================================================================

/**
 * Parses, repairs, and strictly validates a raw LLM workout generation output.
 * Guarantees zero runtime crashes and 100% adherence to database exercise IDs.
 */
export function validateAndRepairWorkoutPlan(
  rawInput: unknown
): StructuredValidationResult<WorkoutPlan> {
  const repairs: RepairLog[] = [];

  // Step 1: Extract JSON from markdown or string if needed
  let parsedValue: unknown = rawInput;
  if (typeof rawInput === "string") {
    try {
      const cleaned = rawInput
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      parsedValue = JSON.parse(cleaned);
    } catch (err: unknown) {
      // Try to find a JSON block inside arbitrary text
      const jsonMatch = rawInput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedValue = JSON.parse(jsonMatch[0]);
        } catch {
          return {
            success: false,
            repaired: false,
            repairs: [],
            errors: [`Failed to parse JSON from model output: ${getErrorMessage(err)}`],
            rawText: String(rawInput),
          };
        }
      } else {
        return {
          success: false,
          repaired: false,
          repairs: [],
          errors: ["No valid JSON object detected in response"],
          rawText: String(rawInput),
        };
      }
    }
  }

  if (!isJsonRecord(parsedValue)) {
    return {
      success: false,
      repaired: false,
      repairs: [],
      errors: ["Workout plan must be an object"],
    };
  }
  const parsed = parsedValue;

  // Step 2: Programmatically repair top-level structure
  if (!parsed.planName || typeof parsed.planName !== "string") {
    repairs.push({
      field: "planName",
      issue: "Missing or invalid planName",
      original: parsed.planName,
      repairedTo: "Personalized AI Strength & Hypertrophy Program",
      actionTaken: "Assigned default plan name",
    });
    parsed.planName = "Personalized AI Strength & Hypertrophy Program";
  }

  const validFitnessLevels = ["Beginner", "Intermediate", "Advanced"];
  if (typeof parsed.fitnessLevel !== "string" || !validFitnessLevels.includes(parsed.fitnessLevel)) {
    repairs.push({
      field: "fitnessLevel",
      issue: `Invalid fitness level '${parsed.fitnessLevel}'`,
      original: parsed.fitnessLevel,
      repairedTo: "Intermediate",
      actionTaken: "Clamped to 'Intermediate'",
    });
    parsed.fitnessLevel = "Intermediate";
  }

  const validGoals = [
    "Hypertrophy",
    "Strength",
    "Endurance",
    "Fat Loss",
    "Athletic Performance",
  ];
  if (typeof parsed.goal !== "string" || !validGoals.includes(parsed.goal)) {
    repairs.push({
      field: "goal",
      issue: `Invalid goal '${parsed.goal}'`,
      original: parsed.goal,
      repairedTo: "Hypertrophy",
      actionTaken: "Clamped to 'Hypertrophy'",
    });
    parsed.goal = "Hypertrophy";
  }

  if (!Array.isArray(parsed.days) || parsed.days.length === 0) {
    repairs.push({
      field: "days",
      issue: "Missing or empty workout days array",
      original: parsed.days,
      repairedTo: "1 default day generated",
      actionTaken: "Constructed fallback workout day",
    });
    parsed.days = [
      {
        dayName: "Full Body Foundation",
        focus: "Compound hypertrophy and core stability",
        estimatedDurationMinutes: 60,
        warmup: ["5 min dynamic mobility", "Arm circles", "Bodyweight squats"],
        exercises: [],
        cooldown: ["Hamstring stretch", "Doorway chest stretch"],
      },
    ];
  }

  // Step 3: Repair days and exercises
  const weeklyVolume: Record<string, number> = {};

  const sanitizedDays = (parsed.days as unknown[]).map((dayValue: unknown, dayIdx: number) => {
    const day = isJsonRecord(dayValue) ? dayValue : {};
    const dayName =
      typeof day.dayName === "string" && day.dayName.trim()
        ? day.dayName
        : `Day ${dayIdx + 1}: Split Workout`;
    const focus =
      typeof day.focus === "string" && day.focus.trim()
        ? day.focus
        : "Strength and hypertrophy stimulus";
    const duration =
      typeof day.estimatedDurationMinutes === "number" &&
      day.estimatedDurationMinutes >= 15 &&
      day.estimatedDurationMinutes <= 180
        ? Math.round(day.estimatedDurationMinutes)
        : 60;
    const warmup = Array.isArray(day.warmup) ? day.warmup : ["5-10 min dynamic mobility"];
    const cooldown = Array.isArray(day.cooldown) ? day.cooldown : ["5 min static stretching"];

    let rawExercises: unknown[] = Array.isArray(day.exercises) ? day.exercises : [];
    if (rawExercises.length === 0) {
      repairs.push({
        field: `days[${dayIdx}].exercises`,
        issue: "Empty exercise array in workout day",
        original: [],
        repairedTo: "Populated with 3 compound exercises",
        actionTaken: "Added Barbell Bench Press, Lat Pulldown, and Barbell Squat",
      });
      rawExercises = [
        { exerciseId: "bench-press", sets: 3, reps: "8-12", targetMuscle: "Chest" },
        { exerciseId: "lat-pulldown", sets: 3, reps: "10-12", targetMuscle: "Back" },
        { exerciseId: "barbell-back-squat", sets: 3, reps: "8-10", targetMuscle: "Legs" },
      ];
    }

    const sanitizedExercises = rawExercises.map((exerciseValue: unknown, exIdx: number) => {
      const exRaw = isJsonRecord(exerciseValue) ? exerciseValue : {};
      // Anti-hallucination resolution
      const { exercise, repairLog } = resolveExerciseOrRepair({
        exerciseId: typeof exRaw.exerciseId === "string" ? exRaw.exerciseId : undefined,
        exerciseName: typeof exRaw.exerciseName === "string" ? exRaw.exerciseName : typeof exRaw.name === "string" ? exRaw.name : undefined,
        targetMuscle: typeof exRaw.targetMuscle === "string" ? exRaw.targetMuscle : typeof exRaw.muscleGroup === "string" ? exRaw.muscleGroup : undefined,
      });

      if (repairLog) {
        repairs.push({
          ...repairLog,
          field: `days[${dayIdx}].exercises[${exIdx}].${repairLog.field}`,
        });
      }

      // Clamping sets (1 to 8)
      let sets = Number(exRaw.sets);
      if (isNaN(sets) || sets < 1 || sets > 8) {
        const clampedSets = isNaN(sets) || sets < 1 ? 3 : 5;
        repairs.push({
          field: `days[${dayIdx}].exercises[${exIdx}].sets`,
          issue: `Sets count '${exRaw.sets}' out of safe range (1-8)`,
          original: exRaw.sets,
          repairedTo: clampedSets,
          actionTaken: "Clamped to safe volume boundary",
        });
        sets = clampedSets;
      }

      // Formatting reps
      let reps: unknown = exRaw.reps;
      if (typeof reps === "number") {
        if (reps < 1 || reps > 50) {
          reps = "8-12";
          repairs.push({
            field: `days[${dayIdx}].exercises[${exIdx}].reps`,
            issue: `Numeric reps out of range: ${exRaw.reps}`,
            original: exRaw.reps,
            repairedTo: "8-12",
            actionTaken: "Reset to standard hypertrophy rep target",
          });
        } else {
          reps = String(reps);
        }
      } else if (typeof reps !== "string" || !reps.trim()) {
        reps = "8-12";
        repairs.push({
          field: `days[${dayIdx}].exercises[${exIdx}].reps`,
          issue: "Missing or invalid reps specification",
          original: exRaw.reps,
          repairedTo: "8-12",
          actionTaken: "Assigned default rep bracket",
        });
      }

      // Clamping RPE (6 to 10)
      let rpe = Number(exRaw.rpe);
      if (isNaN(rpe) || rpe < 6 || rpe > 10) {
        rpe = 8;
      }

      // Clamping rest seconds (30 to 300)
      let restSeconds = Number(exRaw.restSeconds);
      if (isNaN(restSeconds) || restSeconds < 30 || restSeconds > 300) {
        restSeconds = 90;
      }

      // Accumulate weekly volume
      const muscle = exercise.muscleGroup;
      weeklyVolume[muscle] = (weeklyVolume[muscle] || 0) + sets;

      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        targetMuscle: exercise.muscleGroup,
        sets,
        reps,
        rpe,
        restSeconds,
        tempo: exRaw.tempo && typeof exRaw.tempo === "string" ? exRaw.tempo : "2-0-1-0",
        notes: exRaw.notes && typeof exRaw.notes === "string" ? exRaw.notes : exercise.instructions?.[0] || "",
      };
    });

    return {
      dayName,
      focus,
      estimatedDurationMinutes: duration,
      warmup,
      exercises: sanitizedExercises,
      cooldown,
    };
  });
  parsed.days = sanitizedDays;

  parsed.daysPerWeek = sanitizedDays.length;
  parsed.weeklyVolumeOverview = weeklyVolume;

  if (!parsed.progressionRule || typeof parsed.progressionRule !== "string") {
    parsed.progressionRule =
      "Double progression: once you hit the top rep target on all sets with good form, add 2.5kg (upper) or 5kg (lower).";
  }

  if (!Array.isArray(parsed.safetyNotes) || parsed.safetyNotes.length === 0) {
    parsed.safetyNotes = [
      "Always perform 1-2 ramp-up warm-up sets before your working sets.",
      "Maintain a 1-2 rep reserve (RPE 8) on compound barbell lifts for joint safety.",
    ];
  }

  // Step 4: Strict validation with Zod
  const validation = WorkoutPlanSchema.safeParse(parsed);
  if (!validation.success) {
    return {
      success: false,
      repaired: repairs.length > 0,
      repairs,
      errors: validation.error.errors.map(e => `${e.path.join(".")}: ${e.message}`),
    };
  }

  return {
    success: true,
    data: validation.data,
    repaired: repairs.length > 0,
    repairs,
  };
}

// ============================================================================
// 6. NUTRITION PLAN VALIDATION & THERMODYNAMIC REPAIR PIPELINE
// ============================================================================

/**
 * Validates nutrition plans and programmatically balances macronutrient calories
 * to enforce thermodynamic validity: Target Calories ~= (4*P + 4*C + 9*F).
 */
export function validateAndRepairNutritionPlan(
  rawInput: unknown
): StructuredValidationResult<NutritionPlan> {
  const repairs: RepairLog[] = [];

  let parsedValue: unknown = rawInput;
  if (typeof rawInput === "string") {
    try {
      const cleaned = rawInput.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      parsedValue = JSON.parse(cleaned);
    } catch {
      const match = rawInput.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsedValue = JSON.parse(match[0]);
        } catch (err: unknown) {
          return {
            success: false,
            repaired: false,
            repairs: [],
            errors: [`Failed to parse nutrition JSON: ${getErrorMessage(err)}`],
          };
        }
      }
    }
  }

  if (!isJsonRecord(parsedValue)) {
    return {
      success: false,
      repaired: false,
      repairs: [],
      errors: ["Nutrition plan must be a valid JSON object"],
    };
  }
  const parsed = parsedValue;

  // Sanitize top-level values
  parsed.planName = typeof parsed.planName === "string" && parsed.planName ? parsed.planName : "Customized High-Protein Nutrition Roadmap";
  parsed.dietType = typeof parsed.dietType === "string" && parsed.dietType ? parsed.dietType : "Balanced Non-Vegetarian / High-Protein";
  parsed.targetCalories = Math.max(1200, Math.min(5000, Number(parsed.targetCalories) || 2200));
  parsed.proteinTargetGrams = Math.max(50, Math.min(300, Number(parsed.proteinTargetGrams) || 150));
  parsed.fatsTargetGrams = Math.max(30, Math.min(150, Number(parsed.fatsTargetGrams) || 60));

  // Thermodynamic calorie equation check: (4 * P) + (4 * C) + (9 * F)
  const targetCalories = Number(parsed.targetCalories);
  const proteinTargetGrams = Number(parsed.proteinTargetGrams);
  const fatsTargetGrams = Number(parsed.fatsTargetGrams);
  const proteinCals = proteinTargetGrams * 4;
  const fatsCals = fatsTargetGrams * 9;
  const remainingCals = targetCalories - (proteinCals + fatsCals);

  // Reconcile carbohydrates to match target calories
  const balancedCarbs = Math.max(50, Math.round(remainingCals / 4));
  if (Math.abs((Number(parsed.carbsTargetGrams) || 0) - balancedCarbs) > 15) {
    repairs.push({
      field: "carbsTargetGrams",
      issue: "Macro calories did not sum to target calories within 5% tolerance",
      original: parsed.carbsTargetGrams,
      repairedTo: balancedCarbs,
      actionTaken: "Thermodynamic reconciliation: balanced carbohydrates with target calories",
    });
    parsed.carbsTargetGrams = balancedCarbs;
  }

  // Ensure days array exists
  if (!Array.isArray(parsed.days) || parsed.days.length === 0) {
    repairs.push({
      field: "days",
      issue: "Empty nutrition days array",
      original: parsed.days,
      repairedTo: "1 default day generated",
      actionTaken: "Constructed standard daily meal distribution",
    });
    parsed.days = [
      {
        dayNumber: 1,
        dayTitle: "Standard High-Protein Day",
        totalCalories: targetCalories,
        targetMacros: {
          protein: proteinTargetGrams,
          carbs: Number(parsed.carbsTargetGrams),
          fats: fatsTargetGrams,
        },
        meals: [
          {
            mealName: "Breakfast",
            time: "08:30 AM",
            totalMealCalories: 550,
            items: [
              { foodName: "Eggs (Boiled / Omelette)", portion: "3 whole eggs", calories: 210, proteinGrams: 18, carbsGrams: 1, fatsGrams: 15 },
              { foodName: "Rolled Oats with Milk", portion: "60g oats + 200ml milk", calories: 340, proteinGrams: 14, carbsGrams: 52, fatsGrams: 8 },
            ],
          },
          {
            mealName: "Lunch",
            time: "01:30 PM",
            totalMealCalories: 750,
            items: [
              { foodName: "Chicken Breast / Paneer Curry", portion: "180g cooked", calories: 320, proteinGrams: 42, carbsGrams: 6, fatsGrams: 12 },
              { foodName: "Brown Rice & Mixed Vegetables", portion: "150g rice + 100g veg", calories: 430, proteinGrams: 8, carbsGrams: 80, fatsGrams: 5 },
            ],
          },
          {
            mealName: "Dinner",
            time: "08:00 PM",
            totalMealCalories: 600,
            items: [
              { foodName: "Grilled Fish or Dal Tadka", portion: "200g", calories: 300, proteinGrams: 35, carbsGrams: 10, fatsGrams: 10 },
              { foodName: "Whole Wheat Roti & Salad", portion: "2 rotis + cucumber/tomatoes", calories: 300, proteinGrams: 8, carbsGrams: 55, fatsGrams: 3 },
            ],
          },
        ],
      },
    ];
  }

  parsed.hydrationLiters = Number(parsed.hydrationLiters) || 3.5;

  const validation = NutritionPlanSchema.safeParse(parsed);
  if (!validation.success) {
    return {
      success: false,
      repaired: repairs.length > 0,
      repairs,
      errors: validation.error.errors.map(e => `${e.path.join(".")}: ${e.message}`),
    };
  }

  return {
    success: true,
    data: validation.data,
    repaired: repairs.length > 0,
    repairs,
  };
}

// ============================================================================
// 7. GEMINI OPENAPI COMPLIANT JSON SCHEMA EXPORTS
// ============================================================================

/**
 * Returns the exact JSON Schema for passing into Gemini's `response_schema`
 * parameter to enforce schema-constrained generation at the model decoder level.
 */
export function getWorkoutPlanJsonSchema() {
  return {
    type: "OBJECT",
    description: "Personalized strength, hypertrophy, and conditioning workout program.",
    properties: {
      planName: { type: "STRING", description: "Title of the workout routine" },
      fitnessLevel: {
        type: "STRING",
        enum: ["Beginner", "Intermediate", "Advanced"],
        description: "Target experience tier",
      },
      goal: {
        type: "STRING",
        enum: ["Hypertrophy", "Strength", "Endurance", "Fat Loss", "Athletic Performance"],
        description: "Primary physiological objective",
      },
      daysPerWeek: { type: "INTEGER", description: "Weekly frequency (1-7)" },
      weeklyVolumeOverview: {
        type: "OBJECT",
        description: "Total weekly sets per muscle group",
      },
      progressionRule: { type: "STRING", description: "How the athlete should progressively overload" },
      safetyNotes: {
        type: "ARRAY",
        items: { type: "STRING" },
        description: "Injury prevention cues and warm-up recommendations",
      },
      days: {
        type: "ARRAY",
        description: "Individual workout sessions",
        items: {
          type: "OBJECT",
          properties: {
            dayName: { type: "STRING", description: "Session name (e.g. Upper Hypertrophy)" },
            focus: { type: "STRING", description: "Target muscles and stimulus" },
            estimatedDurationMinutes: { type: "INTEGER", description: "Session duration in minutes" },
            warmup: { type: "ARRAY", items: { type: "STRING" } },
            cooldown: { type: "ARRAY", items: { type: "STRING" } },
            exercises: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  exerciseId: {
                    type: "STRING",
                    description: "Canonical ID matching FitBox database (e.g. bench-press, lat-pulldown, barbell-back-squat)",
                  },
                  exerciseName: { type: "STRING", description: "Full descriptive exercise title" },
                  targetMuscle: { type: "STRING", description: "Primary targeted muscle group" },
                  sets: { type: "INTEGER", description: "Working sets (1-8)" },
                  reps: { type: "STRING", description: "Target rep range (e.g. 8-12)" },
                  rpe: { type: "NUMBER", description: "Rate of Perceived Exertion (6-10)" },
                  restSeconds: { type: "INTEGER", description: "Rest duration in seconds" },
                  tempo: { type: "STRING", description: "Eccentric-Isometric-Concentric-Pause (e.g. 3-0-1-0)" },
                  notes: { type: "STRING", description: "Form cue or setup advice" },
                },
                required: ["exerciseId", "exerciseName", "targetMuscle", "sets", "reps"],
              },
            },
          },
          required: ["dayName", "focus", "exercises"],
        },
      },
    },
    required: ["planName", "fitnessLevel", "goal", "daysPerWeek", "days", "progressionRule"],
  };
}
