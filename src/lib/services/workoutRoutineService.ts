import {
  WORKOUT_TEMPLATES,
  ROUTINE_PROGRAMS,
  WorkoutTemplate,
  RoutineProgram,
} from '@/data/workoutTemplates';

export interface WorkoutFilterOptions {
  category?: string;
  difficulty?: string;
  search?: string;
  maxDuration?: number;
}

export interface RoutineFilterOptions {
  goal?: string;
  level?: string;
  daysPerWeek?: number;
  search?: string;
}

const CUSTOM_WORKOUTS_KEY = 'fitbox_custom_workouts_v1';
const FAVORITE_WORKOUTS_KEY = 'fitbox_favorite_workouts_v1';
const FAVORITE_ROUTINES_KEY = 'fitbox_favorite_routines_v1';

class WorkoutRoutineService {
  /**
   * Retrieves curated standalone workouts matching filter criteria.
   */
  public async getWorkouts(filters: WorkoutFilterOptions = {}): Promise<WorkoutTemplate[]> {
    const { category, difficulty, search, maxDuration } = filters;
    let list = [...WORKOUT_TEMPLATES];

    if (category && category !== 'All') {
      list = list.filter((w) => w.category === category);
    }

    if (difficulty && difficulty !== 'All') {
      list = list.filter((w) => w.difficulty === difficulty);
    }

    if (maxDuration && maxDuration > 0) {
      list = list.filter((w) => w.durationMinutes <= maxDuration);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.targetMuscles.some((m) => m.toLowerCase().includes(q)) ||
          w.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }

  /**
   * Retrieves a single workout by its ID.
   */
  public async getWorkoutById(id: string): Promise<WorkoutTemplate | null> {
    const custom = this.getUserCustomWorkouts().find((w) => w.id === id);
    if (custom) return custom;
    return WORKOUT_TEMPLATES.find((w) => w.id === id) || null;
  }

  /**
   * Retrieves multi-day routine programs matching filter criteria.
   */
  public async getRoutines(filters: RoutineFilterOptions = {}): Promise<RoutineProgram[]> {
    const { goal, level, daysPerWeek, search } = filters;
    let list = [...ROUTINE_PROGRAMS];

    if (goal && goal !== 'All') {
      list = list.filter((r) => r.goal === goal);
    }

    if (level && level !== 'All') {
      list = list.filter((r) => r.level === level);
    }

    if (daysPerWeek && daysPerWeek > 0) {
      list = list.filter((r) => r.daysPerWeek === daysPerWeek);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }

  /**
   * Retrieves a single routine program by its ID.
   */
  public async getRoutineById(id: string): Promise<RoutineProgram | null> {
    return ROUTINE_PROGRAMS.find((r) => r.id === id) || null;
  }

  /**
   * Gets user-created custom workouts stored locally.
   */
  public getUserCustomWorkouts(): WorkoutTemplate[] {
    try {
      const data = localStorage.getItem(CUSTOM_WORKOUTS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return [];
  }

  /**
   * Saves a user-created workout.
   */
  public saveUserCustomWorkout(workout: WorkoutTemplate): void {
    const current = this.getUserCustomWorkouts();
    const updated = [workout, ...current.filter((w) => w.id !== workout.id)];
    try {
      localStorage.setItem(CUSTOM_WORKOUTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save custom workout locally:', e);
    }
  }

  /**
   * Toggles a workout as favorite.
   */
  public toggleFavoriteWorkout(workoutId: string): boolean {
    try {
      const saved = localStorage.getItem(FAVORITE_WORKOUTS_KEY);
      const list: string[] = saved ? JSON.parse(saved) : [];
      const index = list.indexOf(workoutId);
      let isFav = false;
      if (index >= 0) {
        list.splice(index, 1);
        isFav = false;
      } else {
        list.push(workoutId);
        isFav = true;
      }
      localStorage.setItem(FAVORITE_WORKOUTS_KEY, JSON.stringify(list));
      return isFav;
    } catch {
      return false;
    }
  }

  /**
   * Checks if a workout is in favorites.
   */
  public isWorkoutFavorited(workoutId: string): boolean {
    try {
      const saved = localStorage.getItem(FAVORITE_WORKOUTS_KEY);
      if (!saved) return false;
      const list: string[] = JSON.parse(saved);
      return list.includes(workoutId);
    } catch {
      return false;
    }
  }

  /**
   * Checks if a routine is favorited.
   */
  public isRoutineFavorited(routineId: string): boolean {
    try {
      const saved = localStorage.getItem(FAVORITE_ROUTINES_KEY);
      if (!saved) return false;
      const list: string[] = JSON.parse(saved);
      return list.includes(routineId);
    } catch {
      return false;
    }
  }

  /**
   * Toggles a routine as favorite.
   */
  public toggleFavoriteRoutine(routineId: string): boolean {
    try {
      const saved = localStorage.getItem(FAVORITE_ROUTINES_KEY);
      const list: string[] = saved ? JSON.parse(saved) : [];
      const index = list.indexOf(routineId);
      let isFav = false;
      if (index >= 0) {
        list.splice(index, 1);
        isFav = false;
      } else {
        list.push(routineId);
        isFav = true;
      }
      localStorage.setItem(FAVORITE_ROUTINES_KEY, JSON.stringify(list));
      return isFav;
    } catch {
      return false;
    }
  }
}

export const workoutRoutineService = new WorkoutRoutineService();
