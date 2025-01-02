import EmptyState from "@/components/emptystate";
import { useState } from "react";
import StoryDialog from "@/components/storydialog";
import StoryList from "@/components/storylist";

const Home = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Your Stories</h1>
          <p className="text-sm text-gray-500">
            Create a new story or continue where you left off
          </p>
        </div>
        <StoryDialog open={open} setOpen={setOpen} />
      </div>

      <StoryList setOpen={setOpen} />
    </div>
  );
};

export default Home;