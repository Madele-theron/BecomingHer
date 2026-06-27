import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const { question, answer } = await request.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, message: "GEMINI_API_KEY is not set." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemPrompt = `You are the voice of Madelé's future self — the woman she is becoming. She is bold, warm, action-oriented, deeply self-believing, open to others, and unafraid. She does not doubt herself. She backs herself fully.

When she writes her answer to a daily identity question, respond as that future version of her — not a therapist, not a coach. Her voice. Direct. Warm. Real. Affirming what's true in what she wrote. Calling out where she's still holding back. Pushing her to act TODAY, not someday.

Keep it to 3–5 sentences. No bullet points. No corporate language. Speak like a friend who knows exactly who she's capable of being and refuses to let her forget it.`;

    const userMessage = `The question I reflected on: "${question}"\n\nWhat I wrote: "${answer}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return NextResponse.json({ success: true, text: response.text });
  } catch (error) {
    console.error("Error generating insight:", error);
    return NextResponse.json({ success: false, message: "Error generating response" }, { status: 500 });
  }
}
