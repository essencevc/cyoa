import EmptyState from "@/components/emptystate";
import { useState } from "react";
import StoryDialog from "@/components/storydialog";
import StoryList from "@/components/storylist";

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
        <StoryList setOpen={setOpen} />
      </div>
    </div>
  );
};

export default Home;
