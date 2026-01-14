// =============================================================================
// TEST SETUP
// =============================================================================
// Global test setup for Vitest with React Testing Library
// =============================================================================

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock @lazorkit/wallet
vi.mock('@lazorkit/wallet', () => ({
  useWallet: () => ({
    smartWalletPubkey: null,
    isConnected: false,
    isConnecting: false,
    isLoading: false,
    isSigning: false,
    error: null,
    account: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    signTransaction: vi.fn(),
    signAndSendTransaction: vi.fn(),
    createPasskeyOnly: vi.fn(),
    createSmartWalletOnly: vi.fn(),
    reconnect: vi.fn(),
  }),
  LazorkitProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock PublicKey for Solana
vi.mock('@solana/web3.js', async () => {
  const actual = await vi.importActual('@solana/web3.js');
  return {
    ...actual,
    PublicKey: class MockPublicKey {
      private _key: string;
      constructor(key: string) {
        this._key = key;
      }
      toString() {
        return this._key;
      }
      toBase58() {
        return this._key;
      }
      static isOnCurve() {
        return true;
      }
    },
    Connection: vi.fn().mockImplementation(() => ({
      getBalance: vi.fn().mockResolvedValue(1000000000),
      getTokenAccountBalance: vi.fn().mockResolvedValue({
        value: { amount: '1000000000', decimals: 6 },
      }),
    })),
  };
});

// Suppress console errors in tests
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
