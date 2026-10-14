import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Dumbbell, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface StartWorkoutCardProps {
  onStart: (name: string) => void;
}

export const StartWorkoutCard = ({ onStart }: StartWorkoutCardProps) => {
  const navigate = useNavigate();
  const [workoutName, setWorkoutName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = workoutName.trim() || `Workout ${new Date().toLocaleDateString()}`;
    onStart(name);
  };

  const quickStartOptions = [
    'Push Day',
    'Pull Day', 
    'Leg Day',
    'Upper Body',
    'Lower Body',
    'Full Body',
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-4">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>
      <Card className="w-full max-w-md bg-card/50 border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
            <Dumbbell className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Start a Workout</CardTitle>
          <CardDescription>
            Name your workout session to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="workout-name">Workout Name</Label>
              <Input
                id="workout-name"
                placeholder="e.g., Morning Push Day"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="bg-input/50"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Quick Start</Label>
              <div className="flex flex-wrap gap-2">
                {quickStartOptions.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setWorkoutName(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" size="lg">
              <Play className="w-5 h-5" />
              Start Workout
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
