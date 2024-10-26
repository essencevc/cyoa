import { Story } from "@/lib/schemas";
import { ArrowRightSquare } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import useStories from "@/hooks/useStories";
import ConfirmationButton from "./confirmationbutton";
import { useNavigate } from "react-router";

interface StoryCardProps {
  story: Story;
}

const StoryCard = ({ story }: StoryCardProps) => {
  const { deleteStory, isDeletingStory } = useStories();

  const navigate = useNavigate();
  return (
    <Card
      key={story.id}
      className="hover:shadow-md transition-shadow duration-300 p-4 flex flex-col justify-between h-full"
    >
      <CardHeader className="space-y-2">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-xl font-semibold">{story.title}</CardTitle>
          <Badge
            variant={
              story.status === "submitted"
                ? "secondary"
                : story.status === "completed"
                ? "default"
                : "destructive"
            }
            className="px-3 py-1 rounded-full font-medium"
          >
            {story.status}
          </Badge>
        </div>
        <CardDescription className="text-sm text-gray-600 line-clamp-2">
          {story.description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center mt-4 border-t pt-4 space-x-2">
        <ConfirmationButton
          buttonText="Delete"
          warningText="This action cannot be undone."
          onConfirm={() => deleteStory(story.id)}
          className={buttonVariants({ variant: "destructive" })}
        />
        <Button
          onClick={() => {
            navigate(`/story/${story.id}`);
          }}
          disabled={story.status !== "completed"}
          variant="outline"
          className="text-green-600 hover:bg-green-50 flex items-center space-x-2"
        >
          <ArrowRightSquare className="w-4 h-4" />
          <span>Continue</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StoryCard;
