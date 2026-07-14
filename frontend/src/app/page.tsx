'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { storage, UserProfile } from '../utils/storage';

// Import Views
import ProfileOnboarding from '../components/ProfileOnboarding';
import DashboardView from '../components/DashboardView';
import WeightTrackerView from '../components/WeightTrackerView';
import FoodTrackerView from '../components/FoodTrackerView';
import WaterTrackerView from '../components/WaterTrackerView';
import WorkoutTrackerView from '../components/WorkoutTrackerView';
import MealPlannerView from '../components/MealPlannerView';
import AnalyticsView from '../components/AnalyticsView';
import AICoachView from '../components/AICoachView';
import StreaksView from '../components/StreaksView';
import ReportsView from '../components/ReportsView';
import SettingsView from '../components/SettingsView';
import SleepTrackerView from '../components/SleepTrackerView';

// Icons
import { 
  Layout, TrendingDown, Apple, Droplet, Activity, 
  Sparkles, BarChart2, Bot, Trophy, FileText, Settings, Menu, X, User, Moon
} from 'lucide-react';

type TabType = 'Dashboard' | 'Weight' | 'Food' | 'Water' | 'Workouts' | 'Sleep' | 'Meal Planner' | 'Analytics' | 'AI Coach' | 'Streaks/XP' | 'Reports' | 'Settings';

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('Dashboard');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    // Check if profile exists in storage (or load defaults on first visit if we want to bypass onboarding, or require it)
    const isFirstVisit = !localStorage.getItem('hsa_profile');
    if (!isFirstVisit) {
      setProfile(storage.getProfile());
    }
  }, []);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setActiveTab('Dashboard');
  };

  const handleRefreshState = () => {
    setRefreshTrigger(prev => !prev);
  };

  // Nav Items
  const NAV_ITEMS = [
    { name: 'Dashboard', icon: Layout },
    { name: 'Weight', icon: TrendingDown },
    { name: 'Food', icon: Apple },
    { name: 'Water', icon: Droplet },
    { name: 'Workouts', icon: Activity },
    { name: 'Sleep', icon: Moon },
    { name: 'Meal Planner', icon: Sparkles },
    { name: 'Analytics', icon: BarChart2 },
    { name: 'AI Coach', icon: Bot },
    { name: 'Streaks/XP', icon: Trophy },
    { name: 'Reports', icon: FileText },
    { name: 'Settings', icon: Settings },
  ] as const;

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#050508] text-white flex items-center justify-center font-sans">
        <ProfileOnboarding onComplete={handleOnboardingComplete} />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white flex font-sans">
      {/* Visual Ambient Glows */}
      <div className="glow-bg" />
      <div className="glow-circle-1 animate-pulse-slow" />
      <div className="glow-circle-2" />
      <div className="glow-circle-3" />

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 glass-panel border-r border-white/5 p-6 h-screen sticky top-0 justify-between">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-indigo-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-emerald-400/20">
              HS
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-tight">HealthSphere</span>
              <span className="text-emerald-400 font-extrabold text-xs block -mt-1 tracking-wide">AI Edition</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name as TabType)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/25 text-emerald-400' 
                      : 'border border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer profile shortcut */}
        <div className="border-t border-white/5 pt-4 flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-xs uppercase">
            {profile.gender.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">{profile.country} Client</div>
            <button onClick={() => {
              localStorage.removeItem('hsa_profile');
              window.location.reload();
            }} className="text-xxs text-gray-500 hover:text-emerald-400 uppercase tracking-widest font-semibold block mt-0.5">
              Reset Onboarding
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile Toggle drawer */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileSidebar(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.aside 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50 glass-panel border-r border-white/5 p-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-sm">HS</div>
                    <span className="font-extrabold text-sm">HealthSphere</span>
                  </div>
                  <button onClick={() => setShowMobileSidebar(false)} className="p-1 hover:bg-white/5 rounded-lg text-gray-400">
                    <X size={18} />
                  </button>
                </div>

                <nav className="space-y-1">
                  {NAV_ITEMS.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          setActiveTab(item.name as TabType);
                          setShowMobileSidebar(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                          isActive 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/25' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon size={16} />
                        {item.name}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="border-t border-white/5 pt-4 text-center">
                <span className="text-xxs text-gray-500 block">HealthSphere AI v1.4</span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header Nav Bar */}
        <header className="lg:hidden glass-panel border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button 
            onClick={() => setShowMobileSidebar(true)}
            className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm tracking-tight">HealthSphere</span>
            <span className="text-emerald-400 font-extrabold text-xs">AI</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold uppercase border border-emerald-500/20">
            {profile.gender.charAt(0)}
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto pb-24 lg:pb-8">
          
          {/* Tab Render Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'Dashboard' && (
                <DashboardView 
                  onNavigate={(tab) => setActiveTab(tab as TabType)} 
                  triggerRefresh={refreshTrigger} 
                />
              )}
              {activeTab === 'Weight' && (
                <WeightTrackerView onRefresh={handleRefreshState} />
              )}
              {activeTab === 'Food' && (
                <FoodTrackerView onRefresh={handleRefreshState} />
              )}
              {activeTab === 'Water' && (
                <WaterTrackerView onRefresh={handleRefreshState} />
              )}
              {activeTab === 'Workouts' && (
                <WorkoutTrackerView onRefresh={handleRefreshState} />
              )}
              {activeTab === 'Sleep' && (
                <SleepTrackerView onRefresh={handleRefreshState} />
              )}
              {activeTab === 'Meal Planner' && (
                <MealPlannerView />
              )}
              {activeTab === 'Analytics' && (
                <AnalyticsView />
              )}
              {activeTab === 'AI Coach' && (
                <AICoachView />
              )}
              {activeTab === 'Streaks/XP' && (
                <StreaksView />
              )}
              {activeTab === 'Reports' && (
                <ReportsView />
              )}
              {activeTab === 'Settings' && (
                <SettingsView onRefresh={handleRefreshState} />
              )}
            </motion.div>
          </AnimatePresence>

        </main>
      </div>
      
      {/* Mobile Bottom Navigation Bar (Figma style) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-white/5 py-2 px-6 flex justify-between items-center z-30 shadow-2xl">
        {[
          { name: 'Dashboard', icon: Layout },
          { name: 'Weight', icon: TrendingDown },
          { name: 'Food', icon: Apple },
          { name: 'Water', icon: Droplet },
          { name: 'AI Coach', icon: Bot },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name as TabType)}
              className={`flex flex-col items-center justify-center ${isActive ? 'text-emerald-400' : 'text-gray-500 hover:text-white'}`}
            >
              <Icon size={18} />
              <span className="text-[9px] font-bold uppercase tracking-wider mt-1">{item.name.slice(0, 5)}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
