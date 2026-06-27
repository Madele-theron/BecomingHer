import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const affirmations = await prisma.customAffirmation.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json({ success: true, data: affirmations });
  } catch (error) {
    console.error("Error fetching custom affirmations:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, category } = body;
    
    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json({ success: false, message: "Text is required" }, { status: 400 });
    }

    const newAffirmation = await prisma.customAffirmation.create({
      data: { 
        text: text.trim(),
        category: category?.trim() || "General"
      }
    });

    return NextResponse.json({ success: true, data: newAffirmation });
  } catch (error) {
    console.error("Error creating custom affirmation:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
