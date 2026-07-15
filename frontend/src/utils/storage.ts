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

const DEFAULT_WEIGHTS: WeightLog[] = [];
const DEFAULT_FOODS: FoodLog[] = [];
const DEFAULT_WATERS: WaterLog[] = [];
const DEFAULT_WORKOUTS: WorkoutLog[] = [];
const DEFAULT_SLEEP: SleepLog[] = [];

const DEFAULT_GOALS: Goal[] = [
  { id: "g-1", type: "LOSE_WEIGHT", name: "Reach 76 kg", targetValue: 76.0, currentValue: 84.5, unit: "kg", completed: false },
  { id: "g-2", type: "DRINK_WATER", name: "Daily Hydration Goal", targetValue: 2500, currentValue: 0, unit: "ml", completed: false },
  { id: "g-3", type: "EXERCISE", name: "Weekly Active Minutes", targetValue: 150, currentValue: 0, unit: "mins", completed: false },
  { id: "g-4", type: "SLEEP", name: "Sleep Hours", targetValue: 8.0, currentValue: 0, unit: "hours", completed: false }
];

const DEFAULT_STREAKS: Streaks = {
  dailyLogging: 0,
  water: 0,
  workout: 0,
  healthyEating: 0,
  weightLogging: 0,
  xp: 0,
  level: 1
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
  },

  clearAllData: (): void => {
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('hsa_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }
};
