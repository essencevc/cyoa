import React from 'react';
import { SignedIn, SignedOut, UserButton, SignIn } from '@clerk/clerk-react';
import StoryForm from './components/StoryForm';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Story Generator</h1>
        <UserButton />
      </header>
      <main>
        <SignedIn>
          <StoryForm />
        </SignedIn>
        <SignedOut>
          <SignIn />
        </SignedOut>
      </main>
    </div>
  );
}

export default App;
