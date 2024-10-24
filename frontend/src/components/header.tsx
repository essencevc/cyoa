import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Button, buttonVariants } from "./ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="flex justify-between items-center h-[200px] max-w-2xl w-full mx-auto">
      <Link to="/" className="text-4xl font-bold">
        Story Generator
      </Link>
      <SignedOut>
        <div className="flex gap-4">
          <Link to="/sign-up" className={buttonVariants({ variant: "ghost" })}>
            Sign Up
          </Link>
          <Link
            to="/sign-in"
            className={buttonVariants({ variant: "default" })}
          >
            Sign In
          </Link>
        </div>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
};

export default Header;
