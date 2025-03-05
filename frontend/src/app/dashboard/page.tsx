import { auth } from "@/auth";
import StoryList from "@/components/dashboard/story-list";
import { TerminalInput } from "@/components/dashboard/terminal-input";
import { db } from "@/db/db";
import { eq, inArray } from "drizzle-orm";
import { storiesTable, usersTable } from "@/db/schema";
import React, { Suspense } from "react";
import { UsernameInput } from "@/components/dashboard/username-input";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import SampleStories from "@/components/dashboard/sample-stories";
import { unstable_noStore as noStore } from "next/cache";

// Loading components for Suspense
const SampleStoriesLoading = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-6 w-64 bg-green-900/30 rounded"></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-48 bg-green-900/30 rounded"></div>
      ))}
    </div>
  </div>
);

const UserStoriesLoading = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-6 w-64 bg-green-900/30 rounded"></div>
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-16 bg-green-900/30 rounded"></div>
      ))}
    </div>
  </div>
);

// Function to get sample stories
const getSampleStories = async () => {
  noStore(); // Opt out of caching for this data fetch

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

// Function to get user stories
const getUserStories = async (userEmail: string) => {
  noStore(); // Opt out of caching for this data fetch

  return db
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
    .where(eq(storiesTable.userId, userEmail))
    .innerJoin(usersTable, eq(storiesTable.userId, usersTable.email));
};

// Sample stories component with Suspense
const SampleStoriesSection = async () => {
  const sampleStories = await getSampleStories();
  return <SampleStories stories={sampleStories} />;
};

// User stories component with Suspense
const UserStoriesSection = async ({ userEmail }: { userEmail: string }) => {
  const userStories = await getUserStories(userEmail);

  return (
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
  );
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

  return (
    <div className="space-y-8 bg-black/50 max-w-5xl mx-auto rounded-lg p-4">
      <TerminalInput />

      <Suspense fallback={<SampleStoriesLoading />}>
        <SampleStoriesSection />
      </Suspense>

      <Suspense fallback={<UserStoriesLoading />}>
        <UserStoriesSection userEmail={dbUser.email} />
      </Suspense>
    </div>
  );
};

export default Dashboard;
