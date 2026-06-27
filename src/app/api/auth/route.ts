import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.APP_PASSWORD;

    if (!correctPassword) {
      console.error("APP_PASSWORD environment variable is not set.");
      return NextResponse.json({ success: false, message: "Server misconfiguration" }, { status: 500 });
    }

    if (password === correctPassword) {
      // Create a response and set an HTTP-only cookie
      const response = NextResponse.json({ success: true });
      response.cookies.set({
        name: "auth_token",
        value: "authenticated",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return response;
    }

    return NextResponse.json({ success: false, message: "Incorrect password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Bad request" }, { status: 400 });
  }
}
