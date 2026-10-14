import { useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exercises } from "@/data/exercises";
import {
  ArrowLeft,
  Clock,
  Dumbbell,
  Target,
  Info,
  Zap,
  Play,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Calculator,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
} from "lucide-react";
import { ExerciseVideoPlayer } from "@/components/exercise/ExerciseVideoPlayer";
import { useWorkout } from "@/contexts/WorkoutContext";
import { calculateOneRepMax } from "@/lib/muscleWikiCalculators";

const ExerciseDetail = () => {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const { activeWorkout, startWorkout, addExercise } = useWorkout();

  // Model & Angle toggles (MuscleWiki-style)
  const [modelGender, setModelGender] = useState<"male" | "female">("male");
  const [viewAngle, setViewAngle] = useState<"front" | "side">("front");

  // Mini 1RM Calculator for this specific exercise
  const [estimateWeight, setEstimateWeight] = useState<number>(60);
  const [estimateReps, setEstimateReps] = useState<number>(8);
  const [estimateUnit, setEstimateUnit] = useState<"kg" | "lbs">("kg");

  const exercise = exercises.find((e) => e.id === exerciseId);

  const mini1RM = useMemo(() => {
    return calculateOneRepMax(estimateWeight, estimateReps, estimateUnit);
  }, [estimateWeight, estimateReps, estimateUnit]);

  if (!exercise) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <div className="text-6xl mb-4">🤔</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Exercise Not Found</h1>
          <p className="text-muted-foreground mb-6">The exercise you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/exercises")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Exercises
          </Button>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-fitness-green text-black";
      case "Intermediate":
        return "bg-energetic-orange text-black";
      case "Advanced":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "🌱";
      case "Intermediate":
        return "💪";
      case "Advanced":
        return "🔥";
      default:
        return "⚡";
    }
  };

  // Get related exercises (same muscle group, different exercise)
  const relatedExercises = exercises
    .filter((e) => e.muscleGroup === exercise.muscleGroup && e.id !== exercise.id)
    .slice(0, 4);

  // MuscleWiki structured form cues generator (based on exercise type & mechanics)
  const isChest = exercise.muscleGroup === "Chest";
  const isBack = exercise.muscleGroup === "Back";
  const isLegs = exercise.muscleGroup === "Legs";
  const isShoulders = exercise.muscleGroup === "Shoulders";
  const isArms = exercise.muscleGroup === "Arms";

  const setupSteps = [
    `Establish a firm, balanced foundation with feet positioned shoulder-width apart.`,
    isChest
      ? `Retract your scapulae (pull shoulder blades down and back into the bench) and maintain a slight natural arch.`
      : isBack
      ? `Hinge at the hips, brace your core tightly, and keep your cervical spine in neutral alignment.`
      : isLegs
      ? `Brace abdominal wall with 360-degree intra-abdominal pressure; screw your feet into the floor to load hips.`
      : `Grip the handle or bar firmly with a neutral wrist alignment to ensure direct force transmission.`,
    `Inhale deeply to create intra-thoracic pressure before starting the initial movement phase.`,
  ];

  const executionSteps = (exercise.instructions && exercise.instructions.length > 0)
    ? exercise.instructions
    : [
        `Initiate the eccentric (lowering) phase under strict 2-3 second control; do not let gravity or momentum drop the weight.`,
        `Pause momentarily at full muscular stretch to maximize muscle tension and eliminate elastic bounce.`,
        `Drive forcefully through the concentric phase while exhaling steadily through pursed lips.`,
        `Achieve peak muscular contraction at the top range of motion without hyperextending joints.`,
      ];

  const proTips = (exercise.cues && exercise.cues.length > 0)
    ? [...exercise.cues, `Progressive Overload: When you can complete all target reps with pristine form, add 2.5 kg or 5 lbs next session.`]
    : [
        `Mind-Muscle Connection: Consciously focus on contracting the ${exercise.muscleGroup} rather than simply moving the weight.`,
        `Tempo Control: Aim for a 3-1-1 tempo (3 seconds down, 1 second pause at stretch, 1 second explosive lift).`,
        `Joint Safety: Never lock out joints completely under maximum load to preserve tendon integrity.`,
        `Progressive Overload: When you can complete all target reps with pristine form, add 2.5 kg or 5 lbs next session.`,
      ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Back Navigation Bar */}
      <div className="px-4 pt-4 max-w-7xl mx-auto flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate("/exercises");
            }
          }}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          <Link to={`/tools?tab=1rm`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Calculator className="w-3.5 h-3.5 text-primary" />
              1RM Tools
            </Button>
          </Link>
          <Link to={`/generator`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Dumbbell className="w-3.5 h-3.5 text-primary" />
              Workout Generator
            </Button>
          </Link>
        </div>
      </div>

      <main className="px-4 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Video & Media & Cues */}
          <div className="lg:col-span-6 space-y-5">
            {/* Video Box */}
            <div className="relative w-full aspect-video bg-card rounded-2xl overflow-hidden border border-border shadow-xl">
              <ErrorBoundary
                fallback={
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-destructive/10 to-transparent p-6 text-center">
                    <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
                    <p className="text-foreground font-medium">Video unavailable</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      There was an error loading the demonstration video.
                    </p>
                  </div>
                }
              >
                <ExerciseVideoPlayer
                  exercise={exercise}
                  modelGender={modelGender}
                  viewAngle={viewAngle}
                  className="w-full h-full object-cover"
                />
              </ErrorBoundary>
            </div>

            {/* MuscleWiki Model & Angle Controls */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-card/60 border border-border/50 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-semibold">Model:</span>
                <div className="flex rounded-lg border border-border p-0.5 bg-background">
                  <button
                    type="button"
                    onClick={() => setModelGender("male")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      modelGender === "male"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setModelGender("female")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      modelGender === "female"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-semibold">Angle:</span>
                <div className="flex rounded-lg border border-border p-0.5 bg-background">
                  <button
                    type="button"
                    onClick={() => setViewAngle("front")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      viewAngle === "front"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Front
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewAngle("side")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      viewAngle === "side"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Side
                  </button>
                </div>
              </div>
            </div>

            {/* MuscleWiki Step-by-Step Instructions Tabs */}
            <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-4">
              <Tabs defaultValue="setup" className="w-full">
                <TabsList className="grid grid-cols-3 bg-muted/40 border border-border/40">
                  <TabsTrigger value="setup" className="text-xs">
                    1. The Setup
                  </TabsTrigger>
                  <TabsTrigger value="execution" className="text-xs">
                    2. Execution
                  </TabsTrigger>
                  <TabsTrigger value="tips" className="text-xs">
                    3. Pro Tips
                  </TabsTrigger>
                </TabsList>

                {/* Setup */}
                <TabsContent value="setup" className="space-y-3 pt-3">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Proper Setup & Stance
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    {setupSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>

                {/* Execution */}
                <TabsContent value="execution" className="space-y-3 pt-3">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Biomechanical Execution
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    {executionSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>

                {/* Pro Tips */}
                <TabsContent value="tips" className="space-y-3 pt-3">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Form Cues & Mistakes to Avoid
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    {proTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Column: Title, Anatomy, Quick 1RM & Workout Actions */}
          <div className="lg:col-span-6 space-y-6">
            {/* Title and Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className={getDifficultyColor(exercise.difficulty)}>
                  {getDifficultyIcon(exercise.difficulty)} {exercise.difficulty}
                </Badge>
                <Badge variant="outline" className="border-primary/40 text-primary">
                  {exercise.muscleGroup}
                </Badge>
                <Badge variant="secondary">{exercise.equipment}</Badge>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                {exercise.name}
              </h1>

              {exercise.description && (
                <p className="text-base text-muted-foreground leading-relaxed mt-2">
                  {exercise.description}
                </p>
              )}
            </div>

            {/* Muscle Activation Anatomy Box */}
            <Card className="p-5 bg-card/80 border-border/60 shadow-sm space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Target Anatomy Activation
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-[11px] font-semibold text-primary block uppercase tracking-wider">
                    Primary Target
                  </span>
                  <span className="text-sm font-black text-foreground mt-0.5 block">
                    {exercise.muscleGroup}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/40">
                  <span className="text-[11px] font-semibold text-muted-foreground block uppercase tracking-wider">
                    Synergist Stabilizers
                  </span>
                  <span className="text-sm font-medium text-foreground mt-0.5 block">
                    {isChest
                      ? "Triceps, Front Deltoids"
                      : isBack
                      ? "Biceps, Forearms, Rear Delts"
                      : isLegs
                      ? "Glutes, Core, Calves"
                      : isShoulders
                      ? "Triceps, Upper Traps"
                      : "Forearms, Shoulders"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-3 bg-card/60 border-border/40 text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Target</p>
                <p className="font-extrabold text-xs sm:text-sm text-foreground mt-1 truncate">
                  {exercise.muscleGroup}
                </p>
              </Card>

              <Card className="p-3 bg-card/60 border-border/40 text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Protocol</p>
                <p className="font-extrabold text-xs sm:text-sm text-foreground mt-1 truncate">
                  {exercise.duration}
                </p>
              </Card>

              <Card className="p-3 bg-card/60 border-border/40 text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Equipment</p>
                <p className="font-extrabold text-xs sm:text-sm text-foreground mt-1 truncate">
                  {exercise.equipment}
                </p>
              </Card>

              <Card className="p-3 bg-card/60 border-border/40 text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Level</p>
                <p className="font-extrabold text-xs sm:text-sm text-foreground mt-1 truncate">
                  {exercise.difficulty}
                </p>
              </Card>
            </div>

            {/* Quick 1RM Estimator Widget for this Exercise */}
            <Card className="p-5 bg-card/80 border-border/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  Quick 1RM Calculator for {exercise.name}
                </h3>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEstimateUnit("kg")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      estimateUnit === "kg" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    KG
                  </button>
                  <button
                    type="button"
                    onClick={() => setEstimateUnit("lbs")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      estimateUnit === "lbs" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    LBS
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-muted-foreground block mb-1">Working Weight ({estimateUnit})</label>
                  <input
                    type="number"
                    value={estimateWeight}
                    onChange={(e) => setEstimateWeight(Number(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-md bg-background border border-border text-foreground font-bold focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Reps Performed</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={estimateReps}
                    onChange={(e) => setEstimateReps(Number(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 rounded-md bg-background border border-border text-foreground font-bold focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Predicted 1-Rep Max:</span>
                  <span className="text-2xl font-black text-foreground">
                    {mini1RM.average} {estimateUnit}
                  </span>
                </div>
                <Link to={`/tools?tab=1rm`}>
                  <Button size="sm" variant="outline" className="text-xs gap-1.5">
                    <span>Full Plate Loader</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                className="flex-1 gap-2 text-base py-6 shadow-md shadow-primary/20"
                onClick={() => {
                  if (!activeWorkout) {
                    startWorkout(`${exercise.muscleGroup} Workout`);
                    addExercise(exercise.name, exercise.id);
                  } else {
                    const alreadyAdded = activeWorkout.exercises.some(
                      (e) => e.exerciseId === exercise.id || e.exerciseName === exercise.name
                    );
                    if (!alreadyAdded) {
                      addExercise(exercise.name, exercise.id);
                    }
                  }
                  navigate("/workout/active");
                }}
              >
                <Play className="h-5 w-5 fill-current" />
                {activeWorkout ? "Add & Continue Workout" : "Start Workout"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  navigate("/generator", { state: { preselectedExercise: exercise } });
                }}
              >
                <Dumbbell className="h-4 w-4" />
                Add to Custom Routine
              </Button>
            </div>

            {/* Related Exercises */}
            {relatedExercises.length > 0 && (
              <div className="pt-4 border-t border-border/40">
                <h3 className="font-bold text-sm mb-3">More {exercise.muscleGroup} Exercises</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {relatedExercises.map((related) => (
                    <Link key={related.id} to={`/exercise/${related.id}`} className="group">
                      <Card className="p-3 hover:border-primary/50 hover:bg-card transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                              {related.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{related.equipment}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
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
