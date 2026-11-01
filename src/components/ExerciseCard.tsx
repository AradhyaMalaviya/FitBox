import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExercisePoster } from "@/components/exercise/ExercisePoster";
import { Sparkles } from "lucide-react";
import type { Exercise } from "@/data/exercises";

export interface ExerciseCardProps {
  exercise: Exercise;
  semanticMatch?: {
    isTopMatch: boolean;
    rationale?: string;
  };
}

export const ExerciseCard = ({ exercise, semanticMatch }: ExerciseCardProps) => {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-fitness-green text-black';
      case 'Intermediate': return 'bg-energetic-orange text-black';
      case 'Advanced': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleClick = () => {
    navigate(`/exercise/${exercise.id}`);
  };

  return (
    <Card
      onClick={handleClick}
      className={`group overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 animate-slide-up cursor-pointer ${
        semanticMatch ? "ring-1 ring-purple-500/40 border-purple-500/30" : ""
      }`}
    >
      {exercise.video && (
        <div className="relative w-full aspect-video bg-black/20 overflow-hidden">
          <ExercisePoster
            exercise={exercise}
            className="transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors flex-1">
            {exercise.name}
          </h3>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {semanticMatch && (
              <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 text-[10px] px-2 py-0.5 gap-1 font-semibold shadow-sm">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                {semanticMatch.isTopMatch ? "Best fit" : "Related"}
              </Badge>
            )}
            <Badge className={getDifficultyColor(exercise.difficulty)}>
              {exercise.difficulty}
            </Badge>
          </div>
        </div>

        {semanticMatch?.rationale && (
          <p className="text-xs text-purple-300 bg-purple-950/40 border border-purple-500/20 px-2.5 py-1.5 rounded-md leading-relaxed">
            <span className="font-semibold text-purple-200">AI Context: </span>
            {semanticMatch.rationale}
          </p>
        )}

        {exercise.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {exercise.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Muscle Group:</span>
            <Badge variant="outline" className="text-accent border-accent/30">
              {exercise.muscleGroup}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Duration:</span>
            <span className="text-foreground font-medium">{exercise.duration}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Equipment:</span>
            <span className="text-foreground font-medium">{exercise.equipment}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border/30">
          <div className="w-full bg-primary/10 group-hover:bg-primary text-primary group-hover:text-primary-foreground rounded-lg py-2 px-4 text-sm font-medium transition-all duration-300 text-center group-hover:shadow-lg group-hover:shadow-primary/30">
            View Details →
          </div>
        </div>
      </div>
    </Card>
  );
};
