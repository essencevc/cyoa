import EmptyState from "@/components/EmptyState";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PlusCircleIcon } from "lucide-react";
import React, { useState } from "react";
import Story from "./story";
import StoryDialog from "@/components/storydialog";

// import { Link } from "react-router-dom";

const Home = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex w-full  justify-between items-center">
        <div>
          <p className="text-xl font-bold">Your Stories</p>
          <p className="text-gray-400">
            Create a new story or continue where you left off
          </p>
        </div>
        <StoryDialog open={open} setOpen={setOpen} />
      </div>
      <div className="mt-4">
        <EmptyState onClick={() => setOpen(true)} />
      </div>
    </div>
  );
};

export default Home;
