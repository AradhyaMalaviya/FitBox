/**
 * Reverse-Engineered MuscleWiki Calculation Engines & Algorithms
 * Implements:
 * 1. One Rep Max (1RM) multi-formula models (Epley, Brzycki, Lombardi, O'Conner, Wathan)
 * 2. 1RM Percentage Training Zones (Power, Strength, Hypertrophy, Endurance)
 * 3. Olympic Barbell Plate Loader Calculator
 * 4. BMR (Mifflin-St Jeor & Harris-Benedict) and TDEE Calculators
 * 5. Macronutrient Stack & Per-Meal Distribution Calculator
 * 6. MuscleWiki Workout Stacking Engine
 */

// ─── 1. ONE REP MAX (1RM) ENGINE ───

export interface OneRepMaxResult {
  weight: number;
  reps: number;
  unit: 'kg' | 'lbs';
  epley: number;
  brzycki: number;
  lander: number;
  lombardi: number;
  oconner: number;
  wathan: number;
  average: number;
  percentageTable: Array<{
    percentage: number;
    weight: number;
    reps: number;
    zone: 'Max Strength' | 'Strength' | 'Hypertrophy' | 'Endurance';
  }>;
}

export function calculateOneRepMax(
  weight: number,
  reps: number,
  unit: 'kg' | 'lbs' = 'kg'
): OneRepMaxResult {
  const safeWeight = Math.max(0, weight);
  const safeReps = Math.max(1, Math.min(30, reps));

  if (safeReps === 1) {
    const table = generatePercentageTable(safeWeight);
    return {
      weight: safeWeight,
      reps: 1,
      unit,
      epley: safeWeight,
      brzycki: safeWeight,
      lander: safeWeight,
      lombardi: safeWeight,
      oconner: safeWeight,
      wathan: safeWeight,
      average: safeWeight,
      percentageTable: table,
    };
  }

  // Epley: weight * (1 + reps / 30)
  const epley = Math.round(safeWeight * (1 + safeReps / 30));

  // Brzycki: weight * (36 / (37 - reps))
  const brzycki = Math.round(safeWeight * (36 / Math.max(1, 37 - safeReps)));

  // Lander: (100 * weight) / (101.3 - 2.67123 * reps)
  const lander = Math.round((100 * safeWeight) / Math.max(1, 101.3 - 2.67123 * safeReps));

  // Lombardi: weight * (reps ^ 0.10)
  const lombardi = Math.round(safeWeight * Math.pow(safeReps, 0.1));

  // O'Conner: weight * (1 + 0.025 * reps)
  const oconner = Math.round(safeWeight * (1 + 0.025 * safeReps));

  // Wathan: (100 * weight) / (48.8 + 53.8 * e^(-0.075 * reps))
  const wathan = Math.round((100 * safeWeight) / (48.8 + 53.8 * Math.exp(-0.075 * safeReps)));

  const average = Math.round((epley + brzycki + lander + lombardi + oconner + wathan) / 6);

  const percentageTable = generatePercentageTable(average);

  return {
    weight: safeWeight,
    reps: safeReps,
    unit,
    epley,
    brzycki,
    lander,
    lombardi,
    oconner,
    wathan,
    average,
    percentageTable,
  };
}

function generatePercentageTable(oneRepMax: number) {
  const brackets = [
    { percentage: 100, reps: 1, zone: 'Max Strength' as const },
    { percentage: 95, reps: 2, zone: 'Max Strength' as const },
    { percentage: 90, reps: 4, zone: 'Strength' as const },
    { percentage: 85, reps: 6, zone: 'Strength' as const },
    { percentage: 80, reps: 8, zone: 'Hypertrophy' as const },
    { percentage: 75, reps: 10, zone: 'Hypertrophy' as const },
    { percentage: 70, reps: 12, zone: 'Hypertrophy' as const },
    { percentage: 65, reps: 15, zone: 'Endurance' as const },
    { percentage: 60, reps: 20, zone: 'Endurance' as const },
    { percentage: 55, reps: 25, zone: 'Endurance' as const },
    { percentage: 50, reps: 30, zone: 'Endurance' as const },
  ];

  return brackets.map(b => ({
    ...b,
    weight: Math.round((oneRepMax * b.percentage) / 100),
  }));
}

