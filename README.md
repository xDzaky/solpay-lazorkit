# 🚀 SolPay - Gasless Subscription Payments on Solana

> **Built with [Lazorkit SDK](https://lazorkit.com)** — Passkey wallets & sponsored transactions

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://solpay-lazorkit.vercel.app)
[![Solana](https://img.shields.io/badge/Solana-Devnet-purple)](https://explorer.solana.com/?cluster=devnet)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## 📺 Demo Video

> 🎥 [Watch the 3-minute demo on YouTube](https://youtube.com/watch?v=DEMO_VIDEO_ID)

---

## ✨ What is SolPay?

**SolPay** is a subscription payment platform that demonstrates the power of Lazorkit SDK. Users can:

- 🔐 **Sign up in seconds** using device biometrics (FaceID, TouchID, Windows Hello)
- 💸 **Pay subscriptions** with USDC without needing any SOL for gas
- 📱 **No browser extensions** required — works on mobile and desktop

### The Problem

Traditional crypto onboarding is painful:
1. Download wallet extension
2. Write down 24-word seed phrase
3. Buy SOL for gas fees
4. Learn about token accounts
5. Finally make a transaction

**Result:** 95%+ user drop-off 😢

### Our Solution

With Lazorkit + SolPay:
1. Click "Connect"
2. Use FaceID/TouchID
3. Done! 🎉

**No seed phrases. No gas. No extensions.**

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Frontend (Next.js)                            │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Connect    │  │  Pricing    │  │  Payment    │  │  History    │    │
│  │  Button     │  │  Grid       │  │  Flow       │  │  View       │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                │                │                │           │
│         └────────────────┴────────┬───────┴────────────────┘           │
│                                   ▼                                     │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    Lazorkit SDK (useWallet)                     │    │
│  │                                                                  │    │
│  │  • connect()              → Passkey authentication              │    │
│  │  • signAndSendTransaction → Gasless TX submission               │    │
│  │  • smartWalletPubkey      → User's Solana address               │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        External Services                                 │
├───────────────────┬────────────────────┬────────────────────────────────┤
│  Lazorkit Portal  │  Kora Paymaster    │  Solana Devnet                 │
│  (WebAuthn Auth)  │  (Gas Sponsorship) │  (Blockchain)                  │
└───────────────────┴────────────────────┴────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why? |
|-------|------------|------|
| **Framework** | Next.js 14 (App Router) | Server components, API routes, great DX |
| **Language** | TypeScript 5 | Type safety, better IDE support |
| **Styling** | Tailwind CSS | Rapid UI development |
| **State** | Zustand + React Query | Simple client state + server cache |
| **Database** | Prisma + SQLite | Type-safe ORM, easy local dev |
| **Blockchain** | @lazorkit/wallet | Passkey wallets, gasless TX |
| **Tokens** | @solana/spl-token | USDC transfers |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- A device with biometric support (or security key)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/solpay-lazorkit.git
cd solpay-lazorkit
pnpm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

The default values work for Devnet:

```env
# .env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_PORTAL_URL="https://portal.lazor.sh"
NEXT_PUBLIC_PAYMASTER_URL="https://kora.devnet.lazorkit.com"
```

### 3. Initialize Database

```bash
# Generate Prisma client
pnpm prisma generate

# Create database and seed with demo plans
pnpm prisma db push
pnpm prisma db seed
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
solpay-lazorkit/
├── prisma/
│   ├── schema.prisma      # Database models
│   └── seed.ts            # Demo subscription plans
├── src/
│   ├── app/
│   │   ├── api/           # Next.js API routes
│   │   │   ├── plans/     # GET subscription plans
│   │   │   ├── users/     # User CRUD
│   │   │   ├── subscriptions/  # Subscription management
│   │   │   └── transactions/   # Transaction history
│   │   ├── layout.tsx     # Root layout with providers
│   │   └── page.tsx       # Landing page
│   ├── components/
│   │   ├── ui/            # Reusable UI components
│   │   ├── wallet/        # ConnectButton, WalletInfo
│   │   ├── subscription/  # PlanCard, PlanGrid
│   │   └── transaction/   # TransactionList
│   ├── lib/
│   │   ├── constants.ts   # Config, token addresses
│   │   ├── solana.ts      # Blockchain utilities
│   │   ├── prisma.ts      # Database client
│   │   └── utils.ts       # Helper functions
│   ├── providers/
│   │   ├── WalletProvider.tsx   # Lazorkit context
│   │   └── QueryProvider.tsx    # React Query
│   └── store/
│       └── userStore.ts   # Zustand state
├── docs/
│   └── tutorials/         # Integration guides
├── TECH_SPEC.md          # Technical specification
└── README.md             # You are here!
```

---

## 🔑 Key Features Explained

### 1. Passkey Authentication

```typescript
// Connect with one line
const { connect } = useWallet();
await connect();

// User authenticates with FaceID/TouchID
// Returns their Solana smart wallet address
```

**How it works:**
- User's passkey is stored in device Secure Enclave
- Public key is registered on-chain
- Smart wallet (PDA) is derived from the passkey
- No private keys exposed, ever!

### 2. Gasless Transactions

```typescript
// Send USDC without SOL
const { signAndSendTransaction } = useWallet();
const instructions = await buildUsdcTransfer(from, to, amount);
const sig = await signAndSendTransaction(instructions);

// Kora paymaster pays the gas fee ✨
```

**How it works:**
- Transaction is built with your instructions
- Paymaster (Kora) is set as fee payer
- User signs with biometrics
- Paymaster sponsors the SOL fee
- Transaction confirmed on-chain

### 3. Subscription Flow

```
User selects plan → Build USDC transfer → Sign with passkey → 
Paymaster pays gas → Transaction confirmed → Subscription activated
```

---

## 📖 API Reference

### Plans

```http
GET /api/plans
```

Returns all active subscription plans.

### Users

```http
POST /api/users
Content-Type: application/json

{
  "walletAddress": "ABC...",
  "credentialId": "xyz123"
}
```

Creates or updates a user.

```http
GET /api/users/[walletAddress]
```

Returns user details.

### Subscriptions

```http
POST /api/subscriptions
Content-Type: application/json

{
  "walletAddress": "ABC...",
  "planId": "plan_basic",
  "transactionSignature": "5abc...",
  "amountPaid": 9.99
}
```

Creates a new subscription after successful payment.

### Transactions

```http
GET /api/transactions/user/[walletAddress]?limit=10&offset=0
```

Returns paginated transaction history.

---

## 🧪 Testing

### Get Devnet USDC

1. Visit [SPL Token Faucet](https://spl-token-faucet.com/)
2. Connect your wallet
3. Request USDC tokens

### Test a Subscription

1. Run the app locally
2. Connect with passkey
3. Select a subscription plan
4. Approve with biometrics
5. Check transaction on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

```bash
# Environment variables for production
DATABASE_URL=postgresql://...
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PORTAL_URL=https://portal.lazor.sh
NEXT_PUBLIC_PAYMASTER_URL=https://kora.devnet.lazorkit.com
```

### Database Migration

For production, switch from SQLite to PostgreSQL:

```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

Then migrate:

```bash
pnpm prisma migrate dev --name init
```

---

## 📚 Learn More

- [Tutorial 1: Passkey Wallet Setup](./docs/tutorials/01-passkey-wallet-setup.md)
- [Tutorial 2: Gasless Transactions](./docs/tutorials/02-gasless-transactions.md)
- [Technical Specification](./TECH_SPEC.md)
- [Lazorkit Documentation](https://docs.lazorkit.com)

---

## 🏆 Bounty Submission

This project was built for the **Lazorkit Bounty** to demonstrate:

✅ **Passkey Wallet Integration** — Using `@lazorkit/wallet` for seamless authentication

✅ **Gasless Transactions** — Kora paymaster sponsors all transaction fees

✅ **Real-World Use Case** — Subscription payments that anyone can understand

✅ **Comprehensive Documentation** — Tutorials, code comments, and technical specs

✅ **Clean Code Structure** — TypeScript, proper separation of concerns

---

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Lazorkit](https://lazorkit.com) for the amazing SDK
- [Solana Foundation](https://solana.com) for the blockchain
- [Vercel](https://vercel.com) for hosting

---

**Built with ❤️ for the Lazorkit Bounty**
