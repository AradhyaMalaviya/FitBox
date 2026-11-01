import { exercises, type Exercise } from "@/data/exercises";
import { allFoods, type IndianFoodItem } from "@/data/indianFoodDatabase";
import { calculateOneRepMax, type OneRepMaxConsensus } from "@/lib/muscleWikiCalculators";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      items?: { type: string };
    }>;
    required: string[];
  };
}

/**
 * Canonical Gemini / OpenAI Tools API schemas for autonomous fitness coaching.
 */
export const FITNESS_AGENT_TOOLS: ToolDefinition[] = [
  {
    name: "search_exercises",
    description: "Search and filter exercises from the verified FitBox exercise catalog by muscle group, equipment, or difficulty.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Keywords to search in exercise name or instructions (e.g., 'dumbbell', 'incline', 'pec').",
        },
        muscle: {
          type: "string",
          description: "Target muscle group to filter by.",
          enum: ["Chest", "Back", "Legs", "Arms", "Shoulders", "Core"],
        },
        equipment: {
          type: "string",
          description: "Equipment type filter (e.g., 'Dumbbells', 'Barbell', 'Bodyweight', 'Cables', 'Machine').",
        },
        difficulty: {
          type: "string",
          description: "Difficulty tier.",
          enum: ["Beginner", "Intermediate", "Advanced"],
        },
      },
      required: [],
    },
  },
  {
    name: "calculate_macros",
    description: "Calculate evidence-based macronutrient targets (protein, carbs, fat, total calories) based on user body weight and fitness goal.",
    parameters: {
      type: "object",
      properties: {
        weightKg: {
          type: "number",
          description: "User bodyweight in kilograms (e.g., 75).",
        },
        goal: {
          type: "string",
          description: "Primary fitness objective.",
          enum: ["cutting", "maintenance", "bulking"],
        },
        dietaryPreference: {
          type: "string",
          description: "Dietary style for protein sourcing.",
          enum: ["vegetarian", "vegan", "non-vegetarian"],
        },
      },
      required: ["weightKg", "goal"],
    },
  },
  {
    name: "add_to_workout",
    description: "Autonomously add an exercise to the user's active workout tracking session with prescribed sets, reps, and target weight.",
    parameters: {
      type: "object",
      properties: {
        exerciseNameOrId: {
          type: "string",
          description: "The name or ID of the exercise in the FitBox catalog (e.g., 'Bench Press', 'Barbell Back Squat').",
        },
        sets: {
          type: "number",
          description: "Number of working sets to add (default: 3, max: 8).",
        },
        reps: {
          type: "number",
          description: "Target repetitions per set (default: 10).",
        },
        targetWeightKg: {
          type: "number",
          description: "Suggested starting weight in kilograms (e.g., 60).",
        },
        notes: {
          type: "string",
          description: "Form cues or coaching prescription for this exercise.",
        },
      },
      required: ["exerciseNameOrId"],
    },
  },
  {
    name: "calculate_1rm",
    description: "Compute 1-Rep Max (1RM) using 5-formula consensus (Brzycki, Epley, Lander, Lombardi, O'Conner) with percentage loads table.",
    parameters: {
      type: "object",
      properties: {
        weight: {
          type: "number",
          description: "Lifted weight.",
        },
        reps: {
          type: "number",
          description: "Reps completed (between 1 and 12).",
        },
        unit: {
          type: "string",
          description: "Weight unit.",
          enum: ["kg", "lbs"],
        },
      },
      required: ["weight", "reps"],
    },
  },
  {
    name: "get_food_nutrition",
    description: "Lookup verified nutritional facts (calories, protein, carbs, fats) for Indian and bodybuilding foods with high-protein alternatives.",
    parameters: {
      type: "object",
      properties: {
        foodQuery: {
          type: "string",
          description: "Name of the food item (e.g., 'soya chunks', 'paneer', 'dahi', 'chicken breast').",
        },
        isVegetarian: {
          type: "boolean",
          description: "Filter for vegetarian/vegan options only.",
        },
      },
      required: ["foodQuery"],
    },
  },
];

