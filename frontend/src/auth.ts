import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { usersTable } from "./db/schema";
import { eq } from "drizzle-orm";
import { db } from "./db/db";
import Credentials from "next-auth/providers/credentials";

const isProduction = process.env.VERCEL_ENV === "production";

const mockGoogleProvider = Credentials({
  id: "google",
  name: "Mock Google",
  credentials: {},
  async authorize() {
    // Return mock user data
    return {
      id: "mock_id",
      name: "Test User",
      email: "test@example.com",
      image: "https://example.com/placeholder.png",
    };
  },
});

const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [isProduction ? Google : mockGoogleProvider],
  callbacks: {
    signIn: async ({ user }) => {
      // We always create a user in the database if the user doesn't exist
      const dbUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, user.email!));

      if (dbUser.length === 0) {
        // No Username for now
        await db.insert(usersTable).values({
          email: user.email!,
        });
      }
      return true;
    },
    session: async ({ session }) => {
      if (!session.user || !session.user.email) {
        throw new Error("Session object is missing user or email");
      }

      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, session.user.email))
        .get();

      if (!user) {
        throw new Error("User not found");
      }

      // It will be '' the first time the user logs in and set in the database thereafter once we prompt the user
      session.user.username = user.username || "";
      return session;
    },
  },
});

export { handlers, signIn, signOut, auth };
