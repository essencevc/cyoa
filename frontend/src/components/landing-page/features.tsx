export default function TerminalFeatureList() {
  return (
    <section className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto border border-green-400/20 rounded-lg p-6 backdrop-blur-sm font-mono leading-relaxed space-y-6">
        <div className="mb-6">
          <span className="text-white whitespace-nowrap shrink-0">
            root@cyoa-os:~$ ./show-features --interactive
          </span>
        </div>

        <div className="space-y-4">
          <div className="group">
            <div className="flex items-start space-x-3">
              <span className="opacity-60">$</span>
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[#4ade80] font-bold">
                    --create-story
                  </span>
                  <span className="text-[#4ade80]/60">[primary]</span>
                </div>
                <p className="text-[#4ade80]/80 pl-4">
                  Create branching narratives where every choice matters. Watch
                  your story come to life with pixel art.
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#4ade80]/10 my-4" />

          <div className="group">
            <div className="flex items-start space-x-3">
              <span className="opacity-60">$</span>
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[#4ade80] font-bold">--ai-assist</span>
                  <span className="text-[#4ade80]/60">[experimental]</span>
                </div>
                <p className="text-[#4ade80]/80 pl-4">
                  Let our AI assist you in crafting unique cyberpunk adventures
                  with stunning pixel art visuals.
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#4ade80]/10 my-4" />

          <div className="group">
            <div className="flex items-start space-x-3">
              <span className="opacity-60">$</span>
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[#4ade80] font-bold">--community</span>
                  <span className="text-[#4ade80]/60">[beta]</span>
                </div>
                <p className="text-[#4ade80]/80 pl-4">
                  Explore a growing collection of community-created adventures.
                  Share your own stories with others.
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#4ade80]/10 my-4" />

          <div className="mt-6 pl-4 text-[#4ade80]/60">
            <p>Run with --help for detailed usage information</p>
            <p className="mt-1">Version 1.0.0-alpha</p>
          </div>
        </div>
      </div>
    </section>
  );
}
