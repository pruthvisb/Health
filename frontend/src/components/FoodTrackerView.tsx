'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { storage, FoodLog } from '../utils/storage';
import { 
  Search, Camera, Barcode, Plus, Trash2, 
  Sparkles, Check, Edit2, AlertCircle, Apple 
} from 'lucide-react';

interface FoodTrackerViewProps {
  onRefresh: () => void;
}

const FOOD_DATABASE = [
  { foodName: "Grilled Chicken Breast (100g)", calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0, sugar: 0, sodium: 74 },
  { foodName: "Whole Boiled Egg", calories: 78, protein: 6.3, fat: 5.3, carbs: 0.6, fiber: 0, sugar: 0.6, sodium: 62 },
  { foodName: "Brown Rice Cooked (1 cup)", calories: 216, protein: 5, fat: 1.8, carbs: 45, fiber: 3.5, sugar: 0.5, sodium: 10 },
  { foodName: "Peanut Butter (2 tbsp)", calories: 188, protein: 8, fat: 16, carbs: 6, fiber: 2, sugar: 3, sodium: 152 },
  { foodName: "Organic Banana", calories: 105, protein: 1.3, fat: 0.3, carbs: 27, fiber: 3, fontAwesome: 14, sugar: 14, sodium: 1 },
  { foodName: "Grilled Salmon (150g)", calories: 300, protein: 34, fat: 18, carbs: 0, fiber: 0, sugar: 0, sodium: 90 },
  { foodName: "Mixed Garden Salad", calories: 45, protein: 1.5, fat: 0.2, carbs: 9, fiber: 3.2, sugar: 4, sodium: 45 },
  { foodName: "Greek Yogurt Plain (150g)", calories: 120, protein: 15, fat: 2, carbs: 6, fiber: 0, sugar: 4, sodium: 60 },
  { foodName: "Rolled Oats (50g)", calories: 190, protein: 7, fat: 3.5, carbs: 32, fiber: 5, sugar: 1, sodium: 2 }
];

