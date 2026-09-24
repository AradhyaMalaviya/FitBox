// Indian Food Database for Muscle Building Nutrition
// Comprehensive database with ~150 Indian food items

export type DietType = 'veg' | 'non-veg' | 'vegan';
export type MealRole = 'breakfast' | 'pre-workout' | 'post-workout' | 'main-meal' | 'snack' | 'rest-day';
export type FoodCategory =
    | 'dairy'
    | 'eggs-proteins'
    | 'pulses-legumes'
    | 'grains-staples'
    | 'vegetables-dishes'
    | 'nuts-snacks'
    | 'oils-condiments'
    | 'prepared-meals'
    | 'regional-snacks'
    | 'beverages';

export interface FoodItem {
    id: string;
    name: string;
    hindiName?: string;
    serving: string;
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
    costRange: string;
    dietType: DietType;
    mealRoles: MealRole[];
    notes?: string;
    category: FoodCategory;
}

export interface MealPlanItem {
    meal: string;
    time: string;
    foods: string;
    protein: string;
    calories?: string;
}

export interface FoodSwap {
    item1: string;
    item2: string;
    proteinDiff?: string;
}

// ==================== DAIRY & MILK PRODUCTS ====================
export const dairyProducts: FoodItem[] = [
    {
        id: 'whole-milk',
        name: 'Whole Milk (Full-fat)',
        serving: '200 ml (1 glass)',
        protein: 6.8, carbs: 9.6, fat: 8, calories: 150,
        costRange: '₹10-20',
        dietType: 'veg',
        mealRoles: ['breakfast', 'pre-workout', 'post-workout'],
        notes: 'Daily use in chai, cereals; good immediate protein + calories',
        category: 'dairy'
    },
    {
        id: 'low-fat-milk',
        name: 'Low-fat Milk (1.5-2%)',
        serving: '200 ml',
        protein: 7, carbs: 9.6, fat: 4, calories: 120,
        costRange: '₹12-24',
        dietType: 'veg',
        mealRoles: ['breakfast', 'snack'],
        notes: 'Lower fat for cutting',
        category: 'dairy'
    },
    {
        id: 'curd-dahi',
        name: 'Curd / Dahi (Home-made)',
        hindiName: 'Dahi',
        serving: '150 g (small bowl)',
        protein: 6.5, carbs: 7, fat: 6, calories: 110,
        costRange: '₹8-20',
        dietType: 'veg',
        mealRoles: ['snack', 'rest-day', 'main-meal'],
        notes: 'Good probiotic, used as snack or side',
        category: 'dairy'
    },
    {
        id: 'hung-curd',
        name: 'Hung Curd (Chakka)',
        serving: '100 g',
        protein: 7, carbs: 3.5, fat: 7, calories: 115,
        costRange: '₹12-30',
        dietType: 'veg',
        mealRoles: ['pre-workout', 'post-workout', 'snack'],
        notes: 'Great as dip or marinade for paneer tikkas',
        category: 'dairy'
    },
    {
        id: 'paneer',
        name: 'Paneer',
        serving: '100 g',
        protein: 19, carbs: 2.5, fat: 20, calories: 300,
        costRange: '₹25-60',
        dietType: 'veg',
        mealRoles: ['main-meal', 'post-workout'],
        notes: 'Staple vegetarian muscle food',
        category: 'dairy'
    },
    {
        id: 'low-fat-paneer',
        name: 'Low-fat Paneer',
        serving: '100 g',
        protein: 20, carbs: 2.5, fat: 10, calories: 220,
        costRange: '₹30-70',
        dietType: 'veg',
        mealRoles: ['main-meal', 'rest-day'],
        notes: 'Better for cutting',
        category: 'dairy'
    },
    {
        id: 'ghee',
        name: 'Ghee (Clarified Butter)',
        serving: '1 tsp (5 g)',
        protein: 0, carbs: 0, fat: 5, calories: 45,
        costRange: '₹6-12',
        dietType: 'veg',
        mealRoles: ['breakfast', 'main-meal'],
        notes: 'Flavor, calorie-dense; use in khichdi or for bulking',
        category: 'dairy'
    },
    {
        id: 'buttermilk',
        name: 'Buttermilk (Chaas)',
        hindiName: 'Chaas',
        serving: '200 ml',
        protein: 3.5, carbs: 5.5, fat: 2.5, calories: 60,
        costRange: '₹8-20',
        dietType: 'veg',
        mealRoles: ['snack', 'rest-day'],
        notes: 'Hydrating, good for digestion',
        category: 'dairy'
    },
    {
        id: 'whey-concentrate',
        name: 'Whey Protein (Concentrate)',
        serving: '1 scoop (30 g)',
        protein: 25, carbs: 4, fat: 2, calories: 130,
        costRange: '₹40-100',
        dietType: 'veg',
        mealRoles: ['post-workout', 'snack'],
        notes: 'Convenient protein top-up',
        category: 'dairy'
    },
    {
        id: 'soya-milk',
        name: 'Soya Milk (Unsweetened)',
        serving: '200 ml',
        protein: 6.5, carbs: 4.5, fat: 4, calories: 90,
        costRange: '₹20-40',
        dietType: 'vegan',
        mealRoles: ['breakfast', 'snack'],
        notes: 'Dairy-free option',
        category: 'dairy'
    },
    {
        id: 'paneer-bhurji',
        name: 'Paneer Bhurji',
        serving: '150 g cooked',
        protein: 30, carbs: 11, fat: 24, calories: 420,
        costRange: '₹40-80',
        dietType: 'veg',
        mealRoles: ['post-workout', 'main-meal'],
        notes: 'Great as dinner; high protein',
        category: 'dairy'
    },
    {
        id: 'lassi',
        name: 'Lassi (Plain/Sweet)',
        serving: '200 ml',
        protein: 7, carbs: 15, fat: 6.5, calories: 160,
        costRange: '₹20-50',
        dietType: 'veg',
        mealRoles: ['snack', 'post-workout'],
        notes: 'Energy and calories; prefer plain for cutting',
        category: 'dairy'
    },
    {
        id: 'whey-isolate',
        name: 'Whey Isolate',
        serving: '1 scoop (25 g)',
        protein: 26, carbs: 1.5, fat: 0.5, calories: 105,
        costRange: '₹50-120',
        dietType: 'veg',
        mealRoles: ['post-workout'],
        notes: 'Lower lactose, good for quick top-up',
        category: 'dairy'
    },
    {
        id: 'paneer-tikka',
        name: 'Paneer Tikka',
        serving: '150 g (8-10 cubes)',
        protein: 27.5, carbs: 9, fat: 21, calories: 400,
        costRange: '₹60-120',
        dietType: 'veg',
        mealRoles: ['main-meal', 'post-workout'],
        notes: 'Good party or dinner option',
        category: 'dairy'
    },
    {
        id: 'cheese-slice',
        name: 'Cheese (Processed)',
        serving: '1 slice (20 g)',
        protein: 4.5, carbs: 1.5, fat: 5.5, calories: 80,
        costRange: '₹6-15',
        dietType: 'veg',
        mealRoles: ['snack', 'breakfast'],
        notes: 'Use sparingly; not as nutritious as paneer',
        category: 'dairy'
    }
];

