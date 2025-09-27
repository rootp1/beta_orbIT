import { NextRequest, NextResponse } from 'next/server'
import { verifyCloudProof, IVerifyResponse, ISuccessResult } from '@worldcoin/minikit-js'

interface IRequestPayload {
  payload: ISuccessResult
  action: string
  signal: string
}

export async function POST(req: NextRequest) {
  try {
  const { payload, action, signal } = (await req.json()) as IRequestPayload;

  // Basic request context for terminal visibility
  const ua = req.headers.get('user-agent') || 'unknown-UA'
  const ip = req.headers.get('x-forwarded-for') || 'unknown-ip'
  console.log(`🟦 [WorldID] Verify request received -> action="${action}", signal="${signal}", ip=${ip}, ua=${ua}`)

  // Prefer APP_ID, fallback to NEXT_PUBLIC_WORLDCOIN_APP_ID for dev
  const app_id = (process.env.APP_ID || process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID) as `app_${string}`

    if (!app_id) {
      console.error('🟧 [WorldID] APP_ID is not set. Set APP_ID (server) or NEXT_PUBLIC_WORLDCOIN_APP_ID (client) to your app id (app_*)')
      return NextResponse.json({ success: false, message: 'APP_ID not set' }, { status: 500 })
    }

    // Call the Worldcoin cloud service to verify the proof
  const verifyRes = (await verifyCloudProof(payload, app_id, action, signal)) as IVerifyResponse;

    if (verifyRes.success) {
      // If verification is successful, perform necessary backend actions.
      console.log(`✅ [WorldID] VERIFIED -> signal="${signal}", action="${action}"`)
      // Extract a stable, app-scoped identifier for the verified human (nullifier hash)
      const human_id = (payload as any)?.nullifier_hash || (payload as any)?.proof?.nullifier_hash || null
      return NextResponse.json({ ...verifyRes, human_id }, { status: 200 });
    } else {
      // Handle errors from the verification service.
      console.error(`🟥 [WorldID] NOT VERIFIED -> signal="${signal}", action="${action}", response=`, verifyRes)
  return NextResponse.json({ ...verifyRes }, { status: 400 });
    }
  } catch (error: any) {
    console.error("🟧 [WorldID] VERIFY ERROR:", error?.message || error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    }, { status: 500 });
  }
}
