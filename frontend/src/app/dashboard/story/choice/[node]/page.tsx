import React, { Suspense } from "react";

import ChoiceInterface from "@/components/node/choice-interface";
import { db } from "@/db/db";
import { storiesTable, storyChoicesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { NavigationLink } from "@/components/navigation/navigation-link";
import TerminalChoice from "@/components/node/terminal-choice";

export const dynamic = "force-dynamic";

// Loading component for Suspense
const ChoiceLoading = () => (
  <div className="w-full h-screen flex items-center justify-center bg-black">
    <div className="animate-pulse space-y-4 max-w-4xl w-full px-4">
      <div className="h-8 w-64 bg-green-900/30 rounded"></div>
      <div className="h-64 w-full bg-green-900/30 rounded"></div>
      <div className="h-32 w-full bg-green-900/30 rounded"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-16 bg-green-900/30 rounded"></div>
        <div className="h-16 bg-green-900/30 rounded"></div>
      </div>
    </div>
  </div>
);

// Function to get choice data
const getChoiceData = async (nodeId: string) => {
  noStore(); // Opt out of caching for this data fetch

  const choice = await db.query.storyChoicesTable.findFirst({
    where: eq(storyChoicesTable.id, nodeId),
  });

  if (!choice) {
    return { choice: null, story: null, children: [] };
  }

  const [story, children] = await Promise.all([
    db.query.storiesTable.findFirst({
      where: eq(storiesTable.id, choice.storyId as string),
    }),
    db.query.storyChoicesTable.findMany({
      where: eq(storyChoicesTable.parentId, nodeId),
    }),
  ]);

  return { choice, story, children };
};

// Choice content component to be wrapped in Suspense
const ChoiceContent = async ({ nodeId }: { nodeId: string }) => {
  const { choice, story, children } = await getChoiceData(nodeId);

  if (!choice || !story) {
    return (
      <div className="font-mono w-full max-w-6xl mx-auto p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 border-b border-green-900/30 pb-2">
          <span className="text-white text-sm sm:text-base">
            root@cyoa-os:~$
          </span>
          <span className="text-[#39FF14] text-sm sm:text-base break-all">
            cyoa make-choice --id {nodeId} --metadata
          </span>
        </div>
        <div className="mt-3 sm:mt-4 text-red-400 text-sm sm:text-base">
          [ERROR] Story not found in database
        </div>
        <div className="mt-3 sm:mt-4">
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

  // Mark choice as explored if user owns the story
  const userObject = await auth();
  if (!userObject) {
    return redirect("/");
  }

  const userId = userObject["user"]["email"];
  const isUserStory = userId === story.userId;
  const isPublicStory = story.public;

  if (!isUserStory && !isPublicStory) {
    return redirect("/");
  }

  if (isUserStory) {
    await db
      .update(storyChoicesTable)
      .set({ explored: 1 })
      .where(eq(storyChoicesTable.id, nodeId))
      .execute();
  }

  if (choice.isTerminal) {
    return <TerminalChoice choice={choice} />;
  }

  return (
    <ChoiceInterface
      title={choice.choice_title}
      description={choice.description}
      choices={children}
      choiceId={choice.id}
      storyId={choice.storyId}
      imagePrompt={choice.image_prompt}
    />
  );
};

const NodePage = async ({ params }: { params: { node: string } }) => {
  return (
    <Suspense fallback={<ChoiceLoading />}>
      <ChoiceContent nodeId={params.node} />
    </Suspense>
  );
};

export default NodePage;
