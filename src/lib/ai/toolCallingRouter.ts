import { FITNESS_AGENT_TOOLS, executeFitnessTool, type ToolCallExecution } from "./fitnessAgentTools";

export interface AgenticQueryResponse {
  hasToolCall: boolean;
  toolExecution?: ToolCallExecution;
  explanation: string;
}

/**
 * Parses user text for explicit fitness agent actions and executes the appropriate tool.
 */
export const routeAgenticQuery = (
  input: string,
  callbacks?: {
    onAddToWorkout?: (exerciseName: string, exerciseId: string | undefined, prescription: { sets: number; reps: number; targetWeightKg: number }) => void;
  }
): AgenticQueryResponse | null => {
  const q = input.toLowerCase().trim();

  // 1. Intent: Add to Workout
  // e.g., "Add 3 sets of bench press to my active session", "add squats to workout"
  if (q.includes("add") && (q.includes("workout") || q.includes("session") || q.includes("set") || q.includes("sets"))) {
    // Extract sets count if specified
    const setsMatch = q.match(/(\d+)\s*sets?/);
    const sets = setsMatch ? parseInt(setsMatch[1], 10) : 3;

    // Extract reps if specified
    const repsMatch = q.match(/(\d+)\s*reps?/);
    const reps = repsMatch ? parseInt(repsMatch[1], 10) : 10;

    // Extract weight if specified
    const weightMatch = q.match(/(\d+)\s*(kg|kgs|kilos|lbs)/);
    const targetWeightKg = weightMatch ? parseInt(weightMatch[1], 10) : 40;

    // Extract exercise name by removing command keywords
    let exerciseName = q
      .replace(/add\s+/g, "")
      .replace(/\d+\s*sets?\s*(of)?/g, "")
      .replace(/\d+\s*reps?\s*(of)?/g, "")
      .replace(/\d+\s*(kg|kgs|kilos|lbs)\s*(of)?/g, "")
      .replace(/(to|into|in)\s+(my\s+)?(active\s+)?(workout|session)/g, "")
      .replace(/(and|please|can\s+you|tell\s+me|my|warm-up|warmup).*/g, "")
      .trim();

    if (!exerciseName) {
      exerciseName = "Push-ups";
    }

    const toolExecution = executeFitnessTool("add_to_workout", {
      exerciseNameOrId: exerciseName,
      sets,
      reps,
      targetWeightKg,
      notes: "Progressively overload working sets with controlled cadence (2s eccentric).",
    }, callbacks);

    return {
      hasToolCall: true,
      toolExecution,
      explanation: `I've invoked the autonomous **add_to_workout** tool to update your live workout session with ${toolExecution.result.exercise.name}. Check the execution details below:`,
    };
  }

  // 2. Intent: Calculate Macros
  // e.g., "Calculate macros for 75kg cutting", "macro plan for 80kg bulking"
  if ((q.includes("macro") || q.includes("calories") || q.includes("protein")) && (q.includes("cut") || q.includes("bulk") || q.includes("maintain") || q.includes("kg"))) {
    const weightMatch = q.match(/(\d+)\s*(kg|kgs|kilos)/);
    const weightKg = weightMatch ? parseInt(weightMatch[1], 10) : 70;

    let goal: "cutting" | "maintenance" | "bulking" = "cutting";
    if (q.includes("bulk")) goal = "bulking";
    else if (q.includes("maintain") || q.includes("maintenance")) goal = "maintenance";

    const isVeg = q.includes("veg") || q.includes("vegetarian");

    const toolExecution = executeFitnessTool("calculate_macros", {
      weightKg,
      goal,
      dietaryPreference: isVeg ? "vegetarian" : "non-vegetarian",
    });

    return {
      hasToolCall: true,
      toolExecution,
      explanation: `I've calculated your clinical macronutrient targets using the **calculate_macros** tool for a **${weightKg}kg ${goal}** protocol:`,
    };
  }

  // 3. Intent: 1RM Calculation
  // e.g., "What is my 1rm for 80kg 6 reps", "calculate 1rm 100 5"
  if (q.includes("1rm") || q.includes("one rep max") || q.includes("max lift")) {
    const numbers = q.match(/\b\d+(\.\d+)?\b/g);
    const weight = numbers && numbers.length > 0 ? parseFloat(numbers[0]) : 70;
    const reps = numbers && numbers.length > 1 ? parseInt(numbers[1], 10) : 5;
    const unit = q.includes("lb") ? "lbs" : "kg";

    const toolExecution = executeFitnessTool("calculate_1rm", { weight, reps, unit });

    return {
      hasToolCall: true,
      toolExecution,
      explanation: `Calculated your 1-Rep Max consensus using the **calculate_1rm** tool (evaluating Brzycki, Epley, Lander, Lombardi, and O'Conner formulas):`,
    };
  }

  // 4. Intent: Food Nutrition
  // e.g., "protein in soya chunks", "nutrition for paneer", "calories in chicken breast"
  if (q.includes("protein in") || q.includes("nutrition for") || q.includes("calories in") || q.includes("soya") || q.includes("paneer") || q.includes("sattu")) {
    const foodQuery = q
      .replace(/(how\s+much\s+)?protein\s+in/g, "")
      .replace(/nutrition\s+(for|in)/g, "")
      .replace(/calories\s+(for|in)/g, "")
      .replace(/(what\s+is\s+the\s+)?(nutritional\s+value\s+of)/g, "")
      .trim();

    const toolExecution = executeFitnessTool("get_food_nutrition", {
      foodQuery: foodQuery || "soya chunks",
      isVegetarian: q.includes("veg"),
    });

    return {
      hasToolCall: true,
      toolExecution,
      explanation: `Retrieved verified nutritional data from the **FitBox Indian Nutrition Database** using **get_food_nutrition**:`,
    };
  }

  // 5. Intent: Specific Exercise Search
  // e.g., "Find chest exercises with dumbbells", "intermediate back exercises"
  if (q.includes("exercise") || q.includes("find") || q.includes("search")) {
    const muscles = ["Chest", "Back", "Legs", "Arms", "Shoulders", "Core"];
    const matchedMuscle = muscles.find((m) => q.includes(m.toLowerCase()));

    const equipments = ["Dumbbells", "Barbell", "Bodyweight", "Cables", "Machine", "Bench"];
    const matchedEquip = equipments.find((eq) => q.includes(eq.toLowerCase()));

    if (matchedMuscle || matchedEquip) {
      const toolExecution = executeFitnessTool("search_exercises", {
        muscle: matchedMuscle,
        equipment: matchedEquip,
      });

      return {
        hasToolCall: true,
        toolExecution,
        explanation: `Executed **search_exercises** over the FitBox anatomical catalog:`,
      };
    }
  }

  return null;
};
