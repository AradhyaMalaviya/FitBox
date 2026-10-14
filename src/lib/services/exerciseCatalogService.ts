import { exercises, Exercise } from '@/data/exercises';

export interface ExerciseQueryOptions {
  muscleGroup?: string;
  equipment?: string;
  difficulty?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ExerciseCatalogResult {
  exercises: Exercise[];
  total: number;
  hasMore: boolean;
  page: number;
}

export interface ExerciseTaxonomy {
  muscleGroups: string[];
  equipmentList: string[];
  difficulties: string[];
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ExerciseCatalogService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
  private readonly providerMode: 'local' | 'musclewiki-api';

  constructor() {
    // Check if an authorized external MuscleWiki API key or proxy is explicitly set
    const apiKey = typeof window !== 'undefined' ? (window as unknown as { __FITBOX_MW_KEY__?: string }).__FITBOX_MW_KEY__ : undefined;
    this.providerMode = apiKey ? 'musclewiki-api' : 'local';
  }

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCached<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Retrieves a filtered & paginated page of exercises.
   */
  public async getExercises(options: ExerciseQueryOptions = {}): Promise<ExerciseCatalogResult> {
    const cacheKey = `exercises:${JSON.stringify(options)}`;
    const cached = this.getCached<ExerciseCatalogResult>(cacheKey);
    if (cached) return cached;

    const {
      muscleGroup,
      equipment,
      difficulty,
      search,
      limit = 24,
      offset = 0,
    } = options;

    let filtered = [...exercises];

    if (muscleGroup && muscleGroup !== 'All') {
      const target = muscleGroup.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.muscleGroup.toLowerCase() === target ||
          (target === 'legs' && (ex.muscleGroup.toLowerCase() === 'quads' || ex.muscleGroup.toLowerCase() === 'hamstrings' || ex.muscleGroup.toLowerCase() === 'calves' || ex.muscleGroup.toLowerCase() === 'glutes')) ||
          (target === 'arms' && (ex.muscleGroup.toLowerCase() === 'biceps' || ex.muscleGroup.toLowerCase() === 'triceps' || ex.muscleGroup.toLowerCase() === 'forearms'))
      );
    }

    if (equipment && equipment !== 'All') {
      const eqTarget = equipment.toLowerCase();
      filtered = filtered.filter((ex) => ex.equipment.toLowerCase().includes(eqTarget));
    }

    if (difficulty && difficulty !== 'All') {
      filtered = filtered.filter((ex) => ex.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) ||
          ex.equipment.toLowerCase().includes(q) ||
          ex.muscleGroup.toLowerCase().includes(q) ||
          (ex.description && ex.description.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);
    const hasMore = offset + limit < total;
    const page = Math.floor(offset / limit) + 1;

    const result: ExerciseCatalogResult = {
      exercises: paginated,
      total,
      hasMore,
      page,
    };

    this.setCached(cacheKey, result);
    return result;
  }

  /**
   * Finds a specific exercise by ID.
   */
  public async getExerciseById(id: string): Promise<Exercise | null> {
    const cacheKey = `exercise:${id}`;
    const cached = this.getCached<Exercise>(cacheKey);
    if (cached) return cached;

    const match = exercises.find((ex) => ex.id === id) || null;
    if (match) {
      this.setCached(cacheKey, match);
    }
    return match;
  }

  /**
   * Performs quick fuzzy-like search across exercise names.
   */
  public async searchExercises(query: string, limit = 10): Promise<Exercise[]> {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    const matches = exercises
      .filter((ex) => ex.name.toLowerCase().includes(q) || ex.equipment.toLowerCase().includes(q) || ex.muscleGroup.toLowerCase().includes(q))
      .slice(0, limit);
    return matches;
  }

  /**
   * Returns related exercise variations (same muscle group, complementary equipment).
   */
  public async getRelatedExercises(exerciseId: string, limit = 4): Promise<Exercise[]> {
    const current = await this.getExerciseById(exerciseId);
    if (!current) return [];

    const related = exercises
      .filter((ex) => ex.id !== exerciseId && ex.muscleGroup.toLowerCase() === current.muscleGroup.toLowerCase())
      .slice(0, limit);

    return related;
  }

  /**
   * Returns complete taxonomies available in the catalog.
   */
  public async getAvailableTaxonomy(): Promise<ExerciseTaxonomy> {
    const cacheKey = 'taxonomy:summary';
    const cached = this.getCached<ExerciseTaxonomy>(cacheKey);
    if (cached) return cached;

    const muscleGroups = Array.from(new Set(exercises.map((e) => e.muscleGroup))).sort();
    const equipmentList = Array.from(new Set(exercises.map((e) => e.equipment))).sort();
    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

    const summary: ExerciseTaxonomy = {
      muscleGroups,
      equipmentList,
      difficulties,
    };

    this.setCached(cacheKey, summary);
    return summary;
  }

  /**
   * Returns diagnostic info on data source and memory cache.
   */
  public getProviderStatus() {
    return {
      provider: this.providerMode,
      totalExercisesCount: exercises.length,
      cachedQueriesCount: this.cache.size,
      isOfflineCapable: true,
    };
  }

  /**
   * Clear in-memory cache.
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

export const exerciseCatalogService = new ExerciseCatalogService();
