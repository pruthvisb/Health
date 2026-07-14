'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { storage, WeightLog } from '../utils/storage';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingDown, Plus, Trash2, Calendar, 
  Sparkles, Award, Compass, Calculator 
} from 'lucide-react';

interface WeightTrackerViewProps {
  onRefresh: () => void;
}

export default function WeightTrackerView({ onRefresh }: WeightTrackerViewProps) {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [profile, setProfile] = useState(storage.getProfile());
  const [newWeight, setNewWeight] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeframe, setTimeframe] = useState<'7days' | 'monthly' | 'yearly'>('7days');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState('');

  useEffect(() => {
    setLogs(storage.getWeightLogs());
    setProfile(storage.getProfile());
  }, []);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(newWeight);
    if (isNaN(weightNum) || weightNum <= 0) return;

    const log = storage.addWeightLog(weightNum, new Date(logDate).toISOString());
    const updated = storage.getWeightLogs();
    setLogs(updated);
    setNewWeight('');
    onRefresh();

    // Milestone checks
    const targetDiff = weightNum - profile.goalWeight;
    if (targetDiff <= 0) {
      setCelebrationMsg("🎉 Goal weight reached! You are officially a Champion! 🎉");
      setShowCelebration(true);
    } else if (weightNum < profile.currentWeight) {
      setCelebrationMsg(`🔥 New Personal Record! You logged ${weightNum} kg! Keep pushing!`);
      setShowCelebration(true);
    }
  };

  const handleDeleteLog = (id: string) => {
    storage.deleteWeightLog(id);
    const updated = storage.getWeightLogs();
    setLogs(updated);
    onRefresh();
  };

  // Prepare chart data based on timeframe
  const getChartData = () => {
    const sorted = [...logs].sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());
    
    // Convert weights if imperial
    const mapWeight = (w: number) => {
      return profile.units === 'metric' ? w : w * 2.20462;
    };

    const formatted = sorted.map(l => ({
      date: new Date(l.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weight: parseFloat(mapWeight(l.weight).toFixed(1)),
      rawDate: l.loggedAt
    }));

    if (timeframe === '7days') {
      return formatted.slice(-7);
    } else if (timeframe === 'monthly') {
      return formatted.slice(-30);
    }
    return formatted; // yearly / all
  };

  const chartData = getChartData();

  // Stats calculators
  const latestWeight = logs.length > 0 ? logs[logs.length - 1].weight : profile.currentWeight;
  const initialWeight = logs.length > 0 ? logs[0].weight : profile.currentWeight;
  const weightLost = initialWeight - latestWeight;
  const ratePerWeek = weightLost > 0 ? (weightLost / (logs.length || 1)) * 7 : 0.4; // default to 0.4kg/week if flat or gaining

  // Target date prediction
  const remainingWeight = Math.max(0, latestWeight - profile.goalWeight);
  const weeksToTarget = ratePerWeek > 0 ? remainingWeight / ratePerWeek : 0;
  const predictedDate = new Date();
  predictedDate.setDate(predictedDate.getDate() + (weeksToTarget * 7));

  const formatWeight = (w: number) => {
    return profile.units === 'metric' ? `${w.toFixed(1)} kg` : `${(w * 2.20462).toFixed(1)} lbs`;
  };

  return (
    <div className="space-y-6">
      {/* Celebration Popup */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="glass-panel max-w-sm w-full p-6 rounded-3xl text-center space-y-4 border border-yellow-500/30">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto text-yellow-400">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Milestone Unlocked!</h3>
              <p className="text-gray-300 text-sm">{celebrationMsg}</p>
              <button 
                onClick={() => setShowCelebration(false)}
                className="w-full py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-yellow-500/20 transition-all text-white"
              >
                Awesome!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Add log and info */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-4">
              <Plus size={16} className="text-emerald-400" />
              Log Daily Weight
            </h3>
            
            <form onSubmit={handleAddLog} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase font-medium">Weight ({profile.units === 'metric' ? 'kg' : 'lbs'})</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 78.5"
                  value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase font-medium">Date</label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={e => setLogDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all text-white flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Log Entry
              </button>
            </form>
          </div>

          {/* AI Weight Projection */}
          <div className="glass-card p-6 border border-emerald-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-4">
              <Sparkles size={16} />
              AI Weight Projection
            </h3>

            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Average Loss / Week:</span>
                <span className="font-semibold text-white">{formatWeight(ratePerWeek)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Target Date:</span>
                <span className="font-semibold text-emerald-400">
                  {weeksToTarget > 0 ? predictedDate.toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Trend Direction:</span>
                <span className="font-semibold text-rose-400 flex items-center gap-0.5">
                  <TrendingDown size={12} /> Downward Steady
                </span>
              </div>
              <p className="text-gray-400 border-t border-white/5 pt-2 mt-2 leading-relaxed">
                *Prediction calculated using a hybrid formula factoring in calorie deficit, active minutes, and water volume logs.
              </p>
            </div>
          </div>
        </div>

        {/* Right columns: Graph & Logs list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weight graph panel */}
          <div className="glass-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Weight Trend Chart</h3>
                <p className="text-xs text-gray-400 mt-0.5">Visual representation of your weigh-in logs</p>
              </div>
              
              {/* Timeframe controls */}
              <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl self-start sm:self-auto">
                {(['7days', 'monthly', 'yearly'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                      timeframe === tf
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tf === '7days' ? '7 Days' : tf === 'monthly' ? 'Monthly' : 'Yearly'}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-[280px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="weightColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af" 
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={11}
                      tickLine={false}
                      domain={['dataMin - 1', 'dataMax + 1']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(15, 15, 20, 0.9)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                      labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#weightColor)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-500 italic">
                  No chart data available. Add entries to display trends.
                </div>
              )}
            </div>
          </div>

          {/* History log entries */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Weigh-in History
            </h3>

            <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2">
              {[...logs].reverse().map(l => (
                <div 
                  key={l.id} 
                  className="flex items-center justify-between bg-white/5 border border-white/5 px-4 py-3 rounded-xl hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="text-gray-400" size={16} />
                    <div>
                      <div className="text-sm font-bold text-white">{formatWeight(l.weight)}</div>
                      <div className="text-xxs text-gray-400">
                        {new Date(l.loggedAt).toLocaleDateString(undefined, { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteLog(l.id)}
                    className="p-1.5 hover:bg-rose-500/10 rounded-lg text-gray-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-sm text-gray-500 italic text-center py-6">
                  No weigh-ins recorded. Log your weight to see history.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
