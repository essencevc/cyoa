"use client";

import Link from "next/link";
import { useNavigationProgress } from "./navigation-progress-provider";
import React from "react";

type NavigationLinkProps = React.ComponentProps<typeof Link>;

export function NavigationLink({
  children,
  onClick,
  prefetch = true,
  ...props
}: NavigationLinkProps) {
  const { startNavigation } = useNavigationProgress();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Start navigation spinner
    startNavigation();

    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link prefetch={prefetch} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