// ==================== EGGS & PROTEINS ====================
export const eggsProteins: FoodItem[] = [
    {
        id: 'whole-egg',
        name: 'Egg (Whole, Large)',
        serving: '1 large egg (50 g)',
        protein: 6.5, carbs: 0.4, fat: 5, calories: 74,
        costRange: '₹6-15',
        dietType: 'non-veg',
        mealRoles: ['breakfast', 'post-workout'],
        notes: 'Cheap, versatile',
        category: 'eggs-proteins'
    },
    {
        id: 'egg-whites',
        name: 'Egg Whites',
        serving: '3 large whites (100 g)',
        protein: 10.5, carbs: 0.9, fat: 0, calories: 50,
        costRange: '₹6-12',
        dietType: 'non-veg',
        mealRoles: ['breakfast', 'snack'],
        notes: 'Low-fat protein',
        category: 'eggs-proteins'
    },
    {
        id: 'boiled-eggs',
        name: 'Boiled Eggs',
        serving: '2 eggs',
        protein: 13.5, carbs: 1, fat: 10, calories: 150,
        costRange: '₹12-30',
        dietType: 'non-veg',
        mealRoles: ['pre-workout', 'post-workout', 'snack'],
        notes: 'Quick snack / travel-friendly',
        category: 'eggs-proteins'
    },
    {
        id: 'chicken-breast',
        name: 'Chicken Breast (Boneless)',
        serving: '150 g cooked',
        protein: 33.5, carbs: 0, fat: 4.5, calories: 175,
        costRange: '₹80-180',
        dietType: 'non-veg',
        mealRoles: ['main-meal', 'post-workout'],
        notes: 'Lean, preferred by many gym-goers',
        category: 'eggs-proteins'
    },
    {
        id: 'chicken-thigh',
        name: 'Chicken Thigh (Skinless)',
        serving: '150 g cooked',
        protein: 29, carbs: 0, fat: 10.5, calories: 245,
        costRange: '₹70-160',
        dietType: 'non-veg',
        mealRoles: ['main-meal'],
        notes: 'More flavor, slightly higher fat',
        category: 'eggs-proteins'
    },
    {
        id: 'fish-rohu',
        name: 'Fish (Rohu/Katla)',
        serving: '150 g cooked',
        protein: 30, carbs: 0, fat: 9, calories: 210,
        costRange: '₹70-200',
        dietType: 'non-veg',
        mealRoles: ['main-meal', 'post-workout'],
        notes: 'East India favorites; good omega-3s',
        category: 'eggs-proteins'
    },
    {
        id: 'mutton',
        name: 'Mutton (Lean)',
        serving: '100 g cooked',
        protein: 27, carbs: 0, fat: 15, calories: 265,
        costRange: '₹150-400',
        dietType: 'non-veg',
        mealRoles: ['main-meal'],
        notes: 'Occasional use; high cost',
        category: 'eggs-proteins'
    },
    {
        id: 'sardines',
        name: 'Sardines / Small Oily Fish',
        serving: '100 g',
        protein: 21, carbs: 0, fat: 10, calories: 180,
        costRange: '₹30-120',
        dietType: 'non-veg',
        mealRoles: ['main-meal'],
        notes: 'Good omega-3 sources; coastal diets',
        category: 'eggs-proteins'
    }
];

