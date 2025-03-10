import React, { Suspense } from "react";
import StoryChoices from "@/components/story/story-choice";
import { eq } from "drizzle-orm";
import { storiesTable, storyChoicesTable } from "@/db/schema";
import { db } from "@/db/db";
import ResetStory from "@/components/story/reset-story";
import AutoAudioPlayer from "@/components/node/audio-player";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StoryVisibilityToggle from "@/components/story/story-visibility-toggle";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { NavigationLink } from "@/components/navigation/navigation-link";
import Image from "next/image";

// Add revalidation time for Incremental Static Regeneration (ISR)
// This will cache the page for 60 seconds before revalidating
export const revalidate = 60;

// Loading component for Suspense
const StoryLoading = () => (
  <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4 animate-pulse">
    <div className="h-6 w-32 bg-green-900/30 rounded"></div>
    <div className="border-b border-green-900/30 pb-2">
      <div className="h-5 w-full bg-green-900/30 rounded"></div>
    </div>
    <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
      <div className="w-full md:w-1/5 flex justify-center md:justify-start">
        <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-lg bg-green-900/30"></div>
      </div>
      <div className="w-full md:w-4/5 space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-green-900/30 rounded"></div>
          <div className="h-20 w-full bg-green-900/30 rounded"></div>
        </div>
        <div className="h-8 w-40 bg-green-900/30 rounded"></div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-green-900/30 rounded"></div>
          <div className="h-2 w-full bg-green-900/30 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

// Function to get story data
const getStory = async (storyId: string) => {
  // Remove noStore() to enable caching
  // Use revalidate option instead for controlled caching

  const getStoryData = async () => {
    // Fetch story and choices in parallel for better performance
    const [story, choices] = await Promise.all([
      db.select().from(storiesTable).where(eq(storiesTable.id, storyId)).get(),
      db
        .select()
        .from(storyChoicesTable)
        .where(eq(storyChoicesTable.storyId, storyId))
        .all(),
    ]);

    return {
      ...story,
      choices,
    };
  };

  return getStoryData();
};

// Generate static params for common stories to preload
export async function generateStaticParams() {
  // Get sample story IDs from env
  const storyIds = process.env.NEXT_PUBLIC_EXAMPLE_STORIES?.split(",") || [];

  return storyIds.map((slug) => ({
    slug,
  }));
}

// Story content component to be wrapped in Suspense
const StoryContent = async ({ storyId }: { storyId: string }) => {
  // Start fetching story data immediately, before auth check
  const storyPromise = getStory(storyId);

  // Perform auth check in parallel with data fetching
  const userObject = await auth();
  if (!userObject) {
    return redirect("/");
  }

  // Now await the story data that was already being fetched
  const story = await storyPromise;

  if (!story) {
    return (
      <div className="font-mono max-w-6xl mx-auto p-3 sm:p-4">
        <div className="flex items-center gap-2 border-b border-green-900/30 pb-2 overflow-x-auto">
          <span className="text-white text-sm sm:text-base whitespace-nowrap">
            root@cyoa-os:~$
          </span>
          <span className="text-[#39FF14] text-sm sm:text-base break-all">
            cyoa story --id {storyId} --metadata
          </span>
        </div>
        <div className="mt-4 text-red-400 text-sm sm:text-base">
          [ERROR] Story not found in database
        </div>
        <div className="mt-4">
          <NavigationLink
            href="/dashboard"
            className="text-[#39FF14] hover:underline text-sm sm:text-base"
          >
            ← Back to dashboard
          </NavigationLink>
        </div>
      </div>
    );
  }

  const exploredChoices =
    story.choices.filter((choice) => choice.explored === 1).length - 1;
  const totalChoices = story.choices.length - 1;
  const storyProgress = (exploredChoices / totalChoices) * 100;

  const userId = userObject["user"]["email"];
  const isUserStory = userId === story.userId;
  const isPublicStory = story.public == 1;

  if (!isUserStory && !isPublicStory) {
    return redirect("/");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4">
      <NavigationLink
        href="/dashboard"
        className="text-green-400 hover:underline inline-flex items-center transition-transform duration-200 hover:-translate-x-1 text-sm sm:text-base mt-2"
      >
        <span className="mr-1">←</span>
        <span>Back to Dashboard</span>
      </NavigationLink>

      <div className="border-b border-green-900/30 pb-2">
        <p className="text-sm sm:text-base ">
          <span className="text-white whitespace-nowrap">root@cyoa-os:~$ </span>
          <span className="text-[#39FF14]">
            cyoa list-story --id {storyId} --metadata
          </span>
        </p>
      </div>

      {/* Main Content - Side by side on desktop, stacked on mobile */}
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* Banner Image */}
        <div className="w-full md:w-1/5 flex justify-center md:justify-start">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-lg overflow-hidden ">
            {/* For larger screens - use HoverCard */}
            <div className="hidden md:block">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="cursor-pointer transition-opacity hover:opacity-90 relative group">
                    <Image
                      src={`https://restate-story.s3.ap-southeast-1.amazonaws.com/${storyId}/banner.png`}
                      alt={story.title || "Story Image"}
                      width={256}
                      height={256}
                      className="w-full h-full object-cover"
                      priority
                      quality={80}
                      sizes="(max-width: 768px) 224px, 256px"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-green-400 text-xs py-1 px-2 opacity-100">
                      Hover to see image prompt
                    </div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-72 sm:w-80 bg-black/90 p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-green-400 font-mono leading-relaxed">
                    {story.image_prompt}
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>

            {/* For mobile screens - show image and prompt directly */}
            <div className="md:hidden flex flex-col">
              <Image
                src={`https://restate-story.s3.ap-southeast-1.amazonaws.com/${storyId}/banner.png`}
                alt={story.title || "Story Image"}
                width={224}
                height={224}
                className="w-full h-full object-cover"
                priority
                quality={80}
                sizes="224px"
              />
              <div className="bg-black/60 border border-green-500/20 rounded p-2 mt-2">
                <p className="text-xs text-green-400 font-mono leading-relaxed">
                  <span className="text-green-500 font-bold">
                    Image Prompt:
                  </span>{" "}
                  {story.image_prompt}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Story Content */}
        <div className="w-full md:w-4/5 space-y-4 sm:space-y-6 font-mono">
          <div className="space-y-2">
            <div className="text-xs sm:text-sm opacity-70">
              [INFO] Story ID: {storyId}
            </div>
            <p className="leading-relaxed text-green-300 text-sm sm:text-base">
              {story?.description}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
            {isUserStory && (
              <StoryVisibilityToggle
                storyId={storyId}
                isPublic={isPublicStory}
              />
            )}
            <AutoAudioPlayer story_id={storyId} node_id={"theme"} />
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs sm:text-sm opacity-70">
                [STATUS] Story Progress
              </div>
              {isUserStory && <ResetStory storyId={storyId} />}
            </div>
            <div className="h-2 rounded border border-green-500/20">
              <div
                className="h-full bg-green-500/20 rounded transition-all duration-300"
                style={{ width: `${storyProgress}%` }}
              />
            </div>
            <div className="text-xs sm:text-sm text-right opacity-70">
              {Math.round(storyProgress)}%
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-green-900/30 pb-2 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <span className="text-white text-sm sm:text-base whitespace-nowrap">
            root@cyoa-os:~$
          </span>
          <span className="text-[#39FF14] text-sm sm:text-base break-all">
            cyoa list-story --prompt
          </span>
        </div>
      </div>

      <div className="text-green-300 text-sm sm:text-base">
        {story.story_prompt}
      </div>

      <div className="flex items-center gap-1 sm:gap-2 border-b border-green-900/30 pb-2 overflow-x-auto">
        <p className="text-sm sm:text-base ">
          <span className="text-white whitespace-nowrap">root@cyoa-os:~$ </span>
          <span className="text-[#39FF14]">
            cyoa list-story --id {storyId} --choices
          </span>
        </p>
      </div>

      <StoryChoices choices={story.choices} isUserStory={isUserStory} />
    </div>
  );
};

const StoryPage = async ({ params }: { params: { slug: string } }) => {
  const storyId = params.slug;

  // Move auth check inside the Suspense boundary so the loading skeleton appears immediately
  return (
    <Suspense fallback={<StoryLoading />}>
      <StoryContent storyId={storyId} />
    </Suspense>
  );
};

export default StoryPage;
