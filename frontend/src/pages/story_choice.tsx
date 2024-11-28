import ChoiceLink from "@/components/choicelink";
import { Button } from "@/components/ui/button";
import useStories from "@/hooks/useStories";
import { useNavigate, useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";

const StoryChoice = () => {
  const { storyId, nodeId } = useParams();
  const { getStoryNode } = useStories();
  const { data, isLoading } = getStoryNode(storyId, nodeId);
  const navigate = useNavigate();

  if (!data || isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <p className="text-sm text-gray-500">Loading your adventure...</p>
        <BarLoader color="#6366f1" speedMultiplier={0.5} />
      </div>
    );
  }

  if (data.children.length === 0) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-bold">The End</h2>
          
          {data.image_url && (
            <img
              src={data.image_url}
              alt="Story Image"
              className="mx-auto aspect-square w-full max-w-md rounded-lg object-cover shadow-md"
            />
          )}
          
          <p className="text-sm text-gray-600">{data.setting}</p>
          
          <Button
            className="w-full sm:w-auto"
            onClick={() => navigate(`/dashboard/story/${storyId}`)}
          >
            Start Again?
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="space-y-6">
        <Button
          onClick={() => navigate(`/dashboard/story/${storyId}`)}
          variant="outline"
          size="sm"
        >
          ← Back
        </Button>

        <div className="space-y-6">
          {data.image_url && (
            <img
              src={data.image_url}
              alt="Story Scene"
              className="w-full rounded-lg object-cover shadow-md"
              style={{ aspectRatio: '3/2' }}
            />
          )}
          
          <p className="text-sm text-gray-600">{data.setting}</p>
          
          <div className="grid gap-3 border-t pt-6">
            {data.children.map((choice) => (
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

export default StoryChoice;