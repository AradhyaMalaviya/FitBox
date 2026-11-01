import { Link } from "react-router-dom";
import { CheckCircle2, Dumbbell, Flame, Calculator, Utensils, ExternalLink, ArrowRight, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ToolCallExecution, AddToWorkoutResult, MacroResult } from "@/lib/ai/fitnessAgentTools";
import type { OneRepMaxConsensus } from "@/lib/muscleWikiCalculators";
import type { IndianFoodItem } from "@/data/indianFoodDatabase";
import type { Exercise } from "@/data/exercises";

interface AgentToolResultCardProps {
  execution: ToolCallExecution;
}

export const AgentToolResultCard = ({ execution }: AgentToolResultCardProps) => {
  const { toolName, result, summary } = execution;
  const addToWorkoutFailed = toolName === "add_to_workout" && !(result as AddToWorkoutResult | null)?.success;

  return (
    <Card className="my-2 overflow-hidden border border-primary/30 bg-card/90 shadow-md text-foreground">
      {/* Tool Execution Header */}
      <div className="flex items-center justify-between bg-primary/10 px-3.5 py-2 border-b border-primary/20 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-primary">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>TOOL EXECUTED:</span>
          <code className="rounded bg-primary/20 px-1.5 py-0.5 text-[11px] font-mono text-primary font-bold">
            {toolName}()
          </code>
        </div>
        <span className={`flex items-center gap-1 text-[11px] font-medium ${addToWorkoutFailed ? "text-destructive" : "text-emerald-400"}`}>
          {!addToWorkoutFailed && <CheckCircle2 className="w-3 h-3" />}
          {addToWorkoutFailed ? "Not added" : "Success"}
        </span>
      </div>

      <div className="p-3.5 space-y-3">
        <p className="text-xs text-muted-foreground font-medium">{summary}</p>

        {/* 1. Add to Workout Result Card */}
        {toolName === "add_to_workout" && result && (result as AddToWorkoutResult).success && (result as AddToWorkoutResult).exercise && (
          <div className="space-y-3 rounded-lg border border-border/80 bg-background/60 p-3">
            {(() => {
              const res = result as AddToWorkoutResult;
              if (!res.exercise) return null;
              return (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <Dumbbell className="w-4 h-4 text-primary" />
                        {res.exercise.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] py-0">
                          {res.exercise.muscleGroup}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] py-0 text-accent">
                          {res.exercise.equipment}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-primary">
                        {res.prescribedSets} sets × {res.prescribedReps} reps
                      </span>
                      {res.targetWeightKg > 0 && (
                        <p className="text-xs text-muted-foreground font-medium">@ {res.targetWeightKg} kg</p>
                      )}
                    </div>
                  </div>

                  {res.warmupGuidance && (
                    <div className="rounded bg-muted/40 p-2 text-[11px] space-y-1">
                      <span className="font-semibold text-foreground/80">Warm-up & Acclimation:</span>
                      {res.warmupGuidance.map((w, idx) => (
                        <p key={idx} className="text-muted-foreground leading-tight">• {w}</p>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 flex justify-end">
                    <Link
                      to="/workout/active"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Open Active Workout Tracker
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* 2. Macro Targets Card */}
        {toolName === "calculate_macros" && result && (
          <div className="space-y-3 rounded-lg border border-border/80 bg-background/60 p-3">
            {(() => {
              const res = result as MacroResult;
              return (
                <>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
                      <span className="text-[10px] font-semibold text-primary uppercase">Calories</span>
                      <p className="text-base font-black text-foreground">{res.calories}</p>
                    </div>
                    <div className="rounded-lg bg-rose-500/10 p-2 border border-rose-500/20">
                      <span className="text-[10px] font-semibold text-rose-400 uppercase">Protein</span>
                      <p className="text-base font-black text-rose-300">{res.proteinGrams}g</p>
                    </div>
                    <div className="rounded-lg bg-amber-500/10 p-2 border border-amber-500/20">
                      <span className="text-[10px] font-semibold text-amber-400 uppercase">Carbs</span>
                      <p className="text-base font-black text-amber-300">{res.carbsGrams}g</p>
                    </div>
                    <div className="rounded-lg bg-sky-500/10 p-2 border border-sky-500/20">
                      <span className="text-[10px] font-semibold text-sky-400 uppercase">Fats</span>
                      <p className="text-base font-black text-sky-300">{res.fatGrams}g</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-muted-foreground pt-1">
                    {res.recommendations.map((rec, idx) => (
                      <p key={idx}>✓ {rec}</p>
                    ))}
                  </div>

                  <div className="pt-1 flex justify-end">
                    <Link
                      to="/nutrition/roadmap"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      View Indian Nutrition Roadmap
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* 3. 1RM Consensus Card */}
        {toolName === "calculate_1rm" && result && (
          <div className="space-y-3 rounded-lg border border-border/80 bg-background/60 p-3">
            {(() => {
              const res = result as OneRepMaxConsensus;
              return (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Consensus 1-Rep Max</span>
                      <p className="text-xl font-extrabold text-primary">
                        {res.average} {res.unit}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      5-Formula Consensus
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] bg-muted/40 p-2 rounded">
                    <div>
                      <span className="text-muted-foreground">95% (2 reps)</span>
                      <p className="font-bold">{Math.round(res.average * 0.95)} {res.unit}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">85% (5 reps)</span>
                      <p className="font-bold">{Math.round(res.average * 0.85)} {res.unit}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">75% (8 reps)</span>
                      <p className="font-bold">{Math.round(res.average * 0.75)} {res.unit}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">65% (12 reps)</span>
                      <p className="font-bold">{Math.round(res.average * 0.65)} {res.unit}</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* 4. Search Exercises Result */}
        {toolName === "search_exercises" && Array.isArray(result) && (
          <div className="grid grid-cols-1 gap-2 pt-1">
            {(result as Exercise[]).map((ex) => (
              <div
                key={ex.id}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs hover:border-primary/40 transition-colors"
              >
                <div>
                  <h5 className="font-bold text-foreground">{ex.name}</h5>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
                    <span>{ex.muscleGroup}</span>
                    <span>•</span>
                    <span>{ex.equipment}</span>
                    <span>•</span>
                    <span>{ex.difficulty}</span>
                  </div>
                </div>

                <Link
                  to={`/exercise/${ex.id}`}
                  className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline shrink-0"
                >
                  <span>View Form</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* 5. Food Nutrition Result */}
        {toolName === "get_food_nutrition" && Array.isArray(result) && (
          <div className="space-y-2 pt-1">
            {(result as IndianFoodItem[]).map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-2 text-xs"
              >
                <div>
                  <span className="font-bold text-foreground">{f.name}</span>
                  <span className="ml-2 text-[10px] text-muted-foreground font-mono">({f.serving})</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <Badge variant="secondary" className="py-0 text-[10px]">
                    {f.calories} kcal
                  </Badge>
                  <span className="font-bold text-primary">{f.protein}g P</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
