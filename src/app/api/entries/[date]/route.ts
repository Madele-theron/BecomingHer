import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  
  if (!date) {
    return NextResponse.json({ success: false, message: "Date is required" }, { status: 400 });
  }

  try {
    let entry = await prisma.dailyEntry.findUnique({
      where: { date },
    });

    if (!entry) {
      // If it doesn't exist, we just return an empty object to let the frontend handle defaults
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error("Error fetching entry:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  
  if (!date) {
    return NextResponse.json({ success: false, message: "Date is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    
    // Upsert the entry
    const entry = await prisma.dailyEntry.upsert({
      where: { date },
      update: {
        affirmationIndex: body.affirmationIndex,
        pinnedAffirmation: body.pinnedAffirmation,
        readCount: body.readCount,
        questionIndex: body.questionIndex,
        identityAnswer: body.identityAnswer,
        aiInsight: body.aiInsight,
        actionsDone: body.actionsDone,
        othersPerson: body.othersPerson,
        othersGesture: body.othersGesture,
        othersHonest: body.othersHonest,
        eveningOthers: body.eveningOthers,
        eveningWin: body.eveningWin,
        eveningGap: body.eveningGap,
        eveningTomorrow: body.eveningTomorrow,
        closingText: body.closingText,
      },
      create: {
        date,
        affirmationIndex: body.affirmationIndex ?? 0,
        pinnedAffirmation: body.pinnedAffirmation ?? null,
        readCount: body.readCount ?? 0,
        questionIndex: body.questionIndex ?? 0,
        identityAnswer: body.identityAnswer ?? "",
        aiInsight: body.aiInsight ?? "",
        actionsDone: body.actionsDone ?? "[]",
        othersPerson: body.othersPerson ?? "",
        othersGesture: body.othersGesture ?? "",
        othersHonest: body.othersHonest ?? "",
        eveningOthers: body.eveningOthers ?? "",
        eveningWin: body.eveningWin ?? "",
        eveningGap: body.eveningGap ?? "",
        eveningTomorrow: body.eveningTomorrow ?? "",
        closingText: body.closingText ?? "",
      },
    });

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error("Error saving entry:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
