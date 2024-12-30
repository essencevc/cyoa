"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
const choice = {
  story_id: "1",
  id: "1",
  parent_id: null,
  title: "Investigate the System",
  description: "Begin the investigation of the target system",
  is_terminal: false,
  children: [
    {
      id: "2",
      parent_id: "1",
      title: "Analyze Code Patterns",
      description:
        "Carefully probe the ancient system's defenses, looking for a way in without triggering any alarms",
      is_terminal: false,
    },
    {
      id: "3",
      parent_id: "1",
      title: "Deploy Stealth Probes",
      description:
        "Send out specialized probes designed to map the system architecture while maintaining a low profile",
      is_terminal: false,
    },
    {
      id: "4",
      parent_id: "1",
      title: "Attempt Direct Connection",
      description:
        "Risk a direct connection to the system's main interface, hoping to establish immediate control",
      is_terminal: false,
    },
    {
      id: "5",
      parent_id: "1",
      title: "Fry the System",
      description:
        "Risk a direct connection to the system's main interface, hoping to establish immediate control",
      is_terminal: false,
    },
  ],
};

const NodePage = () => {
  const [selectedChoice, setSelectedChoice] = useState(0);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowUp":
          setSelectedChoice((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "ArrowDown":
          setSelectedChoice((prev) =>
            prev < choice.children.length - 1 ? prev + 1 : prev
          );
          break;
        case "Enter":
          // TODO: Add choice selection
          console.log(`Selected: ${choice.children[selectedChoice]}`);
          break;
        case "Escape":
          router.push(`/dashboard/story/${choice.story_id}`);
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedChoice]);

  return (
    <div className="overflow-hidden">
      <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full  space-y-8">
        <div className="bg-black/20 rounded-lg border border-green-900/30 overflow-hidden">
          <div className="flex gap-8 p-6">
            <div className="relative w-2/5 h-48 rounded overflow-hidden">
              <img
                src="https://huggingface.co/prithivMLmods/Retro-Pixel-Flux-LoRA/resolve/main/images/RP1.png"
                alt="Story Banner"
                className="object-contain w-full h-full"
              />
            </div>

            <div className="flex-1 font-mono space-y-4">
              <div className="flex items-center gap-2 text-green-500">
                <span>{`>`}</span>
                <h2 className="text-lg">The Ancient Digital Entity</h2>
              </div>
              <p className="text-[#00FF00]/90 whitespace-pre-line text-sm leading-relaxed">
                In the depths of cyberspace, an ancient digital entity awakens.
                As a skilled hacker, you&apos;ve stumbled upon something that
                predates modern computing - a dormant AI system that seems to
                hold secrets of incredible power.
              </p>
              <div className="text-green-400/80 space-y-1 font-mono text-sm border-t border-green-900/30 pt-4">
                <p>↵ ENTER to confirm selection</p>
                <p>↑↓ ARROWS to navigate choices</p>
                <p className="text-green-400/50">ESC to return to main story</p>
              </div>
            </div>
          </div>

          <div className="border-t border-green-900/30 p-6 space-y-4">
            <div className="grid gap-3">
              {choice.children.map((choice, index) => (
                <motion.div
                  key={index}
                  className={`p-4 rounded-lg cursor-pointer ${
                    selectedChoice === index
                      ? "bg-green-950 border-2 border-green-500"
                      : "border border-green-900/30 hover:border-green-500/50"
                  }`}
                  onClick={() => setSelectedChoice(index)}
                  animate={{
                    transition: { duration: 0.3 },
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-mono">{`${
                      index + 1
                    }`}</span>
                    <h3
                      className={`font-mono transition-colors duration-300 ${
                        selectedChoice === index
                          ? "text-green-400"
                          : "text-green-300"
                      }`}
                    >
                      {choice.title}
                    </h3>
                  </div>
                  <AnimatePresence>
                    {selectedChoice === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-sm text-green-400/80 font-mono pl-6 mt-2">
                          {choice.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodePage;
