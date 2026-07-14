'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { storage } from '../utils/storage';
import { Sparkles, ShoppingBag, DollarSign, Check, ListChecks, ArrowRight } from 'lucide-react';

interface Meal {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  ingredients: { name: string; amount: string; category: string }[];
}

interface MealPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
}

const VEGETARIAN_MEALS: MealPlan = {
  breakfast: {
    name: "Chia Seed Berry Pudding with Almonds",
    calories: 320, protein: 10, fat: 12, carbs: 42,
    ingredients: [
      { name: "Chia Seeds", amount: "3 tbsp", category: "Pantry" },
      { name: "Almond Milk", amount: "1 cup", category: "Dairy/Alternatives" },
      { name: "Mixed Berries", amount: "50g", category: "Produce" },
      { name: "Slivered Almonds", amount: "15g", category: "Pantry" }
    ]
  },
  lunch: {
    name: "Mediterranean Chickpea & Hummus Wrap",
    calories: 480, protein: 16, fat: 14, carbs: 68,
    ingredients: [
      { name: "Whole Wheat Wrap", amount: "1 large", category: "Grains" },
      { name: "Canned Chickpeas", amount: "100g", category: "Pantry" },
      { name: "Hummus", amount: "2 tbsp", category: "Pantry" },
      { name: "Cucumber & Spinach", amount: "50g", category: "Produce" }
    ]
  },
  dinner: {
    name: "Lentil Pasta with Roasted Tomato Pesto",
    calories: 580, protein: 25, fat: 16, carbs: 80,
    ingredients: [
      { name: "Lentil Penne Pasta", amount: "80g dry", category: "Grains" },
      { name: "Cherry Tomatoes", amount: "100g", category: "Produce" },
      { name: "Basil Pesto Sauce", amount: "2 tbsp", category: "Pantry" },
      { name: "Parmesan Cheese (Vegan option available)", amount: "15g", category: "Dairy/Alternatives" }
    ]
  },
  snack: {
    name: "Apple Slices with Natural Peanut Butter",
    calories: 210, protein: 5, fat: 14, carbs: 24,
    ingredients: [
      { name: "Red Apple", amount: "1 medium", category: "Produce" },
      { name: "Peanut Butter", amount: "1.5 tbsp", category: "Pantry" }
    ]
  }
};

const NON_VEG_MEALS: MealPlan = {
  breakfast: {
    name: "High Protein Egg & Egg White Scramble",
    calories: 360, protein: 28, fat: 18, carbs: 12,
    ingredients: [
      { name: "Whole Eggs", amount: "2 large", category: "Dairy/Alternatives" },
      { name: "Egg Whites", amount: "100ml", category: "Dairy/Alternatives" },
      { name: "Baby Spinach", amount: "50g", category: "Produce" },
      { name: "Feta Cheese", amount: "20g", category: "Dairy/Alternatives" }
    ]
  },
  lunch: {
    name: "Grilled Herb Chicken Breast with Brown Rice",
    calories: 520, protein: 42, fat: 8, carbs: 46,
    ingredients: [
      { name: "Chicken Breast", amount: "150g", category: "Proteins" },
      { name: "Brown Rice", amount: "120g cooked", category: "Grains" },
      { name: "Broccoli florets", amount: "80g", category: "Produce" },
      { name: "Olive oil", amount: "1 tsp", category: "Pantry" }
    ]
  },
  dinner: {
    name: "Pan-Seared Salmon over Quinoa & Roasted Asparagus",
    calories: 620, protein: 38, fat: 24, carbs: 54,
    ingredients: [
      { name: "Salmon Fillet", amount: "150g", category: "Proteins" },
      { name: "Quinoa", amount: "100g cooked", category: "Grains" },
      { name: "Asparagus spears", amount: "100g", category: "Produce" },
      { name: "Lemon & Garlic", amount: "1 pc", category: "Produce" }
    ]
  },
  snack: {
    name: "Low Fat Greek Yogurt with Almonds & Honey",
    calories: 190, protein: 17, fat: 5, carbs: 18,
    ingredients: [
      { name: "Greek Yogurt Plain", amount: "150g", category: "Dairy/Alternatives" },
      { name: "Raw Almonds", amount: "10 pcs", category: "Pantry" },
      { name: "Organic Honey", amount: "1 tsp", category: "Pantry" }
    ]
  }
};

