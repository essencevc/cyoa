"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { generateStory } from "@/lib/story";
import { STORY_PROMPTS } from "@/constants/prompts";

type Log = {
  type: "info" | "success" | "error";
  message: string;
};

export function TerminalInput() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const textareaRef = useRef(null);

  // Check if story generation is disabled via environment variable
  const isGenerationDisabled =
    process.env.NEXT_PUBLIC_DISABLE_GENERATION === "true";

  // Show a message if generation is disabled - only once when component mounts
  useEffect(() => {
    if (isGenerationDisabled && logs.length === 0) {
      setLogs([
        {
          message:
            "Story generation is currently disabled by the administrator. Please try again later.",
          type: "error",
        },
      ]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
  };

  useEffect(() => {
    if (textareaRef.current) {
      (textareaRef.current as HTMLTextAreaElement).style.height = "auto";
      (textareaRef.current as HTMLTextAreaElement).style.height =
        (textareaRef.current as HTMLTextAreaElement).scrollHeight + "px";
    }
  }, [input]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Don't process if generation is disabled
    if (isGenerationDisabled) {
      e.preventDefault();
      // Only add the log if it's not already present
      if (
        !logs.some(
          (log) =>
            log.message ===
            "Story generation is currently disabled by the administrator."
        )
      ) {
        addLog(
          "Story generation is currently disabled by the administrator.",
          "error"
        );
      }
      return;
    }

    if (e.key === "Enter" && input.trim()) {
      setLogs([]);
      addLog("Submitting prompt to backend", "info");
      setIsLoading(true);
      try {
        await generateStory(input.trim());
        setInput(""); // Clear input after successful submission
        addLog(
          "We've started generating your story. Once it's completed, you'll be able to play it in the story list below",
          "success"
        );
        if (!session?.user.isAdmin) {
          const userCredits =
            queryClient.getQueryData<number>(["userCredits"]) ?? 0;
          queryClient.setQueryData(["userCredits"], userCredits - 1);
        }
      } catch (error) {
        addLog(
          `Unable to generate story, ${
            (error as Error).message ?? "Unknown error"
          }`,
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const addLog = (message: string, type: Log["type"]) => {
    setLogs((prevLogs) => [...prevLogs, { message, type }]);
  };

  return (
    <div className="flex flex-col gap-2">
      {isGenerationDisabled && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-md p-3 mb-2">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">
              Story generation is currently disabled
            </span>
          </div>
          <p className="text-sm text-gray-300 mt-1 ml-7">
            The administrator has temporarily disabled story generation. You can
            still play existing stories.
          </p>
        </div>
      )}

      <div className="relative w-full font-mono">
        <div className="flex flex-col sm:flex-row items-start">
          <div className="text-white select-none pointer-events-none text-xs sm:text-sm whitespace-nowrap mb-1 sm:mb-0">
            root@cyoa-os:~$
          </div>
          <div className="w-full sm:ml-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={cn(
                "w-full bg-transparent border-none text-[#5dff3f] placeholder:text-green-800/50 focus-visible:ring-0 p-0 resize-none min-h-[24px] focus:outline-none text-xs sm:text-sm",
                isGenerationDisabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={isLoading || isGenerationDisabled}
              rows={1}
              style={{
                height: "auto",
                overflow: "hidden",
                textShadow: "0 0 5px rgba(93, 255, 63, 0.3)",
                lineHeight: "1.5",
                letterSpacing: "0.01em",
              }}
              placeholder={
                isGenerationDisabled ? "Story generation is disabled" : ""
              }
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-1 mb-2 gap-2 sm:gap-0">
        <div className="flex items-start sm:items-center gap-2 text-xs text-gray-400">
          <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5 sm:mt-0" />
          <span>
            {isGenerationDisabled
              ? "Story generation is currently disabled by the administrator."
              : 'Type your prompt and press Enter. Example: "A man goes to fight the dragon that has been plaguing his village"'}
          </span>
        </div>
        <Button
          onClick={() => {
            if (!isGenerationDisabled) {
              setInput(
                STORY_PROMPTS[Math.floor(Math.random() * STORY_PROMPTS.length)]
              );
            }
          }}
          variant="ghost"
          className={cn(
            "text-[#39FF14] hover:text-[#39FF14] hover:bg-[#39FF14]/10 transition-transform duration-200 hover:scale-105 flex items-center gap-2 px-3 py-1 h-auto text-xs self-end sm:self-auto",
            isGenerationDisabled &&
              "opacity-50 cursor-not-allowed pointer-events-none"
          )}
          disabled={isGenerationDisabled}
          title={
            isGenerationDisabled
              ? "Story generation is disabled"
              : "Generate Random Story"
          }
        >
          <Sparkles className="h-3 w-3" /> Random Prompt
        </Button>
      </div>

      <div className="flex flex-col gap-1 font-mono text-xs sm:text-sm">
        {logs.map((log, index) => (
          <div key={index} className="flex items-start gap-2">
            <span
              className={cn(
                "w-[60px] sm:w-[80px]",
                log.type === "error"
                  ? "text-red-500"
                  : log.type === "success"
                  ? "text-[#39FF14]"
                  : "text-blue-400"
              )}
            >
              [
              {log.type === "info"
                ? "Info"
                : log.type === "success"
                ? "Success"
                : "Error"}
              ]
            </span>
            <span className="text-white">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
