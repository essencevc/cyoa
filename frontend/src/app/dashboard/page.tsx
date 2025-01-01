import { auth } from "@/auth";
import StoryList from "@/components/dashboard/story-list";
import { TerminalInput } from "@/components/dashboard/terminal-input";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { storiesTable, usersTable } from "@/db/schema";
import React from "react";
import { UsernameInput } from "@/components/dashboard/username-input";

export const dynamic = "force-dynamic";

const Dashboard = async () => {
  const session = await auth();

  const dbUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, session?.user?.email!))
    .get();

  if (!dbUser?.username) {
    return <UsernameInput />;
  }

  const userStories = await db
    .select({
      id: storiesTable.id,
      title: storiesTable.title,
      author: usersTable.username,
      image: storiesTable.image,
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
    <div className="space-y-8 bg-black/50 rounded-lg p-4 border border-green-900/30">
      <TerminalInput />
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
      <StoryList
        command="cyoa list-stories --filter community-stories"
        logMessages={[
          {
            logType: "INFO",
            message: "Fetching stories with community filter",
          },
          {
            logType: "SUCCESS",
            message: `Found ${communityStories.length} stories in collection. Sorting by popularity...`,
          },
          {
            logType: "INFO",
            message: "Formatting output...",
          },
        ]}
        stories={[]}
      />
    </div>
  );
};

export default Dashboard;
