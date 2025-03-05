export default function TerminalFeatureList() {
  return (
    <section className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto border border-green-400/20 rounded-lg p-4 sm:p-6 backdrop-blur-sm font-mono leading-relaxed space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-6 overflow-x-auto">
          <span className="text-white break-words sm:whitespace-nowrap inline-block">
            root@cyoa-os:~$ ./show-features --interactive
          </span>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="group">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <span className="opacity-60 flex-shrink-0">$</span>
              <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[#4ade80] font-bold">
                    --create-story
                  </span>
                  <span className="text-[#4ade80]/60 text-sm">[primary]</span>
                </div>
                <p className="text-[#4ade80]/80 text-sm sm:text-base">
                  Create branching narratives where every choice matters. Watch
                  your story come to life with pixel art.
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#4ade80]/10 my-3 sm:my-4" />

          <div className="group">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <span className="opacity-60 flex-shrink-0">$</span>
              <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[#4ade80] font-bold">--ai-assist</span>
                  <span className="text-[#4ade80]/60 text-sm">
                    [experimental]
                  </span>
                </div>
                <p className="text-[#4ade80]/80 text-sm sm:text-base">
                  Let our AI assist you in crafting unique cyberpunk adventures
                  with stunning pixel art visuals.
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#4ade80]/10 my-3 sm:my-4" />

          <div className="group">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <span className="opacity-60 flex-shrink-0">$</span>
              <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[#4ade80] font-bold">--community</span>
                  <span className="text-[#4ade80]/60 text-sm">[beta]</span>
                </div>
                <p className="text-[#4ade80]/80 text-sm sm:text-base">
                  Explore a growing collection of community-created adventures.
                  Share your own stories with others.
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#4ade80]/10 my-3 sm:my-4" />

          <div className="mt-4 sm:mt-6 pl-2 sm:pl-4 text-[#4ade80]/60 text-sm sm:text-base">
            <p>Run with --help for detailed usage information</p>
            <p className="mt-1">Version 1.0.0-alpha</p>
          </div>
        </div>
      </div>
    </section>
  );
}
