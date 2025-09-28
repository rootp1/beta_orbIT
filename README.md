# Orbital Task Escrow System

A decentralized testing marketplace with smart contract escrow, human verification, and instant ETH rewards.

## 🎯 Overview

Orbital enables developers to create testing tasks with staked ETH rewards and allows verified humans to complete tasks and earn instant cryptocurrency payments. The system uses:

- **TaskEscrow Smart Contract** - Manages fund staking and automatic reward distribution
- **World ID Integration** - Ensures only verified humans can participate
- **MiniKit sendTransaction** - Seamless blockchain interactions within World App
- **Step-by-Step Verification** - Guided human + wallet verification flows

## 🏗️ Architecture

### Smart Contracts (`/contracts`)

**TaskEscrow.sol** - Main escrow contract with:
- Task creation and funding (staking mechanism)
- Automatic reward distribution upon completion
- Withdrawal mechanisms for developers
- Platform fee collection (2.5%)
- Sybil resistance through one-task-per-person limits

### Frontend (`/client`)

**Key Components:**
- `StepByStepVerification` - Guided human + wallet verification
- `TaskCreationFlow` - Developer task setup and funding
- `TaskCompletionFlow` - Tester verification and reward claiming
- `useTaskEscrow` - Transaction hooks using MiniKit sendTransaction

**Key Pages:**
- `/create-task` - Developer task creation interface
- `/complete-task/[taskId]` - Tester completion interface

## 🚀 Quick Start

### 1. Deploy Smart Contract

```bash
cd contracts

# Install Foundry if not already installed
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Deploy to World Chain Sepolia (testnet)
forge script script/DeployTaskEscrow.s.sol:DeployTaskEscrow \
    --rpc-url https://worldchain-sepolia.g.alchemy.com/public \
    --broadcast --verify

# Copy the deployed contract address to client/src/lib/contracts.ts
```

### 2. Configure Client

```bash
cd client

# Install dependencies
npm install

# Update contract address in src/lib/contracts.ts
# Set environment variables
cp .env.example .env.local
```

### 3. Run Development Server

```bash
npm run dev
```

Navigate to:
- `http://localhost:3000/create-task` - Create tasks as developer
- `http://localhost:3000/complete-task/YOUR_TASK_ID` - Complete tasks as tester

## 💡 How It Works

### For Developers

1. **Human Verification** - Verify identity with World ID
2. **Wallet Connection** - Connect World App wallet via SIWE
3. **Create Task** - Define task ID, reward amount, max completions
4. **Fund Task** - Stake ETH to escrow contract using sendTransaction
5. **Manage Tasks** - Monitor completions and add more funding

### For Testers

1. **Human Verification** - Verify unique identity with World ID  
2. **Wallet Connection** - Connect wallet to receive rewards
3. **Review Task** - Check reward amount and requirements
4. **Complete Task** - Submit completion (triggers smart contract)
5. **Earn Rewards** - Receive ETH instantly via automated distribution

## 🔧 Technical Implementation

### Smart Contract Functions

```solidity
// Developer functions
function createTask(string taskId, uint256 rewardPerCompletion, uint256 maxCompletions)
function fundTask(string taskId) payable
function withdrawStake(string taskId)

// Completion functions  
function completeTask(string taskId, address tester)

// View functions
function getTask(string taskId) returns (...)
function hasCompletedTask(string taskId, address tester) returns (bool)
function getAvailableRewards(string taskId) returns (uint256, uint256)
```

### MiniKit Integration

```typescript
// Using sendTransaction for contract interactions
const { createTask, fundTask, completeTask } = useTaskEscrowTransactions()

// Create task
await createTask(taskId, parseEther(rewardAmount), maxCompletions)

// Fund task with ETH
await fundTask(taskId, parseEther(fundingAmount))

// Complete task (developer or backend triggers)
await completeTask(taskId, testerAddress)
```

### Verification Flow

```typescript
// Step-by-step verification component
<StepByStepVerification 
  onComplete={(walletAddress) => setVerified(true)}
  userType="developer" // or "tester"
/>
```

## 🔐 Security Features

- **Sybil Resistance** - World ID prevents multiple accounts per person
- **Smart Contract Escrow** - Funds locked until verified completion
- **Transparent Operations** - All transactions visible on blockchain  
- **Platform Fee Cap** - Maximum 10% platform fee (currently 2.5%)
- **Emergency Controls** - Owner can pause/withdraw in emergencies

## 🌐 Deployment Networks

### World Chain Sepolia (Testnet)
- **RPC**: https://worldchain-sepolia.g.alchemy.com/public
- **Explorer**: https://worldchain-sepolia.explorer.alchemy.com
- **Gas**: Free for mini-app transactions

### World Chain Mainnet  
- **RPC**: https://worldchain-mainnet.g.alchemy.com/public
- **Explorer**: https://worldscan.org
- **Gas**: Covered by World Chain for mini-apps (300 tx/day limit)

## 🧪 Testing

### Contract Tests

```bash
cd contracts
forge test -vvv
```

### Frontend Development

```bash
cd client
npm run dev
# Test with World App or browser with ?forceMiniKit=1
```

## 📋 Configuration

### Required Environment Variables

```bash
# Client (.env.local)
NEXT_PUBLIC_WORLDCOIN_APP_ID=app_your_app_id_here
APP_ID=app_your_app_id_here

# Contract deployment
PRIVATE_KEY=0x...
WORLDSCAN_API_KEY=your_api_key
```

### Contract Configuration

Update contract addresses in `client/src/lib/contracts.ts`:

```typescript
export const TASK_ESCROW_ADDRESSES = {
  worldchain: '0x...', // Mainnet address
  worldchain_sepolia: '0x...', // Testnet address  
  sepolia: '0x...' // Ethereum testnet
}
```

## 🚀 Production Checklist

- [ ] Deploy TaskEscrow contract to World Chain
- [ ] Update contract addresses in client
- [ ] Configure World ID app in Developer Portal
- [ ] Add contract address to World App allowlist
- [ ] Test end-to-end flows in World App
- [ ] Set up monitoring and analytics
- [ ] Configure platform fee recipient
- [ ] Test emergency procedures

## 📖 API Reference

### Contract Read Functions

```typescript
// Get task information
const taskData = await getTask(taskId)
// Returns: [developer, rewardPerCompletion, totalFunded, totalCompletions, maxCompletions, isActive]

// Check completion status
const hasCompleted = await hasCompletedTask(taskId, userAddress)

// Get available rewards
const [availableRewards, possibleCompletions] = await getAvailableRewards(taskId)
```

### Transaction Functions

```typescript
// Create new task
const result = await createTask(taskId, rewardInWei, maxCompletions)

// Fund existing task  
const result = await fundTask(taskId, fundingAmountInWei)

// Mark task complete (triggers reward)
const result = await completeTask(taskId, testerAddress)
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)  
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: See inline code comments and this README
- **Issues**: Open GitHub issues for bugs or feature requests
- **World ID**: See [World ID Documentation](https://docs.worldcoin.org/)
- **MiniKit**: See [MiniKit Documentation](https://docs.worldcoin.org/mini-apps)

---

**Built with ❤️ using World ID, MiniKit, and smart contracts on World Chain**