// ==================== PULSES & LEGUMES ====================
export const pulsesLegumes: FoodItem[] = [
    {
        id: 'soya-chunks',
        name: 'Soya Chunks (Dry)',
        serving: '50 g dry (100 g cooked)',
        protein: 28, carbs: 10, fat: 1.25, calories: 240,
        costRange: '₹10-25',
        dietType: 'vegan',
        mealRoles: ['main-meal', 'post-workout'],
        notes: 'Very high protein/rupee',
        category: 'pulses-legumes'
    },
    {
        id: 'toor-dal',
        name: 'Toor Dal (Cooked)',
        hindiName: 'Arhar Dal',
        serving: '200 g (1 cup)',
        protein: 8.5, carbs: 32.5, fat: 1.5, calories: 220,
        costRange: '₹8-20',
        dietType: 'vegan',
        mealRoles: ['main-meal'],
        notes: 'North/South staple; pairing with rice or roti',
        category: 'pulses-legumes'
    },
    {
        id: 'moong-dal',
        name: 'Moong Dal (Cooked)',
        serving: '200 g',
        protein: 13, carbs: 31, fat: 2, calories: 240,
        costRange: '₹10-25',
        dietType: 'vegan',
        mealRoles: ['main-meal', 'rest-day'],
        notes: 'Easier to digest; good for soups/khichdi',
        category: 'pulses-legumes'
    },
    {
        id: 'masoor-dal',
        name: 'Masoor Dal (Cooked)',
        serving: '200 g',
        protein: 10, carbs: 29, fat: 1.5, calories: 215,
        costRange: '₹8-20',
        dietType: 'vegan',
        mealRoles: ['main-meal'],
        category: 'pulses-legumes'
    },
    {
        id: 'chana-chickpeas',
        name: 'Chana / Chickpeas (Cooked)',
        hindiName: 'Kabuli Chana',
        serving: '200 g',
        protein: 14.5, carbs: 42.5, fat: 4, calories: 280,
        costRange: '₹10-30',
        dietType: 'vegan',
        mealRoles: ['main-meal', 'snack'],
        notes: 'Great for chana masala, salads, roasted chana snack',
        category: 'pulses-legumes'
    },
    {
        id: 'rajma',
        name: 'Rajma / Kidney Beans (Cooked)',
        serving: '200 g',
        protein: 14, carbs: 42.5, fat: 2, calories: 280,
        costRange: '₹10-30',
        dietType: 'vegan',
        mealRoles: ['main-meal'],
        notes: 'North Indian favorite for dinner',
        category: 'pulses-legumes'
    },
    {
        id: 'urad-dal',
        name: 'Black Gram / Urad Dal (Cooked)',
        serving: '200 g',
        protein: 12, carbs: 32.5, fat: 2, calories: 260,
        costRange: '₹10-25',
        dietType: 'vegan',
        mealRoles: ['main-meal'],
        category: 'pulses-legumes'
    },
    {
        id: 'sprouted-moong',
        name: 'Sprouted Moong',
        serving: '100 g',
        protein: 6.5, carbs: 9, fat: 0.75, calories: 80,
        costRange: '₹8-20',
        dietType: 'vegan',
        mealRoles: ['breakfast', 'snack'],
        notes: 'Great salad base; very cheap and nutritious',
        category: 'pulses-legumes'
    },
    {
        id: 'sattu',
        name: 'Sattu (Roasted Gram Flour)',
        serving: '40 g drink',
        protein: 9, carbs: 17, fat: 2, calories: 160,
        costRange: '₹6-15',
        dietType: 'vegan',
        mealRoles: ['pre-workout', 'breakfast'],
        notes: 'Bihar/UP staple; filling pre-workout or morning meal',
        category: 'pulses-legumes'
    },
    {
        id: 'besan-cheela',
        name: 'Besan Cheela (2 pancakes)',
        serving: '100 g cooked',
        protein: 10.5, carbs: 32.5, fat: 7, calories: 275,
        costRange: '₹10-25',
        dietType: 'vegan',
        mealRoles: ['breakfast', 'snack'],
        category: 'pulses-legumes'
    },
    {
        id: 'tofu',
        name: 'Tofu (Firm)',
        serving: '100 g',
        protein: 10, carbs: 2.5, fat: 7, calories: 120,
        costRange: '₹25-60',
        dietType: 'vegan',
        mealRoles: ['main-meal', 'post-workout'],
        notes: 'Alternative to paneer for vegans',
        category: 'pulses-legumes'
    },
    {
        id: 'peanuts',
        name: 'Peanuts (Roasted)',
        serving: '30 g handful',
        protein: 7.5, carbs: 5, fat: 15, calories: 180,
        costRange: '₹5-12',
        dietType: 'vegan',
        mealRoles: ['snack'],
        notes: 'Very cheap calorie+protein snack',
        category: 'pulses-legumes'
    },
    {
        id: 'peanut-butter',
        name: 'Peanut Butter',
        serving: '2 tbsp (32 g)',
        protein: 8, carbs: 6, fat: 16, calories: 195,
        costRange: '₹10-40',
        dietType: 'vegan',
        mealRoles: ['breakfast', 'snack'],
        category: 'pulses-legumes'
    },
    {
        id: 'kala-chana',
        name: 'Kala Chana / Black Chickpeas',
        serving: '200 g cooked',
        protein: 15, carbs: 37.5, fat: 4, calories: 300,
        costRange: '₹10-25',
        dietType: 'vegan',
        mealRoles: ['main-meal', 'snack'],
        category: 'pulses-legumes'
    }
];

