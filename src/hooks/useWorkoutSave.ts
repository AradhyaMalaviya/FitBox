import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ActiveWorkout } from '@/contexts/WorkoutContext';

interface SaveWorkoutResult {
  sessionId: string;
  exerciseCount: number;
  setCount: number;
  isGuest?: boolean;
}

export const useWorkoutSave = () => {
  const { user, profileId } = useAuth();

  return useMutation({
    mutationFn: async (workout: ActiveWorkout): Promise<SaveWorkoutResult> => {
      const activeProfileId = profileId || user?.profileId || user?.id;

      if (!activeProfileId || activeProfileId === 'guest' || user?.isGuest) {
        const guestSession = {
          id: `guest-session-${Date.now()}`,
          name: workout.name,
          startedAt: workout.startedAt.toISOString(),
          endedAt: new Date().toISOString(),
          exercises: workout.exercises,
        };
        try {
          const history = JSON.parse(localStorage.getItem('fitbox:guestWorkoutHistory') || '[]');
          history.unshift(guestSession);
          localStorage.setItem('fitbox:guestWorkoutHistory', JSON.stringify(history.slice(0, 20)));
        } catch (e) {
          console.warn('Failed to save guest workout history', e);
        }
        const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
        return {
          sessionId: guestSession.id,
          exerciseCount: workout.exercises.length,
          setCount: totalSets,
          isGuest: true,
        };
      }

      // 1. Create the workout session using profileId (FK target for workout_sessions.user_id)
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: activeProfileId,
          name: workout.name,
          started_at: workout.startedAt.toISOString(),
          ended_at: new Date().toISOString(),
          status: 'completed',
        })
        .select('id')
        .single();

      if (sessionError || !session) {
        throw new Error(`Failed to create workout session: ${sessionError?.message}`);
      }

      // 2. Create workout logs for each exercise
      const logsToInsert = workout.exercises.map((exercise, index) => ({
        session_id: session.id,
        exercise_name: exercise.exerciseName,
        exercise_id: exercise.exerciseId || null,
        order_index: index,
      }));

      const { data: logs, error: logsError } = await supabase
        .from('workout_logs')
        .insert(logsToInsert)
        .select('id, order_index');

      if (logsError || !logs) {
        throw new Error(`Failed to create workout logs: ${logsError?.message}`);
      }

      // Map order_index to log_id
      const logIdMap = new Map(logs.map(log => [log.order_index, log.id]));

      // 3. Create workout sets for each log
      const setsToInsert = workout.exercises.flatMap((exercise, exerciseIndex) => {
        const logId = logIdMap.get(exerciseIndex);
        if (!logId) return [];
        
        return exercise.sets
          .filter(set => set.completed)
          .map(set => ({
            log_id: logId,
            set_number: set.setNumber,
            weight: set.weight,
            reps: set.reps,
            completed: true,
          }));
      });

      if (setsToInsert.length > 0) {
        const { error: setsError } = await supabase
          .from('workout_sets')
          .insert(setsToInsert);

        if (setsError) {
          throw new Error(`Failed to create workout sets: ${setsError.message}`);
        }
      }

      return {
        sessionId: session.id,
        exerciseCount: workout.exercises.length,
        setCount: setsToInsert.length,
      };
    },
  });
};
