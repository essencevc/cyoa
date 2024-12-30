"use client";

import React, { useState, useEffect } from "react";

interface WrapperProps {
  delay: number;
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
}

export const Wrapper: React.FC<WrapperProps> = ({
  delay,
  children,
  fallbackComponent,
}) => {
  const [shouldRender, setShouldRender] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!shouldRender) {
    return fallbackComponent || null;
  }

  return <>{children}</>;
};
