"use client";

import { Button } from "@/components/ui/button";
import { signOutWithGoogle } from "@/lib/login-server";

const SignOut = () => {
  return (
    <Button onClick={async () => await signOutWithGoogle()}>End Session</Button>
  );
};

export default SignOut;