// ==================== GRAINS & STAPLES ====================
export const grainsStaples: FoodItem[] = [
    { id: 'roti', name: 'Whole Wheat Roti', serving: '1 medium (40 g)', protein: 3.5, carbs: 19, fat: 1.5, calories: 90, costRange: '₹3-10', dietType: 'vegan', mealRoles: ['main-meal'], notes: 'Everyday staple', category: 'grains-staples' },
    { id: 'paratha', name: 'Paratha (Plain)', serving: '1 paratha (80-100 g)', protein: 7, carbs: 35, fat: 14, calories: 340, costRange: '₹8-30', dietType: 'veg', mealRoles: ['breakfast', 'main-meal'], notes: 'Higher calories; good for bulking', category: 'grains-staples' },
    { id: 'brown-rice', name: 'Brown Rice (Cooked)', serving: '150-180 g', protein: 4.5, carbs: 38, fat: 1.5, calories: 200, costRange: '₹6-20', dietType: 'vegan', mealRoles: ['main-meal'], category: 'grains-staples' },
    { id: 'white-rice', name: 'White Rice (Cooked)', serving: '150-180 g', protein: 3.5, carbs: 42.5, fat: 0.7, calories: 220, costRange: '₹6-18', dietType: 'vegan', mealRoles: ['main-meal'], category: 'grains-staples' },
    { id: 'oats', name: 'Oats (Rolled)', serving: '50 g dry', protein: 6.5, carbs: 32, fat: 4, calories: 190, costRange: '₹8-25', dietType: 'vegan', mealRoles: ['breakfast', 'pre-workout'], notes: 'Breakfast standard', category: 'grains-staples' },
    { id: 'poha', name: 'Poha (Flattened Rice)', serving: '150 g cooked', protein: 4.5, carbs: 32.5, fat: 5, calories: 190, costRange: '₹8-20', dietType: 'vegan', mealRoles: ['breakfast'], category: 'grains-staples' },
    { id: 'idli', name: 'Idli', serving: '2 medium (120 g)', protein: 5, carbs: 25, fat: 1.5, calories: 165, costRange: '₹10-25', dietType: 'vegan', mealRoles: ['breakfast'], category: 'grains-staples' },
    { id: 'dosa', name: 'Dosa (Plain)', serving: '1 medium (100 g)', protein: 4, carbs: 25, fat: 8, calories: 215, costRange: '₹15-40', dietType: 'vegan', mealRoles: ['breakfast', 'main-meal'], category: 'grains-staples' },
    { id: 'millet-roti', name: 'Millet Roti (Bajra/Jowar/Ragi)', serving: '1 medium (40-50 g)', protein: 4, carbs: 20, fat: 1.5, calories: 100, costRange: '₹4-12', dietType: 'vegan', mealRoles: ['main-meal'], notes: 'Good fiber; useful for cutting', category: 'grains-staples' },
    { id: 'upma', name: 'Upma (Semolina)', serving: '200 g', protein: 6, carbs: 35, fat: 7, calories: 275, costRange: '₹10-25', dietType: 'vegan', mealRoles: ['breakfast'], category: 'grains-staples' },
    { id: 'khichdi', name: 'Khichdi (Moong + Rice)', serving: '300-350 g', protein: 13.5, carbs: 65, fat: 8, calories: 470, costRange: '₹12-40', dietType: 'veg', mealRoles: ['main-meal', 'rest-day'], category: 'grains-staples' },
    { id: 'brown-bread', name: 'Brown/Whole Wheat Bread', serving: '2 slices (60 g)', protein: 7, carbs: 30, fat: 3, calories: 180, costRange: '₹8-20', dietType: 'veg', mealRoles: ['breakfast'], category: 'grains-staples' }
];

