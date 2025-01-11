import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      username: string;
      credits: number;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }
}
