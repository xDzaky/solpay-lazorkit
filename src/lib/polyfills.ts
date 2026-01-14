// =============================================================================
// POLYFILLS FOR SOLANA & LAZORKIT SDK
// =============================================================================
// This file must be imported at the top of your root layout to ensure
// Node.js globals are available in the browser environment.
// =============================================================================

// Only run in browser environment
if (typeof window !== 'undefined') {
  // Import Buffer from installed package
  const { Buffer } = require('buffer');
  
  // Polyfill global variables
  (window as any).global = window;
  (window as any).Buffer = Buffer;
  (window as any).process = require('process/browser');
}

export {};
