import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  calculateOneRepMax,
  calculateBarbellPlates,
  calculateTDEE,
  calculateMacros,
  calculateBodyFat,
  calculateWorkoutBurn,
  ACTIVITY_MULTIPLIERS,
  type ActivityLevel,
  type MacroGoal,
} from '@/lib/muscleWikiCalculators';
import {
  Dumbbell,
  Calculator,
  Flame,
  Utensils,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  ChevronRight,
  TrendingUp,
  Percent,
  Activity,
  HeartPulse,
} from 'lucide-react';

const MuscleWikiTools: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || '1rm';
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setSearchParams({ tab: val });
  };

  // ─────────────────────────────────────────────────────────────
  // 1. ONE REP MAX & PLATE CALCULATOR STATE
  // ─────────────────────────────────────────────────────────────
  const [oneRepWeight, setOneRepWeight] = useState<number>(80);
  const [oneRepReps, setOneRepReps] = useState<number>(5);
  const [oneRepUnit, setOneRepUnit] = useState<'kg' | 'lbs'>('kg');
  const [barWeight, setBarWeight] = useState<number>(20);

  const oneRepResult = useMemo(() => {
    return calculateOneRepMax(oneRepWeight, oneRepReps, oneRepUnit);
  }, [oneRepWeight, oneRepReps, oneRepUnit]);

  const plateResult = useMemo(() => {
    return calculateBarbellPlates(oneRepResult.average, oneRepUnit, barWeight);
  }, [oneRepResult.average, oneRepUnit, barWeight]);

  // ─────────────────────────────────────────────────────────────
  // 2. CALORIE & TDEE CALCULATOR STATE
  // ─────────────────────────────────────────────────────────────
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(25);
  const [weightKg, setWeightKg] = useState<number>(75);
  const [heightCm, setHeightCm] = useState<number>(178);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');

  const tdeeResult = useMemo(() => {
    return calculateTDEE({
      gender,
      age,
      weightKg,
      heightCm,
      activityLevel: activity,
    });
  }, [gender, age, weightKg, heightCm, activity]);

  // ─────────────────────────────────────────────────────────────
  // 3. MACRO CALCULATOR STATE
  // ─────────────────────────────────────────────────────────────
  const [macroCalories, setMacroCalories] = useState<number>(2400);
  const [macroWeight, setMacroWeight] = useState<number>(75);
  const [macroGoal, setMacroGoal] = useState<MacroGoal>('cut');
  const [selectedMealsCount, setSelectedMealsCount] = useState<number>(4);

  const macroResult = useMemo(() => {
    return calculateMacros({
      targetCalories: macroCalories,
      weightKg: macroWeight,
      goal: macroGoal,
    });
  }, [macroCalories, macroWeight, macroGoal]);

  const handleApplyTdeeToMacros = (calories: number) => {
    setMacroCalories(calories);
    setMacroWeight(weightKg);
    setActiveTab('macros');
    setSearchParams({ tab: 'macros' });
  };

  // ─────────────────────────────────────────────────────────────
  // 4. BODY FAT (US NAVY METHOD) STATE
  // ─────────────────────────────────────────────────────────────
  const [bfGender, setBfGender] = useState<'male' | 'female'>('male');
  const [bfWeight, setBfWeight] = useState<number>(75);
  const [bfHeight, setBfHeight] = useState<number>(178);
  const [bfWaist, setBfWaist] = useState<number>(84);
  const [bfNeck, setBfNeck] = useState<number>(38);
  const [bfHip, setBfHip] = useState<number>(96);

  const bodyFatResult = useMemo(() => {
    return calculateBodyFat({
      gender: bfGender,
      weightKg: bfWeight,
      heightCm: bfHeight,
      waistCm: bfWaist,
      neckCm: bfNeck,
      hipCm: bfHip,
    });
  }, [bfGender, bfWeight, bfHeight, bfWaist, bfNeck, bfHip]);

  // ─────────────────────────────────────────────────────────────
  // 5. CALORIE BURN & METS STATE
  // ─────────────────────────────────────────────────────────────
  const [burnWeight, setBurnWeight] = useState<number>(75);
  const [burnDuration, setBurnDuration] = useState<number>(45);
  const [burnIntensity, setBurnIntensity] = useState<'light' | 'moderate' | 'vigorous' | 'hiit'>('moderate');

  const burnResult = useMemo(() => {
    return calculateWorkoutBurn({
      weightKg: burnWeight,
      durationMinutes: burnDuration,
      intensity: burnIntensity,
    });
  }, [burnWeight, burnDuration, burnIntensity]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Header */}
      <section className="border-b border-border/40 bg-card/40 backdrop-blur-md py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  MuscleWiki Fitness Suite
                </Badge>
                <span className="text-xs text-muted-foreground">Reverse-Engineered & Integrated</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Calculators & Analytics Hub
              </h1>
              <p className="text-muted-foreground mt-1 max-w-2xl text-sm sm:text-base">
                Scientifically calibrated calculators for strength potential, energy expenditure, body composition, and workout burn.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/generator">
                <Button variant="default" className="gap-2">
                  <Dumbbell className="w-4 h-4" />
                  Workout Generator
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
          <div className="flex justify-center sm:justify-start overflow-x-auto pb-1">
            <TabsList className="flex min-w-[500px] sm:min-w-0 sm:grid sm:grid-cols-5 max-w-2xl w-full bg-card/80 border border-border/50">
              <TabsTrigger value="1rm" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>1RM & Plates</span>
              </TabsTrigger>
              <TabsTrigger value="calories" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Flame className="w-3.5 h-3.5" />
                <span>Calories & TDEE</span>
              </TabsTrigger>
              <TabsTrigger value="macros" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Utensils className="w-3.5 h-3.5" />
                <span>Macros & Meals</span>
              </TabsTrigger>
              <TabsTrigger value="bodyfat" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Percent className="w-3.5 h-3.5" />
                <span>Body Fat %</span>
              </TabsTrigger>
              <TabsTrigger value="burn" className="gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Activity className="w-3.5 h-3.5" />
                <span>Calorie Burn</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ═════════════════════════════════════════════════════════ */}
          {/* TAB 1: ONE REP MAX & BARBELL PLATES */}
          {/* ═════════════════════════════════════════════════════════ */}
          <TabsContent value="1rm" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Inputs Panel */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-primary" />
                        Calculate Lift
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Enter weight and completed reps</p>
                    </div>
                    {/* Unit Toggle */}
                    <div className="flex items-center rounded-lg border border-border p-1 bg-muted/40">
                      <button
                        type="button"
                        onClick={() => {
                          setOneRepUnit('kg');
                          setBarWeight(20);
                        }}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                          oneRepUnit === 'kg' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        KG
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOneRepUnit('lbs');
                          setBarWeight(45);
                        }}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                          oneRepUnit === 'lbs' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        LBS
                      </button>
                    </div>
                  </div>

                  {/* Weight Slider & Input */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-foreground">Lifted Weight</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={oneRepWeight}
                          onChange={(e) => setOneRepWeight(Math.max(1, Number(e.target.value) || 0))}
                          className="w-20 px-2.5 py-1 text-right text-base font-bold bg-background border border-border rounded-md focus:border-primary outline-none"
                        />
                        <span className="text-xs font-medium text-muted-foreground">{oneRepUnit}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max={oneRepUnit === 'kg' ? 300 : 660}
                      step="2.5"
                      value={oneRepWeight}
                      onChange={(e) => setOneRepWeight(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Reps Slider & Input */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-foreground">Completed Repetitions</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={oneRepReps}
                          min="1"
                          max="30"
                          onChange={(e) => setOneRepReps(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                          className="w-16 px-2.5 py-1 text-right text-base font-bold bg-background border border-border rounded-md focus:border-primary outline-none"
                        />
                        <span className="text-xs font-medium text-muted-foreground">reps</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={oneRepReps}
                      onChange={(e) => setOneRepReps(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground px-1">
                      <span>1 (Direct 1RM)</span>
                      <span>5 (Strength)</span>
                      <span>10 (Hypertrophy)</span>
                      <span>20+</span>
                    </div>
                  </div>

                  {/* Bar Weight Setting */}
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Olympic Barbell Tare Weight:</span>
                    <span className="font-semibold text-foreground">{barWeight} {oneRepUnit}</span>
                  </div>
                </Card>

                {/* Primary Result Banner */}
                <Card className="p-6 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-primary/30 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase font-bold tracking-wider text-primary">Estimated 1-Rep Max</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-5xl font-black text-foreground">{oneRepResult.average}</span>
                        <span className="text-lg font-bold text-muted-foreground">{oneRepUnit}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Based on {oneRepWeight} {oneRepUnit} × {oneRepReps} reps using MuscleWiki scientific consensus.
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Formula Breakdown chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4 pt-4 border-t border-border/40 text-center">
                    <div className="bg-background/60 rounded p-2 border border-border/30">
                      <span className="text-[10px] text-muted-foreground block">Epley</span>
                      <span className="text-xs font-bold">{oneRepResult.epley} {oneRepUnit}</span>
                    </div>
                    <div className="bg-background/60 rounded p-2 border border-border/30">
                      <span className="text-[10px] text-muted-foreground block">Brzycki</span>
                      <span className="text-xs font-bold">{oneRepResult.brzycki} {oneRepUnit}</span>
                    </div>
                    <div className="bg-background/60 rounded p-2 border border-border/30">
                      <span className="text-[10px] text-muted-foreground block">Lander</span>
                      <span className="text-xs font-bold">{oneRepResult.lander} {oneRepUnit}</span>
                    </div>
                    <div className="bg-background/60 rounded p-2 border border-border/30">
                      <span className="text-[10px] text-muted-foreground block">Lombardi</span>
                      <span className="text-xs font-bold">{oneRepResult.lombardi} {oneRepUnit}</span>
                    </div>
                    <div className="bg-background/60 rounded p-2 border border-border/30">
                      <span className="text-[10px] text-muted-foreground block">O'Conner</span>
                      <span className="text-xs font-bold">{oneRepResult.oconner} {oneRepUnit}</span>
                    </div>
                    <div className="bg-background/60 rounded p-2 border border-border/30">
                      <span className="text-[10px] text-muted-foreground block">Wathan</span>
                      <span className="text-xs font-bold">{oneRepResult.wathan} {oneRepUnit}</span>
                    </div>
                  </div>
                </Card>

                {/* Olympic Barbell Plate Loader Visualizer */}
                <Card className="p-6 bg-card/80 border-border/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-primary" />
                      Barbell Plate Loader (Per Side)
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {plateResult.weightPerSide} {oneRepUnit} / side
                    </Badge>
                  </div>

                  {/* Interactive Barbell Graphical Display */}
                  <div className="py-4 px-3 bg-muted/40 rounded-xl border border-border/50 flex items-center justify-center overflow-x-auto">
                    <div className="flex items-center min-w-[280px]">
                      {/* Bar Collar Left */}
                      <div className="h-4 w-12 bg-zinc-500 rounded-l-sm" />
                      <div className="h-10 w-2.5 bg-zinc-600 border-r border-zinc-700" />

                      {/* Plates stack on barbell */}
                      <div className="flex items-center gap-1 px-2">
                        {plateResult.platesPerSide.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">Empty Bar ({barWeight} {oneRepUnit})</span>
                        ) : (
                          plateResult.platesPerSide.flatMap((plate, idx) =>
                            Array.from({ length: plate.count }).map((_, cIdx) => (
                              <div
                                key={`${idx}-${cIdx}`}
                                className="flex flex-col items-center justify-center text-[10px] font-bold text-white shadow-md transition-all hover:scale-105"
                                style={{
                                  backgroundColor: plate.color,
                                  width: `${Math.max(14, Math.min(22, 10 + plate.weight / 2))}px`,
                                  height: `${Math.max(40, Math.min(76, 36 + plate.weight * 1.5))}px`,
                                  borderRadius: '3px',
                                  color: plate.color === '#ffffff' ? '#000000' : '#ffffff',
                                  border: '1px solid rgba(0,0,0,0.2)',
                                }}
                                title={`${plate.weight} ${oneRepUnit}`}
                              >
                                <span className="rotate-90 select-none">{plate.weight}</span>
                              </div>
                            ))
                          )
                        )}
                      </div>

                      {/* Bar Sleeve & Center */}
                      <div className="h-10 w-2.5 bg-zinc-600 border-l border-zinc-700" />
                      <div className="h-4 w-28 bg-zinc-400 border-y border-zinc-500 flex items-center justify-center">
                        <span className="text-[9px] text-zinc-800 font-semibold select-none">BARBELL</span>
                      </div>
                    </div>
                  </div>

                  {/* Plates Breakdown Checklist */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {plateResult.platesPerSide.map((plate) => (
                      <div key={plate.weight} className="flex items-center justify-between p-2 rounded bg-background border border-border/40">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full inline-block border border-border/50"
                            style={{ backgroundColor: plate.color }}
                          />
                          <span className="font-semibold">{plate.weight} {oneRepUnit} plate</span>
                        </div>
                        <Badge variant="outline" className="font-bold">
                          × {plate.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Training Zones Table Panel */}
              <div className="lg:col-span-7 space-y-4">
                <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
                    <div>
                      <h2 className="text-xl font-bold">1RM Training Percentages & Zones</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Target weights optimized for Strength, Hypertrophy, and Muscular Endurance
                      </p>
                    </div>
                    <Badge variant="outline" className="self-start sm:self-auto text-xs">
                      Max: {oneRepResult.average} {oneRepUnit}
                    </Badge>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border/50 text-xs text-muted-foreground">
                          <th className="py-2.5 px-3">Intensity</th>
                          <th className="py-2.5 px-3">Target Weight</th>
                          <th className="py-2.5 px-3">Reps</th>
                          <th className="py-2.5 px-3">Training Objective</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {oneRepResult.percentageTable.map((row) => {
                          const getZoneBadge = (zone: string) => {
                            switch (zone) {
                              case 'Max Strength':
                                return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[11px]">Max Strength</Badge>;
                              case 'Strength':
                                return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[11px]">Strength</Badge>;
                              case 'Hypertrophy':
                                return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[11px]">Hypertrophy</Badge>;
                              case 'Endurance':
                                return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[11px]">Endurance</Badge>;
                              default:
                                return <Badge variant="outline">{zone}</Badge>;
                            }
                          };

                          return (
                            <tr key={row.percentage} className="hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-3 font-bold text-foreground">
                                {row.percentage}%
                              </td>
                              <td className="py-3 px-3 font-extrabold text-primary">
                                {row.weight} <span className="text-xs font-normal text-muted-foreground">{oneRepUnit}</span>
                              </td>
                              <td className="py-3 px-3 text-muted-foreground font-medium">
                                {row.reps} {row.reps === 1 ? 'rep' : 'reps'}
                              </td>
                              <td className="py-3 px-3">
                                {getZoneBadge(row.zone)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong>Formula Note:</strong> 1RM approximations become slightly less accurate as reps exceed 10. For maximal strength testing, test with weights you can lift for 3–5 clean repetitions.
                    </span>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ═════════════════════════════════════════════════════════ */}
          {/* TAB 2: CALORIES & TDEE */}
          {/* ═════════════════════════════════════════════════════════ */}
          <TabsContent value="calories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Input Panel */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-5">
                  <div className="border-b border-border/40 pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      Body Stats & Activity
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Mifflin-St Jeor & Harris-Benedict algorithms</p>
                  </div>

                  {/* Gender Toggle */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Biological Sex</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setGender('male')}
                        className={`py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                          gender === 'male'
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('female')}
                        className={`py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                          gender === 'female'
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold">Age</label>
                      <span className="font-bold text-foreground text-sm">{age} years</span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="85"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Weight */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold">Weight</label>
                      <span className="font-bold text-foreground text-sm">{weightKg} kg ({Math.round(weightKg * 2.20462)} lbs)</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="180"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Height */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold">Height</label>
                      <span className="font-bold text-foreground text-sm">{heightCm} cm ({Math.floor(heightCm / 30.48)}'{Math.round((heightCm % 30.48) / 2.54)}")</span>
                    </div>
                    <input
                      type="range"
                      min="130"
                      max="220"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Activity Level Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Activity Multiplier</label>
                    <div className="space-y-2">
                      {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((key) => {
                        const item = ACTIVITY_MULTIPLIERS[key];
                        const isSelected = activity === key;
                        return (
                          <div
                            key={key}
                            onClick={() => setActivity(key)}
                            className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-primary/10 border-primary shadow-sm'
                                : 'bg-background/60 border-border/40 hover:bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-foreground">{item.label}</span>
                              <Badge variant={isSelected ? 'default' : 'secondary'} className="text-[10px]">
                                × {item.multiplier}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </div>

              {/* TDEE Results Panel */}
              <div className="lg:col-span-7 space-y-6">
                {/* Highlight Hero Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="p-6 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-primary/30">
                    <p className="text-xs uppercase font-bold tracking-wider text-primary">Maintenance Calories (TDEE)</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl sm:text-5xl font-black text-foreground">{tdeeResult.tdee}</span>
                      <span className="text-sm font-bold text-muted-foreground">kcal/day</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Total daily energy expenditure required to keep your bodyweight steady.
                    </p>
                  </Card>

                  <Card className="p-6 bg-card/80 border-border/60">
                    <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Basal Metabolic Rate (BMR)</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl sm:text-5xl font-black text-foreground">{tdeeResult.bmrAverage}</span>
                      <span className="text-sm font-bold text-muted-foreground">kcal/day</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Calories burned at complete rest just keeping vital organs functioning.
                    </p>
                  </Card>
                </div>

                {/* Calorie Goals Breakdown Cards */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold">Goal Targets & Calorie Adjustments</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Fat Loss standard */}
                    <Card className="p-4 bg-card/80 border-border/60 hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm text-foreground">Moderate Fat Loss</span>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                            -500 kcal
                          </Badge>
                        </div>
                        <p className="text-2xl font-black text-emerald-400 mt-2">{tdeeResult.deficitStandard} <span className="text-xs font-normal text-muted-foreground">kcal</span></p>
                        <p className="text-xs text-muted-foreground mt-1">~0.5 kg (1.1 lbs) sustainable fat loss/week.</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleApplyTdeeToMacros(tdeeResult.deficitStandard)}
                        className="mt-3 w-full justify-between text-xs text-primary hover:text-primary hover:bg-primary/10"
                      >
                        Calculate Macros for This Goal
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Card>

                    {/* Mild Fat Loss */}
                    <Card className="p-4 bg-card/80 border-border/60 hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm text-foreground">Mild Fat Loss</span>
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                            -250 kcal
                          </Badge>
                        </div>
                        <p className="text-2xl font-black text-emerald-400 mt-2">{tdeeResult.deficitMild} <span className="text-xs font-normal text-muted-foreground">kcal</span></p>
                        <p className="text-xs text-muted-foreground mt-1">Gentle cut preserving maximum muscle tissue & strength.</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleApplyTdeeToMacros(tdeeResult.deficitMild)}
                        className="mt-3 w-full justify-between text-xs text-primary hover:text-primary hover:bg-primary/10"
                      >
                        Calculate Macros for This Goal
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Card>

                    {/* Lean Bulk */}
                    <Card className="p-4 bg-card/80 border-border/60 hover:border-blue-500/40 transition-colors flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm text-foreground">Lean Muscle Gain</span>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                            +250 kcal
                          </Badge>
                        </div>
                        <p className="text-2xl font-black text-blue-400 mt-2">{tdeeResult.surplusLean} <span className="text-xs font-normal text-muted-foreground">kcal</span></p>
                        <p className="text-xs text-muted-foreground mt-1">Lean mass accrual with minimal unwanted fat accumulation.</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleApplyTdeeToMacros(tdeeResult.surplusLean)}
                        className="mt-3 w-full justify-between text-xs text-primary hover:text-primary hover:bg-primary/10"
                      >
                        Calculate Macros for This Goal
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Card>

                    {/* Aggressive Bulk */}
                    <Card className="p-4 bg-card/80 border-border/60 hover:border-amber-500/40 transition-colors flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm text-foreground">Hypertrophy Bulk</span>
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                            +500 kcal
                          </Badge>
                        </div>
                        <p className="text-2xl font-black text-amber-400 mt-2">{tdeeResult.surplusBulk} <span className="text-xs font-normal text-muted-foreground">kcal</span></p>
                        <p className="text-xs text-muted-foreground mt-1">Maximum recovery and growth for hardgainers & heavy lifters.</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleApplyTdeeToMacros(tdeeResult.surplusBulk)}
                        className="mt-3 w-full justify-between text-xs text-primary hover:text-primary hover:bg-primary/10"
                      >
                        Calculate Macros for This Goal
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═════════════════════════════════════════════════════════ */}
          {/* TAB 3: MACROS & MEAL STACK */}
          {/* ═════════════════════════════════════════════════════════ */}
          <TabsContent value="macros" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Inputs Panel */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-5">
                  <div className="border-b border-border/40 pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-primary" />
                      Macro Configuration
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Custom protein, fat, and carbohydrate ratios</p>
                  </div>

                  {/* Calories Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold">Target Calories</label>
                      <span className="font-bold text-foreground text-sm">{macroCalories} kcal</span>
                    </div>
                    <input
                      type="range"
                      min="1200"
                      max="4500"
                      step="50"
                      value={macroCalories}
                      onChange={(e) => setMacroCalories(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Body Weight */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold">Body Weight</label>
                      <span className="font-bold text-foreground text-sm">{macroWeight} kg</span>
                    </div>
                    <input
                      type="range"
                      min="45"
                      max="150"
                      value={macroWeight}
                      onChange={(e) => setMacroWeight(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Goal Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Nutrition Goal</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['cut', 'maintain', 'bulk'] as MacroGoal[]).map((goalKey) => (
                        <button
                          key={goalKey}
                          type="button"
                          onClick={() => setMacroGoal(goalKey)}
                          className={`py-2 rounded-lg border text-xs font-semibold capitalize transition-all ${
                            macroGoal === goalKey
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-background border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {goalKey}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Meals Per Day */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Meals Per Day</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 4, 5, 6].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setSelectedMealsCount(count)}
                          className={`py-2 rounded-lg border text-xs font-semibold transition-all ${
                            selectedMealsCount === count
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-background border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {count} Meals
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Macro Output Cards & Meal Split */}
              <div className="lg:col-span-7 space-y-6">
                {/* 3 Macro Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Protein */}
                  <Card className="p-5 bg-card/80 border-primary/40 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">Protein</span>
                      <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">
                        4 kcal/g
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <p className="text-4xl font-black text-foreground">{macroResult.proteinGrams}g</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {macroResult.proteinCalories} kcal ({Math.round((macroResult.proteinCalories / macroResult.targetCalories) * 100)}%)
                      </p>
                    </div>
                  </Card>

                  {/* Fats */}
                  <Card className="p-5 bg-card/80 border-amber-500/40 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Fats</span>
                      <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px]">
                        9 kcal/g
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <p className="text-4xl font-black text-foreground">{macroResult.fatGrams}g</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {macroResult.fatCalories} kcal ({Math.round((macroResult.fatCalories / macroResult.targetCalories) * 100)}%)
                      </p>
                    </div>
                  </Card>

                  {/* Carbs */}
                  <Card className="p-5 bg-card/80 border-emerald-500/40 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Carbs</span>
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                        4 kcal/g
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <p className="text-4xl font-black text-foreground">{macroResult.carbGrams}g</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {macroResult.carbCalories} kcal ({Math.round((macroResult.carbCalories / macroResult.targetCalories) * 100)}%)
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Per-Meal Breakdown Table */}
                <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div>
                      <h3 className="font-bold text-lg">Per-Meal Distribution Stack</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Even distribution across {selectedMealsCount} meals throughout the day
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {macroResult.mealSplits[selectedMealsCount]?.caloriesPerMeal} kcal / meal
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                      <span className="text-xs font-semibold text-primary block">Protein / Meal</span>
                      <span className="text-2xl font-black text-foreground">
                        {macroResult.mealSplits[selectedMealsCount]?.proteinPerMeal}g
                      </span>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      <span className="text-xs font-semibold text-amber-400 block">Fats / Meal</span>
                      <span className="text-2xl font-black text-foreground">
                        {macroResult.mealSplits[selectedMealsCount]?.fatPerMeal}g
                      </span>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <span className="text-xs font-semibold text-emerald-400 block">Carbs / Meal</span>
                      <span className="text-2xl font-black text-foreground">
                        {macroResult.mealSplits[selectedMealsCount]?.carbPerMeal}g
                      </span>
                    </div>
                    <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
                      <span className="text-xs font-semibold text-muted-foreground block">Calories / Meal</span>
                      <span className="text-2xl font-black text-foreground">
                        {macroResult.mealSplits[selectedMealsCount]?.caloriesPerMeal}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Link to="/nutrition">
                      <Button variant="outline" size="sm" className="gap-2">
                        <span>Open FitBox Nutrition Planner</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ═════════════════════════════════════════════════════════ */}
          {/* TAB 4: BODY FAT PERCENTAGE (US NAVY METHOD) */}
          {/* ═════════════════════════════════════════════════════════ */}
          <TabsContent value="bodyfat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Input Panel */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-5">
                  <div className="border-b border-border/40 pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Percent className="w-5 h-5 text-primary" />
                      Anthropometric Measurements
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Official US Navy Circumference Method</p>
                  </div>

                  {/* Gender Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Biological Sex</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setBfGender('male')}
                        className={`py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                          bfGender === 'male'
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setBfGender('female')}
                        className={`py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                          bfGender === 'female'
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>

                  {/* Height */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold">Height</label>
                      <span className="font-bold text-foreground text-sm">{bfHeight} cm</span>
                    </div>
                    <input
                      type="range"
                      min="140"
                      max="220"
                      value={bfHeight}
                      onChange={(e) => setBfHeight(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Weight */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold">Weight</label>
                      <span className="font-bold text-foreground text-sm">{bfWeight} kg</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="160"
                      value={bfWeight}
                      onChange={(e) => setBfWeight(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Waist Circumference (at navel) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold">Waist Circumference (at navel)</label>
                      <span className="font-bold text-foreground text-sm">{bfWaist} cm</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={bfWaist}
                      onChange={(e) => setBfWaist(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Neck Circumference */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold">Neck Circumference (below Adam's apple)</label>
                      <span className="font-bold text-foreground text-sm">{bfNeck} cm</span>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="60"
                      value={bfNeck}
                      onChange={(e) => setBfNeck(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Hip Circumference (for females) */}
                  {bfGender === 'female' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold">Hip Circumference (at widest point)</label>
                        <span className="font-bold text-foreground text-sm">{bfHip} cm</span>
                      </div>
                      <input
                        type="range"
                        min="60"
                        max="160"
                        value={bfHip}
                        onChange={(e) => setBfHip(Number(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
                      />
                    </div>
                  )}
                </Card>
              </div>

              {/* Body Fat Results Panel */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="p-6 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-primary/30 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase font-bold tracking-wider text-primary">Estimated Body Fat Percentage</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-5xl sm:text-6xl font-black text-foreground">{bodyFatResult.bodyFatPercentage}%</span>
                        <Badge variant="default" className="text-xs font-bold">
                          {bodyFatResult.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 max-w-md">
                        {bodyFatResult.description}
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                      <Percent className="w-7 h-7" />
                    </div>
                  </div>

                  {/* Mass Breakdown */}
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border/40">
                    <div className="p-4 bg-background/60 rounded-xl border border-border/40 text-center">
                      <span className="text-xs text-muted-foreground block">Lean Body Mass</span>
                      <span className="text-3xl font-black text-foreground mt-1 block">{bodyFatResult.leanMassKg} kg</span>
                      <span className="text-[11px] text-muted-foreground">Muscle, bone, & organs</span>
                    </div>
                    <div className="p-4 bg-background/60 rounded-xl border border-border/40 text-center">
                      <span className="text-xs text-muted-foreground block">Adipose Fat Mass</span>
                      <span className="text-3xl font-black text-primary mt-1 block">{bodyFatResult.fatMassKg} kg</span>
                      <span className="text-[11px] text-muted-foreground">Essential + storage fat</span>
                    </div>
                  </div>
                </Card>

                {/* Reference Ranges Table */}
                <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-3">
                  <h3 className="font-bold text-base">Standard Body Composition Standards ({bfGender.toUpperCase()})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                    <div className={`p-2.5 rounded-lg border ${bodyFatResult.category === 'Essential Fat' ? 'bg-primary/20 border-primary font-bold' : 'bg-muted/40 border-border/40'}`}>
                      <span className="block text-[10px] text-muted-foreground">Essential</span>
                      <span className="text-xs font-semibold">{bfGender === 'male' ? '2–5%' : '10–13%'}</span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${bodyFatResult.category === 'Athletes' ? 'bg-primary/20 border-primary font-bold' : 'bg-muted/40 border-border/40'}`}>
                      <span className="block text-[10px] text-muted-foreground">Athletes</span>
                      <span className="text-xs font-semibold">{bfGender === 'male' ? '6–13%' : '14–20%'}</span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${bodyFatResult.category === 'Fitness' ? 'bg-primary/20 border-primary font-bold' : 'bg-muted/40 border-border/40'}`}>
                      <span className="block text-[10px] text-muted-foreground">Fitness</span>
                      <span className="text-xs font-semibold">{bfGender === 'male' ? '14–17%' : '21–24%'}</span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${bodyFatResult.category === 'Average' ? 'bg-primary/20 border-primary font-bold' : 'bg-muted/40 border-border/40'}`}>
                      <span className="block text-[10px] text-muted-foreground">Average</span>
                      <span className="text-xs font-semibold">{bfGender === 'male' ? '18–24%' : '25–31%'}</span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${bodyFatResult.category === 'Obese' ? 'bg-destructive/20 border-destructive font-bold' : 'bg-muted/40 border-border/40'}`}>
                      <span className="block text-[10px] text-muted-foreground">Obese</span>
                      <span className="text-xs font-semibold">{bfGender === 'male' ? '25%+' : '32%+'}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ═════════════════════════════════════════════════════════ */}
          {/* TAB 5: CALORIE BURN & METS */}
          {/* ═════════════════════════════════════════════════════════ */}
          <TabsContent value="burn" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Input Panel */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="p-6 bg-card/80 border-border/60 shadow-sm space-y-5">
                  <div className="border-b border-border/40 pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Session Burn Parameters
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Metabolic Equivalent of Task (MET) Model</p>
                  </div>

                  {/* Body Weight */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold">Athlete Bodyweight</label>
                      <span className="font-bold text-foreground text-sm">{burnWeight} kg</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="150"
                      value={burnWeight}
                      onChange={(e) => setBurnWeight(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold">Workout Duration</label>
                      <span className="font-bold text-foreground text-sm">{burnDuration} minutes</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="150"
                      step="5"
                      value={burnDuration}
                      onChange={(e) => setBurnDuration(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  {/* Intensity Mode */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Training Modality & Intensity</label>
                    <div className="space-y-2">
                      {[
                        { id: 'light' as const, label: 'Light Circuit / Mobility', desc: 'Low heart rate, machine circuit (MET 3.5)' },
                        { id: 'moderate' as const, label: 'Standard Hypertrophy Lifting', desc: 'Rest periods 60-90s, bodybuilding (MET 5.5)' },
                        { id: 'vigorous' as const, label: 'Heavy Compound Powerlifting', desc: 'Squats, deadlifts, heavy sets (MET 7.5)' },
                        { id: 'hiit' as const, label: 'HIIT / Functional Cross-Training', desc: 'Tabata, sprints, minimal rest (MET 10.0)' },
                      ].map((item) => {
                        const isSelected = burnIntensity === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setBurnIntensity(item.id)}
                            className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-primary/10 border-primary shadow-sm'
                                : 'bg-background/60 border-border/40 hover:bg-muted/30'
                            }`}
                          >
                            <span className="text-xs font-bold text-foreground block">{item.label}</span>
                            <span className="text-[11px] text-muted-foreground mt-0.5 block">{item.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Calorie Burn Output Panel */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="p-6 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border-primary/30 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase font-bold tracking-wider text-primary">Estimated Session Energy Burn</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-5xl sm:text-6xl font-black text-foreground">{burnResult.caloriesBurned}</span>
                        <span className="text-xl font-bold text-muted-foreground">kcal</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 max-w-md">
                        {burnResult.intensityLabel} for {burnDuration} minutes at {burnWeight} kg bodyweight.
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                      <Flame className="w-7 h-7" />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      Use this expenditure to calibrate post-workout recovery carb and protein intake!
                    </span>
                    <Link to="/workout/active">
                      <Button size="sm" className="gap-2">
                        <Dumbbell className="w-4 h-4" />
                        Log Workout Live
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MuscleWikiTools;
