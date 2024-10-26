import useStories from "@/hooks/useStories";
import React from "react";
import EmptyState from "./emptystate";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { ArrowRightSquare } from "lucide-react";
import { Badge } from "./ui/badge";
import StoryCard from "./storycard";
import { BarLoader } from "react-spinners";
import { usePagination } from "react-use-pagination";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

type StoryListProps = {
  setOpen: (open: boolean) => void;
};

const StoryList = ({ setOpen }: StoryListProps) => {
  const { stories, hasFetchedStories } = useStories();
  const {
    currentPage,
    totalPages,
    setNextPage,
    setPreviousPage,
    nextEnabled,
    previousEnabled,
    startIndex,
    endIndex,
    setPage,
  } = usePagination({
    totalItems: stories?.length || 0,
    initialPageSize: 4,
    initialPage: 0,
  });

  if (!hasFetchedStories || !stories) {
    return (
      <div className="flex justify-center items-center h-[300px] ">
        <BarLoader />
      </div>
    );
  }
  if (stories.length === 0) return <EmptyState onClick={() => setOpen(true)} />;
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {stories
          ?.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
          .slice(startIndex, endIndex + 1)
          .map((story, idx) => (
            <StoryCard key={idx} story={story} />
          ))}
      </div>
      <div className="flex justify-center mt-4 items-center gap-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className="cursor-pointer"
                isActive={previousEnabled}
                onClick={() => setPreviousPage()}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                className="cursor-pointer"
                isActive={nextEnabled}
                onClick={() => setNextPage()}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
};

export default StoryList;
