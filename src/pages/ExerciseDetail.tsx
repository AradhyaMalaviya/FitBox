import { Link, useParams, useNavigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { exercises } from "@/data/exercises";
import { ArrowLeft, Clock, Dumbbell, Target, Info, Zap, Play, AlertTriangle } from "lucide-react";
import { ExerciseVideoPlayer } from "@/components/exercise/ExerciseVideoPlayer";
import { useWorkout } from "@/contexts/WorkoutContext";

const ExerciseDetail = () => {
    const { exerciseId } = useParams();
    const navigate = useNavigate();
    const { activeWorkout, startWorkout, addExercise } = useWorkout();

    const exercise = exercises.find(e => e.id === exerciseId);

    if (!exercise) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex flex-col items-center justify-center h-[60vh] px-4">
                    <div className="text-6xl mb-4">🤔</div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Exercise Not Found</h1>
                    <p className="text-muted-foreground mb-6">The exercise you're looking for doesn't exist.</p>
                    <Button onClick={() => navigate('/exercises')} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Exercises
                    </Button>
                </div>
            </div>
        );
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'bg-fitness-green text-black';
            case 'Intermediate': return 'bg-energetic-orange text-black';
            case 'Advanced': return 'bg-destructive text-destructive-foreground';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getDifficultyIcon = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return '🌱';
            case 'Intermediate': return '💪';
            case 'Advanced': return '🔥';
            default: return '⚡';
        }
    };

    // Get related exercises (same muscle group, different exercise)
    const relatedExercises = exercises
        .filter(e => e.muscleGroup === exercise.muscleGroup && e.id !== exercise.id)
        .slice(0, 4);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Back Navigation */}
            <div className="px-4 pt-4 max-w-7xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => {
                        if (window.history.length > 1) {
                            navigate(-1);
                        } else {
                            navigate('/exercises');
                        }
                    }}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>

            <main className="px-4 py-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Video Section */}
                    <div className="space-y-4">
                        <div className="relative w-full aspect-video bg-card rounded-2xl overflow-hidden border border-border shadow-xl">
                            {exercise.video && exercise.video.trim() !== "" ? (
                                <ErrorBoundary fallback={
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-destructive/10 to-transparent p-6 text-center">
                                        <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
                                        <p className="text-foreground font-medium">Video unavailable</p>
                                        <p className="text-sm text-muted-foreground mt-1">There was an error loading the demonstration video.</p>
                                    </div>
                                }>
                                    <ExerciseVideoPlayer
                                        exercise={exercise}
                                        className="w-full h-full object-cover"
                                    />
                                </ErrorBoundary>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                                    <div className="text-8xl mb-4">🏋️</div>
                                    <p className="text-muted-foreground text-lg">Video Coming Soon</p>
                                    <p className="text-sm text-muted-foreground/70 mt-1">Demonstration video will be added</p>
                                </div>
                            )}
                        </div>

                        {/* Quick Tips Card */}
                        <Card className="p-6 bg-card/50 border-primary/20">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-lg">Pro Tips</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Focus on proper form before adding weight</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Control the movement - don't use momentum</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Breathe out during the exertion phase</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>Rest 60-90 seconds between sets</span>
                                </li>
                            </ul>
                        </Card>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-6">
                        {/* Title and Badges */}
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                <Badge className={getDifficultyColor(exercise.difficulty)}>
                                    {getDifficultyIcon(exercise.difficulty)} {exercise.difficulty}
                                </Badge>
                                <Badge variant="outline" className="border-primary/30 text-primary">
                                    {exercise.muscleGroup}
                                </Badge>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                {exercise.name}
                            </h1>
                            {exercise.description && (
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {exercise.description}
                                </p>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/20">
                                        <Target className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Target</p>
                                        <p className="font-semibold text-foreground">{exercise.muscleGroup}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 bg-gradient-to-br from-secondary/10 to-transparent border-secondary/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-secondary/20">
                                        <Clock className="h-5 w-5 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Sets & Reps</p>
                                        <p className="font-semibold text-foreground">{exercise.duration}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-accent/20">
                                        <Dumbbell className="h-5 w-5 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Equipment</p>
                                        <p className="font-semibold text-foreground">{exercise.equipment}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-4 bg-gradient-to-br from-fitness-green/10 to-transparent border-fitness-green/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-fitness-green/20">
                                        <Zap className="h-5 w-5 text-fitness-green" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Level</p>
                                        <p className="font-semibold text-foreground">{exercise.difficulty}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button
                                size="lg"
                                className="flex-1 gap-2 text-lg py-6"
                                onClick={() => {
                                    if (!activeWorkout) {
                                        startWorkout(`${exercise.muscleGroup} Workout`);
                                        setTimeout(() => {
                                            addExercise(exercise.name, exercise.id);
                                        }, 0);
                                    } else {
                                        const alreadyAdded = activeWorkout.exercises.some(
                                            (e) => e.exerciseId === exercise.id || e.exerciseName === exercise.name
                                        );
                                        if (!alreadyAdded) {
                                            addExercise(exercise.name, exercise.id);
                                        }
                                    }
                                    navigate('/workout/active');
                                }}
                            >
                                <Play className="h-5 w-5" />
                                {activeWorkout ? 'Add & Continue Workout' : 'Start Workout'}
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="flex-1 gap-2"
                                onClick={() => {
                                    navigate('/generate-workout', { state: { preselectedExercise: exercise } });
                                }}
                            >
                                Add to Custom Workout
                            </Button>
                        </div>

                        {/* Related Exercises */}
                        {relatedExercises.length > 0 && (
                            <div className="pt-6 border-t border-border">
                                <h3 className="font-semibold text-lg mb-4">More {exercise.muscleGroup} Exercises</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {relatedExercises.map(related => (
                                        <Link
                                            key={related.id}
                                            to={`/exercise/${related.id}`}
                                            className="group"
                                        >
                                            <Card className="p-4 hover:border-primary/50 hover:bg-card transition-all duration-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                                                            {related.name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">{related.difficulty}</p>
                                                    </div>
                                                    <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ExerciseDetail;
