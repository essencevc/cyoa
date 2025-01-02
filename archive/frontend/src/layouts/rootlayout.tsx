import Header from "@/components/header";
import { useAuth } from "@clerk/clerk-react";
import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { PacmanLoader } from "react-spinners";
import { toast } from "sonner";

const RootLayout = () => {
  const { userId, isLoaded } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (
      location.pathname === "/sign-in" ||
      location.pathname === "/sign-up" ||
      location.pathname == "/"
    ) {
      return;
    }
    if (isLoaded && !userId) {
      toast.error("You must be signed in to view this page");
      navigate("/sign-in");
    }
  }, [isLoaded, userId, location.pathname]);

  if (!isLoaded) {
    return null;
  }

  return (
    <div>
      <Header />
      <div className="max-w-2xl w-full mx-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;
