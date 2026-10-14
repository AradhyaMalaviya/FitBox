import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkoutProvider } from "@/contexts/WorkoutContext";
import { GymBuddyNotificationProvider } from "@/contexts/GymBuddyNotificationContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProjectAssistantChat } from "@/components/ProjectAssistantChat";
import { FitnessChat } from "@/components/FitnessChat";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const Index = lazy(() => import("./pages/Index"));
const Exercises = lazy(() => import("./pages/Exercises"));
const ExerciseDetail = lazy(() => import("./pages/ExerciseDetail"));
const GenerateWorkout = lazy(() => import("./pages/GenerateWorkout"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Nutrition = lazy(() => import("./pages/Nutrition"));
const NutritionQuestionnaire = lazy(() => import("./pages/NutritionQuestionnaire"));
const NutritionRoadmap = lazy(() => import("./pages/NutritionRoadmap"));
const ActiveWorkout = lazy(() => import("./pages/ActiveWorkout"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const MuscleWikiTools = lazy(() => import("./pages/MuscleWikiTools"));
const MuscleWikiGenerator = lazy(() => import("./pages/MuscleWikiGenerator"));
const Stretches = lazy(() => import("./pages/Stretches"));
const WorkoutLibrary = lazy(() => import("./pages/WorkoutLibrary"));
const RoutineLibrary = lazy(() => import("./pages/RoutineLibrary"));
const Articles = lazy(() => import("./pages/Articles"));

// GymBuddy Feature Pages
const GymBuddyProfileSetup = lazy(() => import("./pages/GymBuddyProfileSetup"));
const GymBuddyDiscover = lazy(() => import("./pages/GymBuddyDiscover"));
const GymBuddyMatches = lazy(() => import("./pages/GymBuddyMatches"));
const GymBuddyChat = lazy(() => import("./pages/GymBuddyChat"));
const GymBuddySettings = lazy(() => import("./pages/GymBuddySettings"));

const queryClient = new QueryClient();

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
    Loading...
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnalyticsTracker />
        <AuthProvider>
          <WorkoutProvider>
            <GymBuddyNotificationProvider>
              <ErrorBoundary>
                <Suspense fallback={<RouteLoader />}>
                <Routes>
                  <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
                  <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                  <Route path="/exercises" element={<ProtectedRoute><Exercises /></ProtectedRoute>} />
                  <Route path="/exercises/:muscleId" element={<ProtectedRoute><Exercises /></ProtectedRoute>} />
                  <Route path="/exercise/:exerciseId" element={<ProtectedRoute><ExerciseDetail /></ProtectedRoute>} />
                  <Route path="/generate-workout" element={<ProtectedRoute><GenerateWorkout /></ProtectedRoute>} />
                  <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
                  <Route path="/nutrition/questionnaire" element={<ProtectedRoute><NutritionQuestionnaire /></ProtectedRoute>} />
                  <Route path="/nutrition/roadmap" element={<ProtectedRoute><NutritionRoadmap /></ProtectedRoute>} />
                  <Route path="/workout/active" element={<ProtectedRoute><ActiveWorkout /></ProtectedRoute>} />
                  
                  {/* GymBuddy Routes */}
                  <Route path="/gymbuddy/setup" element={<ProtectedRoute><GymBuddyProfileSetup /></ProtectedRoute>} />
                  <Route path="/gymbuddy/discover" element={<ProtectedRoute><GymBuddyDiscover /></ProtectedRoute>} />
                  <Route path="/gymbuddy/matches" element={<ProtectedRoute><GymBuddyMatches /></ProtectedRoute>} />
                  <Route path="/gymbuddy/chat/:matchId" element={<ProtectedRoute><GymBuddyChat /></ProtectedRoute>} />
                  <Route path="/gymbuddy/settings" element={<ProtectedRoute><GymBuddySettings /></ProtectedRoute>} />

                  <Route path="/generate" element={<ProtectedRoute><GenerateWorkout /></ProtectedRoute>} />
                  <Route path="/active-workout" element={<ProtectedRoute><ActiveWorkout /></ProtectedRoute>} />
                  <Route path="/gymbuddy" element={<ProtectedRoute><GymBuddyDiscover /></ProtectedRoute>} />
                  <Route path="/gymbuddy/profile" element={<ProtectedRoute><GymBuddyProfileSetup /></ProtectedRoute>} />
                  
                  {/* MuscleWiki Tools, Calculators & Generator */}
                  <Route path="/tools" element={<ProtectedRoute><MuscleWikiTools /></ProtectedRoute>} />
                  <Route path="/tools/:toolTab" element={<ProtectedRoute><MuscleWikiTools /></ProtectedRoute>} />
                  <Route path="/calculators" element={<ProtectedRoute><MuscleWikiTools /></ProtectedRoute>} />
                  <Route path="/generator" element={<ProtectedRoute><MuscleWikiGenerator /></ProtectedRoute>} />
                  <Route path="/workout-generator" element={<ProtectedRoute><MuscleWikiGenerator /></ProtectedRoute>} />
                  <Route path="/split-builder" element={<ProtectedRoute><MuscleWikiGenerator /></ProtectedRoute>} />
                  <Route path="/workout-builder" element={<ProtectedRoute><MuscleWikiGenerator /></ProtectedRoute>} />
                  <Route path="/stretches" element={<ProtectedRoute><Stretches /></ProtectedRoute>} />
                  <Route path="/workouts" element={<ProtectedRoute><WorkoutLibrary /></ProtectedRoute>} />
                  <Route path="/routines" element={<ProtectedRoute><RoutineLibrary /></ProtectedRoute>} />
                  <Route path="/articles" element={<ProtectedRoute><Articles /></ProtectedRoute>} />
                  <Route path="/articles/:articleId" element={<ProtectedRoute><Articles /></ProtectedRoute>} />

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
                {/* Global project-aware assistant (free Gemini direct, bottom-left) */}
                <ProjectAssistantChat />
                <FitnessChat />
              </ErrorBoundary>
            </GymBuddyNotificationProvider>
          </WorkoutProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
