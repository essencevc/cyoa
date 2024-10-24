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
import { makePostRequest } from "@/lib/server";
import {
  storyGenerationAcknowledgementSchema,
  storyResponseSchema,
} from "@/lib/schemas";
import { toast } from "sonner";
import { useAuth } from "@clerk/clerk-react";

type StoryDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const StoryDialog = ({ open, setOpen }: StoryDialogProps) => {
  const [title, setTitle] = useState("");
  const [backstory, setBackstory] = useState("");
  const [mainCharacter, setMainCharacter] = useState("");
  const { getToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No token found");
      }
      const response = await makePostRequest(
        "/stories",
        {
          title,
          main_character: mainCharacter,
          content: backstory,
        },

        token,
        storyGenerationAcknowledgementSchema
      );
      toast.success("Story generated successfully");
      setOpen(false);
    } catch (error) {
      console.log(error);
      toast.error("Error generating story - please try again later");
    }
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
                Main Character
              </Label>
              <Input
                id="username"
                value={mainCharacter}
                onChange={(e) => setMainCharacter(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Backstory
              </Label>
              <Textarea
                id="username"
                value={backstory}
                onChange={(e) => setBackstory(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StoryDialog;
