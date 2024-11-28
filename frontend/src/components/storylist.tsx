import useStories from "@/hooks/useStories";
import EmptyState from "./emptystate";
import StoryCard from "./storycard";
import { BarLoader } from "react-spinners";
import { usePagination } from "react-use-pagination";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

type StoryListProps = {
  setOpen: (open: boolean) => void;
};

const StoryList = ({ setOpen }: StoryListProps) => {
  const { stories, hasFetchedStories } = useStories();
  
  const {
    totalPages,
    setNextPage,
    setPreviousPage,
    nextEnabled,
    previousEnabled,
    startIndex,
    endIndex,
  } = usePagination({
    totalItems: stories?.length || 0,
    initialPageSize: 4,
    initialPage: 0,
  });

  if (!hasFetchedStories || !stories) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <BarLoader />
      </div>
    );
  }

  if (stories.length === 0) {
    return <EmptyState onClick={() => setOpen(true)} />;
  }

  const visibleStories = stories.slice(startIndex, endIndex + 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleStories.map((story, idx) => (
          <StoryCard key={idx} story={story} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="cursor-pointer"
                  isActive={previousEnabled}
                  onClick={setPreviousPage}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  className="cursor-pointer"
                  isActive={nextEnabled}
                  onClick={setNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default StoryList;