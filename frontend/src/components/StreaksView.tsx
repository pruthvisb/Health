'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { storage } from '../utils/storage';
import { Award, Zap, Shield, Flame, Droplet, CheckSquare, Target } from 'lucide-react';

export default function StreaksView() {
  const [streaks, setStreaks] = useState(storage.getStreaks());

  useEffect(() => {
    setStreaks(storage.getStreaks());
  }, []);

  const BADGES = [
    { name: "Hydration Hero", desc: "Logged 2.5L+ water for 5 days in a row", icon: Droplet, color: "text-sky-400 bg-sky-500/10 border-sky-500/20", unlocked: streaks.water >= 5 },
    { name: "Iron Will", desc: "Logged weight for 12 days consistently", icon: Target, color: "text-rose-400 bg-rose-500/10 border-rose-500/20", unlocked: streaks.weightLogging >= 10 },
    { name: "Active Warrior", desc: "Completed 3 workouts this week", icon: Flame, color: "text-red-400 bg-red-500/10 border-red-500/20", unlocked: streaks.workout >= 3 },
    { name: "Consistent Dieter", desc: "Logged food logs for 7 consecutive days", icon: CheckSquare, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", unlocked: streaks.healthyEating >= 7 }
  ];

  const nextLevelXp = streaks.level * 1000;
  const xpPercent = Math.min(100, Math.round((streaks.xp % 1000) / 10));

  return (
    <div className="space-y-6">
      
      {/* Level Card */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
        
        <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-indigo-500 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white shadow-xl shadow-indigo-500/10 shrink-0">
          Lvl {streaks.level}
        </div>

        <div className="flex-1 w-full space-y-2">
          <div className="flex justify-between items-baseline">
            <h3 className="text-lg font-bold text-white">XP Progression</h3>
            <span className="text-xs text-gray-400 font-semibold">{streaks.xp % 1000} / 1000 XP</span>
          </div>

          <div className="w-full bg-gray-800 h-3.5 rounded-full overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-emerald-400 to-indigo-500 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <p className="text-xxs text-gray-400 italic">Gain XP by logging food (30 XP), logging water (10 XP), recording weight (50 XP), or hitting workouts (100 XP).</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Active Streaks */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2">
            Active Streaks
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <Flame className="text-orange-500" size={24} />
              <div>
                <div className="text-2xl font-bold text-white">{streaks.dailyLogging} Days</div>
                <div className="text-xxs text-gray-400">Daily Log Streak</div>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <Droplet className="text-sky-400" size={24} />
              <div>
                <div className="text-2xl font-bold text-white">{streaks.water} Days</div>
                <div className="text-xxs text-gray-400">Water Log Streak</div>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <Zap className="text-yellow-400" size={24} />
              <div>
                <div className="text-2xl font-bold text-white">{streaks.workout} Days</div>
                <div className="text-xxs text-gray-400">Workout Streak</div>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
              <Shield className="text-emerald-400" size={24} />
              <div>
                <div className="text-2xl font-bold text-white">{streaks.healthyEating} Days</div>
                <div className="text-xxs text-gray-400">Healthy Meal Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Achievements */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2 mb-4">
            Unlocked Achievements
          </h3>

          <div className="space-y-3">
            {BADGES.map((b, idx) => (
              <div 
                key={idx}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  b.unlocked 
                    ? 'bg-white/5 border-white/5' 
                    : 'bg-black/20 border-white/5 opacity-40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${b.color}`}>
                    <b.icon size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{b.name}</div>
                    <div className="text-xxs text-gray-400 mt-0.5">{b.desc}</div>
                  </div>
                </div>

                {b.unlocked ? (
                  <span className="text-xxs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/15">
                    Earned
                  </span>
                ) : (
                  <span className="text-xxs text-gray-500">
                    Locked
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
