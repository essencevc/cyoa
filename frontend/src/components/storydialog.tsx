import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { cn } from "@/lib/utils";
import { PlusCircleIcon } from "lucide-react";
import { buttonVariants, Button } from "./ui/button";
import useStories from "@/hooks/useStories";
import { BeatLoader } from "react-spinners";
import { toast } from "sonner";

type StoryDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const StoryDialog = ({ open, setOpen }: StoryDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { createStory, isCreatingStory, getRandomStory } = useStories();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createStory({ title, description });
    setTitle("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className={cn(
            buttonVariants({ variant: "default" }),
            "cursor-pointer"
          )}
        >
          Create A Story <PlusCircleIcon />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new story</DialogTitle>
          <DialogDescription>
            Just describe what you kind of story that you want to create and
            we'll generate a story for you!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Title
              </Label>
              <Input
                id="name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Backstory
              </Label>
              <Textarea
                id="username"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                const story = await getRandomStory();
                setTitle(story.title);
                setDescription(story.description);
                toast.success("Random Story Generated!");
              }}
            >
              Surprise Me
            </Button>
            <Button type="submit" disabled={isCreatingStory}>
              {isCreatingStory ? (
                <BeatLoader color="white" size={10} speedMultiplier={0.3} />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StoryDialog;
