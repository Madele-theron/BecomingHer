import { prisma } from "@/lib/prisma";
import { getUserIdFromCookies } from "@/lib/auth";
import HomeClient from "@/components/HomeClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const userId = await getUserIdFromCookies();
  if (!userId) redirect("/login");

  // Check if user must change password
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { mustChangePassword: true, name: true } });
  if (user?.mustChangePassword) redirect("/change-password");

  const entries = await prisma.dailyEntry.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  const customAffirmations = await prisma.customAffirmation.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' }
  });

  return <HomeClient entries={entries} affirmations={customAffirmations} userName={user?.name || ""} />;
}
