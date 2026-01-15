"use client";

import { motion } from "framer-motion";
import { Wallet, Github, FileText, Send, ExternalLink, Heart } from "lucide-react";
import Link from "next/link";

const footerLinks = {
    product: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Send Payment", href: "/send" },
        { label: "Request Payment", href: "/request" },
        { label: "Split Bill", href: "/split" },
    ],
    resources: [
        { label: "Documentation", href: "/docs" },
        { label: "API Reference", href: "/docs" },
        { label: "Tutorials", href: "/docs" },
    ],
    community: [
        { label: "GitHub", href: "https://github.com/lazor-kit/lazor-kit", external: true },
        { label: "Telegram", href: "https://t.me/lazorkit", external: true },
        { label: "Discord", href: "https://discord.gg/lazorkit", external: true },
    ]
};

export function Footer() {
    return (
        <footer className="relative z-10 border-t border-slate-200 bg-gradient-to-b from-white to-slate-50">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <motion.div 
                            className="flex items-center gap-2 mb-4"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="h-8 w-8 bg-gradient-to-tr from-indigo-500 to-teal-400 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                                <Wallet className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-xl text-slate-900">SolPay</span>
                        </motion.div>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-sm">
                            The complete crypto payment solution built on Solana. 
                            Subscriptions, transfers, QR payments, and bill splitting — 
                            all without seed phrases.
                        </p>
                        
                        {/* Tech Stack Badges */}
                        <div className="flex flex-wrap gap-2">
                            {["Solana", "Lazorkit SDK", "USDC", "Passkeys"].map((tech) => (
                                <span 
                                    key={tech}
                                    className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.label}>
                                    <Link 
                                        href={link.href}
                                        className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Resources</h4>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link) => (
                                <li key={link.label}>
                                    <Link 
                                        href={link.href}
                                        className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Community Links */}
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Community</h4>
                        <ul className="space-y-3">
                            {footerLinks.community.map((link) => (
                                <li key={link.label}>
                                    <a 
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
                                    >
                                        {link.label}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm text-center md:text-left flex items-center gap-1">
                        Built with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> using{" "}
                        <a
                            href="https://docs.lazorkit.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline font-medium"
                        >
                            Lazorkit SDK
                        </a>
                    </p>

                    <p className="text-slate-400 text-xs">
                        © {new Date().getFullYear()} SolPay. Open source under MIT License.
                    </p>

                    <div className="flex items-center gap-4">
                        <motion.a
                            href="https://github.com/lazor-kit/lazor-kit"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }}
                            className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                        >
                            <Github className="w-4 h-4" />
                        </motion.a>
                        <motion.a
                            href="https://docs.lazorkit.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }}
                            className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                        >
                            <FileText className="w-4 h-4" />
                        </motion.a>
                        <motion.a
                            href="https://t.me/lazorkit"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1 }}
                            className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </motion.a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
