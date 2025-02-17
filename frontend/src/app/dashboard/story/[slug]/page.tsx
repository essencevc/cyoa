import React from "react";
import Link from "next/link";
import StoryChoices from "@/components/story/story-choice";
import { eq } from "drizzle-orm";
import { storiesTable, storyChoicesTable } from "@/db/schema";
import { db } from "@/db/db";
import ResetStory from "@/components/story/reset-story";
import { unstable_noStore as noStore } from "next/cache";
import AutoAudioPlayer from "@/components/node/audio-player";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StoryVisibilityToggle from "@/components/story/story-visibility-toggle";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const getStory = async (storyId: string) => {
  noStore();
  const getStoryData = async () => {
    noStore();
    return {
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
  };

  return getStoryData();
};

const StoryPage = async ({ params }: { params: { slug: string } }) => {
  const storyId = params.slug;

  const story = await getStory(storyId);

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

  const userObject = await auth();

  if (!userObject) {
    return redirect("/");
  }

  const userId = userObject["user"]["email"];
  const isUserStory = userId === story.userId;
  const isPublicStory = story.public == 1;

  if (!isUserStory && !isPublicStory) {
    return redirect("/");
  }

  console.log(isUserStory, isPublicStory);

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
        <div className="w-full md:w-1/5">
          <div className="flex h-full justify-center items-center">
            <div className="relative w-64 h-64 rounded-lg overflow-hidden border border-green-500/20">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="cursor-pointer transition-opacity hover:opacity-90 relative group">
                    <img
                      src={`https://restate-story.s3.ap-southeast-1.amazonaws.com/${storyId}/banner.png`}
                      alt={story.title || "Story Image"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-green-400 text-xs py-1 px-2 opacity-100">
                      Hover to see image prompt
                    </div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 bg-black/90 border border-green-500/20 p-4">
                  <p className="text-sm text-green-400 font-mono leading-relaxed">
                    {story.image_prompt}
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>
        </div>

        {/* Story Content */}
        <div className="w-full md:w-4/5 space-y-6 font-mono">
          <div className="space-y-2">
            <div className="text-sm opacity-70">[INFO] Story ID: {storyId}</div>
            <p className="leading-relaxed text-green-300">
              {story?.description}
            </p>
          </div>
          <div className="flex items-start justify-between">
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
              <div className="text-sm opacity-70">[STATUS] Story Progress</div>
              {isUserStory && <ResetStory storyId={storyId} />}
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

      <div className="flex items-center justify-between border-b border-green-900/30 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-white">root@cyoa-os:~$</span>
          <span className="text-[#39FF14]">cyoa list-story --prompt</span>
        </div>
      </div>

      <div className="text-green-300">{story.story_prompt}</div>

      <div className="flex items-center gap-2 border-b border-green-900/30 pb-2">
        <span className="text-white">root@cyoa-os:~$</span>
        <span className="text-[#39FF14]">
          cyoa list-story --id {storyId} --choices
        </span>
      </div>

      <StoryChoices choices={story.choices} isUserStory={isUserStory} />
    </div>
  );
};

export default StoryPage;
