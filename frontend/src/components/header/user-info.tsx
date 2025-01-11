"use client";

import { useQuery } from "@tanstack/react-query";
import { Session } from "next-auth";

async function fetchUserCredits() {
  const response = await fetch("/api/user/credits");
  if (!response.ok) {
    throw new Error("Failed to fetch credits");
  }
  return response.json();
}

export default function UserInfo({ session }: { session: Session }) {
  const { data: credits } = useQuery({
    queryKey: ["userCredits"],
    queryFn: fetchUserCredits,
    staleTime: Infinity, // Never refresh automatically
    initialData: session.user.credits,
  });

  return (
    <div className="flex flex-col items-end space-y-1">
      <div className="font-medium">
        {session.user?.username || "Anonymous User"}
      </div>
      <div className="text-sm text-green-400/60 font-light">
        {session.user?.email}
      </div>
      {credits !== undefined && (
        <div className="text-xs text-green-400/80 font-mono">
          Credits : {credits.toLocaleString()}
        </div>
      )}
    </div>
  );
}
