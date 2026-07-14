'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { storage } from '../utils/storage';
import { 
  TrendingDown, Droplet, Flame, Trophy, Moon, 
  Activity, Star, ChevronRight, Apple, Heart, Zap
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  triggerRefresh: boolean;
}

export default function DashboardView({ onNavigate, triggerRefresh }: DashboardViewProps) {
  const [profile, setProfile] = useState(storage.getProfile());
  const [todayCalories, setTodayCalories] = useState(storage.getTodayCalories());
  const [todayMacros, setTodayMacros] = useState(storage.getTodayMacros());
  const [todayWater, setTodayWater] = useState(storage.getTodayWaterIntake());
  const [streaks, setStreaks] = useState(storage.getStreaks());
  const [weights, setWeights] = useState(storage.getWeightLogs());
  const [workouts, setWorkouts] = useState(storage.getWorkoutLogs());

  useEffect(() => {
    setProfile(storage.getProfile());
    setTodayCalories(storage.getTodayCalories());
    setTodayMacros(storage.getTodayMacros());
    setTodayWater(storage.getTodayWaterIntake());
    setStreaks(storage.getStreaks());
    setWeights(storage.getWeightLogs());
    setWorkouts(storage.getWorkoutLogs());
  }, [triggerRefresh]);

  const waterGoal = 2500; // ml
  const hydrationPct = Math.min(100, Math.round((todayWater / waterGoal) * 100));

  // Weight stats
  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : profile.currentWeight;
  const initialWeight = weights.length > 0 ? weights[0].weight : profile.currentWeight;
  const weightDiff = (latestWeight - profile.goalWeight).toFixed(1);
  const totalWeightLost = (initialWeight - latestWeight).toFixed(1);

  // Health Score calculation (simplified heuristic)
  const calculateHealthScore = () => {
    let score = 70; // baseline
    
    // Calorie rating
    const calDiff = Math.abs(todayCalories.consumed - todayCalories.target);
    if (calDiff < 200) score += 10;
    else if (calDiff > 500) score -= 5;

    // Hydration rating
    if (hydrationPct >= 80) score += 10;
    else if (hydrationPct < 40) score -= 5;

    // Workout rating
    const todayWorkouts = workouts.filter(w => new Date(w.loggedAt).toDateString() === new Date().toDateString());
    if (todayWorkouts.length > 0) score += 10;

    return Math.min(100, Math.max(0, score));
  };

  const healthScore = calculateHealthScore();

  // Macros progress percent
  const proteinGoal = Math.round(profile.currentWeight * 2); // 2g/kg
  const carbsGoal = 220;
  const fatGoal = 65;

  const proteinPct = Math.min(100, Math.round((todayMacros.protein / proteinGoal) * 100));
  const carbsPct = Math.min(100, Math.round((todayMacros.carbs / carbsGoal) * 100));
  const fatPct = Math.min(100, Math.round((todayMacros.fat / fatGoal) * 100));

  const formatWeight = (w: number) => {
    return profile.units === 'metric' ? `${w.toFixed(1)} kg` : `${(w * 2.20462).toFixed(1)} lbs`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Welcome back, Health Explorer!
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Today is a great day to crush your fitness goals. You are currently at Level {streaks.level}.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl">
          <Trophy className="text-yellow-400" size={20} />
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Current XP</div>
            <div className="text-sm font-bold text-white">{streaks.xp} / {streaks.level * 1000} XP</div>
          </div>
          <div className="w-16 bg-gray-800 h-1.5 rounded-full overflow-hidden ml-2">
            <div className="bg-yellow-400 h-full" style={{ width: `${(streaks.xp % 1000) / 10}%` }} />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Circle Health Score card */}
        <div className="glass-card p-6 flex flex-col items-center justify-between text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider self-start flex items-center gap-1.5">
            <Heart size={16} className="text-emerald-400" />
            Weekly Health Score
          </h3>
          
          <div className="relative my-8 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-gray-800"
                strokeWidth="10"
                fill="transparent"
              />
              <motion.circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-emerald-400"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={402}
                initial={{ strokeDashoffset: 402 }}
                animate={{ strokeDashoffset: 402 - (402 * healthScore) / 100 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold text-white">{healthScore}</span>
              <span className="text-xs text-gray-400 font-semibold uppercase">Excellent</span>
            </div>
          </div>

          <div className="w-full text-left text-xs bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
            <div className="font-semibold text-emerald-400 flex items-center gap-1">
              <Zap size={12} /> AI Coach Insight
            </div>
            <p className="text-gray-300 mt-1">Your hydration is outstanding today! Try adding 15 mins of light walking to optimize your scores.</p>
          </div>
        </div>

        {/* Calorie Card */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Apple size={16} className="text-amber-500" />
              Daily Calorie Ring
            </h3>
            <button onClick={() => onNavigate('Food')} className="text-xs text-emerald-400 hover:underline flex items-center">
              Log Meal <ChevronRight size={12} />
            </button>
          </div>

          <div className="my-6 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-5xl font-extrabold text-white">{todayCalories.remaining}</span>
                <span className="text-gray-400 text-xs font-semibold ml-1.5 uppercase">kcal remaining</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 font-medium">Target: {todayCalories.target} kcal</div>
                <div className="text-xs text-gray-400 font-medium">Consumed: {todayCalories.consumed} kcal</div>
              </div>
            </div>

            {/* Micro Progress */}
            <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (todayCalories.consumed / todayCalories.target) * 100)}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>

          {/* Macros Mini Graph */}
          <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
            <div>
              <div className="text-gray-400 text-xxs font-medium uppercase">Protein</div>
              <div className="font-semibold text-sm text-white">{todayMacros.protein}g / {proteinGoal}g</div>
              <div className="w-full bg-gray-800 h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: `${proteinPct}%` }} />
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-xxs font-medium uppercase">Carbs</div>
              <div className="font-semibold text-sm text-white">{todayMacros.carbs}g / {carbsGoal}g</div>
              <div className="w-full bg-gray-800 h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-yellow-500 h-full" style={{ width: `${carbsPct}%` }} />
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-xxs font-medium uppercase">Fat</div>
              <div className="font-semibold text-sm text-white">{todayMacros.fat}g / {fatGoal}g</div>
              <div className="w-full bg-gray-800 h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-cyan-500 h-full" style={{ width: `${fatPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Weight Progression Card */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown size={16} className="text-rose-500" />
              Weight Progression
            </h3>
            <button onClick={() => onNavigate('Weight')} className="text-xs text-emerald-400 hover:underline flex items-center">
              Log Weight <ChevronRight size={12} />
            </button>
          </div>

          <div className="my-6 space-y-3">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-4xl font-extrabold text-white">{formatWeight(latestWeight)}</span>
                <span className="text-xs text-gray-400 block mt-1">Current Weight</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-400">{formatWeight(profile.goalWeight)}</span>
                <span className="text-xs text-gray-500 block mt-1">Goal Weight</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-white/5 pt-3 mt-3">
              <div className="flex items-center gap-1 text-gray-400">
                <Star size={12} className="text-yellow-400" />
                Remaining to goal:
              </div>
              <span className="font-bold text-emerald-400">{weightDiff} kg</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="text-gray-400">Total weight lost:</div>
              <span className="font-bold text-rose-400">{totalWeightLost} kg</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 italic mt-1 text-center bg-white/5 p-2 rounded-xl">
            Target Goal Date: {new Date(profile.targetDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Row 2: Water, Exercise, Sleep */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Water Hydration */}
        <div className="glass-card p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Droplet size={16} className="text-sky-400" />
              Hydration Tracker
            </h3>
            <button onClick={() => onNavigate('Water')} className="text-xs text-emerald-400 hover:underline flex items-center">
              Quick Add <ChevronRight size={12} />
            </button>
          </div>

          <div className="my-6 flex items-center gap-6">
            <div className="relative w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center overflow-hidden border border-sky-500/20">
              <motion.div 
                className="absolute bottom-0 w-full bg-sky-500/30"
                initial={{ height: 0 }}
                animate={{ height: `${hydrationPct}%` }}
                transition={{ duration: 1 }}
              />
              <span className="text-lg font-extrabold text-sky-400 z-10">{hydrationPct}%</span>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-white">{todayWater} ml</span>
              <span className="text-gray-400 text-xs block mt-1">Goal: {waterGoal} ml</span>
              <span className="text-xs text-emerald-400 font-semibold block mt-1">🔥 Water Streak: {streaks.water} Days</span>
            </div>
          </div>
        </div>

        {/* Exercise Tracker */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame size={16} className="text-red-500" />
              Exercise & Activity
            </h3>
            <button onClick={() => onNavigate('Workouts')} className="text-xs text-emerald-400 hover:underline flex items-center">
              Add Workout <ChevronRight size={12} />
            </button>
          </div>

          <div className="my-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-3xl font-extrabold text-white">
                  {workouts.reduce((sum, w) => {
                    const today = new Date().toDateString();
                    return new Date(w.loggedAt).toDateString() === today ? sum + w.caloriesBurned : sum;
                  }, 0)}
                </span>
                <span className="text-gray-400 text-xs font-semibold ml-1.5 uppercase">kcal burned</span>
              </div>
              <span className="text-xs text-gray-400">
                Weekly Summary: {workouts.length} workouts
              </span>
            </div>

            <div className="space-y-2">
              {workouts.slice(0, 2).map((w, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/5 p-2 rounded-lg text-xs">
                  <div className="flex items-center gap-2">
                    <Activity size={12} className="text-emerald-400" />
                    <span className="font-semibold text-white">{w.type}</span>
                  </div>
                  <span className="text-gray-400">{w.durationMinutes} mins | -{w.caloriesBurned} kcal</span>
                </div>
              ))}
              {workouts.length === 0 && (
                <div className="text-xs text-gray-500 italic text-center py-2">No workouts logged today.</div>
              )}
            </div>
          </div>
        </div>

        {/* Sleep Tracker */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Moon size={16} className="text-indigo-400" />
              Sleep Metrics
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">Streak: {streaks.dailyLogging} Days</span>
          </div>

          <div className="my-6">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-3xl font-extrabold text-white">7.5h</span>
                <span className="text-gray-400 text-xs font-medium ml-1.5">Avg/Night</span>
              </div>
              <div className="text-xs text-right text-gray-400">
                <div>Deep Sleep: 2.2h</div>
                <div>REM Sleep: 1.8h</div>
              </div>
            </div>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mt-4">
              <div className="bg-indigo-400 h-full" style={{ width: '92%' }} />
            </div>
          </div>

          <div className="text-xs text-gray-400 bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-xl flex items-center gap-2">
            <Star size={12} className="text-indigo-300" />
            <span>Sleep consistency is high. Keep it up!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
