import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Activity, ShieldCheck, Film, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/data/exercises";
import { getBiomechanicalProfile } from "@/lib/exerciseMedia";

interface BiomechanicalVisualizerProps {
  exercise: Pick<Exercise, "name" | "muscleGroup"> & Partial<Pick<Exercise, "equipment" | "difficulty" | "cues">>;
  modelGender?: "male" | "female";
  viewAngle?: "front" | "side";
  className?: string;
  onSwitchToVideo?: () => void;
  hasVideo?: boolean;
}

const muscleGroupGlows: Record<string, { primary: string; secondary: string; border: string }> = {
  Chest: { primary: "#f43f5e", secondary: "#ea580c", border: "rgba(244, 63, 94, 0.4)" },
  Back: { primary: "#0284c7", secondary: "#06b6d4", border: "rgba(2, 132, 199, 0.4)" },
  Legs: { primary: "#10b981", secondary: "#84cc16", border: "rgba(16, 185, 129, 0.4)" },
  Arms: { primary: "#f59e0b", secondary: "#eab308", border: "rgba(245, 158, 11, 0.4)" },
  Shoulders: { primary: "#8b5cf6", secondary: "#d946ef", border: "rgba(139, 92, 246, 0.4)" },
  Core: { primary: "#ef4444", secondary: "#ec4899", border: "rgba(239, 68, 68, 0.4)" },
};

