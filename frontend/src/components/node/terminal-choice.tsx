"use client";

import { SelectStoryChoice } from "@/db/schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type TerminalChoiceProps = {
  choice: SelectStoryChoice;
};

const TerminalChoice = ({ choice }: TerminalChoiceProps) => {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push(`/dashboard/story/${choice.storyId}`);
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
          <div className="w-full md:w-2/5 h-48 rounded overflow-hidden">
            <img
              src={`https://restate-story.s3.ap-southeast-1.amazonaws.com/${choice.storyId}/${choice.id}.png`}
              alt="Story Ending"
              className="object-contain w-full h-full rounded-lg"
            />
          </div>
          <div className="flex-1 font-mono space-y-4">
            <h2 className="text-2xl text-green-400">{choice.title}</h2>
            <p className="text-[#00FF00]/90 whitespace-pre-line text-sm leading-relaxed ">
              {choice.description}
            </p>
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
