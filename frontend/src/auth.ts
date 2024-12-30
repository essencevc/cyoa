import NextAuth from "next-auth"
import Google from 'next-auth/providers/google'
import { usersTable } from "./db/schema";
import { eq } from "drizzle-orm";
import { db } from "./db/db";
 
const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    signIn: async ({ user, account }) => {
      // We always create a user in the database if the user doesn't exist
      const dbUser = await db.select().from(usersTable).where(eq(usersTable.email, user.email!));
      
      if (dbUser.length === 0) {
        // No Username for now
        await db.insert(usersTable).values({
          email: user.email!,
        });
      }
      return true;
    },
    
  },
});

export { handlers, signIn, signOut, auth }