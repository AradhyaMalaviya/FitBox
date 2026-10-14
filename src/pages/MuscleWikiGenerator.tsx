import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { exercises, type Exercise } from '@/data/exercises';
import { useWorkout } from '@/contexts/WorkoutContext';
import { workoutRoutineService } from '@/lib/services/workoutRoutineService';
import { type WorkoutTemplate } from '@/data/workoutTemplates';
import { useToast } from '@/hooks/use-toast';
import {
  Dumbbell,
  Sparkles,
  Play,
  RotateCcw,
  Check,
  Clock,
  Target,
  Layers,
  ChevronRight,
  Flame,
  ArrowRight,
  Sliders,
  Calendar,
  BarChart3,
  Plus,
  Trash2,
  Minus,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  ArrowUp,
  ArrowDown,
  Save,
  Wrench,
} from 'lucide-react';

const MUSCLE_OPTIONS = [
  { id: 'Chest', label: 'Chest', category: 'Upper', icon: '🏋️' },
  { id: 'Back', label: 'Back & Lats', category: 'Upper', icon: '🚣' },
  { id: 'Shoulders', label: 'Shoulders', category: 'Upper', icon: '💪' },
  { id: 'Arms', label: 'Arms (Biceps & Triceps)', category: 'Upper', icon: '💥' },
  { id: 'Legs', label: 'Legs & Quads', category: 'Lower', icon: '🦵' },
  { id: 'Glutes', label: 'Glutes & Hamstrings', category: 'Lower', icon: '🍑' },
  { id: 'Core', label: 'Core & Abs', category: 'Core', icon: '⚡' },
];

const EQUIPMENT_PRESETS = [
  {
    id: 'full_gym',
    name: 'Full Commercial Gym',
    description: 'Barbells, Dumbbells, Machines, Cables, and Bodyweight',
    items: ['Barbell', 'Dumbbells', 'Machine', 'Cable', 'Cables', 'Cable Machine', 'Bodyweight', 'Bench', 'Pull-up Bar'],
  },
  {
    id: 'home_dumbbells',
    name: 'Dumbbells Only (Home Gym)',
    description: 'Only Dumbbells, Bench and Bodyweight exercises',
    items: ['Dumbbells', 'Bodyweight', 'Bench'],
  },
  {
    id: 'bodyweight_calisthenics',
    name: 'Calisthenics / Bodyweight',
    description: 'Zero weights required, pure bodyweight movements',
    items: ['Bodyweight', 'Pull-up Bar'],
  },
];

const TRAINING_GOALS = [
  {
    id: 'hypertrophy',
    name: 'Hypertrophy (Muscle Size)',
    sets: '3-4 sets',
    reps: '8-12 reps',
    rest: '90s rest',
    badge: 'Popular',
  },
  {
    id: 'strength',
    name: 'Strength & Power',
    sets: '4-5 sets',
    reps: '4-6 reps',
    rest: '2-3 min rest',
    badge: 'Heavy',
  },
  {
    id: 'endurance',
    name: 'Endurance & Tone',
    sets: '3 sets',
    reps: '15-20 reps',
    rest: '45-60s rest',
    badge: 'High Pace',
  },
];

export interface ScheduledExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: string;
}

export interface DayPlan {
  dayId: string;
  dayName: string;
  isRest: boolean;
  title: string;
  exercises: ScheduledExercise[];
}

export interface SplitTemplate {
  id: string;
  name: string;
  description: string;
  frequency: string;
  days: DayPlan[];
}

