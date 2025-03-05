"use client";
import { SelectStory } from "@/db/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState, useTransition } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { deleteStory } from "@/lib/story";
import { Loader2 } from "lucide-react";
import { NavigationLink } from "../navigation/navigation-link";
import { useNavigationProgress } from "../navigation/navigation-progress-provider";
import { useRouter } from "next/navigation";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, startDeletion] = useTransition();
  const queryClient = useQueryClient();
  const { startNavigation } = useNavigationProgress();
  const router = useRouter();

  if (!story) {
    return null;
  }

  const handleStartPlaythrough = () => {
    startNavigation();
    router.push(`/dashboard/story/${story.id}`);
  };

  const DeleteDialog = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-red-400/20 text-red-400 hover:bg-red-950/30 hover:text-red-400 bg-transparent w-full sm:w-auto px-6 py-2"
        >
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/90 border border-red-400/20 w-[95%] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-red-400">Delete Story</DialogTitle>
          <DialogDescription className="text-red-400/60">
            Are you sure you want to delete this story? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="outline"
            className="border-green-400/20 text-green-400/60 hover:bg-green-400/20 hover:text-green-400 bg-transparent transition-colors w-full sm:w-auto"
            onClick={() => setIsDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors w-full sm:w-auto"
            onClick={() => {
              startDeletion(() => {
                deleteStory(story.id);
                queryClient.setQueryData(["stories"], (oldData: Story[]) =>
                  oldData.filter((s) => s.id !== story.id)
                );
                queryClient.invalidateQueries({ queryKey: ["stories"] });
                setIsDialogOpen(false);
              });
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Deleting
              </>
            ) : (
              "Delete Story"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (story.status === "PROCESSING") {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <div>Processing...</div>
        <DeleteDialog />
      </div>
    );
  }

  if (story.status === "ERROR") {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="text-red-400">{story.errorMessage}</div>
        <DeleteDialog />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        <div className="w-full md:w-1/5 flex justify-center md:justify-start">
          <img
            src={`https://restate-story.s3.ap-southeast-1.amazonaws.com/${story.id}/banner.png`}
            alt={story.title as string}
            className="w-full max-w-[200px] md:w-32 md:h-32 object-cover rounded"
          />
        </div>
        <div className="w-full md:w-4/5">
          <p className="text-green-400/80 text-center md:text-left">
            {story.description}
          </p>
        </div>
      </div>
      <div className="py-2" />
      <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-2">
        <DeleteDialog />
        <Button
          className="rounded border border-green-400/30 px-6 py-2 text-sm hover:bg-green-950/30 w-full sm:w-auto text-center bg-transparent text-green-400"
          onClick={handleStartPlaythrough}
        >
          Start Playthrough
        </Button>
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
  const { startNavigation } = useNavigationProgress();
  const router = useRouter();

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

  useEffect(() => {
    setSelectedStory(null);
  }, [stories]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (selectedStory !== index) {
        setSelectedStory(index);
      } else {
        // Navigate to the story when pressing Enter on an already selected story
        startNavigation();
        router.push(`/dashboard/story/${stories[index].id}`);
      }
    }
  };

  const handleStoryClick = (index: number) => {
    if (selectedStory === index) {
      // Navigate to the story when clicking on an already selected story
      startNavigation();
      router.push(`/dashboard/story/${stories[index].id}`);
    } else {
      setSelectedStory(index);
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
        <div className="border border-green-500 p-2 sm:p-4">
          <div className="flex flex-col gap-4">USER STORIES</div>
          {selectedStory !== null && (
            <div className="max-w-2xl mx-auto">
              <div className="mt-4 mb-4 py-4 sm:py-8 bg-green-900/30 text-sm">
                <div className="mx-4 sm:mx-12">
                  <StoryCard story={stories[selectedStory]} />
                </div>
              </div>
            </div>
          )}
          {stories.map((story: Story, index: number) => (
            <div key={index}>
              <div
                onClick={() => handleStoryClick(index)}
                tabIndex={0}
                className="text-[#39FF14] text-sm pl-2 py-1 focus:outline-none focus:underline rounded transition-colors cursor-pointer hover:bg-green-900/20"
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#39FF14] break-all">
                    {story.title}
                  </span>
                  {getStatusIcon(story.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryList;
