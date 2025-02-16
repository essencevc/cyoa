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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, choice.storyId]);

  return (
    <div className="flex items-center justify-center bg-black p-4">
      <div className="flex flex-col max-w-4xl w-full bg-black/20 rounded-lg border border-green-900/30 overflow-hidden p-6">
        <div className="text-4xl text-green-500 font-mono animate-pulse mb-6">
          END OF STORY
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="w-full md:w-2/5 h-48 rounded overflow-hidden relative">
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

          <div className="flex-1 font-mono space-y-4">
            <h2 className="text-2xl text-green-400">{choice.choice_title}</h2>
            <p className="text-[#00FF00]/90 whitespace-pre-line text-sm leading-relaxed ">
              {choice.description}
            </p>
            <AutoAudioPlayer story_id={choice.storyId} node_id={choice.id} />
            <div className="text-green-400/80 space-y-1 font-mono text-sm border-t border-green-900/30 pt-4">
              <p className="text-green-400/50">ESC to return to main story</p>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/dashboard"
            className="inline-block text-green-400 hover:text-green-300 border border-green-500 rounded px-4 py-2 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TerminalChoice;