// ==================== VEGETABLES & DISHES ====================
export const vegetablesDishes: FoodItem[] = [
    { id: 'mixed-veg-sabzi', name: 'Mixed Vegetable Sabzi', serving: '200 g', protein: 5, carbs: 15, fat: 7, calories: 150, costRange: '₹15-35', dietType: 'vegan', mealRoles: ['main-meal'], category: 'vegetables-dishes' },
    { id: 'palak-paneer', name: 'Palak Paneer', serving: '200 g', protein: 16.5, carbs: 10, fat: 20, calories: 330, costRange: '₹50-100', dietType: 'veg', mealRoles: ['main-meal', 'post-workout'], category: 'vegetables-dishes' },
    { id: 'sambar', name: 'Sambar (South Indian)', serving: '200 ml', protein: 7, carbs: 14, fat: 4, calories: 140, costRange: '₹15-30', dietType: 'vegan', mealRoles: ['main-meal', 'rest-day'], category: 'vegetables-dishes' },
    { id: 'raita', name: 'Raita (Curd + Vegetables)', serving: '100-150 g', protein: 4, carbs: 6, fat: 4, calories: 70, costRange: '₹10-25', dietType: 'veg', mealRoles: ['main-meal'], category: 'vegetables-dishes' },
    { id: 'paneer-masala', name: 'Paneer Masala', serving: '150-200 g', protein: 22.5, carbs: 10, fat: 21, calories: 390, costRange: '₹60-120', dietType: 'veg', mealRoles: ['main-meal', 'post-workout'], category: 'vegetables-dishes' },
    { id: 'egg-curry', name: 'Egg Curry', serving: '2 eggs in curry', protein: 15, carbs: 8, fat: 12, calories: 260, costRange: '₹25-50', dietType: 'non-veg', mealRoles: ['main-meal'], category: 'vegetables-dishes' },
    { id: 'fish-curry', name: 'Masala Fish Curry', serving: '150 g fish + gravy', protein: 27.5, carbs: 8, fat: 14, calories: 320, costRange: '₹80-180', dietType: 'non-veg', mealRoles: ['main-meal', 'post-workout'], category: 'vegetables-dishes' },
    { id: 'dal-makhani', name: 'Dal Makhani', serving: '200 g', protein: 15, carbs: 33, fat: 15, calories: 370, costRange: '₹40-80', dietType: 'veg', mealRoles: ['main-meal'], category: 'vegetables-dishes' },
    { id: 'tandoori-chicken', name: 'Tandoori Chicken', serving: '150 g', protein: 32.5, carbs: 1, fat: 8, calories: 230, costRange: '₹100-200', dietType: 'non-veg', mealRoles: ['main-meal', 'post-workout'], category: 'vegetables-dishes' },
    { id: 'chole', name: 'Chole (Chickpea Curry)', serving: '200 g', protein: 13.5, carbs: 42.5, fat: 8, calories: 330, costRange: '₹25-50', dietType: 'vegan', mealRoles: ['main-meal'], category: 'vegetables-dishes' }
];

