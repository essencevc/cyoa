"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { toggleStoryVisibility } from "@/lib/story";

interface StoryVisibilityToggleProps {
  storyId: string;
  isPublic: boolean;
}

export default function StoryVisibilityToggle({
  storyId,
  isPublic,
}: StoryVisibilityToggleProps) {
  const [isPublicState, setIsPublicState] = useState(isPublic);
  const [isCopied, setIsCopied] = useState(false);
  const toast = useToast();

  const handleToggle = async () => {
    const newState = !isPublicState;
    setIsPublicState(newState);
    await toggleStoryVisibility(storyId, isPublicState);
  };

  const handleCopy = async () => {
    const link = `${window.origin}/dashboard/story/${storyId}`;
    await navigator.clipboard.writeText(link);
    toast.toast({
      title: "Successfully Copied Link",
      description: "Share this link with your friends",
    });
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 justify-between font-mono text-[#3BFF85] w-full sm:w-[200px] border border-[#3BFF85]/20 rounded-md px-3 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center gap-1 sm:gap-2">
        <Switch
          checked={isPublicState}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-[#3BFF85] data-[state=checked]:border-[#3BFF85] h-4 w-7 sm:h-5 sm:w-9"
        />
        <span className="pl-4 w-[80px] sm:text-sm whitespace-nowrap">
          {isPublicState ? "Public" : "Private"}
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleCopy}
        disabled={!isPublicState}
        className={cn(
          isPublicState
            ? "bg-[#3BFF85]/20 text-[#3BFF85] cursor-pointer"
            : "bg-transparent cursor-not-allowed opacity-50",
          "transition transition-200 h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0 ml-1"
        )}
      >
        {isCopied ? (
          <Check className="h-3 w-3 sm:h-4 sm:w-4" />
        ) : (
          <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
        )}
      </Button>
    </div>
  );
}
