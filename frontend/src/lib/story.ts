"use server";

import { auth } from "@/auth";
import { db } from "@/db/db";
import { storiesTable, storyChoicesTable, usersTable } from "@/db/schema";
import { and, eq, not } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function resetStoryProgress(storyId: string) {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("You must be signed in to reset story progress");
  }

  const story = await db.query.storiesTable.findFirst({
    where: eq(storiesTable.id, storyId),
  });

  if (!story) {
    throw new Error("Story not found");
  }

  await db
    .update(storyChoicesTable)
    .set({
      explored: 0,
    })
    .where(
      and(
        eq(storyChoicesTable.storyId, storyId),
        not(eq(storyChoicesTable.parentId, "NULL"))
      )
    );
}

export async function generateStory(prompt: string) {
  // Get the authenticated user
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("You must be signed in to submit prompts");
  }

  const remainingCredits = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, session.user.email),
    columns: {
      isAdmin: true,
      credits: true,
    },
  });

  if (remainingCredits?.credits === 0 && !remainingCredits?.isAdmin) {
    throw new Error("You have no credits left");
  }

  try {
    const uuid = crypto.randomUUID();

    const response = await fetch(
      `${process.env.RESTATE_ENDPOINT}/cyoa/${uuid}/run/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESTATE_TOKEN}`,
        },
        body: JSON.stringify({
          user_email: session.user.email,
          prompt: prompt,
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to generate story", response);
      throw new Error("Failed to generate story");
    }

    const data = await response.json();

    if (!remainingCredits?.isAdmin) {
      // Decrement user credits by 1
      await db
        .update(usersTable)
        .set({
          credits: remainingCredits?.credits ? remainingCredits.credits - 1 : 0,
        })
        .where(eq(usersTable.email, session.user.email));
    }
    return data;
  } catch (error) {
    console.error("Error submitting prompt:", error);
    throw new Error("Failed to submit prompt");
  }
}

export async function deleteStory(storyId: string) {
  await db.delete(storiesTable).where(eq(storiesTable.id, storyId));
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function toggleStoryVisibility(
  storyId: string,
  isPublic: boolean
) {
  await db
    .update(storiesTable)
    .set({ public: isPublic ? 0 : 1 })
    .where(eq(storiesTable.id, storyId));

  revalidatePath(`/dashboard/story/${storyId}`);
  redirect(`/dashboard/story/${storyId}`);
}
