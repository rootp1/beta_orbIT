import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// These headers are required for the browser to be able to talk to the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { merkle_root, nullifier_hash, proof } = await req.json()

    // These values are read from the environment variables set in Supabase
    const WLD_APP_ID = Deno.env.get("WLD_APP_ID")
    const WLD_ACTION = Deno.env.get("WLD_ACTION")

    console.log("Verifying proof with Worldcoin API...");

    const verifyRes = await fetch(
      `https://developer.worldcoin.org/api/v2/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merkle_root: merkle_root,
          nullifier_hash: nullifier_hash,
          proof: proof,
          action: WLD_ACTION, // This must match the action on the frontend
          app_id: WLD_APP_ID,
          signal: "user-login-signal", // This must match the signal on the frontend
        }),
      }
    );

    const verifyBody = await verifyRes.json();
    console.log("Verification response:", verifyBody);

    if (verifyRes.ok) {
      console.log("Proof verified successfully.");
      // The proof is valid, return a success response
      return new Response(JSON.stringify({ 
        success: true, 
        nullifier_hash: nullifier_hash 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      // The proof is invalid, return an error
      console.error("Proof verification failed:", verifyBody);
      return new Response(JSON.stringify({ success: false, detail: verifyBody.detail || "Proof verification failed." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(JSON.stringify({ success: false, detail: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})