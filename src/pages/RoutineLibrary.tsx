import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { ROUTINE_PROGRAMS, RoutineProgram, RoutineDay } from '@/data/workoutTemplates';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Play,
  ArrowRight,
  Flame,
  Layers,
  Heart,
  ChevronRight,
  Dumbbell,
} from 'lucide-react';
import { useWorkout } from '@/contexts/WorkoutContext';
import { useToast } from '@/hooks/use-toast';
import { workoutRoutineService } from '@/lib/services/workoutRoutineService';

export const RoutineLibrary: React.FC = () => {
  const navigate = useNavigate();
  const { startWorkout, addExercise } = useWorkout();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedDaysFilter, setSelectedDaysFilter] = useState<number>(0);
  const [activeRoutineModal, setActiveRoutineModal] = useState<RoutineProgram | null>(null);
  const [selectedDayTab, setSelectedDayTab] = useState<number>(0);
  const [favoriteRoutineIds, setFavoriteRoutineIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fitbox_favorite_routines_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const goals = ['All', 'Hypertrophy', 'Strength', 'General Fitness'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const dayOptions = [
    { label: 'All Days', value: 0 },
    { label: '3 Days / Wk', value: 3 },
    { label: '4 Days / Wk', value: 4 },
    { label: '5 Days / Wk', value: 5 },
    { label: '6 Days / Wk', value: 6 },
  ];

  const filteredRoutines = useMemo(() => {
    return ROUTINE_PROGRAMS.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesGoal = selectedGoal === 'All' || r.goal === selectedGoal;
      const matchesLevel = selectedLevel === 'All' || r.level === selectedLevel;
      const matchesDays = selectedDaysFilter === 0 || r.daysPerWeek === selectedDaysFilter;

      return matchesSearch && matchesGoal && matchesLevel && matchesDays;
    });
  }, [searchTerm, selectedGoal, selectedLevel, selectedDaysFilter]);

  const toggleFavorite = (e: React.MouseEvent, routineId: string) => {
    e.stopPropagation();
    const isNowFav = workoutRoutineService.toggleFavoriteRoutine(routineId);
    setFavoriteRoutineIds((prev) =>
      isNowFav ? [...prev, routineId] : prev.filter((id) => id !== routineId)
    );
    toast({
      title: isNowFav ? 'Added to favorites' : 'Removed from favorites',
      description: isNowFav ? 'Program saved to your favorites.' : 'Program removed from favorites.',
    });
  };

  const handleAdoptRoutine = (routine: RoutineProgram) => {
    try {
      localStorage.setItem('fitbox_weekly_split_v1', JSON.stringify(routine.days));
      toast({
        title: 'Routine Adopted! 🎯',
        description: `Loaded "${routine.title}" into your Weekly Split Planner.`,
      });
      navigate('/split-builder');
    } catch (e) {
      console.warn('Failed to save adopted split:', e);
      navigate('/split-builder');
    }
  };

  const handleStartDayWorkout = (day: RoutineDay) => {
    if (day.isRest || day.exercises.length === 0) return;
    startWorkout(day.title);
    day.exercises.forEach((ex) => {
      addExercise(ex.name, ex.id);
    });

    toast({
      title: 'Workout session launched! 🚀',
      description: `Loaded "${day.title}" with ${day.exercises.length} exercises into active tracker.`,
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
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  MuscleWiki Structured Routines
                </Badge>
                <span className="text-xs text-muted-foreground">Multi-Day Training Periodization</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Routine Library
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1.5 max-w-2xl">
                Browse periodized multi-day workout programs. Discover PPL, Upper/Lower, and Full-Body splits, inspect individual training days, and adopt them into your personal Weekly Split Planner.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/workouts')}
                className="gap-2 text-xs border-primary/30 hover:border-primary"
              >
                <Dumbbell className="w-4 h-4 text-primary" />
                Single-Session Workouts
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/split-builder')}
                className="gap-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                Open Split Builder
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search routines by name, PPL, hypertrophy, full body..."
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

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:block" />
            <div className="flex gap-1.5 shrink-0">
              {goals.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGoal(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedGoal === g
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-border/60 mx-1 hidden lg:block shrink-0" />

            <div className="flex gap-1.5 shrink-0">
              {dayOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedDaysFilter(opt.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedDaysFilter === opt.value
                      ? 'bg-secondary text-secondary-foreground font-semibold shadow-sm'
                      : 'bg-card border border-border/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 px-1">
          <span>
            Showing <strong className="text-foreground">{filteredRoutines.length}</strong> of{' '}
            {ROUTINE_PROGRAMS.length} structured programs
          </span>
          {(searchTerm || selectedGoal !== 'All' || selectedLevel !== 'All' || selectedDaysFilter !== 0) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedGoal('All');
                setSelectedLevel('All');
                setSelectedDaysFilter(0);
              }}
              className="text-primary hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </section>

      {/* Routine Cards Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {filteredRoutines.length === 0 ? (
          <div className="text-center py-16 bg-card/20 rounded-2xl border border-dashed border-border/60">
            <Calendar className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-bold">No routines match your filters</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
              Try adjusting your training goal or frequency filter to find suitable routines.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedGoal('All');
                setSelectedLevel('All');
                setSelectedDaysFilter(0);
              }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRoutines.map((routine) => {
              const isFav = favoriteRoutineIds.includes(routine.id);
              const activeDays = routine.days.filter((d) => !d.isRest).length;
              const totalExercises = routine.days.reduce(
                (sum, d) => sum + (d.isRest ? 0 : d.exercises.length),
                0
              );

              return (
                <Card
                  key={routine.id}
                  className="bg-card border-border/60 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-sm hover:shadow-lg"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-xs font-semibold border-primary/30 text-primary">
                          {routine.goal}
                        </Badge>
                        <Badge variant="secondary" className="text-xs font-medium">
                          {routine.daysPerWeek} Days / Week
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`text-xs font-medium ${
                            routine.level === 'Beginner'
                              ? 'text-emerald-500 bg-emerald-500/10'
                              : routine.level === 'Intermediate'
                              ? 'text-amber-500 bg-amber-500/10'
                              : 'text-purple-500 bg-purple-500/10'
                          }`}
                        >
                          {routine.level}
                        </Badge>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(e, routine.id)}
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

                    <h2 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors leading-snug">
                      {routine.title}
                    </h2>
                    <span className="text-xs font-medium text-primary/90 mt-0.5">
                      {routine.subtitle}
                    </span>
                    <p className="text-xs text-muted-foreground mt-2 mb-4 line-clamp-3">
                      {routine.description}
                    </p>

                    {/* Schedule strip */}
                    <div className="p-3 bg-muted/30 rounded-xl border border-border/30 mb-4 text-xs">
                      <span className="font-semibold text-foreground block mb-1">Weekly Schedule</span>
                      <span className="text-muted-foreground">{routine.schedule}</span>
                    </div>

                    {/* Day pills preview */}
                    <div className="space-y-1.5 mb-4">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Microcycle Structure ({activeDays} Workouts, {7 - activeDays} Rest)
                      </span>
                      <div className="grid grid-cols-7 gap-1">
                        {routine.days.map((day) => (
                          <div
                            key={day.dayId}
                            className={`p-1.5 rounded text-center text-[10px] font-medium border ${
                              day.isRest
                                ? 'bg-muted/40 border-border/40 text-muted-foreground'
                                : 'bg-primary/10 border-primary/30 text-primary font-semibold'
                            }`}
                          >
                            <span className="block truncate">{day.dayName.slice(0, 3)}</span>
                            <span className="text-[9px] block opacity-80">
                              {day.isRest ? 'Rest' : `${day.exercises.length} ex`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-auto pt-2">
                      {routine.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-muted/20 border-t border-border/40 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDayTab(0);
                        setActiveRoutineModal(routine);
                      }}
                      className="flex-1 text-xs gap-1.5 border-border/60 hover:border-primary/40"
                    >
                      Inspect All Days
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAdoptRoutine(routine)}
                      className="flex-1 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Adopt Routine
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Routine Detail Inspector Modal */}
      {activeRoutineModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] flex flex-col bg-card border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border/40 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs text-primary border-primary/40">
                    {activeRoutineModal.goal}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{activeRoutineModal.daysPerWeek} Days/Week</span>
                </div>
                <h2 className="text-xl font-bold text-foreground">{activeRoutineModal.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{activeRoutineModal.subtitle}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveRoutineModal(null)}>
                ✕
              </Button>
            </div>

            {/* Day Selector Pills */}
            <div className="px-5 pt-3 pb-2 border-b border-border/40 bg-muted/20 overflow-x-auto flex gap-1.5">
              {activeRoutineModal.days.map((day, idx) => (
                <button
                  key={day.dayId}
                  onClick={() => setSelectedDayTab(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                    selectedDayTab === idx
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-background border border-border/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {day.dayName.slice(0, 3)}: {day.isRest ? 'Rest' : day.exercises.length + ' Moves'}
                </button>
              ))}
            </div>

            {/* Selected Day View */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {(() => {
                const day = activeRoutineModal.days[selectedDayTab] || activeRoutineModal.days[0];
                return (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          {day.dayName}
                        </span>
                        <h3 className="font-bold text-base text-foreground">{day.title}</h3>
                      </div>

                      {!day.isRest && day.exercises.length > 0 && (
                        <Button
                          size="sm"
                          onClick={() => {
                            const targetDay = day;
                            setActiveRoutineModal(null);
                            handleStartDayWorkout(targetDay);
                          }}
                          className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Launch This Day
                        </Button>
                      )}
                    </div>

                    {day.isRest ? (
                      <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/60">
                        <Calendar className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <h4 className="font-semibold text-foreground">Scheduled Rest & Muscle Recovery</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                          No lifting scheduled. Focus on hydration, 8 hours of sleep, and light walking or mobility work.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {day.exercises.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            className="p-3 rounded-xl border border-border/40 bg-background flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                                {exIdx + 1}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-foreground">{ex.name}</span>
                                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground">
                                    {ex.equipment}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">{ex.muscleGroup}</span>
                              </div>
                            </div>

                            <div className="text-right text-xs shrink-0">
                              <span className="font-semibold text-primary">{ex.sets} sets</span>
                              <span className="text-muted-foreground block text-[11px]">{ex.reps}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border/40 bg-muted/20 flex items-center justify-between gap-3">
              <Button variant="outline" size="sm" onClick={() => setActiveRoutineModal(null)} className="text-xs">
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const target = activeRoutineModal;
                  setActiveRoutineModal(null);
                  handleAdoptRoutine(target);
                }}
                className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Adopt Entire Routine into Split Planner
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RoutineLibrary;
