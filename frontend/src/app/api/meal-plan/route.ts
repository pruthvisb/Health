import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { calories, protein, budget, preference, goal } = await req.json();

    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    // Use gemini-2.5-flash which we verified is working
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a clinical dietitian AI. Generate a customized daily meal plan matching these specifications:
- Daily Calorie Target: ${calories || 2000} kcal
- Daily Protein Target: ${protein || 120} g
- Budget Tier: ${budget || 'medium'}
- Diet Preference: ${preference || 'NON_VEGETARIAN'} (e.g., VEGAN, VEGETARIAN, EGGETARIAN, NON_VEGETARIAN)
- Goal: ${goal || 'lose weight'}

Provide exactly 4 meal segments: breakfast, lunch, dinner, and snack.
Keep ingredients practical and easy to cook.
Calculate macros (protein, fat, carbs in grams) and calories accurately. 

Return ONLY a valid raw JSON object matching the following structure (no markdown tags, no \`\`\`json wrappers, just raw JSON):
{
  "breakfast": {
    "name": "string",
    "calories": number,
    "protein": number,
    "fat": number,
    "carbs": number,
    "ingredients": [
      { "name": "string", "amount": "string", "category": "string" }
    ]
  },
  "lunch": {
    "name": "string",
    "calories": number,
    "protein": number,
    "fat": number,
    "carbs": number,
    "ingredients": [
      { "name": "string", "amount": "string", "category": "string" }
    ]
  },
  "dinner": {
    "name": "string",
    "calories": number,
    "protein": number,
    "fat": number,
    "carbs": number,
    "ingredients": [
      { "name": "string", "amount": "string", "category": "string" }
    ]
  },
  "snack": {
    "name": "string",
    "calories": number,
    "protein": number,
    "fat": number,
    "carbs": number,
    "ingredients": [
      { "name": "string", "amount": "string", "category": "string" }
    ]
  }
}

Use categories for ingredients: Produce, Proteins, Dairy/Alternatives, Grains, Pantry.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    let jsonString = responseText;
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.substring(7);
    }
    if (jsonString.endsWith('```')) {
      jsonString = jsonString.substring(0, jsonString.length - 3);
    }
    jsonString = jsonString.trim();

    try {
      const parsedPlan = JSON.parse(jsonString);
      return NextResponse.json(parsedPlan);
    } catch (parseError) {
      console.error('Failed to parse Gemini Meal Plan output:', responseText, parseError);
      return NextResponse.json({ error: 'Failed to generate clean plan format' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Gemini Meal Plan API Error:', error);
    return NextResponse.json({ error: 'Failed to communicate with AI model' }, { status: 500 });
  }
}
