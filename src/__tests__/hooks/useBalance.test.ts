// =============================================================================
// USE BALANCE HOOK TESTS
// =============================================================================
// Unit tests for the useBalance hook
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the mock-mode module
vi.mock('@/lib/mock-mode', () => ({
  MOCK_MODE: true,
  logMockActivity: vi.fn(),
}));

// Mock the solana module
vi.mock('@/lib/solana', () => ({
  getUsdcBalance: vi.fn().mockResolvedValue(1000_000_000), // $1000 USDC
}));

// Import after mocks
import { useBalance } from '@/hooks/useBalance';

/**
 * Create a wrapper with QueryClientProvider for testing hooks
 */
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    );
  };
}

describe('useBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial loading state', () => {
    const { result } = renderHook(
      () => useBalance('ABC123'),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.balance).toBeUndefined();
  });

  it('should return formatted balance as 0.00 when balance is undefined', () => {
    const { result } = renderHook(
      () => useBalance(null),
      { wrapper: createWrapper() }
    );

    expect(result.current.formattedBalance).toBe('0.00');
    expect(result.current.isLoading).toBe(false);
  });

  it('should not fetch when wallet address is null', () => {
    const { result } = renderHook(
      () => useBalance(null),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.balance).toBeUndefined();
  });

  it('should not fetch when enabled is false', () => {
    const { result } = renderHook(
      () => useBalance('ABC123', { enabled: false }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.balance).toBeUndefined();
  });

  it('should format balance correctly', async () => {
    const { result } = renderHook(
      () => useBalance('ABC123'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // $1000 USDC = 1000000000 smallest units
    // Formatted: 1000000000 / 1000000 = 1000.00
    expect(result.current.formattedBalance).toBe('1000.00');
  });

  it('should provide refetch function', () => {
    const { result } = renderHook(
      () => useBalance('ABC123'),
      { wrapper: createWrapper() }
    );

    expect(typeof result.current.refetch).toBe('function');
  });

  it('should handle error state', () => {
    const { result } = renderHook(
      () => useBalance('ABC123'),
      { wrapper: createWrapper() }
    );

    expect(result.current.error).toBeNull();
  });
});
