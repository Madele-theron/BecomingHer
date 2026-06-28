import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("name");
  
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
  }

  if (!category) {
    return NextResponse.json({ success: false, message: "Category name required" }, { status: 400 });
  }

  try {
    await prisma.customAffirmation.deleteMany({
      where: { category, userId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
