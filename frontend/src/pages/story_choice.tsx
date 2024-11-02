import { Button, buttonVariants } from "@/components/ui/button";
import useStories from "@/hooks/useStories";
import { cn } from "@/lib/utils";

import { Link, useNavigate, useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";

const StoryChoice = () => {
  const { storyId, nodeId } = useParams();
  const { getStoryNode, resolveStoryNode } = useStories();

  const { data, isLoading } = getStoryNode(storyId, nodeId);
  const navigate = useNavigate();

  const handleChoiceClick = async (choice: string) => {
    const resolvedNode = await resolveStoryNode(storyId, choice);
    navigate(`/story/${storyId}/${resolvedNode.node_id}`);
  };

  if (!data || isLoading || data.status === "processing") {
    return (
      <div className="flex flex-col justify-center items-center h-[300px]">
        <p className="paragraph text-sm mb-4">Generating next choice</p>
        <BarLoader speedMultiplier={0.5} />
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
