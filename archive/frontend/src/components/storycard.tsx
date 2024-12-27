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
  const { deleteStory } = useStories();
  const navigate = useNavigate();

  const statusVariant = {
    processing: "secondary",
    completed: "default",
    failed: "destructive",
  }[story.status];

  return (
    <Card className="flex h-full flex-col justify-between p-4 transition-shadow duration-300 hover:shadow-md">
      <CardHeader className="space-y-3 p-0">
        <div className="space-y-2">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {story.title}
          </CardTitle>
          <Badge
            //@ts-ignore
            variant={statusVariant}
            className="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
          >
            {story.status}
          </Badge>
          <CardDescription className="text-sm text-gray-600 line-clamp-2">
            {story.description}
          </CardDescription>
          
        </div>
      </CardHeader>

      <div className="flex w-full gap-3 mt-4 border-t pt-4">
        <Button
          onClick={() => navigate(`/dashboard/story/${story.id}`)}
          disabled={story.status !== "completed"}
          variant="outline"
          className="flex flex-1 items-center justify-center gap-2"
        >
          <ArrowRightSquare className="h-4 w-4" />
          <span>Continue</span>
        </Button>
        <ConfirmationButton
          buttonText="Delete"
          warningText="This action cannot be undone."
          onConfirm={() => deleteStory(story.id)}
          className={buttonVariants({
            variant: "destructive",
            className: "px-6"
          })}
        />
      </div>
    </Card>
  );
};

export default StoryCard;