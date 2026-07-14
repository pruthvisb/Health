export interface UserProfile {
  age: number;
  gender: string;
  height: number; // in cm
  currentWeight: number; // in kg
  goalWeight: number; // in kg
  targetDate: string;
  activityLevel: string; // SEDENTARY, LIGHTLY_ACTIVE, MODERATELY_ACTIVE, VERY_ACTIVE
  lifestyle: string;
  medicalConditions: string[];
  foodPreferences: string[]; // VEGETARIAN, VEGAN, EGGETARIAN, NON_VEGETARIAN
  foodAllergies: string[];
  country: string;
  timezone: string;
  units: 'metric' | 'imperial';
}

export interface WeightLog {
  id: string;
  weight: number;
  loggedAt: string;
}

export interface FoodLog {
  id: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  foodName: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sugar: number;
  sodium: number;
  ingredients?: string[];
  weightGrams?: number;
  imageUrl?: string;
  confidence?: number;
  loggedAt: string;
}

export interface WaterLog {
  id: string;
  type: 'WATER' | 'COFFEE' | 'TEA' | 'JUICE' | 'MILK' | 'ELECTROLYTES';
  amountMl: number;
  loggedAt: string;
}

export interface WorkoutLog {
  id: string;
  type: 'WALKING' | 'RUNNING' | 'CYCLING' | 'SWIMMING' | 'GYM' | 'YOGA' | 'HOME';
  durationMinutes: number;
  caloriesBurned: number;
  loggedAt: string;
}

export interface SleepLog {
  id: string;
  bedTime: string;
  wakeTime: string;
  durationHours: number;
  quality: number; // 1-5
  notes?: string;
  loggedAt: string;
}

export interface Goal {
  id: string;
  type: 'LOSE_WEIGHT' | 'GAIN_MUSCLE' | 'MAINTAIN_WEIGHT' | 'DRINK_WATER' | 'EXERCISE' | 'SLEEP' | 'HEALTHY_EATING';
  name: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  completed: boolean;
}

export interface Streaks {
  dailyLogging: number;
  water: number;
  workout: number;
  healthyEating: number;
  weightLogging: number;
  xp: number;
  level: number;
}

// Generate past dates helpers
const getPastDateString = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

const DEFAULT_PROFILE: UserProfile = {
  age: 28,
  gender: "Male",
  height: 178,
  currentWeight: 84.5,
  goalWeight: 76.0,
  targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
  activityLevel: "MODERATELY_ACTIVE",
  lifestyle: "Active - desk job but workouts 3-4 times a week",
  medicalConditions: [],
  foodPreferences: ["EGGETARIAN"],
  foodAllergies: ["Peanuts"],
  country: "United States",
  timezone: "EST",
  units: "metric"
};

const DEFAULT_WEIGHTS: WeightLog[] = [
  { id: "w-1", weight: 86.2, loggedAt: getPastDateString(14) },
  { id: "w-2", weight: 86.0, loggedAt: getPastDateString(13) },
  { id: "w-3", weight: 85.8, loggedAt: getPastDateString(12) },
  { id: "w-4", weight: 85.5, loggedAt: getPastDateString(11) },
  { id: "w-5", weight: 85.6, loggedAt: getPastDateString(10) },
  { id: "w-6", weight: 85.2, loggedAt: getPastDateString(9) },
  { id: "w-7", weight: 85.1, loggedAt: getPastDateString(8) },
  { id: "w-8", weight: 84.9, loggedAt: getPastDateString(7) },
  { id: "w-9", weight: 84.8, loggedAt: getPastDateString(6) },
  { id: "w-10", weight: 84.6, loggedAt: getPastDateString(5) },
  { id: "w-11", weight: 84.7, loggedAt: getPastDateString(4) },
  { id: "w-12", weight: 84.4, loggedAt: getPastDateString(3) },
  { id: "w-13", weight: 84.2, loggedAt: getPastDateString(2) },
  { id: "w-14", weight: 84.3, loggedAt: getPastDateString(1) },
  { id: "w-15", weight: 84.5, loggedAt: getPastDateString(0) }
];

