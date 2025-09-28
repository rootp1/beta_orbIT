#!/bin/bash

echo "🚀 Orbital TaskEscrow Deployment Setup"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file from template"
else
    echo "✅ .env file exists"
fi

# Check if PRIVATE_KEY is set
if grep -q "PRIVATE_KEY=your_private_key_here" .env || grep -q "PRIVATE_KEY=$" .env; then
    echo ""
    echo "⚠️  PRIVATE_KEY not configured in .env file"
    echo ""
    echo "📋 Setup Instructions:"
    echo "1. Open MetaMask or your wallet"
    echo "2. Go to Account Details → Export Private Key"
    echo "3. Copy the private key (without 0x prefix)"
    echo "4. Edit .env file and replace 'your_private_key_here_without_0x_prefix' with your key"
    echo ""
    echo "🌊 Get Test ETH:"
    echo "Visit https://bridge.worldchain.org/ to get test ETH on World Chain Sepolia"
    echo ""
    echo "⚡ Deploy Command (after setup):"
    echo "forge script script/DeployTaskEscrow.s.sol:DeployTaskEscrow \\"
    echo "    --rpc-url https://worldchain-sepolia.g.alchemy.com/public \\"
    echo "    --broadcast --verify"
    echo ""
    exit 1
else
    echo "✅ PRIVATE_KEY is configured"
fi

# Test compilation
echo ""
echo "🔨 Testing compilation..."
if forge build > /dev/null 2>&1; then
    echo "✅ Contracts compile successfully"
else
    echo "❌ Compilation failed"
    forge build
    exit 1
fi

# Test RPC connection
echo ""
echo "🌐 Testing RPC connection..."
if curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    https://worldchain-sepolia.g.alchemy.com/public > /dev/null; then
    echo "✅ RPC connection successful"
else
    echo "❌ RPC connection failed"
    exit 1
fi

echo ""
echo "🎯 Ready to deploy! Run the deploy command above."
echo ""
