"use client";
import { SelectStoryChoice } from "@/db/schema";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
type ChoiceInterfaceProps = {
  title: string;
  description: string;

  choices: SelectStoryChoice[];
};

const ChoiceInterface = ({
  title,
  description,
  choices,
}: ChoiceInterfaceProps) => {
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
            prev < choices.length - 1 ? prev + 1 : prev
          );
          break;
        case "Enter":
          router.push(`/dashboard/story/choice/${choices[selectedChoice].id}`);
          break;
        case "Escape":
          router.push(`/dashboard/story/${choice.storyId}`);
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedChoice]);

  return (
    <div className="flex items-center justify-center bg-black p-4">
      <div className="flex flex-col max-w-4xl w-full bg-black/20 rounded-lg border border-green-900/30">
        <div className="flex flex-col md:flex-row gap-8 p-6">
          <div className="w-full md:w-2/5 h-48 rounded overflow-hidden">
            <img
              src="https://huggingface.co/prithivMLmods/Retro-Pixel-Flux-LoRA/resolve/main/images/RP1.png"
              alt="Story Banner"
              className="object-contain w-full h-full"
            />
          </div>

          <div className="flex-1 font-mono space-y-4">
            <div className="flex items-center gap-2 text-green-500">
              <span>{`>`}</span>
              <h2 className="text-lg">{title}</h2>
            </div>
            <p className="text-[#00FF00]/90 whitespace-pre-line text-sm leading-relaxed ">
              {description}
            </p>
            <div className="text-green-400/80 space-y-1 font-mono text-sm border-t border-green-900/30 pt-4">
              <p>↵ ENTER to confirm selection</p>
              <p>↑↓ ARROWS to navigate choices</p>
              <p className="text-green-400/50">ESC to return to main story</p>
            </div>
          </div>
        </div>
        <div className="border-t border-green-900/30 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            <div className="space-y-4">
              {choices.map((choice, index) => (
                <motion.div
                  key={index}
                  className={`p-4 rounded-lg cursor-pointer ${
                    selectedChoice === index
                      ? "bg-green-950 border-2 border-green-500"
                      : "border border-green-900/30 hover:border-green-500/50"
                  }`}
                  onClick={() => setSelectedChoice(index)}
                  layout
                  transition={{
                    layout: { duration: 0.3, ease: "easeInOut" },
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
                  <AnimatePresence initial={false}>
                    {selectedChoice === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
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

export default ChoiceInterface;
