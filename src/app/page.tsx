import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const entries = await prisma.dailyEntry.findMany({
    orderBy: { date: 'desc' },
  });

  return <HomeClient entries={entries} />;
}
