"use client";
import Link from "next/link";
import { Terminal } from "lucide-react";
import TerminalAnimation from "@/components/landing-page/terminal";
import stories from "@/constants/stories.json";
import Features from "@/components/landing-page/features";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <header className="border-b border-green-400/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-6 h-6" />
            <span className="text-xl font-bold">CYOA-OS v1.0</span>
          </div>
          <Link
            href="/dashboard"
            className="bg-green-400 text-black hover:bg-green-500 px-4 py-2 rounded-lg"
          >
            Go to App
          </Link>
        </div>
      </header>

      {/* Terminal Screen */}
      <TerminalAnimation stories={stories} />

      {/* Features */}
      <Features />

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-[#4ade80] text-5xl md:text-6xl lg:text-7xl font-bold mb-8 animate-pulse">
            Ready to Begin Your Adventure?
          </h1>

          <p className="text-[#4ade80]/80 text-lg md:text-xl max-w-3xl mb-12">
            Join our community of storytellers and embark on endless cyberpunk
            journeys.
          </p>
          <div className="pt-8">
            <Link
              href="/dashboard"
              className="bg-[#4ade80]/10 hover:bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/20 px-8 py-4 rounded-lg text-lg transition-all duration-200 hover:border-[#4ade80]/40 hover:shadow-[0_0_20px_rgba(74,222,128,0.1)] active:transform active:scale-95"
            >
              Start Your Adventure
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-400/20 mt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5" />
              <span>CYOA-OS v1.0</span>
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="text-green-400/80 hover:text-green-400">
                About
              </Link>
              <Link href="#" className="text-green-400/80 hover:text-green-400">
                Terms
              </Link>
              <Link href="#" className="text-green-400/80 hover:text-green-400">
                Privacy
              </Link>
            </div>
            <div className="text-green-400/60 text-sm">
              © {new Date().getFullYear()} CYOA-OS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
