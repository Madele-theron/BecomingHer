import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const entries = await prisma.dailyEntry.findMany({
    orderBy: { date: 'desc' },
  });

  const customAffirmations = await prisma.customAffirmation.findMany({
    orderBy: { createdAt: 'asc' }
  });

  return <HomeClient entries={entries} affirmations={customAffirmations} />;
}
