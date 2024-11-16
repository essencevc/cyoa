import ChoiceLink from "@/components/choicelink";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import useStories from "@/hooks/useStories";
import { cn } from "@/lib/utils";
import React from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { BarLoader } from "react-spinners";

const StoryRoot = () => {
  const { storyId } = useParams();
  const { getStory } = useStories();
  const { data: story, error, isFetching } = getStory(storyId);

  if (error) {
    return <div>Error: {error?.message}</div>;
  }

  if (isFetching || !story) {
    return (
      <div className="flex flex-col justify-center items-center h-[300px]">
        <p className="paragraph text-sm mb-4">Loading story</p>
        <BarLoader speedMultiplier={0.5} />
      </div>
    );
  }
  const starting_choices = story.story_nodes.filter(
    (node) => node.parent_node_id === null
  );

  return (
    <div>
      <div className="mb-10">
        <div className="prose lg:prose-xl">
          <p className="paragraph text-sm">{story.description}</p>
          <hr />
          <div className="flex flex-col">
            {starting_choices.map((choice) => (
              <ChoiceLink
                key={choice.id}
                choice={choice}
                storyId={storyId as string}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryRoot;
