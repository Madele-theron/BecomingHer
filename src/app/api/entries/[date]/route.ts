import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  
  if (!date) {
    return NextResponse.json({ success: false, message: "Date is required" }, { status: 400 });
  }

  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  try {
    let entry = await prisma.dailyEntry.findUnique({
      where: { userId_date: { userId, date } },
    });

    if (!entry) {
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

  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const entry = await prisma.dailyEntry.upsert({
      where: { userId_date: { userId, date } },
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
        userId,
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