// ==================== NUTS & SNACKS ====================
export const nutsSnacks: FoodItem[] = [
    { id: 'almonds', name: 'Almonds', serving: '10 almonds (15 g)', protein: 3.5, carbs: 3.5, fat: 9.5, calories: 95, costRange: '₹10-25', dietType: 'vegan', mealRoles: ['snack'], category: 'nuts-snacks' },
    { id: 'walnuts', name: 'Walnuts', serving: '6 halves (15 g)', protein: 3, carbs: 3, fat: 13, calories: 130, costRange: '₹15-35', dietType: 'vegan', mealRoles: ['snack'], category: 'nuts-snacks' },
    { id: 'roasted-chana', name: 'Roasted Chana', serving: '50 g', protein: 11, carbs: 21, fat: 3, calories: 165, costRange: '₹6-15', dietType: 'vegan', mealRoles: ['snack', 'pre-workout'], category: 'nuts-snacks' },
    { id: 'makhana', name: 'Makhana (Fox Nuts)', serving: '30 g roasted', protein: 3.5, carbs: 13.5, fat: 3.5, calories: 90, costRange: '₹15-35', dietType: 'vegan', mealRoles: ['snack'], category: 'nuts-snacks' },
    { id: 'banana', name: 'Banana', serving: '1 medium (100-120 g)', protein: 1.25, carbs: 25.5, fat: 0.3, calories: 100, costRange: '₹6-18', dietType: 'vegan', mealRoles: ['pre-workout', 'post-workout', 'snack'], category: 'nuts-snacks' },
    { id: 'dates', name: 'Dates', serving: '3-4 pieces', protein: 1.5, carbs: 35, fat: 0.3, calories: 140, costRange: '₹10-40', dietType: 'vegan', mealRoles: ['pre-workout', 'snack'], category: 'nuts-snacks' },
    { id: 'chikki', name: 'Chikki (Peanut Jaggery)', serving: '1 piece', protein: 5, carbs: 21, fat: 7, calories: 175, costRange: '₹5-15', dietType: 'vegan', mealRoles: ['snack'], category: 'nuts-snacks' }
];

// ==================== PREPARED MEALS & COMBOS ====================
export const preparedMeals: FoodItem[] = [
    { id: 'rajma-chawal', name: 'Rajma-Chawal', serving: '1 plate', protein: 22.5, carbs: 90, fat: 10, calories: 575, costRange: '₹30-80', dietType: 'vegan', mealRoles: ['main-meal'], category: 'prepared-meals' },
    { id: 'chole-bhature', name: 'Chole-Bhature', serving: '1 plate', protein: 17.5, carbs: 90, fat: 25, calories: 700, costRange: '₹40-100', dietType: 'vegan', mealRoles: ['main-meal'], notes: 'High calorie; bulking only', category: 'prepared-meals' },
    { id: 'chicken-biryani', name: 'Chicken Biryani', serving: '1 plate', protein: 30, carbs: 75, fat: 15, calories: 650, costRange: '₹80-200', dietType: 'non-veg', mealRoles: ['main-meal'], category: 'prepared-meals' },
    { id: 'masala-dosa-sambar', name: 'Masala Dosa + Sambar', serving: '1 plate', protein: 10, carbs: 60, fat: 15, calories: 425, costRange: '₹40-100', dietType: 'vegan', mealRoles: ['breakfast', 'main-meal'], category: 'prepared-meals' },
    { id: 'paneer-paratha-curd', name: 'Paneer Paratha + Curd', serving: '1 serving', protein: 22.5, carbs: 55, fat: 25, calories: 575, costRange: '₹40-80', dietType: 'veg', mealRoles: ['breakfast', 'main-meal'], category: 'prepared-meals' },
    { id: 'fish-curry-rice', name: 'Fish Curry + Rice', serving: '1 plate', protein: 32.5, carbs: 70, fat: 15, calories: 600, costRange: '₹80-180', dietType: 'non-veg', mealRoles: ['main-meal'], category: 'prepared-meals' },
    { id: 'matar-paneer-rice', name: 'Matar Paneer + Rice', serving: '1 plate', protein: 22.5, carbs: 55, fat: 21, calories: 525, costRange: '₹50-100', dietType: 'veg', mealRoles: ['main-meal'], category: 'prepared-meals' },
    { id: 'egg-bhurji-roti', name: 'Egg Bhurji + 2 Rotis', serving: '1 serving', protein: 20, carbs: 40, fat: 15, calories: 425, costRange: '₹30-60', dietType: 'non-veg', mealRoles: ['breakfast', 'main-meal'], category: 'prepared-meals' },
    { id: 'kathi-roll', name: 'Kathi Roll (Egg/Chicken/Paneer)', serving: '1 roll', protein: 25, carbs: 35, fat: 18, calories: 450, costRange: '₹50-120', dietType: 'non-veg', mealRoles: ['main-meal', 'snack'], category: 'prepared-meals' }
];

