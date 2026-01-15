import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { SubscriptionDashboard } from "@/components/SubscriptionDashboard";
import { TransactionHistory } from "@/components/TransactionHistory";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16">
        <Hero />
        <SubscriptionDashboard />
        <Features />
        <Pricing />
        <TransactionHistory />
        <Footer />
      </div>
    </div>
  );
}