const DEFAULT_FOODS: FoodLog[] = [
  // Today's Food
  {
    id: "f-1",
    mealType: "BREAKFAST",
    foodName: "Scrambled Eggs with Avocado Toast",
    calories: 420,
    protein: 22,
    fat: 24,
    carbs: 30,
    fiber: 7,
    sugar: 2,
    sodium: 480,
    ingredients: ["2 Large Eggs", "1 slice Whole Wheat Bread", "0.5 Avocado", "1 tsp Olive Oil"],
    weightGrams: 220,
    confidence: 0.95,
    loggedAt: getPastDateString(0)
  },
  {
    id: "f-2",
    mealType: "LUNCH",
    foodName: "Quinoa Bowl with Roasted Veggies & Tofu",
    calories: 580,
    protein: 26,
    fat: 18,
    carbs: 72,
    fiber: 12,
    sugar: 6,
    sodium: 620,
    ingredients: ["1 cup Cooked Quinoa", "150g Organic Tofu", "100g Broccoli", "50g Carrots", "2 tbsp Sesame Dressing"],
    weightGrams: 350,
    confidence: 0.92,
    loggedAt: getPastDateString(0)
  },
  {
    id: "f-3",
    mealType: "SNACK",
    foodName: "Greek Yogurt with Berries and Honey",
    calories: 210,
    protein: 15,
    fat: 3,
    carbs: 28,
    fiber: 3,
    sugar: 18,
    sodium: 65,
    ingredients: ["150g Low Fat Greek Yogurt", "50g Mixed Berries", "1 tbsp Honey"],
    weightGrams: 210,
    confidence: 0.98,
    loggedAt: getPastDateString(0)
  },
  // Yesterday's Food
  {
    id: "f-4",
    mealType: "BREAKFAST",
    foodName: "Oatmeal with Banana & Almond Butter",
    calories: 380,
    protein: 12,
    fat: 14,
    carbs: 56,
    fiber: 9,
    sugar: 14,
    sodium: 120,
    loggedAt: getPastDateString(1)
  },
  {
    id: "f-5",
    mealType: "LUNCH",
    foodName: "Paneer Tikka Salad Wrap",
    calories: 520,
    protein: 24,
    fat: 22,
    carbs: 48,
    fiber: 6,
    sugar: 4,
    sodium: 840,
    loggedAt: getPastDateString(1)
  },
  {
    id: "f-6",
    mealType: "DINNER",
    foodName: "Lentil Soup with Sourdough Bread",
    calories: 460,
    protein: 20,
    fat: 8,
    carbs: 68,
    fiber: 15,
    sugar: 5,
    sodium: 710,
    loggedAt: getPastDateString(1)
  }
];

const DEFAULT_WATERS: WaterLog[] = [
  // Today's Water
  { id: "wa-1", type: "WATER", amountMl: 250, loggedAt: getPastDateString(0) },
  { id: "wa-2", type: "COFFEE", amountMl: 250, loggedAt: getPastDateString(0) },
  { id: "wa-3", type: "WATER", amountMl: 500, loggedAt: getPastDateString(0) },
  { id: "wa-4", type: "ELECTROLYTES", amountMl: 500, loggedAt: getPastDateString(0) },
  { id: "wa-5", type: "WATER", amountMl: 250, loggedAt: getPastDateString(0) },
  // Yesterday's Water
  { id: "wa-6", type: "WATER", amountMl: 2000, loggedAt: getPastDateString(1) },
  // Two days ago
  { id: "wa-7", type: "WATER", amountMl: 2500, loggedAt: getPastDateString(2) }
];