export const BiomechanicalVisualizer = ({
  exercise,
  modelGender = "male",
  viewAngle = "front",
  className,
  onSwitchToVideo,
  hasVideo = true,
}: BiomechanicalVisualizerProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [tempo, setTempo] = useState<0.5 | 1 | 1.5>(1);
  const [repCount, setRepCount] = useState(1);
  const [cycleProgress, setCycleProgress] = useState(0); // 0 to 1

  const profile = getBiomechanicalProfile(exercise.name, exercise.muscleGroup);
  const theme = muscleGroupGlows[exercise.muscleGroup] || muscleGroupGlows.Chest;

  // Animation loop: 4 seconds total per rep cycle at 1x
  useEffect(() => {
    if (!isPlaying) return;

    const cycleDurationMs = 4000 / tempo;
    const intervalMs = 50;
    const step = intervalMs / cycleDurationMs;

    const timer = setInterval(() => {
      setCycleProgress((prev) => {
        const next = prev + step;
        if (next >= 1) {
          setRepCount((r) => (r >= 99 ? 1 : r + 1));
          return 0;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, tempo]);

  // Determine movement phase
  // 0.0 - 0.5: Eccentric (Lowering/Stretch)
  // 0.5 - 0.7: Iso Hold / Contraction pause
  // 0.7 - 1.0: Concentric (Forceful Drive)
  const isEccentric = cycleProgress < 0.5;
  const isPause = cycleProgress >= 0.5 && cycleProgress < 0.65;
  const phaseLabel = isEccentric
    ? "ECCENTRIC PHASE (CONTROLLED)"
    : isPause
    ? "PEAK TENSION PAUSE"
    : "CONCENTRIC PHASE (EXPLOSIVE)";

  // Motion offset for weight / limb
  const motionY = isEccentric
    ? (cycleProgress / 0.5) * 40
    : isPause
    ? 40
    : 40 - ((cycleProgress - 0.65) / 0.35) * 40;

  return (
    <div className={cn("relative flex h-full w-full flex-col justify-between overflow-hidden bg-slate-950 text-white select-none", className)}>
      {/* Background blueprint grid */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${theme.primary} 0%, transparent 60%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 32px 32px, 32px 32px",
        }}
      />

      {/* Top HUD: Model / Angle & Biomechanics Badges */}
      <div className="relative z-20 flex items-center justify-between p-3 bg-slate-900/80 backdrop-blur-md border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary font-bold tracking-wide">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>BIOMECHANICAL MOTION</span>
          </span>
          <span className="px-2 py-0.5 rounded border border-white/15 text-[11px] font-semibold text-slate-300">
            {modelGender.toUpperCase()} • {viewAngle.toUpperCase()} VIEW
          </span>
        </div>

        {hasVideo && onSwitchToVideo && (
          <button
            type="button"
            onClick={onSwitchToVideo}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
          >
            <Film className="w-3.5 h-3.5 text-primary" />
            <span>Switch to Video</span>
          </button>
        )}
      </div>

      {/* Main Kinetic Simulator Canvas */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        {/* Animated Biomechanical SVG Rig */}
        <svg
          viewBox="0 0 400 360"
          className="w-full h-full max-h-[300px] object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Target Muscle Glow Filter */}
          <defs>
            <filter id="muscleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Torso & Core */}
          <rect x="175" y="110" width="50" height="90" rx="16" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          
          {/* Active Target Muscle Group Highlighting */}
          {exercise.muscleGroup === "Chest" && (
            <path
              d="M178 120 Q200 135 222 120 L218 150 Q200 160 182 150 Z"
              fill={theme.primary}
              filter="url(#muscleGlow)"
              opacity={0.85 + Math.sin(cycleProgress * Math.PI) * 0.15}
            />
          )}

          {exercise.muscleGroup === "Back" && (
            <path
              d="M176 115 L224 115 L215 165 L185 165 Z"
              fill={theme.primary}
              filter="url(#muscleGlow)"
              opacity={0.85 + Math.sin(cycleProgress * Math.PI) * 0.15}
            />
          )}

          {exercise.muscleGroup === "Core" && (
            <rect
              x="184"
              y="145"
              width="32"
              height="45"
              rx="6"
              fill={theme.primary}
              filter="url(#muscleGlow)"
              opacity={0.85 + Math.sin(cycleProgress * Math.PI) * 0.15}
            />
          )}

          {/* Head & Neck */}
          <circle cx="200" cy="70" r="24" fill="#334155" stroke="#64748b" strokeWidth="2" />
          <rect x="194" y="94" width="12" height="18" fill="#1e293b" />

          {/* Shoulders */}
          <circle
            cx="160"
            cy="120"
            r="14"
            fill={exercise.muscleGroup === "Shoulders" ? theme.primary : "#334155"}
            filter={exercise.muscleGroup === "Shoulders" ? "url(#muscleGlow)" : undefined}
          />
          <circle
            cx="240"
            cy="120"
            r="14"
            fill={exercise.muscleGroup === "Shoulders" ? theme.primary : "#334155"}
            filter={exercise.muscleGroup === "Shoulders" ? "url(#muscleGlow)" : undefined}
          />

          {/* Kinetic Arms & Hands (Moving with rep cycle) */}
          <line
            x1="160"
            y1="120"
            x2="140"
            y2={150 + motionY * 0.5}
            stroke={exercise.muscleGroup === "Arms" ? theme.primary : "#64748b"}
            strokeWidth="10"
            strokeLinecap="round"
          />
          <line
            x1="140"
            y1={150 + motionY * 0.5}
            x2="135"
            y2={190 + motionY}
            stroke={exercise.muscleGroup === "Arms" ? theme.primary : "#64748b"}
            strokeWidth="9"
            strokeLinecap="round"
          />

          <line
            x1="240"
            y1="120"
            x2="260"
            y2={150 + motionY * 0.5}
            stroke={exercise.muscleGroup === "Arms" ? theme.primary : "#64748b"}
            strokeWidth="10"
            strokeLinecap="round"
          />
          <line
            x1="260"
            y1={150 + motionY * 0.5}
            x2="265"
            y2={190 + motionY}
            stroke={exercise.muscleGroup === "Arms" ? theme.primary : "#64748b"}
            strokeWidth="9"
            strokeLinecap="round"
          />

          {/* Barbell / Equipment Path Indicator */}
          <line
            x1="90"
            y1={190 + motionY}
            x2="310"
            y2={190 + motionY}
            stroke="#f8fafc"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Olympic Plate Collars */}
          <rect x="94" y={170 + motionY} width="16" height="40" rx="3" fill="#0284c7" stroke="#38bdf8" />
          <rect x="290" y={170 + motionY} width="16" height="40" rx="3" fill="#0284c7" stroke="#38bdf8" />

          {/* Lower Body: Legs / Quads */}
          <line
            x1="185"
            y1="200"
            x2="178"
            y2="265"
            stroke={exercise.muscleGroup === "Legs" ? theme.primary : "#334155"}
            strokeWidth="14"
            strokeLinecap="round"
            filter={exercise.muscleGroup === "Legs" ? "url(#muscleGlow)" : undefined}
          />
          <line
            x1="215"
            y1="200"
            x2="222"
            y2="265"
            stroke={exercise.muscleGroup === "Legs" ? theme.primary : "#334155"}
            strokeWidth="14"
            strokeLinecap="round"
            filter={exercise.muscleGroup === "Legs" ? "url(#muscleGlow)" : undefined}
          />
          <line x1="178" y1="265" x2="175" y2="330" stroke="#475569" strokeWidth="12" strokeLinecap="round" />
          <line x1="222" y1="265" x2="225" y2="330" stroke="#475569" strokeWidth="12" strokeLinecap="round" />

          {/* Floor Foundation */}
          <line x1="120" y1="335" x2="280" y2="335" stroke="rgba(255,255,255,0.2)" strokeWidth="3" strokeDasharray="4 4" />
        </svg>

        {/* Phase Badge & Rep Counter HUD Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-1 z-20">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-slate-900/90 border border-white/10 text-[11px] font-bold text-primary tracking-wide">
              {phaseLabel}
            </span>
            <span className="px-2.5 py-1 rounded bg-primary text-black font-extrabold text-xs">
              REP #{repCount}
            </span>
          </div>

          <div className="w-48 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-75"
              style={{ width: `${Math.round(cycleProgress * 100)}%` }}
            />
          </div>
        </div>

        {/* Movement Trajectory Coordinates */}
        <div className="absolute bottom-4 right-4 text-right z-20 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-white/10">
          <div>PATTERN: <span className="text-white uppercase font-bold">{profile.movementPattern}</span></div>
          <div>DISPLACEMENT: <span className="text-primary font-bold">{Math.round(motionY)} mm</span></div>
        </div>
      </div>

      {/* Bottom Form Cues & Interactive Controls HUD */}
      <div className="relative z-20 p-3 bg-slate-900/95 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-medium truncate max-w-sm">
              <strong className="text-white">Cue:</strong> {profile.formCues[0]}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setCycleProgress(0);
                setRepCount(1);
              }}
              className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Reset Reps"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="flex rounded-md border border-white/15 p-0.5 bg-black/40 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setTempo(0.5)}
                className={`px-1.5 py-0.5 rounded ${tempo === 0.5 ? "bg-primary text-black" : "text-slate-400"}`}
              >
                0.5x
              </button>
              <button
                type="button"
                onClick={() => setTempo(1)}
                className={`px-1.5 py-0.5 rounded ${tempo === 1 ? "bg-primary text-black" : "text-slate-400"}`}
              >
                1x
              </button>
              <button
                type="button"
                onClick={() => setTempo(1.5)}
                className={`px-1.5 py-0.5 rounded ${tempo === 1.5 ? "bg-primary text-black" : "text-slate-400"}`}
              >
                1.5x
              </button>
            </div>
          </div>
        </div>

        {/* Primary and Secondary Muscles list */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-white/5">
          <span className="font-semibold text-slate-300">Target Movers:</span>
          <span className="text-primary font-medium">{profile.primaryMuscles.join(", ")}</span>
          <span className="text-slate-600">•</span>
          <span className="font-semibold text-slate-300">Stabilizers:</span>
          <span>{profile.secondaryMuscles.join(", ")}</span>
        </div>
      </div>
    </div>
  );
};