// ==================== REGIONAL SNACKS ====================
export const regionalSnacks: FoodItem[] = [
    { id: 'pav-bhaji', name: 'Pav Bhaji', serving: '1 plate', protein: 10, carbs: 70, fat: 22, calories: 550, costRange: '₹40-100', dietType: 'veg', mealRoles: ['main-meal'], category: 'regional-snacks' },
    { id: 'vada-pav', name: 'Vada Pav', serving: '1 piece', protein: 7, carbs: 35, fat: 15, calories: 320, costRange: '₹15-40', dietType: 'veg', mealRoles: ['snack'], category: 'regional-snacks' },
    { id: 'dhokla', name: 'Dhokla', serving: '4-6 pieces', protein: 9, carbs: 27, fat: 5, calories: 180, costRange: '₹20-50', dietType: 'vegan', mealRoles: ['snack', 'breakfast'], category: 'regional-snacks' },
    { id: 'misal-pav', name: 'Misal Pav', serving: '1 plate', protein: 14, carbs: 70, fat: 15, calories: 550, costRange: '₹40-80', dietType: 'vegan', mealRoles: ['breakfast', 'main-meal'], category: 'regional-snacks' },
    { id: 'sattu-paratha', name: 'Sattu Paratha (Bihar Style)', serving: '1 paratha', protein: 10, carbs: 45, fat: 8, calories: 370, costRange: '₹15-35', dietType: 'vegan', mealRoles: ['breakfast', 'pre-workout'], category: 'regional-snacks' },
    { id: 'kebabs', name: 'Kebabs (Seekh/Shami)', serving: '2 pieces', protein: 17, carbs: 6, fat: 12, calories: 220, costRange: '₹50-120', dietType: 'non-veg', mealRoles: ['main-meal', 'snack'], category: 'regional-snacks' }
];

// ==================== BEVERAGES ====================
export const beverages: FoodItem[] = [
    { id: 'chai', name: 'Chai (Milk Tea)', serving: '200 ml', protein: 3.5, carbs: 11, fat: 5, calories: 105, costRange: '₹10-30', dietType: 'veg', mealRoles: ['breakfast'], category: 'beverages' },
    { id: 'filter-coffee', name: 'Filter Coffee (South Style)', serving: '150 ml', protein: 3.5, carbs: 10, fat: 6, calories: 115, costRange: '₹15-40', dietType: 'veg', mealRoles: ['breakfast'], category: 'beverages' },
    { id: 'coconut-water', name: 'Coconut Water', serving: '200 ml', protein: 0.75, carbs: 9, fat: 0, calories: 45, costRange: '₹20-50', dietType: 'vegan', mealRoles: ['post-workout', 'snack'], category: 'beverages' },
    { id: 'nimbu-pani', name: 'Nimbu Pani (Lime Water)', serving: '200 ml', protein: 0, carbs: 10, fat: 0, calories: 40, costRange: '₹10-25', dietType: 'vegan', mealRoles: ['snack'], notes: 'Good hydration', category: 'beverages' },
    { id: 'protein-smoothie', name: 'Protein Smoothie (Milk + Banana + PB)', serving: '300 ml', protein: 22.5, carbs: 40, fat: 18, calories: 450, costRange: '₹30-70', dietType: 'veg', mealRoles: ['post-workout', 'breakfast'], category: 'beverages' }
];

// ==================== OILS, CONDIMENTS & HEALTHY FATS ====================
export const oilsCondiments: FoodItem[] = [
    { id: 'desi-ghee', name: 'Desi Cow Ghee', serving: '1 tbsp (15g)', protein: 0, carbs: 0, fat: 15, calories: 135, costRange: '₹10-25', dietType: 'veg', mealRoles: ['main-meal', 'breakfast'], notes: 'Rich in butyric acid and fat-soluble vitamins', category: 'oils-condiments' },
    { id: 'mustard-oil', name: 'Mustard Oil (Kachi Ghani)', serving: '1 tbsp (15ml)', protein: 0, carbs: 0, fat: 14, calories: 124, costRange: '₹4-10', dietType: 'vegan', mealRoles: ['main-meal'], notes: 'Ideal ratio of omega-3 to omega-6 fatty acids', category: 'oils-condiments' },
    { id: 'coconut-oil', name: 'Virgin Coconut Oil', serving: '1 tbsp (15ml)', protein: 0, carbs: 0, fat: 14, calories: 120, costRange: '₹8-20', dietType: 'vegan', mealRoles: ['main-meal', 'pre-workout'], notes: 'Contains MCTs for rapid energy delivery', category: 'oils-condiments' },
    { id: 'peanut-butter', name: 'Peanut Butter (100% Natural)', serving: '2 tbsp (32g)', protein: 8, carbs: 6, fat: 16, calories: 190, costRange: '₹15-35', dietType: 'vegan', mealRoles: ['snack', 'breakfast', 'pre-workout'], notes: 'Unsweetened roasted peanuts; excellent plant protein & healthy fats', category: 'oils-condiments' },
    { id: 'white-butter', name: 'White Butter (Homemade Makhan)', serving: '1 tbsp (15g)', protein: 0.1, carbs: 0.1, fat: 12, calories: 105, costRange: '₹5-15', dietType: 'veg', mealRoles: ['breakfast', 'main-meal'], notes: 'Natural probiotics, easily digestible fats', category: 'oils-condiments' }
];

