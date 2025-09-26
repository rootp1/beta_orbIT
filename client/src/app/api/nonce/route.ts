import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Expects only alphanumeric characters
    const nonce = crypto.randomUUID().replace(/-/g, "");
    
    // Get cookies store
    const cookieStore = await cookies();
    
    // The nonce should be stored somewhere that is not tamperable by the client
    cookieStore.set("siwe", nonce, { 
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 300 // 5 minutes expiry
    });
    
    return NextResponse.json({ nonce });
  } catch (error: any) {
    console.error("Nonce generation error:", error);
    return NextResponse.json({ 
      error: "Failed to generate nonce" 
    }, { status: 500 });
  }
}
