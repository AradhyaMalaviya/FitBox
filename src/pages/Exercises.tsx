import { useState, useMemo, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { MuscleGroupFilter } from "@/components/MuscleGroupFilter";
import { ExerciseCard } from "@/components/ExerciseCard";
import { exercises } from "@/data/exercises";
import { getExerciseGroupFromDiagramId, getDisplayNameFromDiagramId } from "@/lib/muscleMapping";
import { Button } from "@/components/ui/button";
import {
  Search,
  Dumbbell,
  ArrowLeft,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Compass,
} from "lucide-react";

const EQUIPMENT_OPTIONS = [
  "All",
  "Barbell",
  "Dumbbells",
  "Cables",
  "Machine",
  "Bodyweight",
  "Bench",
];

const DIFFICULTY_OPTIONS = ["All", "Beginner", "Intermediate", "Advanced"];

type SortOption = "name-asc" | "name-desc" | "diff-asc" | "diff-desc";

const Exercises = () => {
  const { muscleId } = useParams<{ muscleId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlMuscle = searchParams.get("muscle");
  const urlEquipment = searchParams.get("equipment");
  const urlDiff = searchParams.get("difficulty");
  const urlQ = searchParams.get("q");
  const urlSort = searchParams.get("sort") as SortOption | null;

  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(urlMuscle || "All");
  const [selectedEquipment, setSelectedEquipment] = useState(urlEquipment || "All");
  const [selectedDifficulty, setSelectedDifficulty] = useState(urlDiff || "All");
  const [searchTerm, setSearchTerm] = useState(urlQ || "");
  const [sortBy, setSortBy] = useState<SortOption>(urlSort || "name-asc");

  // Update selected muscle group when route parameter changes
  useEffect(() => {
    if (muscleId) {
      const exerciseGroup = getExerciseGroupFromDiagramId(muscleId);
      if (exerciseGroup) {
        setSelectedMuscleGroup(exerciseGroup);
      }
    }
  }, [muscleId]);

  // Synchronize filter state with URL search parameters
  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedMuscleGroup !== "All") params.muscle = selectedMuscleGroup;
    if (selectedEquipment !== "All") params.equipment = selectedEquipment;
    if (selectedDifficulty !== "All") params.difficulty = selectedDifficulty;
    if (searchTerm.trim()) params.q = searchTerm.trim();
    if (sortBy !== "name-asc") params.sort = sortBy;
    setSearchParams(params, { replace: true });
  }, [selectedMuscleGroup, selectedEquipment, selectedDifficulty, searchTerm, sortBy, setSearchParams]);

  const resetFilters = () => {
    setSelectedMuscleGroup("All");
    setSelectedEquipment("All");
    setSelectedDifficulty("All");
    setSearchTerm("");
    setSortBy("name-asc");
  };

  const hasActiveFilters =
    selectedMuscleGroup !== "All" ||
    selectedEquipment !== "All" ||
    selectedDifficulty !== "All" ||
    searchTerm.trim().length > 0 ||
    sortBy !== "name-asc";

  const filteredExercises = useMemo(() => {
    const filtered = exercises.filter((exercise) => {
      // Muscle Group Filter
      const matchesGroup =
        selectedMuscleGroup === "All" ||
        exercise.muscleGroup.toLowerCase() === selectedMuscleGroup.toLowerCase();

      // Equipment Filter
      const matchesEquipment =
        selectedEquipment === "All" ||
        exercise.equipment.toLowerCase().includes(selectedEquipment.toLowerCase());

      // Difficulty Filter
      const matchesDifficulty =
        selectedDifficulty === "All" || exercise.difficulty === selectedDifficulty;

      // Search Filter
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        exercise.name.toLowerCase().includes(q) ||
        exercise.muscleGroup.toLowerCase().includes(q) ||
        exercise.equipment.toLowerCase().includes(q) ||
        (exercise.description && exercise.description.toLowerCase().includes(q));

      return matchesGroup && matchesEquipment && matchesDifficulty && matchesSearch;
    });

    const difficultyWeight: Record<string, number> = {
      Beginner: 1,
      Intermediate: 2,
      Advanced: 3,
    };

    return [...filtered].sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "diff-asc") return (difficultyWeight[a.difficulty] || 0) - (difficultyWeight[b.difficulty] || 0);
      if (sortBy === "diff-desc") return (difficultyWeight[b.difficulty] || 0) - (difficultyWeight[a.difficulty] || 0);
      return 0;
    });
  }, [selectedMuscleGroup, selectedEquipment, selectedDifficulty, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Header Banner */}
      <header className="py-8 px-6 border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Compass className="w-3.5 h-3.5 text-primary" />
                  Interactive Muscle Map
                </Button>
              </Link>
              <Link to="/generator">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Workout Generator
                </Button>
              </Link>
              <Link to="/stretches">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  🧘 Stretches
                </Button>
              </Link>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Exercise Directory
            {muscleId && (
              <span className="text-xl md:text-3xl text-primary ml-3 font-normal">
                • {getDisplayNameFromDiagramId(muscleId)}
              </span>
            )}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl">
            {muscleId
              ? `Scientifically documented exercises targeting the ${getDisplayNameFromDiagramId(
                  muscleId
                ).toLowerCase()} with form guides and setup cues.`
              : "Explore our full catalog of 96 strength and hypertrophy exercises across all major muscle groups."}
          </p>

          {/* Search Bar */}
          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search exercises by name, muscle, barbell, dumbbells, cables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Directory & Filtering Section */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Primary Muscle Group Filter */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block text-center">
              Target Muscle Group
            </span>
            <MuscleGroupFilter
              selectedGroup={selectedMuscleGroup}
              onGroupSelect={setSelectedMuscleGroup}
            />
          </div>

          {/* Secondary Filters Bar (Equipment & Difficulty) */}
          <div className="p-4 rounded-2xl bg-card/60 border border-border/50 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Equipment Row */}
              <div className="space-y-1.5 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-primary" />
                  Equipment
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {EQUIPMENT_OPTIONS.map((eq) => (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => setSelectedEquipment(eq)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedEquipment === eq
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-background border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Row */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                  Difficulty
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DIFFICULTY_OPTIONS.map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedDifficulty === diff
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-background border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results count, Sort & Clear All */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/40 text-xs">
              <span className="text-muted-foreground">
                Showing <strong className="text-foreground">{filteredExercises.length}</strong>{" "}
                of <strong className="text-foreground">{exercises.length}</strong> exercises
                {selectedMuscleGroup !== "All" && ` • ${selectedMuscleGroup}`}
                {selectedEquipment !== "All" && ` • ${selectedEquipment}`}
                {selectedDifficulty !== "All" && ` • ${selectedDifficulty}`}
              </span>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-background border border-border/60 rounded-md px-2 py-1 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="name-asc">Name (A–Z)</option>
                    <option value="name-desc">Name (Z–A)</option>
                    <option value="diff-asc">Difficulty (Easy first)</option>
                    <option value="diff-desc">Difficulty (Hard first)</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-primary hover:underline font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Exercise Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
            {filteredExercises.map((exercise, index) => (
              <div key={exercise.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <ExerciseCard exercise={exercise} />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredExercises.length === 0 && (
            <div className="text-center py-16 bg-card/40 rounded-2xl border border-border/40">
              <div className="text-6xl mb-3">🏋️‍♀️</div>
              <h3 className="text-xl font-bold text-foreground mb-1">No matching exercises found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                No exercises match your current combination of muscle group, equipment, and difficulty filters.
              </p>
              <Button onClick={resetFilters} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Exercises;
