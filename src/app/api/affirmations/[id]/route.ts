import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  try {
    await prisma.customAffirmation.delete({
      where: { id, userId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting affirmation:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