export interface ToolCallExecution {
  id: string;
  toolName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;
  summary: string;
}

export interface MacroResult {
  weightKg: number;
  goal: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  recommendations: string[];
}

export interface AddToWorkoutResult {
  success: boolean;
  exercise?: Exercise;
  failureReason?: string;
  prescribedSets: number;
  prescribedReps: number;
  targetWeightKg: number;
  notes?: string;
  warmupGuidance: string[];
}

/**
 * Autonomous Tool Execution Engine.
 * Evaluates function calls deterministically against verified FitBox datasets.
 */
export const executeFitnessTool = (
  toolName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: Record<string, any>,
  callbacks?: {
    onAddToWorkout?: (exerciseName: string, exerciseId: string | undefined, prescription: { sets: number; reps: number; targetWeightKg: number }) => void;
  }
): ToolCallExecution => {
  const executionId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  switch (toolName) {
    case "search_exercises": {
      const { query = "", muscle, equipment, difficulty } = args;
      const q = query.toLowerCase().trim();

      const matched = exercises.filter((ex) => {
        if (muscle && ex.muscleGroup.toLowerCase() !== muscle.toLowerCase()) return false;
        if (difficulty && ex.difficulty.toLowerCase() !== difficulty.toLowerCase()) return false;
        if (equipment && !ex.equipment.toLowerCase().includes(equipment.toLowerCase())) return false;
        if (q && !ex.name.toLowerCase().includes(q) && !(ex.description || "").toLowerCase().includes(q)) return false;
        return true;
      }).slice(0, 5);

      return {
        id: executionId,
        toolName,
        args,
        result: matched,
        summary: `Found ${matched.length} exercise${matched.length === 1 ? "" : "s"} matching criteria.`,
      };
    }

    case "calculate_macros": {
      const { weightKg, goal, dietaryPreference = "vegetarian" } = args;
      const numWeight = Number(weightKg) || 70;

      // Base BMR estimate: ~22 kcal/kg base + 1.45 activity mult = ~32 kcal/kg maintenance
      const maintenanceCalories = Math.round(numWeight * 32);
      let targetCalories = maintenanceCalories;
      let proteinPerKg = 2.0;

      if (goal === "cutting") {
        targetCalories = Math.round(maintenanceCalories * 0.80); // 20% deficit
        proteinPerKg = 2.2; // Higher protein in deficit
      } else if (goal === "bulking") {
        targetCalories = Math.round(maintenanceCalories * 1.15); // 15% surplus
        proteinPerKg = 1.9;
      }

      const proteinGrams = Math.round(numWeight * proteinPerKg);
      const proteinKcal = proteinGrams * 4;

      // 25% of calories from healthy fats
      const fatKcal = Math.round(targetCalories * 0.25);
      const fatGrams = Math.round(fatKcal / 9);

      // Remainder from carbohydrates
      const carbsKcal = Math.max(0, targetCalories - (proteinKcal + fatKcal));
      const carbsGrams = Math.round(carbsKcal / 4);

      const recommendations: string[] = [
        dietaryPreference === "vegetarian"
          ? "Prioritize Soya chunks (52g/100g), Low-fat Paneer, Sattu, and Dahi to hit protein targets."
          : "Incorporate lean chicken breast, eggs, and Greek yogurt alongside balanced whole foods.",
        "Drink 3-4 liters of water to support protein metabolism and kidney filtration.",
        "Space protein intake across 4 meals (approx 35-45g protein per feeding window).",
      ];

      const result: MacroResult = {
        weightKg: numWeight,
        goal,
        calories: targetCalories,
        proteinGrams,
        carbsGrams,
        fatGrams,
        recommendations,
      };

      return {
        id: executionId,
        toolName,
        args,
        result,
        summary: `Calculated ${targetCalories} kcal with ${proteinGrams}g Protein for ${numWeight}kg ${goal}.`,
      };
    }

    case "add_to_workout": {
      const { exerciseNameOrId, sets = 3, reps = 10, targetWeightKg = 40, notes } = args;
      const searchKey = String(exerciseNameOrId).toLowerCase().trim();

      // Find exact or closest exercise
      const cleanKey = searchKey.replace(/[-_]/g, " ");
      let matched = exercises.find((e) => e.id === exerciseNameOrId);
      if (!matched) {
        matched = exercises.find((e) => e.name.toLowerCase() === searchKey || e.name.toLowerCase() === cleanKey);
      }
      if (!matched) {
        matched = exercises.find((e) => e.name.toLowerCase().includes(cleanKey) || cleanKey.includes(e.name.toLowerCase()));
      }
      const numSets = Math.min(Math.max(Number(sets) || 3, 1), 8);
      const numReps = Math.min(Math.max(Number(reps) || 10, 1), 30);
      const numWeight = Math.max(Number(targetWeightKg) || 0, 0);

      if (!matched) {
        const result: AddToWorkoutResult = {
          success: false,
          failureReason: `I couldn't find “${String(exerciseNameOrId)}” in the exercise catalog. No exercise was added.`,
          prescribedSets: numSets,
          prescribedReps: numReps,
          targetWeightKg: numWeight,
          warmupGuidance: [],
        };
        return {
          id: executionId,
          toolName,
          args,
          result,
          summary: result.failureReason || "The exercise was not found. No changes were made to the workout.",
        };
      }

      // Trigger client-side state mutation if handler provided
      if (callbacks?.onAddToWorkout) {
        callbacks.onAddToWorkout(matched.name, matched.id, {
          sets: numSets,
          reps: numReps,
          targetWeightKg: numWeight,
        });
      }

      const warmupGuidance = [
        `Set 1: 50% target (${Math.round(numWeight * 0.5)} kg) x 10 reps (warm-up)`,
        `Set 2: 75% target (${Math.round(numWeight * 0.75)} kg) x 5 reps (acclimation)`,
        `Working Sets: ${numSets} sets x ${numReps} reps at ${numWeight > 0 ? `${numWeight} kg` : "bodyweight"}`,
      ];

      const result: AddToWorkoutResult = {
        success: true,
        exercise: matched,
        prescribedSets: numSets,
        prescribedReps: numReps,
        targetWeightKg: numWeight,
        notes,
        warmupGuidance,
      };

      return {
        id: executionId,
        toolName,
        args,
        result,
        summary: `Added ${matched.name} (${numSets} sets x ${numReps} reps) to active workout session.`,
      };
    }

    case "calculate_1rm": {
      const weight = Number(args.weight) || 60;
      const reps = Math.min(Math.max(Number(args.reps) || 5, 1), 12);
      const unit = (args.unit === "lbs" ? "lbs" : "kg") as "kg" | "lbs";

      const consensus: OneRepMaxConsensus = calculateOneRepMax(weight, reps, unit);

      return {
        id: executionId,
        toolName,
        args,
        result: consensus,
        summary: `Estimated 1RM is ${consensus.average} ${unit} based on 5-formula consensus.`,
      };
    }

    case "get_food_nutrition": {
      const query = String(args.foodQuery || "").toLowerCase().trim();
      const isVeg = Boolean(args.isVegetarian);

      const matchedFoods = allFoods.filter((f: IndianFoodItem) => {
        if (isVeg && f.dietType !== "veg" && f.dietType !== "vegan") return false;
        return f.name.toLowerCase().includes(query) || (f.tags || []).some((t) => t.toLowerCase().includes(query));
      }).slice(0, 4);

      return {
        id: executionId,
        toolName,
        args,
        result: matchedFoods,
        summary: `Found ${matchedFoods.length} nutritional reference item${matchedFoods.length === 1 ? "" : "s"}.`,
      };
    }

    default:
      return {
        id: executionId,
        toolName,
        args,
        result: null,
        summary: `Tool ${toolName} executed.`,
      };
  }
};

// Canonical alias for tool execution
export const executeAgentTool = executeFitnessTool;
