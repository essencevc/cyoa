"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import { NavigationSpinner } from "./navigation-spinner";

type NavigationProgressContextType = {
  isNavigating: boolean;
  startNavigation: () => void;
  endNavigation: () => void;
};

const NavigationProgressContext = createContext<NavigationProgressContextType>({
  isNavigating: false,
  startNavigation: () => {},
  endNavigation: () => {},
});

export const useNavigationProgress = () =>
  useContext(NavigationProgressContext);

export function NavigationProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  // Reset navigation state when pathname changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Listen for navigation events
  useEffect(() => {
    const handleStart = () => {
      setIsNavigating(true);
    };

    const handleComplete = () => {
      setIsNavigating(false);
    };

    // Add event listeners for navigation events
    window.addEventListener("beforeunload", handleStart);
    document.addEventListener("navigationStart", handleStart);
    document.addEventListener("navigationComplete", handleComplete);

    return () => {
      window.removeEventListener("beforeunload", handleStart);
      document.removeEventListener("navigationStart", handleStart);
      document.removeEventListener("navigationComplete", handleComplete);
    };
  }, []);

  const startNavigation = () => {
    setIsNavigating(true);
    document.dispatchEvent(new Event("navigationStart"));
  };

  const endNavigation = () => {
    setIsNavigating(false);
    document.dispatchEvent(new Event("navigationComplete"));
  };

  return (
    <NavigationProgressContext.Provider
      value={{ isNavigating, startNavigation, endNavigation }}
    >
      {isNavigating && <NavigationSpinner />}
      {children}
    </NavigationProgressContext.Provider>
  );
}
