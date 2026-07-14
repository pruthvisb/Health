'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { storage, WaterLog } from '../utils/storage';
import { Droplet, Plus, Trash2, Bell, Zap, Flame, RefreshCw } from 'lucide-react';

interface WaterTrackerViewProps {
  onRefresh: () => void;
}

export default function WaterTrackerView({ onRefresh }: WaterTrackerViewProps) {
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [selectedType, setSelectedType] = useState<WaterLog['type']>('WATER');
  const [customAmount, setCustomAmount] = useState('');
  const [streaks, setStreaks] = useState(storage.getStreaks());
  const [remindersEnabled, setRemindersEnabled] = useState(false);

  useEffect(() => {
    setLogs(storage.getWaterLogs());
    setStreaks(storage.getStreaks());
  }, []);

  const refreshLogs = () => {
    setLogs(storage.getWaterLogs());
    setStreaks(storage.getStreaks());
    onRefresh();
  };

  const handleQuickAdd = (amount: number) => {
    storage.addWaterLog(amount, selectedType);
    refreshLogs();
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount <= 0) return;
    storage.addWaterLog(amount, selectedType);
    setCustomAmount('');
    refreshLogs();
  };

  const handleDelete = (id: string) => {
    storage.deleteWaterLog(id);
    refreshLogs();
  };

  const today = new Date().toDateString();
  const todayLogs = logs.filter(l => new Date(l.loggedAt).toDateString() === today);
  const totalMl = todayLogs.reduce((sum, l) => sum + l.amountMl, 0);
  
  const targetMl = 2500;
  const remainingMl = Math.max(0, targetMl - totalMl);
  const hydrationPct = Math.min(100, Math.round((totalMl / targetMl) * 100));

  const fluidTypes = [
    { type: 'WATER', color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { type: 'COFFEE', color: 'text-amber-700', bg: 'bg-amber-700/10' },
    { type: 'TEA', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { type: 'JUICE', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { type: 'MILK', color: 'text-gray-300', bg: 'bg-gray-300/10' },
    { type: 'ELECTROLYTES', color: 'text-indigo-400', bg: 'bg-indigo-500/10' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Progress Ring & Stats */}
        <div className="glass-card p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/5 rounded-bl-full pointer-events-none" />
          
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider self-start flex items-center gap-1.5">
            <Droplet size={16} className="text-sky-400" />
            Hydration Percentage
          </h3>

          {/* Large animated drop */}
          <div className="relative my-8 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border border-white/5 flex items-center justify-center overflow-hidden relative">
              <motion.div 
                className="absolute bottom-0 left-0 right-0 bg-sky-500/20"
                initial={{ height: 0 }}
                animate={{ height: `${hydrationPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
              <div className="z-10 flex flex-col items-center">
                <span className="text-4xl font-extrabold text-white">{hydrationPct}%</span>
                <span className="text-xs text-gray-400 mt-1 uppercase font-semibold">Hydrated</span>
              </div>
            </div>
          </div>

          <div className="w-full text-left space-y-2 border-t border-white/5 pt-4">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Today's Intake:</span>
              <span className="font-bold text-white">{totalMl} ml</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Daily Target:</span>
              <span className="font-bold text-gray-400">{targetMl} ml</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Remaining Amount:</span>
              <span className="font-bold text-sky-400">{remainingMl} ml</span>
            </div>
            <div className="flex justify-between text-xs border-t border-white/5 pt-2 mt-2">
              <span className="text-gray-400">Hydration Streak:</span>
              <span className="font-bold text-emerald-400">🔥 {streaks.water} Days</span>
            </div>
          </div>
        </div>

        {/* Middle Column: Log Hydration */}
        <div className="glass-card p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              1. Choose Fluid Type
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {fluidTypes.map(f => (
                <button
                  key={f.type}
                  onClick={() => setSelectedType(f.type as any)}
                  className={`p-3 rounded-xl border text-xxs font-bold transition-all flex flex-col items-center gap-1.5 ${
                    selectedType === f.type
                      ? 'bg-sky-500/20 border-sky-500 text-sky-400 shadow-md'
                      : 'border-white/5 hover:border-white/10 text-gray-400'
                  }`}
                >
                  <Droplet size={14} className={f.color} />
                  {f.type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              2. Quick Add Volume
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {[100, 250, 500, 750, 1000].map(amount => (
                <button
                  key={amount}
                  onClick={() => handleQuickAdd(amount)}
                  className="py-2.5 bg-white/5 border border-white/5 hover:border-white/15 rounded-xl text-xs font-bold text-white transition-all flex flex-col items-center"
                >
                  <Plus size={10} className="text-sky-400 mb-0.5" />
                  {amount}ml
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCustomAdd} className="pt-2 border-t border-white/5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Or Add Custom Amount
            </h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="e.g. 350"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-sky-500/50"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 rounded-xl text-xs font-bold text-white transition-colors"
              >
                Add ml
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Hydration Log History & Reminders */}
        <div className="space-y-6">
          {/* Hydration Reminders */}
          <div className="glass-card p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="text-sky-400" size={20} />
              <div>
                <h4 className="text-sm font-bold text-white">Hydration Reminders</h4>
                <p className="text-xxs text-gray-400 mt-0.5">Receive hourly notifications to drink water</p>
              </div>
            </div>
            
            {/* Toggle */}
            <button 
              onClick={() => setRemindersEnabled(!remindersEnabled)}
              className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${
                remindersEnabled ? 'bg-sky-500' : 'bg-gray-800'
              }`}
            >
              <div 
                className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform duration-300 ${
                  remindersEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Logs List */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Today's Fluid Log
            </h3>

            <div className="max-h-[200px] overflow-y-auto pr-1 space-y-2">
              {todayLogs.reverse().map(l => (
                <div 
                  key={l.id} 
                  className="flex items-center justify-between bg-white/5 border border-white/5 px-4 py-3 rounded-xl hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Droplet className="text-sky-400" size={16} />
                    <div>
                      <div className="text-sm font-bold text-white">{l.amountMl} ml of {l.type}</div>
                      <div className="text-xxs text-gray-400">
                        Logged at {new Date(l.loggedAt).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit'
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
              {todayLogs.length === 0 && (
                <div className="text-sm text-gray-500 italic text-center py-6">
                  No fluids logged today. Start hydrating!
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
