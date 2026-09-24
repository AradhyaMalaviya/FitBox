import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Body, { ExtendedBodyPart, Slug } from "react-muscle-highlighter";
import {
  MUSCLE_MAPPINGS,
  SPLIT_PRESETS,
  getExercisesForMuscle,
  getMuscleRoute,
  normalizeMuscleSlug,
  type MuscleMapping,
} from "@/lib/muscleMapping";
import { exercises, type Exercise } from "@/data/exercises";
import { ExerciseVideoPlayer } from "@/components/exercise/ExerciseVideoPlayer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Dumbbell,
  ExternalLink,
  Activity,
  Layers,
  Check,
} from "lucide-react";
import "./InteractiveBodyDiagram.css";

// ─── EQUIPMENT DEFINITIONS (Matching MuscleWiki 2-Column Checklist) ───
interface EquipmentItem {
  id: string;
  name: string;
  column: 1 | 2;
  filterKeywords: string[];
}

const EQUIPMENT_ITEMS: EquipmentItem[] = [
  // Column 1
  { id: "featured", name: "Featured", column: 1, filterKeywords: [] },
  { id: "dumbbells", name: "Dumbbells", column: 1, filterKeywords: ["dumbbell", "dumbbells"] },
  { id: "machine", name: "Machine", column: 1, filterKeywords: ["machine", "lever", "hack", "smith"] },
  { id: "kettlebells", name: "Kettlebells", column: 1, filterKeywords: ["kettlebell", "kettlebells"] },
  { id: "cables", name: "Cables", column: 1, filterKeywords: ["cable", "cables", "pulley"] },
  { id: "plate", name: "Plate", column: 1, filterKeywords: ["plate", "weight plate"] },
  { id: "yoga", name: "Yoga", column: 1, filterKeywords: ["yoga", "mat", "mobility", "stretch"] },
  { id: "cardio", name: "Cardio", column: 1, filterKeywords: ["cardio", "jump", "burpee", "hiit"] },
  { id: "recovery", name: "Recovery", column: 1, filterKeywords: ["foam roller", "stretch", "recovery", "mobility"] },

  // Column 2
  { id: "barbell", name: "Barbell", column: 2, filterKeywords: ["barbell", "olympic bar", "ez bar"] },
  { id: "bodyweight", name: "Bodyweight", column: 2, filterKeywords: ["bodyweight", "calisthenics", "none"] },
  { id: "medicine_ball", name: "Medicine Ball", column: 2, filterKeywords: ["medicine ball", "slam ball"] },
  { id: "stretches", name: "Stretches", column: 2, filterKeywords: ["stretch", "stretches", "flexibility"] },
  { id: "band", name: "Band", column: 2, filterKeywords: ["band", "resistance band", "loop band"] },
  { id: "trx", name: "TRX", column: 2, filterKeywords: ["trx", "suspension", "straps"] },
  { id: "bosu_ball", name: "Bosu Ball", column: 2, filterKeywords: ["bosu", "balance ball", "dome"] },
  { id: "smith_machine", name: "Smith Machine", column: 2, filterKeywords: ["smith machine", "smith"] },
  { id: "pilates", name: "Pilates", column: 2, filterKeywords: ["pilates", "reformer", "ring"] },
];

