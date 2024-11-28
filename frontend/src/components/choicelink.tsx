import { StoryNode } from "@/lib/schemas";
import { Link } from "react-router-dom";
import React from "react";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

type Props = {
  choice: StoryNode;
  storyId: string;
};

const ChoiceLink = ({ choice, storyId }: Props) => {
  return (
    <Link
      key={choice.id}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "text-center text-sm w-full my-2 text-black h-[80px] text-wrap no-underline font-normal px-4 relative"
      )}
      to={`/dashboard/story/${storyId}/${choice.id}`}
    >
      {choice.consumed && (
        <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-md">
          Previously Chosen
        </div>
      )}
      {choice.choice_text}
    </Link>
  );
};

export default ChoiceLink;