export default function MealPlannerView() {
  const [profile] = useState(storage.getProfile());
  const [targetCals, setTargetCals] = useState('2000');
  const [proteinTarget, setProteinTarget] = useState('120');
  const [budget, setBudget] = useState<'low' | 'medium' | 'premium'>('medium');
  const [dietPref, setDietPref] = useState(profile.foodPreferences[0] || 'NON_VEGETARIAN');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null);
  
  // Shopping list items crossed off state
  const [shoppingItems, setShoppingItems] = useState<{ name: string; category: string; checked: boolean }[]>([]);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calories: parseInt(targetCals) || 2000,
          protein: parseInt(proteinTarget) || 120,
          budget,
          preference: dietPref,
          goal: profile.goalWeight < profile.currentWeight ? 'lose weight' : 'gain muscle'
        })
      });
      
      if (!res.ok) throw new Error('API request failed');
      const plan = await res.json() as MealPlan;
      setCurrentPlan(plan);

      // Create a flat shopping list
      const itemsList: { name: string; category: string; checked: boolean }[] = [];
      const meals: (keyof MealPlan)[] = ['breakfast', 'lunch', 'dinner', 'snack'];
      meals.forEach(m => {
        if (plan[m] && plan[m].ingredients) {
          plan[m].ingredients.forEach(ing => {
            itemsList.push({ name: `${ing.name} (${ing.amount})`, category: ing.category, checked: false });
          });
        }
      });
      setShoppingItems(itemsList);
    } catch (err) {
      console.error('Failed to generate AI plan, falling back to cached preset:', err);
      // Fallback
      const plan = dietPref.includes('VEG') || dietPref === 'VEGETARIAN' || dietPref === 'VEGAN'
        ? VEGETARIAN_MEALS
        : NON_VEG_MEALS;
        
      setCurrentPlan(plan);

      const itemsList: { name: string; category: string; checked: boolean }[] = [];
      const meals: (keyof MealPlan)[] = ['breakfast', 'lunch', 'dinner', 'snack'];
      meals.forEach(m => {
        plan[m].ingredients.forEach(ing => {
          itemsList.push({ name: `${ing.name} (${ing.amount})`, category: ing.category, checked: false });
        });
      });
      setShoppingItems(itemsList);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleShoppingItem = (index: number) => {
    setShoppingItems(prev => prev.map((item, idx) => 
      idx === index ? { ...item, checked: !item.checked } : item
    ));
  };

  return (
    <div className="space-y-6">
      
      {/* Prefs Configuration Form */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Sparkles size={16} className="text-emerald-400" />
          AI Meal Planner Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase font-medium">Daily Calorie Target</label>
            <input
              type="number"
              value={targetCals}
              onChange={e => setTargetCals(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase font-medium">Protein Target (g)</label>
            <input
              type="number"
              value={proteinTarget}
              onChange={e => setProteinTarget(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase font-medium">Weekly Budget</label>
            <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-xl">
              {(['low', 'medium', 'premium'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setBudget(b)}
                  className={`flex-1 py-2 rounded-lg text-xxs font-bold uppercase transition-all ${
                    budget === b ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase font-medium">Dietary Pref</label>
            <select
              value={dietPref}
              onChange={e => setDietPref(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs outline-none focus:border-emerald-500/50"
            >
              <option className="bg-gray-900" value="NON_VEGETARIAN">Non Vegetarian</option>
              <option className="bg-gray-900" value="VEGETARIAN">Vegetarian</option>
              <option className="bg-gray-900" value="VEGAN">Vegan</option>
              <option className="bg-gray-900" value="EGGETARIAN">Eggitarian</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGeneratePlan}
          className="w-full mt-5 py-3 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:shadow-lg hover:shadow-emerald-500/20 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        >
          <Sparkles size={14} /> Generate Customized Plan
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Meal Blocks */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="wait">
            {isGenerating && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-12 text-center space-y-4"
              >
                <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-white">AI Compiling Dietary Plan...</h4>
                <p className="text-xs text-gray-400">Balancing macronutrients, selecting seasonal recipes, and mapping grocery costs.</p>
              </motion.div>
            )}

            {!isGenerating && currentPlan && (
              <motion.div 
                key="plan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Meal list cards */}
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(mealKey => {
                  const m = currentPlan[mealKey];
                  return (
                    <div key={mealKey} className="glass-card p-5 hover:border-emerald-500/20 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <span className="text-xxs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-bold uppercase tracking-wider">
                          {mealKey}
                        </span>
                        <h4 className="text-base font-bold text-white mt-2">{m.name}</h4>
                        <div className="flex flex-wrap gap-2 text-xxs text-gray-400 mt-1">
                          <span>Calories: {m.calories} kcal</span>
                          <span>|</span>
                          <span>Protein: {m.protein}g</span>
                          <span>|</span>
                          <span>Carbs: {m.carbs}g</span>
                          <span>|</span>
                          <span>Fat: {m.fat}g</span>
                        </div>
                      </div>

                      {/* Ingredient tags */}
                      <div className="flex flex-wrap gap-1 sm:max-w-[200px] justify-start sm:justify-end">
                        {m.ingredients.map((ing, idx) => (
                          <span key={idx} className="bg-white/5 border border-white/5 px-2 py-0.5 rounded text-xxs text-gray-300">
                            {ing.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {!isGenerating && !currentPlan && (
              <div className="glass-card p-12 text-center text-sm text-gray-500 italic">
                No active meal plan generated. Select preferences and generate your first menu!
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Shopping List */}
        <div>
          <div className="glass-card p-6 min-h-[400px] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-white/5 pb-2">
                <ShoppingBag size={16} className="text-indigo-400" />
                Plan Shopping List
              </h3>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {shoppingItems.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => toggleShoppingItem(idx)}
                    className="w-full flex items-center gap-3 text-left py-2 hover:bg-white/5 px-2 rounded-lg transition-colors"
                  >
                    <div className={`w-4.5 h-4.5 border rounded flex items-center justify-center transition-all ${
                      item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/20'
                    }`}>
                      {item.checked && <Check size={10} />}
                    </div>
                    <div>
                      <span className={`text-xs ${item.checked ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {item.name}
                      </span>
                      <span className="block text-xxs text-gray-500 uppercase tracking-wider mt-0.5">{item.category}</span>
                    </div>
                  </button>
                ))}
                {shoppingItems.length === 0 && (
                  <div className="text-xs text-gray-500 italic text-center py-12">
                    Generate a meal plan to populate your weekly grocery list.
                  </div>
                )}
              </div>
            </div>

            {shoppingItems.length > 0 && (
              <div className="text-xxs text-gray-500 italic border-t border-white/5 pt-3 mt-3 text-center">
                *Tick off items as you buy them at the store.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
