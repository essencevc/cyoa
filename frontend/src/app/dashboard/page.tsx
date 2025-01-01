import { auth } from "@/auth";
import StoryList from "@/components/dashboard/story-list";
import { TerminalInput } from "@/components/dashboard/terminal-input";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { storiesTable, usersTable } from "@/db/schema";
import React from "react";
import { UsernameInput } from "@/components/dashboard/username-input";

export const dynamic = "force-dynamic";

const communityStories = [
  {
    id: "4",
    title: "The Last Wizard",
    description:
      "In a world where magic is dying, one wizard stands against the tide of technology. As cities grow and machines replace spells, Eldrin must find a way to preserve the ancient arts and prove that magic still has a place in the modern world.",
    timestamp: "Shared by @magicUser",
    image:
      "https://huggingface.co/prithivMLmods/Retro-Pixel-Flux-LoRA/resolve/main/images/RP1.png",
  },
  {
    id: "5",
    title: "Desert Winds",
    description:
      "A journey through endless sands reveals ancient secrets and forgotten civilizations. Archeologist Dr. Samira Patel uncovers a mysterious artifact that could rewrite history, but she must race against time and rival expeditions to unlock its power.",
    timestamp: "Shared by @wanderer",
    image:
      "https://huggingface.co/prithivMLmods/Retro-Pixel-Flux-LoRA/resolve/main/images/RP1.png",
  },
  {
    id: "6",
    title: "Ocean's Call",
    description:
      "Deep beneath the waves, a mysterious signal draws explorers to an underwater kingdom. Marine biologist Kai Chen leads a team into the abyss, where they discover a bioluminescent civilization and face the choice of scientific revelation or protecting an alien culture from the surface world.",
    timestamp: "Shared by @deepDiver",
    image:
      "https://huggingface.co/prithivMLmods/Retro-Pixel-Flux-LoRA/resolve/main/images/RP1.png",
  },
];
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
        stories={communityStories}
      />
    </div>
  );
};

export default Dashboard;
