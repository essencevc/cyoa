"use client";
import { SelectStory } from "@/db/schema";
import { ChevronDown, ChevronRight } from "lucide-react";
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

const StoryList = ({ command, logMessages, stories }: StoryListProps) => {
  const [selectedStory, setSelectedStory] = useState<number | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedStory(selectedStory === index ? null : index);
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
        <div className="mt-4">
          {stories.map((story, index) => (
            <div key={index}>
              <div
                onClick={() =>
                  setSelectedStory(selectedStory === index ? null : index)
                }
                tabIndex={0}
                className="text-[#39FF14] text-sm pl-2 py-1 focus:outline-none focus:bg-green-900/30 rounded transition-colors cursor-pointer"
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                <div className="flex items-center">
                  {selectedStory === index ? (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-1" />
                  )}
                  <span>{story.title}</span>
                </div>

                <div className="pl-4 text-green-500 line-clamp-1">
                  {story.description}
                </div>
              </div>
              {selectedStory === index && (
                <div className="mt-2 pl-6 pr-2 py-2 bg-green-900/20 rounded">
                  <div className="flex items-center justify-between gap-4">
                    <div className="w-24 h-24 shrink-0">
                      {story.image && (
                        <img
                          src={story.image}
                          alt={story.title as string}
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-green-400 text-sm mb-3">
                        {story.description}
                      </p>

                      <Link
                        href={`/dashboard/story/${story.id}`}
                        className="bg-green-900/30 hover:bg-green-900/50 text-[#39FF14] px-4 py-2 rounded transition-colors"
                      >
                        Start Playthrough
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryList;
