import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useGymBuddy } from "@/hooks/useGymBuddy";
import { GymBuddyCandidate } from "@/lib/gymBuddyTypes";
import { GymBuddyCard } from "@/components/gymbuddy/GymBuddyCard";
import { GymBuddyEmpty } from "@/components/gymbuddy/GymBuddyEmpty";
import { GymBuddyMatchOverlay } from "@/components/gymbuddy/GymBuddyMatchOverlay";
import { GymBuddyRadar } from "@/components/gymbuddy/GymBuddyRadar";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Flame, Users, Settings } from "lucide-react";

export default function GymBuddyDiscover() {
  const { profile, loading, error, getCandidates, swipe } = useGymBuddy();
  const [candidates, setCandidates] = useState<GymBuddyCandidate[]>([]);
  const [fetching, setFetching] = useState(true);
  const [matchPartner, setMatchPartner] = useState<GymBuddyCandidate | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !profile) {
      toast({
        title: "Profile Required",
        description: "Please set up your GymBuddy profile first.",
      });
      navigate("/gymbuddy/setup");
    }
  }, [loading, profile, navigate, toast]);

  const loadCandidates = useCallback(async () => {
    setFetching(true);
    try {
      const results = await getCandidates();
      setCandidates(results);
    } catch (err: unknown) {
      toast({
        title: "Error loading candidates",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive"
      });
    } finally {
      setFetching(false);
    }
  }, [getCandidates, toast]);

  useEffect(() => {
    if (profile) {
      loadCandidates();
    }
  }, [profile, loadCandidates]);

  const handleSwipe = async (direction: 'left' | 'right', candidateId: string) => {
    const swipedCandidate = candidates.find(c => c.id === candidateId);
    
    // Optimistically remove from stack
    setCandidates(prev => prev.filter(c => c.id !== candidateId));

    try {
      const { match } = await swipe(candidateId, direction);
      if (match && swipedCandidate) {
        setMatchPartner(swipedCandidate);
      }
    } catch (err: unknown) {
      toast({
        title: "Action failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive"
      });
    }
  };

  const closeMatchOverlay = () => {
    setMatchPartner(null);
  };

  const handleStartChatting = () => {
    navigate("/gymbuddy/matches"); 
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-background overflow-hidden flex flex-col">
        <Header />
        <main className="flex-1 relative flex items-center justify-center p-4 pt-12">
          <GymBuddyRadar 
            profile={profile} 
            isScanning={true}
            onRadiusChange={(val) => {
              console.log("Dynamic search radius adjusted:", val);
            }}
          />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center h-[70vh] text-center p-4">
          <p className="text-destructive mb-4">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden flex flex-col">
      <Header />
      
      {/* GymBuddy Navigation Bar */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Button>
            <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />
            <Button
              variant="secondary"
              size="sm"
              className="text-xs font-semibold gap-1.5 bg-primary/15 text-primary hover:bg-primary/20"
            >
              <Flame className="w-3.5 h-3.5" />
              Discover
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/gymbuddy/matches')}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              Matches
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/gymbuddy/setup')}
            className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            Profile Setup
          </Button>
        </div>
      </div>

      <main className="flex-1 relative flex items-center justify-center p-4 pt-12">
        {candidates.length > 0 ? (
          <div className="relative w-full max-w-sm h-[600px] mx-auto">
            {/* Render cards from back to front so top is last in DOM but visually top due to z-index */}
            {candidates.slice(0, 3).reverse().map((candidate, arrayIndex, array) => {
              const actualIndex = array.length - 1 - arrayIndex;
              return (
                <GymBuddyCard
                  key={candidate.id}
                  candidate={candidate}
                  index={actualIndex}
                  onSwipe={handleSwipe}
                />
              );
            })}
          </div>
        ) : (
          <GymBuddyEmpty />
        )}
      </main>

      {matchPartner && profile && (
        <GymBuddyMatchOverlay
          currentUser={profile}
          partner={matchPartner}
          onClose={closeMatchOverlay}
          onMessage={handleStartChatting}
        />
      )}
    </div>
  );
}
