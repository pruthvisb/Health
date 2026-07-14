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

  const avgCalories = 1940;
  const avgProtein = 94;
  const avgWater = 2100;
  
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

  const scores = [
    { label: "Health Score", value: 85, color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
    { label: "Nutrition Score", value: 78, color: "text-amber-400 border-amber-500/20 bg-amber-500/10" },
    { label: "Hydration Score", value: 92, color: "text-sky-400 border-sky-500/20 bg-sky-500/10" },
    { label: "Sleep Score", value: 82, color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10" },
    { label: "Activity Score", value: 88, color: "text-red-400 border-red-500/20 bg-red-500/10" }
  ];

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
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>Unlocked 'Hydration Hero' badge</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>Maintained calorie deficit 6 out of 7 days</span>
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
              <strong>1. Cardio deficit adjustment:</strong> You logged an average deficit of 420 kcal/day. Weight loss is currently trending at ~0.45kg/week, which is extremely healthy and sustainable.
            </p>
            <p>
              <strong>2. Hydration:</strong> Excellent hydration profile! Your sleep quality matches days with higher water intake. Try to maintain the 2.5L volume.
            </p>
            <p>
              <strong>3. Protein Deficiency Warning:</strong> Protein intake hovered around 94g, slightly below your optimal target of {Math.round(profile.currentWeight * 2)}g. Consider adding Greek yogurt or egg whites to breakfast to boost amino acid retention.
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
