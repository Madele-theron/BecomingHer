import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const { others, win, gap, tomorrow } = await request.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, message: "GEMINI_API_KEY is not set." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemPrompt = `You are the voice of Madelé's future self — the woman she is becoming. Confident, warm, unafraid, action-oriented, and genuinely other-focused. She gives freely. She notices people. She is honest with herself about when she falls short — but she doesn't wallow, she just corrects and moves forward.

When she closes her day, give her a single closing thought — 2–3 sentences max. Acknowledge where she showed up — for herself AND for others. Name the truth about where the old version still had power, without judgment. And send her to sleep knowing tomorrow she gets to try again as her.

No bullet points. No headers. Plain, direct, warm.`;

    const userMessage = `Where she showed up for someone else today: "${others || 'not recorded'}"\nWhere she showed up today: "${win || 'not recorded'}"\nWhere the old version pulled her back: "${gap || 'not recorded'}"\nWhat she'll do differently tomorrow: "${tomorrow || 'not recorded'}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return NextResponse.json({ success: true, text: response.text });
  } catch (error) {
    console.error("Error generating closing thought:", error);
    return NextResponse.json({ success: false, message: "Error generating response" }, { status: 500 });
  }
}
