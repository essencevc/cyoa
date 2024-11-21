import ChoiceLink from "@/components/choicelink";
import { Button } from "@/components/ui/button";
import useStories from "@/hooks/useStories";

import { Link, useNavigate, useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";

const StoryChoice = () => {
  const { storyId, nodeId } = useParams();
  const { getStoryNode, resolveStoryNode } = useStories();

  const { data, isLoading } = getStoryNode(storyId, nodeId);
  const navigate = useNavigate();

  if (!data || isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[300px]">
        <p className="paragraph text-sm mb-4">Fetching Story Information</p>
        <BarLoader speedMultiplier={0.5} />
      </div>
    );
  }

  if (data.children.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[600px]">
        <div className="grid grid-cols-1 gap-4">
          <p className="paragraph text-lg font-bold mb-4">The End</p>
          <div className="flex items-center justify-center">
            <img
              src={data.image_url ?? ""}
              alt="Story Image"
              className="w-[300px] h-[300px] object-cover"
            />
          </div>
          <p className="paragraph text-sm text-justify mb-4">{data.setting}</p>
          <Button
            className="w-full"
            onClick={() => navigate(`/story/${storyId}`)}
          >
            Start Again?
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <Button
        className="mb-4"
        onClick={() => navigate(`/story/${storyId}`)}
        variant="secondary"
      >
        Back
      </Button>
      <div className="prose lg:prose-xl">
        {data["image_url"] && (
          <div className="flex justify-center items-center">
            <img
              className="w-[600px] h-[400px] object-cover"
              src={data["image_url"]}
              alt="Story Image"
            />
          </div>
        )}
        <p className="paragraph text-sm">{data.setting}</p>
        <hr />
        {data.children.length === 0 ? (
          <p className="paragraph text-sm">No more choices</p>
        ) : (
          data.children.map((choice) => (
            <ChoiceLink
              key={choice.id}
              choice={choice}
              storyId={storyId as string}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default StoryChoice;