const DEFAULT_WORKOUTS: WorkoutLog[] = [
  { id: "wo-1", type: "RUNNING", durationMinutes: 30, caloriesBurned: 350, loggedAt: getPastDateString(0) },
  { id: "wo-2", type: "YOGA", durationMinutes: 45, caloriesBurned: 180, loggedAt: getPastDateString(1) },
  { id: "wo-3", type: "GYM", durationMinutes: 60, caloriesBurned: 420, loggedAt: getPastDateString(2) },
  { id: "wo-4", type: "WALKING", durationMinutes: 40, caloriesBurned: 160, loggedAt: getPastDateString(4) },
  { id: "wo-5", type: "CYCLING", durationMinutes: 45, caloriesBurned: 380, loggedAt: getPastDateString(5) }
];

const DEFAULT_SLEEP: SleepLog[] = [
  { id: "s-1", bedTime: "22:30", wakeTime: "06:30", durationHours: 8.0, quality: 4, notes: "Felt well rested", loggedAt: getPastDateString(4) },
  { id: "s-2", bedTime: "23:00", wakeTime: "06:30", durationHours: 7.5, quality: 3, notes: "Woke up once in middle of night", loggedAt: getPastDateString(3) },
  { id: "s-3", bedTime: "22:15", wakeTime: "06:15", durationHours: 8.0, quality: 5, notes: "No caffeine after 4pm, deep sleep", loggedAt: getPastDateString(2) },
  { id: "s-4", bedTime: "23:30", wakeTime: "06:30", durationHours: 7.0, quality: 2, notes: "Had screen time before bed", loggedAt: getPastDateString(1) },
  { id: "s-5", bedTime: "22:45", wakeTime: "06:15", durationHours: 7.5, quality: 4, notes: "Clean sleep session", loggedAt: getPastDateString(0) }
];

const DEFAULT_GOALS: Goal[] = [
  { id: "g-1", type: "LOSE_WEIGHT", name: "Reach 76 kg", targetValue: 76.0, currentValue: 84.5, unit: "kg", completed: false },
  { id: "g-2", type: "DRINK_WATER", name: "Daily Hydration Goal", targetValue: 2500, currentValue: 1750, unit: "ml", completed: false },
  { id: "g-3", type: "EXERCISE", name: "Weekly Active Minutes", targetValue: 150, currentValue: 135, unit: "mins", completed: false },
  { id: "g-4", type: "SLEEP", name: "Sleep Hours", targetValue: 8.0, currentValue: 7.2, unit: "hours", completed: false }
];

const DEFAULT_STREAKS: Streaks = {
  dailyLogging: 12,
  water: 5,
  workout: 3,
  healthyEating: 7,
  weightLogging: 12,
  xp: 1450,
  level: 4
};

// Check if window is defined for client-side execution
const isClient = typeof window !== 'undefined';

export const getStorageData = <T>(key: string, defaultValue: T): T => {
  if (!isClient) return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
};