export default function FoodTrackerView({ onRefresh }: FoodTrackerViewProps) {
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof FOOD_DATABASE>([]);
  const [mealType, setMealType] = useState<FoodLog['mealType']>('BREAKFAST');
  
  // Barcode Mock
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [scanningBarcode, setScanningBarcode] = useState(false);

  // AI Image upload states
  const [isClassifying, setIsClassifying] = useState(false);
  const [classifiedMeal, setClassifiedMeal] = useState<{
    foodName: string;
    ingredients: string[];
    weightGrams: number;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    confidence: number;
  } | null>(null);

  useEffect(() => {
    setLogs(storage.getFoodLogs());
  }, []);

  const refreshLocalLogs = () => {
    setLogs(storage.getFoodLogs());
    onRefresh();
  };

  // Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const filtered = FOOD_DATABASE.filter(f => 
      f.foodName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchQuery]);

  const handleAddDirectFood = (food: typeof FOOD_DATABASE[0]) => {
    storage.addFoodLog({
      mealType,
      foodName: food.foodName,
      calories: food.calories,
      protein: food.protein,
      fat: food.fat,
      carbs: food.carbs,
      fiber: food.fiber,
      sugar: food.sugar,
      sodium: food.sodium,
      ingredients: [food.foodName]
    });
    setSearchQuery('');
    refreshLocalLogs();
  };

  const handleDeleteFood = (id: string) => {
    storage.deleteFoodLog(id);
    refreshLocalLogs();
  };

  // Barcode mock trigger
  const triggerBarcodeScan = () => {
    setShowBarcodeScanner(true);
    setScanningBarcode(true);
    setTimeout(() => {
      setScanningBarcode(false);
      // Mock result
      const mockBarcodeFood = {
        foodName: "Premium Whey Protein Shake",
        calories: 140,
        protein: 26,
        fat: 1.5,
        carbs: 3,
        fiber: 1,
        sugar: 1,
        sodium: 180,
      };
      storage.addFoodLog({
        mealType: 'SNACK',
        foodName: mockBarcodeFood.foodName,
        calories: mockBarcodeFood.calories,
        protein: mockBarcodeFood.protein,
        fat: mockBarcodeFood.fat,
        carbs: mockBarcodeFood.carbs,
        fiber: mockBarcodeFood.fiber,
        sugar: mockBarcodeFood.sugar,
        sodium: mockBarcodeFood.sodium,
        ingredients: ["Whey Protein Concentrate", "Cocoa Powder", "Natural Sweetener"]
      });
      refreshLocalLogs();
      setTimeout(() => setShowBarcodeScanner(false), 800);
    }, 2000);
  };

  // AI classification upload trigger
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsClassifying(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        body
      });
      const data = await res.json();
      setClassifiedMeal(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSaveClassifiedMeal = () => {
    if (!classifiedMeal) return;
    storage.addFoodLog({
      mealType,
      foodName: classifiedMeal.foodName,
      calories: classifiedMeal.calories,
      protein: classifiedMeal.protein,
      fat: classifiedMeal.fat,
      carbs: classifiedMeal.carbs,
      fiber: 2.5, // approximate
      sugar: 4.0, // approximate
      sodium: 380, // approximate
      ingredients: classifiedMeal.ingredients,
      weightGrams: classifiedMeal.weightGrams,
      confidence: classifiedMeal.confidence
    });
    setClassifiedMeal(null);
    refreshLocalLogs();
  };

  // Calories stats
  const { consumed, remaining, target } = storage.getTodayCalories();

  // Nutrition Score formula (simplified)
  const calculateNutritionScore = () => {
    const today = new Date().toDateString();
    const todayLogs = logs.filter(f => new Date(f.loggedAt).toDateString() === today);
    if (todayLogs.length === 0) return 100;

    let score = 100;
    let totalSugar = 0;
    let totalSodium = 0;
    let totalFiber = 0;
    let totalProtein = 0;

    todayLogs.forEach(f => {
      totalSugar += f.sugar || 0;
      totalSodium += f.sodium || 0;
      totalFiber += f.fiber || 0;
      totalProtein += f.protein;
    });

    // Penalties
    if (totalSugar > 50) score -= 15; // too much sugar
    if (totalSodium > 2300) score -= 15; // too much salt
    
    // Bonuses
    if (totalFiber >= 25) score += 10;
    if (totalProtein >= 75) score += 10;

    return Math.min(100, Math.max(0, score));
  };

  const nutritionScore = calculateNutritionScore();

  return (
    <div className="space-y-6">
      
      {/* Barcode scanner Overlay */}
      <AnimatePresence>
        {showBarcodeScanner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <div className="glass-panel max-w-sm w-full p-6 rounded-3xl text-center space-y-6 border border-sky-500/30">
              <h3 className="text-lg font-bold text-white">Scanning Barcode...</h3>
              <div className="relative w-48 h-32 border-2 border-dashed border-sky-400/40 rounded-xl mx-auto flex items-center justify-center overflow-hidden">
                {scanningBarcode ? (
                  <>
                    <motion.div 
                      className="absolute left-0 right-0 h-0.5 bg-sky-400"
                      animate={{ y: [-50, 50] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    />
                    <Barcode className="text-gray-500 animate-pulse" size={48} />
                  </>
                ) : (
                  <div className="flex flex-col items-center text-emerald-400">
                    <Check size={36} />
                    <span className="text-xs font-semibold mt-1">Logged!</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400">Point your camera at a barcode to automatically track prepackaged food.</p>
              <button 
                onClick={() => setShowBarcodeScanner(false)}
                className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Logging Inputs (Search, AI Upload, Barcode) */}
        <div className="space-y-6">
          
          {/* Quick Stats */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1">
              <Apple size={16} className="text-amber-500" />
              Daily Summary
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-3xl font-extrabold text-white">{consumed}</span>
                  <span className="text-gray-400 text-xs ml-1 uppercase">kcal logged</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-400">{remaining}</span>
                  <span className="text-gray-400 text-xs ml-1 uppercase">rem</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3">
                <span className="text-gray-400">Nutrition Score:</span>
                <span className={`font-bold px-2 py-0.5 rounded-full ${
                  nutritionScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                  nutritionScore >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {nutritionScore}/100
                </span>
              </div>
            </div>
          </div>

          {/* Search Card */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Search Food Database
            </h3>
            
            <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-xl mb-4">
              {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].map(type => (
                <button
                  key={type}
                  onClick={() => setMealType(type as any)}
                  className={`flex-1 py-1.5 rounded-lg text-xxs font-semibold uppercase transition-all ${
                    mealType === type
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {type.slice(0, 5)}
                </button>
              ))}
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search egg, chicken, salmon..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Results */}
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {searchResults.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg text-xs"
                >
                  <div>
                    <span className="font-semibold text-white">{item.foodName}</span>
                    <span className="text-gray-400 block mt-0.5">{item.calories} kcal | P: {item.protein}g | C: {item.carbs}g</span>
                  </div>
                  <button
                    onClick={() => handleAddDirectFood(item)}
                    className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-emerald-400"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))}
              {searchQuery && searchResults.length === 0 && (
                <div className="text-xs text-gray-500 italic text-center py-4">No matching foods found.</div>
              )}
            </div>
          </div>

          {/* AI Detection & Scanner */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Smart Log Assistants
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Image Recognition */}
              <label className="cursor-pointer flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl p-4 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-center">
                <Camera className="text-emerald-400 mb-2" size={24} />
                <span className="text-xs font-bold text-white">AI Photo Scan</span>
                <span className="text-xxs text-gray-400 mt-1">Upload meal photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Barcode scanner */}
              <button 
                onClick={triggerBarcodeScan}
                className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl p-4 hover:border-sky-500/40 hover:bg-sky-500/5 transition-all text-center"
              >
                <Barcode className="text-sky-400 mb-2" size={24} />
                <span className="text-xs font-bold text-white">Barcode Log</span>
                <span className="text-xxs text-gray-400 mt-1">Scan prepackaged</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Columns: logs List and AI Edit Dialog */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Detection Results Form */}
          <AnimatePresence>
            {isClassifying && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="glass-card p-6 border border-emerald-500/20 text-center space-y-3"
              >
                <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-white">AI Analyzing Food Image...</h4>
                <p className="text-xs text-gray-400">Classifying ingredients, estimating weights, and mapping macronutrient values.</p>
              </motion.div>
            )}

            {classifiedMeal && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="glass-card p-6 border border-emerald-500/20 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles size={16} /> AI Food Classification
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">Edit recognized details below before saving</p>
                  </div>
                  <span className="text-xxs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Confidence: {Math.round(classifiedMeal.confidence * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xxs text-gray-400 mb-1 uppercase font-semibold">Food Item</label>
                    <input 
                      type="text" 
                      value={classifiedMeal.foodName}
                      onChange={e => setClassifiedMeal({ ...classifiedMeal, foodName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs text-gray-400 mb-1 uppercase font-semibold">Weight (g)</label>
                    <input 
                      type="number" 
                      value={classifiedMeal.weightGrams}
                      onChange={e => setClassifiedMeal({ ...classifiedMeal, weightGrams: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-xxs text-gray-400 mb-1 uppercase font-semibold">Calories</label>
                    <input 
                      type="number" 
                      value={classifiedMeal.calories}
                      onChange={e => setClassifiedMeal({ ...classifiedMeal, calories: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs text-gray-400 mb-1 uppercase font-semibold">Protein (g)</label>
                    <input 
                      type="number" 
                      value={classifiedMeal.protein}
                      onChange={e => setClassifiedMeal({ ...classifiedMeal, protein: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs text-gray-400 mb-1 uppercase font-semibold">Fat (g)</label>
                    <input 
                      type="number" 
                      value={classifiedMeal.fat}
                      onChange={e => setClassifiedMeal({ ...classifiedMeal, fat: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs text-gray-400 mb-1 uppercase font-semibold">Carbs (g)</label>
                    <input 
                      type="number" 
                      value={classifiedMeal.carbs}
                      onChange={e => setClassifiedMeal({ ...classifiedMeal, carbs: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xxs text-gray-400 mb-1 uppercase font-semibold">Detected Ingredients</label>
                  <div className="flex flex-wrap gap-1.5">
                    {classifiedMeal.ingredients.map((ing, idx) => (
                      <span key={idx} className="bg-white/5 border border-white/5 px-2 py-1 rounded text-xxs text-gray-300">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setClassifiedMeal(null)}
                    className="flex-1 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveClassifiedMeal}
                    className="flex-1 py-2 bg-emerald-500 rounded-xl text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
                  >
                    Save Meal
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Daily Food Log list */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Today's Meals
            </h3>

            <div className="space-y-4">
              {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].map(type => {
                const typeLogs = logs.filter(l => 
                  l.mealType === type && new Date(l.loggedAt).toDateString() === new Date().toDateString()
                );
                
                return (
                  <div key={type} className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5 pb-1">
                      {type}
                    </h4>

                    {typeLogs.map(l => (
                      <div 
                        key={l.id} 
                        className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
                      >
                        <div>
                          <div className="text-sm font-bold text-white">{l.foodName}</div>
                          <div className="text-xxs text-gray-400 mt-0.5">
                            {l.calories} kcal | Protein: {l.protein}g | Carbs: {l.carbs}g | Fat: {l.fat}g
                          </div>
                          {l.ingredients && l.ingredients.length > 0 && (
                            <div className="text-xxs text-gray-500 mt-1 italic">
                              Ingredients: {l.ingredients.join(', ')}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteFood(l.id)}
                          className="p-1.5 hover:bg-rose-500/10 rounded-lg text-gray-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {typeLogs.length === 0 && (
                      <div className="text-xs text-gray-500 italic py-1 pl-2">No items logged.</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
