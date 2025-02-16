import React from "react";

import ChoiceInterface from "@/components/node/choice-interface";
import { db } from "@/db/db";
import { storiesTable, storyChoicesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import TerminalChoice from "@/components/node/terminal-choice";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const NodePage = async ({ params }: { params: { node: string } }) => {
  const choice = await db.query.storyChoicesTable.findFirst({
    where: eq(storyChoicesTable.id, params.node),
  });

  const story = await db.query.storiesTable.findFirst({
    where: eq(storiesTable.id, choice?.storyId as string),
  });

  const children = await db.query.storyChoicesTable.findMany({
    where: eq(storyChoicesTable.parentId, params.node),
  });

  if (!choice || !story) {
    return (
      <div className="font-mono max-w-6xl mx-auto p-4">
        <div className="flex items-center gap-2 border-b border-green-900/30 pb-2">
          <span className="text-white">root@cyoa-os:~$</span>
          <span className="text-[#39FF14]">
            cyoa make-choice --id {params.node} --metadata
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
      .where(eq(storyChoicesTable.id, params.node))
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

export default NodePage;
