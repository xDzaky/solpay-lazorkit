// =============================================================================
// USE SUBSCRIBE HOOK TESTS
// =============================================================================
// Unit tests for the useSubscribe hook
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
  getMockBalance: vi.fn().mockReturnValue(1000_000_000), // $1000 USDC
  setMockSubscription: vi.fn(),
}));

vi.mock('@/lib/solana', () => ({
  buildSubscriptionPaymentInstruction: vi.fn().mockResolvedValue([]),
}));

// Mock fetch for API calls
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ success: true }),
});

// Import after mocks
import { useSubscribe } from '@/hooks/useSubscribe';

describe('useSubscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should return initial state correctly', () => {
      const { result } = renderHook(() => useSubscribe());

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.subscribe).toBe('function');
    });
  });

  describe('subscribe function', () => {
    it('should reset processing state after subscription', async () => {
      const { result } = renderHook(() => useSubscribe());

      expect(result.current.isProcessing).toBe(false);

      await act(async () => {
        return result.current.subscribe('plan_pro', 'Pro Plan', 29.99);
      });

      expect(result.current.isProcessing).toBe(false);
    });
  });
});

describe('useSubscribe - wallet not connected', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return error when wallet is not connected', async () => {
    // Override the mock for this specific test
    vi.doMock('@lazorkit/wallet', () => ({
      useWallet: vi.fn(() => ({
        smartWalletPubkey: null,
        signAndSendTransaction: null,
      })),
    }));

    // Force re-import with new mock
    vi.resetModules();
    
    // Re-setup required mocks after reset
    vi.mock('@/lib/mock-mode', () => ({
      MOCK_MODE: true,
      simulateDelay: vi.fn().mockResolvedValue(undefined),
      logMockActivity: vi.fn(),
      addMockTransaction: vi.fn(),
      deductMockBalance: vi.fn(),
      getMockBalance: vi.fn().mockReturnValue(1000_000_000),
      setMockSubscription: vi.fn(),
    }));

    vi.mock('@lazorkit/wallet', () => ({
      useWallet: vi.fn(() => ({
        smartWalletPubkey: null,
        signAndSendTransaction: null,
      })),
    }));

    const { useSubscribe: useSubscribeDisconnected } = await import('@/hooks/useSubscribe');
    const { result } = renderHook(() => useSubscribeDisconnected());

    const response = await act(async () => {
      return result.current.subscribe('plan_basic', 'Basic Plan', 9.99);
    });

    expect(response.success).toBe(false);
    expect(response.error).toBe('Wallet not connected');
  });
});
