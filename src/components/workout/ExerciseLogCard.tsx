import { Trash2, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ExerciseLog, WorkoutSet } from '@/contexts/WorkoutContext';
import { cn } from '@/lib/utils';

interface ExerciseLogCardProps {
  exercise: ExerciseLog;
  onRemoveExercise: () => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onUpdateSet: (setId: string, updates: Partial<Pick<WorkoutSet, 'weight' | 'reps' | 'completed'>>) => void;
}

export const ExerciseLogCard = ({
  exercise,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}: ExerciseLogCardProps) => {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            {exercise.exerciseName}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onRemoveExercise}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Header row */}
        <div className="grid grid-cols-[40px_1fr_1fr_50px_32px] gap-2 mb-2 px-1">
          <span className="text-xs font-medium text-muted-foreground text-center">SET</span>
          <span className="text-xs font-medium text-muted-foreground text-center">KG</span>
          <span className="text-xs font-medium text-muted-foreground text-center">REPS</span>
          <span className="text-xs font-medium text-muted-foreground text-center">DONE</span>
          <span></span>
        </div>

        {/* Sets */}
        <div className="space-y-2">
          {exercise.sets.map((set) => (
            <SetRow
              key={set.id}
              set={set}
              onRemove={() => onRemoveSet(set.id)}
              onUpdate={(updates) => onUpdateSet(set.id, updates)}
              canRemove={exercise.sets.length > 1}
            />
          ))}
        </div>

        {/* Add Set Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 text-primary hover:text-primary hover:bg-primary/10"
          onClick={onAddSet}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Set
        </Button>
      </CardContent>
    </Card>
  );
};

interface SetRowProps {
  set: WorkoutSet;
  onRemove: () => void;
  onUpdate: (updates: Partial<Pick<WorkoutSet, 'weight' | 'reps' | 'completed'>>) => void;
  canRemove: boolean;
}

const SetRow = ({ set, onRemove, onUpdate, canRemove }: SetRowProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-[40px_1fr_1fr_50px_32px] gap-2 items-center p-2 rounded-lg transition-colors",
        set.completed ? "bg-fitness-green/10" : "bg-muted/30"
      )}
    >
      {/* Set Number */}
      <div className="flex items-center justify-center">
        <span className={cn(
          "text-sm font-semibold w-7 h-7 rounded-full flex items-center justify-center",
          set.completed ? "bg-fitness-green/20 text-fitness-green" : "bg-muted text-muted-foreground"
        )}>
          {set.setNumber}
        </span>
      </div>

      {/* Weight Input */}
      <Input
        type="number"
        min="0"
        step="0.5"
        value={set.weight ?? ''}
        onChange={(e) => onUpdate({ weight: parseFloat(e.target.value) || 0 })}
        placeholder="0"
        className={cn(
          "h-9 text-center bg-input/50 border-border/50",
          set.completed && "border-fitness-green/30"
        )}
      />

      {/* Reps Input */}
      <Input
        type="number"
        min="0"
        value={set.reps ?? ''}
        onChange={(e) => onUpdate({ reps: parseInt(e.target.value) || 0 })}
        placeholder="0"
        className={cn(
          "h-9 text-center bg-input/50 border-border/50",
          set.completed && "border-fitness-green/30"
        )}
      />

      {/* Completed Checkbox */}
      <div className="flex items-center justify-center">
        <Checkbox
          checked={set.completed}
          onCheckedChange={(checked) => onUpdate({ completed: !!checked })}
          className={cn(
            "h-6 w-6 border-2",
            set.completed && "bg-fitness-green border-fitness-green data-[state=checked]:bg-fitness-green"
          )}
        />
      </div>

      {/* Remove Button */}
      <div className="flex items-center justify-center">
        {canRemove ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        ) : (
          <div className="w-8 h-8" />
        )}
      </div>
    </div>
  );
};
