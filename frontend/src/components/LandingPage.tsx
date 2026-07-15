'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '../utils/supabase/client';
import { Shield, Sparkles, Activity, Apple, Moon, Bot, ArrowRight, Lock, Mail, User } from 'lucide-react';

interface LandingPageProps {
  onAuthSuccess: (sessionUser: any) => void;
}

export default function LandingPage({ onAuthSuccess }: LandingPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Sign In
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) throw authError;
        onAuthSuccess(data.user);
      } else {
        // Sign Up
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name }
          }
        });

        if (authError) throw authError;
        
        // Auto sign-in or notify
        if (data.user) {
          onAuthSuccess(data.user);
        } else {
          setError('Check your email to confirm registration!');
        }
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      // Resilient Fallback: If Supabase config is missing/invalid, allow running in Guest Mode
      if (err.message?.includes('database') || err.message?.includes('URL') || err.message?.includes('Fetch') || err.message?.includes('null') || err.message?.includes('endpoint')) {
        console.warn('Supabase credentials missing or unreachable. Entering guest fallback...');
        const guestUser = { id: `guest-${Date.now()}`, email, user_metadata: { display_name: name || 'Guest User' } };
        onAuthSuccess(guestUser);
      } else {
        setError(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    const guestUser = { id: `guest-${Date.now()}`, email: 'guest@healthsphere.ai', user_metadata: { display_name: 'Guest Explorer' } };
    onAuthSuccess(guestUser);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans relative overflow-hidden flex flex-col justify-between w-full">
      {/* Ambient glowing circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <Activity className="text-emerald-400" size={24} />
          <span className="font-black text-xl tracking-tight">HealthSphere <span className="text-emerald-400">AI</span></span>
        </div>

        <button 
          onClick={() => { setIsLogin(true); setShowAuthModal(true); }}
          className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-colors"
        >
          Sign In
        </button>
      </header>

      {/* Main Hero & Content */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 z-10">
        
        {/* Left Side: Marketing Value Prop */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles size={12} /> Next-Gen Health Tracking
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
            Understand your body, <br/>guided by AI.
          </h1>

          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0">
            A premium, Apple-level polished health logging suite. Auto-classify calories from food photographs, design dynamic meal schedules, track sleep cycles, and unlock cognitive health insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button
              onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Get Started Free <ArrowRight size={16} />
            </button>
            <button
              onClick={handleGuestMode}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-semibold transition-colors"
            >
              Try Instant Guest Mode
            </button>
          </div>

          {/* Core Feature Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
            {[
              { icon: Apple, label: "AI Nutrition", desc: "Photo Recognition" },
              { icon: Bot, label: "Cognitive Coach", desc: "Always Available" },
              { icon: Moon, label: "Sleep Logs", desc: "Quality Tracker" },
              { icon: Shield, label: "Private & Safe", desc: "Supabase Shielded" }
            ].map((f, i) => (
              <div key={i} className="glass-card p-4 text-center border border-white/5 hover:border-white/10 transition-colors">
                <f.icon className="mx-auto mb-2 text-emerald-400" size={20} />
                <div className="text-xs font-bold text-white">{f.label}</div>
                <div className="text-xxs text-gray-400 mt-0.5">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Showcase Preview Panel */}
        <div className="flex-1 w-full max-w-md lg:max-w-none flex justify-center items-center">
          <div className="relative w-full aspect-[4/3] glass-card p-6 border border-white/5 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
              </div>
              <span className="text-xxs text-gray-500 font-mono">healthsphere.ai/dashboard</span>
            </div>

            <div className="my-8 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xxs text-gray-400 uppercase tracking-wider">Active Calories</div>
                  <div className="text-3xl font-extrabold text-white">642 <span className="text-sm font-semibold text-gray-400">/ 800 kcal</span></div>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">80% Done</span>
              </div>

              {/* Fake animated progress bar */}
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full w-[80%] shadow-glow" />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
                  <div className="text-xxs text-gray-400 uppercase">Protein</div>
                  <div className="text-xs font-bold text-white">124g</div>
                </div>
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
                  <div className="text-xxs text-gray-400 uppercase">Carbs</div>
                  <div className="text-xs font-bold text-white">184g</div>
                </div>
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-center">
                  <div className="text-xxs text-gray-400 uppercase">Fats</div>
                  <div className="text-xs font-bold text-white">52g</div>
                </div>
              </div>
            </div>

            <div className="text-xxs text-gray-500 italic text-center border-t border-white/5 pt-3">
              "Breakfast classified successfully: Eggs Benedict & Latte (420 kcal)"
            </div>
          </div>
        </div>

      </main>

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 bg-[#020204]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-card border border-white/10 p-6 relative"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-sm font-semibold p-1"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold text-white mb-1">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-xs text-gray-400 mb-6">
                {isLogin ? 'Access your health metrics and AI logs' : 'Sign up to start tracking your nutrition and habits'}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-xxs text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-4 top-[13px] text-gray-400" />
                      <input 
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xxs text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-[13px] text-gray-400" />
                    <input 
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xxs text-gray-400 uppercase tracking-wider mb-1">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-[13px] text-gray-400" />
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-emerald-500/10 transition-all text-white flex items-center justify-center gap-1.5"
                >
                  {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register Account'}
                </button>
              </form>

              <div className="text-center mt-6 pt-4 border-t border-white/5 text-xs text-gray-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-emerald-400 font-semibold hover:underline"
                >
                  {isLogin ? 'Create one' : 'Log In'}
                </button>
              </div>

              <div className="text-center mt-3 text-xxs text-gray-500">
                Or <button onClick={handleGuestMode} className="text-gray-400 hover:text-white underline">bypass this step</button> to explore as a guest.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-6 border-t border-white/5 text-center text-xs text-gray-500 z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span>© 2026 HealthSphere AI. Apple-level polished health coaching.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
