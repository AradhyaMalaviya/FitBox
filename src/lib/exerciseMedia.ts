export const EXERCISE_MEDIA_BUCKET = "exercise-media";

/**
 * Builds the canonical public URL for exercise media (videos and posters).
 * In modern client-side Vite builds, local static media is served directly
 * from the public assets directory (e.g. /videos/pushups-video.mp4).
 */
export const buildExerciseMediaUrl = (directory: "videos" | "posters", filename: string): string => {
  if (!filename) return "";
  if (filename.startsWith("http://") || filename.startsWith("https://") || filename.startsWith("data:")) {
    return filename;
  }
  if (filename.startsWith("/")) {
    return filename;
  }
  // Strip any redundant leading directory prefix
  const cleanFilename = filename.replace(/^\/+/, "").replace(/^(videos|posters)\//, "");
  return `/${directory}/${cleanFilename}`;
};

export interface BiomechanicalProfile {
  movementPattern: "push" | "pull" | "squat" | "hinge" | "curl" | "press" | "raise" | "extension" | "core" | "isometric";
  primaryMuscles: string[];
  secondaryMuscles: string[];
  cadence: {
    eccentricSeconds: number;
    pauseSeconds: number;
    concentricSeconds: number;
  };
  formCues: string[];
}

export const getBiomechanicalProfile = (name: string, muscleGroup: string): BiomechanicalProfile => {
  const n = name.toLowerCase();

  if (n.includes("plank")) {
    return {
      movementPattern: "isometric",
      primaryMuscles: ["Rectus Abdominis", "Transverse Abdominis"],
      secondaryMuscles: ["Gluteus", "Anterior Deltoids", "Quadriceps"],
      cadence: { eccentricSeconds: 0, pauseSeconds: 30, concentricSeconds: 0 },
      formCues: ["Maintain a rigid straight line from heels to crown", "Engage glutes to stabilize lumbar pelvis", "Breathe steadily into the lower ribcage"]
    };
  }

  if (n.includes("push-up") || n.includes("press-up")) {
    return {
      movementPattern: "push",
      primaryMuscles: ["Pectoralis Major", "Triceps Brachii"],
      secondaryMuscles: ["Anterior Deltoid", "Core Stabilizers"],
      cadence: { eccentricSeconds: 2, pauseSeconds: 1, concentricSeconds: 1 },
      formCues: ["Keep elbows at a 45-degree arrow trajectory", "Brace core to prevent lumbar sagging", "Press through the entire palm into full extension"]
    };
  }

  if (n.includes("bench press") || n.includes("fly") || n.includes("crossover") || n.includes("pec")) {
    return {
      movementPattern: "push",
      primaryMuscles: ["Pectoralis Major", "Anterior Deltoid"],
      secondaryMuscles: ["Triceps Brachii", "Serratus Anterior"],
      cadence: { eccentricSeconds: 3, pauseSeconds: 1, concentricSeconds: 1 },
      formCues: ["Retract and depress scapulae firmly against the bench", "Maintain stable foot drive throughout the repetition", "Touch lower sternum and press in a slight J-curve"]
    };
  }

  if (n.includes("squat") || n.includes("leg press") || n.includes("lunge") || n.includes("split squat")) {
    return {
      movementPattern: "squat",
      primaryMuscles: ["Quadriceps Femoris", "Gluteus Maximus"],
      secondaryMuscles: ["Adductors", "Hamstrings", "Erector Spinae"],
      cadence: { eccentricSeconds: 3, pauseSeconds: 1, concentricSeconds: 1 },
      formCues: ["Open hips and track knees in line with second toes", "Maintain neutral spine with chest proud and braced", "Drive forcefully through the midfoot on the ascent"]
    };
  }

  if (n.includes("deadlift") || n.includes("rdl") || n.includes("good morning") || n.includes("hip thrust")) {
    return {
      movementPattern: "hinge",
      primaryMuscles: ["Hamstrings", "Gluteus Maximus", "Erector Spinae"],
      secondaryMuscles: ["Latissimus Dorsi", "Trapezius", "Forearm Flexors"],
      cadence: { eccentricSeconds: 3, pauseSeconds: 1, concentricSeconds: 1 },
      formCues: ["Hinge at the hips keeping the weight dragging close to shins", "Pack lats to lock upper spine in neutral rigidity", "Lock out by squeezing glutes forward without hyperextension"]
    };
  }

  if (n.includes("curl")) {
    return {
      movementPattern: "curl",
      primaryMuscles: ["Biceps Brachii", "Brachialis"],
      secondaryMuscles: ["Brachioradialis", "Forearm Flexors"],
      cadence: { eccentricSeconds: 2, pauseSeconds: 1, concentricSeconds: 1 },
      formCues: ["Pin elbows tight to torso without swinging shoulders", "Initiate concentric contraction with biceps squeeze", "Control the negative phase under continuous tension"]
    };
  }

  if (n.includes("shoulder press") || n.includes("overhead") || n.includes("arnold") || n.includes("pike")) {
    return {
      movementPattern: "press",
      primaryMuscles: ["Anterior Deltoid", "Lateral Deltoid"],
      secondaryMuscles: ["Triceps Brachii", "Upper Trapezius", "Core"],
      cadence: { eccentricSeconds: 2, pauseSeconds: 1, concentricSeconds: 1 },
      formCues: ["Maintain ribcage pull-down with glute tension", "Press vertically in line with ears at lockout", "Lower under control to chin or clavicle height"]
    };
  }

  if (n.includes("lateral raise") || n.includes("front raise") || n.includes("rear delt") || n.includes("face pull")) {
    return {
      movementPattern: "raise",
      primaryMuscles: ["Lateral Deltoid", "Posterior Deltoid"],
      secondaryMuscles: ["Trapezius", "Rotator Cuff"],
      cadence: { eccentricSeconds: 2, pauseSeconds: 1, concentricSeconds: 1 },
      formCues: ["Lead with elbows slightly forward of the scapular plane", "Avoid shrugging shoulders up toward the neck", "Pause for peak contraction before controlled descent"]
    };
  }

  if (n.includes("tricep") || n.includes("dip") || n.includes("pushdown") || n.includes("skull crusher")) {
    return {
      movementPattern: "extension",
      primaryMuscles: ["Triceps Brachii (All Three Heads)"],
      secondaryMuscles: ["Anterior Deltoid", "Pectoralis Major"],
      cadence: { eccentricSeconds: 2, pauseSeconds: 1, concentricSeconds: 1 },
      formCues: ["Keep upper arms stationary while hinging strictly at elbows", "Achieve full peak tricep contraction at lockout", "Control eccentric stretch without letting elbows flare excessively"]
    };
  }

  if (n.includes("pull-up") || n.includes("chin-up") || n.includes("row") || n.includes("pulldown") || muscleGroup === "Back") {
    return {
      movementPattern: "pull",
      primaryMuscles: ["Latissimus Dorsi", "Rhomboids", "Middle Trapezius"],
      secondaryMuscles: ["Biceps Brachii", "Posterior Deltoid", "Forearms"],
      cadence: { eccentricSeconds: 3, pauseSeconds: 1, concentricSeconds: 1 },
      formCues: ["Initiate by pulling scapulae down and together", "Drive elbows down toward hip pockets rather than pulling with hands", "Feel deep stretch at the top without losing core tension"]
    };
  }

  return {
    movementPattern: "core",
    primaryMuscles: ["Core Musculature"],
    secondaryMuscles: ["Hip Flexors", "Obliques"],
    cadence: { eccentricSeconds: 2, pauseSeconds: 1, concentricSeconds: 1 },
    formCues: ["Maintain 360-degree intra-abdominal pressure", "Focus on deliberate mind-muscle contraction", "Keep lumbar spine stable and controlled throughout the range"]
  };
};