// ─── 2. BARBELL PLATE CALCULATOR ───

export interface PlateLoadResult {
  targetWeight: number;
  barWeight: number;
  unit: 'kg' | 'lbs';
  weightPerSide: number;
  platesPerSide: Array<{ weight: number; count: number; color: string }>;
  unloadedDifference: number;
}

export function calculateBarbellPlates(
  totalWeight: number,
  unit: 'kg' | 'lbs' = 'kg',
  customBarWeight?: number
): PlateLoadResult {
  const barWeight = customBarWeight !== undefined ? customBarWeight : unit === 'kg' ? 20 : 45;
  const platesConfig =
    unit === 'kg'
      ? [
          { weight: 25, color: '#dc2626' }, // Red
          { weight: 20, color: '#2563eb' }, // Blue
          { weight: 15, color: '#ca8a04' }, // Yellow
          { weight: 10, color: '#16a34a' }, // Green
          { weight: 5, color: '#ffffff' }, // White
          { weight: 2.5, color: '#000000' }, // Black
          { weight: 1.25, color: '#94a3b8' }, // Silver
        ]
      : [
          { weight: 45, color: '#2563eb' }, // Blue
          { weight: 35, color: '#ca8a04' }, // Yellow
          { weight: 25, color: '#16a34a' }, // Green
          { weight: 10, color: '#000000' }, // Black
          { weight: 5, color: '#ffffff' }, // White
          { weight: 2.5, color: '#94a3b8' }, // Silver
        ];

  if (totalWeight <= barWeight) {
    return {
      targetWeight: totalWeight,
      barWeight,
      unit,
      weightPerSide: 0,
      platesPerSide: [],
      unloadedDifference: 0,
    };
  }

  let remainingPerSide = (totalWeight - barWeight) / 2;
  const platesPerSide: Array<{ weight: number; count: number; color: string }> = [];

  for (const plate of platesConfig) {
    if (remainingPerSide >= plate.weight) {
      const count = Math.floor(remainingPerSide / plate.weight);
      platesPerSide.push({
        weight: plate.weight,
        count,
        color: plate.color,
      });
      remainingPerSide -= count * plate.weight;
      remainingPerSide = Math.round(remainingPerSide * 100) / 100;
    }
  }

  return {
    targetWeight: totalWeight,
    barWeight,
    unit,
    weightPerSide: (totalWeight - barWeight) / 2,
    platesPerSide,
    unloadedDifference: Math.round(remainingPerSide * 2 * 10) / 10,
  };
}

// ─── 3. CALORIE & TDEE ENGINE ───

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { multiplier: number; label: string; description: string }> = {
  sedentary: { multiplier: 1.2, label: 'Sedentary', description: 'Little or no exercise, desk job' },
  light: { multiplier: 1.375, label: 'Light Activity', description: 'Light exercise 1-3 days/week' },
  moderate: { multiplier: 1.55, label: 'Moderate Activity', description: 'Moderate exercise 3-5 days/week' },
  active: { multiplier: 1.725, label: 'Very Active', description: 'Heavy exercise 6-7 days/week' },
  very_active: { multiplier: 1.9, label: 'Extremely Active', description: 'Athletic training / physical labor job' },
};

export interface TdeeResult {
  bmrMifflin: number;
  bmrHarris: number;
  bmrAverage: number;
  tdee: number;
  deficitAggressive: number; // -750
  deficitStandard: number; // -500
  deficitMild: number; // -250
  maintenance: number;
  surplusLean: number; // +250
  surplusBulk: number; // +500
}

