import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { ethers } from "https://esm.sh/ethers@6.7.0"
import { supabase } from '../_shared/supabaseClient.ts'
import { contractAbi } from '../_shared/contractAbi.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    const { appId, testerAddress } = await req.json()

    const RELAYER_PRIVATE_KEY = Deno.env.get("RELAYER_PRIVATE_KEY")
    const SEPOLIA_RPC_URL = Deno.env.get("SEPOLIA_RPC_URL") // Using Sepolia RPC
    const CONTRACT_ADDRESS = Deno.env.get("CONTRACT_ADDRESS")

    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)
    const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, relayerWallet)

    const { data: appData, error } = await supabase.from('apps').select('reward_per_tester').eq('id', appId).single();
    if (error || !appData) throw new Error("Could not find app or reward amount.");
    
    const rewardAmount = ethers.parseEther(appData.reward_per_tester.toString());
    
    const tx = await contract.releaseFunds(appId, testerAddress, rewardAmount)
    await tx.wait()

    return new Response(JSON.stringify({ success: true, txHash: tx.hash }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})