// ─────────────────────────────────────────────────────────────
// PRESET SPLIT TEMPLATES
// ─────────────────────────────────────────────────────────────
const SPLIT_TEMPLATES: SplitTemplate[] = [
  {
    id: 'ppl_6day',
    name: 'Push / Pull / Legs (PPL - 6 Days)',
    description: 'The premier hypertrophy frequency hitting each major muscle group 2x weekly with optimal recovery.',
    frequency: '6 Days / Week',
    days: [
      {
        dayId: 'mon',
        dayName: 'Monday',
        isRest: false,
        title: 'Push Day A (Chest, Shoulders & Triceps)',
        exercises: [
          { id: '2', name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', sets: 4, reps: '6-8 reps' },
          { id: '84', name: 'Overhead Barbell Press', muscleGroup: 'Shoulders', equipment: 'Barbell', sets: 3, reps: '8-10 reps' },
          { id: '21', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbells', sets: 3, reps: '10-12 reps' },
          { id: '86', name: 'Cable Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Cables', sets: 4, reps: '12-15 reps' },
          { id: '77', name: 'Cable Tricep Pushdown', muscleGroup: 'Arms', equipment: 'Cables', sets: 3, reps: '12-15 reps' },
        ],
      },
      {
        dayId: 'tue',
        dayName: 'Tuesday',
        isRest: false,
        title: 'Pull Day A (Back, Rear Delts & Biceps)',
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
        isRest: false,
        title: 'Legs & Core A (Quads & Glutes Focus)',
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
        isRest: false,
        title: 'Push Day B (Shoulders & Triceps Focus)',
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
        isRest: false,
        title: 'Pull Day B (Deadlift & Lat Focus)',
        exercises: [
          { id: '62', name: 'Deadlifts', muscleGroup: 'Back', equipment: 'Barbell', sets: 4, reps: '5-6 reps' },
          { id: '25', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Machine', sets: 3, reps: '10-12 reps' },
          { id: '88', name: 'Rear Delt Dumbbell Fly', muscleGroup: 'Shoulders', equipment: 'Dumbbells', sets: 3, reps: '12-15 reps' },
          { id: '76', name: 'Preacher Curl', muscleGroup: 'Arms', equipment: 'Barbell', sets: 3, reps: '10-12 reps' },
          { id: '12', name: 'Hammer Curls', muscleGroup: 'Arms', equipment: 'Dumbbells', sets: 3, reps: '10-12 reps' },
        ],
      },
      {
        dayId: 'sat',
        dayName: 'Saturday',
        isRest: false,
        title: 'Legs & Core B (Posterior Chain & Calves)',
        exercises: [
          { id: '65', name: 'Barbell Front Squat', muscleGroup: 'Legs', equipment: 'Barbell', sets: 3, reps: '6-8 reps' },
          { id: '70', name: 'Barbell Hip Thrust', muscleGroup: 'Legs', equipment: 'Barbell', sets: 4, reps: '8-12 reps' },
          { id: '68', name: 'Lying Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', sets: 3, reps: '10-12 reps' },
          { id: '72', name: 'Seated Calf Raise', muscleGroup: 'Legs', equipment: 'Machine', sets: 3, reps: '15-20 reps' },
          { id: '92', name: 'Hanging Leg Raise', muscleGroup: 'Core', equipment: 'Pull-up Bar', sets: 3, reps: '10-12 reps' },
        ],
      },
      {
        dayId: 'sun',
        dayName: 'Sunday',
        isRest: true,
        title: 'Rest & Active Recovery',
        exercises: [],
      },
    ],
  },
  {
    id: 'upper_lower_4day',
    name: 'Upper / Lower (4 Days)',
    description: 'Perfect balance of strength and hypertrophy. Ideal for busy lifters seeking maximum stimulus with 3 rest days.',
    frequency: '4 Days / Week',
    days: [
      {
        dayId: 'mon',
        dayName: 'Monday',
        isRest: false,
        title: 'Upper Body Power',
        exercises: [
          { id: '2', name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', sets: 4, reps: '5-8 reps' },
          { id: '60', name: 'Barbell Bent Over Row', muscleGroup: 'Back', equipment: 'Barbell', sets: 4, reps: '6-8 reps' },
          { id: '84', name: 'Overhead Barbell Press', muscleGroup: 'Shoulders', equipment: 'Barbell', sets: 3, reps: '6-8 reps' },
          { id: '4', name: 'Pull-ups', muscleGroup: 'Back', equipment: 'Pull-up Bar', sets: 3, reps: '8-10 reps' },
          { id: '74', name: 'Barbell Bicep Curl', muscleGroup: 'Arms', equipment: 'Barbell', sets: 3, reps: '8-10 reps' },
          { id: '77', name: 'Cable Tricep Pushdown', muscleGroup: 'Arms', equipment: 'Cables', sets: 3, reps: '10-12 reps' },
        ],
      },
      {
        dayId: 'tue',
        dayName: 'Tuesday',
        isRest: false,
        title: 'Lower Body Strength',
        exercises: [
          { id: '64', name: 'Barbell Back Squat', muscleGroup: 'Legs', equipment: 'Barbell', sets: 4, reps: '6-8 reps' },
          { id: '67', name: 'Romanian Deadlift (RDL)', muscleGroup: 'Legs', equipment: 'Barbell', sets: 3, reps: '8-10 reps' },
          { id: '66', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', sets: 3, reps: '10-12 reps' },
          { id: '71', name: 'Standing Calf Raise', muscleGroup: 'Legs', equipment: 'Machine', sets: 4, reps: '12-15 reps' },
          { id: '91', name: 'Cable Crunch', muscleGroup: 'Core', equipment: 'Cables', sets: 3, reps: '12-15 reps' },
        ],
      },
      {
        dayId: 'wed',
        dayName: 'Wednesday',
        isRest: true,
        title: 'Rest & Mobility',
        exercises: [],
      },
      {
        dayId: 'thu',
        dayName: 'Thursday',
        isRest: false,
        title: 'Upper Body Hypertrophy',
        exercises: [
          { id: '21', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbells', sets: 3, reps: '8-12 reps' },
          { id: '25', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Machine', sets: 3, reps: '10-12 reps' },
          { id: '86', name: 'Cable Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Cables', sets: 4, reps: '12-15 reps' },
          { id: '87', name: 'Face Pulls', muscleGroup: 'Shoulders', equipment: 'Cables', sets: 3, reps: '12-15 reps' },
          { id: '75', name: 'Incline Dumbbell Curl', muscleGroup: 'Arms', equipment: 'Dumbbells', sets: 3, reps: '10-12 reps' },
          { id: '79', name: 'Overhead Cable Tricep Extension', muscleGroup: 'Arms', equipment: 'Cables', sets: 3, reps: '10-12 reps' },
        ],
      },
      {
        dayId: 'fri',
        dayName: 'Friday',
        isRest: false,
        title: 'Lower Body Hypertrophy',
        exercises: [
          { id: '65', name: 'Barbell Front Squat', muscleGroup: 'Legs', equipment: 'Barbell', sets: 3, reps: '8-10 reps' },
          { id: '70', name: 'Barbell Hip Thrust', muscleGroup: 'Legs', equipment: 'Barbell', sets: 4, reps: '8-12 reps' },
          { id: '69', name: 'Leg Extension', muscleGroup: 'Legs', equipment: 'Machine', sets: 3, reps: '12-15 reps' },
          { id: '68', name: 'Lying Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', sets: 3, reps: '10-12 reps' },
          { id: '92', name: 'Hanging Leg Raise', muscleGroup: 'Core', equipment: 'Pull-up Bar', sets: 3, reps: '10-12 reps' },
        ],
      },
      {
        dayId: 'sat',
        dayName: 'Saturday',
        isRest: true,
        title: 'Active Recovery / Light Cardio',
        exercises: [],
      },
      {
        dayId: 'sun',
        dayName: 'Sunday',
        isRest: true,
        title: 'Rest & Recovery',
        exercises: [],
      },
    ],
  },
  {
    id: 'full_body_3day',
    name: 'Full Body (3 Days)',
    description: 'Classic silver-era routine hitting whole-body compounds every other day. Exceptional for beginners and busy athletes.',
    frequency: '3 Days / Week',
    days: [
      {
        dayId: 'mon',
        dayName: 'Monday',
        isRest: false,
        title: 'Full Body A (Squat & Press)',
        exercises: [
          { id: '64', name: 'Barbell Back Squat', muscleGroup: 'Legs', equipment: 'Barbell', sets: 4, reps: '6-8 reps' },
          { id: '2', name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', sets: 4, reps: '6-8 reps' },
          { id: '60', name: 'Barbell Bent Over Row', muscleGroup: 'Back', equipment: 'Barbell', sets: 3, reps: '8-10 reps' },
          { id: '84', name: 'Overhead Barbell Press', muscleGroup: 'Shoulders', equipment: 'Barbell', sets: 3, reps: '8-10 reps' },
          { id: '74', name: 'Barbell Bicep Curl', muscleGroup: 'Arms', equipment: 'Barbell', sets: 3, reps: '10-12 reps' },
          { id: '91', name: 'Cable Crunch', muscleGroup: 'Core', equipment: 'Cables', sets: 3, reps: '12-15 reps' },
        ],
      },
      {
        dayId: 'tue',
        dayName: 'Tuesday',
        isRest: true,
        title: 'Rest & Recovery',
        exercises: [],
      },
      {
        dayId: 'wed',
        dayName: 'Wednesday',
        isRest: false,
        title: 'Full Body B (Deadlift & Pull)',
        exercises: [
          { id: '62', name: 'Deadlifts', muscleGroup: 'Back', equipment: 'Barbell', sets: 4, reps: '5 reps' },
          { id: '1', name: 'Push-ups', muscleGroup: 'Chest', equipment: 'Bodyweight', sets: 3, reps: '12-15 reps' },
          { id: '4', name: 'Pull-ups', muscleGroup: 'Back', equipment: 'Pull-up Bar', sets: 4, reps: '8-10 reps' },
          { id: '13', name: 'Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Dumbbells', sets: 3, reps: '10-12 reps' },
          { id: '77', name: 'Cable Tricep Pushdown', muscleGroup: 'Arms', equipment: 'Cables', sets: 3, reps: '12-15 reps' },
          { id: '16', name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight', sets: 3, reps: '60 sec' },
        ],
      },
      {
        dayId: 'thu',
        dayName: 'Thursday',
        isRest: true,
        title: 'Rest & Recovery',
        exercises: [],
      },
      {
        dayId: 'fri',
        dayName: 'Friday',
        isRest: false,
        title: 'Full Body C (Leg Press & Incline)',
        exercises: [
          { id: '66', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', sets: 4, reps: '10-12 reps' },
          { id: '21', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbells', sets: 3, reps: '8-10 reps' },
          { id: '25', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Machine', sets: 3, reps: '10-12 reps' },
          { id: '67', name: 'Romanian Deadlift (RDL)', muscleGroup: 'Legs', equipment: 'Barbell', sets: 3, reps: '8-10 reps' },
          { id: '86', name: 'Cable Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Cables', sets: 4, reps: '12-15 reps' },
          { id: '92', name: 'Hanging Leg Raise', muscleGroup: 'Core', equipment: 'Pull-up Bar', sets: 3, reps: '10-12 reps' },
        ],
      },
      {
        dayId: 'sat',
        dayName: 'Saturday',
        isRest: true,
        title: 'Rest & Recovery',
        exercises: [],
      },
      {
        dayId: 'sun',
        dayName: 'Sunday',
        isRest: true,
        title: 'Rest & Recovery',
        exercises: [],
      },
    ],
  },
];

export const MuscleWikiGenerator: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { startWorkout, addExercise } = useWorkout();
  const { toast } = useToast();

  // Mode: 'generator' (instant single routine) | 'split' (7-day split planner) | 'builder' (manual builder)
  const isBuilderRoute = location.pathname.includes('workout-builder') || searchParams.get('tab') === 'builder';
  const isSplitRoute = location.pathname.includes('split-builder') || searchParams.get('tab') === 'split';
  const [activeMode, setActiveMode] = useState<'generator' | 'split' | 'builder'>(
    isBuilderRoute ? 'builder' : isSplitRoute ? 'split' : 'generator'
  );

  // Sync mode with route/params
  useEffect(() => {
    if (location.pathname.includes('workout-builder') || searchParams.get('tab') === 'builder') {
      setActiveMode('builder');
    } else if (location.pathname.includes('split-builder') || searchParams.get('tab') === 'split') {
      setActiveMode('split');
    }
  }, [location.pathname, searchParams]);

  // ==========================================
  // GENERATOR STATE
  // ==========================================
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(['Chest', 'Arms']);
  const [selectedEquipmentPreset, setSelectedEquipmentPreset] = useState<string>('full_gym');
  const [selectedGoal, setSelectedGoal] = useState<string>('hypertrophy');
  const [targetDuration, setTargetDuration] = useState<number>(45);
  const [difficulty, setDifficulty] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');

  const toggleMuscle = (muscleId: string) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscleId)
        ? prev.length > 1
          ? prev.filter((m) => m !== muscleId)
          : prev
        : [...prev, muscleId]
    );
  };

  // Stack Synthesis Engine
  const generatedStack = useMemo(() => {
    const activePreset = EQUIPMENT_PRESETS.find((p) => p.id === selectedEquipmentPreset) || EQUIPMENT_PRESETS[0];
    const allowedEquipment = activePreset.items;

    const matchingExercises = exercises.filter((ex) => {
      const matchesMuscle = selectedMuscles.some((m) => {
        if (m === 'Chest') return ex.muscleGroup === 'Chest';
        if (m === 'Back') return ex.muscleGroup === 'Back';
        if (m === 'Shoulders') return ex.muscleGroup === 'Shoulders';
        if (m === 'Arms') return ex.muscleGroup === 'Arms';
        if (m === 'Legs') return ex.muscleGroup === 'Legs';
        if (m === 'Glutes') return ex.muscleGroup === 'Legs' || ex.muscleGroup === 'Glutes';
        if (m === 'Core') return ex.muscleGroup === 'Core';
        return false;
      });

      if (!matchesMuscle) return false;

      const matchesEquipment = allowedEquipment.some((eq) =>
        ex.equipment.toLowerCase().includes(eq.toLowerCase())
      );
      if (!matchesEquipment) return false;

      if (difficulty !== 'All' && ex.difficulty !== difficulty) {
        return false;
      }

      return true;
    });

    const compoundKeywords = ['bench', 'squat', 'deadlift', 'press', 'row', 'pull-up', 'push-up', 'dip'];
    const compounds = matchingExercises.filter((e) =>
      compoundKeywords.some((k) => e.name.toLowerCase().includes(k))
    );
    const isolations = matchingExercises.filter((e) => !compounds.includes(e));

    const targetCount = targetDuration <= 20 ? 3 : targetDuration <= 30 ? 4 : targetDuration <= 45 ? 6 : 8;
    const stack: Exercise[] = [];
    const usedIds = new Set<string>();

    for (const c of compounds) {
      if (stack.length >= Math.ceil(targetCount / 2)) break;
      if (!usedIds.has(c.id)) {
        stack.push(c);
        usedIds.add(c.id);
      }
    }

    for (const iso of isolations) {
      if (stack.length >= targetCount) break;
      if (!usedIds.has(iso.id)) {
        stack.push(iso);
        usedIds.add(iso.id);
      }
    }

    for (const rem of matchingExercises) {
      if (stack.length >= targetCount) break;
      if (!usedIds.has(rem.id)) {
        stack.push(rem);
        usedIds.add(rem.id);
      }
    }

    return stack;
  }, [selectedMuscles, selectedEquipmentPreset, targetDuration, difficulty]);

  const handleStartGeneratedWorkout = () => {
    if (generatedStack.length === 0) return;
    const routineTitle = `${selectedMuscles.join(' & ')} Blast`;
    startWorkout(routineTitle);

    generatedStack.forEach((ex) => {
      addExercise(ex.name, ex.id);
    });

    navigate('/workout/active');
  };

  const currentGoalConfig = TRAINING_GOALS.find((g) => g.id === selectedGoal) || TRAINING_GOALS[0];

  // ==========================================
  // WEEKLY SPLIT BUILDER STATE
  // ==========================================
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('ppl_6day');
  const [activeSplitDays, setActiveSplitDays] = useState<DayPlan[]>(() => {
    try {
      const saved = localStorage.getItem('fitbox_weekly_split_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 7) return parsed;
      }
    } catch {
      // fallback
    }
    return SPLIT_TEMPLATES[0].days;
  });

  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState<string>('');
  const [exerciseFilterGroup, setExerciseFilterGroup] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Save to localStorage whenever split days update
  useEffect(() => {
    try {
      localStorage.setItem('fitbox_weekly_split_v1', JSON.stringify(activeSplitDays));
    } catch {
      // ignore
    }
  }, [activeSplitDays]);

  const handleApplyTemplate = (templateId: string) => {
    const tpl = SPLIT_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setSelectedTemplateId(templateId);
    setActiveSplitDays(JSON.parse(JSON.stringify(tpl.days)));
  };

  const handleToggleRestDay = (index: number) => {
    setActiveSplitDays((prev) => {
      const copy = [...prev];
      const target = { ...copy[index] };
      target.isRest = !target.isRest;
      if (target.isRest) {
        target.title = 'Rest & Recovery';
      } else if (target.exercises.length === 0) {
        target.title = `${target.dayName} Workout`;
      }
      copy[index] = target;
      return copy;
    });
  };

  const handleUpdateSets = (dayIdx: number, exIdx: number, delta: number) => {
    setActiveSplitDays((prev) => {
      const copy = [...prev];
      const day = { ...copy[dayIdx] };
      const exs = [...day.exercises];
      const current = { ...exs[exIdx] };
      current.sets = Math.max(1, Math.min(8, current.sets + delta));
      exs[exIdx] = current;
      day.exercises = exs;
      copy[dayIdx] = day;
      return copy;
    });
  };

  const handleRemoveExercise = (dayIdx: number, exIdx: number) => {
    setActiveSplitDays((prev) => {
      const copy = [...prev];
      const day = { ...copy[dayIdx] };
      day.exercises = day.exercises.filter((_, i) => i !== exIdx);
      copy[dayIdx] = day;
      return copy;
    });
  };

  const handleAddExerciseToDay = (ex: Exercise) => {
    setActiveSplitDays((prev) => {
      const copy = [...prev];
      const day = { ...copy[activeDayIndex] };
      const newEx: ScheduledExercise = {
        id: ex.id,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        equipment: ex.equipment,
        sets: 3,
        reps: '8-12 reps',
      };
      day.exercises = [...day.exercises, newEx];
      if (day.isRest) day.isRest = false;
      copy[activeDayIndex] = day;
      return copy;
    });
    setShowAddModal(false);
  };

  const handleStartDayWorkout = (day: DayPlan) => {
    if (day.isRest || day.exercises.length === 0) return;
    startWorkout(day.title || `${day.dayName} Session`);
    day.exercises.forEach((ex) => {
      addExercise(ex.name, ex.id);
    });
    navigate('/workout/active');
  };

  // ==========================================
  // MODE C: MANUAL WORKOUT BUILDER STATE & ACTIONS
  // ==========================================
  const [manualTitle, setManualTitle] = useState('My Custom Workout');
  const [manualCategory, setManualCategory] = useState<'Hypertrophy' | 'Strength' | 'Cardio & HIIT' | 'Home & Calisthenics'>('Hypertrophy');
  const [manualExercises, setManualExercises] = useState<ScheduledExercise[]>([
    {
      id: '2',
      name: 'Bench Press',
      equipment: 'Barbell',
      muscleGroup: 'Chest',
      sets: 4,
      reps: '8-10 reps',
    },
    {
      id: '51',
      name: 'Seated Cable Rows',
      equipment: 'Cable Machine',
      muscleGroup: 'Back',
      sets: 4,
      reps: '10-12 reps',
    },
    {
      id: '11',
      name: 'Tricep Dips',
      equipment: 'Bodyweight',
      muscleGroup: 'Arms',
      sets: 3,
      reps: '10-12 reps',
    },
  ]);

  const handleAddExerciseToManual = (ex: Exercise) => {
    const newEx: ScheduledExercise = {
      id: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      sets: 3,
      reps: '8-12 reps',
    };
    setManualExercises((prev) => [...prev, newEx]);
    setShowAddModal(false);
  };

  const handleUpdateManualSets = (index: number, delta: number) => {
    setManualExercises((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        sets: Math.max(1, Math.min(8, copy[index].sets + delta)),
      };
      return copy;
    });
  };

  const handleUpdateManualReps = (index: number, reps: string) => {
    setManualExercises((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], reps };
      return copy;
    });
  };

  const handleMoveManualExercise = (index: number, direction: 'up' | 'down') => {
    setManualExercises((prev) => {
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  };

  const handleRemoveManualExercise = (index: number) => {
    setManualExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveManualWorkout = () => {
    if (manualExercises.length === 0) {
      toast({
        title: 'Empty Workout',
        description: 'Add at least one exercise before saving.',
        variant: 'destructive',
      });
      return;
    }
    const template: WorkoutTemplate = {
      id: `custom-${Date.now()}`,
      title: manualTitle,
      description: `Custom workout created with FitBox Manual Workout Builder (${manualCategory}).`,
      category: manualCategory,
      difficulty: 'Intermediate',
      durationMinutes: manualExercises.length * 8,
      equipment: ['Mixed Equipment'],
      targetMuscles: Array.from(new Set(manualExercises.map((e) => e.muscleGroup))),
      tags: ['Custom', manualCategory],
      exercises: manualExercises.map((e) => ({
        id: e.id,
        name: e.name,
        muscleGroup: e.muscleGroup,
        equipment: e.equipment,
        sets: e.sets,
        reps: e.reps,
        restSeconds: 60,
      })),
    };
    workoutRoutineService.saveUserCustomWorkout(template);
    toast({
      title: 'Workout Saved! 🎉',
      description: `"${manualTitle}" has been saved to your custom workouts library.`,
    });
  };

  const handleStartManualWorkout = () => {
    if (manualExercises.length === 0) return;
    startWorkout(manualTitle);
    manualExercises.forEach((ex) => {
      addExercise(ex.name, ex.id);
    });
    toast({
      title: 'Workout session launched! 🚀',
      description: `Loaded "${manualTitle}" into active tracker.`,
    });
    navigate('/workout/active');
  };

  // Weekly Volume Calculations
  const weeklyVolume = useMemo(() => {
    const counts: Record<string, number> = {
      Chest: 0,
      Back: 0,
      Shoulders: 0,
      Arms: 0,
      Legs: 0,
      Core: 0,
    };
    let totalWeeklySets = 0;
    let totalWorkouts = 0;

    activeSplitDays.forEach((d) => {
      if (!d.isRest && d.exercises.length > 0) {
        totalWorkouts++;
        d.exercises.forEach((ex) => {
          const grp = ex.muscleGroup;
          if (counts[grp] !== undefined) {
            counts[grp] += ex.sets;
          } else {
            counts['Legs'] = (counts['Legs'] || 0) + ex.sets;
          }
          totalWeeklySets += ex.sets;
        });
      }
    });

    return { counts, totalWeeklySets, totalWorkouts };
  }, [activeSplitDays]);

  const filteredLibraryExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(exerciseSearchTerm.toLowerCase());
      const matchesGroup =
        exerciseFilterGroup === 'All' || ex.muscleGroup.toLowerCase() === exerciseFilterGroup.toLowerCase();
      return matchesSearch && matchesGroup;
    });
  }, [exerciseSearchTerm, exerciseFilterGroup]);

  const currentDay = activeSplitDays[activeDayIndex] || activeSplitDays[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Top Banner & Mode Segmented Switch */}
      <section className="border-b border-border/40 bg-card/40 backdrop-blur-md py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                MuscleWiki Architecture Engine
              </Badge>
              <span className="text-xs text-muted-foreground">Workout Synthesis & Split Periodization</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {activeMode === 'generator'
                ? 'Interactive Workout Generator'
                : activeMode === 'split'
                ? 'Weekly Split Planner & Volume Audit'
                : 'Manual Workout Builder'}
            </h1>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm sm:text-base">
              {activeMode === 'generator'
                ? 'Synthesize targeted, scientifically sequenced workouts in seconds based on available equipment and training goals.'
                : activeMode === 'split'
                ? 'Structure your 7-day training schedule, balance weekly muscle set volumes against MEV/MAV thresholds, and launch daily routines.'
                : 'Build custom workouts from scratch: assemble exercises, fine-tune sets & reps, reorder movements, and save or launch into active tracker.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Toggle Buttons */}
            <div className="bg-muted/70 p-1 rounded-xl flex items-center border border-border/60">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('generator');
                  setSearchParams({});
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeMode === 'generator'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Single Routine
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMode('split');
                  setSearchParams({ tab: 'split' });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeMode === 'split'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Split Planner
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMode('builder');
                  setSearchParams({ tab: 'builder' });
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeMode === 'builder'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-primary" />
                Manual Builder
              </button>
            </div>

            <Link to="/tools?tab=1rm">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Dumbbell className="w-3.5 h-3.5" />
                1RM & Plate Tools
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* MODE 1: INSTANT WORKOUT GENERATOR */}
      {/* ======================================================== */}
      {activeMode === 'generator' && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls Column */}
            <div className="lg:col-span-5 space-y-6">
              {/* 1. Target Muscle Groups */}
              <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    1. Target Muscle Groups
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {selectedMuscles.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {MUSCLE_OPTIONS.map((m) => {
                    const isSelected = selectedMuscles.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleMuscle(m.id)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-primary/15 border-primary text-foreground shadow-sm'
                            : 'bg-background/60 border-border/40 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{m.icon}</span>
                          <span className="text-xs font-semibold">{m.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* 2. Equipment Preset */}
              <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-4">
                <div className="border-b border-border/40 pb-3">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-primary" />
                    2. Available Equipment
                  </h3>
                </div>

                <div className="space-y-2">
                  {EQUIPMENT_PRESETS.map((preset) => {
                    const isSelected = selectedEquipmentPreset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => setSelectedEquipmentPreset(preset.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary/15 border-primary shadow-sm'
                            : 'bg-background/60 border-border/40 hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">{preset.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{preset.description}</p>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* 3. Training Goal & Duration */}
              <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-4">
                <div className="border-b border-border/40 pb-3">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-primary" />
                    3. Training Goal & Duration
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Focus</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TRAINING_GOALS.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGoal(g.id)}
                        className={`p-2 rounded-lg border text-xs font-semibold text-center transition-all ${
                          selectedGoal === g.id
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {g.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-muted-foreground uppercase tracking-wider">Workout Length</span>
                    <span className="font-bold text-foreground">{targetDuration} Minutes</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[20, 30, 45, 60].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setTargetDuration(dur)}
                        className={`py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          targetDuration === dur
                            ? 'bg-primary/20 border-primary text-primary font-bold'
                            : 'bg-background border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {dur}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Difficulty Level</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={`py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                          difficulty === diff
                            ? 'bg-primary/20 border-primary text-primary font-bold'
                            : 'bg-background border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Stack Preview Column */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/40 gap-3">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" />
                      Synthesized Routine Plan
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {generatedStack.length} Exercises • ~{targetDuration} Minutes • {currentGoalConfig.reps} Target
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleStartGeneratedWorkout}
                      disabled={generatedStack.length === 0}
                      className="gap-2 bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Start Workout
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 bg-muted/40 rounded-xl border border-border/40 text-center">
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Rest Interval</span>
                    <span className="text-xs font-bold text-foreground">{currentGoalConfig.rest}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Set Target</span>
                    <span className="text-xs font-bold text-foreground">{currentGoalConfig.sets}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Total Volume</span>
                    <span className="text-xs font-bold text-primary">
                      {generatedStack.length * 3} - {generatedStack.length * 4} Sets
                    </span>
                  </div>
                </div>

                {/* Exercise List */}
                <div className="space-y-3">
                  {generatedStack.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                      <p className="font-medium">No exercises match your selected filters.</p>
                      <p className="text-xs mt-1">Try selecting more muscle groups or broadening equipment.</p>
                    </div>
                  ) : (
                    generatedStack.map((exercise, index) => (
                      <div
                        key={exercise.id}
                        className="p-4 rounded-xl border border-border/50 bg-card/60 hover:border-primary/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base text-foreground">
                              {exercise.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-medium">
                                {exercise.muscleGroup}
                              </Badge>
                              <span className="text-[11px] text-muted-foreground">
                                {exercise.equipment}
                              </span>
                              <span className="text-muted-foreground text-[10px]">•</span>
                              <span className="text-[11px] text-muted-foreground">
                                {exercise.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="text-right">
                            <span className="text-xs font-bold text-foreground block">
                              {currentGoalConfig.sets}
                            </span>
                            <span className="text-[11px] text-muted-foreground block">
                              {currentGoalConfig.reps}
                            </span>
                          </div>
                          <Link to={`/exercise/${exercise.id}`}>
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                              Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {generatedStack.length > 0 && (
                  <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">
                      Exercises will be automatically logged to your active workout session with sets, reps, and rest timers.
                    </div>
                    <Button
                      onClick={handleStartGeneratedWorkout}
                      className="w-full sm:w-auto gap-2 text-sm font-semibold"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Launch Workout Session
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      )}

      {/* ======================================================== */}
      {/* MODE 2: WEEKLY SPLIT BUILDER & VOLUME AUDIT */}
      {/* ======================================================== */}
      {activeMode === 'split' && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Split Template Chooser */}
          <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Split Architecture Templates
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select a science-backed weekly template or build your own bespoke routine.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyTemplate(selectedTemplateId)}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset to Template Default
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SPLIT_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleApplyTemplate(tpl.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary/40'
                        : 'bg-background/60 border-border/40 hover:bg-muted/40 hover:border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-foreground">{tpl.name}</span>
                      <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                        {tpl.frequency}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{tpl.description}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Weekly Volume & Scientific Benchmark Hub */}
          <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/40 gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-bold text-base">Weekly Muscle Volume Audit</h3>
                  <p className="text-xs text-muted-foreground">
                    Direct sets per week evaluated against sports science hypertrophy recommendations.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground">
                  Active Days: <strong className="text-foreground">{weeklyVolume.totalWorkouts}/7</strong>
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  Weekly Sets: <strong className="text-primary">{weeklyVolume.totalWeeklySets} sets</strong>
                </span>
              </div>
            </div>

            {/* Scientific Volume Guideline Key */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-muted/30 rounded-xl border border-border/30 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-muted-foreground text-[11px]">
                  &lt;8 Sets: <strong>Maintenance (MEV)</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-muted-foreground text-[11px]">
                  8-18 Sets: <strong>Hypertrophy Sweet Spot (MAV)</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                <span className="text-muted-foreground text-[11px]">
                  &gt;18 Sets: <strong>High Volume (MRV)</strong>
                </span>
              </div>
            </div>

            {/* Volume Breakdown Progress Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(weeklyVolume.counts).map(([muscle, sets]) => {
                const tier =
                  sets === 0
                    ? { label: 'Untrained', color: 'bg-muted-foreground', badge: 'bg-muted text-muted-foreground' }
                    : sets < 8
                    ? { label: 'Maintenance', color: 'bg-amber-500', badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30' }
                    : sets <= 18
                    ? { label: 'Optimal', color: 'bg-emerald-500', badge: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' }
                    : { label: 'High Vol', color: 'bg-purple-500', badge: 'bg-purple-500/15 text-purple-500 border-purple-500/30' };

                const pct = Math.min(100, Math.round((sets / 22) * 100));

                return (
                  <div key={muscle} className="p-3 rounded-xl border border-border/50 bg-background/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{muscle}</span>
                      <span className="font-bold text-primary">{sets}s</span>
                    </div>

                    <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${tier.color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="text-center">
                      <Badge variant="outline" className={`text-[10px] py-0 px-1 border font-medium ${tier.badge}`}>
                        {tier.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 7-Day Interactive Split Grid */}
          <div className="space-y-4">
            {/* Day Selector Tabs */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {activeSplitDays.map((day, idx) => {
                const isSelected = activeDayIndex === idx;
                return (
                  <button
                    key={day.dayId}
                    type="button"
                    onClick={() => setActiveDayIndex(idx)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : day.isRest
                        ? 'bg-background/40 border-border/40 text-muted-foreground hover:bg-muted/40'
                        : 'bg-card/80 border-border/60 text-foreground hover:border-primary/40'
                    }`}
                  >
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                      {day.dayName.slice(0, 3)}
                    </span>
                    <span className="text-[10px] sm:text-[11px] truncate max-w-full">
                      {day.isRest ? 'Rest' : `${day.exercises.length} ex`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Day Detail Card */}
            <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/40 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      {currentDay.dayName}
                    </span>
                    {currentDay.isRest ? (
                      <Badge variant="outline" className="text-muted-foreground border-border text-[10px]">
                        Rest Day
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-500 bg-emerald-500/10 text-[10px]">
                        Active Training Day
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mt-1">{currentDay.title}</h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleRestDay(activeDayIndex)}
                    className="text-xs"
                  >
                    {currentDay.isRest ? 'Switch to Workout Day' : 'Mark as Rest Day'}
                  </Button>

                  {!currentDay.isRest && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowAddModal(true)}
                        className="gap-1.5 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Exercise
                      </Button>

                      <Button
                        onClick={() => handleStartDayWorkout(currentDay)}
                        disabled={currentDay.exercises.length === 0}
                        size="sm"
                        className="gap-1.5 text-xs font-semibold bg-primary text-primary-foreground shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Start This Day
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Day Routine Content */}
              {currentDay.isRest ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <div className="text-4xl">🧘</div>
                  <h4 className="font-semibold text-foreground text-base">Rest & Recovery Scheduled</h4>
                  <p className="text-xs max-w-sm mx-auto text-muted-foreground">
                    Rest days allow muscle tissue protein synthesis, glycogen replenishment, and central nervous system recovery.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleRestDay(activeDayIndex)}
                    className="mt-3 text-xs"
                  >
                    Convert to Training Day
                  </Button>
                </div>
              ) : currentDay.exercises.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <Dumbbell className="w-8 h-8 mx-auto text-muted-foreground/60" />
                  <h4 className="font-semibold text-foreground text-base">No exercises assigned yet</h4>
                  <p className="text-xs text-muted-foreground">
                    Add compound and isolation exercises from our 96-exercise catalogue to build your routine.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setShowAddModal(true)}
                    className="mt-3 gap-1.5 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Browse Exercise Library
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentDay.exercises.map((exercise, exIndex) => (
                    <div
                      key={`${exercise.id}-${exIndex}`}
                      className="p-4 rounded-xl border border-border/50 bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-border transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                          {exIndex + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm sm:text-base text-foreground">
                              {exercise.name}
                            </span>
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-medium">
                              {exercise.muscleGroup}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{exercise.equipment}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        {/* Sets Stepper */}
                        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border/50">
                          <button
                            type="button"
                            onClick={() => handleUpdateSets(activeDayIndex, exIndex, -1)}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-background text-muted-foreground hover:text-foreground text-xs"
                            title="Decrease Sets"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1.5 min-w-[2.5rem] text-center">
                            {exercise.sets} sets
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateSets(activeDayIndex, exIndex, 1)}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-background text-muted-foreground hover:text-foreground text-xs"
                            title="Increase Sets"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs text-muted-foreground font-medium min-w-[4.5rem] text-center">
                          {exercise.reps}
                        </span>

                        <Link to={`/exercise/${exercise.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                            Cues
                          </Button>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(activeDayIndex, exIndex)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                          title="Remove Exercise"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </main>
      )}

      {/* ======================================================== */}
      {/* MODE 3: MANUAL WORKOUT BUILDER */}
      {/* ======================================================== */}
      {activeMode === 'builder' && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Header Card */}
          <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Workout Name
                </label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-xl px-4 py-2 text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g., Heavy Upper Push & Core"
                />
              </div>

              <div className="space-y-1.5 sm:w-56">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Training Focus
                </label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as 'Hypertrophy' | 'Strength' | 'Cardio & HIIT' | 'Home & Calisthenics')}
                  className="w-full bg-background border border-border/60 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="Hypertrophy">Hypertrophy (Size)</option>
                  <option value="Strength">Strength (Power)</option>
                  <option value="Cardio & HIIT">Cardio & HIIT</option>
                  <option value="Home & Calisthenics">Home & Calisthenics</option>
                </select>
              </div>
            </div>

            {/* Metric Pills */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-border/40 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-primary" />
                <span>{manualExercises.length} Movements</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-500" />
                <span>{manualExercises.reduce((sum, e) => sum + e.sets, 0)} Total Sets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>~{manualExercises.length * 8} Min Session</span>
              </div>
            </div>
          </Card>

          {/* Exercises Sequence Stack */}
          <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" />
                  Exercise Stack & Prescription
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure sets, target rep ranges, and reorder movements.
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="gap-1.5 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Exercise
              </Button>
            </div>

            {manualExercises.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border/60 rounded-2xl bg-muted/20">
                <Dumbbell className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-foreground">No exercises added yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Click the button below to pick movements from our 96-exercise catalog.
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 gap-1.5 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Browse Exercise Catalog
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {manualExercises.map((ex, index) => (
                  <div
                    key={`${ex.id}-${index}`}
                    className="p-4 rounded-xl border border-border/60 bg-background/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-border"
                  >
                    {/* Index & Name */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveManualExercise(index, 'up')}
                          className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-20 transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === manualExercises.length - 1}
                          onClick={() => handleMoveManualExercise(index, 'down')}
                          className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-20 transition-colors"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-foreground truncate">{ex.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="secondary" className="text-[10px] py-0 px-1 font-semibold">
                            {ex.muscleGroup}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground truncate">{ex.equipment}</span>
                        </div>
                      </div>
                    </div>

                    {/* Sets & Reps Stepper */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      {/* Sets */}
                      <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border/40">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground px-1">Sets</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateManualSets(index, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-background text-muted-foreground hover:text-foreground text-xs"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold">{ex.sets}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateManualSets(index, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-background text-muted-foreground hover:text-foreground text-xs"
                        >
                          +
                        </button>
                      </div>

                      {/* Reps */}
                      <select
                        value={ex.reps}
                        onChange={(e) => handleUpdateManualReps(index, e.target.value)}
                        className="bg-muted/60 border border-border/40 rounded-lg px-2 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                      >
                        <option value="4-6 reps">4-6 (Strength)</option>
                        <option value="6-8 reps">6-8 (Heavy)</option>
                        <option value="8-10 reps">8-10 (Hypertrophy)</option>
                        <option value="8-12 reps">8-12 (Standard)</option>
                        <option value="12-15 reps">12-15 (Pump)</option>
                        <option value="15-20 reps">15-20 (Endurance)</option>
                      </select>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveManualExercise(index)}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors"
                        title="Remove Exercise"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Actions */}
            {manualExercises.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/40">
                <Button
                  variant="outline"
                  onClick={handleSaveManualWorkout}
                  className="w-full sm:w-auto gap-2 text-xs font-bold"
                >
                  <Save className="w-4 h-4 text-primary" />
                  Save to My Workouts
                </Button>

                <Button
                  onClick={handleStartManualWorkout}
                  className="w-full sm:w-auto gap-2 text-xs font-bold bg-primary text-primary-foreground shadow-md hover:opacity-90"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Launch Workout in Active Tracker
                </Button>
              </div>
            )}
          </Card>
        </main>
      )}

      {/* Add Exercise Modal / Drawer (Available in both Split Planner & Manual Builder) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[85vh] flex flex-col bg-card border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-border/40 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">
                  {activeMode === 'builder' ? 'Add Exercise to Custom Workout' : `Add Exercise to ${currentDay.dayName}`}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select from our 96-exercise catalog across all major muscle groups.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                ✕
              </Button>
            </div>

            <div className="p-4 sm:p-6 border-b border-border/40 space-y-3 bg-muted/20">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search exercises by name, barbell, dumbbells, cables..."
                  value={exerciseSearchTerm}
                  onChange={(e) => setExerciseSearchTerm(e.target.value)}
                  className="w-full bg-background border border-border/60 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Muscle Group Filter Chips */}
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core'].map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setExerciseFilterGroup(grp)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      exerciseFilterGroup === grp
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-background border border-border/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-2">
              {filteredLibraryExercises.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  No exercises found matching "{exerciseSearchTerm}".
                </div>
              ) : (
                filteredLibraryExercises.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => (activeMode === 'builder' ? handleAddExerciseToManual(ex) : handleAddExerciseToDay(ex))}
                    className="p-3 rounded-xl border border-border/40 bg-background hover:bg-primary/10 hover:border-primary/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                          {ex.name}
                        </span>
                        <Badge variant="secondary" className="text-[10px] py-0 px-1 font-medium">
                          {ex.muscleGroup}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {ex.equipment} • {ex.difficulty}
                      </span>
                    </div>

                    <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 group-hover:text-primary">
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MuscleWikiGenerator;
