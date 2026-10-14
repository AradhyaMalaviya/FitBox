import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExercisePoster } from "@/components/exercise/ExercisePoster";
import type { Exercise } from "@/data/exercises";

interface ExerciseCardProps {
  exercise: Exercise;
}

export const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
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
      className="group overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 animate-slide-up cursor-pointer"
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {exercise.name}
          </h3>
          <Badge className={getDifficultyColor(exercise.difficulty)}>
            {exercise.difficulty}
          </Badge>
        </div>

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
