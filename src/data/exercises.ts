import { buildExerciseMediaUrl } from "@/lib/exerciseMedia";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  equipment: string;
  video?: string;
  poster?: string;
  description?: string;
  instructions?: string[];
  cues?: string[];
}

const media = (filenameOrUrl: string) => {
  if (filenameOrUrl.startsWith('http')) {
    return {
      video: filenameOrUrl,
      poster: undefined
    };
  }
  return {
    video: buildExerciseMediaUrl("videos", filenameOrUrl),
    poster: buildExerciseMediaUrl("posters", filenameOrUrl.replace(/\.mp4$/, ".svg")),
  };
};

export const exercises: Exercise[] = [
  // ========== BEGINNER EXERCISES ==========
  
  // Beginner - Chest
  {
    id: '1',
    name: 'Push-ups',
    muscleGroup: 'Chest',
    difficulty: 'Beginner',
    duration: '3 sets x 10-15 reps',
    equipment: 'Bodyweight',
    video: buildExerciseMediaUrl('videos', 'pushups-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'push-ups-poster.svg'),
    description: 'A fundamental bodyweight exercise for chest development',
    instructions: [
      'Place your hands slightly wider than shoulder-width apart, fingers pointed forward or slightly outward.',
      'Form a straight rigid line from your heels to the crown of your head, engaging glutes and core.',
      'Lower your chest under control until your elbows reach approximately a 90-degree angle (45-degree arrow shape relative to torso).',
      'Press powerfully through your palms back to the top lockout position while exhaling.',
    ],
    cues: [
      'Do not flare elbows out wide at 90 degrees — maintain a 45-degree arrow trajectory to protect shoulder rotators.',
      'Squeeze your glutes to prevent sagging at the hips or lumbar arching.',
    ],
  },
  {
    id: '38',
    name: 'Incline Push-Up',
    muscleGroup: 'Chest',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Bodyweight',
    video: buildExerciseMediaUrl('videos', 'pushups-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'incline-push-up-poster.svg'),
    description: 'An easier variation of push-ups'
  },
  {
    id: '42',
    name: 'Stair Press-Up',
    muscleGroup: 'Chest',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Bodyweight',
    video: buildExerciseMediaUrl('videos', 'pushups-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'stair-press-up-poster.svg'),
    description: 'A convenient way to do incline or decline push-ups'
  },

  // Beginner - Back
  {
    id: '6',
    name: 'Lat Pulldowns',
    muscleGroup: 'Back',
    difficulty: 'Beginner',
    duration: '3 sets x 10-15 reps',
    equipment: 'Cable Machine',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'lat-pulldowns-poster.svg'),
    description: 'The machine provides stability, making it easy to learn the vertical pulling motion and focus on squeezing your lats'
  },
  {
    id: '49',
    name: 'Supermans',
    muscleGroup: 'Back',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Bodyweight',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'supermans-poster.svg'),
    description: 'A simple, low-impact bodyweight exercise that helps you learn to activate your lower back and glute muscles'
  },
  {
    id: '50',
    name: 'Back Extensions (Hyperextensions)',
    muscleGroup: 'Back',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Machine',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'back-extensions-hyperextensions-poster.svg'),
    description: 'The machine supports your body, isolating the lower back for a controlled movement'
  },
  {
    id: '51',
    name: 'Seated Cable Rows',
    muscleGroup: 'Back',
    difficulty: 'Beginner',
    duration: '3 sets x 10-15 reps',
    equipment: 'Cable Machine',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'seated-cable-rows-poster.svg'),
    description: 'A stable, seated movement that is excellent for building thickness in the mid-back and learning horizontal rowing form'
  },
  {
    id: '52',
    name: 'Chest Supported Rows',
    muscleGroup: 'Back',
    difficulty: 'Beginner',
    duration: '3 sets x 10-15 reps',
    equipment: 'Machine',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'chest-supported-rows-poster.svg'),
    description: 'Supporting your chest on a bench completely removes momentum and protects your lower back, making it one of the safest ways to learn how to row'
  },
  {
    id: '53',
    name: 'Dumbbell Shrugs',
    muscleGroup: 'Back',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'dumbbell-shrugs-poster.svg'),
    description: 'A very simple isolation movement that is easy to learn and targets the traps'
  },
  {
    id: '54',
    name: 'Barbell Shrugs',
    muscleGroup: 'Back',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'barbell-shrugs-poster.svg'),
    description: 'A simple isolation movement for building trap muscles'
  },

  // Beginner - Legs
  {
    id: '7',
    name: 'Squats',
    muscleGroup: 'Legs',
    difficulty: 'Beginner',
    duration: '4 sets x 12-15 reps',
    equipment: 'Bodyweight',
    video: buildExerciseMediaUrl('videos', 'squats-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'squats-poster.svg'),
    description: 'A foundational lower body compound movement for building quadriceps, glutes, and core stability'
  },

  // Beginner - Arms
  {
    id: '10',
    name: 'Bicep Curls',
    muscleGroup: 'Arms',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'bicep-curls-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'bicep-curls-poster.svg'),
  },
  {
    id: '12',
    name: 'Hammer Curls',
    muscleGroup: 'Arms',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'hammer-curls-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'hammer-curls-poster.svg'),
  },

  // Beginner - Shoulders
  {
    id: '14',
    name: 'Lateral Raises',
    muscleGroup: 'Shoulders',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'lateral-raises-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'lateral-raises-poster.svg'),
    description: 'An isolation exercise that targets the lateral deltoids to build broader shoulders'
  },

  // Beginner - Core
  {
    id: '16',
    name: 'Plank',
    muscleGroup: 'Core',
    difficulty: 'Beginner',
    duration: '3 sets x 30-60 seconds',
    equipment: 'Bodyweight',
    video: buildExerciseMediaUrl('videos', 'plank-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'plank-poster.svg'),
    description: 'A fundamental core exercise that builds stability and endurance'
  },
  {
    id: '18',
    name: 'Dead Bug',
    muscleGroup: 'Core',
    difficulty: 'Beginner',
    duration: '3 sets x 10 each side',
    equipment: 'Bodyweight',
    video: buildExerciseMediaUrl('videos', 'dead-bug-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'dead-bug-poster.svg'),
    description: 'An excellent exercise for core stability and coordination'
  },

  // ========== INTERMEDIATE EXERCISES ==========

  // Intermediate - Chest
  {
    id: '2',
    name: 'Bench Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'bench-press-poster.svg'),
    description: 'The classic chest-building exercise',
    instructions: [
      'Lie supine on the bench with eyes directly under the racked barbell and feet planted firmly into the floor.',
      'Grip the bar slightly wider than shoulder-width with a secure, full overhand grip.',
      'Retract your scapulae (pull shoulder blades together and down into the bench pad) and unrack the bar directly over mid-chest.',
      'Lower the barbell in a slight arc toward the lower sternum/nipple line with elbows tucked at roughly 45–70 degrees.',
      'Pause for a fraction of a second at chest touch, then press forcefully upward and slightly back toward the rack pins.',
    ],
    cues: [
      'Maintain continuous leg drive by driving heels into the floor throughout the concentric press.',
      'Keep your wrists stacked directly over your forearms; avoid bending wrists backward.',
    ],
  },
  {
    id: '3',
    name: 'Dumbbell Flyes',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'dumbbell-flyes-poster.svg'),
    description: 'An isolation movement to stretch and work the chest muscles'
  },
  {
    id: '19',
    name: 'Cable Chest Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Cable Machine',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'cable-chest-press-poster.svg'),
    description: 'A versatile exercise that can be done at various angles to target different parts of the chest'
  },
  {
    id: '20',
    name: 'Cable Pec Fly',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 12-15 reps',
    equipment: 'Cable Machine',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'cable-pec-fly-poster.svg'),
    description: 'An isolation exercise that\'s great for feeling the chest muscles contract'
  },
  {
    id: '21',
    name: 'Cable Decline Bench Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Cable Machine',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'cable-decline-bench-press-poster.svg'),
    description: 'This variation targets the lower chest muscles'
  },
  {
    id: '22',
    name: 'Cable Decline Bench Chest Fly',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 12-15 reps',
    equipment: 'Cable Machine',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'cable-decline-bench-chest-fly-poster.svg'),
    description: 'Similar to the decline press, but with a flying motion to isolate the pecs'
  },
  {
    id: '23',
    name: 'Cable Crossover',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 12-15 reps',
    equipment: 'Cable Machine',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'cable-crossover-poster.svg'),
    description: 'A classic exercise for a good chest stretch and contraction'
  },
  {
    id: '24',
    name: 'Standing Low to High Cable Fly',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 12-15 reps',
    equipment: 'Cable Machine',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'standing-low-to-high-cable-fly-poster.svg'),
    description: 'This targets the upper chest'
  },
  {
    id: '25',
    name: 'Standing High to Low Cable Fly',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 12-15 reps',
    equipment: 'Cable Machine',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'standing-high-to-low-cable-fly-poster.svg'),
    description: 'This variation focuses on the lower chest'
  },
  {
    id: '26',
    name: 'Dumbbell Bench Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'dumbbell-bench-press-poster.svg'),
    description: 'A fundamental compound exercise for the chest'
  },
  {
    id: '27',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'incline-dumbbell-press-poster.svg'),
    description: 'This version of the bench press emphasizes the upper chest'
  },
  {
    id: '28',
    name: 'Decline Dumbbell Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'decline-dumbbell-press-poster.svg'),
    description: 'This targets the lower part of the chest'
  },
  {
    id: '29',
    name: 'Incline Dumbbell Flys',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'incline-dumbbell-flys-poster.svg'),
    description: 'The incline variation puts more focus on the upper pecs'
  },
  {
    id: '30',
    name: 'Dumbbell Pullover',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'dumbbell-pullover-poster.svg'),
    description: 'An exercise that works both the chest and the lats'
  },
  {
    id: '31',
    name: 'Close Grip Dumbbell Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'close-grip-dumbbell-press-poster.svg'),
    description: 'This variation places more emphasis on the inner chest'
  },
  {
    id: '32',
    name: 'Neutral Grip Dumbbell Bench Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'neutral-grip-dumbbell-bench-press-poster.svg'),
    description: 'By keeping your palms facing each other, you can reduce shoulder strain and target the chest differently'
  },
  {
    id: '34',
    name: 'Dumbbell Twist Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'dumbbell-twist-press-poster.svg'),
    description: 'This adds a rotational component to the standard press'
  },
  {
    id: '35',
    name: 'Incline Bench Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'incline-bench-press-poster.svg'),
    description: 'To target the upper chest'
  },
  {
    id: '36',
    name: 'Decline Bench Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'decline-bench-press-poster.svg'),
    description: 'To focus on the lower chest'
  },
  {
    id: '39',
    name: 'Decline Push-Up',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Bodyweight',
    video: buildExerciseMediaUrl('videos', 'pushups-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'decline-push-up-poster.svg'),
    description: 'A more challenging variation that targets the upper chest'
  },
  {
    id: '43',
    name: 'Dips',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 8-12 reps',
    equipment: 'Dip Bar',
    video: buildExerciseMediaUrl('videos', 'tricep-dips-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'dips-poster.svg'),
    description: 'A great compound exercise for the chest and triceps'
  },
  {
    id: '44',
    name: 'Smith Machine Incline Bench Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Smith Machine',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'smith-machine-incline-bench-press-poster.svg'),
    description: 'Provides a fixed path for the barbell, which can be helpful for beginners or when training without a spotter'
  },
  {
    id: '45',
    name: 'Hammer Strength Machine Incline Bench Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Machine',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'hammer-strength-machine-incline-bench-press-poster.svg'),
    description: 'A machine that mimics the incline bench press motion'
  },
  {
    id: '46',
    name: 'Medicine Ball Chest Press Partner Toss',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Medicine Ball',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'medicine-ball-chest-press-partner-toss-poster.svg'),
    description: 'A dynamic and explosive exercise'
  },

  // Intermediate - Back
  {
    id: '5',
    name: 'Dumbbell Row',
    muscleGroup: 'Back',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'dumbbell-row-poster.svg'),
    description: 'This free-weight exercise requires you to stabilize your own torso and resist rotation, engaging your core more than a machine row'
  },
  {
    id: '55',
    name: 'Inverted Row',
    muscleGroup: 'Back',
    difficulty: 'Intermediate',
    duration: '3 sets x 8-12 reps',
    equipment: 'Bodyweight',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'inverted-row-poster.svg'),
    description: 'A bodyweight row that requires significant core and back strength. A perfect stepping stone to eventually doing pull-ups'
  },
  {
    id: '56',
    name: 'Face Pulls',
    muscleGroup: 'Back',
    difficulty: 'Intermediate',
    duration: '3 sets x 12-15 reps',
    equipment: 'Cable Machine',
    video: buildExerciseMediaUrl('videos', 'lateral-raises-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'face-pulls-poster.svg'),
    description: 'Requires good technique to ensure you\'re targeting the upper back muscles correctly and not straining your shoulders'
  },
  {
    id: '57',
    name: 'T-Bar Rows',
    muscleGroup: 'Back',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 't-bar-rows-poster.svg'),
    description: 'This variation of a row requires good lower back stability and proper hip hinge technique'
  },
  {
    id: '58',
    name: 'Chin-Ups',
    muscleGroup: 'Back',
    difficulty: 'Intermediate',
    duration: '3 sets x 6-10 reps',
    equipment: 'Pull-up Bar',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'chin-ups-poster.svg'),
    description: 'The first major bodyweight vertical pull. Slightly easier than a pull-up due to greater bicep involvement'
  },
  {
    id: '59',
    name: 'Upright Row',
    muscleGroup: 'Back',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'upright-row-poster.svg'),
    description: 'Requires careful form to avoid shoulder impingement. Demands more coordination and control than simple shrugs'
  },

  // Intermediate - Legs
  {
    id: '9',
    name: 'Lunges',
    muscleGroup: 'Legs',
    difficulty: 'Intermediate',
    duration: '3 sets x 12 reps each leg',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'squats-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'lunges-poster.svg'),},

  // Intermediate - Arms
  {
    id: '11',
    name: 'Tricep Dips',
    muscleGroup: 'Arms',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Bench',
    video: buildExerciseMediaUrl('videos', 'tricep-dips-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'tricep-dips-poster.svg'),
  },

  // Intermediate - Shoulders
  {
    id: '13',
    name: 'Shoulder Press',
    muscleGroup: 'Shoulders',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'shoulder-press-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'shoulder-press-poster.svg'),
    description: 'A compound pressing movement that builds overall shoulder strength and mass'
  },
  {
    id: '15',
    name: 'Pike Push-ups',
    muscleGroup: 'Shoulders',
    difficulty: 'Intermediate',
    duration: '3 sets x 8-12 reps',
    equipment: 'Bodyweight',
    video: buildExerciseMediaUrl('videos', 'pike-pushups-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'pike-push-ups-poster.svg'),
    description: 'A bodyweight exercise that targets the shoulders by mimicking an overhead press movement'
  },

  // Intermediate - Core
  {
    id: '17',
    name: 'Russian Twists',
    muscleGroup: 'Core',
    difficulty: 'Intermediate',
    duration: '3 sets x 20 reps',
    equipment: 'Medicine Ball',
    video: buildExerciseMediaUrl('videos', 'russian-twists-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'russian-twists-poster.svg'),
    description: 'A rotational core exercise that targets the obliques and improves rotational strength'
  },

  // ========== ADVANCED EXERCISES ==========

  // Advanced - Chest
  {
    id: '33',
    name: 'Reverse Grip Dumbbell Squeeze Press',
    muscleGroup: 'Chest',
    difficulty: 'Advanced',
    duration: '3 sets x 8-10 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'reverse-grip-dumbbell-squeeze-press-poster.svg'),
    description: 'An interesting variation to challenge your muscles in a new way'
  },
  {
    id: '37',
    name: 'Guillotine Press',
    muscleGroup: 'Chest',
    difficulty: 'Advanced',
    duration: '3 sets x 8-10 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'guillotine-press-poster.svg'),
    description: 'A variation where you lower the bar to your neck, creating a greater stretch in the pecs'
  },
  {
    id: '40',
    name: 'Clap Press-Up',
    muscleGroup: 'Chest',
    difficulty: 'Advanced',
    duration: '3 sets x 8-10 reps',
    equipment: 'Bodyweight',
    video: buildExerciseMediaUrl('videos', 'pushups-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'clap-press-up-poster.svg'),
    description: 'An explosive variation for power development'
  },
  {
    id: '41',
    name: 'Spiderman Press-Up',
    muscleGroup: 'Chest',
    difficulty: 'Advanced',
    duration: '3 sets x 10-12 reps',
    equipment: 'Bodyweight',
    video: buildExerciseMediaUrl('videos', 'pushups-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'spiderman-press-up-poster.svg'),
    description: 'Adds a core and hip flexor challenge'
  },
  {
    id: '47',
    name: 'Bosu Ball Push Up',
    muscleGroup: 'Chest',
    difficulty: 'Advanced',
    duration: '3 sets x 8-10 reps',
    equipment: 'Bosu Ball',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'bosu-ball-push-up-poster.svg'),
    description: 'Adds an element of instability to challenge your core and stabilizer muscles'
  },
  {
    id: '48',
    name: 'Push Up (Feet on Swiss Ball)',
    muscleGroup: 'Chest',
    difficulty: 'Advanced',
    duration: '3 sets x 8-10 reps',
    equipment: 'Swiss Ball',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'push-up-feet-on-swiss-ball-poster.svg'),
    description: 'Another way to add instability and increase the difficulty of the push-up'
  },

  // Advanced - Back
  {
    id: '4',
    name: 'Pull-ups',
    muscleGroup: 'Back',
    difficulty: 'Advanced',
    duration: '3 sets x 5-10 reps',
    equipment: 'Pull-up Bar',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'pull-ups-poster.svg'),
    description: 'The quintessential test of upper body pulling strength. Using a wider, overhand grip isolates the lats more'
  },
  {
    id: '60',
    name: 'Barbell Bent Over Row',
    muscleGroup: 'Back',
    difficulty: 'Advanced',
    duration: '4 sets x 6-10 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'barbell-bent-over-row-poster.svg'),
    description: 'A major compound lift that requires immense core and lower back strength to maintain a rigid, flat back. Proper hip hinge technique is critical'
  },
  {
    id: '61',
    name: 'Good Mornings',
    muscleGroup: 'Back',
    difficulty: 'Advanced',
    duration: '3 sets x 8-10 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'good-mornings-poster.svg'),
    description: 'A highly technical lift that directly loads the lower back. Requires excellent form and control to perform safely'
  },
  {
    id: '62',
    name: 'Deadlifts',
    muscleGroup: 'Back',
    difficulty: 'Advanced',
    duration: '4 sets x 5-8 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'deadlifts-poster.svg'),
    description: 'The king of all exercises. The most technically demanding lift that requires precise form, full-body tension, and strong understanding of bracing'
  },

  // Advanced - Legs
  {
    id: '63',
    name: 'Bulgarian Split Squats',
    muscleGroup: 'Legs',
    difficulty: 'Advanced',
    duration: '3 sets x 8-10 reps each leg',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'squats-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'bulgarian-split-squats-poster.svg'),
    description: 'A challenging single-leg exercise that requires balance and strength'
  },

  // ========== EXPANDED MUSCLEWIKI EXERCISE CATALOGUE ==========

  // Legs (Quads, Hamstrings, Glutes, Calves)
  {
    id: '64',
    name: 'Barbell Back Squat',
    muscleGroup: 'Legs',
    difficulty: 'Advanced',
    duration: '4 sets x 6-10 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'squats-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'barbell-back-squat-poster.svg'),
    description: 'The cornerstone of lower body training. Loads quadriceps, glutes, hamstrings, and lower back with deep hip and knee flexion.'
  },
  {
    id: '65',
    name: 'Barbell Front Squat',
    muscleGroup: 'Legs',
    difficulty: 'Advanced',
    duration: '4 sets x 6-8 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'squats-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'barbell-front-squat-poster.svg'),
    description: 'Places high emphasis on anterior quadriceps, rectus femoris, and thoracic core stability with an upright torso.'
  },
  {
    id: '66',
    name: 'Leg Press',
    muscleGroup: 'Legs',
    difficulty: 'Beginner',
    duration: '3 sets x 10-12 reps',
    equipment: 'Machine',
    video: buildExerciseMediaUrl('videos', 'squats-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'leg-press-poster.svg'),
    description: 'Allows high volume quadriceps and glutes hypertrophy without direct spinal compression.'
  },
  {
    id: '67',
    name: 'Romanian Deadlift (RDL)',
    muscleGroup: 'Legs',
    difficulty: 'Intermediate',
    duration: '3 sets x 8-10 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'romanian-deadlift-rdl-poster.svg'),
    description: 'Hinges deeply at the hips to load the hamstrings and gluteal muscles under deep eccentric stretch.'
  },
  {
    id: '68',
    name: 'Lying Leg Curl',
    muscleGroup: 'Legs',
    difficulty: 'Beginner',
    duration: '3 sets x 10-12 reps',
    equipment: 'Machine',
    video: buildExerciseMediaUrl('videos', 'bicep-curls-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'lying-leg-curl-poster.svg'),
    description: 'Direct isolation of the hamstrings through knee flexion against constant resistance.'
  },
  {
    id: '69',
    name: 'Leg Extension',
    muscleGroup: 'Legs',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Machine',
    video: buildExerciseMediaUrl('videos', 'squats-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'leg-extension-poster.svg'),
    description: 'Isolates the quadriceps, especially rectus femoris and vastus medialis, during peak terminal knee extension.'
  },
  {
    id: '70',
    name: 'Barbell Hip Thrust',
    muscleGroup: 'Legs',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'deadlifts-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'barbell-hip-thrust-poster.svg'),
    description: 'The premier glute builder providing peak mechanical tension at horizontal hip extension.'
  },
  {
    id: '71',
    name: 'Standing Calf Raise',
    muscleGroup: 'Legs',
    difficulty: 'Beginner',
    duration: '4 sets x 12-15 reps',
    equipment: 'Machine',
    video: buildExerciseMediaUrl('videos', 'squats-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'standing-calf-raise-poster.svg'),
    description: 'Targets the gastrocnemius of the calves with full ankle extension and plantarflexion stretch.'
  },
  {
    id: '72',
    name: 'Seated Calf Raise',
    muscleGroup: 'Legs',
    difficulty: 'Beginner',
    duration: '3 sets x 15-20 reps',
    equipment: 'Machine',
    video: buildExerciseMediaUrl('videos', 'squats-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'seated-calf-raise-poster.svg'),
    description: 'Isolates the deeper soleus calf muscle with 90-degree bent knees.'
  },
  {
    id: '73',
    name: 'Goblet Squat',
    muscleGroup: 'Legs',
    difficulty: 'Beginner',
    duration: '3 sets x 10-12 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'squats-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'goblet-squat-poster.svg'),
    description: 'Front-loaded squat with dumbbell or kettlebell against chest; ideal for quadriceps and mobility mechanics.'
  },

  // Arms (Biceps, Triceps, Forearms)
  {
    id: '74',
    name: 'Barbell Bicep Curl',
    muscleGroup: 'Arms',
    difficulty: 'Beginner',
    duration: '3 sets x 8-10 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'bicep-curls-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'barbell-bicep-curl-poster.svg'),
    description: 'Classic compound isolation for the biceps brachii using a straight or EZ-curl barbell.'
  },
  {
    id: '75',
    name: 'Incline Dumbbell Curl',
    muscleGroup: 'Arms',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'bicep-curls-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'incline-dumbbell-curl-poster.svg'),
    description: 'Positions upper arms behind the torso on an incline bench to target the long head of the biceps under maximum stretch.'
  },
  {
    id: '76',
    name: 'Preacher Curl',
    muscleGroup: 'Arms',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'bicep-curls-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'preacher-curl-poster.svg'),
    description: 'Eliminates shoulder movement to isolate the short head and brachialis on an angled arm pad.'
  },
  {
    id: '77',
    name: 'Cable Tricep Pushdown',
    muscleGroup: 'Arms',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Cables',
    video: buildExerciseMediaUrl('videos', 'tricep-dips-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'cable-tricep-pushdown-poster.svg'),
    description: 'Standard triceps exercise using rope or straight bar attachment with strict elbow tuck.'
  },
  {
    id: '78',
    name: 'Skull Crushers (Lying Triceps Extension)',
    muscleGroup: 'Arms',
    difficulty: 'Intermediate',
    duration: '3 sets x 8-10 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'tricep-dips-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'skull-crushers-lying-triceps-extension-poster.svg'),
    description: 'Lying bench triceps extension targeting the long and lateral heads toward the forehead.'
  },
  {
    id: '79',
    name: 'Overhead Cable Tricep Extension',
    muscleGroup: 'Arms',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Cables',
    video: buildExerciseMediaUrl('videos', 'tricep-dips-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'overhead-cable-tricep-extension-poster.svg'),
    description: 'Overhead elbow extension that completely stretches and loads the triceps long head.'
  },
  {
    id: '80',
    name: 'Close-Grip Bench Press',
    muscleGroup: 'Arms',
    difficulty: 'Advanced',
    duration: '3 sets x 6-8 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'close-grip-bench-press-poster.svg'),
    description: 'Compound press with shoulder-width grip shifting primary mechanical load onto the triceps.'
  },
  {
    id: '81',
    name: 'Barbell Wrist Curl',
    muscleGroup: 'Arms',
    difficulty: 'Beginner',
    duration: '3 sets x 15-20 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'bicep-curls-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'barbell-wrist-curl-poster.svg'),
    description: 'Wrist flexion exercise developing forearm flexors, forearm size, and crushing grip power.'
  },
  {
    id: '82',
    name: 'Reverse Barbell Curl',
    muscleGroup: 'Arms',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'bicep-curls-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'reverse-barbell-curl-poster.svg'),
    description: 'Pronated overhand curl building the brachioradialis and forearm extensors.'
  },
  {
    id: '83',
    name: "Farmer's Walk",
    muscleGroup: 'Arms',
    difficulty: 'Intermediate',
    duration: '3 sets x 45-60 sec',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'hammer-curls-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'farmers-walk-poster.svg'),
    description: 'Heavy loaded carry challenging forearm grip, traps, and core trunk stabilization.'
  },

  // Shoulders (Deltoids - Front, Lateral, Rear)
  {
    id: '84',
    name: 'Overhead Barbell Press',
    muscleGroup: 'Shoulders',
    difficulty: 'Advanced',
    duration: '4 sets x 5-8 reps',
    equipment: 'Barbell',
    video: buildExerciseMediaUrl('videos', 'shoulder-press-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'overhead-barbell-press-poster.svg'),
    description: 'The premier overhead compound lift for front deltoids, upper chest, and shoulder stability.'
  },
  {
    id: '85',
    name: 'Arnold Press',
    muscleGroup: 'Shoulders',
    difficulty: 'Intermediate',
    duration: '3 sets x 8-10 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'shoulder-press-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'arnold-press-poster.svg'),
    description: 'Rotational dumbbell press moving from supinated to pronated grip, activating all three deltoid heads.'
  },
  {
    id: '86',
    name: 'Cable Lateral Raise',
    muscleGroup: 'Shoulders',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Cables',
    video: buildExerciseMediaUrl('videos', 'lateral-raises-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'cable-lateral-raise-poster.svg'),
    description: 'Provides constant resistance across full arm abduction for side deltoid capped width.'
  },
  {
    id: '87',
    name: 'Face Pulls',
    muscleGroup: 'Shoulders',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Cables',
    video: buildExerciseMediaUrl('videos', 'lateral-raises-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'face-pulls-poster.svg'),
    description: 'Pulls rope to face with external rotation; bulletproofs rear delts, rhomboids, and rotator cuff.'
  },
  {
    id: '88',
    name: 'Rear Delt Dumbbell Fly',
    muscleGroup: 'Shoulders',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'benchpress-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'rear-delt-dumbbell-fly-poster.svg'),
    description: 'Bent-over reverse fly isolating posterior deltoids and middle trapezius.'
  },
  {
    id: '89',
    name: 'Dumbbell Front Raise',
    muscleGroup: 'Shoulders',
    difficulty: 'Beginner',
    duration: '3 sets x 10-12 reps',
    equipment: 'Dumbbells',
    video: buildExerciseMediaUrl('videos', 'lateral-raises-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'dumbbell-front-raise-poster.svg'),
    description: 'Raises dumbbells forward to shoulder height to isolate anterior front delts.'
  },
  {
    id: '90',
    name: 'Machine Shoulder Press',
    muscleGroup: 'Shoulders',
    difficulty: 'Beginner',
    duration: '3 sets x 10-12 reps',
    equipment: 'Machine',
    video: buildExerciseMediaUrl('videos', 'shoulder-press-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'machine-shoulder-press-poster.svg'),
    description: 'Guided overhead press pathway allowing safe, intense deltoid progressive overload.'
  },

  // Core (Abs, Obliques, Anti-Extension)
  {
    id: '91',
    name: 'Cable Crunch',
    muscleGroup: 'Core',
    difficulty: 'Intermediate',
    duration: '3 sets x 12-15 reps',
    equipment: 'Cables',
    video: buildExerciseMediaUrl('videos', 'hanging-crunches-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'cable-crunch-poster.svg'),
    description: 'Kneeling rope cable crunch allowing progressive weighted resistance on the rectus abdominis abs.'
  },
  {
    id: '92',
    name: 'Hanging Leg Raise',
    muscleGroup: 'Core',
    difficulty: 'Advanced',
    duration: '3 sets x 10-12 reps',
    equipment: 'Pull-up Bar',
    video: buildExerciseMediaUrl('videos', 'leg-raises-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'hanging-leg-raise-poster.svg'),
    description: 'Hangs from bar and curls knees or toes to bar, strongly engaging lower abs and hip flexors.'
  },
  {
    id: '93',
    name: 'Ab Wheel Rollout',
    muscleGroup: 'Core',
    difficulty: 'Advanced',
    duration: '3 sets x 8-10 reps',
    equipment: 'Other',
    video: buildExerciseMediaUrl('videos', 'dead-bug-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'ab-wheel-rollout-poster.svg'),
    description: 'Anti-extension exercise forcing intense isometric bracing through the entire abdominal wall.'
  },
  {
    id: '94',
    name: 'Cable Woodchoppers',
    muscleGroup: 'Core',
    difficulty: 'Intermediate',
    duration: '3 sets x 12-15 reps each side',
    equipment: 'Cables',
    video: buildExerciseMediaUrl('videos', 'russian-twists-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'cable-woodchoppers-poster.svg'),
    description: 'Diagonal rotational cable pattern training the internal and external obliques and core rotation.'
  },
  {
    id: '95',
    name: 'Bicycle Crunches',
    muscleGroup: 'Core',
    difficulty: 'Beginner',
    duration: '3 sets x 20 reps',
    equipment: 'Bodyweight',
    video: buildExerciseMediaUrl('videos', 'russian-twists-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'bicycle-crunches-poster.svg'),
    description: 'Cross-body alternating crunch activating both rectus abdominis and rotational obliques.'
  },
  {
    id: '96',
    name: 'Side Plank',
    muscleGroup: 'Core',
    difficulty: 'Beginner',
    duration: '3 sets x 30-45 sec each side',
    equipment: 'Bodyweight',
    video: buildExerciseMediaUrl('videos', 'plank-video.mp4'),
    poster: buildExerciseMediaUrl('posters', 'side-plank-poster.svg'),
    description: 'Static lateral core stabilization targeting lateral obliques, transverse abdominis, and quadratus lumborum.'
  },
  {
    id: '97',
    name: 'Decline Bench Crunch',
    muscleGroup: 'Core',
    difficulty: 'Intermediate',
    duration: '3 sets x 12-15 reps',
    equipment: 'Bench',
    video: buildExerciseMediaUrl('videos', 'hanging-crunches-video.webm'),
    poster: buildExerciseMediaUrl('posters', 'decline-bench-crunch-poster.svg'),
    description: 'Increased range of motion and gravitational overload for the upper and mid rectus abdominis abs.'
  }
];
