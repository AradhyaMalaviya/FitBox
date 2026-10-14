import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  stretches,
  getStretchesForMuscleGroup,
  getStretchMuscleGroups,
  type Stretch,
} from '@/data/stretches';
import {
  Search,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Activity,
  ArrowLeft,
  Layers,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const MUSCLE_GROUP_ICONS: Record<string, string> = {
  Chest: '🏋️',
  Shoulders: '💪',
  Back: '🚣',
  Arms: '💥',
  Legs: '🦵',
  Core: '⚡',
};

const CATEGORY_COLORS: Record<string, string> = {
  Static: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  Dynamic: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  PNF: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
  Active: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'bg-green-500/15 text-green-500 border-green-500/30',
  Intermediate: 'bg-orange-500/15 text-orange-500 border-orange-500/30',
  Advanced: 'bg-red-500/15 text-red-500 border-red-500/30',
};

const StretchCard: React.FC<{ stretch: Stretch; defaultOpen?: boolean }> = ({
  stretch,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="bg-card/80 border-border/60 overflow-hidden transition-all hover:border-primary/40">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 text-left flex items-start sm:items-center gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center shrink-0 text-lg">
          {MUSCLE_GROUP_ICONS[stretch.muscleGroup] || '🧘'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
              {stretch.name}
            </h3>
            <Badge variant="outline" className={`text-[10px] py-0 px-1.5 border font-medium ${CATEGORY_COLORS[stretch.category] || ''}`}>
              {stretch.category}
            </Badge>
            <Badge variant="outline" className={`text-[10px] py-0 px-1.5 border font-medium ${DIFFICULTY_COLORS[stretch.difficulty] || ''}`}>
              {stretch.difficulty}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {stretch.targetArea} • {stretch.holdDuration} • {stretch.equipment === 'None' ? 'No Equipment' : stretch.equipment}
          </p>
        </div>

        <div className="text-muted-foreground shrink-0">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Expanded Details */}
      {isOpen && (
        <div className="px-4 sm:px-5 pb-5 pt-0 border-t border-border/40 space-y-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed pt-4">
            {stretch.description}
          </p>

          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/30 text-center">
              <Clock className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
              <span className="text-[11px] text-muted-foreground block">Hold Duration</span>
              <span className="text-xs font-bold text-foreground">{stretch.holdDuration}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/30 text-center">
              <Target className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
              <span className="text-[11px] text-muted-foreground block">Target</span>
              <span className="text-xs font-bold text-foreground">{stretch.muscleGroup}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/30 text-center">
              <Activity className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
              <span className="text-[11px] text-muted-foreground block">Type</span>
              <span className="text-xs font-bold text-foreground">{stretch.category}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/30 text-center">
              <Layers className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
              <span className="text-[11px] text-muted-foreground block">Equipment</span>
              <span className="text-xs font-bold text-foreground">{stretch.equipment === 'None' ? 'Body Only' : stretch.equipment}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Step-by-Step Instructions
            </h4>
            <ol className="space-y-2 pl-1">
              {stretch.instructions.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground/90 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          {stretch.tips.length > 0 && (
            <div className="space-y-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Pro Tips
              </h4>
              <ul className="space-y-1.5">
                {stretch.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

const Stretches: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const muscleGroups = useMemo(() => getStretchMuscleGroups(), []);

  const filteredStretches = useMemo(() => {
    return stretches.filter((s) => {
      const matchesGroup = selectedGroup === 'All' || s.muscleGroup === selectedGroup;
      const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || s.difficulty === selectedDifficulty;
      const matchesSearch =
        !searchTerm.trim() ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.targetArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesGroup && matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [selectedGroup, selectedCategory, selectedDifficulty, searchTerm]);

  // Group stretches by muscle group for the grouped view
  const groupedStretches = useMemo(() => {
    if (selectedGroup !== 'All') return null;
    const groups: Record<string, typeof filteredStretches> = {};
    filteredStretches.forEach((s) => {
      if (!groups[s.muscleGroup]) groups[s.muscleGroup] = [];
      groups[s.muscleGroup].push(s);
    });
    return groups;
  }, [filteredStretches, selectedGroup]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Banner */}
      <section className="border-b border-border/40 bg-card/40 backdrop-blur-md py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Dashboard
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  MuscleWiki Flexibility Library
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Stretches & Mobility
              </h1>
              <p className="text-muted-foreground mt-1 max-w-2xl text-sm sm:text-base">
                {stretches.length} targeted stretches across {muscleGroups.length} muscle groups.
                Improve flexibility, prevent injury, and optimize recovery with step-by-step guidance.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-4 p-3 bg-muted/40 rounded-xl border border-border/40">
                <div className="text-center">
                  <span className="text-lg font-bold text-primary block">{stretches.length}</span>
                  <span className="text-[11px]">Stretches</span>
                </div>
                <div className="text-center">
                  <span className="text-lg font-bold text-foreground block">{muscleGroups.length}</span>
                  <span className="text-[11px]">Muscle Groups</span>
                </div>
                <div className="text-center">
                  <span className="text-lg font-bold text-emerald-500 block">4</span>
                  <span className="text-[11px]">Categories</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Filters Bar */}
        <Card className="p-4 sm:p-5 bg-card/80 border-border/60 shadow-sm space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search stretches by name, target area, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border/60 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Filter Rows */}
          <div className="flex flex-wrap gap-4">
            {/* Muscle Group Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Muscle Group</label>
              <div className="flex flex-wrap gap-1.5">
                {['All', ...muscleGroups].map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setSelectedGroup(grp)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedGroup === grp
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-background border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    {grp !== 'All' ? `${MUSCLE_GROUP_ICONS[grp] || ''} ` : ''}{grp}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Type</label>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Static', 'Dynamic', 'PNF', 'Active'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-background border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Difficulty</label>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedDifficulty === diff
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-background border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
        {filteredStretches.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground space-y-3">
            <div className="text-4xl">🧘</div>
            <h3 className="font-semibold text-foreground text-base">No stretches match your filters</h3>
            <p className="text-xs max-w-sm mx-auto">
              Try broadening your search or selecting a different muscle group, category, or difficulty level.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedGroup('All');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
                setSearchTerm('');
              }}
              className="mt-2 text-xs"
            >
              Reset All Filters
            </Button>
          </div>
        ) : selectedGroup !== 'All' ? (
          /* Flat list when a specific group is selected */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>{MUSCLE_GROUP_ICONS[selectedGroup] || '🧘'}</span>
                {selectedGroup} Stretches
              </h2>
              <span className="text-xs text-muted-foreground">{filteredStretches.length} stretches</span>
            </div>
            {filteredStretches.map((s) => (
              <StretchCard key={s.id} stretch={s} />
            ))}
          </div>
        ) : groupedStretches ? (
          /* Grouped view when "All" is selected */
          <div className="space-y-8">
            {Object.entries(groupedStretches).map(([group, groupStretches]) => (
              <div key={group} className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span>{MUSCLE_GROUP_ICONS[group] || '🧘'}</span>
                    {group}
                  </h2>
                  <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                    {groupStretches.length} stretches
                  </Badge>
                </div>
                {groupStretches.map((s) => (
                  <StretchCard key={s.id} stretch={s} />
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default Stretches;
