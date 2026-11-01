import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useGymBuddy } from "@/hooks/useGymBuddy";
import { ProfileVisibility } from "@/lib/gymBuddyTypes";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { deleteLocalGymBuddyProfile } from "@/lib/mockDatabase";
import { Loader2, Settings, UserX, Edit } from "lucide-react";

export function GymBuddySettings() {
  const { profile, loading, saveProfile, refreshProfile } = useGymBuddy();
  const { user, authUserId } = useAuth();
  const activeAuthUserId = authUserId || user?.authUserId || user?.id;

  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [visibility, setVisibility] = useState("public");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setIsDiscoverable(profile.is_discoverable);
      setVisibility(profile.profile_visibility);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveProfile({
        is_discoverable: isDiscoverable,
        profile_visibility: visibility as ProfileVisibility,
      });
      toast({
        title: "Settings updated",
        description: "Your GymBuddy privacy settings have been saved.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error saving settings",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!activeAuthUserId) return;
    try {
      setIsDeleting(true);

      if (user?.isGuest) {
        deleteLocalGymBuddyProfile(activeAuthUserId);
        toast({
          title: "Profile deleted",
          description: "Your local GymBuddy profile and guest data have been removed.",
        });
        navigate("/dashboard");
        return;
      }

      const { error } = await supabase
        .from('gymbuddy_profiles')
        .delete()
        .eq('id', activeAuthUserId);
        
      if (error) throw error;
      
      toast({
        title: "Profile deleted",
        description: "Your GymBuddy profile has been removed.",
      });
      
      await refreshProfile();
      navigate("/dashboard");
    } catch (error: unknown) {
      toast({
        title: "Error deleting profile",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">No GymBuddy Profile</h2>
          <p className="text-muted-foreground mb-8">
            You need to create a GymBuddy profile before you can manage its settings.
          </p>
          <Button onClick={() => navigate("/gymbuddy/setup")}>
            Set Up Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">GymBuddy Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your privacy, discoverability, and profile data.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/gymbuddy/matches')}>
            Back to Matches
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Discovery & Privacy</CardTitle>
              <CardDescription>
                Control who can see your profile in the matchmaking pool.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Show me in GymBuddy Discovery</Label>
                  <p className="text-sm text-muted-foreground">
                    Disabling this will hide you from new users immediately. Existing matches are preserved.
                  </p>
                </div>
                <Switch
                  checked={isDiscoverable}
                  onCheckedChange={setIsDiscoverable}
                />
              </div>

              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public (Everyone)</SelectItem>
                    <SelectItem value="gym_only">Gym Only (Same location)</SelectItem>
                    <SelectItem value="private">Private (Hidden)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Adjust who can view your full profile details when matched.
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Data</CardTitle>
              <CardDescription>
                Update your workout preferences or permanently delete your matchmaking data.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => navigate("/gymbuddy/setup")}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit GymBuddy Profile
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <UserX className="w-4 h-4 mr-2" />
                    Delete Profile
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your GymBuddy profile, all your matches, messages, and session logs. This will not affect your main FitBox account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteProfile}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? "Deleting..." : "Delete Profile"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
