import { prisma } from "@/lib/prisma";
import { getUserIdFromCookies } from "@/lib/auth";
import DailyRitualClient from "@/components/DailyRitualClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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

  const allAffirmations = customAffirmations.map(a => a.text);

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
