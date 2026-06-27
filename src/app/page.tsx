import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";
import { AFFIRMATIONS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const entries = await prisma.dailyEntry.findMany({
    orderBy: { date: 'desc' },
  });

  const customAffirmations = await prisma.customAffirmation.findMany({
    orderBy: { createdAt: 'asc' }
  });

  const allAffirmations = [...AFFIRMATIONS, ...customAffirmations.map(a => a.text)];

  return <HomeClient entries={entries} allAffirmations={allAffirmations} />;
}