export function calculateTDEE(params: {
  gender: 'male' | 'female';
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
}): TdeeResult {
  const { gender, age, weightKg, heightCm, activityLevel } = params;

  // Mifflin-St Jeor
  // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  const bmrMifflin =
    gender === 'male'
      ? Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5)
      : Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);

  // Revised Harris-Benedict
  // Men: 88.362 + (13.397 × weight in kg) + (4.799 × height in cm) - (5.677 × age in years)
  // Women: 447.593 + (9.247 × weight in kg) + (3.098 × height in cm) - (4.330 × age in years)
  const bmrHarris =
    gender === 'male'
      ? Math.round(88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age)
      : Math.round(447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age);

  const bmrAverage = Math.round((bmrMifflin + bmrHarris) / 2);
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel].multiplier;
  const tdee = Math.round(bmrAverage * activityMultiplier);

  return {
    bmrMifflin,
    bmrHarris,
    bmrAverage,
    tdee,
    deficitAggressive: Math.max(1200, tdee - 750),
    deficitStandard: Math.max(1200, tdee - 500),
    deficitMild: Math.max(1200, tdee - 250),
    maintenance: tdee,
    surplusLean: tdee + 250,
    surplusBulk: tdee + 500,
  };
}

// ─── 4. MACRONUTRIENT & MEAL SPLIT ENGINE ───

export type MacroGoal = 'cut' | 'maintain' | 'bulk';

export interface MacroResult {
  targetCalories: number;
  proteinGrams: number;
  proteinCalories: number;
  fatGrams: number;
  fatCalories: number;
  carbGrams: number;
  carbCalories: number;
  mealSplits: Record<number, {
    mealsCount: number;
    proteinPerMeal: number;
    fatPerMeal: number;
    carbPerMeal: number;
    caloriesPerMeal: number;
  }>;
}

export function calculateMacros(params: {
  targetCalories: number;
  weightKg: number;
  goal: MacroGoal;
  proteinRatioOverride?: number; // g per kg bodyweight
}): MacroResult {
  const { targetCalories, weightKg, goal, proteinRatioOverride } = params;

  // Protein ratio based on science & MuscleWiki defaults:
  // Cutting: 2.2 g/kg to preserve lean mass
  // Maintenance: 1.8 g/kg
  // Bulking: 2.0 g/kg
  let proteinRatio = proteinRatioOverride;
  if (!proteinRatio) {
    if (goal === 'cut') proteinRatio = 2.2;
    else if (goal === 'bulk') proteinRatio = 2.0;
    else proteinRatio = 1.8;
  }

  const proteinGrams = Math.round(weightKg * proteinRatio);
  const proteinCalories = proteinGrams * 4;

  // Fats: 25% of calories
  const fatCalories = Math.round(targetCalories * 0.25);
  const fatGrams = Math.round(fatCalories / 9);

  // Remaining calories go to carbs (minimum 30g)
  const remainingCalories = Math.max(120, targetCalories - (proteinCalories + fatCalories));
  const carbCalories = remainingCalories;
  const carbGrams = Math.round(carbCalories / 4);

  // Generate meal splits for 3, 4, 5, and 6 meals per day
  const mealSplits: MacroResult['mealSplits'] = {};
  for (const count of [3, 4, 5, 6]) {
    mealSplits[count] = {
      mealsCount: count,
      proteinPerMeal: Math.round(proteinGrams / count),
      fatPerMeal: Math.round(fatGrams / count),
      carbPerMeal: Math.round(carbGrams / count),
      caloriesPerMeal: Math.round(targetCalories / count),
    };
  }

  return {
    targetCalories,
    proteinGrams,
    proteinCalories,
    fatGrams,
    fatCalories,
    carbGrams,
    carbCalories,
    mealSplits,
  };
}

// ─── 5. BODY FAT PERCENTAGE ENGINE (US NAVY METHOD) ───

export interface BodyFatResult {
  bodyFatPercentage: number;
  fatMassKg: number;
  leanMassKg: number;
  category: 'Essential Fat' | 'Athletes' | 'Fitness' | 'Average' | 'Obese';
  description: string;
}

