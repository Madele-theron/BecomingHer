import { prisma } from "@/lib/prisma";
import { getUserIdFromCookies } from "@/lib/auth";
import DailyRitualClient from "@/components/DailyRitualClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function getSeededRandom(seedStr: string) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
  return function() {
    let t = h += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function shuffleArray<T>(array: T[], seedStr: string): T[] {
  const random = getSeededRandom(seedStr);
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;

  const userId = await getUserIdFromCookies();
  if (!userId) redirect("/login");
  
  const entry = await prisma.dailyEntry.findUnique({
    where: { userId_date: { userId, date } },
  });

  const customAffirmations = await prisma.customAffirmation.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' }
  });

  const allAffirmations = shuffleArray(customAffirmations.map(a => ({ text: a.text, category: a.category })), `${userId}-${date}`);

  // Parse JSON fields if entry exists
  let parsedEntry = null;
  if (entry) {
    parsedEntry = {
      ...entry,
      actionsDone: JSON.parse(entry.actionsDone),
      othersGesture: parseInt(entry.othersGesture) || -1,
    };
  }

  return <DailyRitualClient date={date} initialData={parsedEntry} allAffirmations={allAffirmations} />;
}
