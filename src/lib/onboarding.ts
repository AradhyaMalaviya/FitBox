import { z } from "zod";

// ---- Types that match the JSON model ----

export type InspirationPresetName = "Goku" | "Thor" | "Captain America" | "Toji";

export interface TimeRange {
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

export interface UserPreferencePayload {
  userId: string;
  inspiration: {
    images: string[]; // URLs or base64 strings
    preset: InspirationPresetName | null;
    tags: string[];
    notes: string;
  };
  diet: {
    type: "omnivore" | "vegetarian" | "vegan" | "eggetarian" | "pescatarian";
    calorieTarget: number | null;
  };
  meals: {
    routine: "3" | "4-5" | "intermittent-fasting";
    eatingWindow: TimeRange | null;
    allergies: string[];
    avoidAllergens: boolean;
  };
  workout: {
    preferredTime: "morning" | "afternoon" | "evening" | "flexible";
    timeRange: TimeRange | null;
  };
  createdAt: string;
}

// ---- Zod validation schemas ----

export const timeRangeSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});

export const inspirationStepSchema = z.object({
  images: z.array(z.string()).min(1, "Please provide at least one inspiration image"),
  preset: z.enum(["Goku", "Thor", "Captain America", "Toji"]).nullable(),
  notes: z
    .string()
    .max(120, "Please keep this under 120 characters")
    .optional()
    .transform((val) => (val ?? "").trim()),
  tags: z.array(z.string()).default([]),
});

export const dietStepSchema = z.object({
  type: z.enum(["omnivore", "vegetarian", "vegan", "eggetarian", "pescatarian"]),
  calorieTarget: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "") return null;
      const num = typeof val === "number" ? val : Number(val);
      return Number.isFinite(num) && num > 0 ? num : null;
    }),
});

export const mealsStepSchema = z.object({
  routine: z.enum(["3", "4-5", "intermittent-fasting"]),
  eatingWindow: timeRangeSchema.nullable(),
  allergiesRaw: z
    .string()
    .max(256, "Allergies text is too long")
    .optional()
    .transform((val) => (val ?? "").trim()),
  allergies: z.array(z.string()).default([]),
  avoidAllergens: z.boolean().default(true),
});

export const workoutStepSchema = z.object({
  preferredTime: z.enum(["morning", "afternoon", "evening", "flexible"]),
  timeRange: timeRangeSchema.nullable(),
});

export const onboardingSchema = z.object({
  userId: z.string(),
  inspiration: inspirationStepSchema,
  diet: dietStepSchema,
  meals: mealsStepSchema,
  workout: workoutStepSchema,
  createdAt: z.string(),
});

export type InspirationStepData = z.infer<typeof inspirationStepSchema>;
export type DietStepData = z.infer<typeof dietStepSchema>;
export type MealsStepData = z.infer<typeof mealsStepSchema>;
export type WorkoutStepData = z.infer<typeof workoutStepSchema>;

// ---- Presets and tags ----

export interface InspirationPreset {
  name: InspirationPresetName;
  imageUrl: string;
  tags: string[];
  description: string;
}

export const INSPIRATION_PRESETS: InspirationPreset[] = [
  {
    name: "Goku",
    imageUrl: "/images/presets/goku.jpg",
    tags: ["lean", "explosive", "athletic", "high-energy"],
    description: "Lean, explosive, anime-style athletic build.",
  },
  {
    name: "Thor",
    imageUrl: "/images/presets/thor.jpg",
    tags: ["bulky", "powerful", "broad-shoulders", "strength"],
    description: "Thick, powerful frame with strong upper body.",
  },
  {
    name: "Captain America",
    imageUrl: "/images/presets/captain-america.jpg",
    tags: ["athletic", "balanced", "heroic", "functional"],
    description: "Balanced, athletic superhero look.",
  },
  {
    name: "Toji",
    imageUrl: "/images/presets/toji.jpg",
    tags: ["lean", "shredded", "sharp", "dense-muscle"],
    description: "Leaner, dense muscle with sharp lines and maximum definition.",
  },
];

export const COMMON_ALLERGENS = [
  "pea",
  "soy",
  "nuts",
  "dairy",
  "gluten",
  "eggs",
  "fish",
  "shellfish",
];

// ---- Inspiration score generator (deterministic) ----

export type InspirationScore =
  | "strength-hybrid"
  | "cutting"
  | "bulk"
  | "athletic-performance";

export function deriveInspirationScore(tags: string[]): InspirationScore {
  const lower = tags.map((t) => t.toLowerCase());

  const has = (keyword: string) => lower.some((t) => t.includes(keyword));

  if (has("cut") || has("shredded") || has("sharp") || has("definition")) {
    return "cutting";
  }
  if (has("bulky") || has("powerful") || has("strength")) {
    return "bulk";
  }
  if (has("lean") && (has("explosive") || has("agile") || has("high-energy"))) {
    return "athletic-performance";
  }
  // default hybrid if mixed or unknown
  return "strength-hybrid";
}

// Normalize allergy string into array
export function parseAllergies(allergiesRaw: string | undefined | null): string[] {
  if (!allergiesRaw) return [];
  return allergiesRaw
    .split(",")
    .map((a) => a.trim())
    .filter((a) => a.length > 0)
    .slice(0, 32);
}

