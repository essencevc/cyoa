import React from "react";
import Link from "next/link";
import StoryChoices from "@/components/story/story-choice";
import { eq } from "drizzle-orm";
import { storiesTable, storyChoicesTable } from "@/db/schema";
import { db } from "@/db/db";
import ResetStory from "@/components/story/reset-story";

const StoryPage = async ({ params }: { params: { slug: string } }) => {
  const storyId = params.slug;

  const story = {
    ...(await db
      .select()
      .from(storiesTable)
      .where(eq(storiesTable.id, storyId))
      .get()),
    choices: await db
      .select()
      .from(storyChoicesTable)
      .where(eq(storyChoicesTable.storyId, storyId))
      .all(),
  };

  if (!story) {
    return (
      <div className="font-mono max-w-6xl mx-auto p-4">
        <div className="flex items-center gap-2 border-b border-green-900/30 pb-2">
          <span className="text-white">root@cyoa-os:~$</span>
          <span className="text-[#39FF14]">
            cyoa story --id {storyId} --metadata
          </span>
        </div>
        <div className="mt-4 text-red-400">
          [ERROR] Story not found in database
        </div>
        <div className="mt-4">
          <Link href="/dashboard" className="text-[#39FF14] hover:underline">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const exploredChoices =
    story.choices.filter((choice) => choice.explored === 1).length - 1;
  const totalChoices = story.choices.length - 1;
  const storyProgress = (exploredChoices / totalChoices) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="text-green-400 hover:underline inline-flex items-center transition-transform duration-200 hover:-translate-x-1"
      >
        <span className="mr-1">←</span>
        <span>Back to Dashboard</span>
      </Link>
      <div className="flex items-center justify-between border-b border-green-900/30 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-white">root@cyoa-os:~$</span>
          <span className="text-[#39FF14]">
            cyoa list-story --id {storyId} --metadata
          </span>
        </div>
      </div>

      {/* Main Content - Side by side on desktop, stacked on mobile */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Banner Image */}
        <div className="w-full md:w-1/2">
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-green-500/20">
            {story.image && (
              <img
                src={story.image}
                alt={story.title || "Story Image"}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Story Content */}
        <div className="w-full md:w-1/2 space-y-6 font-mono">
          <div className="space-y-2">
            <div className="text-sm opacity-70">[INFO] Story ID: {storyId}</div>
            <p className="leading-relaxed text-green-300">
              {story?.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm opacity-70">[STATUS] Story Progress</div>
              <ResetStory storyId={storyId} />
            </div>
            <div className="h-2 rounded border border-green-500/20">
              <div
                className="h-full bg-green-500/20 rounded transition-all duration-300"
                style={{ width: `${storyProgress}%` }}
              />
            </div>
            <div className="text-sm text-right opacity-70">
              {Math.round(storyProgress)}%
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-green-900/30 pb-2">
        <span className="text-white">root@cyoa-os:~$</span>
        <span className="text-[#39FF14]">
          cyoa list-story --id {storyId} --choices
        </span>
      </div>

      <StoryChoices choices={story.choices} storyId={storyId} />
    </div>
  );
};

export default StoryPage;
