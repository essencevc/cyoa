import ChoiceLink from "@/components/choicelink";
import { Button } from "@/components/ui/button";
import useStories from "@/hooks/useStories";
import { useUser } from "@clerk/clerk-react";
import React from "react";
import { useParams } from "react-router";
import { BarLoader } from "react-spinners";

const StoryRoot = () => {
  const { storyId } = useParams();
  const { getStory } = useStories();
  const { data: story, error, isFetching } = getStory(storyId);
  const { user } = useUser();

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-sm text-gray-500">{error?.message}</p>
      </div>
    );
  }

  if (isFetching || !story) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <p className="text-sm text-gray-500">Loading your adventure...</p>
        <BarLoader color="#6366f1" speedMultiplier={0.5} />
      </div>
    );
  }

  const startingChoices = story.story_nodes.filter(
    (node) => node.parent_node_id === null
  );

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">{story.title}</h1>

        <div className="prose-sm prose-gray">
          <p className="text-sm text-gray-600">{story.description}</p>
          {story.banner_image_url && (
            <img
              src={story.banner_image_url}
              alt="Story Banner"
              className="mt-4 w-full rounded-lg object-cover shadow-md"
            />
          )}
        </div>

        <div className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-medium">Begin your journey</h2>
          <div className="grid gap-3">
            {startingChoices.map((choice) => (
              <ChoiceLink
                isAuthor={story.user_id === user?.id}
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
