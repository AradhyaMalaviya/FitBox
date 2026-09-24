import { useState, useMemo, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { MuscleGroupFilter } from "@/components/MuscleGroupFilter";
import { ExerciseCard } from "@/components/ExerciseCard";
import { exercises } from "@/data/exercises";
import { getExerciseGroupFromDiagramId, getDisplayNameFromDiagramId } from "@/lib/muscleMapping";

const Exercises = () => {
  const { muscleId } = useParams<{ muscleId?: string }>();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Update selected muscle group when route parameter changes
  useEffect(() => {
    if (muscleId) {
      const exerciseGroup = getExerciseGroupFromDiagramId(muscleId);
      if (exerciseGroup) {
        setSelectedMuscleGroup(exerciseGroup);
      }
    } else {
      setSelectedMuscleGroup("All");
    }
  }, [muscleId]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesGroup = selectedMuscleGroup === "All" || exercise.muscleGroup === selectedMuscleGroup;
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exercise.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           exercise.equipment.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesGroup && matchesSearch;
    });
  }, [selectedMuscleGroup, searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Header */}
      <header className="py-8 px-6 border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Exercise Directory
            {muscleId && (
              <span className="text-2xl md:text-3xl text-primary ml-3">
                - {getDisplayNameFromDiagramId(muscleId)}
              </span>
            )}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {muscleId 
              ? `Exercises targeting ${getDisplayNameFromDiagramId(muscleId).toLowerCase()}`
              : "Browse our comprehensive collection of exercises organized by muscle groups"
            }
          </p>
          
          {/* Search Bar */}
          <div className="mt-6 max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search exercises by name, muscle group, or equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-lg bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
              />
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Exercise Directory */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Muscle Group Filter */}
          <MuscleGroupFilter 
            selectedGroup={selectedMuscleGroup}
            onGroupSelect={setSelectedMuscleGroup}
          />

          {/* Exercise Results */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground text-center">
              Showing {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} 
              {selectedMuscleGroup !== "All" && ` for ${selectedMuscleGroup}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>

          {/* Exercise Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredExercises.map((exercise, index) => (
              <div 
                key={exercise.id}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ExerciseCard exercise={exercise} />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredExercises.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏋️‍♀️</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No exercises found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter to find the exercises you're looking for.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Exercises;
