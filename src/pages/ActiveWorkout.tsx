import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useWorkoutSave } from '@/hooks/useWorkoutSave';
import { WorkoutHeader } from '@/components/workout/WorkoutHeader';
import { ExerciseLogCard } from '@/components/workout/ExerciseLogCard';
import { AddExerciseDrawer } from '@/components/workout/AddExerciseDrawer';
import { StartWorkoutCard } from '@/components/workout/StartWorkoutCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ActiveWorkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
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
  } = useWorkout();

  const { mutate: saveWorkout, isPending: isSaving } = useWorkoutSave();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  const handleFinishClick = () => {
    const completedSets = getCompletedSetsCount();
    if (completedSets === 0) {
      toast({
        title: 'No sets completed',
        description: 'Complete at least one set before finishing your workout.',
        variant: 'destructive',
      });
      return;
    }
    setShowFinishDialog(true);
  };

  const handleConfirmFinish = () => {
    if (!activeWorkout) return;

    saveWorkout(activeWorkout, {
      onSuccess: (result) => {
        if (result.isGuest) {
          toast({
            title: '🎉 Workout Complete!',
            description: `Saved locally! Create an account anytime to sync your workouts.`,
          });
        } else {
          toast({
            title: '🎉 Workout Complete!',
            description: `Saved ${result.exerciseCount} exercises with ${result.setCount} sets.`,
          });
        }
        endWorkout();
        navigate('/dashboard');
      },
      onError: (error) => {
        toast({
          title: 'Error saving workout',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  // Show start workout card if no active workout
  if (!activeWorkout) {
    return <StartWorkoutCard onStart={startWorkout} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkoutHeader
        workoutName={activeWorkout.name}
        elapsedSeconds={elapsedSeconds}
        onFinish={handleFinishClick}
        isFinishing={isSaving}
      />

      <ScrollArea className="flex-1">
        <div className="container max-w-2xl mx-auto p-4 pb-24 space-y-4">
          {activeWorkout.exercises.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 p-4 rounded-full bg-muted/30 w-fit">
                <Dumbbell className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No exercises yet</h3>
              <p className="text-muted-foreground mb-6">
                Add exercises to start tracking your workout
              </p>
              <Button onClick={() => setIsDrawerOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Exercise
              </Button>
            </div>
          ) : (
            activeWorkout.exercises.map((exercise) => (
              <ExerciseLogCard
                key={exercise.id}
                exercise={exercise}
                onRemoveExercise={() => removeExercise(exercise.id)}
                onAddSet={() => addSet(exercise.id)}
                onRemoveSet={(setId) => removeSet(exercise.id, setId)}
                onUpdateSet={(setId, updates) => updateSet(exercise.id, setId, updates)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Floating Add Exercise Button */}
      {activeWorkout.exercises.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <Button
            size="lg"
            onClick={() => setIsDrawerOpen(true)}
            className="gap-2 shadow-lg shadow-primary/25 rounded-full px-6"
          >
            <Plus className="w-5 h-5" />
            Add Exercise
          </Button>
        </div>
      )}

      {/* Add Exercise Drawer */}
      <AddExerciseDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSelectExercise={addExercise}
      />

      {/* Finish Workout Confirmation Dialog */}
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finish Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              You've completed {getCompletedSetsCount()} sets across {activeWorkout.exercises.length} exercises.
              This will save your workout and end the session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Going</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmFinish} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Finish & Save'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActiveWorkout;
