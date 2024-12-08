import { CopyIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { StoryWithNodes } from "@/lib/schemas";
import useStories from "@/hooks/useStories";
import { useUser } from "@clerk/clerk-react";
import { Button } from "./ui/button";

type Props = {
  story: StoryWithNodes;
};

const StoryShare = ({ story }: Props) => {
  const { toast } = useToast();
  const { toggleVisibility, copyStory } = useStories();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  if (user.id != story.user_id) {
    return (
      <Dialog>
        <DialogTrigger>
          <div className="group relative">
            <CopyIcon className="h-4 w-4 cursor-pointer" />
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy This Story?</DialogTitle>

            <div className="flex flex-col">
              <p className="text-sm text-gray-600 mb-4">
                Your progress won't be saved unless you copy this story to your
                account.
              </p>
              <Button onClick={() => copyStory(story.id)}>Copy Story</Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={story.public}
        onCheckedChange={() => toggleVisibility(story.id)}
        id="public-mode"
      />
      <Label htmlFor="public-mode">Make Story Public</Label>
      <Dialog>
        <DialogTrigger>
          <CopyIcon className="h-4 w-4 cursor-pointer" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Story?</DialogTitle>
            <DialogDescription>
              <div className="flex flex-col">
                <div
                  className="bg-gray-100 text-gray-600 p-2 rounded cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.origin}/dashboard/story/${story.id}`
                    );
                    toast({ description: "Copied to clipboard!" });
                  }}
                >
                  {`${window.origin}/dashboard/story/${story.id}`}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Click to copy link and share with friends
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoryShare;
