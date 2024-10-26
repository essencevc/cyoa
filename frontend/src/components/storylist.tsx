import useStories from "@/hooks/useStories";
import React from "react";
import EmptyState from "./emptystate";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import {
  ArrowRightCircle,
  ArrowRightFromLine,
  ArrowRightSquare,
} from "lucide-react";
import { Badge } from "./ui/badge";

type StoryListProps = {
  setOpen: (open: boolean) => void;
};

const StoryList = ({ setOpen }: StoryListProps) => {
  const { stories, hasFetchedStories } = useStories();

  if (!stories) {
    return;
  }
  if (stories.length === 0) return <EmptyState onClick={() => setOpen(true)} />;
  return (
    <div className="grid grid-cols-2 gap-4">
      {stories
        .sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
        .map((story) => (
          <Card
            key={story.id}
            className="hover:shadow-md transition-shadow duration-300"
          >
            <CardHeader className="space-y-2 flex ">
              <div className="mb-4">
                <CardTitle className="text-xl font-semibold">
                  {story.title}
                </CardTitle>
                <Badge
                  variant={
                    story.status === "submitted"
                      ? "secondary"
                      : story.status === "completed"
                      ? "default"
                      : "destructive"
                  }
                  className="px-2 py-1 rounded-full text-xs font-medium max-w-[100px] truncate"
                >
                  {story.status}
                </Badge>
              </div>
              <CardDescription className="text-sm text-gray-600">
                {story.description}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end items-center pt-4 space-x-2">
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-50"
              >
                Delete
              </Button>
              <Button
                variant="outline"
                className="text-green-600 hover:bg-green-50 flex items-center space-x-2"
              >
                <ArrowRightSquare className="w-4 h-4" />
                <span>Continue</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
    </div>
  );
};

export default StoryList;
