"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { resetStoryProgress } from "@/lib/story";
import { useRouter } from "next/navigation";

const ResetStory = ({ storyId }: { storyId: string }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="text-red-400/70 hover:text-red-400 text-sm cursor-pointer transition-colors">
          Reset Progress
        </div>
      </DialogTrigger>
      <DialogContent className="bg-black border border-green-900/30">
        <DialogHeader>
          <DialogTitle className="text-green-400">
            Reset Story Progress
          </DialogTitle>
          <DialogDescription className="text-green-400/70">
            Are you sure you want to reset your progress? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              className="bg-black border-green-900/30 text-green-400 hover:text-green-400/70 hover:bg-green-950"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={() =>
              resetStoryProgress(storyId).then(() => {
                router.refresh();
                setIsOpen(false);
              })
            }
            variant="destructive"
            className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
          >
            Reset Progress
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetStory;
