'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, storage } from '../utils/storage';
import { Activity, Target, User, Heart, Settings, Globe } from 'lucide-react';
import { createClient } from '../utils/supabase/client';

interface ProfileOnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function ProfileOnboarding({ onComplete }: ProfileOnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>({
    age: 28,
    gender: 'Male',
    height: 175,
    currentWeight: 80,
    goalWeight: 70,
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    activityLevel: 'MODERATELY_ACTIVE',
    lifestyle: '',
    medicalConditions: [],
    foodPreferences: ['NON_VEGETARIAN'],
    foodAllergies: [],
    country: 'United States',
    timezone: 'EST',
    units: 'metric'
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSave = async () => {
    storage.saveProfile(formData);
    
    // Scale and initialize weight log history to match user's entered current weight
    const W = formData.currentWeight;
    const initialLogs = [
      { id: `w-init-1`, weight: W, loggedAt: new Date().toISOString() }
    ];
    storage.saveWeightLogs(initialLogs);

    // Update goals matching the user target
    const goals = storage.getGoals();
    const weightGoal = goals.find(g => g.type === 'LOSE_WEIGHT' || g.type === 'GAIN_MUSCLE' || g.type === 'MAINTAIN_WEIGHT');
    if (weightGoal) {
      weightGoal.currentValue = W;
      weightGoal.targetValue = formData.goalWeight;
      weightGoal.name = `Reach ${formData.goalWeight} kg`;
      storage.saveGoals(goals);
    }

    // Persist profile into Supabase user metadata
    try {
      const supabase = createClient();
      await supabase.auth.updateUser({
        data: { profile: formData }
      });
    } catch (err) {
      console.warn("Failed to sync profile metadata to Supabase:", err);
    }

    onComplete(formData);
  };

  const handlePreferenceToggle = (pref: string) => {
    setFormData(prev => ({
      ...prev,
      foodPreferences: prev.foodPreferences.includes(pref)
        ? prev.foodPreferences.filter(p => p !== pref)
        : [pref] // Keep it exclusive or single selection for core diet
    }));
  };

  const handleAllergyToggle = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      foodAllergies: prev.foodAllergies.includes(allergy)
        ? prev.foodAllergies.filter(a => a !== allergy)
        : [...prev.foodAllergies, allergy]
    }));
  };

  const handleMedicalToggle = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.includes(condition)
        ? prev.medicalConditions.filter(c => c !== condition)
        : [...prev.medicalConditions, condition]
    }));
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0
    })
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
      {/* Background Glows */}
      <div className="glow-circle-1" />
      <div className="glow-circle-2" />

      <div className="w-full max-w-lg glass-panel p-8 rounded-3xl relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-800">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Wizard Header */}
        <div className="flex items-center justify-between mb-8 mt-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Step {step} of 5
          </span>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  i === step ? 'bg-emerald-400' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Steps */}
        <div className="min-h-[360px] flex flex-col justify-between">
          <AnimatePresence mode="wait" custom={step}>
            {step === 1 && (
              <motion.div
                key="step1"
                initial="enter"
                animate="center"
                exit="exit"
                variants={slideVariants}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-3">
                    <User size={24} />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Tell us about yourself</h2>
                  <p className="text-gray-400 text-sm mt-1">This helps us calculate your calorie and nutrient goals.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50"
                    >
                      <option className="bg-gray-900" value="Male">Male</option>
                      <option className="bg-gray-900" value="Female">Female</option>
                      <option className="bg-gray-900" value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={e => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.currentWeight}
                      onChange={e => setFormData({ ...formData, currentWeight: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial="enter"
                animate="center"
                exit="exit"
                variants={slideVariants}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mb-3">
                    <Target size={24} />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">What is your goal?</h2>
                  <p className="text-gray-400 text-sm mt-1">We will adapt your weekly reports to hit these targets.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Goal Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.goalWeight}
                      onChange={e => setFormData({ ...formData, goalWeight: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Target Date</label>
                    <input
                      type="date"
                      value={formData.targetDate}
                      onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Activity Level</label>
                  <select
                    value={formData.activityLevel}
                    onChange={e => setFormData({ ...formData, activityLevel: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50"
                  >
                    <option className="bg-gray-900" value="SEDENTARY">Sedentary (Little or no exercise)</option>
                    <option className="bg-gray-900" value="LIGHTLY_ACTIVE">Lightly Active (Light exercise 1-3 days/week)</option>
                    <option className="bg-gray-900" value="MODERATELY_ACTIVE">Moderately Active (Moderate exercise 3-5 days/week)</option>
                    <option className="bg-gray-900" value="VERY_ACTIVE">Very Active (Hard exercise 6-7 days/week)</option>
                  </select>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial="enter"
                animate="center"
                exit="exit"
                variants={slideVariants}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-400 mb-3">
                    <Heart size={24} />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Diet & Medical</h2>
                  <p className="text-gray-400 text-sm mt-1">Specify dietary options to tailor meal recommendations.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Food Preferences</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['VEGETARIAN', 'VEGAN', 'EGGETARIAN', 'NON_VEGETARIAN'].map(pref => (
                      <button
                        key={pref}
                        onClick={() => handlePreferenceToggle(pref)}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          formData.foodPreferences.includes(pref)
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'border-white/10 hover:border-white/20 text-gray-400'
                        }`}
                      >
                        {pref.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Common Allergies</label>
                  <div className="flex flex-wrap gap-2">
                    {['Gluten', 'Dairy', 'Soy', 'Peanuts', 'Tree Nuts', 'Egg', 'Shellfish'].map(allergy => (
                      <button
                        key={allergy}
                        onClick={() => handleAllergyToggle(allergy)}
                        className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                          formData.foodAllergies.includes(allergy)
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                            : 'border-white/5 hover:border-white/10 text-gray-400'
                        }`}
                      >
                        {allergy}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial="enter"
                animate="center"
                exit="exit"
                variants={slideVariants}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-400 mb-3">
                    <Activity size={24} />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Lifestyle & Conditions</h2>
                  <p className="text-gray-400 text-sm mt-1">Are there any medical conditions we should consider?</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Lifestyle description</label>
                  <textarea
                    value={formData.lifestyle}
                    onChange={e => setFormData({ ...formData, lifestyle: e.target.value })}
                    placeholder="E.g. desk job, stands all day, travels frequently..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 h-24 resize-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Medical Conditions</label>
                  <div className="flex flex-wrap gap-2">
                    {['Diabetes', 'Hypertension', 'Thyroid', 'PCOS', 'High Cholesterol'].map(condition => (
                      <button
                        key={condition}
                        onClick={() => handleMedicalToggle(condition)}
                        className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                          formData.medicalConditions.includes(condition)
                            ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                            : 'border-white/5 hover:border-white/10 text-gray-400'
                        }`}
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial="enter"
                animate="center"
                exit="exit"
                variants={slideVariants}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mb-3">
                    <Globe size={24} />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Localization & System</h2>
                  <p className="text-gray-400 text-sm mt-1">Configure your preference settings for units and region.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={e => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50"
                    >
                      <option className="bg-gray-900" value="EST">EST (UTC-5)</option>
                      <option className="bg-gray-900" value="PST">PST (UTC-8)</option>
                      <option className="bg-gray-900" value="GMT">GMT (UTC+0)</option>
                      <option className="bg-gray-900" value="CET">CET (UTC+1)</option>
                      <option className="bg-gray-900" value="IST">IST (UTC+5:30)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Measurement System</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setFormData({ ...formData, units: 'metric' })}
                      className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                        formData.units === 'metric'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'border-white/10 hover:border-white/20 text-gray-400'
                      }`}
                    >
                      Metric (kg, cm, ml)
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, units: 'imperial' })}
                      className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                        formData.units === 'imperial'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'border-white/10 hover:border-white/20 text-gray-400'
                      }`}
                    >
                      Imperial (lbs, ft/in, fl oz)
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-10 pt-4 border-t border-white/5">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`px-5 py-2.5 rounded-xl border border-white/5 text-sm font-semibold transition-all ${
                step === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/5 hover:border-white/10'
              }`}
            >
              Back
            </button>
            {step < 5 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all text-white"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all text-white animate-pulse"
              >
                Launch HealthSphere
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
