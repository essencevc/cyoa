"use client";

import { usePathname } from "next/navigation";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
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
  const initialized = useRef(false);

  // Reset navigation state when pathname changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Listen for navigation events - but only after initial render
  useEffect(() => {
    // Skip event listener setup on first render to improve initial load time
    if (!initialized.current) {
      initialized.current = true;
      return;
    }

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
  }, [initialized.current]);

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
