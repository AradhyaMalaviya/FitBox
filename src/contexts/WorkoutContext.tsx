import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseLog {
  id: string;
  exerciseId?: string;
  exerciseName: string;
  orderIndex: number;
  sets: WorkoutSet[];
}

export interface ActiveWorkout {
  name: string;
  startedAt: Date;
  exercises: ExerciseLog[];
}

interface WorkoutContextType {
  activeWorkout: ActiveWorkout | null;
  elapsedSeconds: number;
  startWorkout: (name: string) => void;
  endWorkout: () => void;
  addExercise: (exerciseName: string, exerciseId?: string) => void;
  removeExercise: (exerciseLogId: string) => void;
  addSet: (exerciseLogId: string) => void;
  removeSet: (exerciseLogId: string, setId: string) => void;
  updateSet: (exerciseLogId: string, setId: string, updates: Partial<Pick<WorkoutSet, 'weight' | 'reps' | 'completed'>>) => void;
  getCompletedSetsCount: () => number;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 15);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fitbox:activeWorkout');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restore startedAt as Date
        if (parsed.startedAt) {
          parsed.startedAt = new Date(parsed.startedAt);
        }
        setActiveWorkout(parsed);
      }
    } catch (e) {
      console.warn('Failed to restore workout:', e);
      localStorage.removeItem('fitbox:activeWorkout');
    }
  }, []);

  // Persist on change
  useEffect(() => {
    if (activeWorkout) {
      try {
        localStorage.setItem('fitbox:activeWorkout', JSON.stringify(activeWorkout));
      } catch (e) {
        console.warn('Failed to persist workout:', e);
      }
    } else {
      localStorage.removeItem('fitbox:activeWorkout');
    }
  }, [activeWorkout]);

  // Timer logic
  const isWorkoutActive = !!activeWorkout;
  const workoutStartedAt = activeWorkout?.startedAt;

  useEffect(() => {
    if (isWorkoutActive && workoutStartedAt) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - workoutStartedAt.getTime()) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedSeconds(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isWorkoutActive, workoutStartedAt]);

  const startWorkout = useCallback((name: string) => {
    setActiveWorkout({
      name,
      startedAt: new Date(),
      exercises: [],
    });
  }, []);

  const endWorkout = useCallback(() => {
    setActiveWorkout(null);
    setElapsedSeconds(0);
  }, []);

  const addExercise = useCallback((exerciseName: string, exerciseId?: string) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      const newExercise: ExerciseLog = {
        id: generateId(),
        exerciseId,
        exerciseName,
        orderIndex: prev.exercises.length,
        sets: [{
          id: generateId(),
          setNumber: 1,
          weight: 0,
          reps: 0,
          completed: false,
        }],
      };
      return {
        ...prev,
        exercises: [...prev.exercises, newExercise],
      };
    });
  }, []);

  const removeExercise = useCallback((exerciseLogId: string) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.filter(e => e.id !== exerciseLogId),
      };
    });
  }, []);

  const addSet = useCallback((exerciseLogId: string) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(exercise => {
          if (exercise.id !== exerciseLogId) return exercise;
          const lastSet = exercise.sets[exercise.sets.length - 1];
          const newSet: WorkoutSet = {
            id: generateId(),
            setNumber: exercise.sets.length + 1,
            weight: lastSet?.weight ?? 0,
            reps: lastSet?.reps ?? 0,
            completed: false,
          };
          return {
            ...exercise,
            sets: [...exercise.sets, newSet],
          };
        }),
      };
    });
  }, []);

  const removeSet = useCallback((exerciseLogId: string, setId: string) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(exercise => {
          if (exercise.id !== exerciseLogId) return exercise;
          const filteredSets = exercise.sets.filter(s => s.id !== setId);
          // Renumber sets
          return {
            ...exercise,
            sets: filteredSets.map((s, idx) => ({ ...s, setNumber: idx + 1 })),
          };
        }),
      };
    });
  }, []);

  const updateSet = useCallback((exerciseLogId: string, setId: string, updates: Partial<Pick<WorkoutSet, 'weight' | 'reps' | 'completed'>>) => {
    setActiveWorkout(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(exercise => {
          if (exercise.id !== exerciseLogId) return exercise;
          return {
            ...exercise,
            sets: exercise.sets.map(set => {
              if (set.id !== setId) return set;
              return { ...set, ...updates };
            }),
          };
        }),
      };
    });
  }, []);

  const getCompletedSetsCount = useCallback(() => {
    if (!activeWorkout) return 0;
    return activeWorkout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.filter(s => s.completed).length;
    }, 0);
  }, [activeWorkout]);

  return (
    <WorkoutContext.Provider value={{
      activeWorkout,
      elapsedSeconds,
      startWorkout,
      endWorkout,
      addExercise,
      removeExercise,
      addSet,
      removeSet,
      updateSet,
      getCompletedSetsCount,
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- Intentional co-location of Provider and Hook
export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
