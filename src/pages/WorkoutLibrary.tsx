import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { WORKOUT_TEMPLATES, WorkoutTemplate } from '@/data/workoutTemplates';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dumbbell,
  Clock,
  Flame,
  Search,
  Sparkles,
  Heart,
  Play,
  Layers,
  ChevronRight,
  Filter,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { workoutRoutineService } from '@/lib/services/workoutRoutineService';

export const WorkoutLibrary: React.FC = () => {
  const navigate = useNavigate();
  const { startWorkout, addExercise } = useWorkout();
  const { toast } = useToast();

  const [libraryScope, setLibraryScope] = useState<'all' | 'curated' | 'custom' | 'favorites'>('all');
  const [customWorkouts] = useState<WorkoutTemplate[]>(() => {
    return workoutRoutineService.getUserCustomWorkouts();
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [activeModalWorkout, setActiveModalWorkout] = useState<WorkoutTemplate | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fitbox_favorite_workouts_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const categories = ['All', 'Hypertrophy', 'Strength', 'Cardio & HIIT', 'Home & Calisthenics'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const allAvailableWorkouts = useMemo(() => {
    return [...customWorkouts, ...WORKOUT_TEMPLATES];
  }, [customWorkouts]);

  const filteredWorkouts = useMemo(() => {
    let base = allAvailableWorkouts;
    if (libraryScope === 'curated') {
      base = WORKOUT_TEMPLATES;
    } else if (libraryScope === 'custom') {
      base = customWorkouts;
    } else if (libraryScope === 'favorites') {
      base = allAvailableWorkouts.filter((w) => favoriteIds.includes(w.id));
    }

    return base.filter((w) => {
      const matchesSearch =
        w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.targetMuscles.some((m) => m.toLowerCase().includes(searchTerm.toLowerCase())) ||
        w.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || w.category === selectedCategory;
      const matchesDiff = selectedDifficulty === 'All' || w.difficulty === selectedDifficulty;

      return matchesSearch && matchesCat && matchesDiff;
    });
  }, [allAvailableWorkouts, customWorkouts, libraryScope, favoriteIds, searchTerm, selectedCategory, selectedDifficulty]);

  const toggleFavorite = (e: React.MouseEvent, workoutId: string) => {
    e.stopPropagation();
    const isNowFav = workoutRoutineService.toggleFavoriteWorkout(workoutId);
    setFavoriteIds((prev) =>
      isNowFav ? [...prev, workoutId] : prev.filter((id) => id !== workoutId)
    );
    toast({
      title: isNowFav ? 'Added to favorites' : 'Removed from favorites',
      description: isNowFav ? 'Workout saved for quick access.' : 'Workout removed from your saved list.',
    });
  };

  const handleStartWorkout = (workout: WorkoutTemplate) => {
    startWorkout(workout.title);
    workout.exercises.forEach((ex) => {
      addExercise(ex.name, ex.id);
    });

    toast({
      title: 'Workout session launched! 🚀',
      description: `Loaded "${workout.title}" with ${workout.exercises.length} exercises into active tracker.`,
    });

    navigate('/workout/active');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-12">
      <Header />

      {/* Hero Header */}
      <section className="border-b border-border/40 bg-card/40 backdrop-blur-md py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  MuscleWiki Curated Workouts
                </Badge>
                <span className="text-xs text-muted-foreground">Session-Based Training Protocols</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Workout Library
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1.5 max-w-2xl">
                Explore scientifically structured single-session workouts. Target specific muscle groups, filter by equipment, and launch directly into your active workout tracker.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/routines')}
                className="gap-2 text-xs border-primary/30 hover:border-primary"
              >
                <Calendar className="w-4 h-4 text-primary" />
                View Multi-Day Routines
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/generator')}
                className="gap-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                AI Workout Generator
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by workout name, chest, barbell, calisthenics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card border border-border/60 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {/* Library Scope Selector (Curated vs Custom vs Favorites) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-card/60 rounded-xl border border-border/50 max-w-fit">
            <button
              type="button"
              onClick={() => setLibraryScope('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                libraryScope === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Workouts ({allAvailableWorkouts.length})
            </button>
            <button
              type="button"
              onClick={() => setLibraryScope('curated')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                libraryScope === 'curated'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Curated Templates ({WORKOUT_TEMPLATES.length})
            </button>
            <button
              type="button"
              onClick={() => setLibraryScope('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                libraryScope === 'custom'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              My Saved ({customWorkouts.length})
            </button>
            <button
              type="button"
              onClick={() => setLibraryScope('favorites')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                libraryScope === 'favorites'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Favorites ({favoriteIds.length})
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:block" />
            <div className="flex gap-1.5 shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-border/60 mx-1 hidden lg:block shrink-0" />

            <div className="flex gap-1.5 shrink-0">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-secondary text-secondary-foreground font-semibold shadow-sm'
                      : 'bg-card border border-border/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 px-1">
          <span>
            Showing <strong className="text-foreground">{filteredWorkouts.length}</strong> of{' '}
            {WORKOUT_TEMPLATES.length} workouts
          </span>
          {(searchTerm || selectedCategory !== 'All' || selectedDifficulty !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
              className="text-primary hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </section>

      {/* Workout Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {filteredWorkouts.length === 0 ? (
          <div className="text-center py-16 bg-card/20 rounded-2xl border border-dashed border-border/60">
            <Dumbbell className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-bold">No matching workouts found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
              Try adjusting your search criteria or resetting filters to see available workout templates.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWorkouts.map((workout) => {
              const isFav = favoriteIds.includes(workout.id);
              return (
                <Card
                  key={workout.id}
                  className="bg-card border-border/60 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-sm hover:shadow-lg"
                >
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-[11px] font-semibold border-primary/30 text-primary">
                          {workout.category}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`text-[11px] font-medium ${
                            workout.difficulty === 'Beginner'
                              ? 'text-emerald-500 bg-emerald-500/10'
                              : workout.difficulty === 'Intermediate'
                              ? 'text-amber-500 bg-amber-500/10'
                              : 'text-purple-500 bg-purple-500/10'
                          }`}
                        >
                          {workout.difficulty}
                        </Badge>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(e, workout.id)}
                        className={`p-1.5 rounded-full transition-colors ${
                          isFav
                            ? 'text-red-500 bg-red-500/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-snug">
                      {workout.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-4 flex-1">
                      {workout.description}
                    </p>

                    {/* Metadata Badges */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-muted/30 rounded-xl border border-border/30 text-xs mb-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{workout.durationMinutes} min</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{workout.exercises.length} moves</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>~{workout.estimatedCaloriesBurned || 350} kcal</span>
                      </div>
                    </div>

                    {/* Exercise Preview Stack */}
                    <div className="space-y-1.5 mb-4">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Included Exercises
                      </span>
                      {workout.exercises.slice(0, 3).map((ex, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-background/60 border border-border/30"
                        >
                          <span className="truncate font-medium text-foreground">{ex.name}</span>
                          <span className="text-[11px] text-muted-foreground shrink-0 ml-2">{ex.sets} sets</span>
                        </div>
                      ))}
                      {workout.exercises.length > 3 && (
                        <span className="text-[11px] text-muted-foreground block text-right">
                          +{workout.exercises.length - 3} more exercises
                        </span>
                      )}
                    </div>

                    {/* Target Muscle Pills */}
                    <div className="flex flex-wrap gap-1 mt-auto pt-2">
                      {workout.targetMuscles.map((m) => (
                        <span
                          key={m}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="p-4 bg-muted/20 border-t border-border/40 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveModalWorkout(workout)}
                      className="flex-1 text-xs gap-1.5 border-border/60 hover:border-primary/40"
                    >
                      Inspect Breakdown
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStartWorkout(workout)}
                      className="flex-1 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Start Workout
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Workout Detail Modal */}
      {activeModalWorkout && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-xl w-full max-h-[85vh] flex flex-col bg-card border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border/40 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs text-primary border-primary/40">
                    {activeModalWorkout.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{activeModalWorkout.durationMinutes} Minutes</span>
                </div>
                <h2 className="text-xl font-bold text-foreground">{activeModalWorkout.title}</h2>
                <p className="text-xs text-muted-foreground mt-1">{activeModalWorkout.description}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveModalWorkout(null)}>
                ✕
              </Button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Exercise Sequence ({activeModalWorkout.exercises.length})</span>
                <span>Rest Periods Configured</span>
              </div>

              <div className="space-y-2.5">
                {activeModalWorkout.exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-border/40 bg-background flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">{ex.name}</span>
                          <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {ex.equipment}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {ex.sets} sets • {ex.reps}
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-xs shrink-0">
                      <span className="text-muted-foreground">{ex.restSeconds || 60}s rest</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-border/40 bg-muted/20 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setActiveModalWorkout(null)} className="text-xs">
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const target = activeModalWorkout;
                  setActiveModalWorkout(null);
                  handleStartWorkout(target);
                }}
                className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Launch Into Tracker
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkoutLibrary;