// ─── MINIMALIST VECTOR ICONS FOR EQUIPMENT ───
const EquipmentIcon: React.FC<{ id: string }> = ({ id }) => {
  switch (id) {
    case "featured":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "dumbbells":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 5v14M18 5v14M3 9v6M21 9v6M6 12h12" strokeLinecap="round" />
        </svg>
      );
    case "machine":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6M9 13h6M9 17h6M12 4v16" strokeLinecap="round" />
        </svg>
      );
    case "kettlebells":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 8a4 4 0 0 1 8 0v2H8V8z" />
          <circle cx="12" cy="15" r="6" />
        </svg>
      );
    case "cables":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="5" r="3" />
          <path d="M12 8v12M9 20h6" strokeLinecap="round" />
        </svg>
      );
    case "plate":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "yoga":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="12" cy="7" rx="3" ry="5" />
          <path d="M6 19c2-5 5-7 6-7s4 2 6 7" strokeLinecap="round" />
        </svg>
      );
    case "cardio":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h6.28" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "recovery":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" strokeLinecap="round" />
        </svg>
      );
    case "barbell":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 12h20M5 7v10M19 7v10M7 9v6M17 9v6" strokeLinecap="round" />
        </svg>
      );
    case "bodyweight":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v7M9 10l3 2 3-2M9 20l3-6 3 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "medicine_ball":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 1 0 18M3 12a9 9 0 0 1 18 0" />
        </svg>
      );
    case "stretches":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="14" cy="4" r="2" />
          <path d="M6 19l4-8 5 2 4-5M9 13l-4 8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "band":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="12" cy="12" rx="8" ry="4" transform="rotate(-25 12 12)" />
        </svg>
      );
    case "trx":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v6M8 8l-4 12M16 8l4 12M3 20h4M17 20h4" strokeLinecap="round" />
        </svg>
      );
    case "bosu_ball":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 17a8 8 0 0 1 16 0z" />
          <rect x="2" y="17" width="20" height="3" rx="1.5" />
        </svg>
      );
    case "smith_machine":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 3v18M19 3v18M3 10h18M3 14h18" strokeLinecap="round" />
        </svg>
      );
    case "pilates":
      return (
        <svg className="mw-eq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <path d="M4 10h16M4 14h16" strokeLinecap="round" />
        </svg>
      );
    default:
      return <Dumbbell className="mw-eq-icon" />;
  }
};

