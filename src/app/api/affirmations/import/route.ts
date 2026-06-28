import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    const csvText = await file.text();
    const lines = csvText.split("\n").map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length < 2) {
      return NextResponse.json({ success: false, message: "CSV must have a header row and at least one data row" }, { status: 400 });
    }

    // Parse header
    const header = lines[0].toLowerCase();
    const hasCategory = header.includes("category");

    // Parse rows
    const affirmations: { text: string; category: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Simple CSV parsing (handles quoted fields)
      const parts = parseCsvLine(line);
      
      if (parts.length === 0 || !parts[0].trim()) continue;

      affirmations.push({
        text: parts[0].trim(),
        category: (hasCategory && parts[1]?.trim()) || "General",
      });
    }

    if (affirmations.length === 0) {
      return NextResponse.json({ success: false, message: "No valid affirmations found in the CSV" }, { status: 400 });
    }

    // Get existing affirmations for dedup
    const existing = await prisma.customAffirmation.findMany({
      where: { userId },
      select: { text: true },
    });
    const existingTexts = new Set(existing.map(a => a.text.toLowerCase().trim()));

    const toInsert = affirmations.filter(a => !existingTexts.has(a.text.toLowerCase().trim()));

    if (toInsert.length > 0) {
      await prisma.customAffirmation.createMany({
        data: toInsert.map(a => ({
          text: a.text,
          category: a.category,
          userId,
        })),
      });
    }

    return NextResponse.json({ 
      success: true, 
      imported: toInsert.length,
      skipped: affirmations.length - toInsert.length,
    });
  } catch (error) {
    console.error("Error importing affirmations:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
