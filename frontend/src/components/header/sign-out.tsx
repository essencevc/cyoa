"use client";

import { Button } from "@/components/ui/button";
import { signOutWithGoogle } from "@/lib/login-server";

const SignOut = () => {
  return (
    <Button
      onClick={async () => await signOutWithGoogle()}
      className="text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4 h-auto w-full sm:w-auto"
    >
      End Session
    </Button>
  );
};

export default SignOut;
