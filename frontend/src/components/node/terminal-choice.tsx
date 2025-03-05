"use client";

import { SelectStoryChoice } from "@/db/schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AutoAudioPlayer from "./audio-player";
import { HoverCard } from "@radix-ui/react-hover-card";
import { HoverCardContent, HoverCardTrigger } from "../ui/hover-card";

type TerminalChoiceProps = {
  choice: SelectStoryChoice;
};

const TerminalChoice = ({ choice }: TerminalChoiceProps) => {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push(
          `/dashboard/story/${choice.storyId}?prev_node=${choice.id}`
        );
      } else if (e.key === "Backspace") {
        router.push("/dashboard");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, choice.storyId, choice.id]);

  return (
    <div className="flex items-center justify-center bg-black p-2 sm:p-4">
      <div className="flex flex-col w-full max-w-4xl bg-black/20 rounded-lg border border-green-900/30 overflow-hidden p-3 sm:p-6">
        <div className="text-2xl sm:text-4xl text-green-500 font-mono animate-pulse mb-4 sm:mb-6 text-center">
          END OF STORY
        </div>
        <div className="flex flex-col md:flex-row gap-4 sm:gap-8">
          {/* For larger screens - use HoverCard */}
          <div className="hidden md:block">
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="w-full h-48 rounded overflow-hidden relative">
                  <img
                    src={`https://restate-story.s3.ap-southeast-1.amazonaws.com/${choice.storyId}/${choice.id}.png`}
                    alt="Story Banner"
                    className="object-contain w-full h-full"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-green-400 text-xs py-1 px-2 opacity-100 text-center">
                    Hover to see image prompt
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-black/90 border border-green-500/20 p-4">
                <p className="text-sm text-green-400 font-mono leading-relaxed">
                  {choice.image_prompt}
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* For mobile screens - show image and prompt directly */}
          <div className="md:hidden flex flex-col gap-2 w-full">
            <div className="w-full h-36 sm:h-48 rounded overflow-hidden">
              <img
                src={`https://restate-story.s3.ap-southeast-1.amazonaws.com/${choice.storyId}/${choice.id}.png`}
                alt="Story Banner"
                className="object-contain w-full h-full"
              />
            </div>
            <div className="bg-black/60 border border-green-500/20 rounded p-2 mt-1">
              <p className="text-xs text-green-400 font-mono leading-relaxed">
                <span className="text-green-500 font-bold">Image Prompt:</span>{" "}
                {choice.image_prompt}
              </p>
            </div>
          </div>

          <div className="flex-1 font-mono space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl text-green-400">
              {choice.choice_title}
            </h2>
            <p className="text-green-400/80 whitespace-pre-line text-xs sm:text-sm leading-relaxed">
              {choice.description}
            </p>
            <AutoAudioPlayer story_id={choice.storyId} node_id={choice.id} />
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-col items-start justify-start space-y-3">
          <div
            className="flex items-center gap-2 group cursor-pointer"
            onClick={() =>
              router.push(
                `/dashboard/story/${choice.storyId}?prev_node=${choice.id}`
              )
            }
          >
            <kbd className="px-3 py-1 bg-black border border-green-500/40 rounded text-green-400 font-mono text-xs relative overflow-hidden min-w-[60px] text-center">
              <span className="relative z-10 flex items-center justify-center">
                ESC
              </span>
              <span className="absolute inset-0 bg-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </kbd>
            <span className="text-green-400/70 flex items-center group-hover:text-green-400 transition-colors duration-200">
              <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                ›
              </span>
              to return to main story
            </span>
          </div>

          <div
            className="flex items-center gap-2 group cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            <kbd className="px-3 py-1 bg-black border border-green-500/40 rounded text-green-400 font-mono text-xs relative overflow-hidden min-w-[60px] text-center">
              <span className="relative z-10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1 inline-block"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16l-4-4m0 0l4-4m-4 4h18"
                  />
                </svg>
                BKSP
              </span>
              <span className="absolute inset-0 bg-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </kbd>
            <span className="text-green-400/70 flex items-center group-hover:text-green-400 transition-colors duration-200">
              <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                ›
              </span>
              to return to dashboard
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalChoice;
