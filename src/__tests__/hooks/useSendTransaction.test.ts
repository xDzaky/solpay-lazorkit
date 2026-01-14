// =============================================================================
// USE SEND TRANSACTION HOOK TESTS
// =============================================================================
// Unit tests for the useSendTransaction hook
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock modules before importing the hook
vi.mock('@lazorkit/wallet', () => ({
  useWallet: vi.fn(() => ({
    smartWalletPubkey: {
      toString: () => 'ABC123MockWalletAddress',
    },
    signAndSendTransaction: vi.fn().mockResolvedValue('mockSignature123'),
  })),
}));

vi.mock('@/lib/mock-mode', () => ({
  MOCK_MODE: true,
  simulateDelay: vi.fn().mockResolvedValue(undefined),
  logMockActivity: vi.fn(),
  addMockTransaction: vi.fn(),
  deductMockBalance: vi.fn(),
  deductMockSolBalance: vi.fn(),
  getMockBalance: vi.fn().mockReturnValue(1000_000_000), // $1000 USDC
  getMockSolBalance: vi.fn().mockReturnValue(5_000_000_000), // 5 SOL
}));

vi.mock('@/lib/constants', () => ({
  TOKENS: { USDC: { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' } },
  RPC_URL: 'https://api.devnet.solana.com',
}));

// Import after mocks
import { useSendTransaction } from '@/hooks/useSendTransaction';

describe('useSendTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should return initial state correctly', () => {
      const { result } = renderHook(() => useSendTransaction());

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.sendSOL).toBe('function');
      expect(typeof result.current.sendUSDC).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('sendSOL', () => {
    it('should validate amount is greater than 0', async () => {
      const { result } = renderHook(() => useSendTransaction());

      // Use a valid base58 address format
      const response = await act(async () => {
        return result.current.sendSOL('7BeWr6tVa1pYgrEddekYTnQENU22bBw9H8HYJUkbrN71', 0);
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Amount must be greater than 0');
    });

    it('should validate negative amounts', async () => {
      const { result } = renderHook(() => useSendTransaction());

      const response = await act(async () => {
        return result.current.sendSOL('7BeWr6tVa1pYgrEddekYTnQENU22bBw9H8HYJUkbrN71', -1);
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Amount must be greater than 0');
    });

    it('should successfully send SOL in mock mode', async () => {
      const { result } = renderHook(() => useSendTransaction());

      const response = await act(async () => {
        return result.current.sendSOL('7BeWr6tVa1pYgrEddekYTnQENU22bBw9H8HYJUkbrN71', 0.1);
      });

      expect(response.success).toBe(true);
      expect(response.signature).toBeDefined();
      expect(response.signature).toHaveLength(88);
    });
  });

  describe('sendUSDC', () => {
    it('should validate amount is greater than 0', async () => {
      const { result } = renderHook(() => useSendTransaction());

      const response = await act(async () => {
        return result.current.sendUSDC('7BeWr6tVa1pYgrEddekYTnQENU22bBw9H8HYJUkbrN71', 0);
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Amount must be greater than 0');
    });

    it('should successfully send USDC in mock mode', async () => {
      const { result } = renderHook(() => useSendTransaction());

      const response = await act(async () => {
        return result.current.sendUSDC('7BeWr6tVa1pYgrEddekYTnQENU22bBw9H8HYJUkbrN71', 10);
      });

      expect(response.success).toBe(true);
      expect(response.signature).toBeDefined();
      expect(response.signature).toHaveLength(88);
    });
  });

  describe('clearError', () => {
    it('should have clearError function', () => {
      const { result } = renderHook(() => useSendTransaction());
      
      expect(typeof result.current.clearError).toBe('function');
    });
  });
});
