// =============================================================================
// PRICE SERVICE - Real-time SOL/USDC Price
// =============================================================================
// Fetches real-time cryptocurrency prices from CoinGecko API
// Used for swap calculations and price display
// =============================================================================

const COINGECKO_API = "https://api.coingecko.com/api/v3";

// Cache price for 30 seconds to avoid rate limiting
let cachedPrice: { sol: number; timestamp: number } | null = null;
const CACHE_DURATION = 30_000; // 30 seconds

export interface PriceData {
  solUsd: number;
  usdcUsd: number;
  solToUsdc: number;
  usdcToSol: number;
  lastUpdated: Date;
}

/**
 * Fetch SOL price in USD from CoinGecko
 */
export async function fetchSolPrice(): Promise<number> {
  // Check cache first
  if (cachedPrice && Date.now() - cachedPrice.timestamp < CACHE_DURATION) {
    return cachedPrice.sol;
  }

  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=solana&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 30 }, // Next.js cache
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const solPrice = data.solana?.usd || 0;

    // Update cache
    cachedPrice = {
      sol: solPrice,
      timestamp: Date.now(),
    };

    return solPrice;
  } catch (error) {
    console.error("Failed to fetch SOL price:", error);
    // Return cached price if available, otherwise fallback
    return cachedPrice?.sol || 150; // Fallback price
  }
}

/**
 * Get full price data for swap calculations
 */
export async function getPriceData(): Promise<PriceData> {
  const solUsd = await fetchSolPrice();
  const usdcUsd = 1; // USDC is pegged to $1

  return {
    solUsd,
    usdcUsd,
    solToUsdc: solUsd, // 1 SOL = X USDC
    usdcToSol: 1 / solUsd, // 1 USDC = X SOL
    lastUpdated: new Date(),
  };
}

/**
 * Calculate swap output amount
 * @param inputAmount - Amount of input token
 * @param direction - 'sol-to-usdc' or 'usdc-to-sol'
 * @param solPrice - Current SOL price in USD
 * @param slippage - Slippage tolerance (default 0.5%)
 */
export function calculateSwapOutput(
  inputAmount: number,
  direction: 'sol-to-usdc' | 'usdc-to-sol',
  solPrice: number,
  slippage: number = 0.005
): {
  outputAmount: number;
  priceImpact: number;
  minimumReceived: number;
  fee: number;
} {
  // Simulated 0.3% swap fee (like most DEXes)
  const feeRate = 0.003;
  const fee = inputAmount * feeRate;
  const amountAfterFee = inputAmount - fee;

  let outputAmount: number;
  
  if (direction === 'sol-to-usdc') {
    // SOL -> USDC
    outputAmount = amountAfterFee * solPrice;
  } else {
    // USDC -> SOL
    outputAmount = amountAfterFee / solPrice;
  }

  // Simulated price impact based on amount (larger amounts = higher impact)
  // In real DEX, this depends on liquidity pool depth
  const priceImpact = Math.min(inputAmount * 0.0001, 0.05); // Max 5%
  
  // Apply price impact
  outputAmount = outputAmount * (1 - priceImpact);

  // Minimum received after slippage
  const minimumReceived = outputAmount * (1 - slippage);

  return {
    outputAmount,
    priceImpact,
    minimumReceived,
    fee: direction === 'sol-to-usdc' ? fee : fee / solPrice,
  };
}

/**
 * Format price with appropriate decimals
 */
export function formatPrice(price: number, decimals: number = 2): string {
  if (price < 0.01) {
    return price.toFixed(6);
  }
  return price.toFixed(decimals);
}

/**
 * Format SOL amount (9 decimals internally, display 4-6)
 */
export function formatSolAmount(lamports: number): string {
  const sol = lamports / 1_000_000_000;
  if (sol < 0.0001) {
    return sol.toFixed(9);
  }
  return sol.toFixed(4);
}

/**
 * Format USDC amount (6 decimals internally, display 2)
 */
export function formatUsdcAmount(microUsdc: number): string {
  const usdc = microUsdc / 1_000_000;
  return usdc.toFixed(2);
}
