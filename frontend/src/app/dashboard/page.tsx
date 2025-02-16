import { auth } from "@/auth";
import StoryList from "@/components/dashboard/story-list";
import { TerminalInput } from "@/components/dashboard/terminal-input";
import { db } from "@/db/db";
import { eq, inArray } from "drizzle-orm";
import { storiesTable, usersTable } from "@/db/schema";
import React from "react";
import { UsernameInput } from "@/components/dashboard/username-input";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import SampleStories from "@/components/dashboard/sample-stories";

const getSampleStories = async () => {
  const storyIds = process.env.NEXT_PUBLIC_EXAMPLE_STORIES?.split(",");
  if (!storyIds) {
    return [];
  }
  const stories = await db
    .select()
    .from(storiesTable)
    .where(inArray(storiesTable.id, storyIds));
  return stories;
};

const Dashboard = async () => {
  const session = await auth();
  revalidatePath("/dashboard", "page");

  if (!session || !session.user || !session.user.email) {
    return redirect("/");
  }

  const dbUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, session.user.email))
    .get();

  if (!dbUser || !dbUser.username) {
    return <UsernameInput />;
  }

  const sampleStories = await getSampleStories();

  console.log(sampleStories);

  const userStories = await db
    .select({
      id: storiesTable.id,
      title: storiesTable.title,
      author: usersTable.username,
      image: storiesTable.image_prompt,
      description: storiesTable.description,
      timestamp: storiesTable.timestamp,
      public: storiesTable.public,
      status: storiesTable.status,
      errorMessage: storiesTable.errorMessage,
    })
    .from(storiesTable)
    .where(eq(storiesTable.userId, dbUser.email))
    .innerJoin(usersTable, eq(storiesTable.userId, usersTable.email));

  return (
    <div className="space-y-8 bg-black/50 max-w-5xl mx-auto rounded-lg p-4">
      <TerminalInput />
      <SampleStories stories={sampleStories} />
      <StoryList
        command="cyoa list-stories --filter user-stories"
        logMessages={[
          {
            logType: "INFO",
            message: "Fetching stories with user filter",
          },
          {
            logType: "SUCCESS",
            message: `Found ${userStories.length} stories in collection`,
          },
          {
            logType: "INFO",
            message: "Formatting output...",
          },
        ]}
        stories={userStories}
      />
    </div>
  );
};

export default Dashboard;
