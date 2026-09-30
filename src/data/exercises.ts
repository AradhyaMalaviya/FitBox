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
    ...media('pushups-video.mp4'),
    description: 'A fundamental bodyweight exercise for chest development'
  },
  {
    id: '38',
    name: 'Incline Push-Up',
    muscleGroup: 'Chest',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Bodyweight',
    description: 'An easier variation of push-ups'
  },
  {
    id: '42',
    name: 'Stair Press-Up',
    muscleGroup: 'Chest',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Bodyweight',
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
    description: 'The machine provides stability, making it easy to learn the vertical pulling motion and focus on squeezing your lats'
  },
  {
    id: '49',
    name: 'Supermans',
    muscleGroup: 'Back',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Bodyweight',
    description: 'A simple, low-impact bodyweight exercise that helps you learn to activate your lower back and glute muscles'
  },
  {
    id: '50',
    name: 'Back Extensions (Hyperextensions)',
    muscleGroup: 'Back',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Machine',
    description: 'The machine supports your body, isolating the lower back for a controlled movement'
  },
  {
    id: '51',
    name: 'Seated Cable Rows',
    muscleGroup: 'Back',
    difficulty: 'Beginner',
    duration: '3 sets x 10-15 reps',
    equipment: 'Cable Machine',
    description: 'A stable, seated movement that is excellent for building thickness in the mid-back and learning horizontal rowing form'
  },
  {
    id: '52',
    name: 'Chest Supported Rows',
    muscleGroup: 'Back',
    difficulty: 'Beginner',
    duration: '3 sets x 10-15 reps',
    equipment: 'Machine',
    description: 'Supporting your chest on a bench completely removes momentum and protects your lower back, making it one of the safest ways to learn how to row'
  },
  {
    id: '53',
    name: 'Dumbbell Shrugs',
    muscleGroup: 'Back',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Dumbbells',
    description: 'A very simple isolation movement that is easy to learn and targets the traps'
  },
  {
    id: '54',
    name: 'Barbell Shrugs',
    muscleGroup: 'Back',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Barbell',
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
    ...media('bicep-curls-video.mp4')
  },
  {
    id: '12',
    name: 'Hammer Curls',
    muscleGroup: 'Arms',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Dumbbells',
    ...media('hammer-curls-video.mp4')
  },

  // Beginner - Shoulders
  {
    id: '14',
    name: 'Lateral Raises',
    muscleGroup: 'Shoulders',
    difficulty: 'Beginner',
    duration: '3 sets x 12-15 reps',
    equipment: 'Dumbbells',
    ...media('lateral-raises-video.mp4'),
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
    ...media('plank-video.mp4'),
    description: 'A fundamental core exercise that builds stability and endurance'
  },
  {
    id: '18',
    name: 'Dead Bug',
    muscleGroup: 'Core',
    difficulty: 'Beginner',
    duration: '3 sets x 10 each side',
    equipment: 'Bodyweight',
    ...media('dead-bug-video.mp4'),
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
    ...media('benchpress-video.mp4'),
    description: 'The classic chest-building exercise'
  },
  {
    id: '3',
    name: 'Dumbbell Flyes',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Dumbbells',
    description: 'An isolation movement to stretch and work the chest muscles'
  },
  {
    id: '19',
    name: 'Cable Chest Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Cable Machine',
    description: 'A versatile exercise that can be done at various angles to target different parts of the chest'
  },
  {
    id: '20',
    name: 'Cable Pec Fly',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 12-15 reps',
    equipment: 'Cable Machine',
    description: 'An isolation exercise that\'s great for feeling the chest muscles contract'
  },
  {
    id: '21',
    name: 'Cable Decline Bench Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Cable Machine',
    description: 'This variation targets the lower chest muscles'
  },
  {
    id: '22',
    name: 'Cable Decline Bench Chest Fly',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 12-15 reps',
    equipment: 'Cable Machine',
    description: 'Similar to the decline press, but with a flying motion to isolate the pecs'
  },
  {
    id: '23',
    name: 'Cable Crossover',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 12-15 reps',
    equipment: 'Cable Machine',
    description: 'A classic exercise for a good chest stretch and contraction'
  },
  {
    id: '24',
    name: 'Standing Low to High Cable Fly',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 12-15 reps',
    equipment: 'Cable Machine',
    description: 'This targets the upper chest'
  },
  {
    id: '25',
    name: 'Standing High to Low Cable Fly',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 12-15 reps',
    equipment: 'Cable Machine',
    description: 'This variation focuses on the lower chest'
  },
  {
    id: '26',
    name: 'Dumbbell Bench Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Dumbbells',
    description: 'A fundamental compound exercise for the chest'
  },
  {
    id: '27',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Dumbbells',
    description: 'This version of the bench press emphasizes the upper chest'
  },
  {
    id: '28',
    name: 'Decline Dumbbell Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Dumbbells',
    description: 'This targets the lower part of the chest'
  },
  {
    id: '29',
    name: 'Incline Dumbbell Flys',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Dumbbells',
    description: 'The incline variation puts more focus on the upper pecs'
  },
  {
    id: '30',
    name: 'Dumbbell Pullover',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Dumbbells',
    description: 'An exercise that works both the chest and the lats'
  },
  {
    id: '31',
    name: 'Close Grip Dumbbell Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Dumbbells',
    description: 'This variation places more emphasis on the inner chest'
  },
  {
    id: '32',
    name: 'Neutral Grip Dumbbell Bench Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Dumbbells',
    description: 'By keeping your palms facing each other, you can reduce shoulder strain and target the chest differently'
  },
  {
    id: '34',
    name: 'Dumbbell Twist Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Dumbbells',
    description: 'This adds a rotational component to the standard press'
  },
  {
    id: '35',
    name: 'Incline Bench Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Barbell',
    description: 'To target the upper chest'
  },
  {
    id: '36',
    name: 'Decline Bench Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Barbell',
    description: 'To focus on the lower chest'
  },
  {
    id: '39',
    name: 'Decline Push-Up',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Bodyweight',
    description: 'A more challenging variation that targets the upper chest'
  },
  {
    id: '43',
    name: 'Dips',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 8-12 reps',
    equipment: 'Dip Bar',
    description: 'A great compound exercise for the chest and triceps'
  },
  {
    id: '44',
    name: 'Smith Machine Incline Bench Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Smith Machine',
    description: 'Provides a fixed path for the barbell, which can be helpful for beginners or when training without a spotter'
  },
  {
    id: '45',
    name: 'Hammer Strength Machine Incline Bench Press',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Machine',
    description: 'A machine that mimics the incline bench press motion'
  },
  {
    id: '46',
    name: 'Medicine Ball Chest Press Partner Toss',
    muscleGroup: 'Chest',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Medicine Ball',
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
    description: 'This free-weight exercise requires you to stabilize your own torso and resist rotation, engaging your core more than a machine row'
  },
  {
    id: '55',
    name: 'Inverted Row',
    muscleGroup: 'Back',
    difficulty: 'Intermediate',
    duration: '3 sets x 8-12 reps',
    equipment: 'Bodyweight',
    description: 'A bodyweight row that requires significant core and back strength. A perfect stepping stone to eventually doing pull-ups'
  },
  {
    id: '56',
    name: 'Face Pulls',
    muscleGroup: 'Back',
    difficulty: 'Intermediate',
    duration: '3 sets x 12-15 reps',
    equipment: 'Cable Machine',
    description: 'Requires good technique to ensure you\'re targeting the upper back muscles correctly and not straining your shoulders'
  },
  {
    id: '57',
    name: 'T-Bar Rows',
    muscleGroup: 'Back',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Barbell',
    description: 'This variation of a row requires good lower back stability and proper hip hinge technique'
  },
  {
    id: '58',
    name: 'Chin-Ups',
    muscleGroup: 'Back',
    difficulty: 'Intermediate',
    duration: '3 sets x 6-10 reps',
    equipment: 'Pull-up Bar',
    description: 'The first major bodyweight vertical pull. Slightly easier than a pull-up due to greater bicep involvement'
  },
  {
    id: '59',
    name: 'Upright Row',
    muscleGroup: 'Back',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Barbell',
    description: 'Requires careful form to avoid shoulder impingement. Demands more coordination and control than simple shrugs'
  },

  // Intermediate - Legs
  {
    id: '9',
    name: 'Lunges',
    muscleGroup: 'Legs',
    difficulty: 'Intermediate',
    duration: '3 sets x 12 reps each leg',
    equipment: 'Dumbbells'
  },

  // Intermediate - Arms
  {
    id: '11',
    name: 'Tricep Dips',
    muscleGroup: 'Arms',
    difficulty: 'Intermediate',
    duration: '3 sets x 10-12 reps',
    equipment: 'Bench',
    ...media('tricep-dips-video.mp4')
  },

  // Intermediate - Shoulders
  {
    id: '13',
    name: 'Shoulder Press',
    muscleGroup: 'Shoulders',
    difficulty: 'Intermediate',
    duration: '4 sets x 8-12 reps',
    equipment: 'Dumbbells',
    ...media('shoulder-press-video.mp4'),
    description: 'A compound pressing movement that builds overall shoulder strength and mass'
  },
  {
    id: '15',
    name: 'Pike Push-ups',
    muscleGroup: 'Shoulders',
    difficulty: 'Intermediate',
    duration: '3 sets x 8-12 reps',
    equipment: 'Bodyweight',
    ...media('pike-pushups-video.mp4'),
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
    ...media('russian-twists-video.mp4'),
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
    description: 'An interesting variation to challenge your muscles in a new way'
  },
  {
    id: '37',
    name: 'Guillotine Press',
    muscleGroup: 'Chest',
    difficulty: 'Advanced',
    duration: '3 sets x 8-10 reps',
    equipment: 'Barbell',
    description: 'A variation where you lower the bar to your neck, creating a greater stretch in the pecs'
  },
  {
    id: '40',
    name: 'Clap Press-Up',
    muscleGroup: 'Chest',
    difficulty: 'Advanced',
    duration: '3 sets x 8-10 reps',
    equipment: 'Bodyweight',
    description: 'An explosive variation for power development'
  },
  {
    id: '41',
    name: 'Spiderman Press-Up',
    muscleGroup: 'Chest',
    difficulty: 'Advanced',
    duration: '3 sets x 10-12 reps',
    equipment: 'Bodyweight',
    description: 'Adds a core and hip flexor challenge'
  },
  {
    id: '47',
    name: 'Bosu Ball Push Up',
    muscleGroup: 'Chest',
    difficulty: 'Advanced',
    duration: '3 sets x 8-10 reps',
    equipment: 'Bosu Ball',
    description: 'Adds an element of instability to challenge your core and stabilizer muscles'
  },
  {
    id: '48',
    name: 'Push Up (Feet on Swiss Ball)',
    muscleGroup: 'Chest',
    difficulty: 'Advanced',
    duration: '3 sets x 8-10 reps',
    equipment: 'Swiss Ball',
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
    description: 'The quintessential test of upper body pulling strength. Using a wider, overhand grip isolates the lats more'
  },
  {
    id: '60',
    name: 'Barbell Bent Over Row',
    muscleGroup: 'Back',
    difficulty: 'Advanced',
    duration: '4 sets x 6-10 reps',
    equipment: 'Barbell',
    description: 'A major compound lift that requires immense core and lower back strength to maintain a rigid, flat back. Proper hip hinge technique is critical'
  },
  {
    id: '61',
    name: 'Good Mornings',
    muscleGroup: 'Back',
    difficulty: 'Advanced',
    duration: '3 sets x 8-10 reps',
    equipment: 'Barbell',
    description: 'A highly technical lift that directly loads the lower back. Requires excellent form and control to perform safely'
  },
  {
    id: '62',
    name: 'Deadlifts',
    muscleGroup: 'Back',
    difficulty: 'Advanced',
    duration: '4 sets x 5-8 reps',
    equipment: 'Barbell',
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
    description: 'A challenging single-leg exercise that requires balance and strength'
  }
];
