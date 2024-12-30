"use server";

import { signIn, signOut } from "@/auth";

export async function signInWithGoogle() {
  await signIn("google", {
    redirectTo: "/dashboard",
    redirect: true,
  });
}

export async function signOutWithGoogle() {
  await signOut({
    redirectTo: "/",
    redirect: true,
  });
}
