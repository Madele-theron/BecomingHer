import { prisma } from "@/lib/prisma";
import DailyRitualClient from "@/components/DailyRitualClient";
import { AFFIRMATIONS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  
  const entry = await prisma.dailyEntry.findUnique({
    where: { date },
  });

  const customAffirmations = await prisma.customAffirmation.findMany({
    orderBy: { createdAt: 'asc' }
  });

  const allAffirmations = [...AFFIRMATIONS, ...customAffirmations.map(a => a.text)];

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