export const setStorageData = <T>(key: string, data: T): void => {
  if (isClient) {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Main Export API
export const storage = {
  getProfile: (): UserProfile => getStorageData('hsa_profile', DEFAULT_PROFILE),
  saveProfile: (p: UserProfile): void => setStorageData('hsa_profile', p),

  getWeightLogs: (): WeightLog[] => getStorageData('hsa_weight_logs', DEFAULT_WEIGHTS),
  saveWeightLogs: (logs: WeightLog[]): void => setStorageData('hsa_weight_logs', logs),
  addWeightLog: (w: number, date?: string): WeightLog => {
    const logs = storage.getWeightLogs();
    const newLog: WeightLog = {
      id: `w-${Date.now()}`,
      weight: w,
      loggedAt: date || new Date().toISOString()
    };
    logs.push(newLog);
    // Also update current weight in profile
    const profile = storage.getProfile();
    profile.currentWeight = w;
    storage.saveProfile(profile);

    storage.saveWeightLogs(logs);
    storage.awardXp(50);
    return newLog;
  },
  deleteWeightLog: (id: string): void => {
    const logs = storage.getWeightLogs().filter(l => l.id !== id);
    storage.saveWeightLogs(logs);
  },

  getFoodLogs: (): FoodLog[] => getStorageData('hsa_food_logs', DEFAULT_FOODS),
  saveFoodLogs: (logs: FoodLog[]): void => setStorageData('hsa_food_logs', logs),
  addFoodLog: (food: Omit<FoodLog, 'id' | 'loggedAt'>): FoodLog => {
    const logs = storage.getFoodLogs();
    const newLog: FoodLog = {
      ...food,
      id: `f-${Date.now()}`,
      loggedAt: new Date().toISOString()
    };
    logs.push(newLog);
    storage.saveFoodLogs(logs);
    storage.awardXp(30);
    return newLog;
  },
  deleteFoodLog: (id: string): void => {
    const logs = storage.getFoodLogs().filter(f => f.id !== id);
    storage.saveFoodLogs(logs);
  },

  getWaterLogs: (): WaterLog[] => getStorageData('hsa_water_logs', DEFAULT_WATERS),
  saveWaterLogs: (logs: WaterLog[]): void => setStorageData('hsa_water_logs', logs),
  addWaterLog: (amountMl: number, type: WaterLog['type'] = 'WATER'): WaterLog => {
    const logs = storage.getWaterLogs();
    const newLog: WaterLog = {
      id: `wa-${Date.now()}`,
      type,
      amountMl,
      loggedAt: new Date().toISOString()
    };
    logs.push(newLog);
    storage.saveWaterLogs(logs);

    // Update goal progress
    const goals = storage.getGoals();
    const waterGoal = goals.find(g => g.type === 'DRINK_WATER');
    if (waterGoal) {
      const todayTotal = storage.getTodayWaterIntake();
      waterGoal.currentValue = todayTotal + amountMl;
      if (waterGoal.currentValue >= waterGoal.targetValue) {
        waterGoal.completed = true;
      }
      storage.saveGoals(goals);
    }

    storage.awardXp(10);
    return newLog;
  },
  deleteWaterLog: (id: string): void => {
    const logs = storage.getWaterLogs().filter(w => w.id !== id);
    storage.saveWaterLogs(logs);
  },

  getWorkoutLogs: (): WorkoutLog[] => getStorageData('hsa_workout_logs', DEFAULT_WORKOUTS),
  saveWorkoutLogs: (logs: WorkoutLog[]): void => setStorageData('hsa_workout_logs', logs),
  addWorkoutLog: (workout: Omit<WorkoutLog, 'id' | 'loggedAt'>): WorkoutLog => {
    const logs = storage.getWorkoutLogs();
    const newLog: WorkoutLog = {
      ...workout,
      id: `wo-${Date.now()}`,
      loggedAt: new Date().toISOString()
    };
    logs.push(newLog);
    storage.saveWorkoutLogs(logs);

    // Update goal progress
    const goals = storage.getGoals();
    const exGoal = goals.find(g => g.type === 'EXERCISE');
    if (exGoal) {
      exGoal.currentValue += workout.durationMinutes;
      if (exGoal.currentValue >= exGoal.targetValue) {
        exGoal.completed = true;
      }
      storage.saveGoals(goals);
    }

    storage.awardXp(100);
    return newLog;
  },
  deleteWorkoutLog: (id: string): void => {
    const logs = storage.getWorkoutLogs().filter(w => w.id !== id);
    storage.saveWorkoutLogs(logs);
  },

  getSleepLogs: (): SleepLog[] => getStorageData('hsa_sleep_logs', DEFAULT_SLEEP),
  saveSleepLogs: (logs: SleepLog[]): void => setStorageData('hsa_sleep_logs', logs),
  addSleepLog: (sleep: Omit<SleepLog, 'id' | 'loggedAt'>): SleepLog => {
    const logs = storage.getSleepLogs();
    const newLog: SleepLog = {
      ...sleep,
      id: `s-${Date.now()}`,
      loggedAt: new Date().toISOString()
    };
    logs.push(newLog);
    storage.saveSleepLogs(logs);

    // Update goal progress
    const goals = storage.getGoals();
    const sleepGoal = goals.find(g => g.type === 'SLEEP');
    if (sleepGoal) {
      sleepGoal.currentValue = sleep.durationHours;
      if (sleepGoal.currentValue >= sleepGoal.targetValue) {
        sleepGoal.completed = true;
      }
      storage.saveGoals(goals);
    }

    storage.awardXp(50);
    return newLog;
  },
  deleteSleepLog: (id: string): void => {
    const logs = storage.getSleepLogs().filter(s => s.id !== id);
    storage.saveSleepLogs(logs);
  },
  getTodaySleepDuration: (): number => {
    const today = new Date().toDateString();
    const log = storage.getSleepLogs().find(s => new Date(s.loggedAt).toDateString() === today);
    return log ? log.durationHours : 7.5;
  },

  getGoals: (): Goal[] => getStorageData('hsa_goals', DEFAULT_GOALS),
  saveGoals: (goals: Goal[]): void => setStorageData('hsa_goals', goals),
  addGoal: (goal: Omit<Goal, 'id' | 'completed'>): Goal => {
    const goals = storage.getGoals();
    const newGoal: Goal = {
      ...goal,
      id: `g-${Date.now()}`,
      completed: goal.currentValue >= goal.targetValue
    };
    goals.push(newGoal);
    storage.saveGoals(goals);
    return newGoal;
  },

  getStreaks: (): Streaks => getStorageData('hsa_streaks', DEFAULT_STREAKS),
  saveStreaks: (s: Streaks): void => setStorageData('hsa_streaks', s),
  awardXp: (amount: number): void => {
    const s = storage.getStreaks();
    s.xp += amount;
    // XP algorithm: every 1000 XP is a level
    const newLevel = Math.floor(s.xp / 1000) + 1;
    if (newLevel > s.level) {
      s.level = newLevel;
    }
    storage.saveStreaks(s);
  },

  // Analytics Helpers
  getTodayWaterIntake: (): number => {
    const today = new Date().toDateString();
    return storage.getWaterLogs()
      .filter(w => new Date(w.loggedAt).toDateString() === today)
      .reduce((sum, w) => sum + w.amountMl, 0);
  },
  getTodayCalories: (): { consumed: number; remaining: number; target: number } => {
    const today = new Date().toDateString();
    const consumed = storage.getFoodLogs()
      .filter(f => new Date(f.loggedAt).toDateString() === today)
      .reduce((sum, f) => sum + f.calories, 0);
    
    // TDEE estimation for default target
    const profile = storage.getProfile();
    // Harris-Benedict BMR Estimation
    let bmr = 0;
    if (profile.gender === "Male") {
      bmr = 88.362 + (13.397 * profile.currentWeight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
      bmr = 447.593 + (9.247 * profile.currentWeight) + (3.098 * profile.height) - (4.330 * profile.age);
    }
    
    let multiplier = 1.2; // Sedentary
    if (profile.activityLevel === "LIGHTLY_ACTIVE") multiplier = 1.375;
    else if (profile.activityLevel === "MODERATELY_ACTIVE") multiplier = 1.55;
    else if (profile.activityLevel === "VERY_ACTIVE") multiplier = 1.725;

    const tdee = Math.round(bmr * multiplier);
    const target = profile.goalWeight < profile.currentWeight ? tdee - 500 : tdee + 300;
    const remaining = Math.max(0, target - consumed);

    return { consumed, remaining, target };
  },

  getTodayMacros: (): { protein: number; carbs: number; fat: number } => {
    const today = new Date().toDateString();
    const logs = storage.getFoodLogs().filter(f => new Date(f.loggedAt).toDateString() === today);
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    logs.forEach(f => {
      protein += f.protein;
      carbs += f.carbs;
      fat += f.fat;
    });
    return { protein, carbs, fat };
  }
};
