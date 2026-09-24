import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { GymBuddyCandidate } from '@/lib/gymBuddyTypes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Heart, MapPin, Target, Dumbbell, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface GymBuddyCardProps {
  candidate: GymBuddyCandidate;
  index: number;
  onSwipe: (direction: 'left' | 'right', candidateId: string) => void;
}

export function GymBuddyCard({ candidate, index, onSwipe }: GymBuddyCardProps) {
  const [showComparison, setShowComparison] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const controls = useAnimation();
  const x = useMotionValue(0);

  // Derive rotation and opacity from x
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const overlayOpacityRight = useTransform(x, [50, 150], [0, 1]);
  const overlayOpacityLeft = useTransform(x, [-50, -150], [0, 1]);

  useEffect(() => {
    setShowComparison(false);
    setIsSwiping(false);
    x.set(0);
    controls.set({ x: 0, y: 0, scale: index === 0 ? 1 : Math.max(0, 1 - index * 0.05) });
  }, [candidate.id, index, controls, x]);

  const handleDragEnd = async (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isSwiping) return;
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 120 || velocity > 500) {
      setIsSwiping(true);
      await controls.start({ x: 1000, transition: { duration: 0.3 } });
      onSwipe('right', candidate.id);
    } else if (offset < -120 || velocity < -500) {
      setIsSwiping(true);
      await controls.start({ x: -1000, transition: { duration: 0.3 } });
      onSwipe('left', candidate.id);
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const handleButtonSwipe = async (direction: 'left' | 'right') => {
    if (index !== 0 || isSwiping) return;
    setIsSwiping(true);
    const targetX = direction === 'right' ? 1000 : -1000;
    await controls.start({ x: targetX, transition: { duration: 0.3 } });
    onSwipe(direction, candidate.id);
  };

  const isTop = index === 0;

  const formatName = (str: string) => {
    return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const initials = candidate.display_name.substring(0, 2).toUpperCase();

  // Radar Data dynamically mapped to canonical matchmaking dimensions
  const breakdown = candidate.compatibility_breakdown || {
    goals: 50,
    split: 50,
    timing: 50,
    location: 50,
    experience: 50,
  };

  const radarData = [
    { subject: 'Goals', A: breakdown.goals, fullMark: 100 },
    { subject: 'Split', A: breakdown.split, fullMark: 100 },
    { subject: 'Timing', A: breakdown.timing, fullMark: 100 },
    { subject: 'Location', A: breakdown.location, fullMark: 100 },
    { subject: 'Exp', A: breakdown.experience, fullMark: 100 },
  ];

  return (
    <motion.div
      className="absolute top-0 left-0 right-0 w-full max-w-sm mx-auto h-[600px] z-10"
      style={{
        zIndex: 100 - index,
        x,
        rotate,
      }}
      animate={controls}
      initial={{ scale: Math.max(0, 1 - index * 0.05), y: index * 10, opacity: index > 2 ? 0 : 1 }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
    >
      <Card className="w-full h-full flex flex-col overflow-hidden bg-card/95 backdrop-blur-sm border-2 shadow-xl relative select-none cursor-grab active:cursor-grabbing">
        {/* Swipe overlays */}
        <motion.div 
          className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center bg-background/20 backdrop-blur-sm"
          style={{ opacity: overlayOpacityRight }}
        >
          <div className="border-4 border-green-500 text-green-500 text-4xl font-black px-6 py-2 rounded-xl transform -rotate-12 bg-background/80">
            CONNECT 💪
          </div>
        </motion.div>
        
        <motion.div 
          className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center bg-background/20 backdrop-blur-sm"
          style={{ opacity: overlayOpacityLeft }}
        >
          <div className="border-4 border-destructive text-destructive text-4xl font-black px-6 py-2 rounded-xl transform rotate-12 bg-background/80">
            SKIP ✗
          </div>
        </motion.div>

        {/* Card Content */}
        <div className="relative h-2/5 bg-muted flex items-center justify-center overflow-hidden pointer-events-none">
          {candidate.avatar_url ? (
            <img src={candidate.avatar_url} alt={candidate.display_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
              <span className="text-6xl font-bold text-primary/30">{initials}</span>
            </div>
          )}
          
          {/* Compatibility Score Overlay */}
          <div 
            className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border shadow-lg cursor-pointer hover:bg-background/95 transition-all z-50 flex flex-col items-center select-none active:scale-95 border-primary/20 pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              setShowComparison(true);
            }}
          >
            <span className="text-lg font-black text-primary animate-pulse">{candidate.compatibility_score}%</span>
            <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Match Rating</span>
            <span className="text-[8px] text-primary font-semibold mt-0.5 underline">View Details</span>
          </div>
        </div>

        <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto no-scrollbar pointer-events-auto">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{candidate.display_name}, {candidate.age_range_min}-{candidate.age_range_max}</h2>
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {candidate.gym_location}
              </div>
            </div>
            <Badge variant="secondary" className="uppercase text-xs tracking-wider">
              {candidate.experience_level}
            </Badge>
          </div>

          {candidate.bio && (
            <p className="text-sm italic border-l-2 border-primary/50 pl-3 text-muted-foreground">
              "{candidate.bio}"
            </p>
          )}

          <div className="space-y-3 mt-2">
            <div>
              <div className="flex items-center text-sm font-semibold mb-2">
                <Dumbbell className="w-4 h-4 mr-2 text-primary" />
                Workout Split
              </div>
              <Badge variant="outline">{formatName(candidate.workout_split || '')}</Badge>
            </div>

            <div>
              <div className="flex items-center text-sm font-semibold mb-2">
                <Target className="w-4 h-4 mr-2 text-primary" />
                Goals
              </div>
              <div className="flex flex-wrap gap-1">
                {(candidate.fitness_goals || []).map(goal => (
                  <Badge key={goal} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {formatName(goal)}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center text-sm font-semibold mb-2">
                <Clock className="w-4 h-4 mr-2 text-primary" />
                Availability
              </div>
              <div className="flex flex-wrap gap-1">
                {(candidate.preferred_timings || []).map(timing => (
                  <Badge key={timing} variant="outline" className="border-muted-foreground/30">
                    {formatName(timing)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-background border-t flex justify-center gap-6 items-center">
          <Button 
            variant="outline" 
            size="icon" 
            className="w-14 h-14 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all hover:scale-110 pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); handleButtonSwipe('left'); }}
            disabled={!isTop}
          >
            <X className="w-6 h-6" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="w-14 h-14 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-all hover:scale-110 pointer-events-auto"
            onClick={(e) => { e.stopPropagation(); handleButtonSwipe('right'); }}
            disabled={!isTop}
          >
            <Heart className="w-6 h-6" />
          </Button>
        </div>

        {/* Dynamic Slide-in Compatibility Report Overlay */}
        {showComparison && (
          <div 
            className="absolute inset-0 bg-background/95 backdrop-blur-md z-50 p-6 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()} // Prevent dragging card when interacting with overlay
          >
            <div className="space-y-4 overflow-y-auto no-scrollbar pr-1">
              <div className="flex justify-between items-center border-b border-border/80 pb-3">
                <div>
                  <h3 className="font-black text-lg text-primary tracking-tight">Synergy Report</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Why you and {candidate.display_name} matched</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                  onClick={(e) => { e.stopPropagation(); setShowComparison(false); }}
                >
                  <X className="w-4.5 h-4.5" />
                </Button>
              </div>

              {/* Radar Chart */}
              <div className="h-[200px] w-full -mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--primary))', fontSize: 10, fontWeight: 'bold' }} />
                    <Radar name="Compatibility" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Analysis Grid */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground">Compatibility Index</span>
                    <span className="text-primary font-black font-mono text-sm">{candidate.compatibility_score}/100</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden p-[1px] border border-border/60">
                    <div 
                      className="h-full bg-gradient-to-r from-primary via-orange-500 to-primary rounded-full transition-all duration-700 ease-out" 
                      style={{ width: `${candidate.compatibility_score}%` }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-muted/40 rounded-xl border border-border/60 flex items-center gap-2">
                    <Dumbbell className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-semibold">{formatName(candidate.workout_split)}</span>
                  </div>
                  <div className="p-2 bg-muted/40 rounded-xl border border-border/60 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-semibold">{candidate.preferred_timings.length > 0 ? formatName(candidate.preferred_timings[0]) : "Any"}</span>
                  </div>
                  <div className="p-2 bg-muted/40 rounded-xl border border-border/60 flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-semibold uppercase">{candidate.experience_level}</span>
                  </div>
                  <div className="p-2 bg-muted/40 rounded-xl border border-border/60 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="font-semibold truncate">{candidate.gym_location}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="w-full rounded-2xl h-12 text-sm font-bold tracking-wider transition-all duration-200 shadow-lg mt-2 active:scale-[0.98]" 
              onClick={(e) => { e.stopPropagation(); setShowComparison(false); }}
            >
              Return to Profile
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

