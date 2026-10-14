export interface DayPlanExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: string;
  restSeconds?: number;
}

export interface WorkoutTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Strength' | 'Hypertrophy' | 'Cardio & HIIT' | 'Mobility & Recovery' | 'Home & Calisthenics';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  equipment: string[];
  targetMuscles: string[];
  exercises: DayPlanExercise[];
  tags: string[];
  estimatedCaloriesBurned?: number;
}

export interface RoutineDay {
  dayId: string;
  dayName: string;
  title: string;
  isRest: boolean;
  targetMuscles: string[];
  exercises: DayPlanExercise[];
}

export interface RoutineProgram {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  daysPerWeek: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: 'Hypertrophy' | 'Strength' | 'Fat Loss' | 'General Fitness';
  targetAudience: string;
  schedule: string;
  days: RoutineDay[];
  tags: string[];
}

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'chest-triceps-hypertrophy',
    title: 'Chest & Triceps Hypertrophy Blast',
    description: 'High-tension horizontal press and elbow extension session engineered for chest volume and horseshoe triceps.',
    category: 'Hypertrophy',
    difficulty: 'Intermediate',
    durationMinutes: 50,
    equipment: ['Barbell', 'Dumbbells', 'Cables'],
    targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
    tags: ['Push', 'Upper Body', 'Hypertrophy', 'Mass Builder'],
    estimatedCaloriesBurned: 380,
    exercises: [
      { id: '1', name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', sets: 4, reps: '8-10 reps', restSeconds: 90 },
      { id: '52', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbells', sets: 4, reps: '10-12 reps', restSeconds: 75 },
      { id: '5', name: 'Dips', muscleGroup: 'Chest', equipment: 'Bodyweight', sets: 3, reps: '10-12 reps', restSeconds: 60 },
      { id: '53', name: 'Cable Chest Fly', muscleGroup: 'Chest', equipment: 'Cables', sets: 3, reps: '12-15 reps', restSeconds: 60 },
      { id: '15', name: 'Tricep Pushdowns', muscleGroup: 'Arms', equipment: 'Cables', sets: 4, reps: '12-15 reps', restSeconds: 60 },
      { id: '78', name: 'Skull Crushers (Lying Triceps Extension)', muscleGroup: 'Arms', equipment: 'Barbell', sets: 3, reps: '10-12 reps', restSeconds: 60 },
    ],
  },
  {
    id: 'back-biceps-density',
    title: 'Back Width & Bicep Density Specialist',
    description: 'Complete vertical and horizontal pull protocol for lats, upper back thickness, and bicep peak development.',
    category: 'Hypertrophy',
    difficulty: 'Intermediate',
    durationMinutes: 55,
    equipment: ['Barbell', 'Dumbbells', 'Cables', 'Pull-up Bar'],
    targetMuscles: ['Back', 'Biceps', 'Shoulders'],
    tags: ['Pull', 'Upper Body', 'Lats', 'Biceps'],
    estimatedCaloriesBurned: 410,
    exercises: [
      { id: '4', name: 'Pull-ups', muscleGroup: 'Back', equipment: 'Pull-up Bar', sets: 4, reps: '8-10 reps', restSeconds: 90 },
      { id: '60', name: 'Barbell Bent Over Row', muscleGroup: 'Back', equipment: 'Barbell', sets: 4, reps: '8-10 reps', restSeconds: 90 },
      { id: '59', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cables', sets: 3, reps: '10-12 reps', restSeconds: 60 },
      { id: '61', name: 'Seated Cable Row', muscleGroup: 'Back', equipment: 'Cables', sets: 3, reps: '10-12 reps', restSeconds: 60 },
      { id: '87', name: 'Face Pulls', muscleGroup: 'Shoulders', equipment: 'Cables', sets: 3, reps: '12-15 reps', restSeconds: 60 },
      { id: '74', name: 'Barbell Bicep Curl', muscleGroup: 'Arms', equipment: 'Barbell', sets: 3, reps: '10-12 reps', restSeconds: 60 },
      { id: '76', name: 'Hammer Curls', muscleGroup: 'Arms', equipment: 'Dumbbells', sets: 3, reps: '12-15 reps', restSeconds: 60 },
    ],
  },
  {
    id: 'quad-glute-destroyer',
    title: 'Quad Dominance & Glute Sculptor',
    description: 'Heavy compound knee flexion and hip extension designed to stimulate maximal lower body muscular adaptation.',
    category: 'Strength',
    difficulty: 'Advanced',
    durationMinutes: 60,
    equipment: ['Barbell', 'Machine', 'Dumbbells'],
    targetMuscles: ['Quads', 'Glutes', 'Hamstrings', 'Calves'],
    tags: ['Legs', 'Squat', 'Lower Body', 'Strength'],
    estimatedCaloriesBurned: 460,
    exercises: [
      { id: '64', name: 'Barbell Back Squat', muscleGroup: 'Legs', equipment: 'Barbell', sets: 4, reps: '6-8 reps', restSeconds: 120 },
      { id: '67', name: 'Romanian Deadlift (RDL)', muscleGroup: 'Legs', equipment: 'Barbell', sets: 4, reps: '8-10 reps', restSeconds: 90 },
      { id: '66', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', sets: 3, reps: '10-12 reps', restSeconds: 75 },
      { id: '68', name: 'Walking Dumbbell Lunges', muscleGroup: 'Legs', equipment: 'Dumbbells', sets: 3, reps: '12 reps / leg', restSeconds: 60 },
      { id: '70', name: 'Lying Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', sets: 3, reps: '12-15 reps', restSeconds: 60 },
      { id: '71', name: 'Standing Calf Raise', muscleGroup: 'Legs', equipment: 'Machine', sets: 4, reps: '12-15 reps', restSeconds: 60 },
    ],
  },
  {
    id: 'full-body-barbell-anchor',
    title: 'Full-Body Barbell Anchor (Strength Base)',
    description: 'Three big compound lifts accompanied by essential accessory movements for total body structural integrity.',
    category: 'Strength',
    difficulty: 'Intermediate',
    durationMinutes: 50,
    equipment: ['Barbell', 'Bodyweight'],
    targetMuscles: ['Chest', 'Back', 'Quads', 'Hamstrings', 'Core'],
    tags: ['Full Body', 'Barbell', 'Powerbuilding', 'Strength'],
    estimatedCaloriesBurned: 420,
    exercises: [
      { id: '64', name: 'Barbell Back Squat', muscleGroup: 'Legs', equipment: 'Barbell', sets: 3, reps: '5-6 reps', restSeconds: 120 },
      { id: '1', name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', sets: 3, reps: '5-6 reps', restSeconds: 120 },
      { id: '60', name: 'Barbell Bent Over Row', muscleGroup: 'Back', equipment: 'Barbell', sets: 3, reps: '6-8 reps', restSeconds: 90 },
      { id: '85', name: 'Barbell Overhead Press (OHP)', muscleGroup: 'Shoulders', equipment: 'Barbell', sets: 3, reps: '6-8 reps', restSeconds: 90 },
      { id: '8', name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight', sets: 3, reps: '60 sec hold', restSeconds: 60 },
    ],
  },
  {
    id: 'home-calisthenics-bodyweight',
    title: 'Zero-Equipment Calisthenics Burn',
    description: 'Pure bodyweight gymnastics conditioning utilizing push-up variations, lunges, and hollow body holds.',
    category: 'Home & Calisthenics',
    difficulty: 'Beginner',
    durationMinutes: 35,
    equipment: ['Bodyweight'],
    targetMuscles: ['Chest', 'Shoulders', 'Quads', 'Glutes', 'Core'],
    tags: ['Home', 'No Equipment', 'Calisthenics', 'Fat Burn'],
    estimatedCaloriesBurned: 290,
    exercises: [
      { id: '2', name: 'Push-ups', muscleGroup: 'Chest', equipment: 'Bodyweight', sets: 4, reps: '12-15 reps', restSeconds: 60 },
      { id: '3', name: 'Bodyweight Squats', muscleGroup: 'Legs', equipment: 'Bodyweight', sets: 4, reps: '20 reps', restSeconds: 60 },
      { id: '5', name: 'Dips', muscleGroup: 'Chest', equipment: 'Bodyweight', sets: 3, reps: '10-12 reps', restSeconds: 60 },
      { id: '8', name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight', sets: 3, reps: '60 sec', restSeconds: 45 },
      { id: '90', name: 'Hanging Leg Raise', muscleGroup: 'Core', equipment: 'Pull-up Bar', sets: 3, reps: '12 reps', restSeconds: 60 },
    ],
  },
  {
    id: 'shoulder-boulder-deltoid',
    title: '3D Deltoid Boulder Shoulder Session',
    description: 'Direct overhead pressing paired with lateral and posterior deltoid isolations for full 3D shoulder capping.',
    category: 'Hypertrophy',
    difficulty: 'Intermediate',
    durationMinutes: 45,
    equipment: ['Barbell', 'Dumbbells', 'Cables'],
    targetMuscles: ['Shoulders', 'Traps', 'Triceps'],
    tags: ['Shoulders', 'Delts', 'V-Taper', 'Hypertrophy'],
    estimatedCaloriesBurned: 340,
    exercises: [
      { id: '85', name: 'Barbell Overhead Press (OHP)', muscleGroup: 'Shoulders', equipment: 'Barbell', sets: 4, reps: '6-8 reps', restSeconds: 90 },
      { id: '13', name: 'Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Dumbbells', sets: 3, reps: '10-12 reps', restSeconds: 75 },
      { id: '14', name: 'Lateral Raises', muscleGroup: 'Shoulders', equipment: 'Dumbbells', sets: 4, reps: '12-15 reps', restSeconds: 60 },
      { id: '87', name: 'Face Pulls', muscleGroup: 'Shoulders', equipment: 'Cables', sets: 4, reps: '15-20 reps', restSeconds: 60 },
      { id: '88', name: 'Barbell Shrugs', muscleGroup: 'Shoulders', equipment: 'Barbell', sets: 3, reps: '12-15 reps', restSeconds: 60 },
    ],
  },
  {
    id: 'dumbbell-home-sculpt',
    title: 'Dumbbell-Only Upper Body Sculpt',
    description: 'Versatile home and apartment-friendly dumbbell workout that targets all major upper body muscle groups.',
    category: 'Home & Calisthenics',
    difficulty: 'Beginner',
    durationMinutes: 40,
    equipment: ['Dumbbells'],
    targetMuscles: ['Chest', 'Back', 'Shoulders', 'Arms'],
    tags: ['Dumbbells', 'Home Gym', 'Upper Body', 'Efficiency'],
    estimatedCaloriesBurned: 320,
    exercises: [
      { id: '52', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbells', sets: 4, reps: '10-12 reps', restSeconds: 60 },
      { id: '58', name: 'One-Arm Dumbbell Row', muscleGroup: 'Back', equipment: 'Dumbbells', sets: 4, reps: '10-12 reps / arm', restSeconds: 60 },
      { id: '13', name: 'Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Dumbbells', sets: 3, reps: '10-12 reps', restSeconds: 60 },
      { id: '14', name: 'Lateral Raises', muscleGroup: 'Shoulders', equipment: 'Dumbbells', sets: 3, reps: '12-15 reps', restSeconds: 45 },
      { id: '75', name: 'Incline Dumbbell Curl', muscleGroup: 'Arms', equipment: 'Dumbbells', sets: 3, reps: '10-12 reps', restSeconds: 45 },
      { id: '79', name: 'Overhead Dumbbell Tricep Extension', muscleGroup: 'Arms', equipment: 'Dumbbells', sets: 3, reps: '12 reps', restSeconds: 45 },
    ],
  },
  {
    id: 'hiit-metabolic-athletic',
    title: 'High-Velocity HIIT & Core Conditioning',
    description: 'Interval-based functional conditioning designed to maximize post-exercise oxygen consumption (EPOC).',
    category: 'Cardio & HIIT',
    difficulty: 'Intermediate',
    durationMinutes: 28,
    equipment: ['Bodyweight', 'Kettlebells'],
    targetMuscles: ['Quads', 'Hamstrings', 'Glutes', 'Core', 'Cardiovascular'],
    tags: ['HIIT', 'Conditioning', 'Cardio', 'Fat Loss'],
    estimatedCaloriesBurned: 350,
    exercises: [
      { id: '3', name: 'Bodyweight Squats', muscleGroup: 'Legs', equipment: 'Bodyweight', sets: 4, reps: '25 reps', restSeconds: 30 },
      { id: '2', name: 'Push-ups', muscleGroup: 'Chest', equipment: 'Bodyweight', sets: 4, reps: '15 reps', restSeconds: 30 },
      { id: '72', name: 'Kettlebell Swing', muscleGroup: 'Legs', equipment: 'Kettlebells', sets: 4, reps: '20 reps', restSeconds: 45 },
      { id: '91', name: 'Cable Crunch', muscleGroup: 'Core', equipment: 'Cables', sets: 3, reps: '15 reps', restSeconds: 30 },
      { id: '8', name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight', sets: 3, reps: '45 sec hold', restSeconds: 30 },
    ],
  },
];

export const ROUTINE_PROGRAMS: RoutineProgram[] = [
  {
    id: 'ppl-6day-classic',
    title: 'Push / Pull / Legs (PPL) 6-Day Hypertrophy',
    subtitle: 'The gold-standard training split for maximal muscular development',
    description: 'Each muscle group is stimulated twice per 7-day microcycle with optimal recovery spacing. Features alternating strength (Day A) and hypertrophy (Day B) focuses.',
    daysPerWeek: 6,
    level: 'Intermediate',
    goal: 'Hypertrophy',
    targetAudience: 'Lifters with 6+ months experience who can commit to 6 gym days per week.',
    schedule: 'Mon (Push A) / Tue (Pull A) / Wed (Legs A) / Thu (Push B) / Fri (Pull B) / Sat (Legs B) / Sun (Rest)',
    tags: ['PPL', 'Hypertrophy', '6-Day Split', 'High Frequency'],
    days: [
      {
        dayId: 'mon',
        dayName: 'Monday',
        title: 'Push Day A (Chest & Triceps Focus)',
        isRest: false,
        targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
        exercises: [
          { id: '1', name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', sets: 4, reps: '6-8 reps' },
          { id: '52', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbells', sets: 3, reps: '8-10 reps' },
          { id: '5', name: 'Dips', muscleGroup: 'Chest', equipment: 'Bodyweight', sets: 3, reps: '10-12 reps' },
          { id: '14', name: 'Lateral Raises', muscleGroup: 'Shoulders', equipment: 'Dumbbells', sets: 4, reps: '12-15 reps' },
          { id: '15', name: 'Tricep Pushdowns', muscleGroup: 'Arms', equipment: 'Cables', sets: 3, reps: '12-15 reps' },
        ],
      },
      {
        dayId: 'tue',
        dayName: 'Tuesday',
        title: 'Pull Day A (Back, Lats & Biceps)',
        isRest: false,
        targetMuscles: ['Back', 'Biceps', 'Rear Delts'],
        exercises: [
          { id: '4', name: 'Pull-ups', muscleGroup: 'Back', equipment: 'Pull-up Bar', sets: 4, reps: '6-10 reps' },
          { id: '60', name: 'Barbell Bent Over Row', muscleGroup: 'Back', equipment: 'Barbell', sets: 4, reps: '8-10 reps' },
          { id: '87', name: 'Face Pulls', muscleGroup: 'Shoulders', equipment: 'Cables', sets: 3, reps: '12-15 reps' },
          { id: '74', name: 'Barbell Bicep Curl', muscleGroup: 'Arms', equipment: 'Barbell', sets: 3, reps: '8-10 reps' },
          { id: '75', name: 'Incline Dumbbell Curl', muscleGroup: 'Arms', equipment: 'Dumbbells', sets: 3, reps: '10-12 reps' },
        ],
      },
      {
        dayId: 'wed',
        dayName: 'Wednesday',
        title: 'Legs & Core A (Quads & Glutes Focus)',
        isRest: false,
        targetMuscles: ['Quads', 'Glutes', 'Hamstrings', 'Core'],
        exercises: [
          { id: '64', name: 'Barbell Back Squat', muscleGroup: 'Legs', equipment: 'Barbell', sets: 4, reps: '6-8 reps' },
          { id: '67', name: 'Romanian Deadlift (RDL)', muscleGroup: 'Legs', equipment: 'Barbell', sets: 3, reps: '8-10 reps' },
          { id: '66', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', sets: 3, reps: '10-12 reps' },
          { id: '71', name: 'Standing Calf Raise', muscleGroup: 'Legs', equipment: 'Machine', sets: 4, reps: '12-15 reps' },
          { id: '91', name: 'Cable Crunch', muscleGroup: 'Core', equipment: 'Cables', sets: 3, reps: '12-15 reps' },
        ],
      },
      {
        dayId: 'thu',
        dayName: 'Thursday',
        title: 'Push Day B (Shoulders & Triceps Focus)',
        isRest: false,
        targetMuscles: ['Shoulders', 'Chest', 'Triceps'],
        exercises: [
          { id: '13', name: 'Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Dumbbells', sets: 4, reps: '8-10 reps' },
          { id: '5', name: 'Dips', muscleGroup: 'Chest', equipment: 'Bodyweight', sets: 3, reps: '8-12 reps' },
          { id: '80', name: 'Close-Grip Bench Press', muscleGroup: 'Arms', equipment: 'Barbell', sets: 3, reps: '8-10 reps' },
          { id: '14', name: 'Lateral Raises', muscleGroup: 'Shoulders', equipment: 'Dumbbells', sets: 4, reps: '12-15 reps' },
          { id: '78', name: 'Skull Crushers (Lying Triceps Extension)', muscleGroup: 'Arms', equipment: 'Barbell', sets: 3, reps: '10-12 reps' },
        ],
      },
      {
        dayId: 'fri',
        dayName: 'Friday',
        title: 'Pull Day B (Upper Back & Traps Focus)',
        isRest: false,
        targetMuscles: ['Back', 'Traps', 'Biceps'],
        exercises: [
          { id: '59', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cables', sets: 4, reps: '10-12 reps' },
          { id: '61', name: 'Seated Cable Row', muscleGroup: 'Back', equipment: 'Cables', sets: 4, reps: '10-12 reps' },
          { id: '58', name: 'One-Arm Dumbbell Row', muscleGroup: 'Back', equipment: 'Dumbbells', sets: 3, reps: '10-12 reps' },
          { id: '76', name: 'Hammer Curls', muscleGroup: 'Arms', equipment: 'Dumbbells', sets: 3, reps: '10-12 reps' },
          { id: '77', name: 'Preacher Curl', muscleGroup: 'Arms', equipment: 'Barbell', sets: 3, reps: '12-15 reps' },
        ],
      },
      {
        dayId: 'sat',
        dayName: 'Saturday',
        title: 'Legs & Core B (Posterior Chain & Hamstrings)',
        isRest: false,
        targetMuscles: ['Hamstrings', 'Glutes', 'Calves', 'Core'],
        exercises: [
          { id: '67', name: 'Romanian Deadlift (RDL)', muscleGroup: 'Legs', equipment: 'Barbell', sets: 4, reps: '8-10 reps' },
          { id: '68', name: 'Walking Dumbbell Lunges', muscleGroup: 'Legs', equipment: 'Dumbbells', sets: 3, reps: '12 reps / leg' },
          { id: '70', name: 'Lying Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', sets: 3, reps: '12-15 reps' },
          { id: '71', name: 'Standing Calf Raise', muscleGroup: 'Legs', equipment: 'Machine', sets: 4, reps: '15 reps' },
          { id: '90', name: 'Hanging Leg Raise', muscleGroup: 'Core', equipment: 'Pull-up Bar', sets: 3, reps: '12-15 reps' },
        ],
      },
      {
        dayId: 'sun',
        dayName: 'Sunday',
        title: 'Active Rest & Recovery',
        isRest: true,
        targetMuscles: [],
        exercises: [],
      },
    ],
  },
  {
    id: 'upper-lower-4day',
    title: 'Upper / Lower 4-Day Strength & Size',
    subtitle: 'The optimal balance between heavy overload and recovery',
    description: 'Four training days per week structured around two upper body and two lower body sessions. Ideal for busy athletes and intermediate lifters looking for steady progressive overload.',
    daysPerWeek: 4,
    level: 'Intermediate',
    goal: 'Strength',
    targetAudience: 'Working professionals, students, and lifters balancing training with recovery.',
    schedule: 'Mon (Upper A) / Tue (Lower A) / Wed (Rest) / Thu (Upper B) / Fri (Lower B) / Sat (Rest) / Sun (Rest)',
    tags: ['Upper Lower', 'Strength', '4-Day Split', 'Balanced'],
    days: [
      {
        dayId: 'mon',
        dayName: 'Monday',
        title: 'Upper Body Power A',
        isRest: false,
        targetMuscles: ['Chest', 'Back', 'Shoulders', 'Arms'],
        exercises: [
          { id: '1', name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', sets: 4, reps: '5-6 reps' },
          { id: '60', name: 'Barbell Bent Over Row', muscleGroup: 'Back', equipment: 'Barbell', sets: 4, reps: '6-8 reps' },
          { id: '85', name: 'Barbell Overhead Press (OHP)', muscleGroup: 'Shoulders', equipment: 'Barbell', sets: 3, reps: '6-8 reps' },
          { id: '4', name: 'Pull-ups', muscleGroup: 'Back', equipment: 'Pull-up Bar', sets: 3, reps: '8-10 reps' },
          { id: '15', name: 'Tricep Pushdowns', muscleGroup: 'Arms', equipment: 'Cables', sets: 3, reps: '10-12 reps' },
          { id: '74', name: 'Barbell Bicep Curl', muscleGroup: 'Arms', equipment: 'Barbell', sets: 3, reps: '10-12 reps' },
        ],
      },
      {
        dayId: 'tue',
        dayName: 'Tuesday',
        title: 'Lower Body Power A',
        isRest: false,
        targetMuscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
        exercises: [
          { id: '64', name: 'Barbell Back Squat', muscleGroup: 'Legs', equipment: 'Barbell', sets: 4, reps: '5-6 reps' },
          { id: '67', name: 'Romanian Deadlift (RDL)', muscleGroup: 'Legs', equipment: 'Barbell', sets: 3, reps: '8-10 reps' },
          { id: '66', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', sets: 3, reps: '10-12 reps' },
          { id: '71', name: 'Standing Calf Raise', muscleGroup: 'Legs', equipment: 'Machine', sets: 4, reps: '10-12 reps' },
          { id: '8', name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight', sets: 3, reps: '60 sec hold' },
        ],
      },
      {
        dayId: 'wed',
        dayName: 'Wednesday',
        title: 'Mid-Week Rest & Mobility',
        isRest: true,
        targetMuscles: [],
        exercises: [],
      },
      {
        dayId: 'thu',
        dayName: 'Thursday',
        title: 'Upper Body Hypertrophy B',
        isRest: false,
        targetMuscles: ['Chest', 'Back', 'Shoulders', 'Arms'],
        exercises: [
          { id: '52', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbells', sets: 4, reps: '8-10 reps' },
          { id: '59', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cables', sets: 4, reps: '10-12 reps' },
          { id: '14', name: 'Lateral Raises', muscleGroup: 'Shoulders', equipment: 'Dumbbells', sets: 4, reps: '12-15 reps' },
          { id: '53', name: 'Cable Chest Fly', muscleGroup: 'Chest', equipment: 'Cables', sets: 3, reps: '12-15 reps' },
          { id: '76', name: 'Hammer Curls', muscleGroup: 'Arms', equipment: 'Dumbbells', sets: 3, reps: '10-12 reps' },
          { id: '78', name: 'Skull Crushers (Lying Triceps Extension)', muscleGroup: 'Arms', equipment: 'Barbell', sets: 3, reps: '10-12 reps' },
        ],
      },
      {
        dayId: 'fri',
        dayName: 'Friday',
        title: 'Lower Body Hypertrophy B',
        isRest: false,
        targetMuscles: ['Hamstrings', 'Quads', 'Glutes', 'Calves'],
        exercises: [
          { id: '68', name: 'Walking Dumbbell Lunges', muscleGroup: 'Legs', equipment: 'Dumbbells', sets: 3, reps: '10 reps / leg' },
          { id: '70', name: 'Lying Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', sets: 4, reps: '10-12 reps' },
          { id: '69', name: 'Leg Extension', muscleGroup: 'Legs', equipment: 'Machine', sets: 3, reps: '12-15 reps' },
          { id: '71', name: 'Standing Calf Raise', muscleGroup: 'Legs', equipment: 'Machine', sets: 4, reps: '15 reps' },
          { id: '90', name: 'Hanging Leg Raise', muscleGroup: 'Core', equipment: 'Pull-up Bar', sets: 3, reps: '12 reps' },
        ],
      },
      {
        dayId: 'sat',
        dayName: 'Saturday',
        title: 'Weekend Rest & Recovery',
        isRest: true,
        targetMuscles: [],
        exercises: [],
      },
      {
        dayId: 'sun',
        dayName: 'Sunday',
        title: 'Active Mobility & Recharge',
        isRest: true,
        targetMuscles: [],
        exercises: [],
      },
    ],
  },
  {
    id: 'full-body-3day',
    title: 'Full Body 3-Day Foundation',
    subtitle: 'High-frequency total body training for beginners and busy schedules',
    description: 'Three alternating full body workouts per week. Trains all major movement patterns (squat, hinge, push, pull) in every workout with 48 hours of recovery in between.',
    daysPerWeek: 3,
    level: 'Beginner',
    goal: 'General Fitness',
    targetAudience: 'Beginners, busy parents, and multi-sport athletes requiring maximum time-efficiency.',
    schedule: 'Mon (Full Body A) / Tue (Rest) / Wed (Full Body B) / Thu (Rest) / Fri (Full Body C) / Sat (Rest) / Sun (Rest)',
    tags: ['Full Body', '3-Day Split', 'Beginner Friendly', 'Time Efficient'],
    days: [
      {
        dayId: 'mon',
        dayName: 'Monday',
        title: 'Full Body A (Squat & Press Focus)',
        isRest: false,
        targetMuscles: ['Quads', 'Chest', 'Back', 'Core'],
        exercises: [
          { id: '64', name: 'Barbell Back Squat', muscleGroup: 'Legs', equipment: 'Barbell', sets: 3, reps: '8-10 reps' },
          { id: '1', name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', sets: 3, reps: '8-10 reps' },
          { id: '61', name: 'Seated Cable Row', muscleGroup: 'Back', equipment: 'Cables', sets: 3, reps: '10-12 reps' },
          { id: '8', name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight', sets: 3, reps: '45-60 sec' },
        ],
      },
      {
        dayId: 'tue',
        dayName: 'Tuesday',
        title: 'Rest Day',
        isRest: true,
        targetMuscles: [],
        exercises: [],
      },
      {
        dayId: 'wed',
        dayName: 'Wednesday',
        title: 'Full Body B (Hinge & Overhead Focus)',
        isRest: false,
        targetMuscles: ['Hamstrings', 'Shoulders', 'Back', 'Arms'],
        exercises: [
          { id: '67', name: 'Romanian Deadlift (RDL)', muscleGroup: 'Legs', equipment: 'Barbell', sets: 3, reps: '8-10 reps' },
          { id: '85', name: 'Barbell Overhead Press (OHP)', muscleGroup: 'Shoulders', equipment: 'Barbell', sets: 3, reps: '8-10 reps' },
          { id: '59', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cables', sets: 3, reps: '10-12 reps' },
          { id: '74', name: 'Barbell Bicep Curl', muscleGroup: 'Arms', equipment: 'Barbell', sets: 3, reps: '10-12 reps' },
        ],
      },
      {
        dayId: 'thu',
        dayName: 'Thursday',
        title: 'Rest Day',
        isRest: true,
        targetMuscles: [],
        exercises: [],
      },
      {
        dayId: 'fri',
        dayName: 'Friday',
        title: 'Full Body C (Lunge & Dumbbell Focus)',
        isRest: false,
        targetMuscles: ['Quads', 'Glutes', 'Chest', 'Arms'],
        exercises: [
          { id: '68', name: 'Walking Dumbbell Lunges', muscleGroup: 'Legs', equipment: 'Dumbbells', sets: 3, reps: '10 reps / leg' },
          { id: '52', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbells', sets: 3, reps: '10-12 reps' },
          { id: '58', name: 'One-Arm Dumbbell Row', muscleGroup: 'Back', equipment: 'Dumbbells', sets: 3, reps: '10-12 reps / arm' },
          { id: '15', name: 'Tricep Pushdowns', muscleGroup: 'Arms', equipment: 'Cables', sets: 3, reps: '12 reps' },
        ],
      },
      {
        dayId: 'sat',
        dayName: 'Saturday',
        title: 'Weekend Rest',
        isRest: true,
        targetMuscles: [],
        exercises: [],
      },
      {
        dayId: 'sun',
        dayName: 'Sunday',
        title: 'Weekly Recovery & Walk',
        isRest: true,
        targetMuscles: [],
        exercises: [],
      },
    ],
  },
  {
    id: 'bro-split-5day',
    title: '5-Day Bodybuilder Body-Part Split',
    subtitle: 'Classic single-muscle specialization with high pump volume',
    description: 'Dedicates an entire session to a single muscle group per day. High isolation volume, complete exhaustion of individual muscles, and 7 days between sessions for recovery.',
    daysPerWeek: 5,
    level: 'Advanced',
    goal: 'Hypertrophy',
    targetAudience: 'Experienced bodybuilders who prefer high single-session volume and pump-focused isolation work.',
    schedule: 'Mon (Chest) / Tue (Back) / Wed (Shoulders) / Thu (Legs) / Fri (Arms) / Sat (Rest) / Sun (Rest)',
    tags: ['Bro Split', 'Bodybuilding', '5-Day Split', 'Pump'],
    days: [
      {
        dayId: 'mon',
        dayName: 'Monday',
        title: 'Chest Annihilation',
        isRest: false,
        targetMuscles: ['Chest'],
        exercises: [
          { id: '1', name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', sets: 4, reps: '8-10 reps' },
          { id: '52', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbells', sets: 4, reps: '10-12 reps' },
          { id: '5', name: 'Dips', muscleGroup: 'Chest', equipment: 'Bodyweight', sets: 3, reps: '10-12 reps' },
          { id: '53', name: 'Cable Chest Fly', muscleGroup: 'Chest', equipment: 'Cables', sets: 4, reps: '12-15 reps' },
        ],
      },
      {
        dayId: 'tue',
        dayName: 'Tuesday',
        title: 'Back Thickness & Wings',
        isRest: false,
        targetMuscles: ['Back'],
        exercises: [
          { id: '4', name: 'Pull-ups', muscleGroup: 'Back', equipment: 'Pull-up Bar', sets: 4, reps: '8-10 reps' },
          { id: '60', name: 'Barbell Bent Over Row', muscleGroup: 'Back', equipment: 'Barbell', sets: 4, reps: '8-10 reps' },
          { id: '59', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cables', sets: 4, reps: '10-12 reps' },
          { id: '61', name: 'Seated Cable Row', muscleGroup: 'Back', equipment: 'Cables', sets: 3, reps: '12 reps' },
        ],
      },
      {
        dayId: 'wed',
        dayName: 'Wednesday',
        title: 'Shoulders & Traps 3D',
        isRest: false,
        targetMuscles: ['Shoulders', 'Traps'],
        exercises: [
          { id: '85', name: 'Barbell Overhead Press (OHP)', muscleGroup: 'Shoulders', equipment: 'Barbell', sets: 4, reps: '6-8 reps' },
          { id: '14', name: 'Lateral Raises', muscleGroup: 'Shoulders', equipment: 'Dumbbells', sets: 5, reps: '12-15 reps' },
          { id: '87', name: 'Face Pulls', muscleGroup: 'Shoulders', equipment: 'Cables', sets: 4, reps: '15-20 reps' },
          { id: '88', name: 'Barbell Shrugs', muscleGroup: 'Shoulders', equipment: 'Barbell', sets: 4, reps: '12-15 reps' },
        ],
      },
      {
        dayId: 'thu',
        dayName: 'Thursday',
        title: 'Legs & Calves Gauntlet',
        isRest: false,
        targetMuscles: ['Quads', 'Hamstrings', 'Calves'],
        exercises: [
          { id: '64', name: 'Barbell Back Squat', muscleGroup: 'Legs', equipment: 'Barbell', sets: 4, reps: '8 reps' },
          { id: '66', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', sets: 4, reps: '10-12 reps' },
          { id: '67', name: 'Romanian Deadlift (RDL)', muscleGroup: 'Legs', equipment: 'Barbell', sets: 4, reps: '8-10 reps' },
          { id: '71', name: 'Standing Calf Raise', muscleGroup: 'Legs', equipment: 'Machine', sets: 4, reps: '15 reps' },
        ],
      },
      {
        dayId: 'fri',
        dayName: 'Friday',
        title: 'Arms Super-Pump (Biceps & Triceps)',
        isRest: false,
        targetMuscles: ['Biceps', 'Triceps'],
        exercises: [
          { id: '80', name: 'Close-Grip Bench Press', muscleGroup: 'Arms', equipment: 'Barbell', sets: 4, reps: '8-10 reps' },
          { id: '74', name: 'Barbell Bicep Curl', muscleGroup: 'Arms', equipment: 'Barbell', sets: 4, reps: '8-10 reps' },
          { id: '15', name: 'Tricep Pushdowns', muscleGroup: 'Arms', equipment: 'Cables', sets: 4, reps: '12-15 reps' },
          { id: '76', name: 'Hammer Curls', muscleGroup: 'Arms', equipment: 'Dumbbells', sets: 4, reps: '10-12 reps' },
        ],
      },
      {
        dayId: 'sat',
        dayName: 'Saturday',
        title: 'Rest & Nutrient Partitioning',
        isRest: true,
        targetMuscles: [],
        exercises: [],
      },
      {
        dayId: 'sun',
        dayName: 'Sunday',
        title: 'Deep Tissue & CNS Recovery',
        isRest: true,
        targetMuscles: [],
        exercises: [],
      },
    ],
  },
];
