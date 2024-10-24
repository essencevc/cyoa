import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
} from "@clerk/clerk-react";

const Header = () => {
  return (
    <div className="flex justify-between items-center h-[200px] max-w-2xl w-full mx-auto">
      <p className="text-4xl font-bold">Story Generator</p>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
};

export default Header;
