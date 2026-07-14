import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const key = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(key);
  }

  async classifyMeal(base64Image: string, mimeType: string) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are a clinical nutritionist AI. Analyze this image of a meal and estimate:
1. Food Name
2. Ingredients list
3. Estimated weight in grams
4. Calories (kcal)
5. Protein (g)
6. Fat (g)
7. Carbs (g)
8. Confidence score (0-1)

Return ONLY a valid raw JSON object matching the following structure (no markdown tags, no \`\`\`json wrappers, just raw JSON):
{
  "foodName": "string",
  "ingredients": ["string"],
  "weightGrams": number,
  "calories": number,
  "protein": number,
  "fat": number,
  "carbs": number,
  "confidence": number
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      }
    ]);

    const text = result.response.text().trim();
    let jsonString = text;
    if (jsonString.startsWith('```json')) jsonString = jsonString.substring(7);
    if (jsonString.endsWith('```')) jsonString = jsonString.substring(0, jsonString.length - 3);
    
    return JSON.parse(jsonString.trim());
  }

  async chatCoach(messages: any[]) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const formattedContents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const systemPrompt = `You are 'HealthSphere Coach', a clinical nutritionist, certified personal trainer, and behavior therapist. 
Your tone is supportive, scientific, yet empathetic. Use bullet points and clean structure.
Give actionable advice. Never make medical diagnoses. Keep responses under 250 words.`;

    formattedContents.unshift(
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I will act as HealthSphere Coach.' }] }
    );

    const result = await model.generateContent({
      contents: formattedContents
    });

    return { reply: result.response.text() };
  }
}
