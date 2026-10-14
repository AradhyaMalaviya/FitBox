import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { FITNESS_ARTICLES, FitnessArticle } from '@/data/fitnessArticles';
import { exercises } from '@/data/exercises';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Search,
  Clock,
  User,
  Calendar,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Dumbbell,
  Compass,
  Lightbulb,
  Share2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Articles: React.FC = () => {
  const { articleId } = useParams<{ articleId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Nutrition',
    'Hypertrophy Science',
    'Exercise Technique',
    'Injury Prevention',
    'Program Design',
  ];

  const currentArticle = useMemo(() => {
    if (!articleId) return null;
    return FITNESS_ARTICLES.find((a) => a.id === articleId) || null;
  }, [articleId]);

  const filteredArticles = useMemo(() => {
    return FITNESS_ARTICLES.filter((art) => {
      const matchesSearch =
        art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
        art.author.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = selectedCategory === 'All' || art.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchTerm, selectedCategory]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Article link copied!',
        description: 'URL copied to clipboard to share.',
      });
    }
  };

  // ==========================================
  // SINGLE ARTICLE DETAIL VIEW
  // ==========================================
  if (currentArticle) {
    const relatedExercises = exercises.filter((ex) =>
      currentArticle.relatedExerciseIds.includes(ex.id)
    );

    return (
      <div className="min-h-screen bg-background text-foreground pb-20 md:pb-12">
        <Header />

        {/* Back navigation & article header */}
        <div className="border-b border-border/40 bg-card/30 backdrop-blur-md py-6 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/articles')}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Article Library
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs text-primary border-primary/40">
                {currentArticle.category}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {currentArticle.readTimeMinutes} min read
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {currentArticle.publishedDate}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {currentArticle.title}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
              {currentArticle.summary}
            </p>

            {/* Author Attribution & Share */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm">
                  {currentArticle.author.name.charAt(0)}
                </div>
                <div>
                  <span className="font-semibold text-xs sm:text-sm text-foreground block">
                    {currentArticle.author.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {currentArticle.author.title}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-1.5 text-xs border-border/60"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Article Content Body */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="space-y-8">
            {currentArticle.sections.map((section, idx) => (
              <section key={idx} className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  {section.heading}
                </h2>

                <div className="space-y-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
                  {section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>

                {section.keyTakeaway && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs sm:text-sm my-4 flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground block font-semibold mb-0.5">
                        Key Takeaway
                      </strong>
                      <span className="text-muted-foreground">{section.keyTakeaway}</span>
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Target Anatomy & Related Exercises */}
          <div className="mt-12 pt-8 border-t border-border/60 space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-2">Target Muscle Anatomy</h3>
              <div className="flex flex-wrap gap-1.5">
                {currentArticle.targetMuscles.map((muscle) => (
                  <Link
                    key={muscle}
                    to={`/exercises/${muscle.toLowerCase()}`}
                    className="text-xs px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/30 font-medium hover:bg-primary/20 transition-colors"
                  >
                    Explore {muscle} Exercises →
                  </Link>
                ))}
              </div>
            </div>

            {relatedExercises.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-3">Relevant Exercise Demonstrations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedExercises.map((ex) => (
                    <Card
                      key={ex.id}
                      onClick={() => navigate(`/exercise/${ex.id}`)}
                      className="p-3.5 bg-card border-border/50 hover:border-primary/50 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                          <Dumbbell className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors block">
                            {ex.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {ex.muscleGroup} • {ex.equipment}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    );
  }

  // ==========================================
  // ARTICLE DIRECTORY / ARCHIVE VIEW
  // ==========================================
  return (
    <div className="min-h-screen bg-background text-foreground pb-20 md:pb-12">
      <Header />

      {/* Hero Header */}
      <section className="border-b border-border/40 bg-card/40 backdrop-blur-md py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10">
                  <BookOpen className="w-3.5 h-3.5 mr-1" />
                  MuscleWiki Fitness Knowledge Hub
                </Badge>
                <span className="text-xs text-muted-foreground">Evidence-Based Exercise & Nutrition Science</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Fitness Articles & Guides
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1.5 max-w-2xl">
                Deepen your understanding of biomechanics, muscle protein synthesis, volume periodization, and injury prevention with peer-reviewed guides.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/tools')}
                className="gap-2 text-xs border-primary/30 hover:border-primary"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                Fitness Calculators
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/exercises')}
                className="gap-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
              >
                <Compass className="w-4 h-4" />
                Browse Exercise Map
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles by title, topic, hypertrophy, protein, bench press..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card border border-border/60 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:block" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 px-1">
          <span>
            Showing <strong className="text-foreground">{filteredArticles.length}</strong> of{' '}
            {FITNESS_ARTICLES.length} published articles
          </span>
          {(searchTerm || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="text-primary hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-card/20 rounded-2xl border border-dashed border-border/60">
            <BookOpen className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-bold">No articles match your search</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
              Try adjusting your search keywords or resetting category filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                onClick={() => navigate(`/articles/${article.id}`)}
                className="bg-card border-border/60 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-sm hover:shadow-lg cursor-pointer"
              >
                <div className="p-6 flex-1 flex flex-col">
                  {/* Category & Read Time */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="outline" className="text-xs text-primary border-primary/30 font-semibold">
                      {article.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTimeMinutes} min
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-3 mt-2 mb-4 flex-1">
                    {article.summary}
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-2 pt-3 border-t border-border/30 text-xs text-muted-foreground">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>{article.author.name}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {article.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="px-6 py-3 bg-muted/20 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary group-hover:bg-primary/5 transition-colors">
                  <span>Read Article</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Articles;