export const InteractiveBodyDiagram: React.FC = () => {
  const navigate = useNavigate();

  // ─── STATE (Matching MuscleWiki Reference Layout) ───
  const [currentGender, setCurrentGender] = useState<"male" | "female">("male");
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);
  const [jointsMode, setJointsMode] = useState<boolean>(false);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(["featured"]);
  const [isEquipmentOpen, setIsEquipmentOpen] = useState<boolean>(true);
  const [activeSplit, setActiveSplit] = useState<"all" | "push" | "pull" | "legs" | "core">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  // Floating Cursor Tooltip State
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    muscleId: string | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    muscleId: null,
  });

  // ─── EQUIPMENT TOGGLE LOGIC ───
  const handleToggleEquipment = (eqId: string) => {
    if (eqId === "featured") {
      setSelectedEquipment(["featured"]);
      return;
    }

    setSelectedEquipment((prev) => {
      const withoutFeatured = prev.filter((id) => id !== "featured");
      if (withoutFeatured.includes(eqId)) {
        const next = withoutFeatured.filter((id) => id !== eqId);
        return next.length === 0 ? ["featured"] : next;
      } else {
        return [...withoutFeatured, eqId];
      }
    });
  };

  // ─── SEARCH & SPLIT HIGHLIGHT COMPUTATIONS ───
  const searchedMuscles = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const matches: string[] = [];

    Object.entries(MUSCLE_MAPPINGS).forEach(([id, mapping]) => {
      const nameMatch = mapping.displayName.toLowerCase().includes(q);
      const latinMatch = mapping.latinName?.toLowerCase().includes(q);
      const kwMatch = mapping.searchKeywords?.some((k) => k.toLowerCase().includes(q));
      if (nameMatch || latinMatch || kwMatch) {
        matches.push(id);
      }
    });

    return matches;
  }, [searchQuery]);

  const splitMuscles = useMemo(() => {
    if (activeSplit === "all") return [];
    return SPLIT_PRESETS[activeSplit] || [];
  }, [activeSplit]);

  // Combined split or searched muscles
  const activeHighlightedSlugs = useMemo(() => {
    if (searchedMuscles.length > 0) return searchedMuscles;
    return splitMuscles;
  }, [searchedMuscles, splitMuscles]);

  // ─── REACT-MUSCLE-HIGHLIGHTER DATA BINDINGS ───
  const bodyData = useMemo(() => {
    const list: ExtendedBodyPart[] = [];

    // 1. Split preset or search highlights
    activeHighlightedSlugs.forEach((rawSlug) => {
      const slug = normalizeMuscleSlug(rawSlug);
      list.push({
        slug: slug as Slug,
        color: "#1e3a8a",
        styles: {
          fill: "#1e3a8a",
          stroke: "#60a5fa",
          strokeWidth: 1.2,
        },
      });
    });

    // 2. Joints mode visual indication on knees & ankles
    if (jointsMode) {
      list.push(
        {
          slug: "knees" as Slug,
          color: "#0284c7",
          styles: {
            fill: "#0284c7",
            stroke: "#38bdf8",
            strokeWidth: 1.5,
          },
        },
        {
          slug: "ankles" as Slug,
          color: "#0284c7",
          styles: {
            fill: "#0284c7",
            stroke: "#38bdf8",
            strokeWidth: 1.5,
          },
        }
      );
    }

    // 3. Hovered muscle (bright coral red)
    if (hoveredMuscle && hoveredMuscle !== selectedMuscle) {
      const slug = normalizeMuscleSlug(hoveredMuscle);
      list.push({
        slug: slug as Slug,
        color: "#ff385c",
        styles: {
          fill: "#ff385c",
          stroke: "#ffffff",
          strokeWidth: 1.5,
        },
      });
    }

    // 4. Selected muscle (iconic MuscleWiki active crimson red)
    if (selectedMuscle) {
      const slug = normalizeMuscleSlug(selectedMuscle);
      list.push({
        slug: slug as Slug,
        color: "#ea384c",
        styles: {
          fill: "#ea384c",
          stroke: "#ffffff",
          strokeWidth: 1.8,
        },
      });
    }

    return list;
  }, [selectedMuscle, hoveredMuscle, activeHighlightedSlugs, jointsMode]);

  // Disabled parts (when joints mode is off, knees and ankles remain neutral)
  const disabledParts = useMemo(() => {
    const disabled: Slug[] = ["hands", "feet", "head", "hair"];
    if (!jointsMode) {
      disabled.push("knees", "ankles");
    }
    return disabled;
  }, [jointsMode]);

  // ─── CLICK & HOVER EVENT HANDLERS ───
  const handleMuscleClick = useCallback((slug?: string) => {
    if (!slug) return;
    setSelectedMuscle((prev) => (prev === slug ? null : slug));
  }, []);

  const handleStageMouseOver = useCallback((e: React.MouseEvent) => {
    const target = e.target as SVGElement;
    const path = target.closest("path");
    if (path && path.id && !path.id.includes("outline")) {
      const slug = path.id;
      setHoveredMuscle(slug);
      setTooltip({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        muscleId: slug,
      });
    }
  }, []);

  const handleStageMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltip((prev) => {
      if (!prev.visible) return prev;
      return { ...prev, x: e.clientX, y: e.clientY };
    });
  }, []);

  const handleStageMouseLeave = useCallback(() => {
    setHoveredMuscle(null);
    setTooltip((prev) => ({ ...prev, visible: false, muscleId: null }));
  }, []);

  // ─── DYNAMIC EXERCISE QUERYING & FILTERING ───
  const { allExercises, mapping } = useMemo(() => {
    if (!selectedMuscle) return { allExercises: [], mapping: null };
    const res = getExercisesForMuscle(selectedMuscle);
    return { allExercises: res.exercises, mapping: res.mapping };
  }, [selectedMuscle]);

  // Filter exercises according to checked equipment checklist
  const filteredExercises = useMemo(() => {
    if (!selectedMuscle || allExercises.length === 0) return [];
    if (selectedEquipment.includes("featured")) {
      return allExercises;
    }

    // Active equipment keywords
    const activeKeywords: string[] = [];
    selectedEquipment.forEach((eqId) => {
      const item = EQUIPMENT_ITEMS.find((it) => it.id === eqId);
      if (item) activeKeywords.push(...item.filterKeywords);
    });

    if (activeKeywords.length === 0) return allExercises;

    return allExercises.filter((ex) => {
      const eqLower = (ex.equipment || "").toLowerCase();
      return activeKeywords.some((kw) => eqLower.includes(kw));
    });
  }, [selectedMuscle, allExercises, selectedEquipment]);

  // Hovered muscle details for floating cursor badge
  const hoveredInfo = useMemo(() => {
    if (!tooltip.muscleId) return null;
    const map = MUSCLE_MAPPINGS[tooltip.muscleId];
    if (!map) return null;
    const { count } = getExercisesForMuscle(tooltip.muscleId);
    return {
      name: map.displayName,
      latin: map.latinName,
      count,
    };
  }, [tooltip.muscleId]);

  return (
    <div className="musclewiki-theme-root">
      {/* ─── MAIN DUAL-PANEL INTERFACE ─── */}
      <div className="mw-main-layout">
        {/* ─── LEFT COLUMN: DUAL ANATOMICAL VECTOR MODELS (FRONT & BACK) ─── */}
        <div className="mw-diagram-stage">
          {/* Quick Header / Stage Info */}
          <div className="mw-stage-header">
            <div className="flex items-center gap-2">
              <span className="mw-brand-title">MuscleWiki Interactive Stage</span>
              <span className="mw-brand-pill">Vector Dual-View</span>
            </div>

            {/* Quick Zoom & Reset Controls */}
            <div className="flex items-center gap-1">
              <button
                className="mw-zoom-btn"
                onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.4))}
                title="Zoom In"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                className="mw-zoom-btn"
                onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.85))}
                title="Zoom Out"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              {zoomLevel !== 1 && (
                <button
                  className="mw-zoom-btn text-cyan-400"
                  onClick={() => setZoomLevel(1)}
                  title="Reset Zoom"
                  aria-label="Reset zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Side-by-Side Anatomical SVGs Canvas */}
          <div
            className="mw-canvas-wrapper"
            style={{ transform: `scale(${zoomLevel})` }}
            onMouseOver={handleStageMouseOver}
            onMouseMove={handleStageMouseMove}
            onMouseLeave={handleStageMouseLeave}
          >
            {/* Anterior (Front) Body */}
            <div className="mw-figure-card">
              <span className="mw-figure-caption">Anterior (Front)</span>
              <div className="mw-body-svg-box">
                <Body
                  side="front"
                  gender={currentGender}
                  data={bodyData}
                  scale={1.35}
                  border="#ffffff"
                  defaultFill="#4d515a"
                  defaultStroke="#ffffff"
                  defaultStrokeWidth={1.2}
                  disabledParts={disabledParts}
                  onBodyPartPress={(b) => handleMuscleClick(b.slug)}
                />
              </div>
            </div>

            {/* Posterior (Back) Body */}
            <div className="mw-figure-card">
              <span className="mw-figure-caption">Posterior (Back)</span>
              <div className="mw-body-svg-box">
                <Body
                  side="back"
                  gender={currentGender}
                  data={bodyData}
                  scale={1.35}
                  border="#ffffff"
                  defaultFill="#4d515a"
                  defaultStroke="#ffffff"
                  defaultStrokeWidth={1.2}
                  disabledParts={disabledParts}
                  onBodyPartPress={(b) => handleMuscleClick(b.slug)}
                />
              </div>
            </div>
          </div>

          {/* Quick Target System Split Selector */}
          <div className="mw-stage-footer">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 font-medium mr-1">Target Split:</span>
              {(["all", "push", "pull", "legs", "core"] as const).map((split) => (
                <button
                  key={split}
                  className={`mw-split-pill ${activeSplit === split ? "active" : ""}`}
                  onClick={() => {
                    setActiveSplit(split);
                    setSearchQuery("");
                  }}
                >
                  {split === "all" ? "All" : split.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Quick Live Search Filter */}
            <div className="mw-mini-search">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Find muscle..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) setActiveSplit("all");
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} aria-label="Clear search">
                  <X className="w-3 h-3 text-slate-400 hover:text-white" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: TOP BLUE SWITCHES + EQUIPMENT CHECKLIST + EXERCISES ─── */}
        <div className="mw-sidebar">
          {/* Top Blue Control Box (Male/Female, Advanced, Joints) */}
          <div className="mw-top-control-card">
            {/* 1. Gender Switch */}
            <div className="mw-control-unit">
              <div
                className={`mw-switch-toggle ${currentGender === "male" ? "active-male" : "active-female"}`}
                onClick={() => setCurrentGender((g) => (g === "male" ? "female" : "male"))}
                role="button"
                tabIndex={0}
                title="Toggle Male / Female Silhouette"
              >
                <div className="mw-switch-thumb">
                  <span>{currentGender === "male" ? "♂" : "♀"}</span>
                </div>
              </div>
              <span className="mw-control-label">
                {currentGender === "male" ? "Male" : "Female"}
              </span>
            </div>

            {/* 2. Advanced Switch */}
            <div className="mw-control-unit">
              <div
                className={`mw-switch-toggle ${advancedMode ? "active" : ""}`}
                onClick={() => setAdvancedMode((v) => !v)}
                role="button"
                tabIndex={0}
                title="Toggle Advanced Biomechanics"
              >
                <div className="mw-switch-thumb" />
              </div>
              <span className="mw-control-label">Advanced</span>
            </div>

            {/* 3. Joints Switch */}
            <div className="mw-control-unit">
              <div
                className={`mw-switch-toggle ${jointsMode ? "active" : ""}`}
                onClick={() => setJointsMode((v) => !v)}
                role="button"
                tabIndex={0}
                title="Toggle Interactive Joints (Knees & Ankles)"
              >
                <div className="mw-switch-thumb" />
              </div>
              <span className="mw-control-label">Joints</span>
            </div>
          </div>

          {/* Equipment Checklist Section */}
          <div className="mw-equipment-section">
            <div
              className="mw-equipment-header"
              onClick={() => setIsEquipmentOpen((open) => !open)}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-2">
                <span className="mw-section-title">Equipment</span>
                {!selectedEquipment.includes("featured") && (
                  <span className="mw-filter-count-badge">
                    {selectedEquipment.length} Active
                  </span>
                )}
              </div>
              <button className="mw-collapse-btn" aria-label="Toggle equipment view">
                {isEquipmentOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {isEquipmentOpen && (
              <div className="mw-equipment-grid">
                {/* Column 1 */}
                <div className="mw-eq-column">
                  {EQUIPMENT_ITEMS.filter((item) => item.column === 1).map((item) => {
                    const isChecked = selectedEquipment.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`mw-eq-item ${isChecked ? "checked" : ""}`}
                        onClick={() => handleToggleEquipment(item.id)}
                        role="checkbox"
                        aria-checked={isChecked}
                        tabIndex={0}
                      >
                        <div className={`mw-checkbox ${isChecked ? "checked" : ""}`}>
                          {isChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <EquipmentIcon id={item.id} />
                        <span className="mw-eq-name">{item.name}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Column 2 */}
                <div className="mw-eq-column">
                  {EQUIPMENT_ITEMS.filter((item) => item.column === 2).map((item) => {
                    const isChecked = selectedEquipment.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`mw-eq-item ${isChecked ? "checked" : ""}`}
                        onClick={() => handleToggleEquipment(item.id)}
                        role="checkbox"
                        aria-checked={isChecked}
                        tabIndex={0}
                      >
                        <div className={`mw-checkbox ${isChecked ? "checked" : ""}`}>
                          {isChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <EquipmentIcon id={item.id} />
                        <span className="mw-eq-name">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Muscle Detail & Targeted Exercises Card */}
          <div className="mw-exercise-section">
            {selectedMuscle && mapping ? (
              <div className="mw-active-muscle-card">
                {/* Active Muscle Header */}
                <div className="mw-muscle-header">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="mw-muscle-name">{mapping.displayName}</h4>
                      {mapping.category && (
                        <span className="mw-category-tag">{mapping.category}</span>
                      )}
                    </div>
                    {advancedMode && mapping.latinName && (
                      <p className="mw-latin-name">Anatomical: {mapping.latinName}</p>
                    )}
                  </div>
                  <button
                    className="mw-close-muscle-btn"
                    onClick={() => setSelectedMuscle(null)}
                    title="Deselect muscle"
                    aria-label="Close muscle view"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Advanced Mode: Biomechanics & Synergists */}
                {advancedMode && mapping.functionDescription && (
                  <div className="mw-biomechanics-box">
                    <p className="text-xs text-slate-300 leading-relaxed mb-2">
                      <strong>Biomechanics:</strong> {mapping.functionDescription}
                    </p>
                    {mapping.synergists && mapping.synergists.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400">
                        <span className="text-cyan-400 font-semibold">Synergists:</span>
                        {mapping.synergists.join(", ")}
                      </div>
                    )}
                  </div>
                )}

                {/* Exercises Count Bar */}
                <div className="mw-exercise-summary-bar">
                  <span>
                    <strong>{filteredExercises.length}</strong> Exercises Found
                  </span>
                  <button
                    className="mw-library-link"
                    onClick={() => navigate(getMuscleRoute(selectedMuscle))}
                  >
                    <span>Full Library</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Filtered Exercise Cards List */}
                <div className="mw-exercise-list">
                  {filteredExercises.length === 0 ? (
                    <div className="mw-no-exercises">
                      <p>No exercises match the selected equipment filter.</p>
                      <button
                        className="mw-reset-eq-btn"
                        onClick={() => setSelectedEquipment(["featured"])}
                      >
                        Reset to Featured Equipment
                      </button>
                    </div>
                  ) : (
                    filteredExercises.slice(0, 10).map((ex) => (
                      <div
                        key={ex.id}
                        className="mw-exercise-item"
                        onClick={() => setPreviewExercise(ex)}
                      >
                        <div className="mw-ex-thumb">
                          {ex.poster ? (
                            <img
                              src={ex.poster}
                              alt={ex.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="mw-thumb-placeholder">
                              <Dumbbell className="w-4 h-4 text-slate-500" />
                            </div>
                          )}
                          <div className="mw-play-overlay">
                            <PlayCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="mw-ex-details">
                          <h5 className="mw-ex-name">{ex.name}</h5>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="text-slate-300">{ex.equipment || "Bodyweight"}</span>
                            <span>•</span>
                            <span
                              className={
                                ex.difficulty === "Beginner"
                                  ? "text-emerald-400"
                                  : ex.difficulty === "Intermediate"
                                  ? "text-amber-400"
                                  : "text-rose-400"
                              }
                            >
                              {ex.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Empty Selection State */
              <div className="mw-empty-prompt">
                <div className="mw-empty-icon-wrap">
                  <Activity className="w-6 h-6 text-red-500" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Click Any Muscle on the Diagram</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  Select chest, biceps, quads, back, or shoulders to see targeted exercises matching your checked equipment.
                </p>
                <div className="mw-quick-shortcuts">
                  {["chest", "quadriceps", "biceps", "upper-back", "gluteal"].map((m) => (
                    <button
                      key={m}
                      className="mw-shortcut-chip"
                      onClick={() => handleMuscleClick(m)}
                    >
                      {MUSCLE_MAPPINGS[m]?.displayName.split(" ")[0] || m}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── FLOATING CURSOR TOOLTIP ─── */}
      {tooltip.visible && hoveredInfo && (
        <div
          className="mw-floating-tooltip"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
        >
          <div className="mw-tip-name">{hoveredInfo.name}</div>
          {hoveredInfo.latin && (
            <div className="mw-tip-latin"><em>{hoveredInfo.latin}</em></div>
          )}
          <div className="mw-tip-count">
            <Sparkles className="w-3 h-3 text-red-400" />
            <span>{hoveredInfo.count} Exercises</span>
          </div>
        </div>
      )}

      {/* ─── EXERCISE VIDEO PREVIEW MODAL ─── */}
      <Dialog
        open={!!previewExercise}
        onOpenChange={(open) => {
          if (!open) setPreviewExercise(null);
        }}
      >
        <DialogContent className="max-w-2xl bg-slate-950 border border-slate-800 text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span>{previewExercise?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Target: {previewExercise?.muscleGroup} • Equipment: {previewExercise?.equipment} • Difficulty: {previewExercise?.difficulty}
            </DialogDescription>
          </DialogHeader>

          {previewExercise && (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                <ErrorBoundary
                  fallback={
                    <div className="p-8 text-center text-sm text-slate-400">
                      Unable to play demonstration video.
                    </div>
                  }
                >
                  <ExerciseVideoPlayer
                    exercise={previewExercise}
                  />
                </ErrorBoundary>
              </div>

              {previewExercise.description && (
                <p className="text-sm text-slate-300 leading-relaxed">
                  {previewExercise.description}
                </p>
              )}

              <div className="flex justify-end pt-2">
                <button
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  onClick={() => {
                    setPreviewExercise(null);
                    if (selectedMuscle) navigate(getMuscleRoute(selectedMuscle));
                  }}
                >
                  <span>Explore Exercise Guides</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
