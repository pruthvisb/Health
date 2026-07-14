import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid message history' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Format chat history for Gemini API
    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Add system instruction as the initial user message prefix or system prompt config
    const systemPrompt = `You are 'HealthSphere Coach', a clinical nutritionist, certified personal trainer, and behavior therapist. 
Your tone is supportive, scientific, yet empathetic. Use bullet points and clean structure. 
You answer questions like:
- How much should I eat?
- Why is my weight increasing?
- Suggest healthier meals.
- Suggest exercise.
- Explain nutrition.
- Analyze food logs.
- Predict future progress.
- Provide daily motivation.

Give actionable advice. Never make medical diagnoses. If asked about medications, advise consulting a physician. Keep responses under 250 words for readability.`;

    // Unshift system prompt structure
    contents.unshift({
      role: 'user',
      parts: [{ text: systemPrompt }]
    }, {
      role: 'model',
      parts: [{ text: "Understood. I will act as HealthSphere Coach, providing scientific, empathetic, and structured nutrition and fitness advice." }]
    });

    const result = await model.generateContent({
      contents
    });

    const responseText = result.response.text();
    return NextResponse.json({ reply: responseText });

  } catch (error: any) {
    console.error('Gemini Chat API Error:', error);
    return NextResponse.json({
      reply: "I'm having a little trouble connecting to my cognitive center right now. However, based on general guidelines, to maintain fat loss, aim for a caloric deficit of 300-500 kcal, consume 1.6-2g of protein per kg of bodyweight, and drink at least 2.5L of water daily. How can I help you customize this goal?"
    });
  }
}
