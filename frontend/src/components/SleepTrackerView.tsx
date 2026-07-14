'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { storage, SleepLog } from '../utils/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Moon, Plus, Trash2, Calendar, Star, Award, Clock } from 'lucide-react';

interface SleepTrackerViewProps {
  onRefresh: () => void;
}

export default function SleepTrackerView({ onRefresh }: SleepTrackerViewProps) {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [bedTime, setBedTime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [quality, setQuality] = useState(4);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setLogs(storage.getSleepLogs());
  }, []);

  const refreshLogs = () => {
    setLogs(storage.getSleepLogs());
    onRefresh();
  };

  // Helper to calculate duration including cross-midnight
  const calculateDuration = (bed: string, wake: string): number => {
    const [bedH, bedM] = bed.split(':').map(Number);
    const [wakeH, wakeM] = wake.split(':').map(Number);

    let bedMin = bedH * 60 + bedM;
    let wakeMin = wakeH * 60 + wakeM;

    if (wakeMin < bedMin) {
      // Crossed midnight (add 24 hours to wake time in minutes)
      wakeMin += 24 * 60;
    }

    const diffMin = wakeMin - bedMin;
    return parseFloat((diffMin / 60).toFixed(1));
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = calculateDuration(bedTime, wakeTime);

    storage.addSleepLog({
      bedTime,
      wakeTime,
      durationHours: duration,
      quality,
      notes
    });

    setNotes('');
    refreshLogs();
  };

  const handleDelete = (id: string) => {
    storage.deleteSleepLog(id);
    refreshLogs();
  };

  // Prepare chart data
  const chartData = logs.slice(-7).map(l => ({
    date: new Date(l.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    Hours: l.durationHours,
    Quality: l.quality
  }));

  const avgHours = logs.length > 0 
    ? (logs.reduce((sum, l) => sum + l.durationHours, 0) / logs.length).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Sleep Stats Dashboard */}
        <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full pointer-events-none" />
          
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Moon size={16} className="text-indigo-400" />
            Sleep Quality Overview
          </h3>

          <div className="my-6 space-y-4">
            <div>
              <span className="text-5xl font-extrabold text-white">{avgHours}h</span>
              <span className="text-gray-400 text-xs font-semibold ml-1.5 uppercase">Avg Sleep / Night</span>
            </div>

            <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3">
              <span className="text-gray-400">Target sleep:</span>
              <span className="font-bold text-white">8.0 hours</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Sleep efficiency:</span>
              <span className="font-bold text-emerald-400">92%</span>
            </div>
          </div>

          <div className="text-xs text-gray-400 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl flex items-center gap-2">
            <Clock size={16} className="text-indigo-300 shrink-0" />
            <span>Maintaining a consistent bedtime schedule will improve your Deep Sleep metrics.</span>
          </div>
        </div>

        {/* Middle Column: Log Sleep Session */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Plus size={16} className="text-emerald-400" />
            Log Sleep Session
          </h3>

          <form onSubmit={handleAddLog} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase font-medium">Bed Time</label>
                <input
                  type="time"
                  required
                  value={bedTime}
                  onChange={e => setBedTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase font-medium">Wake Time</label>
                <input
                  type="time"
                  required
                  value={wakeTime}
                  onChange={e => setWakeTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase font-medium">Sleep Quality (1-5 Stars)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setQuality(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star 
                      size={24} 
                      className={star <= quality ? "fill-yellow-400 text-yellow-400" : "text-gray-600"} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase font-medium">Notes</label>
              <input
                type="text"
                placeholder="e.g. Rested, woke up once, no late screens..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-indigo-500/50"
              />
            </div>

            <div className="text-xxs text-gray-400 italic">
              *Estimated sleep duration: {calculateDuration(bedTime, wakeTime)} hours.
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-white flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Log Sleep
            </button>
          </form>
        </div>

        {/* Right Column: Sleep History Graph */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Sleep Consistency (7 Days)
            </h3>
            
            <div className="h-[200px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(15, 15, 20, 0.9)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="Hours" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-500 italic">
                  No sleep charts logged yet.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Recent Sleep logs table */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Sleep Logs History
        </h3>

        <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2">
          {[...logs].reverse().map(l => (
            <div 
              key={l.id} 
              className="flex items-center justify-between bg-white/5 border border-white/5 px-4 py-3 rounded-xl hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400">
                  <Moon size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {l.durationHours} Hours ({l.bedTime} - {l.wakeTime})
                  </div>
                  <div className="text-xxs text-gray-400 mt-0.5 flex items-center gap-1.5">
                    <span className="flex items-center">
                      Quality: {[...Array(l.quality)].map((_, i) => (
                        <Star key={i} size={8} className="fill-yellow-400 text-yellow-400 ml-0.5" />
                      ))}
                    </span>
                    {l.notes && <span>| Notes: {l.notes}</span>}
                  </div>
                  <div className="text-xxs text-gray-500 mt-0.5">
                    {new Date(l.loggedAt).toLocaleDateString(undefined, { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(l.id)}
                className="p-1.5 hover:bg-rose-500/10 rounded-lg text-gray-400 hover:text-rose-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-sm text-gray-500 italic text-center py-8">
              No sleep sessions logged. Record tonight's sleep!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
