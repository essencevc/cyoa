import { SignUp, SignIn } from "@clerk/clerk-react";
import { Toaster } from "./components/ui/sonner";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./layouts/rootlayout";
import Story from "./pages/story";
import Home from "./pages/home";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
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
        <RouterProvider router={router} />
      </div>
      <Toaster />
    </>
  );
}

export default App;
