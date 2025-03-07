import { Terminal } from "lucide-react";
import { NavigationLink } from "@/components/navigation/navigation-link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col">
      {/* Header */}
      <header className="border-b border-green-400/20">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex flex-col items-center sm:items-start">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-lg sm:text-xl font-bold">CYOA-OS v1.0</span>
            </div>
            <span className="mt-2 px-3 py-1 border border-green-400/40 rounded text-xs bg-green-400/10 shadow-sm">
              [ABOUT]
            </span>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <NavigationLink
              href="/"
              className="text-green-400 hover:text-green-300 text-sm sm:text-base"
            >
              Home
            </NavigationLink>
            <NavigationLink
              href="/dashboard"
              className="bg-green-400 text-black hover:bg-green-500 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg"
            >
              Go to App
            </NavigationLink>
          </div>
        </div>
      </header>

      {/* About Content */}
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-[#4ade80] text-3xl md:text-4xl lg:text-5xl font-bold">
            About CYOA-OS
          </h1>

          <div className="space-y-6 text-[#4ade80]/80">
            <p className="text-lg">
              CYOA-OS is a modern choose-your-own-adventure platform that
              combines interactive storytelling with AI-powered narrative
              generation.
            </p>

            <h2 className="text-[#4ade80] text-2xl font-bold mt-8">
              Built With
            </h2>
            <p className="text-lg">
              This website was built with{" "}
              <a
                href="https://restate.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4ade80] underline hover:text-[#4ade80]/80"
              >
                Restate
              </a>
              ,{" "}
              <a
                href="https://modal.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4ade80] underline hover:text-[#4ade80]/80"
              >
                Modal
              </a>
              , and{" "}
              <a
                href="https://aistudio.google.com/prompts/new_chat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4ade80] underline hover:text-[#4ade80]/80"
              >
                Gemini
              </a>
              , leveraging durable functions and serverless infrastructure to
              create a seamless interactive experience.
            </p>

            <h2 className="text-[#4ade80] text-2xl font-bold mt-8">
              Learn More
            </h2>
            <p className="text-lg">
              Read about how this project was created in the Restate blog post:{" "}
              <a
                href="https://restate.dev/blog/from-prompt-to-adventures-creating-games-with-llms-and-restates-durable-functions/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4ade80] underline hover:text-[#4ade80]/80"
              >
                From Prompt to Adventures: Creating Games with LLMs and
                Restate&apos;s Durable Functions
              </a>
              .
            </p>

            <div className="border border-green-400/20 rounded-lg p-6 bg-black/50 mt-8">
              <h3 className="text-[#4ade80] text-xl font-bold mb-4">
                Technology Stack
              </h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Next.js for the frontend</li>
                <li>Restate for durable functions and state management</li>
                <li>Modal for serverless GPU infrastructure</li>
                <li>Google Gemini for AI-powered story generation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-green-400/20 mt-auto">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">CYOA-OS v1.0</span>
            </div>
            <div className="text-green-400/60 text-xs md:text-sm mt-1 md:mt-0">
              © {new Date().getFullYear()} CYOA-OS. All rights reserved.
              <span className="block md:inline md:ml-1">
                Built with{" "}
                <a
                  href="https://restate.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300"
                >
                  Restate
                </a>
                ,{" "}
                <a
                  href="https://modal.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300"
                >
                  Modal
                </a>{" "}
                and{" "}
                <a
                  href="https://aistudio.google.com/prompts/new_chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300"
                >
                  Gemini
                </a>{" "}
                by{" "}
                <a
                  href="https://x.com/ivanleomk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300"
                >
                  @ivanleomk
                </a>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
