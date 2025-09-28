import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { worldchainSepolia } from 'viem/chains'
import { TaskEscrowABI } from '@/lib/contracts'

// Create a public client for reading from the blockchain
const publicClient = createPublicClient({
  chain: worldchainSepolia,
  transport: http()
})

interface ReadContractRequest {
  contractAddress: string
  functionName: string
  args: any[]
}

export async function POST(req: NextRequest) {
  try {
    const { contractAddress, functionName, args }: ReadContractRequest = await req.json()
    
    console.log(`📖 Reading from contract: ${functionName}(${args.join(', ')})`)
    
    // Validate contract address
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      return NextResponse.json(
        { error: 'Contract not deployed or invalid address' },
        { status: 400 }
      )
    }

    // Read from contract
    const result = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: TaskEscrowABI,
      functionName,
      args
    })

    console.log(`📊 Contract read result:`, result)
    
    return NextResponse.json({ 
      success: true, 
      result,
      functionName,
      args
    })
    
  } catch (error: any) {
    console.error('❌ Contract read error:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to read from contract',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}
