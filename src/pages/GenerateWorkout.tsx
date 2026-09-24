import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { exercises, Exercise } from "@/data/exercises";
import { ExerciseCard } from "@/components/ExerciseCard";
import { ArrowLeft, Sparkles } from "lucide-react";

type FitnessLevel = 'Beginner' | 'Intermediate' | 'Advanced' | null;

const muscleGroups = ['Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core'];

const GenerateWorkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preselected = location.state?.preselectedExercise as Exercise | undefined;

  const [step, setStep] = useState<'intro' | 'level' | 'bodyPart' | 'exercises'>(
    preselected ? 'exercises' : 'intro'
  );
  const [selectedLevel, setSelectedLevel] = useState<FitnessLevel>(
    preselected ? (preselected.difficulty as FitnessLevel) : null
  );
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>(
    preselected ? [preselected.muscleGroup] : []
  );

  const handleBodyPartToggle = (bodyPart: string) => {
    setSelectedBodyParts(prev => 
      prev.includes(bodyPart) 
        ? prev.filter(bp => bp !== bodyPart)
        : [...prev, bodyPart]
    );
  };

  const getFilteredExercises = (): Exercise[] => {
    let filtered = exercises;

    // Filter by level
    if (selectedLevel) {
      filtered = filtered.filter(ex => ex.difficulty === selectedLevel);
    }

    // Filter by body parts
    if (selectedBodyParts.length > 0) {
      filtered = filtered.filter(ex => selectedBodyParts.includes(ex.muscleGroup));
    }

    return filtered;
  };

  const filteredExercises = getFilteredExercises();

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-3xl w-full p-8 md:p-12 bg-card/80 backdrop-blur-sm border-primary/30">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Sparkles className="w-16 h-16 text-primary animate-pulse" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Generate Your Custom Workout!
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Welcome to your personalized fitness experience! 💪
            </p>
            
            <div className="space-y-4 text-left bg-card/50 p-6 rounded-lg border border-border/50">
              <p className="text-foreground">Let's begin by getting to know you a bit better:</p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">➤</span>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Choose your fitness level:</strong> Beginner, Intermediate, or Advanced
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">➤</span>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Tell us what you'd like to work on today:</strong> Select one or more body parts you want to train — chest, back, arms, legs, shoulders, core
                  </p>
                </div>
              </div>
              
              <p className="text-muted-foreground mt-4">
                Once you've made your selections, we'll instantly generate a custom workout plan, 
                showing you exercises from easiest to most challenging, tailored just for your level and goals.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button 
                size="lg"
                onClick={() => setStep('level')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
              >
                ✨ Continue
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-lg font-semibold"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 'level') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-3xl w-full p-8 md:p-12 bg-card/80 backdrop-blur-sm border-primary/30">
          <Button 
            variant="ghost" 
            onClick={() => setStep('intro')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Choose Your Fitness Level
              </h2>
              <p className="text-muted-foreground">
                Select the level that best matches your current experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setSelectedLevel(level);
                    setStep('bodyPart');
                  }}
                  className={`p-8 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    selectedLevel === level
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                      : 'border-border/50 bg-card/50 hover:border-primary/50'
                  }`}
                >
                  <div className="text-4xl mb-4">
                    {level === 'Beginner' && '🌱'}
                    {level === 'Intermediate' && '💪'}
                    {level === 'Advanced' && '🏆'}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{level}</h3>
                  <p className="text-sm text-muted-foreground">
                    {level === 'Beginner' && 'Just starting your fitness journey'}
                    {level === 'Intermediate' && 'Building strength and technique'}
                    {level === 'Advanced' && 'Mastering advanced movements'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 'bodyPart') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-3xl w-full p-8 md:p-12 bg-card/80 backdrop-blur-sm border-primary/30">
          <Button 
            variant="ghost" 
            onClick={() => setStep('level')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                What Would You Like to Work On Today?
              </h2>
              <p className="text-muted-foreground">
                Select one or more body parts to train
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {muscleGroups.map((group) => (
                <label
                  key={group}
                  className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    selectedBodyParts.includes(group)
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                      : 'border-border/50 bg-card/50 hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Checkbox 
                      checked={selectedBodyParts.includes(group)}
                      onCheckedChange={() => handleBodyPartToggle(group)}
                      className="w-5 h-5"
                    />
                    <div className="text-3xl">
                      {group === 'Chest' && '💪'}
                      {group === 'Back' && '🦸'}
                      {group === 'Legs' && '🦵'}
                      {group === 'Arms' && '💪'}
                      {group === 'Shoulders' && '🏋️'}
                      {group === 'Core' && '🔥'}
                    </div>
                    <span className="font-semibold text-foreground">{group}</span>
                  </div>
                </label>
              ))}
            </div>
            
            <Button 
              size="lg"
              onClick={() => setStep('exercises')}
              disabled={selectedBodyParts.length === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Show My Exercises ({selectedBodyParts.length > 0 ? filteredExercises.length : 0})
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Exercises view
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setStep('bodyPart')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Your Custom Workout Plan
            </h1>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/30">
                {selectedLevel}
              </span>
              {selectedBodyParts.map((part) => (
                <span 
                  key={part}
                  className="px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-semibold border border-secondary/30"
                >
                  {part}
                </span>
              ))}
            </div>
            <p className="text-muted-foreground">
              {filteredExercises.length} exercises tailored for your level and goals
            </p>
          </div>
        </div>
        
        {filteredExercises.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">
              No exercises found for your selection. Try choosing different options.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateWorkout;
