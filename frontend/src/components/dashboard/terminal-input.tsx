"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { generateStory } from "@/lib/story";

export function TerminalInput() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      setIsLoading(true);
      try {
        await generateStory(input.trim());
        setInput(""); // Clear input after successful submission
      } catch (error) {
        console.error("Error:", error);
        // Optionally handle error state here
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-white">root@cyoa-os:~$</span>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent border-none text-[#39FF14] placeholder:text-green-800/50 focus-visible:ring-0 h-8 p-0"
        placeholder="Write a story about... (press Enter)"
        disabled={isLoading}
      />
      {isLoading && (
        <span className="text-[#39FF14] text-sm">Generating...</span>
      )}
    </div>
  );
}
