import {
  SignedIn,
  SignedOut,
  UserButton,
  SignIn,
  SignInButton,
} from "@clerk/clerk-react";
import StoryForm from "./components/StoryForm";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <div className="flex flex-col h-screen">
        <div className="flex justify-between items-center h-[200px] max-w-2xl w-full mx-auto">
          <p className="text-4xl font-bold">Story Generator</p>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
        <SignedOut>
          <div className="flex-grow max-w-2xl w-full mx-auto">
            <p>Please sign in to use the story generator</p>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="flex-grow max-w-2xl w-full mx-auto">
            <StoryForm />
          </div>
        </SignedIn>
      </div>
      <Toaster />
    </>
  );
}

export default App;
