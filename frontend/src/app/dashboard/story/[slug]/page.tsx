"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import StoryChoices from "@/components/story/story-choice";
import { Button } from "@/components/ui/button";

const story = {
  story_id: 1,
  description:
    "In the depths of cyberspace, an ancient digital entity awakens. As a skilled hacker, you've stumbled upon something that predates modern computing - a dormant AI system that seems to hold secrets of incredible power.",
  choice: "Root: Ancient AI Discovery",
  image:
    "https://huggingface.co/prithivMLmods/Retro-Pixel-Flux-LoRA/resolve/main/images/RP1.png",
};

const choices = [
  {
    id: "1",
    parent_id: null,
    title: "Investigate the System",
    description: "Begin the investigation of the target system",
    is_terminal: false,
  },
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
    title: "Search for Backdoors",
    description: "Look for existing vulnerabilities in the system",
    is_terminal: true,
  },
  {
    id: "4",
    parent_id: null,
    title: "Contact Other Hackers",
    description: "Reach out to other hackers for assistance",
    is_terminal: false,
  },
  {
    id: "5",
    parent_id: "4",
    title: "Share Findings",
    description: "Share your discoveries with the hacking community",
    is_terminal: true,
  },
];

const StoryPage = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link href="/dashboard">
        <Button variant="ghost" className="text-green-400 hover:text-green-300">
          ← Back to Dashboard
        </Button>
      </Link>
      <div className="flex items-center justify-between border-b border-green-900/30 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-white">root@cyoa-os:~$</span>
          <span className="text-[#39FF14]">
            cyoa list-story --id {story.story_id} --metadata
          </span>
        </div>
      </div>

      {/* Main Content - Side by side on desktop, stacked on mobile */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Banner Image */}
        <div className="w-full md:w-1/2">
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-green-500/20">
            {story.image && (
              <img
                src={story.image}
                alt={story.choice}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Story Content */}
        <div className="w-full md:w-1/2 space-y-6 font-mono">
          <div className="space-y-2">
            <div className="text-sm opacity-70">
              [INFO] Story ID: {story.story_id}
            </div>
            <p className="leading-relaxed text-green-300">
              {story.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm opacity-70">[STATUS] Story Progress</div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300"
                onClick={() => {
                  if (
                    confirm("Are you sure you want to restart your progress?")
                  ) {
                    // Reset progress logic would go here
                    console.log("Resetting progress...");
                  }
                }}
              >
                Restart Progress
              </Button>
            </div>
            <Progress value={50} className="h-2 bg-green-950" />
            <div className="text-sm text-right opacity-70">50%</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-green-900/30 pb-2">
        <span className="text-white">root@cyoa-os:~$</span>
        <span className="text-[#39FF14]">
          cyoa list-story --id {story.story_id} --choices
        </span>
      </div>

      <StoryChoices choices={choices} />
    </div>
  );
};

export default StoryPage;
