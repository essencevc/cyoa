import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  useAuth,
} from "@clerk/clerk-react";
import StoryForm from "./components/StoryForm";
import { Toaster } from "./components/ui/sonner";
import Header from "./components/header";
import {
  createBrowserRouter,
  RouterProvider,
  Routes,
  Route,
} from "react-router-dom";
import RootLayout from "./layouts/rootlayout";
import Story from "./pages/story";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <p>Home Page</p>,
      },
      {
        path: "/sign-in",
        element: <p>Sign in dude</p>,
      },
      {
        path: "story/:storyId",
        element: <Story />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <div className="flex flex-col h-screen">
        <Header />
        <RouterProvider router={router} />
      </div>
      <Toaster />
    </>
  );
}

export default App;
