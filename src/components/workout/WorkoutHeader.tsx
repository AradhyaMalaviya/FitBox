import { useState } from 'react';
import { Timer, Square, Dumbbell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface WorkoutHeaderProps {
  workoutName: string;
  elapsedSeconds: number;
  onFinish: () => void;
  onDiscard?: () => void;
  isFinishing?: boolean;
}

export const WorkoutHeader = ({ workoutName, elapsedSeconds, onFinish, onDiscard, isFinishing }: WorkoutHeaderProps) => {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">{workoutName}</h1>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Timer className="w-3.5 h-3.5" />
                <span className="text-sm font-mono">{formatTime(elapsedSeconds)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onDiscard && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowDiscardDialog(true)}
                className="gap-1.5 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Discard</span>
              </Button>
            )}
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onFinish}
              disabled={isFinishing}
              className="gap-2"
            >
              <Square className="w-4 h-4" />
              {isFinishing ? 'Saving...' : 'Finish'}
            </Button>
          </div>
        </div>
      </header>

      {onDiscard && (
        <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard Workout?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all progress for this workout session. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Working Out</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDiscard}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Discard Workout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};
