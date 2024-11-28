import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useAuth, useSignIn } from "@clerk/clerk-react";
import { Button } from "./ui/button";
import { OAuthStrategy } from "@clerk/types";

type Props = {
  children: React.ReactNode;
  fallback: React.ReactNode;
  redirectUrl: string;
};
const SignInModal = ({ children, fallback, redirectUrl }: Props) => {
  const { isSignedIn } = useAuth();
  const { signIn } = useSignIn();

  if (isSignedIn || !signIn) {
    return children;
  }

  const signInWith = (strategy: OAuthStrategy) => {
    return signIn.authenticateWithRedirect({
      //@ts-ignore
      strategy,
      redirectUrl: "/sign-up/sso-callback",
      redirectUrlComplete: redirectUrl,
    });
  };
  return (
    <Dialog>
      <DialogTrigger>{fallback}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Log In</DialogTitle>
        <DialogDescription>Please sign in to continue</DialogDescription>
        <Button variant="outline" onClick={() => signInWith("oauth_google")}>
          Sign in with Google
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SignInModal;
