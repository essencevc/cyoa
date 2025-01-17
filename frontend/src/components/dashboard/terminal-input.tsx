"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { generateStory } from "@/lib/story";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export function TerminalInput() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      setErrorMessage("");
      setIsLoading(true);
      try {
        await generateStory(input.trim());
        setInput(""); // Clear input after successful submission
        toast({
          title: "Success",
          description:
            "We've started generating your story. Once it's completed, you'll be able to play it in the story list below",
        });
        if (!session?.user.isAdmin) {
          const userCredits =
            queryClient.getQueryData<number>(["userCredits"]) ?? 0;

          queryClient.setQueryData(["userCredits"], userCredits - 1);
        }
      } catch (error) {
        // Optionally handle error state here
        setErrorMessage(
          `Unable to generate story, ${
            (error as Error).message ?? "Unknown error"
          }`
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
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
      </div>
      {isLoading && (
        <span className="text-[#39FF14] text-sm">Generating...</span>
      )}
      {errorMessage && (
        <span className="text-red-500 text-sm">{errorMessage}</span>
      )}
    </div>
  );
}
