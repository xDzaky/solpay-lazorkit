// =============================================================================
// SPLIT BILL PAGE
// =============================================================================
// Split bills between multiple people with equal or custom amounts
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@lazorkit/wallet";
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  X, 
  Send,
  Loader2,
  Check,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSendTransaction } from "@/hooks/useSendTransaction";
import { useRealBalance } from "@/hooks/useRealBalance";
import { 
  MOCK_MODE, 
  simulateDelay,
  addMockTransaction 
} from "@/lib/mock-mode";
import confetti from "canvas-confetti";

type TokenType = "SOL" | "USDC";

interface SplitPerson {
  id: string;
  name: string;
  address: string;
  share: number;
}

export default function SplitPage() {
  const { smartWalletPubkey } = useWallet();
  const router = useRouter();
  const { usdcBalance, solBalance } = useRealBalance();
  const { sendSOL, sendUSDC, isProcessing } = useSendTransaction();
  
  const [token, setToken] = useState<TokenType>("USDC");
  const [totalAmount, setTotalAmount] = useState("");
  const [description, setDescription] = useState("");
  const [people, setPeople] = useState<SplitPerson[]>([]);
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonAddress, setNewPersonAddress] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const walletAddress = smartWalletPubkey?.toString() || "";
  const balance = token === "SOL" ? solBalance : usdcBalance;
  const total = parseFloat(totalAmount) || 0;
  const splitCount = people.length + 1; // +1 for yourself
  const perPersonShare = splitCount > 0 ? total / splitCount : 0;
  const yourShare = total - (perPersonShare * people.length);

  const addPerson = () => {
    if (!newPersonName.trim() || !newPersonAddress.trim()) return;
    
    // Basic address validation (44 chars for Solana)
    if (newPersonAddress.length < 32 || newPersonAddress.length > 44) {
      setError("Invalid Solana address");
      return;
    }

    const newPerson: SplitPerson = {
      id: `person_${Date.now()}`,
      name: newPersonName.trim(),
      address: newPersonAddress.trim(),
      share: perPersonShare,
    };

    setPeople([...people, newPerson]);
    setNewPersonName("");
    setNewPersonAddress("");
    setShowAddModal(false);
    setError("");
  };

  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSendSplitRequests = async () => {
    if (people.length === 0) {
      setError("Add at least one person to split with");
      return;
    }

    if (total <= 0) {
      setError("Enter a valid amount");
      return;
    }

    if (total > balance) {
      setError(`Insufficient balance. You have ${balance.toFixed(2)} ${token}`);
      return;
    }

    setIsSending(true);
    setError("");

    try {
      // In a real app, this would send payment requests
      // For demo, we'll simulate sending individual payments
      if (MOCK_MODE) {
        await simulateDelay(2000);
        
        // Add mock transactions for each person
        for (const person of people) {
          addMockTransaction({
            fromAddress: walletAddress,
            toAddress: person.address,
            amount: perPersonShare,
            token: token,
            description: `Split: ${description || "Bill split"} - ${person.name}`,
            type: "SEND",
          });
        }
        
        triggerConfetti();
        setSuccess(true);
      } else {
        // Real mode - send actual transactions
        for (const person of people) {
          if (token === "SOL") {
            await sendSOL(person.address, perPersonShare, description);
          } else {
            await sendUSDC(person.address, perPersonShare, description);
          }
        }
        
        triggerConfetti();
        setSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send split requests");
    } finally {
      setIsSending(false);
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!mounted) return null;

  if (success) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Split Sent! 🎉</h1>
          <p className="text-slate-600 mb-8">
            Successfully sent {perPersonShare.toFixed(2)} {token} to {people.length} {people.length === 1 ? 'person' : 'people'}
          </p>
          
          <div className="bg-slate-50 rounded-xl p-4 mb-8">
            <h3 className="font-medium text-slate-900 mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount</span>
                <span className="font-medium">{total.toFixed(2)} {token}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Split Between</span>
                <span className="font-medium">{splitCount} people</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Per Person</span>
                <span className="font-medium">{perPersonShare.toFixed(2)} {token}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/transactions"
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-center"
            >
              View Transactions
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Split Bill</h1>
          <p className="text-slate-500 text-sm">Divide expenses with friends</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Token Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Token
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setToken("SOL")}
              className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                token === "SOL"
                  ? "border-purple-500 bg-purple-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="font-medium">◎ SOL</div>
              <div className="text-xs text-slate-500 mt-1">{solBalance.toFixed(4)} available</div>
            </button>
            <button
              onClick={() => setToken("USDC")}
              className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                token === "USDC"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="font-medium">$ USDC</div>
              <div className="text-xs text-slate-500 mt-1">${usdcBalance.toFixed(2)} available</div>
            </button>
          </div>
        </div>

        {/* Total Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Total Amount
          </label>
          <div className="relative">
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-20"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
              {token}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Dinner at Restaurant 🍕"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Split With */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-700">
              Split With
            </label>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Add Person
            </button>
          </div>

          {people.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">
                No one added yet. Add people to split with.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {people.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {person.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{person.name}</p>
                      <p className="text-xs text-slate-500 font-mono">
                        {formatAddress(person.address)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {perPersonShare.toFixed(2)} {token}
                      </p>
                      <p className="text-xs text-slate-500">Share</p>
                    </div>
                    <button
                      onClick={() => removePerson(person.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Your Share */}
        {total > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Your Share</p>
                <p className="text-2xl font-bold text-slate-900">
                  {yourShare.toFixed(2)} {token}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Total Split</p>
                <p className="font-medium text-slate-900">
                  {splitCount} {splitCount === 1 ? 'person' : 'people'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Gas Notice */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Gas fees sponsored by Lazorkit</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Link
            href="/dashboard"
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            onClick={handleSendSplitRequests}
            disabled={isSending || people.length === 0 || total <= 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Split ({people.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add Person Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Add Person</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="e.g., Alice"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={newPersonAddress}
                  onChange={(e) => setNewPersonAddress(e.target.value)}
                  placeholder="Solana address..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                />
              </div>

              <button
                onClick={addPerson}
                disabled={!newPersonName.trim() || !newPersonAddress.trim()}
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
              >
                Add to Split
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