export function calculateBodyFat(params: {
  gender: 'male' | 'female';
  weightKg: number;
  heightCm: number;
  waistCm: number;
  neckCm: number;
  hipCm?: number;
}): BodyFatResult {
  const { gender, weightKg, heightCm, waistCm, neckCm, hipCm = 95 } = params;

  let bodyFat = 15;

  if (gender === 'male') {
    const diff = Math.max(1, waistCm - neckCm);
    const denom = 1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(heightCm);
    bodyFat = Math.max(2, Math.min(60, 495 / denom - 450));
  } else {
    const diff = Math.max(1, waistCm + hipCm - neckCm);
    const denom = 1.29579 - 0.35004 * Math.log10(diff) + 0.221 * Math.log10(heightCm);
    bodyFat = Math.max(8, Math.min(65, 495 / denom - 450));
  }

  const roundedBf = Math.round(bodyFat * 10) / 10;
  const fatMassKg = Math.round(weightKg * (roundedBf / 100) * 10) / 10;
  const leanMassKg = Math.round((weightKg - fatMassKg) * 10) / 10;

  let category: BodyFatResult['category'] = 'Fitness';
  let description = '';

  if (gender === 'male') {
    if (roundedBf < 6) {
      category = 'Essential Fat';
      description = 'Minimal survival body fat level (stage bodybuilder range).';
    } else if (roundedBf <= 13.9) {
      category = 'Athletes';
      description = 'Athletic definition with visible abdominals and vascularity.';
    } else if (roundedBf <= 17.9) {
      category = 'Fitness';
      description = 'Lean, healthy physique with good muscle tone.';
    } else if (roundedBf <= 24.9) {
      category = 'Average';
      description = 'Healthy average range for active individuals.';
    } else {
      category = 'Obese';
      description = 'Elevated adiposity; calorie deficit recommended.';
    }
  } else {
    if (roundedBf < 14) {
      category = 'Essential Fat';
      description = 'Essential biological threshold for females.';
    } else if (roundedBf <= 20.9) {
      category = 'Athletes';
      description = 'Athletic physique with clear muscle separation.';
    } else if (roundedBf <= 24.9) {
      category = 'Fitness';
      description = 'Fit, healthy composition with defined muscle lines.';
    } else if (roundedBf <= 31.9) {
      category = 'Average';
      description = 'Standard healthy range for adult females.';
    } else {
      category = 'Obese';
      description = 'Elevated adiposity; fat loss protocol advised.';
    }
  }

  return {
    bodyFatPercentage: roundedBf,
    fatMassKg,
    leanMassKg,
    category,
    description,
  };
}

// ─── 6. WORKOUT CALORIE BURN (METs) ENGINE ───

export interface CalorieBurnResult {
  caloriesBurned: number;
  intensityLabel: string;
}

export function calculateWorkoutBurn(params: {
  weightKg: number;
  durationMinutes: number;
  intensity: 'light' | 'moderate' | 'vigorous' | 'hiit';
}): CalorieBurnResult {
  const { weightKg, durationMinutes, intensity } = params;

  let met = 3.5;
  let label = 'Light Weight Training';

  switch (intensity) {
    case 'light':
      met = 3.5;
      label = 'Light Resistance / Machine circuit';
      break;
    case 'moderate':
      met = 5.5;
      label = 'Moderate Weightlifting / Bodybuilding';
      break;
    case 'vigorous':
      met = 7.5;
      label = 'Heavy Compound Lifting / Powerlifting';
      break;
    case 'hiit':
      met = 10.0;
      label = 'High-Intensity Interval Training (HIIT) / Cross-Training';
      break;
  }

  // Formula: (MET * 3.5 * weightKg / 200) * durationMinutes
  const caloriesBurned = Math.round(((met * 3.5 * weightKg) / 200) * durationMinutes);

  return {
    caloriesBurned,
    intensityLabel: label,
  };
}

