import { ExerciseResultCard } from "./ExerciseResultCard";
import { exercises, type Exercise } from "@/data/exercises";
import { Search, Target, Dumbbell, PlayCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ExerciseVideoPlayer } from "@/components/exercise/ExerciseVideoPlayer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface ExerciseResultsProps {
  selectedMuscle: string | null;
  selectedEquipment: string[];
}

// Map muscle group names to match exercise data
const muscleGroupMapping: Record<string, string> = {
  Chest: "Chest",
  Shoulders: "Shoulders",
  Arms: "Arms",
  Core: "Core",
  Legs: "Legs",
  Back: "Back",
};

const difficultyColors = {
  Beginner: "bg-fitness-green/20 text-fitness-green border-fitness-green/30",
  Intermediate: "bg-energetic-orange/20 text-energetic-orange border-energetic-orange/30",
  Advanced: "bg-destructive/20 text-destructive border-destructive/30",
};

export const ExerciseResults = ({
  selectedMuscle,
  selectedEquipment,
}: ExerciseResultsProps) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Filter exercises based on selection
  const filteredExercises = exercises.filter((exercise) => {
    // Filter by muscle group if selected
    const muscleMatch = selectedMuscle
      ? exercise.muscleGroup === muscleGroupMapping[selectedMuscle]
      : true;

    // Filter by equipment if any selected
    const equipmentMatch =
      selectedEquipment.length === 0 ||
      selectedEquipment.some((eq) =>
        exercise.equipment.toLowerCase().includes(eq.toLowerCase())
      );

    return muscleMatch && equipmentMatch;
  });

  // No muscle selected state
  if (!selectedMuscle) {
    return (
      <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-border p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Target className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Select a Muscle Group
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Click on any muscle in the body diagram to see targeted exercises
        </p>
      </div>
    );
  }

  // No results state
  if (filteredExercises.length === 0) {
    return (
      <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-border p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No Exercises Found
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          No exercises match the current combination of {selectedMuscle} and selected
          equipment. Try removing some filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            {selectedMuscle} Exercises
          </h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {filteredExercises.length} exercise{filteredExercises.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Results grid */}
      <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
        {filteredExercises.map((exercise) => (
          <ExerciseResultCard
            key={exercise.id}
            exercise={exercise}
            onViewDetails={setSelectedExercise}
          />
        ))}
      </div>

      {/* Exercise detail modal */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" />
              {selectedExercise?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedExercise && (
            <div className="space-y-4">
              {/* Video — wrapped in ErrorBoundary so a media failure can never crash the whole modal */}
              {selectedExercise.video && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <ErrorBoundary
                    fallback={
                      <div
                        className="flex h-full w-full flex-col items-center justify-center bg-muted p-4 text-center text-muted-foreground aspect-video"
                        role="img"
                        aria-label="Demonstration preview"
                      >
                        <PlayCircle className="mb-2 h-10 w-10 text-primary opacity-70" />
                        <p className="text-xs font-medium">Demonstration loading...</p>
                      </div>
                    }
                  >
                    <ExerciseVideoPlayer
                      exercise={selectedExercise}
                      className="h-full w-full object-cover"
                    />
                  </ErrorBoundary>
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className={difficultyColors[selectedExercise.difficulty]}
                >
                  {selectedExercise.difficulty}
                </Badge>
                <Badge variant="outline" className="bg-muted/50">
                  {selectedExercise.equipment}
                </Badge>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {selectedExercise.muscleGroup}
                </Badge>
              </div>

              {/* Duration */}
              <p className="text-sm text-muted-foreground">
                <strong>Duration:</strong> {selectedExercise.duration}
              </p>

              {/* Description */}
              {selectedExercise.description && (
                <p className="text-muted-foreground">
                  {selectedExercise.description}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
