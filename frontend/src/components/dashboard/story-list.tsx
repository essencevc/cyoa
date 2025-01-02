"use client";
import { SelectStory } from "@/db/schema";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React, { useState } from "react";

type Story = {
  id: string;
  title: string | null;
  author?: string | null;
  description: string | null;
  image: string | null;
  status: SelectStory["status"];
  errorMessage: string | null;
};

type StoryListProps = {
  command: string;
  logMessages: {
    logType: LogType;
    message: string;
  }[];
  stories: Story[];
};

type LogType = "DEBUG" | "INFO" | "WARN" | "ERROR" | "SUCCESS";

const LOG_COLORS: Record<LogType, string> = {
  DEBUG: "text-gray-400",
  INFO: "text-blue-400",
  WARN: "text-yellow-400",
  ERROR: "text-red-400",
  SUCCESS: "text-green-400",
};

const CommandLogger = ({
  logType,
  message,
}: {
  logType: LogType;
  message: string;
}) => {
  return (
    <div className="text-sm space-y-1">
      <div className={LOG_COLORS[logType]}>
        [{logType}] {message}
      </div>
    </div>
  );
};

const StoryCard = ({ story }: { story: Story }) => {
  return (
    <div>
      <div className="flex gap-8">
        <div className="w-1/5">
          <img
            src={`https://restate-story.s3.ap-southeast-1.amazonaws.com/${story.id}/banner.png`}
            alt={story.title as string}
            className="w-32 h-32 object-cover rounded"
          />
        </div>
        <div className="w-4/5">
          <p className="text-green-400/80">{story.description}</p>
        </div>
      </div>
      <div className="py-2" />
      <div className="flex justify-end items-center gap-2">
        <Link
          href={`/dashboard/story/${story.id}`}
          className="rounded border border-green-400/30 px-6 py-2 text-sm hover:bg-green-950/30"
          tabIndex={0}
        >
          Start Playthrough
        </Link>
      </div>
    </div>
  );
};

const StoryList = ({
  command,
  logMessages,
  stories: initialStories,
}: StoryListProps) => {
  const [selectedStory, setSelectedStory] = useState<number | null>(null);

  const { data: stories } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const response = await fetch("/api/stories");
      if (!response.ok) {
        throw new Error("Failed to fetch stories");
      }
      return response.json();
    },
    refetchInterval: 60000, // Refetch every 60 seconds
    initialData: initialStories, // Use prop stories as initial data
  });

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedStory(selectedStory === index ? null : index);
    }
  };

  const getStatusIcon = (status: Story["status"]) => {
    switch (status) {
      case "GENERATED":
        return "●";
      case "PROCESSING":
        return "○";
      case "ERROR":
        return "⨂";
      default:
        throw new Error("Invalid story status");
    }
  };

  return (
    <div className="font-mono">
      <div className="flex items-center gap-2 border-b border-green-900/30 pb-2">
        <span className="text-white">root@cyoa-os:~$</span>
        <span className="text-[#39FF14]">{command}</span>
      </div>
      <div className="py-2 space-y-0.5">
        <div className="text-sm space-y-1">
          {logMessages.map((logMessage, index) => (
            <CommandLogger
              key={index}
              logType={logMessage.logType}
              message={logMessage.message}
            />
          ))}
        </div>
        <div className="py-4" />
        <div className="border border-green-500 p-4">
          <div className="flex flex-col gap-4">USER STORIES</div>
          {stories.map((story: Story, index: number) => (
            <div key={index}>
              <div
                onClick={() =>
                  setSelectedStory(selectedStory === index ? null : index)
                }
                tabIndex={0}
                className="text-[#39FF14] text-sm pl-2 py-1 focus:outline-none focus:underline rounded transition-colors cursor-pointer"
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#39FF14]">{story.title}</span>
                  {getStatusIcon(story.status)}
                </div>
              </div>
            </div>
          ))}
          {selectedStory !== null && (
            <div className="max-w-2xl mx-auto">
              <div className="mt-4 py-8 bg-green-900/30 text-sm">
                <div className="mx-12">
                  <StoryCard story={stories[selectedStory]} />
                </div>
              </div>
            </div>
          )}
          {/* {selectedStory !== null && (
            <div className="max-w-2xl mx-auto">
              <div className="mt-4 py-8 bg-green-900/30 text-sm">
                <div className="mx-12">
                  <div className="flex gap-8">
                    <div className="w-1/5">
                      <img
                        src={`https://restate-story.s3.ap-southeast-1.amazonaws.com/${stories[selectedStory].id}/banner.png`}
                        alt={stories[selectedStory].title as string}
                        className="w-32 h-32 object-cover rounded image-rendering-pixelated"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>
                    <div className="w-4/5">
                      <p className="text-green-400/80">
                        {stories[selectedStory].description}
                      </p>
                    </div>
                  </div>
                  <div className="py-2" />

                  <div className="flex justify-end items-center gap-2">
                    {stories[selectedStory].status === "GENERATED" && (
                      <Link
                        href={`/dashboard/story/${stories[selectedStory].id}`}
                        className="rounded border border-green-400/30 px-6 py-2 text-sm hover:bg-green-950/30"
                        tabIndex={0}
                      >
                        Start Playthrough
                      </Link>
                    )}

                    {stories[selectedStory].status === "ERROR" && (
                      <div className="text-red-500 text-sm flex items-center">
                        {stories[selectedStory].errorMessage}
                      </div>
                    )}

                    {stories[selectedStory].status === "PROCESSING" && (
                      <div className="rounded border border-yellow-400/30 px-6 py-2 text-sm cursor-not-allowed flex items-center">
                        Processing...
                      </div>
                    )}
                    <button className="rounded border border-red-400/30 px-6 py-2 text-sm text-red-400 hover:bg-red-950/30">
                      Delete Story
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default StoryList;
