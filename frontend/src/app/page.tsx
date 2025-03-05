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
            <Terminal className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-lg sm:text-xl font-bold">CYOA-OS v1.0</span>
          </div>
          <Link
            href="/dashboard"
            className="bg-green-400 text-black hover:bg-green-500 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg"
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
      <section className="container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 text-center sm:text-left">
          <h1 className="text-[#4ade80] text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 animate-pulse">
            Ready to Begin Your Adventure?
          </h1>

          <p className="text-[#4ade80]/80 text-sm sm:text-base md:text-lg max-w-3xl mx-auto sm:mx-0 mb-6 sm:mb-8">
            Join our community of storytellers and embark on endless cyberpunk
            journeys.
          </p>
          <div className="pt-2 sm:pt-4 md:pt-6">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex justify-center items-center bg-[#4ade80]/10 hover:bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/20 px-4 py-3 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base transition-all duration-200 hover:border-[#4ade80]/40 hover:shadow-[0_0_20px_rgba(74,222,128,0.1)] active:transform active:scale-95"
            >
              Start Your Adventure
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-400/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">CYOA-OS v1.0</span>
            </div>
            <div className="text-green-400/60 text-xs md:text-sm mt-1 md:mt-0">
              © {new Date().getFullYear()} CYOA-OS. All rights reserved.
              <span className="block md:inline md:ml-1">
                (Built by @ivanleomk)
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
