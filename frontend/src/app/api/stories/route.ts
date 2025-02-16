import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { storiesTable, usersTable } from "@/db/schema";

export async function GET() {
  const session = await auth();

  const userStories = await db
    .select({
      id: storiesTable.id,
      title: storiesTable.title,
      author: usersTable.username,
      image_prompt: storiesTable.image_prompt,
      description: storiesTable.description,
      status: storiesTable.status,
      errorMessage: storiesTable.errorMessage,
    })
    .from(storiesTable)
    .where(eq(storiesTable.userId, session?.user?.email ?? ""))
    .innerJoin(usersTable, eq(storiesTable.userId, usersTable.email));

  return NextResponse.json(userStories);
}
