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

    // The documentation shows APP_ID, not WLD_APP_ID
    const app_id = process.env.APP_ID as `app_${string}`;

    if (!app_id) {
      return NextResponse.json({ 
        success: false, 
        message: 'APP_ID environment variable not set' 
      }, { status: 500 });
    }

    // Call the Worldcoin cloud service to verify the proof
    const verifyRes = (await verifyCloudProof(payload, app_id, action, signal)) as IVerifyResponse;

    if (verifyRes.success) {
      // If verification is successful, perform necessary backend actions.
      console.log(`✅ Proof for signal ${signal} and action ${action} verified successfully.`);
      
      return NextResponse.json({ success: true, ...verifyRes }, { status: 200 });
    } else {
      // Handle errors from the verification service.
      console.error(`❌ Proof verification failed:`, verifyRes);
      return NextResponse.json({ success: false, ...verifyRes }, { status: 400 });
    }
  } catch (error: any) {
    console.error("An unexpected error occurred:", error.message);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    }, { status: 500 });
  }
}
