import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Header } from "@/components/Header";
import { useGymBuddy } from "@/hooks/useGymBuddy";
import { GymBuddyProfile } from "@/lib/gymBuddyTypes";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const fitnessGoals = [
  { id: "fat_loss", label: "Fat Loss" },
  { id: "muscle_gain", label: "Muscle Gain" },
  { id: "strength", label: "Strength" },
  { id: "endurance", label: "Endurance" },
  { id: "flexibility", label: "Flexibility" },
  { id: "general_fitness", label: "General Fitness" },
];

const preferredTimings = [
  { id: "early_morning", label: "Early Morning (5AM - 8AM)" },
  { id: "morning", label: "Morning (8AM - 12PM)" },
  { id: "afternoon", label: "Afternoon (12PM - 4PM)" },
  { id: "evening", label: "Evening (4PM - 8PM)" },
  { id: "night", label: "Night (8PM - 12AM)" },
  { id: "flexible", label: "Flexible" },
];

const profileSchema = z.object({
  display_name: z.string().min(2, "Name must be at least 2 characters."),
  bio: z.string().max(150, "Bio cannot exceed 150 characters.").optional(),
  fitness_goals: z.array(z.string()).min(1, "Select at least one fitness goal."),
  workout_split: z.string().min(1, "Select your workout split."),
  experience_level: z.string().min(1, "Select your experience level."),
  preferred_timings: z.array(z.string()).min(1, "Select at least one preferred timing."),
  gym_location: z.string().min(3, "Gym location or area is required."),
  gender: z.string().optional(),
  age_range_min: z.number().min(16).max(99),
  age_range_max: z.number().min(16).max(99),
  is_discoverable: z.boolean().default(true),
  profile_visibility: z.string().default("public"),
}).refine(data => data.age_range_max >= data.age_range_min, { message: 'Max age must be ≥ min age', path: ['age_range_max'] });

export default function GymBuddyProfileSetup() {
  const { user } = useAuth();
  const { profile, loading, saveProfile } = useGymBuddy();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: "",
      bio: "",
      fitness_goals: [],
      workout_split: "",
      experience_level: "",
      preferred_timings: [],
      gym_location: "",
      gender: "prefer_not_to_say",
      age_range_min: 18,
      age_range_max: 35,
      is_discoverable: true,
      profile_visibility: "public",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        fitness_goals: profile.fitness_goals || [],
        workout_split: profile.workout_split || "",
        experience_level: profile.experience_level || "",
        preferred_timings: profile.preferred_timings || [],
        gym_location: profile.gym_location || "",
        gender: profile.gender || "prefer_not_to_say",
        age_range_min: profile.age_range_min || 18,
        age_range_max: profile.age_range_max || 35,
        is_discoverable: profile.is_discoverable !== false,
        profile_visibility: profile.profile_visibility || "public",
      });
    }
  }, [profile, form]);

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    try {
      setIsSubmitting(true);
      // Validating age ranges
      if (values.age_range_min > values.age_range_max) {
        form.setError("age_range_max", { message: "Max age must be greater than min age" });
        setIsSubmitting(false);
        return;
      }
      
      await saveProfile(values as unknown as Partial<GymBuddyProfile>);
      
      toast({
        title: "Profile saved!",
        description: "Your GymBuddy profile has been updated.",
      });
      
      navigate("/gymbuddy/discover");
    } catch (error: unknown) {
      toast({
        title: "Error saving profile",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Guest gate: prevent guests from wasting time on the form
  if (!loading && user?.isGuest) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-md mx-auto px-4 pt-16 text-center space-y-4">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold">Account Required</h1>
          <p className="text-muted-foreground">
            GymBuddy requires a free account to save your profile and find workout partners.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Go Back</Button>
            <Button onClick={() => navigate('/auth')}>Sign Up Free</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">GymBuddy Profile</h1>
          <p className="text-muted-foreground mt-2">
            Set up your profile to find the perfect workout partner.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Info</CardTitle>
                <CardDescription>How others will see you in GymBuddy.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Alex" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Short tagline about your fitness journey (max 150 chars)" 
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/150 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non_binary">Non-binary</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Fitness Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Fitness Profile</CardTitle>
                <CardDescription>Details about how you train.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="experience_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workout_split"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workout Split *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your split" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="push_pull_legs">Push/Pull/Legs</SelectItem>
                          <SelectItem value="full_body">Full Body</SelectItem>
                          <SelectItem value="upper_lower">Upper/Lower</SelectItem>
                          <SelectItem value="bro_split">Bro Split</SelectItem>
                          <SelectItem value="athletic">Athletic/Functional</SelectItem>
                          <SelectItem value="cardio_focused">Cardio Focused</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fitness_goals"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Fitness Goals *</FormLabel>
                        <FormDescription>Select all that apply.</FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {fitnessGoals.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="fitness_goals"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer text-sm">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Logistics & Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Logistics & Preferences</CardTitle>
                <CardDescription>Where and when do you train?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="gym_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gym Location or Area *</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Gold's Gym, Kanpur" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferred_timings"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Preferred Timings *</FormLabel>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {preferredTimings.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="preferred_timings"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer text-sm">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age_range_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Age Min</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age_range_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner Age Max</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
              <CardHeader>
                <CardTitle>Discovery</CardTitle>
                <CardDescription>Control how you appear to others.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="is_discoverable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Show me in Discovery</FormLabel>
                        <FormDescription>
                          Allow others to see your profile and match with you.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
