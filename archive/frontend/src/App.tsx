import { SignUp, SignIn } from "@clerk/clerk-react";
import { Toaster } from "./components/ui/sonner";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/rootlayout";
import Story from "./pages/story";
import Home from "./pages/home";
import StoryChoice from "./pages/story_choice";
import StoryRoot from "./pages/story_root";
import LandingPage from "./pages/landing_page";
import Blog from "./pages/blog";
const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/how-it-works",
    element: <Blog />,
  },
  {
    path: "/sign-in",
    element: (
      <div className="flex flex-col items-center justify-center">
        <SignIn />
      </div>
    ),
  },
  {
    path: "/sign-up",
    element: (
      <div className="flex flex-col items-center justify-center">
        <SignUp />
      </div>
    ),
  },
  {
    path: "/dashboard",
    element: <RootLayout />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "story/:storyId",
        element: <Story />,
      },
      {
        path: "story/:storyId/start",
        element: <StoryRoot />,
      },
      {
        path: "story/:storyId/:nodeId",
        element: <StoryChoice />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
