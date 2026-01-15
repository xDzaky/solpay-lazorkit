# SPL Memo Protocol Integration

This tutorial covers how SolPay integrates the SPL Memo protocol to provide transaction transparency and metadata tagging.

## What is SPL Memo?

The SPL Memo program allows attaching arbitrary string data to Solana transactions. This enables:

- **Transaction categorization** - Tag transactions with purpose (subscription, transfer, split)
- **Metadata storage** - Include relevant details like plan names, recipient info
- **Audit trails** - Create searchable, filterable transaction history
- **On-chain transparency** - All memo data is publicly verifiable

## SolPay Memo Format

SolPay uses a structured JSON format for memos:

```typescript
interface SolPayMemo {
  type: 'subscription' | 'transfer' | 'split' | 'request';
  version: string;      // Protocol version (e.g., "1.0.0")
  timestamp: number;    // Unix timestamp
  data: object;         // Type-specific payload
}
```

## Implementation

### 1. Import the SPL Memo Utilities

```typescript
import {
  createSubscriptionMemoInstruction,
  createTransferMemoInstruction,
  createSplitBillMemoInstruction,
  parseSolPayMemo
} from '@/lib/spl-memo';
```

### 2. Creating a Subscription Memo

When a user subscribes to a plan, attach a memo with subscription details:

```typescript
const memoInstruction = createSubscriptionMemoInstruction({
  planId: 'pro-monthly',
  planName: 'Pro Plan',
  priceUsdc: 9.99,
  billingCycle: 'monthly',
  merchantId: 'solpay'
});

// Add to your transaction instructions
const instructions = [
  memoInstruction,
  transferInstruction,
  // ... other instructions
];
```

### 3. Creating a Transfer Memo

For direct USDC transfers:

```typescript
const memoInstruction = createTransferMemoInstruction({
  to: recipientAddress,
  amount: 50.00,
  note: 'Payment for services' // Optional user note
});
```

### 4. Creating a Split Bill Memo

For bill splitting transactions:

```typescript
const memoInstruction = createSplitBillMemoInstruction({
  totalAmount: 100.00,
  participants: ['Alice', 'Bob', 'Charlie'],
  splitType: 'equal', // or 'custom'
  description: 'Dinner at Restaurant'
});
```

### 5. Parsing Memos from Transactions

When reading transaction history, parse the memo data:

```typescript
import { parseSolPayMemo, isSolPayMemo } from '@/lib/spl-memo';

// Get memo from transaction
const memoData = parseSolPayMemo(transaction.memo);

if (isSolPayMemo(memoData)) {
  switch (memoData.type) {
    case 'subscription':
      console.log(`Subscribed to ${memoData.data.planName}`);
      break;
    case 'transfer':
      console.log(`Transfer of $${memoData.data.amount} USDC`);
      break;
    case 'split':
      console.log(`Split bill: ${memoData.data.description}`);
      break;
  }
}
```

## Memo Type Specifications

### Subscription Memo Data

```typescript
interface SubscriptionMemoData {
  planId: string;
  planName: string;
  priceUsdc: number;
  billingCycle: 'monthly' | 'yearly';
  merchantId?: string;
}
```

### Transfer Memo Data

```typescript
interface TransferMemoData {
  to: string;      // Recipient address (truncated)
  amount: number;  // USDC amount
  note?: string;   // Optional user note
}
```

### Split Bill Memo Data

```typescript
interface SplitBillMemoData {
  totalAmount: number;
  participants: string[];
  splitType: 'equal' | 'custom';
  description?: string;
}
```

## Best Practices

1. **Keep memos concise** - The SPL Memo program has a 566 byte limit
2. **Use structured data** - Always use JSON format for parsability
3. **Include timestamps** - Helps with transaction ordering and debugging
4. **Version your schema** - Include version field for future compatibility
5. **Truncate addresses** - Use shortened addresses to save space

## Viewing Memos on Solana Explorer

All memos are visible on Solana Explorer:

1. Go to [explorer.solana.com](https://explorer.solana.com)
2. Search for your transaction signature
3. Look for "Instruction #1" (typically the memo instruction)
4. The memo data appears in the "Data" field

## Security Considerations

- Memo data is **public** - don't include sensitive information
- Memos are **immutable** - once written, cannot be changed
- Memo size affects **transaction fees** - larger memos cost more
- Always **validate** memo data when parsing (could be malformed)

## Integration with Transaction History

SolPay's transaction list automatically parses and displays memo data:

```tsx
// In TransactionList component
const getMemoInfo = (memo: string) => {
  const parsed = parseSolPayMemo(memo);
  if (!isSolPayMemo(parsed)) return null;
  
  return {
    type: parsed.type,
    label: getTypeLabel(parsed.type),
    details: formatMemoDetails(parsed.data)
  };
};
```

## Resources

- [SPL Memo Program](https://spl.solana.com/memo) - Official documentation
- [SolPay Source Code](../src/lib/spl-memo.ts) - Our implementation
- [Solana Cookbook](https://solanacookbook.com) - General Solana guides
