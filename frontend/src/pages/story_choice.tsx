import { Button, buttonVariants } from "@/components/ui/button";
import useStories from "@/hooks/useStories";
import { cn } from "@/lib/utils";
import React from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

const StoryChoice = () => {
  const { storyId, nodeId } = useParams();
  const { getStoryNode, resolveStoryNode } = useStories();

  const { data, isLoading } = getStoryNode(storyId, nodeId);
  const navigate = useNavigate();

  const handleChoiceClick = async (choice: string) => {
    const resolvedNode = await resolveStoryNode(storyId, choice);
    navigate(`/story/${storyId}/${resolvedNode.node_id}`);
  };

  if (!data || isLoading) {
    return <div>Loading...</div>;
  }

  if (data.status === "PROCESSING") {
    return <div>Processing...</div>;
  }

  return (
    <div>
      <Button
        className="mb-4"
        onClick={() => navigate(`/story/${storyId}`)}
        variant="secondary"
      >
        Back
      </Button>
      <div className="prose lg:prose-xl">
        <p className="paragraph text-sm">{data["setting"]}</p>
        <hr />
        {data["choices"].map((choice: string) => (
          <Button
            key={choice}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "text-center text-sm w-full my-2 text-black h-[80px] text-wrap"
            )}
            onClick={() => handleChoiceClick(choice)}
          >
            {choice}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StoryChoice;
