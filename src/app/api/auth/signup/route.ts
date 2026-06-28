import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken, hashPassword, setAuthCookie } from "@/lib/auth";

const STARTER_AFFIRMATIONS = [
  { text: "I am enough, I have enough, I know enough.", category: "Identity and Self-Belief" },
  { text: "The braver I am, the luckier I get.", category: "Resilience and Courage" },
  { text: "I give myself permission to be happy.", category: "Identity and Self-Belief" },
  { text: "Challenges help me grow and learn.", category: "Growth Mindset" },
  { text: "I am fully present and focused when listening to others.", category: "Emotional Intelligence" },
];

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ success: false, message: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name?.trim() || "",
      },
    });

    // Give new users starter affirmations
    await prisma.customAffirmation.createMany({
      data: STARTER_AFFIRMATIONS.map(a => ({
        text: a.text,
        category: a.category,
        userId: user.id,
      })),
    });

    const token = await createToken(user.id);
    const response = NextResponse.json({ success: true });
    response.cookies.set(setAuthCookie(token));
    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
