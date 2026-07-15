'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { storage } from '../utils/storage';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';
import { BarChart2, TrendingUp, Calendar, Heart, Award, ArrowUpRight } from 'lucide-react';

export default function AnalyticsView() {
  const [timeframe, setTimeframe] = useState<'7days' | 'monthly'>('7days');
  const [weightLogs, setWeightLogs] = useState(storage.getWeightLogs());
  const [foodLogs, setFoodLogs] = useState(storage.getFoodLogs());
  const [waterLogs, setWaterLogs] = useState(storage.getWaterLogs());
  const [workoutLogs, setWorkoutLogs] = useState(storage.getWorkoutLogs());

  const [profile, setProfile] = useState(storage.getProfile());

  useEffect(() => {
    setProfile(storage.getProfile());
    setWeightLogs(storage.getWeightLogs());
    setFoodLogs(storage.getFoodLogs());
    setWaterLogs(storage.getWaterLogs());
    setWorkoutLogs(storage.getWorkoutLogs());
  }, []);

  // Generate date list starting from the registration date (first weight log)
  const getDates = () => {
    const dates = [];
    const count = timeframe === '7days' ? 7 : 30;
    
    // Find the oldest weight log as the registration date
    let regDate = new Date();
    if (weightLogs.length > 0) {
      const sortedWeights = [...weightLogs].sort(
        (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
      );
      regDate = new Date(sortedWeights[0].loggedAt);
    }
    
    // Normalize to midnight
    const regMidnight = new Date(regDate.getFullYear(), regDate.getMonth(), regDate.getDate());
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Calculate difference in days
    const diffTime = Math.max(0, todayMidnight.getTime() - regMidnight.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of today
    
    const displayDaysCount = Math.min(count, diffDays);

    for (let i = displayDaysCount - 1; i >= 0; i--) {
      const d = new Date(todayMidnight);
      d.setDate(todayMidnight.getDate() - i);
      dates.push(d);
    }
    return dates;
  };

  const getAnalyticsData = () => {
    const dates = getDates();
    return dates.map(date => {
      const dateStr = date.toDateString();
      const dateLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      // Weight
      const dayWeightLog = weightLogs.find(l => new Date(l.loggedAt).toDateString() === dateStr);
      let weight = dayWeightLog ? dayWeightLog.weight : null;
      if (!weight) {
        // Fallback to closest past weight or the active profile currentWeight
        const pastLogs = weightLogs.filter(l => new Date(l.loggedAt).getTime() < date.getTime());
        weight = pastLogs.length > 0 ? pastLogs[pastLogs.length - 1].weight : profile.currentWeight;
      }

      // Calories Consumed
      const consumed = foodLogs
        .filter(f => new Date(f.loggedAt).toDateString() === dateStr)
        .reduce((sum, f) => sum + f.calories, 0);

      // Calories Burned (only show active workouts burned calories)
      const burned = workoutLogs
        .filter(w => new Date(w.loggedAt).toDateString() === dateStr)
        .reduce((sum, w) => sum + w.caloriesBurned, 0);

      // Hydration
      const water = waterLogs
        .filter(w => new Date(w.loggedAt).toDateString() === dateStr)
        .reduce((sum, w) => sum + w.amountMl, 0);

      // Sleep
      const sleepLogs = storage.getSleepLogs();
      const sleepLog = sleepLogs.find(s => new Date(s.loggedAt).toDateString() === dateStr);
      const sleep = sleepLog ? sleepLog.durationHours : 0;

      return {
        date: dateLabel,
        Weight: parseFloat(weight.toFixed(1)),
        "Calories Consumed": consumed,
        "Calories Burned": Math.round(burned),
        Water: water,
        Sleep: parseFloat(sleep.toFixed(1))
      };
    });
  };

  const data = getAnalyticsData();

  return (
    <div className="space-y-6">
      
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Health Analytics</h2>
          <p className="text-xs text-gray-400 mt-0.5">Explore patterns and correlations across your habits.</p>
        </div>

        <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl self-start sm:self-auto">
          {(['7days', 'monthly'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                timeframe === tf
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tf === '7days' ? 'Last 7 Days' : 'Monthly View'}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Caloric Balance Comparison */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <BarChart2 size={16} className="text-emerald-400" />
            Calorie Balance (Intake vs Outflow)
          </h3>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 15, 20, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                <Bar dataKey="Calories Consumed" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Calories Burned" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weight Curve Over Time */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <TrendingUp size={16} className="text-rose-400" />
            Weight Deficit Tracker
          </h3>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightColorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 15, 20, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Area type="monotone" dataKey="Weight" stroke="#10b981" fillOpacity={1} fill="url(#weightColorGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Water Hydration */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Calendar size={16} className="text-sky-400" />
            Hydration History (ml)
          </h3>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="waterColorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 15, 20, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Area type="monotone" dataKey="Water" stroke="#0ea5e9" fillOpacity={1} fill="url(#waterColorGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep quality correlation */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Heart size={16} className="text-indigo-400" />
            Sleep Duration Correlation (Hours)
          </h3>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 15, 20, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="Sleep" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
