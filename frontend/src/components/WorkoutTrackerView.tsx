'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { storage, WorkoutLog } from '../utils/storage';
import { Activity, Plus, Trash2, Clock, Flame, Calendar, Award } from 'lucide-react';

interface WorkoutTrackerViewProps {
  onRefresh: () => void;
}

const WORKOUT_TYPES = [
  { type: 'WALKING', label: 'Walking', met: 3.5 },
  { type: 'RUNNING', label: 'Running', met: 9.8 },
  { type: 'CYCLING', label: 'Cycling', met: 7.5 },
  { type: 'SWIMMING', label: 'Swimming', met: 8.0 },
  { type: 'GYM', label: 'Gym Weight Lifting', met: 6.0 },
  { type: 'YOGA', label: 'Yoga & Pilates', met: 3.0 },
  { type: 'HOME', label: 'Home Cardio/Bodyweight', met: 5.5 }
];

export default function WorkoutTrackerView({ onRefresh }: WorkoutTrackerViewProps) {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [workoutType, setWorkoutType] = useState<WorkoutLog['type']>('WALKING');
  const [duration, setDuration] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [profile, setProfile] = useState(storage.getProfile());

  useEffect(() => {
    setLogs(storage.getWorkoutLogs());
    setProfile(storage.getProfile());
  }, []);

  const refreshLogs = () => {
    setLogs(storage.getWorkoutLogs());
    onRefresh();
  };

  // Auto-calculate calories based on weight, activity MET, and duration
  const getEstimatedCalories = () => {
    const minutes = parseFloat(duration);
    if (isNaN(minutes) || minutes <= 0) return 0;
    
    const activeMet = WORKOUT_TYPES.find(w => w.type === workoutType)?.met || 4;
    // Calories formula: METs * 3.5 * weight in kg / 200 * duration in mins
    const est = activeMet * 3.5 * profile.currentWeight / 200 * minutes;
    return Math.round(est);
  };

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = parseInt(duration);
    if (isNaN(minutes) || minutes <= 0) return;

    const estimated = getEstimatedCalories();
    const calories = customCalories ? parseFloat(customCalories) : estimated;

    storage.addWorkoutLog({
      type: workoutType,
      durationMinutes: minutes,
      caloriesBurned: calories
    });

    setDuration('');
    setCustomCalories('');
    refreshLogs();
  };

  const handleDelete = (id: string) => {
    storage.deleteWorkoutLog(id);
    refreshLogs();
  };

  // Weekly stats
  const totalDuration = logs.reduce((sum, w) => sum + w.durationMinutes, 0);
  const totalCalories = logs.reduce((sum, w) => sum + w.caloriesBurned, 0);
  
  // Weekly target defaults
  const targetMinutes = 150;
  const targetCalories = 2000;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Weekly Summary Card */}
        <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full pointer-events-none" />
          
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award size={16} className="text-red-400" />
            Weekly Activity Summary
          </h3>

          <div className="my-6 space-y-6">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-3xl font-extrabold text-white">{totalDuration} mins</span>
                <span className="text-xs text-gray-400">Target: {targetMinutes} mins</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-red-500 h-full" 
                  style={{ width: `${Math.min(100, (totalDuration / targetMinutes) * 100)}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-3xl font-extrabold text-white">{Math.round(totalCalories)} kcal</span>
                <span className="text-xs text-gray-400">Target: {targetCalories} kcal</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full" 
                  style={{ width: `${Math.min(100, (totalCalories / targetCalories) * 100)}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
            <span className="font-semibold text-red-400 block mb-0.5">🌟 HealthSphere Insight</span>
            You have achieved {Math.round((totalDuration / targetMinutes) * 100)}% of your weekly active duration goal. Keep it up!
          </div>
        </div>

        {/* Middle Column: Log Workout Form */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Plus size={16} className="text-emerald-400" />
            Log Custom Workout
          </h3>

          <form onSubmit={handleAddWorkout} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase font-medium">Activity Type</label>
              <select
                value={workoutType}
                onChange={e => setWorkoutType(e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50"
              >
                {WORKOUT_TYPES.map(w => (
                  <option key={w.type} className="bg-gray-900" value={w.type}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase font-medium">Duration (Mins)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 45"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase font-medium">Est. Calories (kcal)</label>
                <input
                  type="number"
                  placeholder={duration ? getEstimatedCalories().toString() : "Auto-calculated"}
                  value={customCalories}
                  onChange={e => setCustomCalories(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {duration && (
              <div className="text-xxs text-emerald-400 italic">
                *Estimated active calories for your weight: {getEstimatedCalories()} kcal.
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-red-500/20 transition-all text-white flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Log Workout
            </button>
          </form>
        </div>

        {/* Right Column: Workout History List */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Logged Workouts History
          </h3>

          <div className="max-h-[280px] overflow-y-auto pr-1 space-y-2">
            {[...logs].reverse().map(w => (
              <div 
                key={w.id} 
                className="flex items-center justify-between bg-white/5 border border-white/5 px-4 py-3 rounded-xl hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-500/10 rounded-full flex items-center justify-center text-red-400">
                    <Activity size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {WORKOUT_TYPES.find(wt => wt.type === w.type)?.label || w.type}
                    </div>
                    <div className="text-xxs text-gray-400 mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-0.5"><Clock size={10} /> {w.durationMinutes} mins</span>
                      <span className="flex items-center gap-0.5"><Flame size={10} /> {Math.round(w.caloriesBurned)} kcal</span>
                    </div>
                    <div className="text-xxs text-gray-500 mt-0.5">
                      {new Date(w.loggedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(w.id)}
                  className="p-1.5 hover:bg-rose-500/10 rounded-lg text-gray-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-sm text-gray-500 italic text-center py-8">
                No workouts recorded yet. Start moving!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
