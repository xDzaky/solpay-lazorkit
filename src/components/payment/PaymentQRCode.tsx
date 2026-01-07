// =============================================================================
// PAYMENT QR CODE COMPONENT
// =============================================================================
// Generates a QR code for Solana payment links. Users can scan this
// to quickly initiate a payment to a specific address.
// =============================================================================

"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download, QrCode, Share2 } from "lucide-react";
import { cn, formatUsdc, truncateAddress } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface PaymentQRCodeProps {
  /** Recipient wallet address */
  recipientAddress: string;
  /** Amount in USDC (optional) */
  amount?: number;
  /** Label for the payment (optional) */
  label?: string;
  /** Message/memo for the payment (optional) */
  message?: string;
  /** Plan ID for subscription tracking (optional) */
  planId?: string;
  /** Size of the QR code in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Show action buttons */
  showActions?: boolean;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Build a Solana Pay URL
 * 
 * Solana Pay URL format:
 * solana:<recipient>?amount=<amount>&spl-token=<mint>&label=<label>&message=<message>
 * 
 * @see https://docs.solanapay.com/spec
 */
function buildSolanaPayUrl(
  recipient: string,
  options: {
    amount?: number;
    splToken?: string;
    label?: string;
    message?: string;
    reference?: string;
  } = {}
): string {
  const url = new URL(`solana:${recipient}`);
  
  if (options.amount) {
    url.searchParams.set("amount", options.amount.toString());
  }
  
  if (options.splToken) {
    url.searchParams.set("spl-token", options.splToken);
  }
  
  if (options.label) {
    url.searchParams.set("label", options.label);
  }
  
  if (options.message) {
    url.searchParams.set("message", options.message);
  }
  
  if (options.reference) {
    url.searchParams.set("reference", options.reference);
  }
  
  return url.toString();
}

/**
 * Build web payment URL for our app
 */
function buildWebPaymentUrl(
  recipientAddress: string,
  options: {
    amount?: number;
    planId?: string;
    label?: string;
  } = {}
): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const url = new URL(`${baseUrl}/pay`);
  
  url.searchParams.set("to", recipientAddress);
  
  if (options.amount) {
    url.searchParams.set("amount", options.amount.toString());
  }
  
  if (options.planId) {
    url.searchParams.set("plan", options.planId);
  }
  
  if (options.label) {
    url.searchParams.set("label", options.label);
  }
  
  return url.toString();
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * PaymentQRCode
 * 
 * Generates a scannable QR code for payments. Supports:
 * - Solana Pay protocol URLs
 * - Web payment URLs for our platform
 * - Copy to clipboard
 * - Download as PNG
 * - Share functionality
 * 
 * @example
 * ```tsx
 * <PaymentQRCode
 *   recipientAddress="So1Pay..."
 *   amount={9.99}
 *   label="Pro Plan Subscription"
 * />
 * ```
 */
export function PaymentQRCode({
  recipientAddress,
  amount,
  label,
  message,
  planId,
  size = 200,
  className,
  showActions = true,
}: PaymentQRCodeProps) {
  // ─────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────
  const [copied, setCopied] = useState(false);
  const [urlType, setUrlType] = useState<"solana" | "web">("web");

  // ─────────────────────────────────────────────────────────────────────────
  // Computed URLs
  // ─────────────────────────────────────────────────────────────────────────
  
  // USDC mint address on devnet/mainnet
  const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  
  const solanaPayUrl = buildSolanaPayUrl(recipientAddress, {
    amount,
    splToken: amount ? USDC_MINT : undefined,
    label,
    message,
  });
  
  const webPaymentUrl = buildWebPaymentUrl(recipientAddress, {
    amount,
    planId,
    label,
  });
  
  const currentUrl = urlType === "solana" ? solanaPayUrl : webPaymentUrl;

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById("payment-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx?.drawImage(img, 0, 0);
      
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `solpay-qr-${label || "payment"}.png`;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Payment: ${label || "SolPay"}`,
          text: amount ? `Pay ${formatUsdc(amount)} USDC` : "Make a payment",
          url: webPaymentUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        console.error("Share failed:", err);
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-lg">
              <QrCode className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Payment QR Code</CardTitle>
              <CardDescription>
                Scan to pay {amount ? formatUsdc(amount) : ""} USDC
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* URL Type Toggle */}
        <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
          <button
            onClick={() => setUrlType("web")}
            className={cn(
              "flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              urlType === "web"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Web Link
          </button>
          <button
            onClick={() => setUrlType("solana")}
            className={cn(
              "flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              urlType === "solana"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Solana Pay
          </button>
        </div>

        {/* QR Code */}
        <div className="flex justify-center p-6 bg-white rounded-xl">
          <QRCodeSVG
            id="payment-qr-code"
            value={currentUrl}
            size={size}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#000000"
            imageSettings={{
              src: "/solana-logo.svg",
              height: 40,
              width: 40,
              excavate: true,
            }}
          />
        </div>

        {/* Payment Details */}
        <div className="space-y-2 p-3 bg-muted/30 rounded-lg text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">To</span>
            <span className="font-mono">{truncateAddress(recipientAddress)}</span>
          </div>
          {amount && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold text-green-400">{formatUsdc(amount)} USDC</span>
            </div>
          )}
          {label && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Label</span>
              <span>{label}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// SIMPLE QR CODE (for inline usage)
// =============================================================================

interface SimpleQRCodeProps {
  /** URL to encode */
  value: string;
  /** Size in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SimpleQRCode
 * 
 * A minimal QR code without the card wrapper, for inline usage
 */
export function SimpleQRCode({ value, size = 120, className }: SimpleQRCodeProps) {
  return (
    <div className={cn("inline-flex p-2 bg-white rounded-lg", className)}>
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        bgColor="#ffffff"
        fgColor="#000000"
      />
    </div>
  );
}
