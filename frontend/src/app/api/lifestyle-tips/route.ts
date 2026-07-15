import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json();

    if (!profile) {
      return NextResponse.json({ error: 'Profile is required' }, { status: 400 });
    }

    const {
      age,
      gender,
      height,
      currentWeight,
      goalWeight,
      activityLevel,
      foodPreferences,
      medicalConditions,
      lifestyle
    } = profile;

    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a certified health coach, clinical nutritionist, and behavior therapist. 
Analyze this user profile and provide 3 highly customized, actionable, and specific lifestyle recommendations. 
Pay close attention to the user's specific "Lifestyle Description" to give practical advice.

User Profile:
- Age: ${age || 30} years old
- Gender: ${gender || 'Other'}
- Height: ${height || 175} cm
- Current Weight: ${currentWeight || 70} kg
- Goal Weight: ${goalWeight || 65} kg
- Activity Level: ${activityLevel || 'MODERATELY_ACTIVE'}
- Food Preferences: ${foodPreferences?.join(', ') || 'None specified'}
- Medical Conditions: ${medicalConditions?.join(', ') || 'None specified'}
- User's Custom Lifestyle Description: "${lifestyle || 'desk job, stands all day, travels frequently'}"

Provide the response as a JSON array of objects (exactly 3 objects). Each object must have:
1. "title": A short bold title (e.g. "Active Desk Breaks", "High-Protein Travel Packets")
2. "tip": The actual recommendation sentence (tailored to their desk job/travel/etc. under 35 words)
3. "category": A category string (choose from: "Activity", "Nutrition", "Habit", "Recovery")

Return ONLY a valid raw JSON array (no markdown code blocks, no \`\`\`json wrappers, just raw JSON).`;

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
      const parsedTips = JSON.parse(jsonString);
      return NextResponse.json(parsedTips);
    } catch (parseError) {
      console.error('Failed to parse Gemini Lifestyle Tips output:', responseText, parseError);
      return NextResponse.json({ error: 'Failed to generate clean tips format' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Gemini Lifestyle Tips API Error:', error);
    return NextResponse.json({ error: 'Failed to communicate with AI model' }, { status: 500 });
  }
}