// ==================== ALL FOODS COMBINED ====================
export const allFoods: FoodItem[] = [
    ...dairyProducts,
    ...eggsProteins,
    ...pulsesLegumes,
    ...grainsStaples,
    ...vegetablesDishes,
    ...nutsSnacks,
    ...preparedMeals,
    ...regionalSnacks,
    ...beverages,
    ...oilsCondiments
];

// ==================== SAMPLE MEAL PLANS ====================
export const bulkingDayPlan: MealPlanItem[] = [
    { meal: 'Breakfast', time: '7-8 AM', foods: '3-egg omelette + 2 rotis + 250 ml full milk', protein: '40-45g', calories: '~650 kcal' },
    { meal: 'Mid-morning', time: '10-11 AM', foods: 'Banana + peanut butter on roti', protein: '~12g', calories: '~300 kcal' },
    { meal: 'Lunch', time: '1-2 PM', foods: 'Soya chunk curry (50g dry) + 2 rotis + curd', protein: '~45g', calories: '~600 kcal' },
    { meal: 'Pre-workout', time: '4-5 PM', foods: 'Glass milk + jaggery', protein: '~8g', calories: '~200 kcal' },
    { meal: 'Post-workout', time: '7-8 PM', foods: 'Paneer bhurji 150g + rice', protein: '~35g', calories: '~650 kcal' },
    { meal: 'Dinner', time: '9-10 PM', foods: 'Rajma chawal + salad', protein: '~25g', calories: '~500 kcal' },
    { meal: 'Late snack', time: '10-11 PM', foods: 'Roasted chana (50g)', protein: '~10g', calories: '~165 kcal' }
];

export const cuttingDayPlan: MealPlanItem[] = [
    { meal: 'Breakfast', time: '7-8 AM', foods: 'Sprouted moong cheela + 1 whole egg + green tea', protein: '~28g', calories: '~350 kcal' },
    { meal: 'Mid-morning', time: '10-11 AM', foods: 'Roasted chana (30g) + buttermilk', protein: '~12g', calories: '~180 kcal' },
    { meal: 'Lunch', time: '1-2 PM', foods: 'Dal (moong) + 1 millet roti + salad + 80g paneer', protein: '~40g', calories: '~500 kcal' },
    { meal: 'Snack', time: '4-5 PM', foods: 'Curd (100g) + cucumber', protein: '~8g', calories: '~80 kcal' },
    { meal: 'Dinner', time: '7-8 PM', foods: 'Grilled fish/soya chunk stir-fry + steamed vegetables', protein: '~35-40g', calories: '~350 kcal' }
];

// ==================== FOOD SWAPS ====================
export const proteinSwaps: FoodSwap[] = [
    { item1: 'Chicken breast 150g', item2: 'Paneer 150g', proteinDiff: '~14g more in chicken' },
    { item1: 'Chicken breast 150g', item2: 'Soya chunks 50g dry', proteinDiff: 'Similar (~30-33g)' },
    { item1: 'Paneer 100g', item2: 'Tofu 150g', proteinDiff: 'Similar (~18-20g)' },
    { item1: '3 whole eggs', item2: 'Paneer 100g', proteinDiff: 'Similar (~19-20g)' },
    { item1: 'Chicken breast 150g', item2: '4 whole eggs', proteinDiff: 'Similar (~26-33g)' },
    { item1: 'Fish 150g', item2: 'Paneer 150g', proteinDiff: '~10g more in fish' },
    { item1: 'Rajma 200g cooked', item2: 'Chana 200g cooked', proteinDiff: 'Similar (~14-15g)' },
    { item1: 'Whey protein 1 scoop', item2: 'Paneer 100g', proteinDiff: 'Similar (~25g vs 19g)' }
];

// ==================== HELPER FUNCTIONS ====================
export const getFoodsByDietType = (dietType: DietType): FoodItem[] => {
    if (dietType === 'vegan') {
        return allFoods.filter(f => f.dietType === 'vegan');
    }
    if (dietType === 'veg') {
        return allFoods.filter(f => f.dietType === 'veg' || f.dietType === 'vegan');
    }
    return allFoods;
};

export const getFoodsByMealRole = (role: MealRole): FoodItem[] => {
    return allFoods.filter(f => f.mealRoles.includes(role));
};

export const getFoodsByCategory = (category: FoodCategory): FoodItem[] => {
    return allFoods.filter(f => f.category === category);
};

export const getHighProteinFoods = (minProtein: number = 15): FoodItem[] => {
    return allFoods.filter(f => f.protein >= minProtein).sort((a, b) => b.protein - a.protein);
};
