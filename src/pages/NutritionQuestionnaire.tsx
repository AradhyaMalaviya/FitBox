import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserData {
  gender: string;
  age: string;
  weight: string;
  height: string;
  goal: string;
  dietaryPreference: string;
  activityLevel: string;
}

const NutritionQuestionnaire = () => {
  const [searchParams] = useSearchParams();
  const planType = searchParams.get("type") || "workout";
  const navigate = useNavigate();

  const [userData, setUserData] = useState<UserData>({
    gender: "",
    age: "",
    weight: "",
    height: "",
    goal: "",
    dietaryPreference: "",
    activityLevel: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store data in localStorage for the roadmap page
    localStorage.setItem("nutritionUserData", JSON.stringify(userData));
    navigate(`/nutrition/roadmap?type=${planType}`);
  };

  const isFormValid = Object.values(userData).every(value => value !== "");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Tell Us About Yourself
            </h1>
            <p className="text-muted-foreground text-lg">
              Help us personalize your {planType === "workout" ? "workout" : "non-workout"} nutrition plan
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>
                This helps us calculate your optimal calorie and macro targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Gender */}
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup value={userData.gender} onValueChange={(value) => setUserData({...userData, gender: value})}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="font-normal cursor-pointer">Other</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={userData.age}
                    onChange={(e) => setUserData({...userData, age: e.target.value})}
                    min="15"
                    max="100"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="Enter your weight"
                    value={userData.weight}
                    onChange={(e) => setUserData({...userData, weight: e.target.value})}
                    min="30"
                    max="300"
                  />
                </div>

                {/* Height */}
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="Enter your height"
                    value={userData.height}
                    onChange={(e) => setUserData({...userData, height: e.target.value})}
                    min="100"
                    max="250"
                  />
                </div>

                {/* Goal */}
                <div className="space-y-2">
                  <Label htmlFor="goal">Goal</Label>
                  <Select value={userData.goal} onValueChange={(value) => setUserData({...userData, goal: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bulk">Bulk (Gain Muscle Mass)</SelectItem>
                      <SelectItem value="lean-bulk">Lean Bulk (Slow Muscle Gain)</SelectItem>
                      <SelectItem value="recomp">Body Recomposition</SelectItem>
                      <SelectItem value="cutting">Cutting (Fat Loss)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dietary Preference */}
                <div className="space-y-2">
                  <Label htmlFor="diet">Dietary Preference</Label>
                  <Select value={userData.dietaryPreference} onValueChange={(value) => setUserData({...userData, dietaryPreference: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Activity Level */}
                <div className="space-y-2">
                  <Label htmlFor="activity">Activity Level</Label>
                  <Select value={userData.activityLevel} onValueChange={(value) => setUserData({...userData, activityLevel: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary (Little to no exercise)</SelectItem>
                      <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                      <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={!isFormValid}
                >
                  Generate My Nutrition Plan
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default NutritionQuestionnaire;
