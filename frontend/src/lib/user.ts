'use server'

import { auth } from "@/auth";
import { db } from "@/db/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function validateUsername(username: string) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return {
      success: false,
      message: "User not found. Please sign in first.",
    };
  }

  try {
    // Update username, will fail if username already exists due to unique constraint
    await db
      .update(usersTable)
      .set({ username: username })
      .where(eq(usersTable.email, email));

    console.log(`Username ${username} updated for user ${email}`);
    return { success: true, message: `Access granted: ${username}` };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Username is already taken. Please choose another one.",
    };
  }
}
