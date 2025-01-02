"use server";

import { auth } from "@/auth";
import { db } from "@/db/db";
import { storiesTable, storyChoicesTable } from "@/db/schema";
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
