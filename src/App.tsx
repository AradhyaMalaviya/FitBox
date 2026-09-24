import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { WorkoutProvider } from "@/contexts/WorkoutContext";
import { GymBuddyNotificationProvider } from "@/contexts/GymBuddyNotificationContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProjectAssistantChat } from "@/components/ProjectAssistantChat";

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

// GymBuddy Feature Pages
const GymBuddyProfileSetup = lazy(() => import("./pages/GymBuddyProfileSetup"));
const GymBuddyDiscover = lazy(() => import("./pages/GymBuddyDiscover"));
const GymBuddyMatches = lazy(() => import("./pages/GymBuddyMatches"));
const GymBuddyChat = lazy(() => import("./pages/GymBuddyChat"));
const GymBuddySettings = lazy(() => import("./components/gymbuddy/GymBuddySettings").then(m => ({ default: m.GymBuddySettings })));

const queryClient = new QueryClient();

const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
    Loading...
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const searchParams = new URLSearchParams(window.location.search);
  const isRecovery = hashParams.get('type') === 'recovery' || searchParams.get('type') === 'recovery';

  if (isRecovery) {
    const search = window.location.search || '';
    const hash = window.location.hash || '';
    return <Navigate to={`/reset-password${search}${hash}`} replace />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

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

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
                {/* Global project-aware assistant (free Gemini direct, bottom-left) */}
                <ProjectAssistantChat />
              </ErrorBoundary>
            </GymBuddyNotificationProvider>
          </WorkoutProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
