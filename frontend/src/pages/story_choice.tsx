import { Button, buttonVariants } from "@/components/ui/button";
import useStories from "@/hooks/useStories";
import { cn } from "@/lib/utils";
import React from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

const StoryChoice = () => {
  const { storyId, nodeId } = useParams();
  const { getStoryNode } = useStories();

  const { data, isLoading, isError } = getStoryNode(storyId, nodeId);
  const navigate = useNavigate();

  const handleChoiceClick = (choice: string) => {
    // TODO:
    // navigate(`/story/${storyId}/${choice["node_id"]}/`);
  };

  if (!data || isLoading) {
    return <div>Loading...</div>;
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
        {data["starting_choice"] && (
          <p className="text-md font-bold">{data["starting_choice"]}</p>
        )}
        <p className="paragraph text-sm">{data["setting"]}</p>
        <hr />
        {JSON.parse(data["choices"]).map((choice: string) => (
          <Button
            className={cn(
              buttonVariants({ variant: "outline" }),
              "text-center text-sm w-full my-2 text-black h-[50px]"
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
