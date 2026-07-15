'use client';

import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { Settings, Shield, RefreshCw, Trash2, Download, Moon, Sun, AlertCircle } from 'lucide-react';
import { createClient } from '../utils/supabase/client';

interface SettingsViewProps {
  onRefresh: () => void;
  onSignOut?: () => void;
}

export default function SettingsView({ onRefresh, onSignOut }: SettingsViewProps) {
  const [profile, setProfile] = useState(storage.getProfile());
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Detect theme
    if (typeof window !== 'undefined') {
      const isLight = document.documentElement.classList.contains('light');
      setTheme(isLight ? 'light' : 'dark');
    }
  }, []);

  const handleUnitChange = (units: 'metric' | 'imperial') => {
    const updated = { ...profile, units };
    setProfile(updated);
    storage.saveProfile(updated);
    onRefresh();
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof window !== 'undefined') {
      if (next === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    }
  };

  // Export JSON helper
  const handleExportJSON = () => {
    const data = {
      profile: storage.getProfile(),
      weights: storage.getWeightLogs(),
      foods: storage.getFoodLogs(),
      waters: storage.getWaterLogs(),
      workouts: storage.getWorkoutLogs(),
      streaks: storage.getStreaks(),
      goals: storage.getGoals()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `healthsphere-data-export.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV helper
  const handleExportCSV = () => {
    const weights = storage.getWeightLogs();
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Weight,Date\n";
    weights.forEach(w => {
      csvContent += `${w.id},${w.weight},${w.loggedAt}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "healthsphere-weight-logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetApp = async () => {
    if (window.confirm("Are you sure you want to clear all logged weight, meals, hydration, and settings? This action is irreversible.")) {
      storage.clearAllData();
      try {
        const supabase: any = createClient();
        await supabase.auth.updateUser({
          data: { profile: null }
        });
      } catch (err) {
        console.warn(err);
      }
      window.location.reload();
    }
  };

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      localStorage.removeItem('hsa_user');
      localStorage.removeItem('hsa_profile');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Visual Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
          <Settings size={22} className="text-gray-400" />
          Application Settings
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">Customize your health tracking preferences and export local database logs.</p>
      </div>

      {/* Grid Settings Panels */}
      <div className="space-y-4">
        
        {/* Localization Preferences */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Shield size={16} className="text-emerald-400" />
            General Preferences
          </h3>

          <div className="flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-white block">Theme Mode</span>
              <span className="text-gray-400 text-xxs mt-0.5">Toggle app styling colors</span>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white font-semibold transition-all flex items-center gap-1.5"
            >
              {theme === 'dark' ? <Moon size={14} className="text-indigo-400" /> : <Sun size={14} className="text-yellow-400" />}
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>

          <div className="flex justify-between items-center text-xs border-t border-white/5 pt-4">
            <div>
              <span className="font-bold text-white block">Measurement System</span>
              <span className="text-gray-400 text-xxs mt-0.5">Switch weight and volume metrics</span>
            </div>
            
            <div className="flex bg-white/5 border border-white/5 p-0.5 rounded-xl">
              <button
                onClick={() => handleUnitChange('metric')}
                className={`px-3 py-1.5 rounded-lg text-xxs font-bold uppercase transition-all ${
                  profile.units === 'metric' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Metric
              </button>
              <button
                onClick={() => handleUnitChange('imperial')}
                className={`px-3 py-1.5 rounded-lg text-xxs font-bold uppercase transition-all ${
                  profile.units === 'imperial' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Imperial
              </button>
            </div>
          </div>
        </div>

        {/* Data Portability */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Download size={16} className="text-indigo-400" />
            Data Portability (Export)
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleExportCSV}
              className="py-3 bg-white/5 border border-white/15 hover:border-white/25 rounded-xl text-xs font-bold text-white transition-all flex flex-col items-center justify-center gap-2"
            >
              <Download size={16} className="text-indigo-400" />
              Download Weight CSV
            </button>
            
            <button
              onClick={handleExportJSON}
              className="py-3 bg-white/5 border border-white/15 hover:border-white/25 rounded-xl text-xs font-bold text-white transition-all flex flex-col items-center justify-center gap-2"
            >
              <Download size={16} className="text-emerald-400" />
              Download Full Backup JSON
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-card p-6 border border-rose-500/10 space-y-4">
          <h3 className="text-sm font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle size={16} />
            Danger Zone
          </h3>

          <div className="flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-white block">Sign Out of Session</span>
              <span className="text-gray-400 text-xxs mt-0.5">Disconnect from your email account</span>
            </div>
            
            <button
              onClick={handleSignOut}
              className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white font-bold transition-all flex items-center gap-1.5"
            >
              Sign Out
            </button>
          </div>

          <div className="flex justify-between items-center text-xs border-t border-white/5 pt-4">
            <div>
              <span className="font-bold text-white block">Delete Local Profile & Logs</span>
              <span className="text-gray-400 text-xxs mt-0.5">Wipe all cache database, resets onboarding settings</span>
            </div>
            
            <button
              onClick={handleResetApp}
              className="px-4 py-2.5 bg-rose-500/15 border border-rose-500/20 hover:bg-rose-500/25 rounded-xl text-rose-400 font-bold transition-all flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              Reset Account
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
