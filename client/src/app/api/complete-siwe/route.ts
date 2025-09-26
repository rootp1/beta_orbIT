import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from "@worldcoin/minikit-js";
import { supabase } from '@/utils/supabaseClient';

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
}

export const POST = async (req: NextRequest) => {
  try {
    const { payload, nonce } = (await req.json()) as IRequestPayload;
    const cookieStore = cookies();

    // 1. Verify the nonce
    const siweNonce = cookieStore.get("siwe")?.value;
    if (!siweNonce || nonce !== siweNonce) {
      return NextResponse.json(
        { status: "error", isValid: false, message: "Invalid or missing nonce." },
        { status: 422 }
      );
    }

    // 2. Verify the SIWE message
    const validMessage = await verifySiweMessage(payload, nonce);
    
    if (validMessage.isValid) {
      // 3. Store the verified user in the database
      const walletAddress = payload.address;
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({ id: walletAddress });

      if (upsertError) {
        console.error("Supabase upsert error:", upsertError);
        throw new Error("Could not save user session.");
      }
      console.log(`User ${walletAddress} successfully authenticated and saved.`);

      // 4. Clear the nonce cookie AFTER successful verification and DB write
      cookieStore.delete("siwe");
    }

    return NextResponse.json({
      status: "success",
      isValid: validMessage.isValid,
    });
  } catch (error: any) {
    console.error("SIWE verification error:", error);
    return NextResponse.json(
      { status: "error", isValid: false, message: error.message || "Verification failed" },
      { status: 500 }
    );
  }
};