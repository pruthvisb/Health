'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { storage } from '../utils/storage';
import { Download, Sparkles, TrendingDown, HelpCircle, Check, Award } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ReportsView() {
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const [profile] = useState(storage.getProfile());
  const [weights] = useState(storage.getWeightLogs());
  const [foods] = useState(storage.getFoodLogs());
  const [waters] = useState(storage.getWaterLogs());
  const [workouts] = useState(storage.getWorkoutLogs());

  // Report statistics
  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : profile.currentWeight;
  const initialWeight = weights.length > 0 ? weights[0].weight : profile.currentWeight;
  const lostWeight = (initialWeight - latestWeight).toFixed(1);

  const getAvgCalories = () => {
    const periodDays = reportType === 'weekly' ? 7 : 30;
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - periodDays);
    const filtered = foods.filter(f => new Date(f.loggedAt) >= limitDate);
    if (filtered.length === 0) return 0;
    const total = filtered.reduce((sum, f) => sum + f.calories, 0);
    return Math.round(total / periodDays);
  };

  const getAvgProtein = () => {
    const periodDays = reportType === 'weekly' ? 7 : 30;
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - periodDays);
    const filtered = foods.filter(f => new Date(f.loggedAt) >= limitDate);
    if (filtered.length === 0) return 0;
    const total = filtered.reduce((sum, f) => sum + f.protein, 0);
    return Math.round(total / periodDays);
  };

  const getAvgWater = () => {
    const periodDays = reportType === 'weekly' ? 7 : 30;
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - periodDays);
    const filtered = waters.filter(w => new Date(w.loggedAt) >= limitDate);
    if (filtered.length === 0) return 0;
    const total = filtered.reduce((sum, w) => sum + w.amountMl, 0);
    return Math.round(total / periodDays);
  };

  const avgCalories = getAvgCalories();
  const avgProtein = getAvgProtein();
  const avgWater = getAvgWater();

  // Dynamic Scores
  const calculateScores = () => {
    const targetCals = profile.goalWeight < profile.currentWeight ? 2000 : 2500;
    
    // Nutrition Score
    let nutrition = 0;
    if (avgCalories > 0) {
      const calDiff = Math.abs(avgCalories - targetCals);
      nutrition = Math.max(30, 100 - Math.round(calDiff / 10));
    }
    
    // Hydration Score
    const hydration = avgWater > 0 ? Math.min(100, Math.round((avgWater / 2500) * 100)) : 0;
    
    // Sleep Score
    const periodDays = reportType === 'weekly' ? 7 : 30;
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - periodDays);
    const sleepLogs = storage.getSleepLogs();
    const filteredSleep = sleepLogs.filter(s => new Date(s.loggedAt) >= limitDate);
    const avgSleep = filteredSleep.length > 0 
      ? filteredSleep.reduce((sum, s) => sum + s.durationHours, 0) / filteredSleep.length
      : 0;
    const sleepScore = avgSleep > 0 ? Math.min(100, Math.round((avgSleep / 8) * 100)) : 0;

    // Activity Score
    const filteredWorkouts = workouts.filter(w => new Date(w.loggedAt) >= limitDate);
    const activityScore = Math.min(100, filteredWorkouts.length * 20); // 5 sessions = 100%

    // Health Score
    const activeMetrics = [nutrition, hydration, sleepScore, activityScore].filter(val => val > 0);
    const health = activeMetrics.length > 0 
      ? Math.round(activeMetrics.reduce((s, v) => s + v, 0) / activeMetrics.length)
      : 0;

    return { health, nutrition, hydration, sleepScore, activityScore };
  };

  const dynamicScores = calculateScores();

  const scores = [
    { label: "Health Score", value: dynamicScores.health, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
    { label: "Nutrition Score", value: dynamicScores.nutrition, color: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
    { label: "Hydration Score", value: dynamicScores.hydration, color: "text-sky-400 border-sky-500/20 bg-sky-500/10" },
    { label: "Sleep Score", value: dynamicScores.sleepScore, color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10" },
    { label: "Activity Score", value: dynamicScores.activityScore, color: "text-red-400 border-red-500/20 bg-red-500/10" }
  ];
  
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#050508'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 size width in mm
      const pageHeight = 295; // A4 size height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`healthsphere-ai-${reportType}-report.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Configuration Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">AI Diagnostic Reports</h2>
          <p className="text-xs text-gray-400 mt-0.5">Synthesize health telemetry into clinical-grade summaries.</p>
        </div>

        <div className="flex gap-2">
          {/* Selector */}
          <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl">
            <button
              onClick={() => setReportType('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                reportType === 'weekly' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                reportType === 'monthly' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-xl text-xs font-bold text-white hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={14} />
            )}
            Export PDF
          </button>
        </div>
      </div>

      {/* Printable Report Content Container */}
      <div 
        ref={reportRef} 
        className="glass-panel p-8 rounded-3xl space-y-6 border border-white/10 relative overflow-hidden"
        style={{ contentVisibility: 'auto' }}
      >
        {/* Background Radial Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-bl-full pointer-events-none" />

        {/* Brand Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">HealthSphere AI Engine v1.4</span>
            <h3 className="text-2xl font-black text-white tracking-tight mt-1">
              {reportType === 'weekly' ? 'Weekly Diagnostic Audit' : 'Monthly Performance Report'}
            </h3>
            <p className="text-xxs text-gray-500 mt-0.5">
              Period: {reportType === 'weekly' ? 'July 07 - July 14, 2026' : 'June 14 - July 14, 2026'}
            </p>
          </div>
          
          <div className="text-right">
            <h4 className="text-base font-extrabold text-white">Client Summary</h4>
            <p className="text-xs text-gray-400 mt-0.5">{profile.gender}, {profile.age} Yrs | {profile.height} cm</p>
          </div>
        </div>

        {/* Scores Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {scores.map((s, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border text-center ${s.color}`}>
              <div className="text-xxs uppercase tracking-wider font-semibold opacity-70">{s.label}</div>
              <div className="text-3xl font-black mt-2">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Report Stats Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-b border-white/5 py-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <TrendingDown size={16} className="text-rose-400" />
              Weight & Caloric Metrics
            </h4>
            
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Total weight lost:</span>
                <span className="font-semibold text-emerald-400">-{lostWeight} kg</span>
              </div>
              <div className="flex justify-between">
                <span>Daily Average Calories:</span>
                <span className="font-semibold text-white">{avgCalories} kcal</span>
              </div>
              <div className="flex justify-between">
                <span>Daily Average Protein:</span>
                <span className="font-semibold text-white">{avgProtein}g</span>
              </div>
              <div className="flex justify-between">
                <span>Water Average:</span>
                <span className="font-semibold text-white">{avgWater} ml</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Award size={16} className="text-yellow-400" />
              Milestone Accomplishments
            </h4>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>Completed {workouts.length} active sessions</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Check size={14} className={avgWater >= 2000 ? "text-emerald-400 shrink-0" : "text-gray-600 shrink-0"} />
                <span>{avgWater >= 2000 ? "Unlocked 'Hydration Hero' badge" : "Hydration average: target 2.0L+ daily to unlock badge"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Check size={14} className={avgCalories > 0 ? "text-emerald-400 shrink-0" : "text-gray-600 shrink-0"} />
                <span>{avgCalories > 0 ? "Maintained structured nutrition logs" : "Goal: start logging daily calorie targets"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl space-y-3">
          <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
            <Sparkles size={16} />
            AI Diagnostic Suggestions
          </h4>

          <div className="text-xs text-gray-300 space-y-2.5 leading-relaxed">
            <p>
              <strong>1. Caloric Deficit Focus:</strong> {avgCalories > 0 
                ? `You logged an average intake of ${avgCalories} kcal/day. Keep tracking meals consistently to stay within your targets.` 
                : 'No calorie data has been logged. Use the food scanner tool to record your breakfast, lunch, and dinner.'}
            </p>
            <p>
              <strong>2. Hydration Efficiency:</strong> {avgWater > 0 
                ? `Excellent hydration profile with an average of ${avgWater} ml/day. Maintaining water intake keeps metabolic rate high.` 
                : 'No water logs found. Aim to consume at least 2.5L daily to optimize cognitive performance.'}
            </p>
            <p>
              <strong>3. Protein Deficiency Warning:</strong> {avgProtein > 0 
                ? `Protein intake averaged ${avgProtein}g. Ensure you hit your target protein of ${Math.round(profile.currentWeight * 2)}g to assist muscle recovery.` 
                : `Protein tracking is inactive. Aim for 1.6-2g of protein per kg of bodyweight (${Math.round(profile.currentWeight * 2)}g daily).`}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xxs text-gray-600 border-t border-white/5 pt-4">
          This document is generated automatically by HealthSphere AI based on encrypted local telemetry logs.
        </div>

      </div>

    </div>
  );
}
