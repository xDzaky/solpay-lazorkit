// =============================================================================
// ABOUT PAGE
// =============================================================================
// Project description and technology overview
// =============================================================================

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Shield, 
  Zap, 
  Fingerprint, 
  Wallet,
  Globe,
  Code,
  Github,
  ExternalLink,
  Sparkles,
  Users,
  Lock,
  Cpu
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const features = [
    {
      icon: Fingerprint,
      title: "Passkey Authentication",
      description: "Login using biometrics like Face ID, Touch ID, or Windows Hello. No passwords or seed phrases to remember.",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      icon: Zap,
      title: "Gasless Transactions",
      description: "All transaction fees are sponsored by Lazorkit's Paymaster. Send and receive without worrying about gas.",
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      icon: Shield,
      title: "Hardware Security",
      description: "Private keys are stored in your device's Secure Enclave, protected by hardware-level security.",
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      icon: Wallet,
      title: "Smart Wallet",
      description: "Lazorkit creates a smart contract wallet on Solana that you control with your passkey.",
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
  ];

  const techStack = [
    { name: "Next.js 14", description: "React framework with App Router" },
    { name: "Lazorkit SDK", description: "Passkey authentication & smart wallets" },
    { name: "Solana Web3.js", description: "Blockchain interaction" },
    { name: "Tailwind CSS", description: "Utility-first styling" },
    { name: "TypeScript", description: "Type-safe development" },
    { name: "Prisma", description: "Database ORM" },
  ];

  const useCases = [
    {
      title: "Subscription Payments",
      description: "Pay for services with recurring USDC payments",
      icon: Users,
    },
    {
      title: "Split Bills",
      description: "Divide expenses with friends instantly",
      icon: Sparkles,
    },
    {
      title: "P2P Transfers",
      description: "Send SOL or USDC to anyone with an address",
      icon: Zap,
    },
    {
      title: "Payment Requests",
      description: "Generate QR codes to request payments",
      icon: Globe,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-40 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-100/30 rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Built with Lazorkit SDK
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">SolPay</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              SolPay demonstrates how to build passwordless, gasless payment experiences 
              on Solana using Lazorkit's passkey smart wallet infrastructure.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
              >
                Try the App
              </Link>
              <a
                href="https://github.com/xDzaky/solpay-lazorkit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
              >
                <Github className="w-5 h-5" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Key Features</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              SolPay showcases the powerful capabilities of Lazorkit SDK
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-2xl border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Use Cases</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              What you can do with SolPay
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl border border-slate-200 text-center hover:border-indigo-300 transition-colors"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <useCase.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  {useCase.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Technology Stack</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Built with modern, production-ready technologies
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200"
              >
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{tech.name}</h4>
                  <p className="text-sm text-slate-500">{tech.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              The magic behind passwordless Web3
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, title: "Create Passkey", description: "Register with biometrics on your device", icon: Fingerprint },
              { step: 2, title: "Smart Wallet", description: "Lazorkit creates a wallet on Solana", icon: Wallet },
              { step: 3, title: "Sign Transactions", description: "Approve with Face ID or Touch ID", icon: Lock },
              { step: 4, title: "Gasless TX", description: "Paymaster sponsors all fees", icon: Sparkles },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Ready to try it?
          </h2>
          <p className="text-slate-600 mb-8">
            Experience the future of Web3 payments with SolPay
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/docs"
              className="flex items-center gap-2 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
            >
              <Code className="w-5 h-5" />
              Read the Docs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
