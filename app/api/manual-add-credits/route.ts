import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, credits } = await req.json();
    
    if (!userId || !credits) {
      return NextResponse.json({ error: "Missing userId or credits" }, { status: 400 });
    }
    
    // Just return success - we'll handle this client-side
    return NextResponse.json({
      success: true,
      userId,
      credits
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 